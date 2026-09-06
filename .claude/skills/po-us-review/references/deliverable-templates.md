# Deliverable templates

All text in the PO's voice: direct, no hedging, one idea per sentence, ticket keys as
evidence. Keep numbering stable across rounds (R1 stays R1 in round 3).

## 1. First-round feedback note (markdown, pasteable)

```
@BA Name  Feedbacks

1. <Finding title>. <What is wrong>. <Why it matters: which requirement fails / what the user experiences>. <What to update: AC + concrete rule>. Ref: <ticket keys read>.
2. …

| Ref | Requirement | Description | Mapping with <KEY> | Coverage | Gap & Feedback to BA | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | <input requirement, short> | <one sentence of the expectation> | <AC refs that implement it> | Covered / Partially covered / Not covered | <gap + fix> | P1 |

<one-line asks outside the table, e.g. notification audit>

cc: @CPO Name — you can give further feedback if any
```

Order the numbered findings by severity: undefined mechanism, missing data element,
visibility regression, migration, contradictions, broken references, edge cases, hygiene.

## 2. Re-review comment (Jira, coloured table)

Produced by `scripts/build_review_comment_adf.py`. Spec shape (see
`assets/comment_spec_example.json`):

```
mention  → the BA (accountId + "@Name")
title    → "Re-review per checklist — after your <date> update" / "Review Round N — verification of the vN update"
intro    → what was verified, how many items closed, the verdict ("Not Ready for Dev yet — close the yellow/red items first")
columns  → Ref | Requirement (or Issue) | What the story says today | Review Status | Remaining Gap & Feedback (or Required Fix) | Priority
rows     → one per R-item or P-item; status cell text drives the colour
sections → "Other points to close in the same pass:" numbered list
closing  → "→ Fix <P1s> first, then we move this to Ready for Dev."
cc       → the CPO
```

Status text → colour: Done → green; Done — fix required, Done (flagged), Partially → yellow;
Not Done, Not covered → red.

## 3. Change note (C-list) — when the design direction changes

HTML file. Table: Ref | Change | What vN says today | Status (Rework / Not Done / Open) |
Required in vN+1 | Baseline (ticket keys) | Prio. Followed by one paragraph describing how the
end-to-end flow reads after the changes, and a closing banner "Close C1–Cn, then Ready for
Dev. cc @CPO".

## 4. Proposal of edits (E-list) — before touching the description

In chat when the user asks for it, otherwise HTML. Legend line first:

```
**Bold** = text inserted or changed (purple in Jira). ~~Strike~~ = removed. Everything not listed stays as is.

**E1. <Section>**
<sentence with **inserted text** and ~~removed text~~>

**E2. …**

Untouched: <sections>. <Which earlier C-items still apply.>
<One line per decision assumed.> Reply "approved" or name the E/D items to change.
```

Keep each E-item to the exact words that will land in Jira; the user approves wording, not
intent. Drop anything the user asked to keep out (precedent names, external tickets) before
sending.

## 5. Decision list (D-list)

Table: # | Decision | Options (a) (b) | Recommendation with the one-sentence reason. Only
decisions the user has not already made. Put the recommended option first.

## 6. Handover comment to the BA (after the description is updated)

```
@BA Name  Description updated on <date> — PO changes are in purple, removed text is struck through (kept visible for your review).

What changed and why:
1. <E1 in one line>
2. …

What stays with you:
- Accept the changes and remove the struck-through text.
- <mockup / message registry / estimate items with no precedent>

cc: @CPO Name
```

## 7. HTML deliverable skeleton (Appro house style)

- Classification strip top and bottom ("Appro – Internal & Approved Domains | Controlled
  Distribution" / "INTERNAL & WHITELISTED").
- Header card: pill tag (key · deliverable · audience), H1 with one accent phrase in blue,
  one-line verdict in blue, meta line (prepared for, date, against which version, evidence
  keys), four-dot motif.
- Optional correction banner when a prior statement is overturned (yellow).
- KPI tiles (3–4) only when the numbers change what the reader does.
- Sections A/B/C/D with navy header tables; status cells green/yellow/red; `ref` pills for
  ticket keys; chips for worked examples; a five-step flow strip for evaluation logic; a
  who-sees-what persona table for visibility stories.
- Closing navy banner with the next action and cc.
- Footer with the verification statement (which keys, which date, which market sources).

Palette `#1a214d` navy, `#3b7ef6` blue, `#fdba23` yellow, `#edf2ff` lavender, `#ffffff`;
green `#abf5d1`, red `#ffbdad`, purple `#6554c0` (only for "PO change" semantics). Lato via
Google Fonts with a sans-serif fallback. Max width 1180px, tables in `overflow-x:auto`.
Render-check with headless Chromium before sending:
`chromium --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1280,5200 --screenshot=out.png file:///…html`.

## 8. Gap workbook (xlsx)

`scripts/build_gap_xlsx.py spec.json`. Sheets: "Gap Analysis" (R-list with coverage RAG),
"Decision Matrix" (option comparison rows × criteria), "Precedent Reference" (ticket | what it
does | what to reuse). Latest re-review sheet goes first when the workbook is updated. No
formulas; compute counts in the spec.

## 9. Worked example (story-telling deliverable)

When the user wants to "visualise the story": a cast of 5–6 named personas (staff, manager,
non-restricted ops, exception holder, edge case), a day-by-day timeline, a who-sees-what
matrix, and a simulator toggle between "before" and "after" a lifecycle change. HTML only.
