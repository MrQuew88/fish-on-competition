# Guide de démarrage - Fishing Competition

## 🚀 Installation rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

```bash
cp .env.local.example .env.local
```

Ensuite, éditez `.env.local` et remplissez les valeurs :

- **NEXT_PUBLIC_SUPABASE_URL** : URL de votre projet Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** : Clé anonyme Supabase
- **SUPABASE_SERVICE_ROLE_KEY** : Clé de service Supabase
- **NEXTAUTH_SECRET** : Secret pour NextAuth (générez avec `openssl rand -base64 32`)
- **NEXTAUTH_URL** : URL de votre application (http://localhost:3000 en dev)

### 3. Configuration de Supabase

#### Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et les clés API

#### Schéma de base de données (à créer)

```sql
-- Table des utilisateurs (étendue de auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des compétitions
CREATE TABLE competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- Table des captures
CREATE TABLE catches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  fish_species TEXT NOT NULL,
  weight DECIMAL(10, 2),
  length DECIMAL(10, 2),
  photo_url TEXT,
  location TEXT,
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des invitations
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_competitions_created_by ON competitions(created_by);
CREATE INDEX idx_participants_competition_id ON participants(competition_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_catches_competition_id ON catches(competition_id);
CREATE INDEX idx_catches_user_id ON catches(user_id);
CREATE INDEX idx_invitations_token ON invitations(token);
```

### 4. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure des fichiers à implémenter

### Priorité 1 : Configuration de base

1. **types/index.ts** - Définir les types TypeScript
2. **lib/supabase.ts** - Configuration du client Supabase
3. **lib/utils.ts** - Fonctions utilitaires (cn, formatters, etc.)
4. **lib/validations.ts** - Schémas Zod pour la validation

### Priorité 2 : Authentification

1. **app/api/auth/[...nextauth]/route.ts** - Configuration NextAuth
2. **app/(auth)/login/page.tsx** - Page de connexion
3. **app/(auth)/signup/page.tsx** - Page d'inscription
4. **app/layout.tsx** - Layout racine avec providers

### Priorité 3 : Composants UI de base

1. **components/ui/** - Boutons, inputs, cards, modals, etc.
2. **app/page.tsx** - Page d'accueil

### Priorité 4 : Fonctionnalités principales

1. **API Routes** - Implémenter les routes CRUD
2. **Dashboard** - Pages de compétitions
3. **Composants métier** - Composants spécifiques aux compétitions, captures, leaderboard

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm run start

# Linter
npm run lint

# Générer un secret NextAuth
openssl rand -base64 32
```

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🎯 Prochaines étapes recommandées

1. ✅ Installer les dépendances
2. ✅ Configurer les variables d'environnement
3. ⬜ Créer le schéma de base de données dans Supabase
4. ⬜ Implémenter les types TypeScript
5. ⬜ Configurer l'authentification
6. ⬜ Créer les composants UI de base
7. ⬜ Implémenter les API routes
8. ⬜ Développer les pages du dashboard
9. ⬜ Tester et débugger
10. ⬜ Déployer sur Vercel
