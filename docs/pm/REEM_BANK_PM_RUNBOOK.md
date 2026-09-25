# Reem Bank (RF) — PM Runbook

Operating file for the PM role on the Reem Bank project. Encodes the four
command triggers, the verified Jira references behind each, and the checks that
must run before anything is written to Jira.

**Jira site:** `scvaladdin.atlassian.net` · **cloudId:** `c501c3c5-8601-4a1a-90fb-e833f87ed209`
**Project:** RF (REEM FINANCE), project id `10025` · **Board 41:** RF dashboard
**Access verified 23 Sep 2026:** `read:jira-work`, `write:jira-work`, Confluence read/write.
**Known constraint:** the Atlassian connector **cannot upload attachments** —
screens/evidence are always delivered as a zip for manual drag-drop.

---

## 1. Team directory (account IDs verified via Jira user lookup)

| Role | Name | Jira accountId | Email |
|---|---|---|---|
| PO (you) | Huyen | `63e3555cfb75f8568f63346f` | huyen@appro.ae |
| BA | **Thu — AMBIGUOUS, confirm before use** | see below | — |
| FE dev | Hoang | `712020:2da497d6-e411-47cd-805e-56e74836dc38` | buihuu.hoang@appro.ae |
| BE dev | Duc Le | `712020:4f5fcbf8-1b3a-41b1-907e-b38aaad74b83` | duc.le@appro.ae |
| CR / deployment | Umair Asif | `712020:b416ccde-bf2b-4c12-9d77-3032a3211a65` | umair.asif@appro.ae |
| Tester | Hien Nguyen | `712020:4e0784ee-42bb-497a-b8ae-30dc424aed95` | nguyen.thih@appro.ae |
| QA (board) | Khaled Mohammed Qahtan | — | owns the SIT bug queue |

**"Thu" matched 3 accounts** — NguyenMinh Thu (nguyenminh.thu@appro.ae),
Kha Pham Thuc (kha@appro.ae), Nguyen Thi Thuy Phuong (phuongntt@appro.ae).
Per the UAT skill rule *"never guess an assignee"*, confirm which before any
assignment. "Hoang" also matched 3, but displayName `Hoang` is confirmed by
board evidence — they own every `[FE]`/`[Mobile]` subtask.

## 2. Issue types in RF

| Type | id | Use |
|---|---|---|
| Story | `10053` | User stories (US) |
| Subtask | `10055` | `[FE]` / `[BE]` / `[Mobile]` dev tasks under a Story |
| Bug | `10052` | UAT/SIT defects |
| CR | `10777` | Deployment approval packages |
| Task | `10051` | Ops / deployment / upgrade work |
| Epic | `10054` | Container |

---

## 3. Command: "Thu please Write US"

Write a new requirement, with Thu (BA), in three steps.

1. **Create the ticket on the RF board** — issue type `Story`, so it lands on
   board 41. Summary follows the house prefix convention seen on the board:
   `[Enhancement]`, `[Quick Win]`, `[Integration]`, `[UX/UI Review]`, `[PROD]`,
   `[FOC Enhancement]`.
2. **Write the US** using the `hailey-ba-us-brd` skill + `rb-knowledge-base`.
   Before drafting: read the relevant existing RF user stories for context and
   ask open questions **in chat, numbered, each with a recommended default**.
   If a reference US is given, mirror its structure exactly.
   Default structure (mirrors RF-2365):
   Context of Business → User Story Details (scope + enumerated scenarios +
   screen inventory + flow) → AC1 screen component table → AC1.1 reason-as-comment
   → AC2.x behaviour (flag / audit 8-field block / checker queue / timeout)
   → AC3 emails (label **Email (Bank)** / **Email (Client)**) → AC4 customer
   journey → AC5 derivation table → Impact Analysis (Area | Impact | Screen)
   → Dependencies → Out of scope.
   No Open Questions section and no "PO decisions" section in the ticket —
   decisions are written directly into the AC they govern.
3. **Assign to developers** — create `[FE]` subtask → Hoang, `[BE]` subtask →
   Duc Le, under the parent Story.

**Guardrails.** Flag any conflict with the source (reference ticket, knowledge
pack, live portal) *before* applying an instruction. Never overwrite manual
edits — fetch the live description first and apply a surgical delta. Post-review
changes go purple (`#6554C0`) with an italic "Updated DD/MM" note and a dev-lead
tag comment.

## 4. Command: "PM starts tracking"

For each in-flight ticket, report: logged work, original estimate, remaining,
end date, and whether the developer has actually logged anything.

**Blocking data gap (verified 23 Sep 2026):** `duedate` is **empty on every
ticket checked** across the RF-3305 tree. "Check end date" has no source field
today. Either the team starts populating Due Date, or the report tracks sprint
end / a date held outside Jira. Needs your call.

JQL for the tracking sweep:
```
project = RF AND status IN ("DEV IN PROGRESS","READY TO DEVELOP","DEV COMPLETED")
ORDER BY updated DESC
```
Pull fields: `status, assignee, duedate, timespent, timeoriginalestimate,
timeestimate, updated`. Jira returns time in **seconds** (28800 = 8h).
Flag: unassigned tickets in progress · time logged with no estimate ·
remaining = 0 while still in progress · no update in > 3 days.

## 5. Command: "Umair Prepare CR"

Prepare the next deployment CR package and write the Business Impact.

**Verified template** (from RF-3249 Part 7 and RF-3143 Part 5):
- Issue type `CR`, priority `Low`, no labels. Reporter Huyen; assignee Umair Asif.
- Summary: `[CR][PROD] Request Approval Package (Part N)` — **next is Part 8**.
- Description:
  ```
  We would like to send you the CR package that will be deployed to PROD

  * Release tag: rf-prod-0.0.N
  * Release Notes:
      * Deploy on Appro side: rb-production-release-note-internal-service-DD-MM-YYYY.docx
      * Deploy on RB side: rf-production-release-note-external-service-DD-MM-YYYY.docx
  * Camuda file: rf-production-RF-<this ticket key>.bpmn
  * Package includes:

  | No | Ticket | API & Variables & SQL | Remark |
  ```
  The `API & Variables & SQL` column carries `No`, `API`, `Variables: <name>`,
  `Data: <change>`, or an SDK version. Part 5 also carried a count line above
  the table: *"Jira list — 67 items, UAT sign-off complete:"*.

**Ticket references must be Jira smart links, not plain URLs.** The house CRs
use ADF `inlineCard` nodes, which render as live cards showing each ticket's
current status. A plain URL written through `contentFormat: "markdown"` stays
dead text. To get them: build the whole description as an ADF document and push
with `contentFormat: "adf"`, using
`{"type":"inlineCard","attrs":{"url":"https://scvaladdin.atlassian.net/browse/RF-xxxx"}}`
inside each table cell's paragraph. A read-back in markdown confirms success
when each cell shows `<custom data-type="smartlink" data-id="id-N">`.
Keep `code` marks out of the payload — `code` + `textColor` makes Jira reject
the entire edit with a bare `INVALID_INPUT`.

**Do not try to write smart links through markdown.** A read of an existing
smart link serialises as `<custom data-type="smartlink" data-id="id-N">URL</custom>`,
but that syntax is *not* accepted on the way back in: pushed through
`contentFormat: "markdown"` it is stored as literal text and renders as escaped
`&lt;custom …&gt;` tags around the link. Verified on RF-3329, 25 Sep 2026, via
`expand: "renderedFields"` — which is the only reliable way to tell, since both
a real smart link and literal text read back identically in markdown. Either
push ADF with `inlineCard`, or use ordinary markdown links `[RF-1234](url)`,
which render cleanly but are not live cards.

**Sprint and assignee** are ordinary field writes on the same call:
`{"customfield_10020": <sprintId>, "assignee": {"accountId": "<id>"}}`.

Link type is `Relates` (id `10003`). Sprint field is `customfield_10020`;
RF Sprint 17 = id `3374`, RF Sprint 18 = id `3416`.

**Two flags, both settled for Part 8 (RF-3327) on 23 Sep:**

1. **Business Impact is a NET-NEW section.** Neither RF-3249 nor RF-3143
   contains one. On RF-3327 it sits after the logistics block (release tag,
   notes, Camunda file) and before the package table, as a
   No | Ticket | Business Impact | Deployment Risk table. Confirm whether it
   becomes standard for Part 9 onward.
2. **The CR linkage chain was broken at Parts 6 and 7** (both had zero links).
   Repaired 23 Sep alongside Part 8: Parts 6, 7 and 8 now interlink and all
   three reach Part 5, which carries the chain back to Part 1. Keep new CRs
   linked back three hops, matching house precedent.

**Release tag and release-note dates are never derivable from Jira** — they are
build/deployment facts. Leave them marked for confirmation and hand to Umair.

| CR | Key | Created | Status | Links |
|---|---|---|---|---|
| **Part 8** | **RF-3327** | **2026-09-23** | **Open** | **3 — created 23 Sep** |
| Part 7 | RF-3249 | 2026-09-04 | Open | 3 — *repaired 23 Sep* |
| Part 6 | RF-3226 | 2026-08-30 | Open | 3 — *repaired 23 Sep* |
| Part 5 | RF-3143 | 2026-08-18 | Open | 6 |
| Part 4 | RF-3028 | 2026-07-09 | READY IN UAT | 2 |
| 22 May | RF-2715 | 2026-05-22 | Open | 2 |
| Part 3 | RF-2671 | 2026-05-08 | Done | 5 |
| Part 2 | RF-2250 | 2025-12-24 | Open | 2 |
| Part 1 | RF-2065 | 2025-11-03 | Done | 2 |

## 6. Command: "Hien Test feature"

Log defects from portal screen captures using the `hailey-uat-defect-logging`
skill.

Non-negotiables from the skill: **the pixels are the evidence, not the prose** —
measure anything ambiguous (sample the pixel colour, read the DOM disabled
state) rather than eyeballing it. Never log a finding the screenshots do not
prove. Separate *build wrong* (log it) from *story wrong* (propose a story
change, no bug). Group findings by dev fix area, not per symptom. State plainly
what was **not** tested. Priority is the PO's call; assignee is confirmed, never
guessed. Every defect links to its story.

House format: `Description → Steps to Reproduce → Expected Result → Actual
Result (+ Impact) → Reference`.

Captures go in one zip for drag-drop, with a `📎 see attached: <filename>`
marker where each image belongs.

## 7. Standing rules on RF user stories (PO instructions)

### 7.1 No Dependencies section — permanent

**Instruction from the PO, 25 Sep 2026: "remove dependencies forever".**
RF user stories do **not** carry a *Dependencies* table. Related tickets belong
in Jira's own issue links, not in the description body. Where a related ticket
genuinely changes how an AC is built, name it inline in the sentence it affects
(e.g. the RF-3061 naming note in RF-3329) — never as a standing table.

### 7.2 No cross-project attribution in RF stories

Harvesting another project's ticket is fine — the substance can be adopted.
The **wording** does not travel: no "precedent", no "same change on X", no
guard rows citing another project's defects. The RF story reads as RF's own
requirement. (PO instruction, 25 Sep 2026, on RF-3329.)

### 7.3 A description write REPLACES the whole field

`editJiraIssue` on `description` overwrites everything, including inline media
nodes. Before every write:

1. **Fetch the current description.** Never assert "not modified since our last
   write" from a field list that did not include `description`. This exact
   mistake destroyed the PO's own 07:42 and 07:55 edits on RF-3329 on
   25 Sep 2026 — three inline images and her wording — because the pre-write
   check fetched only `key, summary, updated, assignee, priority, status,
   labels`.
2. **Diff it against what we last pushed.** Any delta is the PO's hand. Merge
   it; never discard it.

**Recovery, if it happens anyway:** the previous body is in the changelog —
`histories[].items[]` where `field="description"`, in `fromString`. Attachment
IDs are in the same changelog where `field="Attachment"`: `to` = attachment ID,
`toString` = filename. Jira does **not** delete attachments on a description
edit, so only the inline references are lost, never the files.

### 7.4 Inline images through the connector

The connector cannot upload attachments, but it *can* re-reference files already
on the ticket. Markdown image syntax against the attachment content URL works
and renders as a real `<img>`:

```
![<filename>](https://scvaladdin.atlassian.net/rest/api/3/attachment/content/<attachmentId>)
```

Verified on RF-3329, 25 Sep 2026 via `expand: "renderedFields"`, which rendered
`<span class="image-wrap"><img src=".../attachment/content/135598" alt="..."/></span>`.
The read-back in `fields.description` shows a `blob:https://media.staging.atl-paas.net/…`
wrapper — that is the converter's serialisation, not a broken link. **Always
confirm with `renderedFields`, never from the markdown read-back.**

PDFs and other non-images take the same URL as a plain link:
`[📎 <filename>](https://scvaladdin.atlassian.net/rest/api/3/attachment/content/<id>)`.

### 7.5 Do not try to write smart links through markdown

A read of an existing smart link serialises as
`<custom data-type="smartlink" data-id="id-N">URL</custom>`, but that syntax is
*not* accepted on the way back in: pushed through `contentFormat: "markdown"` it
is stored as literal text and renders as escaped `&lt;custom …&gt;` tags around
the link. Use ADF `inlineCard` nodes, or plain `[KEY](url)` markdown links.
Verified on RF-3329, 25 Sep 2026.
