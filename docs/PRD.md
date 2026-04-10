# Product Requirements Document - CRM La Cigale V0

## 1. Vision & Objectifs

**Vision :** Digitaliser la gestion des réservations de La Cigale pour que l'équipe en salle accède à un CRM web intuitif, éliminant les appels manuels et les décalages entre systèmes.

**Objectifs métier :**
- Centraliser toutes les réservations depuis un point unique (Airtable = source of truth)
- Améliorer le temps d'accès à l'info planning (< 3 clics pour voir le jour/semaine)
- Réduire les erreurs de double-booking ou oubli de statut
- Fournir une vue opérationnelle pendant les pics service (midi/soir)

**Justification :** La Cigale gère des dizaines de réservations quotidiennes (déjeuners d'affaires, dîners, événements). L'équipe en salle a besoin de consulter/mettre à jour les statuts rapidement, sans basculer entre Telegram, Airtable et papier.

---

## 2. Personas

### Persona 1 : Sophie, Responsable Salle (40 ans, expérience 8 ans)
- **Rôle :** Coordinator principal des réservations, accueil, gestion des plans de table
- **Objectifs :** Voir le planning du jour en arrivant, confirmer/reporter réservations, gérer no-shows
- **Frustrations :** Consulter Telegram + Airtable + appels → trop de contexte-switching
- **Besoins critiques :** Vue planning jour, changement statut rapide, fusion de données
- **Temps d'utilisation :** 30-40 min/jour en continu pendant services
- **Device :** Ordinateur de la réception + tablette en salle

### Persona 2 : Marc, Serveur Senior (35 ans)
- **Rôle :** Accueil, prise de commandes spéciales (allergies, demandes), escalade
- **Objectifs :** Vérifier statut clients arrivants, noter allergies/infos, reconfirmer si besoin
- **Frustrations :** Info débordée sur papier, impossible à chercher vite
- **Besoins critiques :** Recherche rapide par nom, vue allergies, historique modifications
- **Temps d'utilisation :** 10-15 min/jour en rafales (arrivée clients)
- **Device :** Téléphone/tablette en salle (utilisation ponctuelle)

### Persona 3 : Jean, Gérant (55 ans)
- **Rôle :** Validation réservations grandes tables, gestion business, reporting
- **Objectifs :** Vérifier conformité slots (nb personnes/créneau), taux occupation, no-shows
- **Frustrations :** Airtable manual, pas de dashboards, dû à faire en arrière-plan
- **Besoins critiques :** Vue hebdo taux remplissage, stats no-shows, audit piste changements
- **Temps d'utilisation :** 15-20 min/jour (matin + fin service)
- **Device :** Ordinateur bureau

---

## 3. User Stories – Vue d'ensemble

| ID | Story | Persona | Priorité | Epic |
|---|---|---|---|---|
| US-001 | En tant que Sophie, je veux voir tous les réservations du jour en liste pour faire mon tri initial | Sophie | **P0** | Consultation |
| US-002 | En tant que Sophie, je veux changer le statut d'une réservation (En attente → Confirmée) en 1 clic pour suivre l'engagement client | Sophie | **P0** | Gestion Statuts |
| US-003 | En tant que Marc, je veux chercher une réservation par nom pour retrouver les infos clients rapidement | Marc | **P0** | Recherche |
| US-004 | En tant que Sophie, je veux voir mes réservations en vues Kanban (colonnes par statut) pour identifier en un coup d'oeil ce qui est confirmé vs. en attente | Sophie | **P0** | Visualisation |
| US-005 | En tant que Jean, je veux voir un planning calendrier semaine pour vérifier la charge globale | Jean | **P0** | Planning |
| US-006 | En tant que Sophie, je veux créer rapidement une nouvelle réservation avec validation des créneaux (11h30-14h30, 19h00-22h30) pour ne pas oublier un client | Sophie | **P1** | CRUD |
| US-007 | En tant que Marc, je veux voir les allergies/infos spéciales d'une réservation directement sur la fiche pour ne pas oublier à l'accueil | Marc | **P0** | Détail Réservation |
| US-008 | En tant que Sophie, je veux modifier une réservation existante (date, heure, nb personnes) pour adapter aux changements clients | Sophie | **P1** | CRUD |
| US-009 | En tant que Sophie, je veux supprimer une réservation erronée avec confirmation pour éviter les suppressions accidentelles | Sophie | **P1** | CRUD |
| US-010 | En tant qu'Admin, je veux que le système charge correctement les données d'Airtable sans exposer mes tokens API pour la sécurité | Admin | **P0** | Sécurité |

---

## 4. Exigences Fonctionnelles

### 4.1 CRUD Réservations

| Opération | Champs | Contraintes |
|-----------|--------|------------|
| **CREATE** | Nom complet, Prénom, Date (≥ aujourd'hui), Heure (créneaux 11h30-14h30 ou 19h00-22h30), Nb personnes (1-12), Autres infos (optional) | Validation: dates futures seulement, créneaux fermés, max 12 couverts |
| **READ** | Afficher toutes les infos sauf token AIRTABLE_API_KEY | Filtres: par date, statut, nom |
| **UPDATE** | Tous sauf ID Airtable (interne) | Vérifier disponibilité créneau après changement date/heure/nb personnes |
| **DELETE** | Identifier par ID Airtable, confirmation utilisateur | Soft-delete recommandé (marquer "Annulée" plutôt que supprimer) |

### 4.2 Vues Opérationnelles

#### Vue 1 : Liste (Table)
- **Colonnes affichées :** Nom, Date, Heure, Nb personnes, Statut, Autres infos (troncaturé)
- **Actions par ligne :** Éditer, Supprimer, Changer statut (dropdown)
- **Tri :** Par date (ascending), par statut, par nom
- **Filtres :** Date, statut (multiselect), recherche libre (nom/prénom)
- **Cas spécial :** Highlight réservations TODAY en gras

#### Vue 2 : Kanban
- **Colonnes statut :** "En attente" (bleu), "Confirmée" (vert), "Annulée" (gris), "Terminée" (bleu foncé), "No-show" (rouge)
- **Carte réservation :** Nom + DATE + HEURE + Nb personnes (format compact)
- **Interactions :** Drag & drop pour changer statut, clic pour voir détails
- **Tri dans colonne :** Par date (créneaux avant les résolutions)

#### Vue 3 : Planning
- **Type :** Calendrier jour/semaine (toggle view)
- **Vue jour :** Affiche créneaux 11h30-14h30 et 19h00-22h30 avec réservations superposées (timeline visuelles)
- **Vue semaine :** 7 colonnes jours, 2 rangées créneaux
- **Interactions :** Clic sur créneau libre = création rapide, clic sur réservation = détails
- **Colorage :** Réservations par statut (même palette Kanban)

### 4.3 Gestion des Erreurs

| État | Quand ? | Implémentation |
|------|--------|-----------------|
| **Loading** | Appel API Airtable en cours | Skeleton screens ou spinner, max 10s avant timeout |
| **Empty State** | Aucune réservation pour le filtre sélectionné | Message "Aucune réservation" + CTA "Créer" |
| **Error** | API Airtable down, timeout, réseau | Banner rouge + message clair (ex: "Impossible de charger. Réessayer ?") + bouton retry |
| **Success** | Création/modif/suppression réussie | Toast notification (top-right, 3s durée) + feedback couleur |

### 4.4 Formulaire Réservation (Create/Edit)

**Champs :**
- `Nom complet` (text, required)
- `Prénom` (text, required) [Trié dans table, utile pour appels]
- `Date réservation` (date picker, required, ≥ aujourd'hui)
- `Heure réservation` (timepicker ou select, required, créneaux rigides 11h30/12h00/12h30...14h30 ou 19h00...22h30)
- `Nombre personnes` (number, required, 1-12)
- `Autres infos` (textarea, optional, max 200 chars, pour allergies + demandes spéciales)

**Validation:**
- Format date/heure correcte
- Créneau disponible (après validation métier)
- Nb personnes entre 1 et 12
- Nom/prénom non vides

---

## 5. Exigences Non-Fonctionnelles

### 5.1 Sécurité (CRITIQUE)

| Exigence | Détail | Justification |
|----------|--------|---------------|
| **Zéro secret front-end** | Airtable token JAMAIS en JavaScript/React | Exposition public si devtools inspectés |
| **Variables d'env obligatoires** | Tous les secrets via `.env` (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, etc.) | Render gère secrets via env vars |
| **Fichier .gitignore** | `.env` non commité; `.env.example` avec placeholders | Éviter leak Git history |
| **HTTPS en prod** | Frontend + Backend utilise SSL | Chiffrement données en transit |
| **CORS sécurisé** | Whitelist domaines origin si API proxy backend | Empêcher attaques cross-site |

### 5.2 Performance

| Métrique | Cible | Justification |
|----------|-------|---------------|
| **Chargement initial** | < 3s (Vue Liste) | Usage intensif service → patience 0 |
| **Action utilisateur (CRUD)** | < 1s feedback | Rapidité déjà perçue par utilisateurs pressés |
| **Pagination/Virtualisation** | Si > 50 réservations/jour | Optimisation List rendu (React virtual list, Vue infinite scroll) |
| **Cache données** | Revalidate toutes les 30s | Fraîcheur DATA ok pour contexte métier |

### 5.3 UX/Accessibilité

| Exigence | Détail |
|----------|--------|
| **Responsive** | Desktop prioritaire (1920x1080); Tablette secondaire (iPad 1024x768) |
| **Messages clairs** | Vocabulaire métier (restaurant), pas jargon technique |
| **Focus visible** | Tous les éléments interactifs keyboard-accessible |
| **Contraste couleurs** | Minimum WCAG AA pour lisibilité (important = fond sombre, texte clair) |
| **États interactifs** | Hover/Active/Disabled visuellement distincts |

### 5.4 Maintenabilité

- **TypeScript obligatoire** dans DAL (Data Access Layer) pour type-safety
- **Structure modulaire** : `/dal` (Airtable), `/ui` (composants), `/types`, `/utils`
- **Documentation code** : Commentaires sur fonctions critiques (CRUD, gestion erreurs)
- **Logging** : Erreurs API loggées pour debug (console ou service externe si prod)

---

## 6. Success Metrics (V0)

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Adoption équipe** | 80% des réservations via CRM vs. bot Telegram à 2 semaines | Compteur Airtable + retours manuels |
| **Temps consommé gestion** | -50% vs. processus manuel/papier | Chrono avant/après |
| **Erreurs double-booking** | 0 | Audit Airtable logs + retours équipe |
| **Disponibilité** | 99% uptime pendant services (11h-14h, 19h-22h30) | Monitoring Render/Supabase |
| **Satisfaction utilisateur** | 4/5 en NPS (post-launch survey) | Formulaire Typeform simple |

---

## 7. Out of Scope (V0)

- ❌ **Tests automatisés** (Jest/Vitest) → V1
- ❌ **Tests E2E** (Playwright/Cypress) → V1
- ❌ **Mobile app native** (iOS/Android) → V2 (web responsive suffisant)
- ❌ **Intégration PMS** (Property Management System hôtelier) → Nécessite partenariat externe
- ❌ **Multi-langue** (i18n) → V1
- ❌ **Notifications push** → V1-V2 (email suffisant)
- ❌ **Analytics avancés** (heatmaps, session recording) → V1
- ❌ **Synchronisation temps réel WebSocket** → V1 (polling toutes les 30s ok)
- ❌ **Intégration paiements/caution** → V2 (réservations free → bilan comptable hors scope)

---

## 8. Dépendances Critiques

- **Airtable API :** Source of truth, indispensable
- **Render :** Hébergement backend existant
- **Supabase :** Base opérationnelle (optionnelle pour V0)
- **Telegram Bot :** Existant, peut continuer en parallèle
- **Variables d'env :** Render Environment Variables (ou équivalent cloud)

**Risque d'escalade :** Si Airtable API rate-limit atteint (300 req/min par défaut), implémenter queue/retry backend.

---

## 9. Règles de Sécurité Critiques (CAS D'APPLICATION OBLIGATOIRE)

### 9.1 Principes Fondamentaux

**Principe 1 : Zero Secrets in Code**
- ❌ JAMAIS token API hardcodé dans le code source
- ❌ JAMAIS `.env` avec vraies valeurs synchronisé sur Git
- ✅ OBLIGATOIRE : Tous les secrets via variables d'environnement (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, etc.)
- ✅ OBLIGATOIRE : `.env.example` versioned avec `placeholder` values uniquement

**Principe 2 : Separation of Concerns (Frontend ≠ Secrets)**
- ❌ JAMAIS token Airtable en JavaScript/React (accessible via DevTools)
- ❌ JAMAIS appel direct `fetch()` à Airtable depuis frontend avec token
- ✅ OBLIGATOIRE : Frontend appelle backend `/api/reservations` 
- ✅ OBLIGATOIRE : Backend centralise token + authentifie Airtable

**Principe 3 : Environment Variables = Source of Truth**
- ✅ Local Dev : `.env` file (gitignored)
- ✅ Production : Render Environment Variables UI
- ✅ Optionnel V1+ : Secret Manager (Vault)

### 9.2 Secrets Spécifiques

| Secret | Stockage Local | Stockage Prod | Rotation |
|--------|---|---|---|
| `AIRTABLE_API_KEY` | `.env` (gitignored) | Render Env Vars | 6 mois |
| `AIRTABLE_BASE_ID` | `.env` (gitignored) | Render Env Vars | Non-rotatable |
| `AIRTABLE_TABLE_NAME` | `.env` (gitignored) | Render Env Vars | Non-rotatable |
| `SUPABASE_ANON_KEY` | `.env` | Render Env Vars | 6 mois |
| `SUPABASE_SERVICE_ROLE_KEY` | **BACKEND ONLY** | Render Env Vars (private) | 6 mois |

### 9.3 Pre-Commit Checklist (Obligatoire avant `git push`)

```bash
# 1. Vérifier .env est gitignored
grep "^\.env$" .gitignore
# Résultat attendu : .env

# 2. Vérifier .env n'est PAS staged
git diff --cached --name-only | grep ".env"
# Résultat attendu : (empty - nothing returned)

# 3. Scan code pour secrets
git diff --cached | grep -i "AIRTABLE_API_KEY\|pat_\|sklearn_"
# Résultat attendu : (empty - nothing returned)

# 4. Si tous OK → commit safe
git commit -m "feat: message"
```

### 9.4 Pre-Deploy Checklist (Obligatoire 24h avant production)

```bash
# 1. .env.example mis à jour (toutes variables documentées)
test -f .env.example && grep "AIRTABLE_API_KEY" .env.example
# Résultat attendu : AIRTABLE_API_KEY=your_api_key_here

# 2. Aucune mention .env en git history
git log --all --source --full-history -S ".env" -- .
# Résultat attendu : (empty - no results)

# 3. Render Environment Variables configurées (via dashboard)
# Manual verification: Render → Service → Environment
# Check: All variables present + non-empty values

# 4. Erreurs ne doivent pas exposer tokens
# Pour chaque error handler: Vérifier que error.message ne contient pas token

GO/NO-GO : Si tous ces checks passent → Deployment safe
```

### 9.5 Incident Response (Token Compromis)

**Timeline : Agir dans les 5 minutes**

1. 🚨 **REVOKE immédiatement**
   - Airtable Dashboard → API Tokens → Revoke token
   - Render Env Vars → Delete `AIRTABLE_API_KEY`
   
2. **CREATE nouveau token**
   - Airtable → Generate new Personal Access Token
   - Scope: `data.records:read`, `data.records:write`, `data.records:destroy`
   
3. **UPDATE Render**
   - Render Dashboard → Set `AIRTABLE_API_KEY` = new token value
   - Service auto-redeploys
   
4. **MONITOR** 
   - App logs : Vérifier 0 errors
   - Airtable API logs : Voir si attaque détectée
   
5. **DOCUMENT**
   - RCA (Root Cause Analysis) dans `/docs/INCIDENT_[DATE].md`

---

## 10. Definition of Done V0 (Validation Production)

**V0 = GO PRODUCTION uniquement si :**

### Fonctionnalités Complètes
- ✅ CRUD complet (Créer, Lire, Modifier, Supprimer)
- ✅ 3 vues opérationnelles (Liste, Kanban, Planning)
- ✅ Recherche par nom + Filtres (date, statut)
- ✅ Changement statut immédiat

### Gestion Erreurs (4 États)
- ✅ **Loading** : Skeleton/spinner visible pendant API call
- ✅ **Empty State** : Message + CTA si 0 réservations
- ✅ **Error** : Banner rouge + retry button si API fail
- ✅ **Success** : Toast 3s vert après action

### Sécurité
- ✅ Zéro secret dans code (scan automatique)
- ✅ `.env` dans `.gitignore` (vérification git log)
- ✅ `.env.example` avec placeholders uniquement
- ✅ Tokens centralisés en backend (jamais frontend)
- ✅ Error messages non-techniques (pas "HTTP 500")

### Performance
- ✅ Chargement initial < 3s
- ✅ Actions utilisateur < 1s feedback
- ✅ API timeout 5s read, 10s write
- ✅ Cache 30s revalidate

### Tests & QA
- ✅ ≥10 scénarios test du Test_Plan.md exécutés
- ✅ Aucun bug P0/P1 ouvert (0 bugs bloquants)
- ✅ Aucune régression Sprint précédent
- ✅ Responsive testé (desktop + iPad)

### Documentation
- ✅ README.md permet setup par tiers externe
- ✅ Npm scripts OK (`npm run dev`, `npm run build`)
- ✅ CHANGELOG.md mis à jour (version v0.1.0 + features)
- ✅ SECURITY_RULES dans PRD (ce document)

### Sign-off
- ✅ Architecte approuve architecture
- ✅ Designer approuve design_specs
- ✅ Dev Lead approuve code quality
- ✅ QA Lead approuve Test_Plan
- ✅ PO approuve fonctionnalités

**Si TOUS ces critères : GO PRODUCTION ✅**
