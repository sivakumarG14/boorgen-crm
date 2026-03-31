# BOORGEN Outreach CRM — Setup Guide

## Stack
- Backend: Node.js + Express + MongoDB + Socket.io + Nodemailer
- Frontend: React + Vite + Socket.io-client
- Auth: JWT (8h expiry)

---

## 1. Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password enabled

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env`:
```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/boorgen
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@boorgen.com
ADMIN_PASSWORD=your_password
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_app_password        # Gmail App Password (not account password)
BACKEND_URL=http://localhost:3000   # Used for tracking links in emails
ANA_EMAIL=ana@yourdomain.com        # Notification recipient
GROQ_API_KEY=your_groq_key          # Optional: AI email generation
N8N_WEBHOOK_URL=...                 # Optional: n8n automation
N8N_SECRET=...                      # Optional: n8n shared secret
FRONTEND_URL=http://localhost:5173  # For CORS
```

Start backend:
```bash
npm run dev    # development (nodemon)
npm start      # production
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

For production, set `VITE_API_URL` in a `.env` file:
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 4. Login
- URL: http://localhost:5173/login
- Email: value of `ADMIN_EMAIL` in .env
- Password: value of `ADMIN_PASSWORD` in .env

---

## 5. API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | Get JWT token |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/add-lead | Create lead + send cold email |
| GET | /api/leads | List leads (search + status filter) |
| POST | /api/update-lead | Update status/notes |
| DELETE | /api/delete-lead/:id | Delete lead |
| GET | /api/stats | Dashboard stats |

### Funnel
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/funnel/reply | Process reply (yes/no/address/question/later) |
| POST | /api/funnel/link-click | Track manual link click |
| POST | /api/funnel/schedule-call | Schedule call (+20 score) |
| POST | /api/funnel/notify-ana | Send notification to Ana |

### Tracking (no auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /track/:trackingId | Link click → redirect (score +10) |
| GET | /track/open/:trackingId | Email open pixel (score +5) |
| POST | /track/visit | Page visit from JS snippet |

---

## 6. AI Scoring System
| Event | Score |
|-------|-------|
| Email open | +5 |
| Link click | +10 |
| Reply (no/later) | +10 |
| Reply (yes/question) | +20 |
| Address provided | +30 |
| Call scheduled | +20 |
| High priority threshold | ≥ 40 |

---

## 7. Real-Time Events (Socket.io)
Events emitted to all connected clients:
- `leadAdded` — new lead created
- `leadUpdated` — status/score changed
- `linkClicked` — tracking link clicked
- `emailOpened` — tracking pixel fired
- `callScheduled` — call date set
- `pageVisit` — JS snippet visit

---

## 8. Page Tracking Snippet
Embed on any hotel landing page:
```html
<script src="https://your-backend.com/tracker.js?tid=LEAD_TRACKING_ID"></script>
```
Replace `LEAD_TRACKING_ID` with the lead's `trackingId` field from the database.

---

## 9. Docker (optional)
```bash
docker-compose up --build
```

---

## 10. Production Deployment (Render)
See `render.yaml` for service configuration.
Set all environment variables in the Render dashboard.
