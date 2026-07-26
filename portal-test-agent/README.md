# Portal Test Agent

An automated browser agent that logs into the portal and runs a smoke test:
loads the login page, submits credentials, verifies authentication, walks the
main navigation, and captures screenshots, console errors, and failed network
requests into a report.

Built with [Playwright](https://playwright.dev/) driving real Chromium.

## What it checks

1. **Login page loads** — HTTP status < 400, screenshot captured.
2. **Credentials submit** — locates username/password/submit via a list of
   resilient selectors (works with Angular `formcontrolname`, `name`, `type`,
   placeholders, ids).
3. **Login succeeds** — asserts we navigated away from the `…/authenticate/login`
   route and/or an auth token appeared in local/session storage; surfaces any
   visible error toast if it didn't.
4. **Navigation smoke** — clicks up to 8 top-level nav links and flags any that
   throw console errors or fail to open.
5. **Diagnostics** — every console error, page error, and failed request during
   the whole run is collected.

Output lands in `reports/<timestamp>.md` (+ `.json`) and `screenshots/`.

## Credentials — ask-every-time

The agent **never stores your portal password**. It resolves credentials in this
order, for one run only:

1. `PORTAL_USERNAME` / `PORTAL_PASSWORD` env vars if set (used, not persisted).
2. Otherwise it **prompts you interactively** (password input is masked).

So there's nothing to put in `.env` for the password. You can still copy
`.env.example` to `.env` to override the URL/behavior — `.env` is gitignored.

## Run

```bash
./run.sh                 # headless — prompts for credentials if not in env
HEADLESS=false ./run.sh  # watch the browser drive

# Or provide credentials for a single run without prompting:
PORTAL_USERNAME='admin@appro.ae' PORTAL_PASSWORD='***' ./run.sh
```

Exit code is `0` on PASS, `1` on FAIL.

### Environment note

This repo's default remote-execution environment blocks outbound traffic to
`*.aladdinweb.dev` (org egress policy — the proxy returns `403` on CONNECT). The
agent therefore can't reach the UAT portal from a default web session. Run it
where that host is reachable:

- locally on a machine that can reach the UAT portal, **or**
- in a session whose environment network policy allowlists
  `*.aladdinweb.dev`.

Nothing in the agent tries to bypass the policy — it just needs the host to be
reachable.

## Tuning

Once you've seen a real run, tighten the assertions:

- Set `PORTAL_LOGGEDIN_HINT` (e.g. `#/dashboard`) so login is confirmed by the
  exact landing route, not just "left the login page".
- Adjust selector lists in `agent.js` (`fillLogin`, `smokeNavigate`) to match the
  portal's real markup for stronger, less generic checks.

## Files

| File | Purpose |
|---|---|
| `agent.js` | The test agent (login + smoke + report). |
| `config.js` | Config + `.env` loader; credentials from env only. |
| `run.sh` | Runner that wires up the pre-installed Playwright/Chromium. |
| `.env.example` | Template for local credentials/config. |
| `screenshots/` | Per-step PNGs (gitignored). |
| `reports/` | JSON + Markdown run reports (gitignored). |
