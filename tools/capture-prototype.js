// Capture every screen of a bundled clickable prototype (phone mock-up with
// "Screen N of M — Name" label and a next-arrow button) as cropped PNGs.
// Usage: node tools/capture-prototype.js <prototype.html> <out-dir>
// Output goes to workspace/ only (gitignored). Requires playwright.
const { chromium } = require('playwright');

(async () => {
  const [html, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('file://' + require('path').resolve(html), { waitUntil: 'load' });
  await page.waitForTimeout(3500);

  const label = () => page.evaluate(() => {
    const m = document.body.innerText.match(/Screen\s*(\d+)\s*of\s*(\d+)\s*—\s*([^\n]+)/);
    return m ? [m[1], m[3].trim()] : null;
  });
  // Phone frame = largest strongly rounded box of phone proportions.
  const phoneBox = () => page.evaluate(() => {
    let best = null, area = 0;
    for (const e of document.querySelectorAll('div')) {
      const r = e.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(e).borderRadius) || 0;
      if (radius >= 40 && r.width > 300 && r.width < 500 && r.height > 600 && r.width * r.height > area) {
        area = r.width * r.height;
        best = { x: r.x, y: r.y, width: r.width, height: r.height };
      }
    }
    return best;
  });
  // Next arrow = small button right of the phone, vertically centred.
  const nextIndex = () => page.evaluate(() => [...document.querySelectorAll('button')]
    .map((e, i) => ({ i, r: e.getBoundingClientRect() }))
    .filter(o => o.r.width > 30 && o.r.width < 70 && o.r.x > 900 && o.r.y > 300 && o.r.y < 600)
    .map(o => o.i)[0]);

  const index = [];
  for (let n = 0; n < 200; n++) {
    const current = await label();
    if (!current) break;
    const slug = current[1].replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    await page.screenshot({ path: `${out}/${current[0].padStart(2, '0')}-${slug}.png`, clip: (await phoneBox()) || undefined });
    index.push(`${current[0]}\t${current[1]}`);
    const i = await nextIndex();
    if (i === undefined) break;
    await page.evaluate(k => document.querySelectorAll('button')[k].click(), i);
    await page.waitForTimeout(700);
    const after = await label();
    if (!after || after[0] === current[0]) break;
  }
  require('fs').writeFileSync(`${out}/index.tsv`, index.join('\n') + '\n');
  console.log(`${index.length} screens captured`);
  await browser.close();
})();
