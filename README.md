# FreelancePro SL - Freelance Web Application

A modern, full-featured freelance platform connecting clients with talented professionals.

## Features

- User registration and authentication
- Freelancer profiles with portfolios
- Job posting and bidding system
- Project management tools
- Secure payment integration with mobile money support
- Modern, responsive UI with dark mode support
- Real-time messaging between clients and freelancers
- Email notifications for important events

## Technology Stack

### Backend
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Migrate
- Flask-CORS

### Frontend
- React
- React Router
- Axios
- CSS3 with custom variables for theming
- Font Awesome icons

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.8+
- pip

### Installation

1. Clone the repository
```
git clone https://github.com/ryanstewart047/freelanceprosl.git
cd freelanceprosl
```

2. Set up the backend
```
cd freelance_platform/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

3. Set up the frontend
```
cd ../frontend
npm install
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Deployment to Production

FreelancePro SL can be deployed to Hostinger or similar hosting providers. The application is designed to work in both shared hosting and VPS environments.

### Prerequisites for Production
- A Hostinger account (or similar hosting provider)
- Domain name configured with DNS
- SSH access to your hosting account

### Deployment Options

#### 1. GitHub Pages Deployment

GitHub Pages offers a free and easy way to deploy the frontend of the application:

```bash
# Navigate to the project root
cd freelance_platform

# Make the GitHub Pages deployment script executable
chmod +x deploy_to_github_pages.sh

# Run the deployment script
./deploy_to_github_pages.sh
```

Alternatively, you can manually deploy to GitHub Pages:

```bash
# Build the React frontend
cd frontend
npm run build

# Create a branch for GitHub Pages if it doesn't exist
git checkout -b gh-pages

# Copy build files to the root of gh-pages branch
cp -r build/* ../

# Add and commit the files
git add .
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
git push origin gh-pages
```

Then configure your repository settings to serve from the gh-pages branch.

#### 2. Automatic Deployment to Hostinger

The repository includes a deployment script that automates most of the process:

```bash
# Make the script executable
chmod +x freelance_platform/deploy_to_hostinger.sh

# Run the deployment script
cd freelance_platform
./deploy_to_hostinger.sh --username your-hostinger-username \
                          --server your-server.hostinger.com \
                          --domain your-domain.com
```

#### 3. Manual Deployment

For manual deployment, follow these steps:

1. **Build the frontend:**
```bash
cd freelance_platform/frontend
npm run build
```

2. **Upload frontend files:**
   - Upload the contents of the `build` directory to your Hostinger `public_html` folder

3. **Configure the backend:**
   - Create a Python virtual environment on your server
   - Install required packages: `pip install -r requirements.txt gunicorn`
   - Configure environment variables in `.env` file
   - Set up a database and run migrations

4. **Start the backend server:**
   - Using Gunicorn: `gunicorn -c gunicorn_config.py wsgi:app`

### SSL Configuration

For secure HTTPS connections, you should enable SSL for both your main domain and API subdomain. Hostinger provides free SSL certificates through Let's Encrypt in their control panel.

### GitHub Pages Configuration

When deploying to GitHub Pages, keep in mind:

1. **HashRouter**: The application already uses HashRouter for React Router, which is compatible with GitHub Pages.

2. **API Configuration**: Update the API URL in your frontend config to point to your backend server:
   ```javascript
   // In frontend/src/api/index.js
   const API_BASE_URL = process.env.NODE_ENV === 'production'
     ? 'https://your-backend-api.com/api'
     : 'http://localhost:5000/api';
   ```

3. **Environment Variables**: Create a `.env.production` file in the frontend directory with your production settings:
   ```
   REACT_APP_API_URL=https://your-backend-api.com/api
   REACT_APP_ENVIRONMENT=production
   ```

4. **Custom Domain (Optional)**: If you want to use a custom domain:
   - Add a CNAME file to the `public` folder with your domain name
   - Configure your domain's DNS settings with a CNAME record pointing to `username.github.io`
   - Enable HTTPS in your GitHub repository settings

### Database Configuration

1. Create a MySQL database in Hostinger control panel
2. Update your `.env` file with the database connection string:
```
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```

## Project Structure

```
freelance_platform/
├── backend/               # Flask API
│   ├── app/               # Application modules
│   ├── migrations/        # Database migrations
│   └── run.py             # Entry point
├── frontend/              # React frontend
│   ├── public/            # Static files
│   └── src/               # React components and logic
│       ├── api/           # API integration
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       └── styles/        # CSS files
├── deploy_to_hostinger.sh # Hostinger deployment script
├── deploy_to_github_pages.sh # GitHub Pages deployment script
└── setup_database.sh      # Database setup script
```

## Production Best Practices

When deploying FreelancePro SL to production, follow these best practices:

### Security
- Use HTTPS only; redirect HTTP to HTTPS
- Configure proper CORS settings for API requests
- Store secrets in environment variables, never in code
- Implement rate limiting for API endpoints
- Keep dependencies updated regularly

### Performance
- Enable gzip compression on your server
- Configure proper caching headers
- Use a CDN for static assets
- Optimize database queries with proper indexing
- Implement database connection pooling

### Monitoring
- Set up logging for both frontend and backend
- Implement error tracking (like Sentry)
- Set up uptime monitoring for your production site
- Configure database backup automation

### Mobile Money Integration
- Test mobile money integration thoroughly in production
- Configure webhook URLs correctly for payment callbacks
- Set up proper error handling for failed transactions
- Implement transaction logging for auditing purposes

### Dark Mode Support
- The application features comprehensive dark mode support across all pages
- Dark mode is implemented using CSS variables and the `[data-theme="dark"]` attribute
- Users can toggle dark mode via the floating toggle button in the top-right corner
- Dark mode preference is saved in localStorage for persistence across sessions
- Dark mode styles for cards and UI elements maintain contrast and readability
- Each component (sliders, cards, buttons) has specific dark mode overrides

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
