# BRD — Push Notification (customer journey) · V1.0 · 28 September 2026

Client-facing BRD for Reem Bank, built from the RF-3306 user story
(`docs/us/RF-3306_US_Push_Notification.md`) and Avanza's *Reem Payments API — Push
Notifications Specification v0.1*. Structure from the BRD skill (overview and key covered
areas, detailed requirements, appendices); look from the house template (*Application
Cancellation in Super Portal V1.0*). No Jira references inside the document.

| Path | What it is |
|---|---|
| `BRD_Push_Notification_V1.0.docx` | **Editable deliverable** (Word) |
| `BRD_Push_Notification_V1.0.pdf` | Circulation copy — text outlined, copy / edit / extract denied, print allowed |
| `build/build_brd.js` | **Source of truth** (docx-js). Edit here, never the Word file |
| `build/build.py` | Two-pass build and checks (below) |
| `build/render.js` | Renders every figure into `assets/`; fails if a font or image did not load |
| `build/fig*.html`, `ia_*.html`, `cover_hero.html` | Figure sources (draw.io house style, `diagram.css`) |
| `assets/` | Rendered figures, house logos, and two real UAT captures: `base_audit_trail.png`, `ia_comm.png` |

## Figures

1. `Flow_Push_Notification_End_to_End.png` — trigger → build → send → deliver → tap → journey resumes
2. `Previews_Push_Notifications.png` — all eleven notifications as the customer sees them (illustrative)
3. `Flow_Push_Response_and_Retry.png` — success rule, retry every X minutes up to N, Failed after the last attempt
4. `Timeline_P02_Offer_Expiry_Reminder.png` — P02 on days 1–15, P03 at day 30, stop conditions
5. `SC1_Audit_Trail_Push_Notification_Step.png` — composite over the real Audit Trail capture: header
   row kept, two Push Notification rows drawn from measured values (Plus Jakarta Sans 25.5 px / 500,
   `#202121`, zebra `#F5FDFF` / `#FFFFFF`, 42.5 px line pitch); the only `#FF5500` box in the BRD

## Where the BRD goes beyond the US text (align the US with the PO's answers)

- Audit Step Details carries `error.message` with `error.code` when a push is not sent (the US
  response table already says `error.message` is recorded).
- The Audit Trail screen has no attempt column, so the attempt is shown inside Step Details.

## Rebuild

```
node build/render.js                  # only when a figure changes
python3 build/build.py --proof DIR    # docx -> PDF -> TOC pages -> docx -> PDF -> checks -> protected PDF
```

`build.py` fails if the TOC moves between passes, if any page is blank, or if the circulation PDF
still has a text layer, embedded fonts or copy permission. The TOC is static text with page numbers
measured on the LibreOffice PDF: after editing the Word file by hand, re-check them.
