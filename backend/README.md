# Appro API Marketplace — Backend API

A real REST API for the marketplace portals: **Express + SQLite + JWT auth**.
Replaces the front-end's mock/localStorage data with persisted, server-side data
and real authentication + role scoping.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET  | `/health` | – | Liveness check |
| POST | `/auth/login` | – | Email + password → JWT |
| GET  | `/me` | token | Current user |
| GET  | `/api/products` | token | API catalogue |
| GET  | `/api/products/:id` | token | Product detail |
| GET  | `/api/tenants` | admin | All tenants |
| GET  | `/api/stats` | admin | Overview counters |
| GET  | `/api/subscriptions` | token | Admin: all · Tenant: own |
| POST | `/api/subscriptions` | token | Subscribe (production → pending) |
| PATCH| `/api/subscriptions/:id` | admin | Approve / reject |
| DELETE | `/api/subscriptions/:id` | token | Unsubscribe |
| GET  | `/api/keys` | token | List API keys (tenant-scoped) |
| POST | `/api/keys` | token | Create key (full secret returned once) |
| POST | `/api/keys/:id/revoke` | token | Revoke a key |

Auth: send `Authorization: Bearer <token>` from `/auth/login`.
Roles: `super_admin` (platform admin) sees everything; tenant users are scoped
to their own tenant and blocked from admin-only routes.

## Seed logins

| Email | Password | Role |
|-------|----------|------|
| `admin@appro.ae` | `Appro@12345` | Platform super admin |
| `admin@nuqud.ae` | `Demo@12345`  | Tenant admin (Nuqud Pay) |

## Run locally

```bash
cd backend
npm install
npm run seed        # optional — the server also auto-seeds an empty DB on boot
npm start           # http://localhost:4000
```

Quick check:
```bash
curl -s localhost:4000/health
TOKEN=$(curl -s -X POST localhost:4000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@appro.ae","password":"Appro@12345"}' | sed 's/.*"token":"//;s/".*//')
curl -s localhost:4000/api/stats -H "Authorization: Bearer $TOKEN"
```

## Deploy (get a public URL)

The API needs a host that runs a Node server (GitHub Pages can't). Fastest options:

### Render (recommended — repo already has `render.yaml`)
1. Push this repo to GitHub (done).
2. Go to **render.com → New → Blueprint**, connect the repo.
3. Render reads `render.yaml`, builds `backend/`, and deploys.
4. You get a URL like `https://appro-marketplace-api.onrender.com`.
   - `JWT_SECRET` is auto-generated. Set your own to keep tokens valid across redeploys.

### Railway
1. **railway.app → New Project → Deploy from GitHub repo**.
2. Set **Root Directory** = `backend`, Start command `node src/server.js`.
3. Add a `JWT_SECRET` variable. Railway gives you a public domain.

> Free tiers use an ephemeral filesystem, so the SQLite file resets on redeploy —
> the server re-seeds automatically on boot, which is ideal for a demo. For durable
> data, attach a persistent disk and point `DATABASE_PATH` at it, or switch to Postgres.

## Config

Environment variables (see `.env.example`):
- `PORT` — default `4000`
- `JWT_SECRET` — signing secret (set a long random value in production)
- `DATABASE_PATH` — SQLite file location (default `backend/data.sqlite`)

## Wiring the frontend

Point the portals at the deployed API base URL and replace the mock login/data
calls with `fetch` to these endpoints (store the JWT, send it as a Bearer header).
This is the next step once the API URL is live.
