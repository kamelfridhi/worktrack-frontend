# 📤 Push Frontend to GitHub - Step by Step

## ✅ Prerequisites
- ✅ GitHub repository created: `https://github.com/kamelfridhi/worktrack-frontend.git`
- ✅ You're in the `worktrack-frontend` directory

---

## 🚀 Commands to Run

### Step 1: Navigate to frontend directory
```bash
cd worktrack-frontend
```

### Step 2: Initialize Git (if not already done)
```bash
git init
```

### Step 3: Add all files
```bash
git add .
```

### Step 4: Commit
```bash
git commit -m "Initial commit: React frontend for WorkTrack"
```

### Step 5: Set main branch and add remote
```bash
git branch -M main
git remote add origin https://github.com/kamelfridhi/worktrack-frontend.git
```

### Step 6: Push to GitHub
```bash
git push -u origin main
```

---

## ⚠️ If you get "remote already exists" error:

Remove the existing remote first:
```bash
git remote remove origin
git remote add origin https://github.com/kamelfridhi/worktrack-frontend.git
git push -u origin main
```

---

## ✅ After Pushing

Once pushed successfully, proceed to Netlify deployment (see `FRONTEND_DEPLOYMENT.md`)





