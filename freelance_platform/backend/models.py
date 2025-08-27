from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum

db = SQLAlchemy()

# Association table for user skills
user_skills = db.Table('user_skills',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), primary_key=True)
)

class UserRole(enum.Enum):
    CLIENT = 'client'
    FREELANCER = 'freelancer'
    ADMIN = 'admin'

class JobStatus(enum.Enum):
    OPEN = 'open'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

class TransactionStatus(enum.Enum):
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    REFUNDED = 'refunded'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.CLIENT)
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    bio = db.Column(db.Text)
    profile_picture = db.Column(db.String(256))
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Freelancer specific fields
    hourly_rate = db.Column(db.Float)
    availability = db.Column(db.String(64))
    
    # Relationships
    skills = db.relationship('Skill', secondary=user_skills, backref='users')
    freelancer_jobs = db.relationship('Job', backref='freelancer', foreign_keys='Job.freelancer_id')
    client_jobs = db.relationship('Job', backref='client', foreign_keys='Job.client_id')
    reviews_given = db.relationship('Review', backref='reviewer', foreign_keys='Review.reviewer_id')
    reviews_received = db.relationship('Review', backref='reviewee', foreign_keys='Review.reviewee_id')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role.value,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'profile_picture': self.profile_picture,
            'hourly_rate': self.hourly_rate,
            'availability': self.availability,
            'skills': [skill.name for skill in self.skills],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    category = db.Column(db.String(64))

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.Enum(JobStatus), default=JobStatus.OPEN)
    budget = db.Column(db.Float, nullable=False)
    deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    proposals = db.relationship('Proposal', backref='job')
    transactions = db.relationship('Transaction', backref='job')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'client_id': self.client_id,
            'freelancer_id': self.freelancer_id,
            'status': self.status.value,
            'budget': self.budget,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Proposal(db.Model):
    __tablename__ = 'proposals'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cover_letter = db.Column(db.Text, nullable=False)
    bid_amount = db.Column(db.Float, nullable=False)
    estimated_duration = db.Column(db.Integer)  # In days
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    freelancer = db.relationship('User', backref='proposals')

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    payee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    platform_fee = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum(TransactionStatus), default=TransactionStatus.PENDING)
    transaction_reference = db.Column(db.String(128), unique=True)
    orange_money_transaction_id = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payer = db.relationship('User', foreign_keys=[payer_id])
    payee = db.relationship('User', foreign_keys=[payee_id])

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    job = db.relationship('Job')
