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
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'V1.0', bold: true, size: 44, color: BLUE, font: FONT })] }),
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
  bullet('If no decision is made within a configurable timeout period, the request is **auto-approved by the System** — the same timeout behaviour as Application Cancellation. For example, if a timeout period is defined as 5 days, when there is no approve/ reject decision for a revert request in Revert Queue, the system approves the request and the application returns to its target queue.'),
  imgP('rcflow.png', 600, 223, { before: 200 }),
  spacer(80),
  p('Applicable products: **CC, PL**. *(CASA is excluded — it has no credit decisioning; Mortgage Loan and Auto Loan are not yet part of the platform scope.)*'),
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
      ['2', 'Rejected by Compliance user in Compliance Queue (L1–L2)', "Back to 'Awaiting Compliance Review' — Compliance Queue L1"],
      ['3', 'Rejected by Risk user in Risk Queue (L1–L3)', "Back to 'Awaiting Risk Review' — Risk Queue L1"],
      ['4', 'Auto-rejected by System — Existing DBR > 50% after calculation', "System change: the case is parked into Credit Queue L1 ('Awaiting Credit Approval') instead of auto-rejecting — same Failed Reason message as today, with Rule Engine and Limit Assignment results available in the queue view. A subsequent Credit rejection then reverts under row 1 (see section 5)"],
      ['5', 'Auto-rejected by System — application fails all segmentations (rejection logic unchanged)', "Back to 'Awaiting Credit Approval' — Credit Queue L1"],
      ['6', 'Auto-rejected by System — approved limit below Min Boundary, no deviation (rejection logic unchanged)', "Back to 'Awaiting Credit Approval' — Credit Queue L1"],
    ],
    [6, 40, 54],
  ),
  spacer(160),
  p('The revert shall be restricted in below scenarios:'),
  tbl(
    ['Scenario', 'Condition / Application Status'],
    [
      ['Bank users already initiated revert', 'Revert_App = TRUE (a revert request is already pending in the Revert Queue)'],
      ['Application is not rejected', "Any Application Status other than 'Rejected' — Lead | In Progress | Awaiting Compliance Review | Awaiting Risk Review | Awaiting Sales Response | Awaiting Credit Approval | Approval In Principle | Awaiting Cooling Off Period | Awaiting Signature | KFS Signature | User Initiated Cancellation | Completed"],
      ['Application already terminated for another reason', 'Invalidate | Insufficient Data | Declined | Cancelled | Failed by Minimum Income | Expired | Blocked | Failed By EFR'],
      ['Rejection trigger point is not revertible', 'Pre-dedupe check failure (Step 7.1) | No applicable product found ({Pre-Fetch Applicable Product}) | AML blacklisted or AML callback decision = rejected | geo-fencing, EID-scan or EFR liveness terminations. These failures occur before any queue takes ownership of the case, so there is no previous queue status to return the application to.'],
    ],
    [30, 70],
  ),
);

/* ---- End-to-end flow ---- */
P(
  BREAK(),
  h1('End-to-End Application Revert Flow from Super Portal'),
  h2('1. Role Management: Revert Application Permission'),
  bullet("Bank users must only be able to request a revert if they have been explicitly granted the 'Revert Application' permission within their Super Portal role."),
  bullet("A new role permission named **'Revert Application'** shall be added under the **Enquiry** module, **Application Enquiry** sub-module in the Role Management section of the Super Portal — **per product tab**, alongside the existing 'View Application' and 'Cancel Application' permissions: '[Credit Card] Revert Application' and '[Personal Loan] Revert Application'."),
  imgP('rc1.png', 600, 338),
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
  spacer(60),
  screenTable([
    ["SC2 – Application Enquiry – “Revert” button for the revert request", 'rc2.png', 440, 248],
    ['SC3 – Revert Confirmation Popup', 'rc3.png', 310, 228],
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
  bullet('The **target queue and status** are resolved per section 5 at submission time and stored on the request. Re-entry is always at **Level 1** of the target queue.'),
  bullet("Audit trail is captured with: Step = **'Manual revert process'**, State = 'Rejected', Step Status = 'Successful', Step Details = **'Revert requested by %Username% to <TARGET_QUEUE>. Revert reason is <REVERT_REASON captured above>'**, Action by = <user email id>."),
  bullet('The application is automatically dropped into the **Revert Queue** for further review and approval upon submission of the revert request.'),
);

P(
  h2('4. Revert Queue'),
  p('The Revert Queue is a new queue within the Super Portal that allows users to review and make decisions on applications that have been submitted for revert. It provides governance and an approval layer before a rejection is reopened — mirroring the Termination Queue used for manual cancellation. The Checker view is read-only apart from the decision: no Edit, Override, Send Application or FTS Retrigger is offered there.'),
  h2('4.1. Revert Queue Menu'),
  p("'Revert Queue' shall appear as an entry in the Queue menu of the Super Portal, alongside existing queues (e.g. Transaction Post Queue, Checker Queue, Termination Queue, etc.)."),
  imgP('rc4.png', 285, 261),
  caption('SC4: Revert Queue'),
  h2('4.2. Role Information for Revert Queue'),
  imgP('rc5.png', 600, 338),
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
  p("When the user with Evaluate Application permission as TRUE clicks 'Approve' in Revert Queue:"),
  bullet("System displays confirmation popup: 'Are you sure you want to Approve the application revert?'"),
  bullet("If user clicks 'Cancel': popup closes, no action taken."),
  bullet("If user clicks 'Yes, Approve': system proceeds with the revert."),
  sub('Application Status = **<TARGET_STATUS>** and the application re-enters **<TARGET_QUEUE>** at Level 1 (section 5). Revert_App = FALSE.'),
  sub('Application is removed from Revert Queue ([Revert Queue] = ‘APPROVED’). Toaster: “Revert of <Application ID> is approved”.'),
  sub("Audit trail is captured with: Step = 'Revert Queue', State = <TARGET_STATUS>, Step Detail = 'Application revert requested by “%Username%” and approved by “%Username%”. Application returned to <TARGET_QUEUE>', Action by = <System>."),
  sub('Email notification is sent to the bank user who requested the revert to inform them of the outcome.'),
  tbl(
    ['Type', 'Subject', 'Content', 'Trigger'],
    [['Email', '[Super Portal] - Application %%APPLICATION_ID%% revert is approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% has been approved. The application has been returned to %%TARGET_STATUS%%. Best Regards, Reem Bank', 'One time – send immediately when the revert is approved in Revert Queue, or auto-approved by System on timeout']],
    [11, 25, 41, 23],
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
    [['Email', '[Super Portal] - Application %%APPLICATION_ID%% revert is not approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% is rejected. The application remains Rejected. Best Regards, Reem Bank', 'One time – send immediately when the revert request is rejected by Checker in Revert Queue']],
    [11, 25, 41, 23],
  ),
);

P(
  h2('4.5 Timeout scenario if no decision taken in the Revert Queue within a pre-defined period'),
  p('A configurable timeout period of [X] days begins when the revert request is submitted (proposed default: 5 days, configurable in database — matching the cancellation timeout). The following outcomes apply:'),
  tbl(
    ['Scenario', 'Outcome'],
    [
      ['Request is APPROVED in Revert Queue within [X] days', 'Application returned to <TARGET_STATUS> in <TARGET_QUEUE> at Level 1. Please refer to 4.3 above.'],
      ['Request is REJECTED in Revert Queue within [X] days', 'Application remains “Rejected”. Please refer to 4.4 above.'],
      ['No decision taken within [X] days', 'The request is **auto-approved by the System** the next day after the timeout period ends — the same behaviour as the Application Cancellation timeout. The application returns to <TARGET_STATUS> in <TARGET_QUEUE> at Level 1, Revert_App = FALSE, and it is removed from the Revert Queue. Audit trail is captured with: Step = ‘Auto Revert Approval on timeout’, State = <TARGET_STATUS>, Step Detail = ‘Application revert requested by “%Username%” and approved by System, as per approval timeout configuration of [X] days. Application returned to <TARGET_QUEUE>’, Action by = <System>. Email notification is sent to the bank user who requested the revert — same email as in 4.3.'],
    ],
    [30, 70],
  ),
);

P(
  h2('5. Revert target status determination'),
  p('The status an application is reverted **to** is determined by **how it became Rejected** — the system derives it from the audit step recorded at the point of rejection, and resolves it when the request is raised. Re-entry is **always at Level 1** of the target queue, regardless of the level the rejection occurred at; the case then escalates through levels under the standard queue rules. No new data capture is required:'),
  tbl(
    ['Audit step recorded at rejection', 'Rejection origin', 'Revert', 'Target status (queue, level)'],
    [
      ['{Rejected in Credit Queue [Level]}', 'Credit user rejects in Credit Queue L1–L3', 'Yes', 'Awaiting Credit Approval — Credit Queue L1'],
      ['Compliance Reject', 'Compliance user rejects in Compliance Queue L1–L2', 'Yes', 'Awaiting Compliance Review — Compliance Queue L1'],
      ['Risk Reject', 'Risk user rejects in Risk Queue L1–L3', 'Yes', 'Awaiting Risk Review — Risk Queue L1'],
      ['Sale Reject', 'Sales user rejects in Sale Queue', 'TBC', 'Awaiting Sales Response (Open Questions #4)'],
      ['{Safety net for Finance DBR}', 'System — Existing DBR > 50% after calculation', 'Via parking change below', 'Awaiting Credit Approval — Credit Queue L1'],
      ['{Fail Strategies Check}', 'System — fails all segmentations (logic unchanged)', 'Yes', 'Awaiting Credit Approval — Credit Queue L1'],
      ['Approval Limit Result = “Failed”', 'System — approved limit < Min Boundary, no deviation (logic unchanged)', 'Yes', 'Awaiting Credit Approval — Credit Queue L1'],
      ['{Pre-Fetch Applicable Product} / pre-dedupe steps / AML', 'System terminations before any queue ownership', 'No', '—'],
    ],
    [26, 28, 14, 32],
  ),
  spacer(160),
  p('**System change — DBR parking.** Today, Existing DBR > 50% after calculation auto-rejects the application with Action by = <system>, leaving no previous queue status to restore. The system shall instead **park the case into Credit Queue L1** (‘Awaiting Credit Approval’): the **Failed Reason continues to show the same message** as the current auto-rejection, and the system shall **complete the Rule Engine run and Limit Assignment** so the RE result and limit-assignment result are available in the Credit Queue view — the Credit user must have enough information to decide. If the Credit user then rejects the case, that rejection carries a named owner and is revertible under the standard rule (row 1). This parking applies to every DBR breach, not only cases later reverted — Credit Queue volume impact should be sized during estimation.'),
  p('**No change to the other auto-rejections.** The “fails all segmentations” and “approved limit < Min Boundary” cases keep their current auto-rejection logic — no parking is introduced for them. A revert of such a case returns it to ‘Awaiting Credit Approval’ — Credit Queue L1, where a Credit user takes ownership of the re-decision.'),
);

P(
  h2('6. Customer returns to Customer Journey after revert'),
  bullet('**While the request is pending:** nothing changes for the customer — the application is still Rejected and the 30-day pre-dedupe re-application block continues to apply.'),
  bullet('**After an approved revert:** the application is in-flight again in a queue, so the pre-dedupe *in-progress application* check blocks a new same-product application (correct and unchanged). If the customer resumes the journey, they must land at the correct point — regression required on resume behaviour.'),
  bullet('**If the application is rejected again after a revert:** the 30-day re-application window shall run from the **latest** rejection (to be confirmed).'),
  bullet('**Customer communication:** the customer already received the rejection email at the point of decision. No customer notification of the reopen is proposed for v1 — the customer is informed again only when the re-decision completes (to be confirmed).'),
  h2('7. Summary'),
  tbl(
    ['Step', 'Actor', 'Action', 'Application Status', 'Next Step'],
    [
      ['1', 'Bank User (Maker)', "Clicks 'Revert' on Application Details screen of a rejected application, enters Revert Reason and confirms", 'Rejected (Revert_App = TRUE)', 'Application routed to Revert Queue'],
      ['2', 'System', 'Application dropped into Revert Queue; target queue/status resolved and stored', 'Rejected (Revert_App = TRUE)', 'Await Checker decision'],
      ['3a', 'Checker (Revert Queue)', "Clicks 'Approve' and confirms", '<Target Status>', 'Application re-enters the target queue at Level 1; email notification sent to Maker; application removed from queue'],
      ['3b', 'Checker (Revert Queue)', "Clicks 'Reject' and confirms", 'Rejected', 'Email notification sent to Maker; application removed from queue; Revert_App = FALSE'],
      ['3c', 'System (auto-timeout)', 'No checker action within [X] days — request auto-approved (same as cancellation)', '<Target Status>', 'Application re-enters the target queue at Level 1; email notification sent to Maker; Revert_App = FALSE'],
      ['4', 'Queue User (Credit / Compliance / Risk)', 'Works the case as normal — edits credit parameters, then approves, overrides or rejects', '<Target Status>', 'Application re-decisioned against the currently published credit policy'],
    ],
    [8, 17, 31, 20, 24],
  ),
);

/* ---- Additional impact analysis ---- */
P(
  BREAK(),
  h1('Additional Impact Analysis'),
  p('Beyond the direct scope above, the following areas of the Reem Bank platform are impacted and must be carried into estimation and test scope:'),
  tbl(
    ['Area', 'Impact'],
    [
      ['Role Management / Permission Matrix', "Six new permission entries, per product: [CC]/[PL] × 'Revert Application' (Enquiry > Application Enquiry) and [CC]/[PL] × View / Evaluate Application (Manually Queue > Revert Queue). Each is a distinct right — bundling permissions that cover different actions has previously required production hotfixes. The Permission Matrix reference page must be updated."],
      ['Queue model / drop points', 'One new queue (Revert Queue) in the Queue menu and the Manually Queue role section. The drop-points matrix gains a new entry (approved revert → target queue at L1), plus the DBR parking → Credit Queue L1, which increases Credit Queue volume for every breach — not only reverted cases. DBR-parked cases must carry the completed Rule Engine and Limit Assignment results into the queue view.'],
      ['Status model / mobile app', 'No new Application Status is introduced (Revert_App flag only, mirroring Cancel_App), so the mobile application requires no change and never displays a state that misrepresents the case.'],
      ['Audit trail', "Three new audit steps — 'Manual revert process', 'Revert Queue', 'Auto Revert Approval on timeout' — each writing the full standard field set. The original rejection record is never modified."],
      ['Communication Setup', 'Two new Bank-type email templates per product (approved / not approved), English only, signing off as Reem Bank. Existing queue-reject confirmation texts become inaccurate where rejection is revertible — Compliance currently reads “This action can not be revert” and Risk reads “the application will be terminated after you reject it!” — and must be re-worded.'],
      ['Reporting / MIS', 'WIP, Exception, Policy Exception, E2E and Approved Transactions reports must handle reopened cases: rejection counts become mutable, E2E must not double-count the second pass, and an approval after revert should be identifiable as such.'],
      ['Services', 'backoffice-service, application-service, queue-service, user-service, audit-trail-service, notification-service, scheduler-service (timeout job) and work-flow-service. The workflow engine is the key estimation item: a rejected application’s process instance has ended, and reverting requires resuming it or re-instantiating at the queue task.'],
      ['Credit policy versioning', 'Post-revert re-decisioning evaluates against the currently published Strategy / Score Check / Income Multiplier versions — which is the point of the feature — and the audit trail should record which published version was applied.'],
    ],
    [22, 78],
  ),
);

/* ---- Open questions ---- */
P(
  BREAK(),
  h1('Open Questions'),
  tbl(
    ['#', 'Question'],
    [
      ['1', 'Workflow engine (technical — parked for engineering estimation): can the terminated process instance be resumed, or must a new instance start at the queue task?'],
      ['2', 'Is the Gross DBR > 100% safety net also in scope for parking to Credit Queue, or does it remain a hard auto-rejection? (Existing DBR > 50% parking is confirmed.)'],
      ['3', 'Confirm the Revert_App flag with Application Status remaining “Rejected”, in preference to a new ‘User Initiated Revert’ status (zero mobile-app impact).'],
      ['4', 'Are Sale Queue rejections revertible to ‘Awaiting Sales Response’, or deliberately excluded?'],
      ['5', 'Confirm the timeout period [X] — 5 days proposed, configurable in database, same as cancellation.'],
      ['6', 'Should the customer be notified when an application is reopened? (The rejection email has already been sent at the point of decision.)'],
      ['7', 'Does the 30-day re-application window restart from the latest rejection when a reverted application is rejected again?'],
      ['8', 'Should the number of reverts per application, or a revert time window (e.g. within 30 days of rejection), be capped?'],
      ['9', 'Confirm the revised wording for the Compliance / Risk reject confirmation messages once rejection becomes revertible.'],
    ],
    [6, 94],
  ),
);

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
