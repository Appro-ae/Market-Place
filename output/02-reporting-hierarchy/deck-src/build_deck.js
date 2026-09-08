// AMP-2548 demo deck — Appro yellow-led style (pptxgenjs)
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const NAVY = '1a214d', BLUE = '3b7ef6', YELLOW = 'fdba23', LAV = 'edf2ff', WHITE = 'ffffff';
const F = 'Lato';
const noShadow = () => ({ type: 'none' });
const img = (n) => path.join(__dirname, n + '.png');
const sizes = JSON.parse(fs.readFileSync(path.join(__dirname, 'sizes.json'), 'utf8'));
const LOGO = process.env.APPRO_LOGO_DARK && fs.existsSync(process.env.APPRO_LOGO_DARK) ? process.env.APPRO_LOGO_DARK : null;
const LOGO_W = process.env.APPRO_LOGO_WHITE && fs.existsSync(process.env.APPRO_LOGO_WHITE) ? process.env.APPRO_LOGO_WHITE : null;

// Content that sits in the top band (y < 2.4") must end at x <= 11.8" to stay clear of the navy corner circle.
const RIGHT_TOP = 11.8;

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Appro';
pptx.company = 'Appro Onboarding Solutions FZ-LLC';
pptx.title = 'Sale Agent Code & Reporting Hierarchy';

const HEADER = 'APPRO – INTERNAL & APPROVED DOMAINS | Controlled Distribution';
const FOOTER = 'This document is classified as INTERNAL & WHITELISTED | Sharing allowed only with approved external domains';
let pageNo = 0;

// ---------- brand helpers ----------
function addBrandIcon(slide, x, y, color, sz = 0.18) {
  const gap = sz / 3, gap4 = sz * 0.55;
  [0, 1, 2].forEach(i => slide.addShape(pptx.ShapeType.ellipse, { x: x + i * (sz + gap), y, w: sz, h: sz, fill: { color }, line: { type: 'none' }, shadow: noShadow() }));
  slide.addShape(pptx.ShapeType.ellipse, { x: x + 3 * (sz + gap) + gap4, y, w: sz, h: sz, fill: { color }, line: { type: 'none' }, shadow: noShadow() });
}

// Logo lock-up. Uses the official PNG when APPRO_LOGO_DARK / APPRO_LOGO_WHITE point to it;
// otherwise a stand-in: "appro" wordmark + 4-circle icon in the brand colour.
function addLogo(slide, x, y, w, variant) {
  const file = variant === 'white' ? LOGO_W : LOGO;
  if (file) { slide.addImage({ path: file, x, y, w }); return; }
  const color = variant === 'white' ? WHITE : NAVY;
  const h = w / 3.45;
  const fsz = Math.round(w * 13.5);
  slide.addText('appro', { x, y: y - h * 0.15, w: w * 0.66, h: h * 1.3, fontFace: F, fontSize: fsz, bold: true, color, margin: 0, valign: 'middle', align: 'left', isTextBox: true });
  addBrandIcon(slide, x + w * 0.64, y + h * 0.42, color, h * 0.28);
}

function chrome(slide, t1, t2) {
  pageNo += 1;
  slide.background = { color: WHITE };
  slide.addShape(pptx.ShapeType.ellipse, { x: 11.5, y: -2.2, w: 4.5, h: 4.5, fill: { color: NAVY }, line: { type: 'none' }, shadow: noShadow() });
  slide.addText(HEADER, { x: 0.25, y: 0.04, w: 11.0, h: 0.18, fontFace: F, fontSize: 7, color: NAVY, align: 'left', valign: 'middle', margin: 0, isTextBox: true });
  addLogo(slide, 11.55, 0.34, 1.5, 'white');
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.25, y: 0.54, w: 1.794, h: 0.30, fill: { color: YELLOW }, line: { type: 'none' }, rectRadius: 0.08, shadow: noShadow() });
  slide.addText([
    { text: t1, options: { color: NAVY, bold: true } },
    { text: t2, options: { color: BLUE, bold: true } }
  ], { x: 0.3, y: 0.40, w: 11.0, h: 0.55, fontFace: F, fontSize: 20, align: 'left', valign: 'top', wrap: false, margin: 0, isTextBox: true });
  addBrandIcon(slide, 0.3, 7.08, BLUE);
  slide.addText(FOOTER, { x: 1.5, y: 7.18, w: 10.0, h: 0.2, fontFace: F, fontSize: 7, color: NAVY, align: 'center', margin: 0, isTextBox: true });
  slide.addText(String(pageNo), { x: 12.6, y: 7.18, w: 0.5, h: 0.2, fontFace: F, fontSize: 8, color: NAVY, align: 'right', margin: 0, isTextBox: true });
}

function section(title, sub) {
  pageNo += 1;
  const s = pptx.addSlide();
  s.background = { color: BLUE };
  addLogo(s, 0.4, 0.3, 1.2, 'white');
  s.addText(title, { x: 0.6, y: 2.8, w: 10.5, h: 1.2, fontFace: F, fontSize: 30, bold: true, color: WHITE, align: 'left', valign: 'top', margin: 0, isTextBox: true });
  if (sub) s.addText(sub, { x: 0.6, y: 4.1, w: 9.0, h: 0.5, fontFace: F, fontSize: 14, color: WHITE, align: 'left', margin: 0, isTextBox: true });
  addBrandIcon(s, 11.85, 7.08, WHITE);
  return s;
}

function card(slide, x, y, w, h, title, body, style = 'lavender', num = null, titleSize = 12, bodySize = 10.5) {
  const fill = style === 'lavender' ? LAV : WHITE;
  const border = style === 'lavender' ? BLUE : NAVY;
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: border, width: 0.75 }, rectRadius: 0.08, shadow: noShadow() });
  let tx = x + 0.15;
  if (num !== null) {
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.15, y: y + 0.13, w: 0.34, h: 0.34, fill: { color: YELLOW }, line: { type: 'none' }, shadow: noShadow() });
    slide.addText(String(num), { x: x + 0.15, y: y + 0.13, w: 0.34, h: 0.34, fontFace: F, fontSize: 11, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    tx = x + 0.6;
  }
  slide.addText(title, { x: tx, y: y + 0.12, w: w - (tx - x) - 0.15, h: 0.36, fontFace: F, fontSize: titleSize, bold: true, color: BLUE, valign: 'middle', margin: 0, isTextBox: true });
  if (body) slide.addText(body, { x: x + 0.15, y: y + 0.55, w: w - 0.3, h: h - 0.68, fontFace: F, fontSize: bodySize, color: NAVY, valign: 'top', wrap: true, margin: 0, isTextBox: true, paraSpaceAfter: 3 });
}

function sectionLabel(slide, x, y, w, text, color = BLUE) {
  const tc = color === YELLOW ? NAVY : WHITE;
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.35, fill: { color }, line: { type: 'none' }, rectRadius: 0.06, shadow: noShadow() });
  slide.addText(text, { x, y, w, h: 0.35, fontFace: F, fontSize: 11, bold: true, color: tc, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
}

function banner(slide, x, y, w, h, text, tone = 'blue', size = 11.5) {
  const border = tone === 'gold' ? YELLOW : BLUE;
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: LAV }, line: { color: border, width: 1 }, rectRadius: 0.1, shadow: noShadow() });
  slide.addText(text, { x: x + 0.2, y, w: w - 0.4, h, fontFace: F, fontSize: size, color: NAVY, valign: 'middle', align: 'left', margin: 0, isTextBox: true });
}

// Frame + image sized to the image's own aspect ratio at the given width. Returns the height used.
function frameFit(slide, name, x, y, w) {
  const h = w / sizes[name].ratio;
  slide.addShape(pptx.ShapeType.roundRect, { x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16, fill: { color: LAV }, line: { color: BLUE, width: 0.75 }, rectRadius: 0.1, shadow: noShadow() });
  slide.addImage({ path: img(name), x, y, w, h });
  return h;
}

// Brand table: blue header, alternating white / lavender rows, no borders.
function table(slide, x, y, colW, rows, rowH, fontSize = 10) {
  const data = rows.map((r, ri) => r.map(c => ({
    text: c,
    options: ri === 0
      ? { bold: true, color: WHITE, fill: { color: BLUE }, fontFace: F, fontSize, valign: 'middle' }
      : { color: NAVY, fill: { color: ri % 2 === 0 ? LAV : WHITE }, fontFace: F, fontSize, valign: 'middle' }
  })));
  slide.addTable(data, { x, y, w: colW.reduce((a, b) => a + b, 0), colW, rowH, border: { type: 'none' }, margin: 0.07, autoPage: false });
}

function callouts(slide, x, y, w, items, start = 1) {
  let cy = y;
  const cpl = Math.max(20, Math.floor((w - 0.45) * 13.5)); // chars per line at 10.5pt
  items.forEach((it, i) => {
    const n = start + i;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: cy, w: 0.34, h: 0.34, fill: { color: NAVY }, line: { type: 'none' }, shadow: noShadow() });
    slide.addText(String(n), { x, y: cy, w: 0.34, h: 0.34, fontFace: F, fontSize: 11, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    slide.addText(it.t, { x: x + 0.45, y: cy - 0.02, w: w - 0.45, h: 0.36, fontFace: F, fontSize: 12, bold: true, color: BLUE, valign: 'middle', margin: 0, isTextBox: true });
    const lines = Math.ceil(it.b.length / cpl);
    const bh = it.h || (0.19 * lines + 0.06);
    slide.addText(it.b, { x: x + 0.45, y: cy + 0.36, w: w - 0.45, h: bh, fontFace: F, fontSize: 10.5, color: NAVY, valign: 'top', wrap: true, margin: 0, isTextBox: true });
    cy += 0.36 + bh + 0.16;
  });
}

// ---------- 1. cover ----------
{
  pageNo += 1;
  const s = pptx.addSlide();
  s.background = { color: LAV };
  s.addShape(pptx.ShapeType.ellipse, { x: 10.3, y: 4.5, w: 6.0, h: 6.0, fill: { color: NAVY }, line: { type: 'none' }, shadow: noShadow() });
  addLogo(s, 0.8, 1.2, 2.2, 'dark');
  s.addText('Onboarding Powerhouse', { x: 0.8, y: 2.0, w: 4.5, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: NAVY, margin: 0, isTextBox: true });
  s.addText('Sale Agent Code & Reporting Hierarchy', { x: 0.8, y: 2.7, w: 7.6, h: 1.4, fontFace: F, fontSize: 30, bold: true, color: NAVY, valign: 'top', margin: 0, isTextBox: true });
  s.addText('Sales visibility and case attribution for the Bank Portal', { x: 0.8, y: 4.15, w: 7.6, h: 0.5, fontFace: F, fontSize: 18, color: BLUE, margin: 0, isTextBox: true });
  s.addText('Product demo · SMBP V3 Bank Portal · Story AMP-2548 (approved 06/09/2026)', { x: 0.8, y: 4.75, w: 7.6, h: 0.35, fontFace: F, fontSize: 12, color: NAVY, margin: 0, isTextBox: true });
  s.addText('Appro Onboarding Solutions FZ-LLC', { x: 0.8, y: 6.75, w: 5.0, h: 0.3, fontFace: F, fontSize: 11, color: NAVY, margin: 0, isTextBox: true });
  s.addText('07 September 2026', { x: 0.8, y: 7.05, w: 3.0, h: 0.25, fontFace: F, fontSize: 11, color: NAVY, margin: 0, isTextBox: true });
  s.addNotes('Demo of the approved feature: every Sale user carries a Sale Agent Code; applications are tagged to it; enquiry visibility follows the reporting hierarchy; every other department keeps full visibility.');
}

// ---------- 2. section 1 ----------
section('1 · Business Workflow', 'From user setup to reporting, in five steps');

// ---------- 3. workflow ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Business', ' Workflow · from setup to reporting');
  const steps = [
    { actor: 'BANK ADMIN', t: 'Set up the Sale user', b: 'Create the user with Department = Sale, a Sale Agent Code and one or more Reporting Managers. Maker/Checker approves.' },
    { actor: 'CUSTOMER JOURNEY', t: 'Capture the code', b: 'The code travels with the application: the UTM link (sale_agent_code) or the Referral Code pop-up the customer fills in.' },
    { actor: 'SYSTEM · SUBMISSION', t: 'Tag the case', b: 'The latest captured code that matches an active Sale user wins. No match: sales round-robin where a pool exists, otherwise untagged.' },
    { actor: 'SALES STAFF & MANAGERS', t: 'See your own book', b: 'Staff see the cases tagged to them. Managers see their whole reporting subtree, at any depth, in real time.' },
    { actor: 'OPERATIONS & OTHERS', t: 'Run the bank as today', b: 'Every department outside Sale keeps full visibility, untagged cases included. Reports and exports follow the same scope.' },
  ];
  const w = 2.05, gap = 0.2, y = 1.2, h = 2.5;
  steps.forEach((st, i) => {
    const x = 0.5 + i * (w + gap);
    s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: LAV }, line: { color: BLUE, width: 0.75 }, rectRadius: 0.1, shadow: noShadow() });
    s.addShape(pptx.ShapeType.ellipse, { x: x + 0.15, y: y + 0.15, w: 0.38, h: 0.38, fill: { color: BLUE }, line: { type: 'none' }, shadow: noShadow() });
    s.addText(String(i + 1), { x: x + 0.15, y: y + 0.15, w: 0.38, h: 0.38, fontFace: F, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText(st.actor, { x: x + 0.6, y: y + 0.15, w: w - 0.7, h: 0.38, fontFace: F, fontSize: 7.5, bold: true, color: BLUE, valign: 'middle', margin: 0, isTextBox: true, charSpacing: 1 });
    s.addText(st.t, { x: x + 0.15, y: y + 0.62, w: w - 0.3, h: 0.36, fontFace: F, fontSize: 12.5, bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(st.b, { x: x + 0.15, y: y + 1.0, w: w - 0.3, h: h - 1.1, fontFace: F, fontSize: 10, color: NAVY, valign: 'top', wrap: true, margin: 0, isTextBox: true });
    if (i < steps.length - 1) s.addText('›', { x: x + w - 0.02, y: y + h / 2 - 0.3, w: gap + 0.04, h: 0.6, fontFace: F, fontSize: 24, bold: true, color: BLUE, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  });
  banner(s, 0.5, 3.95, 12.3, 0.75, 'The rule behind it: Department = Sale switches everything on. Sale users get a Sale Agent Code and Reporting Manager; every other department keeps full visibility through the permissions it already has. No new permission, no migration grant.', 'gold');
  const rules = [
    { t: 'Maker/Checker on every change', b: 'Sale Agent Code and Reporting Manager follow the standard flow; uniqueness and cycle checks re-run at Checker approval.' },
    { t: 'Tag set once, audited', b: 'Attribution is fixed at submission and never reassigned. Raw value, resolved code and source are stored with each application.' },
    { t: 'Same scope everywhere', b: 'Application Enquiry, Report Enquiry and exports apply the same pre-filter before every other filter.' },
  ];
  rules.forEach((r, i) => card(s, 0.5 + i * 4.15, 4.95, 3.9, 1.6, r.t, r.b, 'white'));
  s.addNotes('Walk the five steps left to right. The yellow banner is the design principle the CPO asked for: department-driven, no new permission.');
}

// ---------- 4. who sees what ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Who Sees', ' What · visibility by role');
  table(s, 0.5, 1.2, [1.7, 1.1, 2.4, 2.5], [
    ['Role', 'Department', 'Application Enquiry & Report Enquiry', 'What changes for them'],
    ['Sales staff', 'Sale', 'Own tagged applications only', 'Own book of business; IM005 "No results found" until the first tagged case'],
    ['Sales manager', 'Sale', 'Own cases plus every user in the reporting subtree, unlimited depth', 'Several managers per user are allowed; each manager sees the user\'s cases; updates in real time'],
    ['Operations, Credit, Admin, others', 'Any other', 'All applications, including untagged ones', 'Nothing: the existing View permission applies, no new permission, no migration grant'],
  ], [0.45, 0.85, 1.0, 0.95], 10.5);
  // org chart (kept left of the navy corner circle)
  const cx = 8.5, cw = RIGHT_TOP - 8.5;
  sectionLabel(s, cx, 1.2, cw, 'Reporting hierarchy, unlimited depth', BLUE);
  const nodeW = 1.5, nodeH = 0.44, r1 = 1.9, r2 = 3.3, xL = 8.5, xR = 10.3;
  const nodes = [
    { n: 'Jane Smith · Manager', x: xL, y: r1, sale: true },
    { n: 'John Doe · Manager', x: xR, y: r1, sale: true },
    { n: 'Alice Rahman · Staff', x: xL, y: r2, sale: true },
    { n: 'Khalid · Credit Ops', x: xR, y: r2, sale: false },
  ];
  // connectors first, nodes on top
  s.addShape(pptx.ShapeType.line, { x: xL + nodeW / 2, y: r1 + nodeH, w: 0, h: r2 - r1 - nodeH, line: { color: BLUE, width: 1.5 } });
  s.addShape(pptx.ShapeType.line, { x: xL + nodeW / 2, y: r1 + nodeH, w: xR - xL, h: r2 - r1 - nodeH, flipH: true, line: { color: BLUE, width: 1.5, dashType: 'dash' } });
  nodes.forEach(o => {
    s.addShape(pptx.ShapeType.roundRect, { x: o.x, y: o.y, w: nodeW, h: nodeH, fill: { color: o.sale ? LAV : WHITE }, line: { color: o.sale ? BLUE : NAVY, width: 0.75 }, rectRadius: 0.1, shadow: noShadow() });
    s.addText(o.n, { x: o.x, y: o.y, w: nodeW, h: nodeH, fontFace: F, fontSize: 9.5, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  });
  s.addText('Alice reports to Jane (solid) and to John (dashed): both see her cases. Khalid is in Credit Operations, has no code and sees everything.', { x: cx, y: 3.95, w: cw, h: 0.8, fontFace: F, fontSize: 10, color: NAVY, valign: 'top', wrap: true, margin: 0, isTextBox: true });
  banner(s, 0.5, 4.95, 12.3, 0.8, 'Visibility scope (Department, Sale Agent Code, reporting subtree) is evaluated server-side from the user record on every request. A manager change or a department change takes effect on the next request, never on the next login.', 'blue');
  card(s, 0.5, 5.9, 6.0, 1.08, 'Sale staff and managers', 'Pre-filter applied before channel, product, status and search filters, on every enquiry screen.', 'white');
  card(s, 6.8, 5.9, 6.0, 1.08, 'Everyone else', 'Unfiltered, exactly as today. Untagged cases are visible here and only here.', 'white');
  s.addNotes('Three audiences, one rule. Emphasise that operations lose nothing.');
}

// ---------- 5. how a case gets tagged ----------
{
  const s = pptx.addSlide();
  chrome(s, 'How a Case', ' Gets Tagged · three capture points, one rule');
  const mech = [
    { t: 'UTM link', b: 'The bank shares its link with sale_agent_code=STF-042. The Distribution Portal captures it and passes it to the Bank Portal.' },
    { t: 'Referral Code pop-up', b: 'The customer types the code the salesperson gave them. Validated live against active Sale codes; an unknown code can be skipped.' },
    { t: 'Sales round-robin', b: 'No matching code? The Sale user with the lowest count, A to Z tiebreak, per channel and product, where a pool is configured.' },
  ];
  const mw = 3.55, mg = (RIGHT_TOP - 0.5 - 3 * mw) / 2;
  mech.forEach((m, i) => card(s, 0.5 + i * (mw + mg), 1.2, mw, 1.85, m.t, m.b, 'lavender', i + 1, 13, 11));
  banner(s, 0.5, 3.3, 12.3, 0.8, 'Precedence: the latest captured value that matches an active Sale Agent Code wins (canonical key, case- and separator-insensitive). Still no match: the case stays untagged, visible to non-Sale users, and ops receive an alert (ET51 pattern).', 'gold');
  const rules = [
    { t: 'Immutable after submission', b: 'No reassignment function. The tag survives deactivation and department changes, so history always resolves.' },
    { t: 'Every capture audited', b: 'Raw value, resolved code, source (UTM / Pop-up / Round-robin / Backfill) and timestamp are stored with the application.' },
    { t: 'Optional by design', b: 'Both codes are optional, so not every application carries a code. Untagged cases are normal, not errors.' },
  ];
  rules.forEach((r, i) => card(s, 0.5 + i * 4.15, 4.35, 3.9, 1.55, r.t, r.b, 'white'));
  s.addText('Go-live: historical applications whose stored referral code matches an active Sale Agent Code are tagged once (source = Backfill, audited). Nothing else is touched.', { x: 0.5, y: 6.1, w: 12.3, h: 0.6, fontFace: F, fontSize: 10.5, italic: true, color: NAVY, valign: 'top', wrap: true, margin: 0, isTextBox: true });
  s.addNotes('Three capture points feed one attribution rule. Stress "latest matching value wins" and that untagged cases are a normal outcome.');
}

// ---------- 6. section 2 ----------
section('2 · Screens & Features', 'Portal-faithful wireframes of the approved story');

const CX = 8.5, CW = RIGHT_TOP - 8.5; // callout column, clear of the corner circle

// ---------- 7. add / edit user ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Add / Edit', ' User · Sale-only fields');
  const h = frameFit(s, 'w1', 0.55, 1.25, 7.55);
  table(s, 0.55, 1.25 + h + 0.3, [1.55, 1.35, 1.55, 3.1], [
    ['Field', 'Type', 'Mandatory', 'Rules'],
    ['Sale Agent Code', 'Text input, 1–24 characters', 'Yes when Department = Sale', 'Unique in the bank (IEM001), matched on a canonical key, read-only once approved; a mistake is corrected by deactivating and re-creating the user'],
    ['Reporting Manager', 'Searchable multi-select', 'No', 'Active Sale users only, never yourself, no circular chain at any depth (IEM002); visibility recalculates on the next request'],
  ], [0.4, 0.95, 0.85], 10);
  callouts(s, CX, 1.2, CW, [
    { t: 'Shown only when Department = Sale', b: 'Any other department never sees the two fields; those users keep full visibility.' },
    { t: 'Sale Agent Code', b: 'The bank\'s own Sales Code / Agent Code / Employee ID. Free text, unique in the bank, read-only once approved.' },
    { t: 'Reporting Manager, one or more', b: 'Multi-select of active Sale users. A circular chain is blocked at any depth.' },
    { t: 'Bank-grade control', b: 'Every change is a Maker/Checker request; uniqueness, format and cycle checks re-run at approval.' },
  ]);
  s.addNotes('Wireframe on the live portal layout. Point out the lock on the code and the multi-select manager field.');
}

// ---------- 8. list + details ----------
{
  const s = pptx.addSlide();
  chrome(s, 'User List', ' & Details · new columns, same screens');
  const h1 = frameFit(s, 'w3', 0.55, 1.25, 7.0);
  frameFit(s, 'w2', 0.55, 1.25 + h1 + 0.3, 7.0);
  callouts(s, CX, 1.2, CW, [
    { t: 'Two new columns', b: 'Sale Agent Code and Reporting Manager after Department: sortable, in the filter panel, in the search scope and in the export.' },
    { t: 'Non-Sale users show "—"', b: 'They keep seeing every application through the permissions they already have.' },
    { t: 'Read-only details', b: 'View Details shows the code and the manager list, comma-separated; "None" when empty.' },
    { t: 'Two managers, one user', b: 'Alice Rahman reports to Jane Smith and John Doe; both managers see her cases.' },
  ]);
  s.addNotes('Same screens the admins use today, two columns richer.');
}

// ---------- 9. application enquiry ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Application', ' Enquiry · the manager view');
  const h = frameFit(s, 'w4', 0.55, 1.25, 7.55);
  table(s, 0.55, 1.25 + h + 0.3, [2.35, 1.6, 1.8, 1.8], [
    ['Screen', 'Sales staff', 'Sales manager', 'Other departments'],
    ['Application Enquiry (ACP-226/227)', 'Own tagged cases', 'Own + subtree, unlimited depth', 'All rows, untagged included'],
    ['Report Enquiry + exports (ACP-230, 265/266/268)', 'Own tagged cases', 'Own + subtree', 'All rows, unfiltered'],
    ['Sale Staff column and detail field', 'ON by default', 'ON by default', 'ON by default; "—" for untagged'],
  ], [0.4, 0.6, 0.6, 0.6], 10);
  callouts(s, CX, 1.2, CW, [
    { t: 'Pre-filter first', b: 'The visibility rule runs before channel, product, status and search filters. Default filters are identical for everyone.' },
    { t: 'Sale Staff column', b: 'ON by default for every user through Customize Table; the code itself is available as a column too.' },
    { t: 'Manager sees the subtree', b: 'Jane Smith sees her own cases and Alice Rahman\'s: 3 of 7 rows. Unlimited depth, real time.' },
    { t: 'Untagged shows "—"', b: 'Visible to non-Sale users only. Report Enquiry and exports follow the same scope.' },
  ]);
  s.addNotes('The scope pill at the top of the wireframe explains what the logged-in manager sees.');
}

// ---------- 10. details + checker ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Details', ' & Checker · audit and approval');
  const ha = frameFit(s, 'w5', 0.55, 1.25, 3.65);
  const hb = frameFit(s, 'w6', 4.45, 1.25, 3.65);
  const by = 1.25 + Math.max(ha, hb) + 0.35;
  banner(s, 0.55, by, 7.55, 0.8, 'First audit-trail entry, written at submission: "Assigned to [Staff Name] via [UTM / Pop-up / Round-robin / Backfill]" with the Sale Agent Code and the time.', 'gold', 10.5);
  const cw3 = (7.55 - 0.4) / 3, cy = by + 1.05;
  card(s, 0.55, cy, cw3, 1.7, 'Raw value received', 'Exactly as typed in the pop-up or carried in the link.', 'white');
  card(s, 0.55 + cw3 + 0.2, cy, cw3, 1.7, 'Resolved Sale Agent Code', 'Matched on the canonical key against active Sale users.', 'white');
  card(s, 0.55 + 2 * (cw3 + 0.2), cy, cw3, 1.7, 'Source and timestamp', 'UTM, Pop-up, Round-robin or Backfill, and when it was captured.', 'white');
  callouts(s, CX, 1.2, CW, [
    { t: 'Sale Staff on the case', b: 'Full name and code on Application Details; the first audit-trail entry records who was assigned, how, and when.' },
    { t: 'Source you can trust', b: 'UTM, Pop-up, Round-robin or Backfill is stored next to the raw value received.' },
    { t: 'Old / new comparison', b: 'Checker Detail shows the code and the manager list before and after, first-time assignments included.' },
    { t: 'Approve re-validates', b: 'IEM001 and IEM002 run again at approval, so two concurrent requests cannot land a duplicate or a cycle.' },
  ]);
  s.addNotes('Left: what a sales manager or ops user sees on the case. Right: what the Checker approves.');
}

// ---------- 11. pop-up + guardrails ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Customer', ' Pop-up & Guardrails');
  const iw = 3.6, gap = (RIGHT_TOP - 0.55 - 3 * iw) / 2;
  const xs = [0.55, 0.55 + iw + gap, 0.55 + 2 * (iw + gap)];
  const hs = ['w7', 'w8', 'w9'].map((n, i) => frameFit(s, n, xs[i], 1.25, iw));
  const cy = 1.25 + Math.max(...hs) + 0.4;
  card(s, xs[0], cy, iw, 2.1, 'Referral Code pop-up', 'The customer enters the code the salesperson gave them. Validated live; an unknown code can be skipped. The latest matching code wins at submission.', 'white', 1);
  card(s, xs[1], cy, iw, 2.1, 'Lifecycle guardrails', 'A manager cannot leave Sale or be deactivated while active Sale users report to them (IEM003). Deactivating staff is allowed; their cases keep the tag.', 'white', 2);
  card(s, xs[2], cy, iw, 2.1, 'Ops alert on unmatched codes', 'A typo or a leaver\'s code never fails silently: ops receive the code, the application reference and the timestamp (ET51 pattern).', 'white', 3);
  banner(s, 0.55, cy + 2.4, RIGHT_TOP - 0.55, 0.75, 'Every edge is audited: pop-up captures carry source and timestamp, lifecycle changes go through Maker/Checker, and alerts name the code, the application reference and the time received.', 'blue', 11);
  s.addNotes('Customer side, admin side, operations side: the three edges of the feature.');
}

// ---------- 12. section 3 ----------
section('3 · Why It Sells', 'Six things a bank gets on day one');

// ---------- 13. best selling points ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Best Selling', ' Points · what a bank gets');
  s.addText('Six things a bank gets on day one. Every proof line below comes straight from the approved acceptance criteria of AMP-2548.', { x: 0.5, y: 1.2, w: RIGHT_TOP - 0.5, h: 0.7, fontFace: F, fontSize: 12.5, color: NAVY, valign: 'middle', wrap: true, margin: 0, isTextBox: true });
  const pts = [
    { t: 'One code, end to end', b: 'The bank\'s own Sale Agent Code on the user record, in the UTM link, in the customer pop-up and on the application. No mapping tables, no second identifier.' },
    { t: 'Switch it on by department', b: 'Department = Sale drives the fields, the filters and the round-robin pool. No new permission, no role rework, no migration grant.' },
    { t: 'Hierarchy without limits', b: 'Unlimited depth, several managers per user, real time when the org chart changes. A regional head sees every level below.' },
    { t: 'Attribution you can audit', b: 'Every capture is logged with its source and timestamp; the tag is immutable once submitted, so sales credit never moves silently.' },
    { t: 'Operations never lose sight', b: 'Every other department keeps full visibility, untagged cases included, and a typo\'d link raises an alert instead of a lost lead.' },
    { t: 'Bank-grade control', b: 'Maker/Checker on every change, uniqueness and cycle checks re-run at approval, scope evaluated server-side on every request.' },
  ];
  pts.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    card(s, 0.5 + col * 4.15, 2.15 + row * 2.45, 3.9, 2.2, p.t, p.b, 'lavender', i + 1, 13, 11.5);
  });
  s.addNotes('Lead with the benefit on each card; the proof line underneath comes straight from the approved acceptance criteria.');
}

// ---------- 14. go-live readiness ----------
{
  const s = pptx.addSlide();
  chrome(s, 'Go-Live', ' Readiness · data, dependencies, next steps');
  const w = 5.5, xL = 0.5, xR = RIGHT_TOP - w;
  sectionLabel(s, xL, 1.2, w, 'Day-one data', BLUE);
  card(s, xL, 1.7, w, 1.45, 'Existing Sale users', 'Get their Sale Agent Code through Edit User (Maker/Checker) at go-live; until then they see no applications (IM005).', 'white');
  card(s, xL, 3.3, w, 1.45, 'Historical applications', 'One-off backfill: cases whose stored referral code matches an active Sale Agent Code are tagged (source = Backfill, audited). No round-robin backfill.', 'white');
  card(s, xL, 4.9, w, 1.45, 'Everything else', 'Stays visible to non-Sale users exactly as today. Reports, exports and queues are untouched.', 'white');
  sectionLabel(s, xR, 1.2, w, 'Dependencies to close', YELLOW);
  card(s, xR, 1.7, w, 1.45, 'Distribution Portal parameter', 'sale_agent_code added to the Super Admin-configurable UTM parameter list: one name, case-sensitive, across every channel and product.', 'lavender');
  card(s, xR, 3.3, w, 1.45, 'Notification audit', 'Review every template that mails the assigned staff member and decide where the Reporting Manager is copied (separate ticket).', 'lavender');
  card(s, xR, 4.9, w, 1.45, 'Mockup and messages', 'Mockup labels move to "Sale Agent Code"; IEM001 to IEM003 and IEM005 confirmed unused in the message registry.', 'lavender');
  s.addNotes('Two tickets to raise before development starts; the rest is configuration.');
}

// ---------- 15. closing ----------
{
  pageNo += 1;
  const s = pptx.addSlide();
  s.background = { color: LAV };
  s.addShape(pptx.ShapeType.ellipse, { x: 10.3, y: 4.5, w: 6.0, h: 6.0, fill: { color: NAVY }, line: { type: 'none' }, shadow: noShadow() });
  s.addText('Thank you', { x: 1.5, y: 2.5, w: 6.0, h: 1.2, fontFace: F, fontSize: 36, bold: true, color: NAVY, margin: 0, isTextBox: true });
  s.addText('You Choose It, We Approve It.', { x: 1.5, y: 3.7, w: 6.0, h: 0.5, fontFace: F, fontSize: 16, color: BLUE, margin: 0, isTextBox: true });
  addLogo(s, 1.5, 4.8, 2.0, 'dark');
  s.addText('This is not a legally binding document. Highly confidential — not to be shared without written consent.', { x: 1.5, y: 7.2, w: 10.0, h: 0.2, fontFace: F, fontSize: 7, color: NAVY, align: 'center', margin: 0, isTextBox: true });
}

const out = path.join(__dirname, 'AMP-2548-Sale-Agent-Code-Demo.pptx');
pptx.writeFile({ fileName: out }).then(() => console.log('wrote', out, 'slides:', pageNo, 'logo:', LOGO ? 'official' : 'stand-in'));
