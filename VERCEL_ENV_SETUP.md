# Vercel Environment Variables Setup (Mobile App)

## 🚨 CRITICAL: Set These Environment Variables on Vercel

Since we're now using **unified backend** (mobile backend is suspended), the mobile app must point to the desktop backend.

### Steps to Fix Login Issue:

1. **Go to Vercel Dashboard:**
   - Open: https://vercel.com/
   - Select project: `nlistplanet-mobile` (or whatever name you gave it)

2. **Go to Settings → Environment Variables:**
   - Click on "Settings" tab
   - Click on "Environment Variables" in sidebar

3. **Add/Update These Variables:**

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `REACT_APP_API_URL` | `https://nlistplanet-usm-api.onrender.com/api` | Production |
   | `CI` | `false` | Production |
   | `GENERATE_SOURCEMAP` | `false` | Production |
   | `NODE_ENV` | `production` | Production |

4. **IMPORTANT:** After adding variables:
   - Click **"Redeploy"** button
   - OR push a new commit to trigger auto-deploy

### ✅ How to Verify:

After redeployment, open browser console (F12) on https://mobile.nlistplanet.com and check:

```
🌐 API Base URL: https://nlistplanet-usm-api.onrender.com/api
🔧 Environment: production
```

If you see `http://localhost:5000/api`, then environment variables are NOT set properly on Vercel.

### 🔧 Alternative: Deploy with Updated Settings

If variables are set but still not working, try:

```bash
cd nlistplanet-mobile/frontend
vercel --prod
```

This will deploy with your local `.env.production` file.

---

## Backend CORS Configuration (Already Done)

The unified backend (`https://nlistplanet-usm-api.onrender.com`) already has:

```javascript
// Allowed origins include:
'https://mobile.nlistplanet.com',
'https://nlistplanet.com',
'https://www.nlistplanet.com'
```

So CORS should work once the correct API URL is being used.
