# 🧪 Test Plan - La Cigale CRM V0

**Version:** 0.1.0  
**Date:** 10 avril 2026  
**Test Scope:** Smoke tests + E2E scenarios for MVP  
**Status:** Ready for execution

---

## 📋 Test Objectives

✅ Validate core CRUD functionality (Create, Read, Update, Delete)  
✅ Verify UI state management (Loading, Empty, Error, Success)  
✅ Confirm Airtable integration and DAL pattern  
✅ Test error handling and recovery  
✅ Document bugs with reproduction steps  

---

## 🎯 Test Environment Setup

### Prerequisites
- Node.js 20+ LTS
- npm 9+
- Airtable account with valid API credentials
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`

### Setup Steps
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Expected: "✓ Server running on http://localhost:5000"

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Expected: "✓ Local: http://localhost:3000"
```

### Test Data Preparation
1. Get Airtable PAT token: https://airtable.com/account/my-api-tokens
2. Create token with scopes: `data.records:read`, `data.records:write`, `data.records:destroy`
3. Set in `backend/.env`:
   ```
   AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx
   AIRTABLE_BASE_ID=app_xxxxxxxxxxxxx
   AIRTABLE_TABLE_NAME=Reservations
   ```
4. Clear existing test data from Airtable table (optional, safe to keep)

---

## 🚀 Smoke Tests

### ST-001: Application Load

**Description:** Verify app starts and main page renders  
**Steps:**
1. Open `http://localhost:3000` in browser
2. Wait for table to load (< 3s)
3. Check no console errors

**Expected Results:**
- ✅ Page title: "La Cigale - Réservations"
- ✅ Header navigation visible (logo, "Créer réservation" button)
- ✅ Reservation table visible with columns: Nom, Date, Heure, Nb pers, Statut, Infos, Actions
- ✅ Network tab: GET `/api/reservations` returns 200

**Acceptance Criteria:**
- Page loads in < 3 seconds
- No 404 errors
- No console errors (js, network)
- Table structure matches design_specs.md

---

### ST-002: Backend Health Check

**Description:** Verify backend API is operational  
**Steps:**
1. Open terminal with curl/Postman
2. Call: `GET http://localhost:5000/health`
3. Observe response

**Expected Results:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-10T14:30:00Z"
}
```

**Acceptance Criteria:**
- Status code: 200
- Response time: < 100ms
- Backend logs show incoming request

---

### ST-003: Airtable Connection

**Description:** Verify DAL connects to Airtable  
**Steps:**
1. Call: `GET http://localhost:5000/api/reservations`
2. Observe response

**Expected Results:**
```json
{
  "success": true,
  "data": [
    /* array of Reservation objects OR empty array if no data */
  ],
  "error": null
}
```

**Acceptance Criteria:**
- Status code: 200
- Response is valid JSON
- `data` is an array (even if empty)
- No Bearer token exposed in logs

---

### ST-004: Empty State Display

**Description:** Verify empty state when no reservations exist  
**Steps:**
1. Ensure Airtable table is empty (or table has no "Confirmée" statut)
2. Refresh page (Ctrl+R)
3. Observe empty state message

**Expected Results:**
- ✅ Message: "Aucune réservation trouvée"
- ✅ "Créer une réservation" button visible
- ✅ Button is clickable

**Acceptance Criteria:**
- Empty state renders correctly
- No skeleton loaders visible
- CTA button functional

---

## 📝 E2E Test Scenarios

### Scenario 1: Creation (TC-001)

**User Story:** US-006 - Créer une réservation  
**Complexity:** 🔴 High (form validation + API integration)

#### Steps

**1. Navigate to Create Form**
```
1. Click "Créer réservation" button (header OR empty state)
2. Observe: Modal opens with form
```

**Expected Result:**
- Modal visible with title "Créer une réservation"
- Form fields appear:
  - Prénom (text input, required)
  - Nom complet (text input, required)
  - Date (date picker, required, min today)
  - Heure (dropdown, required, 11h30-14h30 OR 19h00-22h30)
  - Nb personnes (number spinner, 1-12, required)
  - Autres infos (textarea, max 200 chars, optional)
- Submit button: "Créer"
- Cancel button: "Annuler"

**2. Fill Form with Valid Data**
```
Prénom: Jean
Nom complet: Dupont
Date: [today or future date]
Heure: 11h30
Nb personnes: 4
Autres infos: Table fenêtre, allergies: œufs
```

**Expected Result:**
- All fields accept input without errors
- Submit button enabled
- No validation errors displayed

**3. Submit Form**
```
Click "Créer" button
```

**Expected Result (Happy Path):**
- ✅ Modal closes
- ✅ New row appears in table with data
- ✅ Toast notification: "Réservation créée ✓" (green, top-right)
- ✅ Toast auto-closes after 3s
- ✅ Table refreshes (network request shows POST /api/reservations)
- ✅ New reservation has status "Attente" (blue badge)

**Expected Result (Error Path):**
- ❌ If backend down: Error banner appears "Erreur: Impossible de créer la réservation"
- ❌ Retry button visible
- ❌ Modal stays open, form data preserved

#### Validation Rules to Test

**4. Test Validation - Missing Required Fields**
```
Leave "Prénom" empty
Click "Créer"
```
**Expected:** Error message below Prénom field: "Ce champ est obligatoire"

**5. Test Validation - Invalid Date**
```
Date: [yesterday]
```
**Expected:** Error message: "Veuillez sélectionner une date actuelle ou future"

**6. Test Validation - Invalid Time Slot**
```
Heure: [16h00 - not in allowed slots]
```
**Expected:** Error message: "Créneau non disponible. Choisissez: 11h30-14h30 ou 19h00-22h30"

**7. Test Validation - Invalid Nb Personnes**
```
Nb personnes: 0
```
**Expected:** Error message: "Entre 1 et 12 personnes"

**8. Test Validation - Textarea Overflow**
```
Autres infos: [201 characters]
```
**Expected:** Either truncation or error message: "Max 200 caractères"

---

### Scenario 2: Edition (TC-002)

**User Story:** US-008 - Éditer une réservation existante  
**Complexity:** 🟠 Medium (pre-fill + update)

#### Steps

**1. Prepare Test Data**
```
Ensure at least 1 reservation exists (from TC-001 or manual creation)
```

**2. Click Edit Button on Any Row**
```
1. Locate any reservation row in table
2. Click "✏️ Éditer" button in Actions column
3. Observe: Modal opens with title "Éditer réservation"
```

**Expected Result:**
- Modal visible
- All fields pre-filled with current data
- Data matches table row (Nom, Date, etc.)
- Nb personnes field shows correct value
- Status field visible but read-only (no edit)

**3. Modify One Field (e.g., Autres infos)**
```
Autres infos: [existing] → "Table terrasse SVP, allergies: fruits secs"
```

**Expected Result:**
- Field updates in modal
- No errors
- Submit button enabled

**4. Submit Update**
```
Click "Mettre à jour" button
```

**Expected Result (Happy Path):**
- ✅ Modal closes
- ✅ Table row updates with new data
- ✅ Toast: "Réservation mise à jour ✓" (green)
- ✅ Network: PATCH /api/reservations/:id returns 200

**Expected Result (Error Path):**
- ❌ If backend down: Error banner, retry button visible
- ❌ Modal stays open, data preserved

**5. Test Edit with Invalid Data**
```
Nb personnes: 15 (out of range)
Click "Mettre à jour"
```

**Expected Result:**
- Error message: "Entre 1 et 12 personnes"
- Modal stays open
- Form data preserved

**6. Test Cancel Without Saving**
```
1. Change a field
2. Click "Annuler" button
3. Click same row "Éditer" again
```

**Expected Result:**
- Modal closes without saving changes
- Reopened modal shows original data (unchanged)

---

### Scenario 3: Suppression (TC-003)

**User Story:** US-009 - Supprimer une réservation  
**Complexity:** 🟢 Low (confirmation + soft delete)

#### Steps

**1. Locate Reservation to Delete**
```
Identify a test reservation (ideally created in TC-001)
Note the Nom for verification
```

**2. Click Delete Button**
```
Click "🗑️ Supprimer" button in Actions column
```

**Expected Result:**
- Confirmation modal appears
- Title: "Confirmer la suppression"
- Message: "Êtes-vous sûr de vouloir supprimer cette réservation ?"
- Two buttons: "Annuler" (gray), "Supprimer" (red)

**3. Click Confirm Delete**
```
Click "Supprimer" button (red)
```

**Expected Result (Happy Path):**
- ✅ Modal closes
- ✅ Row disappears from table (or status changes to "Annulée")
- ✅ Toast: "Réservation supprimée ✓" (green)
- ✅ Network: DELETE /api/reservations/:id returns 200
- ✅ Backend marks record as "Annulée" (soft delete)

**Expected Result (Error Path):**
- ❌ If backend down: Error banner with retry
- ❌ Row still visible in table

**4. Verify Soft Delete (Airtable Check)**
```
1. Go to Airtable table directly
2. Search for deleted reservation by Nom
3. Check status field
```

**Expected Result:**
- Record exists in Airtable (not hard deleted)
- Status: "Annulée"
- All other fields preserved

**5. Test Delete Cancellation**
```
1. Click "Supprimer" on any row
2. Confirmation modal appears
3. Click "Annuler" button (gray)
```

**Expected Result:**
- Modal closes
- Row still visible in table
- No network request sent
- No toast displayed

---

### Scenario 4: Changement de Statut (TC-004)

**User Story:** US-002 (partial) - Changer le statut en-ligne  
**Complexity:** 🟠 Medium (inline dropdown)

#### Steps

**1. Prepare Test Data**
```
Ensure at least 1 reservation with status "Attente" exists
```

**2. Locate Status Dropdown**
```
1. Find row with status "Attente" (blue badge)
2. Click directly on status badge
```

**Expected Result:**
- Status badge becomes interactive dropdown
- Options appear: Attente, Confirmée, Terminée, No-show, Annulée
- Current status highlighted or marked as selected

**3. Select New Status**
```
Click "Confirmée" from dropdown
```

**Expected Result (Happy Path):**
- ✅ Badge changes color (green for Confirmée)
- ✅ Badge text updates to "Confirmée"
- ✅ Toast: "Statut mis à jour ✓" (green)
- ✅ Network: PATCH /api/reservations/:id with { statut: "Confirmée" }

**Expected Result (Error Path):**
- ❌ If backend down: Error message, dropdown closes, status reverts to original

**4. Test All Status Transitions**
```
Cycle through each status option:
- Attente (blue) → Confirmée (green)
- Confirmée (green) → Terminée (dark blue)
- Terminée (dark blue) → No-show (red)
- No-show (red) → Attente (blue)
```

**Expected Result:**
- ✅ Color changes correctly per design_specs.md
- ✅ Each change shows success toast
- ✅ Network requests succeed (< 1s each)

**5. Test Status Dropdown Closure**
```
1. Open status dropdown
2. Click elsewhere on page (not on option)
```

**Expected Result:**
- Dropdown closes without changing status
- Status remains unchanged

---

### Scenario 5: Affichage Planning (TC-005)

**User Story:** US-003 - Affichage planning  
**Complexity:** 🔴 High (calendar view - NOT YET IMPLEMENTED)  
**Status:** ⏳ NOT IMPLEMENTED IN V0

#### Expected Behavior (For V0.1)
```
Navigation: Click "Planning" tab (not present in V0)
Expected: Calendar view with:
- Day/week toggle
- Créneaux displayed: 11h30-14h30, 19h00-22h30
- Reservations shown by time slot
- Click slot → view/edit reservations
```

#### Current Status
- ✅ **UI exists:** Navigation bar with "Liste" + "Planning" tabs
- ❌ **Planning view NOT implemented:** Tab visible but routes to empty page or 404
- ⏳ **Scheduled for V0.1** (with Kanban view)

#### Test Action for V0
```
TC-005-SKIP: Click "Planning" tab
Expected: Either:
  A) Empty page with "Coming Soon" message
  B) 404 error
  C) Route to placeholder component
```

---

## 🔴 Bug Reporting Template

### Bug Fields

```markdown
# BUG-XXX: [Brief Title]

**Severity:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low  
**Priority:** P0 | P1 | P2 | P3  
**Status:** New | Assigned | In Progress | Fixed | Closed  
**Component:** Frontend | Backend | DAL | UI  
**Date Found:** YYYY-MM-DD  

## Reproduction Steps

1. Step 1
2. Step 2
3. Step 3

## Actual Result

What you observe (include screenshots/console errors)

## Expected Result

What should happen

## Error Details

```
Console error:
Network request: [show request/response]
Browser: [Chrome/Firefox/Safari]
OS: [Windows/Mac/Linux]
```

## Attachments

- Screenshot
- Browser console log
- Network tab screenshot
```

---

## 📊 Test Execution Checklist

### Pre-Execution
- [ ] Backend running (http://localhost:5000/health returns 200)
- [ ] Frontend running (http://localhost:3000 loads)
- [ ] Airtable credentials configured (backend/.env)
- [ ] Browser dev tools open (F12)
- [ ] Network tab recording
- [ ] Console cleared

### Smoke Tests
- [ ] ST-001: Application Load ✅/❌
- [ ] ST-002: Backend Health Check ✅/❌
- [ ] ST-003: Airtable Connection ✅/❌
- [ ] ST-004: Empty State Display ✅/❌

### E2E Scenarios
- [ ] TC-001: Creation (happy + error paths) ✅/❌
  - [ ] Valid form submission
  - [ ] Missing field validation
  - [ ] Invalid date validation
  - [ ] Invalid time slot validation
  - [ ] Nb personnes range validation
  - [ ] Textarea overflow handling
- [ ] TC-002: Edition (pre-fill + update) ✅/❌
  - [ ] Modal pre-fills with data
  - [ ] Field modification works
  - [ ] Invalid data validation
  - [ ] Cancel preserves original
- [ ] TC-003: Suppression (soft delete) ✅/❌
  - [ ] Confirmation modal appears
  - [ ] Row removed/marked "Annulée"
  - [ ] Cancel works
- [ ] TC-004: Changement de Statut (inline) ✅/❌
  - [ ] All 5 statuses cycle correctly
  - [ ] Colors match design
  - [ ] Network requests succeed
- [ ] TC-005: Affichage Planning (V0.1) ⏳
  - [ ] Navigation tab exists
  - [ ] Current behavior documented

### Post-Execution
- [ ] All bugs filed with reproduction steps
- [ ] No critical blockers remaining
- [ ] Test results documented
- [ ] Screenshot evidence collected

---

## 🐛 Known Issues (Pre-Test Baseline)

**Status: To be updated after test execution**

| ID | Issue | Severity | Status |
|---|------|----------|--------|
| | | | |

---

## ✅ Sign-Off

**Test Engineer:** QA/Test Agent  
**Test Date:** 10 avril 2026  
**Duration:** [To be filled]  
**Overall Result:** 🔴 BLOCKED | 🟠 FAIL | 🟡 WARN | 🟢 PASS  

**Approved By:**
- [ ] QA Lead
- [ ] Dev Lead
- [ ] Product Owner

---

**Next Steps:**
- [ ] Fix critical bugs (P0/🔴)
- [ ] Retest TC-001 through TC-004
- [ ] Generate final Bug Report
- [ ] Schedule deployment to Render

