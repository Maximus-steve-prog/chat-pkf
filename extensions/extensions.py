from flask_socketio import SocketIO  # type: ignore
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from flask_bcrypt import Bcrypt  # type: ignore
from flask_jwt_extended import JWTManager  # type: ignore

# Create instances
socketio = SocketIO(cors_allowed_origins="*", async_mode='gevent')  # Let it auto-select async_mode
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def init_socketio(app):
    socketio.init_app(app)
    return socketio
