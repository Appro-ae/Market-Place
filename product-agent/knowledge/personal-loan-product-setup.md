# Product Setup — Personal Loan (Manual Bank)

- **Jira:** [AMP-1786](https://scvaladdin.atlassian.net/browse/AMP-1786) — "[Bank Portal][Product Setup] Manual Bank - Personal Loan - View details/Create/Edit a product"
- **Type:** Enhancement · **Status:** UAT TESTING · **Related:** AMP-2564 ([PROD] Release 3)
- **Test cases:** AITEST-5350 … AITEST-5368 (TC_01–TC_10) — see `../test-runs/AMP-1786/`
- **Last synced:** 2026-07-26

## What it does

A super portal admin creates/edits **Personal Loan (PL)** products under
**Product Setup → Personal Loan tab → Add Product**, then configures a
**Pricing Matrix** (3-step flow) for rate management. Modeled on the existing
Mortgage Loan (ML) product setup, with PL-specific differences.

## Add Product (AC1–AC3)

- **General Information:** Product Name (alphanumeric, ≤100, IEM003 blank / IEM036 dup), Product Sub Type (Islamic/Conventional), Product Min/Max AED (min≤max else IEM012, max 7 digits, CR001 currency), Age Limit (01–99), Min/Max Tenor months (min≤max, 3 digits), Minimum Salary AED (≥0, 7 digits).
- **Features:** up to 10; **Disclaimer** optional (≤1000 chars).
- **Document Upload (all mandatory):** Card Artifact, Terms & Conditions, Featured Promotion — **PDF only, ≤10MB** (IEM047 wrong format, IEM031 oversize).
- **Save (AC2):** validate mandatory → persist → Product Type = Personal Loan → auto product code `<BankCode>_PL_<UniqueID>` (13 chars, unique/bank) → Status = Active → toast "[Product Name] added successfully!". Audit per **CR003** (AC3).

## Pricing Matrix (AC4–AC10)

- **Step 1 — Pricing Details (AC5):** Scheme Name (unique/product), Start (future, < End), End, Standard Charge Type (Fixed/Dynamic), Profit Rate Type (Fixed/Variable). Rate fields depend on type; **PL rates use 4 decimals `XX.XXXX%`** (ML used 2). Dynamic charge type shows only the Rate Type dropdown, no rate fields.
- **Step 2 — Scheme Factors (AC6):** Transaction Type, Minimum Salary/Salary Slab, Employment Type (Company Employee/Self Employed/Pensioner), Residency Type (Local/GCC Countries/Expat), STL (Yes/No), Company Type (ALOC/Non-ALOC). No property factors.
- **Step 3 — Pricing Offer Table (AC7):** Generate `PL_Pricing Offers Template_ddmmyyyyhhmmss.xlsx` (async + poll), download, import; validate columns incl. new Early Settlement & Deferred Payment Per Year; errors → annotated Excel + **ET33** email.
- **Submit (AC8):** DRAFT → ACTIVE; prior same-name ACTIVE → INACTIVE; reject duplicate factor combos.
- **List / Versioning (AC9–AC10):** view/edit/delete; each edit+submit creates a new version; editing an ACTIVE scheme spawns a DRAFT inheriting factors.

## PL vs Mortgage Loan — key differences (heavily tested)

| Aspect | Mortgage Loan | Personal Loan |
|---|---|---|
| Rate decimals | 2 | **4** (`XX.XXXX%`) — TC_05 |
| Product code prefix | ML | **PL** (`<BankCode>_PL_<UniqueID>`) — TC_04 ⚠ see discrepancy |
| New rate fields | — | **Early Settlement**, **Deferred Payment Per Year** — TC_06/08 |
| Employment values | Salaried | **Company Employee** (+ Pensioner) — TC_07 |
| Residency values | UAE National | **Local** (+ GCC Countries) — TC_07 |
| Property factors | present | **absent** — TC_07 |

## Access control (IA1)

Add Product needs **EDITOR** on Product Setup (Product Type = Personal Loan);
PL tab visible only if enabled in User Management → Product Type; Role Management
labels the type "Personal Loan". (TC_10)

## ⚠ Discrepancy to confirm

Story AC2's worked example shows `Appro_ML_1774420933253` (ML) while TC_04 and
AC2 prose say the PL prefix is `_PL_`. Confirm the correct product-code prefix
with the BA before sign-off.
