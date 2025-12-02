# NListPlanet Mobile - Deployment Guide

## Backend Deployment (Render.com)

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `nlistedplanet-source/nlistplanet-mobile`

### Step 2: Configure Service
- **Name**: `nlistplanet-mobile-api`
- **Region**: Singapore (or closest to users)
- **Branch**: `main` (or `production`)
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Starter ($7/month) or Free

### Step 3: Environment Variables
Add these in Render dashboard:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32+ char random string>
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://mobile.nlistplanet.com
CORS_ORIGINS=https://nlistplanet-mobile.vercel.app
PLATFORM_FEE_PERCENTAGE=2
BOOST_PRICE=100
BOOST_DURATION_HOURS=24
MAX_COUNTER_ROUNDS=4
AFFILIATE_COMMISSION_PERCENTAGE=5
ADMIN_EMAIL=admin@nlistplanet.com
ADMIN_PASSWORD=<secure-password>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<gmail-address>
EMAIL_PASSWORD=<gmail-app-password>
EMAIL_FROM_NAME=NList Planet
EMAIL_FROM_ADDRESS=hello@nlistplanet.com
EMAIL_REPLY_TO=hello@nlistplanet.com
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (~3-5 minutes)
- Note your API URL: `https://nlistplanet-mobile-api.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import repo: `nlistedplanet-source/nlistplanet-mobile`

### Step 2: Configure Project
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add in Vercel project settings:

```
REACT_APP_API_URL=https://nlistplanet-mobile-api.onrender.com/api
CI=false
GENERATE_SOURCEMAP=false
NODE_ENV=production
```

### Step 4: Domain Setup
1. Go to Project Settings → Domains
2. Add custom domain: `mobile.nlistplanet.com`
3. Follow DNS configuration instructions
4. Add CNAME: `mobile` → `cname.vercel-dns.com`

### Step 5: Deploy
- Click "Deploy"
- Wait for build (~2-3 minutes)
- Visit your domain: `https://mobile.nlistplanet.com`

---

## Post-Deployment Checklist

### Backend Health Check
```bash
curl https://nlistplanet-mobile-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "UnlistedHub USM API is running",
  "timestamp": "2025-12-02T..."
}
```

### Frontend Health Check
1. Visit `https://mobile.nlistplanet.com`
2. Open browser console (F12)
3. Check for errors
4. Verify no CORS errors
5. Test login flow

### Database Setup
```bash
# SSH into Render service or run locally
cd backend
node scripts/createAdmin.js
```

### CORS Verification
Update backend `CORS_ORIGINS` if needed:
```
CORS_ORIGINS=https://mobile.nlistplanet.com,https://nlistplanet-mobile-*.vercel.app
```

---

## Continuous Deployment

### Auto-deploy from Git
Both Render and Vercel watch your repo:
- Push to `main` branch → auto-deploys production
- Push to `development` branch → creates preview (Vercel only)

### Manual Deploy
**Render:**
- Go to service dashboard
- Click "Manual Deploy" → "Deploy latest commit"

**Vercel:**
- Automatic on every push
- Preview deploys for PRs

---

## Monitoring

### Backend Logs (Render)
- Dashboard → Your Service → Logs
- Real-time log streaming
- Filter by severity

### Frontend Logs (Vercel)
- Project → Deployments → Click deployment → Logs
- Build logs + Function logs

### Health Monitoring
Set up UptimeRobot or similar:
- Monitor: `https://nlistplanet-mobile-api.onrender.com/api/health`
- Interval: 5 minutes
- Alert: Email/SMS on downtime

---

## Rollback

### Render
1. Dashboard → Service → "Rollback to..."
2. Select previous deployment
3. Confirm

### Vercel
1. Project → Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

---

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify `MONGODB_URI` is correct
- Ensure `JWT_SECRET` is 32+ characters

### Frontend can't connect to API
- Verify `REACT_APP_API_URL` in Vercel env vars
- Check CORS settings in backend
- Test API health endpoint directly

### Login not working
- Check backend logs for auth errors
- Verify JWT_SECRET matches
- Clear browser localStorage and retry

---

## Cost Estimate

### Free Tier (Development)
- **Render**: Free tier (sleeps after 15 min inactivity)
- **Vercel**: Free tier (100GB bandwidth/month)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0/month

### Paid Tier (Production)
- **Render**: Starter ($7/month, always on)
- **Vercel**: Pro ($20/month, better performance)
- **MongoDB Atlas**: M2 ($9/month, 2GB storage)
- **Total**: ~$36/month

---

**Last Updated:** December 2, 2025
