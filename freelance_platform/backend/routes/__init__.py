from flask import Blueprint

# Initialize all route blueprints
auth_bp = Blueprint('auth', __name__)
marketplace_bp = Blueprint('marketplace', __name__)
profiles_bp = Blueprint('profiles', __name__)
payments_bp = Blueprint('payments', __name__)
admin_bp = Blueprint('admin', __name__)

# Import routes after blueprint initialization to avoid circular imports
from routes.auth import routes
from routes.marketplace import routes
from routes.profiles import routes
from routes.payments import routes
from routes.admin import routes
