// STL BRD screens — prototype captures (device frame) + the status-pill figure.
//   NODE_PATH=/opt/node22/lib/node_modules node shots.js <prototype.html>
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const PROTO = process.argv[2];
const A = path.join(__dirname, '..', 'assets');

const SHOTS = [
  { file: 'SC1_Details_Salary_Toggle_FSTL.png', profile: 'nosal', stl: 1, id: 'details', scroll: 300 },
  { file: 'SC2_Details_C2_Nothing_Asked.png', profile: 'sal', stl: 1, id: 'details', scroll: 220 },
  { file: 'SC3_Details_C4_Account_Along_The_Way.png', profile: 'nocasa', stl: 1, id: 'details', scroll: 180 },
  { file: 'SC4_Offer_Grace_Period.png', profile: 'nosal', stl: 1, id: 'offer', scroll: 9999 },
  { file: 'SC5_Letter_Upload.png', profile: 'nosal', stl: 1, id: 'docs', scroll: 0 },
  { file: 'SC6_Account_Opening_Reused_Steps.png', profile: 'nocasa', stl: 1, id: 'acctopen', scroll: 0 },
  { file: 'SC7_Track_Statuses.png', profile: 'nosal', stl: 1, id: 'track', scroll: 120 },
  { file: 'SC8_Details_NSTL_IBAN_Disbursement.png', profile: 'nosal', stl: 0, id: 'details', scroll: 560 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto('file://' + PROTO);
  await page.waitForTimeout(500);
  for (const s of SHOTS) {
    await page.evaluate((s) => {
      __proto.set('ann', 0); __proto.set('addon', 0); __proto.set('cheque', 0);
      __proto.set('profile', s.profile); __proto.set('stl', s.stl);
      const ids = __proto.ids();
      __proto.show(ids.indexOf(s.id));
      const body = document.querySelector('.pane.active .body');
      if (body) body.scrollTop = s.scroll;
    }, s);
    await page.waitForTimeout(250);
    await page.locator('.device').screenshot({ path: path.join(A, s.file) });
    console.log(s.file);
  }

  // ---------------- status pills (portal-styled diagram) ----------------
  const pills = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;font-family:Arial,sans-serif;background:#fff}
    #w{display:flex;align-items:center;gap:0;padding:26px 30px;width:max-content}
    .pill{padding:13px 22px;border-radius:999px;font-size:17px;font-weight:700;color:#fff;background:#008AAB;white-space:nowrap}
    .pill.grey{background:#73787B}.pill.green{background:#1E9E6A}
    .arr{width:34px;height:3px;background:#003764;position:relative;margin:0 4px}
    .arr:after{content:'';position:absolute;right:-1px;top:-5px;border:7px solid transparent;border-left-color:#003764;border-right:0}
    .cap{font-size:12.5px;color:#73787B;text-align:center;margin-top:5px;font-weight:400}
  </style><div id="w">
    <div><div class="pill grey">Approved — offer accepted</div><div class="cap">booking done, funds held</div></div>
    <div class="arr"></div>
    <div><div class="pill">Awaiting STL Letter</div><div class="cap">reminders D7 · D10 · D13 · D26</div></div>
    <div class="arr"></div>
    <div><div class="pill">Awaiting STL Validation</div><div class="cap">Ops check vs application</div></div>
    <div class="arr"></div>
    <div><div class="pill">Awaiting First Salary Credit</div><div class="cap">salary watcher on the Reem account</div></div>
    <div class="arr"></div>
    <div><div class="pill green">Completed</div><div class="cap">funds released / card activated</div></div>
  </div>`;
  const tmp = path.join(__dirname, '.pills.html');
  fs.writeFileSync(tmp, pills);
  const p2 = await browser.newPage({ viewport: { width: 1700, height: 200 }, deviceScaleFactor: 2 });
  await p2.goto('file://' + tmp);
  await p2.waitForTimeout(200);
  await p2.locator('#w').screenshot({ path: path.join(A, 'Flow_STL_Statuses.png') });
  fs.unlinkSync(tmp);
  console.log('Flow_STL_Statuses.png');
  await browser.close();
})();
