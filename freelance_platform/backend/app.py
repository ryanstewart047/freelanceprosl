from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from config import Config
from models import db

# Import routes
from routes.auth import auth_bp
from routes.marketplace import marketplace_bp
from routes.profiles import profiles_bp
from routes.payments import payments_bp
from routes.admin import admin_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    CORS(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(marketplace_bp, url_prefix='/api/marketplace')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/')
    def index():
        return {'message': 'Welcome to the Freelance Platform API'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
