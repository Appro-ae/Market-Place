# 05 — Vendor Landscape and Market Context

**Verification status:** research date **2026-10-06**. Facts were confirmed against the source URLs at search-result level; full pages were not read. Customer counts and API counts are **vendor claims** unless stated otherwise. The "Architecture" labels are this skill's classification of vendor wording, not vendor terms. Re-check a source before quoting it in a deliverable.

Tags: **[P]** primary/official (incl. vendor's own site) · **[S]** secondary · **[U]** unverified

## 1. Summary

| Vendor / product | Architecture | API style | Dev portal / catalogue | Notable concept |
|---|---|---|---|---|
| **Temenos** Transact (ex-T24) + Infinity | Componentised packaged core (microservices on the T24 lineage) | REST, each API with an OpenAPI definition; events | developer.temenos.com | Transact API Catalogue; Temenos Exchange marketplace |
| **Infosys Finacle** | Componentised / microservices (vendor claim) | REST APIs + webhooks | Public portal [U] | Finacle API Connect |
| **Oracle** FLEXCUBE UBS · Oracle Banking Cloud Services | FLEXCUBE: packaged, gateway-based · OBCS: microservices SaaS | FLEXCUBE: SOAP/XML, JMS/MDB, REST · OBCS: "1,800+ open APIs" | docs.oracle.com | FLEXCUBE Gateway (EJB / WS / MDB) |
| **Thought Machine** Vault Core | Cloud-native ledger engine | REST Core API + Kafka Posting/Streaming APIs | docs.thoughtmachine.net (partner login) | Python **Smart Contracts** define products |
| **Mambu** | Cloud-native SaaS | REST API v2 (JSON), webhooks, Streaming API v2 | docs.mambu.com | "Composable banking" |
| **10x Banking** SuperCore | Cloud-native SaaS, event-driven | REST + event streams (Confluent/Kafka) | postman.10xbanking.com | ProductKit SDK; "no batch" |
| **Finastra** Essence | Cloud-first (vendor claim) | REST | developer.fusionfabric.cloud | FusionFabric.cloud API Catalog. ⚠ ownership changing (see below) |
| **FIS** Systematics · Modern Banking Platform | Systematics: mainframe · MBP: cloud-native | REST via Code Connect | codeconnect.fisglobal.com | Code Connect API marketplace |
| **Fiserv** Premier / Signature / DNA · Finxact | Legacy cores (DNA relational, real-time) · Finxact cloud-native SaaS | REST via Communicator Open | Fiserv Developer Studio "Banking Hub" | Communicator Open |
| **Jack Henry** SilverLake · Banno | Legacy core; new cloud platform on Google Cloud | jXchange SOAP (OAuth 2.0), jXchange REST; Banno REST | jackhenry.dev | jXchange; Banno Digital Toolkit |

## 2. Vendor notes with sources

### Temenos
- T24 was renamed **Temenos Transact**, launched alongside **Infinity** (digital front office) in Jan 2019. [P] https://temenos.com/us/news/2019/01/16/temenos-revolutionises-banking-software-with-launch-of-two-new-products
- Transact microservices (e.g. deposits, retail lending) can be integrated through APIs "in any sequence with any legacy infrastructure" (Jan 2020). [P] https://www.temenos.com/press_release/temenos-reaches-major-milestone-with-the-roll-out-of-temenos-transact-microservices-architecture/
- The developer portal has APIs, events, a sandbox and the **Transact API Catalogue**, with an OpenAPI definition per API. [P] https://developer.temenos.com/transact-apis
- **Temenos Exchange**: a fintech marketplace (Nov 2021). [P] https://www.temenos.com/news/2021/11/24/temenos-presents-the-temenos-exchange-its-enhanced-open-marketplace-for-fintech-solutions/
- Product renames in 2025–26: [U]

### Infosys Finacle
- Vendor positioning: "componentized… open APIs-led microservices", capabilities exposed through APIs and webhooks; **Finacle API Connect**. [P] https://www.finacle.com/technology/composable-architecture-powering-better-banking/
- **Reference (relevant to the UAE):** Emirates NBD rolled out a new Finacle core in phases: Singapore (2018), UK (2019), then KSA. [S] https://www.fintechfutures.com/core-banking-technology/emirates-nbd-completes-third-phase-of-its-core-banking-systems-upgrade
- API count and public developer portal: [U]

### Oracle
- **FLEXCUBE UBS Gateway:** EJB, SOAP web services (XML) and JMS/MDB asynchronous integration. [P] https://docs.oracle.com/cd/F44735_01/PDF/GW/GW.pdf · REST services documented for release 14.8.1. [P] https://docs.oracle.com/cd/G41973_01/webservice.html
- **Oracle Banking Cloud Services:** composable SaaS on microservices (OCI). Vendor claims 160+ banks in 70+ countries and **1,800+ open APIs**. [P] https://www.oracle.com/financial-services/banking/cloud-services/

### Thought Machine — Vault Core
- Cloud-native, built from scratch. Products are defined as **Python smart contracts** ("Universal Product Engine"). [P] https://www.thoughtmachine.net/vault-core
- Integration surface: the **Core REST API** plus the **Posting API over Kafka**. [P] https://www.thoughtmachine.net/joint-solutions/open-legacy
- Customers listed by the vendor include JPMorgan Chase, Lloyds Banking Group, Intesa Sanpaolo, Standard Chartered (Mox), SEB and Atom bank. [P] https://thoughtmachine.net/about-us

### Mambu
- REST **API v2** (v1 no longer actively developed); **webhooks**; **Streaming API v2** with subscriptions and cursor commits. [P] https://docs.mambu.com/api/pages/api-v2/about-mambu-api-v2/ · https://docs.mambu.com/api/pages/streaming-v2/streaming-v2-index/
- Vendor claims 260+ customers in 65+ countries. Western Union launched in 7 months. [P] https://mambu.com/en/customer/western-union

### 10x Banking — SuperCore
- Event-driven and real-time, with Confluent (Kafka) built in; **ProductKit SDK**. [P] https://www.10xbanking.com/engineering/confluent-at-the-core-the-benefits-of-event-driven-architectures-in-banking
- Public Postman collection: [P] https://postman.10xbanking.com/
- Customers cited: Chase UK, Old Mutual, Westpac. [S] https://www.thestack.technology/10x-jpmorgan-british-fintechs-retail-banking/

### Finastra — Essence
- **FusionCreator / FusionFabric.cloud** API Catalog with sandbox. [P] https://developer.fusionfabric.cloud/docs/platform-deep-dive/creator-catalogs.html
- ⚠ **June 2026:** Finastra agreed to sell its Universal Banking business (incl. Essence, 150+ customers) to **Pollen Street Capital**, subject to approvals. Treat roadmap and portal branding as at risk. [S] https://fintechfutures.com/m-a/finastra-offloads-universal-banking-division-to-pollen-street-capital

### FIS
- **Systematics** is mainframe-based. [P] https://www.fisglobal.com/products/systematics
- **Modern Banking Platform:** cloud-native, API-first, "more than 1,000 APIs" (vendor claim). [P] https://www.fisglobal.com/banking/fis-modern-banking-platform
- **Code Connect** API marketplace (launched with 300+ APIs). [S] https://www.finextra.com/pressarticle/71763/fis-opens-gateway-to-apis

### Fiserv
- **Developer Studio "Banking Hub"**: self-service API keys for Premier and Signature, with DNA promised (Oct 2023). [P] https://www.businesswire.com/news/home/20231019670044/en
- **Communicator Open:** REST APIs for Fiserv cores. [P] https://www.fiserv.com/en/solutions/open-banking/communicator-open.html
- Acquired **Finxact** (cloud-native, API-first core) for about $650M (2022). [P] https://www.businesswire.com/news/home/20220206005075/en/

### Jack Henry
- **jXchange SOAP:** a .NET SOA, with OAuth 2.0 from 1 May 2025. jXchange REST-Legacy clients had to migrate to the new GCP-based platform by **31 Jul 2026**. [P] https://jackhenry.dev/jxchange-soap/notices/ · https://jackhenry.dev/jxchange-rest/
- **Banno Digital Toolkit:** Consumer API and Admin API, REST/JSON + OAuth 2.0. [P] https://jackhenry.dev/open-api-docs/admin-api/

### Middle East / Asia (brief)
- **Path Solutions iMAL** (Islamic core): available on Oracle Cloud Marketplace; "open architecture". [P] https://www.path-solutions.com/our-news/path-solutions-imal-is-powered-by-oracle-cloud-and-now-available-in-the-oracle-cloud-marketplace/
- **SBS** (formerly Sopra Banking Software): rebranded 8 Oct 2024; vendor claims 1,500+ FIs. [P] https://sbs-software.com/news/sopra-banking-software-announces-brand-name-change-to-sbs/
- **ICS BANKS:** "standardised APIs" (product profile only). [S]
- Developer portals for these three: [U]

## 3. Market context (sourced)

| Insight | Source |
|---|---|
| **McKinsey:** run two tracks at once: **hollow out** the existing core, and pilot next-gen cores (modular, real-time, event-driven) on parts of the product portfolio | [P] https://www.mckinsey.com/industries/financial-services/our-insights/should-us-banks-be-moving-to-next-generation-core-banking-platforms |
| **IDC (Sep 2023, cited by Temenos):** 40% of global banks expected to pursue a **sidecar core** strategy by 2026 | [S] https://www.temenos.com/blog/from-legacy-to-leading-edge-transforming-banking-with-sidecar-systems/ (original report not reviewed) |
| **Gartner, Core Banking Hot Spot 2025:** five trends: composable tech, cloud nativeness, new vendors closing the functionality gap, ecosystems, embedded AI | [P] abstract only: https://www.gartner.com/en/documents/6592002 |
| **Kansas City Fed:** FIS, Fiserv and Jack Henry served more than 70% of surveyed US banks (2022). High concentration means switching cost is an API-lock-in issue | [P] https://www.kansascityfed.org/research/payments-system-research-briefings/market-structure-of-core-banking-services-providers/ |

## 4. So what for a PO

1. **API style reveals generation.** SOAP/MQ gateways mean a legacy or packaged core: expect EOD constraints and middleware composites. REST + Kafka streaming means cloud-native: expect real-time, but more build around the core.
2. **"N APIs" is a vanity metric.** Score coverage of *your* domains and the quality of idempotency, errors and events (see the scoring matrix in `06-po-playbook.md`).
3. **Ownership and roadmap risk is real** (e.g. the Finastra divestment, Jack Henry's REST-Legacy deadline). Add vendor-roadmap risk to the vendor scoring matrix.
4. **In the UAE/GCC,** the open-finance hub model (`04` §4.1) means the core's real-time read and payment APIs feed a central hub. Test this capability first in any vendor demo.
