from datetime import datetime,timedelta
from datetime import datetime
from extensions.extensions import db
from flask_bcrypt import Bcrypt #type: ignore

bcrypt = Bcrypt()


# EmployeeModel
class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fullName = db.Column(db.String(150), nullable=False)
    employee_Type = db.Column(db.String(50), nullable=False)
    password_hash  = db.Column(db.String(255), nullable=False)
    self_Description = db.Column(db.String(255), nullable=False)
    photo_path = db.Column(db.String(255), nullable=False)
    created_At = db.Column(db.DateTime, default=datetime.utcnow() + timedelta(hours=1))
    status = db.Column(db.String(10), default='offline')
    validated=db.Column(db.Boolean, default=False)
    last_LoginAt = db.Column(db.DateTime)  
    
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fullName': self.fullName,
            'employee_Type': self.employee_Type,  # corrected key
            'self_Description': self.self_Description,
            'photo_path': self.photo_path,
            'status': self.status,
            'validated': self.validated,
            'last_LoginAt': self.last_LoginAt.isoformat() if self.last_LoginAt else None,
            'created_At': self.created_At.isoformat()
        }

# MessageModel

        


class Message(db.Model):
    __tablename__ = 'messages'
    msg_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    msg_status = db.Column(db.String(10), default='unread')  # read, unread, received
    msg_content = db.Column(db.String(255), nullable=False)
    msg_type = db.Column(db.String(10), nullable=False)  # text, video, picture, audio
    send_at = db.Column(db.DateTime, default=datetime.utcnow() + timedelta(hours=1))
    send_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'msg_id': self.msg_id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'sender_photo': Employee.query.get(self.sender_id).photo_path,
            'receiver_photo': Employee.query.get(self.receiver_id).photo_path,

            'msg_status': self.msg_status,
            'msg_content': self.msg_content,
            'msg_type': self.msg_type,
            'send_at': self.send_at.isoformat()
        }

    def last_conversation(self):
        return{
            'sender_id':self.sender_id,
            'receiver_id':self.receiver_id,
            'receiver_status':Employee.query.get(self.receiver_id).status,
            'receiver_photo':Employee.query.get(self.receiver_id).photo_path,
            'msg_content':self.msg_content,
            'msg_status':self.msg_status,
            'msg_send_at':self.send_at.isoformat()

        }    
        
    def notify(self):
       return {
            'msg_id': self.msg_id,
            'sender_id': Employee.query.get(self.sender_id).fullName,
            'receiver_id': Employee.query.get(self.receiver_id).fullName,
            'msg_content': self.msg_content,
            'msg_type': self.msg_type
        }

# BookModel

class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    book_cover_path = db.Column(db.String(255), nullable=False)
    book_path=db.Column(db.String(255), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    added_by = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    
    employee = db.relationship('Employee', backref='books')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'book_cover_path': self.book_cover_path,
            'book_path': self.book_path,
            'added_at': self.added_at.isoformat(),
            'added_by': self.added_by
        }

class BookDownloadedStory(db.Model):
    __tablename__='book_downloaded_stories'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    downloaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    book = db.relationship('Book', backref='book_downloaded_stories')
    employee = db.relationship('Employee', backref='book_downloaded_stories')
    
    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'employee_id': self.employee_id,
            'downloaded_at': self.downloaded_at.isoformat()
        }