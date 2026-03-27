# Boorgen AI Outreach — Setup Guide

## Project Structure

```
boorgen-outreach/
├── backend/
│   ├── models/Lead.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/leads.js
│   ├── services/groq.js
│   ├── services/mailer.js
│   ├── services/webhook.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/Login.jsx
│   │   ├── pages/Dashboard.jsx
│   │   ├── components/AddLeadForm.jsx
│   │   ├── components/LeadsTable.jsx
│   │   ├── components/StatsBar.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── n8n/
    └── workflow.json
```

---

## Step 1 — MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com → create free cluster
2. Create a database user (username + password)
3. Whitelist IP: 0.0.0.0/0 (for Render deployment)
4. Copy connection string:
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/boorgen`

---

## Step 2 — Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up → API Keys → Create Key
3. Copy the key → set as GROQ_API_KEY

---

## Step 3 — Gmail App Password

1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Use that 16-char password as GMAIL_PASS (NOT your real password)

---

## Step 4 — Backend Setup

```bash
cd boorgen-outreach/backend
cp .env.example .env
# Fill in all values in .env
npm install
npm start
```

Backend runs on http://localhost:3000

---

## Step 5 — Frontend Setup

```bash
cd boorgen-outreach/frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## Step 6 — n8n Setup (Self-hosted, Free)

### Install n8n locally:
```bash
npm install -g n8n
n8n start
```
n8n runs on http://localhost:5678

### Import workflow:
1. Open n8n → Workflows → Import from File
2. Select `n8n/workflow.json`
3. Configure credentials:
   - **Groq**: HTTP Header Auth → Name: `Authorization`, Value: `Bearer YOUR_GROQ_API_KEY`
   - **Gmail**: Add Gmail OAuth2 or SMTP credentials
4. Set environment variable in n8n:
   - `GROQ_API_KEY` = your key
   - `BACKEND_JWT_TOKEN` = a valid JWT (login via /api/login and copy token)
5. Activate the workflow

### n8n Workflow Steps:
1. Webhook receives POST from backend at `/webhook/lead-outreach`
2. HTTP Request → Groq API generates German email
3. Gmail node sends email to lead
4. HTTP Request → POST /api/update-lead (status = Contacted)

---

## Step 7 — Deploy to Render (Free)

### Backend:
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect repo → set root dir to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from .env

### Frontend:
1. New Static Site on Render
2. Root dir: `frontend`
3. Build command: `npm install && npm run build`
4. Publish dir: `dist`
5. Set env var: `VITE_API_URL` if needed

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| PORT | Backend port (default 3000) |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Random secret string for JWT signing |
| ADMIN_EMAIL | Admin login email |
| ADMIN_PASSWORD | Admin login password |
| GROQ_API_KEY | Groq API key from console.groq.com |
| GMAIL_USER | Gmail address |
| GMAIL_PASS | Gmail App Password (16 chars) |
| N8N_WEBHOOK_URL | http://localhost:5678/webhook/lead-outreach |
