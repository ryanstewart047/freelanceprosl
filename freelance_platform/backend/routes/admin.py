from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from routes import admin_bp
from models import db, User, UserRole, Job, Transaction, Review, Skill, AdminMessage
from services.email_service import EmailService

def require_admin(f):
    """Decorator to enforce admin-only access."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    all_users = User.query.all()
    active_users = [u for u in all_users if u.is_active_profile]
    suspended_users = [u for u in all_users if u.is_suspended]
    disabled_users = [u for u in all_users if u.is_disabled]
    trial_users = [u for u in all_users if u.subscription_status == 'TRIAL']
    active_sub_users = [u for u in all_users if u.subscription_status == 'ACTIVE']

    completed_transactions = Transaction.query.filter_by(status='completed').all()

    stats = {
        'total_users': len(all_users),
        'active_profiles': len(active_users),
        'suspended_accounts': len(suspended_users),
        'disabled_accounts': len(disabled_users),
        'trial_accounts': len(trial_users),
        'active_subscriptions': len(active_sub_users),
        'total_freelancers': User.query.filter_by(role=UserRole.FREELANCER).count(),
        'total_clients': User.query.filter_by(role=UserRole.CLIENT).count(),
        'total_jobs': Job.query.count(),
        'total_transactions': Transaction.query.count(),
        'total_transaction_volume': sum([t.amount for t in completed_transactions]),
        'total_platform_fees': sum([t.platform_fee for t in completed_transactions]),
        'total_messages_sent': AdminMessage.query.count(),
    }

    return jsonify(stats), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    role = request.args.get('role')
    status = request.args.get('status')
    search = request.args.get('search')

    query = User.query

    if role:
        try:
            user_role = UserRole(role)
            query = query.filter_by(role=user_role)
        except ValueError:
            return jsonify({'error': 'Invalid role value'}), 400

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.username.ilike(search_pattern)) |
            (User.email.ilike(search_pattern)) |
            (User.first_name.ilike(search_pattern)) |
            (User.last_name.ilike(search_pattern)) |
            (User.tracking_id.ilike(search_pattern))
        )

    users = query.all()

    if status == 'active':
        users = [u for u in users if u.is_active_profile]
    elif status == 'suspended':
        users = [u for u in users if u.is_suspended]
    elif status == 'disabled':
        users = [u for u in users if u.is_disabled]
    elif status == 'trial':
        users = [u for u in users if u.subscription_status == 'TRIAL']
    elif status == 'expired':
        users = [u for u in users if not u.is_active_profile and not u.is_suspended and not u.is_disabled]

    return jsonify({'users': [u.to_dict() for u in users]}), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def admin_get_user(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def admin_update_user(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    try:
        if 'role' in data:
            try:
                user.role = UserRole(data['role'])
            except ValueError:
                return jsonify({'error': 'Invalid role value'}), 400

        db.session.commit()
        return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
def admin_update_user_status(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    action = data.get('action')

    try:
        if action == 'suspend':
            user.is_suspended = True
            user.is_disabled = False
            msg = 'Account suspended'
        elif action == 'unsuspend':
            user.is_suspended = False
            msg = 'Account unsuspended'
        elif action == 'disable':
            user.is_disabled = True
            user.is_suspended = False
            msg = 'Account disabled'
        elif action == 'enable':
            user.is_disabled = False
            msg = 'Account enabled'
        elif action == 'extend_trial':
            days = int(data.get('days', 30))
            user.trial_end_date = datetime.utcnow() + timedelta(days=days)
            user.subscription_status = 'TRIAL'
            user.is_suspended = False
            user.is_disabled = False
            msg = f'Trial extended by {days} days'
        elif action == 'activate_subscription':
            months = int(data.get('months', 1))
            user.subscription_status = 'ACTIVE'
            user.subscription_end_date = datetime.utcnow() + timedelta(days=30 * months)
            user.is_suspended = False
            user.is_disabled = False
            msg = f'Subscription activated for {months} month(s)'
        elif action == 'cancel_subscription':
            user.subscription_status = 'CANCELLED'
            user.subscription_end_date = None
            msg = 'Subscription cancelled'
        else:
            return jsonify({'error': f'Unknown action: {action}'}), 400

        db.session.commit()
        return jsonify({'message': msg, 'user': user.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    if user_id == current_user_id:
        return jsonify({'error': 'You cannot delete your own admin account'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        # Delete admin messages involving this user
        AdminMessage.query.filter(
            (AdminMessage.sender_id == user_id) | (AdminMessage.recipient_id == user_id)
        ).delete(synchronize_session=False)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': f'User {user.username} deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages', methods=['POST'])
@jwt_required()
def admin_send_message():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    recipient_id = data.get('recipient_id')
    subject = data.get('subject', '').strip()
    message_text = data.get('message', '').strip()

    if not recipient_id or not subject or not message_text:
        return jsonify({'error': 'recipient_id, subject, and message are required'}), 400

    recipient = User.query.get(recipient_id)
    if not recipient:
        return jsonify({'error': 'Recipient user not found'}), 404

    try:
        msg = AdminMessage(
            sender_id=current_user_id,
            recipient_id=recipient_id,
            subject=subject,
            message=message_text
        )
        db.session.add(msg)
        db.session.commit()

        # Send email notification
        try:
            EmailService.send_admin_message_email(recipient, subject, message_text)
        except Exception as mail_err:
            print(f"Warning: Admin email notification failed: {mail_err}")

        return jsonify({'message': 'Message sent successfully', 'admin_message': msg.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages', methods=['GET'])
@jwt_required()
def admin_get_messages():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    recipient_id = request.args.get('recipient_id')
    query = AdminMessage.query
    if recipient_id:
        query = query.filter_by(recipient_id=int(recipient_id))
    messages = query.order_by(AdminMessage.created_at.desc()).all()
    return jsonify({'messages': [m.to_dict() for m in messages]}), 200

@admin_bp.route('/my-messages', methods=['GET'])
@jwt_required()
def get_my_messages():
    """Get admin messages for the currently logged-in user (non-admin)."""
    current_user_id = get_jwt_identity()
    messages = AdminMessage.query.filter_by(recipient_id=current_user_id).order_by(AdminMessage.created_at.desc()).all()
    # Mark as read
    for m in messages:
        if not m.is_read:
            m.is_read = True
    db.session.commit()
    return jsonify({'messages': [m.to_dict() for m in messages]}), 200

@admin_bp.route('/jobs', methods=['GET'])
@jwt_required()
def admin_get_jobs():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    status = request.args.get('status')
    query = Job.query
    if status:
        query = query.filter_by(status=status)
    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify({'jobs': [job.to_dict() for job in jobs]}), 200

@admin_bp.route('/transactions', methods=['GET'])
@jwt_required()
def admin_get_transactions():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    status = request.args.get('status')
    query = Transaction.query
    if status:
        query = query.filter_by(status=status)
    transactions = query.order_by(Transaction.created_at.desc()).all()

    return jsonify({'transactions': [{
        'id': t.id,
        'job_id': t.job_id,
        'payer': User.query.get(t.payer_id).username if User.query.get(t.payer_id) else 'N/A',
        'payee': User.query.get(t.payee_id).username if User.query.get(t.payee_id) else 'N/A',
        'amount': t.amount,
        'platform_fee': t.platform_fee,
        'status': t.status.value,
        'transaction_reference': t.transaction_reference,
        'created_at': t.created_at.isoformat(),
        'updated_at': t.updated_at.isoformat()
    } for t in transactions]}), 200

@admin_bp.route('/skills', methods=['GET'])
@jwt_required()
def admin_get_skills():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    skills = Skill.query.all()
    return jsonify({'skills': [{
        'id': s.id,
        'name': s.name,
        'category': s.category,
        'user_count': len(s.users)
    } for s in skills]}), 200

@admin_bp.route('/skills', methods=['POST'])
@jwt_required()
def admin_create_skill():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    if 'name' not in data:
        return jsonify({'error': 'Missing required field: name'}), 400

    existing_skill = Skill.query.filter_by(name=data['name']).first()
    if existing_skill:
        return jsonify({'error': 'Skill already exists'}), 400

    try:
        skill = Skill(name=data['name'], category=data.get('category'))
        db.session.add(skill)
        db.session.commit()
        return jsonify({'message': 'Skill created successfully', 'skill': {
            'id': skill.id, 'name': skill.name, 'category': skill.category
        }}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
