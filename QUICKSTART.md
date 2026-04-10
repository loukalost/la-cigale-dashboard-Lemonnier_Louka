# Quick Start Guide - La Cigale CRM V0

5-minute setup to get the app running locally.

## Prerequisites

✓ Node.js 20 LTS  
✓ npm 10+  
✓ Airtable account with API tokens  
✓ Git installed  

## Step 1: Get Airtable Credentials (2 min)

1. Go to https://airtable.com/account/my-api-tokens
2. Click "Generate new token"
3. Name it "La Cigale CRM V0"
4. Scopes needed:
   - `data.records:read`
   - `data.records:write`
   - `data.records:destroy`
5. Click "Create token" → Copy the `sk_live_xxxxx` key
6. Keep it safe (we'll need it in Step 3)

## Step 2: Get Base ID (1 min)

1. In Airtable, open your La Cigale base
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy the `appXXXXXXXXXXXXXX` part

## Step 3: Setup Environment (1 min)

### Backend

```bash
cd backend
cp .env.example .env

# Edit backend/.env:
# - Replace AIRTABLE_API_KEY with your sk_live_xxxxx
# - Replace AIRTABLE_BASE_ID with your appXXXXX
```

### Frontend

```bash
cd frontend
cp .env.example .env

# Leave VITE_API_URL as default (http://localhost:5000/api)
```

## Step 4: Install & Run (1 min)

### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev

# Expected output:
# ✓ La Cigale CRM Backend running on http://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev

# Expected output:
# ✓ VITE v4.4.0  ready in 100ms
# ➜  Local:   http://localhost:3000/
```

## Result 🎉

Open **http://localhost:3000** in your browser.

You should see:
- 🍴 La Cigale CRM header
- 📋 Réservations table with all reservations from Airtable
- "+ Nouvelle réservation" button to create new
- Edit/Delete buttons per row

### Test CRUD

1. **Create** : Click "+ Nouvelle" → Fill form → Save → See in table
2. **Update** : Click Edit → Change fields → Save
3. **Change Status** : In table, click status dropdown → Change → Auto-updates
4. **Delete** : Click Delete button → Confirm → Row disappears

---

## Troubleshooting

**"Cannot find module 'express'"**
→ Run `npm install` in the backend folder

**"CORS error in console"**
→ Make sure backend is running (`npm run dev` in backend folder)

**"No data displays in table"**
→ Check your Airtable API key is valid
→ Check table name matches `AIRTABLE_TABLE_NAME` in `.env` (default: "Réservations")

**"Error: Missing Airtable credentials"**
→ Check `.env` file exists in backend folder with API_KEY and BASE_ID

## Next Steps

- [ ] Read [README.md](README.md) for full documentation
- [ ] Review [docs/](docs/) folder for product specs
- [ ] Run tests (see README for test command)
- [ ] Deploy to Render (see README Deployment section)

---

Happy coding! 🚀
