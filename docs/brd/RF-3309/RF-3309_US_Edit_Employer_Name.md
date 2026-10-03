# [Enhancement] Credit Queue – Employer Name edit with ALOC & Rule Engine re-run

*Structure per Agile User Story Template v1.1 (Hailey).*

## 1. Problem Background

* **Business demand (Credit Department):** the Employer Name is system-derived and locked — EFR [Sponsor Name] (Mainland / Freezone) or the Customer Journey input (GCC / Golden / Family visa), RF-174 — although it drives the ALOC classification, MOD / MOI / Pensioner flags, Rule Engine attributes and the maximum DBR. No bank user can correct it.
* **Production pattern:** wrong employer names (EFR name ≠ Empaneled list name, customer typos, Arabic input) drop applications to Credit Queue L1 (drop point 12) with no way to fix them — the Credit user can only decide on N-ALOC terms or reject.
* **This story:** add the Employer Name to the existing Edit Application pop-up in Credit Queue. On save: override the finalized Employer Name → re-run ALOC classification → recalculate related fields → re-run Rule Engine → display the results. Source: RF Appro September 2026 Combined List – Item 3 (Change Request); cost approval required before implementation.

## 2. User Story Statement

**As a** Credit Queue user with the "Edit Employer Name" permission,
**I want** to correct the Employer Name of an application in Credit Queue (L1–L3),
**so that** classification, eligibility and limit assignment reflect the true employer before I decide the case.

* **Scope:** Credit Card and Personal Loan. Entry point: the existing **Edit** button on Credit Queue › Application Details.
* **Governing requirement (Head of Retail, 30 Sep):** validation-first, exception-based — a manual amendment never establishes classification by itself; the system validates independently against the Empaneled Company List before anything recalculates, and the whole run executes as one controlled transaction (no partial update).

![Flow – Edit Employer Name](Flow_Edit_Employer_Name.png)

## 3. Acceptance Criteria

### AC1 — Displaying rules: Employment Information section in the Edit Application pop-up

**Navigation:** Queue → Credit Queue (L1 / L2 / L3) → select application → **Edit** → Edit Application pop-up → the existing "Length of Service" section is renamed **"Employment Information"** and holds both employment fields: the new **Company Name** followed by **Length Of Service (Months)** (existing, unchanged) (SC3). Pop-up order: Application Details → Other Income And Expenses → Liability Info → Employment Information.

![SC2 – Edit entry point](SC2_Credit_Queue_Application_Details_Edit_Button.png)

![SC3 – Edit Application pop-up, Employment Information section](SC3_Edit_Application_Popup_Employer_Name.png)

| Name | Component Type | Mandatory | Editable | Description |
| --- | --- | --- | --- | --- |
| Employment Information | Section bar | N/A | N/A | Renamed from "Length of Service" — same style and position. Shown when "Edit Length of Service" or "Edit Employer Name" is TRUE; each field displays per its own permission (AC4). |
| Company Name | Search-and-select field | Yes | Yes | Search-and-select over the Empaneled Company List (type-ahead), pre-populated with the current finalized Employer Name ([CompanyName], RF-174); free-text entry only as an exception path, flagged for review (Head of Retail item 1). Governed by "Edit Employer Name"; Length Of Service (Months) stays governed by "Edit Length of Service" (RF-1492, unchanged). |
| Clear All / Cancel / Save | Existing controls | N/A | N/A | Unchanged behaviour (RF-1492): Clear All reloads stored values; Cancel → AC3; Save disabled until a value changes → AC2. |

Applicable status: CC and PL — Credit Queue L1 / L2 / L3, Application Status `Awaiting Credit Approval`. Existing Edit restrictions apply unchanged (FTS pending, application locked by another request, no permission, other queues view-only).

### AC2 — Validation and Saving rules: save updated information

**AC2.1 Validation rules** (free-text exception path, as the Customer Journey field): alphabetic only → **IEM030**; max 200 characters → **IEM076**; blank → **IEM003**. Unchanged value on Save (case-insensitive) → the Employer Name re-run is skipped. Other edited sections keep their own validations.

**AC2.2 Confirmation rule** (SC4) — the existing Edit confirmation component (centered message, No / Yes, Save buttons), one **generic** confirmation for the whole pop-up — not specific to any edited field: *"Are you sure you want to update this \<Application ID\>? The system will automatically recalculate the related fields and re-run the Rule Engine."* **No** → back to the pop-up. **Yes, Save** → AC2.3.

![SC4 – Confirmation](SC4_Edit_Employer_Name_Confirmation_Popup.png)

**AC2.3 Saving rules — system actions on confirmation**, in order:

| # | Action | Reference |
| --- | --- | --- |
| 1 | Override [Finalized Employer Name] with the input; keep the first system-derived value as [Original Employer Name] + [Original ALOC]. Set [Employer Name Source] = "Credit Department", Updated By / Updated On. EFR and Customer Journey source data are not modified. | RF-174 |
| 2 | Re-run the employer classification: Rosette match vs Empaneled Company list (score ≥ 0.9, Category ≠ NON-ALOC → ALOC + company fields; else N-ALOC). Re-evaluate MOD / MOI / Pensioner flags. | RF-424, RF-869 |
| 3 | Recalculate Calculated Variables and Limit Assignment (classification drives max DBR and multiplier group). | RF-2682 |
| 4 | Re-run the Rule Engine (Segmentation / Filtration / Deviation) on the published versions. The existing shared re-run counter applies — same rule as every action that re-triggers the RE (Edit Information / Re-fetch ECB / Retrigger FTS): > 2 RE failures in total → system rejects (existing behaviour; business failures only — technical errors never consume the counter). | RF-2682 |
| 5 | Routing per current logic; status stays `Awaiting Credit Approval` unless routing changes it. No new status. | RF-177 |
| 6 | Audit trail: [Step] = "Edit Information"; [Step Detail] on two lines — *Employer Name: updated from "\<old\>" (Source: \<old source\>) to "\<new\>"* / *ALOC: updated from \<original ALOC\> to \<updated ALOC\>*; [Action by] = user email. The old → new trail lives in the Application History, not in the Application Details display. | CR 003 |
| 7 | Loading up to 15s; application locked during the run ("The Application is in another request processing."); one controlled transaction — no partial update. | RF-2682 |
| 8 | Toaster **IM004**; Application Details, Rule Engine Result and Approve Limit Result reload (SC5). | IM004 |

* Several sections edited in one Save → recalculation and Rule Engine run once, after all values are stored.
* No cap on repeat edits; [Original Employer Name] is set once and never overwritten.

### AC3 — Cancel rule

Cancel → existing confirmation → **Yes** closes the pop-up, nothing changes (RF-1492 AC3).

### AC4 — Applying rules: permission (Role Management, SC1)

New permission **"Edit Employer Name"** — Editor group of Credit Queue L1 / L2 / L3. **No product classification** — one permission per queue level, per the live Role Management design — listed **immediately before "Edit Length of Service"** (SC1), same treatment. **The permissions stay separate** although both fields sit in the one Employment Information section: "Edit Length of Service" governs the Length Of Service field, "Edit Employer Name" governs the Company Name field; TRUE → the field is visible, FALSE → hidden, both FALSE → the section is hidden, all Edit permissions FALSE → Edit button hidden (RF-1501). Permission Matrix updated.

![SC1 – Role Management permission](SC1_Role_Permission_Credit_Queue_Edit_Employer_Name.png)

### AC5 — Saving rules: finalized Employer Name overrides every consumer

Every consumer reads [Finalized Employer Name] after the edit:

| Consumer | Behaviour after the edit |
| --- | --- |
| Application Details — every view that renders it (Credit / Risk / Sale / Compliance queues, Termination Queue, Disbursement Maker / Checker, Application Enquiry) | Updated name and re-classified ALOC — AC6. No change needed per view: they all read [Finalized Employer Name]. |
| CAM report + Affordability Assessment Form | Regenerated on the edit (RF-2682 pattern). |
| Application Form | Not regenerated — remains the OTP-time record of the customer's submission. |
| Customer Document Stack | Generated post-decision → carries the updated value automatically. |
| T24 CIF Creation | No impact — the mapping carries no Employer Name (RF-2530). |
| EastNets AML | No re-screening on the edit; the corrected name reaches EastNets via the post-decision CIF-update call (RF-2194 / RF-2530). |
| Length of Service | Not re-run — own edit section (RF-1492). |
| Customer communication | None — the customer is not notified. |

### AC6 — Displaying rules: Credit Queue and Application Enquiry

The fields below sit in the expanded **Application Details** section › **Employment Information** sub-block (SC5). **Application Details displays details only — no trail block**; the old → new trail lives in the Application Enquiry › Application History (SC6, AC2.3 step 6). The same section is shown, reading the finalized value, in every view that renders it: Credit Queue L1–L3, Risk Queue, Sale Queue, Compliance Queue, **Termination Queue, Disbursement Maker / Checker** and **Application Enquiry** (all view only):

| Field | Value after the edit |
| --- | --- |
| Company Name | Updated finalized Employer Name |
| Company Name Source *(new)* | EFR (Sponsor Name) \| Customer Journey \| **Credit Department** (after an edit). |
| ALOC / Pensioner | Re-classified — live format `Yes` \| `No (<match %>)` |

![SC5 – Application Details after the update](SC5_Application_Details_Employer_Name_Updated.png)

* Repeat edits: every edit writes its own "Edit Information" step — the Application History carries the full trail.
* Application Enquiry › Application History shows the "Edit Information" step per AC2.3 step 6 format (SC6).

![SC6 – Application History](SC6_Application_Enquiry_History_Edit_Employer_Name.png)

## 4. Impact Analysis

| Area | Impact | Screen |
| --- | --- | --- |
| Role Management / Permission Matrix | New permission "Edit Employer Name" on Credit Queue L1–L3 | SC1 |
| Edit Application pop-up | "Length of Service" section renamed Employment Information; Company Name search-and-select beside Length Of Service (Months) | SC3 |
| Employer classification | ALOC / MOD / MOI / Pensioner re-runnable on demand per application | SC4 |
| Rule Engine & Limit Assignment | Re-run on the new classification; shared re-run counter | — |
| Audit trail | "Edit Information" step with dynamic old → new Step Detail | SC6 |
| Application Details display | Company Name Source row on every view rendering the section (queues incl. Termination / Disbursement, Application Enquiry); no trail block — trail in Application History only | SC5 |
| Documents | CAM + Affordability Form regenerated; Application Form untouched | — |
| Status model / mobile app / Communication Setup | No change | — |

**Dependencies:**

| Ticket | Relevance |
| --- | --- |
| RF-1492 / RF-2682 | Edit pop-up pattern, Save/Cancel, re-run counter, document regeneration |
| RF-424 / RF-869 | ALOC classification logic re-run in AC2.3 |
| RF-1501 | Permission model (AC4) |
| RF-2194 / RF-2530 | EastNets / T24 basis of AC5 |
| RF-3305 | Reverted cases re-enter Credit Queue L1 and use this edit |
| RF-2957 | Mortgage Loan edit — mirror this section when ML is specified |

## 5. Notes

* **Screens** attached with the same file names: SC1 permission · SC2 Edit entry point · SC3 Edit pop-up · SC4 confirmation · SC5 display after update · SC6 application history · Flow diagram. Build-accurate composites over the live UAT portal.
* **Out of scope:** CASA, Mortgage Loan, Auto Loan · editing from Application Enquiry or Risk / Compliance / Sale queues (view only) · editing Employment Category / Type · re-running Length of Service · re-fetching EFR / AECB / MOHRE · Arabic input and BVE integration in the Super Portal · maker–checker, mandatory change reason, edit cap, customer notification · EastNets re-screening and Application Form regeneration on the edit.
* AML treatment to be confirmed by Compliance (documented in AC5); BRD V1.1 is the companion client-facing document.

## 6. Priority

**High** — Change Request from the Credit Department; unblocks drop-point-12 cases currently stuck between N-ALOC terms and rejection.
