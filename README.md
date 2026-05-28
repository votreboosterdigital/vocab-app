# WordQuest 🚀 — English Vocabulary App

Application d'apprentissage du vocabulaire anglais pour père + fille 7-8 ans.

## Stack

- Next.js 16 App Router + TypeScript strict
- Tailwind CSS v4
- Anthropic Claude API (`claude-sonnet-4-6`)
- Web Speech API (prononciation native browser)
- localStorage (pas de base de données)

## Setup

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
# Édite .env.local et remplace "your_key_here" par ta clé Anthropic

# 3. Lancer en développement
npm run dev

# 4. Build de production
npm run build && npm run start
```

## Obtenir une clé Anthropic API

1. Crée un compte sur https://console.anthropic.com
2. Va dans "API Keys" et génère une nouvelle clé
3. Copie la clé dans `.env.local`

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (http://localhost:3000) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |

## Structure

```
vocab-app/
├── app/
│   ├── page.tsx          # Accueil — sélecteur profil + modes
│   ├── flashcards/       # Mode révision avec flip card 3D
│   ├── quiz/             # Mode QCM 4 choix
│   ├── fill/             # Mode compléter la phrase (Claude)
│   └── api/              # Routes API (generate-sentence, generate-quiz, generate-fill)
├── components/           # WordCard, AudioButton, ProgressBar, etc.
├── lib/
│   ├── words.ts          # Dataset 150 mots (niveaux 1/2/3)
│   ├── progress.ts       # Logique localStorage
│   └── speech.ts         # Web Speech API wrapper
└── types/index.ts        # Types TypeScript partagés
```

## Fonctionnalités

- **3 modes** : Flashcards, Quiz QCM, Compléter la phrase
- **150 mots** en 3 niveaux de difficulté
- **Prononciation** : Web Speech API (accent en-US)
- **IA** : Claude génère des phrases exemples contextuelles
- **Progression** : localStorage namespaced par profil (`vocabapp_papa` / `vocabapp_Eya`)
- **Streak** : compteur de jours consécutifs de pratique
