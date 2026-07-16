# Appro · API Marketplace Portal

A faithful, editable reconstruction of the **Appro API Marketplace** portals — a
UAE-first marketplace for banking & fintech APIs.

The project was rebuilt from the Appro Admin Console and Customer Portal
reference prototypes into clean, multi-file source that renders identically.

## Portals

| Portal | Path | Screens |
|--------|------|---------|
| **Admin Console** | [`admin/`](admin/) | Login, Tenant Management, Product Setup, Billing Management, Subscription Management, User Role Management, Usage & Analytics, Request Logs |
| **Customer Portal** | [`customer/`](customer/) | Login, Dashboard, Product Catalogue, Product Detail, API Keys, API Credentials, IP Allowlists, Usage & Analytics, Request Logs, Consent, Subscriptions & Billing, Access Requests, Team, Settings, Verification (KYC/KYB), Environments |
| Marketplace home | [`index.html`](index.html) | Landing page linking to both portals |

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
├── index.html                     # marketplace landing page
├── shared/
│   └── js/                        # atoms shared by both portals
│       ├── shell.jsx                  # Icon set, Sidebar/Topbar, Btn/Card/StatusPill/…
│       ├── login.jsx                  # LoginScreen (admin + customer variants)
│       ├── toasts.jsx                 # toast + inline-error helpers
│       └── billing-model.jsx          # billing model + compute
├── admin/
│   ├── index.html                 # admin console entry
│   └── js/
│       ├── 03-admin-shell.jsx         # AdminSidebar, AdminTopbar, catalog seed data
│       ├── 04-admin-catalog.jsx       # Overview, Catalog, Onboard wizard
│       ├── 05-product-setup.jsx       # Product Setup / governance
│       ├── 06-admin-secondary.jsx     # Access Requests, Tenants, Audit, Settings
│       ├── 07-tenant-management.jsx
│       ├── 08-user-roles.jsx
│       ├── 10-billing-subscriptions.jsx
│       ├── 11-usage-logs.jsx          # Usage & Analytics + Request Logs
│       ├── 12-tweaks.jsx              # theming tweaks panel
│       └── app.jsx                    # auth gate + screen router + mount
├── customer/
│   ├── index.html                 # customer portal entry
│   └── js/
│       ├── 01-dashboard-catalog.jsx   # Dashboard + Product Catalogue
│       ├── 02-api-detail-keys.jsx     # Product Detail, API Keys, IP Allowlists, Subscribe modal
│       ├── 03-operate-screens.jsx     # Usage, Logs, Access Requests, Team, Settings, key modals
│       ├── 04-verification.jsx        # KYC/KYB verification + banner
│       ├── 05-environments.jsx        # AWS / Azure environments + provision modal
│       ├── 06-credentials.jsx         # API Credentials
│       ├── 07-consent.jsx             # Consent management
│       ├── 08-customer-billing.jsx    # Subscriptions & Billing (tenant view)
│       └── app.jsx                    # auth gate + screen router + mount
└── assets/
    ├── css/design-system.css
    ├── logos/appro-logo-{color,white}.svg
    └── vendor/{react,react-dom}.development.js, babel.min.js
```

## Notes

- State is prototype-local: seed data plus `localStorage` (auth flag, current
  screen, subscriptions, verification status). No backend calls.
- Both logins accept any input — they are front-end gates for the prototype.
- The `shared/js/` atoms are byte-identical across portals (`login.jsx` differs
  from the original only in the admin→customer cross-link path).
