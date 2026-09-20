/*
 * Application Revert in Super Portal — BRD generator (V1.0, client-facing)
 * Mimics the styling/structure of "Application Cancellation in Super Portal V1.0":
 *   Arial body · black CAPS headings · #156082 table headers · appro logo assets
 *   (extracted from the reference PDF) · SC screenshots with #FF5500 annotation ·
 *   flow diagram · THANK YOU page with contact strip.
 * Scope: Credit Card + Personal Loan. Screens rc1..rc5 + rcflow are composites
 * over real UAT captures (see s-r*.html builders / README).
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, BorderStyle, PageBreak, Header, Footer,
  PageNumber, VerticalAlign, ImageRun,
} = require('docx');

const TEAL  = '156082';   // table header fill sampled from the reference BRD
const BLUE  = '3B7EF6';   // cover / thank-you title blue
const BLACK = '000000';
const GREY  = '595959';
const BORD  = 'A6A6A6';

const FONT = 'Arial';
const CONTENT_W = 9026;   // A4 11906 - 2x1440 margins
const DIR = __dirname;
const A = f => path.join(DIR, 'assets', f);

/* ---------- inline **bold** / *italic* ---------- */
function runs(text, o = {}) {
  const base = { font: FONT, size: o.size || 22, color: o.color || BLACK };
  const out = [];
  for (const part of String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) out.push(new TextRun({ ...base, text: part.slice(1, -1), italics: true }));
    else out.push(new TextRun({ ...base, text: part, bold: !!o.allBold }));
  }
  return out;
}
const p = (text, o = {}) => new Paragraph({
  children: runs(text, o),
  spacing: { before: o.before ?? 40, after: o.after ?? 120, line: 264 },
  alignment: o.align,
});
const spacer = (h = 120) => new Paragraph({ children: [], spacing: { after: h } });
const h1 = t => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 140 },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 26, color: BLACK, font: FONT })],
});
const h2 = t => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: t, bold: true, size: 22, color: BLACK, font: FONT })],
});
const bullet = t => new Paragraph({ children: runs(t), bullet: { level: 0 }, spacing: { before: 30, after: 80, line: 264 } });
const sub = t => new Paragraph({ children: runs(t), bullet: { level: 1 }, spacing: { before: 20, after: 60, line: 258 } });

/* ---------- tables (reference style: #156082 header, thin grey borders) ---------- */
const B = { style: BorderStyle.SINGLE, size: 4, color: BORD };
function tbl(headers, rows, weights, o = {}) {
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map(w => Math.round(CONTENT_W * w / total));
  widths[widths.length - 1] = CONTENT_W - widths.slice(0, -1).reduce((a, b) => a + b, 0);
  const cell = (txt, i, isH) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: isH ? TEAL : 'FFFFFF', color: 'auto' },
    margins: { top: 90, bottom: 90, left: 110, right: 110 },
    verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({
      spacing: { before: 0, after: 0, line: 252 },
      children: isH
        ? [new TextRun({ text: String(txt ?? ''), bold: true, size: 21, color: 'FFFFFF', font: FONT })]
        : runs(String(txt ?? ''), { size: 21 }),
    })],
  });
  return new Table({
    columnWidths: widths, width: { size: CONTENT_W, type: WidthType.DXA },
    borders: { top: B, bottom: B, left: B, right: B, insideHorizontal: B, insideVertical: B },
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((hd, i) => cell(hd, i, true)) }),
      ...rows.map(r => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) })),
    ],
  });
}

/* ---------- images ---------- */
const img = (file, w, h) => new ImageRun({ data: fs.readFileSync(path.join(DIR, file)), transformation: { width: w, height: h }, type: 'png' });
const imgP = (file, w, h, o = {}) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: o.before ?? 120, after: o.after ?? 60 }, children: [img(file, w, h)],
});
const caption = t => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 220 },
  children: [new TextRun({ text: t, size: 22, color: BLACK, font: FONT })],
});
/* SC2/SC3 label|screen table, as in the reference */
function screenTable(rows) {
  const wL = Math.round(CONTENT_W * 0.18), wR = CONTENT_W - wL;
  return new Table({
    columnWidths: [wL, wR], width: { size: CONTENT_W, type: WidthType.DXA },
    borders: { top: B, bottom: B, left: B, right: B, insideHorizontal: B, insideVertical: B },
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: [
        new TableCell({ width: { size: wL, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: TEAL, color: 'auto' }, margins: { top: 90, bottom: 90, left: 110, right: 110 }, children: [new Paragraph({ children: [new TextRun({ text: '', size: 21, font: FONT })] })] }),
        new TableCell({ width: { size: wR, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: TEAL, color: 'auto' }, margins: { top: 90, bottom: 90, left: 110, right: 110 }, children: [new Paragraph({ children: [new TextRun({ text: 'Screen', bold: true, size: 21, color: 'FFFFFF', font: FONT })] })] }),
      ]}),
      ...rows.map(([label, file, w, h]) => new TableRow({ children: [
        new TableCell({ width: { size: wL, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 110, right: 110 }, verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({ spacing: { line: 258 }, children: runs(label, { size: 21 }) })] }),
        new TableCell({ width: { size: wR, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 110, right: 110 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img(file, w, h)] })] }),
      ]})),
    ],
  });
}

/* Impact table with a reference-screen column (visual-first rule) */
function impactTable(rows) {
  const weights = [19, 45, 36];
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map(w => Math.round(CONTENT_W * w / total));
  widths[2] = CONTENT_W - widths[0] - widths[1];
  const txtCell = (txt, i, isH) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: isH ? TEAL : 'FFFFFF', color: 'auto' },
    margins: { top: 90, bottom: 90, left: 110, right: 110 }, verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({ spacing: { before: 0, after: 0, line: 252 },
      children: isH ? [new TextRun({ text: txt, bold: true, size: 21, color: 'FFFFFF', font: FONT })] : runs(txt, { size: 21 }) })],
  });
  const imgCell = ([file, iw, ih, cap]) => {
    const w = 190, h = Math.round(w * ih / iw);
    return new TableCell({
      width: { size: widths[2], type: WidthType.DXA },
      margins: { top: 90, bottom: 90, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [img('assets/' + file, w, h)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: cap, size: 17, color: GREY, font: FONT })] }),
      ],
    });
  };
  return new Table({
    columnWidths: widths, width: { size: CONTENT_W, type: WidthType.DXA },
    borders: { top: B, bottom: B, left: B, right: B, insideHorizontal: B, insideVertical: B },
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: [txtCell('Area', 0, true), txtCell('Impact', 1, true), txtCell('Screen', 2, true)] }),
      ...rows.map(r => new TableRow({ cantSplit: true, children: [txtCell(r[0], 0, false), txtCell(r[1], 1, false), imgCell(r[2])] })),
    ],
  });
}

/* ================= CONTENT ================= */
const body = [];
const P = (...a) => body.push(...a.flat());
const BREAK = () => new Paragraph({ children: [new PageBreak()] });
const ctr = (text, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: o.before ?? 0, after: o.after ?? 60 }, children: runs(text, o) });

/* ---- Cover (mirrors reference cover) ---- */
P(
  new Paragraph({ spacing: { after: 0 }, children: [img('assets/logo_block.png', 170, 102)] }),
  spacer(2300),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
    new TextRun({ text: 'Application Revert in', bold: true, size: 56, color: BLUE, font: FONT }), new TextRun({ break: 1, text: 'Super Portal', bold: true, size: 56, color: BLUE, font: FONT }),
  ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'V1.0', bold: true, size: 44, color: BLUE, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: '19 September 2026', size: 22, color: GREY, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [img('assets/logo_navy.png', 165, 48)] }),
  spacer(3300),
  ctr('This is not a legally binding document', { size: 19 }),
  ctr('Highly confidential not to be shared without written consent', { size: 19 }),
  spacer(200),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [img('assets/contact_strip.png', 600, 71)] }),
  BREAK(),
);

/* ---- Feature overview ---- */
P(
  h1('Application Revert in Super Portal'),
  h2('FEATURE OVERVIEW'),
  p('This document describes the Super Portal **Application Revert** capability which allows authorised bank staff to return a **rejected** application to the queue it was rejected from, so that the responsible team can correct the credit parameters and re-decision the case without the customer reapplying. Once an application is rejected, the pre-dedupe *Existing Application Check* blocks any new application for the same customer for **30 days** — reverting the same application is the only remedy inside that window. The capability complements the existing Application Cancellation function and follows the same maker–checker governance. Key steps are as following:'),
  bullet("Bank user with '[Product] Revert Application' permission initiates the revert request from Application Enquiry, with a mandatory Revert Reason."),
  bullet("Revert Queue user with 'Evaluate Application' permission approves or rejects the request within a configurable time window."),
  bullet("If no decision is made within a configurable timeout period, the request is **auto-approved by the System** — the same timeout behaviour as Application Cancellation. For example, if a timeout period is defined as 5 days, when there is no approve/ reject decision for a revert request in Revert Queue, the system approves the request and the application status changes from 'Rejected' to **'Awaiting Credit Approval'** (Credit Queue L1)."),
  imgP('Flow_Application_Revert.png', 600, 223, { before: 200 }),
  spacer(80),
  p('Applicable products: **CC, PL**. *(CASA is excluded — it has no credit decisioning; Mortgage Loan and Auto Loan are not yet part of the platform scope.)*'),
  p('Scope rule: only rejections with a **Credit root cause** are revertible — **rejected by Credit** in Credit Queue, or **auto-rejected by the System for credit reasons**. The **in-scope rejection cases** are exactly the following five:'),
  bullet('**R1** — Rejected by **Credit user** in Credit Queue (L1–L3).'),
  bullet('**R2** — Auto-rejected by System: **Existing DBR > 50%** after calculation *(parked into Credit Queue L1 under this change; a subsequent Credit rejection is then revertible as R1)*.'),
  bullet('**R3** — Auto-rejected by System: **Gross DBR > 100%** *(same parking treatment as R2)*.'),
  bullet('**R4** — Auto-rejected by System: application **fails all segmentations** (rejection logic unchanged).'),
  bullet('**R5** — Auto-rejected by System: **approved limit below Min Boundary**, no deviation (rejection logic unchanged).'),
  p('**Not revertible:** rejections by Compliance Queue, Risk Queue or Sale Queue (no Credit root cause), and pre-decision terminations (pre-dedupe, no applicable product, AML, geo-fencing, EID-scan, EFR liveness) — see the restriction table below.'),
  tbl(
    ['Product Type', 'Applicable Status that can be reverted in Super Portal'],
    [
      ['CC', 'Rejected — where the rejection trigger point is revertible (see table below and section 5)'],
      ['PL', 'Rejected — where the rejection trigger point is revertible (see table below and section 5)'],
    ],
    [22, 78],
  ),
  spacer(160),
  p('The revert applies to the below rejection trigger points:'),
  tbl(
    ['#', 'Rejection trigger point', 'Revert outcome'],
    [
      ['1', 'Rejected by Credit user in Credit Queue (L1–L3)', "Back to 'Awaiting Credit Approval' — Credit Queue L1"],
      ['2', 'Auto-rejected by System — Existing DBR > 50% after calculation', "System change: the case is parked into Credit Queue L1 ('Awaiting Credit Approval') instead of auto-rejecting — same Failed Reason message as today, with Rule Engine and Limit Assignment results available in the queue view. A subsequent Credit rejection then reverts under row 1 (see section 5)"],
      ['3', 'Auto-rejected by System — Gross DBR > 100% safety net', 'Same treatment as row 2 — parked into Credit Queue L1 instead of auto-rejecting, with the same Failed Reason message and completed Rule Engine / Limit Assignment results'],
      ['4', 'Auto-rejected by System — application fails all segmentations (rejection logic unchanged)', "Back to 'Awaiting Credit Approval' — Credit Queue L1"],
      ['5', 'Auto-rejected by System — approved limit below Min Boundary, no deviation (rejection logic unchanged)', "Back to 'Awaiting Credit Approval' — Credit Queue L1"],
    ],
    [6, 40, 54],
  ),
  spacer(160),
  p('The revert shall be restricted in below scenarios:'),
  tbl(
    ['Scenario', 'Condition / Application Status'],
    [
      ['Bank users already initiated revert', 'Revert_App = TRUE (a revert request is already pending in the Revert Queue)'],
      ['Rejection has no Credit root cause', 'Rejected by Compliance Queue, Risk Queue or Sale Queue — only Credit-root-cause rejections are revertible (rejected by Credit, or auto-rejected by the System for credit reasons)'],
      ['Application is not rejected', "Any Application Status other than 'Rejected' — Lead | In Progress | Awaiting Compliance Review | Awaiting Risk Review | Awaiting Sales Response | Awaiting Credit Approval | Approval In Principle | Awaiting Cooling Off Period | Awaiting Signature | KFS Signature | User Initiated Cancellation | Completed"],
      ['Application already terminated for another reason', 'Invalidate | Insufficient Data | Declined | Cancelled | Failed by Minimum Income | Expired | Blocked | Failed By EFR'],
      ['Rejection trigger point is not revertible', 'Pre-dedupe check failure (Step 7.1) | No applicable product found ({Pre-Fetch Applicable Product}) | AML blacklisted or AML callback decision = rejected | geo-fencing, EID-scan or EFR liveness terminations. These failures occur before any queue takes ownership of the case, so there is no previous queue status to return the application to.'],
    ],
    [30, 70],
  ),
);

/* ---- End-to-end flow ---- */
P(
  h1('End-to-End Application Revert Flow from Super Portal'),
  h2('1. Role Management: Revert Application Permission'),
  bullet("Bank users must only be able to request a revert if they have been explicitly granted the 'Revert Application' permission within their Super Portal role."),
  bullet("A new role permission named **'Revert Application'** shall be added under the **Enquiry** module, **Application Enquiry** sub-module in the Role Management section of the Super Portal — **per product tab**, alongside the existing 'View Application' and 'Cancel Application' permissions: '[Credit Card] Revert Application' and '[Personal Loan] Revert Application'."),
  imgP('SC1_Role_Permission_Application_Enquiry.png', 600, 338),
  caption("SC1: Add Role screen: Enquiry > Application Enquiry > “Revert Application” permission"),
  tbl(
    ['Component', 'Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['[Credit Card] Revert Application Checkbox', 'Checkbox', 'Yes', 'N/A', "Selectable checkbox to grant or revoke the 'Revert Application' permission for Credit Card applications. It indicates whether the role holder can request application reverts."],
      ['[Personal Loan] Revert Application Checkbox', 'Checkbox', 'Yes', 'N/A', "Selectable checkbox to grant or revoke the 'Revert Application' permission for Personal Loan applications."],
      ['Revert Application Label', 'Label', 'N/A', 'N/A', 'Descriptive label shown alongside each checkbox, identifying the permission name.'],
    ],
    [21, 14, 13, 16, 36],
  ),
  spacer(160),
  bullet('Permission behaviour:'),
  tbl(
    ['Permission Value', 'Allowed Actions'],
    [
      ['[Product] Revert Application = TRUE', "Users can view the 'Revert' button on the Application Enquiry details screen for that product and submit revert requests for Checker approval."],
      ['[Product] Revert Application = FALSE', "Users cannot view the 'Revert' button. Users cannot request application reverts."],
    ],
    [30, 70],
  ),
  spacer(80),
  p("*'Revert Application' is a distinct right from 'Cancel Application' and from the Revert Queue 'Evaluate Application' permission, so requesting and approving can be granted to different populations. Maker–checker segregation follows the same model as Application Cancellation.*", { size: 21 }),
);

P(
  h2('2. Application Revert from Application Enquiry view'),
  bullet("The existing Application Enquiry module in the Super Portal is the entry point for the revert process. Bank users with the 'Revert Application' permission above can initiate a revert request from the Application Details screen."),
  bullet("The **'Revert'** button is placed in the action bar next to the existing 'Cancel Application' button, and is enabled only when Application Status = 'Rejected', the rejection trigger point is revertible (section 5), and no revert request is already pending."),
  bullet("**Status shown in Application Enquiry after reverting:** while the revert request is pending, the Application Details view continues to show Application Status = **'Rejected'** (Revert_App = TRUE; the Revert button is disabled because a request is pending). Once the revert is **approved** — by the Checker or by the System on timeout — Application Enquiry displays **'Awaiting Credit Approval'**, the application history shows the revert audit steps (section 3 and 4.3), and the Revert button is no longer available since the status is no longer 'Rejected'. If the revert is **rejected**, the view stays 'Rejected' and the Revert button is enabled again for a fresh request."),
  spacer(60),
  screenTable([
    ["SC2 – Application Enquiry – “Revert” button for the revert request", 'SC2_Application_Enquiry_Revert_Button.png', 440, 248],
    ['SC3 – Revert Confirmation Popup', 'SC3_Revert_Confirmation_Popup.png', 310, 228],
  ]),
  spacer(200),
  tbl(
    ['Component', 'Type', 'Mandatory', 'Editable', 'Description'],
    [
      ['Revert Button', 'Button', 'N/A', 'N/A', "Visible only to users with the '[Product] Revert Application' role. Enabled only for a revertible rejected application with no request already pending. It initiates the revert request for the selected application."],
      ['Revert Confirmation Popup (SC3)', 'Modal Popup', 'N/A', 'N/A', 'Presented when the Revert button is clicked. Requires the user to confirm and provide a Revert Reason before proceeding.'],
      ['Confirmation Message', 'Static Text', 'N/A', 'N/A', "'Are you sure you want to revert the Application? The request will be sent to the Revert Queue for Checker approval.'"],
      ['Revert Reason', 'Text input', 'Yes', 'Yes', "Free-text mandatory field labelled 'Revert Reason *'. Help text: 'Enter your comment'. Users must enter a reason before confirming; the reason is shown to the Checker."],
      ['Yes, Revert Button', 'Button', 'N/A', 'N/A', 'Confirms the request. This sends the application to the Revert Queue for approval.'],
      ['Back Button', 'Button', 'N/A', 'N/A', 'Dismisses the popup. Returns user to Application Details screen. No change to the application.'],
    ],
    [17, 14, 16, 13, 40],
  ),
);

P(
  h2('3. Impact of revert submission'),
  p("When the user clicks 'Yes, Revert' to proceed with the revert submission:"),
  bullet('The Revert Reason is saved as a Comment against the Application details with details as **“REVERT REASON: <reason inputted by user>”** (comment title <<User’s name>> <<Department name>>, footer <<Posted Date time>> hh:mm AM/PM | DD MM YYYY).'),
  bullet('**Revert_App = TRUE** is set on the application (a new flag mirroring the existing Cancel_App flag). **Application Status remains “Rejected”** — no new application status is introduced, so the mobile application is unaffected and the customer sees no change while the request is pending.'),
  bullet("The **target queue and status** are resolved per section 5 at submission time and stored on the request — in this scope always **'Awaiting Credit Approval' — Credit Queue Level 1**."),
  bullet("Audit trail is captured with: Step = **'Manually initiate revert'**, State = **'User Initiated Revert'**, Step Status = 'Successful', Step Details = **'Revert requested by %Username% to Credit Queue. Revert reason is <REVERT_REASON captured above>'**, Action by = <user email id>."),
  bullet('The application is automatically dropped into the **Revert Queue** for further review and approval upon submission of the revert request.'),
);

P(
  h2('4. Revert Queue'),
  p('The Revert Queue is a new queue within the Super Portal that allows users to review and make decisions on applications that have been submitted for revert. It provides governance and an approval layer before a rejection is reopened.'),
  h2('4.1. Revert Queue Menu'),
  p("'Revert Queue' shall appear as an entry in the Queue menu of the Super Portal, alongside existing queues (e.g. Transaction Post Queue, Checker Queue, Termination Queue, etc.)."),
  imgP('SC4_Queue_Menu_Revert_Queue.png', 285, 261),
  caption('SC4: Revert Queue'),
  h2('4.2. Role Information for Revert Queue'),
  imgP('SC5_Role_Permission_Revert_Queue.png', 600, 338),
  caption('SC5: Role permission for Revert Queue'),
  p("A new queue entry, 'Revert Queue', shall be added under the Manually Queue section in Role Management (Add Role screen). Two role permissions are available per product ([Credit Card] / [Personal Loan]) — View Application & Evaluate Application:"),
  tbl(
    ['Permission', 'Value', 'Access Granted'],
    [
      ['View Application (Revert Queue)', 'TRUE', 'Users can access Revert Queue list view AND view Application Details for that product.'],
      ['', 'FALSE', 'Users cannot see the Revert Queue in the Queue menu for that product.'],
      ['Evaluate Application (Revert Queue)', 'TRUE', 'Users can see and click the Approve / Reject buttons in Revert Queue Application Details.'],
      ['', 'FALSE', 'Users cannot see the Approve or Reject buttons.'],
    ],
    [30, 10, 60],
  ),
);

P(
  h2('4.3. Approve Revert'),
  imgP('SC6_Revert_Queue_Approve_Reject.png', 600, 338),
  caption('SC6: Revert Queue — Application Details with Approve / Reject'),
  p("When the user with Evaluate Application permission as TRUE clicks 'Approve' in Revert Queue:"),
  bullet("System displays confirmation popup: 'Are you sure you want to Approve the application revert?'"),
  bullet("If user clicks 'Cancel': popup closes, no action taken."),
  bullet("If user clicks 'Yes, Approve': system proceeds with the revert."),
  sub('Application Status changes from "Rejected" to **"Awaiting Credit Approval"** and the application re-enters **Credit Queue at Level 1** (section 5). Revert_App = FALSE.'),
  sub('Application is removed from Revert Queue ([Revert Queue] = ‘APPROVED’). Toaster: “Revert of <Application ID> is approved”.'),
  sub("Audit trail is captured with: Step = 'Revert Queue', State = 'Awaiting Credit Approval', Step Detail = 'Application revert requested by “%Username%” and approved by “%Username%”. Application returned to Credit Queue L1', Action by = <System>."),
  sub('Email notification is sent to the bank user who requested the revert to inform them of the outcome.'),
  tbl(
    ['Type', 'Subject', 'Content', 'Trigger'],
    [['Email (Bank)', '[Super Portal] - Application %%APPLICATION_ID%% revert is approved.', "Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% has been approved. The application status has changed from 'Rejected' to 'Awaiting Credit Approval' and the application has been returned to Credit Queue. Best Regards, Reem Bank", 'One time – send immediately when the revert is approved in Revert Queue, or auto-approved by System on timeout']],
    [15, 22, 40, 23],
  ),
  spacer(200),
  h2('4.4. Reject Revert'),
  p("When the user with Evaluate Application permission as TRUE clicks 'Reject' in Revert Queue:"),
  bullet("System displays confirmation popup: 'Are you sure you want to Reject the application revert?'"),
  bullet("If user clicks 'Cancel': popup closes, no action taken."),
  bullet("If user clicks 'Yes, Reject': the revert request is rejected and the application is unchanged."),
  sub('Application Status remains **“Rejected”**; Revert_App = FALSE (a fresh request may be raised later if new information emerges).'),
  sub('Application is removed from Revert Queue ([Revert Queue] = ‘REJECTED’). Toaster: “Revert of <Application ID> is rejected”.'),
  sub("Audit trail is captured with: Step = 'Revert Queue', State = 'Rejected', Step Detail = 'Application revert requested by “%Username%” and rejected by “%Username%”', Action by = <System>."),
  sub('Email notification is sent to the bank user who requested the revert to inform them of the outcome.'),
  tbl(
    ['Type', 'Subject', 'Content', 'Trigger'],
    [['Email (Bank)', '[Super Portal] - Application %%APPLICATION_ID%% revert is not approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% is rejected. The application remains Rejected. Best Regards, Reem Bank', 'One time – send immediately when the revert request is rejected by Checker in Revert Queue']],
    [15, 22, 40, 23],
  ),
);

P(
  h2('4.5 Timeout scenario if no decision taken in the Revert Queue within a pre-defined period'),
  p('A configurable timeout period of [X] days begins when the revert request is submitted (proposed default: 5 days, configurable in database — matching the cancellation timeout). The following outcomes apply:'),
  tbl(
    ['Scenario', 'Outcome'],
    [
      ['Request is APPROVED in Revert Queue within [X] days', "Application status changes from 'Rejected' to 'Awaiting Credit Approval' and the application re-enters Credit Queue at Level 1. Please refer to 4.3 above."],
      ['Request is REJECTED in Revert Queue within [X] days', 'Application remains “Rejected”. Please refer to 4.4 above.'],
      ['No decision taken within [X] days', "The request is **auto-approved by the System** the next day after the timeout period ends — the same behaviour as the Application Cancellation timeout. Application status changes from 'Rejected' to **'Awaiting Credit Approval'**, the application re-enters **Credit Queue at Level 1**, Revert_App = FALSE, and it is removed from the Revert Queue. Audit trail is captured with: Step = ‘Auto Revert Approval on timeout’, State = 'Awaiting Credit Approval', Step Detail = ‘Application revert requested by “%Username%” and approved by System, as per approval timeout configuration of [X] days. Application returned to Credit Queue L1’, Action by = <System>. Email notification is sent to the bank user who requested the revert — same email as in 4.3."],
    ],
    [30, 70],
  ),
);

P(
  h2('5. Revert target status determination'),
  p('The revertibility of an application is determined by **how it became Rejected** — the system derives the rejection root cause from the audit step recorded at the point of rejection, and resolves it when the request is raised. Only **Credit-root-cause** rejections are revertible, so in this scope the target is always **‘Awaiting Credit Approval’ — Credit Queue Level 1**; the case then escalates through levels under the standard queue rules. No new data capture is required:'),
  tbl(
    ['Audit step recorded at rejection', 'Rejection origin', 'Revert', 'Target status (queue, level)'],
    [
      ['{Rejected in Credit Queue [Level]}', 'Credit user rejects in Credit Queue L1–L3', 'Yes', 'Awaiting Credit Approval — Credit Queue L1'],
      ['{Safety net for Finance DBR}', 'System — Existing DBR > 50% after calculation', 'Via parking change below', 'Awaiting Credit Approval — Credit Queue L1'],
      ['{Safety net for Gross DBR}', 'System — Gross DBR > 100%', 'Via parking change below', 'Awaiting Credit Approval — Credit Queue L1'],
      ['{Fail Strategies Check}', 'System — fails all segmentations (logic unchanged)', 'Yes', 'Awaiting Credit Approval — Credit Queue L1'],
      ['Approval Limit Result = “Failed”', 'System — approved limit < Min Boundary, no deviation (logic unchanged)', 'Yes', 'Awaiting Credit Approval — Credit Queue L1'],
      ['Compliance Reject', 'Compliance user rejects in Compliance Queue L1–L2', 'No — out of scope', '— (no Credit root cause)'],
      ['Risk Reject', 'Risk user rejects in Risk Queue L1–L3', 'No — out of scope', '— (no Credit root cause)'],
      ['Sale Reject', 'Sales user rejects in Sale Queue', 'No — out of scope', '—'],
      ['{Pre-Fetch Applicable Product} / pre-dedupe steps / AML', 'System terminations before any queue ownership', 'No', '—'],
    ],
    [26, 28, 14, 32],
  ),
  spacer(160),
  p('**System change — DBR parking.** Today, a breach of the DBR safety nets — **Existing DBR > 50%** after calculation, or **Gross DBR > 100%** — auto-rejects the application with Action by = <system>, leaving no previous queue status to restore. The system shall instead **park the case into Credit Queue L1** (‘Awaiting Credit Approval’) for both safety nets: the **Failed Reason continues to show the same message** as the current auto-rejection, and the system shall **complete the Rule Engine run and Limit Assignment** so the RE result and limit-assignment result are available in the Credit Queue view — the Credit user must have enough information to decide. If the Credit user then rejects the case, that rejection carries a named owner and is revertible under the standard rule (row 1). This parking applies to every safety-net breach, not only cases later reverted — Credit Queue volume impact should be sized during estimation.'),
  p('**No change to the other auto-rejections.** The “fails all segmentations” and “approved limit < Min Boundary” cases keep their current auto-rejection logic — no parking is introduced for them. A revert of such a case returns it to ‘Awaiting Credit Approval’ — Credit Queue L1, where a Credit user takes ownership of the re-decision.'),
);

P(
  h2('6. Customer returns to Customer Journey after revert'),
  bullet('**While the request is pending:** nothing changes for the customer — the application is still Rejected and the 30-day pre-dedupe re-application block continues to apply.'),
  bullet('**After an approved revert — resume back to the “under process” screen:** the application is in-flight again in Credit Queue, so the pre-dedupe *in-progress application* check blocks a new same-product application (correct and unchanged). A customer who resumes the journey in the app lands on the standard **application under process** holding screen — “Thanks for choosing Reem Bank <Product> — Your request is under process with the reference <Application ID>” (SC7 / SC8 below) — not on the rejection screen and not into a new application flow. Regression required on this resume behaviour.'),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [
    img('SC7_Customer_Resume_Under_Process_CC.png', 150, 296),
    new TextRun({ text: '      ', font: FONT }),
    img('SC8_Customer_Resume_Under_Process_PL.png', 150, 303),
  ] }),
  caption('SC7 / SC8: Customer resume after an approved revert — application under process (CC / PL)'),
  bullet('**If the application is rejected again after a revert:** the 30-day re-application window **restarts from the latest rejection** — the countdown begins again at the new rejection date.'),
  bullet('**Customer communication — final confirmation only, exactly one email (Credit User note):** the customer already received the rejection notification at the point of decision and is **not** notified of the reopen. When the re-assessment completes, the system sends the client **exactly one email**, whether the outcome is Approve or Reject — and **both templates mention the further review (re-assessment)**: on approval, the first Email (Client) template below; on a **repeat rejection, the client is also emailed**, using the second template below (not the generic first-rejection notification), and the 30-day window restarts. The reopened run must **not** double-send decision notifications to the client (the original rejection email has already gone out once).'),
  spacer(60),
  tbl(
    ['Type', 'Subject', 'Content', 'Trigger'],
    [
      ['Email (Client)', 'Reem Bank — Update on your application %%APPLICATION_ID%%', 'Dear %%CUSTOMER_NAME%%, After re-assessment, your %%PRODUCT_TYPE%% application %%APPLICATION_ID%% has been approved. We will be in touch with the next steps. Best Regards, Reem Bank', 'One time — approved after re-assessment (application reopened via approved revert). Newly added in Communication Setup.'],
      ['Email (Client)', 'Reem Bank — Update on your application %%APPLICATION_ID%%', 'Dear %%CUSTOMER_NAME%%, After re-assessment, your %%PRODUCT_TYPE%% application %%APPLICATION_ID%% has not been approved. You may submit a new application after 30 days. Best Regards, Reem Bank', 'One time — rejected again after re-assessment (replaces the generic rejection notification). Exactly one client email per decision — either way.'],
    ],
    [15, 22, 40, 23],
  ),
  h2('7. Summary'),
  tbl(
    ['Step', 'Actor', 'Action', 'Application Status', 'Next Step'],
    [
      ['1', 'Bank User (Maker)', "Clicks 'Revert' on Application Details screen of a rejected application, enters Revert Reason and confirms", 'Rejected (Revert_App = TRUE)', 'Application routed to Revert Queue'],
      ['2', 'System', 'Application dropped into Revert Queue; target queue/status resolved and stored', 'Rejected (Revert_App = TRUE)', 'Await Checker decision'],
      ['3a', 'Checker (Revert Queue)', "Clicks 'Approve' and confirms", 'Awaiting Credit Approval', 'Application re-enters Credit Queue at Level 1; email notification sent to Maker; application removed from queue'],
      ['3b', 'Checker (Revert Queue)', "Clicks 'Reject' and confirms", 'Rejected', 'Email notification sent to Maker; application removed from queue; Revert_App = FALSE'],
      ['3c', 'System (auto-timeout)', 'No checker action within [X] days — request auto-approved (same as cancellation timeout)', 'Awaiting Credit Approval', 'Application re-enters Credit Queue at Level 1; email notification sent to Maker; Revert_App = FALSE'],
      ['4', 'Queue User (Credit)', 'Works the case as normal — edits credit parameters, then approves, overrides or rejects', 'Awaiting Credit Approval', 'Application re-decisioned against the currently published credit policy; the client receives exactly one re-assessment email either way — approval or rejection (section 6); on rejection the 30-day window restarts'],
    ],
    [8, 17, 31, 20, 24],
  ),
);

/* ---- Additional impact analysis ---- */
P(
  BREAK(),
  h1('Additional Impact Analysis'),
  p('Beyond the direct scope above, the following areas of the Reem Bank platform are impacted and must be carried into estimation and test scope:'),
  impactTable([
      ['Role Management / Permission Matrix', "Six new permission entries, per product: [CC]/[PL] × 'Revert Application' (Enquiry > Application Enquiry) and [CC]/[PL] × View / Evaluate Application (Manually Queue > Revert Queue). Each is a distinct right — bundling permissions that cover different actions has previously required production hotfixes. The Permission Matrix reference page must be updated.", ['ia_role.png', 2260, 620, 'Role Management › Application Enquiry (SC1)']],
      ['Queue model / drop points', 'One new queue (Revert Queue) in the Queue menu and the Manually Queue role section. The drop-points matrix gains a new entry (approved revert → Credit Queue L1), plus the parking of both DBR safety nets (Existing DBR > 50% and Gross DBR > 100%) → Credit Queue L1, which increases Credit Queue volume for every breach — not only reverted cases. Parked cases must carry the completed Rule Engine and Limit Assignment results into the queue view. The new parking drop points must be aligned with the drop-point / Failed Reason updates currently in delivery, and the DBR thresholds with the in-flight two-DBR calculation change.', ['ia_queue.png', 940, 430, 'Queue menu — Revert Queue (SC4)']],
      ['Status model / mobile app', 'No new Application Status is introduced (Revert_App flag only, mirroring Cancel_App), so the mobile application requires no change and never displays a state that misrepresents the case.', ['ia_status.png', 1160, 330, 'Status transition on approved revert']],
      ['Audit trail', "Three new audit steps — 'Manually initiate revert', 'Revert Queue', 'Auto Revert Approval on timeout' — each writing the full standard field set. The original rejection record is never modified. Revertibility is derived from the audit step recorded at rejection, so the known defect in the audit trail written for Financial-DBR rejections must be resolved before this feature relies on it.", ['ia_audit.png', 2390, 620, 'Application history steps — Application Enquiry']],
      ['Communication Setup','**Four templates newly added in Communication Setup:** two **Email (Bank)** templates per product (revert approved / not approved) and two **Email (Client)** templates — approval after re-assessment and rejection after re-assessment, both mentioning the further review (section 6). English, banking tone, signing off as Reem Bank. **Exactly one client email per re-assessment decision** — Approve or Reject — with duplicate decision notifications suppressed on the reopened run. The Compliance / Risk reject confirmation texts stay as they are — those rejections remain non-revertible.', ['ia_comm.png', 2000, 770, 'Communication Setup › Email Templates — Type: Client / Bank']],
  ]),
);

/* ---- Open questions ---- */

/* ---- Thank you ---- */
P(
  BREAK(),
  new Paragraph({ spacing: { after: 0 }, children: [img('assets/logo_block.png', 170, 102)] }),
  spacer(2800),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'THANK YOU', size: 72, color: BLUE, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [img('assets/logo_navy.png', 200, 58)] }),
  spacer(2800),
  ctr('This is not a legally binding document', { size: 19 }),
  ctr('Highly confidential not to be shared without written consent', { size: 19 }),
  spacer(200),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [img('assets/contact_strip.png', 600, 71)] }),
);

/* ================= ASSEMBLE ================= */
const doc = new Document({
  creator: 'Appro',
  title: 'Application Revert in Super Portal V1.0',
  styles: { default: { document: { run: { font: FONT, size: 22, color: BLACK } } } },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 500, footer: 480 } },
    },
    headers: {
      default: new Header({ children: [new Table({
        columnWidths: [Math.round(CONTENT_W / 2), CONTENT_W - Math.round(CONTENT_W / 2)],
        width: { size: CONTENT_W, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: Math.round(CONTENT_W / 2), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: 'Confidential', size: 18, color: BLACK, font: FONT })] })] }),
          new TableCell({ width: { size: CONTENT_W - Math.round(CONTENT_W / 2), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [img('assets/logo_header.png', 100, 30)] })] }),
        ] })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Table({
        columnWidths: [Math.round(CONTENT_W * 0.55), Math.round(CONTENT_W * 0.15), CONTENT_W - Math.round(CONTENT_W * 0.55) - Math.round(CONTENT_W * 0.15)],
        width: { size: CONTENT_W, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: Math.round(CONTENT_W * 0.55), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [
            new Paragraph({ spacing: { before: 0, after: 0, line: 216 }, children: [
              new TextRun({ text: 'This is not a legally binding document', bold: true, size: 15, color: BLACK, font: FONT }),
              new TextRun({ break: 1, text: 'Highly confidential not to be shared without written consent', bold: true, size: 15, color: BLACK, font: FONT }),
            ] })] }),
          new TableCell({ width: { size: Math.round(CONTENT_W * 0.15), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ children: [PageNumber.CURRENT], size: 22, color: BLACK, font: FONT })] })] }),
          new TableCell({ width: { size: CONTENT_W - Math.round(CONTENT_W * 0.55) - Math.round(CONTENT_W * 0.15), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [img('assets/circles_footer.png', 96, 19)] })] }),
        ] })],
      })] }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || path.join(DIR, 'Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx');
  fs.writeFileSync(out, buf);
  console.log('WROTE', out, buf.length, 'bytes');
});
