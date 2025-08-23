from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os

from routes import profiles_bp
from models import db, User, Skill, Review, Job, UserRole
from config import Config

@profiles_bp.route('/users', methods=['GET'])
def get_users():
    # Get query parameters for filtering
    role = request.args.get('role')
    skill_name = request.args.get('skill')
    
    # Base query
    query = User.query
    
    # Apply filters if provided
    if role:
        try:
            user_role = UserRole(role)
            query = query.filter_by(role=user_role)
        except ValueError:
            return jsonify({'error': 'Invalid role value'}), 400
    
    if skill_name:
        skill = Skill.query.filter_by(name=skill_name).first()
        if skill:
            query = query.filter(User.skills.contains(skill))
    
    # Execute query and get results
    users = query.all()
    
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200

@profiles_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@profiles_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update user fields
    try:
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'bio' in data:
            user.bio = data['bio']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'hourly_rate' in data and user.role == UserRole.FREELANCER:
            user.hourly_rate = data['hourly_rate']
        if 'availability' in data and user.role == UserRole.FREELANCER:
            user.availability = data['availability']
        
        # Update skills
        if 'skills' in data and user.role == UserRole.FREELANCER:
            # Clear existing skills
            user.skills = []
            
            # Add new skills
            for skill_name in data['skills']:
                skill = Skill.query.filter_by(name=skill_name).first()
                if not skill:
                    # Create new skill if it doesn't exist
                    skill = Skill(name=skill_name)
                    db.session.add(skill)
                user.skills.append(skill)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profiles_bp.route('/profile/picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if the file is allowed
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Create uploads directory if it doesn't exist
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)
    
    # Save file
    try:
        filename = secure_filename(f'{current_user_id}_{file.filename}')
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Update user profile picture
        user.profile_picture = filename
        db.session.commit()
        
        return jsonify({
            'message': 'Profile picture uploaded successfully',
            'profile_picture': filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profiles_bp.route('/users/<int:user_id>/reviews', methods=['GET'])
def get_user_reviews(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    reviews = Review.query.filter_by(reviewee_id=user_id).all()
    
    return jsonify({
        'reviews': [{
            'id': review.id,
            'job_id': review.job_id,
            'reviewer': User.query.get(review.reviewer_id).to_dict(),
            'rating': review.rating,
            'comment': review.comment,
            'created_at': review.created_at.isoformat()
        } for review in reviews]
    }), 200

@profiles_bp.route('/jobs/<int:job_id>/review', methods=['POST'])
@jwt_required()
def create_review(job_id):
    current_user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if job is completed
    if job.status != JobStatus.COMPLETED:
        return jsonify({'error': 'Job must be completed before leaving a review'}), 400
    
    # Check if user is either the client or the freelancer
    if current_user_id != job.client_id and current_user_id != job.freelancer_id:
        return jsonify({'error': 'You are not associated with this job'}), 403
    
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['rating']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Determine reviewer and reviewee
    if current_user_id == job.client_id:
        reviewer_id = job.client_id
        reviewee_id = job.freelancer_id
    else:
        reviewer_id = job.freelancer_id
        reviewee_id = job.client_id
    
    # Check if user has already left a review
    existing_review = Review.query.filter_by(
        job_id=job_id,
        reviewer_id=reviewer_id,
        reviewee_id=reviewee_id
    ).first()
    
    if existing_review:
        return jsonify({'error': 'You have already left a review for this job'}), 400
    
    # Create new review
    try:
        review = Review(
            job_id=job_id,
            reviewer_id=reviewer_id,
            reviewee_id=reviewee_id,
            rating=data['rating'],
            comment=data.get('comment', '')
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Review created successfully',
            'review': {
                'id': review.id,
                'job_id': review.job_id,
                'reviewer_id': review.reviewer_id,
                'reviewee_id': review.reviewee_id,
                'rating': review.rating,
                'comment': review.comment,
                'created_at': review.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
