---
name: hailey-agile-user-story
description: >
  Write Agile user stories in Hailey's (Huyen Pham) standard structure — Agile User Story
  Structure v1.1, generic and product-agnostic. Use whenever drafting, restructuring or
  reviewing a user story, acceptance criteria, or a Jira/backlog description for ANY product
  or company (fintech, banking, SaaS, CRM, audit, learning platforms…). Trigger on "write a
  user story", "US template", "restructure to my template", "acceptance criteria", "business
  rules", or any uploaded requirement to be turned into a story. This skill carries the
  structure and writing principles only — no project-, client- or ticket-specific content.
---

# Agile User Story — Hailey standard (generic)

Source of truth: **"Agile User Story Structure v1.1"** — prepared by Huyen Pham, June 2024.
This skill is deliberately generic: never hard-code a specific client, system, screen, ticket
number or platform behaviour into it. Project-specific knowledge lives in separate
project skills; this one is the portable writing standard.

## The seven sections — always in this order

Every user story carries these sections, numbered, in this order. Do not invent extra
top-level sections; fold content into the right one.

### 1. Title
A brief, descriptive name. Pattern: `[Type] <Module/Area> – <capability in one line>`
(Type = Enhancement / New Feature / Bug Fix / Change Request, per the team's convention).

### 2. Problem Background
Short context and history: why the problem exists, who it impacts, why it matters now.
Structure it by underlying driver — use only the drivers that actually apply:

- **Business demand** — who is asking and what business process / customer outcome improves.
- **Production bugs / production pattern** — the recurring incident or operational dead-end
  this fixes, stated concretely (what happens today, where it gets stuck).
- **Other factors** — regulatory, migration, dependency, cost approval / CR origin, etc.

Rules: 3–5 bullets maximum. Facts, not narrative. Name the requesting party by role, not by
person. If the story originates from a change request or costed scope item, say so here.

### 3. User Story Statement
The classic template, verbatim format:

> **As a** [role],
> **I want** [goal],
> **so that** [benefit].

- Role = who the user is (specific: role + permission/context, not "user").
- Goal = what they want to achieve (one capability, not a feature list).
- Benefit = the value — why it matters to the decision or process.

Follow the statement with: **Scope** (products / channels / entry point in one line) and any
**governing requirement** a senior stakeholder has set for the feature (quoted as a design
principle, e.g. "validation-first, exception-based; one controlled transaction"). A flow
diagram image sits at the end of this section when one exists.

### 4. Acceptance Criteria — framed as business rules
ACs are the checklist for developers AND testers. Frame every AC as a **business rule** and
label each AC heading with its rule type:

| Rule type | Covers |
| --- | --- |
| **Displaying rules** | What is shown, where, to whom; navigation path; field tables (Name / Component Type / Mandatory / Editable / Description); applicable statuses |
| **Validation rules** | Format, range, length, required fields, uniqueness, logical (end > start), dependency (if X then Y required), data type — with the exact error code/message per failure |
| **Saving rules** | What the system does on save/confirm, as an ordered numbered table of actions with a reference column (prior story / requirement ID per row) |
| **Approve/Reject rules** | Decision outcomes, routing, status transitions |
| Cancel / Applying (permission) rules | Use additional rule types where the behaviour needs them, same labelling pattern |

Conventions:
- Heading pattern: `AC<n> — <Rule type>: <subject>` (e.g. "AC2 — Validation and Saving
  rules: save updated information"). Sub-rules as AC2.1, AC2.2…
- Each AC states the **navigation path** before the behaviour.
- Screen references (SC1, SC2…) inline where the rule is defined; images embedded in the
  section they evidence.
- Validation rules always carry the concrete rule AND the system's reaction
  (error code / message / block), never "proper validation applies".
- Saving rules run as one ordered table: # / Action / Reference. State transactional
  behaviour explicitly (all-or-nothing vs partial) and what reloads/regenerates after.
- Downstream consumers of a changed value get their own AC: a table of
  Consumer / Behaviour after the change (including explicit "no impact" rows — a verified
  no-impact is a requirement, not an omission).

### 5. Impact Analysis
Purpose (per the template): identify dependencies, assess risk, estimate effort and
resources, maintain system integrity. Deliver it as two tables:

- **Impact table**: Area | Impact | Screen reference. Include rows only where there IS an
  impact; close with one row listing the areas verified as "No change".
- **Dependencies table**: Ticket/Story | Relevance — every prior story or component this
  change builds on or that builds on it.

### 6. Notes
Additional information that is real but not a rule: attached screen list, out-of-scope list
(explicit, itemised — out-of-scope is a decision, not a leftover), open confirmations with
their owner (e.g. "treatment X to be confirmed by Compliance"), companion documents
(BRD version, design file), UI-guideline references.

### 7. Priority
**High / Medium / Low** — bold, with a one-line business justification (what it unblocks or
what it costs to delay). Never a bare word.

## Writing principles (Hailey's style — apply everywhere)

1. **Lean.** Direct, confident, no filler. If a sentence doesn't change what a developer
   builds or a tester checks, delete it. Short bullets beat paragraphs.
2. **Verified, never invented.** Every behaviour written into an AC is grounded in the
   actual system (captures, prior stories, confirmed decisions). Unknowns go to Notes as
   open confirmations with an owner — never written as if decided.
3. **Rationale → base → hypothesis → evidence → conclusion.** Positions (scope calls,
   pushbacks, design choices) follow this chain; cite precedent (prior stories, market
   practice) as the business base.
4. **Reuse before invent.** New behaviour mounts on existing components, patterns and
   permissions wherever possible; the AC says "existing behaviour, unchanged (ref)" rather
   than re-specifying it.
5. **Separate display from trail.** Detail screens show current state; history/audit screens
   carry the old → new trail. Don't duplicate trail onto detail views.
6. **Non-functional stays non-functional.** Failure handling, performance, resilience are
   platform-wide (Day-1 architecture) concerns — reference the platform standard; don't
   re-specify them per feature unless the feature genuinely changes them.
7. **One save, one run.** When several sections are editable in one dialog, recalculation /
   re-processing triggers once after all values are stored — say so explicitly.
8. **Permissions are named and placed.** Every new capability states its permission, which
   role group holds it, and what FALSE hides.
9. **Version the story.** Keep a revision note when the structure or content materially
   changes after review (date, version, author, change description) — same discipline as the
   template's own Revision History.
10. **Stakeholder language.** Client-facing wording is business language: never "push back"
    — instead "this is governed by…", "recommended for a separate scope item", "already
    covered in section X". Classify every feedback item first (accept / already covered /
    new scope / defended position), then answer.

## Workflow when asked to write or restructure a US

1. Read the input requirement fully (email, spec, ticket, capture set).
2. Map every piece of content to one of the seven sections — nothing floats outside.
3. Label each AC with its rule type; split mixed ACs.
4. Ground every behavioural claim: existing pattern (cite it) or confirmed decision or
   open confirmation in Notes.
5. Output in one pass ("one shot") — complete structure, no placeholders except named
   open confirmations.
6. Never overwrite the author's manual edits in a ticket/doc: verify the target is untouched
   since your last write before replacing, and get an explicit go before syncing to
   Jira/Confluence.
