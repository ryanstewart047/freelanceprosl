# Freelance Platform

A modern web application for freelancers and clients to connect, collaborate, and transact securely. The platform includes user profiles, job marketplace, secure payments via Orange Money, and more.

## Features

- User authentication and authorization
- Client and freelancer profiles
- Job posting and proposal system
- Freelancer discovery and search
- Project management and communication
- Secure payments with Orange Money integration
- Reviews and ratings system
- Admin panel for platform management

## Tech Stack

### Backend
- Flask (Python web framework)
- SQLAlchemy (ORM)
- Flask-JWT-Extended (Authentication)
- Flask-Migrate (Database migrations)
- SQLite/PostgreSQL (Database)

### Frontend
- React (UI library)
- React Router (Routing)
- Axios (API client)
- CSS3 (Styling)
- Font Awesome (Icons)

## Project Structure

The project follows a clear separation between frontend and backend:

```
/freelance_platform/
├── backend/                # Flask backend
│   ├── app.py              # Main application file
│   ├── config.py           # Configuration
│   ├── models.py           # Database models
│   ├── routes/             # API routes
│   └── services/           # Business logic
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── api/            # API clients
│       ├── components/     # Reusable UI components
│       ├── pages/          # Full page components
│       └── styles/         # CSS styles
│
├── requirements.txt        # Python dependencies
└── package.json            # Node.js dependencies
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. Run the development server:
   ```bash
   flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## API Documentation

The API follows RESTful design principles with the following main endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/marketplace/*` - Job and proposal endpoints
- `/api/profiles/*` - User profile endpoints
- `/api/payments/*` - Payment processing endpoints
- `/api/admin/*` - Admin panel endpoints

## Deployment

### Backend Deployment

The Flask application can be deployed using Gunicorn as a WSGI server:

```bash
gunicorn app:create_app()
```

### Frontend Deployment

Build the React application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build` folder and can be served using any static file server.

## Previewing the Application

After starting both the backend and frontend servers, you can preview the application:

1. The backend API will be available at: `http://localhost:5000`
2. The frontend interface will be available at: `http://localhost:3000`

You can access the following key pages:
- Homepage: `http://localhost:3000/`
- Marketplace: `http://localhost:3000/marketplace`
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`
- Dashboard (when logged in): `http://localhost:3000/dashboard`

### Troubleshooting "This site cannot be reached" Error

If you encounter a "This site cannot be reached" error when trying to access your application in the browser:

#### Backend Server Issues:
1. **Verify the server is running**: Check your terminal where you started the Flask server for any error messages.
2. **Confirm the correct port**: Make sure the Flask app is running on port 5000. Look for a line like `Running on http://127.0.0.1:5000/`.
3. **Check for port conflicts**: Another application might be using port 5000. You can change the port with:
   ```bash
   # For Flask
   flask run --port=5001
   ```

#### Frontend Server Issues:
1. **Verify the server is running**: Check your terminal where you started the React server for any error messages.
2. **Confirm the correct port**: The React app should be running on port 3000. Look for a line like `Local: http://localhost:3000`.
3. **Check for port conflicts**: If port 3000 is in use, React will typically ask to use a different port.

#### Network Issues:
1. **Check localhost access**: Try accessing `http://127.0.0.1:3000` instead of `http://localhost:3000`.
2. **Check firewall settings**: Ensure your firewall isn't blocking local connections.
3. **Clear browser cache**: Try clearing your browser cache or accessing the site in an incognito/private window.

#### Quick Fix Commands:
```bash
# Check if something is already using port 5000 (for macOS/Linux)
lsof -i :5000

# Check if something is already using port 3000 (for macOS/Linux)
lsof -i :3000

# Kill process using a specific port (replace PID with the actual process ID)
kill -9 PID
```

### API Testing

You can test the backend API endpoints using tools like:
- Postman
- Insomnia
- cURL
- The browser's built-in fetch API

Example API request to check if the server is running:
```bash
curl http://localhost:5000/
# Expected response: {"message":"Welcome to the Freelance Platform API"}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Orange Money API for payment processing
- Font Awesome for icons
- Google Fonts for typography
