# [Enhancement] Revert rejection case — RF-3305

*User story pre-populated for RF-3305, mirroring the structure of RF-2365 (Application Cancellation on Application Enquiry screen). Companion BRD: **Application Revert in Super Portal V1.0** (attached to the ticket).*

---

## Context of Business

* Today a rejection in Super Portal is **final**. The Pre-dedupe *Existing Application Check* then blocks any new application for the same customer for **30 days** after a rejection — and that block has reached across products in production. When Credit rejects a case on a parameter that was wrong, incomplete or has since been corrected (income evidence arriving late, an obligation double-counted, a decision boundary re-tuned), the customer cannot simply reapply; the only remedy inside the window is to reopen the same application.
* This story provides a manual option to **revert a rejected application back to the queue it was rejected from**, through the Super Portal interface, so the responsible team can correct the credit parameters and re-decision the case. It is requested by the Credit Department and follows the **same maker–checker governance as Application Cancellation** (RF-2365 / RF-2366 / RF-2367).
* **Signed off BRD:** *Application Revert in Super Portal V1.0* (attached; to be filed under 5. [RF] Phase 2 Documents).

## User Story Details

* The existing **Application Enquiry** module in the Super Portal will be utilized to support the bank's requirement for reverting rejected applications — mirroring the entry point of RF-2365.
* **Scope: Credit Card and Personal Loan only.** CASA is excluded (no credit decisioning); Mortgage Loan and Auto Loan are not yet part of the platform scope.
* This story carries the three parts of the cancellation set in one ticket — Enquiry screen (≈RF-2365), Role Management (≈RF-2366) and the checker queue (≈RF-2367). Split into companion stories at refinement if preferred.
* Screens: **SC1–SC5 + flow** — attached to this ticket as `rc1.png` (SC1 Role Management > Application Enquiry permissions), `rc2.png` (SC2 Application Enquiry with Revert button), `rc3.png` (SC3 Revert confirmation popup), `rc4.png` (SC4 Queue menu with Revert Queue), `rc5.png` (SC5 Role Management > Manually Queue > Revert Queue), `rcflow.png` (end-to-end flow). The same images are embedded in the BRD. Figma: ⚠ **TBC** — to be produced by design; SC images are build-accurate composites over the live UAT portal in the interim.

## Acceptance Criteria

### AC1: Application Revert Screen Description

| **SC2 – Application Enquiry > Application Details screen** | **SC3 – Revert Confirmation Popup** |
| --- | --- |
| 📎 attachment: `rc2.png` | 📎 attachment: `rc3.png` |

| Name | Component Type | Mandatory | Editable | Description |
| --- | --- | --- | --- | --- |
| Revert Button | Button | NA | NA | User with "[Product] Revert Application" role permission should be able to view the "Revert" button on the Application Details screen, next to the existing "Cancel Application" button. **Enabled only when Application Status = "Rejected" AND the rejection origin is revertible per AC5 AND no revert request is already pending (Revert_App = FALSE) AND no cancellation is pending (Cancel_App = FALSE).** Disabled (greyed) otherwise. |
| Revert confirmation (Are you sure you want to revert the Application) | Modal popup | NA | NA | SC3: User should confirm the revert request. Sub-text: "The request will be sent to the Revert Queue for Checker approval." Click on **Yes, Revert** to submit the request and enter the Revert Reason for approval from Checker (see AC1.1). Click on **Back** to close the popup with no change. |

| Product Type | Applicable Status for Revert in Super Portal |
| --- | --- |
| CC | Rejected — where the rejection origin is revertible per AC5 |
| PL | Rejected — where the rejection origin is revertible per AC5 |

The revert shall be restricted in below scenarios:

| Scenario | Condition / Application Status |
| --- | --- |
| Bank users already initiated revert | Revert_App = TRUE (request pending in Revert Queue) |
| Bank users already initiated cancellation | Application Status = 'User Initiated Cancellation' OR Cancel_App = TRUE |
| Application is not rejected | Any Application Status other than 'Rejected' (Lead, In Progress, Awaiting * , Approval In Principle, Completed, …) |
| Application terminated for another reason | Invalidate \| Insufficient Data \| Declined \| Cancelled \| Failed by Minimum Income \| Expired \| Blocked \| Failed By EFR |
| Rejection origin is not revertible | Pre-dedupe check failure (Step 7.1) \| No applicable product ({Pre-Fetch Applicable Product}) \| AML blacklisted / AML callback rejected \| geo-fencing, EID-scan or EFR liveness terminations |

### AC1.1: Revert Reason

* **Save Revert Reason as Comment**
  * When user enters the mandated Revert Reason field and clicks on "Yes, Revert" button:
    * The Revert Reason text will be displayed on Comment area with below details:
      * Comment title: \<\<User's name posted comment\>\> \<\<Department name\>\>
      * Comment body: "REVERT REASON: \<Content of Revert Reason inputted\>"
      * Comment footer: \<\<Posted Date time\>\> (format hh:mm AM/PM | DD MM YYYY)
    * Save comment to DB with prefix "REVERT REASON" — format: REVERT REASON: \<revert reason comment text\>
    * Store basic audit trail — refer to **CR 003** (RF Common Rule).

### AC2: Impact of user submitting the Revert request

**AC2.1: Revert request by Bank user from the Application Enquiry**

When user submits the revert request:

* **Revert_App = TRUE** (new flag, mirroring the existing Cancel_App flag)
* **Application Status remains "Rejected"** — no new application status is introduced. The application is not changed by the request, only by the Checker decision. *(Deliberate difference from cancellation's 'User Initiated Cancellation': the application is already terminated, and every new status must be handled by the mobile app.)*
* The **target queue and status** are resolved per AC5 at submission time and stored on the request. Re-entry is **always at Level 1** of the target queue.
* The below [Application History] object logs — stored as audit trail and displayed under Application Enquiry details:
  * [Application ID] = \<current Application ID\>
  * [Step] = "Manual revert process"
  * [State] = "Rejected"
  * [Start Time] / [End Time] = yyyy-MM-dd HH:mm:ss
  * [Step Status] = "Successful"
  * [Step Detail] = "Revert requested by %Username% to \<TARGET_QUEUE\>. Revert reason is \<REVERT_REASON AC1.1\>"
  * [Action by] = \<user email id\>

**AC2.2: Landing the revert request into Revert Queue (Checker)**

* A new queue, **'Revert Queue'**, appears in the Queue menu alongside the existing queues (📎 `rc4.png`), and under the **Manually Queue** section in Role Management (Add Role screen) with two role permissions per product — **View Application** and **Evaluate Application** ([Credit Card] / [Personal Loan]) (📎 `rc5.png`).
* Role Management also gains **'[Credit Card] Revert Application'** and **'[Personal Loan] Revert Application'** under **Enquiry > Application Enquiry** (Maker permission — mirrors RF-2366) (📎 `rc1.png`). These are distinct permissions, kept separate from Cancel Application and from Evaluate Application (RF-2781 / RF-2785 precedent).
* Revert Queue details view = same layout as Termination Queue details (RF-2367): application detail sections, **Comments tab selected by default** (so the REVERT REASON comment is the first thing the Checker sees), Documents tab. The Checker view is read-only apart from the decision — no Edit / Override / Send / FTS Retrigger here.
* **Approve** ('Are you sure you want to Approve the application revert?' → Yes, Approve):
  * Application Status = \<TARGET_STATUS\> and the application re-enters \<TARGET_QUEUE\> **at Level 1**; Revert_App = FALSE
  * Toaster: "Revert of \<Application ID\> is approved"; update [Revert Queue] = 'APPROVED' → remove from queue
  * Audit: [Step] = "Revert Queue", [State] = \<TARGET_STATUS\>, [Step Detail] = 'Application revert requested by "%Username%" and approved by "%Username%". Application returned to \<TARGET_QUEUE\>', [Action by] = \<System\>
  * Email notification per AC3 to the requesting bank user
* **Reject** ('Are you sure you want to Reject the application revert?' → Yes, Reject):
  * Application Status remains "Rejected"; Revert_App = FALSE (a fresh request may be raised later)
  * Toaster: "Revert of \<Application ID\> is rejected"; update [Revert Queue] = 'REJECTED' → remove from queue
  * Audit: [Step] = "Revert Queue", [State] = "Rejected", [Step Detail] = 'Application revert requested by "%Username%" and rejected by "%Username%"', [Action by] = \<System\>
  * Email notification per AC3
* Maker–checker segregation follows the **same model as Application Cancellation** — no additional restriction is introduced (PO decision).

**AC2.3: Timeout scenario if no decision taken in the Revert Queue**

A configurable timeout period of [X] days begins when the revert request is submitted (proposed default: 5 days, configurable in database, matching cancellation):

| Scenario | Outcome |
| --- | --- |
| Request APPROVED within [X] days | Per AC2.2 Approve |
| Request REJECTED within [X] days | Per AC2.2 Reject |
| No decision within [X] days | The request is **auto-approved by the System** the next day after timeout — **same behaviour as the cancellation timeout**: Application Status = \<TARGET_STATUS\>, application re-enters \<TARGET_QUEUE\> at Level 1, Revert_App = FALSE, removed from Revert Queue, email as per AC3 (approved). Audit: [Step] = "Auto Revert Approval on timeout", [State] = \<TARGET_STATUS\>, [Step Detail] = 'Application revert requested by "%Username%" and approved by System, as per approval timeout configuration of [X] days. Application returned to \<TARGET_QUEUE\>', [Action by] = \<System\> |

### AC3: Sending Email Notification

* When the revert request is decided, send email notification to the bank user who requested the revert (Bank-type templates, English only, per product — CC and PL):

| Type | Subject | Content | Trigger |
| --- | --- | --- | --- |
| Email | [Super Portal] - Application %%APPLICATION_ID%% revert is approved. | Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% has been approved. The application has been returned to %%TARGET_STATUS%%. Best Regards, Reem Bank | One time — send immediately when the revert is approved in Revert Queue, or auto-approved by System on timeout |
| Email | [Super Portal] - Application %%APPLICATION_ID%% revert is not approved. | Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% is rejected. The application remains Rejected. Best Regards, Reem Bank | One time — send immediately when the revert is rejected by Checker in Revert Queue |

* All merge fields must resolve before dispatch; templates sign off as **Reem Bank** (not Reem Finance).

### AC4: Customer Journey after revert

* **While the request is pending:** nothing changes for the customer — the application is still Rejected and the 30-day pre-dedupe block continues to apply.
* **After an approved revert:** the application is in-flight again in a queue; the pre-dedupe *in-progress application* check blocks a new same-product application (correct). Resuming the journey must land the customer at the correct point — regression on resume behaviour (RF-3271-type gaps).
* **If the application is rejected again after a revert:** the 30-day re-application window shall run from the **latest** rejection — ⚠ TBC.
* No customer notification of the reopen in v1 (the customer already received the rejection email ET8/ET12) — ⚠ TBC.

### AC5: Revert trigger points and target status determination

The status the application returns to is derived from **how it became Rejected** — from the audit step recorded at the point of rejection. Re-entry is **always at Level 1** of the target queue (PO decision); the case then escalates through levels under the standard queue rules. No new data capture is required.

| Audit step recorded at rejection | Rejection origin | Revertible | Target status (and queue) |
| --- | --- | --- | --- |
| {Rejected in Credit Queue [Level]} | Credit user rejects in Credit Queue L1–L3 | Yes | Awaiting Credit Approval — Credit Queue **L1** |
| Compliance Reject | Compliance user rejects in Compliance Queue L1–L2 | Yes | Awaiting Compliance Review — Compliance Queue **L1** |
| Risk Reject | Risk user rejects in Risk Queue L1–L3 | Yes | Awaiting Risk Review — Risk Queue **L1** |
| Sale Reject | Sales user rejects in Sale Queue | ⚠ TBC | Awaiting Sales Response |
| {Safety net for Finance DBR} | System auto-reject — Existing DBR > 50% after calculation | Via parking change below | Awaiting Credit Approval — Credit Queue L1 |
| {Fail Strategies Check} | System auto-reject — application fails all segmentations (rejection logic unchanged) | Yes | Awaiting Credit Approval — Credit Queue L1 |
| Approval Limit Result = "Failed" | System auto-reject — approved limit < Min Boundary with no deviation (rejection logic unchanged) | Yes | Awaiting Credit Approval — Credit Queue L1 |
| {Pre-Fetch Applicable Product} / pre-dedupe steps / AML | System terminations before any queue ownership | **No** | — |

* **System change — DBR parking (confirmed):** today, Existing DBR > 50% after calculation auto-rejects the application with [Action by] = \<system\> (RF-1041 safety net), leaving no previous status to restore. The system shall instead **park the case into Credit Queue L1** ('Awaiting Credit Approval'): the **Failed Reason continues to show the same message** as the current auto-rejection, and the system shall **complete the Rule Engine run and Limit Assignment** so the RE result and limit-assignment result are available in the Credit Queue view — the Credit user must have enough information to decide. A subsequent Credit rejection then reverts under the standard rule. This parking applies to every DBR breach, not only cases later reverted — Credit Queue volume impact to be sized during estimation. *(The companion **Gross DBR > 100%** safety net: in or out — ⚠ TBC.)*
* **No change to the other auto-rejections (confirmed):** "fails all segmentations" and "approved limit < Min Boundary" keep their current auto-rejection logic — no parking is introduced for them. A revert of such a case returns it to Awaiting Credit Approval — Credit Queue L1, where a Credit user takes ownership of the re-decision.

## Impact Analysis

* **Permissions (6 new, per product):** [CC]/[PL] × Revert Application (Enquiry > Application Enquiry); [CC]/[PL] × View Application + Evaluate Application (Manually Queue > Revert Queue). Permission Matrix page to be updated. Distinct rights — never bundled.
* **Drop-points matrix:** new row — approved revert → target queue at **L1**; plus the DBR parking row → **Credit Queue L1 volume increases for every DBR breach**, not only reverted ones (parked cases carry completed RE + Limit Assignment results). Size before approving.
* **Status model:** no new Application Status (Revert_App flag only) → **no mobile app change**; avoids status-not-reflecting-reality defects.
* **Audit trail:** 3 new steps — "Manual revert process", "Revert Queue", "Auto Revert Approval on timeout".
* **Communication Setup:** 2 new Bank-type templates × 2 products. Existing queue reject confirmations must be re-worded where rejection becomes revertible — Compliance currently says *"This action can not be revert"*, Risk says *"the application will be terminated after you reject it!"*.
* **Reporting/MIS:** WIP, Exception, Policy Exception, E2E and Approved Transactions must handle reopened cases (rejection counts become mutable; E2E must not double-count) — ⚠ TBC with reporting owner.
* **Services:** backoffice-service, application-service, queue-service, user-service, audit-trail-service, notification-service, scheduler-service (timeout job), **work-flow-service (Camunda — the key estimation item: resume the terminated process instance vs re-instantiate at the queue task)**.
* **Re-decisioning:** post-revert re-runs evaluate against the **currently published** strategy / score check / income multiplier versions; audit which version applied — ⚠ TBC.

## Out of scope

* CASA (no credit decisioning), Mortgage Loan, Auto Loan.
* Sale Queue rejections (pending decision), pre-decision terminations (geo-fencing, EID scan, EFR liveness, pre-dedupe, no applicable product, AML).
* Post-offer stages: AIP expiry, KFS/DDA signature stages, any application where a core-banking API has been triggered.
* Bulk revert; editing the application inside the Revert Queue; SLA/TAT on the Revert Queue (module not yet delivered — timeout is a scheduler job); reversal of a Checker decision; customer notification of the reopen (v1).

## PO decisions (18/09)

* R5/R6 ("fail all segmentations", "approved limit < Min Boundary"): **auto-rejection logic unchanged**; both revertible to Credit Queue L1.
* Existing DBR > 50% after calculation: **park into Credit Queue** instead of auto-rejecting — same Failed Reason message, with Rule Engine + Limit Assignment completed so the Credit Queue view has full information.
* Maker–checker: **mirror cancellation** — no extra segregation rule.
* Timeout: **auto-approve, same as cancellation**.
* Re-entry level: **always L1**.
* Workflow-engine resumption question parked for engineering (technical).

## Open Questions

1. Workflow engine (technical — for engineering estimation): can the terminated process instance be resumed, or must a new instance start at the queue task?
2. Is the **Gross DBR > 100%** safety net also in scope for parking to Credit Queue, or does it remain a hard auto-rejection? (Existing DBR > 50% parking is confirmed.)
3. Confirm **Revert_App flag with status remaining "Rejected"** in preference to a new 'User Initiated Revert' status (no mobile impact).
4. Are **Sale Queue** rejections revertible to 'Awaiting Sales Response', or excluded?
5. Confirm the timeout period [X] — 5 days proposed, configurable in database, same as cancellation.
6. Should the customer be notified when an application is reopened? (Rejection email ET8/ET12 already sent.)
7. Does the 30-day re-application window restart from the **latest** rejection after a re-reject?
8. Should the number of reverts per application, or a revert time window (e.g. within 30 days of rejection), be capped?
9. Confirm the revised wording for the Compliance / Risk reject confirmation messages once rejection becomes revertible.
