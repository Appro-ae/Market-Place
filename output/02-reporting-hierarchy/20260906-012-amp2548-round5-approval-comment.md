# AMP-2548 — Review Round 5 comment (approval), as posted

- Ticket: https://scvaladdin.atlassian.net/browse/AMP-2548
- Comment: https://scvaladdin.atlassian.net/browse/AMP-2548?focusedCommentId=117470 (id 117470)
- Posted: 2026-09-06 22:13 (+04:00) by Huyen, on the user's go ("post the comment")
- Format: ADF built with `.claude/skills/po-us-review/scripts/build_review_comment_adf.py` from `comment_r5_spec.json`
  (navy header row, green = Done, yellow = Done (flagged)); mentions by accountId
- Ticket status left unchanged (Ready To Clarify); the comment states the approval and the two conditions for Ready for Dev

---

@Kha Pham Thuc **Review Round 5 — APPROVED (R1–R7 covered). R1/R5 written into the description on 06/09**

I wrote the remaining R1 and R5 items into the description on 06/09. **Purple = added or changed, strikethrough = removed in this round** (round-4 removals are already accepted to keep the description within Jira's size limit). In one line each: (1) AC4 — attribution is resolved at submission from the codes captured in the journey: UTM staff_id, Referral Code pop-up (AMP-464) or sales round-robin; the latest captured value matching an active Sale Staff ID wins; no matching value → round-robin only where a pool is configured, otherwise the case stays untagged. (2) AC4 — both codes are optional, so not every application carries a Staff ID; untagged cases are visible to non-Sale users only. (3) AC4/AC8 — no reassignment function; the tag is immutable after submission; staff deactivation is allowed, cases keep the tag, IEM004 removed. (4) AC1/AC2/AC3/AC6/AC8/AC10 — a user can report to more than one Reporting Manager (multi-select, comma-separated display, cycle and subtree rules per edge, AC10 sample “add second RM”). (5) IA2 — backfill from the stored Referral code (AMP-464 / AMP-1454); no matching attribution → round-robin only where a pool is configured. (6) IA4 — staff_id added through the Super Admin-configurable UTM parameter list; AMP-1454 added to the references.

**Verdict: the ticket is approved — all R1–R7 aspects are covered. I move it to Ready for Dev as soon as the tracked changes are accepted and the two tickets below are raised and linked.**

| **Ref** | **Requirement** | **Mapping with AMP-2548 (v5, 06/09)** | **Review Status** | **Remaining Gap & Feedback to BA** | **Priority** |
| --- | --- | --- | --- | --- | --- |
| **R1** | Staff sees own applications only | AC1 Staff ID (free text, canonical key, mandatory for Sale, immutable) + AC4 three capture mechanisms (UTM staff_id, Referral Code pop-up, sales round-robin) with submission-time precedence + AC5 Sale-user pre-filter + AC10 maker/checker | **Done** | No open rule. | **—** |
| **R2** | Manager sees team applications | AC6 Sale-department manager sees own cases + the subtree under every manager edge, unlimited depth; AC8 lifecycle (per-edge cycle IEM002, manager deactivation IEM003, real-time RM change, department change, server-side scope evaluation); AC1 multi-select RM limited to Sale users | **Done** | No open rule. | **—** |
| **R3** | Case tagging basis — Staff ID or UTM | One identifier end to end: Staff ID on the user record, carried as UTM parameter staff_id, typed in the Referral Code pop-up or assigned by sales round-robin; IA4 corrected (AMP-3323 carries no agent code; parameter added via the Super Admin-configurable list) | **Done** | Raise the Distribution Portal story for the staff_id parameter (IH14 §1.2.1 optional-parameter list, stored under §3.4, passed to the Bank Portal) and link it as blocking. | **P1** |
| **R4** | Ops / admin retain full visibility | Department Rule: Department ≠ Sale sees all applications, including untagged ones, through the existing Application Enquiry / Report Enquiry permissions; AC7 removed; no new permission, no migration grant | **Done** | Confirm with the tech lead whether “Sale” is a system parameter or a fixed Department value in each bank's master data. | **P3** |
| **R5** | Unassigned & historical cases | AC4: untagged cases allowed (both codes optional), round-robin only where a pool is configured, untagged cases visible to non-Sale users only, no reassignment; IA2: existing Sale users get a Staff ID at go-live, one-off audited backfill from the stored Referral code, other historical cases visible to non-Sale users only | **Done** | No open rule. | **—** |
| **R6** | Report Enquiry follows same visibility | AC9: report data and exports scoped by the same department rule (Sale staff own, Sale managers subtree, non-Sale unfiltered); refs ACP-230 + ACP-265/266/268 valid | **Done** | No open item. | **—** |
| **R7** | Email notifications — CC Reporting Manager | IA3 flags the notification template audit | **Done (flagged)** | Raise the audit ticket so it does not get lost. | **P3** |

**To close before Ready for Dev:**

1. Accept the purple changes and delete the struck-through text.
2. Raise and link the two tickets: Distribution Portal dependency for staff_id (R3, blocking) and the notification template audit (R7).
3. Mockup: Add User shows Staff ID / Reporting Manager only when Department = Sale, Reporting Manager as multi-select; Hierarchy tab drops the View All card and shows the department rule; column renamed Sale Staff; Mockup Reference row for the Hierarchy tab reads AC5/AC6 (AC7 removed). Confirm IEM001–IEM003 and IEM005 are unused in the message registry (IEM004 removed).

**→ Approved. Items 1–2 done → Ready for Dev.**

cc: @Antofelix Rajan
