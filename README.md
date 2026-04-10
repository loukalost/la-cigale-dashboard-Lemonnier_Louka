# 🍴 La Cigale CRM V0

Système de gestion des réservations web pour La Cigale. Centralise toutes les réservations depuis Airtable via une interface moderne et intuitive.

**Status:** ✅ MVP Functional (Liste + CRUD opérationnel)  
**Deployment:** Render (Frontend + Backend)  
**Database:** Airtable (Source of Truth)

---

## 📋 Fonctionnalités V0

- ✅ **Vue Liste** : Affiche toutes les réservations en tableau avec tri, filtres, recherche
- ✅ **CRUD Complet** : Créer, lire, modifier, supprimer réservations
- ✅ **Changement Statut** : En attente → Confirmée → Annulée → Terminée → No-show
- ✅ **Formulaire Validation** : Dates futures, créneaux rigides (11h30-14h30, 19h00-22h30), 1-12 personnes
- ✅ **États UI** : Loading (skeleton), Empty, Error (retry), Success (toast)
- ✅ **Proxy Backend** : Token Airtable jamais exposé au frontend
- ✅ **Cache 30s** : Mitigation Airtable rate limit (300 req/min)

**Prochaines itérations (V0.1+):**
- Vue Kanban (drag & drop par statut)
- Vue Planning (calendrier jour/semaine)
- Tests E2E
- Recherche fulltext
- Export PDF

---

## 🛠️ Stack Technique

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + TypeScript + Vite | Virtual list perf, drag-drop ecosystem |
| **Backend** | Express.js 4.18 + TypeScript | Minimal complexity for DAL pattern |
| **Database** | Airtable API (PAT) | Existing source of truth |
| **Deployment** | Render | Existing infrastructure |
| **State** | Zustand (frontend) | Lightweight, no boilerplate |
| **Styling** | Inline CSS + Tailwind (V1) | No CSS framework required V0 |

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 20 LTS (check: `node --version`)
- npm 10+ (check: `npm --version`)
- Airtable API Key (from: https://airtable.com/account/my-api-tokens)
- Airtable Base ID (from your base URL)

### 1. Clone & Install Dependencies

```bash
cd dashboard-la-cigale

# Frontend
cd frontend
npm install

# Backend (in separate terminal)
cd backend
npm install
```

### 2. Configure Environment Variables

**Backend (`.env`):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your Airtable credentials:
# AIRTABLE_API_KEY=sk_live_xxxxx
# AIRTABLE_BASE_ID=appXXXX
# AIRTABLE_TABLE_NAME=Réservations
```

**Frontend (`.env`):**
```bash
cp frontend/.env.example frontend/.env
# Default: VITE_API_URL=http://localhost:5000/api (local dev)
```

**Critical:** Never commit `.env` files! Use `.gitignore` ✓

### 3. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
# ✓ Backend running on http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# ✓ Frontend running on http://localhost:3000
```

Open browser: **http://localhost:3000**

---

## 📚 Project Structure

```
dashboard-la-cigale/
├── frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── components/         # Reusable UI (Table, Form, Modal, Toast, etc.)
│   │   ├── views/              # Page-level components (ListPage, etc.)
│   │   ├── api/                # API client (fetch wrappers)
│   │   ├── hooks/              # Custom hooks (useReservations, useMutations)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Helpers (date, formatters)
│   │   ├── state/              # Zustand store
│   │   ├── App.tsx             # Root component
│   │   └── main.tsx            # Vite entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/                    # Express.js + TypeScript
│   ├── src/
│   │   ├── dal/                # Data Access Layer (Airtable)
│   │   │   ├── AirtableClient.ts  (low-level API calls)
│   │   │   ├── ReservationService.ts (business logic + cache)
│   │   │   └── index.ts
│   │   ├── routes/             # Express routes (CRUD endpoints)
│   │   ├── middleware/         # Future: Auth, logging
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Helpers
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                       # Product documentation
│   ├── PRD.md                  # Requirements
│   ├── BACKLOG.md              # User stories
│   ├── Architecture.md         # Tech decisions
│   ├── design_specs.md         # UI/UX specs
│   ├── RAID.md                 # Risk management
│   └── TEAM_BRIEFS.md          # Role briefs
│
└── README.md                   # This file
```

---

## 🔐 Security

### Secrets Management

**Local Development:**
```
backend/.env (gitignored)
├─ AIRTABLE_API_KEY=sk_test_xxxxx  (test/dev key)
├─ AIRTABLE_BASE_ID=appXXXX
└─ CORS_ORIGIN=http://localhost:3000
```

**Production (Render):**
```
Use Render Environment Variables Dashboard:
1. Login → https://dashboard.render.com
2. Select deployment
3. Environment → Add variables (no .env file needed)
4. AIRTABLE_API_KEY=sk_live_xxxxx (production PAT)
5. CORS_ORIGIN=https://crm-la-cigale.render.com
```

### Checklist

- ✓ Token never in frontend (always backend-only)
- ✓ CORS whitelisted (frontend origin only)
- ✓ Error messages sanitized (no token exposure)
- ✓ HTTPS enforced (Render auto-TLS)
- ✓ .env.example committed (placeholders only)
- ✓ .env gitignored (never commit secrets)

---

## 🚀 API Endpoints

### Reservations

```
GET    /api/reservations              # Get all (cached 30s)
GET    /api/reservations/:id          # Get one
POST   /api/reservations              # Create
PATCH  /api/reservations/:id          # Update
DELETE /api/reservations/:id          # Delete (soft → "Annulée")
```

**Request Body (Create):**
```json
{
  "nomComplet": "Dupont",
  "prenom": "Jean",
  "date": "2024-04-12",
  "heure": "19:30",
  "nbPersonnes": 4,
  "autresInfos": "Allergies cacahuètes"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "recXXXXX",
    "nomComplet": "Dupont",
    "prenom": "Jean",
    "date": "2024-04-12",
    "heure": "19:30",
    "nbPersonnes": 4,
    "statut": "En attente",
    "autresInfos": "Allergies cacahuètes",
    "createdTime": "2024-04-10T14:30:00.000Z"
  },
  "meta": { "timestamp": "2024-04-10T14:30:00Z" }
}
```

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Initial Load** | < 3s | ~1.5s (Vite) |
| **Action (CRUD)** | < 1s | ~600ms |
| **Cache Hit** | Instant | ~10ms |
| **API Timeout** | 10s | 5s read, 10s write |
| **Rate Limit** | 300 req/min (Airtable) | 30s cache + debounce |

---

## 🧪 Manual Testing Checklist

**Happy Path:**
- [ ] Load frontend → Table displays
- [ ] Click "+ Nouvelle" → Form modal opens
- [ ] Fill form → Submit → Toast success
- [ ] Refresh → New row appears
- [ ] Click edit → Form pre-fills
- [ ] Change status → Updates instantly
- [ ] Delete → Confirmation → Soft delete applied

**Error Paths:**
- [ ] Stop backend → Error banner appears
- [ ] Missing env vars → Startup warning
- [ ] Invalid dates → Form validation messages
- [ ] Network timeout → Retry option

---

## 📦 Build & Deployment

### Frontend Build

```bash
cd frontend
npm run build
# → Generates dist/ folder (Vite optimized)
```

### Backend Build

```bash
cd backend
npm run build
# → Generates dist/ folder (TypeScript compiled to JS)
```

### Deploy to Render

1. **Connect GitHub repo** to Render
2. **Create Web Service:**
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `node dist/server.js`
   - Environment variables (see above)
3. **Deploy Frontend:**
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Auto-deploy on push

---

## 🐛 Troubleshooting

**"Missing Airtable credentials"**
→ Check `backend/.env` has `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`

**"CORS error in browser"**
→ Verify `CORS_ORIGIN` matches frontend URL (localhost:3000 for dev, production domain for prod)

**"NO DATA displays"**
→ Check Airtable table name matches `AIRTABLE_TABLE_NAME` env var (default: "Réservations")

**"502 Bad Gateway on Render"**
→ Check backend started: `npm run dev` in local, verify `PORT` env var in Render

**"Changes not persisted"**
→ Verify Airtable API key has write permissions (scopes: `data.records:write`)

---

## 📖 Related Documentation

- [PRD.md](docs/PRD.md) — Product requirements & personas
- [BACKLOG.md](docs/BACKLOG.md) — User stories & acceptance criteria
- [Architecture.md](docs/Architecture.md) — Tech decisions & DAL contract
- [design_specs.md](docs/design_specs.md) — UI/UX specifications
- [.stack-check.md](.stack-check.md) — Stack validation

---

## 👥 Team

| Role | Responsibility |
|------|----------------|
| **Product Owner** | Backlog prioritization, release planning |
| **Architecte** | Tech decisions, DAL design, security |
| **Dev Full-stack** | Implementation (frontend + backend) |
| **UX/UI Designer** | UI specs, component design |
| **QA** | Test plan, bug tracking, sign-off |

---

## 📝 License

Internal use only. La Cigale restaurant management system.

---

## 🚀 Next Steps (V0.1+)

- [ ] Vue Kanban (drag & drop)
- [ ] Vue Planning (calendrier)
- [ ] Search fulltext
- [ ] Tests E2E
- [ ] Deployment guide
- [ ] Admin panel (settings, user roles)
- [ ] Notifications (email/SMS)

---

**Last Updated:** 10 avril 2026  
**Version:** 0.1.0  
**Status:** 🟢 Functional MVP
