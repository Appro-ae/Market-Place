# 02 — CBS API Domain Map

A vendor-neutral catalogue of what a core banking API surface normally covers. Use it as a checklist when reviewing a vendor's catalogue, or when writing the scope of an integration epic.

Naming is generic. Map each row to the vendor's actual API name (Temenos, Finacle, Mambu, etc.) and to the closest BIAN service domain (see `04-standards-and-regulation.md`).

## 1. Domain catalogue

| # | Domain | Typical operations | Key fields / rules | PO watch-outs |
|---|---|---|---|---|
| 1 | **Party / Customer (CIF)** | Create, update, retrieve, search, dedup check, link relationships, change status | Legal name, ID type/number, DOB, nationality, residency, contact, segment, KYC status and expiry, risk rating, FATCA/CRS flags | Dedup key definition. Who owns KYC status (onboarding vs CBS)? Maker-checker on update? |
| 2 | **Product catalogue** | List products, get product conditions, eligibility | Product code, currency, rate tiers, fees, min balance | Is the catalogue exposed or hard-coded in channels? Hard-coding breaks with every product launch |
| 3 | **Account — CASA** (current and savings) | Open, retrieve, update, block/unblock, close, change status (dormant, frozen), add joint holder | Account no./IBAN, product code, currency, branch, status, mandate | IBAN generation owner. Account status lifecycle. Closure rules (zero balance, pending holds) |
| 4 | **Balances** | Get balances (ledger, available, holds) | Balance type, as-of timestamp, currency | Real-time vs cached? See `01-fundamentals.md` §3 |
| 5 | **Transactions / statements** | List transactions (paged, filtered), get transaction details, statement PDF | Booking date, value date, amount, direction, narrative, reference, running balance | Pagination model, history depth online vs archive, narrative quality (customers read it) |
| 6 | **Holds / earmarks / liens** | Create, amend, release, list | Amount, reason code, expiry, reference | Auto-expiry behaviour. Who can release? |
| 7 | **Internal transfers / postings** | Account-to-account (same bank), generic debit/credit posting, reversal | Debit/credit account, amount, currency, value date, idempotency key, narrative, charge code | Idempotency. Reversal vs new correcting entry. FX rate source |
| 8 | **Payments (outbound/inbound)** | Initiate domestic/cross-border, get status, inbound credit | ISO 20022 fields, purpose code, beneficiary, charges (OUR/SHA/BEN) | Usually a **payment hub** sits between CBS and the scheme. The CBS only debits/credits |
| 9 | **Term deposits** | Quote, open, retrieve, premature withdrawal quote, close, rollover instruction | Tenor, rate, maturity instruction, penalty | Quote vs book are separate calls. Rate validity window |
| 10 | **Lending** | Create loan (often from a LOS), disburse, repayment schedule, repay, early settlement quote, restructure | Principal, rate, tenor, schedule type, collateral link | Origination (LOS) vs servicing (CBS) split. Islamic finance structures differ (Murabaha, Ijara) |
| 11 | **Limits and collateral** | Create/update limit, utilisation, collateral link | Limit type, amount, expiry, linked accounts | Limits often live in a separate module, with a different API family |
| 12 | **Fees and charges** | Calculate, apply, waive | Charge code, amount, waiver reason | Waiver authority (maker-checker) |
| 13 | **Interest** | Get accrued interest, rate change | Accrual basis (ACT/360, ACT/365), tiering | Accrual timing (EOD) |
| 14 | **Reference data** | Branches, currencies, FX rates, holidays, codes | — | Cache strategy and ownership |
| 15 | **GL / accounting** | Post GL entries, retrieve GL balances | GL code, cost centre | Rarely exposed to channels. Finance-owned |
| 16 | **Events / notifications** | Subscribe: account opened, transaction posted, balance changed, status changed | Event type, payload version, sequence | Ordering, replay, at-least-once delivery means consumers must dedupe |

## 2. Worked flow — digital onboarding to funded account

Built for onboarding/eKYC projects. Each arrow is a decision point the PO must specify.

```
Onboarding app        Orchestrator             Core Banking              Others
──────────────        ────────────             ────────────              ──────
eKYC passed ─────────▶ 1. Dedup check ────────▶ Party search (ID no.)
                       │  match? ──yes──▶ reuse CIF / route to manual review
                       ▼ no
                       2. Create party ───────▶ Create CIF ──────────▶ event: party.created ─▶ CRM, AML screening
                       ▼
                       3. Open account ───────▶ Create CASA (product X) ─▶ IBAN generated
                       ▼
                       4. Set status / limits ▶ Account active OR "debit block until docs verified"
                       ▼
                       5. Funding ────────────▶ Inbound credit / internal transfer
                       ▼
App shows IBAN ◀────── 6. Return account + balances
```

Decisions to document:

| Step | Decision | Options |
|---|---|---|
| 1 | Dedup match rule | Exact ID no. / ID + DOB / fuzzy name. Who resolves a partial match? |
| 2 | Partial failure | CIF created but account fails: retry, compensate (close CIF), or leave for ops? |
| 2 | KYC data ownership | Push full KYC to CBS, or reference ID only |
| 3 | Product selection | Hard-coded vs catalogue-driven |
| 4 | Restricted activation | Allow credits only until risk-based checks complete? |
| All | Idempotency | Retry of step 2 must not create a second CIF |

## 3. API review checklist (per endpoint)

- [ ] System of record confirmed for every field
- [ ] Native CBS API or a middleware composite?
- [ ] Synchronous or asynchronous? If async, how does the caller learn the outcome (callback, event, poll)?
- [ ] Idempotency key supported? Duplicate behaviour defined?
- [ ] Error codes listed (business vs technical), with retry guidance
- [ ] Behaviour during EOD / maintenance windows
- [ ] Field-level validation rules (length, format, code lists)
- [ ] Auth model and scopes. Maker-checker needed?
- [ ] NFRs: p95 latency, TPS, availability, payload size limits
- [ ] Versioning and deprecation policy
- [ ] Audit trail: who, what, when, from which channel
- [ ] Sandbox data available and realistic?
