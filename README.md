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
