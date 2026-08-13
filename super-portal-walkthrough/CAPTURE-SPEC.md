# Capture spec — 34 screenshots for the walkthrough rebuild

Hand this to your capture agent. Every shot below is a real screen in the
Emirates NBD cut, in order, with the navigation path and the exact UI state it
was captured in.

---

## Global rules — read before shot 1

**Capture clean. Do not add emphasis.** In the finished video each screenshot has
a bright outline around one region and the rest of the frame dimmed. That is a
post effect I apply during the edit — **not** something to reproduce in the
capture. Send flat, unmodified screenshots. The `HIGHLIGHT` column tells me where
the emphasis goes; the agent can ignore it.

| Setting | Value |
|---|---|
| Viewport | **1920 × 1080**, device pixel ratio 2 if available |
| Format | PNG, no compression artefacts |
| Naming | `shot-01.png` … `shot-34.png` — the number **is** the slide number |
| Browser chrome | Include it. Keep **one tab open** for all 34 shots (the source cut drifts to three tabs mid-way — don't copy that) |
| Zoom | 100% on every shot, no exceptions — mismatched zoom is the most visible flaw when slides cut together |
| Theme | Portal light theme, as shown |
| Scroll | Where a shot is mid-page, the `STATE` column says what must be in frame |
| Data | Use seeded demo data, not live customer records — see “Data hygiene” below |

**Sidebar state matters.** Most shots have the sidebar **expanded** (labels
visible). Three do not. The column says which.

**Data hygiene.** Several screens show applicant PII in the source cut — name,
Emirates ID number, DOB, mobile, email. For the HSBC cut please seed obviously
synthetic records (a test customer, an ID that is clearly not real). Shots
23, 24, 26, 28, 31 and 32 are the ones that expose personal fields. Shot 28 is a
full customer letter — seed that record too.

---

## The 34 shots

Module names match the portal's left nav.

### Login

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 1 | **Sign in** | Portal root, signed out | Split screen: product landing on the left (hero, product name, rate / tenure / max-amount stats), login card on the right with username filled and password masked. Note box about admin-issued credentials visible. Footer: Powered by appro · T&C · Privacy | login card |

### Channel Management

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 2 | **Channels** | Channel Management | **Sidebar collapsed to icons.** Channel list with the search field, one channel card: bank name, city, `Active` pill, and the Mortgage Loan product tile with its enabled tick | channel card |

### Product Setup

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 3 | **Product Details** | Product Setup › Product Management › open the product | Full detail view: `Status: Activated`, product type + channel chips, General Information grid (name, sub-type, min, max, age limit, min/max tenor, min salary), Pricing Matrix table with **5 scheme rows**, Features, Disclaimer, Delete/Edit | pricing matrix table |
| 4 | **Pricing Matrix — step 1** | …› Edit Pricing Matrix, step 1 | Stepper on **1 of 3**. Scheme name, start/end date, rate type, base / floor / ceiling / stress, benchmark source + type, and the fee block (early settlement, processing, preapproval, buyout, overpayment, valuation, insurance). `Next` visible | the rate block: type, base, floor, ceiling |
| 5 | **Pricing Matrix — step 2** | …step 2 | Stepper **2 of 3**, step 1 ticked. Four factor rows, each with its factor name and its values as removable chips. `Add New Factors`, `Back`, `Next` visible | all four factor rows |
| 6 | **Pricing Matrix — step 3** | …step 3 | Stepper **3 of 3**, steps 1–2 ticked. The generated combination table — **at least 10 rows** in frame, columns through to the rate fields. `History Version` selector and `Submit` visible | the results table |

### Collateral Management

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 7 | **Consent & disclosure library** | Collateral Management | The consent list: Bureau Consent, Cooling Off, FATCA & CRS, Fund Transfer, Key Facts (and any below). Each row showing its version, body preview, Last Updated By / Date, `View More` | the first two rows |
| 8 | **Version history** | …› open Bureau Consent | Single consent open, full clause text, `Last Updated By` / `Date`, `Edit` bottom-right, and the **History Version dropdown** top-right | History Version dropdown |
| 9 | **Edit in place** | …› Edit | Same consent with the **rich-text toolbar open** at the bottom and `Cancel` / `Save Changes` | the editor toolbar + save row |

### Credit Decision — strategy

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 10 | **Segmentation** | Credit Decision › Strategies (Rule Engine) | Left: segment cards, **first one expanded** showing Manual Review toggle, residency and age rows, with Delete / Add Segmentation / Duplicate. Right: that segment's filter panel with condition chips. `Publish` bottom-right | the expanded segment card |
| 11 | **Edit segmentation** | …› Edit on that segment | **Edit Segmentation modal open.** Name field, Manual Review toggle off, one attribute (Age) **toggled on** showing Condition + value inputs, further attributes below toggled off | the enabled attribute row |
| 12 | **Attribute library** | …› Edit Attributes | **Edit Attributes modal open.** The full attribute chip cloud, ~10 chips selected (filled) against the rest unselected | the whole chip cloud |
| 13 | **Filtration** | …› a filter group in edit mode | Filter rows being edited: nationality list, employment type, age band, income, length of service — each row with its info and delete icons. `Add criteria`, `Cancel`, `Save` visible | the criteria rows |
| 14 | **Deviation** | Credit Decision › Deviation | Deviation table: No / Criteria / Deviation Formula. **Two rows** — an age rule and a bureau-score rule, each with its formula chips. `Add Deviation` top-right | both rows |
| 15 | **Publish to Rule Engine** | …› Strategies › Publish | **Confirmation dialog open**, naming the product and the channel, with `No` / `Yes` | the dialog |
| 16 | **Confirmed** | …after Yes | Same page with the **green success toast** top-right | the toast |

### Limit Assignment

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 17 | **63 calculated variables** | Limit Assignment › Calculated Variable | The formula list rendered as mathematics — DTI, DBR, MUEx, expense ratio, final DBR, affordability, monthly gross income, approved limit. **At least 8 numbered rows** in frame | the DBR formula (the large multi-line one) |
| 18 | **Income Multiplier** | Limit Assignment › Income Multiplier › Decision Calculator tab | Group list on the left with one selected, Group Information in the middle, Income Multiplier panel on the right with its **range slider** and enabled toggle | the range slider |
| 19 | **Decision Boundary** | …› Decision Boundary tab | Boundary table: Group Name / Group Information / Min / Max / Deviation Type / Action. **Two group rows** | both rows |

### Conditional Offer

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 20 | **Higher Offer enabled** | Conditional Offer | Higher Offer card **toggled on** with its `Enabled` pill, the pre-approval messages panel beneath it showing the `0 / 10` counter and `Add message`. Conditional Offer card below, disabled | the Higher Offer card |

### Enquiry — application enquiry

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 21 | **Find any application** | Enquiry › Application Enquiry | Results table with the **search-type dropdown open**, showing all four options (Application ID, national ID, Email, Phone). Table columns: Application ID, Customer Name, Type, Status, Nationality, Date, Channel. Pagination visible | the open dropdown |
| 22 | **Narrowed** | …search by email | Same table filtered to **exactly two rows**, both the same customer, one Completed and one still in progress | both result rows |
| 23 | **The case file** | …open an application | Application Details header block: ID, status, created date, product type, ID number, age, DOB, mobile, nationality, declared vs finalised income, employer, proposed limit, affordability, DSR before/after, rule-engine result, bureau score. Step table beneath | the details block |
| 24 | **Credit indicators** | …scroll to Credit Indicator | Credit Indicator panel expanded: bureau score, DBR, DTI, MUEx, exposure, outstanding, overdue, active/closed contracts, contract dates — plus the **Worst Payment Delay** and **Cheque Bounce** tables underneath, both showing 3/6/9/12/24-month columns | the indicator list |
| 25 | **Why it decided** | …› a step's `View More` | **Step details modal.** One segment `Pass` with its criteria table (criterion / formula / bank value / application value / status), a second segment `Failed` collapsed, and the Limit Assignment Result section listing **5 approved offers** | the offers list |
| 26 | **The arithmetic, exposed** | …expand one offer | The offer's decision matrix: finalised income, multiplier value and status, limit based on multiplier, max DBR per policy, affordability, remaining DBR, final max DBR, existing DBR, DBR room, max eligibility, proposed limit, product bounds, boundary, approved limit, decision status | the calculation rows |
| 27 | **The evidence file** | …› Document tab | Document list in the right panel: ID front, ID back, selfie, signature, consent documents, bureau report, credit assessment report, pre-approval letter — each collapsible | the document list |
| 28 | **The customer letter** | …open the pre-approval letter | The rendered letter: bank logo, date, salutation, “pre-approved” heading, and the terms table (finance type, reference, customer, amount, period, rate) | the terms table |

### Manual Queue

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 29 | **Route to a queue** | Manual Queue › a case › Send Application | **Sidebar collapsed to icons.** `Send Application` dialog open with the two credit-queue radio options and `Cancel` / `Send` | the dialog |
| 30 | **Override, inside policy** | …› Override | **Sidebar collapsed.** Override modal with the **Product dropdown open** listing the scheme variants, the Offer field beside it, and the recalculated fields below (limit, tenor, eligibility, rate, instalments). `Cancel` / `Override` | product dropdown + offer row |

### Users Management

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 31 | **Users** | Users Management › User Management | User list: Name, User Role, Status toggle, Last Updated Date, Last Updated By. **10 rows**, pagination showing 2 pages. `Export` and `Add User` top-right | the top four rows |
| 32 | **View PII Data** | …› edit a user | Edit User Details: name, channel, department, approval level, max limit, role, email, mobile, product-type checkboxes, and the **View PII Data toggle set to Allowed** beside the Lock status | the View PII Data block |
| 33 | **Roles** | Users Management › Role Management | Role matrix: one row per role, one column per module, green ticks across. `Add Role` top-right | the matrix row |
| 34 | **Log out** | Any page › Logout | **Logout confirmation dialog** over the user list, with `Cancel` / `Logout` | the dialog |

---

## Also needed alongside the screenshots

1. **Logo** — the bank lockup as it appears in the portal sidebar, plus a
   higher-resolution version for the title card. SVG or transparent PNG.
2. **Tenant URL** — whatever shows in the browser address bar.
3. **Market** — UAE or elsewhere. This decides whether the benchmark rate,
   credit bureau, national ID, region list and currency change, and three of
   those are spoken in the narration, not just shown.

## What I do with them

Composite each screenshot into the browser frame, apply the dim-and-outline
emphasis on the region named above, lay the caption band over it, cut to the
narration timings, and render to MP4 at the original 5:42.

## If a screen doesn't exist in the HSBC build

Tell me which number and I'll re-cut around it — but note that dropping a slide
re-numbers the `n / 34` counter on every caption after it, and dropping a whole
module changes the spoken line “Eleven modules, one platform.” Neither is a
problem, they just have to be done together.
