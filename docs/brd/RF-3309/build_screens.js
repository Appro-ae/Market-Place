// RF-3309 — Credit Queue: Employer Name edit with ALOC & Rule Engine re-run
// Builds the ec*.html composites over the RAW UAT captures (base/*.png) and renders the SC PNGs.
// Usage:  cd docs/brd/RF-3309 && node build_screens.js
'use strict';
const fs = require('fs');
const path = require('path');

const FONT = [400, 500, 600, 700].map(w =>
  `@font-face{font-family:'Plus Jakarta Sans';font-weight:${w};src:url('fonts/plus-jakarta-sans-latin-${w}-normal.woff2') format('woff2');}`
).join('\n');

const TICK = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none"><polyline points="4.5,9.8 8,13.4 14.5,6.4" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chevDown = (c = '#0D0D0D') => `<svg viewBox="0 0 17 9" fill="none"><polyline points="1.5,1.5 8.5,7.3 15.5,1.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chevUp = (c = '#008AAB') => `<svg viewBox="0 0 17 9" fill="none"><polyline points="1.5,7.3 8.5,1.5 15.5,7.3" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chevRight = (c = '#0D0D0D') => `<svg width="9" height="16" viewBox="0 0 9 16" fill="none"><polyline points="1.5,1.8 7.2,8 1.5,14.2" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const PAGE_CSS = `
html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;background:#fff;}
body{position:relative;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;color:#404345;}
.base{position:absolute;left:0;top:0;width:1920px;height:1080px;display:block;}
.annot{position:absolute;border:3px solid #FF5500;border-radius:10px;box-sizing:border-box;}
`;

// ---------------------------------------------------------------------------
// SC2 — Credit Queue › Application Details (raw capture 48, annotation only)
// Real screen already carries Edit + FTS Retrigger (top-right) and the
// Send Application / Reject / Override bar — nothing is patched.
// ---------------------------------------------------------------------------
const ec2 = `<!doctype html><html><head><meta charset="utf-8"><title>ec2</title><style>${FONT}${PAGE_CSS}</style></head><body>
<img class="base" src="base/48-queue-application-view.png">
<div class="annot" style="left:1504px;top:26px;width:192px;height:60px;"></div>
</body></html>`;

// ---------------------------------------------------------------------------
// SC3 — Edit Application pop-up with the new Employer Name section
// Base: REAL Edit pop-up capture (CQ-05b), page 1920x1400. The Length of
// Service section + footer are redrawn slightly compressed so the new
// Employer Name section fits before the footer, in the live field-card style.
// ---------------------------------------------------------------------------
const M3_CSS = `
html,body{margin:0;padding:0;width:1920px;height:1400px;overflow:hidden;background:#7F7F7F;}
body{position:relative;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;color:#404345;}
.base{position:absolute;left:0;top:0;width:1920px;height:1400px;display:block;}
.cover{position:absolute;left:192px;top:1030px;width:1536px;height:302px;background:#FFF;}
.ext{position:absolute;left:192px;top:1320px;width:1536px;height:52px;background:#FFF;border-radius:0 0 18px 18px;}
.sec{position:absolute;left:208px;width:1504px;height:48px;border-radius:6px;background:#E6F1F8;display:flex;align-items:center;padding:0 18px;box-sizing:border-box;font-size:15.5px;font-weight:600;color:#1E1F20;}
.card{position:absolute;height:70px;background:#FFF;border:1px solid #D9DADC;border-radius:10px;box-sizing:border-box;padding:11px 17px;}
.card .k{font-size:12.5px;font-weight:700;color:#00809E;}
.card .k .star{color:#D32F2F;}
.card.ro .k{color:#73787B;}
.card .v{margin-top:6px;font-size:13px;font-weight:500;color:#404345;display:flex;align-items:center;gap:8px;}
.card .v .cur{color:#404345;font-weight:600;}
.card .v .sep{color:#C4C6C8;}
.card.on{border:1.5px solid #008AAB;}
.caret{display:inline-block;width:1.5px;height:18px;background:#404345;}
.foot{position:absolute;left:208px;right:208px;top:1312px;height:48px;display:flex;align-items:center;}
.clr{font-size:14px;font-weight:700;color:#008AAB;}
.fb{height:47px;border-radius:24px;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;padding:0 34px;box-sizing:border-box;margin-left:14px;}
.fb.o{border:1px solid #008AAB;color:#008AAB;background:#FFF;}
.fb.f{background:#008AAB;color:#FFF;}
.annot{position:absolute;border:3px solid #FF5500;border-radius:10px;box-sizing:border-box;}
`;
const card3 = (x, w, cls, label, star, inner) =>
  `<div class="card ${cls}" style="left:${x}px;top:1232px;width:${w}px;"><div class="k">${label}${star ? ' <span class="star">*</span>' : ''}</div><div class="v">${inner}</div></div>`;
const ec3 = `<!doctype html><html><head><meta charset="utf-8"><title>ec3</title><style>${FONT}${M3_CSS}</style></head><body>
<img class="base" src="base/CQ-05b-edit-flow-liability.png">
<div class="cover"></div><div class="ext"></div>
<div class="sec" style="top:1036px;">Length of Service</div>
<div class="card" style="left:225px;top:1094px;width:476px;height:68px;"><div class="k">Length Of Service (Months) <span class="star">*</span></div><div class="v">12</div></div>
<div class="sec" style="top:1174px;">Employer Name</div>
${card3(225, 476, 'on', 'Employer Name', true, `AL FUTTAIM GROUP LLC<span class="caret"></span>`)}
${card3(721, 476, 'ro', 'Employer Name Source', false, `EFR (Sponsor Name)`)}
${card3(1217, 494, 'ro', 'Current ALOC Classification', false, `N-ALOC · Category N-ALOC`)}
<div class="foot"><span class="clr" style="margin-right:auto;">Clear All</span><div class="fb o">Cancel</div><div class="fb f">Save</div></div>
<div class="annot" style="left:198px;top:1166px;width:1524px;height:146px;"></div>
</body></html>`;

// ---------------------------------------------------------------------------
// SC4 — confirmation pop-up (real dialog style: white modal, left-aligned
// bold title, pill buttons bottom-right — per the live Override dialog)
// ---------------------------------------------------------------------------
const ec4 = `<!doctype html><html><head><meta charset="utf-8"><title>ec4</title><style>${FONT}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:760px;height:560px}
body{background:#5c5c5c;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden}
.modal{position:absolute;left:80px;top:70px;width:600px;height:420px;background:#FFFFFF;border-radius:16px;padding:34px 38px;box-shadow:0 6px 24px rgba(0,0,0,.4)}
.title{font-size:21px;font-weight:700;line-height:31px;color:#1E1F20}
.sub{margin-top:16px;font-size:13.5px;font-weight:400;color:#626567;line-height:21px}
.sub b{color:#404345;font-weight:700}
.warn{margin-top:18px;font-size:12.5px;color:#7A5A00;background:#FFF7E6;border:1px solid #F5D08A;border-radius:8px;padding:12px 16px;line-height:19px}
.buttons{position:absolute;right:38px;bottom:32px;display:flex;gap:14px}
.btn{height:47px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;padding:0 42px}
.o{border:1px solid #008AAB;color:#008AAB}.f{background:#008AAB;color:#FFF}
</style></head><body><div class="modal">
<div class="title">Are you sure you want to update this Application?</div>
<div class="sub">Employer Name of <b>APP_RB_10092600001281</b> will change from <b>AL FUTTAIM PRIVATE CO LLC</b> to <b>AL FUTTAIM GROUP LLC</b>.</div>
<div class="warn">Note that the system will re-run the ALOC classification, auto-recalculate the related fields and then re-run the Rule Engine. Please choose carefully!</div>
<div class="buttons"><div class="btn o">No</div><div class="btn f">Yes</div></div>
</div></body></html>`;

// ---------------------------------------------------------------------------
// SC5 — Application Details after the update. Base: REAL application view
// with an expanded section (CQ-04f, page 1920x1400). The expanded section is
// redrawn as "Application Details": teal header + white panel with
// "Label : VALUE" rows, exactly the live expanded-accordion design.
// ---------------------------------------------------------------------------
const A5_CSS = `
html,body{margin:0;padding:0;width:1920px;height:1400px;overflow:hidden;background:#fff;}
body{position:relative;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;color:#404345;}
.base{position:absolute;left:0;top:0;width:1920px;height:1400px;display:block;}
.cover{position:absolute;left:140px;top:778px;width:1160px;height:530px;background:#FFF;}
.hdr{position:absolute;left:148px;top:784px;width:1138px;height:64px;border-radius:8px;background:#008AAB;display:flex;align-items:center;justify-content:space-between;padding:0 22px;box-sizing:border-box;font-size:15.5px;font-weight:600;color:#FFF;}
.hdr svg{width:16px;height:9px;}
.rw{position:absolute;left:148px;width:1138px;height:38px;display:flex;align-items:center;font-size:12.5px;color:#404345;}
.rw .l{position:absolute;left:26px;font-weight:400;}
.rw .r{position:absolute;left:462px;font-weight:700;}
.rw .r.new{color:#008AAB;}
.subh{position:absolute;left:174px;font-size:13px;font-weight:700;color:#008AAB;}
.toast{position:absolute;right:46px;top:120px;width:430px;height:54px;background:#FFF;border-left:5px solid #2BB673;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.16);display:flex;align-items:center;padding:0 16px;font-size:12.5px;font-weight:600;color:#404345;line-height:1.4;}
.annot{position:absolute;border:3px solid #FF5500;border-radius:10px;box-sizing:border-box;}
`;
const r5 = (top, l, v, nw) => `<div class="rw" style="top:${top}px;"><span class="l">${l}</span><span class="r${nw ? ' new' : ''}">: ${v}</span></div>`;
const ec5 = `<!doctype html><html><head><meta charset="utf-8"><title>ec5</title><style>${FONT}${A5_CSS}</style></head><body>
<img class="base" src="base/CQ-04f-section-liability-info.png">
<div class="cover"></div>
<div class="hdr">Application Details${chevDown('#FFFFFF')}</div>
${r5(864, 'Employer Name', 'AL FUTTAIM GROUP LLC', true)}
${r5(902, 'Employer Name Source', 'CREDIT USER', true)}
${r5(940, 'ALOC Classification', 'ALOC', true)}
${r5(978, 'Company Category', 'A', true)}
<div class="subh" style="top:1030px;">Employer Name Update</div>
${r5(1056, 'Original Employer Name', 'AL FUTTAIM PRIVATE CO LLC', false)}
${r5(1094, 'Original ALOC Classification', 'N-ALOC · CATEGORY N-ALOC', false)}
${r5(1132, 'Updated Employer Name', 'AL FUTTAIM GROUP LLC', true)}
${r5(1170, 'Updated ALOC Classification', 'ALOC · CATEGORY A', true)}
${r5(1208, 'Updated By', 'FERAS.MATAR@REEMBANK.AE', false)}
${r5(1246, 'Updated On', '22/09/2026 10:42', false)}
<div class="annot" style="left:154px;top:1018px;width:1126px;height:278px;"></div>
<div class="toast">✓&nbsp;&nbsp;Application "APP_RB_10092600001281" is updated successfully!</div>
</body></html>`;

// ---------------------------------------------------------------------------
// SC6 — Application Enquiry history with the Edit Information step (raw 42;
// table rows replaced, status patched to AWAITING CREDIT APPROVAL)
// Real geometry: header ends y482; rows pitch ~74.8; odd rows #F5FDFF;
// columns per the live header positions.
// ---------------------------------------------------------------------------
const AE_CSS = `
.statpatch{position:absolute;left:1488px;top:218px;width:280px;height:28px;background:#FFF;}
.statval{position:absolute;left:1495px;top:225px;font-size:13px;font-weight:700;color:#404345;-webkit-text-stroke:0.3px #404345;white-space:pre;}
.tcover{position:absolute;left:145px;top:483px;width:1160px;height:597px;background:#FFF;}
.row{position:absolute;left:148px;width:1140px;height:74px;font-size:12px;color:#404345;border-bottom:1px solid #F1F2F4;box-sizing:border-box;}
.row.odd{background:#F5FDFF;}
.row span{position:absolute;top:50%;transform:translateY(-50%);line-height:1.5;}
.c0{left:22px;} .c1{left:84px;width:120px;} .c2{left:222px;width:130px;} .c3{left:422px;width:130px;} .c4{left:568px;width:265px;} .c5{left:850px;width:120px;} .c6{left:986px;width:80px;} .c7{left:1085px;width:52px;word-break:break-all;font-size:11px;}
.annot2{position:absolute;border:3px solid #FF5500;border-radius:8px;box-sizing:border-box;}
`;
const rows42 = [
  ['20', 'Rule Engine Execution', '22/09/2026 09:58:41', '22/09/2026 09:58:44', 'Successful', 'Awaiting Credit Approval', 'Successful', 'System', false],
  ['21', 'Drop to Credit Queue', '22/09/2026 09:58:44', '22/09/2026 09:58:44', 'Different Employer Name than value from EFR', 'Awaiting Credit Approval', 'Successful', 'System', true],
  ['22', 'Edit Information', '22/09/2026 10:42:10', '22/09/2026 10:42:10', 'Employer Name updated from "AL FUTTAIM PRIVATE CO LLC" to "AL FUTTAIM GROUP LLC". Classification: N-ALOC → ALOC (Category A)', 'Awaiting Credit Approval', 'Successful', 'feras.matar@reembank.ae', false],
  ['23', 'ALOC Classification', '22/09/2026 10:42:11', '22/09/2026 10:42:12', 'ALOC = 1, Employer Category = A', 'Awaiting Credit Approval', 'Successful', 'System', true],
  ['24', 'Rule Engine Execution', '22/09/2026 10:42:12', '22/09/2026 10:42:15', 'Successful', 'Awaiting Credit Approval', 'Successful', 'System', false],
  ['25', 'Limit Assignment', '22/09/2026 10:42:15', '22/09/2026 10:42:16', 'Approved Limit Amount recalculated', 'Awaiting Credit Approval', 'Successful', 'System', true],
  ['26', 'Routing Logic', '22/09/2026 10:42:16', '22/09/2026 10:42:16', 'Application remains in Credit Queue L1', 'Awaiting Credit Approval', 'Successful', 'System', false],
];
const ec6 = `<!doctype html><html><head><meta charset="utf-8"><title>ec6</title><style>${FONT}${PAGE_CSS}${AE_CSS}</style></head><body>
<img class="base" src="base/42-application-detail.png">
<div class="statpatch"></div><div class="statval">: AWAITING CREDIT APPROVAL</div>
<div class="tcover"></div>
${rows42.map((r, i) => `<div class="row${r[8] ? ' odd' : ''}" style="top:${483 + i * 74}px;">${r.slice(0, 8).map((c, j) => `<span class="c${j}">${c}</span>`).join('')}</div>`).join('\n')}
<div class="annot2" style="left:145px;top:628px;width:1146px;height:80px;"></div>
</body></html>`;

// ---------------------------------------------------------------------------
// SC1 — Role Management › Add Role › Manually Queue › Credit Queue L1
// (raw 43; card interior redrawn following the real Add Role geometry:
// teal expanded bar h55, big submenu pills w283 h50 pitch63, Select All +
// divider, two permission columns with a vertical divider, checkbox 19px)
// ---------------------------------------------------------------------------
const RM_CSS = `
.cover{position:absolute;left:150px;top:100px;width:1734px;height:800px;background:#FFF;}
.bar{position:absolute;left:177px;top:125px;width:1682px;height:55px;border-radius:8px;background:#008AAB;display:flex;align-items:center;justify-content:space-between;padding:0 22px;box-sizing:border-box;font-size:16px;font-weight:600;color:#FFF;}
.bar svg{width:17px;height:9px;}
.srow{position:absolute;left:177px;width:283px;height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;box-sizing:border-box;font-size:14px;font-weight:600;color:#0D0D0D;}
.srow.sel{background:#008AAB;border-radius:8px;color:#FFF;}
.cb{position:absolute;width:19px;height:19px;box-sizing:border-box;border-radius:5px;background:#008AAB;}
.cb svg{position:absolute;left:0;top:0;}
.lbl{position:absolute;font-size:13px;font-weight:400;color:#0D0D0D;line-height:19px;}
.hdiv{position:absolute;left:488px;top:262px;width:1347px;height:1px;background:#E6F3F7;}
.vdiv{position:absolute;left:923px;top:280px;width:1px;height:580px;background:#E6F3F7;}
`;
const permsRM = ['View Application', 'Action in Application', 'Edit Limit Assignment', 'Edit Finalized Income', 'Edit Liability Info', 'Edit Length of Service', 'Edit Other Income and Expenses', 'Edit Employer Name', 'Delete Document', 'Evaluate Application', 'Refetch AECB', 'Retrigger FTS', 'Download Individual Credit Report'];
const queuesRM = ['Credit Queue L1', 'Credit Queue L2', 'Credit Queue L3', 'Risk Queue L1', 'Risk Queue L2', 'Risk Queue L3', 'Transaction Posting Queue', 'Disbursement Maker', 'Disbursement Checker', 'Compliance Queue L1'];
const permColRM = (x, prefix) => permsRM.map((p, i) =>
  `<div class="cb" style="left:${x}px;top:${281 + i * 46}px;">${TICK}</div><div class="lbl" style="left:${x + 34}px;top:${281 + i * 46}px;">[${prefix}] ${p}</div>`).join('\n');
const ec1 = `<!doctype html><html><head><meta charset="utf-8"><title>ec1</title><style>${FONT}${PAGE_CSS}${RM_CSS}</style></head><body>
<img class="base" src="base/43-add-role-permissions-scrolled.png">
<div class="cover"></div>
<div class="bar"><span>Manually Queue</span>${chevUp('#FFFFFF')}</div>
${queuesRM.map((q, i) => `<div class="srow${q === 'Credit Queue L1' ? ' sel' : ''}" style="top:${198 + i * 63}px;"><span>${q}</span>${chevRight(q === 'Credit Queue L1' ? '#FFFFFF' : '#0D0D0D')}</div>`).join('\n')}
<div class="cb" style="left:488px;top:222px;">${TICK}</div><div class="lbl" style="left:522px;top:222px;">Select All</div>
<div class="hdiv"></div><div class="vdiv"></div>
${permColRM(488, 'Credit Card')}
${permColRM(960, 'Personal Loan')}
<div class="annot" style="left:476px;top:596px;width:420px;height:38px;"></div>
<div class="annot" style="left:948px;top:596px;width:420px;height:38px;"></div>
</body></html>`;

// ---------------------------------------------------------------------------
// Flow diagram (draw.io style — unchanged design language)
// ---------------------------------------------------------------------------
const T = (x, y, lines, fs = 11) => lines.map((l, i) => `<text x="${x}" y="${y + (i - (lines.length - 1) / 2) * 13}" text-anchor="middle" dominant-baseline="central" font-size="${fs}">${l}</text>`).join('');
const ecflow = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}text{font-family:Helvetica,Arial,sans-serif;font-size:11px;fill:#000}</style></head><body>
<svg width="1400" height="520" viewBox="0 0 1400 520" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="arr" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="7" refX="11.7" refY="3.25" orient="auto"><path d="M0,0 L12,3.25 L0,6.5 Z" fill="#000"/></marker></defs>
<g stroke="#000" stroke-width="1" fill="none">
<line x1="123" y1="130" x2="170" y2="130" marker-end="url(#arr)"/>
<line x1="312" y1="130" x2="360" y2="130" marker-end="url(#arr)"/>
<line x1="502" y1="130" x2="550" y2="130" marker-end="url(#arr)"/>
<line x1="676" y1="130" x2="730" y2="130" marker-end="url(#arr)"/>
<line x1="866" y1="130" x2="930" y2="130" marker-end="url(#arr)"/>
<line x1="1050" y1="130" x2="1105" y2="130" marker-end="url(#arr)"/>
<line x1="1160" y1="185" x2="1160" y2="300" marker-end="url(#arr)"/>
<line x1="1105" y1="350" x2="960" y2="350" marker-end="url(#arr)"/>
<line x1="1160" y1="400" x2="1160" y2="440" marker-end="url(#arr)"/>
<line x1="1215" y1="350" x2="1290" y2="350" marker-end="url(#arr)"/>
<line x1="800" y1="350" x2="797" y2="350" marker-end="url(#arr)"/>
<path d="M613,188 L613,350" marker-end="url(#arr)"/>
<line x1="613" y1="395" x2="613" y2="440" marker-end="url(#arr)"/>
</g>
<ellipse cx="90" cy="130" rx="33" ry="33" fill="#cdeb8b" stroke="#000"/><text x="90" y="130" text-anchor="middle" dominant-baseline="central" font-size="12">START</text>
<rect x="170" y="94" width="142" height="72" fill="#fff" stroke="#000"/>${T(241, 130, ['Credit user opens the', 'application in Credit', 'Queue (L1–L3) and', 'clicks Edit'])}
<rect x="360" y="94" width="142" height="72" fill="#fff" stroke="#000"/>${T(431, 130, ['Overwrites the pre-', 'populated Employer', 'Name and clicks', 'Save → Yes'])}
<path d="M613,72 L676,130 L613,188 L550,130 Z" fill="#fff" stroke="#000"/>${T(613, 130, ['Validation', 'passed?'])}
<ellipse cx="798" cy="130" rx="68" ry="68" fill="#fff2cc" stroke="#d6b656"/>${T(798, 130, ['System: Finalized', 'Employer Name = new', 'value; re-run ALOC /', 'MOD / MOI classification;', 'recalculate variables +', 'Limit Assignment'])}
<ellipse cx="990" cy="130" rx="60" ry="60" fill="#fff2cc" stroke="#d6b656"/>${T(990, 130, ['Re-run Rule Engine', '(published strategies)', '+ audit "Edit', 'Information"', 'old → new'])}
<path d="M1160,75 L1215,130 L1160,185 L1105,130 Z" fill="#fff" stroke="#000"/>${T(1160, 130, ['Routing logic', '(RF-177)'])}
<ellipse cx="1160" cy="350" rx="55" ry="50" fill="#fff" stroke="#000"/>${T(1160, 350, ['Stays in Credit', 'Queue — updated', 'results displayed'])}
<rect x="1290" y="318" width="100" height="64" fill="#fff" stroke="#000"/>${T(1340, 350, ['Credit user', 'decides: Override /', 'Send / Reject'])}
<rect x="800" y="318" width="160" height="64" fill="#fff" stroke="#000"/>${T(880, 350, ['Drops to the corresponding', 'queue (Risk / Compliance /', 'Sale) — same as any Edit'])}
<ellipse cx="770" cy="350" rx="26" ry="26" fill="#fff" stroke="#000"/><text x="770" y="350" text-anchor="middle" dominant-baseline="central" font-size="12">END</text>
<rect x="540" y="318" width="146" height="64" fill="#fff" stroke="#000"/>${T(613, 350, ['Inline error (IEM003 /', 'IEM030 / max length);', 'nothing saved'])}
<ellipse cx="613" cy="466" rx="26" ry="26" fill="#fff" stroke="#000"/><text x="613" y="466" text-anchor="middle" dominant-baseline="central" font-size="12">END</text>
<ellipse cx="1160" cy="466" rx="26" ry="26" fill="#fff" stroke="#000"/><text x="1160" y="466" text-anchor="middle" dominant-baseline="central" font-size="12">END</text>
<g><rect x="690" y="123" width="34" height="13" fill="#fff"/><text x="707" y="130" text-anchor="middle" dominant-baseline="central">yes</text></g>
<g><rect x="620" y="250" width="22" height="13" fill="#fff"/><text x="631" y="257" text-anchor="middle" dominant-baseline="central">no</text></g>
<g><rect x="1120" y="240" width="80" height="13" fill="#fff"/><text x="1160" y="247" text-anchor="middle" dominant-baseline="central">Credit Queue</text></g>
<g><rect x="985" y="343" width="70" height="13" fill="#fff"/><text x="1020" y="350" text-anchor="middle" dominant-baseline="central">other queue</text></g>
</svg></body></html>`;

const out = {
  ec1: ['SC1_Role_Permission_Credit_Queue_Edit_Employer_Name', 1920, 1080, ec1],
  ec2: ['SC2_Credit_Queue_Application_Details_Edit_Button', 1920, 1080, ec2],
  ec3: ['SC3_Edit_Application_Popup_Employer_Name', 1920, 1400, ec3],
  ec4: ['SC4_Edit_Employer_Name_Confirmation_Popup', 760, 560, ec4],
  ec5: ['SC5_Application_Details_Employer_Name_Updated', 1920, 1400, ec5],
  ec6: ['SC6_Application_Enquiry_History_Edit_Employer_Name', 1920, 1080, ec6],
  ecflow: ['Flow_Edit_Employer_Name', 1400, 520, ecflow],
};
for (const [k, v] of Object.entries(out)) fs.writeFileSync(path.join(__dirname, k + '.html'), v[3]);

(async () => {
  const { chromium } = require(process.env.PW_PATH || 'playwright');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [k, [name, w, h]] of Object.entries(out)) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.goto('file://' + path.join(__dirname, k + '.html'));
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(__dirname, name + '.png') });
    await p.close();
    console.log('rendered', name);
  }
  await b.close();
})();
