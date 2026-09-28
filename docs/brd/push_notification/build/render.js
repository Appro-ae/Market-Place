/* Render every BRD figure to assets/.  node build/render.js
 * Fails if a web font or an image did not load, so a fallback-font figure
 * can never slip into the document silently. */
const path = require('path');
const { chromium } = require('playwright');

const HERE = __dirname;
const OUT = path.join(HERE, '..', 'assets');
const FIGS = [
  // [source html, output png, device scale, needs Plus Jakarta Sans]
  ['fig1_overview.html', 'Flow_Push_Notification_End_to_End.png', 2, false],
  ['fig2_previews.html', 'Previews_Push_Notifications.png', 2, false],
  ['fig3_retry.html', 'Flow_Push_Response_and_Retry.png', 2, false],
  ['fig4_reminder.html', 'Timeline_P02_Offer_Expiry_Reminder.png', 2, false],
  ['fig5_audit.html', 'SC1_Audit_Trail_Push_Notification_Step.png', 1, true],   // capture is already 2x
  ['ia_services.html', 'ia_services.png', 2, false],
  ['ia_status.html', 'ia_status.png', 2, true],
  ['cover_hero.html', 'cover_hero.png', 2, false],
];

(async () => {
  const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ executablePath: exe });
  let failed = false;
  for (const [src, out, dpr, pjs] of FIGS) {
    const page = await browser.newPage({ viewport: { width: 800, height: 400 }, deviceScaleFactor: dpr });
    await page.goto('file://' + path.join(HERE, src));
    await page.evaluate(() => document.fonts.ready);
    const size = await page.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight }));
    await page.setViewportSize({ width: size.w, height: size.h });
    const check = await page.evaluate((pjs) => ({
      font: pjs ? document.fonts.check("500 25px 'Plus Jakarta Sans'") : true,
      imgs: [...document.images].every((i) => i.complete && i.naturalWidth > 0),
    }), pjs);
    if (!check.font || !check.imgs) { console.error('FAILED', src, check); failed = true; }
    await page.screenshot({ path: path.join(OUT, out), fullPage: true });
    console.log('rendered', out, `${size.w}x${size.h} @${dpr}x`);
    await page.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
