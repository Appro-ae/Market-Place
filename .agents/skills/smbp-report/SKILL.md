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

`audit.py` then `analyse.py`. A **verified fix** requires all six:

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

## Phase 3 — Render

`render.py` writes both dashboards into `reports/<YYYY-MM-DD>/`, plus `agg.json` for
tomorrow's comparison. Dashboard 1 opens with a **Movement since <date>** card diffing
the previous run: KPI deltas, portal deltas, and item-level status moves split
forward/backward. A backward move is the signal a percentage hides — surface it.

Then run all 12 self-checks (below), and screenshot each dashboard in headless Chromium
to confirm no SVG value label clips.

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

portal items = scope total · portal defects = KPI · portal High = KPI = list length ·
ageing bands = defect total · owner load = High total · feature items = scope total ·
CR bars = scope total · cycle bands = closed total · fix shares ≈ 100% ·
fix rows = audited total · dev ageing bands = totals · audit coverage = N/N.

Plus: every SVG value label inside its viewBox, and any rule the data breaks raised as a
question (new status, new portal, count mismatch, ageing beyond the top band).
