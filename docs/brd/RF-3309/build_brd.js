/*
 * Employer Name Edit in Credit Queue — BRD generator (V1.0, client-facing).
 * Mirrors the Application Revert BRD (docs/brd/build_brd.js) which itself
 * mimics "Application Cancellation in Super Portal V1.0": Arial body, black
 * CAPS headings, #156082 table headers, appro cover/thank-you assets, SC
 * screenshots, Area|Impact|Screen impact table. No Jira references.
 * Run: node build_brd.js  → .docx, then soffice --convert-to pdf.
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, BorderStyle, PageBreak, Header, Footer,
  PageNumber, VerticalAlign, ImageRun,
} = require('docx');

const TEAL  = '156082';
const BLUE  = '3B7EF6';
const BLACK = '000000';
const GREY  = '595959';
const BORD  = 'A6A6A6';
const FONT  = 'Arial';
const CONTENT_W = 9026;
const DIR = __dirname;                       // docs/brd/RF-3309
const SHARED = path.join(DIR, '..', 'assets'); // logo/contact assets

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
const p = (text, o = {}) => new Paragraph({ children: runs(text, o), spacing: { before: o.before ?? 40, after: o.after ?? 120, line: 264 }, alignment: o.align });
const spacer = (h = 120) => new Paragraph({ children: [], spacing: { after: h } });
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 140 }, children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 26, color: BLACK, font: FONT })] });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 22, color: BLACK, font: FONT })] });
const bullet = t => new Paragraph({ children: runs(t), bullet: { level: 0 }, spacing: { before: 30, after: 80, line: 264 } });
const B = { style: BorderStyle.SINGLE, size: 4, color: BORD };
function tbl(headers, rows, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map(w => Math.round(CONTENT_W * w / total));
  widths[widths.length - 1] = CONTENT_W - widths.slice(0, -1).reduce((a, b) => a + b, 0);
  const cell = (txt, i, isH) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: isH ? TEAL : 'FFFFFF', color: 'auto' },
    margins: { top: 90, bottom: 90, left: 110, right: 110 }, verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({ spacing: { before: 0, after: 0, line: 252 },
      children: isH ? [new TextRun({ text: String(txt ?? ''), bold: true, size: 21, color: 'FFFFFF', font: FONT })] : runs(String(txt ?? ''), { size: 21 }) })],
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
const imgAt = (abs, w, h) => new ImageRun({ data: fs.readFileSync(abs), transformation: { width: w, height: h }, type: 'png' });
const img = (file, w, h) => imgAt(path.join(DIR, file), w, h);
const simg = (file, w, h) => imgAt(path.join(SHARED, file), w, h);
const imgP = (file, w, h, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: o.before ?? 120, after: o.after ?? 60 }, children: [img(file, w, h)] });
const caption = t => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 220 }, children: [new TextRun({ text: t, size: 22, color: BLACK, font: FONT })] });
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

/* ---- Cover ---- */
P(
  new Paragraph({ spacing: { after: 0 }, children: [simg('logo_block.png', 170, 102)] }),
  spacer(2300),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
    new TextRun({ text: 'Employer Name Edit in', bold: true, size: 56, color: BLUE, font: FONT }),
    new TextRun({ break: 1, text: 'Credit Queue', bold: true, size: 56, color: BLUE, font: FONT }),
  ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'V1.0', bold: true, size: 44, color: BLUE, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: '30 September 2026', size: 22, color: GREY, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [simg('logo_navy.png', 165, 48)] }),
  spacer(3300),
  ctr('This is not a legally binding document', { size: 19 }),
  ctr('Highly confidential not to be shared without written consent', { size: 19 }),
  spacer(200),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [simg('contact_strip.png', 600, 71)] }),
  BREAK(),
);

/* ---- History of change ---- */
P(
  h1('History of Change'),
  tbl(
    ['Version', 'Date', 'Author', 'Description'],
    [['1.0', '30 September 2026', 'Hailey (Appro)', 'Initial version']],
    [12, 24, 22, 42],
  ),
  spacer(200),
);

/* ---- Feature overview ---- */
P(
  h1('Employer Name Edit in Credit Queue'),
  h2('FEATURE OVERVIEW'),
  p('This document describes the Super Portal capability that allows authorised Credit users to **correct the Employer Name** of an application while it sits in the Credit Queue. Today the Employer Name is system-derived and locked — from the government employment record (sponsor name) or from the customer input — although it drives the employer classification (ALOC), the related company attributes, the Rule Engine evaluation and the maximum DBR used by limit assignment. A wrong employer name today leaves the Credit user only two options: decide the case on non-listed-company terms, or reject it. Key steps are as following:'),
  bullet("Credit user with the 'Edit Employer Name' permission opens the existing Edit Application pop-up in Credit Queue and corrects the Company Name in the Employment Information section (the renamed Length of Service section, now holding both employment fields)."),
  bullet('On save and confirmation, the system overrides the finalized Employer Name, re-runs the employer classification (ALOC and MOD / MOI / Pensioner flags), recalculates the related fields and re-runs the Rule Engine.'),
  bullet('The application details display the updated name, the re-classified result and a full original → updated trail; every downstream consumer of the Employer Name reads the corrected value.'),
  imgP('Flow_Edit_Employer_Name.png', 600, 223, { before: 200 }),
  spacer(80),
  p('Applicable products: **CC, PL**. *(CASA is excluded — it has no credit decisioning; Mortgage Loan and Auto Loan are not yet part of the platform scope.)*'),
  tbl(
    ['Product Type', 'Applicable Status where the Employer Name can be edited'],
    [
      ['CC', "Credit Queue L1 / L2 / L3 — Application Status 'Awaiting Credit Approval'"],
      ['PL', "Credit Queue L1 / L2 / L3 — Application Status 'Awaiting Credit Approval'"],
    ],
    [22, 78],
  ),
  spacer(160),
  p('The edit shall be restricted in below scenarios:'),
  tbl(
    ['Scenario', 'Condition'],
    [
      ['Application waiting for income verification', 'The application is pending the income retrigger — Edit is disabled as today.'],
      ['Application locked by another request', "A recalculation or Rule Engine run is in progress — 'The Application is in another request processing.'"],
      ['User without the permission', "'Edit Employer Name' = FALSE — the section is hidden; a role with all Edit permissions FALSE does not see the Edit button."],
      ['Application not in Credit Queue', 'Application Enquiry and the Risk / Compliance / Sale queues remain view only.'],
    ],
    [30, 70],
  ),
);

/* ---- End-to-end ---- */
P(
  h1('End-to-End Employer Name Edit Flow from Super Portal'),
  h2('1. Role Management: Edit Employer Name Permission'),
  bullet("A new role permission named **'Edit Employer Name'** shall be added to the Editor group of **Credit Queue L1, L2 and L3** under the Manually Queue section of Role Management — **no product classification**: one permission per queue level, per the live Role Management design — listed **immediately before 'Edit Length of Service'** and with the same treatment."),
  imgP('SC1_Role_Permission_Credit_Queue_Edit_Employer_Name.png', 600, 338),
  caption("SC1: Add Role screen: Manually Queue > Credit Queue > 'Edit Employer Name' permission"),
  tbl(
    ['Permission Value', 'Allowed Actions'],
    [
      ['Edit Employer Name = TRUE', 'Users can view and update the Company Name field of the Employment Information section in the Edit Application pop-up.'],
      ['Edit Employer Name = FALSE', 'The Company Name field is hidden (the section is hidden when Edit Length of Service is FALSE too). A role with all Edit permissions FALSE does not see the Edit button.'],
    ],
    [30, 70],
  ),
  spacer(80),
  p("*The permission is a distinct right — never bundled with Evaluate Application or Send Application, and it stays separate from 'Edit Length of Service' although both fields sit in the one Employment Information section: each permission governs its own field. The Permission Matrix reference page shall be updated.*", { size: 21 }),
);

P(
  h2('2. Employer Name edit from Credit Queue'),
  bullet('The existing **Edit** button on the Credit Queue Application Details screen is the entry point. In the Edit Application pop-up, the existing "Length of Service" section is renamed **Employment Information** and holds both employment fields — the new **Company Name** followed by **Length Of Service (Months)** (existing, unchanged). Pop-up order: Application Details → Other Income And Expenses → Liability Info → Employment Information.'),
  imgP('SC2_Credit_Queue_Application_Details_Edit_Button.png', 600, 338),
  caption('SC2: Credit Queue — Application Details, Edit entry point'),
  imgP('SC3_Edit_Application_Popup_Employer_Name.png', 600, 438),
  caption('SC3: Edit Application pop-up — Employment Information section'),
  tbl(
    ['Component', 'Type', 'Mandatory', 'Editable', 'Description'],
    [
      ['Employment Information', 'Section bar', 'N/A', 'N/A', "Renamed from 'Length of Service' — same style and position. Shown when 'Edit Length of Service' or 'Edit Employer Name' is TRUE; each field displays per its own permission."],
      ['Company Name', 'Input field', 'Yes', 'Yes', "New field, governed by 'Edit Employer Name'. Pre-populated with the current finalized Employer Name. Validation as the customer journey field: alphabetic characters only; maximum 200 characters; blank not allowed. An unchanged value on Save does not trigger the re-run."],
      ['Clear All / Cancel / Save', 'Existing controls', 'N/A', 'N/A', 'Unchanged behaviour: Clear All reloads the stored values; Cancel closes without saving; Save is disabled until a value changes.'],
    ],
    [16, 12, 16, 12, 44],
  ),
);

P(
  h2('3. Impact of saving the updated Employer Name'),
  p("When the user clicks Save, the existing Edit confirmation component is shown once for the whole pop-up — one generic message, not specific to any edited field (centered message, No / Yes, Save buttons): *'Are you sure you want to update this <Application ID>? The system will automatically recalculate the related fields and re-run the Rule Engine.'*"),
  imgP('SC4_Edit_Employer_Name_Confirmation_Popup.png', 310, 228),
  caption('SC4: Confirmation before the re-run'),
  p("On 'Yes, Save', the system executes in order:"),
  tbl(
    ['#', 'System action'],
    [
      ['1', "Override the finalized Employer Name with the input. The first system-derived value is kept as the Original Employer Name together with its original classification. Source is recorded as 'Credit Department' with Updated By / Updated On. The government-record and customer-journey source data are not modified."],
      ['2', 'Re-run the employer classification: match the new name against the Empaneled Company list — listed company → ALOC with its category, sector, industry and contact fields; otherwise N-ALOC. Re-evaluate the MOD / MOI / Pensioner flags.'],
      ['3', 'Recalculate the calculated variables and the limit assignment — the classification drives the maximum DBR and the income-multiplier group.'],
      ['4', 'Re-run the Rule Engine (segmentation, filtration, deviation) on the currently published versions. The existing shared re-run counter applies — the same rule as every edit action that re-triggers the Rule Engine (Edit Information, Re-fetch ECB, Retrigger FTS): if the application fails the Rule Engine more than 2 times in total, the system rejects it. Existing platform behaviour, unchanged by this feature.'],
      ['5', "Route the application per the standard routing logic. The status stays 'Awaiting Credit Approval' unless the routing changes it — no new Application Status, no mobile-app impact."],
      ['6', "Audit trail: Step = 'Edit Information'; Step Detail on two lines — line 1: *Employer Name: updated from \"<old>\" (Source: <old source>) to \"<new>\"* — line 2: *ALOC: updated from <original ALOC> to <updated ALOC>*; Action by = user email. This step is the traceability record — the old → new trail lives in the application history, not in the Application Details display."],
      ['7', "Loading screen up to 15 seconds; the application is locked during the run ('The Application is in another request processing.')."],
      ['8', "Toaster 'Application \"<Application ID>\" is updated successfully!'; the Application Details, Rule Engine Result and Approve Limit Result sections reload."],
    ],
    [6, 94],
  ),
  spacer(120),
  bullet('Several sections edited in one Save → the recalculation and the Rule Engine run once, after all values are stored.'),
  bullet('No cap on repeat edits; the Original Employer Name is set once and never overwritten.'),
);

P(
  h2('4. Display after the update'),
  p('The fields below sit in the expanded **Application Details** section › **Employment Information** sub-block of the application view. **Application Details displays details only — no trail block**; the old → new trail lives in the Application Enquiry application history (section 3, step 6). The same section is shown, reading the finalized value, in every view that renders it: **Credit Queue L1–L3, Risk Queue, Sale Queue, Compliance Queue, Termination Queue, Disbursement Maker / Checker and Application Enquiry** (all view only):'),
  imgP('SC5_Application_Details_Employer_Name_Updated.png', 600, 438),
  caption('SC5: Application Details — Employment Information after the update'),
  tbl(
    ['Field', 'Value after the edit'],
    [
      ['Company Name', 'Updated finalized Employer Name — the value the system uses'],
      ['Company Name Source (new)', 'EFR (Sponsor Name) | Customer Journey | Credit Department (after an edit).'],
      ['ALOC / Pensioner', 'Re-classified result in the live display format: Yes | No (<match %>)'],
    ],
    [34, 66],
  ),
  spacer(120),
  bullet('Repeat edits: every edit writes its own Edit Information step — the application history carries the full trail.'),
  bullet("**Application Enquiry impact:** the enquiry details display the updated values identically in the same Application Details section, and its Application History shows the 'Edit Information' step with the old → new values in the step details, followed by the system steps of the re-run. No edit is possible from Application Enquiry."),
  imgP('SC6_Application_Enquiry_History_Edit_Employer_Name.png', 600, 338),
  caption('SC6: Application Enquiry — application history with the Edit Information step'),
);

P(
  h2('5. Downstream consumers of the corrected Employer Name'),
  p('After the edit, every consumer of the Employer Name reads the corrected finalized value:'),
  tbl(
    ['Consumer', 'Behaviour after the edit'],
    [
      ['Application details — every view that renders it (Credit / Risk / Sale / Compliance queues, Termination Queue, Disbursement Maker / Checker, Application Enquiry)', 'Updated name and re-classified ALOC — section 4. No change needed per view: they all read the finalized value.'],
      ['CAM report + Affordability Assessment Form', 'Regenerated on the edit, carrying the updated name, classification and recalculated results.'],
      ['Application Form', 'Not regenerated — it remains the record of what the customer submitted at OTP time.'],
      ['Customer Document Stack', 'Generated after the decision — carries the updated value automatically.'],
      ['Core banking (CIF creation)', 'No impact — the CIF mapping carries no Employer Name.'],
      ['AML screening', 'No re-screening on the edit; the corrected name reaches the screening system through the post-decision CIF-update call.'],
      ['Length of Service', 'Not re-run — it has its own edit section.'],
      ['Customer communication', 'None — the customer is not notified of the correction.'],
    ],
    [32, 68],
  ),
);

P(
  h2('6. Summary'),
  tbl(
    ['Step', 'Actor', 'Action', 'Result'],
    [
      ['1', 'Credit User (with permission)', 'Opens Edit on a Credit Queue application and corrects the Company Name', 'Save enabled once the value changes'],
      ['2', 'Credit User', 'Confirms the update', 'System actions of section 3 execute in order'],
      ['3', 'System', 'Overrides the finalized name, re-classifies, recalculates, re-runs the Rule Engine and routes', "Status stays 'Awaiting Credit Approval' unless routing changes it"],
      ['4', 'System', 'Refreshes the view and writes the audit trail', 'Updated details, original → updated trail, history step'],
      ['5', 'Credit User', 'Decides the case on the corrected employer', 'Approve / override / reject on the true classification'],
    ],
    [8, 20, 40, 32],
  ),
);

/* ---- Additional impact analysis ---- */
P(
  BREAK(),
  h1('Additional Impact Analysis'),
  p('Beyond the direct scope above, the following areas of the Reem Bank platform are impacted and must be carried into estimation and test scope:'),
  impactTable([
    ['Role Management / Permission Matrix', "New permission 'Edit Employer Name' on Credit Queue L1–L3 (Editor group; one permission per queue level, no product classification). A distinct right, never bundled. Permission Matrix page updated.", ['ia_role_cq.png', 1400, 190, 'Role Management › Credit Queue (SC1)']],
    ['Edit Application pop-up', 'New Employment Information section with the single Company Name field and customer-journey validation.', ['ia_edit_popup.png', 1400, 168, 'Edit Application › Employment Information (SC3)']],
    ['Employer classification', 'The classification step becomes re-runnable on demand for one application with a user-provided name; it overwrites the previous results atomically.', ['ia_confirm.png', 760, 560, 'Confirmation before the re-run (SC4)']],
    ['Rule Engine & Limit Assignment', 'Re-run on the new classification against the currently published versions; shared re-run counter; recalculation of calculated variables and approved limit.', ['ia_policy.png', 1132, 635, 'Rule Engine — published strategies']],
    ['Application Details display', 'Company Name Source row on every view rendering the section (queues including Termination / Disbursement, Application Enquiry); classification fields refreshed. No trail block — the trail is in the application history only.', ['ia_app_details.png', 1400, 637, 'Application Details › Employment Information (SC5)']],
    ['Audit trail', "'Edit Information' step with a dynamic old → new step detail; the re-run steps log with Action by = System.", ['ia_history.png', 1400, 104, 'Application history (SC6)']],
  ]),
);

/* ---- Thank you ---- */
P(
  BREAK(),
  new Paragraph({ spacing: { after: 0 }, children: [simg('logo_block.png', 170, 102)] }),
  spacer(2800),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'THANK YOU', size: 72, color: BLUE, font: FONT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [simg('logo_navy.png', 200, 58)] }),
  spacer(2800),
  ctr('This is not a legally binding document', { size: 19 }),
  ctr('Highly confidential not to be shared without written consent', { size: 19 }),
  spacer(200),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [simg('contact_strip.png', 600, 71)] }),
);

/* ================= ASSEMBLE ================= */
const doc = new Document({
  creator: 'Appro',
  title: 'Employer Name Edit in Credit Queue V1.0',
  styles: { default: { document: { run: { font: FONT, size: 22, color: BLACK } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 500, footer: 480 } } },
    headers: {
      default: new Header({ children: [new Table({
        columnWidths: [Math.round(CONTENT_W / 2), CONTENT_W - Math.round(CONTENT_W / 2)],
        width: { size: CONTENT_W, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: Math.round(CONTENT_W / 2), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: 'Confidential', size: 18, color: BLACK, font: FONT })] })] }),
          new TableCell({ width: { size: CONTENT_W - Math.round(CONTENT_W / 2), type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [simg('logo_header.png', 100, 30)] })] }),
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
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [simg('circles_footer.png', 96, 19)] })] }),
        ] })],
      })] }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(DIR, 'Appro_RF_Employer_Name_Edit_in_Credit_Queue_v1.0.docx');
  fs.writeFileSync(out, buf);
  console.log('WROTE', out, buf.length, 'bytes');
});
