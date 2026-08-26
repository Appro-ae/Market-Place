# Appro Daily Release Reporting Agent — Full Specification

**Purpose**: Given a set of runtime parameters (below), produce two Appro-branded, self-contained HTML dashboards daily:
1. **Release Programme Status** (`Release_Programme_Dashboard.html`)
2. **Defect & Developer Performance** (`Defect_Developer_Performance.html`)

## 0. Runtime parameters — everything here is DYNAMIC, nothing is hardcoded

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `CR_KEYS` | list of 1..N Jira keys | required | e.g. `["AMP-2564"]` or `["AMP-2564","AMP-3305"]`. **1 CR is a fully valid input** — never assume two. |
| `TARGET_RELEASE` | string | nearest upcoming release found in the CRs | e.g. `"Release 3.1"`. A CR may contain **one or many** release tables; report only the target. If a CR holds a single unlabelled item table, treat that whole table as the target release. |
| `RELEASE_DATE` | date | parsed from the CR's Package Timeline | Override wins over CR text (precedent: CRs said 4 Sep, true date was 7 Sep). |
| `WINDOW_START` / `WINDOW_END` | dates | 1st of current month → today | Performance dashboard window. |
| `DEV_ROSTER` | list of {name, squad, accountId, allocation} | registry in §1 | Editable per run — people join/leave; allocations change. |
| `TESTERS` | list of accountIds | Hien, Mansoor, Phuong | Extend when a new person starts receiving handoffs (detect: frequent `assignee CHANGED TO <person>` from developers → flag for confirmation). |
| `PORTAL_MERGE_MAP` | dict | `{"Super Portal":"Bank Portal"}` | Category normalisation; extendable. |
| `FEATURE_RENAMES` | dict | `{"Backend Logics":"Grace Period & First EMI Day"}` | Presentation names; extendable. |
| `EXCLUDE_KEYS` | list | `[]` | Items the PO removed from the report before the Jira link is deleted (precedent: AMP-3229). |
| `STAGE_WEIGHTS` | dict | §2 Step 2 table | If a new workflow status appears, **stop and ask** rather than weight it 0 silently (precedent: "Implemented" appeared mid-stream and needed 0.4). |

The agent must derive counts, portals, features, dates and titles **from the CRs at run time**. Any number that appears in this spec (28 items, 41 defects, 7 Sep…) is a worked example from the 25–26 Aug session, **never a constant**.

Everything below was established, corrected and validated in the working session of 25–26 Aug 2026. Rules marked **[USER RULE]** are explicit instructions from Hailey and must not be re-derived.

---

## 1. Environment & Identity

- Jira Cloud ID: `c501c3c5-8601-4a1a-90fb-e833f87ed209` (scvaladdin.atlassian.net, project **AMP**)
- Timezone: Asia/Dubai (GST). Working week Mon–Fri.

### People registry (accountIds verified)

| Person | Role | Squad | accountId | Notes |
|---|---|---|---|---|
| Tang Ha Long | Developer | Bank | `712020:c2a391b8-b1e5-42bb-9e9c-91bb7d24586c` | Display name in Jira is "Long" — **[USER RULE]** always report as "Tang Ha Long" |
| LongLH | Developer | Bank | `63bce3990a1b5442166a3d21` | Separate person from Tang Ha Long |
| KhoeHD | Developer | Bank | `63e355a0c2b1cb6b3473dc4c` | **[USER RULE]** 50% allocation; all others 100% |
| NgoHuu.Toan | Developer | Channel/Admin/DP | `712020:24847883-770b-4c91-a45a-ddff2c07621e` | |
| phamhoang.nam | Developer | Channel/Admin/DP | `712020:64c3eeff-75f1-486a-bd37-1d52056c7412` | |
| Minh Hoang | Developer | Channel/Admin/DP | `712020:0d960272-5e65-4945-9bce-70be70ca8043` | |
| Nguyen Trong Quan | Developer | Channel/Admin/DP | `712020:f82f417d-1c4e-4d17-b0cb-4f69a6dac4ed` | |
| Thanh Tung Nguyen ("Tung") | Developer | Channel/Admin/DP | `712020:6c94ea85-2e20-4e82-852f-18a2a98fcf41` | |
| Hien Nguyen | QA / tester | — | `712020:4e0784ee-42bb-497a-b8ae-30dc424aed95` | Also raises most bugs |
| Mansoor ahmad | BA, acts as tester | — | `712020:19567d9d-bbad-4b99-953f-93c7e1ab85d1` | |
| Nguyen Thi Thuy Phuong | BA, **acts as tester** | — | `63e37b40bf837c6893db3660` | Missing her as tester broke the first fix count — always include |
| Bui Minh Trang - Emma, Khaled Mohammed Qahtan, Ta Chu Quy, Huyen, Kannan Subramaniam, Faeeq Ajaz | BA / business reporters | — | — | Raise bugs; never count as developers |

**[USER RULE]** Developer roster is exactly the 8 above. KhoeHD counted as Bank-side. Anyone else appearing in a developer position (e.g. Kha Pham Thuc) is flagged, not credited.

---

## 2. Daily pipeline — step by step

### Step 1 — Resolve scope from the CR(s) — fully dynamic
1. For **each key in `CR_KEYS`** (may be one), fetch the description (`getJiraIssue`, `responseContentFormat: markdown`).
2. **[USER RULE]** Release membership comes from the **release-items table(s) inside each CR description**, NOT from issue links alone. Discover the tables present at run time — a CR may hold one release, several, or an unlabelled single table (→ treat as `TARGET_RELEASE`). Filter every downstream number to `TARGET_RELEASE` only.
3. **[USER RULE]** Portal category comes from the **Category column of the CR's own table**, not from title prefixes. The portal set is whatever the tables contain, normalised through `PORTAL_MERGE_MAP` (current: Super Portal → Bank Portal).
4. Apply `EXCLUDE_KEYS`, then cross-check the tables against live links (`issue in linkedIssues("<CR>")` per CR) and report drift: linked-but-not-in-table, in-table-but-unlinked, heading counts ≠ row counts (precedent: a table headed "8 items" listing 7).
5. Take `RELEASE_DATE` from the CR's Package Timeline unless overridden; if the override differs from the CR text, use the override **and flag the CR as stale** (precedent: 7 Sep vs 4 Sep).
6. If `CR_KEYS` has one entry, the "Scope readiness by release ticket" chart simply renders one bar; the Portal position table shows one ticket value throughout — no layout change, no assumptions about a second CR.

### Step 2 — Pull live status for every scope item
- Batch: `key in (K1, K2, ...)` with fields `summary,status,issuetype,assignee` (batches of ~80 work).
- Progress weighting **[USER RULE, evolved]**:
  `UAT Validated 1.0 · UAT TESTING 0.75 · Tested with Bugs 0.5 · Implemented 0.4 · IN DEVELOPMENT 0.25 · US Approved / To Do / Ready To Clarify 0.0`

### Step 3 — Trace open defects to scope
- Open bug statuses: `To Do, In Progress, Ready To Clarify, UAT TESTING`.
- A defect belongs to a scope item via its issue links (bugs link to stories, not to the CR). Pull open bugs with `issuelinks` and match link targets against the scope key set.
- **[USER RULE — Bank team rule]** A defect on a **Bank Portal** scope item **held by a developer who is not Bank squad** is reported under **Channel** (example: AMP-3298 held by phamhoang.nam). If held by a **BA** (e.g. Phuong on AMP-3171) it **stays Bank Portal**.
- Known catch-all to ignore for categorisation: AMP-2079 "[DIP2] End User Testing Bugs Consolidated".

### Step 4 — Compute Dashboard 1 aggregates
Per portal and per feature: item count, weighted %, stage mix (6 stages incl. Implemented + In development), open defects, High & Blocker, oldest defect age. Ageing bands: 0–5 / 6–30 / 31–60 days since raised.

### Step 5 — Compute Dashboard 2 aggregates (window: 1st of month → today)
- **Raised**: `created` in window, per day. **Closed**: `resolutiondate` in window (Done / Cancelled / UAT Validated), per day. Cumulative gap = backlog growth.
- **Fixes per developer — the corrected method (v2)**:
  ```
  project = AMP AND issuetype = Bug AND
  status changed from "To Do" to "UAT TESTING" by <developer accountId>
  DURING ("<start>","<end+1>")
  ```
  This checks **who performed the transition**. Do **NOT** use the v1 method (`assignee CHANGED FROM dev TO tester`) — see failure modes.
- Per-available-day rate = fixes ÷ (working days × allocation). KhoeHD ×0.5.
- Cycle time distribution over closed bugs: 0–2 / 3–7 / 8–14 / 15–30 / 31+ days.
- Open-defect ageing **per developer** (all open bugs assigned to the 8, not just release scope): bands 0–5 / 6–14 / 15–30 / 31+, plus oldest and % over a month.
- Release section: `TARGET_RELEASE` scope KPIs + ageing by portal, "position from <cut date>" (cut date = a run parameter, default = release-minus-7-days).

### Step 6 — Render both dashboards (see §5 layout specs) and save as self-contained HTML.

---

## 3. Fix-verification standard **[USER RULE — answered explicitly]**

A **verified fix** requires all of:
1. The developer **personally performed** the `To Do → UAT TESTING` status transition (query above guarantees this), **and**
2. The developer **also did the reassignment to the tester themselves** (changelog: same actor, seconds apart), **and**
3. **No major scope rewrite by someone else beforehand** — exclude tickets where a BA substantially redefined the ask before the developer's transition (example: AMP-3188, description rewritten 4× and retitled twice by Phuong).
4. **[USER RULE]** Bugs raised before the window but fixed inside it **count** ("fixed in window is what matters").
5. **[USER RULE]** Exclude tickets whose title marks them "not a bug" (example: AMP-3013).
6. **OPEN QUESTION (asked, unanswered when session ended)**: exclude tickets whose **final status is Cancelled** (example: AMP-2496 — three submissions, two rejections, cancelled), and whether to flag rejected-and-resubmitted separately from first-pass fixes. The agent should default to **excluding Cancelled outcomes** and **reporting a first-pass-rate**, but surface both numbers until Hailey confirms.

### The four failure modes discovered (test cases for the agent)
| # | Failure | Example | Fix |
|---|---|---|---|
| 1 | `assignee CHANGED FROM X TO Y` records field values, not **who** acted — third parties get devs credited/discredited | AMP-3103: phamhoang.nam did status+reassign in 2s while ticket sat under Toan; Toan absent from entire changelog | Use `status changed ... by <actor>` |
| 2 | Tester list incomplete — Phuong receives handoffs too | Toan counted 1 instead of 33 | Count by actor, not by recipient |
| 3 | BA rewrites scope before dev touches | AMP-3188 | Criterion 3 above; needs changelog read |
| 4 | Ticket ultimately Cancelled despite dev transitions | AMP-2496 | Criterion 6; check final status |

**Verification protocol**: JQL counts are the fast pass; a **full audit reads every changelog** and applies criteria 1–6. Audited so far: Toan spot-checked (AMP-3075 ✓, AMP-3164 ✓, AMP-3188 weak), LongLH audit started (AMP-2496 → excluded). Remaining 57 changelogs pending. Corrected v2 counts currently on the dashboard (pre-audit): Toan 33 · Tang Ha Long 26 · Nam 21 · KhoeHD 20 · Quan 13 · LongLH 11 · Tung 11 · Minh Hoang 0 (confirmed three ways).

---

## 4. Jira data limitations & standing recommendations
- **Bugs carry no Component, empty fixVersion, labels on <10%.** Portal is only derivable via links to scope items → category splits of all-project bug populations (raised/closed/cycle-time) are **not possible** honestly. Recommendation on file: add a mandatory **Component** field on Bug (Channel / Distribution / Admin / Bank).
- Recommendation on file: Jira Automation — on Bug transition to UAT TESTING, stamp previous assignee into a **"Fixed by"** field; makes all of §3 a one-line query forever.
- Link deletion is not possible via the toolset (create only) — scope removals must be done in Jira UI (AMP-3229 precedent).
- `searchResultMode: "count"` for cheap totals; `filter = <id>` works for saved filters; JQL history operators (`CHANGED FROM/TO/BY/DURING`) are the workhorse.
- Reconciliation precedent: Hailey's filter 20632 (36) vs dashboard (41) — differences were 2 Bank-Portal defects (her filter was AMP-2564-only) + 3 old Offline-Product defects. Always reconcile, never average.

---

## 5. Dashboard specifications (as iterated and approved)

### Brand (both dashboards)
- Font **Lato** (Google Fonts). Colours: navy `#1a214d`, blue `#3b7ef6`, yellow `#fdba23`, lavender `#edf2ff`, white; red `#d92d20` **only** for alerts/ageing; extended tints `#5b6ba8` (Implemented), `#9dc0ff` (In development), `#dbe7ff`.
- **Appro logo** top-left, embedded **base64 PNG**, 38px high; yellow pill badge top-right with report name + date. Hand-built **SVG charts only** (no Chart.js). Rounded 16px cards, KPI cards with coloured left border. Print-safe (`break-inside:avoid`). Single self-contained file.
- Charts: value labels must never clip (scale PX to max value); charts size to their row count (no empty rows); full names, not initials.

### Dashboard 1 — Release Programme Status (scoped to `TARGET_RELEASE` only)
1. Header: title "<TARGET_RELEASE> — Programme Status", subtitle listing each CR in `CR_KEYS` with its portal grouping (one or many), refresh timestamp.
2. **KPIs (5)**: days to release · scope items · open defects on release items · High & Blocker · weighted completion. (**[USER RULE]** no "release tickets" KPI.)
3. **Scope readiness by release ticket** — one stacked bar **per CR in `CR_KEYS`** (a single bar is normal), 6 stages, scope total at bar end.
4. **Open defects by portal** — **category level, not feature** **[USER RULE]**; yellow = High/Blocker.
5. **Defect ageing by portal** — one stacked row per portal, bands 0–5/6–30/31–60 **[USER RULE]**.
6. **Portal position** table: Portal (+1-line description, optional GOAL chip per portal supplied as a run parameter (example used: Bank Portal — "Complete the Auto Loan flow — except DOL, which lands in Release 3.2")), Release ticket, Items, Progress, Defects, High. (**[USER RULE]** no Features column, no BA column anywhere.)
7. **High & Blocker load by owner** — bars, full names.
8. **Feature progress**: category bands carry "<n> features" chip **[USER RULE]**; each feature row shows **ticket-key chips** **[USER RULE]**, description, items, 6-stage mix bar, %. Feature naming: "Grace Period & First EMI Day" (was "Backend Logics") **[USER RULE]**; "Prod & UAT Bugs" category for AMP-3010/3192 (never "Unclassified") **[USER RULE]**.
9. **High & Blocker full list**: Key, Portal, Feature, Summary, Parent, Status, Priority, Age (red >5d), Ageing owner ("holding Xd").
10. Footnote: scope definition, weighting, Bank-team rule applied, discrepancies.

### Dashboard 2 — Defect & Developer Performance (project-wide, window = `WINDOW_START` → `WINDOW_END`)
1. Header with method one-liner + window.
2. **KPIs (2 only)**: Defects raised · Defects closed **[USER RULE — all others removed]**.
3. **Arrival vs closure per day** (grouped bars) + one PM line. **Cumulative gap** (lines + shaded area) + one PM line. (**[USER RULE]** PM one-liners only on these two + the dev-ageing board; no "Project manager's read" section, no PM lines on fixes/cycle/High/ageing-by-portal.)
4. **Fixes per developer**: Developer(+squad), **Alloc** (50% yellow chip for KhoeHD), Fixes, share bar, %, **per available day**. v2 method + audit caveat in subtitle.
5. **Time from raised to closed** buckets (blue within week, navy within month, red 31+).
6. **Open defect ageing by developer** — full board: 0–5/6–14/15–30/31+ colour cells, Total, Oldest (red >30d), "Read" column (% of queue over a month) + PM line.
7. **Release band** (navy): `TARGET_RELEASE` name/date + Open defects · High & Blocker · Raised since cut · Days to release — all computed for the target release resolved in Step 1.
8. **Release ageing by portal** full-width. (**[USER RULE]** no High & Blocker table here, no "Who raised" section.)
9. Footnote: definitions, corrected method text, residual audit gaps.

### Companion artefact (on request): Release Scope by Portal
One card **per release table found in the CRs** plus a Combined card when there is more than one release (skip Combined for a single release): Portal, Items, "What ships" (feature (count) lists; Bank 3.1 = Product Setup (2) · Conditional Offer (2) · Grace Period & First EMI Day (1) · Tuning Performance (2)); no Share/% columns in drop tables **[USER RULE]**; Combined keeps 3.1/3.2 split bar + % of all.

---

## 6. Interaction rules learned **[USER RULES]**
- Ask clarifying questions **before** expensive generation ("ask me question before generating to avoid wasting token"). Offer discrete options.
- Verify challenged numbers **live** before defending them; when a method breaks, say so plainly, quantify the error, and show the changelog evidence.
- Cannot produce Jira UI screenshots — provide the changelog data + direct ticket URL instead.
- Corrections are cumulative: portal taxonomy, names, dates and removals must persist across every regeneration.
- Surface data-quality findings (unlinked bugs, heading mismatches, stale CR dates, two-account users) — never silently absorb them.

## 7. Future daily flow
**Input**: the §0 parameters — minimally `CR_KEYS` (one or many) and optionally `TARGET_RELEASE`; everything else defaults.
Examples of valid invocations:
- `CR_KEYS=["AMP-2564","AMP-3305"], TARGET_RELEASE="Release 3.1"` (the 25 Aug session)
- `CR_KEYS=["AMP-2722"]` — single CR, single release table → report that release
- `CR_KEYS=["AMP-2564"], TARGET_RELEASE="Release 3.2", RELEASE_DATE="2026-09-07"`

**Output**: the two dashboards above (filenames carry the release and date) + a short delta note vs the previous run (scope adds/removals, status moves, new High/Blocker, fix-count changes).

**Self-checks before publishing**: portal totals reconcile to scope totals; defect counts reconcile between charts and tables on the same page; every value label renders inside its SVG; any rule the data breaks (new status, new portal, new frequent handoff recipient, count/heading mismatch) is surfaced as a question, not silently absorbed.
**Open item to confirm with Hailey before first autonomous run**: §3 criterion 6 (Cancelled outcomes / rework flagging).
