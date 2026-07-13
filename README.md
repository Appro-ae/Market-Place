# Appro · API Marketplace Portal

A faithful, editable reconstruction of the **Appro API Marketplace** portals — a
UAE-first marketplace for banking & fintech APIs.

The project was rebuilt from the Appro Admin Console reference (a self-contained
prototype) into clean, multi-file source that renders identically.

## Portals

| Portal | Path | Status |
|--------|------|--------|
| **Admin Console** | [`admin/`](admin/) | ✅ Complete — login, tenant management, product setup, billing, subscriptions, user roles, usage & analytics, request logs |
| **Customer Portal** | [`customer/`](customer/) | 🟡 Shell + design system + login reconstructed; tenant screens pending the customer standalone |
| Marketplace home | [`index.html`](index.html) | ✅ Landing page linking to both portals |

## Tech stack

No build step. React runs in the browser via Babel Standalone (`text/babel`
scripts), styled with inline styles on top of a shared CSS design-token system.

- **React 18** + **ReactDOM** + **Babel Standalone** — vendored under
  [`assets/vendor/`](assets/vendor/) so the app runs fully offline (no CDN).
- **Design system** — [`assets/css/design-system.css`](assets/css/design-system.css):
  color, type, spacing, radii, shadow and motion tokens.
- **Fonts** — Montserrat / Manrope / Lato / Inter / IBM Plex Mono via Google Fonts
  (fallbacks for Appro's licensed Gotham + Satoshi). Degrades to system fonts offline.
- **Logos** — [`assets/logos/`](assets/logos/) (official `appro` wordmark, color + white).

## Running locally

Browsers block `file://` XHR, which Babel Standalone uses to load the `.jsx`
modules, so the project must be **served over HTTP**:

```bash
# from the repo root
python3 -m http.server 8099
# then open:
#   http://localhost:8099/            → marketplace home
#   http://localhost:8099/admin/      → admin console
#   http://localhost:8099/customer/   → customer portal
```

Any static server works (`npx serve`, `php -S`, nginx, etc.).

## Project layout

```
.
├── index.html                 # marketplace landing page
├── admin/
│   ├── index.html             # admin console entry (loads vendor + modules)
│   └── js/
│       ├── 00-shell.jsx           # Icon set, shared atoms, customer Sidebar/Topbar
│       ├── 01-login.jsx           # LoginScreen (admin + customer variants)
│       ├── 02-toasts.jsx          # toast + inline-error helpers
│       ├── 03-admin-shell.jsx     # AdminSidebar, AdminTopbar, catalog seed data
│       ├── 04-admin-catalog.jsx   # Overview, Catalog, Onboard wizard
│       ├── 05-product-setup.jsx   # Product Setup / governance
│       ├── 06-admin-secondary.jsx # Access Requests, Tenants, Audit, Settings
│       ├── 07-tenant-management.jsx
│       ├── 08-user-roles.jsx
│       ├── 09-billing-model.jsx   # billing model + compute
│       ├── 10-billing-subscriptions.jsx
│       ├── 11-usage-logs.jsx      # Usage & Analytics + Request Logs
│       ├── 12-tweaks.jsx          # theming tweaks panel
│       └── app.jsx                # auth gate + screen router + mount
├── customer/
│   └── index.html             # customer portal (placeholder — see status above)
└── assets/
    ├── css/design-system.css
    ├── logos/appro-logo-{color,white}.svg
    └── vendor/{react,react-dom}.development.js, babel.min.js
```

## Notes

- State is prototype-local: seed data plus `localStorage` (auth flag, current
  screen, locally-published APIs). No backend calls.
- The admin login accepts any input — it is a front-end gate for the prototype.
- Adding the Customer Portal: drop its screen modules into `customer/js/` and an
  `index.html` mirroring the admin entry. The shared shell, login and design
  system are already in place.
