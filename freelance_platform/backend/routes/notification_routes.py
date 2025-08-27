from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.notification_service import NotificationService, EmailService
from models import User, db, NotificationType

notification_routes = Blueprint('notification', __name__)

@notification_routes.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    
    # Get query parameters
    query_params = request.args.to_dict()
    
    # Get user notifications
    results = NotificationService.get_user_notifications(user_id, query_params)
    
    return jsonify({'success': True, 'results': results}), 200

@notification_routes.route('/<notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    
    # Mark notification as read
    result = NotificationService.mark_notification_read(notification_id, user_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 404

@notification_routes.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()
    
    # Mark all notifications as read
    result = NotificationService.mark_all_notifications_read(user_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@notification_routes.route('/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    user_id = get_jwt_identity()
    
    # Delete notification
    result = NotificationService.delete_notification(notification_id, user_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 404

@notification_routes.route('/preferences', methods=['GET'])
@jwt_required()
def get_notification_preferences():
    user_id = get_jwt_identity()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get notification preferences
    preferences = user.notification_preferences or {
        'email': True,
        'job_matches': True,
        'messages': True,
        'proposals': True,
        'payments': True,
        'reviews': True,
        'job_updates': True
    }
    
    return jsonify({'success': True, 'preferences': preferences}), 200

@notification_routes.route('/preferences', methods=['PUT'])
@jwt_required()
def update_notification_preferences():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Update notification preferences
    user.notification_preferences = data
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Notification preferences updated', 'preferences': user.notification_preferences}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating preferences: {str(e)}'}), 400

# Admin routes for email logs
@notification_routes.route('/email-logs', methods=['GET'])
@jwt_required()
def get_email_logs():
    user_id = get_jwt_identity()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user or user.role != 'ADMIN':
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    # Get query parameters
    query_params = request.args.to_dict()
    
    # Get email logs
    results = EmailService.get_email_logs(query_params)
    
    return jsonify({'success': True, 'results': results}), 200
