const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, BorderStyle, PageBreak, Header, Footer,
  PageNumber, VerticalAlign, LevelFormat, ImageRun,
} = require('docx');

/* ---------- Appro palette ---------- */
const DARK   = '0C1931';
const DENIM  = '1A2D52';
const BLUE   = '3B7EF6';
const INK100 = 'F2F5FA';
const INK200 = 'D9E0EA';
const INK500 = '5A6B85';
const AMBER_BG = 'FFF7E6';
const AMBER_TX = '9A6206';

const FONT = 'Calibri';
const CONTENT_W = 9638;
const DIR = __dirname;

/* ---------- inline **bold** / *italic* parser ---------- */
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

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 26, color: DARK, font: FONT })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 130 },
    children: [new TextRun({ text, bold: true, size: 23, color: DENIM, font: FONT })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 110 },
    children: [new TextRun({ text, bold: true, size: 21, color: DENIM, font: FONT })],
  });
}

const bullet = (text) => new Paragraph({
  children: runs(text),
  bullet: { level: 0 },
  spacing: { before: 40, after: 80, line: 276 },
});

const sub = (text) => new Paragraph({
  children: runs(text, { size: 19 }),
  bullet: { level: 1 },
  spacing: { before: 30, after: 60, line: 270 },
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

  const cell = (text, i, isHeader, rowIdx) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    shading: {
      type: ShadingType.CLEAR,
      fill: isHeader ? DARK : (rowIdx % 2 ? INK100 : 'FFFFFF'),
      color: 'auto',
    },
    margins: { top: 90, bottom: 90, left: 95, right: 95 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      spacing: { before: 0, after: 0, line: 252 },
      children: isHeader
        ? [new TextRun({ text: String(text ?? ''), bold: true, size: 18, color: 'FFFFFF', font: FONT })]
        : runs(String(text ?? ''), { size: 18, allBold: !!opts.boldFirstCol && i === 0 }),
    })],
  });

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
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((hd, i) => cell(hd, i, true, 0)) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri)) })),
    ],
  });
}

/* ---------- screen image + caption ---------- */
function screen(file, w, h, caption) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 70 },
      children: [new ImageRun({
        data: fs.readFileSync(path.join(DIR, file)),
        transformation: { width: w, height: h },
        type: 'png',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: INK500, font: FONT })],
    }),
  ];
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
    children: [new TextRun({ text: 'V1.1', bold: true, size: 34, color: BLUE, font: FONT })],
  }),
  p('This is not a legally binding document.', { size: 19, color: INK500 }),
  p('Highly confidential not to be shared without written consent.', { size: 19, color: INK500 }),
  BREAK(),
);

/* ---- Feature overview ---- */
P(
  new Paragraph({
    spacing: { before: 0, after: 180 },
    children: [new TextRun({ text: 'APPLICATION REVERT IN SUPER PORTAL', bold: true, size: 24, color: DENIM, font: FONT })],
  }),
  h1('Feature Overview'),
  p('This document describes the Super Portal **Application Revert** capability, which allows authorised bank staff to return a **rejected** application to the queue status it held immediately before the rejection decision was taken, so that the case can be re-assessed without the customer having to reapply. It complements the existing **Cancel Application** capability: where Cancel terminates an application, Revert reopens one.'),
  p('Revert follows the **same maker-checker governance already in place for Application Cancellation**. The bank user who requests the revert is the **Maker**. The request is not applied immediately: the application is held in an intermediate status and placed in a **Revert Queue**, where a second user — the **Checker** — approves or rejects it. The application is returned to its previous queue status only once the Checker approves. Key steps are as following:'),
  bullet("**Maker** — bank user with the **'Revert Application'** permission opens a rejected application in **Application Enquiry** and clicks **'Revert'**."),
  bullet('The Maker confirms and enters a mandatory **Revert Reason** for approval from the Checker.'),
  bullet("Application Status is updated to **'User Initiated Revert'** and the application is dropped into the **Revert Queue**. It is **not** yet returned to its previous status."),
  bullet("**Checker** — user with the **'Evaluate Application'** permission on the Revert Queue reviews the request and the Revert Reason, then approves or rejects it."),
  bullet('On **approval**, the application is returned to the queue status held immediately before the rejection and re-enters that queue. On **rejection**, the application remains **Rejected**.'),
  bullet('If no decision is made within a configurable timeout period, the revert request **lapses** and the application remains **Rejected**.'),
  spacer(80),
  p('The primary business driver is to support the **Credit Department**. Today, once an application is rejected — whether by a queue user or automatically by the system on credit grounds — there is no route back and the customer must reapply. In practice Credit frequently needs to revisit a rejection because a credit parameter was wrong, incomplete or has since changed; for example, income evidence arrives late, an obligation was double-counted, or a decision boundary is re-tuned. Revert gives Credit a controlled, dual-controlled way to bring the case back into the queue, update the credit parameters and re-decision it.'),
  spacer(60),
  p('**Applicable products:** CC, PL, CASA.'),
  spacer(40),
  tbl(
    ['Product Type', 'Applicable Status that can be reverted in Super Portal'],
    [
      ['CC', 'Rejected'],
      ['PL', 'Rejected'],
      ['CASA', 'Rejected'],
    ],
    [22, 78],
    { boldFirstCol: true },
  ),
  spacer(120),
  p('Revert operates on a single application status. In every status other than **Rejected** the button is displayed in a disabled state, consistent with the existing treatment of the Cancel Application button.'),
  spacer(60),
  tbc('Confirm whether **Mortgage Loan** is in scope. The Mortgage journey terminates to *Cancelled* rather than *Rejected* on failure, so it would not be captured by the rule as drafted.'),
);

P(
  BREAK(),
  p('The revert shall be restricted in below scenarios:'),
  spacer(40),
  tbl(
    ['Scenario', 'Condition / Application Status'],
    [
      ['Bank users already initiated revert', "Application Status = **'User Initiated Revert'** — a request is already awaiting a Checker decision in the Revert Queue and a second request cannot be raised."],
      ['Application is not in a rejected state', 'Any Application Status other than **Rejected** — including Lead, In Progress, Awaiting Compliance Review, Awaiting Risk Review, Awaiting Sales Response, Awaiting Credit Approval, Approval In Principle, Awaiting Cooling Off Period, Awaiting Signature, KFS Signature and Completed.'],
      ['Application already terminated for another reason', 'Cancelled | User Initiated Cancellation | Expired | Blocked | Invalidate | Insufficient Data | Insufficient Time | Declined | Failed by EFR | Failed by Minimum Income | Failed by IBAN'],
      ['Application failed at Pre-Dedupe Check stage', 'The failure occurs at the very beginning of the journey, before any queue is involved. There is no queue that handles applications at this stage, so there is no previous status to return the application to.'],
      ['No applicable product found', 'The application could not be matched to a product — audit step *{Pre-Fetch Applicable Product}*, step detail *"There is no applicable product for Application"*. With no product resolved, the system has no decisioning path to return the application to.'],
      ['Rejected by the AML system', 'AML outcomes are handled through the manual override results of the AML screening process rather than a queue rejection. These cases must continue to follow the AML override route.'],
    ],
    [26, 74],
    { boldFirstCol: true },
  ),
  spacer(120),
  p('Where a rejected application falls into one of the restricted scenarios above, the Revert button remains visible but disabled, so that the user can see the action exists and is simply not available for that case.'),
  spacer(100),
  tbc("**'User Initiated Revert'** is a new application status. Confirm that it is added to the **Cancellation** restriction list, so that an application awaiting a revert decision cannot also be submitted for cancellation at the same time."),
);

/* ---- End-to-end flow ---- */
P(
  BREAK(),
  h1('End-to-End Application Revert Flow from Super Portal'),
  h2('1.  Role Management: Revert Application Permission (Maker)'),
  bullet("Bank users must only be able to request a revert if they have been explicitly granted the **'Revert Application'** permission within their Super Portal role."),
  bullet("A new role permission named **'Revert Application'** shall be added under the **Enquiry** module, **Application Enquiry** sub-module in the Role Management section of the Super Portal, alongside the existing **'Cancel Application'** permission."),
  ...screen('sc1.png', 620, 310, "SC1: Add Role screen — Enquiry > Application Enquiry > 'Revert Application' permission"),
  tbl(
    ['Component', 'Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['Revert Application Checkbox', 'Checkbox', 'Yes', 'N/A', "Selectable checkbox to grant or revoke the 'Revert Application' permission for a role. It indicates whether the role holder can request application reverts."],
      ['Revert Application Label', 'Label', 'N/A', 'N/A', 'Descriptive label shown alongside the checkbox, identifying the permission name.'],
    ],
    [19, 10, 13, 14, 44],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('**Permission behaviour:**'),
  tbl(
    ['Permission Value', 'Allowed Actions'],
    [
      ['Revert Application = TRUE', "Users can view the 'Revert' button on the Application Enquiry details screen and submit revert requests for Checker approval."],
      ['Revert Application = FALSE', "Users cannot view the 'Revert' button. Users cannot request application reverts."],
    ],
    [28, 72],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc("Confirm whether 'Revert Application' should be restricted to Credit Department roles only, or made available to any role at the bank’s discretion. The stated business driver is Credit-led, but a Compliance or Risk rejection returns the application to those teams rather than to Credit."),
);

P(
  h2('2.  Application Revert from Application Enquiry view (Maker)'),
  bullet("The existing **Application Enquiry** module in the Super Portal is the entry point for the revert process. Bank users with the 'Revert Application' permission can request a revert from the **Application Details** screen."),
  bullet("The **'Revert'** button is placed in the same action bar as the existing **'Cancel Application'** button, at the foot of the Application Details panel."),
  bullet("The button is **enabled only when Application Status = 'Rejected'** and the rejection origin is revertible. In all other cases it is displayed disabled."),
  ...screen('sc2.png', 620, 364, "SC2: Application Enquiry — 'Revert' button placed next to the existing 'Cancel Application' button"),
  ...screen('sc3.png', 620, 364, 'SC3: Revert Confirmation Popup — the Revert Reason is entered for approval from the Checker'),
);

P(
  tbl(
    ['Component', 'Type', 'Mandatory', 'Editable', 'Description'],
    [
      ['Revert Button', 'Button', 'N/A', 'N/A', "Visible only to users with the 'Revert Application' permission. Enabled only when Application Status = 'Rejected' and the rejection origin is revertible. It initiates the revert request for the selected application."],
      ['Revert Confirmation Popup (SC3)', 'Modal Popup', 'N/A', 'N/A', 'Presented when the Revert button is clicked. Requires the user to confirm and provide a Revert Reason before the request is submitted to the Checker.'],
      ['Confirmation Message', 'Static Text', 'N/A', 'N/A', "'Are you sure you want to revert this Application?' with the supporting line 'The request will be sent to the Revert Queue for Checker approval. If approved, the application will be returned to <TARGET_STATUS>.'"],
      ['Target Status Display', 'Static Text', 'N/A', 'N/A', 'Displays the status the application will be returned to on approval, derived per section 5, so both Maker and Checker can see the outcome before it is applied.'],
      ['Revert Reason', 'Text input', 'Yes', 'Yes', "Free-text mandatory field labelled 'Revert Reason *'. Help text: 'Enter your comment'. Users must enter a reason before confirming. The reason is shown to the Checker."],
      ['Yes, Revert Button', 'Button', 'N/A', 'N/A', 'Confirms the request. Sends the application to the Revert Queue for Checker approval.'],
      ['Back Button', 'Button', 'N/A', 'N/A', 'Dismisses the popup. Returns user to the Application Details screen. No change to the application.'],
    ],
    [19, 10, 14, 13, 44],
    { boldFirstCol: true },
  ),
);

/* ---- 3. Impact of submission ---- */
P(
  BREAK(),
  h2('3.  Impact of revert submission'),
  p("When the Maker clicks 'Yes, Revert' to submit the revert request:"),
  spacer(40),
  h3('3.1  Save Revert Reason as Comment'),
  p('The Revert Reason text is displayed in the Comment area with the below details:'),
  bullet('Comment title: <<User’s name posted comment>> <<Department name>>'),
  bullet('Comment body: **"REVERT REASON: <Content of Revert Reason inputted>"**'),
  bullet('Comment footer: <<Posted Date time>> (format hh:mm AM/PM | DD MM YYYY)'),
  bullet('Save comment to DB with prefix **"REVERT REASON"** — format: REVERT REASON: <revert reason comment text>'),
  spacer(60),
  h3('3.2  Application status and audit trail'),
  bullet("Application Status = **'User Initiated Revert'** — the application is **not** yet returned to its previous status"),
  bullet('The application is dropped into the **Revert Queue** for Checker review (section 4)'),
  bullet('The **target status** is determined at submission (section 5) and displayed to both the Maker and the Checker'),
  spacer(60),
  p('The below [Application History] object logs shall be stored as audit trail information and displayed as the Application step details under the Application Enquiry details screen:'),
  tbl(
    ['Field', 'Value'],
    [
      ['[Application ID]', '<current Application ID>'],
      ['[Step]', "**“Manual revert process”**"],
      ['[State]', "**“User Initiated Revert”**"],
      ['[Start Time] / [End Time]', 'Recorded by appro with following format: yyyy-MM-dd HH:mm:ss'],
      ['[Step Status]', '“Success”'],
      ['[Step Detail]', '**“Manual revert initiated by %Username%. Revert reason is <REVERT_REASON SC3>”**'],
      ['[Action by]', '<user email id>'],
    ],
    [26, 74],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('The **original rejection record is retained** in the audit trail and in the Application Failed Reasons section. Revert does not erase the prior decision — it adds new events on top of it, so the full decision history remains auditable.'),
);

/* ---- 4. Revert Queue ---- */
P(
  BREAK(),
  h2('4.  Revert Queue (Checker)'),
  p('The Revert Queue is a new queue within the Super Portal that allows the Checker team to view and make decisions on applications that have been submitted for manual revert. It provides the governance and approval layer before a rejection is reopened, mirroring the Termination Queue used for manual cancellation.'),
  h3('4.1  Revert Queue Menu and List View'),
  bullet("**'Revert Queue'** shall appear as an entry in the **Queue** menu of the Super Portal, alongside the existing queues such as the Termination Queue."),
  bullet('Navigation: user clicks **Queue** in the left menu, then the **Revert Queue** sub-menu. The Revert Queue list screen is displayed. Clicking a row opens the Application Details screen.'),
  bullet('For viewing and searching the list of applications, the queue follows the same behaviour as the existing Super Portal manual queues. No new list behaviour is introduced.'),
  spacer(80),
  tbc('Confirm whether a **separate Revert Queue** is required, or whether revert requests should be evaluated in the existing **Termination Queue**. A separate queue is recommended: the two request types have opposite outcomes, different checker populations may be appropriate, and mixing them in one list makes the checker decision ambiguous.'),
  spacer(120),
  h3('4.2  Role Information for Revert Queue'),
  p('Under **Manually Queue**, a new queue shall be introduced as **“Revert Queue”** with View and Evaluate application roles.'),
  ...screen('sc4.png', 620, 310, 'SC4: Add Role screen — Manually Queue > Revert Queue role permissions'),
  tbl(
    ['Component Name', 'Component Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['Revert Queue', 'Main Label', 'NA', 'NA', 'Revert Queue heading under the Manually Queue in the Add Role screen'],
      ['View Application', 'Check box', 'Y', 'NA', 'Check box should be provided to indicate the selection of the Role details'],
      ['Evaluate Application', 'Check box', 'Y', 'NA', 'Check box should be provided to indicate the selection of the Role details'],
    ],
    [17, 15, 12.5, 14.5, 41],
    { boldFirstCol: true },
  ),
);

P(
  spacer(140),
  p('**Update to the Permission Matrix:**'),
  tbl(
    ['Menu (Group Permission)', 'Sub-Menu (Permission)', 'Action (Permission Detail)', 'Status Display in UI', 'Display Permission Name'],
    [
      ['Manually Queue', 'Revert Queue', 'View List of Applications', 'Viewer', 'View Application'],
      ['', '', 'Approve Application', 'Approver', 'Evaluate Application'],
      ['', '', 'Reject Application', 'Approver', 'Evaluate Application'],
    ],
    [20, 18, 26, 16, 20],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('**Apply rules:**'),
  tbl(
    ['Permission Value', 'Access Granted'],
    [
      ['View Application (Revert Queue) = TRUE', 'Users can access the Revert Queue list view AND view Application Details.'],
      ['View Application (Revert Queue) = FALSE', 'Users cannot see the Revert Queue in the Queue menu.'],
      ['Evaluate Application (Revert Queue) = TRUE', 'Users can see and click the Approve / Reject buttons in the Revert Queue Application Details and perform the action.'],
      ['Evaluate Application (Revert Queue) = FALSE', 'Users cannot see the Approve or Reject buttons.'],
    ],
    [34, 66],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('Confirm whether the system must **prevent the Maker from approving their own revert request**. The Cancellation flow does not state this control explicitly. Since the business purpose of the Checker is a genuine second pair of eyes, it is recommended that a user holding both permissions cannot evaluate a request they raised themselves.'),
);

P(
  BREAK(),
  h3('4.3  Revert Queue Details View'),
  bullet('The Details section displays the same information as the **Detail Screen Description of Application Enquiry**. No new data points are introduced.'),
  bullet('The collapsible **Sections** list shows the same detail sections displayed under Application Enquiry, collapsed by default.'),
  bullet('The **Comments** tab is **selected by default** when accessing the screen, so that the Revert Reason entered by the Maker is the first thing the Checker sees.'),
  bullet('The **Document** tab is available and behaves as per the existing implementation.'),
  ...screen('sc5.png', 620, 364, 'SC5: Revert Queue — Application Details with the Maker’s Revert Reason and the Approve / Reject actions'),
  BREAK(),
  tbl(
    ['Component', 'Component Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['Application Detail', 'Label', 'N/A', 'N/A', 'Default value is “Application Detail”.'],
      ['Link navigate', 'Label', 'N/A', 'N/A', 'Default value is “Queue > Revert Queue > Application Details”.'],
      ['Details', 'Section', 'N/A', 'N/A', 'Display same info as the Detail Screen Description of Application Enquiry, plus the requesting user and the target status the application will return to on approval.'],
      ['Sections', 'Section', 'N/A', 'N/A', 'Display detail information of the application. User can collapse / expand. Default is Collapsed.'],
      ['Comment', 'Tab link', 'N/A', 'N/A', 'Opens the Comment tab. This tab is selected by default when accessing the screen, showing the REVERT REASON comment.'],
      ['Document', 'Tab link', 'N/A', 'N/A', 'Opens the Document tab.'],
      ['Approve Button', 'Button', 'N/A', 'N/A', "Visible only to users with 'Evaluate Application' = TRUE. Approves the revert request."],
      ['Reject Button', 'Button', 'N/A', 'N/A', "Visible only to users with 'Evaluate Application' = TRUE. Rejects the revert request."],
    ],
    [16, 15, 12.5, 14.5, 42],
    { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h3('4.4  Approve Revert'),
  p("When the user with Evaluate Application permission as TRUE clicks **'Approve'** in the Revert Queue:"),
  bullet("System displays confirmation popup: **'Are you sure you want to Approve the application revert?'**"),
  bullet("If user clicks **'Cancel'**: popup closes, no action taken."),
  bullet("If user clicks **'Yes, Approve'**: system proceeds with the revert."),
  ...screen('sc6.png', 620, 217, 'SC6: Approve and Reject confirmation popups in the Revert Queue'),
  p('On approval:'),
  bullet('Application Status = **<TARGET_STATUS>** — Awaiting Credit Approval, Awaiting Compliance Review or Awaiting Risk Review, as determined in section 5'),
  bullet('The application re-enters the corresponding queue — Credit Queue, Compliance Queue or Risk Queue — and appears in that queue’s list view for action'),
  bullet('Approval toaster message is displayed: **“Revert of <Application ID> is approved”**'),
  bullet("Update [Revert Queue] = **'APPROVED'** → remove application from the Revert Queue. The user cannot search for or access the application from the Revert Queue."),
  bullet('Email notification is sent to the bank user who requested the revert'),
  spacer(60),
  p('Audit trail for checker approval:'),
  tbl(
    ['Field', 'Value'],
    [
      ['[Application ID]', '<current Application ID>'],
      ['[Step]', '**“Revert Queue”**'],
      ['[State]', '**<TARGET_STATUS>**'],
      ['[Start Time] / [End Time]', 'Recorded by appro with following format: yyyy-MM-dd HH:mm:ss'],
      ['[Step Status]', '“Success”'],
      ['[Step Detail]', 'Application revert requested by "%Username%" and approved by "%Username%"'],
      ['[Action by]', '<System>'],
    ],
    [26, 74],
    { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h3('4.5  Reject Revert'),
  p("When the user with Evaluate Application permission as TRUE clicks **'Reject'** in the Revert Queue:"),
  bullet("System displays confirmation popup: **'Are you sure you want to Reject the application revert?'**"),
  bullet("If user clicks **'Cancel'**: popup closes, no action taken."),
  bullet("If user clicks **'Yes, Reject'**: the revert request is rejected and the application status is restored."),
  spacer(60),
  bullet('Application Status = **“Rejected”** — the status held before the revert request was raised'),
  bullet('Rejection toaster message is displayed: **“Revert of <Application ID> is rejected”**'),
  bullet("Update [Revert Queue] = **'REJECTED'** → remove application from the Revert Queue."),
  bullet('Email notification is sent to the bank user who requested the revert'),
  spacer(60),
  p('Audit trail for checker rejection:'),
  tbl(
    ['Field', 'Value'],
    [
      ['[Application ID]', '<current Application ID>'],
      ['[Step]', '**“Revert Queue”**'],
      ['[State]', '**“Rejected”**'],
      ['[Start Time] / [End Time]', 'Recorded by appro with following format: yyyy-MM-dd HH:mm:ss'],
      ['[Step Status]', '“Success”'],
      ['[Step Detail]', 'Application revert requested by "%Username%" and rejected by "%Username%"'],
      ['[Action by]', '<System>'],
    ],
    [26, 74],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('A rejected revert request does not bar a future request. If new information becomes available, the Maker may raise a fresh revert request on the same application, subject to the restrictions in the Feature Overview.'),
);

P(
  BREAK(),
  h3('4.6  Timeout scenario if no decision is taken in the Revert Queue'),
  p('A configurable timeout period of **[X] days** begins when the revert request is submitted. The following outcomes apply:'),
  spacer(40),
  tbl(
    ['Scenario', 'Outcome'],
    [
      ['Request is APPROVED in the Revert Queue within [X] days', "Application status changed from 'User Initiated Revert' to **<TARGET_STATUS>** and the application re-enters the owning queue. Please refer to 4.4 above."],
      ['Request is REJECTED in the Revert Queue within [X] days', "Application status changed from 'User Initiated Revert' back to **'Rejected'**. Please refer to 4.5 above."],
      ['No decision taken within [X] days', "The revert request **lapses**. The system updates the application status from 'User Initiated Revert' back to **'Rejected'** the next day after the timeout period ends, and removes the application from the Revert Queue. Email notification is sent to the bank user who requested the revert — same email as in 4.5."],
    ],
    [30, 70],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('Audit trail for the timeout outcome:'),
  tbl(
    ['Field', 'Value'],
    [
      ['[Step]', '**“Auto Revert Rejection on timeout”**'],
      ['[State]', '**“Rejected”**'],
      ['[Step Status]', '“Success”'],
      ['[Step Detail]', 'Application revert requested by "%Username%" and rejected by System, as per approval timeout configuration of [X] days'],
      ['[Action by]', '<System>'],
    ],
    [26, 74],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('**The timeout default is deliberately the opposite of Cancellation — please confirm.** For manual cancellation, an un-actioned request auto-**approves** and the application is cancelled. For Revert the recommended default is to let the request **lapse**, leaving the application Rejected. Auto-approving a revert would reopen a rejected case with no second pair of eyes, which is precisely the control the Checker exists to provide; letting it lapse returns the application to a status it validly held. Confirm this, and confirm the value of **[X]** — 5 days is proposed, to match the cancellation timeout.'),
);

P(
  BREAK(),
  h3('4.7  Email notifications'),
  p('Email notifications are sent to the bank user who requested the revert, following the same pattern as the cancellation flow:'),
  spacer(40),
  tbl(
    ['Type', 'Subject', 'Content', 'Trigger'],
    [
      ['Email', '[Super Portal] - Application %%APPLICATION_ID%% revert is approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% has been approved. The application has been returned to %%TARGET_STATUS%%. Best Regards, Reem Finance', 'One time — send immediately when the revert is approved in the Revert Queue'],
      ['Email', '[Super Portal] - Application %%APPLICATION_ID%% revert is not approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% is rejected. The application remains Rejected. Best Regards, Reem Finance', 'One time — send immediately when the revert is rejected in the Revert Queue, or when the request lapses on timeout'],
    ],
    [9, 25, 42, 24],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('Confirm the email template wording and whether separate templates are required for the checker rejection and the timeout lapse, or whether one template covers both outcomes.'),
);

/* ---- 5. Target status ---- */
P(
  BREAK(),
  h2('5.  Revert target status determination'),
  p('The status an application is returned **to** on approval is determined by **how it became Rejected**, not by the Maker or the Checker. The system derives the target status from the application’s own audit trail — specifically, from the step recorded at the point of rejection — and displays it on the confirmation popup and in the Revert Queue before any decision is taken.'),
  h3('5.1  Rejection by a queue user'),
  tbl(
    ['Ref', 'Rejection origin', 'Application Status after approved Revert', 'Application re-enters'],
    [
      ['R1', 'Rejected by Credit user in **Credit Queue**', 'Awaiting Credit Approval', 'Credit Queue'],
      ['R2', 'Rejected by Compliance user in **Compliance Queue**', 'Awaiting Compliance Review', 'Compliance Queue'],
      ['R3', 'Rejected by Risk user in **Risk Queue**', 'Awaiting Risk Review', 'Risk Queue'],
    ],
    [8, 38, 30, 24],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('The **Sales Queue** also rejects applications today, but Sales rejections were not covered in the agreed scope. Confirm whether a Sales Queue rejection should be revertible to **Awaiting Sales Response**, or deliberately excluded.'),
  h3('5.2  Auto-rejection by the system on credit grounds'),
  tbl(
    ['Ref', 'Rejection origin', 'Treatment', 'Status after approved Revert', 'Re-enters'],
    [
      ['R4', '**DBR above threshold**', 'System behaviour changes — the application is **routed to Credit Queue** instead of being auto-rejected outright, per section 6. The Credit user then rejects it in the queue.', 'Awaiting Credit Approval', 'Credit Queue'],
      ['R5', '**Failed all segmentations**', 'Auto-rejected by the system as today; flagged as revertible', 'Awaiting Credit Approval', 'Credit Queue'],
      ['R6', '**Approved Limit amount < Min Boundary**', 'Auto-rejected by the system as today; flagged as revertible', 'Awaiting Credit Approval', 'Credit Queue'],
    ],
    [7, 23, 38, 20, 12],
    { boldFirstCol: true },
  ),
  spacer(140),
  p('**Rationale for R4.** A DBR above the threshold is a credit judgement, not a hard eligibility failure. Routing the case into the Credit Queue first — rather than auto-rejecting it — means the rejection is recorded as a **queue decision** with a named decision-maker, which in turn makes it revertible under the standard R1 rule. This removes the need for a special revert path for DBR cases and keeps a single, auditable decision model. It also follows an established pattern: a **Refer** outcome from limit assignment already routes to the Credit Queue.'),
  p('**Rationale for R5 and R6.** Both outcomes are driven by configurable credit parameters — segmentation criteria and decision boundaries. When those parameters are corrected, the same application should be re-assessable. Returning to **Awaiting Credit Approval** places the case in front of the Credit team who own those parameters.'),
);

P(
  BREAK(),
  h3('5.3  How the system identifies the rejection origin'),
  p('Each rejection path already writes a distinct step to the audit trail. The system shall use that step to determine both **whether** the application is revertible and **which** status it returns to. No new data capture is required.'),
  tbl(
    ['Audit trail step recorded at rejection', 'Rejection origin', 'Revert', 'Target Application Status'],
    [
      ['{Rejected in Credit Queue}', 'Credit Queue — manual decision', 'Yes', 'Awaiting Credit Approval'],
      ['Compliance Reject', 'Compliance Queue — manual decision', 'Yes', 'Awaiting Compliance Review'],
      ['Risk Reject', 'Risk Queue — manual decision', 'Yes', 'Awaiting Risk Review'],
      ['Sale Reject', 'Sales Queue — manual decision', '**TBC**', 'Awaiting Sales Response'],
      ['{Safety net for Finance DBR}', 'System — DBR above threshold', 'Yes, after the section 6 change', 'Awaiting Credit Approval'],
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
  p('This mapping resolves an important distinction: **failed all segmentations** (revertible) and **no applicable product** (not revertible) are separate rules writing separate audit steps — *{Fail Strategies Check}* and *{Pre-Fetch Applicable Product}* — so the eligibility rule can reliably tell them apart.'),
);

/* ---- 6. System change ---- */
P(
  BREAK(),
  h2('6.  System change required: DBR routing to Credit Queue'),
  p('To make credit-driven automatic rejections revertible, the following change to system behaviour is required. This is a change to the **decisioning flow**, not only to the Super Portal, and should be assessed and estimated as such.'),
  p('The DBR safety net currently terminates the application outright when the threshold is breached. Because the rejection is taken by the system with no queue involvement, there is no previous status for Revert to restore — which is why the routing must change.'),
  spacer(60),
  tbl(
    ['Area', 'Previous Behaviour', 'New Behaviour'],
    [
      ['DBR above threshold', 'The system auto-rejects the application immediately. Application Status = **Rejected**, Action By = **<system>**, audit step *{Safety net for Finance DBR}*. There is no queue involvement and no named decision-maker, so there is no previous status to revert to.', 'The system **routes the application to the Credit Queue**. Application Status = **Awaiting Credit Approval**. The Credit user reviews and either approves / overrides or rejects. If the Credit user rejects, the case becomes revertible under rule **R1**.'],
    ],
    [17, 42, 41],
    { boldFirstCol: true },
  ),
  spacer(140),
  tbc('**Terminology — please confirm before build.** The agreed scope refers to *"Existing DBR > 50%"*. In the delivered system this safety-net rule is named **Finance DBR** (*"Finance DBR should be <= 50%"*, audit step *{Safety net for Finance DBR}*), while **Existing DBR** is a different defined term used as an input to the DBR Room calculation rather than as a rejection trigger. Please confirm that the rule to be re-routed is the **Finance DBR** safety net.'),
  spacer(100),
  tbc('A companion safety net also exists: **Gross DBR > 100%** (audit step *{Safety net for Gross DBR}*), which likewise auto-rejects. Confirm whether this rule is also to be routed to the Credit Queue, or whether it remains a hard auto-rejection and therefore stays outside Revert.'),
  spacer(100),
  tbc('Confirm whether the DBR threshold remains configurable, and whether the Credit Queue routing change applies to all three products (CC, PL, CASA) or to specific products only.'),
  spacer(120),
  p('Two existing behaviours are deliberately **unchanged**, as neither results in a rejection:'),
  bullet('Where no segmentation is configured, or all segmentation criteria are Inactive, the application continues — it is not rejected.'),
  bullet('Where a group has no Min/Max Boundary configured, or the boundary is Inactive, the application is placed into the **Credit Queue** with the missing configuration noted — it is not rejected.'),
);

/* ---- 7. Post-revert ---- */
P(
  BREAK(),
  h2('7.  Post-revert processing in the receiving queue'),
  bullet('Once an approved revert returns the application to its queue, it is handled by that queue exactly as any other application in that status. No new queue screens or actions are introduced in the receiving queues.'),
  bullet('The Credit user can update the credit parameters available in the Credit Queue — including Other Income, Other Financial Obligations and the Approved Limit — and then approve, override or reject the application again.'),
  bullet('Where the queue user’s edit triggers a re-run of the decisioning components — Rule Engine, Income Multiplier and Limit Assignment — the system behaves as per existing implementation. The re-run outcome may return the application to a rejected state; if so, a fresh revert request may be raised under the same rules.'),
  spacer(100),
  tbc('Confirm whether a limit should be placed on the **number of times** a single application may be reverted, or a **time window** beyond which a rejected application can no longer be reverted — for example, no revert after 30 days, or no revert once the customer has submitted a fresh application for the same product.'),
  spacer(140),
  h3('7.1  Impact on existing messages and notifications'),
  p('Revert changes an assumption that is currently stated to both bank users and customers: that rejection is final. Three existing behaviours are affected.'),
  spacer(40),
  tbl(
    ['Area', 'Impact'],
    [
      ['Queue reject confirmation messages', 'The existing confirmation text tells the user the decision is irreversible. The Compliance confirmation reads *"Are you sure you want to Reject this application? This action can not be revert"* and the Risk confirmation reads *"…The application will be terminated after you reject it!"*. Wherever a rejection becomes revertible, this wording is no longer accurate and must be revised.'],
      ['Customer notification already sent', 'Rejection already triggers an email to the customer. By the time a revert is approved, the customer has been told the application was rejected. A decision is needed on whether the customer is informed that the case has been reopened.'],
      ['Reporting and MIS', 'Reverted applications move out of the Rejected population and back into an in-flight queue status. Any report or dashboard counting rejections needs to reflect that a rejection can now be undone, and over what period. The new *User Initiated Revert* status must also be classified in reporting.'],
    ],
    [25, 75],
    { boldFirstCol: true },
  ),
  spacer(120),
  tbc('Confirm the revised wording for the Compliance and Risk reject confirmation messages, and whether the customer should be notified when an application is reopened.'),
);

/* ---- 8. Summary ---- */
P(
  BREAK(),
  h2('8.  Summary'),
  tbl(
    ['Step', 'Actor', 'Action', 'Application Status', 'Next Step'],
    [
      ['1', 'System or Queue User', 'Application is rejected — by a Credit, Compliance or Risk user in queue, or automatically by the system on credit grounds', '**Rejected**', 'Application closed; visible in Application Enquiry'],
      ['2', 'Bank User (Maker)', "Opens the rejected application in Application Enquiry, clicks 'Revert', enters the Revert Reason and confirms", '**User Initiated Revert**', 'Application routed to the Revert Queue'],
      ['3', 'System', 'Application dropped into the Revert Queue', '**User Initiated Revert**', 'Await Checker decision'],
      ['4a', 'Checker (Revert Queue)', "Clicks 'Approve' and confirms", '**<Target Status>**', 'Application re-enters the owning queue; email sent to the Maker; application removed from the Revert Queue'],
      ['4b', 'Checker (Revert Queue)', "Clicks 'Reject' and confirms", '**Rejected**', 'Email sent to the Maker; application removed from the Revert Queue'],
      ['4c', 'System (auto-timeout)', 'No Checker action within [X] days — request lapses', '**Rejected**', 'Email sent to the Maker; application removed from the Revert Queue'],
      ['5', 'Queue User (Credit / Compliance / Risk)', 'Reviews the application and updates credit parameters where applicable', '**<Target Status>**', 'Application re-decisioned; may be approved, overridden or rejected again'],
    ],
    [8, 19, 32, 19, 22],
    { boldFirstCol: true },
  ),
  spacer(160),
  p('**Summary of changes:**'),
  spacer(40),
  tbl(
    ['Areas', 'Previous Behaviour', 'New Behaviour'],
    [
      ['Application Enquiry — action bar', "Only the 'Cancel Application' button is available on the Application Details screen.", "A new **'Revert'** button is added alongside 'Cancel Application', enabled only for revertible rejected applications."],
      ['Role Management — Enquiry module', "Application Enquiry sub-module offers the 'Cancel Application' permission.", "A new **'Revert Application'** permission is added under the same sub-module."],
      ['Role Management — Manually Queue', 'Termination Queue offers View Application and Evaluate Application.', 'A new **Revert Queue** is added with the same two permissions.'],
      ['Queue menu', 'Termination Queue handles manual cancellation requests.', 'A new **Revert Queue** handles manual revert requests.'],
      ['Application statuses', "'User Initiated Cancellation' is the only maker-checker holding status.", "A new holding status **'User Initiated Revert'** is introduced."],
      ['Rejected applications', 'A rejected application is final. The customer must submit a new application.', 'A rejected application can be returned to the queue status held before rejection, subject to Checker approval.'],
      ['DBR safety net', 'Auto-rejected by the system with no queue involvement.', "Routed to Credit Queue as **'Awaiting Credit Approval'** for a Credit decision."],
      ['Failed all segmentations / Approved Limit < Min Boundary', 'Auto-rejected by the system; final.', "Auto-rejected as before, but **revertible** to 'Awaiting Credit Approval'."],
      ['Queue reject confirmation messages', 'State that the rejection cannot be reverted or that the application will be terminated.', 'Must be revised wherever the rejection is revertible.'],
      ['Audit trail', 'Rejection is the terminal event on the application.', "**'Manual revert process'** and **'Revert Queue'** events are appended, preserving the original rejection record."],
    ],
    [22, 37, 41],
    { boldFirstCol: true },
  ),
);

/* ---- Thank you ---- */
P(
  BREAK(),
  spacer(2600),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text: 'THANK YOU', bold: true, size: 44, color: DARK, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'This is not a legally binding document', size: 18, color: INK500, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Highly confidential not to be shared without written consent', size: 18, color: INK500, font: FONT })],
  }),
);

/* ================= ASSEMBLE ================= */
const doc = new Document({
  creator: 'Appro',
  title: 'Application Revert in Super Portal V1.1',
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
            new TextRun({ text: 'Application Revert in Super Portal   ·   V1.1   ·   ', size: 14, color: INK500, font: FONT }),
            new TextRun({ children: [PageNumber.CURRENT], size: 14, color: INK500, font: FONT, bold: true }),
          ],
        })],
      }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || path.join(DIR, 'Appro_RF_Application_Revert_in_Super_Portal_v1.1.docx');
  fs.writeFileSync(out, buf);
  console.log('WROTE', out, buf.length, 'bytes');
});
