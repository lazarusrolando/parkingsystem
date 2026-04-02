# Smart Parking System

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-7-green)](https://vitejs.dev)
[![Electron](https://img.shields.io/badge/Electron-40-yellow)](https://electronjs.org)

A comprehensive **Smart Parking Management System** built with React 19, Vite, and Electron. Features user & admin dashboards, real-time map-based parking spot booking, digital wallet, analytics, and more.

## ✨ Features

### User Features

- **Interactive Map Booking**: Google Maps integration for real-time spot selection & polyline visualization
- **Digital Wallet**: Top-up, UPI/Credit/Debit payments
- **My Bookings & History**: Track past and active bookings
- **Vehicle Management**: Add/manage vehicles
- **User Dashboard**: Personalized overview

### Admin Features

- **Admin Dashboard**: Complete system overview
- **User Management**: View/manage users & details
- **Revenue Analytics**: Charts with Chart.js/Recharts
- **System Logs**: Monitor activities
- **Parking Slot Management**: Smart parking slots (IoT integration ready)

### General

- **Landing Pages**: Hero, Features, Pricing, FAQ, Blog, HowItWorks
- **Support**: HelpDesk, Support Tickets
- **Responsive Design**: Bootstrap + Tailwind CSS + Framer Motion animations
- **Auth**: Login/Register/Forgot Password
- **Error Handling**: Global ErrorBoundary
- **Notifications**: Toast system
- **Desktop App**: Electron support
- **PDF Export**: jsPDF integration

## 🛠 Tech Stack

- **Frontend**: React 19, React Router 7
- **Build**: Vite 7
- **Desktop**: Electron 40
- **Maps**: @react-google-maps/api, @googlemaps/react-wrapper
- **Charts**: Chart.js, Recharts
- **UI**: Bootstrap 5, Tailwind CSS 4, Framer Motion, Lucide React icons
- **Payments**: UPI, Credit/Debit forms (frontend)
- **Other**: jsPDF, Styled Components

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Google Maps API key (for map features)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev    # Web: http://localhost:3000
npm run start  # Alias for dev
```

### Electron Desktop

```bash
npm run electron-dev  # Web + Electron
npm run electron      # Production Electron
```

### Build

```bash
npm run build    # Web build to /build
```

## 📁 Project Structure

```plaintext
src/
├── App.js              # Main router (30+ routes)
├── components/         # All pages/components
│   ├── Hero.js        # Landing
│   ├── Booking.js     # Core booking + map
│   ├── MapView.js     # Map visualization
│   ├── Wallet.js      # Payments
│   ├── AdminDashboard.js
│   ├── UserDashboard.js
│   ├── Analytics.js
│   └── ... (28 more)
└── utils/
    └── notificationUtils.js
```

## 🌐 Deployment

- **Vercel**: `vercel.json` configured
- **Static**: `npm run build` → `/build`

## ⚙️ Python backend + SQLite (new)

1. Initialize SQLite database from the repo root:

```bash
python database/init_db.py
```

2. Start backend server:

```bash
python backend/server.py
```

3. Default endpoints:

- `GET /api/slots` - list all slots
- `GET /api/slots/available` - list available slots
- `GET /api/slots/booked` - list booked slots
- `GET /api/slots/{id}` - get slot by ID
- `GET /api/bookings` - list bookings
- `GET /api/bookings?active=true` - list active bookings
- `GET /api/bookings?status=released` - list released bookings
- `POST /api/book` - body `{slot_id, vehicle_number, user_id?, amount?}`
- `POST /api/release` - body `{slot_id}`
- `POST /api/create-slot` - body `{name}`
- `POST /api/update-slot` - body `{slot_id, name?, status?, vehicle_number?, user_id?}`
- `POST /api/cancel-booking` - body `{booking_id}`
- `POST /api/init-db` - initialize DB (same as init script)

4. Client realtime event subscription:

```js
const es = new EventSource('http://localhost:9000/api/sse');
es.addEventListener('slot_updated', (e) => console.log('slot update', JSON.parse(e.data)));
```

## 🔧 Environment Variables

```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

## Recent Updates

- Fixed polyline accumulation in Booking/MapView (multi-selection cleanup)

## 📄 Full Documentation

See [docs/](./docs/) folder for:

- [Getting Started](./docs/GETTING-STARTED.md)
- [Components Overview](./docs/COMPONENTS-OVERVIEW.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)

## 🤝 Contributing

1. Fork & clone
2. `npm install`
3. `npm run dev`
4. Create PR

## 📞 Support

- [HelpDesk](./src/components/HelpDesk.jsx)
- [SupportTicket](./src/components/SupportTicket.jsx)

### Built with ❤️ for smart urban mobility
