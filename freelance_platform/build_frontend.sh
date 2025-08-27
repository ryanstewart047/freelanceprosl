# Production build script for FreelancePro SL frontend
#!/bin/bash

# Exit on error
set -e

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.production file with correct API URL
cat > .env.production << EOL
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENVIRONMENT=production
EOL

# Build the React application
npm run build

echo "Frontend build completed!"
echo "Copy the contents of the 'build' directory to your Hostinger public_html folder."
