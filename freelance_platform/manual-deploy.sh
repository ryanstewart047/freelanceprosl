#!/bin/bash

# Navigate to frontend directory
cd /Users/new/Freelance\ Web\ Application/freelance_platform/frontend

# Build the React app
npm run build

# Create a temporary directory for deployment
mkdir -p /tmp/gh-pages-deploy

# Copy the build files to the temporary directory
cp -R build/* /tmp/gh-pages-deploy/

# Save the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Create and switch to the gh-pages branch
git checkout -b gh-pages || git checkout gh-pages

# Remove all files from the branch except .git
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} \;

# Copy the build files to the root
cp -R /tmp/gh-pages-deploy/* .

# Add all files
git add .

# Commit the changes
git commit -m "Deploy to GitHub Pages"

# Push to the gh-pages branch
git push -f origin gh-pages

# Return to the original branch
git checkout $CURRENT_BRANCH

# Clean up
rm -rf /tmp/gh-pages-deploy

echo "Deployment completed! Please check your GitHub Pages settings."
echo "Go to: https://github.com/ryanstewart047/freelanceprosl/settings/pages"
echo "Ensure 'Source' is set to 'Deploy from a branch'"
echo "Select 'gh-pages' branch and '/ (root)' folder, then save."
