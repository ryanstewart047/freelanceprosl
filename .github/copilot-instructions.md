# FreelancePro SL - Coding Agent Instructions

## Project Overview
FreelancePro SL is a full-stack freelance platform built with a React frontend and Flask backend. The application connects clients with talented professionals in Sierra Leone, featuring job posting, freelancer profiles, messaging, and payment integration.

## Architecture

### Frontend (React)
- **Routing**: Uses `HashRouter` for GitHub Pages compatibility
- **State Management**: React hooks for local state
- **API Communication**: Axios with centralized API setup in `/src/api/index.js`
- **Styling**: CSS3 with custom variables for theming and dark mode support
- **Authentication**: JWT-based with token refresh handled in API interceptors

### Backend (Flask)
- **Database**: SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **API Structure**: Modular route definitions in `/backend/routes/`
- **Payment Processing**: Mobile money integration via custom services

## Key Workflows

### Development
1. Start backend: `cd freelance_platform && ./start_backend.sh`
2. Start frontend: `cd freelance_platform && ./start_frontend.sh`

### Deployment
- GitHub Pages deployment: `cd freelance_platform && ./deploy.sh`
- Manual deployment: `cd freelance_platform && ./manual-deploy.sh`

## Important Patterns

### Component Structure
- Page components in `/src/pages/`
- Reusable UI components in `/src/components/`
- Layout follows container pattern with responsive design

### API Integration
```javascript
// Example API call pattern from /src/api/marketplace.js
export const getJobs = async (params = {}) => {
  try {
    const response = await api.get('/api/jobs', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
```

### Authentication Flow
- Login/register via `/api/auth/` endpoints
- Token storage in localStorage
- Protected routes check auth state

### CSS Conventions
- Global variables in `main.css` (colors, spacing, shadows)
- Component-specific styles in dedicated CSS files
- Mobile-first responsive design with media queries
- Dark mode via `[data-theme="dark"]` selectors

## Critical Files
- `/src/App.js` - Main routing and app structure
- `/src/api/index.js` - API client configuration with interceptors
- `/backend/app.py` - Flask app initialization
- `/backend/models.py` - Database schema
- `/src/styles/main.css` - Global styles and variables

## Common Gotchas
- GitHub Pages requires HashRouter instead of BrowserRouter
- API calls must handle both auth and non-auth states
- Mobile views need special attention for auth buttons and card layouts
