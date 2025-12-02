# NlistPlanet Mobile

A Progressive Web App (PWA) for trading unlisted shares on the go. This is the mobile companion app to the NlistPlanet desktop platform.

## Features

- **Mobile-First Design**: Optimized touch interfaces and smooth animations
- **Authentication**: Complete user registration, login, and password recovery
- **Marketplace**: Browse and search unlisted share listings
- **Trading**: Create listings, place bids/offers, and manage trades
- **Portfolio**: Track holdings and trading activity
- **KYC Verification**: Upload and manage verification documents
- **Referral System**: Earn rewards by inviting friends
- **PWA Support**: Install as native app on mobile devices
- **Offline Support**: Basic offline functionality with service worker

## Tech Stack

- React 19
- React Router DOM
- Tailwind CSS
- Axios
- Lucide Icons
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file with:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
src/
├── components/
│   ├── common/        # Shared UI components
│   └── modals/        # Modal components
├── context/           # React context providers
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Home/dashboard
│   ├── marketplace/   # Listings marketplace
│   ├── trading/       # Trading management
│   └── ...
├── utils/             # Utility functions and API
└── App.js             # Main app component
```

## Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## License

© 2025 NlistPlanet. All rights reserved.
