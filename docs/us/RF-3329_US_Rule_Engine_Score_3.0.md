### Context of Business

Al Etihad Credit Bureau has issued **Consumer Score 3.0**, which replaces the risk-group scale the Rule Engine uses today. Score 3.0 splits into two segments — **Mature** (scale 300 – 850, codes M0–M9) and **New to Credit** (scale 300 – 650, codes N0–N9) — each code carrying a risk group, a descriptive band and a score range.

Two changes follow. The range value list offered on Rule Engine criteria is extended with the Score 3.0 codes and a new **AECB Score Segment** variable, and **AECB Score Range** is added as an attribute in Score Check Management, which today can only test the raw **AECB Score** as a number.

[📎 Message Gateway and A2A Online Connectivity_v9.3_E.pdf](https://scvaladdin.atlassian.net/rest/api/3/attachment/content/135597)

**Naming:** this story and the attached screens read **AECB**. [RF-3061](https://scvaladdin.atlassian.net/browse/RF-3061) changed the portal wording to ECB — confirm the label against the live portal before build.

### User Story Details

Scope: **Rule Engine — Strategies (Segmentation, Filtration, Deviation), Score Check Management, the Application Enquiry banner and the AECB Report, for the products where Score Check Management is enabled: Credit Card, Personal Loan and CASA.** Mortgage Loan and Auto Loan tabs are disabled today and are out of scope.

**In-scope scenarios**

* **S1** — A Credit user selects an AECB Score Range value on a Strategy criterion and is offered the Score 3.0 codes.
* **S2** — A Credit user builds a rule on the new AECB Score Segment variable.
* **S3** — A Credit user adds an AECB Score Range condition to a Score Check Management value set.
* **S4** — An application returns a Score 3.0 range; segment, code and description are derived, displayed and evaluated.
* **S5** — An application returns a legacy range code; behaviour is unchanged.
* **S6** — A range is added, edited or deactivated in the master after go-live, with no code change and no deployment.

**Not in scope**

* Changes to the AECB request or response contract.
* Changes to Limit Assignment boundaries or deviation thresholds.
* Mortgage Loan and Auto Loan, whose Score Check Management tabs are disabled.

### AC1 — Score Range master (backend configurable)

* A single Score Range master holds every range code. **Adding, editing or deactivating a range requires no code change and no deployment.**
* The master carries, per code: range code, risk group, descriptive band, segment / score name, min and max score, and an active flag.
* Range codes are never hard-coded in service logic; every consumer reads the master.

**AC1.1 — Day-1 Score 3.0 values.** Both segments are fully contiguous with no gaps or overlaps, so every score in a segment's scale resolves to exactly one code. M-codes are Mature, N-codes are New to Credit.

![image-20260925-035454.png](https://scvaladdin.atlassian.net/rest/api/3/attachment/content/135598)

| **Segment** | **Code** | **Risk Group** | **Band** | **Min Score** | **Max Score** |
| --- | --- | --- | --- | --- | --- |
| Mature | **M0** | Very High Risk | Weak | 300 | 300 |
| Mature | **M1** | Very High Risk | Weak | 301 | 523 |
| Mature | **M2** | High Risk | Fair | 524 | 673 |
| Mature | **M3** | Medium Risk | Good | 674 | 714 |
| Mature | **M4** | Medium Risk | Good | 715 | 740 |
| Mature | **M5** | Medium Risk | Good | 741 | 755 |
| Mature | **M6** | Low Risk | Very Good | 756 | 773 |
| Mature | **M7** | Low Risk | Very Good | 774 | 789 |
| Mature | **M8** | Very Low Risk | Excellent | 790 | 809 |
| Mature | **M9** | Very Low Risk | Excellent | 810 | 850 |
| New to Credit | **N0** | Very High Risk | Weak | 300 | 427 |
| New to Credit | **N1** | Very High Risk | Weak | 428 | 450 |
| New to Credit | **N2** | High Risk | Fair | 451 | 463 |
| New to Credit | **N3** | High Risk | Fair | 464 | 478 |
| New to Credit | **N4** | High Risk | Fair | 479 | 491 |
| New to Credit | **N5** | Medium Risk | Good | 492 | 506 |
| New to Credit | **N6** | Medium Risk | Good | 507 | 519 |
| New to Credit | **N7** | Low Risk | Very Good | 520 | 531 |
| New to Credit | **N8** | Low Risk | Very Good | 532 | 553 |
| New to Credit | **N9** | Low Risk | Very Good | 554 | 650 |

* A value is displayed as its code and risk group, for example **M0 – Very High Risk**, matching the existing "code – risk group" pattern in the criteria list.
* The Mature scale runs 300 – 850 and the New to Credit scale runs 300 – 650. A score is resolved against the scale of the segment the applicant falls into.
* A score outside a segment's scale, or a missing score, does not resolve to a code and is handled as no value rather than defaulting to the lowest band.

**AC1.2 — Existing families retained, unchanged in meaning.** RF's current range codes are migrated into the same master so all codes live in one place. They keep their present risk groups and remain selectable. **The enumerated list of RF's existing codes is taken from the current production configuration and confirmed with the developer before build.**

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

* The AECB Score Range criterion is sourced from the AC1 master, so it offers the Score 3.0 codes **in addition to** the existing families — not in place of them.
* Operators are unchanged: **Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty**.
* Strategy versions published before this change keep working untouched, because no existing code is retired or remapped. No migration of published versions is required.
* A code deactivated in the master stops being offered on new or edited strategies but does not break a version that already references it.

![SC3_Rule_Engine_Values_Score_3.0.png](https://scvaladdin.atlassian.net/rest/api/3/attachment/content/135596)

### AC4 — AECB Score Segment as a Rule Engine variable

A new variable is added to **Segmentation, Filtration and Deviation**:

| **Field** | **Operators** | **Values** |
| --- | --- | --- |
| **AECB Score Segment** | Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty | Dropdown: Mature / New to Credit |

* Without this variable a strategy cannot distinguish the two populations, and their scales end 200 points apart — one shared numeric threshold mis-decisions one of them.
* The value is the segment persisted in AC2.

### AC5 — AECB Score Range in Score Check Management

* **AECB Score Range** is available as an attribute alongside the existing numeric **AECB Score**, on the Credit Card, Personal Loan and CASA tabs.
* Usable in a group's Values conditions under Match All / Match Any, on the same footing as the existing attributes.
* Operators as AC3.
* Added through Edit Attributes so it reaches all groups on the product tab.
* **AECB Score Segment** is available here on the same terms.

![SC4_Score_Check_Mgmt_Current.jpg](https://scvaladdin.atlassian.net/rest/api/3/attachment/content/135595)

### AC6 — Application Enquiry banner

| **Field** | **Current** | **Required** |
| --- | --- | --- |
| AECB Score Range | description only, e.g. "Medium Risk" | code and description, e.g. "M1 – Very High Risk" |
| **AECB Score Segment** | not present | Text: Mature / New to Credit |

* The same banner component serves **Application Enquiry, Credit Queue detail and Termination Queue detail** — all three must reflect the change, verified on each surface before sign-off.

### AC7 — AECB Report

* In the Credit Summary block, below the Credit Score, display **Score Range = code – description** as text, e.g. "M9 – Excellent".
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

**Consumers of the code, description and segment:** Application Enquiry banner, Credit Queue detail, Termination Queue detail, AECB Report, Rule Engine Result, and the portal reports carrying the score range — enumerate the last with the developer.

### Impact Analysis

| **Area** | **Impact** |
| --- | --- |
| **Rule Engine / Strategies** | Value list sourced from the master and extended with 20 codes; a new AECB Score Segment variable across Segmentation, Filtration and Deviation. Existing published versions keep working unchanged, since nothing is retired or remapped. |
| **Score Check Management** | Two new attributes on Credit Card, Personal Loan and CASA. Existing groups and value sets unchanged; the numeric AECB Score condition keeps working. |
| **Master data / configuration** | New backend-configurable Score Range master replacing hard-coded lists. Migration must load the existing families with their present risk groups, and must not place any new code into a rejecting or excluding configuration by default. |
| **Credit decisioning outcomes** | Granularity moves from the current families to 10 codes per segment, so an application can fall on a different side of a threshold. Published strategies to be re-validated before go-live. |
| **New to Credit applicants** | The scale ends at 650 and the top code N9 is Low Risk / Very Good — there is no Excellent / Very Low Risk code and no 5-star band. Any criterion selecting Very Low Risk, or any numeric AECB Score threshold above 650, can never be met by a New to Credit applicant. Existing thresholds to be reviewed, which is what AC4 exists to solve. |
| **Reporting / MIS** | Every consumer listed above displays the code, description and segment; historical applications keep the value they were decisioned under. |
| **Audit trail** | The score step records the range code, description and segment. Where an application is rejected on the range, the audit trail state is written as rejected. |
