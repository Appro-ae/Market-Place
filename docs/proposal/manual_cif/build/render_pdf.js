// deck.html -> .master.pdf (vector, 1280x720px pages = 13.333x7.5in)
//   NODE_PATH=/opt/node22/lib/node_modules node build/render_pdf.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  page.on('requestfailed', r => console.log('request failed:', r.url()));
  await page.goto('file://' + path.join(__dirname, 'deck.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const n = await page.evaluate(() => document.querySelectorAll('.slide').length);
  await page.pdf({
    path: path.join(__dirname, '.master.pdf'),
    printBackground: true,
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log('slides:', n, '-> .master.pdf');
})();
