#!/bin/bash

echo "🚀 Starting GitHub Pages deployment process..."

# Save the current directory and branch
CURRENT_DIR=$(pwd)
CURRENT_BRANCH=$(git branch --show-current)
REPO_ROOT=$(git rev-parse --show-toplevel)
BUILD_DIR="$REPO_ROOT/freelance_platform"
TEMP_DIR="/tmp/gh-pages-$(date +%s)"

echo "📋 Creating temporary directory at $TEMP_DIR..."
mkdir -p "$TEMP_DIR"

echo "📋 Building frontend assets if needed..."
# Check if we need to build the frontend
if [ -f "$BUILD_DIR/frontend/src/index.js" ] && [ -f "$BUILD_DIR/frontend/package.json" ]; then
    cd "$BUILD_DIR/frontend"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing npm dependencies..."
        npm install
    fi
    
    # Build the frontend
    echo "🔨 Building the frontend..."
    npm run build
    
    # Move build files to the temp directory
    if [ -d "build" ]; then
        echo "📋 Copying build files to temporary directory..."
        cp -r build/* "$TEMP_DIR/"
        cp -r build/.* "$TEMP_DIR/" 2>/dev/null || true
    fi
else
    # Copy existing built files if we don't need to build
    echo "📋 Copying existing build files to temporary directory..."
    cp -r "$BUILD_DIR"/* "$TEMP_DIR/"
    cp "$BUILD_DIR/.nojekyll" "$TEMP_DIR/" 2>/dev/null || touch "$TEMP_DIR/.nojekyll"
fi

# Switch to gh-pages branch or create if it doesn't exist
cd "$REPO_ROOT"
echo "🌿 Setting up gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
    # Clean all files except .git
    find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} \;
else
    git checkout --orphan gh-pages
    git rm -rf . || true
fi

# Copy the built files from the temporary directory
echo "📋 Copying files from temporary directory..."
cp -r "$TEMP_DIR"/* .
cp "$TEMP_DIR/.nojekyll" . 2>/dev/null || touch .nojekyll

# Add all files to git
echo "📝 Adding files to git..."
git add --all

# Commit the changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages: $(date)"

# Push to GitHub
echo "☁️ Pushing to GitHub..."
git push -f origin gh-pages

# Switch back to the original branch
echo "🔙 Switching back to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

# Return to the original directory
cd "$CURRENT_DIR"

echo "✅ Deployment complete! Your site should be available shortly at:"
echo "https://ryanstewart047.github.io/freelanceprosl"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to the Pages section"
echo "3. Ensure the gh-pages branch is selected as the source"
echo ""
echo "Note: It may take a few minutes for your site to be available."
