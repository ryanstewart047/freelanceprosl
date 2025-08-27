import os
from datetime import timedelta

class Config:
    # Secret key for JWT and sessions
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///freelance_platform.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Orange Money API keys (replace with actual keys in production)
    ORANGE_MONEY_API_KEY = os.environ.get('ORANGE_MONEY_API_KEY') or 'your-orange-money-api-key'
    ORANGE_MONEY_API_SECRET = os.environ.get('ORANGE_MONEY_API_SECRET') or 'your-orange-money-api-secret'
    ORANGE_MONEY_MERCHANT_ID = os.environ.get('ORANGE_MONEY_MERCHANT_ID') or 'your-orange-money-merchant-id'
    
    # Upload configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    
    # Platform fee percentage (e.g., 10%)
    PLATFORM_FEE_PERCENTAGE = 10
