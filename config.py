import os
from dotenv import load_dotenv

load_dotenv()

# Camera settings
CAMERA_RESOLUTION = (640, 480)
CAMERA_FPS = 30

# Face recognition settings
FACE_RECOGNITION_TOLERANCE = 0.6

# Database settings
DATABASE_URL = "sqlite:///room_security.db"

# Notification settings
ENABLE_EMAIL_NOTIFICATIONS = False
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")