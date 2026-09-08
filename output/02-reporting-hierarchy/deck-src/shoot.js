// Screenshot each wireframe block of wire.html at 2x for the deck.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const opts = {};
  if (process.env.CHROME) opts.executablePath = process.env.CHROME;
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(__dirname, 'wire.html'));
  await page.waitForTimeout(600);
  const sizes = {};
  for (const id of ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9']) {
    const el = page.locator('#' + id);
    const box = await el.boundingBox();
    await el.screenshot({ path: path.join(__dirname, id + '.png') });
    sizes[id] = { w: Math.round(box.width), h: Math.round(box.height), ratio: +(box.width / box.height).toFixed(3) };
    console.log(id, sizes[id]);
  }
  fs.writeFileSync(path.join(__dirname, 'sizes.json'), JSON.stringify(sizes, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
