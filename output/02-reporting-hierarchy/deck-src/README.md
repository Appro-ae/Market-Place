# Demo deck build (AMP-2548 · Sale Agent Code & Reporting Hierarchy)

Rebuild in three steps (needs `pptxgenjs` in node_modules, Playwright + Chromium, Lato in ~/.fonts):

    python3 make_wire.py                       # wireframes updated to the approved story -> wire.html
    NODE_PATH=$(npm root -g) node shoot.js     # w1..w9.png + sizes.json (2x screenshots)
    node build_deck.js                         # AMP-2548-Sale-Agent-Code-Demo.pptx (15 slides)

Official logo: the brand skill's asset bundle was empty in this session, so the deck carries a
stand-in lock-up ("appro" wordmark + 4-circle icon). Drop the real files in and rebuild:

    APPRO_LOGO_DARK=/path/logo-dark.png APPRO_LOGO_WHITE=/path/logo-white.png node build_deck.js
