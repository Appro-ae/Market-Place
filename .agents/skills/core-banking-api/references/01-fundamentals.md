# 01 — Core Banking Fundamentals (what sits behind the API)

You cannot judge a CBS API without knowing the engine behind it. Every API call is a request to change, or read, one of five things: **party, product, account, position, ledger**.

## 1. What a core banking system is

The system of record for a bank's customers, products, accounts and money positions. It is the only system allowed to say "this balance is true". Everything else (mobile app, CRM, onboarding, cards, payment hubs) is a channel or satellite that reads from it or posts to it.

| Owns (system of record) | Usually does NOT own |
|---|---|
| Customer master / CIF (Customer Information File) | Digital onboarding UX, eKYC, liveness, OCR |
| Product definitions (product factory) | CRM, campaigns, lead management |
| Accounts: CASA, term deposits, loans | Card authorisation (card management system) |
| Balances, holds, interest, fees, charges | Payment scheme connectivity (payment hub / switch) |
| Transaction posting and the general ledger (GL) feed | AML transaction monitoring, fraud scoring |
| End-of-day (EOD) processing: accruals, capitalisation, ageing | Data warehouse, regulatory reporting (fed by CBS) |

Boundaries move by bank and vendor. **First question on any project: "Which system is the system of record for this data element?"**

## 2. The core data model

```
PARTY (CIF)  ──owns──▶  ARRANGEMENT / ACCOUNT  ──instance of──▶  PRODUCT
    │                        │
    │                        ├── balances (ledger, available, hold)
    │                        ├── conditions (rate, fees, limits)
    │                        └── transactions ──posts──▶  GL (chart of accounts)
    └── relationships (joint holder, guarantor, signatory, UBO)
```

| Concept | What it means | Why the PO cares |
|---|---|---|
| **Party / CIF** | Unique customer record. One person = one CIF (in theory) | Duplicate CIFs break KYC, limits and exposure. Dedup rules are a core API requirement |
| **Product** | Template: currency, interest, fees, limits, eligibility | New product = configuration, not code, in modern cores. Ask if it's "parameterised" |
| **Arrangement / Account** | One customer's instance of a product | API "create account" = create arrangement against product code |
| **Position keeping** | Running balance record per account | Source of balance APIs |
| **GL** | Bank's accounting books | Every financial API must produce balanced double-entry postings |

## 3. Balance types (most common source of wrong ACs)

| Balance | Definition | Example |
|---|---|---|
| Ledger / book balance | Sum of posted transactions | 1,000 |
| Hold / earmark / lien | Amount blocked but not posted (card auth, legal block) | 200 |
| Uncleared funds | Credited but not yet available (cheque float) | 100 |
| Available balance | Ledger − holds − uncleared + overdraft limit | 700 (no OD) |

Rule: payment and withdrawal APIs check **available**. Statements show **ledger**. An AC that just says "balance" is incomplete.

## 4. Dates (second most common source of defects)

| Date | Meaning |
|---|---|
| Booking / posting date | When the CBS recorded the entry (bank business date) |
| Value date | When interest starts or stops counting on the amount |
| Transaction date | When the customer initiated it (channel timestamp) |
| Bank business date | The CBS calendar date, which may differ from the wall clock after the EOD cut-off |

A transfer made at 23:30 can have a wall-clock date of D, a business date of D+1 (EOD already ran) and a back-dated value date of D. Specify which date each API field returns.

## 5. The batch heartbeat: EOD / EOM / EOY

Most cores, including many modern ones, run scheduled processing: interest accrual, fee charging, loan instalment due, dormancy flags, statement generation, GL consolidation.

API impact:
- **Online/offline windows.** Legacy cores may refuse or queue postings during EOD. Ask whether there is **stand-in processing** (a shadow balance that approves and replays later).
- **Business date roll-over.** Clients must read the business date from the CBS, not the server clock.
- **Batch vs real-time GL.** Some cores post to the GL in real time, others in EOD batches. Finance reconciliation depends on which.

## 6. Architecture generations

| Generation | Characteristics | API reality |
|---|---|---|
| **Legacy monolith** (mainframe, COBOL, often 1980s–2000s designs) | Batch-centric, tightly coupled modules, proprietary messaging | APIs are a wrapper (ESB/middleware) over screens, files or MQ messages. Latency and EOD constraints leak through |
| **Componentised / modernised packaged core** | Modular, parameter-driven, SOA/REST layer | Vendor ships a REST catalogue, but some functions are still batch or need custom adapters |
| **Cloud-native / ledger engine** | Real-time posting, microservices, event streaming, product logic as config or code | API-first: everything is exposed through APIs plus an event stream. Fewer EOD constraints, but the bank builds more around it |

## 7. Where the API sits — reference layering

```
[Channels]  Mobile · Web · Branch · Partners/Open Banking · Onboarding app
     │
[API Gateway]  AuthN/Z (OAuth2, mTLS) · rate limit · consent · logging
     │
[Orchestration / middleware]  ESB or microservices · BFF · process flows · transformation
     │
[Core Banking]  Party · Product · Account · Position · Posting · EOD
     │                 └──▶ Events (Kafka/MQ)  ──▶ CRM · AML · Data lake · Notifications
[Satellites]  Payment hub · Card system · LOS · GL/ERP · Reporting
```

**Key insight:** the "core banking API" a channel team sees is often the orchestration layer's API, not the core's native API. Always ask: "Is this a native CBS API, or a composite built by middleware?" The answer changes ownership, SLA, error handling and change lead time.
