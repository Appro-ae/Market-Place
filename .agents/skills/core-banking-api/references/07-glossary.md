# 07 — Glossary

| Term | Meaning |
|---|---|
| **Arrangement** | A customer's instance of a product (account, loan, deposit). Temenos and BIAN use this term |
| **Available balance** | Funds the customer can use now: ledger − holds − uncleared + overdraft |
| **BIAN** | Banking Industry Architecture Network: a reference model of bank capabilities ("service domains") and semantic APIs |
| **Business date** | The core's processing date; rolls at EOD, not at midnight |
| **CASA** | Current Account and Savings Account |
| **CIF** | Customer Information File: the master customer record and its ID |
| **Composite API** | A middleware API that calls several core APIs (e.g. create party + open account) |
| **Consent** | Customer permission for a third party to access data or initiate payments (open banking) |
| **EOD / EOM / EOY** | End-of-day/month/year batch: accruals, fees, statements, GL |
| **ESB** | Enterprise Service Bus: legacy middleware for routing and transforming messages |
| **Earmark / hold / lien** | An amount blocked on an account without posting |
| **FAPI** | Financial-grade API: a high-security OAuth 2.0 / OpenID Connect profile from the OpenID Foundation |
| **GL** | General Ledger: the bank's accounting books, fed by core postings |
| **Idempotency** | Repeating the same request gives the same result, with no duplicate effect |
| **ISO 20022** | Global financial messaging standard (e.g. pain.001, pacs.008, camt.053) |
| **Ledger balance** | Sum of posted transactions |
| **LOS** | Loan Origination System: upstream of the core for lending |
| **Maker-checker** | Four-eyes control: one user enters, another approves |
| **mTLS** | Mutual TLS: both client and server present certificates |
| **OpenAPI** | Standard for describing REST APIs (formerly Swagger) |
| **Payment hub** | System that connects the bank to payment schemes and orchestrates payments; posts to the core |
| **Position keeping** | Maintaining running balances and positions per account |
| **Product factory** | Core module where products are configured by parameters |
| **Reversal** | Undoing an original posting, linked to its reference |
| **SCA** | Strong Customer Authentication (two independent factors; PSD2 term) |
| **Side-car core** | A new core run alongside the legacy core for a subset of products or customers |
| **Stand-in processing** | Approving transactions on a shadow balance while the core is unavailable |
| **System of record** | The authoritative source for a data element |
| **Value date** | The date from which interest is calculated on an entry |
