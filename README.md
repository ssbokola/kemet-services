# Kemet Services - Site Web Officiel

Site web professionnel de Kemet Services, cabinet de formation et consultance spécialisé dans l'optimisation des pharmacies d'officine en Côte d'Ivoire et Afrique de l'Ouest.

## 🎯 À propos

Kemet Services accompagne les pharmacies d'officine dans leur croissance et leur optimisation opérationnelle à travers :

- **Formations spécialisées** : Gestion des stocks, trésorerie, qualité, RH, auxiliaires
- **Consultance opérationnelle** : Diagnostic, accompagnement, suivi personnalisé
- **Kemet Echo** : Solution SaaS de mesure de satisfaction client (CSAT/NPS)

## 🚀 Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Wouter** pour le routing
- **shadcn/ui** + **Radix UI** pour les composants
- **Tailwind CSS** pour le styling
- **TanStack Query** pour la gestion de l'état serveur
- **React Hook Form** + **Zod** pour les formulaires

### Backend
- **Express.js** avec TypeScript
- **Drizzle ORM** pour la base de données
- **PostgreSQL** (Neon) comme base de données
- **Nodemailer** pour les emails
- **Passport.js** pour l'authentification

### Services
- **Gmail SMTP** pour les notifications email
- **Google Analytics 4** pour l'analyse
- **Replit Auth** pour l'authentification des participants

## 📁 Structure du Projet

```
kemet-services/
├── client/                 # Application React frontend
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitaires et configs
├── server/                # Backend Express
│   ├── index.ts          # Point d'entrée
│   ├── routes.ts         # Routes API
│   ├── storage.ts        # Interface de stockage
│   ├── gmail.ts          # Service d'envoi d'emails
│   └── vite.ts           # Configuration Vite
├── shared/               # Code partagé
│   └── schema.ts        # Schémas Drizzle + Zod
└── attached_assets/     # Assets statiques
```

## 🔧 Installation et Développement

### Prérequis
- Node.js 20+
- PostgreSQL (ou utiliser Neon)

### Variables d'environnement
```env
DATABASE_URL=postgresql://...
GMAIL_USER=infos@kemetservices.com
GMAIL_APP_PASSWORD=...
VITE_GA4_TRACKING_ID=G-...
```

### Démarrage
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build
```

## 📊 Base de Données

### Tables principales
- **formations_catalog** : Catalogue des formations
- **formation_registrations** : Inscriptions aux formations
- **contact_requests** : Demandes de contact/diagnostic
- **kemet_echo_requests** : Demandes de démo Kemet Echo
- **participants** : Participants aux formations
- **participant_courses** : Cours assignés aux participants

### Migrations
```bash
# Pousser les changements de schéma
npm run db:push

# Forcer la migration en cas de conflit
npm run db:push --force
```

## 🎨 Design System

### Couleurs
- **Primary** : Teal/Vert (140 75% 35% en clair, 140 75% 45% en sombre)
- **Background** : Blanc/Noir selon le thème
- **Muted** : Gris neutre pour les textes secondaires

### Typographie
- **Titres** : Source Serif 4
- **Corps** : Inter
- **Code** : Menlo

## 📧 Système de Notifications

### Emails automatiques
1. **Diagnostic gratuit** : Confirmation + notification admin
2. **Inscription formation** : Confirmation + notification admin
3. **Contact général** : Confirmation + notification admin
4. **Kemet Echo** : Notification admin
5. **Identifiants participants** : Envoi des credentials

### Configuration Gmail
- Email business : infos@kemetservices.com
- Fallback : Logging dans `notifications/`

## 🔐 Authentification

### Admin
- Login manuel via `/admin/login`
- Sessions sécurisées avec Express Session

### Participants
- Replit Auth (OIDC)
- Redirection automatique vers le catalogue après login

## 📱 Pages Principales

### Public
- `/` - Accueil
- `/formations` - Catalogue de formations
- `/kemet-echo` - Produit Kemet Echo
- `/consulting` - Services de consultance
- `/galerie` - Galerie photos
- `/ressources` - Articles et guides
- `/contact` - Formulaire de contact
- `/a-propos` - À propos de Kemet

### Admin (Protégé)
- `/admin/dashboard` - Vue d'ensemble
- `/admin/registrations` - Gestion des inscriptions
- `/admin/contacts` - Gestion des demandes de contact
- `/admin/courses` - Gestion du catalogue
- `/admin/participants` - Gestion des participants

### Participants (Protégé)
- `/participant/dashboard` - Tableau de bord
- `/participant/formations` - Mes formations
- `/participant/catalogue` - Catalogue complet

## 🌐 SEO et Analytics

- Meta tags optimisés pour chaque page
- Open Graph pour les réseaux sociaux
- Google Analytics 4 avec gestion du consentement
- Sitemap XML généré automatiquement

## 📜 Documents Légaux

- `/mentions-legales` - Mentions légales
- `/confidentialite` - Politique de confidentialité (RGPD)
- `/politique-cookies` - Politique de cookies

## 🚢 Déploiement

Le site est hébergé sur **Replit** avec :
- Déploiement automatique sur push
- HTTPS automatique
- Base de données PostgreSQL managée
- Variables d'environnement sécurisées

## 📞 Contact

**Kemet Services**
- Email : infos@kemetservices.com
- Téléphone : +225 0759 068 xxx
- Adresse : Mamie Adjoua, Yopougon - Abidjan, Côte d'Ivoire

## 📄 Licence

© 2024 Kemet Services. Tous droits réservés.
