const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const [,, dir, out, ...names] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1008, height: 100 }, deviceScaleFactor: 2 });
  for (const n of names) {
    await p.goto('file://' + path.join(dir, n + '.html'));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(out, n + '.png'), fullPage: true });
    console.log('rendered', n);
  }
  await b.close();
})();
