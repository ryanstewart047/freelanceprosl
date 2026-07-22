import os
import logging
from flask import current_app

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_welcome_email(user):
        """
        Sends welcome and profile confirmation email to the user upon registration/profile creation.
        Includes 30-day free trial confirmation and unique tracking ID.
        """
        subject = "Welcome to FreelancePro SL - Your 30-Day Free Trial Has Started!"
        tracking_id = getattr(user, 'tracking_id', 'N/A')
        
        body = f"""
Dear {user.first_name or user.username},

Welcome to FreelancePro SL!

Your account and profile have been created successfully.

Here are your account details:
----------------------------------------------
Tracking ID: {tracking_id}
Account Role: {user.role.value if hasattr(user.role, 'value') else user.role}
Trial Period: 30 Days Free Trial
Trial Expiration Date: {user.trial_end_date.strftime('%Y-%m-%d') if hasattr(user, 'trial_end_date') and user.trial_end_date else '30 days from now'}
Subscription Rate: $10.00 / month (starts after 30 days)
----------------------------------------------

Your profile is now live and active on the FreelancePro SL Marketplace!

Thank you for joining FreelancePro SL.

Best regards,
The FreelancePro SL Team
        """
        
        # Log email dispatch
        logger.info(f"[EMAIL SERVICE] Sending confirmation email to {user.email} (Tracking ID: {tracking_id})")
        print(f"[CONFIRMATION EMAIL SENT TO {user.email}]\nSubject: {subject}\n{body}\n")
        return True

    @staticmethod
    def send_admin_message_email(recipient, subject, message_text):
        """
        Sends an email notification when Admin sends a direct message to a user.
        """
        email_subject = f"[FreelancePro SL Admin Notification] {subject}"
        body = f"""
Dear {recipient.first_name or recipient.username},

You have received an official message from the FreelancePro SL Administration team:

----------------------------------------------
Subject: {subject}
----------------------------------------------
{message_text}
----------------------------------------------

Please log into your dashboard to view or respond.

Best regards,
FreelancePro SL Admin Team
        """
        logger.info(f"[EMAIL SERVICE] Sending Admin direct message email to {recipient.email}")
        print(f"[ADMIN MESSAGE EMAIL SENT TO {recipient.email}]\nSubject: {email_subject}\n{body}\n")
        return True
