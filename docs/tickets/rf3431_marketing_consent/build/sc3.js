// RF-3431 AC3 proposal visual: marketing-consent choice displayed in the audit trail.
// Composites the proposed Step Details onto the real Application Enquiry capture.
//   NODE_PATH=/opt/node22/lib/node_modules node sc3.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const CAP = '/home/user/Market-Place/.claude/skills/rb-knowledge-base/screens/SC2_Application_Enquiry_Revert_Button.png';
const LATO = '/home/user/Market-Place/docs/proposal/manual_cif/build/assets';
const OUT = path.join(__dirname, '..');

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:Lato;src:url('file://${LATO}/Lato-Regular.ttf')}
  @font-face{font-family:Lato;font-weight:700;src:url('file://${LATO}/Lato-Bold.ttf')}
  @font-face{font-family:Lato;font-weight:900;src:url('file://${LATO}/Lato-Black.ttf')}
  body{margin:0;font-family:Lato,sans-serif}
  #wrap{position:relative;width:1920px;height:1010px;overflow:hidden}
  img{width:1920px;display:block}
  .row{display:flex;gap:14px;align-items:baseline;padding:6px 2px;border-bottom:1px solid #E5F2F6;font-size:15px}
  .row:last-of-type{border-bottom:none}
  .row i{font-style:normal;flex:0 0 250px;color:#73787B;font-size:13px}
  .row b{color:#003764}
</style>
<div id="wrap">
  <img src="file://${CAP}">
  <!-- ring row 6: Confirm Marketing Consent -->
  <div style="position:absolute;left:76px;top:872px;width:1206px;height:52px;border:4px solid #FF5500;border-radius:10px"></div>
  <svg style="position:absolute;left:600px;top:700px" width="200" height="176"><path d="M60 14 L30 158" stroke="#FF5500" stroke-width="3" fill="none"/></svg>
  <div style="position:absolute;left:330px;top:560px;width:700px;background:#ffffff;border:2.5px solid #FF5500;border-radius:12px;padding:16px 20px 13px;box-shadow:0 10px 30px rgba(0,0,0,.22)">
    <div style="font-size:16.5px;font-weight:900;color:#003764;margin-bottom:7px">Confirm Marketing Consent — write the choice into <u>Step Details</u> <span style="color:#FF5500">(RF-3431 AC3)</span></div>
    <div class="row"><i>Master tick kept (default)</i><b>Marketing consent: Accepted — Email, WhatsApp, SMS · v1.2</b></div>
    <div class="row"><i>Master unticked, channels picked</i><b>Marketing consent: Partial — WhatsApp, SMS · v1.2</b></div>
    <div class="row"><i>Master unticked, none picked</i><b>Marketing consent: Declined — no channels · v1.2</b></div>
    <div style="font-size:12.5px;color:#73787B;line-height:1.5;margin-top:9px">Fixed channel order Email · WhatsApp · SMS; “v1.2” = Marketing Consent version from Collateral Management.
    Today Step Detail is &lt;null&gt; (RF-4 AC1). In the Electronic Audit Trail Report, the Tick / Untick sub-actions name the box —
    Tick (WhatsApp), Untick (Email), Tick (Master) — in ApplicationSubActionHistory (RF-4 AC2).</div>
  </div>
</div>`;

(async () => {
  const tmp = path.join(__dirname, '.sc3.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1980, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto('file://' + tmp);
  await page.waitForTimeout(400);
  await page.locator('#wrap').screenshot({ path: path.join(OUT, 'SC3_Audit_Trail_Marketing_Consent.png') });
  console.log('SC3 written');
  await browser.close();
  fs.unlinkSync(tmp);
})();
