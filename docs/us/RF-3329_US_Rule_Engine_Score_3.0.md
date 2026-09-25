# RF-3329 — [AECB] Update for Score 3.0

Jira: https://scvaladdin.atlassian.net/browse/RF-3329 · Story · Medium · **KhoeHD** · **RF Sprint 17**
Rewritten 25 Sep 2026 after harvesting ADIB-8315. Jira description is in sync with this file.
Summary reads `[AECB]` because the PO set it; field labels inside use **ECB** per RF-3061 — see
`docs/pm/ADIB-8315_Harvest_for_RF-3329.md` for the full cross-project comparison.

### Context of Business

Al Etihad Credit Bureau has issued **Consumer Score 3.0**. It splits the consumer score into two segments, each with its own scale and range codes: **Mature** (300 – 850, M0–M9) and **New to Credit** (300 – 650, N0–N9). Score 3.0 is **additive** — the existing range families stay live and unchanged in meaning; the new codes join them.

Two changes follow: the range value list on Rule Engine criteria gains the Score 3.0 codes plus a new **ECB Score Segment** variable, and **ECB Score Range** is added as an attribute in Score Check Management, which today can only test the raw numeric score.

**Precedent:** the same change is built, merged and SIT QC validated on the ADIB platform under [ADIB-8315](https://scvaladdin.atlassian.net/browse/ADIB-8315). Its range tables match this story row for row. The criteria below adopt its master-data, segment-detection and downstream requirements, and its SIT defects are carried into Dependencies as guards.

**Naming:** field labels follow the ECB wording set by [RF-3061](https://scvaladdin.atlassian.net/browse/RF-3061). The attached screens predate that rename and still read “AECB” — confirm the label against the live portal before build.

**Screens** — delivered as a zip for drag-drop: SC1_Consumer_Score_3.0_Mapping.png (source) · SC2_Rule_Engine_Values_Current.png and SC3_Rule_Engine_Values_Score_3.0.png (AC3, current and target) · SC4_Score_Check_Mgmt_Current.jpg and SC5_Score_Check_Mgmt_AECB_Score_Range.png (AC5, current and target). SC3 and SC5 are composites drawn over the real portal captures, not mock-ups.

### User Story Details

Scope: **Rule Engine — Strategies (Segmentation, Filtration, Deviation) — Score Check Management, the Application Enquiry banner and the ECB Report, for Credit Card, Personal Loan and CASA.** Mortgage Loan and Auto Loan tabs are disabled today and are out of scope.

**In-scope scenarios**

* **S1** — A Credit user selects an ECB Score Range value on a Strategy criterion and is offered the Score 3.0 codes alongside the existing families.
* **S2** — A Credit user builds a rule on the new ECB Score Segment variable.
* **S3** — A Credit user adds an ECB Score Range condition to a Score Check Management value set.
* **S4** — An application returns a Score 3.0 range; segment, code and description are derived, displayed and evaluated.
* **S5** — An application returns a legacy range code; behaviour is unchanged.
* **S6** — A range is added, edited or deactivated in the master after go-live, with no code change and no deployment.

**Not in scope**

* Changes to the ECB request or response contract.
* Changes to Limit Assignment boundaries or deviation thresholds.
* Mortgage Loan and Auto Loan, whose Score Check Management tabs are disabled.
* A Bureau Status Check / rejection-list gate. [ADIB-8315](https://scvaladdin.atlassian.net/browse/ADIB-8315) AC3 configures range codes that terminate the flow before the Rule Engine; RF has no equivalent gate on the board, so it is excluded until confirmed to exist.

### AC1 — Score Range master (backend configurable)

* A single Score Range master holds every range code. **Adding, editing or deactivating a range requires no code change and no deployment.**
* The master carries, per code: range code, risk group, descriptive band, segment / score name, min and max score, and an active flag.
* Range codes are never hard-coded in service logic; every consumer reads the master.

**AC1.1 — Day-1 Score 3.0 values.** Both segments are fully contiguous with no gaps or overlaps, so every score in a segment's scale resolves to exactly one code. M-codes are Mature, N-codes are New to Credit.

| **Code** | **Risk Group** | **Band** | **Score range** |
| --- | --- | --- | --- |
| **M0** | Very High Risk | Weak | 300 – 300 |
| **M1** | Very High Risk | Weak | 301 – 523 |
| **M2** | High Risk | Fair | 524 – 673 |
| **M3** | Medium Risk | Good | 674 – 714 |
| **M4** | Medium Risk | Good | 715 – 740 |
| **M5** | Medium Risk | Good | 741 – 755 |
| **M6** | Low Risk | Very Good | 756 – 773 |
| **M7** | Low Risk | Very Good | 774 – 789 |
| **M8** | Very Low Risk | Excellent | 790 – 809 |
| **M9** | Very Low Risk | Excellent | 810 – 850 |
| **N0** | Very High Risk | Weak | 300 – 427 |
| **N1** | Very High Risk | Weak | 428 – 450 |
| **N2** | High Risk | Fair | 451 – 463 |
| **N3** | High Risk | Fair | 464 – 478 |
| **N4** | High Risk | Fair | 479 – 491 |
| **N5** | Medium Risk | Good | 492 – 506 |
| **N6** | Medium Risk | Good | 507 – 519 |
| **N7** | Low Risk | Very Good | 520 – 531 |
| **N8** | Low Risk | Very Good | 532 – 553 |
| **N9** | Low Risk | Very Good | 554 – 650 |

**AC1.2 — Existing families retained, unchanged in meaning.** RF's current range codes are migrated into the same master so all codes live in one place. They keep their present risk groups and remain selectable. **The enumerated list of RF's existing codes is taken from the current production configuration and confirmed with the developer before build** — it is not assumed from the ADIB set, whose families differ.

### AC2 — Segment detection

The segment is derived from the returned range by **exact match against the Score Range master, never by prefix alone**.

| **Returned range** | **Segment / Score Name** |
| --- | --- |
| Two characters, M + digit (M0–M9) | Consumer Score 3.0 — Mature |
| Two characters, N + digit (N0–N9) | Consumer Score 3.0 — New to Credit |
| Any existing family code | Its current score name — unchanged |

* Prefix matching is explicitly prohibited: a single-character legacy **M** is a Very Low Risk code in the existing families, while **M0–M9** is the Mature segment. A startsWith test would classify a legacy Very Low Risk customer as Mature.
* The derived segment is persisted on the application so the banner, the reports and the audit trail all read the same value.
* A range not found in the master does not resolve to a segment and is handled as no value, never defaulted.

### AC3 — Rule Engine criteria value list

* The ECB Score Range criterion is sourced from the AC1 master, so it offers the Score 3.0 codes **in addition to** the existing families — not in place of them.
* Operators are unchanged: **Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty**.
* Strategy versions published before this change keep working untouched, because no existing code is retired or remapped. No migration of published versions is required.
* A code deactivated in the master stops being offered on new or edited strategies but does not break a version that already references it.

_📎 see attached: SC2_Rule_Engine_Values_Current.png (current) · SC3_Rule_Engine_Values_Score_3.0.png (target)_

### AC4 — ECB Score Segment as a Rule Engine variable

A new variable is added to **Segmentation, Filtration and Deviation**:

| **Field** | **Operators** | **Values** |
| --- | --- | --- |
| **ECB Score Segment** | Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty | Dropdown: Mature / New to Credit |

* Without this variable a strategy cannot distinguish the two populations, and their scales end 200 points apart — one shared numeric threshold mis-decisions one of them.
* The value is the segment persisted in AC2.

### AC5 — ECB Score Range in Score Check Management

* **ECB Score Range** is available as an attribute alongside the existing numeric score, on the Credit Card, Personal Loan and CASA tabs.
* Usable in a group's Values conditions under Match All / Match Any, on the same footing as the existing attributes.
* Operators as AC3.
* Added through Edit Attributes so it reaches all groups on the product tab.
* **ECB Score Segment** is available here on the same terms.

_📎 see attached: SC4_Score_Check_Mgmt_Current.jpg (current) · SC5_Score_Check_Mgmt_AECB_Score_Range.png (target)_

### AC6 — Application Enquiry banner

| **Field** | **Current** | **Required** |
| --- | --- | --- |
| ECB Score Range | description only, e.g. “Medium Risk” | code and description, e.g. “M1 – Very High Risk” |
| **ECB Score Segment** | not present | Text: Mature / New to Credit |

* The same banner component serves **Application Enquiry, Credit Queue detail and Termination Queue detail** — all three must reflect the change. [ADIB-8352](https://scvaladdin.atlassian.net/browse/ADIB-8352) is the defect raised when one surface was missed.

### AC7 — ECB Report

* In the Credit Summary block, below the Credit Score, display **Score Range = code – description** as text, e.g. “M9 – Excellent”.
* Star display follows the segment's scale:

| **Stars** | **Mature** | **New to Credit** | **Equivalent risk group** |
| --- | --- | --- | --- |
| 1 | 300 – 523 | 300 – 450 | Very High Risk |
| 2 | 524 – 673 | 451 – 491 | High Risk |
| 3 | 674 – 755 | 492 – 519 | Medium Risk |
| 4 | 756 – 789 | 520 – 650 | Low Risk |
| 5 | 790 – 850 | **NA** | Very Low Risk |

* The star bands align exactly with the risk groups in AC1.1, so the star count is derived from the risk group on the master rather than a second hard-coded band table.
* New to Credit has no 5-star band because it has no Very Low Risk code — see Impact Analysis.

**Consumers of the code, description and segment:** Application Enquiry banner, Credit Queue detail, Termination Queue detail, ECB Report, Rule Engine Result, and the portal reports carrying the score range — enumerate the last with the developer.

### Impact Analysis

| **Area** | **Impact** |
| --- | --- |
| **Rule Engine / Strategies** | Value list sourced from the master and extended with 20 codes; a new ECB Score Segment variable across Segmentation, Filtration and Deviation. Existing published versions keep working unchanged, since nothing is retired or remapped. |
| **Score Check Management** | Two new attributes on Credit Card, Personal Loan and CASA. Existing groups and value sets unchanged; the numeric score condition keeps working. |
| **Master data / configuration** | New backend-configurable Score Range master replacing hard-coded lists. Migration must load the existing families with their present risk groups, and must not place any new code into a rejecting or excluding configuration by default — see [ADIB-8334](https://scvaladdin.atlassian.net/browse/ADIB-8334). |
| **Credit decisioning outcomes** | Granularity moves from the current families to 10 codes per segment, so an application can fall on a different side of a threshold. Published strategies to be re-validated before go-live. |
| **New to Credit applicants** | The scale ends at 650 and the top code N9 is Low Risk / Very Good — there is no Excellent / Very Low Risk code and no 5-star band. Any criterion selecting Very Low Risk, or any numeric threshold above 650, can never be met by a New to Credit applicant. Existing thresholds to be reviewed, which is what AC4 exists to solve. |
| **Reporting / MIS** | Every consumer listed above displays the code, description and segment; historical applications keep the value they were decisioned under. |
| **Audit trail** | The score step records the range code, description and segment. Where an application is rejected on the range, the audit trail state must be written as rejected — [ADIB-8337](https://scvaladdin.atlassian.net/browse/ADIB-8337) was raised when it was not. |

### Dependencies

| **Ticket** | **Relationship** |
| --- | --- |
| [ADIB-8315](https://scvaladdin.atlassian.net/browse/ADIB-8315) | Same change on the ADIB platform, SIT QC validated. Reference implementation for AC1, AC2, AC6 and AC7. |
| [ADIB-8334](https://scvaladdin.atlassian.net/browse/ADIB-8334) | Guard: new codes defaulted into a rejecting configuration and every application was rejected. Verify the migration's default state. |
| [ADIB-8337](https://scvaladdin.atlassian.net/browse/ADIB-8337) | Guard: audit trail not written as rejected on a score-range rejection. |
| [ADIB-8352](https://scvaladdin.atlassian.net/browse/ADIB-8352) | Guard: banner change shipped on some surfaces but not all. |
| [ADIB-8344](https://scvaladdin.atlassian.net/browse/ADIB-8344) | Guard: a downstream report missed the new score name. |
| [RF-3091](https://scvaladdin.atlassian.net/browse/RF-3091) | Migration of RF EFR and ECB to MarketPlace, in development — decides where the Score Range master lives. Must be settled before AC1 is built. |
| [RF-3061](https://scvaladdin.atlassian.net/browse/RF-3061) | Portal wording changed from AECB to ECB — the source of this story's field labels. Confirm against the live portal before build. |
| [RF-2074](https://scvaladdin.atlassian.net/browse/RF-2074) | Strategies attribute list — the new attributes sit alongside the Lexis Nexis attributes changed there. |
| [RF-2880](https://scvaladdin.atlassian.net/browse/RF-2880) | Score Check Management screen — the surface AC5 changes. |
| [RF-1333](https://scvaladdin.atlassian.net/browse/RF-1333) | Credit Queue display of the score range field — changes under AC6. |
