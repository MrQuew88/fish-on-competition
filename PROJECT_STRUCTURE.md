# Architecture du projet Fishing Competition

## Vue d'ensemble

Application Next.js 14 avec TypeScript pour gérer des compétitions de pêche.

## Structure complète des dossiers

```
fishing-competition/
├── app/                                    # App Router Next.js 14
│   ├── (auth)/                            # Route group - Authentification
│   │   ├── login/
│   │   │   └── page.tsx                   # Page de connexion
│   │   └── signup/
│   │       └── page.tsx                   # Page d'inscription
│   │
│   ├── (dashboard)/                       # Route group - Dashboard principal
│   │   ├── competitions/
│   │   │   ├── page.tsx                   # Liste des compétitions
│   │   │   ├── create/
│   │   │   │   └── page.tsx               # Création de compétition
│   │   │   └── [id]/                      # Routes dynamiques par ID
│   │   │       ├── page.tsx               # Détails de la compétition
│   │   │       ├── manage/
│   │   │       │   └── page.tsx           # Gestion de la compétition
│   │   │       ├── catches/
│   │   │       │   └── page.tsx           # Captures de la compétition
│   │   │       └── leaderboard/
│   │   │           └── page.tsx           # Classement
│   │   └── history/
│   │       └── page.tsx                   # Historique des compétitions
│   │
│   ├── api/                               # API Routes
│   │   ├── competitions/
│   │   │   └── route.ts                   # CRUD compétitions
│   │   ├── invitations/
│   │   │   └── route.ts                   # Gestion des invitations
│   │   ├── catches/
│   │   │   └── route.ts                   # CRUD captures
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts               # Configuration NextAuth
│   │
│   ├── invite/
│   │   └── [token]/
│   │       └── page.tsx                   # Page d'acceptation d'invitation
│   │
│   ├── layout.tsx                         # Layout racine
│   ├── globals.css                        # Styles globaux avec Tailwind
│   └── page.tsx                           # Page d'accueil
│
├── components/                            # Composants React
│   ├── ui/                                # Composants UI réutilisables
│   ├── competitions/                      # Composants liés aux compétitions
│   ├── catches/                           # Composants liés aux captures
│   └── leaderboard/                       # Composants de classement
│
├── lib/                                   # Bibliothèques et utilitaires
│   ├── supabase.ts                        # Configuration Supabase
│   ├── utils.ts                           # Fonctions utilitaires
│   └── validations.ts                     # Schémas de validation Zod
│
├── types/                                 # Définitions TypeScript
│   └── index.ts                           # Types globaux
│
├── public/                                # Assets statiques
│   └── images/                            # Images
│
├── .env.local.example                     # Template des variables d'environnement
├── .gitignore                             # Fichiers ignorés par Git
├── next.config.mjs                        # Configuration Next.js
├── tailwind.config.ts                     # Configuration Tailwind CSS
├── tsconfig.json                          # Configuration TypeScript
├── postcss.config.mjs                     # Configuration PostCSS
├── package.json                           # Dépendances et scripts
└── README.md                              # Documentation du projet
```

## Route Groups

### (auth)
Route group pour l'authentification. Les pages dans ce groupe partagent un layout commun d'authentification.

### (dashboard)
Route group pour le dashboard. Les pages nécessitent une authentification et partagent le layout du dashboard.

## Routes API

- **POST /api/competitions** - Créer une compétition
- **GET /api/competitions** - Lister les compétitions
- **GET /api/competitions/[id]** - Détails d'une compétition
- **PUT /api/competitions/[id]** - Mettre à jour une compétition
- **DELETE /api/competitions/[id]** - Supprimer une compétition

- **POST /api/invitations** - Créer une invitation
- **GET /api/invitations** - Lister les invitations
- **PUT /api/invitations/[id]** - Accepter/refuser une invitation

- **POST /api/catches** - Enregistrer une capture
- **GET /api/catches** - Lister les captures
- **PUT /api/catches/[id]** - Mettre à jour une capture
- **DELETE /api/catches/[id]** - Supprimer une capture

## Technologies utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Supabase** - Backend (base de données, authentification, storage)
- **NextAuth.js** - Gestion de l'authentification
- **Zod** - Validation de schémas

## Variables d'environnement requises

Voir `.env.local.example` pour la liste complète.

## Prochaines étapes

1. Implémenter les composants UI de base
2. Configurer Supabase et créer le schéma de base de données
3. Implémenter l'authentification avec NextAuth
4. Créer les API routes
5. Implémenter les pages du dashboard
6. Ajouter la logique métier pour les compétitions et captures
7. Implémenter le système d'invitations
8. Créer le système de classement (leaderboard)
