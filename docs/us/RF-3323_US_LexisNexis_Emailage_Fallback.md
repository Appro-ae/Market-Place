# RF-3323 — [PROD] LexisNexis Emailage – Fallback Field Mapping, Rule Engine Evaluation & Lexis Nexis Report

Jira: https://scvaladdin.atlassian.net/browse/RF-3323 · Story · Medium · KhoeHD · RF Sprint 17
Rewritten 24 Sep 2026 in Format B (system/backend). Jira description is in sync with this file.

### Context of Business

LexisNexis Emailage returns **emailAge** and **email_creation_days** as null in Production when the
creation date of the email address cannot be determined. LexisNexis has confirmed this is a valid
response and not a defect, and recommends **firstVerificationDate** / **first_seen_days** as
substitutes. The current mapping has no fallback, so these applications reach the Risk Rule Engine
with null inputs and are declined without a genuine risk signal.

Reem Bank Fraud Risk confirmed the fallback on 22 September 2026 and directed that a missing
Business Email must not by itself route an application to the Risk Queue; those cases are assessed
on the Personal Email parameters.

### User Story Details

Scope: **all products where the LexisNexis Emailage check is invoked on the customer journey —
Credit Card, Personal Loan and CASA.**

**In-scope scenarios**
* **S1** — emailAge returned null, firstVerificationDate available.
* **S2** — email_creation_days returned null, first_seen_days available.
* **S3** — Customer has not provided a Business Email, so all Business Email parameters are null.
* **S4** — Both the primary field and its fallback are null.

**Not in scope**
* domainAge and fraudRisk format observations — reviewed with Reem Bank and closed on 8 September
  2026 as a display artefact of the exported file, not a defect. No change required.
* Changes to the LexisNexis request payload or service contract.
* Changes to Risk Rule Engine thresholds or scoring bands.

### AC1 — Fallback field mapping

| No | Primary field | Fallback field | Applied when | Stored meaning |
|---|---|---|---|---|
| 1 | emailAge | firstVerificationDate | emailAge is null or absent | Oldest date Emailage holds records for the email — the first-seen date. Never stored or presented as the email creation date. |
| 2 | email_creation_days | first_seen_days | email_creation_days is null or absent | Number of days since firstVerificationDate. |

The fallback is applied per field independently. Where both the primary field and its fallback are
null (S4), the attribute is treated as not available and excluded from evaluation per AC3.

### AC2 — Assessment and routing where no Business Email is provided

* Business Email parameters are null and are **excluded** from the assessment.
* The application is assessed and routed on the **Personal Email parameters only**.
* The absence of a Business Email alone never routes an application to the Risk Queue.
* The application still routes to the Risk Queue where the Personal Email parameters themselves
  breach the published strategy.

### AC3 — Rule Engine evaluation of unavailable attributes

Published Strategies today treat a null attribute as criteria = 0 (RF-2074). Applied to an excluded
attribute this scores a breach and defeats AC2.

* An attribute that is unavailable — null primary and null fallback (S4), or a Business Email
  parameter where no Business Email was provided (S3) — is **excluded from evaluation, not scored
  as 0**.
* Filtration and Deviation evaluate only attributes that carry a value.
* A value supplied by the AC1 fallback is a normal value and is evaluated as such.

### AC4 — Lexis Nexis Report

| Case | Value shown | Source shown |
|---|---|---|
| Primary field returned | emailAge / email_creation_days value | emailAge / email_creation_days |
| Fallback applied (S1, S2) | firstVerificationDate / first_seen_days value | firstVerificationDate / first_seen_days |
| Unavailable (S3, S4) | Not available | blank — never rendered as 0 |

### Impact Analysis

| Area | Impact |
|---|---|
| **Rule Engine / Strategies** | Null handling changes for Emailage attributes: excluded instead of scored 0. Affects Filtration and Deviation outcomes on every application carrying a null Emailage attribute. Published strategy versions to be re-validated after the change. |
| **Reporting / MIS — Lexis Nexis Report** | New source column alongside the mapped value so a first-seen date is not read as a creation date. Applies to the Lexis Nexis Report in Application Enquiry and Report Enquiry. |
| **Risk Queue / drop points** | Volume falls: applications previously dropped or declined only because Business Email parameters were null are now assessed on Personal Email parameters and no longer drop on that basis alone. |
| **Application data model** | Each mapped Emailage attribute carries which source field supplied it, so the report and the audit trail can both state it. |
| **Audit trail** | The LexisNexis step records when a fallback was applied and for which field. |

### Dependencies

| Ticket | Relationship |
|---|---|
| RF-2074 | Strategies — Lexis Nexis filtration attributes. Holds the null = 0 rule that AC3 changes. Must be aligned in the same release. |
| RF-214 | LexisNexis integration — source of the Emailage field contract mapped in AC1. |
| RF-2018 | Super Portal Report — data-point updates including the Lexis Nexis Report. Coordinate so AC4 does not collide. |
| RF-427 | Lexis Nexis Report implementation — the surface AC4 changes. |
| RF-2764 | CASA US check logic using Lexis Nexis parameters — confirm CASA is covered by the same mapping. |
| RF-2101 | Cancelled bug reporting the same missing fields in the Lexis Nexis Report. Superseded by this story. |

---

## Open with the PO

1. **AC3 (null ≠ 0)** is derived from the bank's AC2 instruction, not separately confirmed by Risk.
   Excluding an attribute from assessment while the engine still scores it 0 is self-cancelling, so
   AC3 is the only reading consistent with AC2 — but Risk should confirm before build.
2. **CASA in scope** — stated per RF-2764 precedent, not confirmed by the bank.
3. **Implementation timeline** — Ayman asked for one on 22 Sep and it is still unanswered.
