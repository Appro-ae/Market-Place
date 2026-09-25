# ADIB-8315 → RF-3329 · cross-project harvest

**Source:** https://scvaladdin.atlassian.net/browse/ADIB-8315 — *ADIB | AECB Consumer Score 3.0 |
Configurable Score Range master (Mature M0-M9 / New to Credit N0-N9), Rejection List, Application
Enquiry Banner & AECB Report*
Story · created 17 Sep 2026 by Aman Khanna · assignee Luu Truong Ta · **SIT QC VALIDATED** ·
approved by Shwetha Ramesh 18 Sep · PRs merged across 6 services.

**Target:** https://scvaladdin.atlassian.net/browse/RF-3329 — `[AECB] Update for Score 3.0`
(renamed by the PO 25 Sep 07:42; description not modified since our 24 Sep write).

ADIB has already **built, merged and SIT-validated** the same AECB change, and found five bugs
doing it. That is a free dress rehearsal for RF.

---

## 1. Independently confirms our mapping

ADIB AC1.1/AC1.2 lists the same 20 codes with the same risk groups we read off the AECB table for
RF-3329 AC1 — **M0–M9 and N0–N9 match row for row, zero discrepancies.** Two teams reading the
same source arrived at the same mapping, so AC1 can be treated as settled.

ADIB also confirms the scales: Mature 300–850, New to Credit 300–650.

## 2. Confirms the New-to-Credit ceiling finding

We flagged that New to Credit has no Excellent / Very Low Risk band. ADIB's AC5 star table says it
outright:

| Stars | Mature | New to Credit |
|---|---|---|
| 1 | 300–523 | 300–450 |
| 2 | 524–673 | 451–491 |
| 3 | 674–755 | 492–519 |
| 4 | 756–789 | 520–650 |
| 5 | 790–850 | **NA** |

A New-to-Credit customer can never reach 5 stars. Same structural gap, independently reached.

---

## 3. ⚠️ Contradicts RF-3329 AC2 — legacy codes are RETAINED, not retired

RF-3329 AC2 currently says:

> *"The superseded values are not selectable on a new or edited strategy once Score 3.0 is live."*

ADIB AC1.3 says the opposite — the legacy families are **migrated into the same master table and
kept, unchanged in meaning**, so every range code lives in one place:

| Range codes | Risk group |
|---|---|
| A, B | Very High Risk |
| C, D | High Risk |
| E, F, G | Medium Risk |
| H, I, J | Low Risk |
| K, L, M | Very Low Risk |
| 1 · 2 · 3 · 4 · 5 | Very High → Very Low Risk |
| A1 · A2 · A3 · A4 · A5 | Very High → Very Low Risk |

Score 3.0 is **additive**, not a replacement. That also answers our open question about the
old-to-new mapping: there is no mapping to define, because nothing is remapped.

**Action: RF-3329 AC2 needs rewriting.** It currently specifies behaviour ADIB has already
rejected in production code.

### 3a. The `M` collision — a real trap

ADIB AC2 derives the segment by **exact match against the master, explicitly "not by
prefix-sniffing alone"**. The reason is visible in AC1.3: single-character **`M` is a legacy Very
Low Risk code**, while `M0`–`M9` is the new Mature segment. A naive `startsWith("M")` marks a
legacy Very Low Risk customer as Mature.

| Pattern | Segment / Score Name |
|---|---|
| `M` + digit (`M0`–`M9`) | Consumer Score 3.0 — Mature |
| `N` + digit (`N0`–`N9`) | Consumer Score 3.0 — New to Credit |
| single char `A`–`M` | Consumer (existing) |
| single digit `1`–`5` | Consumer No Hit (existing) |
| `A1`–`A5` | Consumer Score — Alternative Data (existing) |

Note ADIB AC4.2 says *"System will identify Mature or New to Credit based on 1st Character of
Range"* — which contradicts its own AC2. ADIB has an internal inconsistency here; RF should take
the AC2 exact-match rule and not repeat AC4.2's wording.

---

## 4. What RF-3329 is missing — ranked by value

| # | Bring back | Why it matters for RF | In RF-3329 today |
|---|---|---|---|
| 1 | **`AECB Score Segment` as a new Rule Engine variable** — Segment, Filtration and Deviation, dropdown `Mature` / `New to Credit` | Without it a strategy cannot treat the two segments differently. Given NTC tops out at 650 against Mature's 850, one shared threshold silently mis-decisions one of the two populations. This is the single biggest gap. | ❌ absent |
| 2 | **Score Range master as backend-configurable data** — "adding, editing or deactivating a range must require no code change and no deployment" | RF-3329 says only that the system "holds" the mapping. AECB will revise again; config-driven means no release next time. | ⚠️ implied, not required |
| 3 | **Legacy families retained in the same master** (§3) | Corrects an AC that is currently wrong. | ❌ contradicts |
| 4 | **Exact-match segment detection** (§3a) | Answers our open question and avoids the `M` collision. | ❌ absent |
| 5 | **Six operators, not two** — Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty | RF-3329 AC2/AC3 name only *Is in / Is not in*. Understated. | ⚠️ understated |
| 6 | **Banner shows `code - description`** — `E- Medium Risk` → `M1 - Very High Risk`, plus a new `AECB Score Segment` field. One component serves Application Enquiry, Credit Queue detail and Termination Queue detail. | RF has the same three surfaces and already displays AECB Score Range (RF-1333). | ❌ absent |
| 7 | **AECB Report: Score Range as text in Credit Summary + star-display bands** | RF has an AECB Report (RF-270 family). | ❌ absent |
| 8 | **Wider legacy code set** — `F1`–`F5`, `CA`–`CM`, `PA`–`PM`, `I0`–`I9`, `P1`–`P5` beyond `A`–`M`, `1`–`5`, `A1`–`A5` | RF's own legacy set needs confirming against this. | ❌ absent |
| 9 | **Downstream consumer checklist** — Credit Analysis Report, E2E Report, MIS Report, Termination Queue detail, Credit Queue detail | RF-3329 says "Reporting / MIS" generically. | ⚠️ generic |

## 5. Five SIT bugs — pre-emptive warnings

ADIB's linked defects are exactly what RF will hit.

| Bug | What happened | Guard for RF |
|---|---|---|
| **ADIB-8334** | *"All configuration are updated as 'No Status Obtained', and due to this incorrect config all applications are getting rejected as Rejected due to Score Range M2 - High Risk"* | **The worst one.** The new M/N codes landed in the rejection list by default and rejected every application. Any RF migration must default new codes to *eligible*, and the cutover needs an explicit config check. |
| ADIB-8337 | Application status rejected but audit trail not updated to rejected | Audit trail must be written on score-range rejection — ties to our Audit trail impact row. |
| ADIB-8343 | Rule engine results displayed twice in the CAM report | Report regression from the same change. |
| ADIB-8344 | AECB Score Name missing from the End-to-End report | Downstream consumers need explicit test coverage. |
| ADIB-8352 | Score range description and Score Segment label/value missing from the AIP banner | Banner change is easy to half-ship across products. |

## 6. What does NOT carry over

* **Products differ.** ADIB covers Covered Card, Home Finance and BNPL; RF is Credit Card,
  Personal Loan and CASA. The product list is not transferable.
* **AC3 rejection list / `Bureau Status Check`.** ADIB terminates the flow and redirects to a
  Termination Screen with failed-reason codes RES108 (HF), RES109 (CVC), RES227 (Pay Later).
  **Unconfirmed whether RF has an equivalent Bureau Status Check gate** — needs checking before
  any of AC3 is copied.
* **ADIB's field name** `aecbScoreSegment` and its API shape are ADIB services; RF's equivalent
  must be confirmed against RF's own backoffice service.

## 7. Two RF-specific flags

1. **AECB vs ECB wording.** RF-3061 *"Change all the AECB wording into ECB in portal"* is SIT
   TESTING COMPLETED, yet the PO's Score Check Management capture still reads **AECB Score**.
   RF-3329 uses "AECB" throughout, matching the capture. Worth confirming which label is correct
   for RF before build, so the story does not re-introduce retired wording.
2. **RF-3091 `[MarketPlace] Migrate RF EFR and AECB to MarketPlace`** is DEV IN PROGRESS. If RF's
   AECB integration is moving to MarketPlace, that decides *where* the Score Range master lives.
   This is a live dependency RF-3329 does not yet name.

---

## Recommendation

Fold items 1–5 and 8–9 into RF-3329 — they are corrections and gaps, not scope creep, and ADIB has
already paid to prove them. Items 6–7 (banner, AECB Report) are genuinely new surfaces for RF: they
belong in RF-3329 only if the PO wants one story, otherwise a sibling ticket.

Hold AC3 (rejection list) until RF's Bureau Status Check is confirmed to exist.
