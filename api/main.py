# api/main.py
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

# Import your FastAPI app
from api.main import app

# Export the app for Vercel
app = app
