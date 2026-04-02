# Components Overview

## Core Structure
Single-page React app with React Router (~30 routes). Components modularized by feature.

## Landing Pages (Marketing)
| Component | Path | Description |
|-----------|------|-------------|
| [Hero](./src/components/Hero.jsx) | `/` | Animated hero with CTA buttons |
| [Features](./src/components/Features.jsx) | `/features` | Feature cards + icons |
| [Pricing](./src/components/Pricing.jsx) | `/pricing` | Tiered plans (Free/Premium) |
| [HowItWorks](./src/components/HowItWorks.jsx) | `/how-it-works` | Step-by-step workflow |
| [FAQ](./src/components/FAQ.jsx) | `/faq` | Accordion FAQs |
| [Blog](./src/components/Blog.jsx) | `/blog` | Static blog posts |
| [Contact](./src/components/Contact.jsx) | `/contact` | Form + map |

## User Features
| Component | Path | Key Props/Features |
|-----------|------|--------------------|
| [UserDashboard](./src/components/UserDashboard.jsx) | `/dashboard` | Wallet balance, active bookings, quick actions |
| [Vehicles](./src/components/Vehicles.jsx) | `/vehicles` | Add/edit vehicles, set default |
| [Wallet](./src/components/Wallet.jsx) | `/wallet` | Top-up (UPI/Card), transaction history |
| [MyBookings](./src/components/MyBookings.jsx) | `/bookings` | Active/upcoming list + cancel |
| [History](./src/components/History.jsx) | `/history` | Past bookings, stats, PDF export |
| [Booking](./src/components/Booking.jsx) | `/booking` | **Core**: Map + polyline + timer + pay |

## Admin Features
| Component | Path | Key Props/Features |
|-----------|------|--------------------|
| [AdminDashboard](./src/components/AdminDashboard.jsx) | `/admin` | Revenue, slots overview, users count |
| [UserManagement](./src/components/UserManagement.jsx) | `/admin/users` | Table + search + details modal |
| [Analytics](./src/components/Analytics.jsx) | `/admin/analytics` | Charts (Recharts/Chart.js): Revenue, occupancy |
| [Revenue](./src/components/Revenue.jsx) | `/admin/revenue` | Daily/weekly breakdowns |
| [SystemLogs](./src/components/SystemLogs.jsx) | `/admin/logs` | Audit trail table |

## Shared/UI
| Component | Description |
|-----------|-------------|
| [Header/Navbar](./src/components/Header.jsx) | Responsive nav + auth |
| [Footer](./src/components/Footer.jsx) | Links + copyright |
| [MapView](./src/components/MapView.jsx) | Google Maps wrapper + markers/polylines |
| [Auth/Login](./src/components/Auth.jsx) | Forms + forgot password |
| [SupportTicket](./src/components/SupportTicket.jsx) | Form + submit to backend |
| [Chatbot](./src/components/Chatbot.jsx) | Ollama-powered parking assistant |
| [Toast/Notifications](./src/components/Toast.jsx) | Global toast system |

## Utils
- `src/api/parkingApi.js`: API wrappers (fetch + auth token).
- `src/utils/notificationUtils.js`: Toast triggers.

**Usage**: All components use hooks (useState/useEffect/useContext for auth/wallet). Responsive (Bootstrap/Tailwind). Animations (Framer Motion).

See [Getting Started](../GETTING-STARTED.md), [Architecture](../ARCHITECTURE.md).

