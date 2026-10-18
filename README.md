# A&O Realty

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

## Vercel deployment

The repository includes `vercel.json`. Vercel runs `pnpm install --frozen-lockfile`, builds with `pnpm build`, and serves the compiled website from `dist/public`, so browser requests receive the real A&O Realty website rather than repository source files. The SPA fallback routes browser pages to the built `index.html`.

The managed Manus deployment remains the current full-stack runtime for the database, seller workspace, admin tools, messaging, verification, and storage APIs. The Vercel configuration is frontend-first; production email/password authentication and a Vercel-hosted backend should be configured separately before moving those backend capabilities off the managed runtime.
