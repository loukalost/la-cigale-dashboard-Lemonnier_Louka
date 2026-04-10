# RAID Log - La Cigale CRM V0

**Date de création :** 12 avril 2024  
**Propriétaire :** Product Owner + Architecte Technique  
**Fréquence de révision :** Hebdo (chaque lundi morning meeting)

---

## 1. RISKS (Risques)

### Risk-001 : Rate Limit Airtable API
**Impact :** 🔴 CRITIQUE | **Probabilité :** 🟡 MOYENNE | **Sévérité globale :** HAUTE

**Description :**
Airtable free tier = 300 appels API/minute. Pendant pics service (midi/soir), équipe salle peut générer > 10 req/min en rafales (rechargement liste, changement statut, création). Risque de throttling → app inutilisable.

**Scénario déclencheur :**
1. Sophie ouvre Vue Planning + rafraîchit (1 req)
2. Marc change statut 5 réservations (5 req)
3. 2-3 autres utilisateurs = total 15+ req en 10s
4. Airtable retourne 429 Too Many Requests

**Mitigation :**
- ✅ **Courtermiste (V0) :** Implémenter retry logic (exponential backoff, 3 tentatives)
- ✅ **Courtermiste (V0) :** Mettre en cache local 30s (évite refetch massif)
- ✅ **Courtermiste (V0) :** Debounce filtres/recherche 300ms
- 🔲 **Longterme (V1) :** Passer Airtable PLAN pro (10,000 req/mois)
- 🔲 **Longterme (V1) :** Implémenter queue backend (batch updates, max 1 req/s)

**Propriétaire :** Architecte + Dev Full-stack  
**Monitoring :** Log tous les 429 reçus → dashboard Render

---

### Risk-002 : Perte de Données Synchronisé (Airtable vs. Frontend Cache)
**Impact :** 🔴 CRITIQUE | **Probabilité :** 🟡 MOYENNE | **Sévérité globale :** HAUTE

**Description :**
Si utilisateur offline ou perd connexion pendant save, optimistic update affiche succès mais API échoue. Données frontend ≠ Airtable. Utilisateur croît que réservation est créée mais elle ne l'est pas en DB.

**Scénario déclencheur :**
1. Sophie crée réservation
2. Toast "Succès" s'affiche (optimistic)
3. Connexion internet coupe ou Airtable timeout
4. Backend n'a jamais reçu donné
5. Sophie quitte app, pense c'est ok → client jamais enregistré

**Mitigation :**
- ✅ **V0 OBLIGATOIRE :** Différer optimistic UI (afficher vraie réponse serveur avant toast)
- ✅ **V0 OBLIGATOIRE :** Gestion explécite offline/error (banner rouge, "Erreur - réessayer")
- ✅ **V0 OBLIGATOIRE :** Validation response serveur avant mise à jour local state
- 🔲 **V1 :** Sync queue (localStorage) si offline, resync à la reconnect
- 🔲 **V1 :** Conflict detection (si edit simultané multi-utilisateurs)

**Propriétaire :** Dev Full-stack + QA  
**Monitoring :** Tester offline mode dans Test_Plan.md

---

### Risk-003 : Bottleneck Authentification (Token Airtable dans Backend)
**Impact :** 🟡 MOYENNE | **Probabilité :** 🟢 BASSE | **Sévérité globale :** MOYENNE

**Description :**
Token Airtable AIRTABLE_API_KEY centralisé dans backend Render. Si backend down ou token expiré, toutes les opérations échouent. Single point of failure.

**Scénario déclencheur :**
1. Render backend pod crashes
2. Ou token Airtable révoqué (accident)
3. Toutes opérations B → Airtable retournent 401/403
4. App devient complètement inutilisable

**Mitigation :**
- ✅ **V0 :** Monitoring Render pod health (healthcheck endpoint)
- ✅ **V0 :** Direct token access fallback documentation (manuel, pour urgence)
- ✅ **V0 :** Alertes Slack/Email si backend down > 5 min
- 🔲 **V1 :** Refresh token strategy (si Airtable supporte OAuth)
- 🔲 **V1 :** Distributed backend replicas (multi-pod Render)

**Propriétaire :** Architecte  
**Monitoring :** Render metrics, Airtable API logs

---

### Risk-004 : Surcharge UI Pendant Pics (Performance Dégradée)
**Impact :** 🟡 MOYENNE | **Probabilité :** 🟡 MOYENNE | **Sévérité globale :** MOYENNE

**Description :**
Vue Kanban avec 100+ cartes drag & drop peut ralentir (lag clics, scroll janky). Pendant midi/soir, simultanément 3-4 utilisateurs = DOM expensive.

**Scénario déclencheur :**
1. 50+ réservations du jour chargées
2. Drag & drop 1 carte → re-render 50 cartes
3. Browser lag, click pas enregistré
4. Utilisateur refait clic (double-clics) → doublon update

**Mitigation :**
- ✅ **V0 :** Virtualisation liste (react-window, react-virtualized) si > 50 items
- ✅ **V0 :** Pagination Kanban (par statut, limiter 20 cartes/colonne)
- ✅ **V0 :** Memoization composants React (React.memo sur cartes)
- ✅ **V0 :** Web Workers pour calculs lourds (si applicable)
- 🔲 **V1 :** WebSocket temps réel (vs. polling 30s)

**Propriétaire :** Dev Full-stack  
**Monitoring :** Lighthouse Performance score, Chrome DevTools profiler

---

### Risk-005 : Exposition Secret via Google/GitHub Open Source Leak
**Impact :** 🔴 CRITIQUE | **Probabilité :** 🟢 BASSE | **Sévérité globale :** HAUTE

**Description :**
Quelqu'un commite accidentellement .env avec AIRTABLE_API_KEY en Git. Repository public exposé. Attaquant utilise clé pour supprimer/modifier réservations.

**Scénario déclencheur :**
1. Dev oublie .gitignore .env
2. Git push
3. GitHub public repo = exposé
4. Attaquant scrape clé via git history (persiste forever)

**Mitigation :**
- ✅ **V0 CRITIQUE :** .env dans .gitignore (checklist pre-deploy)
- ✅ **V0 CRITIQUE :** Git pre-commit hook prevent .env commit
- ✅ **V0 :** .env.example versioned avec placeholder values uniquement
- ✅ **V0 :** README = "JAMAIS commiter .env"
- 🔲 **V1 :** GitHub secret scanning enabled (auto-detect leaks)
- 🔲 **V1 :** Airtable token rotation quarterly

**Propriétaire :** Dev Full-stack + Architecte  
**Monitoring :** Pre-deploy checklist, git hooks

---

## 2. ASSUMPTIONS (Hypothèses)

### Assumption-001 : Airtable API Rate Limit Suffisant en Usage Réel
**Confiance :** 🟡 MOYEN

**Description :**
On assume que 300 req/min Airtable free tier suffit pour < 5 utilisateurs simultanés. Si plus d'utilisateurs ou opérations plus complexes, ça failera.

**Validation :** Load test avec 5 users simultanés en Dev
**Go/No-go :** Si test passe 300 req en < 1 min sans throttle → OK

---

### Assumption-002 : Utilisateurs ont Stable Internet Connection
**Confiance :** 🟢 HAUT

**Description :**
Restaurant La Cigale = environnement professionnel. On assume Wifi stable. Pas d'offline-first strategy nécessaire V0.

**Validation :** Retour équipe après 1 week pilote
**Go/No-go :** Si offline problems reportés > 1/mois → implémenter sync queue (V1)

---

### Assumption-003 : Airtable Structure Réservations Stable
**Confiance :** 🟢 HAUT

**Description :**
On assume table Airtable "Réservations" colonnes ne vont pas changer. Si client ajoute colonnes custom, DAL doit supporter.

**Validation :** Documenter structure exacte Airtable avant dev
**Go/No-go :** Déploiement bloqué si structure varie

---

### Assumption-004 : Utilisateurs Acceptent 30s Latence Data
**Confiance :** 🟡 MOYEN

**Description :**
Cache expire 30s donc changement statut par utilisateur B peut prendre 30s visible par utilisateur A. Ok pour contexte restaurant?

**Validation :** UX review avec Sophie + Marc après proto
**Go/No-go :** Si pas acceptable → refactor polling 5s ou WebSocket (V1, coût tech)

---

### Assumption-005 : Backend Render Stable pour V0
**Confiance :** 🟢 HAUT

**Description :**
Render déploiement déjà existant (Telegram bot). On assume infrastructure ok pour CRM web. Pas de migration Render nécessaire V0.

**Validation :** Render dashboard monitoring + uptime metrics
**Go/No-go :** Si < 99% uptime → alerter Render support

---

## 3. ISSUES (Problèmes Actifs)

### Issue-001 : [OUVERT] Clarification Métier - Slot Capacity
**Statut :** 🔴 BLOQUANT | **Priorité :** P0 | **Date d'ouverture :** 12 avril 2024

**Description :**
Créneau 12h00 : capacité max est combien de couverts ? Y a-t-il des limites par slot (ex: pas > 4 tables à 4 pax midi) ? Impact sur validation formulaire création.

**Assigné à :** PO + Jean (gérant)  
**Résolution attendue :** Avant dev US-004 (2-3 jours)  
**Risque bloquant :** OUI - Cannot validate form sans ces rules

---

### Issue-002 : [OUVERT] Statut Workflow - Transitions Autorisées
**Statut :** 🟡 EN COURS | **Priorité :** P1 | **Date d'ouverture :** 12 avril 2024

**Description :**
Workflow exact statuts ? Exemple :
- "En attente" → peut aller à "Confirmée" (ok) ou "Annulée" (ok)?
- "Confirmée" → revenir à "En attente" après confirmation ? (Probablement non)
- "Terminée" → peut revenir à "Confirmée" si client delay ? (Probablement non)

**Assigné à :** PO + Sophie  
**Résolution attendue :** Avant US-007 (1 semaine)  
**Risque bloquant :** NON - Default workflow admissible, refine après retours

---

### Issue-003 : [OUVERT] Supabase - Usage V0 ?
**Statut :** 🟡 EN COURS | **Priorité :** P1 | **Date d'ouverture :** 12 avril 2024

**Description :**
PRD mentionne Supabase dans stack. Rôle exact ? Cache ? Logs ? Authentification utilisateurs ? Ou Airtable suffit pour V0 ?

**Assigné à :** Architecte  
**Résolution attendue :** Avant Architecture.md (2-3 jours)  
**Risque bloquant :** NON - Si pas utilisé V0, clarifier roadmap V1

---

### Issue-004 : [OUVERT] Telegram Bot Integration Continuité
**Statut :** 🟢 INFORMATION | **Priorité :** P2 | **Date d'ouverture :** 12 avril 2024

**Description :**
Telegram bot prise de réservations existant. CRM web remplace ou complémente ? Deux sources de vérité = risque désync. Roadmap ?

**Assigné à :** PO + Jean  
**Résolution attendue :** Post V0 (décision produit)  
**Risque bloquant :** NON - Bot peut continue parallèle mais document bien

---

## 4. DEPENDENCIES (Dépendances Externes)

### Dependency-001 : Airtable API
**Type :** Externe (SaaS)  
**Criticité :** 🔴 CRITIQUE  
**Status :** ✅ Actif (source of truth)

**Description :**
Airtable API = cœur du projet. Requête GET/POST/PATCH/DELETE via HTTPS. Free tier: 300 req/min, premium available.

**Owner :** Airtable (hors notre contrôle)  
**Fallback :** Aucun (data owner)  
**Monitoring :** Airtable Status page, nos logs 429s/errors

**Contraintes :**
- Rate limit 300 req/min
- No guaranties SLA free tier
- Require valid API key

**Plan mitigation :**
- V0 : Retry + cache 30s
- V1 : Upgrade Pro tier si applicable

---

### Dependency-002 : Render (Hébergement Backend)
**Type :** Externe (PaaS)  
**Criticité :** 🔴 CRITIQUE  
**Status :** ✅ Actif (déploiement bot existant)

**Description :**
Backend déployé sur Render. Dépend uptime Render + disponibilité regions US.

**Owner :** Render (hors contrôle)  
**Fallback :** Basculer vers Vercel/Railway/Heroku (migration effort M)  
**Monitoring :** Render dashboard, health check endpoint

**Contraintes :**
- Free tier = auto-spindown after 15 min inactivity (startup lag)
- Paid tier (Pro) recommandé pour prod (continuous running)

**Plan mitigation :**
- V0 : Evaluer Free tier performance sous charge
- V1 : Upgrade Pro tier si needed

---

### Dependency-003 : Supabase (Database - Optional V0)
**Type :** Externe (SaaS)  
**Criticité :** 🟡 MOYEN  
**Status :** ❓ TBD (Usage V0 unclear)

**Description :**
Supabase PostgreSQL. Rôle exact V0 à clarifier. Cache ? Logs ? Ou redundant avec Airtable ?

**Owner :** Supabase (hors contrôle)  
**Fallback :** Direct Airtable, no cache layer V0  
**Monitoring :** TBD en Architecture.md

---

### Dependency-004 : Variables d'Environnement Render
**Type :** Interne (processus)  
**Criticité :** 🔴 CRITIQUE  
**Status :** ✅ Supporté (Render feature)

**Description :**
Render Environment Variables UI pour stocker AIRTABLE_API_KEY, etc. Pas d'alternative centrale V0.

**Owner :** Render team + Dev team (configuration)  
**Fallback :** Hardcode (JAMAIS, security risk)  
**Monitoring :** Render dashboard

---

### Dependency-005 : GitHub Repository (Version Control)
**Type :** Interne (processus)  
**Criticité :** 🟡 MOYEN  
**Status :** ✅ Actif

**Description :**
Git history source. .gitignore critical pour secrets.

**Owner :** Équipe Dev  
**Fallback :** Aucun (core infra)  
**Monitoring :** Pre-commit hooks

---

## 5. Matrice Décisions Critiques

| Décision | Propriétaire | Confirmer par | Deadline | Status |
|----------|-------------|---------------|----------|--------|
| Workflow statuts exact | PO + Sophie | Dev approval | 18 avril | ⏳ In Progress |
| Capacity slots par créneau | PO + Jean | Architecte | 13 avril | 🔴 Bloquant |
| Supabase rôle V0 | Architecte | PO approval | 14 avril | ⏳ Pending |
| Stack Frontend choice | Architecte | PO approval | 14 avril | ⏳ Pending |
| Go/no-go pilot launch | PO | Jean + Team | 30 avril | ⏳ TBD |

---

## 6. Escalade Protocol

**Qui fait quoi en cas de problème :**

- **Bug bloquant Dev :** Dev → Architecte (slack #arch) → PO si archit impossible
- **Changement scope :** Tant qui l'est → PO (décision) → Equipe
- **Infra down (Render/Airtable) :** Dev → Architecte → Jean (décision client)
- **Sécurité leak :** Dev → Architecte URGENT → PO (communication client)
- **Perf dégradée :** Dev → Architecte → PO (évaluer rollback vs. fix forward)

---

## 7. Historique Révisions

| Version | Date | Changeants | Notes |
|---------|------|-----------|-------|
| v1.0 | 12 avril 2024 | PO | Initial RAID. Basé sur PRD + BACKLOG v1.0 |

---

**Prochaine révision :** 19 avril 2024 (après Architecture.md + décisions PO)
