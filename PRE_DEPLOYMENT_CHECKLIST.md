# ✅ Pre-Deployment Checklist

## 🔍 Configuration Check

### ✅ 1. Environment Variable
- [x] `.env.production` exists
- [ ] Verify content: Should contain `VITE_API_BASE_URL=https://worktrack-backend-a4ix.onrender.com/api`

### ✅ 2. Netlify Configuration
- [x] `netlify.toml` exists and configured
- [x] Build command: `npm install && npm run build`
- [x] Publish directory: `dist`
- [x] Redirects configured for SPA routing

### ✅ 3. Package.json
- [x] Build script: `vite build`
- [x] All dependencies listed

### ✅ 4. Git Configuration
- [ ] `.env.production` should be in `.gitignore` (already done - `.gitignore` ignores `*.local`, but `.env.production` should be committed for Netlify)
- [ ] Actually, `.env.production` CAN be committed (it's safe - no secrets, just public API URL)

### ✅ 5. Backend Configuration
- [x] Backend is live: `https://worktrack-backend-a4ix.onrender.com`
- [ ] Will need to add `FRONTEND_URL` in Render after getting Netlify URL

---

## 📝 Before Deploying to Netlify

### Option A: Use .env.production (File-based)
- ✅ File exists
- ✅ Will be used during build

### Option B: Use Netlify Environment Variables (Recommended)
- ✅ Set `VITE_API_BASE_URL` in Netlify dashboard
- ✅ This overrides `.env.production`

**Recommendation**: Use Netlify environment variables (more flexible, easier to update)

---

## 🚀 Ready to Deploy!

Once you verify `.env.production` has the correct backend URL, you're ready!

