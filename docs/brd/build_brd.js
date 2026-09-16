const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, BorderStyle, PageBreak, Header, Footer,
  PageNumber, VerticalAlign, LevelFormat, ImageRun,
} = require('docx');

/* ---------- Appro brand palette — the ONLY permitted values ---------- */
const NAVY     = '1A214D';   // Primary  — titles, body text, table headers
const BLUE     = '3B7EF6';   // Primary  — H1 headings, accents
const YELLOW   = 'FDBA23';   // Secondary— rules under H1, callout accent
const LAVENDER = 'EDF2FF';   // Secondary— alternating rows, container fills
const WHITE    = 'FFFFFF';
const GRAY     = '666666';   // cover classification label / prepared-by, per brand DOCX spec

const FONT = 'Lato';
const CONTENT_W = 9026;      // A4 (11906) minus 2 x 1440 margins
const DIR = __dirname;

/* ---------- inline **bold** / *italic* parser ---------- */
function runs(text, opts = {}) {
  const base = { font: FONT, size: opts.size || 22, color: opts.color || NAVY };
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

function rule(color, after) {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
    spacing: { after },
  });
}
/* H1 — 16pt Bold Blue, always followed by a yellow rule */
function h1(text) {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 320, after: 80 },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 32, color: BLUE, font: FONT })],
    }),
    rule(YELLOW, 120),
  ];
}
/* H2 — 14pt Bold Navy, no rule */
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: NAVY, font: FONT })],
  });
}
/* H3 — 12pt Bold Navy */
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: FONT })],
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
      top:    { style: BorderStyle.SINGLE, size: 2, color: YELLOW },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: YELLOW },
      left:   { style: BorderStyle.SINGLE, size: 18, color: YELLOW },
      right:  { style: BorderStyle.SINGLE, size: 2, color: YELLOW },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: LAVENDER, color: 'auto' },
        margins: { top: 110, bottom: 110, left: 170, right: 140 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0, line: 264 },
          children: [
            new TextRun({ text: 'TBC   ', bold: true, size: 20, color: NAVY, font: FONT }),
            ...runs(text, { size: 20, color: NAVY }),
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
      fill: isHeader ? NAVY : (rowIdx % 2 ? LAVENDER : WHITE),
      color: 'auto',
    },
    margins: { top: 90, bottom: 90, left: 95, right: 95 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      spacing: { before: 0, after: 0, line: 252 },
      children: isHeader
        ? [new TextRun({ text: String(text ?? ''), bold: true, size: 19, color: WHITE, font: FONT })]
        : runs(String(text ?? ''), { size: 19, allBold: !!opts.boldFirstCol && i === 0 }),
    })],
  });

  return new Table({
    columnWidths: widths,
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
      left:   { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
      right:  { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
      insideVertical:   { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
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
      children: [new TextRun({ text: caption, italics: true, size: 19, color: GRAY, font: FONT })],
    }),
  ];
}
/* ================= DOCUMENT CONTENT ================= */
const body = [];
const P = (...a) => body.push(...a.flat());
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

/* ---- Cover block — brand DOCX spec ---- */
P(
  spacer(900),
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({ text: 'INTERNAL | CONFIDENTIAL', bold: true, size: 18, color: GRAY, font: FONT })] }),
  rule(YELLOW, 240),
  new Paragraph({ spacing: { after: 80 },
    children: [new TextRun({ text: 'Application Revert in Super Portal', bold: true, size: 52, color: NAVY, font: FONT })] }),
  new Paragraph({ spacing: { after: 200 },
    children: [new TextRun({ text: 'Reem Bank — Super Portal', bold: true, size: 32, color: BLUE, font: FONT })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC', size: 22, color: NAVY, font: FONT })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'Prepared by: Hailey — Product Owner, Appro', size: 22, color: GRAY, font: FONT })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'Date: 16-09-2026', size: 22, color: GRAY, font: FONT })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'Version: V2.1', size: 22, color: GRAY, font: FONT })] }),
  rule(NAVY, 320),
  p('This is not a legally binding document. Highly confidential not to be shared without written consent.', { size: 19, color: GRAY }),
  BREAK(),
);

/* ---- Feature overview ---- */
P(
  new Paragraph({ spacing: { before: 0, after: 180 },
    children: [new TextRun({ text: 'APPLICATION REVERT IN SUPER PORTAL', bold: true, size: 24, color: NAVY, font: FONT })] }),
  h1('Feature Overview'),
  p('This document describes the Super Portal **Application Revert** capability, which allows authorised bank staff to return a **rejected** application to the queue and approval level it was rejected from, so the case can be re-assessed without the customer having to reapply. It complements the existing **Cancel Application** capability: where Cancel terminates an application, Revert reopens one.'),
  spacer(40),
  p('**Why the bank needs it.** A rejection today is final, and the consequence falls on the customer rather than on the bank that made the decision. The Pre-dedupe Existing Application Check terminates any new application where a previous application was rejected **within the last 30 days**, and that block has in practice reached across products — a customer declined for a Credit Card has been prevented from opening a CASA account. So when Credit rejects a case on a parameter that was wrong, incomplete or has since been corrected — income evidence arriving late, an obligation counted twice, a decision boundary re-tuned — the customer cannot simply reapply. They must wait out the 30 days. Revert is the only remedy inside that window, and it is the reason the Credit Department asked for it.'),
  spacer(40),
  p('**How it is controlled.** Revert follows the **same maker-checker governance already in place for Application Cancellation**. The bank user who requests the revert is the **Maker**; the request is placed in a **Revert Queue**, where a second user — the **Checker** — approves or rejects it. The application returns to its queue only once the Checker approves. Key steps are as following:'),
  bullet("**Maker** — bank user with the **'Revert Application'** permission for that product opens a rejected application in **Application Enquiry** and clicks **'Revert'**."),
  bullet('The Maker confirms and enters a mandatory **Revert Reason** for approval from the Checker.'),
  bullet("The application is flagged **Revert_App = TRUE** and dropped into the **Revert Queue**. The Application Status remains **Rejected** — nothing about the application changes yet."),
  bullet("**Checker** — user with the **'Evaluate Application'** permission on the Revert Queue reviews the request and the Revert Reason, then approves or rejects it."),
  bullet('On **approval**, the application returns to the status and queue level it was rejected from. On **rejection**, the application remains Rejected and the flag is cleared.'),
  bullet('If no decision is taken within a configurable timeout period, the request **lapses** and the application remains Rejected.'),
  spacer(80),
  p('**Applicable products:** Credit Card, Personal Loan, CASA.'),
  spacer(40),
  tbl(
    ['Product Type', 'Applicable Status that can be reverted in Super Portal'],
    [['Credit Card', 'Rejected'], ['Personal Loan', 'Rejected'], ['CASA', 'Rejected']],
    [22, 78], { boldFirstCol: true },
  ),
  spacer(120),
  p('Revert operates on a single application status. In every status other than **Rejected** the button is displayed in a disabled state, consistent with the existing treatment of the Cancel Application button.'),
  spacer(60),
  tbc('**Mortgage Loan and Auto Loan are out of scope.** Both product tabs are disabled across the Super Portal in the current build and carry no permission entries. Mortgage is tracked as a separate epic; no Auto Loan requirement exists. Revert must be added to both product tabs when those products are delivered.'),
);

P(
  BREAK(),
  p('The revert shall be restricted in below scenarios:'),
  spacer(40),
  tbl(
    ['Scenario', 'Condition / Application Status'],
    [
      ['Bank users already initiated revert', 'Revert_App = **TRUE** — a request is already awaiting a Checker decision in the Revert Queue, and a second request cannot be raised on the same application.'],
      ['Bank users already initiated cancellation', "Cancel_App = **TRUE**, or Application Status = **'User Initiated Cancellation'** — the application is already before the Termination Queue."],
      ['Application is not in a rejected state', 'Any Application Status other than **Rejected** — including Lead, In Progress, Awaiting Compliance Review, Awaiting Risk Review, Awaiting Sales Response, Awaiting Credit Approval, Approval In Principle, Awaiting Cooling Off Period, Awaiting Signature, KFS Signature and Completed.'],
      ['Application already terminated for another reason', 'Cancelled | Expired | Blocked | Invalidate | Insufficient Data | Insufficient Time | Declined | Failed by EFR | Failed by Minimum Income | Failed by IBAN'],
      ['Application failed at Pre-dedupe Check stage', 'Any of the nine pre-dedupe checks. The failure occurs at Step 7.1, immediately after the EID scan and before any queue is involved. No queue handles applications at this stage, so there is no previous status to return the application to.'],
      ['No applicable product found', 'Audit step *{Pre-Fetch Applicable Product}*, step detail *"There is no applicable product for Application"*. With no product resolved, the system has no decisioning path to return the application to.'],
      ['Rejected by the AML system', 'AML status **Blacklisted**, or AML callback decision = rejected. These outcomes are handled through the AML manual override route, not through a queue rejection, and must continue to follow it.'],
      ['Geo-fencing, EID scan or EFR liveness failure', 'Terminations at Steps 3, 7 and 8. These occur before any credit decision exists and have no owning queue.'],
    ],
    [26, 74], { boldFirstCol: true },
  ),
  spacer(120),
  p('Where a rejected application falls into one of the restricted scenarios above, the Revert button remains visible but disabled, so that the user can see the action exists and is simply not available for that case.'),
);

/* ---- 1. Maker permission ---- */
P(
  BREAK(),
  h1('End-to-End Application Revert Flow from Super Portal'),
  h2('1.  Role Management: Revert Application permission (Maker)'),
  bullet("Bank users must only be able to request a revert if they have been explicitly granted the **'Revert Application'** permission for that product within their Super Portal role."),
  bullet("A new permission named **'Revert Application'** shall be added under the **Enquiry** module, **Application Enquiry** sub-menu, **once per product tab** — alongside the existing 'View Application' and 'Cancel Application' permissions."),
  bullet('The permission is granted **per product**, in the form `[Product] Revert Application`, following the established Role Management model of Menu → Sub-Menu → Product → Action.'),
  ...screen('sc1.png', 620, 349, "SC1: Add Role — Enquiry > Application Enquiry > '[Product] Revert Application'"),
  tbl(
    ['Permission', 'Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['[Credit Card] Revert Application', 'Check box', 'Y', 'NA', 'Grants the right to request a revert on a rejected Credit Card application from Application Enquiry.'],
      ['[Personal Loan] Revert Application', 'Check box', 'Y', 'NA', 'Grants the right to request a revert on a rejected Personal Loan application from Application Enquiry.'],
      ['[Casa] Revert Application', 'Check box', 'Y', 'NA', 'Grants the right to request a revert on a rejected CASA application from Application Enquiry.'],
    ],
    [26, 11, 12, 13, 38], { boldFirstCol: true },
  ),
  spacer(140),
  p('**Permission behaviour:**'),
  tbl(
    ['Permission Value', 'Allowed Actions'],
    [
      ['[Product] Revert Application = TRUE', "Users can view the 'Revert' button on the Application Enquiry details screen for that product, and submit revert requests for Checker approval."],
      ['[Product] Revert Application = FALSE', "Users cannot view the 'Revert' button for that product. Users cannot request application reverts."],
    ],
    [30, 70], { boldFirstCol: true },
  ),
  spacer(140),
  p('**This permission must not be bundled with any other.** Requesting a revert, cancelling an application and evaluating a revert are three distinct rights held by three potentially different populations. Bundling permissions that cover distinct actions has twice caused production defects on this platform and required hotfixes, most recently when *Evaluate Application* and *Send Application* were separated.'),
);

/* ---- 2. Maker action ---- */
P(
  BREAK(),
  h2('2.  Application Revert from Application Enquiry view (Maker)'),
  bullet("The existing **Application Enquiry** module is the entry point. Bank users with the '[Product] Revert Application' permission can request a revert from the **Application Details** screen."),
  bullet("The **'Revert'** button is placed in the action bar at the foot of the screen, next to the existing **'Cancel Application'** button."),
  bullet("The button is **enabled only when Application Status = 'Rejected'**, the rejection origin is revertible (section 5), and neither Revert_App nor Cancel_App is already TRUE. In all other cases it is displayed disabled."),
  ...screen('sc2.png', 620, 364, "SC2: Application Enquiry — 'Revert' placed next to the existing 'Cancel Application' button"),
  ...screen('sc3.png', 620, 364, 'SC3: Revert Confirmation Popup — the Revert Reason is entered for Checker approval'),
);

P(
  tbl(
    ['Component', 'Type', 'Mandatory', 'Editable', 'Description'],
    [
      ['Revert Button', 'Button', 'N/A', 'N/A', "Visible only to users holding '[Product] Revert Application'. Enabled only for a revertible rejected application with no request already pending. Initiates the revert request."],
      ['Revert Confirmation Popup', 'Modal Popup', 'N/A', 'N/A', 'Presented when Revert is clicked. Requires the user to confirm and provide a Revert Reason before the request is submitted.'],
      ['Confirmation Message', 'Static Text', 'N/A', 'N/A', "'Are you sure you want to revert this Application?' with the supporting line 'The request will be sent to the Revert Queue for Checker approval. If approved, the application returns to <TARGET_STATUS> in <TARGET_QUEUE>.'"],
      ['Target Status Display', 'Static Text', 'N/A', 'N/A', 'Displays the status and queue level the application will return to on approval, derived per section 5, so both Maker and Checker see the outcome before it is applied.'],
      ['Revert Reason', 'Text input', 'Yes', 'Yes', "Free-text mandatory field labelled 'Revert Reason *'. Help text: 'Enter your comment'. The reason is shown to the Checker."],
      ['Yes, Revert Button', 'Button', 'N/A', 'N/A', 'Confirms the request and sends the application to the Revert Queue.'],
      ['Back Button', 'Button', 'N/A', 'N/A', 'Dismisses the popup. Returns the user to Application Details. No change to the application.'],
    ],
    [19, 11, 13, 14, 43], { boldFirstCol: true },
  ),
);

/* ---- 3. Impact of submission ---- */
P(
  BREAK(),
  h2('3.  Impact of revert submission'),
  p("When the Maker clicks 'Yes, Revert':"),
  spacer(40),
  h3('3.1  Save Revert Reason as Comment'),
  p('The Revert Reason is displayed in the Comment area with the below details, following the convention already used for the Cancel Reason:'),
  bullet("Comment title: <<User's name posted comment>> <<Department name>>"),
  bullet('Comment body: **"REVERT REASON: <Content of Revert Reason inputted>"**'),
  bullet('Comment footer: <<Posted Date time>> (format hh:mm AM/PM | DD MM YYYY)'),
  bullet('Save comment to DB with prefix **"REVERT REASON"** — format: REVERT REASON: <revert reason comment text>'),
  spacer(80),
  h3('3.2  Application state'),
  bullet('**Revert_App = TRUE** is set on the application.'),
  bullet('**Application Status remains "Rejected".** The application is not changed by the request — only by the Checker decision.'),
  bullet('The application is dropped into the **Revert Queue** for Checker review (section 4).'),
  bullet('The **target status and target queue level** are resolved at submission (section 5) and stored on the request, so the decision cannot drift if configuration changes while the request is pending.'),
  spacer(80),
  tbc('**Design decision — no new Application Status is introduced.** The cancellation flow moves the application to *User Initiated Cancellation* because a live application pauses mid-journey while the Checker decides. A rejected application is already terminated: nothing about it changes until the revert is approved, and its status is genuinely still *Rejected*. Introducing a *User Initiated Revert* status would oblige the mobile app to handle a status that means nothing to the customer, and would show a state that does not reflect reality — a defect pattern this platform has already seen. Using the **Revert_App** flag follows the precedent of the existing **Cancel_App** flag and keeps the change inside the Super Portal. Please confirm this in preference to status parity with cancellation.'),
  spacer(120),
  h3('3.3  Audit trail'),
  p('The below [Application History] object is stored as audit trail information and displayed as an Application step under the Application Enquiry details screen:'),
  tbl(
    ['Field', 'Value'],
    [
      ['[Application ID]', '<current Application ID>'],
      ['[Step]', '**"Manual revert process"**'],
      ['[State]', '**"Rejected"** — unchanged by the request'],
      ['[Start Time] / [End Time]', 'Recorded by appro with following format: yyyy-MM-dd HH:mm:ss'],
      ['[Step Status]', '"Successful"'],
      ['[Step Detail]', '**"Revert requested by %Username% to <TARGET_QUEUE>. Revert reason is <REVERT_REASON>"**'],
      ['[Action by]', '<user email id>'],
    ],
    [26, 74], { boldFirstCol: true },
  ),
  spacer(140),
  p('The original rejection record is **retained**. Revert never overwrites a decision — it appends events, so the full decision history stays auditable.'),
);

/* ---- 4. Revert Queue ---- */
P(
  BREAK(),
  h2('4.  Revert Queue (Checker)'),
  p('The Revert Queue is a new queue that allows the Checker team to review and decide on applications submitted for manual revert. It provides the approval layer before a rejection is reopened, mirroring the Termination Queue used for manual cancellation.'),
  spacer(60),
  tbc('**Why a separate queue rather than an existing one.** The **Termination Queue** exists to close applications down; a Revert request asks for the opposite outcome, and mixing the two would leave a Checker unable to tell from the list which decision they are being asked to take. The **Maker and Checker Queues** hold configuration change requests and do not hold applications at all, so a Checker there has no application detail, failed reasons or comments to decide on. A dedicated Revert Queue is therefore proposed. The cost is one more queue in the Queue menu, a Role Management entry per product, and its own Customized Table configuration.'),
  h3('4.1  Revert Queue menu and list view'),
  bullet("**'Revert Queue'** shall appear as an entry in the **Queue** menu, alongside the existing Termination, Transaction Post and Disbursement queues."),
  bullet('Navigation: **Queue › Revert Queue** opens the list; clicking any cell in a row opens the Application Details screen.'),
  bullet('The list follows the standard queue list behaviour already in place — Search, **Customized Table** column selection, ten rows per page, and the *No queue Found* empty state.'),
  ...screen('sc5.png', 620, 279, 'SC5: Revert Queue list view'),
  tbl(
    ['Column', 'Description'],
    [
      ['Application ID', 'The application the revert is requested on.'],
      ['Customer Name', 'Applicant name, as in every other queue list.'],
      ['Product Type', 'Credit Card | Personal Loan | Casa.'],
      ['Relationship Type (NTB/ETB)', 'New To Bank or Existing To Bank.'],
      ['Status', 'The application status — **Rejected** for every row in this queue.'],
      ['Rejected From', 'The queue and level the application was rejected from, e.g. Credit Queue L1.'],
      ['Target Status', 'The status the application returns to if the revert is approved.'],
      ['Requested By', 'The Maker who raised the request.'],
      ['Requested On', 'Date and time the request was raised — the start of the timeout period.'],
    ],
    [26, 74], { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h3('4.2  Role information for the Revert Queue'),
  p('Under **Manually Queue**, a new queue shall be introduced as **"Revert Queue"** with View and Evaluate application rights, granted **per product**.'),
  ...screen('sc4.png', 620, 349, 'SC4: Add Role — Manually Queue > Revert Queue role permissions, per product'),
  tbl(
    ['Menu (Group Permission)', 'Sub-Menu (Permission)', 'Action (Permission Detail)', 'Status Display in UI', 'Display Permission Name'],
    [
      ['Manually Queue', 'Revert Queue', 'View List of Applications', 'Viewer', '[Product] View Application'],
      ['', '', 'Approve Application', 'Approver', '[Product] Evaluate Application'],
      ['', '', 'Reject Application', 'Approver', '[Product] Evaluate Application'],
    ],
    [20, 17, 25, 16, 22], { boldFirstCol: true },
  ),
  spacer(140),
  p('**Apply rules:**'),
  tbl(
    ['Permission Value', 'Access Granted'],
    [
      ['[Product] View Application = TRUE', 'Users can access the Revert Queue list view and view Application Details for that product.'],
      ['[Product] View Application = FALSE', 'Users cannot see the Revert Queue in the Queue menu for that product.'],
      ['[Product] Evaluate Application = TRUE', 'Users can see and click the Approve / Reject buttons in Revert Queue Application Details and perform the action.'],
      ['[Product] Evaluate Application = FALSE', 'Users cannot see the Approve or Reject buttons.'],
    ],
    [32, 68], { boldFirstCol: true },
  ),
  spacer(140),
  tbc('**Maker and Checker must not be the same person.** The system shall prevent a user from evaluating a revert request they raised themselves, even where they hold both permissions. The cancellation flow does not state this control; without it, a single user holding both rights can reopen a rejection unilaterally and the second pair of eyes is lost. Please confirm this is required.'),
);

P(
  BREAK(),
  h3('4.3  Revert Queue details view'),
  bullet('The **Details** block shows the same identification fields as the queue application view, plus three fields specific to the request: **Rejected From**, **Revert Requested By** and **Target Status**.'),
  bullet('The collapsible **Sections** list shows the same detail sections as the Credit Queue application view — Cross-Application Identifier Match, Failed Reasons, Rule Engine Result, Approve Limit Result, Customer Due Diligence Information, Application Details, Liability Info and Credit Indicator — collapsed by default.'),
  bullet('The **Comments** tab is **selected by default**, so the Revert Reason entered by the Maker is the first thing the Checker sees. The **Documents** tab is available as elsewhere.'),
  bullet('The Checker view is **read-only apart from the decision**. Edit, FTS Retrigger, Refetch ECB, Send Application and Override are **not** offered here — the Checker decides only whether the case returns to its queue; any change to the case is made afterwards by the queue owner.'),
  ...screen('sc6.png', 620, 364, "SC6: Revert Queue — Application Details showing the Maker's reason and the Approve / Reject actions"),
  tbl(
    ['Component', 'Type', 'Editable', 'Mandatory', 'Description'],
    [
      ['Application Detail', 'Label', 'N/A', 'N/A', 'Default value is "Application Detail".'],
      ['Link navigate', 'Label', 'N/A', 'N/A', 'Default value is "Queue > Revert Queue > Application Details".'],
      ['Details', 'Section', 'N/A', 'N/A', 'Identification fields plus Rejected From, Revert Requested By, Requested On and Target Status.'],
      ['Sections', 'Section', 'N/A', 'N/A', 'Detail sections of the application. Collapsible; default Collapsed.'],
      ['Comments', 'Tab link', 'N/A', 'N/A', 'Selected by default. Shows the REVERT REASON comment posted by the Maker.'],
      ['Documents', 'Tab link', 'N/A', 'N/A', 'Opens the Documents tab.'],
      ['Approve Button', 'Button', 'N/A', 'N/A', "Visible only with '[Product] Evaluate Application' = TRUE. Approves the revert request."],
      ['Reject Button', 'Button', 'N/A', 'N/A', "Visible only with '[Product] Evaluate Application' = TRUE. Rejects the revert request."],
    ],
    [17, 14, 10, 11, 48], { boldFirstCol: true },
  ),
);

P(
  BREAK(),
  h3('4.4  Approve revert'),
  p("When a user with '[Product] Evaluate Application' = TRUE clicks **'Approve'**:"),
  bullet("System displays confirmation popup: **'Are you sure you want to Approve the application revert?'**"),
  bullet("If the user clicks **'Cancel'**: the popup closes and no action is taken."),
  bullet("If the user clicks **'Yes, Approve'**: the system performs the revert."),
  ...screen('sc7.png', 620, 217, 'SC7: Approve and Reject confirmation popups in the Revert Queue'),
  p('On approval:'),
  bullet('Application Status = **<TARGET_STATUS>** and the application re-enters **<TARGET_QUEUE>** at the level it was rejected from (section 5).'),
  bullet('**Revert_App** is cleared to FALSE.'),
  bullet('Approval toaster message: **"Revert of <Application ID> is approved"**.'),
  bullet("Update [Revert Queue] = **'APPROVED'** → remove the application from the Revert Queue. The user can no longer search for or access the application from this queue."),
  bullet('Email notification is sent to the bank user who requested the revert (section 4.7).'),
  spacer(60),
  tbl(
    ['Field', 'Value'],
    [
      ['[Step]', '**"Revert Queue"**'],
      ['[State]', '**<TARGET_STATUS>**'],
      ['[Step Status]', '"Successful"'],
      ['[Step Detail]', 'Application revert requested by "%Username%" and approved by "%Username%". Application returned to <TARGET_QUEUE>'],
      ['[Action by]', '<System>'],
    ],
    [26, 74], { boldFirstCol: true },
  ),
  spacer(120),
  p('**The revert does not re-run any decision engine.** Approving a revert restores queue membership only. The Rule Engine, Income Multiplier and Limit Assignment are re-run by the existing queue behaviour when the queue owner edits the case — not by the revert itself. This keeps the Checker decision reversible in effect and avoids a silent re-decision that nobody asked for.'),
);

P(
  h3('4.5  Reject revert'),
  p("When a user with '[Product] Evaluate Application' = TRUE clicks **'Reject'**:"),
  bullet("System displays confirmation popup: **'Are you sure you want to Reject the application revert?'**"),
  bullet("If the user clicks **'Cancel'**: the popup closes and no action is taken."),
  bullet("If the user clicks **'Yes, Reject'**: the revert request is rejected."),
  spacer(60),
  bullet('Application Status remains **"Rejected"** — unchanged throughout.'),
  bullet('**Revert_App** is cleared to FALSE, so a fresh request may be raised later if new information emerges.'),
  bullet('Rejection toaster message: **"Revert of <Application ID> is rejected"**.'),
  bullet("Update [Revert Queue] = **'REJECTED'** → remove the application from the Revert Queue."),
  bullet('Email notification is sent to the bank user who requested the revert (section 4.7).'),
  spacer(60),
  tbl(
    ['Field', 'Value'],
    [
      ['[Step]', '**"Revert Queue"**'],
      ['[State]', '**"Rejected"**'],
      ['[Step Status]', '"Successful"'],
      ['[Step Detail]', 'Application revert requested by "%Username%" and rejected by "%Username%"'],
      ['[Action by]', '<System>'],
    ],
    [26, 74], { boldFirstCol: true },
  ),
  spacer(140),
  h3('4.6  Timeout if no decision is taken in the Revert Queue'),
  p('A configurable timeout period of **[X] days** begins when the request is submitted.'),
  spacer(40),
  tbl(
    ['Scenario', 'Outcome'],
    [
      ['Request is APPROVED within [X] days', 'Application returns to <TARGET_STATUS> in <TARGET_QUEUE>. Please refer to 4.4 above.'],
      ['Request is REJECTED within [X] days', 'Application remains Rejected. Please refer to 4.5 above.'],
      ['No decision taken within [X] days', 'The request **lapses**. The system clears Revert_App to FALSE the next day after the timeout period ends and removes the application from the Revert Queue. The application remains **Rejected**. Email notification is sent to the Maker — same email as in 4.5. Audit step **"Auto Revert Rejection on timeout"**, [Step Detail] = *Application revert requested by "%Username%" and rejected by System, as per approval timeout configuration of [X] days*, [Action by] = <System>.'],
    ],
    [28, 72], { boldFirstCol: true },
  ),
  spacer(140),
  tbc('**The timeout default is deliberately the opposite of Cancellation — please confirm.** An un-actioned cancellation auto-**approves**, because it ends in the outcome the requester asked for and the customer is not harmed. An un-actioned revert is proposed to **lapse**, because auto-approving would reopen a rejected case with no second pair of eyes — precisely the control the Checker exists to provide — whereas lapsing leaves the application in a status it validly held. Confirm this, and confirm **[X]**; 5 days is proposed, to match the cancellation timeout.'),
);

P(
  BREAK(),
  h3('4.7  Email notifications'),
  p('Two new **Bank-type** email templates are required, set up in Communication Setup **per product**. Bank templates are English only; no Arabic version is required because the recipient is a bank user, not the customer.'),
  spacer(40),
  tbl(
    ['Type', 'Subject', 'Content', 'Trigger'],
    [
      ['Email', '[Super Portal] - Application %%APPLICATION_ID%% revert is approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% has been approved. The application has been returned to %%TARGET_STATUS%%. Best Regards, Reem Bank', 'One time — send immediately when the revert is approved in the Revert Queue'],
      ['Email', '[Super Portal] - Application %%APPLICATION_ID%% revert is not approved.', 'Dear %%USER_NAME%%, Please be informed that your request to revert the application %%APPLICATION_ID%% is rejected. The application remains Rejected. Best Regards, Reem Bank', 'One time — send immediately when the revert is rejected in the Revert Queue, or when the request lapses on timeout'],
    ],
    [8, 24, 44, 24], { boldFirstCol: true },
  ),
  spacer(140),
  p('Every merge field used above — `%%APPLICATION_ID%%`, `%%USER_NAME%%`, `%%TARGET_STATUS%%` — must resolve before dispatch. Unresolved placeholders have reached customers on this platform before. Templates must also sign off as **Reem Bank**, not Reem Finance.'),
  spacer(100),
  tbc('Confirm whether one template covers both the Checker rejection and the timeout lapse, or whether the bank wants them distinguished so that a lapsed request is visibly different from a considered refusal.'),
);

/* ---- 5. Target status ---- */
P(
  BREAK(),
  h2('5.  Revert eligibility and target status'),
  p('The status an application returns to is determined by **how it became Rejected** — not by the Maker or the Checker. The system derives it from the application’s own audit trail, from the step recorded at the point of rejection, and resolves it at the moment the request is raised.'),
  h3('5.1  Rejection by a queue user'),
  p('The application returns to the **same queue and the same approval level** it was rejected from. A case rejected at Credit Queue L2 returns to L2, not to L1 — returning it to L1 would put it in front of an authority that never saw it.'),
  spacer(40),
  tbl(
    ['Ref', 'Rejection origin', 'Status after approved revert', 'Returns to'],
    [
      ['R1', 'Rejected by Credit user in **Credit Queue L1–L3**', 'Awaiting Credit Approval', 'Credit Queue, same level'],
      ['R2', 'Rejected by Compliance user in **Compliance Queue L1–L2**', 'Awaiting Compliance Review', 'Compliance Queue, same level'],
      ['R3', 'Rejected by Risk user in **Risk Queue L1–L3**', 'Awaiting Risk Review', 'Risk Queue, same level'],
    ],
    [8, 40, 28, 24], { boldFirstCol: true },
  ),
  spacer(140),
  tbc('Where the originating level has since been deactivated or removed from the role model, the application shall return to **L1** of the same queue and the audit trail shall record the substitution. Confirm this fallback.'),
  spacer(100),
  tbc('The **Sales Queue** also rejects applications, but Sales rejections were not covered in the agreed scope. Confirm whether a Sales Queue rejection should be revertible to **Awaiting Sales Response**, or deliberately excluded.'),
  spacer(100),
  tbc('The current build exposes **Credit Queue L1–L3**, while the queue model documents Credit Queue levels up to **L6**. Confirm the level range Revert must support before build.'),
);

P(
  BREAK(),
  h3('5.2  Auto-rejection by the system on credit grounds'),
  p('Three system rules terminate an application on credit grounds without a queue decision. Because no human took the decision, there is no previous status for Revert to restore — which is why each needs examining before it can be made revertible.'),
  spacer(40),
  tbl(
    ['Ref', 'Rejection origin', 'Current behaviour', 'Proposed treatment'],
    [
      ['R4', '**DBR safety net** — audit step *{Safety net for Finance DBR}*', 'Terminates outright. Application Status = Rejected, [Action by] = <system>. No queue involvement and no named decision-maker.', '**Route to Credit Queue L1** instead of auto-rejecting. The Credit user then approves, overrides or rejects, and a rejection becomes revertible under **R1**.'],
      ['R5', '**Failed all segmentations** — audit step *{Fail Strategies Check}*', 'Rule Engine Status = Failed; the application is terminated.', '⚠ Verify first — see below.'],
      ['R6', '**Approved limit below Min Boundary**', 'Approval Limit Result = Failed where no deviation applies.', '⚠ Verify first — see below.'],
    ],
    [7, 25, 34, 34], { boldFirstCol: true },
  ),
  spacer(140),
  p('**Rationale for R4.** A DBR above the threshold is a credit judgement, not a hard eligibility failure such as a blacklist hit or an expired EID. Routing the case to the Credit Queue gives the decision a named owner, which makes it revertible under the ordinary rule and removes the need for a special revert path. It also follows an established pattern: a **Refer** outcome from limit assignment already routes to the Credit Queue.'),
  spacer(80),
  tbc('**R5 and R6 must be verified before they are designed, not assumed.** The drop-point matrix already routes **Limit assignment = Fail** and **Limit assignment = Refer** to Credit Queue L1, which would mean an application whose limit falls below the Min Boundary never reaches a bare *Rejected* state at all — and is therefore already covered by **R1** with no change required. The limit-assignment rule, read on its own, says the opposite: below Min Boundary with no deviation, the application is Rejected. The two cannot both be true. The same question applies to a segmentation failure, which the drop-point matrix appears to route to Credit Queue L1 as a filtration failure. **Engineering to confirm, against the running system, whether R5 and R6 terminate outright or drop to Credit Queue L1.** If they drop to the queue, this BRD needs no rule for them and the scope reduces to R4 alone.'),
  spacer(120),
  tbc('**Terminology — please confirm.** The agreed scope refers to *"Existing DBR > 50%"*. In the delivered system, **Financial DBR (%)** is a configured Calculated Variable and is the safety-net rule that rejects above 50%, while **Existing DBR** is a different, defined term — line (4) of the approved-limit calculation, `DBR × Finalized Income`, an input to the DBR Room formula rather than a rejection trigger. A companion **Gross DBR (%)** safety net rejects above 100%. Please confirm the rule to be re-routed is the **Financial DBR** safety net, and whether the **Gross DBR** rule is also in scope or remains a hard auto-rejection outside Revert.'),
);

P(
  BREAK(),
  h3('5.3  How the system identifies the rejection origin'),
  p('Each rejection path already writes a distinct step to the audit trail. The system shall read that step to determine whether the application is revertible and what it returns to. No new data capture is required.'),
  spacer(40),
  tbl(
    ['Audit trail step recorded at rejection', 'Rejection origin', 'Revert', 'Target status'],
    [
      ['{Rejected in Credit Queue [Level]}', 'Credit Queue — manual decision', 'Yes', 'Awaiting Credit Approval, same level'],
      ['Compliance Reject', 'Compliance Queue — manual decision', 'Yes', 'Awaiting Compliance Review, same level'],
      ['Risk Reject', 'Risk Queue — manual decision', 'Yes', 'Awaiting Risk Review, same level'],
      ['Sale Reject', 'Sales Queue — manual decision', '**TBC**', 'Awaiting Sales Response'],
      ['{Safety net for Finance DBR}', 'System — DBR above threshold', 'Yes, after the R4 change', 'Awaiting Credit Approval, L1'],
      ['{Fail Strategies Check}', 'System — failed all segmentations', '**Verify**', 'Awaiting Credit Approval, L1'],
      ['Approval Limit Result = "Failed"', 'System — limit below Min Boundary', '**Verify**', 'Awaiting Credit Approval, L1'],
      ['{Safety net for Gross DBR}', 'System — Gross DBR above 100%', '**TBC**', 'Awaiting Credit Approval, L1'],
      ['{Pre-Fetch Applicable Product}', 'System — no applicable product', '**No**', 'Not applicable'],
      ['Pre-dedupe check steps (Step 7.1)', 'System — pre-dedupe failure', '**No**', 'Not applicable'],
      ['AML manual override result', 'AML screening decision', '**No**', 'Not applicable'],
    ],
    [29, 27, 18, 26], { boldFirstCol: true },
  ),
  spacer(140),
  p('This mapping keeps two similar-sounding outcomes apart: **failed all segmentations** and **no applicable product** are separate rules writing separate steps — *{Fail Strategies Check}* and *{Pre-Fetch Applicable Product}* — so eligibility can distinguish them reliably.'),
);

/* ---- 6. Post-revert ---- */
P(
  BREAK(),
  h2('6.  Post-revert processing in the receiving queue'),
  bullet('Once returned, the application is worked exactly as any other application in that status and level. No new queue screens or actions are introduced in the receiving queues.'),
  bullet('The Credit user can Edit the case — including Other Income, Other Financial Obligations and the Approved Limit — then Send Application, Override or Reject as today.'),
  bullet('Where the queue owner’s edit triggers a re-run of the Rule Engine, Income Multiplier or Limit Assignment, the system behaves as per existing implementation. **The re-run evaluates against the credit policy version published at that moment**, which is the point of the feature — Credit corrects the parameter, then re-assesses the case against the corrected policy.'),
  bullet('If the re-decision rejects the application again, a fresh revert request may be raised under the same rules.'),
  spacer(100),
  tbc('The re-run uses the **currently published** Strategy, Score Check and Income Multiplier versions, which may differ from those in force when the application was first decisioned. Confirm that the audit trail should record which published version was applied, so a reverted case can be explained after the fact.'),
  spacer(100),
  tbc('Confirm whether a limit should be placed on the **number of times** one application may be reverted, or a **time window** beyond which a rejected application can no longer be reverted — for example no revert after 30 days, which would align the control with the pre-dedupe re-application window.'),
);

/* ---- 7. IMPACT ANALYSIS ---- */
P(
  BREAK(),
  h1('Impact Analysis'),
  p('The impact of this change is assessed below against each area the platform requires a new requirement to address.'),
  spacer(60),
  h3('IA1 — Product scope'),
  p('Applies to **Credit Card, Personal Loan and CASA**. Every permission, email template and queue configuration is created three times, once per product tab. Mortgage Loan and Auto Loan are out of scope and carry no entries; Revert must be added to those tabs when the products are delivered.'),
  h3('IA2 — Language'),
  p('The two new email templates are **Bank-type**, sent to a bank user, and are therefore **English only** — no Arabic version is required and no RTL handling is introduced. No customer-facing text is added by this change. **If** the decision is later taken to notify the customer when an application is reopened (IA7), that template becomes Client-type and must carry English and Arabic, Arabic first, with RTL handling.'),
  h3('IA3 — Permission'),
  p('Nine new permission entries in total:'),
  bullet('**3 Maker permissions** — `[Product] Revert Application` under Enquiry › Application Enquiry.'),
  bullet('**6 Checker permissions** — `[Product] View Application` and `[Product] Evaluate Application` under Manually Queue › Revert Queue.'),
  p('Each is a distinct right and must not be bundled with Cancel Application, with Evaluate/Send on other queues, or with each other. The Permission Matrix and the Role Management access grid both need updating; existing roles are unaffected until a permission is granted.'),
  h3('IA4 — Audit trail'),
  p('Three new audit steps: **"Manual revert process"** (request), **"Revert Queue"** (Checker approve or reject) and **"Auto Revert Rejection on timeout"** (lapse). Each writes the full eight-field structure. No existing audit entry is modified; the original rejection step is preserved.'),
  h3('IA5 — Queue impact and drop points'),
  p('One new queue — **Revert Queue** — in the Queue menu and in the Manually Queue permission tree, taking the portal from nineteen queues to twenty. The **drop-points matrix requires a new row**, since an approved revert is a new route into an existing queue:'),
  spacer(40),
  tbl(
    ['Product', 'Drop point', 'Deviation level', 'Queue'],
    [['All', 'Revert approved in Revert Queue', 'Not applicable — returns to the level the application was rejected from', 'Credit / Compliance / Risk Queue, originating level']],
    [12, 34, 33, 21], { boldFirstCol: true },
  ),
  spacer(100),
  p('The proposed R4 change adds a second new drop point — DBR safety-net breaches into Credit Queue L1 — which will **increase Credit Queue volume** for every such application, not only those later reverted. That volume increase should be sized before the change is approved. The Queue Assignment and TAT module is not present in this build, so the Revert Queue carries no SLA; the timeout in 4.6 is a scheduler job, not a TAT rule.'),
  h3('IA6 — Status impact'),
  p('**No new Application Status is introduced.** The design uses a **Revert_App** flag, following the existing Cancel_App precedent, so the mobile app requires no change and no status is displayed that would misstate the application’s real state. This is the single largest scope reduction in the design and the reason it was chosen over status parity with cancellation (section 3.2).'),
  h3('IA7 — Notification impact'),
  p('Two new Bank-type templates per product — six Communication Setup entries — covering approval and rejection/lapse. Both must resolve their merge fields and sign off as Reem Bank.'),
  p('**The customer has already been told the application was rejected.** A rejection triggers a customer email at the point of decision. If a revert is approved, the application becomes live again while the customer believes it is closed. A decision is required on whether the customer is notified that the case has been reopened; this BRD proposes **no customer notification in v1**, on the basis that the outcome is not yet known and a second message would invite a support call, with the customer informed again only when the re-decision completes. This needs confirming.'),
  h3('IA8 — Document stack impact'),
  p('**None.** Revert operates only on applications rejected at or before the queue decision, which is before any KFS, DDA, repayment schedule or schedule of fees is generated. No document is reissued, invalidated or versioned by this change.'),
  h3('IA9 — Integration and service impact'),
  p('No third-party integration is called by Revert, and the API specification does not change. The services affected are:'),
  spacer(40),
  tbl(
    ['Service', 'Change'],
    [
      ['backoffice-service', 'New Super Portal endpoints for the Revert request and the Checker decision; Revert Queue list and detail.'],
      ['application-service', 'Revert_App flag; status transition on approval; resolution of the target status and level.'],
      ['queue-service', 'New Revert Queue and its routing; return routing to the originating queue and level.'],
      ['user-service', 'Nine new permissions and their per-product role assignment.'],
      ['audit-trail-service', 'Three new audit steps.'],
      ['notification-service', 'Two new Bank-type templates per product.'],
      ['scheduler-service', 'Timeout job that lapses un-actioned requests after [X] days.'],
      ['work-flow-service (Camunda)', '**The largest technical unknown.** A rejected application’s process instance has ended. Returning the application to a queue requires that instance to be resumed, or a new instance started at the queue task with the application’s state rehydrated. This needs a technical decision before the change can be estimated.'],
    ],
    [24, 76], { boldFirstCol: true },
  ),
  spacer(120),
  tbc('**Camunda process resumption is the main estimation risk in this change.** Everything else described here is a screen, a permission, a flag and an audit entry. Whether a terminated process instance can be resumed — or must be re-instantiated — determines whether this is a small change or a significant one. Engineering should answer this before the change is priced.'),
);

P(
  h3('IA10 — Resume and cancellation behaviour'),
  p('The interactions with the customer journey and with the existing cancellation flow are:'),
  spacer(40),
  tbl(
    ['Situation', 'Behaviour'],
    [
      ['Customer opens the app while a revert request is pending', 'The application is still Rejected and the customer sees no change. This is correct — nothing has been decided.'],
      ['Customer opens the app after a revert is approved', 'The application is live again in a queue. **The journey must resume at the correct point rather than at a rejection or a dead end.** Landing a customer in the wrong place after a state change is a known defect pattern on this platform and must be covered by test.'],
      ['Customer tries to reapply while a revert is pending', 'Blocked by the Pre-dedupe Existing Application Check — the previous application was rejected within 30 days. Correct and unchanged.'],
      ['Customer tries to reapply after a revert is approved', 'Blocked by the Pre-dedupe check for an in-progress application on the same product. Correct and unchanged.'],
      ['Application is reverted, then rejected again', 'The 30-day re-application window must run from the **later** rejection. Confirm the clock restarts rather than running from the original decision.'],
      ['Cancellation raised while a revert is pending', 'Blocked — Revert_App = TRUE is added to the cancellation restriction list, so an application cannot be before two checkers at once.'],
      ['Revert raised while a cancellation is pending', 'Blocked — Cancel_App = TRUE and status User Initiated Cancellation both disable the Revert button.'],
    ],
    [30, 70], { boldFirstCol: true },
  ),
  spacer(140),
  h3('IA11 — Reporting and MIS impact'),
  p('A reverted application leaves the Rejected population and re-enters work in progress. The following report types are affected and need confirming:'),
  bullet('**WIP Report** — a reverted application re-enters WIP after having left it.'),
  bullet('**Exception Report** and **Policy Exception Report** — a reopened rejection is an exception by nature and should be visible as one.'),
  bullet('**E2E Report** — the application now has two passes through the same queue and a longer end-to-end duration; the report must not double-count it as two applications.'),
  bullet('**Approved Transactions** — an application approved after a revert should be identifiable as such, so that approval rates are not read as if the first decision had been an approval.'),
  p('Rejection counts in any period become mutable: a case counted as rejected in one month may be approved in the next. Whether reports restate history or record the revert as a separate event is a reporting decision, not a system one.'),
  h3('IA12 — Effect on existing messages'),
  p('Two existing confirmation messages tell the user their decision is final. The Compliance reject confirmation reads *"Are you sure you want to Reject this application? This action can not be revert"*, and the Risk reject confirmation reads *"…The application will be terminated after you reject it!"*. Wherever a rejection becomes revertible, this wording is no longer accurate and must be revised — otherwise the portal contradicts itself on the same screen flow.'),
);

/* ---- Out of scope & open questions ---- */
P(
  h1('Out of Scope'),
  bullet('**Mortgage Loan and Auto Loan.** Both product tabs are disabled across the portal and carry no permission entries.'),
  bullet('**Sales Queue rejections**, pending confirmation in section 5.1.'),
  bullet('**Terminations before a credit decision** — geo-fencing, EID scan failure, EFR liveness failure, pre-dedupe failures, no applicable product and AML outcomes. None has an owning queue to return to.'),
  bullet('**Post-offer reversal.** Revert does not reinstate an expired Approval In Principle, an unsigned KFS or DDA, or any application that reached core banking. Applications with a core-banking call already triggered are outside the feature entirely.'),
  bullet('**Customer-facing notification** of a reopened application (IA7) — proposed for v1 exclusion, pending confirmation.'),
  bullet('**Bulk revert.** One application per request; there is no multi-select.'),
  bullet('**Editing the case in the Revert Queue.** The Checker decides on the request only; changes to the application are made in the receiving queue afterwards.'),
  bullet('**SLA or TAT on the Revert Queue.** The Queue Assignment and TAT module is not present in this build; the timeout in 4.6 is a scheduler job.'),
  bullet('**Reversal of a Checker decision.** Once approved or rejected, a revert decision stands; a further request must be raised.'),

  h1('Open Questions'),
  tbl(
    ['#', 'Section', 'Question'],
    [
      ['1', '5.2', '**Do R5 and R6 terminate outright, or already drop to Credit Queue L1?** The drop-point matrix and the limit-assignment rule disagree. If they drop to the queue, they need no rule here and scope reduces to R4.'],
      ['2', '5.2', 'Confirm the rule to be re-routed is the **Financial DBR** safety net, not "Existing DBR", which is a different defined term.'],
      ['3', '5.2', 'Is the **Gross DBR > 100%** safety net also in scope, or does it remain a hard auto-rejection?'],
      ['4', 'IA9', '**Can a terminated Camunda process instance be resumed**, or must a new instance be started at the queue task? This determines the estimate.'],
      ['5', '3.2', 'Confirm the **Revert_App flag** in preference to a new *User Initiated Revert* status, on the grounds of zero mobile-app impact.'],
      ['6', '4.2', 'Confirm the system must **prevent the Maker from approving their own request**.'],
      ['7', '4.6', 'Confirm the timeout **lapses** the request rather than auto-approving it, and confirm the value of [X].'],
      ['8', '5.1', 'Should **Sales Queue** rejections be revertible to Awaiting Sales Response?'],
      ['9', '5.1', 'Confirm the **fallback** when the originating queue level no longer exists, and confirm whether Credit levels above L3 must be supported.'],
      ['10', 'IA7', 'Should the **customer** be notified when an application is reopened?'],
      ['11', 'IA10', 'Does the **30-day re-application window** restart from the later rejection?'],
      ['12', 'IA11', 'How should a reverted application be treated in **WIP, Exception, E2E and Approved Transactions** reporting?'],
      ['13', '6', 'Should the audit trail record **which published policy version** the re-decision used?'],
      ['14', '6', 'Should the **number of reverts** per application, or a time window, be capped?'],
      ['15', 'IA12', 'Confirm the revised wording for the **Compliance and Risk reject confirmations**, which currently state the action cannot be reverted.'],
    ],
    [6, 11, 83], { boldFirstCol: true },
  ),
);

/* ---- Summary ---- */
P(
  BREAK(),
  h1('Summary'),
  tbl(
    ['Step', 'Actor', 'Action', 'Application Status', 'Next Step'],
    [
      ['1', 'System or Queue User', 'Application is rejected — by a Credit, Compliance or Risk user in queue, or automatically by the system on credit grounds', '**Rejected**', 'Application closed; the customer is blocked from reapplying for 30 days'],
      ['2', 'Bank User (Maker)', "Opens the rejected application in Application Enquiry, clicks 'Revert', enters the Revert Reason and confirms", '**Rejected** — unchanged; Revert_App = TRUE', 'Application routed to the Revert Queue'],
      ['3', 'System', 'Application appears in the Revert Queue with its target status and originating level', '**Rejected**', 'Await Checker decision'],
      ['4a', 'Checker (Revert Queue)', "Clicks 'Approve' and confirms", '**<Target Status>**', 'Application returns to the originating queue and level; email to the Maker; removed from the Revert Queue'],
      ['4b', 'Checker (Revert Queue)', "Clicks 'Reject' and confirms", '**Rejected**', 'Revert_App cleared; email to the Maker; removed from the Revert Queue'],
      ['4c', 'System (auto-timeout)', 'No Checker action within [X] days — the request lapses', '**Rejected**', 'Revert_App cleared; email to the Maker; removed from the Revert Queue'],
      ['5', 'Queue User', 'Works the case as normal — edits the credit parameters, then approves, overrides or rejects', '**<Target Status>**', 'Application re-decisioned against the currently published policy'],
    ],
    [8, 18, 31, 21, 22], { boldFirstCol: true },
  ),
  spacer(160),
  p('**Summary of changes:**'),
  spacer(40),
  tbl(
    ['Areas', 'Previous Behaviour', 'New Behaviour'],
    [
      ['Application Enquiry — action bar', "Only 'Cancel Application' is available.", "A **'Revert'** button is added next to it, enabled only for a revertible rejected application."],
      ['Role Management — Enquiry', "Application Enquiry offers View and Cancel Application, per product.", "**'[Product] Revert Application'** is added, per product."],
      ['Role Management — Manually Queue', 'Nineteen queues, each with its own per-product rights.', 'A twentieth queue, **Revert Queue**, with View and Evaluate Application per product.'],
      ['Queue menu', 'Termination Queue handles cancellation requests.', 'A **Revert Queue** handles revert requests.'],
      ['Application data', 'Cancel_App flag exists.', 'A **Revert_App** flag is added. **No new Application Status.**'],
      ['Rejected applications', 'Final. The customer waits 30 days to reapply.', 'Can be returned to the queue and level they were rejected from, subject to Checker approval.'],
      ['DBR safety net', 'Auto-rejects with no queue involvement.', 'Routed to **Credit Queue L1** for a Credit decision.'],
      ['Drop-points matrix', 'No entry for a reopened application.', 'A new drop point for an approved revert.'],
      ['Queue reject confirmations', 'State the rejection cannot be reverted.', 'Revised wherever the rejection is revertible.'],
      ['Audit trail', 'Rejection is the terminal event.', 'Three new steps appended, preserving the original rejection record.'],
    ],
    [22, 37, 41], { boldFirstCol: true },
  ),
);

/* ---- Closing ---- */
P(
  BREAK(),
  spacer(2400),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: 'Thank you', bold: true, size: 60, color: NAVY, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 320 },
    children: [new TextRun({ text: '\u25CF\u25CF\u25CF  \u25CF', size: 44, color: YELLOW, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC', size: 22, color: NAVY, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'This is not a legally binding document. Highly confidential not to be shared without written consent.', size: 18, color: GRAY, font: FONT })] }),
);

/* ================= ASSEMBLE ================= */
const doc = new Document({
  creator: 'Appro',
  title: 'Application Revert in Super Portal V2.1',
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
  styles: { default: { document: { run: { font: FONT, size: 22, color: NAVY } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 620, footer: 560 },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            spacing: { after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LAVENDER, space: 4 } },
            children: [new TextRun({
              text: 'APPRO \u2013 INTERNAL & APPROVED DOMAINS | Controlled Distribution',
              size: 14, color: NAVY, font: FONT })],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Table({
          columnWidths: [Math.round(CONTENT_W * 0.62), Math.round(CONTENT_W * 0.20), CONTENT_W - Math.round(CONTENT_W * 0.62) - Math.round(CONTENT_W * 0.20)],
          width: { size: CONTENT_W, type: WidthType.DXA },
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 4, color: LAVENDER },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            left:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
            right:  { style: BorderStyle.NONE, size: 0, color: 'auto' },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          rows: [new TableRow({ children: [
            new TableCell({
              width: { size: Math.round(CONTENT_W * 0.62), type: WidthType.DXA },
              margins: { top: 60, bottom: 0, left: 0, right: 60 },
              children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({
                text: 'This is not a legally binding document. Highly confidential not to be shared without written consent',
                size: 13, color: GRAY, font: FONT })] })],
            }),
            new TableCell({
              width: { size: Math.round(CONTENT_W * 0.20), type: WidthType.DXA },
              margins: { top: 60, bottom: 0, left: 0, right: 0 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [
                new TextRun({ children: [PageNumber.CURRENT], size: 15, color: NAVY, font: FONT, bold: true })] })],
            }),
            new TableCell({
              width: { size: CONTENT_W - Math.round(CONTENT_W * 0.62) - Math.round(CONTENT_W * 0.20), type: WidthType.DXA },
              margins: { top: 60, bottom: 0, left: 0, right: 0 },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [
                new TextRun({ text: '\u25CF\u25CF\u25CF  \u25CF', size: 16, color: BLUE, font: FONT })] })],
            }),
          ] })],
        })],
      }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || path.join(DIR, 'Appro_RF_Application_Revert_in_Super_Portal_v2.1.docx');
  fs.writeFileSync(out, buf);
  console.log('WROTE', out, buf.length, 'bytes');
});
