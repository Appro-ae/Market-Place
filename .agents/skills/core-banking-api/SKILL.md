---
name: core-banking-api
description: >
  Knowledge base and working method for Core Banking System (CBS) APIs, written
  for Product Owners, BAs and solution leads. Explains how a core works behind
  the API (party/CIF, product, account, balances, posting, GL, EOD), the
  vendor-neutral API domain map, integration patterns and NFRs, standards and
  regulation (BIAN, ISO 20022, open banking/finance regimes incl. UAE, KSA,
  Vietnam, UK, EU, US), the vendor landscape (Temenos, Finacle, FLEXCUBE,
  Thought Machine, Mambu, 10x, FIS, Fiserv, Jack Henry…), and a PO playbook
  (discovery questions, API story template, vendor scoring, failure modes).
  Use when the user asks about core banking APIs, CBS integration, account
  opening / CASA / payments / lending APIs, open banking APIs, evaluating a
  core banking vendor, or writing stories/specs against a core.
---

# Core Banking System API — knowledge skill

## Purpose

One place to understand what a core banking API is, how it behaves, and how a Product Owner specifies, evaluates and delivers against it.

## How to answer with this skill

1. **Load only the reference(s) the question needs** (routing table below). Don't dump the whole skill.
2. **Structure analytical answers with the user's method:**
   **Rationale → Business base (legal base, market practice) → Hypothesis → Experiment/evidence → Conclusion and improvement.**
   Short factual questions get a short answer. Use the full chain for problems, decisions and evaluations.
3. **Verified data only.** Facts about vendors, regulations, dates and numbers must come from `04`/`05` (which carry sources) or be freshly verified with a cited URL. If something can't be verified, write "unverified", never guess. Regulations and vendor products change; for anything time-sensitive, re-check the source before relying on it.
4. **Be direct.** Tables over prose. Lead with the answer, then the reasoning.
5. **Always separate** native CBS API vs middleware composite, system of record vs consumer, and ledger vs available balance. Most real-world defects come from blurring these.

## Routing

| Question type | Read |
|---|---|
| "What is a core / how does it work / balances / dates / EOD / architecture" | `references/01-fundamentals.md` |
| "Which APIs exist / what does an account-opening or payment API need / review this API" | `references/02-api-domain-map.md` |
| "Sync vs async, idempotency, errors, security, NFRs, testing, modernisation patterns" | `references/03-integration-patterns.md` |
| "BIAN, ISO 20022, open banking/finance, UAE/KSA/Vietnam/UK/EU/US rules, FAPI, OpenAPI" | `references/04-standards-and-regulation.md` |
| "Temenos vs Finacle vs Mambu…, vendor API style, dev portals, market trends" | `references/05-vendor-landscape.md` |
| "Write stories, discovery questions, vendor scoring, failure modes, interview framing" | `references/06-po-playbook.md` |
| Terms and acronyms | `references/07-glossary.md` |

## One-page mental model

```
           ┌──────────── Channels: app · web · branch · partners · onboarding ───────────┐
           │                                                                               │
           ▼                                                                               │
   API Gateway (OAuth2 · mTLS · FAPI · consent · rate limits)                              │
           ▼                                                                               │
   Orchestration / middleware (composite APIs · mapping · error translation)              │
           ▼                                                                               │
 ┌──────────────────────────── CORE BANKING (system of record) ─────────────────────────┐ │
 │ PARTY/CIF ─▶ ARRANGEMENT/ACCOUNT ─▶ PRODUCT     BALANCES (ledger·available·holds)    │ │
 │ POSTINGS ─▶ GL                     EOD: accrual · fees · statements · business date  │ │
 └───────────────────────────────┬───────────────────────────────────────────────────────┘ │
                                 ▼ events (Kafka/MQ/webhooks)                              │
        CRM · AML/fraud · notifications · data lake · payment hub · cards · LOS ───────────┘
```

**Five questions that unlock any CBS API conversation:**
1. Who is the system of record?
2. Native or composite API?
3. Sync, async, or event, and how is the outcome confirmed?
4. What happens on a timeout, a duplicate, and during EOD?
5. Which balance and which date does it use?
