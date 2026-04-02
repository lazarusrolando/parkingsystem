# Getting Started

## Prerequisites

- **Node.js** v20+ ([download](https://nodejs.org))
- **Python** 3.8+ ([download](https://python.org))
- **Google Maps API Key** ([setup](https://developers.google.com/maps/documentation/javascript/get-api-key))
- **Ollama** (for AI chat): [Install](https://ollama.com) & `ollama pull qwen2.5`

## Clone & Setup

```bash
git clone https://github.com/lazarusrolando/parkingsystem.git
cd parkingsystem
```

### Frontend (React/Vite/Electron)
```bash
npm install
```

### Backend (Flask + SQLite)
```bash
pip install -r backend/requirements.txt
python database/init_db.py  # Initialize parking.db
```

## Environment Variables

Create `.env`:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Run the App

### Development
```bash
# Terminal 1: Backend
python backend/server.py  # http://localhost:9000

# Terminal 2: Frontend
npm run dev  # http://localhost:3000 (Vite)

# Or Electron Desktop
npm run electron-dev
```

### Production Build
```bash
npm run build  # Outputs to /build
npm run electron  # Production Electron app
```

## Verify Setup

- Frontend: Visit `http://localhost:3000` → Hero page loads.
- Backend: `curl http://localhost:9000/api/slots` → JSON slots.
- Maps: Booking page shows interactive map.
- Chat: AI assistant responds to parking queries.

## Troubleshooting

- Port conflicts: Vite uses 3000/3001; Backend 9000.
- Maps blank: Check API key in Console.
- Ollama errors: Ensure running & model pulled.
- DB issues: Re-run `python database/init_db.py`.

See [Components Overview](./COMPONENTS-OVERVIEW.md), [Architecture](./ARCHITECTURE.md).

