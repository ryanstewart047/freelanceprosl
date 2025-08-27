#!/bin/bash

# Make script exit when a command fails
set -e

# Print commands before executing them
set -x

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install -U pip
pip install -r requirements.txt

# Add new packages for advanced features
pip install flask-jwt-extended
pip install itsdangerous
pip install pyjwt
pip install requests
pip install flask-cors
pip install flask-migrate
pip install email-validator

# Generate requirements.txt with new dependencies
pip freeze > requirements.txt

# Deactivate virtual environment
deactivate

echo "Backend dependencies installed successfully!"

# Go back to root directory
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend

# Install npm packages
npm install

# Install additional packages for advanced features
npm install axios
npm install react-router-dom
npm install jwt-decode
npm install react-toastify
npm install react-select
npm install react-dropzone
npm install react-markdown

echo "Frontend dependencies installed successfully!"

# Go back to root directory
cd ..

echo "All dependencies installed successfully!"
