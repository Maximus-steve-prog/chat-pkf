from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity  # type: ignore
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from extensions.extensions import socketio, db
import os
import dropbox
import uuid
from models.models import Book, BookDownloadedStory, Employee
import cloudinary.uploader
from cloudinary import CloudinaryImage  # Ensure this import is present
import logging

books_bp = Blueprint('books_bp', __name__, url_prefix='/books')

# Allowed document types for upload
ALLOWED_DOC_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'}

logger = logging.getLogger(__name__)

# Dropbox access token (store securely, e.g., in environment variables)
DROPBOX_ACCESS_TOKEN = os.getenv('DROPBOX_ACCESS_TOKEN')  # Set in .env

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_DOC_EXTENSIONS

def convert_to_direct_download(url):
    # Converts Dropbox preview URL to direct download URL
    return url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "").replace("?dl=1", "")

def upload_to_dropbox(file_stream, filename):
    dbx = dropbox.Dropbox(DROPBOX_ACCESS_TOKEN)
    dropbox_path = f"/books/{filename}"

    # Upload file to Dropbox
    dbx.files_upload(file_stream.read(), dropbox_path, mode=dropbox.files.WriteMode.overwrite)

    # Create a shared link
    shared_link_metadata = dbx.sharing_create_shared_link_with_settings(dropbox_path)
    preview_url = shared_link_metadata.url

    # Convert to direct download link
    direct_download_url = convert_to_direct_download(preview_url)
    return direct_download_url


@books_bp.route('/upload', methods=['POST'], endpoint='upload_book')
@jwt_required()
def upload_book():
    try:
        current_employee_id = int(get_jwt_identity())
        book = request.form

        title = book.get('title', '').strip().lower()
        description = book.get('description', '')

        if Book.query.filter(db.func.lower(Book.title) == title).first():
            return jsonify({'message': 'Book already exists'}), 400

        book_file = request.files.get('book')
        book_cover = request.files.get('bookCover')

        if not book_file or not book_cover:
            return jsonify({'message': 'Both book and cover are required'}), 400

        if not allowed_file(book_file.filename):
            return jsonify({'message': 'Unsupported book file type'}), 400

        # Upload cover to Cloudinary
        cover_result = cloudinary.uploader.upload(
            book_cover,
            folder='books/covers',
            resource_type='image',
            use_filename=True,
            unique_filename=False
        )
        book_cover_url = cover_result['secure_url']

        # Upload book to Dropbox
        file_name = secure_filename(book_file.filename)
        book_download_url = upload_to_dropbox(book_file, file_name)

        # Save to DB
        new_book = Book(
            title=title,
            description=description,
            book_cover_path=book_cover_url,
            book_path=book_download_url,
            added_by=current_employee_id
        )
        db.session.add(new_book)
        db.session.commit()

        employee = Employee.query.get(current_employee_id)
        employee_name = employee.fullName if employee else "Unknown"

        def notify_upload(title, employee):
            socketio.emit('book_uploaded', {
                'book': title,
                'employee': employee
            })

        socketio.start_background_task(notify_upload, new_book.title, employee_name)

        return jsonify({'message': 'Book uploaded successfully'}), 201

    except Exception as e:
        logger.exception("Error during book upload")
        return jsonify({'error': 'Book upload failed', 'details': str(e)}), 500



@books_bp.route('/all_books', methods=['GET'], endpoint='get_all_books')
def get_all_books():
    books = Book.query.all()
    if books is None:
        return jsonify([]), 200
    books_data = [book.to_dict() for book in books]
    return jsonify(books_data), 200
    
@books_bp.route('/update_book/<int:book_id>', methods=['PUT'], endpoint='update_book')
@jwt_required()
def update_book(book_id):
    try:
        current_employee_id = int(get_jwt_identity())
        book = Book.query.get_or_404(book_id)

        # Authorization check
        if book.added_by != current_employee_id:
            return jsonify({'message': 'You are not authorized to update this book'}), 403

        # Get new data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '')

        if title:
            book.title = title
        if description:
            book.description = description

        # Update cover image if provided
        book_cover = request.files.get('bookCover')
        if book_cover:
            cover_result = cloudinary.uploader.upload(
                book_cover,
                folder='books/covers',
                resource_type='image',
                use_filename=True,
                unique_filename=False
            )
            book.book_cover_path = cover_result['secure_url']

        # Update book file if provided
        book_file = request.files.get('book')
        if book_file:
            if not allowed_file(book_file.filename):
                return jsonify({'message': 'Unsupported file type'}), 400

            file_result = cloudinary.uploader.upload(
                book_file,
                folder='books/files',
                resource_type='raw',
                use_filename=True,
                unique_filename=False,
                allowed_formats=list(ALLOWED_DOC_EXTENSIONS)
            )
            book.book_path = file_result['secure_url']

        # Emit socket update
        employee = Employee.query.get(current_employee_id)
        socketio.emit('book_updated', {
            'book': book.title,
            'employee': employee.fullName if employee else 'Unknown'
        }, broadcast=True)

        db.session.commit()
        return jsonify({'message': 'Book updated successfully'}), 200

    except Exception as e:
        logger.exception("Error during book update")
        return jsonify({'error': 'Book update failed', 'details': str(e)}), 500


@books_bp.route('/download_book/<int:book_id>', methods=['GET'], endpoint='download_book')
@jwt_required()
def download_book(book_id):
    current_employee_id = int(get_jwt_identity())
    book = Book.query.get_or_404(book_id)
    
    # Enregistrer le téléchargement
    download_record = BookDownloadedStory(
        book_id=book_id, 
        employee_id=current_employee_id, 
        downloaded_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.session.add(download_record)
    db.session.commit()
    
    # Émettre un événement websocket
    socketio.emit('book_downloaded', 
                  {
                    'book': book.title, 
                    'employee': Employee.query.get(current_employee_id).fullName
                   })
    
    
    return jsonify({'message': 'Book downloaded successfully'}), 200    
