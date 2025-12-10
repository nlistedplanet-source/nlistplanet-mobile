# Unified Backend Architecture

This project now uses the **Main Backend** located in `UnlistedHub-USM/backend`.

## Setup Instructions

1.  **Backend:**
    *   Go to `UnlistedHub-USM/backend`
    *   Run `npm install`
    *   Run `npm run dev` (Starts on port 5000)

2.  **Mobile Frontend:**
    *   Go to `nlistplanet-mobile/frontend`
    *   Run `npm install`
    *   Run `npm start` (Starts on port 3000 or 3001)

## Configuration
The frontend is configured to connect to `http://localhost:5000/api` via the `.env` file.

## Deprecated
The `backend/` folder in this repository is **DEPRECATED** and should not be used. It will be removed in future updates.
