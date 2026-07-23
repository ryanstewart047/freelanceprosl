#!/bin/bash

echo "🚀 Starting a simplified GitHub Pages deployment process..."

# Save current directory and branch
CURRENT_DIR=$(pwd)
CURRENT_BRANCH=$(git branch --show-current)
REPO_ROOT=$(git rev-parse --show-toplevel)
FRONTEND_DIR="$REPO_ROOT/freelance_platform/frontend"
BUILD_DIR="$FRONTEND_DIR/build"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ ERROR: Frontend directory not found at $FRONTEND_DIR"
  exit 1
fi

# First, stash any changes
echo "📋 Stashing any changes..."
git stash

# Build the frontend
echo "🔨 Building the frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

# Make sure .nojekyll file exists
touch build/.nojekyll

# Switch to gh-pages branch (or create if it doesn't exist)
echo "🌿 Switching to gh-pages branch..."
cd "$REPO_ROOT"
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout --orphan gh-pages
    git rm -rf .
fi

# Clean the branch completely (except .git)
echo "🧹 Cleaning gh-pages branch..."
find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} \; 2>/dev/null || true

# Copy build files to root of gh-pages branch
echo "📋 Copying build files to gh-pages branch..."
cp -r "$BUILD_DIR"/* .
cp "$BUILD_DIR"/.nojekyll .

# Add all files and commit
echo "📝 Adding files to git..."
git add --all
git commit -m "Deploy to GitHub Pages: $(date)"

# Push to GitHub
echo "☁️ Pushing to GitHub..."
git push -f origin gh-pages

# Go back to original branch
echo "🔙 Returning to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

# Apply stashed changes if any
git stash pop 2>/dev/null || true

echo "✅ Deployment complete! Your site should be available shortly at:"
echo "https://ryanstewart047.github.io/freelanceprosl"
