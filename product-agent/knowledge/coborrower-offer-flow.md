# Co-borrower — Offer Flow

- **Jira:** [AMP-2495](https://scvaladdin.atlassian.net/browse/AMP-2495) — "[Co-borrower] - CoBorrower Offer Flow"
- **Project:** AMP (Appro_Marketplace) · **Label:** CoBorrower · **Status:** Tested with Bugs
- **Last synced:** 2026-07-26

> Distilled from the story's Acceptance Criteria. Re-sync from Jira before relying
> on it for a release — the ticket is the source of truth.

## What the feature does

After a **co-borrower** completes onboarding (Basic Details → Quick Consents →
Identity Verification → Liabilities Review) and passes credit assessment +
eligibility, they land on a **Pre-approved** screen showing their individual
eligibility contribution. Once **both** the co-borrower and the primary borrower
confirm, the system computes a **combined eligibility** and shows a **Combined
Offer**. Optionally, settling liabilities increases the combined amount.

## Screens & states

| State | When | Key content |
|---|---|---|
| **AC1 — Individual Pre-approved** | Co-borrower approved; primary still "In Progress" | "You're Pre-approved!", eligibility card (co-borrower's individual Max Eligibility, AED), primary-borrower card with **In Progress** (amber) badge; "Settle your liabilities" card (conditional); **Confirm Pre-Approval** button |
| **AC2 — Combined, no liabilities to settle** | Both confirmed; co-borrower has no settleable liabilities | Hero "You're all Pre-approved!", combined amount, **+x%** increase badge, eligibility progress bar (Individual/Combined/Potential); **Confirm & Proceed** button |
| **AC3 — Combined, with liabilities to settle** | Both confirmed; co-borrower has settleable liabilities | AC2 + extra **"Increase your Eligibility"** card → Settlement screen |

## Key rules

- **AC4 — routing:**
  - Primary "In Progress" (state ≠ "Awaiting Customer Selection") + co-borrower passes Limit Assignment **and** Rule Engine → **AC1**.
  - Primary "Awaiting Customer Selection" + co-borrower passes both engines:
    - has settleable liabilities → **AC3**; else → **AC2**.
- **AC5 — confirmation:** records confirmation w/ timestamp (audit), SMS to primary, sets co-borrower contact status = "Confirmed", routes to "Thank you for your acceptance".
- **AC6 — "Settle your liabilities" card:** shown only if ≥1 ECB liability record exists; hidden otherwise.
- **AC7 — notification NT11:** SMS to co-borrower when primary reaches "Awaiting Customer Selection". One-time. Body references `%%PRIMARY_NAME%%` + `%%LOGIN_LINK%%`. Sent via Channel Notifications Center.
- **Combined amount** = Σ Max Eligibility of Primary + all confirmed Co-borrowers. **+x%** = (co-borrower Max Eligibility / Σ Max Eligibility) × 100.
- **AC8 — audit trail:** app id = `CO{order}_{primaryAppId}` (e.g. `CO1_NTBMLCASA0123456`); records step/state/timestamp/status for confirm-from-individual, confirm-combined, and confirm-post-settlement.

## Derived test cases

| ID | Precondition | Steps | Expected | Source |
|---|---|---|---|---|
| CB-1 | Co-borrower approved, primary In Progress | Reach Pre-approved screen | "You're Pre-approved!"; eligibility card = co-borrower individual Max Eligibility (AED); primary card shows **In Progress** amber badge + "We'll notify you once completed…" | AC1 |
| CB-2 | Co-borrower has **no** ECB liabilities | View AC1 screen | "Settle your liabilities" card is **hidden** | AC6 |
| CB-3 | Co-borrower has ≥1 ECB liability | View AC1 screen | "Settle your liabilities" card shown; "Settle" → Settle Liabilities screen | AC1/AC6 |
| CB-4 | Both confirmed; co-borrower no settleable liabilities | Complete confirmations | Lands on **AC2**; no "Increase your Eligibility" card; combined amount + **+x%** badge correct | AC2/AC4 |
| CB-5 | Both confirmed; co-borrower has settleable liabilities | Complete confirmations | Lands on **AC3**; "Increase your Eligibility" card present → Settlement | AC3/AC4 |
| CB-6 | Primary reaches "Awaiting Customer Selection" | Trigger event | Co-borrower receives **NT11** SMS once, containing primary name + login link | AC7 |
| CB-7 | Co-borrower taps Confirm & Proceed | Confirm combined offer | Audit record `CO{order}_{primaryAppId}`, step="Combined Pre-Approved screen", status="Successful"; SMS to primary; contact status="Confirmed"; routes to Thank-you | AC5/AC8 |
| CB-8 | +x% math | Inspect combined card | +x% = coBorrowerMaxElig / Σ(all borrowers Max Elig) × 100; combined amount = Σ all confirmed | AC2 |

## Open questions / gaps to verify live

- Exact copy/format of currency amounts and badge colors vs. Figma (verify on UAT once reachable).
- Behavior when co-borrower fails Limit Assignment or Rule Engine (not covered here — likely a separate story).
- "Tested with Bugs" status → check linked bug tickets before signing off.
