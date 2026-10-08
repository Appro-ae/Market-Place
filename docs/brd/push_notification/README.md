# BRD — Push Notification (Reem Bank)

## V1.4 — current (08 October 2026), baseline for MVP 1.1 development

`BRD_Push_Notification_V1.4.docx` / `.pdf` (protected). Baseline version for MVP 1.1
development — Business approval to proceed received (Head of Retail, 08/10). No content
change from V1.3: cover and version-history row only. Build: `python3 build/v14_baseline.py`
— chains on the V1.3 docx.

## V1.3 (07 October 2026), built on the PO's master

`BRD_Push_Notification_V1.3.docx` / `.pdf` (protected). Master: the PO's own edited V1.2
(`po_review/BRD_Push_Notification_V1.2_PO_edit.docx`) — her edits kept in full: resuming-screen
column in 3.1, P05/P08 removed, scope rewrite (Auto/Mortgage future), every "TBC by Avanza"
deleted (integration items tracked with RB IT / Avanza outside the BRD), section-1 note removed.
Added on top (build/v13_po_master.py): Arabic content as new 3.2 (approved loopmail 07/10,
Head of Retail "ok"), P09/P10/P11 wording per the approval, item-16 terminal-status clarification
re-applied on her wording, "selects or rejects the offer", two dangling fragments completed,
eleven→nine, cover/history V1.3. build/v13_apply_event_content.py was the pre-master draft of
the same change and is superseded.

## V1.3 — superseded pre-master draft (07 October 2026)

`BRD_Push_Notification_V1.3.docx` / `.pdf` (protected) carry the Business-approved event content of
07/10 (loopmail "Push Notifications - Event Content", approved by the Head of Retail): English AND
Arabic title/body for nine notifications, a "Resuming screen" per notification, P09/P10/P11 wording
per the approval. P05 and P08 are not part of the approved content and are removed from the MVP
scope (noted in 2.3, deliverable post-MVP by the dedicated team). New section 3.2 Arabic content
(RTL); subsections renumbered 3.3–3.7.

Build: `python3 build/v13_apply_event_content.py [--proof DIR]` — chains on the V1.2 docx.

## V1.2 — current (06 October 2026)

`BRD_Push_Notification_V1.2.docx` (editable) and `BRD_Push_Notification_V1.2.pdf` (protected
circulation copy) incorporate the Reem Bank business review of 29/09 (Head of Retail items 1–15,
PM comments on the PDF) under the PO's decisions of 05/10, plus middleware specification v0.2
(05/10) and the 05/10 alignment call (P03/P09 action type NONE; stan 6–12 chars; mobile
9715XXXXXXXX; language "EN"/"AR"; error-code list).

Build: `python3 build/v12_update_business_review.py [--proof DIR]` — starts from the repo
V1.1 docx, FIRST aligns it to the PO's final PDF (she removed the "Opens at" column and the
"Priority" note in her own last edit; her final also lost the 1.1 version-history row, restored
here and disclosed), then applies the review. New: 3.4 destinations, 3.5 scenarios, 3.6 stop
rules, 3.7 sending time, 4.5 error codes, 4.6 open items, BR5, section 8 acceptance criteria,
section 9 future enhancements. Figures 1 and 2 re-rendered with the 5-min × 3-attempt baseline.

## FINAL: `BRD_Push_Notification_V1.1_FINAL.pdf` — the PO's circulated version (28/09, 10 pages)

Saved byte-for-byte as the PO sent it (macOS Save as PDF, unprotected). Differences from the
V1.1 build below: the combined table has no "Opens at (deep-link screen)" column, the
"Priority: P0 highest." note is removed, and the version history keeps only the 1.0 row
(cover says V1.1). TOC page numbers match the footers.

## V1.1 build · 28 September 2026 — the PO's Word file is the master

`BRD_Push_Notification_V1.1.docx` (editable) and `.pdf` (circulation copy) are built from the PO's
own edited file, `po_review/BRD_Push_Notification_V1.1_PO_edit.docx`, by
`build/v11_apply_po_review.py` — surgical edits only, never a regeneration over her work
(her cuts, red TBC wording, cover and sensitivity labels are all kept). Her review comments:

1. **3.1 and 3.2 in one table** — 7 columns on one landscape page with its own full-width
   footer; widths balanced by a line-wrap simulation, every `%%PLACEHOLDER%%` kept whole.
2. **No push on the audit trail — tracked in the backend** — section 7 and the Audit Trail
   composite removed; wording updated in section 1, 4.4, 5, both flows and the impact table.
3. **Sample request exactly as the middleware** — request and response verbatim from spec v0.1.

Consistency: cover and version history V1.1; sections renumbered (8→6, 9→7), Figure 3→2; TOC
rebuilt with measured page numbers; dangling references fixed (the removed Source templates
column, section 10, section 6). Rebuild: `python3 build/v11_apply_po_review.py
po_review/BRD_Push_Notification_V1.1_PO_edit.docx [--proof DIR]`.

For the next revision, edit the V1.1 Word file (or her newer copy) — not `build_brd.js`,
which is the V1.0 history below.

## V1.0 · 28 September 2026 — generated

Client-facing BRD for Reem Bank, built from the RF-3306 user story
(`docs/us/RF-3306_US_Push_Notification.md`) and Avanza's *Reem Payments API — Push
Notifications Specification v0.1*. Structure from the BRD skill (overview and key covered
areas, detailed requirements, appendices); look from the house template (*Application
Cancellation in Super Portal V1.0*). No Jira references inside the document.

| Path | What it is |
|---|---|
| `BRD_Push_Notification_V1.0.docx` | **Editable deliverable** (Word) |
| `BRD_Push_Notification_V1.0.pdf` | Circulation copy — text outlined, copy / edit / extract denied, print allowed |
| `build/build_brd.js` | **Source of truth** (docx-js). Edit here, never the Word file |
| `build/build.py` | Two-pass build and checks (below) |
| `build/render.js` | Renders every figure into `assets/`; fails if a font or image did not load |
| `build/fig*.html`, `ia_*.html`, `cover_hero.html` | Figure sources (draw.io house style, `diagram.css`) |
| `assets/` | Rendered figures, house logos, and two real UAT captures: `base_audit_trail.png`, `ia_comm.png` |

## Figures

1. `Flow_Push_Notification_End_to_End.png` — trigger → build → send → deliver → tap → journey resumes
2. `Previews_Push_Notifications.png` — all eleven notifications as the customer sees them (illustrative)
3. `Flow_Push_Response_and_Retry.png` — success rule, retry every X minutes up to N, Failed after the last attempt
4. `Timeline_P02_Offer_Expiry_Reminder.png` — P02 on days 1–15, P03 at day 30, stop conditions
5. `SC1_Audit_Trail_Push_Notification_Step.png` — composite over the real Audit Trail capture: header
   row kept, two Push Notification rows drawn from measured values (Plus Jakarta Sans 25.5 px / 500,
   `#202121`, zebra `#F5FDFF` / `#FFFFFF`, 42.5 px line pitch); the only `#FF5500` box in the BRD

## Where the BRD goes beyond the US text (align the US with the PO's answers)

- Audit Step Details carries `error.message` with `error.code` when a push is not sent (the US
  response table already says `error.message` is recorded).
- The Audit Trail screen has no attempt column, so the attempt is shown inside Step Details.

## Rebuild

```
node build/render.js                  # only when a figure changes
python3 build/build.py --proof DIR    # docx -> PDF -> TOC pages -> docx -> PDF -> checks -> protected PDF
```

`build.py` fails if the TOC moves between passes, if any page is blank, or if the circulation PDF
still has a text layer, embedded fonts or copy permission. The TOC is static text with page numbers
measured on the LibreOffice PDF: after editing the Word file by hand, re-check them.
