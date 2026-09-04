@Kha Pham Thuc **Re-review per checklist — after your 03/09 update**

Good rework — Staff ID direction adopted as agreed and all new baseline references verified valid (ACP-230 Report Enquiry, ACP-265/266/268 Report List 1–3). Status per requirement below. Not Ready for Dev yet — close the ⚠️/❌ items first.

| **Ref** | **Requirement** | **Mapping with AMP-2548 (updated)** | **Review Status** | **Remaining Gap & Feedback to BA** | **Priority** |
| --- | --- | --- | --- | --- | --- |
| R1 | Staff sees own applications only | AC1 Staff ID field (unique, IEM001, maps to salesagentCode) + AC4 case attribution + AC5 own-only pre-filter + AC10 maker/checker | **⚠️ Done — fix required** | Design defect: AC1/AC10 allow editing Staff ID while AC4 makes attribution immutable and AC5 matches at query time → after a Staff ID change, the user's old applications match nobody (staff + manager lose them; only View-All sees them). Your own AC10 sample ("Staff ID: — → STF-042") is this case. Fix: store a resolved user reference at origination (recommended), or block Staff ID edits once set + define re-tagging. Also define the unmatched-code rule: salesagentCode with no matching active Staff ID (typo/leaver) → fall to round-robin or untagged? + normalization (case/trim). | P1 |
| R2 | Manager sees team applications | AC6 unlimited-depth subtree (Context aligned, "Level" removed) + AC8 lifecycle rules (cycle IEM002, deactivation guard IEM003, real-time RM change) | **✅ Done** | One edge left: AC8 blocks deactivating a manager with reports, but says nothing about deactivating a staff user with open tagged applications — who re-assigns their pipeline? Add a lifecycle row (block until re-assigned, or auto round-robin with audit). | P2 |
| R3 | Case tagging basis — Staff ID or UTM | Context + AC4 adopt Staff ID as the tag; UTM = carrier via salesagentCode; IA4 documents the AMP-3323 link | **✅ Done** | Precedence rule needed: AC4 says mechanisms are "evaluated in order" (UTM beats QR/manual), but ADIB-5651's production rule is "latest successful code wins" — both can occur in one journey. Pick one (recommend latest-successful-wins, audit every attempt) and state it in AC4. | P2 |
| R4 | Ops / admin retain full visibility | AC7 "View All Applications" permission — role-level, default off, includes untagged apps, migration note | **✅ Done** | Two config decisions still open: (1) IA4 — same permission as AMP-3323 "View All Application Sources" or separate → confirm with Channel team; (2) which existing roles receive it at migration. Assign owner + date for both. | P2 |
| R5 | Unassigned & historical cases | AC4 untagged rule (View-All only) + IA2 migration options + round-robin fallback | **❌ Not Done** | Mechanisms are written but the decisions are not made: (1) AC4 lists round-robin as a mechanism of THIS story while IA2 says it "may require a separate ticket" — decide now: write the round-robin ACs in (config table per channel/product, ADIB-7172 pattern) or raise the dependency ticket and link it as blocking; (2) pick migration option (a) bulk backfill or (b) grant View-All at go-live — this gates the dev estimate. | P1 |
| R6 | Report Enquiry follows same visibility | AC9 scoping incl. exports; refs corrected to ACP-230 + ACP-265/266/268 | **✅ Done** | References verified valid on 03/09 — no open item. | — |
| R7 | Email notifications — CC Reporting Manager | IA3 flags the notification template audit, separate ticket if CC needed | **✅ Done (flagged)** | Acceptable as flagged — raise the audit ticket so it doesn't get lost. | P3 |

Other points to close in the same pass:
1. Re-run Staff ID uniqueness + cycle validation at **Checker approval** — two pending Maker requests can both pass the save-time check and land a duplicate (AC10).
2. Tag is still invisible on screen (AC9 keeps columns unchanged) — add **Assigned To (Sale Staff)** to Customize Table (default ON for managers/View-All) + show attribution on Application Details + first audit-trail entry (ADIB-7388 / ADIB-6725 pattern).
3. QR/manual capture (AC4 mechanism 2) has no SMBP journey story — ADIB-5651 is another deployment. Confirm which SMBP screen captures the code, or drop mechanism 2 for phase 1.
4. Rename the mockup file — it still says "03-Level" though the Level concept was removed; confirm IEM001/002/003 are unused in the message registry; pin AC7 assignment to the Role Management pattern (ACP-257).

→ Fix R1 defect + R5 decisions (P1) first, then we move this to Ready for Dev.

cc: @Antofelix Rajan
