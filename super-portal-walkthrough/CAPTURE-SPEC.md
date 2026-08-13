# Capture spec — 34 screenshots, unbranded build

Hand this to your capture agent. Every shot is a real screen in the source
walkthrough, in order, with the navigation path and the exact UI state.

**This build carries no bank identity.** No logo, no bank name, no bank-derived
URL or reference codes, anywhere in frame. Section 2 lists every place the
branding leaks — that list matters more than the shot table, because most of the
leaks are in places nobody thinks to look.

---

## 1. Global rules — read before shot 1

**Capture clean. Do not add emphasis.** In the finished video each screenshot has
one region outlined and the rest of the frame dimmed. That is a post effect
applied in the edit — **not** something to reproduce. Send flat, unmodified
screenshots. The `HIGHLIGHT` column tells the editor where emphasis goes; the
capture agent can ignore it.

| Setting | Value |
|---|---|
| Viewport | **1920 × 1080**, device pixel ratio 2 if available |
| Format | PNG, lossless |
| Naming | `shot-01.png` … `shot-34.png` — the number **is** the slide number |
| Browser chrome | Include it. **One tab only**, on all 34 shots |
| Zoom | 100% on every shot. Mismatched zoom is the most visible flaw when slides cut together |
| Theme | Portal light theme |
| Scroll | Where a shot is mid-page, the `STATE` column says what must be in frame |

**Sidebar state is not uniform.** Most shots have it expanded with labels; shots
**2, 29 and 30** have it collapsed to icons. Marked per shot. A sidebar that
changes width for no reason reads as a mistake.

---

## 2. Going unbranded — every place the name leaks

Work through this before capturing. Items 3–7 are the ones that get missed.

| # | Where | Source build shows | Do instead |
|---|---|---|---|
| 1 | Sidebar lockup, every portal shot | Bank logo, top of nav | **Decision needed** — see below |
| 2 | Title card | Logo + bank name under the wordmark | Drop the subtitle line; `Super Portal` alone |
| 3 | **Browser address bar, all 34 shots** | Bank-derived subdomain | Serve from a neutral host, e.g. `demo.superportal.local` |
| 4 | **Application IDs** (shots 21, 22, 23) | Reference prefix encoding the bank | Re-seed with a neutral prefix, e.g. `APP_202600000211` |
| 5 | **Channel selector**, top-right (shots 7, 10, 17–21) | Bank name in the dropdown | Rename the channel — see below |
| 6 | **Channel column** (shots 21, 22) | Bank name on every result row | Same rename, flows through |
| 7 | **Publish dialog body** (shot 15) | Names product *and channel* in the sentence | Same rename, flows through |
| 8 | Channel card (shot 2) and channel chip (shot 3) | Bank name | Same rename |
| 9 | User's Channel field (shot 32) | Bank name chip | Same rename |
| 10 | **Pre-approval letter** (shot 28) | Bank logo in the letter header | Neutral or blank letterhead |
| 11 | Employer Name (shot 23) | A real-looking company | Synthetic employer |
| 12 | Customer name, ID number, DOB, mobile, email (shots 21–28) | Applicant PII | Seed synthetic records |

**A. Sidebar logo slot — DECIDED: the Appro logo.**

Which version depends on the surface it sits on, per the Appro contrast rule
(dark logo on light grounds, white logo on dark):

| Surface | Ground | Version |
|---|---|---|
| Portal sidebar (31 shots) | dark navy | **`logo-white`** |
| Title card | dark navy | **`logo-white`** |
| Pre-approval letter, shot 28 | white | **`logo-dark`** |

Three rules from the brand guidelines that apply here:

- **Never redraw or reconstruct the logo** — the supplied file only.
- **Scale by width only.** Native ratio is 3.45 : 1; height always follows.
  Never set both dimensions.
- **No recolouring, opacity, shadow, glow, outline or container box.** Only two
  versions exist, dark and white.

> ⚠️ **The sidebar logo must be configured in the portal *before* capture.** It
> is baked into all 31 screenshots at capture time — it cannot be composited in
> afterwards without masking every one of them. Whoever sets up the demo tenant
> needs to load `logo-white` into the channel branding slot as a setup step,
> not as an afterthought.

**B. What is the channel called?** It appears in eight shots and in the spoken
narration's sense of "channel". Something functional rather than invented —
`Direct Sales`, `Branch`, `Retail Banking`. Avoid a name that reads as a real
institution.

**Still needed:** the Appro logo files themselves. The branding skill documents
them but does not currently ship them, so please send `logo-white.png` (or
`.svg`) for the portal and title card, and `logo-dark` for the letterhead.

**Still market-identifying:** the benchmark rate, the credit bureau, the
national ID and the region list are UAE-specific. "No bank branding" doesn't
by itself remove those. If the CPO wants the clip to read as market-neutral
too, tell me — that one *does* reach the narration (three spoken references)
and would need the voice track re-cut. If nothing is said, I'll leave them.

---

## 3. The 34 shots

Module names match the portal's left nav.

### Login

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 1 | **Sign in** | Portal root, signed out | Split screen: product landing left (hero, product name, rate / tenure / max-amount stats), login card right with username filled, password masked, admin-credentials note box visible. `Powered by appro` footer stays | login card |

### Channel Management

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 2 | **Channels** | Channel Management | **Sidebar collapsed.** Channel list with search field; one channel card: channel name, city, `Active` pill, Mortgage Loan tile with its enabled tick | channel card |

### Product Setup

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 3 | **Product Details** | Product Setup › Product Management › open the product | `Status: Activated`; product type + channel chips; General Information grid (name, sub-type, min, max, age limit, min/max tenor, min salary); Pricing Matrix table with **5 scheme rows**; Features; Disclaimer; Delete/Edit | pricing matrix table |
| 4 | **Pricing Matrix — step 1** | …› Edit Pricing Matrix, step 1 | Stepper **1 of 3**. Scheme name, effective dates, rate type, base / floor / ceiling / stress, benchmark source + type, full fee block. `Next` visible | rate block: type, base, floor, ceiling |
| 5 | **Pricing Matrix — step 2** | …step 2 | Stepper **2 of 3**, step 1 ticked. Four factor rows, each with its values as removable chips. `Add New Factors`, `Back`, `Next` | all four factor rows |
| 6 | **Pricing Matrix — step 3** | …step 3 | Stepper **3 of 3**. Generated combination table, **≥10 rows** in frame, columns through the rate fields. `History Version` selector and `Submit` visible | the results table |

### Collateral Management

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 7 | **Consent & disclosure library** | Collateral Management | Consent list, each row with version, body preview, Last Updated By / Date, `View More` | first two rows |
| 8 | **Version history** | …› open the first consent | Single consent open, full clause text, Last Updated By / Date, `Edit` bottom-right, **History Version dropdown** top-right | History Version dropdown |
| 9 | **Edit in place** | …› Edit | Same consent with the **rich-text toolbar open** at the bottom, `Cancel` / `Save Changes` | editor toolbar + save row |

### Credit Decision — strategy

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 10 | **Segmentation** | Credit Decision › Strategies (Rule Engine) | Left: segment cards, **first expanded** — Manual Review toggle, residency and age rows, Delete / Add Segmentation / Duplicate. Right: that segment's filter panel with condition chips. `Publish` bottom-right | expanded segment card |
| 11 | **Edit segmentation** | …› Edit on that segment | **Modal open.** Name field, Manual Review off, one attribute (Age) **toggled on** showing Condition + value inputs, further attributes below off | the enabled attribute row |
| 12 | **Attribute library** | …› Edit Attributes | **Modal open.** Full attribute chip cloud, ~10 chips selected against the rest unselected | the chip cloud |
| 13 | **Filtration** | …› a filter group in edit mode | Filter rows in edit: nationality list, employment type, age band, income, length of service — each with info and delete icons. `Add criteria`, `Cancel`, `Save` | the criteria rows |
| 14 | **Deviation** | Credit Decision › Deviation | Deviation table (No / Criteria / Deviation Formula), **two rows** — an age rule and a bureau-score rule, each with formula chips. `Add Deviation` top-right | both rows |
| 15 | **Publish to Rule Engine** | …› Strategies › Publish | **Confirmation dialog open**, naming product and channel, `No` / `Yes`. ⚠ dialog text carries the channel name — see §2 item 7 | the dialog |
| 16 | **Confirmed** | …after Yes | Same page, **green success toast** top-right | the toast |

### Limit Assignment

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 17 | **63 calculated variables** | Limit Assignment › Calculated Variable | Formula list rendered as mathematics — **≥8 numbered rows** in frame | the large multi-line DBR formula |
| 18 | **Income Multiplier** | Limit Assignment › Income Multiplier › Decision Calculator tab | Group list left with one selected, Group Information centre, Income Multiplier panel right with **range slider** and enabled toggle | the range slider |
| 19 | **Decision Boundary** | …› Decision Boundary tab | Boundary table (Group Name / Group Information / Min / Max / Deviation Type / Action), **two group rows** | both rows |

### Conditional Offer

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 20 | **Higher Offer enabled** | Conditional Offer | Higher Offer card **toggled on** with its `Enabled` pill; pre-approval messages panel beneath showing the `0 / 10` counter and `Add message`; Conditional Offer card below, disabled | the Higher Offer card |

### Enquiry — application enquiry

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 21 | **Find any application** | Enquiry › Application Enquiry | Results table with the **search-type dropdown open**, all four options showing. Columns: Application ID, Customer Name, Type, Status, Nationality, Date, Channel. Pagination visible | the open dropdown |
| 22 | **Narrowed** | …search by email | Same table filtered to **exactly two rows**, same customer, one Completed and one in progress | both result rows |
| 23 | **The case file** | …open an application | Application Details header block: ID, status, dates, product type, identity fields, declared vs finalised income, employer, proposed limit, affordability, DSR before/after, rule-engine result, bureau score. Step table beneath | the details block |
| 24 | **Credit indicators** | …scroll to Credit Indicator | Panel expanded: bureau score, DBR, DTI, exposure, outstanding, overdue, active/closed contracts, contract dates — plus **Worst Payment Delay** and **Cheque Bounce** tables with 3/6/9/12/24-month columns | the indicator list |
| 25 | **Why it decided** | …› a step's `View More` | **Step details modal.** One segment `Pass` with its criteria table (criterion / formula / bank value / application value / status), a second segment `Failed` collapsed, and Limit Assignment Result listing **5 approved offers** | the offers list |
| 26 | **The arithmetic, exposed** | …expand one offer | Decision matrix: finalised income, multiplier value and status, limit based on multiplier, max DBR per policy, affordability, remaining DBR, final max DBR, existing DBR, DBR room, max eligibility, proposed limit, product bounds, boundary, approved limit, decision status | the calculation rows |
| 27 | **The evidence file** | …› Document tab | Document list in the right panel: ID front, ID back, selfie, signature, consent documents, bureau report, credit assessment report, pre-approval letter — each collapsible | the document list |
| 28 | **The customer letter** | …open the pre-approval letter | The rendered letter: date, salutation, pre-approved heading, terms table (finance type, reference, customer, amount, period, rate). ⚠ **letterhead logo must be neutral or absent** | the terms table |

### Manual Queue

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 29 | **Route to a queue** | Manual Queue › a case › Send Application | **Sidebar collapsed.** `Send Application` dialog open, two credit-queue radio options, `Cancel` / `Send` | the dialog |
| 30 | **Override, inside policy** | …› Override | **Sidebar collapsed.** Override modal with the **Product dropdown open** listing scheme variants, Offer field beside it, recalculated fields below (limit, tenor, eligibility, rate, instalments). `Cancel` / `Override` | product dropdown + offer row |

### Users Management

| # | Screen | Navigate to | State to capture | Highlight |
|---|---|---|---|---|
| 31 | **Users** | Users Management › User Management | User list (Name, User Role, Status toggle, Last Updated Date, Last Updated By), **10 rows**, pagination showing 2 pages. `Export` and `Add User` top-right | the top four rows |
| 32 | **View PII Data** | …› edit a user | Edit User Details: name, channel, department, approval level, max limit, role, email, mobile, product-type checkboxes, and the **View PII Data toggle set to Allowed** beside the Lock status | the View PII Data block |
| 33 | **Roles** | Users Management › Role Management | Role matrix: one row per role, one column per module, green ticks across. `Add Role` top-right | the matrix row |
| 34 | **Log out** | Any page › Logout | **Logout confirmation dialog** over the user list, `Cancel` / `Logout` | the dialog |

---

## 4. What happens after you send them

Each screenshot goes into the browser frame, gets the dim-and-outline emphasis
on the region named above, then the caption band, cut to the narration timings,
rendered to MP4 at the original 5:42.

**The narration needs no change for this build.** It never names a bank — it
says "the bank" throughout — so the existing voice track carries straight over.

## 5. If a screen doesn't exist in your build

Tell me the number and I'll re-cut around it. Note that dropping a slide
re-numbers the `n / 34` counter on every caption after it, and dropping a whole
module changes the spoken line "Eleven modules, one platform." Neither is
difficult, but they have to move together.

## 6. Quick checklist before you send

- [ ] All 34 files, `shot-01` … `shot-34`, 1920 × 1080
- [ ] One browser tab in every shot, 100% zoom
- [ ] Sidebar collapsed on 2, 29, 30 — expanded on the rest
- [ ] No logo, bank name, bank URL or bank-derived reference code anywhere
- [ ] Application IDs re-seeded with a neutral prefix
- [ ] Channel renamed consistently — it appears in eight shots
- [ ] Letter in shot 28 has neutral letterhead
- [ ] Customer and employer records synthetic
- [ ] No emphasis, outlines or annotation added
