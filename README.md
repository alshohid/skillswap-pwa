# SkillSwap PWA

A community marketplace where members trade skills using **Skill Points** instead of money. Installable Progressive Web App built with Next.js.

```
SkillSwap PWA
     │
Next.js 15 + TypeScript 15 (App Router)
     │
RTK Query ──► NestJS Backend ──► PostgreSQL
     │
Service Worker + Web App Manifest (offline-capable)
```

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (brand tokens in `globals.css`) |
| Data | Redux Toolkit + RTK Query (`authApi`, `tasksApi`, `usersApi`, `transactionsApi`) |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Icons | lucide-react |
| PWA | Hand-rolled service worker + web app manifest (zero extra deps) |

## Getting started

```bash
npm install
cp .env.example .env.local        # point NEXT_PUBLIC_API_URL at your NestJS API
npm run dev                       # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm start           # serve the production build
npm run typecheck   # tsc --noEmit
npm run icons       # regenerate public/icons/*.png from scripts/generate-icons.mjs
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login`, `/register` | JWT auth (React Hook Form + Zod) |
| `/dashboard` | KPIs, recent tasks, recent transactions |
| `/dashboard/tasks` | Browse tasks (search + status filter + pagination) |
| `/dashboard/tasks/create` | Create task (`POST /tasks`) |
| `/dashboard/tasks/[id]` | Task details — apply / assign / complete / cancel by role |
| `/dashboard/my-tasks` | Posted by you + assigned to you |
| `/dashboard/applications` | Received (per your tasks) \| Applied tabs |
| `/dashboard/transactions` | Balance + point-transfer history |
| `/dashboard/profile` | Profile view + `PATCH /users/me` |

## API mapping

| UI action | Endpoint |
| --- | --- |
| Login / Register | `POST /auth/login`, `POST /auth/register` |
| Session user | `GET /auth/me` |
| Profile / update | `GET /users/me`, `PATCH /users/me` |
| Browse tasks | `GET /tasks?page&limit&status&search` |
| Task details | `GET /tasks/:id` |
| Create task | `POST /tasks` |
| Apply | `POST /tasks/:id/applications` |
| Task applications | `GET /tasks/:id/applications` |
| Assign applicant | `POST /tasks/:taskId/assign/:applicationId` |
| Complete (ACID transfer) | `POST /tasks/:id/complete` |
| Cancel | `POST /tasks/:id/cancel` |
| My transactions / balance | `GET /transactions/me`, `GET /transactions/balance` |

JWT is stored in `localStorage`, attached as `Authorization: Bearer …` by the
RTK Query base query, and a **401 on any authed endpoint clears the session and
hard-redirects to `/login?next=…&expired=1`**.

### Conventions & normalisation

The backend serialises entities in **snake_case** (`points_offered`) while
request DTOs are **camelCase** (`pointsOffered`, `fullName`). Responses pass
through tolerant normalisers (`src/lib/normalize.ts`) so common envelope
variations (`{data,meta}`, arrays, `amount|points|points_transferred`,
`balance|skill_points`) all work unchanged.

## PWA behaviour

- **Manifest** — standalone display, theme `#2563eb`, shortcuts for Browse/Create/Wallet.
- **Icons** — generated PNGs (+ SVG) via a dependency-free rasteriser script.
- **Service worker** — Workbox via **InjectManifest** (source: `src/sw.ts`,
  generated artifact: `public/sw.js`, built by `scripts/build-sw.mjs` after
  `next build`; never edit the generated file):
  - **Precache** — app shell assets (`/_next/static/**`, icons, manifest,
    `/offline.html`) with content-hash revisioning handled by Workbox;
  - **Navigations** → NetworkFirst (4 s timeout, navigation preload enabled);
    offline fallback is the precached `/offline.html` page — documents only;
  - **API GET allowlist only** (`/tasks…`, `/transactions/me|/balance`) →
    NetworkFirst (5 s timeout), HTTP-200-only, cached ≤ 10 min in
    `skillswap-api-readonly-v1`. `/auth/*` and `/users/me` are **never** cached;
  - **API mutations (POST/PUT/PATCH/DELETE)** → **NetworkOnly.** Never queued,
    never replayed, never answered by the SW — completing a task triggers a
    server-side ACID point transfer, and a real network error reaches the UI
    untouched instead of any synthetic "offline" response;
  - images/fonts → CacheFirst with bounded entries + expiration; everything
    unmatched goes straight to the network (no global offline handler).
- **Updates** — the new worker waits; a "New version available" card lets the
  user Refresh (SKIP_WAITING + single reload). No blind `skipWaiting()`.
- **Install prompt** card via `beforeinstallprompt` (7-day dismissal memory),
  fully decoupled from service-worker logic.
- **Offline banner** distinguishes browser-offline ("You're offline — showing
  last synchronized data.") from server-unreachable ("Unable to reach SkillSwap
  servers — retrying…"), using online/offline events plus a CORS-safe
  reachability probe fed by real RTK Query failures.
- The last known profile is cached in `localStorage`, so cold boots offline still
  render the dashboard shell.

### Testing the PWA locally

The SW registers in production builds only (`next build && npm start`). To get
a clean slate while testing: DevTools → Application → Service Workers →
*Unregister*, then Storage → *Clear site data*, and reload.

## Assumptions & backend gaps

1. **Reject application** — the documented API has no reject endpoint, so only
   **Assign** is rendered. Add e.g. `DELETE /tasks/:taskId/applications/:appId`
   or `PATCH …/applications/:appId {status}` to enable it.
2. **"Applications I submitted"** has no aggregate endpoint; the Applied tab
   replays locally recorded task ids (`lib/session.ts`). A `GET /applications/me`
   endpoint would make this robust.
3. Received-applications tab fetches applications per owned task (bounded at 8)
   because only `GET /tasks/:id/applications` exists.
4. `search`/`status` query params are sent optimistically — ignored safely if
   the backend filters differently.
5. Point transfer validation (`sender balance ≥ points_offered`) is assumed to
   live inside the backend's DB transaction, as designed.
6. Swagger responses would ideally document `TaskResponseDto` etc.
   (`@ApiOkResponse({ type })`) so these normalisers can eventually be dropped.

## Project layout

```
src/
├── app/                    # routes (landing, auth, dashboard/*)
├── components/
│   ├── auth/               # AuthBootstrap, AuthGuard
│   ├── common/             # Sidebar, BottomNav, DashboardHeader, cards…
│   ├── pwa/                # SW register, install prompt, offline banner
│   ├── providers/          # AppProviders (store + toast + bootstrap)
│   ├── tasks/              # apply/completion modals, panels
│   └── ui/                 # buttons, inputs, modal, toast, badges…
├── hooks/use-auth.ts
├── lib/                    # constants, utils, validators, normalizers, session
├── store/                  # slices + RTK Query api endpoints
└── types/api.ts            # backend contract types
public/
├── manifest.webmanifest
├── sw.js
└── icons/                  # generated PNG/SVG icons
scripts/generate-icons.mjs
```

# skillswap-pwa
