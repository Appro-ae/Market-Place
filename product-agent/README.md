# Product Agent

An agent that answers questions about the **Appro Marketplace portal** and helps
you **test it correctly**, grounded in real sources — not guesses.

## What it knows

| Source | Status | What it's for |
|---|---|---|
| **Jira** — project `AMP` on `scvaladdin.atlassian.net` | ✅ Live | User stories + Acceptance Criteria = the source of truth |
| **Confluence** — same site | ✅ Live | Feature/design specs, process docs |
| **Knowledge base** — `knowledge/` | ✅ Grows over time | Distilled feature notes + derived test cases |
| **Live portal** — `dib2.uat.smbp-v2.aladdinweb.dev` | ⚠️ Network-gated | Verify actual UI behavior via `../portal-test-agent` |

> **Network caveat:** the default web-session environment blocks `*.aladdinweb.dev`
> (egress policy, HTTP 403). Jira/Confluence work anywhere; live-portal checks
> only work where that host is allowlisted, or when run locally.

## How to use it

The agent is defined at `.claude/agents/product-agent.md`. Ask things like:

- "How does the co-borrower offer flow work?"
- "What does AMP-2495 change, and what should I test?"
- "Turn AMP-2502 into test cases."
- "Search AMP for stories about limit assignment."

It will: check the knowledge base → pull the relevant AMP ticket(s) →
cross-check Confluence → answer with **Jira citations** → and save what it
learned to `knowledge/` for next time.

## Login (ask-every-time)

When a task needs the live portal, the agent asks you for credentials **for that
run only** — nothing is stored. It passes them to the test agent via env vars
for a single invocation, or the test agent prompts you (masked) in a terminal.
See `../portal-test-agent/README.md`.

## Layout

| Path | Purpose |
|---|---|
| `.claude/agents/product-agent.md` | The agent definition (brief + sources + workflow) |
| `product-agent/knowledge/INDEX.md` | Index of features studied → notes → Jira keys |
| `product-agent/knowledge/*.md` | One distilled note per feature (e.g. co-borrower offer flow) |
| `portal-test-agent/` | The browser agent the Product Agent drives for live checks |
