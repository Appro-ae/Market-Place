# Worked example — AMP-2548 "Reporting Manager Visibility & Case Assignment" (Aug–Sep 2026)

Six rounds between the CPO's input, the PO (Huyen) and the BA (Kha), with the tech lead
stepping in at the end. Read it to calibrate depth and tone; do not copy its findings into
other stories.

## Input requirements (CPO)

- R1 Enquiry: sale code / staff ID user sees only own applications.
- R2 Manager sees all applications tagged to users under them.
- R3 Decide the tagging basis — Staff ID or UTM (concept on board 734).
- R4 How does ADIB use sale/promo codes today; propose suggestions.
- Added by the PO: ops/admin visibility (R4'), unassigned and historical cases (R5), Report
  Enquiry scope (R6), notification CC (R7).

## Rounds

| Date | Round | What was found | Result |
| --- | --- | --- | --- |
| 31/08 | v1 (BA) | Reporting Manager field only; filter on an "Assigned To" that existed nowhere; no Staff ID on the user record; "direct reports" vs "full subtree" contradiction; ACP-228/229 references wrong; no view-all, no migration. | Feedback note + checklist table posted by the PO (R1–R6 + email ask). |
| 03/09 | v2 (BA) | Staff ID added, AC4 attribution (UTM + QR/manual + round-robin), AC7 View All, AC8 lifecycle, IA2–IA4. | Re-review: R1 design defect (editable Staff ID vs immutable attribution → orphaned cases); R5 decisions not made; precedence rule missing; staff-deactivation guard missing. |
| 04/09 | v3 (BA) | Staff ID immutable + normalised; unmatched code stays untagged; round-robin "reuses ACP-18"; View All granted to all at go-live; IEM004; first-wins; QR dropped; mockup renamed. | Round 3: P1-A — ACP-18 is queue assignment (processor pool, writes queue Assigned To), not sales attribution; P1-B — reassignment required by IEM004 but no function exists (dropped when the PO edited the comment, re-raised on request). |
| 05/09 | v4 (BA) | Dedicated sales round-robin (origination trigger, Staff-ID pool, attribution output); ET51 alert; AC7/IA2 aligned. | ADIB alignment flow (10 dimensions) and PO review pack (5-stage flow, 9 wireframes, 16-row best-practice matrix) — the user then asked whether the flow was "100% reflected" and five omissions were fixed. |
| 06/09 | Concept check | Staff ID vs agent code vs UTM vs referral code: SMBP's UTM (AMP-3323, IH14) carries no agent code; SMBP already has a customer-entered Referral Code pop-up (AMP-464) that the BA had dropped as "no SMBP story"; ADIB uses one identifier validated by a bank API. PO decided: one term = Staff ID everywhere. | v5 change note C1–C7 (one identifier, pop-up reinstated, DP change, submission-time precedence, format alignment, zero-untagged rules, reassign function). |
| 06/09 | Tech-lead updates | Staff ID free text (banks have legacy codes); visibility restricted for the Sales department only. ADIB double-check found ADIB-6681 (Department = 'Sale' enquiry filter) — correcting the day-before statement that no such precedent existed — plus four rollout bugs turned into rules. | Proposal E1–E12 + D1–D5 (HTML), then brought into chat; PO direction: no external references in the US, fields only when Department = Sale, other departments see all through existing permissions → E1–E13 revised; approved. |
| 06/09 | Apply | Description rebuilt as ADF from rendered HTML; 13 edits applied in purple with grey strikethrough; the PO's own orange AC9 edits and the BA's markers preserved; verified structure counts (13 tables, 62 rows, 99 bullets, 27 headings). | As-applied copy committed; handover comment drafted for the next go. |

## Lessons that shaped the skill

1. **Read the ticket a claim points to.** "AMP-3323 defines salesagentCode" was false; "no
   SMBP story for manual capture" was false (AMP-464 exists, UAT Validated).
2. **Precedent search needs the team's words.** "reporting manager / hierarchy / own
   applications" found nothing; "sales team" found ADIB-6681. Say so when you were wrong.
3. **Precedent bugs are requirements.** Re-login needed (ADIB-6743), 30-day default window
   (ADIB-6811), two parameter spellings (ADIB-5268), null in step details (ADIB-6720) became
   AC5/AC8/IA4 rules.
4. **A reuse claim can be a wrong mechanism.** "Reuse ACP-18" sounded economical and would
   have tagged sales credit from queue routing. Check trigger, pool and output of anything
   "reused".
5. **Immutability needs a correction path** or the lifecycle guards cannot be satisfied.
6. **The PO's edits to your draft can drop a P1.** Re-read what was actually posted.
7. **Deliver files, not chat** — and when the user says "bring it in the chat", do exactly that.
8. **Never edit the description through markdown.** Rebuild from rendered HTML; keep removed
   text visible; choose a colour no other author is using.
9. **The user's screenshots are the wireframe.** Generic boxes were rejected; portal-faithful
   recreations were accepted.
10. **Honesty beats momentum.** "Are you stuck?" was answered with "the update was not
    applied, here is why, doing it now" — then done in the same turn.
