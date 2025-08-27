from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.auth_service import AuthService
from models import User, db

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    # Register the user
    result = AuthService.signup_user(data)
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400
    
    # Authenticate the user
    result = AuthService.login_user(data['email'], data['password'])
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 401

@auth_routes.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    # Verify the email
    result = AuthService.verify_email(token)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_routes.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    # Request password reset
    result = AuthService.request_password_reset(data['email'])
    
    return jsonify(result), 200

@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'token', 'new_password']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    # Reset the password
    result = AuthService.reset_password(data['email'], data['token'], data['new_password'])
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_routes.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['current_password', 'new_password']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    # Change the password
    result = AuthService.change_password(user_id, data['current_password'], data['new_password'])
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@auth_routes.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    
    # Get user profile
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({'success': True, 'user': user.to_dict()}), 200

@auth_routes.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Update user fields
    updatable_fields = [
        'first_name', 'last_name', 'bio', 'title', 'skills', 'location',
        'phone_number', 'hourly_rate', 'experience_level', 'education',
        'company_name', 'website', 'avatar_url', 'notification_preferences',
        'mobile_money_number', 'mobile_money_provider', 'is_available'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # Save changes
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating profile: {str(e)}'}), 400
