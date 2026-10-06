# 06 — PO Playbook: Working with CBS APIs

How a Product Owner turns a CBS API into delivered value. Every problem follows one method:

**Rationale → Business base → Hypothesis → Experiment → Conclusion and improvement**

## 1. Discovery: 20 questions before writing a single story

**Ownership and scope**
1. Which system is the system of record for each data element in scope?
2. Native CBS API or middleware composite? Who owns each layer (team, vendor)?
3. What is the change lead time for a new or changed API (sprint, release, vendor roadmap)?
4. Which CBS version or release is live? Which one is in the test environments? (They often differ.)

**Behaviour**
5. Sync or async? How is the final outcome confirmed?
6. Idempotency supported? On which key, and for how long?
7. What happens during EOD / maintenance? Exact window times?
8. Business date vs system date: which one does the API return?
9. Which balance does each API return or check (ledger, available)?
10. Reversal rules: same-day, cross-day, who triggers them?

**Data and rules**
11. Field-level validations and code lists (ID types, purpose codes, status codes)?
12. Dedup logic for party creation?
13. Maker-checker or approval steps inside the core?
14. Product parameters: configurable, or code change?

**Quality and operations**
15. Error-code catalogue and its mapping to channel messages?
16. NFRs: measured p95 latency and peak TPS, not brochure numbers?
17. Events emitted: which ones, what schema, ordering guarantees?
18. Sandbox: realistic data? Parity with production?
19. Reconciliation: how do channel, core and GL tie out daily?
20. Audit and regulatory: what must be logged and retained, and for how long?

## 2. API user story template

```
Title: [Verb] [object] via CBS API — [channel/context]

As a <persona / consuming system>
I want <capability>
So that <business outcome, measurable>

Context
- CBS API: <name / endpoint / version>  | Native or composite: <…>
- System of record: <…>  | BIAN domain: <…>
- Upstream / downstream: <…>

Acceptance criteria (Given / When / Then)
AC1 Happy path
AC2 Validation failure (field-level)
AC3 Business rule failure (e.g. account frozen, insufficient available balance)
AC4 Duplicate request (same idempotency key)
AC5 Timeout / unknown outcome → status enquiry
AC6 EOD / maintenance window behaviour
AC7 Audit log written with correlation-id

NFRs: p95 latency <x> ms · peak <y> TPS · availability <z>
Error mapping: link to the error-code table
Out of scope: <…>
Open questions: <…>
```

## 3. Worked example: "Open CASA for eKYC-onboarded customer"

| Step | Content |
|---|---|
| **Rationale** | Customers finish eKYC in ~5 min, then wait for a back-office team to open the account manually. Drop-off happens in that gap |
| **Business base** | Regulatory: the account may be opened only after the KYC/CDD requirements of the local regulator are met. Cite the exact local rule, don't assume it. Market practice: digital banks issue an IBAN in-session after eKYC. Verify with 2–3 named competitor journeys (screen recordings, app store reviews) |
| **Hypothesis** | H1: Real-time CIF and CASA creation via CBS API, right after eKYC, raises onboarding completion from X% to Y%, with no increase in duplicate CIFs or KYC exceptions |
| **Experiment** | A/B or phased rollout: 20% of traffic on real-time API vs manual. Measure: completion rate, time to IBAN, duplicate-CIF rate, API error rate by code, ops tickets. Fix the sample size and duration up front |
| **Conclusion and improvement** | Accept or reject H1 against pre-set thresholds. Typical improvements: tighter dedup rule, restricted-activation status, error-message rewrite for the top 3 business errors |

## 4. Reviewing a vendor API catalogue: scoring matrix

| Criterion | Weight | Score 1–5 | Evidence required |
|---|---|---|---|
| Coverage of in-scope domains (`02-api-domain-map.md`) | 25% | | Endpoint list mapped to domains |
| Real-time capability (no EOD blocking) | 15% | | Architecture doc + test |
| Standards alignment (OpenAPI, ISO 20022, BIAN) | 10% | | Spec files |
| Idempotency and error model quality | 15% | | Spec + sandbox test |
| Events / streaming | 10% | | Event catalogue |
| Developer experience (portal, sandbox, docs) | 10% | | Hands-on trial |
| Measured NFRs | 15% | | Performance test report, reference client |

The weights are a starting proposal. Adjust them to the business case and record why.

## 5. Common failure modes (and the story that prevents them)

| Failure | Root cause | Preventive story/AC |
|---|---|---|
| Customer charged twice | No idempotency on retry | AC4 on every money-movement story |
| "Failed" shown, but money moved | Timeout treated as failure | AC5 + status enquiry API |
| Balance mismatch app vs statement | Ledger vs available confusion | Specify the balance type per screen |
| Weekend/holiday defects | Business calendar ignored | Value-date and holiday ACs |
| Night-time outage complaints | EOD window not designed | AC6 + customer messaging |
| Duplicate CIFs | Weak dedup | Dedup rule story with test data set |
| Integration slips by months | Vendor change lead time not known | Discovery Q3 answered before roadmap commit |
| Recon breaks with finance | GL posting timing unknown | Recon story with finance as stakeholder |

## 6. Interview-ready framing (for career narrative)

When describing CBS API experience, quantify along the same chain:
- **Scope:** which domains (party, CASA, payments…), which core, native vs middleware.
- **Decision you owned:** e.g. sync vs async, dedup rule, restricted activation.
- **Evidence:** the metric moved (completion %, time to account, error rate, ops tickets).
- **Risk handled:** idempotency, EOD, reconciliation, regulatory sign-off.
