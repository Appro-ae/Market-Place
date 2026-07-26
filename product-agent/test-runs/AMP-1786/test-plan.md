# Test Execution Sheet — AMP-1786

- **Story:** [AMP-1786](https://scvaladdin.atlassian.net/browse/AMP-1786) — "[Bank Portal][Product Setup] Manual Bank - Personal Loan - View details/Create/Edit a product"
- **Type:** Enhancement · **Status in Jira:** UAT TESTING
- **Test cases:** 10, in project **AITEST** ("AI Generated Test Cases"), linked as *Has Test Case*
- **Navigation under test:** Login → Product Setup → Personal Loan tab → Add Product / View / Pricing Matrix (Steps 1–3)
- **Run environment target:** `https://dib2.uat.smbp-v2.aladdinweb.dev`
- **Login:** ask-every-time (credentials provided per run; never stored)

## Execution status

⛔ **BLOCKED — not yet executed against the live portal.** The UAT host
`*.aladdinweb.dev` is blocked by this environment's egress policy (HTTP 403 on
CONNECT). Jira reading works; live UI execution needs the host reachable
(allowlist `*.aladdinweb.dev`, or run locally). Once reachable, each row's
Result/Evidence is filled by driving the flow with `portal-test-agent`.

## Test cases

| TC | AITEST | Title | Type | Pri | Result |
|----|--------|-------|------|-----|--------|
| TC_01 | AITEST-5350 | Add Product screen renders PL product-type tag + General Information section | UI / smoke | Med | ⛔ Blocked |
| TC_02 | AITEST-5352 | General Information validations (name, sub type, amounts, tenor, salary) | Negative / regression | High | ⛔ Blocked |
| TC_03 | AITEST-5354 | Document uploads (Card Artifact, T&C, Featured Promotion) — PDF only, ≤10MB | Negative / regression | Med | ⛔ Blocked |
| TC_04 | AITEST-5356 | Save generates PL product code (PL prefix), Status Active, success toast | Functional / sanity | High | ⛔ Blocked |
| TC_05 | AITEST-5358 | Pricing rate fields accept 4 decimals (XX.XXXX%) vs ML 2 decimals | Negative / regression | Med | ⛔ Blocked |
| TC_06 | AITEST-5360 | Processing Fees dropdown + NEW Early Settlement / Deferred Payment Per Year | Functional / sanity | Med | ⛔ Blocked |
| TC_07 | AITEST-5362 | Step 2 factors exclude property factors (Transaction/Employment/Residency/STL/Company Type) | Functional / regression | Med | ⛔ Blocked |
| TC_08 | AITEST-5364 | Step 3 generates `PL_Pricing Offers Template` + validates 4-decimal upload | Integration | Med | ⛔ Blocked |
| TC_09 | AITEST-5366 | Submit transitions DRAFT → ACTIVE, deactivates prior same-name scheme | Functional / sanity | Med | ⛔ Blocked |
| TC_10 | AITEST-5368 | Add Product button + PL tab gated by EDITOR permission / Product Type config | Functional / regression | High | ⛔ Blocked |

## Detailed steps & expected results

### TC_01 — AITEST-5350 (UI, smoke, Medium)
- **Precondition:** Logged into Bank Portal on Product Setup > Personal Loan tab.
- **Steps:** Click Add Product; inspect labels and product-type tag.
- **Expected:** Add Product screen opens with label tag **"Product Type: Personal Loan"**, breadcrumb **"Product Setup"**, and the **General Information** section.
- **Result:** ⛔ Blocked — _pending live access._

### TC_02 — AITEST-5352 (Negative, regression, High)
- **Precondition:** On the PL Add Product screen.
- **Steps:** Trigger blank/duplicate Product Name, blank Sub Type, min>max amounts, min>max tenor, negative Minimum Salary, invalid Age Limit.
- **Expected:** **IEM003** on blank mandatory; **IEM036** on duplicate name; **IEM012** on min>max (amount/tenor/salary); Age Limit 01–99; tenor max 3 digits; Minimum Salary ≥0 max 7 digits with **CR001** formatting.
- **Result:** ⛔ Blocked.

### TC_03 — AITEST-5354 (Negative, regression, Medium)
- **Precondition:** On the PL Add Product screen, Document Upload section.
- **Steps:** Upload wrong-format and >10MB files to Card Artifact, Terms and Conditions, Featured Promotion.
- **Expected:** All three boxes accept **PDF only**; wrong format → **IEM047**; >10MB → **IEM031**; valid uploads expose **View** and delete controls.
- **Result:** ⛔ Blocked.

### TC_04 — AITEST-5356 (Functional, sanity, High)
- **Precondition:** On the PL Add Product screen with all mandatory fields valid.
- **Steps:** Click Save; inspect generated product code and status.
- **Expected:** Saves with Product Type = Personal Loan; auto-generated 13-char code with **PL prefix** (`<BankCode>_PL_<UniqueID>`); Status = **Active**; toast **"[Product Name] added successfully!"**; **CR003** audit entry written.
- **Result:** ⛔ Blocked. _Note: story AC2 example shows code `Appro_ML_...` while TC expects `_PL_` prefix — flag this discrepancy to the BA when verifying._

### TC_05 — AITEST-5358 (Negative, regression, Medium)
- **Precondition:** On PL Pricing Matrix Step 1 with rate fields visible.
- **Steps:** Enter 5-decimal values into Fixed Period Profit Rate / Floor / Ceiling.
- **Expected:** Rate fields accept up to **4 decimals** (XX.XXXX%); 5th decimal rejected/truncated; Floor ≤ Ceiling and Base > 0 enforced.
- **Result:** ⛔ Blocked.

### TC_06 — AITEST-5360 (Functional, sanity, Medium)
- **Precondition:** On PL Pricing Matrix Step 1 with rate fields visible.
- **Steps:** Inspect Processing Fees dropdown (Fee/Percentage) + its 4-decimal input; inspect Early Settlement and Deferred Payment Per Year.
- **Expected:** Processing Fees lists **Fee/Percentage** with 4-decimal input; **Early Settlement** and **Deferred Payment Per Year** (both new vs Core-ML) present, mandatory, numeric up to 4 decimals (XX.XXXX).
- **Result:** ⛔ Blocked.

### TC_07 — AITEST-5362 (Functional, regression, Medium)
- **Precondition:** On PL Pricing Matrix Step 2.
- **Steps:** Inspect available Product Scheme Factors and their values.
- **Expected:** Exposes Transaction Type, Minimum Salary/Salary Slab, Employment Type (Company Employee/Self Employed/Pensioner), Residency Type (Local/GCC Countries/Expat), STL (Yes/No), Company Type (ALOC/Non-ALOC); **Property Status/Location factors NOT present**.
- **Result:** ⛔ Blocked.

### TC_08 — AITEST-5364 (Integration, Medium)
- **Precondition:** On PL Pricing Matrix Step 3.
- **Steps:** Generate matrix; inspect file name; upload a file with Early Settlement + Deferred Payment Per Year columns with invalid values.
- **Expected:** Template named **`PL_Pricing Offers Template_ddmmyyyyhhmmss.xlsx`**; upload validates all columns incl. new ones (numeric, 4 decimals, > 0); invalid rows → error-annotated Excel + **ET33** email to creator.
- **Result:** ⛔ Blocked.

### TC_09 — AITEST-5366 (Functional, sanity, Medium)
- **Precondition:** A PL pricing offer file uploaded successfully; prior ACTIVE same-name scheme exists.
- **Steps:** Click Submit.
- **Expected:** Scheme **DRAFT → ACTIVE**; prior ACTIVE same-name scheme → **INACTIVE**; duplicate factor combinations rejected with validation error.
- **Result:** ⛔ Blocked.

### TC_10 — AITEST-5368 (Functional, regression, High)
- **Precondition:** Users with and without EDITOR permission for PL Product Setup.
- **Steps:** Verify Add Product button + Personal Loan tab visibility per permission/config.
- **Expected:** Add Product requires **EDITOR** permission (Product Type = Personal Loan); PL tab shows only when PL enabled in User Management > Product Type; Role Management labels type **"Personal Loan"**.
- **Result:** ⛔ Blocked.

## Notes for the tester / BA

- **Product-code prefix discrepancy (TC_04 vs story AC2):** the test case expects a **`_PL_`** prefix; the story's AC2 worked example reads `Appro_ML_1774420933253` (ML) and its prose says "`PL`: Prefix for Product Type = Personal Loan". Confirm the correct prefix before signing off.
- Several checks (audit CR003, ET33 email, async template polling) are back-end/side-effect assertions that the browser agent can only partially observe — plan for API/DB/email verification alongside the UI run.
