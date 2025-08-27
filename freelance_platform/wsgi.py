#!/usr/bin/env python
"""
Production WSGI server configuration for FreelancePro SL
To be used with Gunicorn or uWSGI on Hostinger VPS
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file if present
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Import the Flask application factory
from backend.app import create_app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    # Run the app only in development - for production use Gunicorn
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
