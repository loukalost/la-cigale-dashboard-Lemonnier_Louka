# Architecture Technique - CRM La Cigale V0

**Date :** 12 avril 2024  
**Architecte :** [Équipe Tech]  
**Status :** ✅ Approved for Development

---

## 1. Vue d'Ensemble de l'Architecture

### 1.1 Schéma Flux Données

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER / FRONTEND                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  React TypeScript (Vite)                                      │  │
│  │  ┌──────────┬──────────────┬─────────────┐                   │  │
│  │  │ Vue      │ Vue Kanban   │ Vue         │                   │  │
│  │  │ Liste    │              │ Planning    │                   │  │
│  │  └──┬───────┴──────┬───────┴──────┬──────┘                   │  │
│  │     │              │              │                          │  │
│  │     └──────────────┼──────────────┘                          │  │
│  │                    │ fetch() JSON                            │  │
│  │            NO API KEY / NO TOKEN                             │  │
│  └───────────────────┬──────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│              BACKEND API (Express.js) - Render                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Middleware :                                                 │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │ Auth Check     │  │ CORS Whitelist│ │ Error Handler │  │  │
│  │  └────────────────┘  └──────────────┘  └────────────────┘  │  │
│  │                                                               │  │
│  │  Routes :                                                    │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ GET  /api/reservations     (getAll)                 │  │  │
│  │  │ GET  /api/reservations/:id (getById)                │  │  │
│  │  │ POST /api/reservations     (create)                 │  │  │
│  │  │ PATCH /api/reservations/:id (update)               │  │  │
│  │  │ DELETE /api/reservations/:id (delete)              │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  DAL (Data Access Layer) :                                  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ ReservationService                                   │  │  │
│  │  │  ├─ getFromAirtable()                                │  │  │
│  │  │  ├─ createInAirtable()                               │  │  │
│  │  │  └─ updateInAirtable()                               │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Env Vars (Render Dashboard) :                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ AIRTABLE_API_KEY=sk_live_...  (PAT)                │  │  │
│  │  │ AIRTABLE_BASE_ID=appXXXX...                          │  │  │
│  │  │ AIRTABLE_TABLE_NAME=Réservations                    │  │  │
│  │  │ CORS_ORIGIN=https://crm-la-cigale.render.com       │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └───────────────┬──────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
                    │ Secure Token
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  AIRTABLE API (Source of Truth)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ PAT Authentification (Bearer token dans headers)             │   │
│  │ ┌────────────────────────────────────────────────────────┐  │   │
│  │ │ Base : La Cigale (appXXXXX...)                          │  │   │
│  │ │ Table : Réservations                                   │  │   │
│  │ │ Colonnes : Prénom | Nom | Date | Heure | Nb_pax |... │  │   │
│  │ └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘

Cache Strategy:
├─ Frontend State : React Context/Zustand (in-memory)
├─ Revalidate : 30s polling (vs. 300 req/min limit)
└─ Retry Logic : Exponential backoff (3 tentatives)
```

### 1.2 Garanties de Sécurité

```
Security Layers:
┌─ Layer 1 (Frontend) :
│  ├─ NO API Key storage
│  ├─ NO token in localStorage
│  └─ Authenticated via CORS (session HTTP-only cookies)
│
├─ Layer 2 (Network) :
│  ├─ HTTPS only (Render TLS)
│  ├─ CORS whitelist (origin validation)
│  └─ Rate limiting middleware
│
└─ Layer 3 (Backend) :
   ├─ Token stored in Render env vars (isolated)
   ├─ Error messages sanitized
   └─ Audit logging (all API calls)
```

---

## 2. Décisions Techniques

### 2.1 Authentification Airtable : PAT vs OAuth

| Critère | PAT (Personal Access Token) | OAuth 2.0 (Server-to-Server) |
|---------|---|---|
| **Complexité setup** | ⭐ Simple (5 min) | ⭐⭐⭐⭐ Complexe (2-3 jours) |
| **Sécurité token** | Risque rotation annuelle | Refresh token rotation auto |
| **Maintenance backend** | Minimal | Gestion state OAuth |
| **Latence** | < 100ms (direct) | +100ms (OAuth exchange) |
| **Cost** | Free | Free (Airtable gratuit) |
| **V0 Readiness** | ✅ Ready | 🔲 Overkill |
| **V1+ Migration** | Peut passer à OAuth | N/A |

**RECOMMANDATION : ✅ PAT (Personal Access Token) pour V0**

**Justification :**
- Implémentation fast-track (startup rapide)
- Sécurité suffisante V0 si rotation 6-mois + Render env vars
- OAuth apporte complexité sans valeur métier V0
- Roadmap V1 : migration OAuth possible sans refactor DAL (contrat stable)

**Implementation V0 :**
```
1. Generate PAT in Airtable dashboard (Admin Settings → Tokens)
2. Scope: data.records:read, data.records:write, data.records:destroy
3. Store in Render env var: AIRTABLE_API_KEY=sk_live_xxxxx
4. Backend: use Airtable SDK with token from process.env
5. Rotation: Calendar reminder every 6 months
```

---

### 2.2 Architecture API : Proxy Backend vs Front-end Direct

| Critère | Proxy Backend (Recommended) | Direct Frontend Call |
|---------|---|---|
| **Token Exposure** | ❌ Token hidden backend | ⚠️ **JAMAIS - Security Risk** |
| **CORS** | ✅ Backend manages CORS | ⚠️ Airtable CORS strict |
| **Rate Limiting** | ✅ Batch + cache backend | ❌ Every user hits limit |
| **Error Handling** | ✅ Centralized, safe messages | ❌ Raw API errors exposed |
| **Latency** | +50-100ms (hop backend) | -50ms (direct, BUT risky) |
| **Caching** | ✅ 30s cache with middleware | ❌ No real caching |
| **Retry Logic** | ✅ Exponential backoff backend | ❌ Client-side only |
| **Monitoring** | ✅ Logs centralized | ❌ Hard to debug |
| **Scalability** | ✅ Scale backend | ❌ Bottleneck per client |

**RECOMMANDATION : ✅ Proxy Backend (Express.js)**

**Justification :**
- **Security critical** : Token never leaves backend
- **Rate limit mitigation** : Cache 30s avoids 300 req/min limit
- **Risk-001 mitigation** (RAID) : Retry + batch logic prevents throttling
- **Multi-user safety** : Concurrent users don't collapse Airtable
- **Error safety** : No API keys/errors exposed to frontend

**Architecture :**
```
Frontend Request:  GET /api/reservations?date=2024-04-12
                        ↓
Backend Middleware: Check cache (30s TTL)
                        ├─ Hit → return cached JSON
                        └─ Miss → Call Airtable API with token
                                 ├─ Success → cache + return
                                 └─ Fail → retry up to 3x, then error
Frontend receives: Safe JSON (no tokens, sanitized errors)
```

---

### 2.3 Stack Frontend : React vs Vue vs Svelte

| Critère | React (Recommended) | Vue 3 | Svelte |
|---------|---|---|---|
| **Ecosystem** | ⭐⭐⭐⭐⭐ Largest | ⭐⭐⭐ Good | ⭐⭐ Limited |
| **Learning curve** | ⭐⭐⭐ Medium | ⭐⭐ Easy | ⭐⭐ Easy |
| **Bundle size** | ~45KB (gzip) | ~35KB | 🌟 ~15KB |
| **Render performance** | ⭐⭐⭐⭐ Fast (vDOM) | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Fastest |
| **State management** | Context + Zustand | Pinia | Svelte stores |
| **Component libraries** | Shadcn, Mantine | Nuxt | Few options |
| **TypeScript support** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ OK |
| **Dev experience** | ⭐⭐⭐⭐ Very good | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Team hiring** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Medium | ⭐ Hard |
| **V0 Readiness** | ✅ Ready | ✅ Ready | 🟡 Maybe |
| **Kanban drag-drop** | react-beautiful-dnd | vue-draggable | Need adapter |

**RECOMMANDATION : ✅ React 18 + TypeScript + Vite**

**Justification :**
- **Virtual list performance** : react-virtualized handles 50+ reservations smoothly
- **Drag & drop ecosystem** : Best libraries (Dnd Kit, beautiful-dnd) = Kanban priority
- **Kanban use-case** : React excels at frequent re-renders (status changes)
- **DevOps friendly** : Easier to hire next dev
- **Tooling** : Vite = ultra-fast dev setup
- **Typescript** : DAL type-safety required → React ecosystem mature

**Setup :**
```bash
npm create vite@latest crm-la-cigale -- --template react-ts
npm install zustand react-virtualized dnd-kit
npm run dev # Start Vite dev server
```

---

### 2.4 Backend Framework : Express vs Fastify vs Hono

| Critère | Express (Recommended) | Fastify | Hono on Render |
|---------|---|---|---|
| **Maturity** | ⭐⭐⭐⭐⭐ Battle-tested | ⭐⭐⭐⭐ Mature | ⭐⭐⭐ Emerging |
| **Type Safety** | ⭐⭐⭐ Good with @types | ⭐⭐⭐⭐ Built-in | ⭐⭐⭐⭐⭐ Excellent |
| **Performance** | ~10K req/s | ~25K req/s | ~20K req/s |
| **Setup time** | ⭐⭐⭐⭐ 30 min | ⭐⭐⭐ 45 min | ⭐⭐⭐ 45 min |
| **Middleware ecosystem** | Largest | Very good | Growing |
| **Render compatibility** | ✅ Perfect | ✅ Good | ✅ Good |
| **Team knowledge** | Highest | Medium | Low |
| **V0 production-ready** | ✅ Yes | ✅ Yes | 🟡 Yes but risky |

**RECOMMANDATION : ✅ Express.js (v4.18+)**

**Justification :**
- **Simple DAL** : Express perfectly sized for 5 REST routes
- **Stability** : Proven in 10K+ restaurants/SaaS
- **Middleware** : CORS, rate-limiting, error-handling abundant
- **Performance** : 10K req/s >> 300 req/min Airtable limit (no bottleneck)
- **Render ready** : Deploy `npm start` directly
- **V0 velocity** : Less learning curve = faster implementation

**Setup :**
```bash
npm init -y
npm install express cors dotenv airtable axios
```

---

### 2.5 Supabase Role V0 : Cache Layer vs Standalone

| Scenario | Role |
|---------|------|
| **Pure Airtable** | V0 minimum viable : Airtable only (source of truth) |
| **+ Supabase Cache** | V0+ optional : Supabase PostgreSQL for audit logs, read cache |
| **Hybrid** | V0+ future : Write→Airtable, Read→Supabase cache |

**RECOMMANDATION : ✅ Pure Airtable V0 (Supabase parking for V1)**

**Justification :**
- **MVP scope** : 300 req/min Airtable sufficient for <5 concurrent users
- **Complexity** : Supabase adds sync logic, conflict resolution, operational overhead
- **Risk** : Cache invalidation = new class of bugs (not worth V0)
- **Roadmap V1** : If users grow → add Supabase cache layer (non-invasive)
- **Cost** : Free tier Supabase ok, but not needed yet

**If Performance Crisis (V0.1)** :
```
Add Supabase as read-only cache:
├─ POST/PATCH/DELETE → Airtable (source of truth)
├─ GET → Supabase cache (30s TTL)
└─ Sync job (every 30s) : Pull from Airtable → Upsert Supabase
```

---

## 3. Gestion des Secrets (Stratégie Complète)

### 3.1 Stockage des Secrets par Environnement

```
┌──────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  File: .env (gitignored)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AIRTABLE_API_KEY=sk_live_abc123...                  │   │
│  │ AIRTABLE_BASE_ID=appXXXXXXXXXXXX                    │   │
│  │ AIRTABLE_TABLE_NAME=Réservations                   │   │
│  │ NODE_ENV=development                               │   │
│  │ PORT=3000                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Loaded by: dotenv package (require('dotenv').config())    │
│  Access: process.env.AIRTABLE_API_KEY                       │
│  Risk: Only local machine (no internet exposure)            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   PRODUCTION (Render)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Render Dashboard → Service → Environment                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Key: AIRTABLE_API_KEY                              │   │
│  │ Value: sk_live_abc123...                           │   │
│  │ [Add Secret] → Saved in Render vault              │   │
│  │                                                    │   │
│  │ Key: AIRTABLE_BASE_ID                             │   │
│  │ Value: appXXXXXXXXXXXX                             │   │
│  │ [Add Secret]                                       │   │
│  │                                                    │   │
│  │ Key: AIRTABLE_TABLE_NAME                          │   │
│  │ Value: Réservations                               │   │
│  │ [Add Secret]                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Access: process.env.AIRTABLE_API_KEY (same as local)      │
│  Risk: Encrypted at rest in Render vault                    │
│  Deployment: Service auto-redeploys when vars change       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│          OPTIONAL: Secret Manager (V1+, if needed)          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Candidate: HashiCorp Vault, Azure Key Vault, AWS Secrets  │
│  Cost: Free tier available, but complexity++                │
│  Recommendation: V0 skip, revisit V1 if 50+ users           │
│                                                              │
│  If implemented:                                            │
│  ├─ Backend makes API call to Vault on startup              │
│  ├─ Fetch AIRTABLE_API_KEY from vault                       │
│  ├─ Store in memory, use throughout service lifetime        │
│  └─ Rotate keys centrally (not per-deployment)              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Injection des Secrets dans l'Application

**Backend (Express.js) :**

```typescript
// src/config.ts
import dotenv from 'dotenv';

dotenv.config(); // Load .env locally, ignored in production

interface Config {
  airtableApiKey: string;
  airtableBaseId: string;
  airtableTableName: string;
  nodeEnv: 'development' | 'production';
  port: number;
}

const config: Config = {
  airtableApiKey: process.env.AIRTABLE_API_KEY || '',
  airtableBaseId: process.env.AIRTABLE_BASE_ID || '',
  airtableTableName: process.env.AIRTABLE_TABLE_NAME || 'Réservations',
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production',
  port: parseInt(process.env.PORT || '3000', 10),
};

// Validate on startup
if (!config.airtableApiKey) {
  throw new Error('❌ AIRTABLE_API_KEY not set in environment variables');
}
if (!config.airtableBaseId) {
  throw new Error('❌ AIRTABLE_BASE_ID not set in environment variables');
}

export default config;
```

**Usage in DAL :**

```typescript
// src/dal/airtable.ts
import config from '../config';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: config.airtableApiKey })
  .base(config.airtableBaseId);

const table = base.table(config.airtableTableName);

export const getReservations = async () => {
  return table.select().all(); // Token hidden in SDK
};
```

### 3.3 .env.example (Versioned, Pre-filled Template)

```bash
# .env.example
# Copy this to .env and fill in your actual values
# NEVER commit .env with real values!

# === Airtable API Configuration ===
# Get your Personal Access Token from:
# https://airtable.com/account/api
# Scope: data.records:read, data.records:write, data.records:destroy
AIRTABLE_API_KEY=sk_live_your_pat_key_here

# Base ID from Airtable URL:
# https://airtable.com/app[BASE_ID]/...
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Table name in Airtable workspace (case-sensitive)
AIRTABLE_TABLE_NAME=Réservations

# === Node Environment ===
NODE_ENV=development
PORT=3000

# === Render Production Variables (optional local override) ===
# Leave empty in .env, configure via Render dashboard in production
# RENDER_SERVICE_NAME=crm-la-cigale
```

### 3.4 Rotation des Tokens (Procédure Semestrielle)

**Calendrier :** 1x tous les 6 mois (ou immédiatement si compromis)

**Procédure rotation :**

```
1. Generate new token (Airtable Dashboard)
   ├─ Go to https://airtable.com/account/api
   ├─ Click "Create token"
   ├─ Set scope: data.records:read, data.records:write, data.records:destroy
   └─ Copy new token (sk_live_newtoken...)

2. Test new token locally
   ├─ Update .env : AIRTABLE_API_KEY=sk_live_newtoken...
   ├─ Run: npm run dev
   ├─ Test CRUD: Create/Read/Update/Delete reservation
   └─ Verify: All tests pass ✅

3. Deploy new token to Render
   ├─ Render Dashboard → Service → Environment
   ├─ Edit AIRTABLE_API_KEY = sk_live_newtoken...
   ├─ Service auto-redeploys (30s)
   └─ Monitor logs: Check no 401 Unauthorized errors

4. Verify in production
   ├─ Open app: https://crm-la-cigale.render.com
   ├─ Test CRUD: Create test reservation
   ├─ Monitor: No errors in Render logs
   └─ Confirm: Everything works ✅

5. Revoke old token
   ├─ Airtable Dashboard → API Tokens
   ├─ Find old token (sk_live_oldtoken...)
   ├─ Click "Revoke"
   └─ Confirm: Old token disabled

6. Document in changelog
   ├─ CHANGELOG.md : "chore: rotate Airtable API token"
   └─ Slack #team : Token rotated, app stable
```

### 3.5 Incident Response (Token Compromised)

**Timeline : 5 minutes action**

```
T=0 min : Detection
  ├─ Someone commits .env with token visible
  ├─ OR attacker uses token (unusual API traffic)
  └─ Alert: GitHub secret scanning OR manual check

T=1 min : REVOKE immediately
  ├─ Airtable Dashboard → API Tokens
  ├─ Find token : sk_live_xxxxx...
  ├─ Click "Revoke" → Confirm
  └─ Effect: Token stopped working instantly

T=2 min : REQUEST new token
  ├─ Airtable Dashboard → "Create token"
  ├─ Same scope as before (read, write, destroy)
  ├─ Copy new token: sk_live_newtokenxxx
  └─ Store safely

T=3 min : UPDATE backend
  ├─ Render Dashboard → Environment
  ├─ Edit AIRTABLE_API_KEY = sk_live_newtokenxxx
  ├─ Service auto-redeploys (30s)
  └─ Check logs: No 401 errors

T=5 min : VERIFY + MONITOR
  ├─ Open app, test CRUD
  ├─ Monitor Render logs for errors
  ├─ Alert team: "Token rotated, app resumed"
  └─ Post-incident RCA (when calm)

Post-incident:
  ├─ Document: /docs/INCIDENT_2024-04-12.md
  ├─ Root cause: (e.g., "dev accidentally committed .env")
  ├─ Prevention: "Enable GitHub secret scanning, improve pre-commit checks"
  └─ Communication: Post to #team + #security
```

---

## 4. Contrat DAL (Data Access Layer)

### 4.1 Interfaces TypeScript

```typescript
// src/types/reservation.ts

/**
 * Reservation status enum
 * "En attente" → awaiting confirmation
 * "Confirmée" → confirmed by client
 * "Annulée" → client cancelled
 * "Terminée" → reservation completed
 * "No-show" → client didn't show up
 */
export enum ReservationStatus {
  PENDING = "En attente",
  CONFIRMED = "Confirmée",
  CANCELLED = "Annulée",
  COMPLETED = "Terminée",
  NO_SHOW = "No-show",
}

/**
 * Reservation domain model
 * Represents a table reservation at La Cigale
 */
export interface Reservation {
  // Airtable record ID (immutable)
  id: string;

  // Client info
  prenom: string;      // First name (required)
  nom_complet: string; // Full name (required)

  // Reservation timing
  date_reservation: string;  // ISO date (YYYY-MM-DD, must be >= today)
  heure_reservation: string; // Time in 24h format: "11:30", "12:00", "19:00", "22:30", etc.

  // Party size
  nombre_personne: number; // 1-12 persons

  // Optional notes
  autre_info?: string; // Allergies, special requests (max 200 chars)

  // Status tracking
  statut: ReservationStatus;

  // Metadata
  created_at?: string;       // ISO timestamp (Airtable managed)
  updated_at?: string;       // ISO timestamp (Airtable managed)
}

/**
 * DTO for creating a new reservation
 * Subset of Reservation (no id, timestamps auto-generated)
 */
export interface CreateReservationDTO {
  prenom: string;
  nom_complet: string;
  date_reservation: string;
  heure_reservation: string;
  nombre_personne: number;
  autre_info?: string;
  // statut defaults to "En attente" server-side
}

/**
 * DTO for updating a reservation
 * All fields optional (sparse update)
 */
export interface UpdateReservationDTO {
  prenom?: string;
  nom_complet?: string;
  date_reservation?: string;
  heure_reservation?: string;
  nombre_personne?: number;
  autre_info?: string;
  statut?: ReservationStatus;
}

/**
 * API response wrapper (consistent error & success handling)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;        // User-friendly message (no tech jargon)
    code: string;           // Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND", "RATE_LIMIT")
    details?: Record<string, unknown>; // Optional debugging info
  };
  timestamp: string;        // ISO timestamp
}
```

### 4.2 Service Interface (DAL Contract)

```typescript
// src/dal/reservationService.ts

/**
 * ReservationService
 * 
 * Central interface for all Airtable operations.
 * Implements CRUD + filtering + search.
 * 
 * Responsibilities:
 * - Translate frontend requests to Airtable API calls
 * - Handle token authentication (backend only)
 * - Implement caching (30s revalidate)
 * - Retry logic (exponential backoff, 3x)
 * - Error handling & translation (safe error messages)
 */
export interface IReservationService {
  /**
   * Get all reservations (with optional filters)
   * 
   * @param filters - Optional query filters
   * @param filters.date - Filter by date (ISO YYYY-MM-DD)
   * @param filters.status - Filter by status ("En attente", etc.)
   * @param filters.search - Search by name (partial match)
   * 
   * @returns Array of Reservation objects
   * 
   * @throws Error if Airtable API fails (after 3 retries)
   * 
   * @example
   * const all = await service.getAll();
   * const today = await service.getAll({ date: '2024-04-12' });
   * const pending = await service.getAll({ status: 'En attente' });
   * const search = await service.getAll({ search: 'Dupont' });
   */
  getAll(filters?: {
    date?: string;
    status?: ReservationStatus;
    search?: string;
  }): Promise<Reservation[]>;

  /**
   * Get single reservation by ID
   * 
   * @param id - Airtable record ID
   * 
   * @returns Reservation object
   * 
   * @throws Error if record not found (404)
   * @throws Error if Airtable API fails
   * 
   * @example
   * const res = await service.getById('rec123abc');
   */
  getById(id: string): Promise<Reservation>;

  /**
   * Create new reservation
   * 
   * @param dto - CreateReservationDTO (fields required by Airtable)
   * 
   * @returns Created Reservation (with server-generated id)
   * 
   * @throws Error if validation fails (400)
   * @throws Error if Airtable fails (500)
   * 
   * @validation
   * - date_reservation must be >= today
   * - heure_reservation must be in allowed slots
   * - nombre_personne must be 1-12
   * - prenom & nom_complet required
   * 
   * @example
   * const newRes = await service.create({
   *   prenom: 'Jean',
   *   nom_complet: 'Dupont',
   *   date_reservation: '2024-04-15',
   *   heure_reservation: '19:30',
   *   nombre_personne: 4,
   * });
   */
  create(dto: CreateReservationDTO): Promise<Reservation>;

  /**
   * Update existing reservation
   * 
   * @param id - Airtable record ID
   * @param dto - UpdateReservationDTO (sparse fields)
   * 
   * @returns Updated Reservation object
   * 
   * @throws Error if record not found (404)
   * @throws Error if validation fails (400)
   * @throws Error if Airtable fails (500)
   * 
   * @validation - Same as create (if fields provided)
   * 
   * @example
   * const updated = await service.update('rec123', {
   *   statut: 'Confirmée',
   *   nombre_personne: 5,
   * });
   */
  update(id: string, dto: UpdateReservationDTO): Promise<Reservation>;

  /**
   * Delete reservation (soft-delete recommended)
   * 
   * Sets status to "Annulée" instead of hard-delete.
   * Preserves audit trail in Airtable.
   * 
   * @param id - Airtable record ID
   * 
   * @returns void (no content on success)
   * 
   * @throws Error if record not found (404)
   * @throws Error if Airtable fails (500)
   * 
   * @example
   * await service.delete('rec123');
   */
  delete(id: string): Promise<void>;

  /**
   * Health check (ping Airtable API)
   * 
   * Tests connectivity + token validity.
   * Used for startup validation & monitoring.
   * 
   * @returns true if healthy, throws Error if not
   * 
   * @example
   * if (await service.healthCheck()) {
   *   console.log('✅ Airtable connected');
   * }
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Implementation class (actual Airtable API calls)
 */
export class ReservationService implements IReservationService {
  // Constructor receives Airtable base & config
  constructor(
    private readonly airtableBase: Airtable.Base,
    private readonly tableName: string,
    private readonly cache: Map<string, { data: Reservation[]; timestamp: number }> = new Map(),
  ) {}

  // Implementation follows interface contract...
  // See section 4.3 for detailed implementation pseudocode
}
```

### 4.3 Implémentation DAL (Pseudocode)

```typescript
// src/dal/reservationService.ts - Implementation

export class ReservationService implements IReservationService {
  private table: Airtable.Table;
  private cache: Map<string, { data: Reservation[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor(
    private airtableBase: Airtable.Base,
    private tableName: string,
  ) {
    this.table = this.airtableBase.table(tableName);
  }

  async getAll(filters?: {
    date?: string;
    status?: ReservationStatus;
    search?: string;
  }): Promise<Reservation[]> {
    const cacheKey = JSON.stringify(filters || {});
    
    // Check cache (30s TTL)
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Build Airtable filter formula
      let filterFormula = '';
      if (filters?.date) {
        filterFormula += `{date_reservation} = DATE('${filters.date}')`;
      }
      if (filters?.status) {
        filterFormula += filterFormula ? ` AND {statut} = '${filters.status}'` : `{statut} = '${filters.status}'`;
      }

      // Fetch from Airtable with retry (exponential backoff)
      const records = await this.fetchWithRetry(() =>
        this.table
          .select({
            filterByFormula: filterFormula || undefined,
            sort: [{ field: 'date_reservation', direction: 'asc' }],
          })
          .all(),
      );

      // Transform Airtable records to Reservation objects
      const reservations = records.map(record => ({
        id: record.id,
        ...record.fields,
      })) as Reservation[];

      // Apply client-side search (if provided)
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        return reservations.filter(
          res =>
            res.prenom.toLowerCase().includes(search) ||
            res.nom_complet.toLowerCase().includes(search),
        );
      }

      // Cache result
      this.cache.set(cacheKey, { data: reservations, timestamp: Date.now() });

      return reservations;
    } catch (error) {
      throw new ApiError('Failed to fetch reservations', 'FETCH_ERROR', error);
    }
  }

  async getById(id: string): Promise<Reservation> {
    try {
      const record = await this.fetchWithRetry(() =>
        this.table.find(id),
      );
      return { id: record.id, ...record.fields } as Reservation;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new ApiError('Reservation not found', 'NOT_FOUND', { id });
      }
      throw new ApiError('Failed to fetch reservation', 'FETCH_ERROR', error);
    }
  }

  async create(dto: CreateReservationDTO): Promise<Reservation> {
    // Validate DTO
    this.validateReservation(dto);

    try {
      const record = await this.fetchWithRetry(() =>
        this.table.create({
          ...dto,
          statut: ReservationStatus.PENDING, // Default status
        }),
      );

      // Invalidate cache
      this.cache.clear();

      return { id: record.id, ...record.fields } as Reservation;
    } catch (error) {
      throw new ApiError('Failed to create reservation', 'CREATE_ERROR', error);
    }
  }

  async update(id: string, dto: UpdateReservationDTO): Promise<Reservation> {
    // Validate DTO (only provided fields)
    if (dto.date_reservation) {
      this.validateDate(dto.date_reservation);
    }

    try {
      const record = await this.fetchWithRetry(() =>
        this.table.update(id, dto),
      );

      // Invalidate cache
      this.cache.clear();

      return { id: record.id, ...record.fields } as Reservation;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new ApiError('Reservation not found', 'NOT_FOUND', { id });
      }
      throw new ApiError('Failed to update reservation', 'UPDATE_ERROR', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Soft-delete: mark as "Annulée" instead of hard-delete
      await this.update(id, { statut: ReservationStatus.CANCELLED });
      this.cache.clear();
    } catch (error) {
      throw new ApiError('Failed to delete reservation', 'DELETE_ERROR', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchWithRetry(() =>
        this.table.select({ maxRecords: 1 }).firstPage(),
      );
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Helper: Retry logic (exponential backoff)
  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    backoff = 1000,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.statusCode !== 401) {
        // Don't retry auth errors
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchWithRetry(fn, retries - 1, backoff * 2);
      }
      throw error;
    }
  }

  // Helper: Validation
  private validateReservation(dto: CreateReservationDTO) {
    if (!dto.prenom || !dto.nom_complet) {
      throw new ApiError('First and last names required', 'VALIDATION_ERROR');
    }
    this.validateDate(dto.date_reservation);
    this.validateTime(dto.heure_reservation);
    if (dto.nombre_personne < 1 || dto.nombre_personne > 12) {
      throw new ApiError('Party size must be 1-12', 'VALIDATION_ERROR');
    }
  }

  private validateDate(date: string) {
    const parsed = new Date(date);
    if (parsed < new Date()) {
      throw new ApiError('Reservation date must be in future', 'VALIDATION_ERROR');
    }
  }

  private validateTime(time: string) {
    const validTimes = ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
    if (!validTimes.includes(time)) {
      throw new ApiError('Invalid reservation time', 'VALIDATION_ERROR');
    }
  }
}
```

### 4.4 API Routes (Express Endpoints)

```typescript
// src/routes/reservations.ts

import express, { Router } from 'express';
import { ReservationService } from '../dal/reservationService';
import { CreateReservationDTO, UpdateReservationDTO } from '../types/reservation';

export function createReservationRoutes(service: ReservationService): Router {
  const router = express.Router();

  // GET /api/reservations
  router.get('/', async (req, res) => {
    try {
      const filters = {
        date: req.query.date as string,
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const reservations = await service.getAll(filters);
      res.json({ success: true, data: reservations, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch reservations', code: 'FETCH_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // GET /api/reservations/:id
  router.get('/:id', async (req, res) => {
    try {
      const reservation = await service.getById(req.params.id);
      res.json({ success: true, data: reservation, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message, code: error.code },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // POST /api/reservations
  router.post('/', async (req, res) => {
    try {
      const dto: CreateReservationDTO = req.body;
      const reservation = await service.create(dto);
      res.status(201).json({
        success: true,
        data: reservation,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // PATCH /api/reservations/:id
  router.patch('/:id', async (req, res) => {
    try {
      const dto: UpdateReservationDTO = req.body;
      const reservation = await service.update(req.params.id, dto);
      res.json({ success: true, data: reservation, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message, code: error.code },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // DELETE /api/reservations/:id
  router.delete('/:id', async (req, res) => {
    try {
      await service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message, code: error.code },
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
```

---

## 5. Stratégie Erreurs & Résilience

### 5.1 Timeouts & Retry Logic

| Operation | Timeout | Retries | Strategy |
|-----------|---------|---------|----------|
| **Read** (GET /api/reservations) | 5s | 3x | Exponential backoff, 1s → 2s → 4s |
| **Write** (POST/PATCH/DELETE) | 10s | 3x | Exponential backoff, 2s → 4s → 8s |
| **Health check** | 2s | 1x | Fail-fast, retry next minute |

**Pseudocode :**

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialBackoff = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const result = await fn();
      clearTimeout(timeout);
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry auth errors (401, 403)
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw error;
      }

      if (attempt < maxRetries) {
        const waitTime = initialBackoff * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
```

### 5.2 Rate Limit Mitigation (300 req/min Airtable)

```
Strategy:
1. Cache 30s (avoid 3x refetches same data)
2. Debounce search/filter 300ms (avoid 5x requests per keystroke)
3. Batch updates (combine 3 status changes into 1 request, V1 optimization)
4. Queue backend (if needed V1+)

Example: User changes 5 statuses in 10 seconds
├─ Without cache : 5 + 1 (list refresh) = 6 requests → OK
├─ With debounce : 5 + 0 (cached) = 5 requests → OK
├─ If 10 concurrent users : 50 requests in 10s → 300 req/min limit OK
└─ Conclusion: V0 strategy sufficient
```

### 5.3 Fallback & Graceful Degradation

**If Airtable down :**

```
Frontend:
├─ Display cached data (30s old, label "Data may be outdated")
├─ Show error badge on Create/Update/Delete buttons (disabled)
└─ Display banner: "Connection issue. Retrying..."

Backend:
├─ Return 503 Service Unavailable (after 3 failed retries)
├─ Include retry-after header (60 seconds)
└─ Log incident for ops team

User action:
├─ Read-only mode (can view cached data)
├─ Write operations blocked + tooltip "Please try again later"
└─ Auto-refresh every 10s until Airtable recovers
```

---

## 6. Structure Projet Recommandée

```
crm-la-cigale/
├── backend/
│   ├── src/
│   │   ├── config.ts                 # Environment & validation
│   │   ├── app.ts                    # Express setup
│   │   ├── server.ts                 # Entry point (npm start)
│   │   │
│   │   ├── dal/                      # Data Access Layer
│   │   │   ├── reservationService.ts # CRUD implementation (interface IReservationService)
│   │   │   └── airtable.ts           # Airtable SDK initialization
│   │   │
│   │   ├── routes/                   # Express routes
│   │   │   └── reservations.ts       # GET/POST/PATCH/DELETE /api/reservations
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── cors.ts
│   │   │   └── logger.ts
│   │   │
│   │   ├── types/                    # TypeScript interfaces
│   │   │   ├── reservation.ts        # Domain models + DTOs
│   │   │   └── api.ts                # API response types
│   │   │
│   │   └── utils/                    # Helpers
│   │       ├── validation.ts         # Input validation
│   │       └── errors.ts             # Custom error classes
│   │
│   ├── .env.example                  # Template (versioned)
│   ├── .env                          # Local (gitignored)
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                  # React entry
│   │   │
│   │   ├── App.tsx                   # Root component
│   │   │
│   │   ├── api/                      # API client
│   │   │   └── reservationClient.ts  # Fetch wrapper (no token logic)
│   │   │
│   │   ├── components/               # Atomic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── views/                    # Page components
│   │   │   ├── ListView.tsx          # Table view
│   │   │   ├── KanbanView.tsx        # Kanban board
│   │   │   └── PlanningView.tsx      # Calendar
│   │   │
│   │   ├── hooks/                    # React hooks
│   │   │   ├── useReservations.ts    # Fetch + cache hook
│   │   │   └── useFilters.ts         # Filter state management
│   │   │
│   │   ├── state/                    # Zustand stores
│   │   │   └── reservationStore.ts   # Global state (cache)
│   │   │
│   │   ├── types/                    # TypeScript share with backend
│   │   │   └── reservation.ts        # (import from @shared)
│   │   │
│   │   └── styles/
│   │       └── tailwind.css          # Tailwind config
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── docs/
│   ├── PRD.md                        # Product Requirements
│   ├── BACKLOG.md                    # User stories
│   ├── RAID.md                       # Risks + Assumptions
│   ├── TEAM_BRIEFS.md                # Role briefs
│   └── Architecture.md               # THIS FILE
│
├── .gitignore
├── README.md
└── CHANGELOG.md
```

---

## 7. Checklist Sécurité (Pre-Deployment)

- [ ] No `.env` file in git history (`git log --all -S ".env"`)
- [ ] Airtable token stored in Render env vars (dashboard verified)
- [ ] `.env.example` present + all variables documented
- [ ] No tokens in error messages (all errors sanitized)
- [ ] Token hardcoding scan passed (`grep -r "sk_live_" src/`)
- [ ] Frontend has no Airtable API key (CORS only)
- [ ] CORS origin whitelist configured (Render domain)
- [ ] Retry logic tested (manual: kill Airtable API 3x)
- [ ] Health check endpoint working (`GET /health`)
- [ ] Rate limiting not exceeded during peak load sim
- [ ] Logs don't expose secrets (audit logs reviewed)
- [ ] Code review approved (≥1 architect)

---

## 8. Sign-off

**Architecture reviewed & approved by:**

- [ ] **Architecte Technique** : _________________ Date: _______
- [ ] **Dev Lead** : _________________ Date: _______
- [ ] **Product Owner** : _________________ Date: _______

---

**Document Version :** 1.0  
**Last Updated :** 12 avril 2024  
**Next Review :** After V0 deployment (feedback-driven iteration)
