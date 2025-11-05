# 🔧 Fix CSRF Token Issue

## Problem
- ✅ Login works
- ✅ GET requests work (employees list shows)
- ❌ POST requests fail with "CSRF Failed: CSRF token missing"

## Root Cause
CSRF token not being fetched/sent correctly for POST requests in production.

## ✅ Fix Applied

Updated `src/api/axios.js`:
1. Fixed `ensureCsrfToken()` to use `api.get('/login/')` (with correct baseURL)
2. Improved request interceptor to always fetch CSRF token before POST/PUT/DELETE/PATCH
3. Fixed retry logic to use correct API endpoint

## 📋 Next Steps

1. **Commit and push the fix:**
   ```bash
   cd worktrack-frontend
   git add src/api/axios.js
   git commit -m "Fix CSRF token fetching for production"
   git push origin main
   ```

2. **Netlify will auto-deploy** (wait 2-3 minutes)

3. **Clear browser cache/cookies** and test again:
   - Clear cookies for `zeenzeit.netlify.app`
   - Login again
   - Try creating a project





