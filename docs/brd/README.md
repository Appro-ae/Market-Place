# BRD — ECB Consumer Credit Score 3.0 · What's new in Super Portal

Client-facing product introduction for the Score 3.0 front-end changes. Written
for a sales-consultant read: what is new on screen and why it helps the credit
team. No Jira references, no workflow, no technical derivation logic.

| Path | What it is |
|---|---|
| `build/brd.html` | **Source of truth.** Six A4 pages, edit here. |
| `build/render_brd.js` | Renders the PDF with Chromium |
| `build/fonts/lato-inline.css` | Lato 400 / 400 italic / 700 / 900, base64 |
| `BRD_ECB_Consumer_Credit_Score_3.0_V1.0.pdf` | The circulation copy |
| `assets/` | Logos, the score-band and one-score-two-decisions graphics, SC5 crops |

## Pages

1. Cover — blue, white logo, hero of the two Rule Engine composites
2. At a glance — headline, four numbers, the three new tools, scope chips, what stays the same
3. 01 · Score 3.0 codes in the Rule Engine value list
4. 02 · The AECB Score Segment variable (the only screen with `#FF5500` callouts) + good to know
5. 03 · Score Range in Score Check Management (zoom inset) + in / not in scope
6. Thank you + next step

## Rebuild

```
node build/render_brd.js
```

The script **fails** if Lato did not load or if any image is missing, so a
fallback-font or broken-image PDF cannot be produced silently.

## Visual language

Taken from the Q3 2026 newsletter so the two attachments read as one set:
brand blue `#3278FF`, navy `#1A214D` / panel `#1B2150`, yellow `#FDBA23`,
soft panel `#EEF4FF`, Lato, spaced-caps kickers, numbered navy pills, rounded
cards with a coloured left bar.

`appro_logo_navy.png` / `appro_logo_white.png` are the newsletter wordmark
rendered at 1200 dpi with a real alpha channel. `bands_score3.png` and
`ia_credit_policy.png` are Appro's own newsletter graphics, cropped, not
redrawn. Screens are the composites in `docs/us/screens/`.

## Superseded

The first V1.0 (docx-js → LibreOffice, Arial, cancellation-template layout,
14 pages) was replaced on 25 Sep 2026 at the PO's direction: too heavy, and it
carried the workflow, segment detection, credit report and release plan. It
is in git history if needed.
