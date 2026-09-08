# Demo deck build (AMP-2548 · Sale Agent Code & Reporting Hierarchy)

Rebuild in three steps (needs `pptxgenjs` in node_modules, Playwright + Chromium, Lato in ~/.fonts):

    python3 make_wire.py                       # wireframes updated to the approved story -> wire.html
    NODE_PATH=$(npm root -g) node shoot.js     # w1..w9.png + sizes.json (2x screenshots)
    node build_deck.js                         # AMP-2548-Sale-Agent-Code-Demo.pptx (14 slides)

## Logo

`logo-dark.png` and `logo-white.png` are the official Appro wordmark, native 2000×580
(ratio 3.448), with a transparent background so the same artwork sits correctly on the
lavender cover and on the navy / blue areas. They were produced from the navy master supplied
by the PO with `make_logos.py`: the alpha channel comes from the artwork's own ink coverage and
only the ink colour differs between the two versions — the shapes are never redrawn.

`build_deck.js` picks them up automatically from this folder and always derives the height from
the native ratio, so the logo can never be stretched. To point at different files:

    APPRO_LOGO_DARK=/path/logo-dark.png APPRO_LOGO_WHITE=/path/logo-white.png node build_deck.js

If the source master changes, re-run `python3 make_logos.py` (expects the navy-on-white master
as `upload_3.png`) and rebuild.
