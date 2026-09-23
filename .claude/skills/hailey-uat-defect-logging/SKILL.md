---
name: hailey-uat-defect-logging
description: >
  Hailey UAT skill — Set 3 (Final test & defect logging). Test a delivered build
  against its user story, produce annotated evidence, and log defects in the Appro
  house format. Use whenever the user says "final test", "check against the US",
  "log bug if needed", uploads UAT screenshots or a user manual and asks what is
  wrong, or asks to compare implementation to an AMP/ACP ticket. Never logs a
  finding that the screenshots do not prove, and never assigns a ticket by guessing.
---

# UAT & Defect Logging — Hailey house method

Test the build against the story. Prove every finding from the evidence. Log
defects a developer cannot argue with, and a PO can triage in two minutes.

---

## Core rule: the pixels are the evidence, not the prose

A user manual, a release note or a dev's summary is **testimony**. The screenshot
is **evidence**. When they disagree, the screenshot wins.

> In the SSO round the manual read *"both offer Delete and Edit"*. Sampling the
> button showed grey `#A6AAAC` on a Directory user against red `#BE1522` on a
> Portal user — Delete was correctly disabled. The bug as first written was wrong
> and had to be retracted.

Before writing "the build does X":

- Open the actual capture and look at it.
- Where appearance is ambiguous (disabled vs enabled, greyed vs active), **measure** —
  sample the pixel colour, read the DOM `disabled` / `readOnly` state.
- If you cannot see it in the evidence, do not assert it. Attribute it:
  *"observed in UAT on 22/09, not visible in the captures."*

---

## Workflow

### 1. Assemble the three inputs
| Input | What it gives you |
|---|---|
| The user story (live from Jira, not a local draft) | The acceptance criteria you test against |
| The screenshots | The evidence |
| The user manual, where one exists | The tester's own account — including what they could **not** test |

Read the story's AC text **verbatim** before comparing. Quote it in the ticket.

### 2. Compare string by string
Do not skim for "looks about right". Build the table:

`Element | Story text | Build text | Verdict`

Cover: page title, breadcrumb, headings, intro lines, field labels, helper text,
placeholders, badge vocabulary, button labels, dialog titles and bodies, message
text, timestamp formats.

### 3. Separate the four verdicts
| Verdict | Action |
|---|---|
| **Build wrong** | Log it |
| **Story wrong** — the build is better | Say so. Propose the story change, do not log a bug |
| **Matches** | List it in the ticket as *no change required* |
| **Not testable** | Record it as untested. Never let it read as a pass |

### 4. Group by dev fix area, not per symptom
Eleven findings became five tickets. One ticket = one area a developer opens and
fixes in a sitting. Do not raise nine tickets a reviewer must read nine times.

### 5. Log in the house format

```
## **Description:**
<what is wrong, in prose>
<annotated image>
**Environment:** <url> · channel <x> · <date>

---
## **Steps to Reproduce:**
1. …

---
## **Expected Result:**
* <quote the AC>

---
## **Actual Result:**
* <what the build does>
**Impact:** <why it matters — one paragraph, business consequence>

---
**Reference:** <AC numbers> · <related tickets> · <manual section>
```

Reference example: **AMP-2093**.

### 6. Close rejected findings inside the ticket
When the PO culls a finding, write the cull into the ticket so it does not
resurface at the next review:

> **Not in scope of this ticket:** the rendering of unchanged connection values was
> reviewed and accepted as-is.
>
> **Reviewed and accepted, no change required:** the Edit button on a Directory user.

### 7. Assign, prioritise, link
- **Priority is the PO's call**, not the tester's. Set what you are told. If the
  body still argues "High" after the PO sets Low, offer to tone it down.
- **Never guess an assignee.** Two accounts matched "Long" — ask before assigning.
- **Every defect links to its story.** A defect found against Part 2 but caused by
  Part 1 links to both.

---

## Annotated evidence — the capture format

One image per ticket area. Built over the real screenshot, never a mock-up.

| Element | Spec |
|---|---|
| Header strip | Dark navy, white text: `AMP-XXXX · <one-line finding>` |
| Red box + number | One per deviation, sitting **inside** its own column or field — never bleeding into the neighbour |
| Green box + `OK` | One per thing the build got right |
| Label | Short, states the deviation and the expected value: *"No time — spec: DD/MM/YYYY HH:MM"* |
| Footer strip | The AC being tested, and any cross-reference |

**Mark the passes.** A sheet that only marks failures reads as an attack on the
developer. Green boxes make the red ones credible.

Stagger labels vertically when boxes are adjacent, or they collide.

---

## What must always be stated

**What was not tested.** The single most important line in a UAT report.

> Single sign-on was Off on the verified build, so AC4 — every login use case and
> every message code — was not exercised. This test verifies the configuration
> surface. It does not verify login behaviour.

A story sitting at `UAT Validated` with an untested AC is worse than one marked
failed, because it reads as signed off. Say so plainly, and say it to the person
who will sign it.

---

## Checklist before handing over

- [ ] Every finding traced to a quoted AC, or explicitly marked as a PO decision
- [ ] Every finding visible in an attached capture — or attributed to the tester
- [ ] Anything ambiguous measured, not eyeballed
- [ ] Story-is-wrong cases separated from build-is-wrong cases
- [ ] Tickets grouped by fix area
- [ ] House format: Description → Steps → Expected → Actual
- [ ] Passes listed as *no change required*
- [ ] Untested paths recorded
- [ ] Priority as set by the PO; assignee confirmed, not guessed
- [ ] Every ticket linked to its story
- [ ] Evidence filenames match the labels in the ticket bodies

---

## Known constraint

The Atlassian connector **cannot upload attachments** — comment, worklog,
create-issue and edit-issue only. Deliver captures as one zip for drag-drop, and
put a `📎 see attached: <filename>` label in the description where each image goes.
`![](url)` embeds are rewritten to `blob:…media.staging.atl-paas.net` and may not
render.
