// Render the STL one-pager: PNG (@2x) + single-page PDF (1280x720 CSS page).
//   NODE_PATH=/opt/node22/lib/node_modules node render.js
const path = require('path');
const { chromium } = require('playwright');

const HERE = __dirname;
const OUT = path.join(HERE, '..');
const NAME = 'Appro_RF_Salary_Transfer_Summary_V1.0';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(HERE, 'slide.html'));
  await page.waitForTimeout(600);
  await page.locator('#slide').screenshot({ path: path.join(OUT, NAME + '.png') });
  await page.pdf({ path: path.join(OUT, NAME + '.pdf'), preferCSSPageSize: true, printBackground: true });
  console.log('written', NAME + '.png / .pdf');
  await browser.close();
})();
