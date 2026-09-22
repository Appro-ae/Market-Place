---
name: hailey-ba-us-brd
description: >-
  Hailey BA skill — Set 1 (US/BRD). Produce Reem Bank (RF project) user
  stories and BRDs the way Hailey (Huyen, Appro PO) works: mimic the
  cancellation-house template, composite screenshots over the real portal,
  update decisions directly into the relevant AC, never overwrite her
  manual edits, mark post-review changes in purple, and answer bank
  stakeholder feedback with classified, precedent-backed positions. Use
  whenever drafting, updating or reviewing an RF user story, BRD,
  acceptance criteria, screen set, Jira description, or a response to
  bank-side requirements for the Reem Bank Super Portal / customer
  journey.
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
   comply with an instruction that the source contradicts. The same rule
   applies in reverse to stakeholder feedback that contradicts her
   approved decisions — flag it to her with the source before anything
   changes (see "Bank stakeholder feedback").
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
4. **Visual-first — a screenshot next to everything described.** Whenever
   an area is described, put its screen beside the words: the Impact
   Analysis is a three-column **Area | Impact | Screen** table with a
   reference crop + small caption per row (crop the real capture of that
   module — Role Management, queue menu, email-template list, Report
   Enquiry, Strategies/Versions menu; render a small portal-styled
   diagram only where no screen exists, e.g. a status-transition pill or
   a services map). Same rule in the US. Words alone are "hard to
   imagine" — never ship a wall of text.
5. **Ask open questions in chat, not in the ticket.** Number them, give a
   recommended default for each so she can answer "all defaults fine" or
   by number. Fold her answers into the spec the same day. The US carries
   no Open Questions section and no "PO decisions" meta-section —
   decisions are written directly into the AC they govern.
6. **Post-review changes go purple.** Once she has personally reviewed a
   version, every later change to the ticket is highlighted in purple
   (`#6554C0`) with an italic intro note — "Updated DD/MM — changes since
   the last review are highlighted in purple." — and the dev lead is
   tagged in a comment summarising the deltas, calling out anything that
   touches their subtask. A screen referenced in text but not yet
   attached is labelled honestly ("in the latest screens zip").
7. **Stakeholder feedback never rewrites the baseline by itself.**
   Bank-management feedback is acknowledged, classified and answered —
   but the PO decides what enters the BRD/US/ticket. Hold all document
   edits until she directs which items land.

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

## Jira description updates (ADF mechanics)

- Markdown cannot express colour, and a full-description rewrite destroys
  inline media — so a post-review update is built as a **complete ADF
  document** pushed with `contentFormat: "adf"`.
- **Fetch the live description first** and carry over, verbatim and in
  her exact positions: every media node (`type: "file"`, its `id`,
  `collection: ""`, `width`/`height` — the ids are extractable from the
  blob URLs in a markdown fetch) and every text edit she made.
- **ADF mark rule:** `code` combines only with `link`. A `code` +
  `textColor` combination makes Jira reject the ENTIRE edit with a bare
  `INVALID_INPUT` — purple filenames drop the code mark and keep the
  colour. Before pushing, census the mark combinations and media nodes
  in the payload; after pushing, verify sentinels (key phrases, media
  count) in the response.
- Comments that tag people use an ADF `mention` node with the person's
  real `accountId` (look it up — never guess), e.g. the dev-lead delta
  summary of rule 6. Jira comments carry no attribution footers.
- The Atlassian connector cannot upload attachments — attachments are
  always a Hailey drag-drop; deliver the files named exactly as the
  ticket references them.

## Bank stakeholder feedback (management asks)

How to answer a consolidated-requirements email from the bank side (the
Head-of-Retail pattern: a numbered table + "confirm each item, no CRs
after sign-off"):

- **Answer in THEIR format.** Mirror their numbering, their table layout
  (even their border/zebra styling) and their classification vocabulary.
  If they ask for Covered / Existing / Configuration / Development /
  Dependency, respond in exactly those terms — adding **"Decision
  required — <owner>"** where a call is needed.
- **Classification-first mindset.** Every item maps to: Covered (cite
  WHERE in the baseline), Development (to be detailed in the revised
  BRD), Configuration, Dependency (name the ticket or stream), or a
  Decision with a named owning authority. State limitations,
  assumptions and exclusions transparently — that classification is
  also the shield against "everything reasonably required is in scope,
  no future CRs" framings: tie scope-completeness to the transparent
  item-by-item exercise, never give a blanket commitment.
- **Defend approved design with precedent, don't concede unilaterally.**
  When feedback contradicts an approved decision (e.g. the revert
  timeout mirrors the approved RF-2365 cancellation timeout), cite the
  precedent, present 2–3 options, and route the call to its owning
  authority (Credit/Risk) — and flag the conflict to Hailey with the
  source reference (golden rules 1 and 7).
- **Commit to a dated deliverable** (item-by-item response matrix +
  revised BRD) — leave the date as a bracketed placeholder for Hailey
  to confirm, and never invent commitments she hasn't made.
- **Email craft:** match her voice ("Dear <name>," … "Thanks and Best
  regards, Hailey"); suggest Reply-All so the bank CC list keeps
  visibility; when the mail connector is read-only, deliver the draft
  as a paste-ready HTML file (tables survive the Outlook paste).

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
  the repo US so GitHub renders them. When she asks for specific screens
  to attach, re-send them as individually named PNGs, and embed each one
  inline right next to the AC that references it.
- The flow diagram is draw.io style (green START, white circles/
  diamonds, amber system-action node) and mirrors the reference ticket's
  diagram layout.

## Before finalising

- **Cross-impact scan:** JQL the RF board for open/in-flight tickets
  touching the same surfaces (queue, reject, DBR, dedupe, email, audit,
  permission, enquiry). Put the ticket-mapped list in the US
  (Dependencies section); fold only generic, unticketed clauses into the
  BRD impact table.
- After her personal review: every further change lands purple in the
  ticket, with the dev-lead tag comment (golden rule 6).
- Deliverables checklist: BRD .docx + .pdf (dated cover) · US markdown
  in repo (images inline) + Jira description in sync · screens zip ·
  everything committed and pushed · files sent to Hailey in chat.
