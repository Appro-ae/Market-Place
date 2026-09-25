# BRD — ECB Consumer Credit Score 3.0

Client-facing Business Requirements Document for the Super Portal changes that
accompany the bureau's Consumer Credit Score 3.0 release. Built from the Score
3.0 user story; **no Jira ticket references appear in the document**.

| File | What it is |
|---|---|
| `build_brd.js` | **Source of truth.** Edit this, never the Word file. |
| `BRD_ECB_Consumer_Credit_Score_3.0_V1.0.docx` | Editable deliverable |
| `BRD_ECB_Consumer_Credit_Score_3.0_V1.0.pdf` | Circulation copy |
| `assets/` | Logos, flow diagram, annotated key screen, impact-analysis crops |
| `build/` | HTML sources for the generated figures |

## Rebuild

```
node build_brd.js
soffice --headless -env:UserInstallation=file:///tmp/lo3 \
        --convert-to pdf --outdir "$PWD" "$PWD/BRD_ECB_Consumer_Credit_Score_3.0_V1.0.docx"
```

Proof every page before shipping (blank pages, clipped images, orphan rows,
mid-word header wraps):

```
python3 -c "import pymupdf; d=pymupdf.open('BRD_...pdf'); [p.get_pixmap(dpi=95).save(f'/tmp/brd_p{i+1}.png') for i,p in enumerate(d)]"
```

## Two container traps this build hit

**LibreOffice ships without Writer here.** Only `libreoffice-core` and
`-common` are installed, so *every* `--convert-to` fails with a bare
`Error: source file could not be loaded` — including on a plain `.txt`, which
is the quickest way to tell this apart from a malformed docx. Fix:
`apt-get update && apt-get install -y libreoffice-writer`. `apt-get install`
without the `update` first fails with 404s on stale package URLs.

**Inline images get clipped to the inherited line height.** With a document
default of `spacing: { line: 276 }`, LibreOffice renders every `ImageRun` as a
thin horizontal strip — the cover logo, the flow, the screens, the impact-
analysis crops. The docx is valid and Word may render it correctly, so this is
only visible in the PDF proof. Every image paragraph therefore sets
`spacing: { line: 240, lineRule: AT_LEAST }`.

Related: an image wider than its table column is clipped, not scaled. The
impact-analysis crops are sized against the Screen column width (3200 twips
≈ 198px usable), not eyeballed.

## Assets

`appro_wordmark_navy.png` and `appro_wordmark_white_on_blue.png` are extracted
from the Q3 2026 newsletter PDF at 300 dpi — the real brand asset, never
redrawn. Brand blue sampled from the cover: `#3278FF`.

`ia_credit_policy.png` and `ia_ntc_scale.png` are crops of Appro's own
published newsletter graphics (the scale-collision panel and the band bars).

`Flow_ECB_Consumer_Score_3.0.png` and `Banner_Score_Segment_Display.png` are
generated from `build/*.html` via Playwright at deviceScaleFactor 2.
`SC6_Annotated_Score_Segment.png` is the key screen with the house `#FF5500`
annotation box drawn over the real composite.
