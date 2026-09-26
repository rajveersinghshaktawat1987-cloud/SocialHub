# SocialHub Trading App

A modern stock trading and investing web application inspired by the feel of Grow, Angel One, and other broker dashboards.

This starter project includes:
- Real-time mock stock market updates using Socket.IO
- Buy/sell order flow
- Portfolio and positions section
- Watchlist and market overview
- News, alerts, and notifications
- Multi-language ready UI
- Dark mode UI
- Admin summary panel
- Responsive design for desktop and mobile

## Stack
- Frontend: React + Vite + Tailwind-inspired CSS
- Backend: Node.js + Express + Socket.IO
- Data: In-memory mock market data for MVP
- Auth: Simple local demo auth

## Quick start

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Open the frontend at:
   http://localhost:5173
4. Backend API runs at:
   http://localhost:4000

## API

- GET /api/health
- POST /api/auth/login
- POST /api/auth/register
- GET /api/dashboard
- GET /api/market
- GET /api/watchlist
- POST /api/watchlist
- GET /api/portfolio
- POST /api/order
- GET /api/news
- GET /api/notifications
- GET /api/admin/summary

## Notes
This is a functional MVP and is designed to be extended with real stock APIs such as Polygon.io, Finnhub, or Alpha Vantage.
