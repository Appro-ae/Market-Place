const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const [,, file, sel, out] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1008, height: 100 }, deviceScaleFactor: 2 });
  await p.goto('file://' + file);
  await p.locator(sel).screenshot({ path: out, omitBackground: true });
  await b.close();
})();
