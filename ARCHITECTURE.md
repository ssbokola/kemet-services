# Architecture Technique - Kemet Services

## Vue d'ensemble

Application web full-stack moderne construite avec React + TypeScript + Express, déployée sur Replit.

## Stack Technique

### Frontend
```
React 18.3.1
├── TypeScript 5.x
├── Vite (build tool)
├── Wouter (routing)
├── TanStack Query v5 (state management)
├── React Hook Form + Zod (forms)
└── shadcn/ui + Tailwind CSS (UI)
```

### Backend
```
Express.js
├── TypeScript
├── Drizzle ORM
├── PostgreSQL (Neon)
├── Passport.js (auth)
└── Nodemailer (emails)
```

## Patterns et Conventions

### Architecture Frontend

#### Routing
- **Wouter** pour le routing client-side
- Routes déclarées dans `client/src/App.tsx`
- Protection des routes via hooks personnalisés

#### State Management
- **TanStack Query v5** pour l'état serveur
- Cache automatique avec invalidation
- Mutations avec optimistic updates
- Configuration globale dans `client/src/lib/queryClient.ts`

#### Forms
```typescript
// Pattern standard pour les formulaires
const form = useForm<InsertType>({
  resolver: zodResolver(insertSchema),
  defaultValues: {...}
});

// Soumission avec mutation
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/data'] });
  }
});
```

#### Composants UI
- **shadcn/ui** comme base de composants
- Extensions personnalisées dans `client/src/components/ui/`
- Thème personnalisé dans `client/src/index.css`

### Architecture Backend

#### Structure des Routes
```typescript
// server/routes.ts
app.post('/api/endpoint', async (req, res) => {
  // 1. Validation avec Zod
  const validated = schema.parse(req.body);
  
  // 2. Business logic via Storage
  const result = await storage.method(validated);
  
  // 3. Réponse
  res.json(result);
});
```

#### Storage Pattern
```typescript
// Interface de stockage abstrait
interface IStorage {
  // Méthodes CRUD typées
  create(data: InsertType): Promise<SelectType>;
  getAll(): Promise<SelectType[]>;
  getById(id: string): Promise<SelectType | null>;
  // ...
}
```

#### Base de Données
- **Drizzle ORM** avec PostgreSQL
- Schémas dans `shared/schema.ts`
- Validation Zod générée via `createInsertSchema`
- Migrations via `npm run db:push`

## Flux de Données

### 1. Formulaire Public → API → DB → Email

```
[Form Component]
    ↓ validation (Zod)
[API Route]
    ↓ parse & validate
[Storage Layer]
    ↓ insert to DB
[Email Service]
    ↓ send notification
[Response]
```

### 2. Admin Dashboard → API → DB

```
[Admin Component]
    ↓ useQuery
[API Route]
    ↓ auth check
[Storage Layer]
    ↓ fetch from DB
[Cache (TanStack Query)]
    ↓ automatic revalidation
[UI Update]
```

### 3. Participant Auth → Replit OIDC → Session

```
[Login Button]
    ↓ redirect to OIDC
[Replit Auth]
    ↓ callback
[Passport Strategy]
    ↓ create/update user
[Session Store]
    ↓ set cookie
[Protected Route]
```

## Système d'Emails

### Architecture
```
[Trigger Event]
    ↓
[Email Service (gmail.ts)]
    ↓ try
[Gmail SMTP] → [Success]
    ↓ catch
[File Logger] → [Fallback]
```

### Templates
- HTML avec CSS inline pour compatibilité
- Échappement des données utilisateur
- Branding cohérent (couleurs Kemet)

### Notifications
1. **Formation Registration** → Participant + Admin
2. **Contact Request** → Admin only
3. **Diagnostic Request** → Client + Admin
4. **Kemet Echo Demo** → Admin only
5. **Participant Credentials** → Participant only

## Sécurité

### Frontend
- Validation Zod sur tous les formulaires
- Sanitisation des inputs
- Protection XSS via React (auto-escape)
- HTTPS only

### Backend
- Validation Zod sur toutes les routes
- Express Session avec secrets
- CSRF protection (à implémenter)
- Rate limiting (à implémenter)
- SQL injection prevention (Drizzle ORM)

### Authentification
```
Admin: Email/Password (local strategy)
Participants: Replit Auth (OIDC)
```

### Emails
- HTML escaping sur toutes les données utilisateur
- Validation des adresses email
- Rate limiting sur l'envoi

## Performance

### Frontend
- Code splitting par route (Vite)
- Lazy loading des composants lourds
- Image optimization
- CSS purging (Tailwind)

### Backend
- Connection pooling (Neon)
- Query optimization (indexes)
- Response caching (TanStack Query)

### Database
- Indexes sur les colonnes fréquemment requêtées
- Pagination sur les grandes listes

## Déploiement

### Environnements
```
Development: npm run dev (local)
Production: Replit deployment
```

### Variables d'Environnement
```env
# Database
DATABASE_URL=postgresql://...

# Email
GMAIL_USER=infos@kemetservices.com
GMAIL_APP_PASSWORD=...

# Analytics
VITE_GA4_TRACKING_ID=G-...

# Auth (auto-configured by Replit)
ISSUER_URL=...
CLIENT_ID=...
CLIENT_SECRET=...
```

### Build Process
```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Start server
npm start
```

## Monitoring

### Logs
- Console logs en développement
- File logs pour les emails (fallback)
- Error tracking (à implémenter)

### Analytics
- Google Analytics 4
- Gestion du consentement cookies
- Events personnalisés

## Extensions Futures

### À court terme
- [ ] CSRF protection complète
- [ ] Rate limiting API
- [ ] Error tracking (Sentry)
- [ ] Tests unitaires et E2E

### À moyen terme
- [ ] Cache Redis
- [ ] Background jobs (Bull)
- [ ] WebSocket pour temps réel
- [ ] API versioning

### À long terme
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Mobile app (React Native)
- [ ] AI/ML recommendations
