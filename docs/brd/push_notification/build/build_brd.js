/* Appro BRD generator — Push Notification (customer journey)
 *
 * Structure (BRD skill): header, version history, table of contents, feature overview and key
 *   covered areas, detailed requirements, appendices (summary of changes, workflow, API
 *   reference, glossary).
 * House style (Application Cancellation in Super Portal V1.0): Arial · black CAPS H1 ·
 *   #156082 table headers with white bold text · thin #A6A6A6 borders · #FF5500 on the key
 *   screen only · cover = appro logo block, blue title, V + date, navy wordmark,
 *   confidentiality, contact strip · footer = confidentiality + four blue circles + page number ·
 *   THANK YOU page.
 * Client-facing: no Jira ticket references anywhere in this document.
 * Source: the RF push notification user story (docs/us/RF-3306_US_Push_Notification.md) and the
 *   Avanza Push Notifications specification v0.1.
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
const DOC_DATE = '28 September 2026';
const DMY = '28-09-2026';
const TITLE = 'Push Notification';
const SUBTITLE = 'Customer journey alerts in the Super App — Credit Card, Personal Loan and CASA';
const OUTFILE = path.join(ROOT, `BRD_Push_Notification_${VERSION}.docx`);
const CONFIDENTIAL = 'This is not a legally binding document. Highly confidential not to be shared without written consent.';

/* TOC page numbers measured on the pass-1 PDF (build/.toc.json); a dash until known */
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
const W = 9640;                                   // text width, twips (A4, 0.79 in margins)

/* ---------- inline markup: **bold**  [[TBC Owner]]  [[FLAG text]]  `mono` ---------- */
function runs(t, size = 20) {
  return String(t).split(/(\*\*[^*]+\*\*|\[\[(?:TBC|FLAG) [^\]]+\]\]|`[^`]+`)/).filter(Boolean).flatMap((s) => {
    if (s.startsWith('**')) return [new TextRun({ text: s.slice(2, -2), bold: true, size })];
    if (s.startsWith('[[TBC ')) return [
      new TextRun({ text: '⚠ ', bold: true, color: ORANGE, size, font: 'Segoe UI Symbol' }),
      new TextRun({ text: `TBC by ${s.slice(6, -2)}:`, bold: true, color: ORANGE, size })];
    if (s.startsWith('[[FLAG ')) return [
      new TextRun({ text: '\u26A0 ', bold: true, color: ORANGE, size, font: 'Segoe UI Symbol' }),
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
/* monospace sample block */
const codeBlock = (lines) => new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [W],
  borders: { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin },
  rows: [new TableRow({ cantSplit: true, children: [cell(lines.map((l) => new Paragraph({ spacing: { after: 0, line: 250, lineRule: LineRuleType.AUTO },
    children: [new TextRun({ text: l, font: 'Consolas', size: 17 })] })), { fill: 'F4F6F9', width: W })] })],
});

/* =======================  CONTENT DATA (from the user story)  ======================= */
const TRIGGERS = [
  ['**P01**', 'P0', 'CC · PL', 'AIP given (at least one offer displayed), or Credit Queue approves / overrides the application', 'ET15/NT06 · ET9'],
  ['**P01 (CASA)**', 'P0', 'CASA', 'Account application approved in principle', 'ET15/NT06 (CASA)'],
  ['**P02**', 'P0', 'CC · PL · CASA', 'Scheduled reminder once per day for 15 days, starting after the first offer is displayed', 'ET13 · NT02'],
  ['**P05**', 'P0', 'CC · PL · CASA', 'Credit or Sales team returns the case requesting documents from the customer', 'NT12'],
  ['**P06**', 'P0', 'CC · PL', 'Cooling-off end date reached (start + 5 days, configurable) with no customer action; application returns to Approved In Principle', 'ET55/NT24'],
  ['**P09**', 'P0', 'PL', 'Customer’s bank rejects the Direct Debit Authority', 'ET41/NT17'],
  ['**P04**', 'P1', 'CC · PL · CASA', 'Queue user rejects (Credit, Sale, Risk or Compliance), Rule Engine filtration fails, or minimum income not met', 'ET22/NT10 · ET8/NT11 · ET12 · ET19/NT07/NT08 · ET21/NT19'],
  ['**P08**', 'P1', 'PL', 'Customer’s bank accepts the Direct Debit Authority', 'ET40/NT21'],
  ['**P10**', 'P1', 'PL', 'Disbursement Checker approves and releases the disbursement', 'ET42/NT18'],
  ['**P11**', 'P1', 'CC · PL · CASA', 'Card issued (CC, CASA) or loan approved (PL)', 'ET37 · ET38 · NT13'],
  ['**P03**', 'P2', 'CC · PL · CASA', 'Offer validity (30 days) elapses with no acceptance', 'ET14/NT03'],
];
const CONTENT = [
  ['**P01**', 'Your %%PRODUCT_TYPE%%\noffer is ready', 'Tap to review your offer and continue your application.', 'Offer selection'],
  ['**P01 (CASA)**', 'Your account is approved', 'Tap to continue and complete your account opening.', 'Resume application'],
  ['**P02**', 'Your offer expires in\n%%COUNTING_DOWN%% days', 'Complete your application before your approval expires.', 'Offer selection'],
  ['**P05**', 'We need a document from you', 'Upload it to keep your application moving.', 'Document upload'],
  ['**P06**', 'Your application is active again', 'Your cooling-off period has ended. Tap to continue or cancel.', 'Application Ready to Continue screen, then KFS'],
  ['**P09**', 'Action needed on your direct debit', 'Your bank didn’t accept the authority. Tap to see next steps.', 'DDA screen / next steps'],
  ['**P04**', 'Update on your application', 'Tap to view the status of your\n%%PRODUCT_TYPE%% application.', 'Application status'],
  ['**P08**', 'Direct debit is set up', 'Your bank approved your direct debit. Tap to view your loan.', 'Loan details'],
  ['**P10**', 'Your loan is on its way', 'Funds will reach your account shortly. Tap for details.', 'Loan details'],
  ['**P11**', 'Your %%PRODUCT_TYPE%%\nis ready', 'Tap to see what happens next.', 'Product screen (card / loan / account)'],
  ['**P03**', 'Your offer has expired', 'You can reapply whenever you’re ready.', 'SDK start (new application)'],
];
const PARAM_HEAD = ['Parameter', 'Type', 'Required? (Y/N)', 'Description', 'Values / Data Source'];
const PARAM_W = [2250, 850, 1300, 1940, 3300];

/* =======================  COVER  ======================= */
const cover = [
  new Paragraph({ spacing: { before: 300, after: 0, ...IMGSPACE },
    children: [new ImageRun({ data: img('appro_wordmark_white_on_blue.png'), type: 'png', transformation: { width: 228, height: 69 } })] }),
  gap(520),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'BUSINESS REQUIREMENTS DOCUMENT', bold: true, size: 19, color: GREY, characterSpacing: 60 })] }),
  new Paragraph({ spacing: { after: 90 }, children: [new TextRun({ text: TITLE, bold: true, size: 52, color: BLUE })] }),
  new Paragraph({ spacing: { after: 340 }, children: [new TextRun({ text: SUBTITLE, size: 26, color: NAVY })] }),
  new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: `${VERSION}  /  ${DOC_DATE}`, bold: true, size: 24, color: NAVY })] }),
  new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: 'Prepared for Reem Bank', size: 21, color: GREY })] }),
  new Paragraph({ spacing: { after: 420, ...IMGSPACE }, alignment: AlignmentType.CENTER,
    children: [new ImageRun({ data: img('cover_hero.png'), type: 'png', transformation: { width: 600, height: Math.round(600 * dims('cover_hero.png').h / dims('cover_hero.png').w) } })] }),
  new Paragraph({ spacing: { after: 140, ...IMGSPACE },
    children: [new ImageRun({ data: img('appro_wordmark_navy.png'), type: 'png', transformation: { width: 130, height: 38 } })] }),
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC  ·  Customer Journey', size: 19, color: NAVY, bold: true })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: CONFIDENTIAL, size: 17, color: GREY })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({
    text: 'Based on the Reem Bank middleware Push Notifications specification v0.1 (Avanza, 25 September 2026). Items awaiting confirmation are listed in section 10.',
    size: 17, color: GREY })] }),
  new Paragraph({ spacing: { before: 60 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9', space: 6 } },
    children: [new TextRun({ text: 'appro.ae  ·  105, Arjaan Office Towers, Dubai Media City, UAE', size: 17, color: NAVY })] }),
];

/* =======================  BODY  ======================= */
const body = [
  /* ---- 1 ---- */
  h1('1. FEATURE OVERVIEW AND KEY COVERED AREAS'),
  p('This document describes the requirements for **Push Notification** in the Reem Bank customer journey for **Credit Card, Personal Loan and CASA**, on iOS and Android.'),
  p('Today the customer learns about decisions and required actions on an application — a credit decision, a Direct Debit Authority response, the end of the cooling-off period — by **email and in-app notification only**. When the customer is outside the Super App, nothing reaches the device, and the application waits until the customer returns.'),
  p('Push Notification adds a device-level alert at each agreed trigger event. The Appro platform sends the push request to the Reem Bank middleware Push API, following the same integration pattern as the existing SMS and email integration. When the customer taps the notification, the Appro journey opens at the screen where the application continues.'),
  p('This BRD covers the following areas:', { after: 60 }),
  bullet('**Trigger events and push content** — eleven notifications, each with its title, body and the screen it opens'),
  bullet('**Language** — English or Arabic, following the customer’s current language'),
  bullet('**Middleware integration** — the Push API request, headers and response'),
  bullet('**Response handling and automatic retry**'),
  bullet('**Duplicate and reminder control**'),
  bullet('**Audit trail** — one new step per push'),
  bullet('**Business rules** — personal data and excluded templates'),
  ...figure('Flow_Push_Notification_End_to_End.png', 640, 'How a push reaches the customer (green = start, amber = system action, blue = step, purple = end)'),
  p('**Key steps**', { after: 60, keepNext: true }),
  num('A trigger event is reached on the application, for example an offer is displayed or a document is requested.', 'steps'),
  num('The system builds one push for the event: the Push ID, the title and the body, in the customer’s current language.', 'steps'),
  num('The system sends the push request to the Reem Bank middleware Push API.', 'steps'),
  num('The middleware delivers the notification to the customer’s device through the Super App.', 'steps'),
  num('The customer taps the notification, and the Appro journey opens at the screen for that event.', 'steps'),
  num('The result is recorded in the application audit trail. A failed push is retried automatically and never blocks the application.', 'steps'),
  note('Push content is fixed per notification and is not configurable in Super Portal in this release. Customer actions on a notification (open, dismiss, ignore) are not tracked. Existing email and in-app notifications are unchanged.'),

  /* ---- 2 ---- */
  h1('2. SCOPE'),
  h2('2.1 Product scope'),
  p('**Credit Card, Personal Loan and CASA**, on **iOS and Android**. Each notification applies only to the products listed against it in section 3.'),
  h2('2.2 In-scope notifications'),
  bullet('**P01** — Offer ready (Credit Card, Personal Loan)'),
  bullet('**P01 (CASA)** — Account approved in principle (CASA)'),
  bullet('**P02** — Offer expiry reminder, once per day for 15 days (all products)'),
  bullet('**P03** — Offer expired (all products)'),
  bullet('**P04** — Update on the application after a rejection (all products)'),
  bullet('**P05** — Document requested from the customer (all products)'),
  bullet('**P06** — Application active again after the cooling-off period (Credit Card, Personal Loan)'),
  bullet('**P08** — Direct debit set up (Personal Loan)'),
  bullet('**P09** — Direct debit rejected by the customer’s bank (Personal Loan)'),
  bullet('**P10** — Loan on its way after disbursement (Personal Loan)'),
  bullet('**P11** — Product ready: card issued (Credit Card, CASA) or loan approved (Personal Loan)'),
  h2('2.3 Not in scope'),
  bullet('OTP messages — never sent as push (BR3).'),
  bullet('Bank and internal-user notifications — never sent as push (BR4).'),
  bullet('Configuring push content in Super Portal — content is fixed per notification in this release.'),
  bullet('Tracking customer actions on a notification — open, dismiss or ignore.'),
  bullet('Changes to the existing email and in-app notifications — they remain unchanged (BR1).'),

  /* ---- 3 ---- */
  h1('3. TRIGGER POINTS AND PUSH CONTENT'),
  h2('3.1 Trigger events'),
  p('A push is fired at the same trigger point as the existing email and in-app notification templates listed under Source templates. Existing email and in-app notifications remain unchanged.'),
  table(['Push ID', 'Priority', 'Applies to', 'Trigger event', 'Source templates'], TRIGGERS, [1150, 900, 1450, 4040, 2100]),
  p('Source templates: **ET** = email template, **NT** = in-app notification template, as configured in Communication Setup. Priority: P0 highest.', { after: 60 }),
  h2('3.2 Push content'),
  table(['Push ID', 'Title (EN, max 40 characters)', 'Body (EN, max 100 characters)', 'Opens at (deep-link screen)'], CONTENT, [1100, 3050, 3410, 2080]),
  ...figure('Previews_Push_Notifications.png', 620, 'The eleven notifications as the customer sees them (illustrative)'),
  h2('3.3 Content rules'),
  bullet('When the application reaches a trigger event and the product matches Applies to, the system must build **one push request** for that application.', 0, true),
  bullet('[%%PRODUCT_TYPE%%] and [%%COUNTING_DOWN%%] must be replaced with actual values before sending. No placeholder is ever shown to the customer.', 0, true),
  bullet('The title must not exceed **40 characters** and the body **100 characters**, after replacement.', 0, true),
  bullet('Content is fixed per Push ID and is not configurable in Super Portal in this release.'),
  h2('3.4 Language'),
  bullet('The push is sent in **English or Arabic**, following the language the customer is currently using.'),
  bullet('[[TBC Reem Bank Business]] Arabic title and body for every notification.'),

  /* ---- 4 ---- */
  h1('4. PUSH NOTIFICATION API INTEGRATION', { newPage: false }),
  p('The integration follows the Reem Bank middleware specification **Reem Payments API — Push Notifications v0.1** (Avanza, 25-09-2026). Items the specification does not yet answer are flagged [[FLAG TBC by Avanza]] and tracked in section 10.'),
  h2('4.1 Request details'),
  table(['Item', 'Value'], [
    ['**Method**', 'POST'],
    ['**Endpoint**', 'http://<MW URL>/api/notifications/push\n[[TBC Avanza]] MW URL per environment (SIT, UAT, PROD) and HTTPS'],
    ['**Authentication**', 'Bearer token\n[[TBC Avanza]] how the token is issued (endpoint, grant, expiry)'],
  ], [1900, 7740]),
  h2('4.2 Header parameters'),
  table(PARAM_HEAD, [
    ['stan', 'String', 'Y', 'Unique system audit trace number in each request', 'Generated by Appro, unique per request.\n[[TBC Avanza]] format and length'],
    ['Authorization', 'String', 'Y', 'Authorization header', 'Bearer <token>'],
    ['Content-Type', 'String', 'Y', 'Request format', 'application/json'],
    ['channel_id', 'String', 'Y', 'Channel id of the calling system', '[[TBC Avanza]] value assigned to Appro'],
  ], PARAM_W),
  h2('4.3 Request parameters'),
  table(PARAM_HEAD, [
    ['requestId', 'String', 'Y', 'Unique message id', 'Generated by Appro, unique per push.\n[[TBC Avanza]] same or new id on retry'],
    ['timestamp', 'String', 'Y', 'Request date-time', 'ISO 8601 UTC with milliseconds, e.g. 2026-09-28T06:49:02.366Z'],
    ['type', 'String', 'Y', 'Notification type', 'Fixed: **APPRO_NOTIFICATION**'],
    ['action.id', 'String', 'Y', 'Push identifier', 'Push ID from section 3, e.g. P01. P01 (CASA) is sent as P01 with action.value = CASA'],
    ['action.type', 'String', 'Y', 'NONE / POPUP / APPRO_JOURNEY', '**APPRO_JOURNEY** for every Push ID, so a tap opens the Appro journey.\n[[TBC Avanza]] behaviour of NONE / POPUP, and how the Super App hands action.id and action.value to the Appro journey'],
    ['action.value', 'String', 'Y', 'Product', 'CREDIT_CARD / PERSONAL_LOAN / CASA, from the application. NA is not used — every push belongs to an application'],
    ['recipient.mobilePhone', 'String', 'Y', 'Customer mobile number', 'From the application.\n[[TBC Avanza]] format (country code, ‘+’, spaces)'],
    ['recipient.customerId', 'String', 'Conditional', 'Customer CIF — required if ETB', 'ETB: customer CIF. NTB: not sent.\n[[TBC Avanza]] whether mobilePhone alone reaches an NTB customer'],
    ['recipient.email', 'String', 'N', 'Customer email', 'Not sent.\n[[TBC Avanza]] purpose'],
    ['content.title', 'String', 'Y', 'Push title', 'Per section 3.2, in the customer’s current language'],
    ['content.body', 'String', 'Y', 'Push body', 'Per section 3.2, in the customer’s current language'],
    ['content.message', 'String', 'N', 'Notification message', 'Sent empty ("").\n[[TBC Avanza]] purpose versus body'],
    ['content.language', 'String', 'Y', 'Language — en / ar', 'Customer’s current language.\n[[TBC Avanza]] case (en vs EN in the sample) and type (listed as Date Timestamp)'],
  ], PARAM_W),
  h2('4.4 Response parameters'),
  table(['Parameter', 'Type', 'Description', 'Values / Handling'], [
    ['messageId', 'String', 'Message id returned by the middleware', 'Recorded in the audit trail'],
    ['error.code', 'String', 'Result code', '**"000" = Processed Ok**\n[[TBC Avanza]] full code list, and which codes are retryable'],
    ['error.message', 'String', 'Result description', 'Recorded in the audit trail with error.code'],
  ], [2250, 850, 2600, 3940]),
  p('A sample request and response are in Appendix 3.', { after: 0 }),

  /* ---- 5 ---- */
  h1('5. RESPONSE HANDLING AND RETRY'),
  bullet('If the HTTP code is **20x** and [error.code] = **"000"** (Processed Ok) → the push is sent → audit trail Step Status = **Success** → the journey proceeds.'),
  bullet('Else → the system retries automatically after **X minutes**, up to **N attempts**. X and N are configurable.'),
  bullet('“Else” covers a timeout, any non-20x HTTP code and any [error.code] other than "000".', 1),
  bullet('[[TBC Avanza]] the full error-code list, and any code that should not be retried.', 1),
  bullet('If the push is still not successful after the last attempt → audit trail Step Status = **Failed** → the journey proceeds. A push failure must not block, delay or change the application status.'),
  bullet('The system tracks the API delivery result only. Customer actions on the notification (open, dismiss, ignore) are not tracked.'),
  ...figure('Flow_Push_Response_and_Retry.png', 600, 'Response handling and automatic retry (X and N configurable)'),

  /* ---- 6 ---- */
  h1('6. DUPLICATE AND REMINDER CONTROL', { newPage: false }),
  bullet('The system must send at most **one push per Push ID per trigger occurrence per application**. Consolidated templates (for example P04) must not generate more than one push for the same decision.'),
  bullet('**P02** is sent **once per day for 15 days** from the first offer display, and stops immediately once the customer selects an offer or the application is expired, cancelled or rejected.'),
  ...figure('Timeline_P02_Offer_Expiry_Reminder.png', 640, 'The P02 offer expiry reminder'),

  /* ---- 7 ---- */
  h1('7. AUDIT TRAIL'),
  p('Every push writes one entry to the application audit trail, visible in Application Enquiry. The application status is not changed.'),
  table(['Field', 'Value'], [
    ['[Application ID]', 'Current Application ID'],
    ['[Step]', '**Push Notification**'],
    ['[Step Details]', 'Send Push <Push ID> · stan · requestId · messageId — or error.code and error.message when the push is not sent'],
    ['[Start Time]', 'Date-time the request is sent'],
    ['[End Time]', 'Date-time of the response, or of the last timeout'],
    ['[Attempt No.]', 'n of N'],
    ['[Step Status]', '**Success** / **Failed**'],
    ['[Action by]', 'System'],
  ], [2600, 7040]),
  p('The Audit Trail screen has no attempt column, so the attempt is shown in Step Details, as in Figure 5.', { after: 0 }),
  ...figure('SC1_Audit_Trail_Push_Notification_Step.png', 640, 'Application Enquiry › Audit Trail — the new Push Notification step (composite over the UAT screen, illustrative values)'),

  /* ---- 8 ---- */
  h1('8. BUSINESS RULES', { newPage: false }),
  table(['No.', 'Rule'], [
    ['**BR1**', 'Push is additional; existing email and in-app notifications are unchanged.'],
    ['**BR2**', 'No personal data in the title or body: no name, Application ID, IBAN or amounts.'],
    ['**BR3**', 'OTP content (ET17, ET18, ET35, NT04, NT05) is never sent as push.'],
    ['**BR4**', 'Bank and internal-user templates are never sent as push.'],
  ], [1000, 8640]),

  /* ---- 9 ---- */
  h1('9. IMPACT ANALYSIS'),
  table(['Area', 'Impact', 'Screen'], [
    ['**Customer journey (Super App)**', 'A device notification at eleven trigger events. A tap opens the Appro journey at the screen for that event; existing journey screens are reused as the destinations.', PIC('ia_journey.png', 205)],
    ['**Middleware integration**', 'New outbound call from the Appro platform to the Reem Bank middleware Push API, following the SMS and email integration pattern. Endpoint, credentials and channel id per environment: see section 10.', PIC('ia_services.png', 165)],
    ['**Communication Setup**', 'No change. Existing email and in-app templates keep working as today and remain the trigger reference for each push. Push content is fixed per notification in this release and is not added to Communication Setup.', PIC('ia_comm.png', 205)],
    ['**Audit trail**', 'One new step, Push Notification, per push — with Success or Failed, the attempt count and the middleware references for tracing.', PIC('ia_audit.png', 205)],
    ['**Application status**', 'No change. A push — sent or not — never changes, blocks or delays the application.', PIC('ia_status.png', 205)],
    ['**Scheduling**', 'A daily run sends the P02 reminder for 15 days and stops as soon as the offer is selected or the application is expired, cancelled or rejected.', PIC('ia_reminder.png', 205)],
    ['**Reporting**', 'The API delivery result is tracked. Customer actions on a notification (open, dismiss, ignore) are not tracked.', 'No screen change'],
  ], [1900, 4240, 3500]),

  /* ---- 10 ---- */
  h1('10. OPEN QUESTIONS'),
  p('Each item carries Appro’s proposal. Confirming the proposal is enough to proceed.'),
  table(['#', 'Question', 'Owner', 'Appro proposal'], [
    ['1', 'MW URL for SIT, UAT and PROD. The specification shows http:// — confirm the endpoint is served over HTTPS.', 'Avanza', 'HTTPS in all environments'],
    ['2', 'How Appro obtains the Bearer token: token endpoint, grant type, expiry and refresh; UAT credentials.', 'Avanza', 'Please advise'],
    ['3', 'stan: format, length and uniqueness scope.', 'Avanza', 'Generated by Appro, unique per request, including each retry'],
    ['4', 'channel_id value assigned to Appro, per environment.', 'Avanza', 'Please assign'],
    ['5', 'requestId: format and length; on a retry, resend the same requestId so the middleware can de-duplicate?', 'Avanza', 'Same requestId on every retry of the same push'],
    ['6', 'action.type: behaviour of NONE, POPUP and APPRO_JOURNEY; how action.id and action.value reach the Appro journey on tap; when NA applies.', 'Avanza', 'APPRO_JOURNEY for every push; NA not used'],
    ['7', 'recipient.mobilePhone format: country code, ‘+’, spaces (the sample value has a trailing space).', 'Avanza', '971XXXXXXXXX — country code, digits only'],
    ['8', 'NTB customers have no CIF: is mobilePhone alone enough to reach them; omit customerId or send it empty?', 'Avanza', 'Omit customerId for NTB'],
    ['9', 'Purpose of recipient.email and of content.message versus body.', 'Avanza', 'email not sent; message sent empty'],
    ['10', 'Maximum title and body length supported by the Super App.', 'Avanza', 'Title 40, body 100 characters'],
    ['11', 'content.language type (listed as Date Timestamp) and case (en / EN); timestamp format and time zone.', 'Avanza', 'String, lower case en / ar; ISO 8601 UTC with milliseconds'],
    ['12', 'Full error.code list and messages, the HTTP codes returned, and any code that should not be retried.', 'Avanza', 'Success = HTTP 20x with "000"; anything else retried up to N'],
    ['13', 'Does "000 Processed Ok" mean accepted for delivery, or delivered to the device?', 'Avanza', 'Recorded as sent, not delivered'],
    ['14', 'Recommended request timeout and any rate limit (P02 runs daily).', 'Avanza', 'Please advise'],
    ['15', 'Arabic title and body for every notification.', 'Reem Bank Business', 'To be provided'],
  ], [520, 4640, 1300, 3180]),

  /* ---- Appendices ---- */
  h1('APPENDIX 1: SUMMARY OF CHANGES'),
  table(['Areas', 'Previous Behaviour', 'New Behaviour'], [
    ['**Customer alerts**', 'Email and in-app notification only', 'Email, in-app notification and **push notification**'],
    ['**Customer outside the Super App**', 'No device-level alert; the application waits for the customer to return', 'A device notification at eleven trigger events'],
    ['**Resuming the journey**', 'The customer opens the Super App and navigates to the application', 'A tap opens the Appro journey at the screen for the event'],
    ['**Offer expiry reminder**', 'Email and in-app reminders (ET13, NT02)', 'Plus a daily push (P02) for 15 days, stopping on selection, expiry, cancellation or rejection'],
    ['**Audit trail**', 'No push entries', 'One Push Notification entry per push, with the result and the middleware references'],
  ], [2300, 3400, 3940]),
  h1('APPENDIX 2: WORKFLOW', { newPage: false }),
  num('The application reaches a trigger event listed in section 3.1, and the product matches Applies to.', 'wf'),
  num('The system builds one push: Push ID, title and body in the customer’s current language, with placeholders replaced.', 'wf'),
  num('Duplicate control applies: at most one push per Push ID per trigger occurrence per application.', 'wf'),
  num('The system sends the request to the middleware Push API (attempt 1).', 'wf'),
  num('If the HTTP code is 20x and [error.code] = "000" → the push is sent; the audit trail records Success.', 'wf'),
  num('Otherwise the system waits X minutes and retries, up to N attempts.', 'wf'),
  num('After the last unsuccessful attempt, the audit trail records Failed.', 'wf'),
  num('In every case the journey continues and the application status is unchanged.', 'wf'),
  num('The middleware delivers the notification; on tap, the Super App opens the Appro journey at the deep-link screen.', 'wf'),
  p('The end-to-end flow is shown in Figure 1 and the retry logic in Figure 3.', { after: 0 }),

  h1('APPENDIX 3: API REFERENCE'),
  h2('Sample request'),
  codeBlock([
    '{',
    '  "requestId": "<unique id>",',
    '  "timestamp": "2026-09-28T06:49:02.366Z",',
    '  "type": "APPRO_NOTIFICATION",',
    '  "action": { "id": "P01", "type": "APPRO_JOURNEY", "value": "CREDIT_CARD" },',
    '  "recipient": { "mobilePhone": "9715XXXXXXXX", "customerId": "<CIF, if ETB>" },',
    '  "content": {',
    '    "title": "Your Credit Card offer is ready",',
    '    "body": "Tap to review your offer and continue your application.",',
    '    "message": "",',
    '    "language": "en"',
    '  }',
    '}',
  ]),
  h2('Sample response'),
  codeBlock([
    '{',
    '  "messageId": "0:1790341509514173%d5881a7ad5881a7a",',
    '  "error": { "code": "000", "message": "Processed Ok" }',
    '}',
  ]),
  h2('Product mapping'),
  table(['Product on the application', 'action.value'], [
    ['Credit Card', 'CREDIT_CARD'], ['Personal Loan', 'PERSONAL_LOAN'], ['CASA', 'CASA'],
  ], [4820, 4820]),

  h1('APPENDIX 4: GLOSSARY', { newPage: false }),
  table(['Term', 'Meaning'], [
    ['**AIP**', 'Approval In Principle — at least one offer is displayed to the customer'],
    ['**Appro journey**', 'The Appro onboarding journey (SDK) that runs inside the Super App'],
    ['**CIF**', 'The bank’s customer identification number'],
    ['**DDA**', 'Direct Debit Authority'],
    ['**ETB / NTB**', 'Existing-to-Bank / New-to-Bank customer'],
    ['**KFS**', 'Key Fact Statement'],
    ['**Middleware (MW)**', 'The Reem Bank integration layer, provided by Avanza'],
    ['**Push ID**', 'The identifier of each notification, P01 to P11'],
    ['**stan**', 'System audit trace number, unique per request'],
    ['**Super App**', 'The Reem Bank mobile app on iOS and Android'],
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

/* =======================  VERSION HISTORY + TOC (after body: H1S is filled)  ======================= */
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
  table(['Date', 'Version', 'Author', 'Change Description'], [[DMY, '1.0', 'Hailey, Appro', 'Created BRD']], [1700, 1300, 2600, 4040]),
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
