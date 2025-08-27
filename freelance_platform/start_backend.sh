#!/bin/zsh
cd "/Users/new/Freelance Web Application/freelance_platform" 
python3 -m venv venv || true
source venv/bin/activate
pip3 install -r requirements.txt
cd backend
python3 -m flask run
