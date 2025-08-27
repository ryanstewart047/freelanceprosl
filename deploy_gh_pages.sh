#!/bin/bash

echo "🚀 Starting GitHub Pages deployment using npm..."

# Navigate to the frontend directory
cd "$(dirname "$0")/freelance_platform/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create .nojekyll file to prevent Jekyll processing
touch public/.nojekyll

# Deploy to GitHub Pages
echo "🔨 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment complete! Your site should be available shortly at:"
echo "https://ryanstewart047.github.io/freelanceprosl"
echo ""
echo "Note: It may take a few minutes for your site to be available."
