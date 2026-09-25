# BRD — ECB Consumer Credit Score 3.0 · What's new in Super Portal

Client-facing product introduction for the Score 3.0 front-end changes, eight pages. Written
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

1. Cover — the newsletter composition: centred logo, yellow pill, disc, sparkles; a score hero — Mature gauge (812 · M9 · Very Low Risk) and New to Credit gauge (548 · N8 · Low Risk), drawn to the real Score 3.0 bands
2. At a glance — headline, the two Rule Engine tools with product thumbnails, products, what stays the same
3. 01 · Score 3.0 codes in the Rule Engine value list
4. 02 · The AECB Score Segment variable (the only screen with `#FF5500` callouts) + good to know
5. 03 · Two new attributes in Score Check Management — add ECB Score Range, add ECB Score Segment — plus the same value set before and after (SC4 real capture vs SC5)
6. Appendix A · How Consumer Credit Score 3.0 works — the two populations, Index / Range, the two scales
7. Appendix B · The 20 range codes, colour-coded by risk group
8. Thank you + next step

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

## Naming

Running text says **ECB** throughout (ECB Score Range, ECB Score Segment),
matching the PO's wording and the newsletter. The screens keep the labels as
captured from the build, which still read AECB.

The captured test name in the strategy group field was replaced with neutral
group names: **Group 1** on SC3, **Group 2** on SC6 (same bold, underlined
field style, font calibrated against the capture).

## No CSS drop shadows — ever

Chromium prints a CSS `box-shadow` as a blurred soft-mask group. macOS Preview
(and some other viewers) paint those groups as **solid dark rectangles** — the
first version of the new cover showed exactly that on the PO's machine, while
every render here looked fine. The PDF therefore carries no CSS shadows at all:

* depth on the cover comes from `build/hero.html`, rendered by
  `build/render_hero.js` to a transparent PNG with the shadows baked in. The
  canvas is padded 90px on every side so the shadows fade out inside the image
  — a shadow clipped at the image edge shows as a faint rectangle too;
* inner pages use flat 1px borders instead of shadows.

Check after any change:

```
python3 - <<'X'
import pymupdf; d=pymupdf.open('BRD_ECB_Consumer_Credit_Score_3.0_V1.0.pdf')
print(sum(1 for x in range(1,d.xref_length()) if '/Type /ExtGState' in (o:=d.xref_object(x,compressed=False)) and '/SMask' in o and '/SMask /None' not in o))
X
```

It must print `0`.

The gauges are drawn to the real bands: Mature 300 – 523 / 524 – 673 /
674 – 755 / 756 – 789 / 790 – 850; New to Credit 300 – 450 / 451 – 491 /
492 – 519 / 520 – 650. The sample scores are consistent with the mapping:
812 is M9 · Very Low Risk · Excellent, 548 is N8 · Low Risk.
