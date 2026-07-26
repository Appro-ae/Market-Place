'use strict';

/**
 * Portal test agent
 * -----------------
 * Drives a real Chromium browser (Playwright) against the portal:
 *   1. Loads the login page
 *   2. Fills credentials and submits
 *   3. Asserts login succeeded (navigated away from the login route / token present)
 *   4. Optionally walks the main navigation and checks each section renders
 *   5. Captures screenshots, console errors and failed network requests throughout
 *   6. Writes a JSON + Markdown report to ./reports
 *
 * Run:  node agent.js            (headless, from portal-test-agent/)
 *       HEADLESS=false node agent.js
 *
 * Credentials are read from env (see config.js / .env.example). Nothing secret
 * is written to the report.
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { chromium } = require('playwright');
const { config } = require('./config');

// Resolved at runtime by resolveCredentials(); never persisted to disk.
const creds = { username: '', password: '' };

const SHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORTS_DIR = path.join(__dirname, 'reports');

// A monotonic-ish run id built from the process — Date is fine here, this runs live.
const RUN_ID = new Date().toISOString().replace(/[:.]/g, '-');

const steps = [];
const consoleErrors = [];
const failedRequests = [];
const pageErrors = [];

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[agent] ${msg}`);
}

function recordStep(name, status, detail) {
  const entry = { name, status, detail: detail || '', at: new Date().toISOString() };
  steps.push(entry);
  log(`${status === 'pass' ? '✓' : status === 'fail' ? '✗' : '•'} ${name}${detail ? ' — ' + detail : ''}`);
  return entry;
}

async function shot(page, label) {
  const safe = label.replace(/[^a-z0-9-_]/gi, '_');
  const file = path.join(SHOTS_DIR, `${RUN_ID}__${safe}.png`);
  try {
    await page.screenshot({ path: file, fullPage: true });
    return path.relative(__dirname, file);
  } catch (e) {
    return `(screenshot failed: ${e.message})`;
  }
}

/**
 * Try a list of selectors; return the first locator that is visible, else null.
 */
async function firstVisible(page, selectors) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    try {
      if (await loc.isVisible({ timeout: 1500 })) return loc;
    } catch {
      /* keep trying */
    }
  }
  return null;
}

/**
 * "Ask every time": resolve credentials from env if provided, otherwise prompt
 * interactively. The password prompt masks input. Nothing is written to disk.
 */
async function resolveCredentials() {
  creds.username = config.usernameFromEnv;
  creds.password = config.passwordFromEnv;

  if (creds.username && creds.password) return; // provided via env for this run

  if (!process.stdin.isTTY) {
    throw new Error(
      'No credentials provided and no interactive terminal available. ' +
        'Set PORTAL_USERNAME / PORTAL_PASSWORD for this run, or run in a terminal so I can prompt you.'
    );
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));

  if (!creds.username) creds.username = (await ask('Portal username: ')).trim();

  if (!creds.password) {
    // Mask the password as it is typed.
    const stdout = process.stdout;
    const onData = (char) => {
      const s = char.toString();
      if (s === '\n' || s === '\r' || s === '') return;
      readline.clearLine(stdout, 0);
      readline.cursorTo(stdout, 0);
      stdout.write('Portal password: ' + '*'.repeat(rl.line.length));
    };
    process.stdin.on('data', onData);
    creds.password = (await ask('Portal password: ')).trim();
    process.stdin.removeListener('data', onData);
    stdout.write('\n');
  }

  rl.close();

  if (!creds.username || !creds.password) {
    throw new Error('Username and password are both required.');
  }
}

async function fillLogin(page) {
  // Username / email field — try common variants.
  const userLoc = await firstVisible(page, [
    'input[formcontrolname="username"]',
    'input[formcontrolname="email"]',
    'input[name="username"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[autocomplete="username"]',
    'input[placeholder*="user" i]',
    'input[placeholder*="email" i]',
    '#username',
    '#email',
  ]);
  if (!userLoc) throw new Error('Could not locate a username/email input on the login page.');
  await userLoc.fill(creds.username);

  const passLoc = await firstVisible(page, [
    'input[formcontrolname="password"]',
    'input[name="password"]',
    'input[type="password"]',
    'input[autocomplete="current-password"]',
    'input[placeholder*="pass" i]',
    '#password',
  ]);
  if (!passLoc) throw new Error('Could not locate a password input on the login page.');
  await passLoc.fill(creds.password);

  const submitLoc = await firstVisible(page, [
    'button[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Log in")',
    'button:has-text("Sign in")',
    'button:has-text("Sign In")',
    '[role="button"]:has-text("Login")',
    'input[type="submit"]',
  ]);
  if (!submitLoc) throw new Error('Could not locate a submit/login button on the login page.');
  return submitLoc;
}

/**
 * Heuristic: are we still on the login route?
 */
function looksLikeLoginUrl(url) {
  return /\/authenticate\/login|\/login\b/i.test(url);
}

async function readAuthTokens(page) {
  try {
    return await page.evaluate(() => {
      const keys = [];
      const scan = (store, kind) => {
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (/token|auth|jwt|session|access/i.test(k)) keys.push(`${kind}:${k}`);
        }
      };
      scan(window.localStorage, 'local');
      scan(window.sessionStorage, 'session');
      return keys;
    });
  } catch {
    return [];
  }
}

async function run() {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  await resolveCredentials(); // ask-every-time (or use env for this run)

  const loginUrl = config.baseUrl.replace(/\/+$/, '') + config.loginPath;
  log(`Launching Chromium (headless=${config.headless}) …`);

  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo,
  });
  const context = await browser.newContext({
    viewport: config.viewport,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeoutMs);
  page.setDefaultNavigationTimeout(config.navTimeoutMs);

  // Wire up diagnostics.
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ text: msg.text(), at: new Date().toISOString() });
  });
  page.on('pageerror', (err) => pageErrors.push({ text: String(err), at: new Date().toISOString() }));
  page.on('requestfailed', (req) => {
    failedRequests.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure() && req.failure().errorText,
      at: new Date().toISOString(),
    });
  });

  let ok = true;

  try {
    // ── Step 1: load login page ────────────────────────────────────────────
    recordStep('load-login-page', 'info', loginUrl);
    const resp = await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    const status = resp ? resp.status() : 'no-response';
    recordStep('login-page-http', status && status < 400 ? 'pass' : 'fail', `HTTP ${status}`);
    if (status && status >= 400) ok = false;
    recordStep('login-page-screenshot', 'info', await shot(page, '01-login'));

    // ── Step 2: fill + submit ──────────────────────────────────────────────
    const submit = await fillLogin(page);
    recordStep('fill-credentials', 'pass', `user=${maskUser(creds.username)}`);
    recordStep('pre-submit-screenshot', 'info', await shot(page, '02-filled'));

    const beforeUrl = page.url();
    await Promise.all([
      submit.click(),
      // Login may be a client-side route change (SPA) or a nav — tolerate both.
      page.waitForLoadState('networkidle').catch(() => {}),
    ]);
    // Give the SPA a moment to route.
    await page.waitForTimeout(2500);
    recordStep('post-submit-screenshot', 'info', await shot(page, '03-after-submit'));

    // ── Step 3: assert login ───────────────────────────────────────────────
    const afterUrl = page.url();
    const tokens = await readAuthTokens(page);
    const leftLogin = !looksLikeLoginUrl(afterUrl);
    const hintOk = config.loggedInHintPath ? afterUrl.includes(config.loggedInHintPath) : true;

    // Surface any visible error/toast on the login form.
    const errText = await extractVisibleError(page);

    if ((leftLogin || tokens.length > 0) && hintOk && !errText) {
      recordStep(
        'login',
        'pass',
        `url ${beforeUrl} → ${afterUrl}; tokens=[${tokens.join(', ') || 'none'}]`
      );
    } else {
      ok = false;
      recordStep(
        'login',
        'fail',
        `still on login-ish url=${afterUrl}; tokens=[${tokens.join(', ') || 'none'}]` +
          (errText ? `; page error="${errText}"` : '')
      );
    }

    // ── Step 4: light post-login navigation smoke ─────────────────────────
    if (leftLogin) {
      await smokeNavigate(page);
    } else {
      recordStep('navigation-smoke', 'skip', 'skipped because login did not succeed');
    }
  } catch (err) {
    ok = false;
    recordStep('exception', 'fail', err.message);
    try {
      recordStep('exception-screenshot', 'info', await shot(page, '99-exception'));
    } catch {
      /* ignore */
    }
  } finally {
    await writeReports(ok);
    await browser.close();
  }

  log(ok ? 'RESULT: PASS' : 'RESULT: FAIL (see report)');
  process.exit(ok ? 0 : 1);
}

function maskUser(u) {
  if (!u) return '';
  const [name, domain] = u.split('@');
  const head = name.slice(0, 2);
  return domain ? `${head}***@${domain}` : `${head}***`;
}

async function extractVisibleError(page) {
  const loc = await firstVisible(page, [
    '.error, .alert-danger, .mat-error, [role="alert"]',
    'text=/invalid|incorrect|failed|unauthor/i',
  ]);
  if (!loc) return '';
  try {
    return (await loc.innerText()).trim().slice(0, 200);
  } catch {
    return '';
  }
}

/**
 * Click through top-level nav items and confirm each renders without throwing.
 * Kept intentionally conservative so it works before we know the real menu.
 */
async function smokeNavigate(page) {
  const navItems = page.locator(
    'nav a, [role="navigation"] a, aside a, .sidebar a, .menu a, .nav-item a'
  );
  let count = 0;
  try {
    count = await navItems.count();
  } catch {
    /* ignore */
  }

  if (count === 0) {
    recordStep('navigation-smoke', 'info', 'no obvious nav links found; captured dashboard only');
    recordStep('dashboard-screenshot', 'info', await shot(page, '04-dashboard'));
    return;
  }

  const max = Math.min(count, 8);
  recordStep('navigation-smoke', 'info', `found ${count} nav links; visiting up to ${max}`);
  for (let i = 0; i < max; i++) {
    const link = navItems.nth(i);
    let label = `nav-${i}`;
    try {
      label = ((await link.innerText()) || `nav-${i}`).trim().slice(0, 40) || `nav-${i}`;
    } catch {
      /* ignore */
    }
    const errBefore = consoleErrors.length;
    try {
      await link.click({ timeout: 8000 });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1200);
      const newErrors = consoleErrors.length - errBefore;
      recordStep(
        `visit:${label}`,
        newErrors > 0 ? 'warn' : 'pass',
        `${page.url()}${newErrors > 0 ? ` (+${newErrors} console errors)` : ''}`
      );
      recordStep(`shot:${label}`, 'info', await shot(page, `05-${label}`));
    } catch (e) {
      recordStep(`visit:${label}`, 'warn', `could not open: ${e.message}`);
    }
  }
}

async function writeReports(ok) {
  const summary = {
    runId: RUN_ID,
    result: ok ? 'PASS' : 'FAIL',
    target: config.baseUrl,
    loginPath: config.loginPath,
    steps,
    consoleErrors,
    pageErrors,
    failedRequests,
  };

  const jsonPath = path.join(REPORTS_DIR, `${RUN_ID}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  const md = renderMarkdown(summary);
  const mdPath = path.join(REPORTS_DIR, `${RUN_ID}.md`);
  fs.writeFileSync(mdPath, md);

  log(`Report: ${path.relative(process.cwd(), mdPath)}`);
}

function renderMarkdown(s) {
  const icon = { pass: '✅', fail: '❌', warn: '⚠️', skip: '⏭️', info: 'ℹ️' };
  const rows = s.steps
    .map((st) => `| ${icon[st.status] || ''} ${st.status} | ${st.name} | ${escapePipes(st.detail)} |`)
    .join('\n');
  return `# Portal test run — ${s.result}

- **Run:** ${s.runId}
- **Target:** ${s.target}${s.loginPath}
- **Console errors:** ${s.consoleErrors.length}
- **Page errors:** ${s.pageErrors.length}
- **Failed requests:** ${s.failedRequests.length}

## Steps

| Status | Step | Detail |
|---|---|---|
${rows}

${section('Console errors', s.consoleErrors.map((e) => `- ${escapePipes(e.text)}`))}
${section('Page errors', s.pageErrors.map((e) => `- ${escapePipes(e.text)}`))}
${section(
  'Failed network requests',
  s.failedRequests.map((r) => `- \`${r.method}\` ${r.url} — ${r.failure || ''}`)
)}
`;
}

function section(title, lines) {
  if (!lines || lines.length === 0) return `## ${title}\n\n_None._`;
  return `## ${title}\n\n${lines.join('\n')}`;
}

function escapePipes(s) {
  return String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[agent] fatal', e);
  process.exit(1);
});
