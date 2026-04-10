# Backlog Produit - La Cigale CRM V0

---

## Definition of Done V0 (LECTURE OBLIGATOIRE)

**V0 = Production Ready uniquement si tous critères sont validés :**

### DoD Story Level (Chaque User Story Doit Satisfaire)
- ✅ Critères d'acceptation BACKLOG respectés 100%
- ✅ Happy path codé + testé manuellement
- ✅ Edge cases gérés (dates invalid, nb pax > 12, etc.)
- ✅ 4 États UI présents si applicable (loading/empty/error/success)
- ✅ Messages utilisateur clairs (pas de jargon tech)
- ✅ Code review approuvé (≥1 dev)
- ✅ Design specs respectées
- ✅ Tests QA exécutés

### DoD Sprint/Itération Level
- ✅ TOUTES les US de l'itération = Done (critère story)
- ✅ CRUD complet opérationnel
- ✅ Au minimum 1 vue complètement fonctionnelle
- ✅ Zéro secret en code (scan auto)
- ✅ Variables d'env configurées (Render)
- ✅ `.env` dans `.gitignore` (vérification git)
- ✅ Smoke tests passent (app lance, CRUD works, 0 crash)
- ✅ Bugs bloquants (P0/P1) = 0
- ✅ CHANGELOG mis à jour
- ✅ README permet setup par tiers

### DoD V0 Global (Before Production Deployment)
- ✅ 3 vues opérationnelles (Liste/Kanban/Planning)
- ✅ CRUD complet (Créer/Lire/Modifier/Supprimer)
- ✅ Recherche + Filtres fonctionnels
- ✅ Gestion erreurs (4 états dans chaque vue)
- ✅ Performance < 3s load, < 1s actions
- ✅ Responsive (Desktop 1920x1080 min)
- ✅ Zéro secret exposé
- ✅ ≥10 scénarios test du Test_Plan passent
- ✅ Aucun bug P0/P1 (0 bloquants)
- ✅ 5 rôles sign-off (Architecte, Designer, Dev, QA, PO)

**GO/NO-GO Decision :**
- **GO** = ✅ Tous critères validés + 0 bugs P0/P1
- **NO-GO** = ❌ Critères manquants OU bugs P0/P1 ouverts
- **GO avec réserves** = 90-95% critères + P2 bugs only (fix v0.1)

---

## Vue d'ensemble du Backlog

**Objectif V0 :** Livrer une MVP fonctionnelle centralisée autour de 3 vues (Liste/Kanban/Planning) avec CRUD complet et sécurité.

**Stratégie de priorisation :**
- **P0** = Bloquant pour opérations salle (indispensable livraison V0)
- **P1** = Important mais adaptable (peut être reporté en V0.1 si problèmes dev)
- **P2** = Nice-to-have (V1+)

**Estimation complexité :**
- **S** = Simple (< 4h dev, pas de dépendances)
- **M** = Medium (4-16h dev, peut avoir dépendances)
- **L** = Large (> 16h dev, dépendances multiples, risques techniques)

---

## Epic 1 : Consultation & Visualisation des Réservations

### US-001 : Vue Liste des Réservations

**User Story :**
En tant que Sophie (responsable salle), je veux voir toutes mes réservations du jour en table pour faire un tri inicial et identifier rapidement les clients arrivants.

**Description :**
Afficher une table avec colonnes : Nom, Date, Heure, Nb personnes, Statut, Autres infos. Ligne surlignée si réservation du jour. Actions éditer/supprimer/changer statut par ligne.

**Critères d'acceptation :**
- [ ] Table charge et affiche ≥ 10 réservations sans lag
- [ ] Colonnes alignées et lisibles (responsive)
- [ ] Sorting fonctionne : clic colonne toggle asc/desc
- [ ] Ligne réservation jour = mise en évidence visuelle (gras, fond léger)
- [ ] Actions (éditer, supprimer, statut) accessibles par icônes/dropdown
- [ ] Empty state affiché si 0 réservations pour filtre
- [ ] Loading skeleton affiché le temps du chargement API

**Dépendances :**
- DAL Airtable (getAll, getFiltered)
- Composant Table réutilisable
- Design system cols

**Complexité :** **M**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-002 : Vue Kanban par Statut

**User Story :**
En tant que Sophie, je veux voir mes réservations en colonnes par statut (En attente, Confirmée, Annulée, Terminée, No-show) pour identifier en un coup d'oeil ce qui est confirmé vs. en attente.

**Description :**
Interface Kanban avec 5 colonnes fixes, cartes réservations (compact : Nom + DATE + HEURE + Nb pax). Drag & drop pour changer statut. Clic pour voir détails.

**Critères d'acceptation :**
- [ ] 5 colonnes statut = couleur distinct (bleu/vert/gris/bleu foncé/rouge)
- [ ] Drag & drop fonctionne, statut mis à jour en DB
- [ ] Cartes affichent : Nom, Date, Heure, Nb personnes (format compact)
- [ ] Clic carte = modal détail avec toutes les infos + actions
- [ ] Tri optionnel par date dans colonnes
- [ ] Pagination/virtualisation si > 100 cartes total
- [ ] Loading state pendant chargement

**Dépendances :**
- DAL update (changement statut)
- Librairie drag & drop (react-beautiful-dnd, Dnd Kit, vue-draggable)
- Composant Modal détails

**Complexité :** **M**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1-2

---

### US-003 : Vue Planning Jour/Semaine

**User Story :**
En tant que Jean (gérant), je veux voir un planning calendaire semaine/jour pour vérifier la charge globale et les créneaux disponibles.

**Description :**
Calendrier jour/semaine avec 2 créneaux par jour : midi (11h30-14h30) et soir (19h00-22h30). Chaque créneau affiche réservations superposées (horaires exactes). Toggle day/week view. Clic sur créneau vide = création rapide.

**Critères d'acceptation :**
- [ ] Vue jour : 2 colonnes créneaux, réservations affichent heure exacte + nom
- [ ] Vue semaine : 7 jours colonnes, même layout
- [ ] Toggle day/week fonctionne, state persiste (sessionStorage)
- [ ] Coulor-coding par statut (vert confirmée, bleu attente, gris annulée)
- [ ] Clic sur créneau libre = formulaire création pré-rempli (date+heure)
- [ ] Clic sur réservation = modal détail
- [ ] Navigation avant/après (next/prev semaine/jour)
- [ ] Empty state si 0 réservations

**Dépendances :**
- Librairie calendrier (FullCalendar, TanStack React Grid, custom timeline)
- DAL getByDateRange
- Formulaire création réservation
- Modal détails

**Complexité :** **L**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 2-3

---

## Epic 2 : Gestion des Réservations (CRUD)

### US-004 : Créer une Réservation

**User Story :**
En tant que Sophie, je veux créer rapidement une nouvelle réservation avec validation des créneaux pour ne pas oublier un client.

**Description :**
Formulaire modal/page : Nom, Prénom, Date (date picker), Heure (select créneaux), Nb personnes (1-12), Autres infos (optional). Validation front côté client. Bouton "Enregistrer" crée en Airtable via API.

**Critères d'acceptation :**
- [ ] Form modal s'ouvre avec 5 champs visibles
- [ ] Date picker = only future dates selectable
- [ ] Heure select = only 11h30, 12h00, ..., 14h30 ou 19h00, ..., 22h30
- [ ] Nb personnes = slider ou input 1-12
- [ ] Validation real-time : messages inline si invalid
- [ ] Bouton "Enregistrer" disabled si invalid
- [ ] Succès = toast "Réservation créée" + modal ferme + table refresh
- [ ] Erreur API = toast "Erreur, réessayer" + retry button
- [ ] Statut par défaut = "En attente"
- [ ] Nb personnes validé vs. créneau disponibilité (ex: 12 pers peut être limité si peak)

**Dépendances :**
- DAL create
- ValidationUtil (date, heure, nb pax)
- Composant Form réutilisable
- Toast notifications

**Complexité :** **M**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-005 : Éditer une Réservation Existante

**User Story :**
En tant que Sophie, je veux modifier une réservation existante (date, heure, nb personnes) pour adapter aux changements clients.

**Description :**
Form edit (modal ou inline) pré-remplie avec infos actuelles. Mêmes validations que créatio. Bouton "Enregistrer" met à jour Airtable. Confirmation avant de sauvegarder.

**Critères d'acceptation :**
- [ ] Edit action ouvre form pré-rempli (toutes valeurs actuelles)
- [ ] Validation identique création
- [ ] Changement date = vérifier disponibilité créneau
- [ ] Confirmation modale avant update ("Êtes-vous sûr ?")
- [ ] Succès = toast "Modifié" + table refresh
- [ ] Erreur = toast retry
- [ ] Undo optionnel (V1)

**Dépendances :**
- DAL update
- Form component
- Validation util

**Complexité :** **M**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1-2

---

### US-006 : Supprimer une Réservation

**User Story :**
En tant que Sophie, je veux supprimer une réservation erronée avec confirmation pour éviter suppressions accidentelles.

**Description :**
Action "Supprimer" par ligne. Modale confirmation : "Êtes-vous sûr ? Cette action est irréversible" + Boutons Annuler/Confirmer. Si confirmé, hard-delete en Airtable (ou soft-delete = marquer"Annulée").

**Critères d'acceptation :**
- [ ] Icône poubelle visible par ligne
- [ ] Clic = modale confirmation
- [ ] Bouton "Confirmer" rouge/destructif
- [ ] Succès = toast "Réservation supprimée" + table refresh
- [ ] Erreur API = toast retry
- [ ] Soft-delete recommandé (marquer "Annulée" instead de supprimer)

**Dépendances :**
- DAL delete ou update status
- Modale confirmation reusable
- Toast

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-007 : Changer le Statut d'une Réservation

**User Story :**
En tant que Sophie, je veux changer le statut d'une réservation (En attente → Confirmée → Terminée) en 1 clic pour suivre l'engagement client.

**Description :**
Statut = dropdown inline (clic = select nouvel état). 5 options : "En attente", "Confirmée", "Annulée", "Terminée", "No-show". Update direct en Airtable.

**Critères d'acceptation :**
- [ ] Statut = dropdown colored (par défaut couleur actuel)
- [ ] Clic = expose 5 options
- [ ] Sélection = update immédiat (optimistic UI)
- [ ] Undo si erreur (V1)
- [ ] Erreur API = rollback visuel + retry
- [ ] Statut "No-show" = marqueur rouge
- [ ] Statut "Terminée" = archivé visuellement (grisé)

**Dépendances :**
- DAL update
- Dropdown component

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

## Epic 3 : Recherche & Filtrage

### US-008 : Rechercher une Réservation par Nom

**User Story :**
En tant que Marc (serveur), je veux chercher une réservation par nom pour retrouver les infos clients rapidement à l'accueil.

**Description :**
Search bar en-tête table (Vue Liste). Filtre en temps réel par nom/prénom. Debounce 300ms pour ne pas spammer API.

**Critères d'acceptation :**
- [ ] Search bar visible en-tête
- [ ] Frappe = filtre immédiat (300ms debounce)
- [ ] Affiche réservations matchantes (partial match ok)
- [ ] Clear button visible si texte présent
- [ ] Search combo = AND entre filtre date + statut (si actifs)
- [ ] Empty state si 0 results

**Dépendances :**
- DAL getFiltered (by name)
- Debounce utility
- Search component

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-009 : Filtrer par Date et Statut

**User Story :**
En tant que Sophie, je veux filtrer les réservations par date (aujourd'hui, demain, cette semaine) et par statut pour ne voir que ce qui m'intéresse.

**Description :**
Filtres multi-sélect dans barre d'en-tête Liste. Preset dates : "Aujourd'hui", "Demain", "Cette semaine", "Toutes". Statuts : checkboxes "En attente", "Confirmée", "Annulée", "Terminée", "No-show".

**Critères d'acceptation :**
- [ ] Onglets/buttons date presets
- [ ] Checkboxes statut multiselect
- [ ] Filtre immediate sur click
- [ ] Combinaison filters appliquée (date AND statut)
- [ ] Clear filters button visible si filters actifs
- [ ] State persiste sessionStorage
- [ ] Empty state si 0 results

**Dépendances :**
- DAL getFiltered (date range + status array)
- Filter components
- Date utility

**Complexité :** **M**
**Priorité :** **P1**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 2

---

## Epic 4 : Détails & Infos Complémentaires

### US-010 : Afficher Détails Réservation (Modal/Page)

**User Story :**
En tant que Marc (serveur), je veux voir toutes les infos d'une réservation (allergies, demandes spéciales) directement sur la fiche pour ne pas oublier à l'accueil.

**Description :**
Clic sur réservation (ligne table, carte Kanban, bloc Planning) = modal/panel latéral avec infos complètes : Nom, Date, Heure, Nb personnes, Allergies/demandes, Historique mods.

**Critères d'acceptation :**
- [ ] Modal affiche toutes les colonnes Airtable (sauf token API key)
- [ ] Autres infos = section mise en évidence (couleur alerte si présent)
- [ ] Format date/heure = lisible (ex: "Jeudi 12 avril 2024, 19h30")
- [ ] Boutons actions : Éditer, Supprimer, Changer statut
- [ ] Close button visible
- [ ] Historique modifications (timestamps) = V1

**Dépendances :**
- Modal component
- DateFormatter utility

**Complexité :** **S**
**Priorité :** **P1**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1-2

---

## Epic 5 : Sécurité & Infrastructure

### US-011 : Intégration Sécurisée Airtable API (DAL)

**User Story :**
En tant qu'Admin, je veux que le système charge correctement les données d'Airtable sans exposer mes tokens API pour la sécurité.

**Description :**
DAL (Data Access Layer) backend centralise tous les appels Airtable. Frontend appelle endpoint backend qui authentifie via token env var. Zéro token front-accessible.

**Critères d'acceptation :**
- [ ] DAL backend implémente : getAll, getById, create, update, delete
- [ ] Token AIRTABLE_API_KEY = variable d'env (Render env vars)
- [ ] Frontend appelle API REST backend, pas Airtable directement
- [ ] Erreurs API = loggées backend (pas exposées client)
- [ ] Timeouts: 5s read, 10s write
- [ ] Retry logic : 3 attempts sur erreur réseau
- [ ] CORS = whitelist origin (ex: https://crm-la-cigale.render.com)

**Dépendances :**
- Backend framework (Express/Fastify/Hono)
- Airtable package (airtable.js)
- Environment variable management

**Complexité :** **M**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack + Architecte
**Sprint :** V0 Itération 1 (fondation)

---

### US-012 : Configuration Variables d'Environnement

**User Story :**
En tant que Developer, je veux gérer des secrets (tokens API) via variables d'environnement pour éviter expositions.

**Description :**
.env file (gitignore) + .env.example (versioned, sans valeurs). Render Environment Variables configurées. Application lit depuis process.env.

**Critères d'acceptation :**
- [ ] .env.example listé (placeholder values)
- [ ] .env = .gitignore
- [ ] Process.env check au startup (error si manquant)
- [ ] Doc clear : "Copier .env.example → .env" + populate values
- [ ] Render UI : env vars configurables
- [ ] Secret manager (Vault) optionnel V1

**Dépendances :**
- Dotenv package
- README instructions

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1 (baseline)

---

## Epic 6 : Gestion Erreurs & États

### US-013 : Gérer État Loading

**User Story :**
En tant que Sophie, je veux une indication claire que le système charge les données pour ne pas penser qu'il est bloqué.

**Description :**
Skeleton screens (placeholder gris animé) ou spinner centric sur table/Kanban/planning pendant API call. Message optionnel "Chargement en cours...".

**Critères d'acceptation :**
- [ ] Skeleton = même layout que contenu réel (colonnes table, etc.)
- [ ] Animation fluide (pas clignotement)
- [ ] Timeout 10s : si pas de data, affiche error state
- [ ] Texte "Chargement..." visible sous skeleton
- [ ] Loading = désactiver interactions (no clicks)

**Dépendances :**
- Skeleton component library
- Loading state management

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-014 : Gérer État Empty State

**User Story :**
En tant que Jean, je veux savoir clairement pourquoi aucune réservation n'est affichée (0 réservations ou filtre trop strict).

**Description :**
Empty state = illustration + message clair + CTA. Exemple : "Aucune réservation pour cette période. Créer une?"

**Critères d'acceptation :**
- [ ] Message contextualisé (vs. date filtrée, statut, etc.)
- [ ] Illustration simple/professionnelle
- [ ] Bouton CTA "Créer réservation"
- [ ] Centré dans conteneur principal

**Dépendances :**
- Empty state component

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-015 : Gérer État Error

**User Story :**
En tant qu'utilisateur, je veux savoir immédiatement si quelque chose s'est mal passé et pouvoir réessayer.

**Description :**
Erreur API = banner rouge + message clair (ex: "Impossible de charger. Réessayer ?") + bouton retry.

**Critères d'acceptation :**
- [ ] Banner rouge visible en-tête
- [ ] Message sans jargon tech ("Impossible de charger" pas "HTTP 500")
- [ ] Bouton "Réessayer" déclenche rerequest
- [ ] Max 3 tentatives avant abandon
- [ ] Timeout 5s error si pas de réponse

**Dépendances :**
- Error boundary / Retry logic
- Toast component

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

### US-016 : Gérer État Success

**User Story :**
En tant que Sophie, je veux confirmation visuelle que mes actions ont réussi (créer, modifier, supprimer).

**Description :**
Toast notification (top-right, 3s durée, auto-hide) : "Réservation créée", "Modifiée", "Supprimée", etc. Couleur verte success.

**Critères d'acceptation :**
- [ ] Toast toast visible top-right
- [ ] Message personnalisé par action
- [ ] Duration 3s, auto-close
- [ ] Couleur verte / icône checkmark
- [ ] Multiple toasts = stack (not overlap)

**Dépendances :**
- Toast component library

**Complexité :** **S**
**Priorité :** **P0**
**Assigné à :** Dev Full-stack
**Sprint :** V0 Itération 1

---

## Priorité & Ordre d'Exécution

### Sprint 1 : Fondations (Itération 1)
**Durée estimée :** 3-4 semaines

1. **US-011 :** DAL + Backend Airtable (FONDATION)
2. **US-012 :** Env vars
3. **US-004 :** Créer réservation (form + validation)
4. **US-001 :** Vue Liste (table simple)
5. **US-007 :** Changer statut dropdown
6. **US-006 :** Supprimer (modale confirmation)
7. **US-008 :** Recherche par nom
8. **US-013 à US-016 :** Gestion erreurs/états (4 vues)

**Definition of Done Sprint 1 :**
- CRUD créer/read/delete opérationnel
- Table Liste affiche toutes réservations
- Recherche fonctionne
- 4 états gérés (loading/empty/error/success)
- Zéro secret exposé

### Sprint 2 : Vues Secondaires (Itération 2-3)
**Durée estimée :** 2-3 semaines

1. **US-002 :** Vue Kanban (drag & drop)
2. **US-003 :** Vue Planning (complexe)
3. **US-005 :** Éditer réservation
4. **US-009 :** Filters avancés (date/statut)
5. **US-010 :** Modal détails
6. Polish & tests

**Definition of Done Sprint 2 :**
- 3 vues complètement opérationnelles
- CRUD 100% fonctionnel
- Tests QA validés (Test_Plan.md)

---

## Dépendances Inter-User Stories

```
US-011 (DAL) 
  ├── US-004 (créer)
  ├── US-005 (éditer)
  ├── US-006 (supprimer)
  ├── US-007 (changer statut)
  └── US-001 (liste) -- dépend aussi de
        ├── US-008 (search)
        └── US-009 (filters)

US-004 (form création)
  ├── US-002 (Kanban)
  ├── US-003 (Planning)
  └── US-010 (détails modal)
```

---

## Quick Wins (pour V0.1 si retard)

Si Dev retardée sur Sprint 1 par problèmes tech, prioriser :
1. US-001 (Vue Liste) + US-004 (créer) = MVP minimum
2. US-008 (search) = utile rapide
3. Sacrifier temporairement : US-002, US-003 (vues complexes)
