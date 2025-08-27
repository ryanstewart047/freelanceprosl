from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from routes import marketplace_bp
from models import db, Job, JobStatus, Proposal, User, Skill, UserRole

@marketplace_bp.route('/jobs', methods=['GET'])
def get_jobs():
    # Get query parameters for filtering
    status = request.args.get('status')
    
    # Base query
    query = Job.query
    
    # Apply filters if provided
    if status:
        try:
            job_status = JobStatus(status)
            query = query.filter_by(status=job_status)
        except ValueError:
            return jsonify({'error': 'Invalid status value'}), 400
    
    # Execute query and get results
    jobs = query.order_by(Job.created_at.desc()).all()
    
    return jsonify({
        'jobs': [job.to_dict() for job in jobs]
    }), 200

@marketplace_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user is a client
    if user.role != UserRole.CLIENT and user.role != UserRole.ADMIN:
        return jsonify({'error': 'Only clients can create jobs'}), 403
    
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['title', 'description', 'budget']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create new job
    try:
        job = Job(
            title=data['title'],
            description=data['description'],
            client_id=current_user_id,
            budget=data['budget'],
            deadline=data.get('deadline')
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job': job.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@marketplace_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(job.to_dict()), 200

@marketplace_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    current_user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the job owner
    if job.client_id != current_user_id:
        return jsonify({'error': 'You do not have permission to update this job'}), 403
    
    data = request.get_json()
    
    # Update job fields
    try:
        if 'title' in data:
            job.title = data['title']
        if 'description' in data:
            job.description = data['description']
        if 'budget' in data:
            job.budget = data['budget']
        if 'deadline' in data:
            job.deadline = data['deadline']
        if 'status' in data:
            try:
                job.status = JobStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status value'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Job updated successfully',
            'job': job.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@marketplace_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    current_user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the job owner
    if job.client_id != current_user_id:
        return jsonify({'error': 'You do not have permission to delete this job'}), 403
    
    # Delete job
    try:
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@marketplace_bp.route('/jobs/<int:job_id>/proposals', methods=['GET'])
@jwt_required()
def get_job_proposals(job_id):
    current_user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the job owner
    if job.client_id != current_user_id:
        return jsonify({'error': 'You do not have permission to view proposals for this job'}), 403
    
    proposals = Proposal.query.filter_by(job_id=job_id).all()
    
    return jsonify({
        'proposals': [{
            'id': proposal.id,
            'freelancer': User.query.get(proposal.freelancer_id).to_dict(),
            'cover_letter': proposal.cover_letter,
            'bid_amount': proposal.bid_amount,
            'estimated_duration': proposal.estimated_duration,
            'created_at': proposal.created_at.isoformat()
        } for proposal in proposals]
    }), 200

@marketplace_bp.route('/jobs/<int:job_id>/proposals', methods=['POST'])
@jwt_required()
def submit_proposal(job_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is a freelancer
    if user.role != UserRole.FREELANCER:
        return jsonify({'error': 'Only freelancers can submit proposals'}), 403
    
    # Check if job is open
    if job.status != JobStatus.OPEN:
        return jsonify({'error': 'This job is not open for proposals'}), 400
    
    # Check if user has already submitted a proposal
    existing_proposal = Proposal.query.filter_by(job_id=job_id, freelancer_id=current_user_id).first()
    if existing_proposal:
        return jsonify({'error': 'You have already submitted a proposal for this job'}), 400
    
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['cover_letter', 'bid_amount']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create new proposal
    try:
        proposal = Proposal(
            job_id=job_id,
            freelancer_id=current_user_id,
            cover_letter=data['cover_letter'],
            bid_amount=data['bid_amount'],
            estimated_duration=data.get('estimated_duration')
        )
        
        db.session.add(proposal)
        db.session.commit()
        
        return jsonify({
            'message': 'Proposal submitted successfully',
            'proposal': {
                'id': proposal.id,
                'job_id': proposal.job_id,
                'freelancer_id': proposal.freelancer_id,
                'cover_letter': proposal.cover_letter,
                'bid_amount': proposal.bid_amount,
                'estimated_duration': proposal.estimated_duration,
                'created_at': proposal.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@marketplace_bp.route('/jobs/<int:job_id>/hire/<int:freelancer_id>', methods=['POST'])
@jwt_required()
def hire_freelancer(job_id, freelancer_id):
    current_user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    freelancer = User.query.get(freelancer_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    if not freelancer:
        return jsonify({'error': 'Freelancer not found'}), 404
    
    # Check if user is the job owner
    if job.client_id != current_user_id:
        return jsonify({'error': 'You do not have permission to hire for this job'}), 403
    
    # Check if job is open
    if job.status != JobStatus.OPEN:
        return jsonify({'error': 'This job is not open for hiring'}), 400
    
    # Check if freelancer has submitted a proposal
    proposal = Proposal.query.filter_by(job_id=job_id, freelancer_id=freelancer_id).first()
    if not proposal:
        return jsonify({'error': 'This freelancer has not submitted a proposal for this job'}), 400
    
    # Update job status and assign freelancer
    try:
        job.status = JobStatus.IN_PROGRESS
        job.freelancer_id = freelancer_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'Freelancer hired successfully',
            'job': job.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@marketplace_bp.route('/skills', methods=['GET'])
def get_skills():
    skills = Skill.query.all()
    
    return jsonify({
        'skills': [{
            'id': skill.id,
            'name': skill.name,
            'category': skill.category
        } for skill in skills]
    }), 200
