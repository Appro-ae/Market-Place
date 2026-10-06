# 04 — Standards and Regulation

**Verification status:** research date **2026-10-06**. Facts were confirmed against the source URLs at search-result level; full documents were not read. Re-open the primary source before quoting a number or date in a deliverable.

Confidence tags:
- **[P]** primary or official source
- **[S]** secondary source (law firm, vendor, trade press)
- **[U]** unverified: do not use without checking

## 0. Why standards matter to a CBS PO

| Standard type | What it gives you | Where it bites |
|---|---|---|
| Capability model (BIAN) | Common vocabulary to map vendor APIs and scope epics | Vendor evaluation, target architecture |
| Message standard (ISO 20022) | Data fields for payments and statements | Payment APIs, statement APIs, data model richness |
| API spec format (OpenAPI) | Machine-readable contracts | Contract testing, dev portal, code generation |
| Security profile (FAPI) | High-assurance OAuth for third-party access | Open banking/finance, partner APIs |
| Open banking/finance regulation | **Mandatory** API scope, consent, timelines | Roadmap commitments, regulatory deadlines |

---

## 1. BIAN — Banking Industry Architecture Network

- A not-for-profit association of banks and vendors. It publishes the **Service Landscape**: bank capabilities split into **Service Domains**, each with service operations. [S] https://en.wikipedia.org/wiki/Banking_Industry_Architecture_Network
- **Version 14.0:** 328 Service Domains, 242 with Semantic APIs. Some APIs come in ISO 20022-aligned and AsyncAPI versions. [P] https://bian.org/wp-content/uploads/2026/02/BIAN-v14.0-Release-Notes-v1.0_-Final-Version.pdf (v13.0 had 327: https://bian.org/wp-content/uploads/2025/06/BIAN-v13.0-Release-Notes-v0.3.pdf)
- **Semantic API path pattern:** `ServiceDomain / ControlRecord / BehaviorQualifier / ActionTerm`. [S] https://medium.com/adl-blog/a-deep-dive-into-the-bian-landscape-understanding-service-domains-through-a-lending-example-6a5ec26eaf6a
- **Action terms:** e.g. Initiate, Create, Activate, Configure, Update, Register, Execute, Evaluate, Provide, Request, Notify, Retrieve, Control, Exchange, Capture, Grant, Feedback. Their mapping to REST was revised in v8.0. [S] https://bian.org/participate/implementing-bian-specifications-using-semantic-api-user-guide/ — the full authoritative list is **[U]**.
- **Payment-related Service Domains:** Payment Order, Payment Execution, Current Account, Position Keeping. [P] https://bian.org/?p=436
- **Other CBS-relevant domain names**, used as a mapping aid only: Party Reference Data Directory, Savings Account, Consumer Loan, Customer Agreement, Product Directory. **[U]** Confirm exact names in the BIAN Service Landscape before using them in a deliverable.

**PO use:** map each vendor API to a Service Domain (see `02-api-domain-map.md`). Gaps and overlaps become visible in one table.

## 2. ISO 20022

| Message | Purpose | Source |
|---|---|---|
| pain.001 | Customer credit transfer initiation (customer → bank) | [P] https://www.zkb.ch/media/zkb/dokumente/sonstige/handbook-iso-V19-en.pdf |
| pain.002 | Payment status report (bank → customer) | same |
| pacs.008 | FI-to-FI customer credit transfer (bank → bank) | [S] https://docs.numeral.io/docs/pacs002-xsd-business-logic |
| pacs.002 | FI-to-FI payment status report | same |
| camt.052 | Intraday account report | [P] ZKB handbook |
| camt.053 | End-of-day account statement | [P] ZKB handbook |
| camt.054 | Debit/credit notification | [P] ZKB handbook |

- **Swift MT–MX coexistence ended on 22 Nov 2025** for cross-border payment instructions (e.g. MT103, MT202). Swift charges for contingency processing from **1 Jan 2026**. [S] https://paymentexpert.com/2025/11/21/swifts-iso-20022-cutover-the-end-of-mt-and-a-20-year-promise/ · [S] https://www.bny.com/content/dam/bnymellon/documents/pdf/iso-20022-end-of-co-existence_-may-2025-final.pdf
- Governance body and registration authority: **[U]** (commonly cited as ISO TC68 with Swift as Registration Authority; verify).

**PO use:** CBS payment and statement APIs should carry ISO 20022-rich data: structured address, purpose code, end-to-end ID. A core that stores only legacy MT-length narratives causes truncation and loses that data.

## 3. OpenAPI and FAPI

- **OpenAPI 3.2.0** was released **19 Sep 2025**, with no breaking changes from 3.1. New: hierarchical tags, streaming (`itemSchema`), the QUERY method and OAuth2 device flow. [S] https://www.speakeasy.com/openapi/release-notes
- **FAPI 2.0 Security Profile and Attacker Model:** approved as OpenID **Final** specifications (Feb 2025). [P] https://openid.net/specs/fapi-security-profile-2_0-final.html · https://openid.net/fapi2-0-final-conformance-tests-available/

## 4. Open banking / open finance by jurisdiction

### 4.1 UAE — CBUAE Open Finance  *(highest relevance)*

| Item | Fact | Conf. |
|---|---|---|
| Instrument | **Open Finance Regulation**, announced by CBUAE press release (~27 Jun 2024) | [P] https://www.centralbank.ae/en/news-and-publications/news-and-insights/press-release/cbuae-issues-the-open-finance-regulation-to-ensure-the-soundness-and-efficiency-of-services-and-to-promote-innovation-and-competitiveness/ |
| Circular no. / dates | One source says "Circular 7/2023, 31 Dec 2023, effective 15 Apr 2024" | **[U]**: check rulebook.centralbank.ae |
| Scope | Mandatory for CBUAE-licensed institutions. Data sharing and service initiation with express customer consent | [P] same press release |
| Building blocks | Trust Framework · central **API Hub** · Common Infrastructural Services | [P] |
| Hub operator | **Nebras Open Finance**, a CBUAE subsidiary | [S] https://facephi.com/observatory/en/open-finance-eau-2026/ |
| Consumer brand | **Al Tareq**, the consent and trust mark | [S] https://banq.ai/regulation/uae-open-finance |
| Phasing | Retail R1 (Sep 2025: consent, single instant payments, confirmation of payee, balances, customer data) → R1+ (Apr 2026, Standards v2.1) → Corporate R5 (Sep 2026) | [S] https://whitesight.net/open-finance-in-the-uae-policies-and-players-powering-the-shift/ (medium confidence) |
| First live | Commercial Bank of Dubai reported as the first bank fully live (Jan 2026) | [S] https://gulfbusiness.com/en/2026/finance/uae-records-first-live-open-finance-payment/ |

**CBS implication:** banks expose data and payment APIs through the central hub, not peer-to-peer. The core must deliver real-time balances, transactions, payment initiation and status, plus consent-scoped data filtering, at hub SLAs.

### 4.2 Saudi Arabia — SAMA Open Banking Framework

- **Release 1** (account information): published Nov 2022; go-live readiness targeted for Q1 2023. [P] https://www.sama.gov.sa/en-US/MediaCenter/News/Pages/news-794.aspx
- **Release 2** (payment initiation): published ~Sep 2024. [S] https://openbankingexpo.com/news/saudi-central-bank-issues-second-release-of-open-banking-framework
- **Security:** a FAPI-aligned profile with mTLS and signed requests, plus an Open Banking Lab for certification. [S] https://www.fiskil.com/open-finance-tracker/standard/sama-open-banking

### 4.3 Vietnam — SBV Circular 64/2024/TT-NHNN (Open API)

| Item | Fact | Conf. |
|---|---|---|
| Issued / effective | **31 Dec 2024 / 1 Mar 2025** | [S] https://english.luatvietnam.vn/tai-chinh/circular-64-2024-tt-nhnn-deployment-of-open-application-programming-interfaces-in-the-banking-sector-387124-d1.html |
| Plan deadline | Banks must submit an Open API implementation plan to the SBV **before 1 Jul 2025** | [S] thuvienphapluat.vn |
| Full-compliance deadline | Often cited as 1 Mar 2027 | **[U]** |
| Basic API groups (Art. 6) | (a) FX and interest rate queries · (b) customer data: consent, token issue/refresh/revoke, account list, account detail, transaction history · (c) payment initiation and e-wallet top-up/withdrawal. Banks may offer (c) only to banks and payment intermediaries | [P] https://sbv.gov.vn/documents/d/sbv_portal/593059 |

### 4.4 UK — Open Banking Standard

- **Governance:** Open Banking Limited (OBL) is the OBIE under the CMA Retail Banking Order 2017. It is coordinating the move to a **Future Entity**. [P] https://www.openbanking.org.uk/?p=16975
- **Standard v4.0:** the first major release since 2018 (changes approved 26 Jun 2024). It aligns with ISO 20022, including CHAPS fields from 1 May 2025, and mandates **FAPI 1.0 Advanced Final**. [P] https://www.openbanking.org.uk/news/obl-publishes-open-banking-standard-v4-0-to-assure-future-ecosystem-growth/
- **Endpoints** (v3.1.x reference set; useful as a template for any market):

```
GET  /accounts                                   GET  /accounts/{AccountId}/balances
GET  /accounts/{AccountId}                       GET  /accounts/{AccountId}/transactions
POST /domestic-payment-consents                  GET  /domestic-payment-consents/{ConsentId}/funds-confirmation
POST /domestic-payments                          GET  /domestic-payments/{DomesticPaymentId}
```
[S] https://docs.oracle.com/en/industries/financial-services/banking-apis/22.2.4.0.0/obukl/uk-open-banking-api-v3.1.10.html

**Pattern to reuse:** create a **consent** first, then confirm funds, then execute the payment, then poll its status.

### 4.5 EU — PSD2 / Berlin Group / PSD3–PSR

- **Berlin Group NextGenPSD2 XS2A:** REST/JSON for AIS, PIS and confirmation of funds. OAuth2/OIDC. SCA via redirect, decoupled or embedded approaches. Version 1.3.12 cited as current. [S] https://www.fiskil.com/open-finance-tracker/standard/nextgenpsd2
- **PSD3 / PSR:** provisional political agreement on **27 Nov 2025**; final compromise texts published **23 Apr 2026**. [S] https://www.williamfry.com/knowledge/psd3-psr-final-compromise-texts-are-published/
  - Formal adoption and Official Journal publication: **[U]** as of Oct 2026.
  - Application is expected about 21 months after entry into force. [S]

### 4.6 US — FDX and CFPB §1033

- **FDX:** the CFPB recognised it as a standard-setting body (Jan 2025). FDX API v6.4 (Spring 2025) added a Consent API and a new security model. [P] https://financialdataexchange.org/fdx-feed/fdx-announces-spring-2025-api-release-fdx-api-version-6-4/
- **§1033 Personal Financial Data Rights:**
  - Final rule Oct 2024.
  - CFPB advance notice reopening the rule: **22 Aug 2025**.
  - Compliance dates **stayed by court order on 29 Oct 2025** (*Forcht Bank v. CFPB*).
  - Status in 2026: **[U]**.
  - Source: [P] https://www.consumerfinance.gov/compliance/compliance-resources/other-applicable-requirements/personal-financial-data-rights/

## 5. Cross-market pattern (what every regime asks of the core)

| Requirement | UAE | KSA | VN | UK | EU | US |
|---|---|---|---|---|---|---|
| Account and balance data | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Transaction history | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Payment initiation | ✓ | ✓ (R2) | ✓ (to banks/intermediaries) | ✓ | ✓ | n/a in §1033 scope [U] |
| Explicit consent object | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| FAPI / mTLS-grade security | ✓ [S] | ✓ [S] | [U] | ✓ | OAuth2/OIDC | FDX model |
| Central hub | ✓ (Nebras) | [U] | — | — | — | — |

**Conclusion for CBS teams:** the regulatory minimum converges on one set: **real-time accounts, balances, transactions and payment initiation/status, behind consent-scoped authorisation.** A core that can't serve these in real time needs a caching or data layer between it and the open-finance gateway. That is an architecture decision; frame it with the method in `06-po-playbook.md`.
