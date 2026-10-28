// Render any .drawio file to PNG with the vendored draw.io viewer (offline).
//   NODE_PATH=/opt/node22/lib/node_modules node render_any.js <file.drawio> <out.png>
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [,, SRC, OUT] = process.argv;
const VIEWER = path.join(__dirname, '..', 'credit_card', 'build', 'viewer-static.min.js');
const VENDOR = path.join(__dirname, '..', 'credit_card', 'build', 'vendor');
const xml = fs.readFileSync(SRC, 'utf8');

const cfg = JSON.stringify({ xml, nav: false, resize: true, border: 16, 'auto-fit': false });
const html = `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;background:#ffffff}</style>
<script>window.DRAWIO_VIEWER_URL='';window.STYLE_PATH='';window.PROXY_URL='';</script>
</head><body>
<div class="mxgraph" data-mxgraph='${cfg.replace(/&/g, '&amp;').replace(/'/g, '&#39;')}'></div>
<script src="${VIEWER}"></script>
</body></html>`;
const page_html = path.join(__dirname, '.render_any.html');
fs.writeFileSync(page_html, html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 6700, height: 1900 }, deviceScaleFactor: 2 });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  const misses = [];
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith('file://')) return route.continue();
    const local = path.join(VENDOR, path.basename(new URL(url).pathname));
    if (fs.existsSync(local)) return route.fulfill({ path: local });
    misses.push(url);
    return route.abort();
  });
  await page.goto('file://' + page_html);
  await page.waitForSelector('.mxgraph svg', { timeout: 30000 });
  await page.waitForTimeout(1200);
  const el = page.locator('.mxgraph');
  const box = await el.boundingBox();
  console.log('diagram box:', Math.round(box.width), 'x', Math.round(box.height));
  await el.screenshot({ path: OUT });
  if (misses.length) console.log('blocked:', [...new Set(misses)].join(' '));
  await browser.close();
  console.log('written', OUT);
})();
