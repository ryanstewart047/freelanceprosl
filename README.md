# FreelancePro SL - Freelance Web Application

A modern, full-featured freelance platform connecting clients with talented professionals.

## Features

- User registration and authentication
- Freelancer profiles with portfolios
- Job posting and bidding system
- Project management tools
- Secure payment integration
- Modern, responsive UI with dark mode support
- Real-time messaging between clients and freelancers

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

## Project Structure

```
freelance_platform/
├── backend/           # Flask API
│   ├── app/           # Application modules
│   ├── migrations/    # Database migrations
│   └── run.py         # Entry point
└── frontend/          # React frontend
    ├── public/        # Static files
    └── src/           # React components and logic
        ├── api/       # API integration
        ├── components/ # Reusable components
        ├── pages/     # Page components
        └── styles/    # CSS files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
