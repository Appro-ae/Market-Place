// Render the .drawio master to a full-resolution PNG with the vendored draw.io viewer.
//   NODE_PATH=/opt/node22/lib/node_modules node build/render.js
// Writes assets/<name>.png at 2x. External requests are served from build/vendor/ or
// blocked, so the render is reproducible offline and never alters the master XML.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.dirname(__dirname);
const NAME = 'Credit_Card_Workflow_final_25092025';
const xml = fs.readFileSync(path.join(ROOT, NAME + '.drawio'), 'utf8');

const cfg = JSON.stringify({ xml, nav: false, resize: true, border: 16, 'auto-fit': false });
const html = `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;background:#ffffff}</style>
<script>window.DRAWIO_VIEWER_URL='';window.STYLE_PATH='';window.PROXY_URL='';</script>
</head><body>
<div class="mxgraph" data-mxgraph='${cfg.replace(/&/g, '&amp;').replace(/'/g, '&#39;')}'></div>
<script src="viewer-static.min.js"></script>
</body></html>`;
const page_html = path.join(__dirname, '.render.html');
fs.writeFileSync(page_html, html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 4300, height: 1800 }, deviceScaleFactor: 2 });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  const misses = [];
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith('file://')) return route.continue();
    const local = path.join(__dirname, 'vendor', path.basename(new URL(url).pathname));
    if (fs.existsSync(local)) return route.fulfill({ path: local });
    misses.push(url);
    return route.abort();
  });
  await page.goto('file://' + page_html);
  await page.waitForSelector('.mxgraph svg', { timeout: 30000 });
  await page.waitForTimeout(1500); // stencil/image settle
  const el = page.locator('.mxgraph');
  const box = await el.boundingBox();
  console.log('diagram box:', Math.round(box.width), 'x', Math.round(box.height));
  fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
  await el.screenshot({ path: path.join(ROOT, 'assets', NAME + '.png') });
  if (misses.length) console.log('blocked external requests:\n  ' + [...new Set(misses)].join('\n  '));
  await browser.close();
  console.log('written assets/' + NAME + '.png');
})();
