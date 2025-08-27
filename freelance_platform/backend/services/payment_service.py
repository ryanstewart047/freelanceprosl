from flask import current_app
from datetime import datetime
import uuid
import requests
import json
from models import db, User, Transaction, Job, Proposal, Notification, NotificationType
from enum import Enum
from services.auth_service import AuthService

class PaymentMethod(Enum):
    MOBILE_MONEY = 'mobile_money'
    CREDIT_CARD = 'credit_card'
    BANK_TRANSFER = 'bank_transfer'

class MobileMoneyProvider(Enum):
    ORANGE = 'orange'
    AFRICELL = 'africell'
    QCELL = 'qcell'

class TransactionStatus(Enum):
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    REFUNDED = 'refunded'
    CANCELLED = 'cancelled'

class PaymentService:
    @staticmethod
    def create_transaction(data):
        """
        Create a new payment transaction
        """
        try:
            # Create transaction record
            transaction = Transaction(
                user_id=data['user_id'],
                amount=data['amount'],
                transaction_type=data['transaction_type'],
                description=data.get('description', ''),
                payment_method=data.get('payment_method', PaymentMethod.MOBILE_MONEY.value),
                status=TransactionStatus.PENDING.value,
                currency=data.get('currency', 'SLL'),
                transaction_reference=str(uuid.uuid4()),
                job_id=data.get('job_id'),
                proposal_id=data.get('proposal_id')
            )
            
            # Add mobile money details if applicable
            if data.get('payment_method') == PaymentMethod.MOBILE_MONEY.value:
                transaction.mobile_money_provider = data.get('mobile_money_provider')
                transaction.mobile_money_number = data.get('mobile_money_number')
            
            db.session.add(transaction)
            db.session.commit()
            
            # Process the payment based on method
            if data.get('payment_method') == PaymentMethod.MOBILE_MONEY.value:
                return PaymentService.process_mobile_money_payment(transaction)
            # Add other payment methods as needed
            
            return {
                'success': True, 
                'message': 'Transaction created successfully', 
                'transaction': transaction.to_dict()
            }
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Error creating transaction: {str(e)}'}
    
    @staticmethod
    def process_mobile_money_payment(transaction):
        """
        Process a mobile money payment
        """
        try:
            # Get the mobile money API credentials
            provider = transaction.mobile_money_provider
            api_key = current_app.config.get(f'{provider.upper()}_API_KEY')
            api_url = current_app.config.get(f'{provider.upper()}_API_URL')
            
            if not api_key or not api_url:
                transaction.status = TransactionStatus.FAILED.value
                transaction.error_message = f"Missing API configuration for {provider}"
                db.session.commit()
                return {'success': False, 'message': f'Payment provider {provider} not configured properly'}
            
            # Prepare the mobile money API request
            payload = {
                'amount': transaction.amount,
                'phone_number': transaction.mobile_money_number,
                'external_reference': transaction.transaction_reference,
                'description': transaction.description or 'Payment to FreelancePro SL',
                'callback_url': f"{current_app.config['API_URL']}/api/payments/callback/{transaction.id}"
            }
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            # Call the mobile money API
            response = requests.post(api_url, json=payload, headers=headers)
            response_data = response.json()
            
            # Update transaction with provider response
            transaction.provider_reference = response_data.get('transaction_id')
            transaction.provider_response = json.dumps(response_data)
            
            if response.status_code == 200 and response_data.get('status') == 'pending':
                # Transaction initiated successfully
                transaction.status = TransactionStatus.PENDING.value
                
                # Create notification for user
                notification = Notification(
                    user_id=transaction.user_id,
                    type=NotificationType.PAYMENT_INITIATED,
                    message=f'Your payment of {transaction.amount} {transaction.currency} has been initiated. Please check your mobile phone to authorize the payment.'
                )
                
                db.session.add(notification)
                db.session.commit()
                
                return {
                    'success': True, 
                    'message': 'Payment initiated. Please authorize the payment on your mobile phone.',
                    'transaction': transaction.to_dict()
                }
            else:
                # Transaction failed at initiation
                transaction.status = TransactionStatus.FAILED.value
                transaction.error_message = response_data.get('message', 'Payment initiation failed')
                
                db.session.commit()
                
                return {
                    'success': False, 
                    'message': transaction.error_message,
                    'transaction': transaction.to_dict()
                }
            
        except Exception as e:
            transaction.status = TransactionStatus.FAILED.value
            transaction.error_message = str(e)
            db.session.commit()
            
            return {'success': False, 'message': f'Error processing payment: {str(e)}'}
    
    @staticmethod
    def process_payment_callback(transaction_id, callback_data):
        """
        Process callback from mobile money provider
        """
        transaction = Transaction.query.get(transaction_id)
        
        if not transaction:
            return {'success': False, 'message': 'Transaction not found'}
        
        try:
            # Update transaction status based on callback
            if callback_data.get('status') == 'success':
                transaction.status = TransactionStatus.COMPLETED.value
                transaction.completed_at = datetime.utcnow()
                
                # Create notification for user
                notification = Notification(
                    user_id=transaction.user_id,
                    type=NotificationType.PAYMENT_COMPLETED,
                    message=f'Your payment of {transaction.amount} {transaction.currency} has been completed successfully.'
                )
                
                db.session.add(notification)
                
                # If this is a payment for a job, update job status
                if transaction.job_id and transaction.proposal_id:
                    PaymentService.update_job_on_payment(transaction)
                
                # Send email notification
                user = User.query.get(transaction.user_id)
                if user:
                    email_subject = "FreelancePro SL - Payment Successful"
                    email_body = f"""
                    <h2>Payment Successful</h2>
                    <p>Hi {user.first_name or user.username},</p>
                    <p>Your payment of {transaction.amount} {transaction.currency} has been processed successfully.</p>
                    <p>Transaction Reference: {transaction.transaction_reference}</p>
                    <p>Thank you for using FreelancePro SL!</p>
                    <p>The FreelancePro SL Team</p>
                    """
                    
                    AuthService.send_email(user.email, email_subject, email_body)
            
            elif callback_data.get('status') == 'failed':
                transaction.status = TransactionStatus.FAILED.value
                transaction.error_message = callback_data.get('message', 'Payment failed')
                
                # Create notification for user
                notification = Notification(
                    user_id=transaction.user_id,
                    type=NotificationType.PAYMENT_FAILED,
                    message=f'Your payment of {transaction.amount} {transaction.currency} has failed. Reason: {transaction.error_message}'
                )
                
                db.session.add(notification)
                
                # Send email notification
                user = User.query.get(transaction.user_id)
                if user:
                    email_subject = "FreelancePro SL - Payment Failed"
                    email_body = f"""
                    <h2>Payment Failed</h2>
                    <p>Hi {user.first_name or user.username},</p>
                    <p>Your payment of {transaction.amount} {transaction.currency} has failed.</p>
                    <p>Reason: {transaction.error_message}</p>
                    <p>Transaction Reference: {transaction.transaction_reference}</p>
                    <p>Please try again or contact our support team for assistance.</p>
                    <p>The FreelancePro SL Team</p>
                    """
                    
                    AuthService.send_email(user.email, email_subject, email_body)
            
            db.session.commit()
            
            return {
                'success': True, 
                'message': f'Callback processed successfully. Transaction status: {transaction.status}',
                'transaction': transaction.to_dict()
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Error processing callback: {str(e)}'}
    
    @staticmethod
    def update_job_on_payment(transaction):
        """
        Update job and proposal status when payment is completed
        """
        job = Job.query.get(transaction.job_id)
        proposal = Proposal.query.get(transaction.proposal_id)
        
        if job and proposal:
            # Update job status
            job.status = 'IN_PROGRESS'
            job.awarded_to = proposal.freelancer_id
            job.payment_status = 'PAID'
            
            # Update proposal status
            proposal.status = 'ACCEPTED'
            
            # Notify freelancer
            notification = Notification(
                user_id=proposal.freelancer_id,
                type=NotificationType.JOB_AWARDED,
                message=f'You have been awarded the job "{job.title}"! The client has made the payment and you can start working now.'
            )
            
            db.session.add(notification)
            
            # Send email to freelancer
            freelancer = User.query.get(proposal.freelancer_id)
            if freelancer:
                email_subject = "FreelancePro SL - Job Awarded"
                email_body = f"""
                <h2>Congratulations! Job Awarded</h2>
                <p>Hi {freelancer.first_name or freelancer.username},</p>
                <p>You have been awarded the job "{job.title}"!</p>
                <p>The client has made the payment and you can start working now.</p>
                <p>Please login to your account to view the job details and start communication with the client.</p>
                <p>Thank you for using FreelancePro SL!</p>
                <p>The FreelancePro SL Team</p>
                """
                
                AuthService.send_email(freelancer.email, email_subject, email_body)
    
    @staticmethod
    def get_transaction(transaction_id, user_id=None):
        """
        Get transaction details
        """
        query = Transaction.query.filter_by(id=transaction_id)
        
        # If user_id provided, ensure the transaction belongs to the user
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        transaction = query.first()
        
        if not transaction:
            return {'success': False, 'message': 'Transaction not found'}
        
        return {'success': True, 'transaction': transaction.to_dict()}
    
    @staticmethod
    def get_user_transactions(user_id, query_params=None):
        """
        Get all transactions for a user
        """
        if query_params is None:
            query_params = {}
            
        # Base query for user transactions
        query = Transaction.query.filter_by(user_id=user_id)
        
        # Filter by status
        if 'status' in query_params and query_params['status']:
            query = query.filter_by(status=query_params['status'])
        
        # Filter by transaction type
        if 'transaction_type' in query_params and query_params['transaction_type']:
            query = query.filter_by(transaction_type=query_params['transaction_type'])
        
        # Filter by date range
        if 'start_date' in query_params and query_params['start_date']:
            query = query.filter(Transaction.created_at >= query_params['start_date'])
        
        if 'end_date' in query_params and query_params['end_date']:
            query = query.filter(Transaction.created_at <= query_params['end_date'])
        
        # Sorting
        sort_by = query_params.get('sort_by', 'created_at')
        if sort_by == 'created_at':
            query = query.order_by(Transaction.created_at.desc())
        elif sort_by == 'amount':
            query = query.order_by(Transaction.amount.desc())
        
        # Pagination
        page = int(query_params.get('page', 1))
        per_page = int(query_params.get('per_page', 20))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        results = {
            'transactions': [transaction.to_dict() for transaction in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }
        
        return results
