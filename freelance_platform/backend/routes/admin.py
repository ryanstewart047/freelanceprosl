from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from routes import admin_bp
from models import db, User, UserRole, Job, Transaction, Review, Skill

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get stats for dashboard
    stats = {
        'total_users': User.query.count(),
        'total_freelancers': User.query.filter_by(role=UserRole.FREELANCER).count(),
        'total_clients': User.query.filter_by(role=UserRole.CLIENT).count(),
        'total_jobs': Job.query.count(),
        'total_transactions': Transaction.query.count(),
        'total_completed_jobs': Job.query.filter_by(status='completed').count(),
        'total_transaction_volume': sum([t.amount for t in Transaction.query.filter_by(status='completed').all()]),
        'total_platform_fees': sum([t.platform_fee for t in Transaction.query.filter_by(status='completed').all()])
    }
    
    return jsonify(stats), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get query parameters for filtering
    role = request.args.get('role')
    
    # Base query
    query = User.query
    
    # Apply filters if provided
    if role:
        try:
            user_role = UserRole(role)
            query = query.filter_by(role=user_role)
        except ValueError:
            return jsonify({'error': 'Invalid role value'}), 400
    
    # Execute query and get results
    users = query.all()
    
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def admin_update_user(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if admin_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update user fields
    try:
        if 'role' in data:
            try:
                user.role = UserRole(data['role'])
            except ValueError:
                return jsonify({'error': 'Invalid role value'}), 400
                
        if 'active' in data:
            user.active = data['active']
            
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/jobs', methods=['GET'])
@jwt_required()
def admin_get_jobs():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get query parameters for filtering
    status = request.args.get('status')
    
    # Base query
    query = Job.query
    
    # Apply filters if provided
    if status:
        query = query.filter_by(status=status)
    
    # Execute query and get results
    jobs = query.order_by(Job.created_at.desc()).all()
    
    return jsonify({
        'jobs': [job.to_dict() for job in jobs]
    }), 200

@admin_bp.route('/transactions', methods=['GET'])
@jwt_required()
def admin_get_transactions():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get query parameters for filtering
    status = request.args.get('status')
    
    # Base query
    query = Transaction.query
    
    # Apply filters if provided
    if status:
        query = query.filter_by(status=status)
    
    # Execute query and get results
    transactions = query.order_by(Transaction.created_at.desc()).all()
    
    return jsonify({
        'transactions': [{
            'id': transaction.id,
            'job_id': transaction.job_id,
            'job_title': Job.query.get(transaction.job_id).title,
            'payer': User.query.get(transaction.payer_id).username,
            'payee': User.query.get(transaction.payee_id).username,
            'amount': transaction.amount,
            'platform_fee': transaction.platform_fee,
            'status': transaction.status.value,
            'transaction_reference': transaction.transaction_reference,
            'created_at': transaction.created_at.isoformat(),
            'updated_at': transaction.updated_at.isoformat()
        } for transaction in transactions]
    }), 200

@admin_bp.route('/skills', methods=['GET'])
@jwt_required()
def admin_get_skills():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    skills = Skill.query.all()
    
    return jsonify({
        'skills': [{
            'id': skill.id,
            'name': skill.name,
            'category': skill.category,
            'user_count': len(skill.users)
        } for skill in skills]
    }), 200

@admin_bp.route('/skills', methods=['POST'])
@jwt_required()
def admin_create_skill():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is an admin
    if user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Check if required fields are present
    if 'name' not in data:
        return jsonify({'error': 'Missing required field: name'}), 400
    
    # Check if skill already exists
    existing_skill = Skill.query.filter_by(name=data['name']).first()
    if existing_skill:
        return jsonify({'error': 'Skill already exists'}), 400
    
    # Create new skill
    try:
        skill = Skill(
            name=data['name'],
            category=data.get('category')
        )
        
        db.session.add(skill)
        db.session.commit()
        
        return jsonify({
            'message': 'Skill created successfully',
            'skill': {
                'id': skill.id,
                'name': skill.name,
                'category': skill.category
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
