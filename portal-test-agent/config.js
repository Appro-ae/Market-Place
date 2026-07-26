'use strict';

// Load a local .env if present (tiny parser, no dependency).
(function loadDotEnv() {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
})();

// Central configuration for the portal test agent.
// Credentials come from env OR an interactive runtime prompt — never hard-coded.

const config = {
  // Base URL of the portal (no trailing hash route).
  baseUrl: process.env.PORTAL_BASE_URL || 'https://dib2.uat.smbp-v2.aladdinweb.dev',

  // Full login route (hash-based Angular route).
  loginPath: process.env.PORTAL_LOGIN_PATH || '/index.html#/authenticate/login',

  // Credentials — read from env if present, otherwise the agent prompts for
  // them interactively at runtime (see resolveCredentials in agent.js).
  // They are never defaulted and never written to disk.
  usernameFromEnv: process.env.PORTAL_USERNAME || '',
  passwordFromEnv: process.env.PORTAL_PASSWORD || '',

  // A URL fragment that indicates a successful login (i.e. we navigated away
  // from the login route). Adjust once you know the real post-login route.
  loggedInHintPath: process.env.PORTAL_LOGGEDIN_HINT || '', // e.g. '#/dashboard'

  // Behaviour
  headless: process.env.HEADLESS !== 'false', // set HEADLESS=false to watch it
  slowMo: Number(process.env.SLOWMO || 0),
  timeoutMs: Number(process.env.TIMEOUT_MS || 45000),
  navTimeoutMs: Number(process.env.NAV_TIMEOUT_MS || 45000),

  // Viewport
  viewport: { width: 1440, height: 900 },
};

module.exports = { config };
