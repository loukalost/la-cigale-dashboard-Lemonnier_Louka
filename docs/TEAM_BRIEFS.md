# Briefs Équipe - Agents IA La Cigale CRM V0

---

## Brief Architecte Technique

**Rôle :** Définir l'architecture générale, décisions tech, sécurité, intégration services externes.

**Contexte :**
La Cigale (restaurant Art nouveau Nantes) doit migrer gestion réservations vers CRM web. Stack existant = Render (backend), Supabase, Airtable (source of truth), Telegram Bot. Tu dois concevoir l'architecture v0 qui soit sécurisée et scalable.

### Livrables Attendus

1. **Architecture.md** dans `/docs/` contenant :
   - Vue d'ensemble (schéma ASCII flux données)
   - Décisions tech : 2+ options comparées pour chacune
     - Authentification Airtable (PAT vs OAuth)
     - Architecture API (Proxy backend vs Direct frontend)
     - Stack Frontend (React vs Vue vs Svelte)
     - Backend Framework (Express vs Fastify vs Hono)
   - Gestion secrets (stockage, injection, rotation)
   - Contrat DAL complet (interfaces TypeScript CRUD)
   - Stratégie erreurs & résilience (timeouts, retry, fallback)
   - Structure projet recommandée

### Contraintes Critiques

- ❌ **JAMAIS** de token Airtable en front-end
- ✅ Variables d'env obligatoires pour TOUS les secrets
- ✅ Justification chaque recommandation
- ✅ Tableau comparatif 2+ options par décision
- ✅ Contrat DAL avec signatures TypeScript

### Questions Clés à Résoudre

1. **PAT (Personal Access Token) vs OAuth :** 
   - PAT = simple, un seul token backend (recommandé V0)
   - OAuth = complexe, refresh tokens, plus sécurisé long-terme (V1+)
   - **Ta recommandation :** [À justifier]

2. **Proxy backend vs Direct frontend :**
   - Proxy = token backend caché, sécurité ++, complexité ++
   - Direct = frontend direct Airtable (JAMAIS avec token)
   - **Ta recommandation :** [À justifier]

3. **Stack Frontend (priorité : sécurité, rapidité dev, perf UI) :**
   - React = écosystème large, DOM fast, courbe apprentissage
   - Vue = syntaxe simple, moins boilerplate, écosystème moyen
   - Svelte = bundle tiny, compilation-first, moins mainstream
   - **Ta recommandation :** [À justifier]

4. **Supabase rôle :** Cache ? Logs ? Or pure Airtable V0?
   - **Ta clarification :** [À justifier]

### Points Pivot

- Rate limit Airtable (300 req/min free tier) = risque critique → stratégie cache/retry dans ta réponse
- Synchronisation multi-utilisateurs (changement statut quasi-simultané) → pas de WebSocket V0, polling ok ?
- Render env vars suffit pour secrets ou recommander Vault ?

### Success Criteria

- ✅ Personne non-tech peut lire schéma et comprendre flux données
- ✅ Toutes décisions justifiées (pas d'choices injustifiées)
- ✅ Contrat DAL = Dev peut l'implémenter sans questions
- ✅ Zéro ambiguïté secret management
- ✅ Coherent avec PRD (3 vues, CRUD, contraintes sécu)

---

## Brief UX/UI Designer

**Rôle :** Concevoir interface utilisateur, flows, composants, design system.

**Contexte :**
Équipe en salle La Cigale use-case = usage intensif pendant services (midi 11h30-14h30, soir 19h00-22h30). Sophie (responsable salle), Marc (serveur), Jean (gérant) sont les personas. Interface doit être :
- Rapide (< 3 clics actions critiques)
- Lisible (planning visible en un coup d'œil)
- Responsive (tablette possible)
- Accessible (A11y basic)

### Livrables Attendus

1. **design_specs.md** dans `/docs/` contenant :
   - Architecture d'information (navigation globale, flow utilisateur principal)
   - Spécifications 3 vues :
     - **Vue Liste :** Colonnes, actions, filtres, tri, states
     - **Vue Kanban :** Colonnes statuts, cartes, drag & drop
     - **Vue Planning :** Jour/semaine toggle, créneaux 11h30-14h30 et 19h00-22h30
   - Composants réutilisables (formulaire, cartes, modale, filtres, search bar)
   - États UI (loading, empty, error, success)
   - Microcopy complète (boutons, messages, labels)
   - Design system minimaliste (couleurs, typo, espacements, badges statuts)

### Contraintes Critiques

- ❌ **JAMAIS** > 5 clics pour action critique (créer, changer statut, supprimer)
- ❌ **PAS** jargon technique en microcopy ("CRUD", "API", "sync", etc.) → vocabulaire métier restaurant
- ✅ Chaque vue a ses 4 états (loading/empty/error/success)
- ✅ Microcopy 100% rédige (pas de [TODO] placeholders)
- ✅ Toutes user stories BACKLOG couvertes par specs

### Questions Clés à Résoudre

1. **Navigation globale :** Tabs bottom (mobile-first) ? Sidebar ? Top menu ?
   - **Ta recommandation :** [Justifier pour usage salle intensif]

2. **Vue Liste vs Kanban :** Quelle est la vue par défaut ? Pourquoi ? (Sophie vs Marc vs Jean = personas différents)
   - **Ta recommandation :** [Personas preference]

3. **Planning : Jour ou Semaine par défaut ?" Jour = focus contemporain, Semaine = planif globale.
   - **Ta recommandation :**

4. **Drag & drop Kanban :** Confirmation avant statut change ? Ou immediate ?
   - **Ta recommandation :**

5. **Formulaire création :** Modal ou page full? Inline edit après creation?
   - **Ta recommandation :**

### Points Pivot

- **Créneaux rigides :** 11h30, 12h00, 12h30, 13h00, ..., 14h30 vs. libre choix ?
  → Design time picker accordingly
- **Statut workflow :** Transitions autorisées (En attente → Confirmée ok, mais Confirmée → En attente?) → Impact Kanban drag rules
- **Allergies prominentes :** Section highlight si "autre_info" present ? (Marc besoin rapide)
- **Mobile :** Tablette iPad support critique (salle utilisation), phone secondaire

### Success Criteria

- ✅ Design specs cover ALL user stories BACKLOG (traceability matrix)
- ✅ 3 vues = fonctionnelles + intuitive pour personas (testable post-design)
- ✅ Messages utilisateur clairs (pas de "Error 500")
- ✅ Accessibility baseline (focus visible, labels, contrast)
- ✅ Design system permet implementation rapide (couleurs hexcode, typo sizes, spacing)
- ✅ Microcopy sounds natural French (non-automated translation)

---

## Brief Dev Full-Stack

**Rôle :** Implémenter application complète (frontend + backend DAL), respecting architecture et design specs.

**Contexte :**
Tu dois construire CRM La Cigale v0 avec CRUD complet + 3 vues + sécurité zéro-secret. Stack imposé = Render backend, Airtable API, variables d'env secrets. Architectural decisions (Architecte) et design specs (Designer) te guident.

### Livrables Attendus

1. **Application fonctionnelle** avec structure :
   ```
   /src
     /ui
       /components (boutons, inputs, modales, etc.)
       /views (Liste.tsx, Kanban.tsx, Planning.tsx)
     /dal (Data Access Layer)
       airtable.ts (CRUD functions)
     /types
       reservation.ts (interfaces TypeScript)
     /utils
       date.ts, validation.ts, error-handling.ts
   /public
   package.json
   .env.example
   README.md
   ```

2. **README.md** à racine :
   - Description projet (2-3 lignes)
   - Stack technique + justification pourquoi (React/Vue/Svelte)
   - Prérequis (Node.js, npm)
   - Installation step-by-step (quelqu'un externe doit pouvoir faire `npm i`, `npm run dev`)
   - Configuration .env (quoi copier/populer)
   - Lancement dev + prod
   - Structure projet commentée
   - Décisions tech importantes

3. **.env.example** :
   ```
   # Airtable Configuration
   AIRTABLE_API_KEY=your_key_here
   AIRTABLE_BASE_ID=appXXXXX...
   AIRTABLE_TABLE_NAME=Réservations
   ```

4. **Code structured + type-safe** :
   - TypeScript obligatoire (au moins DAL)
   - Comments sur fonctions critiques (CRUD, erreur handling)
   - No hardcoded secrets
   - Gestion erreurs explícite (try/catch, fallbacks)

### Contraintes Critiques

- ❌ **JAMAIS** token Airtable en front
- ❌ **JAMAIS** secrets dans code ou Git
- ✅ Variables d'env pour TOUS les secrets
- ✅ `npm run dev` must work (testable)
- ✅ CRUD COMPLET (create, read, update, delete)
- ✅ 4 états gérés (loading, empty, error, success)
- ✅ TypeScript DAL minimum
- ✅ README = déploiement possible par tiers

### Questions Clés à Résoudre

1. **Stack Frontend :** Architecte recommande [React/Vue/Svelte]. Tu agrees?
   - Si pas accord → escalade Architecte, justifie alternative

2. **Backend framework :** Express vs Fastify vs Hono ?
   - Architecte guidance → déjà dans Architecture.md
   - Tu implémentes according to architecture

3. **State management :** Redux ? Zustand ? Context ? Pinia ?
   - V0 = garder simple, Context ok, Redux probably overkill

4. **Styling :** Tailwind CSS ? Styled-components ? CSS Modules ?
   - Designer specs définit couleurs/typo → tu choisis implementation

### Points Pivot

- **Rate limit Airtable :** Architecte recommande cache 30s + retry logic → implémente ça strictement
- **Offline support :** V0 = non (assumption stable internet), mais architecture future-proof pour V1
- **Performance :** Virtualisation liste si > 50 items ? (Architecte specs)
- **Error recovery :** User-friendly messages, pas "HTTP 500 Internal Server Error"

### Sprint Roadmap (Architectural Phases)

1. **Phase 1 (Week 1-2) :** Foundation
   - Setup tooling (Vite/Next/Nuxt)
   - DAL Airtable (getAll, getById, create, update, delete)
   - Env vars config
   - Liste view basic

2. **Phase 2 (Week 2-3) :** CRUD + States
   - Formulaire création/edit
   - Suppression avec confirmation
   - Loading/Empty/Error/Success states
   - Toast notifications

3. **Phase 3 (Week 3-4) :** Remaining Views
   - Kanban avec drag & drop
   - Planning calendrier
   - Filtres/recherche

4. **Phase 4 (Week 4) :** Polish + QA
   - Bug fixes
   - Performance tuning
   - README + .env.example finalized

### Success Criteria

- ✅ App launches (`npm run dev` works)
- ✅ CRUD all functional (tested manually by QA)
- ✅ Liste + Kanban + Planning = opérationnels
- ✅ 4 states present in every view
- ✅ .env.example complete + no secrets committed
- ✅ README allows 3rd party deployment
- ✅ Code well-structured (design specs patterns respected)

---

## Brief QA/Test

**Rôle :** Valider fonctionnalités, identifier bugs, générer Test Plan, décider GO/no-go V0.

**Contexte :**
CRM La Cigale v0 doit être prêt pour pilot avec équipe salle (Sophie, Marc, Jean) avant prod. Ta responsabilité = s'assurer que BACKLOG est couvert, bugs sont documentés, application est prête pour 50+ utilisateurs.

### Livrables Attendus

1. **Test_Plan.md** dans `/docs/` contenant :
   - Stratégie test (types, périmètre V0, environnement)
   - ≥ 10 scénarios test détaillés :
     - Happy paths (créer, éditer, supprimer, changer statut)
     - Edge cases (dates invalides, nb pax hors limites)
     - États UI (loading, empty, error)
     - Multi-utilisateurs implications?
   - Bugs trouvés avec étapes reproduction claires
   - Checklist validation GO/no-go (fonctionnel, sécurité, UX, perf, docs)
   - Conclusion : GO / NO-GO / GO avec réserves

### Contraintes Critiques

- ❌ **JAMAIS** "ça marche pas" sans étapes reproduction
- ❌ **JAMAIS** cocher "OK" sans tester réellement
- ✅ Chaque bug = étapes claires (un dev peut la reproduire)
- ✅ TOUS critères d'acceptation BACKLOG testés
- ✅ Conformité avec design_specs.md vérifiée
- ✅ GO/no-go decision basé sur bugs critiques vs bloquants

### Questions Clés à Résoudre

1. **Perf acceptable :** Chargement < 3s toléré? Actions < 1s?
   - Définir seuils vs rejeter application

2. **Multi-utilisateurs :** Test avec 3+ users simultanément ? (V0 hors scope probablement, mais edge cases?)
   - Scope test collaboration

3. **Offline mode :** Test what happens if internet cuts ? (V0 = error expected)
   - Fail gracefully expectation

4. **Mobile/Tablette :** Test iPad uniquement ou aussi phone ?
   - Designer specs guide

### Points Pivot

- **Statut workflow :** "Confirmée" → "En attente" autorisé ? (Workflow impact test cases)
- **Capacity contraints :** Slot 12h00 max a 8 pax test ? (Business logic validation needed)
- **Allergies affichage :** "Autre info" visible everywhere (liste/kanban/planning) ? Test consistency
- **Langue UI :** French ? Accents correct test?

### Sprint Roadmap (QA Phases)

1. **Phase 1 :** Manual smoke tests (app launches, liste visible, CRUD works)
2. **Phase 2 :** Functional tests (all BACKLOG scenarios covered)
3. **Phase 3 :** Edge cases + error states
4. **Phase 4 :** Multi-browser + responsiveness check
5. **Phase 5 :** Final validation + GO/no-go decision

### Success Criteria

- ✅ ≥ 10 scénarios test step-by-step (reproducible)
- ✅ Bugs documentés avec reproduction steps clear
- ✅ Checklist remplie (fonctionnel 100%, sécurité baseline, UX ok)
- ✅ GO/no-go decision bien argued
- ✅ Aucun bug bloquant non-résolu avant GO
- ✅ Format permet re-test par quelqu'un d'autre (repeatable)

---

## Synchronisation Entre Rôles

### Dépendances Temporelles

```
Product Owner (PRD/BACKLOG/RAID)
    ↓ (input)
Architecte (Architecture.md)
    ↓ (input)
Dev (implémentation) ← Designer (design_specs.md aussi input)
    ↓ output
QA (Test_Plan.md)
```

### Réunions de Synchronisation

- **Week 1 :** Kick-off PO + Architecte (clarifier questions RAID, décisions Architecture)
- **Week 2 :** Architecte + Dev + Designer (valider design_specs feasibility vs archit)
- **Week 3 :** Dev + QA (Preview fonctionnalités, scope test)
- **Week 4 :** Dev finalization + QA final tests → GO/no-go decision

### Escalade Protocol

- **Ambiguïté produit :** Vers PO (réponse 24h)
- **Infaisable techniquement :** Vers Architecte (discussion Architecte + Dev)
- **Bugs bloquants Dev :** QA → Dev (résolution 24h)
- **Risk critique :** Vers PO (escalade meeting)

---

## Checklist Pre-Launch

**Avant pilot avec équipe La Cigale :**

- [ ] Architecte a signé Architecture.md (toutes décisions clear)
- [ ] Designer a signé design_specs.md (3 vues finalised)
- [ ] Dev a complété application + README + .env.example
- [ ] QA a complété Test_Plan.md + checklist validation
- [ ] Zéro secrets dans Git (.env gitignored)
- [ ] Application launches (`npm run dev` works)
- [ ] ≥ 10 scénarios passent
- [ ] PO approval pour pilot

---

**Généré :** 12 avril 2024  
**Version :** 1.0  
**Propriétaire :** Product Owner
