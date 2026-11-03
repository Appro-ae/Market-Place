/* Appro BRD generator — Salary Transfer (STL / FSTL) · Credit Card and Personal Loan
 *
 * House style (Application Cancellation in Super Portal V1.0): Arial · black CAPS H1 ·
 *   #156082 table headers with white bold text · thin #A6A6A6 borders · cover = appro logo
 *   block, blue title, V + date, navy wordmark, confidentiality, contact strip · footer =
 *   confidentiality + four blue circles + page number · THANK YOU page.
 * Client-facing: no ticket references anywhere in this document. No effort figures.
 * Source: the salary-transfer baseline of 04/10/2026 and the design agreed in the PO working
 *   sessions of 28/10–03/11/2026.
 *
 * Build: python3 build/build.py   (two passes — TOC page numbers come from pass 1)
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType, HeadingLevel,
  Footer, PageNumber, convertInchesToTwip, LineRuleType, Bookmark, InternalHyperlink,
  Tab, TabStopType, LeaderType,
} = require('docx');

const ROOT = path.join(__dirname, '..');
const A = path.join(ROOT, 'assets');
const img = (f) => fs.readFileSync(path.join(A, f));
const dims = (f) => { const b = img(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };

const VERSION = 'V1.0';
const DOC_DATE = '3 November 2026';
const DMY = '03-11-2026';
const TITLE = 'Salary Transfer';
const SUBTITLE = 'STL and FSTL in the digital journey — Credit Card and Personal Loan: one toggle, four customer cases, the account created along the way';
const OUTFILE = path.join(ROOT, `BRD_Salary_Transfer_CC_PL_${VERSION}.docx`);
const CONFIDENTIAL = 'This is not a legally binding document. Highly confidential not to be shared without written consent.';

let TOCPAGES = {};
try { TOCPAGES = JSON.parse(fs.readFileSync(path.join(__dirname, '.toc.json'), 'utf8')); } catch (e) { /* pass 1 */ }

/* ---------- palette ---------- */
const NAVY = '1A214D';
const BLUE = '3B7EF6';
const TH = '156082';
const BORD = 'A6A6A6';
const INK = '000000';
const GREY = '595959';
const ORANGE = 'FF5500';
const W = 9640;

/* ---------- inline markup ---------- */
function runs(t, size = 20) {
  return String(t).split(/(\*\*[^*]+\*\*|\[\[(?:TBC|FLAG) [^\]]+\]\]|`[^`]+`)/).filter(Boolean).flatMap((s) => {
    if (s.startsWith('**')) return [new TextRun({ text: s.slice(2, -2), bold: true, size })];
    if (s.startsWith('[[TBC ')) return [
      new TextRun({ text: '⚠ ', bold: true, color: ORANGE, size, font: 'Segoe UI Symbol' }),
      new TextRun({ text: `TBC by ${s.slice(6, -2)}:`, bold: true, color: ORANGE, size })];
    if (s.startsWith('[[FLAG ')) return [
      new TextRun({ text: '⚠ ', bold: true, color: ORANGE, size, font: 'Segoe UI Symbol' }),
      new TextRun({ text: s.slice(7, -2), bold: true, color: ORANGE, size })];
    if (s.startsWith('`')) return [new TextRun({ text: s.slice(1, -1), size: size - 1, font: 'Consolas' })];
    return [new TextRun({ text: s, size })];
  });
}

/* ---------- primitives ---------- */
const H1S = [];
function h1(text, o = {}) {
  const id = `sec${H1S.length + 1}`;
  H1S.push({ text, id });
  return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: o.newPage !== false,
    children: [new Bookmark({ id, children: [new TextRun(text)] })] });
}
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const p = (t, o = {}) => new Paragraph({ spacing: { after: o.after === undefined ? 130 : o.after },
  alignment: o.align, keepNext: o.keepNext, children: runs(t) });
const bullet = (t, level = 0, keepNext = false) => new Paragraph({ bullet: { level }, spacing: { after: 70 }, keepNext, children: runs(t) });
const num = (t, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 70 }, children: runs(t) });
const note = (t) => new Paragraph({ spacing: { before: 120, after: 160 },
  children: [new TextRun({ text: 'Note: ', bold: true, italics: true, size: 19, color: GREY }),
             new TextRun({ text: t, italics: true, size: 19, color: GREY })] });
const gap = (after = 160) => new Paragraph({ spacing: { after }, children: [] });
const IMGSPACE = { line: 240, lineRule: LineRuleType.AT_LEAST };

let FIG = 0;
function figure(file, width, text) {
  const d = dims(file);
  FIG += 1;
  return [
    new Paragraph({ spacing: { before: 140, after: 0, ...IMGSPACE }, alignment: AlignmentType.CENTER, keepNext: true,
      children: [new ImageRun({ data: img(file), type: 'png',
        transformation: { width, height: Math.round(width * d.h / d.w) } })] }),
    new Paragraph({ spacing: { before: 70, after: 220 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Figure ${FIG} — ${text}`, italics: true, size: 17, color: GREY })] }),
  ];
}
/* two phone screens side by side, one shared figure caption */
function phones(fileA, fileB, text, width = 215) {
  const mk = (f) => {
    const d = dims(f);
    return cell(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, ...IMGSPACE },
      children: [new ImageRun({ data: img(f), type: 'png',
        transformation: { width, height: Math.round(width * d.h / d.w) } })] }), { width: W / 2 });
  };
  FIG += 1;
  const cap = cell(new Paragraph({ spacing: { before: 70, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Figure ${FIG} — ${text}`, italics: true, size: 17, color: GREY })] }),
    { width: W, span: 2 });
  return [
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W / 2, W / 2],
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
                 right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
      rows: [new TableRow({ cantSplit: true, children: [mk(fileA), mk(fileB)] }),
             new TableRow({ cantSplit: true, children: [cap] })] }),
    gap(160),
  ];
}

/* ---------- tables ---------- */
const thin = { style: BorderStyle.SINGLE, size: 4, color: BORD };
const TBORDERS = { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin };
function cell(children, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    verticalAlign: o.valign || VerticalAlign.TOP,
    width: o.width ? { size: o.width, type: WidthType.DXA } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    columnSpan: o.span,
  });
}
const thCell = (t, width) => cell(new Paragraph({ spacing: { after: 0 },
  children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 18 })] }),
  { fill: TH, width, valign: VerticalAlign.CENTER });
const tdText = (t, width) => cell(String(t).split('\n').map((line) =>
  new Paragraph({ spacing: { after: 0 }, children: runs(line, 18) })), { width });
const tdPic = (c, width) => {
  const d = dims(c.file);
  return cell(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, ...IMGSPACE },
    children: [new ImageRun({ data: img(c.file), type: 'png',
      transformation: { width: c.w, height: Math.round(c.w * d.h / d.w) } })] }),
    { width, valign: VerticalAlign.CENTER });
};
const PIC = (file, w) => ({ __pic: true, file, w });
function table(headers, rows, widths) {
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: TBORDERS,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((t, i) => thCell(t, widths[i])) }),
      ...rows.map((r) => new TableRow({ cantSplit: true,
        children: r.map((c, i) => (c && c.__pic) ? tdPic(c, widths[i]) : tdText(c, widths[i])) })),
    ],
  });
}

/* =======================  COVER  ======================= */
const cover = [
  new Paragraph({ spacing: { before: 300, after: 0, ...IMGSPACE },
    children: [new ImageRun({ data: img('appro_wordmark_white_on_blue.png'), type: 'png', transformation: { width: 228, height: 69 } })] }),
  gap(480),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'BUSINESS REQUIREMENTS DOCUMENT', bold: true, size: 19, color: GREY, characterSpacing: 60 })] }),
  new Paragraph({ spacing: { after: 90 }, children: [new TextRun({ text: TITLE, bold: true, size: 52, color: BLUE })] }),
  new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: SUBTITLE, size: 26, color: NAVY })] }),
  new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: `${VERSION}  /  ${DOC_DATE}`, bold: true, size: 24, color: NAVY })] }),
  new Paragraph({ spacing: { after: 260 }, children: [new TextRun({ text: 'Prepared for Reem Bank', size: 21, color: GREY })] }),
  new Paragraph({ spacing: { after: 380, ...IMGSPACE }, alignment: AlignmentType.CENTER,
    children: [new ImageRun({ data: img('cover_hero_stl.png'), type: 'png', transformation: { width: 620, height: Math.round(620 * dims('cover_hero_stl.png').h / dims('cover_hero_stl.png').w) } })] }),
  new Paragraph({ spacing: { after: 140, ...IMGSPACE },
    children: [new ImageRun({ data: img('appro_wordmark_navy.png'), type: 'png', transformation: { width: 130, height: 38 } })] }),
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC  ·  Customer Journey', size: 19, color: NAVY, bold: true })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: CONFIDENTIAL, size: 17, color: GREY })] }),
  new Paragraph({ spacing: { after: 180 }, children: [new TextRun({
    text: 'Consolidates the salary-transfer baseline of 4 October 2026 and the design agreed in the working sessions of 28 October – 3 November 2026. Items awaiting confirmation are listed in section 10.',
    size: 17, color: GREY })] }),
  new Paragraph({ spacing: { before: 60 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9', space: 6 } },
    children: [new TextRun({ text: 'appro.ae  ·  105, Arjaan Office Towers, Dubai Media City, UAE', size: 17, color: NAVY })] }),
];

/* =======================  BODY  ======================= */
const body = [
  /* ---- 1 ---- */
  h1('1. FEATURE OVERVIEW AND KEY COVERED AREAS'),
  p('This document describes the requirements for **Salary Transfer** in the Reem Bank digital journey for **Credit Card and Personal Loan**.'),
  p('A salary-transfer product prices on the customer’s salary reaching their Reem Bank account. Three salary situations exist: **STL** — the salary already credits to a Reem Bank account; **FSTL** (future salary transfer) — the customer undertakes to move the salary to Reem Bank; **NSTL** — the salary stays with the current bank. Today the journey covers NSTL only; nothing detects an existing salary, nothing captures the transfer undertaking end-to-end, and a customer without a Reem account cannot complete a salary-transfer application at all.'),
  p('The design rests on four pillars:', { after: 60 }),
  bullet('**One toggle, four customer cases.** A single salary-transfer question on the details screen adapts to what the bank already knows: C1 new to bank, C2 salary already credits to Reem, C3 has an account but the salary is elsewhere, C4 banks with Reem but has no account. Each case asks only what the bank cannot derive.'),
  bullet('**The account is created along the way.** A customer without a Reem account (C1, C4) never leaves the journey: the current account and its IBAN are created at fulfilment, before the loan or card, by one core call that returns the account number and the IBAN.'),
  bullet('**The letter drives the release.** The salary-transfer letter is generated with the account IBAN, uploaded inside the journey, validated by operations, and the funds (PL) or the card activation (CC) wait for the first salary credit.'),
  bullet('**NSTL is untouched.** Toggle OFF keeps today’s flow: salaried IBAN, direct debit, immediate disbursal.'),
  ...figure('Flow_STL_End_to_End.png', 680, 'The agreed flow on one page — the journey decision model (top) and the fulfilment chain (bottom)'),
  p('**Key steps**', { after: 60, keepNext: true }),
  num('Before the details screen renders, the system classifies the customer (C1–C4) from the core account history, the products list and the credit bureau.', 'steps'),
  num('The customer answers the salary-transfer toggle; the case decides what, if anything, is asked.', 'steps'),
  num('Pricing and limits follow the Salary Type; the offer screen carries the grace control and the first-instalment date.', 'steps'),
  num('On acceptance, fulfilment runs in order: customer record (new to bank) → current account + IBAN (C1, C4) → loan or card.', 'steps'),
  num('For FSTL the loan funds are held (PL) or the card is created inactive (CC); the salary-transfer letter is issued with the IBAN and uploaded in the journey.', 'steps'),
  num('Operations validate the letter; reminders run on days 7, 10, 13 and 26; day 28 is the cut-off and day 30 the offer expiry.', 'steps'),
  num('The salary watcher polls the Reem account; the first salary credit releases the funds or activates the card with the salary-transfer pricing confirmed.', 'steps'),
  num('Every step is written to the application audit trail and tracked in Super Portal statuses.', 'steps'),
  note('The CASA opening journey itself is unchanged — the account created along the way reuses only the account-specific steps (account type, tax declarations, account KFS, debit-card preference). Emirates ID, selfie and address are never asked twice.'),

  /* ---- 2 ---- */
  h1('2. SCOPE'),
  h2('2.1 Product scope'),
  p('**Credit Card and Personal Loan.** The CASA product journey is out of scope (the in-journey account creation reuses its account-specific steps only). NSTL applications keep today’s behaviour on both products.'),
  h2('2.2 In-scope scenarios'),
  bullet('**R1** — C1 (new to bank), toggle ON: FSTL — customer record, account and IBAN created at fulfilment; letter and release flow.'),
  bullet('**R2** — C1, toggle OFF: NSTL as today (salaried IBAN, direct debit, immediate disbursal).'),
  bullet('**R3** — C2 (salary already credits to Reem, detected), toggle ON: STL confirmed — nothing further asked; loan to the existing account, funds released at creation; card active at creation.'),
  bullet('**R4** — C2, toggle OFF: standard (non-STL) pricing; repayment from the existing Reem account.'),
  bullet('**R5** — C3 (has an account, salary elsewhere), toggle ON: FSTL — existing account reused; the letter carries the existing IBAN.'),
  bullet('**R6** — C3, toggle OFF: NSTL as today.'),
  bullet('**R7** — C4 (banks with Reem, no account), toggle ON: FSTL — the account is created along the way; no exit from the journey.'),
  bullet('**R8** — C4, toggle OFF: NSTL as today.'),
  h2('2.3 Not in scope'),
  bullet('Business / WPS salary detection — the rules in this document cover salaried individuals.'),
  bullet('A security cheque — not required for any salary-transfer variant (BR8).'),
  bullet('Changes to the NSTL direct-debit flow, the credit decisioning engine or the CASA product journey.'),
  bullet('Configurable letter reminder ladders per product — the ladder is fixed in this release.'),
  bullet('Tracking of salary credits beyond the first one (ongoing salary-stop monitoring is a separate initiative).'),

  /* ---- 3 ---- */
  h1('3. CUSTOMER JOURNEY'),
  h2('3.1 One toggle, four cases'),
  p('The salary-transfer question lives on the **details screen** and stays visible in every case. Detection runs before the screen renders, so the toggle adapts its label and its follow-up questions to the case. There is no separate gate screen and the customer is never sent out of the journey to open an account first — a parallel application would invalidate the one in progress.'),
  table(['Case', 'Who', 'Toggle ON', 'Toggle OFF', 'Asked on the journey'], [
    ['**C1**', 'New to bank', 'FSTL — undertakes to move the salary', 'NSTL — as today', 'ON: expected first salary credit date\nOFF: salaried IBAN + disbursement account'],
    ['**C2**', 'Salary already credits to a Reem account (detected)', 'STL confirmed — label reads “my salary already credits to Reem Bank”', 'Standard pricing', '**Nothing.** Date, account and IBAN are already with the bank'],
    ['**C3**', 'Has a Reem account; salary elsewhere', 'FSTL — existing account reused', 'NSTL — as today', 'ON: expected first salary credit date\nOFF: salaried IBAN + disbursement account'],
    ['**C4**', 'Banks with Reem (loan or card); no account', 'FSTL — account created along the way', 'NSTL — as today', 'ON: expected first salary credit date\nOFF: salaried IBAN + disbursement account'],
  ], [700, 2340, 2600, 1700, 2300]),
  ...phones('SC1_Details_Salary_Toggle_FSTL.png', 'SC2_Details_C2_Nothing_Asked.png',
    'The details screen — left: C3 with the toggle ON (FSTL) asking only the salary credit date; right: C2 — salary detected, nothing asked'),
  ...phones('SC3_Details_C4_Account_Along_The_Way.png', 'SC8_Details_NSTL_IBAN_Disbursement.png',
    'Left: C4 — the banner announces the account created along the way; right: toggle OFF (NSTL) — salaried IBAN and the disbursement-account choice'),
  h2('3.2 Data points — asked versus derived'),
  table(['Data point', 'Asked?', 'Rule'], [
    ['Expected first salary credit date', '**FSTL only** (C1/C3/C4, toggle ON)', 'Sets the first-instalment derivation and the salary watcher window. For C2 it is read from the account history and never asked.'],
    ['Salaried IBAN', '**NSTL only** (toggle OFF)', 'Used for the direct debit, exactly as today. FSTL and STL never see an IBAN question.'],
    ['Disbursement account', '**NSTL only**', 'Default “credit my salary account”; a different own-name account as the exception.'],
    ['Grace period', '**Never asked as a question**', 'Derived default aligned to the salary credit date; adjustable once, on the offer screen (section 3.3).'],
    ['Relationship, account, salary presence', 'Never asked', 'Detected by the backend before the details screen renders (section 4).'],
  ], [2600, 2400, 4640]),
  h2('3.3 Offer and grace period'),
  bullet('The offer screen carries a **grace period control** beside amount and tenure. Bounds come from Product Setup / the pricing matrix; the default is the minimum grace that lands the first instalment on the first salary credit date after disbursal.'),
  bullet('Changing the grace recalculates the EMI and the first-instalment date inline; the offer can be accepted without touching the control. Grace-period interest appears in the EMI exactly once.'),
  bullet('The first-instalment date **with grace applied** shows on the offer, the KFS, the contract pack and the tracking screen. No grace field exists anywhere else in the journey.'),
  ...figure('SC4_Offer_Grace_Period.png', 230, 'The offer screen — grace adjusted here only, first instalment derived from the salary date'),
  h2('3.4 The salary-transfer letter'),
  bullet('Generated at fulfilment with the account IBAN — the new account’s IBAN for C1/C4, the existing one for C3.'),
  bullet('**Upload is mandatory inside the journey**; the application status screen accepts the letter until day 28.'),
  bullet('Reminders on **days 7, 10, 13 and 26**; **day 28** is the cut-off; **day 30** the offer expiry — the application terminates and the customer is informed.'),
  ...phones('SC5_Letter_Upload.png', 'SC7_Track_Statuses.png',
    'Left: the letter request with upload; right: application tracking through the salary-transfer statuses'),
  h2('3.5 The account created along the way (C1, C4)'),
  bullet('Only the account-specific steps of the account-opening journey are reused: account type (Current, pre-selected), tax declarations, account KFS and the debit-card preference.'),
  bullet('Emirates ID, selfie and address are **never asked again** — the loan or card journey already captured them.'),
  bullet('The account and its IBAN exist **before** the loan or card is created, and are written to it as the settlement account.'),
  ...figure('SC6_Account_Opening_Reused_Steps.png', 230, 'The reused account-opening steps for C1 and C4'),

  /* ---- 4 ---- */
  h1('4. SALARY TYPE DETECTION'),
  p('Detection runs in the backend after identification (Emirates ID scan and deduplication) and **before the details screen renders**, so the toggle can adapt. The customer is never asked what the bank can derive.'),
  table(['Order', 'Source', 'Rule', 'Outcome'], [
    ['1', 'Core account history', 'A salary credit on an own Reem current/savings account in the current or previous month (T / T-1)', '**STL confirmed** → case C2'],
    ['2', 'Core products list', 'Customer holds an active current/savings account', 'Distinguishes **C3** (has account) from **C4** (no account)'],
    ['3', 'Credit bureau report', 'Salary IBAN on the bureau report matches a Reem IBAN', '**Confirmatory** signal for case C2'],
    ['4', 'Deduplication result', 'No Reem relationship', '**C1** — new to bank'],
  ], [700, 2200, 4240, 2500]),
  note('Detection classifies the customer; it never blocks. When no salary can be verified, the customer simply answers the toggle and the standard income verification applies unchanged.'),

  /* ---- 5 ---- */
  h1('5. FULFILMENT'),
  h2('5.1 The order rule'),
  p('**The account and the IBAN are created before the loan or card.** The loan’s settlement fields need a valid account, and the letter needs the IBAN. One core call creates the account and returns the account number and the IBAN in the same response; the same service, with the account product as a parameter, serves both the full current account (C1, C4) and the repayment-only account used by the NSTL flow. The IBAN is sanity-checked before the letter is issued.'),
  h2('5.2 Personal Loan — FSTL'),
  table(['Step', 'What happens', 'Applies'], [
    ['15.1 Customer record', 'CIF created on the core system', 'C1 only — existing customers skip'],
    ['15.2 Account + IBAN', 'Current account created; account number and IBAN returned in one call', 'C1, C4 — C2/C3 reuse the existing account'],
    ['15.3 Loan creation', 'Loan booked with settlement = the salary account; **funds held**', 'All FSTL'],
    ['15.4 Letter issued', 'Salary-transfer letter generated with the IBAN; uploaded in the journey', 'FSTL'],
    ['15.5 Operations validate', 'Sales/Ops queue checks the letter against the application', 'FSTL'],
    ['15.6 Salary watcher', 'The system polls the salary account until the first salary credit lands', 'FSTL'],
    ['15.7 Release', 'Funds released; salary-transfer pricing confirmed; application Completed', 'FSTL — C2 releases at loan creation'],
  ], [1700, 5340, 2600]),
  ...figure('PL_FSTL_Fulfilment.png', 650, 'The Personal Loan FSTL fulfilment chain (workflow v2.0)'),
  p('**C2 (salary already credits):** the loan settles to the existing account and the funds release at creation — letter, hold and watcher do not apply. **NSTL:** today’s chain is unchanged — repayment account, loan creation, direct debit on the salaried IBAN, immediate disbursal.'),
  h2('5.3 Credit Card — FSTL'),
  table(['Step', 'What happens', 'Applies'], [
    ['17.1 Account + IBAN', 'Current account created on the core system; IBAN returned in one call', 'C1, C4 — C2/C3 reuse the existing account'],
    ['17.2 Card created INACTIVE', 'The card is created on the card system but stays inactive', 'All FSTL'],
    ['17.3 Letter issued', 'Salary-transfer letter with the IBAN; uploaded in the journey', 'FSTL'],
    ['17.4 Operations validate', 'Sales/Ops queue checks the letter', 'FSTL'],
    ['17.5 Salary watcher', 'Polls the salary account for the first salary credit', 'FSTL'],
    ['17.6 Activation', 'Card activated with the salary-transfer pricing and limit confirmed', 'FSTL — C2’s card is active at creation'],
  ], [1900, 5140, 2600]),
  ...figure('CC_FSTL_Fulfilment.png', 650, 'The Credit Card FSTL fulfilment chain (workflow v1.7)'),
  p('The customer record and card-system steps (CIF, account, card) run exactly as today before the fork; the salary-type fork sits after the card-system account creation. **NSTL:** the card is created active, as today.'),
  h2('5.4 Release conditions and the day-28/30 rule'),
  bullet('Release (PL funds / CC activation) requires **both**: the letter validated by operations **and** the first salary credit detected on the salary account.'),
  bullet('No letter by **day 28** → cut-off; the application terminates at **day 30** (offer expiry) and the customer is informed by email and in-app notification.'),
  bullet('A release never happens on the letter alone — the salary credit is the trigger; operations confirm through the Disbursement Maker and Checker exactly as today.'),

  /* ---- 6 ---- */
  h1('6. SUPER PORTAL'),
  h2('6.1 Status model'),
  ...figure('Flow_STL_Statuses.png', 640, 'The salary-transfer statuses between acceptance and completion'),
  table(['Status', 'Entered when', 'Exits to'], [
    ['**Awaiting STL Letter**', 'FSTL booking done (account + loan/card created, funds held or card inactive)', 'Awaiting STL Validation (letter uploaded) · Expired (day 30)'],
    ['**Awaiting STL Validation**', 'Letter uploaded in the journey or from the status screen', 'Awaiting First Salary Credit (approved) · Awaiting STL Letter (rejected, re-request)'],
    ['**Awaiting First Salary Credit**', 'Letter approved by operations', 'Completed (salary credit detected and release approved)'],
    ['**Completed**', 'Funds released / card activated', '—'],
  ], [2500, 3840, 3300]),
  h2('6.2 Queue work'),
  bullet('**Sales/Ops queue — letter validation:** view the uploaded letter, approve or reject with a reason; a rejection re-requests the letter from the customer within the day-28 window.'),
  bullet('**Disbursement Maker / Checker:** the maker confirms the first salary credit on the account, the checker approves the release — the same maker–checker pattern as today’s disbursement.'),
  bullet('**Fulfilment queue:** the first salary credit date field is mandatory by customer segment — derived and read-only for C2.'),
  h2('6.3 Application Details and documents'),
  p('Application Details (Application Enquiry) displays: **Salary Type** (STL / FSTL / NSTL), **Customer case** (C1–C4), **Grace Days**, **First Instalment Date**, and the **letter status**. The salary-transfer letter appears under View Documents with its validation result.'),
  ...figure('SC9_Portal_Application_Details.png', 300, 'Application Enquiry — the Application Details panel carrying the new fields'),
  h2('6.4 Audit trail'),
  p('Every salary-transfer event writes one structured entry, visible in Application Enquiry:', { after: 60 }),
  table(['Event', 'Step Details'], [
    ['Toggle answered', 'Salary transfer: ON/OFF · case C1–C4 · detected salary type'],
    ['Account created', 'Account ****<last 4> · IBAN AE**…<last 4> — written as settlement account'],
    ['Loan / card created', 'Booking reference · funds held (PL) / card inactive (CC)'],
    ['Letter received', 'Upload date · day <n> of 28'],
    ['Letter validated', 'Approved / Rejected with reason · by <user>'],
    ['Salary credit detected', 'Credit date · account ****<last 4>'],
    ['Release / activation', 'Released by Checker · salary-transfer pricing confirmed'],
  ], [2600, 7040]),
  ...figure('SC10_Portal_Audit_Trail.png', 620, 'Application Enquiry — the audit trail carrying the salary-transfer steps (illustrative rows on the live screen)'),
  h2('6.5 Communication Setup'),
  p('All templates below are **newly added in Communication Setup**; client communication is in banking English, signed “Reem Bank”, exactly one client email per decision.', { after: 60 }),
  table(['Template', 'Audience', 'Sent when'], [
    ['Letter request', '**Email (Client)**', 'FSTL booking done — carries the IBAN and the upload link'],
    ['Letter reminder', '**Email (Client)**', 'Days 7, 10, 13 and 26 while the letter is outstanding'],
    ['Letter approved / rejected', '**Email (Client)**', 'Operations decision; a rejection re-requests the letter'],
    ['Funds released / card activated', '**Email (Client)**', 'First salary credit detected and release approved'],
    ['Offer expiring / expired', '**Email (Client)**', 'Day 28 cut-off warning and day 30 expiry'],
  ], [3100, 2200, 4340]),
  h2('6.6 Product Setup'),
  bullet('**Salary Transfer Requirement** (Yes / No / Optional) and **First Salary Transfer Allowed** decide which products offer the toggle.'),
  bullet('Pricing and limits are grouped by **Salary Type**; the grace **minimum and maximum** come from the pricing matrix.'),

  /* ---- 7 ---- */
  h1('7. BACKEND LOGIC AND INTEGRATION'),
  p('All core calls run through the Reem Bank middleware, following the existing integration pattern.'),
  table(['Capability', 'Behaviour'], [
    ['**Salary detection**', 'Account-transactions enquiry on the customer’s own accounts; a salary-type credit in the current or previous month (T / T-1) confirms STL. The bureau salary IBAN match is confirmatory.'],
    ['**Account + IBAN creation**', 'One core call creates the account and returns the account number and the IBAN together. The account product is a parameter: full current account for C1/C4, repayment-only account for the NSTL chain. The IBAN is verified active before the letter is generated.'],
    ['**Loan creation (PL)**', 'Booked with the salary account in the settlement fields; the funds are **held** until the release event. The hold/release mechanism on the core system is an open item (section 10).'],
    ['**Card creation (CC)**', 'Created in inactive status; activation on the release event.'],
    ['**Salary watcher**', 'Scheduled account-transactions enquiry on the salary account from the expected salary date until the first salary credit is found, within the offer window.'],
    ['**Repayment**', 'STL/FSTL: instalments collected from the Reem salary account by **standing instruction** — no direct debit (the Central Bank direct-debit setup does not apply to an own-bank account). NSTL: direct debit on the salaried IBAN, unchanged.'],
    ['**Grace derivation**', 'Default grace = the minimum that lands the first instalment on the first salary credit date after disbursal, within the pricing-matrix bounds; re-validated on the actual release date.'],
  ], [2600, 7040]),

  /* ---- 8 ---- */
  h1('8. BUSINESS RULES', { newPage: false }),
  table(['No.', 'Rule'], [
    ['**BR1**', 'The customer is never sent out of the journey to open an account — a parallel application would invalidate the one in progress. The account is created at fulfilment (C1, C4).'],
    ['**BR2**', 'C2 (salary detected) is asked nothing: no date, no account selection, no IBAN. The toggle stays visible with the “salary already credits to Reem Bank” label.'],
    ['**BR3**', 'FSTL and STL never ask for an IBAN. The salaried IBAN and the disbursement-account choice belong to NSTL only.'],
    ['**BR4**', 'The salary-transfer letter is mandatory and uploaded inside the journey; the status screen accepts it until day 28; day 30 expires the offer.'],
    ['**BR5**', 'Grace is adjusted in exactly one place — the offer screen — within pricing-matrix bounds; the selected value maps downstream unchanged.'],
    ['**BR6**', 'Release (funds or card activation) requires the letter validated **and** the first salary credit detected; neither alone releases.'],
    ['**BR7**', 'NSTL keeps today’s flow end to end: salaried IBAN, direct debit, immediate disbursal, active card.'],
    ['**BR8**', 'No security cheque for any salary-transfer variant. Should Credit Policy require one for a segment, it is a physical instrument, capped at 120% of the loan value per the applicable Central Bank regulation, collected post-approval outside the digital journey.'],
  ], [1000, 8640]),

  /* ---- 9 ---- */
  h1('9. IMPACT ANALYSIS'),
  table(['Area', 'Impact', 'Screen'], [
    ['**Customer journey**', 'The salary-transfer toggle with case-driven questions on the details screen; the grace control and first-instalment date on the offer; the letter upload and the salary-transfer statuses on tracking. NSTL screens unchanged.', PIC('SC1_Details_Salary_Toggle_FSTL.png', 120)],
    ['**Status model**', 'Three new application statuses between acceptance and completion: Awaiting STL Letter, Awaiting STL Validation, Awaiting First Salary Credit.', PIC('Flow_STL_Statuses.png', 220)],
    ['**Queues**', 'Letter validation in the Sales/Ops queue; the Disbursement Maker confirms the salary credit and the Checker releases; the fulfilment-queue salary date is mandatory by segment.', PIC('SC10_Portal_Audit_Trail.png', 220)],
    ['**Application Enquiry**', 'Salary Type, customer case, Grace Days, First Instalment Date and letter status on Application Details; one structured audit entry per salary-transfer event.', PIC('SC9_Portal_Application_Details.png', 160)],
    ['**Communication Setup**', 'Five client email templates newly added: letter request, reminders, validation result, release/activation, expiry.', PIC('ia_comm.png', 205)],
    ['**Documents**', 'Salary Transfer Letter as a document type: generated with the IBAN, uploaded by the customer, validated in the queue, visible under View Documents.', PIC('SC5_Letter_Upload.png', 120)],
    ['**Product Setup**', 'Salary Transfer Requirement and First Salary Transfer Allowed flags; pricing and limit groups by Salary Type; grace bounds in the pricing matrix.', 'Configuration — no new screen'],
    ['**Core integration**', 'Account + IBAN creation (parameterised product), loan booked with settlement account and funds held, card created inactive, scheduled account-transactions enquiry for the salary watcher.', PIC('PL_FSTL_Fulfilment.png', 200)],
  ], [1700, 4440, 3500]),

  /* ---- 10 ---- */
  h1('10. OPEN QUESTIONS'),
  p('Each item carries Appro’s proposal. Confirming the proposal is enough to proceed.'),
  table(['#', 'Question', 'Owner', 'Appro proposal'], [
    ['1', 'The hold/release mechanism for FSTL loan funds on the core system (the loan is booked at fulfilment; funds must not reach the customer before the release event).', 'Reem Bank Core team', 'A posting restriction on the settlement account release, lifted by the Checker approval'],
    ['2', 'Debit-card issuance for the account created along the way — the card system exposes an enquiry only.', 'Reem Bank Cards', 'Launch with the account live and no debit card; issue the card as a follow-up'],
    ['3', 'The standing instruction for STL/FSTL repayment from the Reem salary account (no direct debit applies to an own-bank account).', 'Reem Bank Core team', 'Internal standing instruction created at booking, first collection on the first-instalment date'],
    ['4', 'Confirmation that no security cheque applies to any salary-transfer variant (BR8).', 'Reem Bank Credit Policy', 'Not required — the release condition and the bureau reporting carry the risk control'],
    ['5', 'Arabic copy: toggle labels, case banners, letter screens and the five email templates.', 'Reem Bank Business', 'To be provided before UAT'],
    ['6', 'Operations SLA for letter validation within the 28-day window.', 'Reem Bank Operations', 'Next business day'],
    ['7', 'C2 with the toggle OFF: the repayment account for the standard-priced loan.', 'Reem Bank Business', 'The existing Reem salary account — no direct debit needed'],
  ], [520, 4340, 1600, 3180]),

  /* ---- Appendices ---- */
  h1('APPENDIX 1: SUMMARY OF CHANGES'),
  table(['Areas', 'Previous Behaviour', 'New Behaviour'], [
    ['**Salary transfer**', 'NSTL only; the salaried IBAN field implies the salary question', 'One toggle with four detected customer cases; STL, FSTL and NSTL all priced and fulfilled'],
    ['**Customer without a Reem account**', 'Cannot complete a salary-transfer application', 'The current account and IBAN are created along the way at fulfilment (C1, C4)'],
    ['**Detected salary (C2)**', 'Asked the same questions as everyone', 'Asked nothing — date, account and IBAN derived from the bank’s own records'],
    ['**Grace period**', 'A field on the details screen', 'Derived default, adjusted once on the offer screen within pricing-matrix bounds'],
    ['**Release**', 'Disbursal on checker approval', 'FSTL: funds held / card inactive until the letter is validated **and** the first salary credit lands'],
    ['**Letter**', 'No in-journey letter handling', 'Issued with the IBAN, uploaded in the journey, validated by operations, reminder ladder to day 28, expiry day 30'],
  ], [2300, 3400, 3940]),

  h1('APPENDIX 2: CASE QUICK REFERENCE', { newPage: false }),
  table(['', 'C1 — New to bank', 'C2 — Salary at Reem', 'C3 — Account, salary elsewhere', 'C4 — No account'], [
    ['**Detected by**', 'Deduplication: no relationship', 'Salary credit T/T-1 + bureau match', 'Products list: has account; no qualifying credit', 'Products list: no account'],
    ['**Toggle ON asks**', 'First salary credit date', 'Nothing', 'First salary credit date', 'First salary credit date'],
    ['**Fulfilment**', 'CIF + account + IBAN, then loan/card', 'Loan/card to the existing account', 'Existing account reused; letter carries its IBAN', 'Account + IBAN created, then loan/card'],
    ['**Release**', 'On first salary credit', 'At creation', 'On first salary credit', 'On first salary credit'],
  ], [1540, 2040, 2020, 2060, 1980]),

  h1('APPENDIX 3: GLOSSARY', { newPage: false }),
  table(['Term', 'Meaning'], [
    ['**STL**', 'Salary transfer — the salary already credits to a Reem Bank account'],
    ['**FSTL**', 'Future salary transfer — the customer undertakes to move the salary to Reem Bank'],
    ['**NSTL**', 'No salary transfer — the salary stays with the current bank'],
    ['**C1–C4**', 'The four customer cases: new to bank; salary at Reem; account but salary elsewhere; relationship without an account'],
    ['**T / T-1**', 'The current or previous calendar month, used by the salary detection rule'],
    ['**Hold-and-release**', 'The loan is booked with the funds held (or the card created inactive) until the release conditions are met'],
    ['**Salary watcher**', 'The scheduled check on the salary account that detects the first salary credit'],
    ['**DDA**', 'Direct Debit Authority — the NSTL repayment instrument, unchanged'],
    ['**KFS**', 'Key Fact Statement'],
    ['**CIF**', 'The bank’s customer identification number'],
  ], [2300, 7340]),

  /* ---- Thank you ---- */
  new Paragraph({ pageBreakBefore: true, spacing: { before: 2600, after: 180 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'THANK YOU', bold: true, size: 60, color: BLUE })] }),
  new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC', size: 22, color: NAVY, bold: true })] }),
  new Paragraph({ spacing: { after: 320 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Customer Journey', size: 20, color: GREY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: IMGSPACE,
    children: [new ImageRun({ data: img('appro_wordmark_navy.png'), type: 'png', transformation: { width: 130, height: 38 } })] }),
];

/* =======================  VERSION HISTORY + TOC  ======================= */
const tocLine = (e) => new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: W, leader: LeaderType.DOT }],
  spacing: { after: 100 },
  children: [
    new InternalHyperlink({ anchor: e.id, children: [new TextRun({ text: e.text, size: 20 })] }),
    new TextRun({ children: [new Tab(), String(TOCPAGES[e.text] || '–')], size: 20 }),
  ],
});
const front = [
  new Paragraph({ pageBreakBefore: true, spacing: { after: 160 },
    children: [new TextRun({ text: 'VERSION HISTORY', bold: true, size: 26, color: INK })] }),
  table(['Date', 'Version', 'Author', 'Change Description'],
    [[DMY, '1.0', 'Hailey, Appro', 'Created BRD — Credit Card and Personal Loan salary transfer: the toggle and the four customer cases, detection, fulfilment with the account created along the way, the letter and the release flow.']],
    [1700, 1300, 2600, 4040]),
  gap(420),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'TABLE OF CONTENTS', bold: true, size: 26, color: INK })] }),
  ...H1S.map(tocLine),
];

/* =======================  DOCUMENT  ======================= */
const footer = new Footer({ children: [
  new Paragraph({ spacing: { before: 60, after: 20 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9' } }, children: [] }),
  new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [7240, 1200, 1200],
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
               right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ children: [
      cell(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: CONFIDENTIAL, size: 14, color: '808080' })] }), { width: 7240 }),
      cell(new Paragraph({ spacing: { after: 0, line: 200, lineRule: LineRuleType.AT_LEAST }, alignment: AlignmentType.RIGHT,
        children: [new ImageRun({ data: img('footer_dots.png'), type: 'png', transformation: { width: 47, height: 11 } })] }),
        { width: 1200, valign: VerticalAlign.CENTER }),
      cell(new Paragraph({ spacing: { after: 0 }, alignment: AlignmentType.RIGHT,
        children: [new TextRun({ size: 16, color: BLUE, bold: true, children: [PageNumber.CURRENT] })] }),
        { width: 1200, valign: VerticalAlign.CENTER }),
    ] })],
  }),
] });

const numberingLevel = { level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START,
  style: { paragraph: { indent: { left: 400, hanging: 300 } } } };
const doc = new Document({
  creator: 'Appro Onboarding Solutions FZ-LLC',
  title: `${TITLE} — BRD ${VERSION}`,
  description: SUBTITLE,
  styles: {
    default: { document: { run: { font: 'Arial', size: 20, color: '1A1A1A' },
                           paragraph: { spacing: { line: 276, lineRule: LineRuleType.AUTO } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Arial', size: 26, bold: true, color: INK },
        paragraph: { spacing: { before: 200, after: 200 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Arial', size: 22, bold: true, color: TH },
        paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'steps', levels: [numberingLevel] }, { reference: 'wf', levels: [numberingLevel] }] },
  sections: [{
    properties: {
      titlePage: true,
      page: { margin: { top: convertInchesToTwip(0.85), right: convertInchesToTwip(0.79),
                        bottom: convertInchesToTwip(0.85), left: convertInchesToTwip(0.79) } },
    },
    footers: { default: footer, first: new Footer({ children: [new Paragraph({ children: [] })] }) },
    children: [...cover, ...front, ...body],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(OUTFILE, b);
  console.log('written', path.relative(process.cwd(), OUTFILE), b.length, 'bytes ·', FIG, 'figures ·', H1S.length, 'TOC entries');
});
