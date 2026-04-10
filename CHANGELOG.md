# Changelog - La Cigale CRM

## [0.1.0] - 10 avril 2026

### ✨ Added
- **Architecture Documentation** : Justification des choix tech (PAT vs OAuth, Proxy Backend, React vs Vue)
- **Frontend Stack** : React 18 + TypeScript + Vite avec Zustand pour l'état
- **Backend Stack** : Express.js 4.18 + TypeScript avec pattern DAL
- **Vue Liste (US-001)** : Tableau avec tri, filtres, recherche, actions par ligne
- **CRUD Opérationnel** : Créer, lire, modifier, supprimer réservations
- **Airtable Integration** : DAL avec caching 30s et gestion erreurs
- **Forms Validation** : Dates futures, créneaux rigides (11h30-14h30, 19h00-22h30), 1-12 personnes
- **Loading States** : Skeleton screens pour L'UX
- **Error Handling** : Banners d'erreur avec retry option
- **Success Feedback** : Toast notifications avec auto-close 3s
- **Security** : Token jamais exposé au frontend, CORS whitelist, error sanitization
- **Documentation** : README.md complet, Stack Check, design specs, architecture decisions

### 🔧 Fixed
- None (First release)

### ⚠️ Known Issues
- Vue Kanban et Vue Planning non implémentées (V0.1)
- Tests automatisés absent (V1)
- Pas de prise en charge de la synchronisation temps réel (polling 30s suffisant)

### 📦 Dependencies
- Frontend: React 18.2.0, TypeScript 5, Vite 4.4.0, Zustand 4.4.0, Dnd Kit 8.0.0
- Backend: Express 4.18.2, TypeScript 5, Node 20 LTS

### 🚀 Deployment Notes
- **Frontend** : Render Static Site (auto-build from Git)
- **Backend** : Render Web Service (Node.js)
- **Database** : Airtable (existing, via PAT token)
- **Secrets** : Render Environment Variables (backend only)

### 📋 What's Next
- [ ] V0.1 : Vue Kanban + drag & drop
- [ ] V0.2 : Vue Planning + calendrier
- [ ] V1.0 : Tests E2E, Auth, Admin panel
- [ ] V2.0 : Notifications, Multi-langue, OAuth

---

## [Unreleased]

### In Progress
- Vue Kanban (US-002)
- Vue Planning (US-003)
- Search fulltext
- Export PDF

### Planned
- User authentication
- Role-based access control (Sophie, Marc, Jean)
- Email notifications
- SMS alerts
- Reporting dashboard
- Multi-restaurant support
