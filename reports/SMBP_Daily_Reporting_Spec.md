# Appro SMBP Daily Release Reporting — Specification v2

Supersedes `Daily_Reporting_Agent_Spec.md` (25–26 Aug session). Every rule marked
**[USER RULE]** is an explicit instruction from Hailey and must not be re-derived.
Numbers quoted here are worked examples from the 26 Aug run, never constants.

---

## 0. The flow

```
① Input        Jira — the CR(s), or a dashboard/filter. Everything derives from here.
② Summarise    Resolve scope, trace defects, audit fixes, diff against yesterday.
③ Design       Render the two approved templates (§5), Appro-branded, self-contained.
④ Trigger      Huyen types "Generate SMBP report".
```

**Trigger phrase:** `Generate SMBP report` → fires the `smbp-report` skill
(`.agents/skills/smbp-report/SKILL.md`, symlinked into `.claude/skills/`).

**Confirmed operating choices (26 Aug):**

| Choice | Setting |
|---|---|
| Parameter confirmation | **Always confirm before generating.** Print the parameter block, wait for a yes. |
| Fix-verification depth | **Full changelog read on every fix, every day.** |
| Output layout | **Dated folder per run** (`reports/<YYYY-MM-DD>/`), fresh artifacts each time. |

---

## 1. Runtime parameters

All live in `reports/smbp/params.json` — **the only file edited between runs.**

`cr_keys` (1..N — one CR is fully valid) · `target_release` · `release_date` (+ override) ·
`window_start`/`window_end` (default: 1st of month → today) · `cut_date_offset_days` ·
`dev_roster` (name, squad, accountId, allocation) · `testers` · `portal_merge_map` ·
`feature_renames` · `exclude_keys` · `stage_weights` · `status_ids`.

**[USER RULE]** Developer roster is exactly the 8 named. KhoeHD is 50% allocation, all
others 100%. KhoeHD counts as Bank-side. Anyone else in a developer position is flagged,
not credited. Tang Ha Long displays as "Tang Ha Long" even though Jira shows "Long".

**Stage weights:** UAT Validated 1.0 · UAT TESTING 0.75 · Tested with Bugs 0.5 ·
Implemented 0.4 · IN DEVELOPMENT 0.25 · US Approved / To Do / Ready To Clarify 0.0.
If a new status appears, **stop and ask** rather than weighting it 0 silently.

---

## 2. Scope resolution

**[USER RULE]** Release membership comes from the **release-items table(s) inside each CR
description**, not from issue links. **[USER RULE]** Portal category comes from the
**Category column of the CR's own table**, not from title prefixes.

Apply `exclude_keys`, then cross-check tables against live links and report drift:
linked-but-not-in-table, in-table-but-unlinked, heading count ≠ row count.

---

## 3. Defect tracing

Open bug statuses: `To Do, In Progress, Ready To Clarify, UAT TESTING`. A defect belongs
to a scope item through its **issue links** (bugs link to stories, not to the CR).

**[USER RULE — Bank team rule]** A defect on a **Bank Portal** scope item held by a
developer who is **not** Bank squad is reported under **Channel**. If held by a **BA** it
**stays Bank Portal**. Ignore the catch-all AMP-2079 for categorisation.

---

## 4. Fix-verification standard — RESOLVED

A **verified fix** requires all six:

1. Developer personally performed the To Do → UAT TESTING transition (JQL guarantees it).
2. Developer also performed the reassignment — `assignee changed BY <dev> DURING (window)`.
3. **No BA scope rewrite after the ticket reached the developer.** *(sharpened 26 Aug)*
   A summary/description edit by a non-developer disqualifies the fix **only if it lands
   after the first assignment to a developer**. Triage-time edits before assignment do not
   count. This is what separates AMP-3188 (fail) from AMP-2611 and AMP-2646 (pass).
4. **[USER RULE]** Bugs raised before the window but fixed inside it **count**.
5. **[USER RULE]** Exclude titles marked not-a-bug.
6. **[USER RULE — answered 26 Aug]** Exclude tickets whose final status is Cancelled, and
   report a **first-pass rate** alongside the raw count. A fix is first-pass when the
   ticket was never rejected from UAT Testing back to To Do.

### The four failure modes (regression tests)

| # | Failure | Example | Fix |
|---|---|---|---|
| 1 | `assignee CHANGED FROM X TO Y` records values, not actors | AMP-3103 | Use `status changed ... by <actor>` |
| 2 | Tester list incomplete — Phuong receives handoffs too | Toan counted 1 instead of 33 | Count by actor, not recipient |
| 3 | BA rewrites scope after the dev has it | AMP-3188 | Criterion 3; needs changelog |
| 4 | Ticket ultimately Cancelled | AMP-2496 | Criterion 6; check by **status ID** |

### 26 Aug result (full audit, 141/141 tickets)

144 raw transitions → **119 verified**, first-pass rate **81%**. Exclusions: 10 Cancelled,
3 no self-reassignment, 2 not-a-bug, 11 BA scope rewrite. Seven of the 11 rewrites were
Toan's, which is why his verified count (24) sits well below his raw count (34).

---

## 5. Dashboard specifications

### Brand (both)
Font **Lato**. Navy `#1a214d`, blue `#3b7ef6`, yellow `#fdba23`, lavender `#edf2ff`,
white; red `#d92d20` **only** for alerts/ageing; tints `#5b6ba8` (Implemented),
`#9dc0ff` (In development), `#dbe7ff`. Appro logo top-left as embedded base64 PNG, 38px.
Yellow pill badge top-right. **Hand-built SVG charts only** — no chart libraries.
Rounded 16px cards, KPI cards with coloured left border. Print-safe. Single self-contained
file. Value labels must never clip; charts size to their row count; full names, not initials.

### Dashboard 1 — Release Programme Status
Header · alert banner · **KPIs (5)**: days to release, scope items, open defects,
High & Blocker, weighted completion (**[USER RULE]** no "release tickets" KPI) ·
**Movement since <date>** *(new)* · Scope readiness by release ticket (one stacked bar per
CR) · Open defects by portal (**[USER RULE]** category level, not feature) · Defect ageing
by portal (0–5 / 6–30 / 31+) · Portal position table (**[USER RULE]** no Features column,
no BA column) · High & Blocker load by owner · Feature progress with ticket-key chips and
"<n> features" chips · High & Blocker full list · Footnote.

### Dashboard 2 — Defect & Developer Performance
Header + method one-liner · **KPIs (2 only)**: raised, closed (**[USER RULE]** all others
removed) · Arrival vs closure per day + PM line · Cumulative gap + PM line · Fixes per
developer (alloc chip, share bar, %, first-pass, per available day) · Time from raised to
closed · Open defect ageing by developer + PM line · Release band (navy) · Release ageing
by portal · Footnote. **[USER RULE]** PM one-liners only on the two flow charts and the
dev-ageing board; no "Project manager's read" section; no High & Blocker table here.

---

## 6. Interaction rules **[USER RULES]**

- Ask clarifying questions **before** expensive generation. Offer discrete options.
- Verify challenged numbers **live**; when a method breaks, say so plainly, quantify the
  error, and show the changelog evidence.
- Cannot produce Jira UI screenshots — give changelog data plus the ticket URL.
- Corrections are cumulative: portal taxonomy, names, dates and removals persist across
  every regeneration.
- Surface data-quality findings — never silently absorb them.

---

## 7. Jira limitations and standing recommendations

- Bugs carry no Component, empty fixVersion, labels on <10%. Portal is only derivable via
  links to scope items, so category splits of all-project bug populations are **not
  possible honestly**. **Recommendation on file:** add a mandatory **Component** field on
  Bug (Channel / Distribution / Admin / Bank).
- **Recommendation on file:** Jira Automation — on Bug transition to UAT TESTING, stamp the
  previous assignee into a **"Fixed by"** field. That makes all of §4 a one-line query.
- **`status = Cancelled` matches nothing in this instance** — use `status = 10056`.
  Any saved filter using the name is undercounting.
- Link deletion is not possible via the toolset; scope removals must be done in the Jira UI.
- Always reconcile against Hailey's filters; never average.

## 8. Open items

- **Faeeq Ajaz** receives and rejects developer handoffs in volume but is not on the
  `testers` list — confirm before counting him as a tester.
- The count of open bugs held by the 8 developers fell 167 → 107 between the 25 and 26 Aug
  runs, while only 6 bugs were raised and 0 closed on 26 Aug. That is a bulk reassignment,
  not closures — confirm what happened.
