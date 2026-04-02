# Architecture

## High-Level Overview
**Monorepo Full-Stack Desktop/Web App** for Smart Parking.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Electron      │    │     React/Vite   │    │   vercel.json   │
│   (Desktop)     │◄──►│   (Web/SPA)      │◄──►│   (Static Host) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌──────────────────┐
│ src/components  │◄──►│ src/api/parking   │ ── HTTP/WS ──►
│ (30+ UI)        │    │ (Fetch wrappers)  │              │
└─────────────────┘    └──────────────────┘              │
                                                         ▼
                                               ┌─────────────────┐
                                               │ backend/server  │
                                               │ (Flask 9000)    │
                                               └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ database/       │
                                               │ parking.db      │
                                               │ (SQLite)        │
                                               └─────────────────┘
```

## Frontend (React 19 + Vite)
- **Router**: React Router v7 (30+ routes: landing/user/admin).
- **State**: Context API (auth, wallet), useReducer for bookings.
- **UI**: Bootstrap/Tailwind + Framer Motion animations + Lucide icons.
- **Maps**: @react-google-maps/api + polylines/markers.
- **Charts**: Recharts/Chart.js.
- **API Calls**: `src/api/parkingApi.js` (token auth).

## Backend (Flask + SQLite)
- **Server**: ThreadingHTTPServer port 9000, CORS enabled.
- **Realtime**: SSE (`/api/sse`) broadcasts slot updates.
- **AI Chat**: Ollama integration (`/api/chat`).
- **Key Endpoints**:
  | Endpoint | Method | Auth | Description |
  |----------|--------|------|-------------|
  | `/api/slots` | GET | - | All slots |
  | `/api/book` | POST | Token | Book slot `{slot_id, amount}` |
  | `/api/wallet` | GET/POST | Token | Balance/update |
  | `/api/users` | CRUD | Admin | User mgmt |
  | `/api/register` | POST | - | Create user/admin |

## Database Schema (parking.db)
```
parking_slots: id, name, status (available/booked), vehicle_number, user_id
bookings: id, slot_id, amount, status (active/released), booked_at/released_at
users/admins: id, email, password, name, role
user_vehicles: id, user_id, name, plate, is_default
user_wallets: user_id, balance, last_topup, auto_topup
```

## Data Flow Example: Booking
1. User selects map spot → POST `/api/book` → DB update + SSE broadcast.
2. All clients (dashboards) receive SSE → Re-render slots.

## Deployment
- **Web**: `npm run build` → Vercel/Netlify.
- **Desktop**: Electron → `npm run electron`.
- **Backend**: Separate VPS/Docker (Flask + SQLite).

Scalable to PostgreSQL/IoT sensors.

See [Getting Started](../GETTING-STARTED.md).

