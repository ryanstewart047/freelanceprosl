#!/bin/bash

# Navigate to the frontend directory
cd /Users/new/Freelance\ Web\ Application/freelance_platform/frontend

# Install gh-pages if not already installed
npm install --save-dev gh-pages

# Build and deploy the app
npm run deploy

echo "Deployment completed! Your app should be available at https://ryanstewart047.github.io/freelanceprosl/"
echo "Note: It might take a few minutes for GitHub Pages to update."
