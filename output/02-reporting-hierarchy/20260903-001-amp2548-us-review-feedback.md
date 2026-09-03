# AMP-2548 — Reporting Manager Visibility & Case Assignment — US Review

**Reviewer:** Huyen (PO) · **Date:** 03/09/2026 · **Ticket:** AMP-2548 (Ready To Clarify, Sprint 13)
**Inputs checked:** CPO input requirements · UTM concept (AMP-3231, AMP-3323 — board 734) · ADIB sale/promo code usage (ADIB-5651, ADIB-7172, ADIB-6725) · Live RAKBANK portal screenshots (Application Enquiry) · Baselines ACP-226/227, ACP-258

---

## Feedback #1 — Blockers (data model & tagging)

@Kha Pham Thuc **Feedback #1**

1. **How does a case get "Assigned To" someone? This is the biggest gap.** AC4/AC5 filter on the application's Assigned To field, but the US never defines how an application gets tagged to a sale staff. I checked the live Application Enquiry (RAKBANK) — there is no Assigned To column, no agent field in Application Details, and audit trail Action By only shows System/Customer. The data point does not exist today. Without a capture AC (what tags the case at origination), dev cannot build the filter. → Please add ACs for the tagging mechanism, not only the filtering.

2. **Matching key undefined — the user record has no Sale Code / Staff ID field.** AC4 says the system matches "the logged-in user's sale code / staff ID", but AC1 only adds Reporting Manager to Add/Edit User. ACP-258 User Management has no Staff ID / Sale Code attribute. Which attribute of the portal user equals the code stored on the application? → Add a Sale Code / Staff ID field to the user record (with uniqueness validation + maker/checker + audit), or explicitly define matching by another key. Field description tables needed same as Reporting Manager in AC1.

3. **Staff ID vs UTM — decision needed, and my recommendation is Staff ID.** I checked the UTM concept (AMP-3323, already UAT validated):
   - UTM identifies the **marketing link and its owner**, not the person handling the case. Owner ≠ sale agent.
   - UTM visibility follows an ownership + **Share** model (View/Edit, Everyone/specific users) — sharing would silently change who sees which applications, which conflicts with a fixed reporting-line rule.
   - Applications not from a UTM link fall back to "{Channel Name} Direct" and are **visible to all enquiry users** — this directly breaks "staff sees own cases only".
   - ADIB already solves this at person level: the UTM URL carries `salesagentCode` (ADIB-6725), the customer journey captures staff referral via **QR scan or manual code input** (ADIB-5651), and when nothing is provided the system **round-robin assigns** an active staff code from a config table so every application is tagged (ADIB-7172).

   → **Tag the case with Staff ID (sale code); use UTM only as one of the carriers of that code** (utm link parameter + QR + manual input + round-robin default). UTM stays for campaign analytics; Staff ID drives assignment and visibility. Please align the US: define Assigned To = staff code captured at origination, with the capture channels listed.

4. **Users with no assignments and no reports lose ALL visibility.** Today every enquiry user sees the whole pool. After this change, back-office / ops / admin users (no assigned cases, no direct reports) get IM005 on every screen. AMP-3323 solved the same problem with a "View All Application Sources" permission. → Add a "View All Applications" permission (role-level, default off) and state which existing roles get it at migration. Without this, the release becomes a visibility regression for operations.

5. **Unassigned applications are invisible to everyone** (except #4 users). Customer-direct/online cases with no staff tag — who monitors them? → Either round-robin auto-assignment (ADIB pattern, config table, no hardcoding) or an explicit "Unassigned" pool visible to managers / view-all users. Pick one and write the AC.

## Feedback #2 — Consistency, scope & lifecycle

@Kha Pham Thuc **Feedback #2**

6. **Migration / backfill is missing from Impact Analysis.** Existing production applications carry no Assigned To → at go-live, staff and managers see empty enquiry screens. → IA must state the backfill approach (backfill from existing source data where possible; remainder = unassigned pool per #5) and the go-live behavior.

7. **Direct reports vs full subtree — the US contradicts itself.** Context of Business says managers see "their direct reports"; AC5 says full recursive subtree; the mockup filename says "03-Level". → Confirm the depth rule once and use it consistently. I support full subtree (no hardcoded level cap) + manager's own cases included, but Context must match AC5. Also add the performance note for deep chains (recursive traversal on every enquiry query).

8. **Report Enquiry references are wrong and the screen doesn't exist.** AC6 cites ACP-228/229 as the Report Enquiry baseline: ACP-229 does not exist, ACP-228 is "Application Enquiry – Audit Trail" and is Cancelled. The live portal menu has Enquiry > Application Enquiry only — no Report Enquiry. → Point AC6 to the correct baseline story, or descope Report Enquiry from this US and raise it separately.

9. **Reporting Manager lifecycle rules are missing.** Three cases to define:
   - **Circular chains**: AC1 blocks self-assignment only. A→B and B→A passes today's rules. → Validation must reject any cycle in the chain.
   - **Deactivate / delete a user who is someone's Reporting Manager**: blocked? forced reassignment of their reports? What happens to the subtree visibility in the meantime?
   - **RM change mid-application**: visibility follows the current hierarchy, so historical cases move between teams when the org chart changes — report numbers change retroactively. → Confirm this is accepted, or define effective-dating.

10. **Clarify relationship with the existing Assignment Management module.** The portal already has "Assignment Management" in the left menu. Is this US's Assigned To the same field driven by that module (queue/processor assignment), or a new sales-attribution field? If we overload one field, ops assignment will contaminate sales hierarchy reporting. → Name the field distinctly (e.g. **Sale Staff / Sourced By**) and state the relationship explicitly.

11. **Attach the mockup.** The ticket comment says the interactive mockup "needs to be attached" — nothing is attached on the ticket yet.

---

## Requirement Check List — CPO Input vs AMP-2548

@Antofelix Rajan Per reviewing US with Kha, up to now our requirement check list is matched as below:

| **Ref** | **Requirement** | **Description** | **Where the story covers it** | **Coverage** |
| --- | --- | --- | --- | --- |
| R1 | Staff sees own applications only | Sale code / staff ID user can view only the applications tagged to them in Enquiry | AC4 pre-filter matching logged-in user's staff ID vs Assigned To, applied before all existing filters; IM005 empty state; AC6 applies it to both enquiry screens | **Partially covered** — the filter is defined, but the Assigned To capture mechanism and the Staff ID field on the user record do not exist anywhere in the US. There is no data to filter on. |
| R2 | Manager sees team applications | Manager can view all applications tagged to users under them | AC1–AC3 Reporting Manager field on user record (add/edit, view, list, export); AC5 recursive subtree traversal + manager's own cases; AC7 maker/checker on RM changes | **Partially covered** — hierarchy and traversal are defined, but Context (direct reports) contradicts AC5 (full subtree), and manager lifecycle rules (cycles, deactivation, mid-flight RM change) are missing. |
| R3 | Case tagging basis — Staff ID or UTM | Decide the attribution key and how it is captured on the application | Not addressed — the US assumes Assigned To exists. UTM concept (AMP-3323) not analyzed against this feature | **Not covered** — recommendation: tag by **Staff ID** (person-level), captured via UTM `salesagentCode` param + QR + manual input + round-robin default (ADIB pattern: ADIB-6725, ADIB-5651, ADIB-7172). UTM remains campaign analytics only. |
| R4 | Ops/admin retain full visibility | Roles that process all applications must keep access after the restriction | Not addressed — no view-all permission in the US | **Not covered** — reuse the AMP-3323 pattern ("View All Application Sources" permission); define which roles receive it at migration. |
| R5 | Unassigned & historical cases | Who sees applications with no staff tag; go-live backfill for existing data | Not addressed — IA only covers Maker/Checker | **Not covered** — need round-robin default or unassigned pool + explicit migration/backfill statement. |
| R6 | Report Enquiry follows same visibility | Reports and exports scoped to staff/subtree | AC6 Report Enquiry row incl. export scope | **Partially covered** — scoping rule is written, but baseline references are broken (ACP-229 doesn't exist; ACP-228 is Audit Trail, Cancelled) and Report Enquiry is absent from the live portal menu. |

@Kha Pham Thuc → From Product perspective, please ensure R3/R4/R5 are added to the User Story and the R1/R2/R6 gaps above are closed before we move to Ready for Dev.
