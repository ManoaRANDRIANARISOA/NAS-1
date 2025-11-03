Commands:

•  Install: pnpm install

•  Develop: pnpm dev (Vite on http://localhost:8080 with Express middleware; API at /api)

•  Tests: pnpm test; single test name: pnpm test -t "cn function"; single file: pnpm test client/lib/utils.spec.ts

•  Typecheck: pnpm typecheck

•  Format: pnpm format.fix

•  Build: pnpm build (client -> dist/spa, server -> dist/server/node-build.mjs)

•  Start: pnpm start (production server serves SPA and API; PORT=3000 by default)


•  Architecture (high-level):

•  Client (React + Vite + Tailwind + MUI + shadcn-style UI): routes in client/App.tsx, layout in client/layout/AppLayout.tsx, session via Redux Toolkit, data via React Query wrapping client/services/mock.ts.

•  Server (Express): createServer in server/index.ts (CORS, JSON, routes /api/ping and /api/demo), production entry in server/node-build.ts serving dist/spa and routing non-API requests to index.html.

•  Shared types: shared/api.ts used by both sides.

•  Dev integration: Vite plugin mounts Express middleware during dev (vite.config.ts).

•  Production build: server bundles via vite.config.server.ts (target node22).

•  Aliases: @ -> ./client, @shared -> ./shared.

•  Linting: ESLint not configured; rely on typecheck and Prettier.





📋 Structure du Projet
Architecture Full-Stack :

✅ Frontend : React 18 + TypeScript + Vite + TailwindCSS 3
✅ Backend : Express intégré avec Vite dev server
✅ State Management : Redux Toolkit (@reduxjs/toolkit)
✅ Data Fetching : Tanstack Query (React Query)
✅ UI Components : Radix UI + MUI v6 (Material-UI) avec Emotion
✅ Routing : React Router v6 (mode SPA)
✅ Icons : Lucide React
✅ Package Manager : pnpm
🎨 Système de Thème
TailwindCSS 3 avec variables CSS HSL dans global.css
MUI Theme personnalisé dans client/theme/mui.ts
Dark mode supporté avec classe .dark
Palette de couleurs : Bleu pastel (primary), Vert pastel (secondary)
🗂️ Organisation du Code
Client :

pages/ - Routes de l'application (Dashboard, Restaurant, Hébergement, etc.)
components/ui/ - Bibliothèque de composants réutilisables (Radix UI)
layout/ - Layout principal (AppLayout)
contexts/ - AuthContext pour l'authentification
store/ - Redux store
services/ - API et mock data
hooks/ - Custom hooks (useRBAC)
Fonctionnalités Actuelles :

🔐 Authentification (AuthContext)
📊 Dashboard
🍽️ Gestion Restaurant (Plan, Menu, Stock, Événements)
🏨 Gestion Hébergement (Chambres, Clients, Stock, Tarifs)
💰 Module Financier
⚙️ Administration