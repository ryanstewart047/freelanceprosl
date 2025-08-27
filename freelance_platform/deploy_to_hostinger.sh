#!/bin/bash
# Deployment script for FreelancePro SL to Hostinger

# Exit on error
set -e

# Display usage information
show_usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -h, --help                 Show this help message"
  echo "  -u, --username USERNAME    Hostinger SSH username"
  echo "  -s, --server SERVER        Hostinger server address"
  echo "  -p, --port PORT            SSH port (default: 22)"
  echo "  -d, --domain DOMAIN        Your domain name"
  echo "  -b, --backend-only         Deploy only the backend"
  echo "  -f, --frontend-only        Deploy only the frontend"
}

# Default values
SSH_PORT=22
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_usage
      exit 0
      ;;
    -u|--username)
      SSH_USER="$2"
      shift 2
      ;;
    -s|--server)
      SSH_SERVER="$2"
      shift 2
      ;;
    -p|--port)
      SSH_PORT="$2"
      shift 2
      ;;
    -d|--domain)
      DOMAIN="$2"
      shift 2
      ;;
    -b|--backend-only)
      DEPLOY_BACKEND=true
      DEPLOY_FRONTEND=false
      shift
      ;;
    -f|--frontend-only)
      DEPLOY_BACKEND=false
      DEPLOY_FRONTEND=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

# Check required parameters
if [[ -z "$SSH_USER" || -z "$SSH_SERVER" || -z "$DOMAIN" ]]; then
  echo "Error: Missing required parameters"
  show_usage
  exit 1
fi

# Display deployment information
echo "==============================================="
echo "FreelancePro SL Deployment to Hostinger"
echo "==============================================="
echo "SSH User: $SSH_USER"
echo "SSH Server: $SSH_SERVER"
echo "SSH Port: $SSH_PORT"
echo "Domain: $DOMAIN"
echo "Deploy Backend: $DEPLOY_BACKEND"
echo "Deploy Frontend: $DEPLOY_FRONTEND"
echo "==============================================="
echo "Press Enter to continue or Ctrl+C to abort..."
read

# Create production build of the frontend
if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
  echo "Building frontend production assets..."
  
  # Update API URL in environment file
  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://api.$DOMAIN|g" frontend/.env.production
  
  # Build frontend
  cd frontend
  npm install
  npm run build
  cd ..
  
  echo "Frontend build completed."
fi

# Prepare backend for deployment
if [[ "$DEPLOY_BACKEND" == "true" ]]; then
  echo "Preparing backend for deployment..."
  
  # Create requirements.txt file if it doesn't exist
  if [[ ! -f requirements.txt ]]; then
    echo "Creating requirements.txt..."
    pip freeze > requirements.txt
  fi
  
  # Update Gunicorn config with correct paths
  sed -i "s|/home/username|/home/$SSH_USER|g" gunicorn_config.py
  
  echo "Backend preparation completed."
fi

# Create deployment package
echo "Creating deployment package..."
TIMESTAMP=$(date +%Y%m%d%H%M%S)
DEPLOY_DIR="deploy_$TIMESTAMP"

mkdir -p "$DEPLOY_DIR"

if [[ "$DEPLOY_BACKEND" == "true" ]]; then
  # Copy backend files
  mkdir -p "$DEPLOY_DIR/backend"
  cp -r backend "$DEPLOY_DIR/"
  cp wsgi.py "$DEPLOY_DIR/"
  cp gunicorn_config.py "$DEPLOY_DIR/"
  cp requirements.txt "$DEPLOY_DIR/"
  cp .env.example "$DEPLOY_DIR/.env"
  
  # Update .env file with production settings
  sed -i "s|FLASK_ENV=development|FLASK_ENV=production|g" "$DEPLOY_DIR/.env"
  sed -i "s|DEBUG=True|DEBUG=False|g" "$DEPLOY_DIR/.env"
  sed -i "s|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=https://$DOMAIN|g" "$DEPLOY_DIR/.env"
  sed -i "s|API_URL=http://localhost:5000|API_URL=https://api.$DOMAIN|g" "$DEPLOY_DIR/.env"
fi

if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
  # Copy frontend build
  mkdir -p "$DEPLOY_DIR/frontend_build"
  cp -r frontend/build/* "$DEPLOY_DIR/frontend_build/"
fi

# Create deployment scripts
cat > "$DEPLOY_DIR/setup_backend.sh" << EOL
#!/bin/bash
# Backend setup script on Hostinger

# Create directories
mkdir -p ~/logs
mkdir -p ~/run

# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Initialize the database
export FLASK_APP=wsgi.py
flask db init || echo "Database already initialized"
flask db migrate -m "Production migration"
flask db upgrade

# Create a systemd service file (if allowed by Hostinger)
cat > ~/freelanceprosl.service << EOF
[Unit]
Description=FreelancePro SL Gunicorn Daemon
After=network.target

[Service]
User=$SSH_USER
Group=$SSH_USER
WorkingDirectory=/home/$SSH_USER/freelanceprosl
ExecStart=/home/$SSH_USER/freelanceprosl/venv/bin/gunicorn -c gunicorn_config.py wsgi:app
ExecReload=/bin/kill -s HUP \$MAINPID
ExecStop=/bin/kill -s TERM \$MAINPID

[Install]
WantedBy=multi-user.target
EOF

echo "Backend setup completed."
echo "To start the backend service:"
echo "1. For systemd (if supported): sudo cp ~/freelanceprosl.service /etc/systemd/system/ && sudo systemctl enable freelanceprosl && sudo systemctl start freelanceprosl"
echo "2. Without systemd: nohup venv/bin/gunicorn -c gunicorn_config.py wsgi:app &"
EOL

# Create .htaccess for frontend
cat > "$DEPLOY_DIR/frontend_build/.htaccess" << EOL
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
EOL

# Create instructions file
cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << EOL
# FreelancePro SL Deployment Instructions

## Backend Deployment (api.$DOMAIN)

1. Upload the backend files to your server:
   \`\`\`
   ssh $SSH_USER@$SSH_SERVER -p $SSH_PORT "mkdir -p ~/freelanceprosl"
   scp -P $SSH_PORT -r backend wsgi.py gunicorn_config.py requirements.txt .env setup_backend.sh $SSH_USER@$SSH_SERVER:~/freelanceprosl/
   \`\`\`

2. SSH into your server:
   \`\`\`
   ssh $SSH_USER@$SSH_SERVER -p $SSH_PORT
   \`\`\`

3. Navigate to your application directory:
   \`\`\`
   cd ~/freelanceprosl
   \`\`\`

4. Make the setup script executable and run it:
   \`\`\`
   chmod +x setup_backend.sh
   ./setup_backend.sh
   \`\`\`

5. Configure your domain in Hostinger control panel:
   - Create a subdomain "api.$DOMAIN"
   - Point it to the directory where your backend is installed

## Frontend Deployment ($DOMAIN)

1. Upload the frontend build to your server:
   \`\`\`
   ssh $SSH_USER@$SSH_SERVER -p $SSH_PORT "mkdir -p ~/public_html"
   scp -P $SSH_PORT -r frontend_build/* .htaccess $SSH_USER@$SSH_SERVER:~/public_html/
   \`\`\`

2. Configure your domain in Hostinger control panel:
   - Point your main domain to the public_html directory

## SSL Configuration

1. Use Hostinger's SSL/TLS manager to enable HTTPS for both your main domain and API subdomain.

## Database Configuration

1. Create a MySQL database in Hostinger control panel
2. Update your .env file with the database connection string:
   \`\`\`
   DATABASE_URL=mysql://username:password@localhost:3306/database_name
   \`\`\`

## Troubleshooting

If your application doesn't work after deployment, check:
1. The backend logs: \`cat ~/logs/gunicorn-error.log\`
2. Make sure your .env file is properly configured
3. Ensure the API URL in the frontend is correct (check the Network tab in browser DevTools)
4. Verify that your database is properly set up and migrations are applied
EOL

chmod +x "$DEPLOY_DIR/setup_backend.sh"

echo "Deployment package created: $DEPLOY_DIR"

# Deploy if requested
if [[ "$DEPLOY_BACKEND" == "true" || "$DEPLOY_FRONTEND" == "true" ]]; then
  echo "Deploying to Hostinger..."
  
  if [[ "$DEPLOY_BACKEND" == "true" ]]; then
    echo "Deploying backend..."
    
    # Create directory on server
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_SERVER" "mkdir -p ~/freelanceprosl"
    
    # Upload backend files
    scp -P "$SSH_PORT" -r "$DEPLOY_DIR/backend" "$DEPLOY_DIR/wsgi.py" "$DEPLOY_DIR/gunicorn_config.py" "$DEPLOY_DIR/requirements.txt" "$DEPLOY_DIR/.env" "$DEPLOY_DIR/setup_backend.sh" "$SSH_USER@$SSH_SERVER:~/freelanceprosl/"
    
    echo "Backend files uploaded."
  fi
  
  if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
    echo "Deploying frontend..."
    
    # Create directory on server
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_SERVER" "mkdir -p ~/public_html"
    
    # Upload frontend files
    scp -P "$SSH_PORT" -r "$DEPLOY_DIR/frontend_build/"* "$DEPLOY_DIR/frontend_build/.htaccess" "$SSH_USER@$SSH_SERVER:~/public_html/"
    
    echo "Frontend files uploaded."
  fi
  
  echo "Deployment to Hostinger completed."
  echo "Please follow the instructions in $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md to finalize the setup."
else
  echo "Deployment package created but not deployed."
  echo "To deploy manually, follow the instructions in $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md"
fi
