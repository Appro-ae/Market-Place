---
name: hailey-ba-us-brd
description: >-
  Hailey BA skill — Set 1 (US/BRD). Produce Reem Bank (RF project) user
  stories and BRDs the way Hailey (Huyen, Appro PO) works: mimic the
  cancellation-house template, composite screenshots over the real portal,
  update decisions directly into the relevant AC, and never overwrite her
  manual edits. Use whenever drafting, updating or reviewing an RF user
  story, BRD, acceptance criteria, screen set or Jira description for the
  Reem Bank Super Portal / customer journey.
---

# Hailey BA skill — Set 1 (US/BRD)

Working agreements distilled from the Application Revert engagement
(RF-3305, Sep 2026). Follow all of them; each one exists because it was
requested or corrected explicitly.

## Golden rules (learned the hard way)

1. **Flag conflicts with the source before applying an instruction.** If
   Hailey asks for something that contradicts the actual reference (a
   ticket like RF-2365, a knowledge-pack rule, live portal behaviour),
   say so with the evidence FIRST, then act on her call. Never silently
   comply with an instruction that the source contradicts.
2. **Never overwrite her manual edits.** A Jira description update
   replaces the whole description — it wipes screenshots she placed
   inline and any text she edited. Once she has touched a ticket: fetch
   the live description first, apply only the surgical delta around her
   content, or don't touch it at all. Same for documents: if she edited
   a downloaded copy, merge changes into HER file, don't regenerate over it.
3. **One document lineage, dated.** Every BRD copy carries the version
   AND the date on the cover (e.g. "V1.0 / 19 September 2026") so copies
   are distinguishable. Word (.docx) is the editable deliverable, PDF the
   circulation copy; regenerate both together from the generator script.
4. **Ask open questions in chat, not in the ticket.** Number them, give a
   recommended default for each so she can answer "all defaults fine" or
   by number. Fold her answers into the spec the same day. The US carries
   no Open Questions section and no "PO decisions" meta-section —
   decisions are written directly into the AC they govern.

## BRD recipe

- **Template:** mimic *Application Cancellation in Super Portal V1.0*
  one-for-one — cover (appro logo block, blue title, V + date, navy
  wordmark, confidentiality lines, contact strip), FEATURE OVERVIEW with
  key-step bullets + draw.io-style flow, numbered END-TO-END sections,
  Impact Analysis, Open Questions, THANK YOU page. House style: Arial,
  black CAPS H1s, `#156082` table headers with white bold text, thin
  `#A6A6A6` borders, `#FF5500` annotation box on the key screen only.
- **No Jira ticket references anywhere in the BRD** (client-facing). The
  US may cite RF tickets.
- **Generator is source of truth:** edit `docs/brd/build_brd.js`, never
  the Word file, then `node build_brd.js` → `soffice --headless
  --convert-to pdf`. Proof every page via `pdftoppm` renders; hunt for
  blank pages (a forced page break after a page-filling table creates
  one), mid-word header wraps (widen the column), and orphan rows.
- **Scope stated twice:** the product scope (CC/PL; CASA has no credit
  decisioning; ML/AL not yet on the platform) AND an explicit enumerated
  list of in-scope scenarios (R1, R2, …) with the not-in-scope list right
  beside it. Tables alone are not enough — Hailey wants the plain list.
- **Concrete over generic:** once scope collapses the outcome to one
  value, write it out ("status changes from 'Rejected' to 'Awaiting
  Credit Approval' and re-enters Credit Queue at Level 1"), never leave
  `<TARGET_STATUS>` placeholders in client-facing text.
- **Impact Analysis is an Area | Impact table** (Role Management /
  Permission Matrix, Queue model / drop points, Status model / mobile,
  Audit trail, Communication Setup, Reporting / MIS, Services, Credit
  policy) — not bullets.

## US recipe (mirrors RF-2365 structure)

Context of Business → User Story Details (scope + scenario list + screen
inventory + flow) → AC1 screen description (component table: Name /
Component Type / Mandatory / Editable / Description) → AC1.1 reason-as-
comment (title/body/footer format, CR 003 audit) → AC2.x behaviour
(flag, audit 8-field block, checker queue, timeout mirroring the
cancellation AC2.3 auto-action) → AC3 emails → AC4 customer journey →
AC5 derivation/trigger table → Impact Analysis table → Dependencies →
Out of scope. Maker–checker mirrors the cancellation trilogy
(RF-2365/2366/2367): per-product permissions, distinct rights never
bundled (RF-2781/2785 precedent), checker view read-only except the
decision, Comments tab default so the reason is seen first.

## Emails / Communication Setup

- Label the audience in every template table: **Email (Bank)** or
  **Email (Client)** — matching the portal's Email Type (Client/Bank)
  column (RF-2797). Never plain "Email".
- New templates are called out as **"newly added in Communication
  Setup"** in the impact analysis.
- Client communication on reopened/re-assessed cases: **final
  confirmation only, exactly ONE client email per decision** (approve or
  reject), duplicates suppressed on re-runs. Banking language, English,
  sign-off "Reem Bank" (never Reem Finance), merge fields must resolve.

## Screens

- **Never lookalike mockups.** Composite over REAL portal captures
  (UAT), so typography (Plus Jakarta Sans), colours and layout are the
  actual Reem Bank design; draw only the new elements. Sample exact
  colours from the base capture (`#008AAB` primary, `#D8092E` reject
  red, `#404345` text, `#73787B` grey, `#003764` sidebar/flyout,
  `#E5F2F6` accordion rows).
- **File names carry the mapping:** `SC1_Role_Permission_Application_
  Enquiry.png`, `SC2_..._Revert_Button.png`, …, `Flow_<Feature>.png` —
  the same names in the repo, the BRD, the ticket text and the zip.
- Deliver all screens as **one zip** for drag-drop onto the ticket (the
  Atlassian connector cannot upload attachments); embed them inline in
  the repo US so GitHub renders them.
- The flow diagram is draw.io style (green START, white circles/
  diamonds, amber system-action node) and mirrors the reference ticket's
  diagram layout.

## Before finalising

- **Cross-impact scan:** JQL the RF board for open/in-flight tickets
  touching the same surfaces (queue, reject, DBR, dedupe, email, audit,
  permission, enquiry). Put the ticket-mapped list in the US
  (Dependencies section); fold only generic, unticketed clauses into the
  BRD impact table.
- Deliverables checklist: BRD .docx + .pdf (dated cover) · US markdown
  in repo (images inline) + Jira description in sync · screens zip ·
  everything committed and pushed · files sent to Hailey in chat.
