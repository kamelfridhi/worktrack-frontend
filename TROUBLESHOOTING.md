# Troubleshooting Authentication Issues

## Problem: Getting logged out on refresh / 403 errors

### Root Cause
Session cookies aren't persisting because of origin mismatches. Browsers treat `localhost` and `127.0.0.1` as different origins.

### Solution Steps:

1. **Use `localhost` consistently everywhere**:
   - ✅ Frontend should access backend at: `http://localhost:8000`
   - ✅ Django backend should be running on: `http://localhost:8000`
   - ❌ DO NOT use `127.0.0.1` (causes cookie issues)

2. **Update your `.env` file** (create it if it doesn't exist):
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. **Clear ALL cookies** in your browser:
   - Open DevTools (F12)
   - Go to Application → Cookies
   - Delete ALL cookies for `localhost:5173` and `localhost:8000`
   - Also clear cookies for `127.0.0.1:5173` and `127.0.0.1:8000`

4. **Restart Django server**:
   ```bash
   cd WorkTrack
   python manage.py runserver
   ```
   Make sure it shows: `Starting development server at http://127.0.0.1:8000/`
   (It's fine if Django shows 127.0.0.1, but access via localhost in browser)

5. **Restart React dev server**:
   ```bash
   cd worktrack-frontend
   npm run dev
   ```

6. **Access the app via `localhost`** (NOT `127.0.0.1`):
   - ✅ Use: `http://localhost:5173`
   - ❌ Don't use: `http://127.0.0.1:5173`

7. **Test login again**

### Verify Session Cookie is Set:

1. After logging in, open DevTools (F12)
2. Go to Application → Cookies → `http://localhost:8000`
3. You should see:
   - `sessionid` - This is your session cookie
   - `csrftoken` - This is your CSRF token

4. Go to Network tab and check a POST request (e.g., creating a project):
   - Look at Request Headers
   - Should see: `Cookie: sessionid=...; csrftoken=...`
   - Should see: `X-CSRFToken: ...`

### If Still Not Working:

1. Check browser console for CORS errors
2. Verify Django is accepting requests from `http://localhost:5173`
3. Make sure `withCredentials: true` is set in axios (it is)
4. Try a different browser (Chrome, Firefox, Edge)
5. Disable browser extensions that might block cookies

### Quick Test:

After login, open browser console and run:
```javascript
document.cookie
```

You should see `sessionid` and `csrftoken` cookies listed.

