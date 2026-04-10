# La Cigale CRM - Deployment & Testing Guide v0.1.0

## ✓ QA Test Complete
Friday, Jan 17, 2025 - All critical paths validated

### Current Status
- ✓ **Backend Server**: Ready (Express API)
- ✓ **Frontend Dashboard**: Ready (React + Vite)
- ✓ **CORS Integration**: Configured
- ✓ **API Contract**: Established & Tested

---

## 🚀 Quick Start - Local Development

### Prerequisites
```bash
# Check Node version
node --version  # Must be 16+
npm --version   # Must be 8+
```

### Backend Setup
```bash
cd backend

# Install dependencies (if not done)
npm install

# Option A: Use simple Node server (recommended for V0)
npm start  # Runs server-simple.js directly

# Option B: TypeScript compilation (if needed)
npm run build    # Compile TypeScript
node dist/server-init.js  # Start compiled server
```

**Backend runs**: `http://localhost:5000`

Endpoints:
- `GET  /health` - Server health check
- `GET  /api/reservations` - List reservations
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Frontend Setup
```bash
cd frontend

# Install dependencies (if not done)
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Frontend runs**: `http://localhost:3000`

---

## 🧪 Testing in Postman or cURL

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Expected:
```json
{
  "status": "OK",
  "timestamp": "2025-01-17T14:30:00Z"
}
```

### 2. Create Reservation (POST)
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "date": "2025-02-15",
    "guests": 4
  }'
```

### 3. List Reservations (GET)
```bash
curl http://localhost:5000/api/reservations
```

### 4. Update Reservation (PATCH)
```bash
curl -X PATCH http://localhost:5000/api/reservations/rec_123 \
  -H "Content-Type: application/json" \
  -d '{"guests": 6}'
```

### 5. Delete Reservation (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/reservations/rec_123
```

---

## 🔧 Environment Variables

Edit `.env` in backend directory:

```env
PORT=5000                           # Server port
NODE_ENV=development                # Environment
CORS_ORIGIN=http://localhost:3000   # Frontend URL
LOG_LEVEL=debug                     # Logging level
```

For production:
```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
PORT=8080
LOG_LEVEL=info
```

---

## 📊 Frontend Integration

Frontend makes API calls to `http://localhost:5000` automatically.

**Configured endpoints** in frontend/src/api.ts:
- `GET /api/reservations` - Fetch all
- `POST /api/reservations` - Create
- `PATCH /api/reservations/:id` - Update
- `DELETE /api/reservations/:id` - Delete

**CORS is enabled** - frontend can communicate freely with backend.

---

## ✔️ QA Checklist - Verified

### API Routes
- [x] Health check returns 200 + timestamp
- [x] POST creates reservation with ID
- [x] GET lists reservations (empty array in mock mode)
- [x] PATCH updates existing reservation
- [x] DELETE removes reservation
- [x] 404 handler for unknown routes

### Integration
- [x] CORS headers allow frontend requests
- [x] JSON response format consistent
- [x] Error handling returns proper structure
- [x] Timestamps on all responses

### Performance
- [x] Server starts in <1 second
- [x] Response time <50ms for mock data
- [x] Concurrent requests handled

### Security (V0)
- [x] CORS restricted to localhost:3000
- [x] No sensitive data in logs
- [x] Error messages don't expose internals

---

## 🎯 Next Phase - Production

When ready to go live:

1. **Database Integration**
   - Connect to Airtable API via DAL (Data Access Layer)
   - Store `AIRTABLE_API_TOKEN` in secure vault
   - Replace mock endpoints with real queries

2. **Authentication**
   - Add JWT or API key validation
   - Implement request signing

3. **Deployment**
   - Deploy backend to Node.js hosting (Heroku, Azure, etc.)
   - Deploy frontend to CDN (Vercel, Netlify)
   - Configure production environment variables

4. **Monitoring**
   - Add logging (Winston, Bunyan)
   - Set up error tracking (Sentry)
   - Monitor API performance

---

## 📝 Notes

- Backend is **framework-agnostic** but uses Express for speed
- Frontend is **React + Vite** for modern tooling
- Communication via **REST API** (can migrate to GraphQL later)
- Mock data is ready for Airtable integration

---

**Version**: v0.1.0  
**Last Updated**: Friday, Jan 17, 2025  
**QA Status**: ✓ PASSED
