# Spécifications UX/UI - CRM La Cigale V0

**Date :** 12 avril 2024  
**Designer UX/UI :** [Équipe Design]  
**Status :** ✅ Ready for Development

---

## 1. Architecture d'Information

### 1.1 Flux Utilisateur Principal

```
App Load
  ├─ Authentication (header bar + user status*)
  │
  ├─ Navigation globale (tabs ou sidebar)
  │  ├─ 📋 Liste
  │  ├─ 🔲 Kanban
  │  └─ 📅 Planning
  │
  └─ Content zone (based on active view)
     ├─ Filters + Search bar (top)
     ├─ Main content (centre)
     └─ Actions contextuelles (bulk actions si applicable)

* V1 feature: User login/profile
```

### 1.2 Navigation Globale

**Type :** Onglets en-tête (hero navigation pattern)  
**Position :** Top sticky bar, sous le header  
**Layout :**

```
┌─────────────────────────────────────────────────────────────┐
│  🍴 La Cigale CRM        [📋 Liste | 🔲 Kanban | 📅 Planning] │
└─────────────────────────────────────────────────────────────┘
```

**Interactivité :**
- Clic onglet → switch view (smooth transition)
- Active tab = underline + couleur primaire
- État "inactive" = gris clair

**Responsive :**
- Desktop (1920x1080) : Onglets alignés horizontalement
- Tablette iPad (1024x768) : Onglets compacts, léger padding

---

### 1.3 Structure Pages

```
LISTE
  ├─ Header : "Réservations"
  ├─ Filters bar (Date | Statut multiselect | Search)
  ├─ Table
  │  ├─ Header colonnes (sortable)
  │  ├─ Rows (data)
  │  └─ Actions per row (éditer, supprimer, statut)
  └─ Pagination (optionnel si < 50)

KANBAN
  ├─ Header : "Réservations par statut"
  ├─ Filter bar (Date | Search) → columns react
  ├─ 5 Columns layout
  │  ├─ "En attente" (blue)
  │  ├─ "Confirmée" (green)
  │  ├─ "Annulée" (gray)
  │  ├─ "Terminée" (dark blue)
  │  └─ "No-show" (red)
  │
  └─ Cards (draggable)
     ├─ Nom + Date + Heure + Nb pax
     ├─ Statut badge
     └─ Hover → expand/detail button

PLANNING
  ├─ Header : "Calendrier réservations"
  ├─ Toggle day/week (top-left)
  ├─ Date navigator (prev/next + today)
  ├─ Filter bar (simplified)
  └─ Calendar view
     ├─ Vue jour (2 créneaux: midi | soir)
     └─ Vue semaine (7 jours, 2 créneaux each)
```

---

## 2. Spécifications des Vues

### 2.1 Vue Liste (Table)

#### 2.1.1 Objectif
Afficher toutes les réservations en tableau avec tri, filtre, recherche. Vue primaire pour Sophie (responsable salle). Accès rapide actions CRUD.

#### 2.1.2 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                          │
├─────────────────────────────────────────────────────────────────┤
│ Filters Bar:                                                    │
│  [Date: Aujourd'hui ▾] [Statut: All ▾] [🔍 Rechercher ...] │
│                                              [➕ Nouvelle réserv]│
├─────────────────────────────────────────────────────────────────┤
│ Table Header:                                                   │
│ │ Nom    │ Date      │ Heure  │ Nb pers │ Statut  │  Actions  │
├─────────────────────────────────────────────────────────────────┤
│ Row 1:  │ Dupont    │ 12/04  │ 19:00  │   4    │ En attente │ ⏏ │
├─────────────────────────────────────────────────────────────────┤
│ Row 2:  │ Martin    │ 12/04  │ 12:30  │   2    │ Confirmée  │ ⏏ │
├─────────────────────────────────────────────────────────────────┤
│ Row 3: │ Garcia    │ 13/04  │ 20:00  │   6    │ En attente │ ⏏ │
├─────────────────────────────────────────────────────────────────┤
│ Pagination: « 1 2 3 » (si needed)                               │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.1.3 Colonnes Affichées

| Colonne | Type | Largeur | Contenu | Tri | Responsive |
|---------|------|---------|---------|-----|-----------|
| **Nom** | Text | 20% | Prénom + Nom (ex: "Jean Dupont") | ✅ Alphabétique | ✅ Always |
| **Date** | Date | 15% | Format FR (ex: "12 avril") | ✅ Chronologique | ✅ Always |
| **Heure** | Time | 10% | Format 24h (ex: "19:30") | ✅ Chronologique | ✅ Always |
| **Nb pers** | Number | 10% | 1-12 | ✅ Numérique | ✅ Always |
| **Statut** | Badge | 15% | Colored badge + text | ✅ Par statut | ✅ Tablette hide |
| **Autres infos** | Text | 15% | Allergies/demandes (troncaturé) | ❌ | ❌ Hide mobile |
| **Actions** | Menu | 15% | Éditer, supprimer, dropdown statut | N/A | ✅ Always |

#### 2.1.4 Filtres & Recherche

**Filter 1 : Date (Multiselect)**
```
[📅 Date: ▾ ]
  ├─ Aujourd'hui (bold si selected)
  ├─ Demain
  ├─ Cette semaine
  ├─ Cette semaine +1
  └─ [✓] All dates
```

**Filter 2 : Statut (Checkbox)**
```
[🏷️ Statut: ▾ ]
  ├─ [✓] En attente
  ├─ [✓] Confirmée
  ├─ [✓] Annulée
  ├─ [ ] Terminée
  ├─ [ ] No-show
  └─ [✓] Toggle All
```

**Filter 3 : Recherche (Free text)**
```
[🔍 Chercher par nom, prénomou année... ] ✕
```

**Comportement :**
- Filters = AND logic (Date AND Statut AND Search)
- Search = partial match (typ "Dup" → "Dupont")
- Debounce 300ms avoid spam
- Clear filters button visible si ≥1 active

#### 2.1.5 Actions par Ligne

**Dropdown menu (icône ⋮) :**

```
┌─────────────────────────┐
│ ✏️ Éditer               │
├─────────────────────────┤
│ 🔄 Changer statut       │
├─────────────────────────┤
│ 🗑️ Supprimer (danger)   │
└─────────────────────────┘
```

**Interaction :**
- Hover ligne : slightly light background
- Clic ⋮ : dropdown appears (positioned right)
- Clic "Éditer" : Modal form + edit mode
- Clic "Changer statut" : Submenu 5 statuts
- Clic "Supprimer" : Confirmation modale

#### 2.1.6 États Spécifiques Liste

**Ligne réservation aujourd'hui :**
- Font weight: Bold
- Background color: Light yellow (#FFF9E6)

**Row avec allergies (autre_info ≠ empty) :**
- Icon "⚠️" minimal (2px) avant nom
- Hover → show tooltip "Allergies"

**Tri colonnes :**
- Clic header → asc/desc toggle
- Indicator (↑/↓) next to column name
- Multiple sorts N/A (single column sort only)

---

### 2.2 Vue Kanban (Drag & Drop)

#### 2.2.1 Objectif
Vue kanban par statut. Permet visualisation globale + changement statut par drag & drop. Sophie utilise pour voir "ce qui est confirmé vs attente".

#### 2.2.2 Layout

```
┌───────────────────────────────────────────────────────────────┐
│ Title: "Réservations par statut"                              │
├───────────────────────────────────────────────────────────────┤
│ Filters: [Filter date] [🔍 Search]                            │
│          (Statut filter N/A - all 5 columns always shown)    │
├───────────────────────────────────────────────────────────────┤
│                  5-Column Layout (equal width)                │
│                                                               │
│ ┌─────────┬──────────┬─────────┬─────────────┬─────────┐    │
│ │ En att. │ Confirmé │ Annulée │ Terminée    │No-show  │    │
│ │(+2)    │  (+5)    │  (+0)   │  (+8)       │(+1)    │    │
│ ├─────────┼──────────┼─────────┼─────────────┼─────────┤    │
│ │ Card 1  │ Card 1   │  (empty)│  Card 1     │ Card 1  │    │
│ │ Card 2  │ Card 2   │         │  Card 2     │         │    │
│ │ Card 3  │          │         │  Card 3     │         │    │
│ │         │          │         │  ...        │         │    │
│ └─────────┴──────────┴─────────┴─────────────┴─────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### 2.2.3 Colonnes Statuts (5 fixes)

| Colonne | Couleur | Icon | Badge Count |
|---------|---------|------|------------|
| **En attente** | #2563EB (bleu) | ⏳ | Nombre cartes |
| **Confirmée** | #16A34A (vert) | ✓ | Nombre cartes |
| **Annulée** | #71717A (gris) | ✕ | Nombre cartes |
| **Terminée** | #1E3A8A (bleu foncé) | ✔️ | Nombre cartes |
| **No-show** | #DC2626 (rouge) | ⚠️ | Nombre cartes |

#### 2.2.4 Cartes Réservation (Drag-able)

```
┌──────────────────────────┐
│ Jean Dupont              │  ← Nom (bold, tight)
│ 12 avril, 19:30 • 4 pax │  ← Meta (compact, gray)
│                          │
│ [⚠️ Allergies]          │  ← Optional: icon si other_info
└──────────────────────────┘
```

**Card styling :**
- Background : White
- Border-radius : 4px
- Box-shadow : Light (0 1px 3px rgba(0,0,0,0.1))
- Padding : 12px
- Font : 14px body text
- Cursor : grab (while dragging)

**Interaction :**
- Hover → elevation shadow increase
- Drag → opacity 0.7, cursor grabbing
- Drop → smooth animation to new column
- Double-click → expand/modal detail

#### 2.2.5 Drag & Drop Behavior

```
User drags "Jean Dupont" from "En attente" → "Confirmée":
1. Card opacity 0.7 (visual feedback)
2. Drop zone highlight (light background)
3. Release → API PATCH /api/reservations/:id
   Payload: { statut: "Confirmée" }
4. Success → Toast "Réservation confirmée" + animate card to new column
5. Error → Card returns to old column + error toast
```

**Validation :**
- Dragging within same column = no-op
- Drag to invalid column = not allowed (visual block)
- Network error during drop → rollback + error message

#### 2.2.6 Tri au Sein d'Une Colonne

Cartes dans chaque colonne = trié par date (ascending).
Exemple colonne "En attente" :
```
Card 1 : 12 avril, 11:30
Card 2 : 12 avril, 20:00
Card 3 : 13 avril, 12:00
```

#### 2.2.7 États Spécifiques Kanban

**Colonne vide :**
```
┌────────────────────┐
│ Annulée            │
│ (0 réservations)   │
│                    │
│  [ Aucune ]        │
│                    │
└────────────────────┘
```

**Pagination/Virtualisation :**
Si > 100 cartes total → virtualisation (render only visible cards)

---

### 2.3 Vue Planning (Calendrier)

#### 2.3.1 Objectif
Calendrier jour/semaine pour visualiser les créneaux disponibles. Jean (gérant) prioritaire. Sophie aussi utilise pour quick planning view.

#### 2.3.2 Layout Vue Jour

```
┌──────────────────────────────────────────────────────┐
│ [← 11 avril 2024 →] [Jour] [Semaine] [Aujourd'hui] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Midi (11h30-14h30)                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ 11:30-12:00: [Dupont • 2 pax]                 │ │
│  │ 12:00-12:30: [ Libre ]                        │ │
│  │ 12:30-13:00: [Martin • 4 pax]                 │ │
│  │ 13:00-13:30: [Garcia • 6 pax]                 │ │
│  │ 13:30-14:00: [ Libre ]                        │ │
│  │ 14:00-14:30: [ Libre ]                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Soir (19h00-22h30)                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ 19:00-19:30: [ Libre ]                        │ │
│  │ 19:30-20:00: [Petit • 2 pax] ⚠️ Allergies    │ │
│  │ 20:00-20:30: [✅ Confirmée]                  │ │
│  │ 20:30-21:00: [ Libre ]                        │ │
│  │ 21:00-21:30: [ Libre ]                        │ │
│  │ 21:30-22:00: [ Libre ]                        │ │
│  │ 22:00-22:30: [ Libre ]                        │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

#### 2.3.3 Layout Vue Semaine

```
┌────────────────────────────────────────────────────────────────┐
│ Semaine du 8-14 avril [← Sem prec | Sem suivante →] [Auj]   │
├────────────────────────────────────────────────────────────────┤
│ Créneau │ Lun 8  │ Mar 9 │ Mer 10 │ Jeu 11 │ Ven 12│ Sam 13 │
├────────────────────────────────────────────────────────────────┤
│ Midi    │ [Free] │[Dup]  │ [Free] │ [Free] │[Free] │[Conf] │
├────────────────────────────────────────────────────────────────┤
│ Soir    │ [2pax] │[Free] │ [4pax] │ [Free] │[Free] │[Free] │
├────────────────────────────────────────────────────────────────┤
```

#### 2.3.4 Réservation Display in Planning

**Slot occupé = Réservation Card :**
```
[Dupont • 2 pax]  ← Nom + nb personnes

Colors by status:
├─ En attente : 🔵 Bleu (#2563EB)
├─ Confirmée  : 🟢 Vert (#16A34A)
├─ Annulée    : ⚫ Gris (#71717A)
├─ Terminée   : 🔷 Bleu foncé (#1E3A8A)
└─ No-show    : 🔴 Rouge (#DC2626)
```

**Slot libre :**
```
[ Libre ]  ← Gray text, no background
(Clickable pour création rapide)
```

#### 2.3.5 Interactions Planning

**Hover sur réservation :**
- Background slight highlight
- Cursor pointer
- Tooltip: "Cliquer pour détails"

**Click sur réservation :**
- Modal détails s'ouvre (same as Liste)

**Click sur [ Libre ] slot :**
- Form modal creation s'ouvre
- Date + heure pré-rempli
- Focus sur champ "Nom"

**Navigation date :**
- Vue jour : Prev/Next arrow change day (±1 jour)
- Vue semaine : Prev/Next arrow change week (±7 jours)
- "Aujourd'hui" button : jump to today

---

## 3. Composants Réutilisables

### 3.1 Formulaire Réservation (Create/Edit Modal)

#### Layout

```
┌─────────────────────────────────────────────────┐
│ ✕                                               │
│ Nouvelle réservation                            │
├─────────────────────────────────────────────────┤
│                                                 │
│ Nom complet *                                   │
│ [________________________]  (placeholder: ex)   │
│ (error msg en rouge below)                     │
│                                                 │
│ Prénom *                                        │
│ [________________________]                      │
│                                                 │
│ Date *                                          │
│ [📅 ________________ ▾]  (date picker)        │
│ (min = aujourd'hui)                            │
│                                                 │
│ Heure *                                         │
│ [🕐 ________________ ▾]  (select timeslot)    │
│ Options: 11:30, 12:00, 12:30, ..., 14:30,    │
│           19:00, 19:30, ..., 22:30             │
│                                                 │
│ Nombre de personnes *                          │
│ [  1  ⊕ ⊖  12  ]  (stepper or number input)  │
│ (min 1, max 12)                                │
│                                                 │
│ Informations complémentaires (allergies, etc.) │
│ [________________________]                      │
│ [________________________]  (textarea, max 200) │
│ (placeholder: "Allergie(s), demande special")  │
│                                                 │
│         [Annuler] [Enregistrer]               │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Comportement

**Validation :**
- Real-time inline feedback
- Submit btn disabled si errors
- Message d'erreur en-dessous du champ (red)

**Exemples messages :**
```
Nom complet : "Le nom est obligatoire"
Date : "La date doit être dans le futur"
Heure : "Créneau invalide"
Nb personnes : "Entre 1 et 12 personnes"
```

**Submit :**
- Loading state : spinner + btn disabled
- Success → Toast + Modal close
- Error → Toast + Form stay open (allow retry)

### 3.2 Modale Confirmation (Suppression)

```
┌──────────────────────────────────┐
│ Confirmer la suppression          │
├──────────────────────────────────┤
│                                  │
│ Êtes-vous sûr de vouloir         │
│ supprimer cette réservation ?    │
│                                  │
│ Nom: Jean Dupont                 │
│ Date: 12 avril 2024, 19:30       │
│                                  │
│   [Annuler]  [Supprimer]        │
│                (danger style)   │
│                                  │
└──────────────────────────────────┘
```

**Interaction :**
- Click outside (ESC) → cancel
- Click "Annuler" → close
- Click "Supprimer" (red) → API DELETE + close + toast

---

### 3.3 Modale Détails (Modal Read-Only)

```
┌───────────────────────────────────────┐
│ ✕ Détails réservation                 │
├───────────────────────────────────────┤
│                                       │
│ Nom complet: Jean Dupont             │
│ Prénom: Jean                         │
│ Date: 12 avril 2024                  │
│ Heure: 19:30                         │
│ Nombre de personnes: 4               │
│                                       │
│ Informations complémentaires:        │
│ ❗ Allergies cacahuètes              │
│                                       │
│ Statut: En attente 🔵               │
│                                       │
│   [Éditer]  [Supprimer]  [Close]    │
│                                       │
└───────────────────────────────────────┘
```

### 3.4 Barre Filtre Réutilisable

```
┌─────────────────────────────────────┐
│ [Date ▾] [Statut ▾] [🔍 Search...]  │
└─────────────────────────────────────┘
```

### 3.5 Badge Statut

| Statut | Couleur | Icon |
|--------|---------|------|
| En attente | Bleu #2563EB | ⏳ |
| Confirmée | Vert #16A34A | ✓ |
| Annulée | Gris #71717A | ✕ |
| Terminée | Bleu foncé #1E3A8A | ✔ |
| No-show | Rouge #DC2626 | ⚠ |

---

## 4. États UI (4 Loadings + Messages)

### 4.1 État Loading

**Skeleton Screen (Table Liste) :**
```
┌─────────────────────────────────────┐
│ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯        │  (Animated shimmer)
├─────────────────────────────────────┤
│ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯        │
│ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯        │
│ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯ │ ▯▯▯▯        │
└─────────────────────────────────────┘
```

**Spinner (Modal, small areas) :**
```
    ⟳
(rotating icon, 24x24)
"Chargement..."
```

**Duration :**
- Max 10s avant timeout error
- Afficher message "Chargement en cours..." pendant < 2s

### 4.2 État Empty State

**Aucune réservation (Liste) :**
```
┌─────────────────────────────────────┐
│                                     │
│           📭 Aucune réservation    │
│                                     │
│    Il n'y a pas de réservation     │
│    pour cette période.              │
│                                     │
│     [+ Créer une réservation]       │
│                                     │
└─────────────────────────────────────┘
```

**Empty state styles :**
- Icon: large (64x64), gray
- Message: center-aligned, 16px body text
- CTA button: Primary blue

### 4.3 État Error

**Banner Error (top of page) :**
```
┌─────────────────────────────────────┐
│ ⚠️  Erreur                           │
│ Impossible de charger les données.  │
│ [Réessayer]                        │
└─────────────────────────────────────┘
```

**Error messages (context-specific) :**

| Situation | Message | Action |
|-----------|---------|--------|
| API timeout | "La requête a pris trop de temps. Réessayer ?" | [Retry] button |
| Network down | "Vérifiez votre connexion Internet." | Auto-retry 10s |
| 401 Unauthorized | "Session expirée. Veuillez vous reconnecter." | Redirect login |
| 400 Validation | "[Field]: La valeur est invalide." | Keep form open |
| 429 Rate limit | "Trop de demandes. Patientez quelques secondes." | Auto-retry 5s |
| 500 Server error | "Erreur serveur. L'équipe a été notifiée." | [Contact support] |

**Styling :**
- Background: #FEE2E2 (light red)
- Border-left: 3px #DC2626 (red)
- Icon: ⚠️ orange
- Text: 14px, dark gray

### 4.4 État Success (Toast)

**Toast Notification (top-right corner) :**
```
┌────────────────────────────┐
│ ✓ Réservation créée        │
│   Dupont à 19h30           │
│                            │ (auto-close 3s)
└────────────────────────────┘
```

**Messages par action :**

| Action | Message |
|--------|---------|
| Create | "✓ Réservation créée (Nom, Date + Heure)" |
| Update | "✓ Réservation modifiée" |
| Delete | "✓ Réservation supprimée" |
| Status change | "✓ Statut changé en [Confirmée]" |

**Styling :**
- Background: #DCFCE7 (light green)
- Border: 1px #16A34A (green)
- Icon: ✓ green
- Duration: 3s auto-close
- Position: top-right (floating, z-index high)

---

## 5. Microcopy & Messages

### 5.1 Labels & Placeholders

| Element | Label/Placeholder | Notes |
|---------|------------------|-------|
| **Form - Nom complet** | "Nom complet *" | Placeholder: "ex: Dupont" |
| **Form - Prénom** | "Prénom *" | Placeholder: "ex: Jean" |
| **Form - Date** | "Date de réservation *" | Placeholder: "12 avril 2024" |
| **Form - Heure** | "Heure *" | Placeholder: "19:30" (list select) |
| **Form - Nb pax** | "Nombre de personnes *" | Placeholder: "4" (or stepper) |
| **Form - Autres infos** | "Informations complémentaires" | Placeholder: "Allergies, demandes spéciales..." |
| **Search bar** | "🔍 Chercher par nom..." | Clear with ✕ button |

### 5.2 Boutons & CTAs

| Bouton | Type | Message |
|--------|------|---------|
| **Créer réservation** | Primary (CTA) | "+ Nouvelle réservation" |
| **Enregistrer/Save** | Primary | "Enregistrer" |
| **Annuler** | Secondary | "Annuler" |
| **Supprimer** | Danger (red) | "Supprimer" |
| **Réessayer** | Primary | "Réessayer" |
| **Éditer** | Secondary | "✏️ Éditer" |
| **Changer statut** | Secondary | "🔄 Changer statut" |

### 5.3 Messages de Validation

**Field-level errors (inline below field) :**

| Rule | Message |
|------|---------|
| Required | "Ce champ est obligatoire" |
| Invalid date | "La date doit être dans le futur" |
| Invalid time slot | "Créneau invalide (11h30-14h30 ou 19h00-22h30)" |
| Party size out of range | "Entre 1 et 12 personnes" |
| Max char exceeded | "Maximum 200 caractères" |
| Name too short | "Le nom doit contenir au moins 2 caractères" |

### 5.4 Messages Contextuels

| Contexte | Message | Tone |
|----------|---------|------|
| **No results** | "Aucune réservation trouvée pour cette recherche." | Neutral |
| **Confirm delete** | "Êtes-vous sûr de vouloir supprimer cette réservation ?" | Cautious |
| **Success create** | "Réservation de [Nom] créée pour le [Date] à [Heure]." | Positive |
| **Loading** | "Chargement des réservations..." | Neutral |
| **Connection issue** | "Impossible de charger les données. Réessayez." | Urgent |

---

## 6. Design System Minimaliste

### 6.1 Palette Couleurs

**Primaires :**
```
Bleu principal      : #2563EB (CTA, navigation active)
Vert complément     : #16A34A (Success, Confirmée status)
Gris neutre        : #71717A (Disabled, Annulée status)
```

**Statuts :**
```
En attente  : #2563EB (Bleu clair)
Confirmée   : #16A34A (Vert)
Annulée     : #71717A (Gris)
Terminée    : #1E3A8A (Bleu foncé)
No-show     : #DC2626 (Rouge)
```

**Feedback :**
```
Success     : #16A34A (Vert)
Error       : #DC2626 (Rouge)
Warning     : #F59E0B (Amber)
Info        : #3B82F6 (Bleu)
```

**Neutrals :**
```
Noir        : #000000 (Text primary)
Gris foncé  : #374151 (Text secondary)
Gris moyen  : #9CA3AF (Text tertiary)
Gris clair  : #E5E7EB (Borders, dividers)
Blanc       : #FFFFFF (Background)
```

### 6.2 Typographie

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-----------|
| **H1** | System stack | 28px | Bold | 1.3 |
| **H2** | System stack | 24px | Bold | 1.3 |
| **H3** | System stack | 20px | Bold | 1.4 |
| **Body** | System stack | 16px | Regular | 1.5 |
| **Small** | System stack | 14px | Regular | 1.5 |
| **Tiny** | System stack | 12px | Regular | 1.4 |

**Font family:**
```
Mac : -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Windows : "Segoe UI", Tahoma, Geneva, Verdana, sans-serif
Generic fallback : sans-serif
```

### 6.3 Espacements (Système 8px)

| Scale | Value | Usage |
|-------|-------|-------|
| 2xs | 4px | Micro spacing |
| xs | 8px | Padding small, gaps |
| sm | 12px | Component padding |
| md | 16px | Standard padding, margins |
| lg | 24px | Section margins |
| xl | 32px | Page-level margins |
| 2xl | 40px | Large sections |

### 6.4 Composants de Base

#### Bouton

```
Primary Button:
  Padding: 12px 24px
  Border-radius: 4px
  Background: #2563EB
  Text color: white
  Hover: #1D4ED8 (darker)
  Active: #1E40AF (even darker)
  Disabled: #D1D5DB (gray), cursor: not-allowed

Secondary Button:
  Padding: 12px 24px
  Border: 1px solid #E5E7EB
  Background: white
  Text color: #374151
  Hover: #F3F4F6
  Active: #E5E7EB
  Disabled: #F3F4F6

Danger Button (red):
  Background: #DC2626
  Hover: #B91C1C
  Active: #991B1B
```

#### Input Field

```
Height: 40px
Padding: 0 12px
Border: 1px solid #E5E7EB
Border-radius: 4px
Font: 16px body

States:
  Default : border #E5E7EB
  Focus   : border #2563EB, box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
  Error   : border #DC2626, background: #FEE2E2
  Disabled: background: #F3F4F6, cursor: not-allowed
```

#### Badge Statut

```
Padding: 6px 12px
Border-radius: 16px (pill-like)
Font-size: 12px
Font-weight: 600
Icon: 16x16 (before text)

Coloring:
  Background: Tinte de couleur primaire (20% opacity)
  Text: Couleur primaire (100%)
```

#### Modal

```
Background: white
Border-radius: 8px
Box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15)
Max-width: 500px (desktop)
Padding: 24px
Close button (✕): top-right
Overlay: rgba(0, 0, 0, 0.5), non-dismissible by default
```

---

## 7. Checklist Accessibilité (WCAG AA Minimum)

- [ ] Contraste couleurs ≥ 4.5:1 (text vs background)
- [ ] Focus visible sur ALL éléments interactifs
- [ ] Labels explicites sur tous les inputs (not placeholder only)
- [ ] Error messages liés aux champs (aria-describedby)
- [ ] Boutons have text OR aria-label (not icons only)
- [ ] Keyboard navigation support (Tab, Enter, ESC)
- [ ] Form validation errors announced (aria-live)
- [ ] Modal traps focus (not escape to body)
- [ ] Images/icons have alt text or aria-label
- [ ] Color not the only differentiator (use icons + text)
- [ ] Respects prefers-reduced-motion (animations)

---

## 8. Responsive Design

### Breakpoints

```
Mobile    : < 640px (not V0 priority)
Tablet    : 640px - 1024px (iPad prioritaire)
Desktop   : > 1024px (primary)
```

### Desktop (1920x1080)

- Full-width table/kanban
- All columns visible
- Comfortable spacing

### Tablet (iPad 1024x768)

- Slightly compressed table
- Hide "Autres infos" column
- Kanban = 3-4 cols per row (scannable)
- Touch-friendly targets (48px min)

---

## 9. Validation Conformité

**Cette spec map to BACKLOG user stories :**

| US ID | Title | Spec Section |
|-------|-------|--------------|
| US-001 | Vue Liste | 2.1 |
| US-002 | Vue Kanban | 2.2 |
| US-004 | Vue Planning | 2.3 |
| US-006 | Créer réservation | 3.1 |
| US-008 | Éditer réservation | 3.1 (Edit mode) |
| US-009 | Supprimer réservation | 3.2 |
| US-007 | Voir allergies | 3.3 (Modal détails) |
| US-003 | Recherche | 5.1 (Search bar) |
| US-002 | Changer statut | 3.1, 3.2 (Kanban drag) |

---

## 10. Sign-off

**Spécifications UX/UI approuvées par:**

- [ ] **Designer UX/UI** : _________________ Date: _______
- [ ] **Product Owner** : _________________ Date: _______
- [ ] **Dev Lead** : _________________ Date: _______

---

**Document Version :** 1.0  
**Last Updated :** 12 avril 2024  
**Ready for Dev Implementation :** ✅
