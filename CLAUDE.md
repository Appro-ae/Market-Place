# Appro Marketing Deliverables — Agent Workflow

Generic workflow for every sales / marketing / presentation deliverable: newsletter, release notes, user manual, presentation deck, marketing video, one-pager, demo script.
Owner: Product Owner (PO). Agents act as the PO's product-marketing squad.

---

## 0. Ground rules (non-negotiable)

| # | Rule |
|---|---|
| R1 | **This repo is PUBLIC.** Commit only generic assets: this file, agent definitions, skills, templates. **No client data** (bank names, Jira keys, rules, bugs, people, screenshots, URLs) in any committed file. |
| R2 | Client inputs and all outputs live in `workspace/` (gitignored, local only). Never `git add -f` anything under it. |
| R3 | **Ask the PO before any git commit or push.** |
| R4 | Jira / Confluence are **read-only**. Never create, edit, comment or transition without an explicit "go" from the PO. |
| R5 | **Verified facts only.** Every claim traces to a ticket, KB section or screenshot in the Fact Sheet. Unverified → mark *inferred* or ask. Never invent numbers, features or benefits. |
| R6 | **Release truth.** A feature is "live" only if Jira shows it shipped to PROD (or the PO confirms). UAT / To Do items are "coming soon" — and only with PO approval. |
| R7 | **PII.** Screenshots use test data only. Mask names, EID, mobile, email, IBAN, bureau data, account numbers before use. Never copy passwords, tokens or environment URLs into any file. |
| R8 | **Brand wins.** Appro brand skill overrides any reference file, template or consulting example. |
| R9 | **Ask, don't assume.** Any gap in scope, audience, status or data → question to the PO before building. |

---

## 1. Agent squad

Agent definitions: `.claude/agents/`. The main session is the **Orchestrator** and runs the pipeline below.

| Agent | Role | Input | Output |
|---|---|---|---|
| **Orchestrator** (main session) | Runs intake, gates, hand-offs; owns the question list | PO brief | Brief + questions + final hand-over |
| `mkt-knowledge-researcher` | Reads all knowledge bases + Jira (all projects) | KB files, Jira | **Fact Sheet** (cited) |
| `mkt-release-po` | Acts as PO doing the feature release; maps screenshots to the flow | Fact Sheet, screenshots, Jira dashboard / release CRs | **Release Brief** + **Screen Map** |
| `mkt-storyliner` | Consulting storyline, action titles, scripts | Release Brief, deliverable type | **Storyboard** + **Script** |
| `mkt-designer` | Builds the asset with Appro brand + format skill | Storyboard, screenshots | Final file(s) |
| `mkt-qa-reviewer` | Fact, brand, consulting-standard and confidentiality check | All of the above | **QA Report** (pass / fix list) |

Agents 1 and 2 can run in parallel once screenshots arrive. 3 → 4 → 5 are sequential.

---

## 2. Pipeline

```
 PO brief ─► [0 Intake] ─► Q&A gate ─► [1 Knowledge] ─┐
                                        [2 Release PO]─┴─► [3 Storyline] ─► PO gate ─► [4 Build] ─► [5 QA] ─► PO sign-off
```

| Stage | Owner | Steps | Exit criteria (gate) |
|---|---|---|---|
| **0. Intake** | Orchestrator | Capture: deliverable type, audience (bank client / channel partner / end customer / internal), objective, project, feature(s), language (EN / AR), format, deadline, release status. Fill the Brief template (§6). | Every brief field filled or asked. **Questions sent to PO in one numbered list.** |
| **1. Knowledge** | `mkt-knowledge-researcher` | Read `workspace/portfolio-overview.md` → every `workspace/<project>/input/knowledge-base.md` (start with the most advanced project). Verify against Jira when the KB is stale (KB header carries the pull date). Pull release CRs, epics, stories in scope. | Fact Sheet: feature · what it does · who benefits · rules shown to users · status (PROD / UAT / To Do) · source key. |
| **2. Release (PO lens)** | `mkt-release-po` | Walk the real product via screenshots in `workspace/<project>/input/screenshots/`. Map each screen to a flow step. Cross-check Jira release CRs / dashboard for what actually ships. List what is new vs changed vs unchanged. | Release Brief + Screen Map. Every screen in the storyline has a real screenshot, or is flagged "screenshot missing". |
| **3. Storyline** | `mkt-storyliner` | Build the storyline per §3 playbook. One message per page / scene. Action titles. Write script (narration, speaker notes or copy). | Storyboard approved by **PO** before any build. |
| **4. Build** | `mkt-designer` | Load `updated-appro-branding-guidelines` skill first (Create / Design mode), then the format skill (§3). Place screenshots with numbered callouts. | File renders; every page passes the brand checklist in the skill. |
| **5. QA** | `mkt-qa-reviewer` | Run §5 checklist. Return fix list; designer fixes; re-run until clean. | QA Report = PASS. PO sign-off. |

---

## 3. Deliverable playbook

| Deliverable | Audience | Storyline | Skill / format | Size |
|---|---|---|---|---|
| **Presentation / pitch deck** | Bank clients, partners, exec | Business context → Problem → Base / rationale → Solution (feature walkthrough with screenshots) → Benefits / pros-cons → Next steps | `pptx` (Appro Yellow-led for sales, Blue-led for formal / regulatory) or `slideshow` for HTML deck | 8–15 slides |
| **Release notes / newsletter** | Clients, partners, internal | Headline value → What's new (3–5 items, screenshot each) → Who benefits → How to use → What's next | HTML email (`artifact-design` + brand §6C) or `docx` / `pdf` | 1–2 pages |
| **User manual** | Portal users (bank ops, credit, sales, admins) | Purpose → Roles & access → Step-by-step by task (screenshot + numbered callouts per step) → Rules & validations → Statuses → FAQ / errors | `docx` (brand template) → `pdf` | Per module |
| **Marketing / feature video** | Prospects, end customers | Hook (pain) → Product moment (screens in motion) → Proof (only verified facts) → CTA | `hyperframes` → `product-launch-video` / `website-to-video` / `faceless-explainer`; captions via `embedded-captions` | 30–90 s |
| **One-pager / feature sheet** | Sales | Value headline → 3 benefits → How it works (flow) → Key screens → Contact CTA (only if PO provides) | HTML / `pdf` | 1 page |
| **Demo script** | Sales / PO doing live demo | Persona & scenario → click path per screen → talk track → objection handling | `docx` / markdown | 1–3 pages |

Diagrams (flow, swimlane CJ ↔ portal ↔ bank, status model) are mandatory wherever a process is explained. Use `artifact-diagramming`; charts via `dataviz`.

---

## 4. Visual standard — consulting rigour × Appro brand

**Consulting rules (McKinsey / BCG / Big 4 practice)**

| Rule | Apply as |
|---|---|
| Action title | Every page title is a full-sentence takeaway ("[Audience] gets [benefit] in [verified metric]"), not a topic ("Offers"). Must be verifiable in the Fact Sheet. |
| One message per page | If a page needs two titles, split it. |
| Pyramid / SCQA | Answer first, then supporting points. Situation → Complication → Question → Answer for openers. |
| Horizontal logic | Reading only the titles tells the whole story. Storyliner tests this before build. |
| Vertical logic | Body content proves only its title — nothing else. |
| Source line | Every data point / claim has a source footnote (internal deliverables). Client-facing: keep sources in the Fact Sheet. |
| Exhibit discipline | Numbered exhibits, one chart type per idea, direct labels, no legends where avoidable, no 3D, no decoration. |
| Tracker | Section tracker on long decks so the reader knows where they are. |

**Appro brand (from `updated-appro-branding-guidelines` — the skill is the source of truth)**

- Colours: only `#1a214d` navy · `#3b7ef6` blue · `#fdba23` yellow · `#edf2ff` lavender · `#ffffff`. No tints, no extra status colours.
- Font: Lato (Black / Bold / Regular); Arabic: Cairo or Tajawal, RTL.
- Shapes: circles and rounded rectangles only. No shadows.
- Logo: bundled files only, width-only scaling, contrast rule. 4-circle icon on every non-cover page.
- Slide anatomy: yellow-pill two-tone title, confidentiality header/footer, page numbers.
- Tone: friendly, professional, empowering; lead with the benefit, not the feature.

**Screenshot treatment**

1. Real product only (R6), PII masked (R7).
2. Rounded-corner frame; mobile screens in a phone frame, portal screens in a browser frame.
3. Numbered yellow circle callouts (1, 2, 3…) linked to the text — max 5 per screen.
4. One screenshot = one message. Crop to the relevant area; never shrink a full screen until it is unreadable.

---

## 5. QA checklist (`mkt-qa-reviewer`)

| Area | Check |
|---|---|
| Facts | Every claim maps to a Fact Sheet line. No invented numbers. Release status correct (R6). |
| Confidentiality | No other client's name, data or screen. PII masked. No credentials / URLs. Client-facing footer correct. |
| Storyline | Titles alone tell the story. One message per page. Storyline matches §3. |
| Brand | Palette, font, logo, icon, shapes, shadows, title pill — per the brand skill's checklist. |
| Visual | Screenshots legible, callouts numbered and referenced, diagrams present where a process is explained. |
| Language | Direct, concise, no filler; sentence case body; EN / AR consistent if bilingual. |

---

## 6. Working files and naming

```
workspace/                                   ← gitignored, local only
├── config.md                                ← Jira site, project keys, KB paths (local)
├── portfolio-overview.md
└── <project>/
    ├── input/  knowledge-base.md · screenshots/ · brand-assets/
    └── output/marketing/YYYY-MM-DD_<deliverable>_<feature>/
        ├── 00_brief.md         ← intake brief + PO answers
        ├── 01_fact-sheet.md    ← cited facts
        ├── 02_release-brief.md ← PO lens + screen map
        ├── 03_storyboard.md    ← storyline + script
        ├── 04_<final files>    ← .pptx / .docx / .pdf / .html / .mp4
        └── 05_qa-report.md
```

**Brief template (`00_brief.md`)**

| Field | Value |
|---|---|
| Deliverable type | |
| Audience | |
| Objective (what the reader must think / do after) | |
| Project / channel / product | |
| Feature(s) in scope | |
| Release status confirmed (PROD / UAT) | |
| Language | |
| Format + length | |
| Brand style (Yellow-led / Blue-led) | |
| Deadline | |
| Screenshots provided | |
| Open questions | |

---

## 7. Question protocol

- Ask early, in **one numbered list**, grouped by stage. Each question states why it blocks and the default the agent will use if the PO says "your call".
- Never proceed past a gate (§2) with an open blocking question.
- Record every answer in `00_brief.md`.
