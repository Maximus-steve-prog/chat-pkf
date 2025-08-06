from gevent import monkey
monkey.patch_all()

from app import app, socketio

# Expose `app` for Gunicorn
application = app  # or just: app = app

# if __name__ == "__main__":
#     socketio.run(application, host="0.0.0.0", port=5000)