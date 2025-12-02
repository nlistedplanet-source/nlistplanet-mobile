# NListPlanet Mobile - Standalone Project

Complete mobile PWA application with dedicated backend API.

## Project Structure

```
nlistplanet-mobile/
├── frontend/          # React PWA mobile app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js Express API
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
└── README.md
```

## Features

### Frontend (Mobile PWA)
- React 19.2.0 + Tailwind CSS
- Progressive Web App (installable)
- Mobile-first responsive design
- Authentication with JWT
- Real-time notifications
- Portfolio management
- Trading marketplace
- Referral system

### Backend (API)
- Node.js + Express + MongoDB
- JWT authentication
- Role-based access control
- Rate limiting & security hardening
- Email verification
- Admin dashboard APIs
- Transaction management

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Deployment

### Backend (Render.com)
1. Create new Web Service
2. Connect this repo
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`
5. Add environment variables from `backend/.env.example`

### Frontend (Vercel)
1. Import this repo
2. Framework: Create React App
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL
   - `CI`: false
   - `GENERATE_SOURCEMAP`: false

## Environment Variables

### Backend Required
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: 32+ character secret key
- `FRONTEND_URL`: Mobile app URL
- `EMAIL_USER`: SMTP email
- `EMAIL_PASSWORD`: SMTP password

### Frontend Required
- `REACT_APP_API_URL`: Backend API URL

## API Endpoints

All endpoints prefixed with `/api`:
- `/api/auth` - Authentication
- `/api/listings` - Marketplace listings
- `/api/portfolio` - User portfolio
- `/api/notifications` - Notifications
- `/api/referrals` - Referral system
- `/api/companies` - Company data
- `/api/transactions` - Transaction history
- `/api/admin` - Admin operations

## Development

### Backend
```bash
cd backend
npm run dev    # Hot-reload with nodemon
npm start      # Production mode
```

### Frontend
```bash
cd frontend
npm start      # Development server (localhost:3000)
npm run build  # Production build
```

## Tech Stack

**Frontend:**
- React 19.2.0
- React Router 7.9.6
- Tailwind CSS 3.4.18
- Axios
- Framer Motion
- React Hot Toast
- Lucide Icons

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- Nodemailer
- Helmet (security)
- Express Rate Limit

## Security Features

- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS whitelist
- Helmet security headers
- Input sanitization
- MongoDB injection prevention
- XSS protection
- CSRF protection

## License

Proprietary - NList Planet

## Support

For issues or questions, contact: hello@nlistplanet.com

---

**Last Updated:** December 2, 2025
