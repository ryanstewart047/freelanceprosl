#!/bin/bash

# Deploy to GitHub Pages Script for FreelancePro SL
# This script automates the process of deploying the React frontend to GitHub Pages

echo "🚀 Starting GitHub Pages deployment process..."

# Navigate to the frontend directory
cd frontend

# Check if frontend directory exists
if [ ! -d "$(pwd)" ]; then
    echo "❌ Error: frontend directory not found."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the React application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Error: Build failed. Check for errors in the build process."
    exit 1
fi

echo "🔄 Creating temporary directory for deployment..."
# Create a temp directory for the build files
mkdir -p ../temp_deploy

# Copy build files to temp directory
cp -r build/* ../temp_deploy/

# Create or switch to gh-pages branch
echo "🌿 Setting up gh-pages branch..."
cd ..
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages

# Remove existing files (except .git and temp_deploy)
find . -maxdepth 1 ! -name '.git' ! -name 'temp_deploy' ! -name '.' -exec rm -rf {} \;

# Move files from temp directory to root
cp -r temp_deploy/* .

# Remove temp directory
rm -rf temp_deploy

# Create a .nojekyll file to bypass Jekyll processing
touch .nojekyll

# Create a CNAME file if you have a custom domain
# echo "your-custom-domain.com" > CNAME

echo "📝 Adding files to git..."
git add .

echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages: $(date)"

echo "☁️ Pushing to GitHub..."
git push origin gh-pages

echo "🔙 Switching back to main branch..."
git checkout main

echo "✅ Deployment complete! Your site should be available shortly at:"
echo "https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')"

# Instructions for custom domain if needed
echo ""
echo "📋 NEXT STEPS:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to the Pages section"
echo "3. Ensure the gh-pages branch is selected as the source"
echo "4. If you want to use a custom domain, configure it in the Custom domain section"
echo ""
echo "Note: It may take a few minutes for your site to be available."
