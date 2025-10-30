# Timetable Management System - Frontend

A modern, responsive React-based frontend for the Timetable Management System. Built with React 18, Tailwind CSS, and modern development practices.

## Features

- **Modern React Architecture** with functional components and hooks
- **Responsive Design** with Tailwind CSS
- **Dark Mode Support** with theme switching
- **Authentication System** with JWT tokens
- **Real-time Data** with React Query
- **Form Management** with React Hook Form
- **Drag & Drop** for timetable management
- **Toast Notifications** for user feedback
- **Protected Routes** with role-based access
- **Comprehensive Error Handling**

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router Dom** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Query** - Server state management
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **React DnD** - Drag and drop functionality

## Project Structure

```
frontend/
├── public/                     # Public assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Basic UI components (Button, Input, etc.)
│   │   ├── Layout.js         # Main application layout
│   │   └── ProtectedRoute.js # Route protection
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.js    # Authentication context
│   │   └── ThemeContext.js   # Theme management
│   ├── pages/                # Application pages
│   │   ├── Dashboard.js      # Main dashboard
│   │   ├── Login.js          # Login page
│   │   ├── Register.js       # Registration page
│   │   ├── Teachers.js       # Teachers management
│   │   ├── Subjects.js       # Subjects management
│   │   ├── Timetables.js     # Timetable listing
│   │   └── ...               # Other pages
│   ├── services/             # API services
│   │   ├── api.js            # Axios configuration
│   │   ├── authService.js    # Authentication API
│   │   ├── crudService.js    # CRUD operations
│   │   └── timetableService.js # Timetable API
│   ├── utils/                # Utility functions
│   │   └── index.js          # Common utilities
│   ├── App.js                # Main App component
│   ├── index.js              # Application entry point
│   └── index.css             # Global styles
├── .env                       # Environment variables
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
└── README_COMPLETE.md        # This file
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on port 8000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your API URL:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Access the application**
   - Open http://localhost:3000 in your browser
   - Login with your credentials or register a new account

## Available Scripts

- **`npm start`** - Start development server
- **`npm build`** - Build for production
- **`npm test`** - Run tests
- **`npm run eject`** - Eject from Create React App (irreversible)

## Environment Variables

Key environment variables in `.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api/v1

# App Configuration
REACT_APP_NAME=Timetable Management System
REACT_APP_VERSION=1.0.0

# Environment
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# Debug
REACT_APP_DEBUG=true
```

## Features Overview

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Teacher)
- Persistent login sessions
- Secure logout with token cleanup

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Accessibility**: ARIA labels and keyboard navigation

### Data Management
- **Real-time Updates**: Automatic data synchronization with React Query
- **Form Validation**: Client-side validation with error messages
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Search & Filtering**: Find and filter data easily

### Timetable Features
- **Interactive Grid**: Visual timetable representation
- **Drag & Drop**: Move schedule entries with drag and drop
- **Conflict Detection**: Automatic conflict highlighting
- **PDF Export**: Generate PDF timetables
- **Multiple Views**: Different views for teachers, classes, and rooms

## API Integration

The frontend integrates with the FastAPI backend through:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user

### Data Management
- `GET/POST/PUT/DELETE /departments` - Department management
- `GET/POST/PUT/DELETE /teachers` - Teacher management
- `GET/POST/PUT/DELETE /subjects` - Subject management
- `GET/POST/PUT/DELETE /classes` - Class management
- `GET/POST/PUT/DELETE /rooms` - Room management

### Timetable Operations
- `POST /timetable/generate` - Generate new timetable
- `GET /timetable/{id}` - Get timetable details
- `GET /timetable/{id}/pdf` - Export PDF

## Customization

### Themes
The application supports theme customization:

```javascript
// In ThemeContext.js
const availableColors = ['blue', 'green', 'purple'];
```

### Branding
Update branding in:
- `src/App.js` - Application name
- `public/index.html` - Page title and meta
- `.env` - Application configuration

### Layout
Customize the layout in:
- `src/components/Layout.js` - Main layout structure
- `src/index.css` - Global styles and custom components

## Development Guidelines

### Component Structure
```jsx
// Functional component with hooks
import React, { useState, useEffect } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="tailwind-classes">
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

### API Service Pattern
```javascript
// services/myService.js
import api from './api';

export const myService = {
  async getAll(params = {}) {
    const response = await api.get('/endpoint', { params });
    return response.data;
  },

  async create(data) {
    const response = await api.post('/endpoint', data);
    return response.data;
  }
};
```

### Error Handling
```javascript
// Using try-catch with toast notifications
try {
  const result = await apiCall();
  toast.success('Success message');
  return result;
} catch (error) {
  toast.error(error.message || 'Something went wrong');
  throw error;
}
```

## Performance Optimization

### React Query Caching
```javascript
// 5-minute stale time, 10-minute cache time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});
```

### Code Splitting
```javascript
// Lazy loading for pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### Image Optimization
- Use appropriate image formats (WebP, AVIF)
- Implement lazy loading for images
- Compress images before deployment

## Security Considerations

- **Token Storage**: JWT tokens stored securely in localStorage
- **Route Protection**: Protected routes with role-based access
- **Input Validation**: Client-side validation with server-side verification
- **XSS Protection**: Proper input sanitization
- **CSRF Protection**: CSRF token handling

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Responsive**: Supports all screen sizes from 320px to 4K

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend is running on correct port
   - Check REACT_APP_API_URL in .env file
   - Ensure CORS is configured on backend

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check token expiration
   - Verify backend auth endpoints

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for TypeScript errors if using TS
   - Verify all imports are correct

4. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify dark mode classes

### Debug Mode
Enable debug mode by setting `REACT_APP_DEBUG=true` in `.env` for additional console logging.

## Deployment

### Production Build
```bash
npm run build
```

### Deploy to Static Hosting
```bash
# Build the app
npm run build

# Deploy to Netlify, Vercel, or similar
# Upload the 'build' folder contents
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Run tests and ensure they pass
5. Commit with descriptive messages
6. Push to your fork and submit a pull request

## License

This project is part of the Timetable Management System and follows the same licensing terms.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the backend API documentation
- Ensure all prerequisites are met
