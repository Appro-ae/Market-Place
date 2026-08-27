---
name: smbp-report
description: >
  Generate the Appro SMBP daily release report — two Appro-branded HTML dashboards
  (Release Programme Status, and Defect & Developer Performance) built live from Jira
  project AMP. Trigger on "Generate SMBP report", "SMBP report", "daily dashboard report",
  "daily release report", "run the daily report", or any request to refresh the release
  programme / defect dashboards. Resolves scope from the CR release-items tables, traces
  open defects to scope, runs the full fix-verification audit, renders both dashboards
  with a movement-since-last-run card, then commits and publishes them.
---

# SMBP Daily Report

Full spec: `reports/SMBP_Daily_Reporting_Spec.md`. Pipeline: `reports/smbp/`.
Every rule marked **[USER RULE]** in the spec is an explicit instruction from Hailey —
apply it, never re-derive it.

## Phase 0 — Confirm (never skip)

Load `reports/smbp/params.json`, re-fetch each CR in `cr_keys`, then print one block and
**wait for a yes**:

```
CR_KEYS         AMP-2564, AMP-3305
TARGET_RELEASE  Release 3.1
RELEASE_DATE    2026-08-31  (N days out)
WINDOW          1 - N August 2026  (M working days)
CUT DATE        release minus 7
```

Also print anything that drifted since the last run: a changed release date, a new
workflow status, a new portal, a heading/row count mismatch, a new frequent handoff
recipient. **[USER RULE]** Surface these as questions — never absorb them silently.

## Phase 1 — Input (Jira)

1. Each CR description — `getJiraIssue`, `responseContentFormat: markdown`.
   **[USER RULE]** Release membership comes from the **release-items table inside the CR
   description**, not from issue links. Portal comes from the table's **Category column**,
   not the ticket title. Normalise through `portal_merge_map`.
2. Scope statuses — one JQL `key in (...)`, fields
   `summary,status,issuetype,assignee,parent,priority`.
3. Link drift — `issue in linkedIssues("<CR>")` per CR; report linked-but-not-in-table,
   in-table-but-unlinked, and heading-count ≠ row-count.
4. Open bugs project-wide — statuses `To Do, In Progress, Ready To Clarify, UAT TESTING`,
   include `issuelinks`. Paginate 100 at a time.
5. Window bugs — `created` OR `resolutiondate` inside the window.
6. Per-developer fixes — 8 × `status changed from "To Do" to "UAT TESTING" by <accountId>
   DURING ("<start>","<end+1>")`.

## Phase 2 — Audit and summarise

`extract_audit.py` → `mkfixtable.py` → `analyse.py` → `mkmovement.py` → `mksecurity.py`.
A **verified fix** requires all six:

1. The developer personally performed the To Do → UAT TESTING transition (the JQL guarantees this).
2. The developer also performed the reassignment — `AND assignee changed BY <dev> DURING (window)`.
3. **No BA scope rewrite after the ticket reached the developer.** A summary or description
   edit by a non-developer disqualifies the fix *only if it lands after the first assignment
   to a developer*. Triage-time edits before assignment do not count. `extract_audit.py`
   implements this; it reproduces the hand-judged verdicts on AMP-3188 (fail) and
   AMP-2611 / AMP-2646 (pass).
4. Bugs raised before the window but fixed inside it **count**. **[USER RULE]**
5. Exclude titles marked not-a-bug. **[USER RULE]**
6. Exclude tickets whose final status is Cancelled, and report a **first-pass rate**
   alongside the raw count. **[USER RULE — confirmed 26 Aug]**

Exclusions are applied in precedence order — Cancelled, then not-a-bug, then criterion 3,
then criterion 2 — so a ticket failing two tests is deducted once. `mkfixtable.py` enforces
this; check 9 proves `raw − Σexclusions = verified`. Raw transitions exceed distinct tickets
whenever two developers each submit the same ticket (26 Aug: 152 transitions, 149 tickets).

## Phase 3 — Render

`dash1.py` + `dash1b.py` → `d1_part*.html`; `dash2b.py` + `dash2c.py` → `d2_part*.html`;
concatenate each pair into `reports/<run_id>/`, alongside `agg.json`, `fixtable.json`,
`movement.json` and `security.json` for tomorrow's comparison.

`run_id` is `params.json`'s `run_id` (default: the run date). **More than one run per day**
uses a `<date>-<suffix>` folder, e.g. `2026-08-26-eod`; `movement.load_prev` accepts both
forms and orders them lexicographically, so the chain is date → date-suffix → next date.
`mkmovement.py` then produces two legs: `daily` (vs the previous *day's* run, which is what
the KPI strip and the narrative lines use) and `overnight` (vs an earlier run the same day,
rendered as the navy strip). Skip the overnight leg when there is only one run that day.

Dashboard 1 opens with the **Movement since <date>** card: KPI deltas, portal deltas, and
item-level status moves split forward/backward. A backward move is the signal a percentage
hides — surface it. Dashboard 2 carries a **penetration-test callout** under the fixes table
(`mksecurity.py`, driven by the `role: Security tester` entry in `params.json` `testers`):
raised / closed / open, fixed this window, and the PT rework rate against the all-fix rate.

**Never hardcode a narrative number.** Every "up from X yesterday", "gone X → Y",
"almost all on Z" line reads from `movement.json` or `agg.json`; the 26 Aug run found three
that had gone stale. Working days to release ≠ calendar days — compute both.

Then run `selfcheck.py` (all 12 checks plus the rendered-HTML cross-checks) and screenshot
each dashboard in headless Chromium at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`
to confirm no SVG value label clips. To inspect a region below the fold, load the page in
an offset `<iframe>` and screenshot that.

## Phase 4 — Deliver

Commit to the working branch, push, publish both as Artifacts, and report in chat: the
headline movement, the audited fix table, and every data-quality finding.

## Jira gotchas — each of these cost real time; do not rediscover them

- **`status = Cancelled` matches nothing in this instance.** Use `status = 10056`.
  By name it returned 0 across all 141 fix tickets; by ID, 10. Saved filters using the
  name are undercounting.
- **Force large results to spill to a file, then process with `jq`/Python** — near-zero
  context cost. `fields: ["*all"]` plus
  `expand: changelog,renderedFields,names,editmeta,schema,operations,versionedRepresentations`
  reliably pushes every issue over the inline cap. This turns a 141-changelog audit from
  impractical into a few minutes.
- **`getJiraIssue` takes one key only.** Comma-separated keys fail; there is no bulk
  changelog endpoint. Batch ~20 calls per message instead.
- **`fields: ["key"]`** returns a compact envelope — use it for any list-of-keys query.
- **JQL `CHANGED ... BY <accountId> DURING`** answers criteria 1, 2, 6 and the first-pass
  split exactly for ~20 calls. Only criterion 3 needs changelogs.

## Self-checks — all must pass before publishing

`selfcheck.py` runs these; it exits non-zero on any failure, so never publish without it.

portal items = scope total · portal defects = KPI · portal High = KPI = list length ·
ageing bands = defect total per portal · feature items = scope total · CR items = scope
total and status mix sums per CR · cycle bands = closed total · raised/closed series sum to
totals and cumulative ends match · fix-table row and total arithmetic (`raw − Σexcl =
verified`, `rework + first = fixes`) · dev ageing bands = totals and grand total ·
criterion-3 changelog coverage = N/N · every SVG `<text>` anchor inside its viewBox.

Plus rendered-HTML cross-checks: the fix total, raw total, security block, as-of label and
audit coverage all appear in the output, and no superseded wording survives.

Plus: any rule the data breaks raised as a question (new status, new portal, count
mismatch, ageing beyond the top band).
