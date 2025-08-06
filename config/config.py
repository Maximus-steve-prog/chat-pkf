import os
import logging
from dotenv import load_dotenv  # type: ignore
from datetime import timedelta

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Config:
    # Upload settings
    UPLOAD_FOLDER = 'static/images'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    # Flask settings
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    SECRET_KEY = os.getenv("SECRET_KEY")
    PORT = int(os.getenv("FLASK_RUN_PORT", 10000))
    
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

    # JWT settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", '86400'))
    )
    
    # SQLAlchemy settings
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI').strip()
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
        "pool_recycle": 1800,  # recycle connections every 30 mins
        "pool_pre_ping": True  # auto-reconnect stale connections
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Validate DB URI
    if not SQLALCHEMY_DATABASE_URI:
        logger.error("❌ Environment variable SQLALCHEMY_DATABASE_URI is not set.")
    else:
        redacted_uri = SQLALCHEMY_DATABASE_URI.replace(
            SQLALCHEMY_DATABASE_URI.split(':')[2].split('@')[0], '*****'
        )
        logger.info(f"✅ SQLALCHEMY_DATABASE_URI loaded: {redacted_uri}")
