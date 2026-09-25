# RF-3329 — [AECB] Update for Score 3.0

> Mirrors the live ticket as edited by the PO at **25 Sep 2026, 08:29**, plus the
> AC4 screen reference pending drag-drop. Not pushed to Jira: the PO's inline
> images are file attachments, and round-tripping them through the connector's
> markdown converter risks destroying them. Description edits are hers to make.
>
> **Open:** the story now reads **AECB** in AC1–AC4 and the scenarios, and
> **ECB** in AC5–AC7. Same field, two labels. Pick one before handover.

---

### Context of Business

Al Etihad Credit Bureau has issued **Consumer Score 3.0**, which replaces the risk-group scale the Rule Engine uses today. Score 3.0 splits into two segments — **Mature** (scale 300 – 850, codes M0–M9) and **New to Credit** (scale 300 – 650, codes N0–N9) — each code carrying a risk group, a descriptive band and a score range.

Two changes follow. The range value list offered on Rule Engine criteria is extended with the Score 3.0 codes and a new **AECB Score Segment** variable, and **AECB Score Range** is added as an attribute in Score Check Management, which today can only test the raw **AECB Score** as a number.

📎 Message Gateway and A2A Online Connectivity_v9.3_E.pdf

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

*📎 SC1_Consumer_Score_3.0_Mapping.png (attached, width 984)*

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

**AC1.2 — Existing families retained, unchanged in meaning.** RF's current range codes are migrated into the same master so all codes live in one place. They keep their present risk groups and remain selectable. **The enumerated list of RF's existing codes is taken from the current production configuration and confirmed with the developer before build.**

### AC2 — Segment detection

The application's score segment is derived from `NAE_RES/Response/Score/Data/Range` by **exact match against the Score Range master (AC1)**,

| **Score Range** | **Segment / Score Name** |
| --- | --- |
| Two characters, M + digit (M0–M9) | Consumer Score 3.0 — Mature |
| Two characters, N + digit (N0–N9) | Consumer Score 3.0 — New to Credit |
| Any existing family code | Its current score name — unchanged |

* Prefix matching is explicitly prohibited: a single-character legacy **M** is a Very Low Risk code in the existing families, while **M0–M9** is the Mature segment. A startsWith test would classify a legacy Very Low Risk customer as Mature.

### AC3 — Rule Engine criteria value list

* The AECB Score Range criterion is sourced from the AC1 master, so it offers the Score 3.0 codes **in addition to** the existing families — not in place of them.
* Operators are unchanged: **Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty**.
* Strategy versions published before this change keep working untouched, because no existing code is retired or remapped. No migration of published versions is required.
* A code deactivated in the master stops being offered on new or edited strategies but does not break a version that already references it.

*📎 SC3_Rule_Engine_Values_Score_3.0.png (attached, width 438)*

### AC4 — AECB Score Segment as a Rule Engine variable

A new variable is added to **Segmentation, Filtration and Deviation**:

| **Field** | **Operators** | **Values** |
| --- | --- | --- |
| **AECB Score Segment** | Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty | Dropdown: Mature / New to Credit |

* Without this variable a strategy cannot distinguish the two populations, and their scales end 200 points apart — one shared numeric threshold mis-decisions one of them.
* The value is the segment persisted in AC2.

*📎 SC6_Rule_Engine_AECB_Score_Segment.png — **to attach**. Composite over the
real criteria screen: the chip reads `AECB Score Segment` in place of
`AECB Score Range`, and the value list offers only Mature / New to Credit.*

### AC5 — ECB Score Range in Score Check Management

* **ECB Score Range** is available as an attribute alongside the existing numeric **ECB Score**, on the Credit Card, Personal Loan and CASA tabs.
* Usable in a group's Values conditions under Match All / Match Any, on the same footing as the existing attributes.
* Operators as AC3.
* Added through Edit Attributes so it reaches all groups on the product tab.
* **ECB Score Segment** is available here on the same terms.

*📎 SC5_Score_Check_Mgmt_AECB_Score_Range.png (attached, width 1000)*

### AC6 — Application Enquiry banner

| **Field** | **Current** | **Required** |
| --- | --- | --- |
| ECB Score Range | description only, e.g. "Medium Risk" | code and description, e.g. "M1 – Very High Risk" |
| **ECB Score Segment** | not present | Text: Mature / New to Credit |

* The same banner component serves **Application Enquiry, Credit Queue detail and Termination Queue detail** — all three must reflect the change, verified on each surface before sign-off.

### AC7 — ECB Report

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
* New to Credit has no 5-star band because it has no Very Low Risk code.

**Consumers of the code, description and segment:** Application Enquiry banner, Credit Queue detail, Termination Queue detail, ECB Report, Rule Engine Result, and the portal reports carrying the score range — enumerate the last with the developer.

---

## PO edits absorbed on 25 Sep (08:27 and 08:29)

| Change | Effect |
|---|---|
| `NAE_RES/Response/Score/Data/Range` named in AC2 | The response path is now explicit — the developer no longer has to infer the source field. |
| Naming paragraph removed | The AECB→ECB pre-build check is gone from the ticket; it survives only here. |
| Impact Analysis section removed | The NTC-ceiling finding (no Very Low Risk band above 650) is now stated only inside AC7's note. The thresholds-to-review action has no home. |
| Edge-case bullets removed from AC1.1 and AC2 | Out-of-scale score, missing score, range-not-in-master and segment persistence are no longer specified. Default behaviour is now the developer's call. |
| AC5–AC7 relabelled ECB, AC1–AC4 left AECB | Same field, two labels in one story. |
