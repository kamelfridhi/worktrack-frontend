# WorkTrack Frontend - ZeenAlZein

A modern, responsive React frontend for the WorkTrack employee and project management system.

## Features

- 🔐 **Admin Authentication** - Secure login with Django session-based auth
- 📅 **Calendar Dashboard** - Visual monthly calendar view of all projects
- 📁 **Project Management** - Full CRUD operations for projects
- 👥 **Employee Management** - Complete employee management with details
- ⏱️ **Hours Tracking** - Track employee hours per project
- 📊 **Reports & Statistics** - View system-wide statistics
- 📄 **PDF Export** - Download monthly employee reports as PDF
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **React Big Calendar** - Calendar component
- **Heroicons** - Beautiful SVG icons

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Update the URL if your Django backend is running on a different host/port.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory, ready for deployment to Netlify, Vercel, or any static hosting service.

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with auth configuration
├── components/
│   ├── Navbar.jsx            # Top navigation bar
│   ├── Sidebar.jsx           # Side navigation (desktop + mobile)
│   └── ProtectedRoute.jsx    # Route protection component
├── context/
│   └── AuthContext.jsx       # Authentication context provider
├── hooks/
│   └── useAuth.js            # Custom auth hook
├── pages/
│   ├── Login.jsx             # Login page
│   ├── Dashboard.jsx         # Calendar dashboard
│   ├── Projects.jsx          # Projects list page
│   ├── ProjectDetails.jsx    # Project details with employees
│   ├── Employees.jsx         # Employees list page
│   ├── EmployeeDetails.jsx   # Employee details with projects
│   └── Reports.jsx           # Statistics and reports
├── App.jsx                   # Main app component with routing
├── main.jsx                  # App entry point
└── index.css                 # Global styles and Tailwind imports
```

## Pages Overview

### Dashboard (`/dashboard`)
- Monthly calendar view of all projects
- Navigate between months
- Click on a project to view details
- Click on a date to create a new project

### Projects (`/projects`)
- List all projects for selected month/year
- Create, edit, and delete projects
- Filter by month and year
- Click on a project card to view details

### Project Details (`/projects/:id`)
- View project information
- See all assigned employees with hours
- Add employees to project
- Update employee hours
- Remove employees from project

### Employees (`/employees`)
- List all employees
- Create, edit, and delete employees
- View employee information (name, phone, role, hourly rate)
- Click on an employee card to view details

### Employee Details (`/employees/:id`)
- View employee information
- See all projects worked on
- View total hours for current month
- Download monthly PDF report

### Reports (`/reports`)
- View system-wide statistics
- Filter by month and year
- See total employees, projects, and hours
- View calculated averages

## Authentication

The app uses Django's session-based authentication. The login process:

1. User enters username and password
2. App fetches CSRF token from Django admin login page
3. Sends login credentials to Django admin endpoint
4. On success, sets authentication state
5. All API requests include session credentials via cookies

**Note:** Make sure your Django backend has CORS configured to allow credentials from your frontend domain.

## API Integration

All API calls are made through the centralized Axios instance in `src/api/axios.js`. It automatically:

- Includes CSRF tokens in requests
- Handles authentication errors
- Redirects to login on 401 errors
- Sets base URL from environment variables

## Deployment

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard:
   - `VITE_API_BASE_URL` - Your Django backend API URL

### Vercel

1. Connect your Git repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`

### Other Static Hosting

1. Run `npm run build`
2. Upload the `dist` folder to your hosting service
3. Configure environment variables if your host supports them

## CORS Configuration

Ensure your Django backend allows requests from your frontend domain:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "https://your-frontend-domain.com",  # Production domain
]
CORS_ALLOW_CREDENTIALS = True
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the ZeenAlZein WorkTrack system.
