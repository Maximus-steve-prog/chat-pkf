# app.py (no need to run app here)
import os
import cloudinary
from flask import Flask, request, redirect
from flask_cors import CORS
from extensions.extensions import db, bcrypt, jwt, socketio, init_socketio
from config.config import Config
from routes.employees import employee_routes
from routes.messages import message_bp
from routes.books import books_bp

# Create and configure app
app = Flask(__name__, static_folder='static')
app.config.from_object(Config)

@app.before_request
def enforce_https_in_production():
    if not request.is_secure and not app.debug:
        url = request.url.replace("http://", "https://", 1)
        return redirect(url, code=301)

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)
init_socketio(app)
CORS(app)

# Configure Cloudinary
cloudinary.config(
    cloud_name=app.config["CLOUDINARY_CLOUD_NAME"],
    api_key=app.config["CLOUDINARY_API_KEY"],
    api_secret=app.config["CLOUDINARY_API_SECRET"],
    secure=True
)

# Register Blueprints
app.register_blueprint(employee_routes)
app.register_blueprint(message_bp)
app.register_blueprint(books_bp)

# Create DB tables
with app.app_context():
    db.create_all()
