# Quick Start Guide

## Prerequisites

1. Node.js 18+ installed
2. Django backend running at `http://127.0.0.1:8000`

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (if not exists):
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

5. **Login:**
   - Use your Django admin credentials
   - The app will authenticate via Django's session system

## Testing the App

### 1. Create an Employee
- Navigate to Employees page
- Click "Add Employee"
- Fill in the form and submit

### 2. Create a Project
- Navigate to Projects page
- Click "Add Project"
- Fill in project details and date

### 3. Assign Employee to Project
- Go to Project Details
- Click "Add Employee"
- Select employee and enter hours

### 4. View Dashboard
- Go to Dashboard
- See all projects on the calendar
- Click on projects to view details

### 5. Export PDF Report
- Go to Employee Details
- Click "Download Monthly Report"
- PDF will download automatically

## Troubleshooting

### Login Issues
- Ensure Django backend is running
- Check CORS settings in Django
- Verify credentials in Django admin

### API Errors
- Check `.env` file has correct API URL
- Verify Django backend is accessible
- Check browser console for errors

### Build Errors
- Run `npm install` again
- Clear node_modules and reinstall
- Check Node.js version (should be 18+)

## Production Build

```bash
npm run build
```

Output will be in `dist/` directory, ready to deploy to any static host.

