# routes/message.py
import os
from flask_socketio import emit, join_room,disconnect #type: ignore
from datetime import datetime,timedelta
from sqlalchemy import or_, and_, func, desc, case #type: ignore
from flask import Blueprint, request, jsonify, send_from_directory
from extensions.extensions import socketio, db
from models.models import Message,Employee  # import your Message model
from flask_jwt_extended import jwt_required, get_jwt_identity #type: ignore
from dotenv import load_dotenv # type: ignore
import cloudinary.uploader  # type: ignore

load_dotenv()  # Load variables from .env file
user_sid_map = {}

load_dotenv()  # Load variables from .env file
SECRET_KEY = os.getenv('JWT_SECRET_KEY')
if not SECRET_KEY:
    raise Exception("SECRET_KEY not set in environment variables")
# Define a Blueprint
message_bp = Blueprint('message', __name__)

# Helper function to save media files
def upload_to_cloudinary(file, msg_type):
    resource_type = 'auto'  # Let Cloudinary auto-detect type
    folder = f"chat/message/{msg_type}"
    
    upload_result = cloudinary.uploader.upload(
        file,
        resource_type=resource_type,
        folder=folder
    )
    return upload_result['secure_url']


@message_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    sender_id = int(get_jwt_identity())
    receiver_id = int(request.form['receiver_id'])
    msg_type = request.form['msg_type']
    msg_content = request.form.get('msg_content', '')

    file = request.files.get('file')

    # Supported file types
    file_types = ['video', 'audio', 'picture', 'voice', 'message', 'gif', 'sticker']

    if msg_type in file_types:
        if not file:
            return jsonify({'error': f'File is required for {msg_type} messages'}), 400
        try:
            msg_content = upload_to_cloudinary(file, msg_type)
        except Exception as e:
            return jsonify({'error': 'Upload failed', 'details': str(e)}), 500

    receiver = Employee.query.get(receiver_id)
    msg_status = 'unread' if receiver and receiver.status == 'online' else 'received'

    msg = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        msg_status=msg_status,
        msg_content=msg_content,
        msg_type=msg_type,
        send_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.session.add(msg)
    db.session.commit()

    room = f'user_{receiver_id}'
    socketio.emit('new_message', msg.notify(), room=room)

    return jsonify({'status': 'success', 'msg_id': msg.msg_id}), 201


@message_bp.route('/<int:user1_id>/<int:user2_id>', methods=['GET'])
def get_messages(user1_id, user2_id):
    messages = Message.query.filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.send_at.asc()).all()
    return jsonify([msg.to_dict() for msg in messages])


@message_bp.route('/contacts', methods=['GET'])
@jwt_required()
def get_last_conversation():
    current_Employee_id = int(get_jwt_identity())

    # Get unread message counts per contact (sender)
    unread_counts = db.session.query(
        Message.sender_id,
        func.count(Message.msg_id).label('count')
    ).filter(
        Message.receiver_id == current_Employee_id,
        Message.msg_status == 'unread'
    ).group_by(Message.sender_id).all()

    # Convert to a dictionary for easy lookup
    unread_dict = {sender_id: count for sender_id, count in unread_counts}

    # Subquery: Get the latest message time for each contact
    subquery = (
        db.session.query(
            case(
                (Message.sender_id == current_Employee_id, Message.receiver_id),
                else_=Message.sender_id
            ).label('contact_id'),
            func.max(Message.send_at).label('last_message_time')
        )
        .filter(
            or_(
                Message.sender_id == current_Employee_id,
                Message.receiver_id == current_Employee_id
            )
        )
        .group_by('contact_id')
        .subquery()
    )

    # Join to get latest messages per contact
    latest_messages = (
        db.session.query(Message, Employee)
        .join(
            subquery,
            and_(
                or_(
                    and_(
                        Message.sender_id == current_Employee_id,
                        Message.receiver_id == subquery.c.contact_id
                    ),
                    and_(
                        Message.receiver_id == current_Employee_id,
                        Message.sender_id == subquery.c.contact_id
                    )
                ),
                Message.send_at == subquery.c.last_message_time
            )
        )
        .join(Employee, Employee.id == subquery.c.contact_id)
        .order_by(subquery.c.last_message_time.desc())
        .all()
    )

    contacts = []

    for message, employee in latest_messages:
        contact_id = employee.id
        # Fetch unread count for this contact (if any)
        unread_for_contact = unread_dict.get(contact_id, 0)

        contacts.append({
            'employee_id': employee.id,
            'employee_name': employee.fullName,
            'employee_status': employee.status,
            'employee_photo': employee.photo_path,
            'last_message': message.msg_content,
            'msg_status': message.msg_status,
            'sender_id': message.sender_id,
            'msg_type': message.msg_type,
            'last_message_time': message.send_at.isoformat(),
            'unread_count': unread_for_contact
        })

    # Optionally, you can also add total unread count if needed
    total_unread_count = sum(unread_dict.values())

    return jsonify({
        'total_unread_count': total_unread_count,
        'contacts': contacts
    })


@socketio.on('identify')
def handle_identify(data):
    global user_sid_map
    user_id = data['user_id']
    user_sid_map[request.sid] = user_id
    join_room(f'user_{user_id}')


@socketio.on('mark_read')
def handle_mark_read(data):
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    print(f"Marking messages as read from {sender_id} to {receiver_id}")
    # Update messages
    messages = Message.query.filter_by(sender_id=sender_id, receiver_id=receiver_id, msg_status='unread').all()
    for msg in messages:
        msg.msg_status = 'read'
    db.session.commit()

    # Notify the sender
    # Find the sender's socket id
    sender_sid = None
    for sid, uid in user_sid_map.items():
        if str(uid) == str(sender_id):
            sender_sid = sid
            break

    # Find receiver's socket ID
    receiver_sid = None
    for sid, uid in user_sid_map.items():
        if str(uid) == str(receiver_id):
            receiver_sid = sid
            break

    # Notify sender
    if sender_sid:
        socketio.emit(
            'messages_read',
            {
                'from': receiver_id,
                'to': sender_id
            },
            room=sender_sid
        )

    # Notify receiver
    if receiver_sid:
        socketio.emit(
            'messages_read',
            {
                'from': sender_id,
                'to': receiver_id
            },
            room=receiver_sid
        )
@socketio.on('typing')
def handle_typing(data):
    sender_id = data['senderId']
    receiver_id = data['receiverId']
    is_typing = data['isTyping']
    # Send the typing status to the receiver's room
    emit('typing', {
        'senderId': int(sender_id),
        'receiverId': int(receiver_id),
        'isTyping': is_typing
    }, room=f'user_{receiver_id}')
@message_bp.route('/static/message/<path:filename>')
def static_message_files(filename):
    return send_from_directory(os.path.join('static', 'message'), filename)



@socketio.on('connect')
def handle_connect():
    user_id = request.args.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        emit('join_room', {'user_id': user_id}, room=f'user_{user_id}'  )
        print(f'User {user_id} connected and joined room user_{user_id}')

@socketio.on('disconnect')
def handle_disconnect():
    print('User disconnected')
    print('User disconnected')
