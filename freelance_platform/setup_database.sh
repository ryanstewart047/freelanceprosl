#!/bin/bash

# Make script exit when a command fails
set -e

# Print commands before executing them
set -x

# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Initialize the database if it doesn't exist
if [ ! -f "instance/freelance_platform.db" ]; then
    echo "Creating new database..."
    mkdir -p instance
    touch instance/freelance_platform.db
fi

# Initialize migrations directory if it doesn't exist
if [ ! -d "migrations" ]; then
    echo "Initializing migrations directory..."
    flask db init
fi

# Generate migration
echo "Generating migration..."
flask db migrate -m "Apply database schema updates"

# Apply migration
echo "Applying migration..."
flask db upgrade

# Seed initial data if needed
echo "Checking if initial data needs to be seeded..."
python -c "
from app import create_app
from models import db, User, Skill
from werkzeug.security import generate_password_hash
import datetime

app = create_app()
with app.app_context():
    # Check if admin user exists
    admin = User.query.filter_by(email='admin@freelanceprosl.com').first()
    if not admin:
        print('Creating admin user...')
        admin = User(
            username='admin',
            email='admin@freelanceprosl.com',
            password_hash=generate_password_hash('adminpassword'),
            role='ADMIN',
            first_name='Admin',
            last_name='User',
            created_at=datetime.datetime.utcnow(),
            email_verified=True,
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
    
    # Check if common skills exist
    if Skill.query.count() == 0:
        print('Adding common skills...')
        skills = [
            'Web Development',
            'Mobile App Development',
            'UI/UX Design',
            'Graphic Design',
            'Content Writing',
            'Translation',
            'Digital Marketing',
            'SEO Optimization',
            'Video Editing',
            'Photography',
            'Data Entry',
            'Virtual Assistant',
            'Social Media Management',
            'Accounting',
            'Legal Services'
        ]
        
        for skill_name in skills:
            skill = Skill(name=skill_name)
            db.session.add(skill)
        
        db.session.commit()
        print('Added', len(skills), 'skills.')
"

echo "Database setup complete!"

# Deactivate virtual environment
deactivate
