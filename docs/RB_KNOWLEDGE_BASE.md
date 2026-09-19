# Reem Bank (RF) Knowledge Base — Agent KT

Everything an agent needs to work on Reem Bank Super Portal / customer-journey
requirements the way this team does. Distilled from the Application Revert
engagement (RF-3305, Sep 2026), the cancellation trilogy, the project knowledge
pack and the live UAT build. Companion working-agreements skill:
`.claude/skills/hailey-ba-us-brd/SKILL.md` (Hailey BA skill, Set 1 — US/BRD).

---

## 1. Platform overview

- **Reem Bank** is Reem Finance's digital bank. Two main surfaces:
  - **Customer journey** (mobile app / web onboarding) — product application
    flows for customers.
  - **Super Portal** (`super-portal-container.rfpilot.dev` on UAT) — the bank
    staff back office: enquiry, queues, role management, communication setup,
    rule engine / strategy management, reporting.
- Backend is a microservice estate: `backoffice-service`,
  `application-service`, `queue-service`, `user-service`,
  `audit-trail-service`, `notification-service`, `scheduler-service`
  (timeout jobs), and **`work-flow-service` (Camunda)** — the workflow engine
  that owns each application's process instance. Terminated instances
  (rejected/cancelled apps) are the hard part of any "reopen" feature:
  resume-vs-reinstantiate is an engineering estimation item.
- Jira project: **RF (REEM FINANCE)** on `scvaladdin.atlassian.net`.

## 2. Products & scope conventions

| Product | Credit decisioning | Notes |
|---|---|---|
| Credit Card (CC) | Yes | Live scope for portal features |
| Personal Loan (PL) | Yes | Live scope for portal features |
| CASA | **No** | Excluded from credit features (no credit decisioning) |
| Mortgage Loan (ML) | Being built | Own ticket wave (RF-29xx series), not yet platform scope |
| Auto Loan (AL) | Future | Not yet on the platform |

Portal permissions and features are always **per product tab** — `[Credit
Card]` / `[Personal Loan]` prefixes on each permission.

## 3. Application lifecycle & statuses

Typical status path: `Lead` → `In Progress` → decisioning → queue statuses
(`Awaiting Sales Response`, `Awaiting Credit Approval`, `Awaiting Compliance
Review`, `Awaiting Risk Review`) → `Approval In Principle` → `Awaiting Cooling
Off Period` → `Awaiting Signature` / `KFS Signature` → `Completed`.

Terminal / exceptional statuses: `Rejected`, `User Initiated Cancellation` →
`Cancelled`, `Invalidate`, `Insufficient Data`, `Declined`, `Failed by Minimum
Income`, `Expired`, `Blocked`, `Failed By EFR`.

**Status-model rule of thumb:** every NEW application status costs a mobile-app
change (see RF-3276 — a whole new mobile screen for INITIATED_CANCELLATION).
Prefer a **flag** on the application (`Cancel_App`, `Revert_App`) with the
status unchanged when the mobile app must not be impacted.

## 4. Queue model

- Queues (Queue menu + Role Management → Manually Queue): **Sale Queue
  L1–L3, Credit Queue L1–L3, Risk Queue L1–L3, Compliance Queue L1–L2,
  Transaction Posting Queue, Disbursement Maker / Checker, Maker Queue,
  Checker Queue, Termination Queue** (cancellation checker), and the new
  **Revert Queue** (revert checker).
- Each queue grants two per-product permissions: **View Application** and
  **Evaluate Application** (the decision buttons). Evaluate ≠ Send —
  distinct rights, never bundled (RF-2781/RF-2785 precedent; bundling has
  caused production hotfixes).
- **Drop points**: a maintained matrix decides which failures drop an
  application into which queue at which level (vs terminate outright). It is
  actively evolving (RF-3138 "Updates 2"). Any feature adding drop points
  must align with it.
- Queue Assignment Management (TAT configuration, assignment, notification /
  escalation emails) is its own in-flight module (RF-2265/2267/2268/2304).
  New queues eventually need a TAT row there.
- Credit Queue actions: Edit application, Override (with DBR validation),
  Send Application, Refetch ECB, Retrigger FTS, Approve/Reject. Checker-type
  queues (Termination, Revert) are **read-only except the decision**.

## 5. Credit decisioning concepts

- **Rule Engine (RE)**: published strategies / score checks / segmentations.
  An application that **fails all segmentations** ({Fail Strategies Check})
  is auto-rejected (logic intentionally unchanged by the Revert feature).
- **Limit Assignment**: computes the approved limit; **approved limit below
  Min Boundary with no deviation** (Approval Limit Result = "Failed") is an
  auto-reject. Boundary is strict "below" — equal to minimum must pass
  (RF-3093). Income-multiplier groups feed the calculation (RF-2460).
- **DBR family** (debt burden ratio) — precise terms matter:
  - **Existing DBR** — input to the DBR-Room calculation.
  - **Existing DBR > 50% after calculation** — safety-net auto-reject
    ({Safety net for Finance DBR}, RF-1041). Under the Revert change it
    **parks to Credit Queue L1 instead of auto-rejecting** (same Failed
    Reason message; RE + Limit Assignment completed so the queue view is
    complete).
  - **Gross DBR > 100%** — companion safety net, same parking treatment.
  - Two-DBR calculation logic is being updated in RF-2710; override-screen
    DBR validation has a bug cluster (RF-2386/2455/2459/2469/2559).
- **Overrides & deviations**: Credit users may override limits within
  deviation boundaries; post-revert re-assessment always evaluates against
  the **currently published** strategy versions, and the audit trail should
  record which version applied.

## 6. Pre-decision gates (never revertible / reopenable)

- **Pre-dedupe checks (Step 7.1)** — includes the **Existing Application
  Check**: a rejection blocks any new same-customer application for
  **30 days** (and has reached across products). A re-rejection **restarts**
  the 30-day countdown from the latest rejection date. An in-progress
  application blocks a new same-product application.
- Other pre-queue terminations: no applicable product ({Pre-Fetch Applicable
  Product}), AML blacklist / AML callback rejected, geo-fencing, EID-scan,
  EFR liveness. These fail **before any queue owns the case**, so there is
  no previous queue status to restore — that is why they can never be
  reverted.

## 7. Permissions / Role Management

- Tree: **Users → Role Management → Add Role**, sections: Collateral
  Management, **Enquiry** (Report Enquiry, **Application Enquiry**),
  **Manually Queue** (one entry per queue), Users Management.
- Application Enquiry permissions per product: View Application, Cancel
  Application, **Revert Application** (new). Queue permissions per product:
  View Application, Evaluate Application.
- A **Permission Matrix** reference page must be updated whenever
  permissions are added.

## 8. Audit trail conventions

Standard 8-field block on every step:
`[Application ID]`, `[Step]`, `[State]`, `[Start Time]`, `[End Time]`
(`yyyy-MM-dd HH:mm:ss`), `[Step Status]`, `[Step Detail]`, `[Action by]`
(user email id or `<System>`). Common rule **CR 003** covers comment audit.

- Step names are exact and load-bearing — revertibility is **derived from
  the audit step recorded at rejection** ({Rejected in Credit Queue
  [Level]}, Compliance Reject, Risk Reject, Sale Reject, {Safety net for
  Finance DBR}, {Fail Strategies Check}, Approval Limit Result = "Failed").
  Known defect: wrong audit trail written for high-Financial-DBR rejections
  (RF-3101) — must be fixed before derivation-based features rely on it.
- System auto-actions get their own steps: "Auto Cancellation on timeout",
  "Auto Revert Approval on timeout". The original rejection record is never
  modified by later features.

## 9. Communication Setup (emails)

- Templates carry an **Email Type: Client / Bank** classification (RF-2797
  adds the column to the portal list view). Always label templates
  **Email (Bank)** or **Email (Client)** in specs.
- Client templates: banking language, English (Arabic supported per
  RF-2459/2755), sign-off **"Reem Bank"** (never "Reem Finance"), all merge
  fields (`%%APPLICATION_ID%%`, `%%CUSTOMER_NAME%%`, `%%PRODUCT_TYPE%%`,
  `%%USER_NAME%%`) must resolve before dispatch. Rejection emails to the
  client: ET8/ET12 family.
- **One-decision-email rule**: the client receives exactly one email per
  decision; duplicate sends are a known bug class (RF-3268 — rejection email
  sent alongside due-diligence notification). Reopened/re-assessed cases must
  suppress duplicate decision notifications.
- Bank-side notifications: maker is emailed on checker decisions (bug
  precedent RF-2772); an email should also fire when an application drops to
  Credit Queue (bug RF-3067).

## 10. The cancellation trilogy — the pattern to mirror

- **RF-2365** — Cancel Application on Application Enquiry (maker side):
  button + confirmation popup with mandatory reason saved as a
  "CANCEL REASON"-style comment; status → `User Initiated Cancellation`;
  `Cancel_App` flag.
- **RF-2366** — Role Management permission for it.
- **RF-2367** — **Termination Queue** (checker): approve → `Cancelled`,
  reject → previous status; read-only apart from the decision; Comments tab
  default.
- **RF-2365 AC2.3** — *Automatic Application Termination Post Cancellation
  Timeout*: `[X]` days configurable in database (currently **5**), countdown
  from request submission; no decision → System auto-actions the request
  (audit "Auto Cancellation on timeout").
- Any maker–checker feature on the portal mirrors this set: same governance,
  same popup/toaster/audit/email shapes, same timeout mechanism.

## 11. The Application Revert feature (RF-3305) — summary

Full spec: `docs/brd/Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx`
and `docs/brd/RF-3305_US_Application_Revert.md`.

- Purpose: reopen a **Rejected** CC/PL application (Credit root cause only)
  so Credit can correct parameters and re-decision inside the 30-day
  re-application block.
- In-scope rejection cases: **R1** Credit user reject (Credit Queue L1–L3) ·
  **R2** Existing DBR > 50% after calculation (via parking) · **R3** Gross
  DBR > 100% (via parking) · **R4** fails all segmentations · **R5**
  approved limit below Min Boundary. Compliance / Risk / Sale rejections and
  all pre-decision terminations are out of scope.
- Mechanics: `Revert_App` flag (status stays `Rejected` while pending →
  zero mobile impact) · mandatory Revert Reason saved as REVERT REASON
  comment · request drops into the new **Revert Queue** for a Checker ·
  approve / timeout auto-approve → status changes from `Rejected` to
  **`Awaiting Credit Approval`**, re-enters **Credit Queue L1** (always L1)
  · reject → stays Rejected, flag cleared, a fresh request may be raised ·
  no cap on reverts · 30-day window restarts on re-reject.
- System change: both DBR safety nets **park to Credit Queue L1** instead of
  auto-rejecting (same Failed Reason; RE + Limit Assignment completed) —
  volume impact on Credit Queue for every breach.
- Communications: 2 × Email (Bank) per product (revert approved / not
  approved) + 1 × Email (Client) "approved after further review" at final
  confirmation only — all newly added in Communication Setup.
- Six screens + flow diagram: `SC1_Role_Permission_Application_Enquiry`,
  `SC2_Application_Enquiry_Revert_Button`, `SC3_Revert_Confirmation_Popup`,
  `SC4_Queue_Menu_Revert_Queue`, `SC5_Role_Permission_Revert_Queue`,
  `SC6_Revert_Queue_Approve_Reject`, `Flow_Application_Revert` (all in
  `docs/brd/`).

## 12. Portal UI/UX design system (sampled from the live build)

- **Font:** Plus Jakarta Sans (400/500/600/700).
- **Colours:** primary/action `#008AAB` · sidebar & flyout navy `#003764`
  (deep navy panel `#0A2C4F` family) · body text `#404345` · secondary grey
  `#73787B` · chevron grey `#868687` · reject/danger red `#D8092E` (text
  tint `#E66179`) · accordion row fill `#E5F2F6` · link tint `#49AAC2` ·
  timestamps `#9AA4AC` · borders `#E5E5E5` · modal canvas `#F6FCFF` on a
  dark overlay.
- **Patterns:** left icon sidebar with flyout menus; breadcrumb `Parent ›
  Section › Bold-blue current page`; Details card with `Label : VALUE`
  pairs; accordion sections (Cross-Application Identifier Match, Failed
  Reasons, Rule Engine Result, Approve Limit Result, CDD, Application
  Details, Liability Info, Credit Indicator); right panel with
  Comments / Documents tabs; bottom action bar — outline secondary buttons,
  filled primary on the right (49px high, radius 6, 13.5px/700); centred
  confirmation modals with title question, helper line, input, Back +
  primary CTA; toasters "«Action» of <Application ID> is …".
- Confirmation popup copy shape: "Are you sure you want to «action» the
  Application?" / "Yes, «Action»".

## 13. Document deliverable style (appro house)

- **BRD template** = *Application Cancellation in Super Portal V1.0*: Arial;
  black CAPS H1; `#156082` table headers, white bold header text, thin
  `#A6A6A6` borders; screen tables (label | Screen); `#FF5500` annotation
  box on the key screen; draw.io-style flow; cover with appro logo block,
  blue `#3B7EF6` title, **V + date**, navy wordmark, confidentiality lines,
  contact strip; footer = confidentiality + page number + four blue circles;
  THANK YOU page. Logo assets extracted, never redrawn:
  `docs/brd/assets/*.png`.
- **appro brand palette** (for appro-branded, non-BRD outputs): Navy
  `#1a214d`, Blue `#3b7ef6`, Yellow `#fdba23`, Lavender `#edf2ff`, Lato.
- No Jira ticket references inside client-facing BRDs.

## 14. Screenshot & document toolchain

- **Composites over real captures** (never lookalike mockups): each
  `docs/brd/rc*.html` is a self-contained page — full-bleed real capture
  `<img>` + absolutely-positioned patches/overlays, colours sampled from the
  base with PIL, Plus Jakarta Sans via @fontsource woff2. Render with
  Playwright/Chromium (`/opt/pw-browsers/chromium`) at `deviceScaleFactor:2`
  (exact commands in `docs/brd/README.md`).
- Raw UAT captures used as bases (48 screens incl. every queue, Role
  Management, Application Enquiry detail) — keep a copy safe; they are the
  raw material for any new composite.
- **BRD build:** edit `docs/brd/build_brd.js` (docx-js) → `node build_brd.js`
  → `soffice --headless --convert-to pdf` → proof with `pdftoppm` page
  renders (check blank pages, header wraps, orphan rows).
- **Jira:** Atlassian MCP can read/edit issues (`contentFormat: markdown`)
  and run JQL, but **cannot upload attachments** — deliver screens as a zip
  for manual drag-drop, with filenames matching the ticket text exactly.

## 15. In-flight tickets that touch this area (as of 19 Sep 2026)

See the Dependencies table in `docs/brd/RF-3305_US_Application_Revert.md`
for the mapped list: RF-3317 (Revert BE), RF-3101 (DBR audit-trail defect —
dependency), RF-3138 (drop-point updates — coordinate), RF-2710 (two-DBR
calculation — coordinate), RF-3268 / RF-3067 / RF-2772 (email trigger bug
class), RF-2797 (Email Type Client/Bank column), RF-2428 (Failed Reasons
display), RF-3178/3182 (30-day Failed Reason display), RF-3093 (Min
Boundary boundary case), RF-2265/2268/2304 (Queue Assignment Management /
TAT), RF-3276 (mobile INITIATED_CANCELLATION screen), RF-3309 (Credit Queue
edit + RE re-run).

## 16. Working agreements with the PO

Codified in `.claude/skills/hailey-ba-us-brd/SKILL.md` — read it before any
US/BRD work. Headlines: flag source conflicts before applying instructions;
never overwrite her manual edits (surgical Jira deltas only); decisions go
into the relevant AC, not meta-sections; open questions asked in chat as a
numbered list with defaults; dated covers; Email (Bank)/(Client) labels;
enumerate in-scope scenarios; screenshots = real-capture composites named by
mapping and zipped; **visual-first** — every described area carries its
screenshot beside it (the Impact Analysis is an Area | Impact | Screen
table; per-area reference crops live in `docs/brd/assets/ia_*.png`).
