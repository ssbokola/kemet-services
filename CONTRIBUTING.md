# Guide de Contribution - Kemet Services

Merci de votre intérêt pour contribuer au projet Kemet Services ! Ce document vous guidera dans le processus de contribution.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- Git
- Compte Replit (pour le déploiement)

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd kemet-services

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer le serveur de développement
npm run dev
```

## 📋 Standards de Code

### TypeScript
- Utiliser TypeScript strict mode
- Typer toutes les fonctions et variables
- Éviter `any`, préférer `unknown` si nécessaire
- Utiliser les types générés par Drizzle

### React
- Composants fonctionnels uniquement
- Hooks personnalisés pour la logique réutilisable
- Props typées avec TypeScript
- Pas de `React.FC`, typer directement les props

### Styling
- Tailwind CSS pour tous les styles
- Utiliser les classes du design system
- Pas de CSS inline sauf cas exceptionnels
- Responsive mobile-first

### Naming Conventions
```typescript
// Composants : PascalCase
export function MyComponent() {}

// Fichiers : PascalCase pour composants
MyComponent.tsx

// Hooks : camelCase avec préfixe use
export function useMyHook() {}

// Utilitaires : camelCase
export function formatPrice() {}

// Constantes : UPPER_SNAKE_CASE
const MAX_ITEMS = 100;
```

## 🏗️ Architecture

### Structure des Dossiers
```
client/src/
├── components/        # Composants réutilisables
│   ├── ui/           # shadcn/ui composants
│   └── ...           # Composants métier
├── pages/            # Pages de l'app
├── hooks/            # Custom hooks
├── lib/              # Utilitaires
└── index.css         # Styles globaux

server/
├── index.ts          # Entry point
├── routes.ts         # API routes
├── storage.ts        # Data layer
└── gmail.ts          # Email service

shared/
└── schema.ts         # Drizzle + Zod schemas
```

### Ajout d'une Nouvelle Feature

1. **Définir le schéma de données**
```typescript
// shared/schema.ts
export const myTable = pgTable("my_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // ... autres colonnes
});

export const insertMySchema = createInsertSchema(myTable)
  .omit({ id: true, createdAt: true });
```

2. **Créer l'interface storage**
```typescript
// server/storage.ts
interface IStorage {
  // ... méthodes existantes
  createMy(data: InsertMyType): Promise<MyType>;
}
```

3. **Ajouter la route API**
```typescript
// server/routes.ts
app.post('/api/my-endpoint', async (req, res) => {
  const data = insertMySchema.parse(req.body);
  const result = await storage.createMy(data);
  res.json(result);
});
```

4. **Créer le composant frontend**
```typescript
// client/src/pages/MyPage.tsx
export default function MyPage() {
  const mutation = useMutation({
    mutationFn: (data) => apiRequest('/api/my-endpoint', data)
  });
  // ...
}
```

## 🧪 Tests

### Avant de Committer
```bash
# Vérifier les types TypeScript
npm run build

# Tester localement
npm run dev
# Naviguer vers la feature et tester manuellement
```

### Checklist de Test
- [ ] Feature fonctionne sur desktop
- [ ] Feature fonctionne sur mobile
- [ ] Formulaires validés correctement
- [ ] Emails envoyés (vérifier logs)
- [ ] Aucune erreur console
- [ ] Aucune erreur TypeScript

## 📝 Commit Guidelines

### Format
```
type(scope): description courte

[Corps optionnel]
```

### Types
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, pas de changement de code
- `refactor`: Refactoring sans changement de comportement
- `perf`: Amélioration de performance
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

### Exemples
```bash
feat(formations): add enrollment confirmation email
fix(admin): correct registration count display
docs(readme): update installation steps
```

## 🔄 Pull Request Process

1. **Créer une branche**
```bash
git checkout -b feat/ma-nouvelle-feature
```

2. **Faire vos changements**
- Suivre les standards de code
- Tester localement
- Committer avec des messages clairs

3. **Pousser et créer une PR**
```bash
git push origin feat/ma-nouvelle-feature
```

4. **Description de la PR**
- Décrire les changements
- Lier les issues concernées
- Ajouter des screenshots si UI

## 🐛 Signaler un Bug

### Template d'Issue
```markdown
## Description
[Description claire du bug]

## Steps to Reproduce
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Expected Behavior
[Ce qui devrait se passer]

## Screenshots
[Si applicable]

## Environment
- Browser: [e.g. Chrome 120]
- Device: [e.g. iPhone 12]
```

## 💡 Proposer une Feature

### Template d'Issue
```markdown
## Problem Statement
[Quel problème cette feature résout-elle ?]

## Proposed Solution
[Comment voulez-vous résoudre ce problème ?]

## Alternatives Considered
[Quelles autres solutions avez-vous envisagées ?]

## Additional Context
[Informations supplémentaires, mockups, etc.]
```

## 📚 Ressources

### Documentation
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

### Outils
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)
- [Regex101](https://regex101.com)

## ❓ Questions

Pour toute question :
- Ouvrir une issue GitHub
- Contacter l'équipe : infos@kemetservices.com

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.

---

Merci de contribuer à Kemet Services ! 🙏
