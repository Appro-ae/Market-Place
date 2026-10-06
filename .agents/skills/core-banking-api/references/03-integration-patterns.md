# 03 — Integration Patterns and Non-Functionals

How CBS APIs behave in production, and what to specify so they don't break there.

## 1. Interaction styles

| Style | When used | Strength | Risk |
|---|---|---|---|
| **Synchronous REST/SOAP** | Balance enquiry, account open, internal transfer | Simple, immediate answer | Timeouts leave an unknown outcome. Couples channel uptime to core uptime |
| **Asynchronous messaging** (MQ, Kafka commands) | High-volume postings, legacy cores | Absorbs spikes, survives core downtime | Needs a correlation ID and a status query or callback |
| **Events / streaming** (Kafka, webhooks) | Notify CRM, AML, apps of changes | Decoupled, near real-time | Ordering, duplicates, schema evolution |
| **Batch files** (CSV, ISO 20022 XML, fixed-width) | Bulk payroll, GL extracts, migration, reporting | Efficient for volume | Latency (T+0 EOD or T+1), reconciliation effort |

Rule of thumb: **reads → sync; money movement → sync with idempotency, or async with status; notifications → events; volume → batch.**

## 2. Five patterns every CBS integration needs

### 2.1 Idempotency
The client sends a unique key (e.g. an `Idempotency-Key` header or a channel reference). The core returns the original result for duplicates instead of posting twice.
**AC example:** *Given a transfer with key K was posted, when the same request with K is received within 24h, then no new posting is created and the original response is returned.*

### 2.2 Timeout = unknown, not failure
If the channel times out, the money may have moved. Required design: retry with the same idempotency key, **or** query status by reference before re-initiating. Never show "failed" to the customer on a timeout.

### 2.3 Reversal vs compensation
- **Reversal:** the core undoes a posting (same-day, original reference).
- **Compensation:** a new opposite transaction (cross-day, or a different system).
Specify which one applies per failure scenario, and who triggers it (system or ops).

### 2.4 Correlation and traceability
One `correlation-id` flows channel → gateway → middleware → core → events. Without it, disputes and incident root-cause analysis take days.

### 2.5 Maintenance and EOD handling
Options: reject with a clear error code | queue and replay | stand-in processing on shadow balances. Choose per API and document the customer message.

## 3. Error taxonomy (specify it, don't inherit it)

| Class | Example | HTTP (typical) | Channel action |
|---|---|---|---|
| Validation | Invalid IBAN format | 400 | Show field error, no retry |
| Business rule | Insufficient funds, account frozen, limit exceeded | 422 / 409 | Show business message, no retry |
| Auth | Token expired, scope missing | 401 / 403 | Refresh token / block |
| Not found | Account doesn't exist | 404 | Message |
| Conflict / duplicate | Idempotency key reuse with a different payload | 409 | Investigate |
| Technical transient | Core busy, EOD in progress | 503 (+ Retry-After) | Retry with backoff |
| Technical unknown | Timeout | 504 | Status enquiry, then retry |

Legacy cores return proprietary codes (e.g. `E-1234 OVERRIDE`). The middleware must map them to this taxonomy. **The mapping table is a PO deliverable**, not a dev afterthought.

## 4. Security model

| Layer | Control |
|---|---|
| Transport | TLS 1.2+; **mTLS** between gateway and core / partners |
| Client auth | OAuth 2.0 client credentials (system-to-system); authorisation code + PKCE (user-facing) |
| High-assurance profile | **FAPI** (Financial-grade API) for open banking / partner APIs |
| Authorisation | Scopes per API family, plus data-level entitlement (this user may see only these accounts) |
| Transaction security | Step-up / SCA for payments above threshold; signed payloads where required |
| Ops | Maker-checker on sensitive changes (limits, fee waivers, static data) |
| Audit | Immutable log: user, channel, IP/device, before/after values |
| Data | PII masking in logs, field-level encryption where required |

## 5. Non-functional requirements — template

| NFR | Question | Starting point to validate (not a standard) |
|---|---|---|
| Latency | p95 / p99 per API? | Enquiry < 500 ms, posting < 1–2 s at p95. Validate with the vendor |
| Throughput | Peak TPS (salary day, campaign)? | Model it from current peak × growth |
| Availability | Target and maintenance windows? | Align to channel SLA; disclose EOD gaps |
| Payload | Max page size, history depth? | Pagination is mandatory on transactions |
| Rate limits | Per client, per endpoint? | Define for partner and open banking clients |
| Versioning | Semantic version in path or header? Deprecation notice? | ≥ 6 months' notice is common practice. Confirm contractually |
| Observability | Metrics, tracing, alerting thresholds? | Correlation ID end-to-end |

The numbers above are **working hypotheses for discussion**, not industry benchmarks. Replace them with measured vendor or production data (see `06-po-playbook.md`, experiment step).

## 6. Testing ladder

1. **Contract test:** the OpenAPI spec is validated against the mock and the real API.
2. **Sandbox:** functional happy and unhappy paths with synthetic data.
3. **SIT:** end-to-end across channel → middleware → core → events.
4. **Performance:** peak TPS plus EOD overlap scenario.
5. **UAT:** business users with realistic, masked data.
6. **Reconciliation test:** channel log = core postings = GL, for a full business day including EOD.
7. **Cutover / dress rehearsal** (for migrations): data migration counts and balances tie-out.

## 7. Modernisation patterns (context for roadmap discussions)

| Pattern | Idea | API implication |
|---|---|---|
| **Wrap / API layer** | Keep the legacy core, expose APIs via middleware | Fastest; legacy limits (EOD, latency) persist |
| **Hollow out the core** | Move functions (product, pricing, onboarding) to modern services around the core | API ownership spreads; strong orchestration needed |
| **Side-car / greenfield core** | Launch a new core for a new product or brand and migrate later | Two systems of record during transition; dual APIs |
| **Big-bang replacement** | Migrate everything at once | Highest risk; one API cutover |
| **Progressive migration** | Move product by product or segment by segment | Routing layer decides which core serves which customer |

Sourced market context is in `05-vendor-landscape.md`.
