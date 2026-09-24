# RF-3329 screen composites

Composites are built over the REAL portal captures — never lookalike mockups.
Each HTML page is self-contained: full-bleed base capture `<img>` plus absolutely
positioned overlays that repaint only the elements that change. Colours were
sampled from the base with PIL; typography is Plus Jakarta Sans from Google Fonts.

| Output | Base capture | What is drawn |
|---|---|---|
| `SC3_Rule_Engine_Values_Score_3.0.png` | `SC2_Rule_Engine_Values_Current.png` | Dropdown rows repainted with Score 3.0 values (M6–N2, scrolled to the M→N boundary), scrollbar thumb moved to match, hover tooltip retitled. |
| `SC5_Score_Check_Mgmt_AECB_Score_Range.png` | `SC4_Score_Check_Mgmt_Current.jpg` | Condition card extended, divider added, new `AECB Score Range / Is in / M6, M7, M8, M9` row. |

Sampled values: highlight `#e8f1f7` · row text `#404345` · scrollbar `#76a8d3`
· tooltip `#dedfe1` on `#434344` · card border `#f2f2f2` · divider `#f8f8fa`
· label `#262628` · operator grey `#73787b`.

Rebuild: `node build/render.js` (Chromium at `/opt/pw-browsers/chromium-1194`,
deviceScaleFactor 1 so the base capture stays pixel-exact).
