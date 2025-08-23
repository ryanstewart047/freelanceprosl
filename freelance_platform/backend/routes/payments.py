from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
import json

from routes import payments_bp
from models import db, Transaction, TransactionStatus, Job, JobStatus, User
from services.orange_money_service import OrangeMoneyService
from config import Config

orange_money_service = OrangeMoneyService()

@payments_bp.route('/deposit', methods=['POST'])
@jwt_required()
def initiate_deposit():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['amount', 'job_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    job_id = data['job_id']
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the client
    if job.client_id != current_user_id:
        return jsonify({'error': 'Only the client can make a deposit for this job'}), 403
    
    # Generate a unique transaction reference
    transaction_reference = str(uuid.uuid4())
    
    # Calculate platform fee
    amount = float(data['amount'])
    platform_fee = amount * (Config.PLATFORM_FEE_PERCENTAGE / 100)
    
    # Create a new transaction
    try:
        transaction = Transaction(
            job_id=job_id,
            payer_id=current_user_id,
            payee_id=job.freelancer_id,
            amount=amount,
            platform_fee=platform_fee,
            status=TransactionStatus.PENDING,
            transaction_reference=transaction_reference
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        # Initiate payment with Orange Money
        payment_response = orange_money_service.initiate_payment(
            amount=amount,
            phone_number=data.get('phone_number', user.phone_number),
            transaction_reference=transaction_reference,
            description=f"Deposit for job: {job.title}"
        )
        
        # Update transaction with Orange Money transaction ID
        if payment_response['status'] == 'success':
            transaction.orange_money_transaction_id = payment_response['transaction_id']
            db.session.commit()
            
            return jsonify({
                'message': 'Deposit initiated successfully',
                'transaction': {
                    'id': transaction.id,
                    'job_id': transaction.job_id,
                    'amount': transaction.amount,
                    'platform_fee': transaction.platform_fee,
                    'status': transaction.status.value,
                    'transaction_reference': transaction.transaction_reference,
                    'created_at': transaction.created_at.isoformat()
                },
                'payment_details': payment_response
            }), 200
        else:
            # Payment initiation failed
            transaction.status = TransactionStatus.FAILED
            db.session.commit()
            
            return jsonify({
                'error': 'Payment initiation failed',
                'details': payment_response['message']
            }), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/callback', methods=['POST'])
def payment_callback():
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['transaction_reference', 'status', 'orange_money_transaction_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    transaction_reference = data['transaction_reference']
    status = data['status']
    orange_money_transaction_id = data['orange_money_transaction_id']
    
    # Find the transaction
    transaction = Transaction.query.filter_by(transaction_reference=transaction_reference).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    # Update transaction status
    try:
        if status == 'success':
            transaction.status = TransactionStatus.COMPLETED
            
            # Update job status if not already in progress
            job = Job.query.get(transaction.job_id)
            if job.status == JobStatus.OPEN:
                job.status = JobStatus.IN_PROGRESS
        else:
            transaction.status = TransactionStatus.FAILED
        
        transaction.orange_money_transaction_id = orange_money_transaction_id
        db.session.commit()
        
        return jsonify({
            'message': 'Callback processed successfully',
            'transaction_status': transaction.status.value
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    job_id = request.args.get('job_id')
    status = request.args.get('status')
    
    # Base query - get transactions where user is either payer or payee
    query = Transaction.query.filter(
        (Transaction.payer_id == current_user_id) | 
        (Transaction.payee_id == current_user_id)
    )
    
    # Apply filters if provided
    if job_id:
        query = query.filter_by(job_id=job_id)
    
    if status:
        try:
            transaction_status = TransactionStatus(status)
            query = query.filter_by(status=transaction_status)
        except ValueError:
            return jsonify({'error': 'Invalid status value'}), 400
    
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

@payments_bp.route('/release/<int:transaction_id>', methods=['POST'])
@jwt_required()
def release_payment(transaction_id):
    current_user_id = get_jwt_identity()
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    job = Job.query.get(transaction.job_id)
    
    # Check if user is the client
    if job.client_id != current_user_id:
        return jsonify({'error': 'Only the client can release payment'}), 403
    
    # Check if transaction is completed
    if transaction.status != TransactionStatus.COMPLETED:
        return jsonify({'error': 'Transaction must be completed before releasing payment'}), 400
    
    # Update job status
    try:
        job.status = JobStatus.COMPLETED
        db.session.commit()
        
        # Simulate payment release to freelancer
        # In a real implementation, this would interact with Orange Money API
        payment_release_response = orange_money_service.release_payment(
            transaction_id=transaction.orange_money_transaction_id,
            amount=transaction.amount - transaction.platform_fee,
            recipient_id=transaction.payee_id
        )
        
        return jsonify({
            'message': 'Payment released successfully',
            'job_status': job.status.value,
            'release_details': payment_release_response
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
