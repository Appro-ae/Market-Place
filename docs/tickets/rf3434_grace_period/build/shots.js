// RF-3434 screens: SC1 injects the proposed grace control into the live salary-transfer
// prototype's Customise Offer screen; SC2 composites the field callout onto the real
// Application Enquiry capture. Run:
//   NODE_PATH=/opt/node22/lib/node_modules node shots.js <prototype.html>
const path = require('path');
const { chromium } = require('playwright');

const PROTO = process.argv[2];
const CAP = '/home/user/Market-Place/.claude/skills/rb-knowledge-base/screens/SC2_Application_Enquiry_Revert_Button.png';
const LATO = '/home/user/Market-Place/docs/proposal/manual_cif/build/assets';
const OUT = path.join(__dirname, '..');

(async () => {
  const browser = await chromium.launch();

  // ---------------------------------------------------------------- SC1
  const p1 = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2 });
  await p1.goto('file://' + PROTO);
  await p1.waitForTimeout(500);
  await p1.evaluate(() => {
    __proto.set('ann', 0); __proto.set('addon', 0); __proto.set('cheque', 0);
    __proto.set('profile', 'nosal'); __proto.set('stl', 1);
    const ids = __proto.ids(); __proto.show(ids.indexOf('offer'));
    const card = document.querySelector('#s-offer .card');
    const block = document.createElement('div');
    block.innerHTML = `
      <div class="lbl" style="font-size:15px;color:var(--navy)">Grace period (optional)</div>
      <div class="sliderbox" style="padding:10px 14px 8px;outline:3px solid #FF5500;outline-offset:3px;border-radius:10px">
        <div class="big" style="margin-bottom:8px">30 Days</div>
        <div class="track"><i style="width:33%"></i><span class="knob" style="left:33%"></span></div>
        <div class="ends"><span>0 days</span><span>90 days</span></div>
      </div>
      <div class="hint" style="margin:8px 2px 8px">First instalment <b>25 Nov 2026</b> — salary date (25th) + grace.
      Grace interest is included in your EMI.</div>`;
    card.appendChild(block);
    const note = document.createElement('div');
    note.setAttribute('style', 'margin:10px 0 0;padding:9px 12px;border:2px solid #FF5500;' +
      'border-radius:8px;font:11.5px/1.45 Lato,sans-serif;color:#1a214d;background:#fff7f2');
    note.innerHTML = '<b style="color:#FF5500">RF-3434</b> · Grace is adjusted HERE only — bounds from the ' +
      'Pricing Matrix, default aligned to the salary credit date; EMI and first instalment recalculate ' +
      'inline. No grace field on the details screen.';
    document.querySelector('#s-offer .body').appendChild(note);
    document.querySelector('#s-offer .body').scrollTop = 99999;
  });
  await p1.waitForTimeout(300);
  await p1.locator('.device').screenshot({ path: path.join(OUT, 'SC1_Offer_Grace_Period.png') });
  console.log('SC1 written');

  // ---------------------------------------------------------------- SC2
  const html = `<!doctype html><meta charset="utf-8"><style>
    @font-face{font-family:Lato;src:url('file://${LATO}/Lato-Regular.ttf')}
    @font-face{font-family:Lato;font-weight:700;src:url('file://${LATO}/Lato-Bold.ttf')}
    @font-face{font-family:Lato;font-weight:900;src:url('file://${LATO}/Lato-Black.ttf')}
    body{margin:0;font-family:Lato,sans-serif}
    #wrap{position:relative;width:1920px;height:1032px;overflow:hidden} /* crops the action bar (old Revert annotation in the base capture) */
    img{width:1920px;display:block}
    .kv{display:flex;justify-content:space-between;gap:16px;padding:7px 2px;border-bottom:1px solid #E5F2F6;font-size:15.5px}
    .kv:last-of-type{border-bottom:none}
    .kv span{color:#003764;font-weight:700}
    .kv b{color:#404345;font-weight:700}
  </style>
  <div id="wrap">
    <img src="file://${CAP}">
    <div style="position:absolute;left:1343px;top:706px;width:536px;height:62px;border:4px solid #FF5500;border-radius:12px"></div>
    <svg style="position:absolute;left:1480px;top:768px" width="140" height="46"><path d="M120 2 L30 40" stroke="#FF5500" stroke-width="3" fill="none"/></svg>
    <div style="position:absolute;left:1020px;top:812px;width:620px;background:#ffffff;border:2.5px solid #FF5500;border-radius:12px;padding:16px 20px 14px;box-shadow:0 10px 30px rgba(0,0,0,.22)">
      <div style="font-size:17px;font-weight:900;color:#003764;margin-bottom:8px">Application Details — add the grace fields <span style="color:#FF5500">(RF-3434)</span></div>
      <div class="kv"><span>Grace Days</span><b>30</b></div>
      <div class="kv"><span>First Instalment Date</span><b>25/11/2026</b></div>
      <div style="font-size:12.5px;color:#73787B;line-height:1.5;margin-top:9px">Grace-based date — must equal the
      Schedule of Charges and the “Validate First Installment Date” audit step.
      Pattern: AMP-4003 · AMP-4055 · AMP-3939 (Limit Assignment shows the default minimum grace used).</div>
    </div>
  </div>`;
  const tmp = path.join(__dirname, '.sc2.html');
  require('fs').writeFileSync(tmp, html);
  const p2 = await browser.newPage({ viewport: { width: 1980, height: 1160 }, deviceScaleFactor: 2 });
  await p2.goto('file://' + tmp);
  await p2.waitForTimeout(400);
  await p2.locator('#wrap').screenshot({ path: path.join(OUT, 'SC2_Portal_Application_Details_Grace.png') });
  console.log('SC2 written');

  await browser.close();
})();
