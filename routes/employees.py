from flask import Blueprint, jsonify, request, current_app, render_template
from flask_jwt_extended import jwt_required, create_access_token,get_jwt_identity  # type: ignore
from werkzeug.utils import secure_filename
from flask_socketio import emit
from datetime import timedelta,datetime
from extensions.extensions import socketio, db
from models.models import Employee, Message
import uuid
import os
from dotenv import load_dotenv
import cloudinary.uploader

# Load environment variables
load_dotenv()

employee_routes = Blueprint('employee_routes', __name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@employee_routes.route('/get_all_employees', methods=['GET'])
@jwt_required()
def get_employees():
    try:
        current_employee_id = int(get_jwt_identity())
        employees = Employee.query.filter(Employee.id != current_employee_id).all()
        return jsonify([employee.to_dict() for employee in employees]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching employees: {e}")
        return jsonify({"error": "Unable to fetch employees"}), 500

@employee_routes.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# Register a new employee
@employee_routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.form
        fullName = data.get('fullName')
        employee_Type = data.get('typeEmployee')
        self_Description = data.get('about')
        validated = data.get('validated', 'false').lower() == 'true'

        # Check for existing employee
        if Employee.query.filter_by(fullName=fullName).first():
            return jsonify({'message': 'Employee already exists'}), 400

        # Handle profile photo upload
        photo = request.files.get('profilePhoto')
        photo_url = None
        if photo and allowed_file(photo.filename):
            try:
                unique_filename = f"{secure_filename(fullName)}_{uuid.uuid4().hex}"
                upload_result = cloudinary.uploader.upload(
                    photo,
                    folder="employee_photos",
                    public_id=unique_filename,
                    overwrite=True,
                    resource_type="image"
                )
                photo_url = upload_result.get("secure_url")
            except Exception as e:
                current_app.logger.error(f"❌ Cloudinary upload failed: {e}")
                return jsonify({'message': 'Photo upload failed'}), 500
        elif not photo:
            current_app.logger.warning("⚠️ No photo uploaded")
        else:
            return jsonify({'message': 'Invalid file type'}), 400

        # Create employee
        employee = Employee(
            fullName=fullName,
            employee_Type=employee_Type,
            self_Description=self_Description,
            photo_path=photo_url,
            validated=validated
        )

        # Set password
        password = data.get('registerPassword')
        employee.set_password(password)



        # Save to DB
        db.session.add(employee)
        db.session.commit()

        return jsonify(employee.to_dict()), 201

    except Exception as e:
        current_app.logger.error(f"❌ Unexpected error in registration: {e}")
        return jsonify({'message': 'Internal server error'}), 500


@employee_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    current_app.logger.info(f"Login attempt: {data}")

    if not data:
        return jsonify({'message': 'No data provided'}), 400

    fullName = data.get('fullName')
    password = data.get('password')

    if not fullName or not password:
        return jsonify({'message': 'Full name and password are required'}), 400

    employee = Employee.query.filter_by(fullName=fullName).first()
    if not employee or not employee.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    try:
        # Update status and login time
        employee.status = 'online'
        employee.last_LoginAt = datetime.utcnow() + timedelta(hours=1)

        # Mark messages as unread
        received_messages = Message.query.filter_by(receiver_id=employee.id, msg_status='received').all()
        for msg in received_messages:
            msg.msg_status = 'unread'

        db.session.commit()

        access_token = create_access_token(identity=str(employee.id))
        return jsonify({
            'token': access_token,
            'me': employee.fullName,
            'id': employee.id,
            'my_profile': employee.photo_path,
            'status': employee.status
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Login error: {e}")
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@socketio.on('user_connected')
def handle_user_connected(data):
    emit('connected_other_user', data, broadcast=True, include_self=False)
