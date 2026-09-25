# RF-3329 screen composites

Composites are built over the REAL portal captures — never lookalike mockups.
Each page is the full-bleed capture plus absolutely positioned overlays that
repaint only the elements that change.

| Output | Base capture | What is drawn |
|---|---|---|
| `SC3_Rule_Engine_Values_Score_3.0.png` | `SC2_Rule_Engine_Values_Current.png` | Value list repainted with the Score 3.0 codes, scrolled to the M→N boundary; scrollbar thumb moved to match; hover tooltip retitled. |
| `SC5_Score_Check_Mgmt_AECB_Score_Range.png` | `SC4_Score_Check_Mgmt_Current.jpg` | Condition card extended by one 46px band; divider added; new `AECB Score Range / Is in / M6, M7, M8, M9` row. |
| `SC6_Rule_Engine_AECB_Score_Segment.png` | `SC2_Rule_Engine_Values_Current.png` | Criterion chip changed from `AECB Score Range` to `AECB Score Segment`; value list repainted to the two segments; tooltip retitled. Cropped to y188–446. |

## Measured from the captures — do not guess these again

Everything below was sampled with PIL from the base captures, not eyeballed.

**Rule Engine capture (`SC2`, 876×446)**

| Element | Geometry | Colour |
|---|---|---|
| Dropdown panel interior | x315–581, y35–306 | `#fff` |
| List row | 40px tall, text at x336 | text `#0D0D0D`, **17px**, letter-spacing .08px |
| Row highlight | x323–567, 40px tall, radius 4 | `#E8F1F7` |
| Scrollbar thumb | x569–573, 30px tall | `#76A8D3` |
| Criterion chip | y320–345, padding 0 11px, gap 8px, radius 4 | border `#76A8D3`, fill `#F7FCFF`, text `#3C88A8`, **16.2px** |
| Native hover tooltip | x405–610, y275–308, **square corners** | fill `#DEDFE1`, text `#434344`, **22.5px** |

The tooltip is an OS-level tooltip, so it does not scale with the page — it
renders ~1.3× the page text size. Do not draw it at the row size.

**Score Check Management capture (`SC4`, 2000×913)**

| Element | Geometry | Colour |
|---|---|---|
| Condition card | x1048–1803, 1px border | `#F2F2F2` |
| Row band | 46px; existing row y400–445; divider above at y398 | divider `#F8F8FA` |
| Attribute label | bold **13.5px** | `#2B2B2D` |
| Operator / value | **14px**, gap 15px | `#7D7E81` |

## The font trap

`fonts.googleapis.com` cannot be reached from this container — Chromium rejects
the agent proxy's CA (`net::ERR_CERT_AUTHORITY_INVALID`) and **silently falls
back to a system sans**. Composites built before 25 Sep 2026 were drawn in the
wrong typeface for this reason and had to be redone.

Plus Jakarta Sans is therefore vendored: `fonts/pjs-latin.woff2` (fetched with
curl, which does trust the proxy CA) is inlined as base64 into
`fonts/pjs-inline.css`. `render2.js` **fails the build** if
`document.fonts` reports no loaded face, so the fallback can never ship again.

## Rebuild

```
python3 shift_placeholder.py   # only needed if SC2 changes
node render2.js
```

Chromium at `/opt/pw-browsers/chromium-1194`, `deviceScaleFactor: 1` so the base
capture stays pixel-exact.

## Honesty rules applied here

* Nothing behind an overlay is reconstructed. The SC6 dropdown keeps the
  captured panel's full frame with only two options in it, because shrinking the
  panel would mean inventing the page content it covers.
* The SC6 value input (`Select value` + magnifier) was not redrawn — those exact
  pixels were lifted and re-seated 20px right, which is what the wider
  `AECB Score Segment` chip does to the real layout.
* The SC6 tooltip is wider than `Mature` needs. Narrowing it would mean
  inventing the page content to its right, so it was left at captured width.
