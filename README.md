# Fishing Competition App

Application de compétition de pêche construite avec Next.js 14, TypeScript, Tailwind CSS et Supabase.

## Structure du projet

```
fishing-competition/
├── app/                    # App Router de Next.js 14
│   ├── (auth)/            # Route group pour l'authentification
│   ├── (dashboard)/       # Route group pour le dashboard
│   ├── api/               # API routes
│   └── invite/            # Pages d'invitation
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et helpers
├── types/                 # Définitions TypeScript
└── public/                # Assets statiques
```

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Copier `.env.local.example` vers `.env.local` et remplir les variables d'environnement

4. Lancer le serveur de développement :
```bash
npm run dev
```

## Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **Supabase** - Backend as a Service (BaaS)
- **NextAuth.js** - Authentification
- **Zod** - Validation de schémas

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build l'application pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint
