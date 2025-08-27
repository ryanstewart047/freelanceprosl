from flask import current_app, url_for
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime, timedelta
import jwt
import uuid
from models import db, User, EmailLog, Notification, NotificationType
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AuthService:
    @staticmethod
    def signup_user(data):
        """
        Register a new user and send verification email
        """
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return {'success': False, 'message': 'Email already registered'}
        
        if User.query.filter_by(username=data['username']).first():
            return {'success': False, 'message': 'Username already taken'}
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            role=data['role'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone_number=data.get('phone_number', '')
        )
        
        # Set password
        new_user.set_password(data['password'])
        
        # Generate verification token
        verification_token = new_user.generate_verification_token()
        
        try:
            # Add user to database
            db.session.add(new_user)
            db.session.commit()
            
            # Send verification email
            AuthService.send_verification_email(new_user, verification_token)
            
            return {
                'success': True, 
                'message': 'User registered successfully. Please check your email to verify your account.',
                'user_id': new_user.id
            }
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Error during registration: {str(e)}'}
    
    @staticmethod
    def login_user(email, password):
        """
        Authenticate user and generate JWT token
        """
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return {'success': False, 'message': 'User not found'}
        
        if not user.check_password(password):
            return {'success': False, 'message': 'Invalid password'}
        
        if not user.email_verified:
            return {'success': False, 'message': 'Email not verified. Please check your email for verification link.'}
        
        if not user.is_active:
            return {'success': False, 'message': 'Account is inactive or suspended'}
        
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token = AuthService.generate_jwt_token(user)
        
        return {
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }
    
    @staticmethod
    def verify_email(token):
        """
        Verify user email with token
        """
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            return {'success': False, 'message': 'Invalid verification token'}
        
        # Mark email as verified
        user.email_verified = True
        user.verification_token = None
        
        # Create notification
        notification = Notification(
            user_id=user.id,
            type=NotificationType.ACCOUNT_VERIFIED,
            message='Your account has been successfully verified.'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return {'success': True, 'message': 'Email verified successfully'}
    
    @staticmethod
    def request_password_reset(email):
        """
        Generate and send password reset token
        """
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # For security reasons, don't reveal that email doesn't exist
            return {'success': True, 'message': 'If your email is registered, you will receive a password reset link.'}
        
        # Generate reset token
        reset_token = user.generate_reset_token()
        db.session.commit()
        
        # Send reset email
        reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}&email={user.email}"
        
        email_subject = "FreelancePro SL - Password Reset Request"
        email_body = f"""
        <h2>Password Reset Request</h2>
        <p>Hi {user.first_name or user.username},</p>
        <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
        <p>To reset your password, click the link below:</p>
        <p><a href="{reset_link}">Reset Your Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        # Send email
        AuthService.send_email(user.email, email_subject, email_body)
        
        # Create notification
        notification = Notification(
            user_id=user.id,
            type=NotificationType.PASSWORD_RESET,
            message='A password reset link has been sent to your email.'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return {'success': True, 'message': 'If your email is registered, you will receive a password reset link.'}
    
    @staticmethod
    def reset_password(email, token, new_password):
        """
        Reset user password with token
        """
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return {'success': False, 'message': 'Invalid email or token'}
        
        if not user.verify_reset_token(token):
            return {'success': False, 'message': 'Invalid or expired token'}
        
        # Set new password
        user.set_password(new_password)
        
        # Clear reset token
        user.reset_token = None
        user.reset_token_expiry = None
        
        db.session.commit()
        
        # Send confirmation email
        email_subject = "FreelancePro SL - Password Reset Successful"
        email_body = f"""
        <h2>Password Reset Successful</h2>
        <p>Hi {user.first_name or user.username},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you did not request this change, please contact our support team immediately.</p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        # Send email
        AuthService.send_email(user.email, email_subject, email_body)
        
        return {'success': True, 'message': 'Password reset successful'}
    
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """
        Change user password with current password verification
        """
        user = User.query.get(user_id)
        
        if not user:
            return {'success': False, 'message': 'User not found'}
        
        if not user.check_password(current_password):
            return {'success': False, 'message': 'Current password is incorrect'}
        
        # Set new password
        user.set_password(new_password)
        db.session.commit()
        
        # Send confirmation email
        email_subject = "FreelancePro SL - Password Changed"
        email_body = f"""
        <h2>Password Changed</h2>
        <p>Hi {user.first_name or user.username},</p>
        <p>Your password has been successfully changed.</p>
        <p>If you did not request this change, please contact our support team immediately.</p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        # Send email
        AuthService.send_email(user.email, email_subject, email_body)
        
        return {'success': True, 'message': 'Password changed successfully'}
    
    @staticmethod
    def generate_jwt_token(user):
        """
        Generate JWT token for authenticated user
        """
        payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role.value,
            'exp': datetime.utcnow() + timedelta(days=1),  # Token expires in 1 day
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return token
    
    @staticmethod
    def send_verification_email(user, token):
        """
        Send email verification link to user
        """
        verification_link = f"{current_app.config['FRONTEND_URL']}/verify-email?token={token}"
        
        email_subject = "Welcome to FreelancePro SL - Verify Your Email"
        email_body = f"""
        <h2>Welcome to FreelancePro SL!</h2>
        <p>Hi {user.first_name or user.username},</p>
        <p>Thank you for registering with FreelancePro SL. To complete your registration, please verify your email address by clicking the link below:</p>
        <p><a href="{verification_link}">Verify Your Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Thank you,<br>The FreelancePro SL Team</p>
        """
        
        # Send email
        AuthService.send_email(user.email, email_subject, email_body)
    
    @staticmethod
    def send_email(recipient, subject, html_content):
        """
        Send email and log it
        """
        try:
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = current_app.config['MAIL_DEFAULT_SENDER']
            msg['To'] = recipient
            msg['Subject'] = subject
            
            # Add HTML content
            msg.attach(MIMEText(html_content, 'html'))
            
            # Connect to SMTP server
            server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
            server.starttls()
            server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
            
            # Send email
            server.send_message(msg)
            server.quit()
            
            # Log the email
            email_log = EmailLog(
                recipient=recipient,
                subject=subject,
                body=html_content,
                status='sent'
            )
            
            db.session.add(email_log)
            db.session.commit()
            
            return True
        except Exception as e:
            # Log failed email
            email_log = EmailLog(
                recipient=recipient,
                subject=subject,
                body=html_content,
                status='failed',
                error_message=str(e)
            )
            
            db.session.add(email_log)
            db.session.commit()
            
            return False
