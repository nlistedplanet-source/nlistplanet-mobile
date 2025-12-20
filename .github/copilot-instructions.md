# Copilot Instructions — NListPlanet Mobile PWA

> **See [root copilot-instructions](../../.github/copilot-instructions.md) for full architecture, fee model, and backend details.**

## Mobile PWA Specifics

**Tech Stack:** React 19 + Tailwind CSS + PWA

```bash
cd nlistplanet-mobile/frontend && npm install && npm start  # Port 3001
```

## Mobile-Only Utilities (`src/utils/helpers.js`)

```javascript
// Haptic feedback
haptic.light()           // 10ms vibration
haptic.medium()          // 20ms vibration  
haptic.success()         // [10, 50, 10]ms pattern
haptic.error()           // [50, 100, 50]ms pattern
triggerHaptic('medium')  // Generic trigger

// Short number formatting
formatShortNumber(1500000)   // → "15 L"
formatShortNumber(25000000)  // → "2.5 Cr"

// Safe localStorage wrapper
storage.get('key')       // Returns parsed JSON or null
storage.set('key', obj)  // Stores as JSON string
storage.remove('key')
storage.clear()
```

## Key Pages Structure

```
src/pages/
├── auth/           # Login, Register, ForgotPassword
├── dashboard/      # User dashboard tabs
├── marketplace/    # Browse listings
├── listing/        # Create/view listings
├── trading/        # Bid management, negotiations
├── portfolio/      # Holdings tracker
├── referrals/      # Referral earnings
├── kyc/            # KYC verification
└── settings/       # User preferences
```

## Components to Keep Synced with Desktop

**Always update BOTH when modifying:**
- `ShareCardGenerator.jsx` — html2canvas investment cards
- `helpers.js` — Price calculation functions (fee logic must match)

## Firebase Push (Mobile)

```javascript
// In AuthContext.jsx after login:
import { requestNotificationPermission } from '../config/firebase';
const fcmToken = await requestNotificationPermission();
```

Service worker: `public/firebase-messaging-sw.js`
- **Frontend:** Vercel auto-deploy with preview URLs
- **Required env vars:** `MONGODB_URI`, `JWT_SECRET` (32+ chars), `FRONTEND_URL`, `CORS_ORIGINS`
- **Mobile domain:** `mobile.nlistplanet.com`

## Scripts & Automation
```bash
# Backend scripts (run from backend/)
node scripts/fetchNews.js      # Fetch news from RSS feeds (cron: every 6 hours)
node scripts/seedCompanies.js  # Seed company data
```

## Admin Routes
Admin-only endpoints require `authorize('admin')` middleware:
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id/ban` - Ban/unban users
- `POST /api/admin/companies` - Create companies
- `GET /api/admin/transactions` - All transactions

## Model Field Naming Quirk
Company model has mixed casing due to legacy data. Access both patterns:
```javascript
// In populate or queries, handle both:
company.CompanyName || company.name
company.Logo || company.logo
company.Sector || company.sector
```

## Reference Docs
- `DEPLOYMENT.md` - Deployment instructions
- `SECURITY_FEATURES.md` - Security implementation details
