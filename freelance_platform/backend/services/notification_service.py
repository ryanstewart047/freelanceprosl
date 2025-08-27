from flask import current_app
from datetime import datetime
from models import db, Notification, EmailLog, User, NotificationType
from services.auth_service import AuthService

class NotificationService:
    @staticmethod
    def create_notification(user_id, notification_type, message, reference_id=None, reference_type=None):
        """
        Create a new notification for a user
        """
        try:
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                message=message,
                reference_id=reference_id,
                reference_type=reference_type
            )
            
            db.session.add(notification)
            db.session.commit()
            
            return {
                'success': True, 
                'message': 'Notification created successfully',
                'notification': notification.to_dict()
            }
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Error creating notification: {str(e)}'}
    
    @staticmethod
    def get_user_notifications(user_id, query_params=None):
        """
        Get all notifications for a user
        """
        if query_params is None:
            query_params = {}
            
        # Base query for user notifications
        query = Notification.query.filter_by(user_id=user_id)
        
        # Filter by read status
        if 'read' in query_params:
            read_status = query_params['read'].lower() == 'true'
            query = query.filter_by(is_read=read_status)
        
        # Filter by notification type
        if 'type' in query_params and query_params['type']:
            query = query.filter_by(type=query_params['type'])
        
        # Sorting (newest first by default)
        query = query.order_by(Notification.created_at.desc())
        
        # Pagination
        page = int(query_params.get('page', 1))
        per_page = int(query_params.get('per_page', 20))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Count unread notifications
        unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        
        results = {
            'notifications': [notification.to_dict() for notification in pagination.items],
            'unread_count': unread_count,
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }
        
        return results
    
    @staticmethod
    def mark_notification_read(notification_id, user_id):
        """
        Mark a notification as read
        """
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        
        if not notification:
            return {'success': False, 'message': 'Notification not found'}
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        
        db.session.commit()
        
        return {'success': True, 'message': 'Notification marked as read'}
    
    @staticmethod
    def mark_all_notifications_read(user_id):
        """
        Mark all notifications as read for a user
        """
        try:
            # Update all unread notifications for the user
            Notification.query.filter_by(user_id=user_id, is_read=False).update({
                'is_read': True,
                'read_at': datetime.utcnow()
            })
            
            db.session.commit()
            
            return {'success': True, 'message': 'All notifications marked as read'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Error marking notifications as read: {str(e)}'}
    
    @staticmethod
    def delete_notification(notification_id, user_id):
        """
        Delete a notification
        """
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        
        if not notification:
            return {'success': False, 'message': 'Notification not found'}
        
        db.session.delete(notification)
        db.session.commit()
        
        return {'success': True, 'message': 'Notification deleted successfully'}

class EmailService:
    @staticmethod
    def send_welcome_email(user):
        """
        Send welcome email to a new user
        """
        email_subject = "Welcome to FreelancePro SL!"
        email_body = f"""
        <h2>Welcome to FreelancePro SL!</h2>
        <p>Hi {user.first_name or user.username},</p>
        <p>Thank you for joining FreelancePro SL, the premier freelance platform in Sierra Leone!</p>
        <p>Here are some things you can do now:</p>
        <ul>
            <li>Complete your profile to increase your visibility</li>
            <li>Browse available jobs</li>
            <li>Connect with clients and freelancers</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        # Send email
        sent = AuthService.send_email(user.email, email_subject, email_body)
        
        if sent:
            # Create notification
            NotificationService.create_notification(
                user.id,
                NotificationType.WELCOME,
                "Welcome to FreelancePro SL! We're excited to have you join our community."
            )
        
        return sent
    
    @staticmethod
    def send_job_posted_notification(job):
        """
        Send notification to relevant freelancers when a new job is posted
        """
        # Find freelancers with matching skills
        skill_ids = [skill.id for skill in job.skills]
        
        # Get freelancers with matching skills
        freelancers = User.query.filter(
            User.role == 'FREELANCER',
            User.is_active == True,
            User.email_verified == True,
            User.skills.any(db.and_(db.in_(skill_ids)))
        ).limit(50).all()  # Limit to 50 freelancers to avoid excessive emails
        
        for freelancer in freelancers:
            # Create notification
            NotificationService.create_notification(
                freelancer.id,
                NotificationType.NEW_JOB_MATCH,
                f"New job match: {job.title}",
                reference_id=job.id,
                reference_type='job'
            )
            
            # Send email if user has enabled job notifications
            if freelancer.notification_preferences.get('job_matches', True):
                email_subject = f"New Job Match on FreelancePro SL: {job.title}"
                email_body = f"""
                <h2>New Job Matching Your Skills</h2>
                <p>Hi {freelancer.first_name or freelancer.username},</p>
                <p>A new job has been posted that matches your skills:</p>
                <p><strong>{job.title}</strong></p>
                <p>{job.description[:200]}...</p>
                <p>Budget: {job.budget} {job.currency}</p>
                <p><a href="{current_app.config['FRONTEND_URL']}/#/jobs/{job.id}">View Job Details</a></p>
                <p>Don't miss this opportunity! Submit your proposal today.</p>
                <p>Thank you,<br>The FreelancePro SL Team</p>
                """
                
                AuthService.send_email(freelancer.email, email_subject, email_body)
    
    @staticmethod
    def send_proposal_received_notification(proposal):
        """
        Send notification to client when a new proposal is received
        """
        job = proposal.job
        client = job.client
        freelancer = proposal.freelancer
        
        # Create notification for client
        NotificationService.create_notification(
            client.id,
            NotificationType.NEW_PROPOSAL,
            f"New proposal received for: {job.title}",
            reference_id=proposal.id,
            reference_type='proposal'
        )
        
        # Send email
        email_subject = f"New Proposal for Your Job: {job.title}"
        email_body = f"""
        <h2>New Proposal Received</h2>
        <p>Hi {client.first_name or client.username},</p>
        <p>You've received a new proposal for your job <strong>"{job.title}"</strong> from {freelancer.first_name} {freelancer.last_name}.</p>
        <p>Freelancer: {freelancer.first_name} {freelancer.last_name}</p>
        <p>Bid Amount: {proposal.bid_amount} {job.currency}</p>
        <p><a href="{current_app.config['FRONTEND_URL']}/#/jobs/{job.id}/proposals">View All Proposals</a></p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        AuthService.send_email(client.email, email_subject, email_body)
    
    @staticmethod
    def send_message_notification(message):
        """
        Send notification when a new message is received
        """
        sender = message.sender
        recipient = message.recipient
        
        # Create notification
        NotificationService.create_notification(
            recipient.id,
            NotificationType.NEW_MESSAGE,
            f"New message from {sender.first_name or sender.username}",
            reference_id=message.conversation_id,
            reference_type='conversation'
        )
        
        # Send email if user has enabled message notifications
        if recipient.notification_preferences.get('messages', True):
            email_subject = f"New Message from {sender.first_name or sender.username} on FreelancePro SL"
            email_body = f"""
            <h2>New Message</h2>
            <p>Hi {recipient.first_name or recipient.username},</p>
            <p>You've received a new message from {sender.first_name or sender.username}:</p>
            <p style="padding: 10px; background-color: #f5f5f5; border-left: 4px solid #007bff;">
                "{message.content[:100]}..."
            </p>
            <p><a href="{current_app.config['FRONTEND_URL']}/#/messages/{message.conversation_id}">Reply to Message</a></p>
            <p>Thank you,<br>The FreelancePro SL Team</p>
            """
            
            AuthService.send_email(recipient.email, email_subject, email_body)
    
    @staticmethod
    def send_review_notification(review):
        """
        Send notification when a review is received
        """
        reviewer = review.reviewer
        reviewed = review.reviewed
        
        # Create notification
        NotificationService.create_notification(
            reviewed.id,
            NotificationType.NEW_REVIEW,
            f"New review from {reviewer.first_name or reviewer.username}",
            reference_id=review.id,
            reference_type='review'
        )
        
        # Send email
        email_subject = "You've Received a New Review on FreelancePro SL"
        email_body = f"""
        <h2>New Review Received</h2>
        <p>Hi {reviewed.first_name or reviewed.username},</p>
        <p>{reviewer.first_name or reviewer.username} has left you a {review.rating}-star review:</p>
        <p style="padding: 10px; background-color: #f5f5f5; border-left: 4px solid #ffc107;">
            "{review.comment}"
        </p>
        <p><a href="{current_app.config['FRONTEND_URL']}/#/profile/{reviewed.username}">View Your Profile</a></p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        AuthService.send_email(reviewed.email, email_subject, email_body)
    
    @staticmethod
    def send_job_completed_notification(job):
        """
        Send notification when a job is marked as completed
        """
        client = job.client
        freelancer = job.freelancer
        
        # Create notification for client
        NotificationService.create_notification(
            client.id,
            NotificationType.JOB_COMPLETED,
            f"Job completed: {job.title}",
            reference_id=job.id,
            reference_type='job'
        )
        
        # Create notification for freelancer
        NotificationService.create_notification(
            freelancer.id,
            NotificationType.JOB_COMPLETED,
            f"Job completed: {job.title}",
            reference_id=job.id,
            reference_type='job'
        )
        
        # Send email to client
        client_email_subject = f"Job Completed: {job.title}"
        client_email_body = f"""
        <h2>Job Completed</h2>
        <p>Hi {client.first_name or client.username},</p>
        <p>The job <strong>"{job.title}"</strong> has been marked as completed by {freelancer.first_name or freelancer.username}.</p>
        <p>Please review the work and leave a review for the freelancer.</p>
        <p><a href="{current_app.config['FRONTEND_URL']}/#/jobs/{job.id}">View Job</a></p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        AuthService.send_email(client.email, client_email_subject, client_email_body)
        
        # Send email to freelancer
        freelancer_email_subject = f"Job Completed: {job.title}"
        freelancer_email_body = f"""
        <h2>Job Completed</h2>
        <p>Hi {freelancer.first_name or freelancer.username},</p>
        <p>You have marked the job <strong>"{job.title}"</strong> as completed.</p>
        <p>The client will now review your work.</p>
        <p><a href="{current_app.config['FRONTEND_URL']}/#/jobs/{job.id}">View Job</a></p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        AuthService.send_email(freelancer.email, freelancer_email_subject, freelancer_email_body)
    
    @staticmethod
    def get_email_logs(query_params=None):
        """
        Get email logs with filtering and pagination
        Admin-only function
        """
        if query_params is None:
            query_params = {}
            
        # Base query for email logs
        query = EmailLog.query
        
        # Filter by recipient
        if 'recipient' in query_params and query_params['recipient']:
            query = query.filter(EmailLog.recipient.ilike(f"%{query_params['recipient']}%"))
        
        # Filter by status
        if 'status' in query_params and query_params['status']:
            query = query.filter_by(status=query_params['status'])
        
        # Filter by date range
        if 'start_date' in query_params and query_params['start_date']:
            query = query.filter(EmailLog.created_at >= query_params['start_date'])
        
        if 'end_date' in query_params and query_params['end_date']:
            query = query.filter(EmailLog.created_at <= query_params['end_date'])
        
        # Sorting (newest first by default)
        query = query.order_by(EmailLog.created_at.desc())
        
        # Pagination
        page = int(query_params.get('page', 1))
        per_page = int(query_params.get('per_page', 20))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        results = {
            'email_logs': [log.to_dict() for log in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }
        
        return results
