/* Appro BRD generator — ECB Consumer Credit Score 3.0
 * House style: Application Cancellation in Super Portal V1.0
 *   Arial · black CAPS H1 · #156082 table headers, white bold · #A6A6A6 thin borders
 *   cover = appro logo block, blue title, V + date, navy wordmark, confidentiality, contacts
 *   footer = confidentiality + page number + four blue circles
 * Client-facing: no Jira ticket references anywhere in this document.
 * Build:  node build_brd.js  &&  soffice --headless --convert-to pdf <docx>
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType,
  Header, Footer, PageNumber, PageBreak, convertInchesToTwip, LineRuleType,
} = require('docx');

const A = path.join(__dirname, 'assets');
const S = path.join(__dirname, '..', 'us', 'screens');
const img = (f) => fs.readFileSync(f);

const VERSION = 'V1.0';
const DOC_DATE = '25 September 2026';
const TITLE = 'ECB Consumer Credit Score 3.0';
const SUBTITLE = 'Rule Engine and Score Check Management — Super Portal';

/* ---------- palette ---------- */
const NAVY = '1A214D';
const BLUE = '3B7EF6';
const TH = '156082';          // table header fill
const BORD = 'A6A6A6';
const INK = '000000';
const GREY = '595959';
const ORANGE = 'FF5500';

/* ---------- primitives ---------- */
const thin = { style: BorderStyle.SINGLE, size: 4, color: BORD };
const TBORDERS = { top: thin, bottom: thin, left: thin, right: thin,
                   insideHorizontal: thin, insideVertical: thin };

const h1 = (t) => new Paragraph({
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, color: INK, size: 26, allCaps: true })],
});
const h2 = (t) => new Paragraph({
  spacing: { before: 260, after: 140 },
  children: [new TextRun({ text: t, bold: true, color: TH, size: 23 })],
});
const p = (t, o = {}) => new Paragraph({
  spacing: { after: o.after === undefined ? 130 : o.after },
  alignment: o.align,
  children: runs(t),
});
const bullet = (t) => new Paragraph({
  bullet: { level: 0 }, spacing: { after: 70 }, children: runs(t),
});
const num = (t, ref) => new Paragraph({
  numbering: { reference: ref, level: 0 }, spacing: { after: 70 }, children: runs(t),
});
/* **bold** markers inside a string */
function runs(t, size = 20) {
  return String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) =>
    s.startsWith('**')
      ? new TextRun({ text: s.slice(2, -2), bold: true, size })
      : new TextRun({ text: s, size }));
}
const caption = (t) => new Paragraph({
  spacing: { before: 60, after: 220 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: t, italics: true, size: 17, color: GREY })],
});
const IMGSPACE = { line: 240, lineRule: LineRuleType.AT_LEAST };
const pic = (file, w, h) => new Paragraph({
  spacing: { before: 120, after: 0, ...IMGSPACE }, alignment: AlignmentType.CENTER,
  children: [new ImageRun({ data: img(file), transformation: { width: w, height: h }, type: 'png' })],
});
const gap = (after = 160) => new Paragraph({ spacing: { after }, children: [] });

function cell(children, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    verticalAlign: o.valign || VerticalAlign.TOP,
    width: o.width ? { size: o.width, type: WidthType.DXA } : undefined,
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    columnSpan: o.span,
  });
}
const thCell = (t, width) => cell(
  new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 19 })] }),
  { fill: TH, width, valign: VerticalAlign.CENTER });
const tdText = (t, width) => cell(
  new Paragraph({ spacing: { after: 0 }, children: runs(t, 18) }),
  { width });
const tdPic = (file, w, h, width) => cell(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, ...IMGSPACE },
    children: [new ImageRun({ data: img(file), transformation: { width: w, height: h }, type: 'png' })] }),
  { width, valign: VerticalAlign.CENTER });

function table(headers, rows, widths) {
  return new Table({
    width: { size: 9640, type: WidthType.DXA },
    columnWidths: widths,
    borders: TBORDERS,
    rows: [
      new TableRow({ tableHeader: true,
        children: headers.map((t, i) => thCell(t, widths[i])) }),
      ...rows.map((r) => new TableRow({
        children: r.map((c, i) =>
          (c && c.__pic) ? tdPic(c.file, c.w, c.h, widths[i]) : tdText(c, widths[i])) })),
    ],
  });
}
const P_ = (file, w, h) => ({ __pic: true, file, w, h });

/* ---------- Score 3.0 day-1 values ---------- */
const MATURE = [
  ['M0','Very High Risk','Weak','300','300'], ['M1','Very High Risk','Weak','301','523'],
  ['M2','High Risk','Fair','524','673'],      ['M3','Medium Risk','Good','674','714'],
  ['M4','Medium Risk','Good','715','740'],    ['M5','Medium Risk','Good','741','755'],
  ['M6','Low Risk','Very Good','756','773'],  ['M7','Low Risk','Very Good','774','789'],
  ['M8','Very Low Risk','Excellent','790','809'], ['M9','Very Low Risk','Excellent','810','850'],
];
const NTC = [
  ['N0','Very High Risk','Weak','300','427'], ['N1','Very High Risk','Weak','428','450'],
  ['N2','High Risk','Fair','451','463'],      ['N3','High Risk','Fair','464','478'],
  ['N4','High Risk','Fair','479','491'],      ['N5','Medium Risk','Good','492','506'],
  ['N6','Medium Risk','Good','507','519'],    ['N7','Low Risk','Very Good','520','531'],
  ['N8','Low Risk','Very Good','532','553'],  ['N9','Low Risk','Very Good','554','650'],
];
const scoreRows = [...MATURE.map(r => ['Mature', ...r]), ...NTC.map(r => ['New to Credit', ...r])]
  .map(r => [r[0], `**${r[1]}**`, r[2], r[3], r[4], r[5]]);

/* =======================  COVER  ======================= */
const cover = [
  new Paragraph({ spacing: { before: 300, after: 0, line: 240, lineRule: LineRuleType.AT_LEAST }, alignment: AlignmentType.LEFT,
    children: [new ImageRun({ data: img(path.join(A, 'appro_wordmark_white_on_blue.png')),
      transformation: { width: 228, height: 69 }, type: 'png' })] }),
  gap(520),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'BUSINESS REQUIREMENTS DOCUMENT', bold: true, size: 19,
      color: GREY, characterSpacing: 60 })] }),
  new Paragraph({ spacing: { after: 90 },
    children: [new TextRun({ text: TITLE, bold: true, size: 52, color: BLUE })] }),
  new Paragraph({ spacing: { after: 340 },
    children: [new TextRun({ text: SUBTITLE, size: 26, color: NAVY })] }),
  new Paragraph({ spacing: { after: 30 },
    children: [new TextRun({ text: `${VERSION}  /  ${DOC_DATE}`, bold: true, size: 24, color: NAVY })] }),
  new Paragraph({ spacing: { after: 700 },
    children: [new TextRun({ text: 'Prepared for Reem Bank', size: 21, color: GREY })] }),
  new Paragraph({ spacing: { after: 140, line: 240, lineRule: LineRuleType.AT_LEAST },
    children: [new ImageRun({ data: img(path.join(A, 'appro_wordmark_navy.png')),
      transformation: { width: 130, height: 38 }, type: 'png' })] }),
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC  ·  Credit Bureau & Decisioning',
      size: 19, color: NAVY, bold: true })] }),
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({
      text: 'Confidential document between Appro Onboarding Solutions FZ-LLC and the recipient institution — not to be shared outside both organizations.',
      size: 17, color: GREY })] }),
  new Paragraph({ spacing: { after: 240 },
    children: [new TextRun({
      text: 'Information reflects Appro’s reading of the Etihad Credit Bureau specification at the date of publication. Not legal or regulatory advice.',
      size: 17, color: GREY })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

/* =======================  BODY  ======================= */
const body = [
  h1('1. Feature overview'),
  p('Etihad Credit Bureau replaces Consumer Credit Score 2.1 with **Consumer Credit Score 3.0**. Score 3.0 is not a version bump: it splits the scored population in two, each with its own scorecard, its own scale and its own range codes — **Mature** (300 – 850, codes M0–M9) and **New to Credit** (300 – 650, codes N0–N9).'),
  p('The bureau has confirmed **no change to the A2A request format or to connectivity**. The response is enriched, not restructured. Nothing in the current Super Portal integration breaks. What changes is the vocabulary the credit policy is written in — and that is what this document specifies.'),
  p('**What is delivered**'),
  bullet('A single, backend-configurable **Score Range master** holds every range code. Adding, editing or deactivating a range needs no code change and no deployment.'),
  bullet('**Segment detection** derives Mature or New to Credit from the returned range by exact match against that master — never by reading the first character.'),
  bullet('The **AECB Score Range** criterion in the Rule Engine offers the Score 3.0 codes in addition to the existing families; nothing already published is retired or remapped.'),
  bullet('A new **AECB Score Segment** variable is added to Segmentation, Filtration and Deviation, so a strategy can tell the two populations apart.'),
  bullet('**AECB Score Range** and **AECB Score Segment** become attributes in Score Check Management, alongside the existing numeric score.'),
  bullet('The application enquiry banner, the queues and the credit report display the range **code and description** plus the segment.'),
  new Paragraph({ children: [new PageBreak()] }),
  h2('End-to-end flow'),
  pic(path.join(A, 'Flow_ECB_Consumer_Score_3.0.png'), 530, 555),
  caption('How a Score 3.0 response reaches a credit decision'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('2. Scope'),
  h2('Product scope'),
  p('Rule Engine Strategies (Segmentation, Filtration and Deviation), Score Check Management, the application enquiry banner and the credit report — for the products where Score Check Management is enabled: **Credit Card, Personal Loan and CASA**. The Mortgage Loan and Auto Loan tabs are disabled in the current build and are out of scope.'),
  h2('In-scope scenarios'),
  num('**S1** — A Credit user selects an AECB Score Range value on a Strategy criterion and is offered the Score 3.0 codes.', 'scen'),
  num('**S2** — A Credit user builds a rule on the new AECB Score Segment variable.', 'scen'),
  num('**S3** — A Credit user adds an AECB Score Range condition to a Score Check Management value set.', 'scen'),
  num('**S4** — An application returns a Score 3.0 range; segment, code and description are derived, displayed and evaluated.', 'scen'),
  num('**S5** — An application returns an existing family range code; behaviour is unchanged.', 'scen'),
  num('**S6** — A range is added, edited or deactivated in the master after go-live, with no code change and no deployment.', 'scen'),
  h2('Not in scope'),
  bullet('Any change to the bureau request or response contract.'),
  bullet('Any change to Limit Assignment boundaries or deviation thresholds.'),
  bullet('Mortgage Loan and Auto Loan, whose Score Check Management tabs are disabled.'),
  bullet('The bank’s own cut-offs, tier mapping and policy tables. Appro configures what the bank decides; the decisions themselves sit with Credit and Risk.'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('3. The Score Range master'),
  p('Every range code the platform recognises lives in one master. Each entry carries the range code, its risk group, its descriptive band, the segment or score name it belongs to, the minimum and maximum score of the band, and an active flag.'),
  p('**Range codes are never hard-coded in service logic.** Every consumer — the Rule Engine, Score Check Management, the enquiry banner, the queues and the report — reads this master. Adding, editing or deactivating a range is a configuration change, not a release.'),
  p('The bureau’s own bands are reproduced below. Both segments are fully contiguous: every score inside a segment’s scale resolves to exactly one code, with no gaps and no overlaps.'),
  gap(40),
  table(['Segment', 'Code', 'Risk group', 'Band', 'Min score', 'Max score'],
        scoreRows, [2000, 1100, 2100, 1800, 1320, 1320]),
  caption('Consumer Score 3.0 — day-one values loaded into the Score Range master'),
  p('**Existing families are retained, unchanged in meaning.** The range codes in use today are migrated into the same master so that all codes live in one place. They keep their present risk groups and remain selectable, and no strategy version that references them is affected. The enumerated list of existing codes is taken from the current production configuration and confirmed before build; it is not assumed.'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('4. Segment detection'),
  p('The application’s score segment is derived from the range returned in the bureau response, by **exact match against the Score Range master**.'),
  gap(40),
  table(['Returned range', 'Segment / score name'], [
    ['Two characters, M + digit (M0–M9)', 'Consumer Score 3.0 — Mature'],
    ['Two characters, N + digit (N0–N9)', 'Consumer Score 3.0 — New to Credit'],
    ['Any existing family code', 'Its current score name — unchanged'],
  ], [4400, 5240]),
  gap(120),
  p('**Prefix matching is prohibited.** Score Range is a fixed two-character field, but the codes in use today occupy a single character. A single-character **M** is a Very Low Risk code in the existing families, while **M0–M9** is the Mature segment. A rule, a report filter, a warehouse column or a policy table that tests only the first character will classify a Very Low Risk customer as Mature, or will truncate and silently fail to join. This is the first item on Appro’s watch-list in the Q3 2026 newsletter, and the reason the master is matched on the whole code.'),
  p('The derived segment is persisted on the application, so the banner, the reports and the audit trail all read the same value. A range that is not found in the master does not resolve to a segment: it is handled as **no value**, and is never defaulted to the lowest band.'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('5. Rule engine — score range value list'),
  p('The AECB Score Range criterion is sourced from the Score Range master, so it offers the Score 3.0 codes **in addition to** the existing families — not in place of them.'),
  bullet('Operators are unchanged: **Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty**.'),
  bullet('Strategy versions published before this change keep working untouched, because no existing code is retired or remapped. **No migration of published versions is required.**'),
  bullet('A code deactivated in the master stops being offered on new or edited strategies, but does not break a version that already references it.'),
  pic(path.join(S, 'SC3_Rule_Engine_Values_Score_3.0.png'), 560, 285),
  caption('Strategy criterion — the value list with the Score 3.0 codes available'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('6. Rule engine — score segment variable'),
  p('A new variable is added to Segmentation, Filtration and Deviation.'),
  gap(40),
  table(['Field', 'Operators', 'Values'], [
    ['**AECB Score Segment**',
     'Is In, Is Not In, Include, Does Not Include, Is Empty, Is Not Empty',
     'Mature / New to Credit'],
  ], [2600, 4640, 2400]),
  gap(140),
  p('**Why the variable is needed.** The two scorecards do not share a scale, so the same three digits carry opposite verdicts. A score of 600 is **High Risk** on the Mature scorecard (tranche M2, band 524–673) and **Low Risk** on New to Credit (tranche N9, band 554–650). A single policy table keyed on the numeric score alone treats those two customers identically. They are not the same risk. Every score-dependent rule must read Segment alongside Score, or key off the range code, which is already segment-safe.'),
  pic(path.join(A, 'SC6_Annotated_Score_Segment.png'), 600, 200),
  caption('Strategy criterion — the new AECB Score Segment variable and its two values'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('7. Score check management'),
  p('**AECB Score Range** becomes an attribute in Score Check Management, alongside the existing numeric **AECB Score**, on the Credit Card, Personal Loan and CASA tabs. **AECB Score Segment** is available on the same terms.'),
  bullet('Usable in a group’s Values conditions under Match All / Match Any, on the same footing as the existing attributes.'),
  bullet('Operators as section 5.'),
  bullet('Added through Edit Attributes, so the attribute reaches every group on the product tab.'),
  bullet('Existing groups and value sets are unchanged, and the numeric score condition keeps working.'),
  pic(path.join(S, 'SC5_Score_Check_Mgmt_AECB_Score_Range.png'), 620, 283),
  caption('Score Check Management — a value set conditioned on the Score 3.0 codes'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('8. Enquiry, queues and the credit report'),
  p('The same banner component serves **Application Enquiry, Credit Queue detail and Termination Queue detail**. All three reflect the change, and each is verified separately before sign-off.'),
  pic(path.join(A, 'Banner_Score_Segment_Display.png'), 600, 166),
  caption('Score block — the range code and description, and the new segment'),
  h2('Credit report'),
  p('In the Credit Summary block, below the credit score, the report displays **Score Range = code – description** as text, for example “M9 – Excellent”. The star display follows the segment’s own scale.'),
  gap(40),
  table(['Stars', 'Mature', 'New to Credit', 'Equivalent risk group'], [
    ['1', '300 – 523', '300 – 450', 'Very High Risk'],
    ['2', '524 – 673', '451 – 491', 'High Risk'],
    ['3', '674 – 755', '492 – 519', 'Medium Risk'],
    ['4', '756 – 789', '520 – 650', 'Low Risk'],
    ['5', '790 – 850', '**NA**', 'Very Low Risk'],
  ], [1300, 2600, 2600, 3140]),
  gap(120),
  p('The star bands align exactly with the risk groups held on the master, so the star count is derived from the risk group rather than from a second hard-coded band table. **New to Credit has no five-star band**, because the scale has no Very Low Risk code — see section 10.'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('9. Release plan'),
  gap(40),
  table(['Milestone', 'Date', 'Owner'], [
    ['Build available in **UAT**', '**26 September 2026**', 'Appro'],
    ['UAT verification', 'From 26 September 2026', 'Reem Bank and Expleo'],
    ['Bureau go-live — Consumer Score 3.0 in production', '**27 September 2026 (tentative, bureau-set)**', 'Etihad Credit Bureau'],
    ['Production deployment of this change', 'After bureau go-live, once UAT verification is complete', 'Appro'],
    ['Updated data points and upgraded report format', 'October release', 'Appro'],
  ], [3900, 3340, 2400]),
  gap(160),
  p('**Sequencing.** The production deployment follows the bureau go-live. Releasing ahead of it would put Score 3.0 codes in front of credit users while the bureau is still returning Score 2.1 values.'),
  p('**Production impact today: none.** With the Rule Engine configured as it is now and the bureau response structured as it is now, this change does not alter any live decision. It adds codes, one variable and two attributes; it retires nothing and remaps nothing.'),
  p('**Where the impact lands: credit policy setup.** The new calibration, the new score ranges and the second scorecard change the way cut-offs, tiers and eligibility rules have to be written. A Score 2.1 threshold carried forward unchanged will not produce the approval rate the bank expects. That work is the bank’s, and it is the reason the platform change is delivered ahead of the bureau date.'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('10. Impact analysis'),
  gap(40),
  table(['Area', 'Impact', 'Screen'], [
    ['**Rule Engine — Strategies**',
     'The value list is sourced from the master and extended with twenty codes across Segmentation, Filtration and Deviation. Published versions keep working unchanged; nothing is retired or remapped.',
     P_(path.join(A, 'ia_rule_engine.png'), 190, 187)],
    ['**Rule Engine — new variable**',
     'AECB Score Segment is added as a variable with two values. Without it a strategy cannot distinguish the two populations, whose scales end 200 points apart.',
     P_(path.join(A, 'ia_score_segment.png'), 190, 63)],
    ['**Score Check Management**',
     'Two new attributes on the Credit Card, Personal Loan and CASA tabs. Existing groups and value sets are unchanged and the numeric score condition keeps working.',
     P_(path.join(A, 'ia_score_check.png'), 190, 43)],
    ['**Credit policy and cut-offs**',
     'Granularity moves to ten codes per segment, so an application can fall on a different side of a threshold than before. A shared numeric threshold over-approves one population and over-declines the other. Published strategies are re-validated before go-live.',
     P_(path.join(A, 'ia_credit_policy.png'), 190, 63)],
    ['**New-to-Credit applicants**',
     'The scale ends at 650 and the top code N9 is Low Risk — there is no Excellent / Very Low Risk code and no five-star band. Any criterion selecting Very Low Risk, and any numeric threshold above 650, can never be met by a New-to-Credit applicant. Existing thresholds are reviewed against this.',
     P_(path.join(A, 'ia_ntc_scale.png'), 190, 35)],
    ['**Enquiry, reporting and audit**',
     'Every surface that carries the score displays the code, the description and the segment. Historical applications keep the value they were decisioned under. The score step records the range code, the description and the segment.',
     P_(path.join(A, 'ia_reporting.png'), 190, 53)],
  ], [1900, 4540, 3200]),

  new Paragraph({ children: [new PageBreak()] }),
  h1('11. Open questions'),
  p('Each item below has a recommended default. Confirming the defaults is enough to proceed.'),
  gap(40),
  table(['#', 'Question', 'Recommended default'], [
    ['1', 'Are the existing range codes in the current production configuration confirmed for migration into the master, with their present risk groups?',
          'Enumerate from the live configuration and confirm before build. No code is assumed.'],
    ['2', 'How are New-to-Credit applicants treated in policy — the same cut-off table, a separate table, or refer?',
          'A separate table. One shared table mis-decisions one of the two populations.'],
    ['3', 'Which existing criteria select Very Low Risk, or test a numeric threshold above 650?',
          'Reviewed before go-live. Under Score 3.0 no New-to-Credit applicant can satisfy either.'],
    ['4', 'Should a range that is absent from the master block the decision, or pass through as no value?',
          'Pass through as no value, never defaulted to the lowest band, and recorded on the audit trail.'],
    ['5', 'Which downstream reports carry the score range and need the code, description and segment?',
          'Enumerated with the bank and confirmed during UAT.'],
  ], [620, 4860, 4160]),

  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ spacing: { before: 2600, after: 180 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'THANK YOU', bold: true, size: 60, color: BLUE })] }),
  new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Appro Onboarding Solutions FZ-LLC', size: 22, color: NAVY, bold: true })] }),
  new Paragraph({ spacing: { after: 320 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Credit Bureau & Decisioning', size: 20, color: GREY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240, lineRule: LineRuleType.AT_LEAST },
    children: [new ImageRun({ data: img(path.join(A, 'appro_wordmark_navy.png')),
      transformation: { width: 130, height: 38 }, type: 'png' })] }),
];

/* =======================  DOCUMENT  ======================= */
const doc = new Document({
  creator: 'Appro Onboarding Solutions FZ-LLC',
  title: `${TITLE} — BRD ${VERSION}`,
  description: SUBTITLE,
  styles: { default: { document: { run: { font: 'Arial', size: 20, color: '1A1A1A' },
                                   paragraph: { spacing: { line: 276, lineRule: LineRuleType.AUTO } } } } },
  numbering: { config: [{ reference: 'scen', levels: [
    { level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START,
      style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { margin: { top: convertInchesToTwip(0.85), right: convertInchesToTwip(0.79),
                                    bottom: convertInchesToTwip(0.85), left: convertInchesToTwip(0.79) } } },
    footers: { default: new Footer({ children: [
      new Paragraph({ spacing: { before: 60, after: 20 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9' } }, children: [] }),
      new Table({
        width: { size: 9640, type: WidthType.DXA },
        columnWidths: [7240, 1200, 1200],
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                   left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                   insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [new TableRow({ children: [
          cell(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({
            text: 'Confidential document between Appro Onboarding Solutions FZ-LLC and the recipient institution — not to be shared outside both organizations.',
            size: 14, color: '808080' })] }), { width: 7240 }),
          cell(new Paragraph({ spacing: { after: 0, line: 200, lineRule: LineRuleType.AT_LEAST }, alignment: AlignmentType.RIGHT,
            children: [new ImageRun({ data: img(path.join(A, 'footer_dots.png')),
              transformation: { width: 47, height: 11 }, type: 'png' })] }), { width: 1200, valign: VerticalAlign.CENTER }),
          cell(new Paragraph({ spacing: { after: 0 }, alignment: AlignmentType.RIGHT,
            children: [new TextRun({ size: 16, color: BLUE, bold: true, children: [PageNumber.CURRENT] })] }),
            { width: 1200, valign: VerticalAlign.CENTER }),
        ] })],
      }),
    ] }) },
    children: [...cover, ...body],
  }],
});

const out = path.join(__dirname, `BRD_ECB_Consumer_Credit_Score_3.0_${VERSION}.docx`);
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log('written', out, b.length, 'bytes'); });
