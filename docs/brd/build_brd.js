const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, BorderStyle, PageBreak, Header, Footer,
  PageNumber, VerticalAlign, LevelFormat,
} = require('docx');

/* ---------- Appro palette (as used in the live Appro portals) ---------- */
const DARK   = '0C1931';   // Appro Dark Blue
const DENIM  = '1A2D52';
const BLUE   = '3B7EF6';   // Appro Blue
const INK100 = 'F2F5FA';
const INK200 = 'D9E0EA';
const INK500 = '5A6B85';
const AMBER_BG = 'FFF7E6';
const AMBER_TX = '9A6206';
const RED    = 'B91C1C';

const FONT = 'Calibri';
const CONTENT_W = 9638;         // A4 (11906) minus 2 x 1134 margins

/* ---------- inline **bold** parser ---------- */
function runs(text, opts = {}) {
  const base = { font: FONT, size: opts.size || 20, color: opts.color || '1F2937' };
  const out = [];
  for (const part of String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      out.push(new TextRun({ ...base, text: part.slice(1, -1), italics: true, bold: !!opts.allBold }));
    } else {
      out.push(new TextRun({ ...base, text: part, bold: !!opts.allBold }));
    }
  }
  return out;
}

const p = (text, o = {}) => new Paragraph({
  children: runs(text, o),
  spacing: { before: o.before ?? 60, after: o.after ?? 120, line: 276 },
  alignment: o.align,
});

const spacer = (h = 120) => new Paragraph({ children: [], spacing: { after: h } });

function h1(text, num) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
    children: [new TextRun({ text: (num ? num + '  ' : '') + text.toUpperCase(), bold: true, size: 26, color: DARK, font: FONT })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, bold: true, size: 23, color: DENIM, font: FONT })],
  });
}

const bullet = (text) => new Paragraph({
  children: runs(text),
  bullet: { level: 0 },
  spacing: { before: 40, after: 80, line: 276 },
});

const numbered = (text) => new Paragraph({
  children: runs(text),
  numbering: { reference: 'flow', level: 0 },
  spacing: { before: 40, after: 80, line: 276 },
});

/* ---------- TBC callout ---------- */
function tbc(text) {
  return new Table({
    columnWidths: [CONTENT_W],
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 2, color: 'E8C97A' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E8C97A' },
      left:   { style: BorderStyle.SINGLE, size: 18, color: 'D99A0B' },
      right:  { style: BorderStyle.SINGLE, size: 2, color: 'E8C97A' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: AMBER_BG, color: 'auto' },
        margins: { top: 110, bottom: 110, left: 170, right: 140 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0, line: 264 },
          children: [
            new TextRun({ text: 'TBC   ', bold: true, size: 19, color: AMBER_TX, font: FONT }),
            ...runs(text, { size: 19, color: '5C4708' }),
          ],
        })],
      })],
    })],
  });
}

/* ---------- table builder ---------- */
function tbl(headers, rows, weights, opts = {}) {
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map(w => Math.round(CONTENT_W * w / total));
  widths[widths.length - 1] = CONTENT_W - widths.slice(0, -1).reduce((a, b) => a + b, 0);

  const cell = (text, i, isHeader, rowIdx) => {
    const emphasise = !isHeader && opts.boldFirstCol && i === 0;
    const txt = String(text ?? '');
    return new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: {
        type: ShadingType.CLEAR,
        fill: isHeader ? DARK : (rowIdx % 2 ? INK100 : 'FFFFFF'),
        color: 'auto',
      },
      margins: { top: 90, bottom: 90, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        spacing: { before: 0, after: 0, line: 252 },
        children: isHeader
          ? [new TextRun({ text: txt, bold: true, size: 18, color: 'FFFFFF', font: FONT })]
          : runs(txt, { size: 18, allBold: emphasise }),
      })],
    });
  };

  return new Table({
    columnWidths: widths,
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: INK200 },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: INK200 },
      left:   { style: BorderStyle.SINGLE, size: 4, color: INK200 },
      right:  { style: BorderStyle.SINGLE, size: 4, color: INK200 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: INK200 },
      insideVertical:   { style: BorderStyle.SINGLE, size: 4, color: INK200 },
    },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((hd, i) => cell(hd, i, true, 0)) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((c, i) => cell(c, i, false, ri)) })),
    ],
  });
}

/* ---------- screen / diagram placeholder ---------- */
function placeholder(label) {
  return new Table({
    columnWidths: [CONTENT_W],
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.DASHED, size: 4, color: BLUE },
      bottom: { style: BorderStyle.DASHED, size: 4, color: BLUE },
      left:   { style: BorderStyle.DASHED, size: 4, color: BLUE },
      right:  { style: BorderStyle.DASHED, size: 4, color: BLUE },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'F7FAFF', color: 'auto' },
        margins: { top: 200, bottom: 200, left: 140, right: 140 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: label, italics: true, size: 19, color: DENIM, font: FONT })],
        })],
      })],
    })],
  });
}

/* ================= DOCUMENT CONTENT ================= */
const body = [];
const P = (...a) => body.push(...a);
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

/* ---- Cover ---- */
P(
  spacer(1500),
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: 'appro', bold: true, size: 44, color: BLUE, font: FONT })],
  }),
  new Paragraph({
    spacing: { after: 700 },
    children: [new TextRun({ text: 'REEM FINANCE   ·   BUSINESS REQUIREMENTS DOCUMENT', size: 18, color: INK500, font: FONT })],
  }),
  new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: 'Application Revert in', bold: true, size: 58, color: DARK, font: FONT })],
  }),
  new Paragraph({
    spacing: { after: 320 },
    children: [new TextRun({ text: 'Super Portal', bold: true, size: 58, color: DARK, font: FONT })],
  }),
  new Paragraph({
    spacing: { after: 900 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 10 } },
    children: [new TextRun({ text: 'V1.0', bold: true, size: 34, color: BLUE, font: FONT })],
  }),
  p('This is not a legally binding document.', { size: 19, color: INK500 }),
  p('Highly confidential not to be shared without written consent.', { size: 19, color: INK500 }),
  BREAK(),
);

/* ---- Version history ---- */
P(
  h1('Version History'),
  tbl(
    ['Date', 'Version', 'Author', 'Change Description'],
    [['13-08-2026', '1.0', 'Huyen', 'Created BRD — Application Revert in Super Portal']],
    [16, 12, 14, 58],
  ),
);

/* ---- Reference documents ---- */
P(
  h1('Reference Documents'),
  p('The requirements below build on existing, delivered Reem Finance functionality. The following stories define the current behaviour that Revert extends or depends on:'),
  tbl(
    ['Reference', 'Subject', 'Relevance to Revert'],
    [
      ['RF-2365', 'Application Cancellation on Application Enquiry screen', 'Defines the Application Enquiry action bar, the confirmation popup pattern and the comment / audit trail conventions reused by Revert.'],
      ['RF-2366', 'Role Management — Cancel Application permission', "Establishes the Enquiry > Application Enquiry permission location where 'Revert Application' will sit."],
      ['RF-2367', 'Termination Queue for User Initiated Cancellation', '**Key precedent** — already restores an application to its previous status when a cancellation request is rejected.'],
      ['RF-272', 'Credit Queue — Reject Application', 'Current Credit rejection behaviour and audit trail step.'],
      ['RF-282', 'Risk Queue — Reject Application', 'Current Risk rejection behaviour and audit trail step.'],
      ['RF-492', 'Compliance Queue — Manual Review', 'Contains the Compliance reject flow and its confirmation message.'],
      ['RF-1041', 'BE Logic — Reject application based on DBR', 'Defines the DBR safety-net auto-rejection amended by Section 5.1.'],
      ['RF-132', 'Rule Engine — Segmentation Logic', 'Defines the "fail all segmentation" auto-rejection.'],
      ['RF-361', 'Approved Limit Amount calculation (PL)', 'Defines the Min/Max Boundary rejection and the "no applicable product" termination.'],
      ['RF-1919', 'Role Management structure', 'Defines the Menu / Sub-Menu / Action permission model.'],
      ['RF-2428', 'Application Enquiry — Failed Reasons display', 'Defines how failure and queue-referral reasons are surfaced on the screen.'],
    ],
    [14, 34, 52],
    { boldFirstCol: true },
  ),
  BREAK(),
);

/* ---- TOC ---- */
P(
  h1('Table of Contents'),
  ...[
    ['1.  Feature Overview and Key Covered Areas', 1],
    ['2.  Applicable Products and Revertible Application Statuses', 1],
    ['3.  Revert Eligibility and Target Status Determination', 1],
    ['        3.1  Rejection by a queue user (manual rejection)', 0],
    ['        3.2  Auto-rejection by the System on credit grounds', 0],
    ['        3.3  How the System identifies the rejection origin', 0],
    ['4.  End-to-End Application Revert Flow from Super Portal', 1],
    ['        4.1  Role Management: Revert Application Permission', 0],
    ['        4.2  Revert Application from Application Enquiry View', 0],
    ['        4.3  Impact of Revert Submission', 0],
    ['        4.4  Post-Revert Processing in the Receiving Queue', 0],
    ['5.  System Auto-Rejection Changes Required to Support Revert', 1],
    ['6.  Scenarios Where Revert Is Not Permitted', 1],
    ['7.  Impact on Existing Functionality', 1],
    ['8.  Summary', 1],
    ['Appendix 1: Summary of Changes', 1],
    ['Appendix 2: Revert Eligibility Matrix', 1],
    ['Appendix 3: Workflow', 1],
    ['Appendix 4: Open Questions and Items to Confirm', 1],
  ].map(([t, bold]) => new Paragraph({
    spacing: { before: 30, after: 30 },
    children: [new TextRun({ text: t, size: 20, color: bold ? '1F2937' : INK500, font: FONT, bold: !!bold })],
  })),
  BREAK(),
);

/* ---- 1. Feature overview ---- */
P(
  h1('Feature Overview and Key Covered Areas', '1.'),
  p('This document describes the Super Portal **Application Revert** capability, which allows authorised bank staff to return a **Rejected** application to the queue status it held immediately before the rejection decision was taken. The capability complements the existing **Cancel Application** function already delivered in Super Portal: where Cancel terminates an application, Revert reopens one.'),
  p('The primary business driver is to support the **Credit Department**. Today, once an application is rejected — whether by a queue user or automatically by the System on credit grounds — there is no route back. The case is closed and the customer must reapply. In practice, Credit frequently needs to revisit a rejection because a credit parameter was wrong, incomplete or has since changed; for example, income evidence arrives late, an obligation was double-counted, or a decision boundary is re-tuned. Revert gives Credit a controlled way to bring the case back into the queue, update the credit parameters and re-decision it, without forcing the customer through a new application.'),
  p('Key steps are as following:'),
  bullet("Bank user with the **'Revert Application'** permission opens a rejected application in **Application Enquiry**."),
  bullet("The **'Revert'** button is enabled only when **Application Status = 'Rejected'** and the rejection originated from a revertible source."),
  bullet('The user confirms the revert and provides a mandatory **Revert Reason**.'),
  bullet('The System returns the application to the **queue status held immediately before the rejection**, and the application re-enters that queue for the responsible team to action.'),
  spacer(60),
  p('This BRD covers the following areas:'),
  bullet("Role Management — new **'Revert Application'** permission under the Enquiry module"),
  bullet("Application Enquiry — new **'Revert'** button and confirmation popup"),
  bullet('Revert eligibility rules and target-status determination per rejection origin'),
  bullet('Changes to System auto-rejection behaviour required to make credit-driven rejections revertible'),
  bullet('Audit trail, comments and application status handling'),
  bullet('Scenarios explicitly excluded from Revert'),
  bullet('Impact on existing queue confirmation messages and customer notifications'),
  spacer(80),
  tbc('Revert is deliberately **not** offered for every rejected application. Applications fail at different stages of the journey, and several failure points have no owning queue to return to. Reverting those cases would leave the application in a state the System cannot process. The excluded scenarios are listed in **Section 6** and are out of scope for this release.'),
  spacer(100),
  p('**Technical precedent.** The System already supports restoring an application to a previous status. Under RF-2367, when a cancellation request is rejected in the Termination Queue, the application is returned to *"the previous status before cancellation request is raised"*. Revert reuses this established mechanism rather than introducing a new one.'),
);

/* ---- 2. Products & statuses ---- */
P(
  BREAK(),
  h1('Applicable Products and Revertible Application Statuses', '2.'),
  p('**Applicable products:** CC, PL, CASA.'),
  tbc('Confirm whether **Mortgage Loan** is in scope for Revert. Mortgage is being introduced to the Customer Journey separately (RF-2858) and behaves differently on failure — it terminates to **Cancelled**, not Rejected — so it would not be picked up by the Revert rule as drafted.'),
  spacer(120),
  p('The Revert function operates on a single source status only:'),
  tbl(
    ['Application Status', 'Revert button behaviour'],
    [
      ['**Rejected**', "**Enabled** — subject to the rejection origin being revertible (Section 3) and the user holding the 'Revert Application' permission."],
      ['Any other status', '**Disabled** (greyed out) — including Lead, In Progress, Awaiting Compliance Review, Awaiting Risk Review, Awaiting Sales Response, Awaiting Credit Approval, Approval In Principle, Awaiting Cooling Off Period, Awaiting Signature, KFS Signature, Completed, Cancelled, User Initiated Cancellation, Expired, Blocked, Declined, Invalidate, Insufficient Data, Insufficient Time, Failed by EFR, Failed by Minimum Income, Failed by IBAN.'],
    ],
    [26, 74],
  ),
  spacer(140),
  p('The queue statuses that an application can be reverted **to** are:'),
  tbl(
    ['Target Application Status', 'Owning Queue', 'Reached from'],
    [
      ['Awaiting Credit Approval', 'Credit Queue', 'Credit rejection and all credit-driven System auto-rejections (R1, R4, R5, R6)'],
      ['Awaiting Compliance Review', 'Compliance Queue', 'Compliance rejection (R2)'],
      ['Awaiting Risk Review', 'Risk Queue', 'Risk rejection (R3)'],
    ],
    [28, 22, 50],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('Application status naming is recorded inconsistently across existing stories — **"Awaiting Sales Response"** (RF-2365) versus **"Awaiting Sale Response"** (RF-492, RF-1919), and **"In Progress"** versus **"In-Progress"**. The canonical list should be confirmed against the Customer Journey Detail Description before build, so the Revert mapping uses the exact stored values.'),
);

/* ---- 3. Eligibility ---- */
P(
  BREAK(),
  h1('Revert Eligibility and Target Status Determination', '3.'),
  p('The status an application is reverted **to** is determined by **how it became Rejected**, not by the user performing the revert. The System must derive the target status from the application’s own audit trail — specifically, from the step recorded at the point of rejection.'),
  h2('3.1  Rejection by a queue user (manual rejection)'),
  tbl(
    ['Ref', 'Rejection origin', 'Application Status after Revert', 'Application re-enters'],
    [
      ['R1', 'Rejected by Credit user in **Credit Queue** (RF-272)', 'Awaiting Credit Approval', 'Credit Queue'],
      ['R2', 'Rejected by Compliance user in **Compliance Queue** (RF-492)', 'Awaiting Compliance Review', 'Compliance Queue'],
      ['R3', 'Rejected by Risk user in **Risk Queue** (RF-282)', 'Awaiting Risk Review', 'Risk Queue'],
    ],
    [8, 40, 28, 24],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('The **Sales Queue** also rejects applications today (RF-108, audit step *"Sale Reject"*), but Sales rejections were not covered in the agreed scope. Confirm whether a Sales Queue rejection should be revertible to **Awaiting Sales Response**, or deliberately excluded.'),
  h2('3.2  Auto-rejection by the System on credit grounds'),
  tbl(
    ['Ref', 'Rejection origin', 'Treatment', 'Status after Revert', 'Re-enters'],
    [
      ['R4', '**DBR above threshold** (RF-1041)', 'System behaviour changes — the application is **routed to Credit Queue** instead of being auto-rejected outright (see Section 5.1). The Credit user then rejects it in the queue.', 'Awaiting Credit Approval', 'Credit Queue'],
      ['R5', '**Failed all segmentations** (RF-132)', 'Auto-rejected by System as today; flagged as revertible', 'Awaiting Credit Approval', 'Credit Queue'],
      ['R6', '**Approved Limit amount < Min Boundary** (RF-361)', 'Auto-rejected by System as today; flagged as revertible', 'Awaiting Credit Approval', 'Credit Queue'],
    ],
    [7, 23, 38, 20, 12],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('**Rationale for R4.** A DBR above the threshold is a credit judgement, not a hard eligibility failure. Routing the case into the Credit Queue first — rather than auto-rejecting it — means the rejection is recorded as a **queue decision** with a named decision-maker, which in turn makes it revertible under the standard R1 rule. This removes the need for a special revert path for DBR cases and keeps a single, auditable decision model. It also follows an established pattern: RF-361 already routes a **Refer** limit-assignment outcome to the Credit Queue.'),
  p('**Rationale for R5 and R6.** Both outcomes are driven by configurable credit parameters (segmentation criteria and decision boundaries). When those parameters are corrected, the same application should be re-assessable. Reverting to **Awaiting Credit Approval** places the case in front of the Credit team who own those parameters.'),
);

P(
  h2('3.3  How the System identifies the rejection origin'),
  p('Each rejection path already writes a distinct step to the audit trail. The System shall use that step to determine both **whether** the application is revertible and **which** status it returns to. No new data capture is required.'),
  tbl(
    ['Audit trail step recorded at rejection', 'Rejection origin', 'Revert', 'Target Application Status'],
    [
      ['{Rejected in Credit Queue}', 'Credit Queue — manual decision', 'Yes', 'Awaiting Credit Approval'],
      ['Compliance Reject', 'Compliance Queue — manual decision', 'Yes', 'Awaiting Compliance Review'],
      ['Risk Reject', 'Risk Queue — manual decision', 'Yes', 'Awaiting Risk Review'],
      ['Sale Reject', 'Sales Queue — manual decision', '**TBC**', 'Awaiting Sales Response'],
      ['{Safety net for Finance DBR}', 'System — DBR above threshold', 'Yes, after the Section 5.1 change', 'Awaiting Credit Approval'],
      ['{Fail Strategies Check}', 'System — failed all segmentations', 'Yes', 'Awaiting Credit Approval'],
      ['Approval Limit Result = "Failed"', 'System — limit below Min Boundary', 'Yes', 'Awaiting Credit Approval'],
      ['{Pre-Fetch Applicable Product}', 'System — no applicable product', '**No**', 'Not applicable'],
      ['Pre-Dedupe Check', 'System — pre-dedupe failure', '**No**', 'Not applicable'],
      ['AML manual override result', 'AML screening decision', '**No**', 'Not applicable'],
    ],
    [30, 30, 18, 22],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('This mapping resolves an important distinction: **"failed all segmentations"** (revertible) and **"no applicable product"** (not revertible) are separate rules writing separate audit steps — *{Fail Strategies Check}* under RF-132 and *{Pre-Fetch Applicable Product}* under RF-361 — so the eligibility rule can reliably tell them apart.'),
);

/* ---- 4. Flow ---- */
P(
  BREAK(),
  h1('End-to-End Application Revert Flow from Super Portal', '4.'),
  h2('4.1  Role Management: Revert Application Permission'),
  bullet("Bank users must only be able to revert applications if they have been explicitly granted the **'Revert Application'** permission within their Super Portal role."),
  bullet("A new role permission named **'Revert Application'** shall be added under the **Enquiry** module, **Application Enquiry** sub-module in the Role Management section of the Super Portal — alongside the existing **'Cancel Application'** permission introduced by RF-2366."),
  spacer(80),
  placeholder('[ SC1 — Add Role screen: Enquiry > Application Enquiry > "Revert Application" permission ]'),
  spacer(140),
  tbl(
    ['Component', 'Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['Revert Application Checkbox', 'Checkbox', 'Yes', 'N/A', "Selectable checkbox to grant or revoke the 'Revert Application' permission for a role. It indicates whether the role holder can perform application reverts."],
      ['Revert Application Label', 'Label', 'N/A', 'N/A', 'Descriptive label shown alongside the checkbox, identifying the permission name.'],
    ],
    [20, 11, 11, 12, 46],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('**Permission behaviour:**'),
  tbl(
    ['Permission Value', 'Allowed Actions'],
    [
      ['Revert Application = TRUE', "Users can view the 'Revert' button on the Application Enquiry details screen and perform application reverts."],
      ['Revert Application = FALSE', "Users cannot view the 'Revert' button. Users cannot perform application reverts."],
    ],
    [28, 72],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc("Confirm whether 'Revert Application' should be restricted to Credit Department roles only, or made available to any role at the bank’s discretion. The stated business driver is Credit-led, but the permission model itself is role-agnostic — and R2 / R3 return applications to the Compliance and Risk queues rather than to Credit."),
);

P(
  BREAK(),
  h2('4.2  Revert Application from Application Enquiry View'),
  bullet("The existing **Application Enquiry** module in the Super Portal is the entry point for the revert process. Bank users with the 'Revert Application' permission can initiate a revert from the **Application Details** screen."),
  bullet("The **'Revert'** button is placed in the same action bar as the existing **'Cancel Application'** button, at the foot of the Application Details panel."),
  bullet("The button is **enabled only when Application Status = 'Rejected'** and the rejection origin is revertible per Section 3.3. In all other cases the button is displayed in a disabled (greyed) state, consistent with the existing treatment of the 'Cancel Application' button."),
  spacer(80),
  placeholder('[ SC2 — Application Enquiry: "Revert" button in the Application Details action bar ]'),
  spacer(120),
  placeholder('[ SC3 — Revert Confirmation Popup ]'),
  spacer(160),
  tbl(
    ['Component', 'Type', 'Mandatory', 'Editable', 'Description'],
    [
      ['Revert Button', 'Button', 'N/A', 'N/A', "Visible only to users with the 'Revert Application' permission. Enabled only when Application Status = 'Rejected' and the rejection origin is revertible. It initiates the manual revert of the selected application."],
      ['Revert Confirmation Popup (SC3)', 'Modal Popup', 'N/A', 'N/A', 'Presented when the Revert button is clicked. Requires the user to confirm and provide a Revert Reason before proceeding.'],
      ['Confirmation Message', 'Static Text', 'N/A', 'N/A', "'Are you sure you want to revert this Application? The application will be returned to <TARGET_STATUS> for review.'"],
      ['Target Status Display', 'Static Text', 'N/A', 'N/A', 'Displays the status the application will be reverted to, derived per Section 3.3, so the user can see the outcome before confirming.'],
      ['Revert Reason', 'Text input', 'Yes', 'Yes', "Free-text mandatory field labelled 'Revert Reason *'. Help text: 'Enter your comment'. Users must enter a reason before confirming."],
      ['Yes, Revert Button', 'Button', 'N/A', 'N/A', 'Confirms the revert. Returns the application to the target status and the owning queue.'],
      ['Back Button', 'Button', 'N/A', 'N/A', 'Dismisses the popup. Returns user to Application Details screen. No change to the application.'],
    ],
    [20, 11, 11, 10, 48],
    { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h2('4.3  Impact of Revert Submission'),
  p("When the user clicks **'Yes, Revert'** to proceed:"),
  bullet('The **Revert Reason** is saved as a Comment against the Application details with details as **"REVERT REASON: <reason inputted by user>"**, following the RF-2365 comment convention.'),
  bullet("**Application Status** is updated from **'Rejected'** to the **target status derived in Section 3.3** (Awaiting Credit Approval | Awaiting Compliance Review | Awaiting Risk Review)."),
  bullet('The application is **dropped back into the corresponding queue** (Credit Queue | Compliance Queue | Risk Queue) and appears in that queue’s list view for action.'),
  bullet("**Audit trail** is captured with: Step = **'Manual revert process'**, Step Details = **'Application reverted by %Username% from Rejected to <TARGET_STATUS>. Revert reason is <REVERT_REASON captured above>'**, Current Application Status = **<TARGET_STATUS>**, Step Status = **'Successful'**, Action By = **<user email id>**."),
  bullet('The **original rejection record is retained** in the audit trail and in the Application Failed Reasons history (RF-2428). Revert does not erase the prior decision — it adds a new event on top of it, so the full decision history remains auditable.'),
  spacer(100),
  tbc('Confirm whether an **email notification** is required on revert, and if so, who the recipients are. The Cancel Application flow notifies the requesting user on approval (ET57) and rejection (ET58) of the request; no equivalent trigger has been defined for Revert.'),
  spacer(100),
  tbc('Confirm whether Revert requires a **maker-checker approval layer**. The Cancel Application flow routes through the Termination Queue for a second decision (RF-2367). The scope agreed for Revert describes a direct action from Application Enquiry with no checker step. This BRD documents the direct-action model as agreed; if governance requires a checker, the flow will need a queue and a further revision of this document.'),
);

P(
  h2('4.4  Post-Revert Processing in the Receiving Queue'),
  bullet('Once reverted, the application is handled by the receiving queue exactly as any other application in that status. No new queue screens or actions are introduced by this feature.'),
  bullet('The Credit user can update the credit parameters available in the Credit Queue — including Other Income, Other Financial Obligations (RF-2682) and the Approved Limit — and then approve, override or reject the application again.'),
  bullet('Where the queue user’s edit triggers a re-run of the decisioning components (Rule Engine, Income Multiplier, Limit Assignment), the System behaves as per existing implementation. The re-run outcome may return the application to a rejected state; if so, it becomes eligible for Revert again under the same rules.'),
  spacer(100),
  tbc('Confirm whether a limit should be placed on the **number of times** a single application may be reverted, or a **time window** beyond which a rejected application can no longer be reverted (for example, no revert after 30 days, or no revert once the customer has submitted a fresh application for the same product).'),
);

/* ---- 5. System changes ---- */
P(
  BREAK(),
  h1('System Auto-Rejection Changes Required to Support Revert', '5.'),
  p('To make credit-driven automatic rejections revertible, the following change to System behaviour is required. This is a change to the **decisioning flow**, not only to the Super Portal, and should be assessed and estimated as such.'),
  h2('5.1  DBR above threshold — route to Credit Queue instead of auto-reject'),
  p('RF-1041 currently terminates the application outright when the DBR safety net is breached. Because the rejection is taken by the System with no queue involvement, there is no previous status for Revert to restore — which is why the routing must change.'),
  spacer(60),
  tbl(
    ['Area', 'Previous Behaviour', 'New Behaviour'],
    [
      ['DBR above threshold', 'System auto-rejects the application immediately. Application Status = **Rejected**, Action By = **<system>**, audit step *{Safety net for Finance DBR}*. No queue involvement and no named decision-maker, so there is no previous status to revert to.', 'System **routes the application to the Credit Queue**. Application Status = **Awaiting Credit Approval**. The Credit user reviews and either approves / overrides or rejects. If the Credit user rejects, the case becomes revertible under rule **R1**.'],
    ],
    [17, 42, 41],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('**Terminology — please confirm before build.** The agreed scope refers to *"Existing DBR > 50%"*. In the delivered system, RF-1041 names this rule **Finance DBR** (*"Finance DBR should be <= 50%"*, audit step *{Safety net for Finance DBR}*), and **"Existing DBR"** is a different defined term — an input to the DBR Room calculation in RF-814, not a rejection trigger. Please confirm that the rule to be re-routed is RF-1041’s **Finance DBR** safety net.'),
  spacer(100),
  tbc('RF-1041 also defines a companion safety net: **Gross DBR > 100%** (audit step *{Safety net for Gross DBR}*), which likewise auto-rejects. Confirm whether this rule is also to be routed to the Credit Queue, or whether it remains a hard auto-rejection and therefore stays outside Revert.'),
  spacer(100),
  tbc('Confirm whether the DBR threshold remains configurable — RF-1041 states *"threshold can be configurable"* — and whether the Credit Queue routing change applies to all three products (CC, PL, CASA) or to specific products only.'),
);

P(
  h2('5.2  Other credit-driven auto-rejections — remain auto-rejected, become revertible'),
  p('For **Failed all segmentations** (RF-132) and **Approved Limit amount < Min Boundary** (RF-361), the System continues to auto-reject as today. No routing change is required. The only change is that these rejection reasons are flagged as **revertible**, so the Revert button is enabled for them and the target status resolves to **Awaiting Credit Approval**.'),
  spacer(80),
  p('Two existing behaviours are deliberately **unchanged** by this BRD, as neither results in a rejection:'),
  bullet('Where no segmentation is configured, or all segmentation criteria are Inactive, RF-132 records *{Pass Strategies Check}* and the application continues — it is not rejected.'),
  bullet('Where a group has no Min/Max Boundary configured, or the boundary is Inactive, RF-361 places the application into the **Credit Queue** with the missing configuration noted — it is not rejected.'),
);

/* ---- 6. Exclusions ---- */
P(
  BREAK(),
  h1('Scenarios Where Revert Is Not Permitted', '6.'),
  p('Not all rejected applications can be reverted. Applications fail at different stages of the journey, and where a failure occurs before any queue has taken ownership, there is no previous status to return the case to. Reverting such an application would place it in a state the System has no logic to process.'),
  p('The Revert button shall remain **disabled** in the following scenarios:'),
  tbl(
    ['Ref', 'Scenario', 'Reason for exclusion'],
    [
      ['X1', 'Application failed at **Pre-Dedupe Check** stage', 'The failure occurs at the very beginning of the journey, before any queue is involved. There is no queue today that handles applications at this stage, so there is no previous status to revert to. Reverting would leave the application outside the System’s processing logic.'],
      ['X2', '**No applicable product found** — audit step *{Pre-Fetch Applicable Product}*, step detail *"There is no applicable product for Application"* (RF-361)', 'The application could not be matched to a product. With no product resolved, the System has no decisioning path to return the application to.'],
      ['X3', 'Rejected by the **AML system**', 'AML outcomes are handled through the manual override results of the AML screening process, not through a queue rejection. These cases must continue to follow the AML override route and are not revertible from Application Enquiry.'],
    ],
    [7, 30, 63],
    { boldFirstCol: true },
  ),
  spacer(160),
  p('Applications already terminated for other reasons — Cancelled, Expired, Blocked, Invalidate, Insufficient Data, Insufficient Time, Declined, Failed by EFR, Failed by Minimum Income, Failed by IBAN — are outside the scope of Revert entirely, as the Revert button is only ever enabled for **Application Status = ‘Rejected’**.'),
);

/* ---- 7. Impact ---- */
P(
  BREAK(),
  h1('Impact on Existing Functionality', '7.'),
  p('Revert changes an assumption that is currently stated to users and customers: that rejection is final. The following existing behaviours are affected and must be addressed as part of this change.'),
  spacer(60),
  tbl(
    ['Ref', 'Area', 'Impact'],
    [
      ['IA1', 'Queue reject confirmation messages', 'The existing confirmation text tells the user the decision is irreversible. Compliance (RF-492) reads *"Are you sure you want to Reject this application? This action can not be revert"* and Risk (RF-282) reads *"…The application will be terminated after you reject it!"*. Wherever a rejection becomes revertible, this wording is no longer accurate and must be revised.'],
      ['IA2', 'Customer notifications already sent', 'Rejection already triggers an email to the customer — **ET8** for Credit Queue rejection and segmentation failure, **ET12** for Compliance, Risk and Sales rejections. By the time a revert is performed, the customer has already been told the application was rejected. A decision is needed on whether the customer is informed that the case has been reopened.'],
      ['IA3', 'DBR decisioning flow', 'The Section 5.1 routing change alters RF-1041 behaviour for every application breaching the DBR safety net, not only those that are later reverted. It will increase Credit Queue volume and requires regression on the DBR safety-net rule.'],
      ['IA4', 'Restore-previous-status mechanism', 'No new mechanism is required. RF-2367 already restores an application to its previous status when a cancellation request is rejected in the Termination Queue. Revert should reuse this.'],
      ['IA5', 'Queues and screens', 'No new queue and no new screen are introduced. Revert adds one button and one popup to an existing screen, and returns applications into existing queues.'],
      ['IA6', 'Reporting and MIS', 'Reverted applications move out of the Rejected population and back into an in-flight queue status. Any report or dashboard counting rejections needs to reflect that a rejection can now be undone, and over what period.'],
      ['IA7', 'Audit and governance', 'Every revert is attributable — permission-gated, with a mandatory reason, a named user and a dedicated audit step. The original rejection is preserved rather than overwritten.'],
    ],
    [7, 22, 71],
    { boldFirstCol: true },
  ),
);

/* ---- 8. Summary ---- */
P(
  BREAK(),
  h1('Summary', '8.'),
  tbl(
    ['Step', 'Actor', 'Action', 'Application Status', 'Next Step'],
    [
      ['1', 'System or Queue User', 'Application is rejected — by a Credit / Compliance / Risk user in queue, or automatically by the System on credit grounds', '**Rejected**', 'Application closed; visible in Application Enquiry'],
      ['2', "Bank User (with 'Revert Application' permission)", "Opens the rejected application in Application Enquiry and clicks 'Revert'", '**Rejected**', 'Revert confirmation popup displayed with target status'],
      ['3', 'Bank User', "Enters Revert Reason and clicks 'Yes, Revert'", '**<Target Status>**', 'Application returned to the owning queue; audit trail and comment captured'],
      ['4', 'Queue User (Credit / Compliance / Risk)', 'Reviews the application, updates credit parameters where applicable', '**<Target Status>**', 'Application re-decisioned'],
      ['5a', 'Queue User', 'Approves or overrides', 'Per existing queue approval flow', 'Application continues the journey'],
      ['5b', 'Queue User', 'Rejects again', '**Rejected**', 'Application is eligible for Revert again under the same rules'],
    ],
    [9, 19, 32, 18, 22],
    { boldFirstCol: true },
  ),
);

/* ---- Appendices ---- */
P(
  BREAK(),
  h1('Appendix 1: Summary of Changes'),
  tbl(
    ['Areas', 'Previous Behaviour', 'New Behaviour'],
    [
      ['Application Enquiry — action bar', "Only the 'Cancel Application' button is available on the Application Details screen.", "A new **'Revert'** button is added alongside 'Cancel Application'. Enabled only when Application Status = 'Rejected' and the rejection origin is revertible."],
      ['Role Management — Enquiry module', "Application Enquiry sub-module offers the 'Cancel Application' permission.", "A new **'Revert Application'** permission is added under the same sub-module."],
      ['Rejected applications', 'A rejected application is final. The customer must submit a new application.', 'A rejected application can be returned to the queue status held before rejection, for the owning team to re-assess.'],
      ['DBR safety net (RF-1041)', 'Auto-rejected by the System with no queue involvement.', "Routed to Credit Queue as **'Awaiting Credit Approval'** for a Credit decision."],
      ['Failed all segmentations / Approved Limit < Min Boundary', 'Auto-rejected by the System; final.', "Auto-rejected as before, but **revertible** to 'Awaiting Credit Approval'."],
      ['Queue reject confirmation messages', 'State that rejection cannot be reverted or that the application will be terminated.', 'Must be revised where the rejection is revertible (see IA1).'],
      ['Audit trail', 'Rejection is the terminal event on the application.', "A **'Manual revert process'** event is appended, preserving the original rejection record."],
    ],
    [22, 37, 41],
    { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h1('Appendix 2: Revert Eligibility Matrix'),
  tbl(
    ['Ref', 'Rejection Origin', 'Audit Step at Rejection', 'Revert', 'Status After Revert'],
    [
      ['R1', 'Credit Queue — rejected by Credit user', '{Rejected in Credit Queue}', 'Yes', 'Awaiting Credit Approval'],
      ['R2', 'Compliance Queue — rejected by Compliance user', 'Compliance Reject', 'Yes', 'Awaiting Compliance Review'],
      ['R3', 'Risk Queue — rejected by Risk user', 'Risk Reject', 'Yes', 'Awaiting Risk Review'],
      ['R4', 'System — DBR above threshold (routed to Credit Queue, then rejected)', '{Rejected in Credit Queue}', 'Yes', 'Awaiting Credit Approval'],
      ['R5', 'System — failed all segmentations', '{Fail Strategies Check}', 'Yes', 'Awaiting Credit Approval'],
      ['R6', 'System — Approved Limit < Min Boundary', 'Approval Limit Result = "Failed"', 'Yes', 'Awaiting Credit Approval'],
      ['—', 'Sales Queue — rejected by Sales user', 'Sale Reject', '**TBC**', 'Awaiting Sales Response'],
      ['X1', 'Pre-Dedupe Check failure', 'Pre-Dedupe Check', '**No**', 'Not applicable'],
      ['X2', 'No applicable product found', '{Pre-Fetch Applicable Product}', '**No**', 'Not applicable'],
      ['X3', 'Rejected by AML system', 'AML manual override result', '**No**', 'Not applicable'],
    ],
    [8, 29, 25, 12, 26],
    { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h1('Appendix 3: Workflow'),
  numbered('An application is rejected — either by a queue user (Credit, Compliance or Risk) or automatically by the System on credit grounds.'),
  numbered('A bank user with the ‘Revert Application’ permission opens the application in Application Enquiry.'),
  numbered('The System reads the audit step recorded at rejection and determines whether the application is revertible, and to which status (Section 3.3).'),
  numbered("If revertible, the 'Revert' button is enabled; otherwise it remains disabled."),
  numbered("The user clicks 'Revert'. The confirmation popup is displayed, showing the target status."),
  numbered('The user enters a mandatory Revert Reason and confirms.'),
  numbered('The System updates the Application Status to the target status, writes the audit trail entry and comment, and returns the application to the owning queue.'),
  numbered('The queue user actions the application — updating credit parameters where applicable — and approves, overrides or rejects it.'),
  spacer(160),
  placeholder('[ Workflow diagram to be inserted — Application Revert Workflow ]'),
);

P(
  BREAK(),
  h1('Appendix 4: Open Questions and Items to Confirm'),
  tbl(
    ['#', 'Section', 'Question'],
    [
      ['1', '5.1', '**Terminology:** is the rule to be re-routed RF-1041’s **Finance DBR** safety net (> 50%)? The agreed scope calls it "Existing DBR", which is a different defined term in RF-814.'],
      ['2', '5.1', 'Does the companion **Gross DBR > 100%** safety net also route to the Credit Queue, or stay a hard auto-rejection outside Revert?'],
      ['3', '5.1', 'Is the DBR threshold configurable, and does the Credit Queue routing change apply to all products (CC, PL, CASA)?'],
      ['4', '3.1', 'Should **Sales Queue** rejections be revertible to "Awaiting Sales Response", or deliberately excluded?'],
      ['5', '2', 'Is **Mortgage Loan** in scope? It terminates to "Cancelled" rather than "Rejected", so it would not be captured by the rule as drafted.'],
      ['6', '4.1', "Should the 'Revert Application' permission be restricted to Credit Department roles, or granted at the bank’s discretion?"],
      ['7', '4.3', 'Is an email notification required on revert, and who are the recipients?'],
      ['8', '4.3', 'Does Revert require a maker-checker approval layer, as Cancel Application does via the Termination Queue?'],
      ['9', '4.4', 'Should the number of reverts per application, or a time window for reverting, be capped?'],
      ['10', '7 (IA1)', 'Confirm the revised wording for the Compliance and Risk reject confirmation messages, which currently state the action cannot be reverted.'],
      ['11', '7 (IA2)', 'The customer has already received a rejection email (ET8 / ET12) before any revert. Should the customer be notified that the application has been reopened?'],
      ['12', '2', 'Confirm the canonical Application Status spellings ("Awaiting Sales Response" vs "Awaiting Sale Response") so the Revert mapping uses stored values.'],
    ],
    [7, 12, 81],
    { boldFirstCol: true },
  ),
  spacer(300),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [new TextRun({ text: 'This is not a legally binding document.', size: 18, color: INK500, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Highly confidential not to be shared without written consent.', size: 18, color: INK500, font: FONT })],
  }),
);

/* ================= ASSEMBLE ================= */
const doc = new Document({
  creator: 'Appro',
  title: 'Application Revert in Super Portal V1.0',
  description: 'Business Requirements Document — Reem Finance',
  numbering: {
    config: [{
      reference: 'flow',
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 520, hanging: 300 } } },
      }],
    }],
  },
  styles: { default: { document: { run: { font: FONT, size: 20, color: '1F2937' } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1300, right: 1134, bottom: 1134, left: 1134, header: 560, footer: 560 },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            spacing: { after: 0 },
            children: [new TextRun({ text: 'Confidential', bold: true, size: 15, color: INK500, font: FONT })],
          }),
          new Paragraph({
            spacing: { after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: INK200, space: 4 } },
            children: [new TextRun({ text: 'This is not a legally binding document  ·  Highly confidential not to be shared without written consent', size: 14, color: INK500, font: FONT })],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: INK200, space: 6 } },
          children: [
            new TextRun({ text: 'Application Revert in Super Portal   ·   V1.0   ·   ', size: 14, color: INK500, font: FONT }),
            new TextRun({ children: [PageNumber.CURRENT], size: 14, color: INK500, font: FONT, bold: true }),
          ],
        })],
      }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || 'Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx';
  fs.writeFileSync(out, buf);
  console.log('WROTE', out, buf.length, 'bytes');
});
