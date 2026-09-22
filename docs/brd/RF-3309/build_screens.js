// RF-3309 — Credit Queue: Employer Name edit with ALOC & Rule Engine re-run
// Builds the ec*.html composites (over real UAT captures) and renders the SC PNGs.
// Usage:  cd docs/brd/RF-3309 && node build_screens.js
'use strict';
const fs = require('fs');
const path = require('path');

const FONT = [400, 500, 600, 700].map(w =>
  `@font-face{font-family:'Plus Jakarta Sans';font-weight:${w};src:url('fonts/plus-jakarta-sans-latin-${w}-normal.woff2') format('woff2');}`
).join('\n');

const CHEV = (col = '#868687') => `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`;
const TICK = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none"><polyline points="4,8.8 7.2,12 13,5.8" stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PENCIL = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#008AAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

// ---------- shared: Credit Queue application view (base = SC6 composite of the real queue capture) ----------
const CQ_BASE_CSS = `
html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;background:#fff;}
body{position:relative;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;color:#404345;}
.base{position:absolute;left:0;top:0;width:1920px;height:1080px;display:block;}
.crumbpatch{position:absolute;left:156px;top:62px;width:420px;height:24px;background:#FFF;}
.crumb{position:absolute;left:163px;top:64px;height:22px;font-size:13px;font-weight:500;color:#73787B;display:flex;align-items:center;gap:9px;line-height:1;}
.crumb .on{color:#008AAB;font-weight:600;}
.hbtn{position:absolute;top:33px;height:46px;box-sizing:border-box;border:1px solid #008AAB;border-radius:6px;background:#FFF;color:#008AAB;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 22px;}
.statpatch{position:absolute;left:928px;top:273px;width:300px;height:24px;background:#FFF;}
.statval{position:absolute;left:933px;top:279px;color:#404345;font-size:13px;font-weight:700;-webkit-text-stroke:0.3px #404345;line-height:1;white-space:pre;}
.cmtpatch{position:absolute;left:1352px;top:558px;width:534px;height:420px;background:#FFF;}
.bar{position:absolute;left:0;bottom:0;width:1920px;height:72px;background:#FFF;border-top:1px solid #E5E5E5;box-sizing:border-box;}
.btn{position:absolute;bottom:11.5px;height:49px;box-sizing:border-box;border-radius:6px;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 26px 3.5px;}
.btn-reject{border:1px solid #D8092E;background:#FFF;color:#D8092E;right:395px;}
.btn-override{border:1px solid #008AAB;background:#FFF;color:#008AAB;right:245px;}
.btn-send{background:#008AAB;color:#FFF;right:42.5px;}
.annot{position:absolute;border:3px solid #FF5500;border-radius:8px;box-sizing:border-box;}
`;
const CQ_BASE_HTML = (extra = '') => `
<img class="base" src="../SC6_Revert_Queue_Approve_Reject.png">
<div class="crumbpatch"></div>
<div class="crumb"><span>Queue</span>${CHEV()}<span>Credit Queue L1</span>${CHEV()}<span class="on">Application Details</span></div>
<div class="hbtn" style="right:212px;">FTS Retrigger</div>
<div class="hbtn" style="right:42px;">${PENCIL}Edit</div>
<div class="statpatch"></div><div class="statval">: AWAITING CREDIT APPROVAL</div>
<div class="cmtpatch"></div>
<div class="bar"></div>
<div class="btn btn-reject">Reject</div>
<div class="btn btn-override">Override</div>
<div class="btn btn-send">Send Application</div>
${extra}`;

// ---------- SC2: Credit Queue application details with Edit button ----------
const ec2 = `<!doctype html><html><head><meta charset="utf-8"><title>ec2</title><style>${FONT}${CQ_BASE_CSS}</style></head><body>
${CQ_BASE_HTML(`<div class="annot" style="left:1690px;top:24px;width:200px;height:64px;"></div>`)}
</body></html>`;

// ---------- SC3: Edit Application pop-up with the new Employer Name section ----------
const MODAL_CSS = `
.dim{position:absolute;left:0;top:0;width:1920px;height:1080px;background:rgba(0,23,38,0.55);}
.modal{position:absolute;left:470px;top:38px;width:980px;height:1004px;background:#F6FCFF;border-radius:20px;box-shadow:0 6px 24px rgba(0,0,0,.4);box-sizing:border-box;padding:30px 36px;}
.mt{font-size:22px;font-weight:700;color:#001726;}
.mx{position:absolute;right:30px;top:24px;font-size:26px;color:#73787B;font-weight:400;}
.sec{margin-top:10px;height:40px;border-radius:8px;background:#E6F3F7;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:14.5px;font-weight:600;color:#0D0D0D;}
.sec svg{width:15px;height:9px;}
.sec.open{background:#008AAB;color:#FFF;}
.body{background:#FFF;border:1px solid #E3E8EB;border-top:none;border-radius:0 0 8px 8px;padding:14px 18px 16px;}
.hl{outline:3px solid #FF5500;outline-offset:5px;border-radius:8px;}
.ro{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.ro .k{font-size:11.5px;font-weight:500;color:#73787B;}
.ro .v{margin-top:4px;font-size:13px;font-weight:700;color:#404345;}
.lbl{margin-top:12px;font-size:13.5px;font-weight:500;color:#2F3133;}
.lbl .star{color:#DC3453;font-weight:600;}
.inp{position:relative;margin-top:8px;height:46px;border:1.5px solid #008AAB;border-radius:8px;background:#FFF;display:flex;align-items:center;padding:0 16px;font-size:14px;color:#404345;font-weight:500;}
.inp .caret{position:absolute;left:78px;top:12px;width:1.5px;height:22px;background:#404345;}
.inp .chev{position:absolute;right:14px;top:16px;}
.dd{margin-top:4px;border:1px solid #E3E8EB;border-radius:8px;background:#FFF;box-shadow:0 8px 20px rgba(0,0,0,.10);overflow:hidden;}
.dd .it{height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:13.5px;color:#404345;border-bottom:1px solid #F0F3F5;}
.dd .it.hi{background:#E6F3F7;font-weight:600;}
.dd .it .cat{font-size:11.5px;color:#73787B;font-weight:500;}
.dd .it.oth{color:#008AAB;font-weight:600;border-bottom:none;}
.help{margin-top:8px;font-size:11px;color:#73787B;line-height:1.5;}
.ta{margin-top:8px;height:54px;border:1px solid #E3E8EB;border-radius:8px;background:#FFF;padding:12px 16px;font-size:13.5px;color:#959B9E;}
.note{margin-top:12px;border-radius:8px;background:#FFF7E6;border:1px solid #F5D08A;padding:10px 14px;font-size:12px;color:#7A5A00;line-height:1.5;}
.mbar{position:absolute;left:36px;right:36px;bottom:24px;display:flex;align-items:center;justify-content:flex-end;gap:12px;}
.clr{margin-right:auto;font-size:13.5px;font-weight:600;color:#008AAB;text-decoration:underline;}
.mb{height:49px;border-radius:6px;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 34px;box-sizing:border-box;}
.mb.o{border:1px solid #008AAB;color:#008AAB;background:#FFF;}
.mb.f{background:#008AAB;color:#FFF;}
`;
const chevDown = (c='#0D0D0D') => `<svg viewBox="0 0 17 9" fill="none"><polyline points="1.5,1.5 8.5,7.3 15.5,1.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chevUp = (c='#FFF') => `<svg viewBox="0 0 17 9" fill="none"><polyline points="1.5,7.3 8.5,1.5 15.5,7.3" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ec3 = `<!doctype html><html><head><meta charset="utf-8"><title>ec3</title><style>${FONT}${CQ_BASE_CSS}${MODAL_CSS}</style></head><body>
${CQ_BASE_HTML()}
<div class="dim"></div>
<div class="modal">
  <div class="mt">Edit Application</div><div class="mx">×</div>
  <div class="sec">Details (Limit Assignment)${chevDown()}</div>
  <div class="sec">Application Details (Finalized Income)${chevDown()}</div>
  <div class="sec">Liability Info${chevDown()}</div>
  <div class="sec">Length of Service${chevDown()}</div>
  <div class="sec">Other Income and Expenses${chevDown()}</div>
  <div class="hl">
  <div class="sec open">Employer Name${chevUp()}</div>
  <div class="body">
    <div class="ro">
      <div><div class="k">Current Employer Name (Finalized)</div><div class="v">AL FUTTAIM PRIVATE CO LLC</div></div>
      <div><div class="k">Source</div><div class="v">EFR (Sponsor Name)</div></div>
      <div><div class="k">Current classification</div><div class="v">N-ALOC · Category N-ALOC</div></div>
    </div>
    <div class="lbl">New Employer Name <span class="star">*</span></div>
    <div class="inp">AL FUTT<span class="caret"></span><span class="chev">${chevDown('#73787B')}</span></div>
    <div class="dd">
      <div class="it hi"><span>AL FUTTAIM GROUP LLC</span><span class="cat">Category A · Private · Active</span></div>
      <div class="it"><span>AL FUTTAIM ENGINEERING &amp; TECHNOLOGIES LLC</span><span class="cat">Category B · Private · Active</span></div>
      <div class="it"><span>AL FUTTAIM MOTORS LLC</span><span class="cat">Category A · Private · Active</span></div>
      <div class="it oth"><span>Others — enter the Employer Name manually</span></div>
    </div>
    <div class="help">Type at least 3 characters to search the Empaneled Company list (Master List › Empaneled Companies). Select “Others” if the employer is not in the list, then key in the name (alphabetic characters only, max 200 characters — same validation as the Customer Journey Employer Name field).</div>
    <div class="lbl">Reason for change <span class="star">*</span></div>
    <div class="ta">Enter the reason for changing the Employer Name</div>
  </div>
  </div>
  <div class="note"><b>Note:</b> on Save the system updates the Finalized Employer Name, re-runs the employer classification (ALOC / N-ALOC, MOD / MOI / Pensioner), recalculates the related fields and re-runs the Rule Engine. The application is then routed per the standard routing logic.</div>
  <div class="mbar"><span class="clr">Clear all</span><div class="mb o">Cancel</div><div class="mb f">Save</div></div>
</div>
</body></html>`;

// ---------- SC4: confirmation pop-up ----------
const ec4 = `<!doctype html><html><head><meta charset="utf-8"><title>ec4</title><style>${FONT}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:760px;height:560px}
body{background:#222;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden}
.modal{position:absolute;left:106px;top:49px;width:548px;height:462px;background:#F6FCFF;border-radius:20px;padding:0 35px;box-shadow:0 6px 24px rgba(0,0,0,.4)}
.title{margin-top:34px;text-align:center;font-size:24px;font-weight:700;line-height:36px;color:#001726}
.sub{margin-top:14px;text-align:center;font-size:13.5px;font-weight:400;color:#626567;line-height:20px}
.sub b{color:#404345;font-weight:700}
.div{margin-top:18px;height:3px;background:#F3F7F9;border-radius:2px}
.warn{margin-top:16px;text-align:center;font-size:13px;color:#7A5A00;background:#FFF7E6;border:1px solid #F5D08A;border-radius:8px;padding:12px 14px;line-height:19px}
.buttons{position:absolute;left:35px;right:35px;bottom:36px;display:flex;gap:12px}
.btn{width:233px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600}
.o{border:1.5px solid #9DC7E6;color:#0072BC}.f{background:#0072BC;color:#FFF}
</style></head><body><div class="modal">
<div class="title">Are you sure you want to update this Application?</div>
<div class="sub">Employer Name of <b>APP_RB_10092600001281</b> will change from<br><b>AL FUTTAIM PRIVATE CO LLC</b> to <b>AL FUTTAIM GROUP LLC</b></div>
<div class="div"></div>
<div class="warn">Note that the system will re-run the ALOC classification, auto-recalculate the related fields and then re-run the Rule Engine. Please choose carefully!</div>
<div class="buttons"><div class="btn o">No</div><div class="btn f">Yes</div></div>
</div></body></html>`;

// ---------- SC5: Application Details after update (accordion expanded, toaster) ----------
const AD_CSS = `
.cover{position:absolute;left:147px;top:470px;width:1140px;height:520px;background:#FFF;}
.acc{position:absolute;left:147px;width:1138px;height:50px;border-radius:8px;background:#E6F3F7;display:flex;align-items:center;justify-content:space-between;padding:0 18px;box-sizing:border-box;font-size:16px;font-weight:600;color:#0D0D0D;}
.acc svg{width:15px;height:9px;}
.acc.open{background:#008AAB;color:#FFF;}
.panel{position:absolute;left:147px;top:522px;width:1138px;height:390px;background:#FFF;border:1px solid #E3E8EB;border-top:none;border-radius:0 0 8px 8px;box-sizing:border-box;padding:16px 22px;}
.sub{font-size:13.5px;font-weight:700;color:#008AAB;margin-bottom:10px;}
.grid{display:grid;grid-template-columns:1fr 1fr 1fr;row-gap:16px;column-gap:20px;}
.kv .k{font-size:12px;font-weight:500;color:#73787B;}
.kv .v{margin-top:3px;font-size:13px;font-weight:700;color:#404345;}
.kv.new .v{color:#008AAB;}
.hl{outline:3px solid #FF5500;outline-offset:6px;border-radius:6px;}
.toast{position:absolute;right:42px;top:128px;width:420px;height:56px;background:#FFF;border-left:5px solid #2BB673;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.14);display:flex;align-items:center;padding:0 16px;font-size:13px;font-weight:600;color:#404345;}
`;
const ec5 = `<!doctype html><html><head><meta charset="utf-8"><title>ec5</title><style>${FONT}${CQ_BASE_CSS}${AD_CSS}</style></head><body>
${CQ_BASE_HTML()}
<div class="cover"></div>
<div class="acc open" style="top:474px;">Application Details${chevUp()}</div>
<div class="panel">
  <div class="sub">Employment Information</div>
  <div class="grid">
    <div class="kv"><div class="k">Employment Category</div><div class="v">SALARIED</div></div>
    <div class="kv new hl"><div class="k">Employer Name (Finalized)</div><div class="v">AL FUTTAIM GROUP LLC</div></div>
    <div class="kv new hl"><div class="k">Employer Name Source</div><div class="v">CREDIT USER — edited 22/09/2026 10:42</div></div>
    <div class="kv"><div class="k">Employer Name (EFR Sponsor Name)</div><div class="v">AL FUTTAIM PRIVATE CO LLC</div></div>
    <div class="kv new"><div class="k">ALOC Classification</div><div class="v">ALOC</div></div>
    <div class="kv new"><div class="k">Company Category</div><div class="v">A</div></div>
    <div class="kv new"><div class="k">Sector</div><div class="v">PRIVATE</div></div>
    <div class="kv new"><div class="k">Industry</div><div class="v">WHOLESALE AND RETAIL TRADE, REPAIR OF MOTOR VEHICLES AND MOTORCYCLES</div></div>
    <div class="kv new"><div class="k">Employer Status</div><div class="v">ACTIVE</div></div>
    <div class="kv"><div class="k">MOD / MOI / Pensioner</div><div class="v">0 / 0 / 0</div></div>
    <div class="kv"><div class="k">Finalized Length of Service (months)</div><div class="v">38</div></div>
    <div class="kv"><div class="k">HR Contact Person (Name)</div><div class="v">HR SHARED SERVICES</div></div>
  </div>
</div>
<div class="acc" style="top:922px;">Liability Info${chevDown()}</div>
<div class="toast">✓&nbsp; Application “APP_RB_10092600001281” is updated successfully!</div>
</body></html>`;

// ---------- SC6: Application Enquiry history with the Edit Information step ----------
const AE_CSS = `
html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;background:#fff;}
body{position:relative;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;color:#404345;}
.base{position:absolute;left:0;top:0;width:1920px;height:1080px;display:block;}
.statpatch{position:absolute;left:1500px;top:220px;width:300px;height:24px;background:#FFF;}
.statval{position:absolute;left:1500px;top:224px;font-size:13px;font-weight:700;color:#404345;-webkit-text-stroke:0.3px #404345;white-space:pre;}
.tcover{position:absolute;left:147px;top:481px;width:1140px;height:530px;background:#FFF;}
.row{position:absolute;left:147px;width:1138px;height:75px;display:flex;align-items:center;font-size:12.2px;color:#404345;}
.row.odd{background:#F5FDFF;}
.row span{position:absolute;line-height:1.45;}
.c0{left:17px;} .c1{left:71px;width:130px;} .c2{left:224px;} .c3{left:394px;} .c4{left:565px;width:245px;} .c5{left:827px;width:140px;} .c6{left:977px;} .c7{left:1076px;width:60px;word-break:break-all;}
.bar{position:absolute;left:0;bottom:0;width:1920px;height:72px;background:#FFF;border-top:1px solid #E5E5E5;box-sizing:border-box;}
.btn{position:absolute;bottom:11.5px;height:49px;box-sizing:border-box;border-radius:6px;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 26px 3.5px;border:1px solid #008AAB;color:#008AAB;background:#FFF;right:42.5px;}
.annot{position:absolute;border:3px solid #FF5500;border-radius:8px;box-sizing:border-box;}
`;
const rows = [
  ['20','Rule Engine Execution','22/09/2026 09:58:41','22/09/2026 09:58:44','Successful','Awaiting Credit Approval','Successful','System',false],
  ['21','Drop to Credit Queue','22/09/2026 09:58:44','22/09/2026 09:58:44','Different Employer Name than value from EFR','Awaiting Credit Approval','Successful','System',true],
  ['22','Edit Information','22/09/2026 10:42:10','22/09/2026 10:42:10','Employer Name updated from "AL FUTTAIM PRIVATE CO LLC" to "AL FUTTAIM GROUP LLC". Classification: N-ALOC → ALOC (Category A)','Awaiting Credit Approval','Successful','feras.matar@reembank.ae',false],
  ['23','Rule Engine Execution','22/09/2026 10:42:12','22/09/2026 10:42:15','Successful','Awaiting Credit Approval','Successful','System',true],
  ['24','Limit Assignment','22/09/2026 10:42:15','22/09/2026 10:42:16','Approved Limit Amount recalculated','Awaiting Credit Approval','Successful','System',false],
];
const ec6 = `<!doctype html><html><head><meta charset="utf-8"><title>ec6</title><style>${FONT}${AE_CSS}</style></head><body>
<img class="base" src="../SC2_Application_Enquiry_Revert_Button.png">
<div class="statpatch"></div><div class="statval">: AWAITING CREDIT APPROVAL</div>
<div class="tcover"></div>
${rows.map((r,i)=>`<div class="row${r[8]?' odd':''}" style="top:${481+i*75}px;">${r.slice(0,8).map((c,j)=>`<span class="c${j}">${c}</span>`).join('')}</div>`).join('\n')}
<div class="bar"></div><div class="btn">Cancel Application</div>
<div class="annot" style="left:147px;top:631px;width:1138px;height:75px;"></div>
</body></html>`;

// ---------- SC1: Role Management › Manually Queue › Credit Queue L1 — new Edit Employer Name permission ----------
const RM_CSS = `
html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;background:#fff;}
body{position:relative;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;}
.base{position:absolute;left:0;top:0;width:1920px;height:1080px;display:block;}
.cover{position:absolute;left:158px;top:280px;width:1723px;height:610px;background:#FFF;}
.smenu{position:absolute;left:177px;top:283px;width:282.5px;}
.srow{position:relative;width:282.5px;height:28px;display:flex;align-items:center;}
.srow .t{margin-left:17px;font-size:13px;font-weight:600;color:#0D0D0D;}
.srow svg{position:absolute;right:22px;top:50%;transform:translateY(-50%);}
.srow.sel{background:#008AAB;border-radius:8px;height:30px;}
.srow.sel .t{color:#FFF;}
.sbar{position:absolute;left:452px;top:288px;width:4px;height:112px;border-radius:2px;background:#D5DFE6;}
.cb{position:absolute;width:17px;height:17px;box-sizing:border-box;border-radius:4.5px;background:#008AAB;}
.cb svg{position:absolute;left:0;top:0;}
.lbl{position:absolute;font-size:13.25px;font-weight:400;color:#0D0D0D;line-height:17px;}
.hdiv{position:absolute;left:484px;top:329px;width:1350.5px;height:1.5px;background:#E6F1F8;}
.vdiv{position:absolute;left:923px;top:329px;width:1px;height:490px;background:#E6F1F8;}
.acc{position:absolute;left:177px;width:1681.5px;height:59px;border-radius:8px;background:#E6F1F8;display:flex;align-items:center;}
.acc .t{margin-left:16px;font-size:16.75px;font-weight:600;color:#0D0D0D;}
.acc svg{position:absolute;right:19px;top:50%;transform:translateY(-50%);width:17px;height:9px;}
.annot{position:absolute;border:3px solid #FF5500;border-radius:8px;box-sizing:border-box;}
`;
const perms = ['View Application','Action in Application','Edit Limit Assignment','Edit Finalized Income','Edit Liability Info','Edit Length of Service','Edit Other Income and Expenses','Edit Employer Name','Delete Document','Evaluate Application','Refetch AECB','Retrigger FTS','Download Individual Credit Report'];
const queues = ["Sale Queue L1","Sale Queue L2","Sale Queue L3","Credit Queue L1","Credit Queue L2","Credit Queue L3","Risk Queue L1","Risk Queue L2","Risk Queue L3","Transaction Posting Queue","Disbursement Maker","Disbursement Checker","Compliance Queue L1","Compliance Queue L2","Termination Queue","Revert Queue"];
const permCol = (x, prefix) => perms.map((p,i)=>`<div class="cb" style="left:${x}px;top:${349.5+i*36}px;">${TICK}</div><div class="lbl" style="left:${x+37.5}px;top:${348+i*36}px;">[${prefix}] ${p}</div>`).join('');
const ec1 = `<!doctype html><html><head><meta charset="utf-8"><title>ec1</title><style>${FONT}${RM_CSS}</style></head><body>
<img class="base" src="../SC5_Role_Permission_Revert_Queue.png">
<div class="cover"></div>
<div class="smenu">${queues.map(q=>`<div class="srow${q==='Credit Queue L1'?' sel':''}"><span class="t">${q}</span><svg width="8" height="12" viewBox="0 0 8 12" fill="none"><polyline points="1.5,1.5 6.2,6 1.5,10.5" stroke="${q==='Credit Queue L1'?'#FFF':'#0D0D0D'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`).join('')}</div>
<div class="sbar"></div>
<div class="cb" style="left:486px;top:292.5px;">${TICK}</div><div class="lbl" style="left:523.5px;top:292px;">Select All</div>
<div class="hdiv"></div><div class="vdiv"></div>
${permCol(486,'Credit Card')}
${permCol(967.5,'Personal Loan')}
<div class="acc" style="top:846px;"><span class="t">Users Management</span>${chevDown()}</div>
<div class="annot" style="left:474px;top:592px;width:436px;height:36px;"></div>
<div class="annot" style="left:955px;top:592px;width:436px;height:36px;"></div>
</body></html>`;

// ---------- Flow diagram (draw.io style) ----------
const T = (x,y,lines,fs=11) => lines.map((l,i)=>`<text x="${x}" y="${y+(i-(lines.length-1)/2)*13}" text-anchor="middle" dominant-baseline="central" font-size="${fs}">${l}</text>`).join('');
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
<rect x="170" y="94" width="142" height="72" fill="#fff" stroke="#000"/>${T(241,130,['Credit user opens the','application in Credit','Queue (L1–L3) and','clicks Edit'])}
<rect x="360" y="94" width="142" height="72" fill="#fff" stroke="#000"/>${T(431,130,['Selects the new','Employer Name, enters','the reason and clicks','Save → Yes'])}
<path d="M613,72 L676,130 L613,188 L550,130 Z" fill="#fff" stroke="#000"/>${T(613,130,['Validation','passed?'])}
<ellipse cx="798" cy="130" rx="68" ry="68" fill="#fff2cc" stroke="#d6b656"/>${T(798,130,['System: Finalized','Employer Name = new','value; re-run ALOC /','MOD / MOI classification;','recalculate variables +','Limit Assignment'])}
<ellipse cx="990" cy="130" rx="60" ry="60" fill="#fff2cc" stroke="#d6b656"/>${T(990,130,['Re-run Rule Engine','(published strategies)','+ audit "Edit','Information"','old → new'])}
<path d="M1160,75 L1215,130 L1160,185 L1105,130 Z" fill="#fff" stroke="#000"/>${T(1160,130,['Routing logic','(RF-177)'])}
<ellipse cx="1160" cy="350" rx="55" ry="50" fill="#fff" stroke="#000"/>${T(1160,350,['Stays in Credit','Queue — updated','results displayed'])}
<rect x="1290" y="318" width="100" height="64" fill="#fff" stroke="#000"/>${T(1340,350,['Credit user','decides: Override /','Send / Reject'])}
<rect x="800" y="318" width="160" height="64" fill="#fff" stroke="#000"/>${T(880,350,['Drops to the corresponding','queue (Risk / Compliance /','Sale) — same as any Edit'])}
<ellipse cx="770" cy="350" rx="26" ry="26" fill="#fff" stroke="#000"/><text x="770" y="350" text-anchor="middle" dominant-baseline="central" font-size="12">END</text>
<rect x="540" y="318" width="146" height="64" fill="#fff" stroke="#000"/>${T(613,350,['Inline error (IEM003 /','IEM030 / max length);','nothing saved'])}
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
  ec3: ['SC3_Edit_Application_Popup_Employer_Name', 1920, 1080, ec3],
  ec4: ['SC4_Edit_Employer_Name_Confirmation_Popup', 760, 560, ec4],
  ec5: ['SC5_Application_Details_Employer_Name_Updated', 1920, 1080, ec5],
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
