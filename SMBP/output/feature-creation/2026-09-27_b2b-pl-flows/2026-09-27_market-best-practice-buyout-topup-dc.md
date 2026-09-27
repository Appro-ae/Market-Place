# Market Best Practice — Buyout / Top-Up / Debt Consolidation (Personal Lending)

| Item | Value |
|---|---|
| Workflow step | Step 2 — Market best practice (per Product feature creation workflow) |
| Scope | UAE first (our regulator + competitors), one global reference market (India top-up practice), Islamic structuring |
| Date | 2026-09-27 |
| Evidence rule | Verified sources only, linked. Rates/fees are as published on the cited pages and move frequently — treat as directional, re-verify before any client commitment. Comparison-site figures (Paisabazaar, Soulwallet) are secondary sources. |

---

## 1. Regulatory base (the non-negotiables)

| Rule | Value | Source |
|---|---|---|
| Personal loan cap | 20× salary/total income | [CBUAE Rulebook Art. 2](https://rulebook.centralbank.ae/en/rulebook/article-2-personal-loan) |
| Max tenor | 48 months | same |
| DBR ceiling | 50% of income (30% pensioner practice) | [CBUAE Art. 3](https://rulebook.centralbank.ae/en/rulebook/article-3-important-ratios) |
| Loan transfer right | Customer may move a loan to another bank; exit fee ≤ **1% of outstanding** (cap AED 10,000 cited in market) | [CBUAE Reg. 29/2011](https://rulebook.centralbank.ae/en/rulebook/regulation-no-292011-regarding-bank-loans-other-services-offered-individual-customers) |
| Cooling-off | 5 complete business days, waivable in writing | [CBUAE Consumer Protection Standards](https://rulebook.centralbank.ae/en/rulebook/consumer-protection-standards) |
| Minimum salary | No CBUAE minimum since 2025 — bank-discretionary | [Khaleej Times](https://www.khaleejtimes.com/uae/uae-central-bank-removes-minimum-salary-requirement-for-personal-loans) |

The 1% exit-fee cap is the market's foundation: it makes buyout economics predictable for the acquiring bank, which is why every large UAE bank runs an acquisition-led buyout product.

## 2. UAE competitor benchmark

| Bank / product | Variant | Published terms (directional) | Practice worth noting | Source |
|---|---|---|---|---|
| **FAB Buyout Loan** | Buyout + extra funds | UAEN from ~5.95%, expat ~6.95% (variable, PBR-linked); min salary AED 7,000; max AED 5M UAEN / 2M expat; tenor ≤48m (≤60m for MoD); **salary transfer mandatory**; approved-employer list | **Grace period up to 365 days (UAEN) / 275 days (expat)** before first instalment — grace as a headline acquisition feature, far beyond our 30–99 default | [FAB](https://www.bankfab.com/en-ae/personal/loans/personal-loans/buyout-loans), [Paisabazaar](https://www.paisabazaar.ae/personal-loans/fab-buyout-loans/) |
| **Emirates NBD Buy Out** | Buyout | Mgmt fee 1% (capped); requires existing loan **in good standing** + details of balance/rate/terms | Explicit "good standing" gate = our G4 clean-payment gate; ENBD self-serves liability letters digitally | [ENBD](https://www.emiratesnbd.com/en/loans/personal-loans), [ENBD liability letter](https://www.emiratesnbd.com/en/help-and-support/request-a-liability-or-no-liability-letter) |
| **ADCB buyout programme** | Buyout + top-up | Settles other banks directly and refinances + top-up; old-bank exit fee 1% capped AED 10,000 | Direct bank-to-bank settlement (manager's cheque), top-up bundled by default | [Soulwallet](https://www.soulwallet.com/personal-loans-uae/buy-out-personal-loans) |
| **Mashreq Debt Consolidation** | DC | Min salary AED 5,000 (listed companies) / 8,000 (non-listed); **salary transfer required**; merges loans + cards + overdraft | Two-tier salary floor by employer listing = ALOC pattern; explicitly markets "one payment, lower rate" | [Mashreq](https://www.mashreq.com/en/uae/neo/loans/personal-loans/debt-consolidation-loan/) |
| **DIB Liability Settlement Finance** | DC (Islamic) | Multi-finance solution settling existing liabilities | Islamic DC exists as a named product — validates our Islamic wording rule | [DIB](https://www.dib.ae/personal/personal-finance/liability-settlement-finance) |
| **Finance House Buyout** | Buyout | Non-bank lender; buyout without salary transfer for some segments | Salary transfer is a pricing lever, not a universal precondition | [Finance House](https://www.financehouse.ae/en/personal-finance/buyout/) |

## 3. Operational market practice (the settlement mechanics)

| Practice | Market standard | Our spec | Verdict |
|---|---|---|---|
| Liability / no-liability letter validity | **15 days** is the UAE norm ([ENBD](https://www.emiratesnbd.com/en/help-and-support/request-a-liability-or-no-liability-letter), [Gulf News](https://gulfnews.com/lifestyle/community/why-buyout-is-delayed-1.2271841)) | Configurable 1–365 days (AMP-3721 AC2) | ✅ Config covers it — recommend default **15**, not blank |
| Settlement instrument | Manager's cheque bank-to-bank; delays are the top complaint in buyouts | Not specified in our stories | ⚠ Gap: settlement execution & reconciliation flow (who cuts the cheque, status tracking) has no US yet |
| Documents | Passport/EID, 3-month statements w/ salary credits, salary certificate, liability letter | AMP-3721 AC9 checklist (13 docs) | ✅ Matches; FSTL/security cheque richer than market minimum |
| Old-loan standing | "In good standing / not behind on payments" is an entry condition (ENBD) | G4 clean-payment gate — but applied to **DC only** in AMP-3732 AC5 | ⚠ Market applies it to **buyout** too; our buyout has no delinquency gate. Recommend extending G4 (or a filter) to Buyout variants |
| Top-up seasoning | India best practice: top-up unlocked after **≥6 EMIs paid** on the existing loan ([HDFC](https://www.hdfc.bank.in/personal-loan/top-up-loan)) | Seasoning ≥6 months on the *settled* contract (AMP-3732 AC4) | ✅ Equivalent, applied from the acquiring side |
| Post-settlement proof | Clearance / no-liability certificate closes the loop | In doc checklist (#9) but no workflow US for chasing it | ⚠ Minor gap: post-disbursal follow-up ("Upload liability closure letter" exists only in the prototype) |
| Islamic structuring | Buyout/DC via **Tawarruq** (commodity sale generates cash to settle other banks) — ADIB/DIB pattern | Wording rule only (loan→finance) in AMP-3694 | ⚠ If the B2B bank is Islamic, settlement is legally the *customer's* cash from a commodity sale, not a bank payment — contract-generation impact to confirm |

## 4. Digital-journey best practice

| Pattern | Who | Relevance to us |
|---|---|---|
| Lender pays creditors directly, customer never touches settlement funds | [LendingClub balance-transfer loan](https://www.lendingclub.com/personal-loan/balance-transfer-loan) (US) | Exactly our Buyout/DC model — direct payoff is the fraud-safe standard; never disburse settlement cash to the customer |
| Pre-populated liabilities from bureau data with select-to-settle toggles | US fintechs via data aggregators; us via AECB | Our AECB-driven settlement screen is at parity with global leaders; UAE's central bureau makes it cleaner than US screen-scraping |
| "Now vs After vs Save" framing on consolidation offers | Standard consolidation UX (LendingClub et al.) | Matches AMP-3404 AC6 timeline rows — keep it |
| Top-up as a 1-click repeat product for existing customers | [HDFC](https://www.hdfc.bank.in/blogs/personal-loan/fast-top-up-loan-process-explained) — minimal docs, fast approval | Future: B2B top-up for ETB customers could skip eKYC using the ETL/dedupe rail (AMP-3717) |

## 5. Conclusions (Rationale → Evidence → Action)

1. **Our variant model matches the market leaders.** Direct settlement, bureau-driven selection, savings framing — all at parity. No structural change needed.
2. **Three spec gaps vs market practice** to raise with the PM:
   - **G4-type standing check for Buyout** (market requires it; we gate DC only).
   - **Settlement execution workflow** (manager's cheque / status / reconciliation) has no user story.
   - **Default liability-letter validity = 15 days** (config exists, default doesn't).
3. **One opportunity:** FAB competes on **grace period** (up to 365 days) — our grace config (30–99 fallback) can't express that. If a client bank wants FAB-style acquisition offers, the cap must be configurable higher.
4. **One risk:** Islamic bank tenant → settlement legally flows through Tawarruq proceeds; confirm contract-generation and settlement-instruction impact before build.

---
*Secondary-source figures (Paisabazaar, Soulwallet, comparison blogs) flagged as directional; bank-page figures are as published on the cited date.*
