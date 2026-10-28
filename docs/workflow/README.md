# Reem Finance product workflows — draw.io masters

Native draw.io sources for the three digital-journey workflows, rebuilt 28/10 from the PO's
latest images (the originals existed only as pictures). Every step badge sits ON its box
(top-left corner) per the PO's instruction of 28/10; the CC flow carries her step-11 change
(Biometric & MPIN verification).

| Product | Master (editable in draw.io / app.diagrams.net) | Version |
|---|---|---|
| Credit Card (NSTL NTB) | `cc_ntb/Reem_Finance_NSTL_NTB_CC_Workflow_v1.6.drawio` | v1.6 — 28/10 |
| CASA | `casa/Reem_Finance_CASA_Workflow_v1.0.drawio` | v1.0 — 28/10 |
| Personal Loan | `personal_loan/Reem_Finance_Personal_Loan_Workflow_v1.0.drawio` | v1.0 — 28/10 |

Each product folder: the `.drawio` master, `assets/<name>.png` (full-resolution render),
`build/<product>.py` (the generator — the layout/content source of truth for agent edits).

Shared tooling in `_build/`: `wflib.py` (mxGraphModel generator, house style vocabulary
lifted from the PO's own file — lanes, legend, badges-on-box, terminals, manual-queue hand,
mail/phone icons) and `render_any.js` (offline render via the vendored draw.io viewer in
`../credit_card/build/`).

Update loop (either direction):
- Agent-side: edit the product's `build/*.py`, run it, then
  `NODE_PATH=/opt/node22/lib/node_modules node _build/render_any.js <master.drawio> <assets/png>`.
  Hand edits made directly in the `.drawio` are also fine — the file is the master; regenerate
  the PNG the same way (the generator then no longer reflects the file and is retired for that
  product).
- PO-side: open the `.drawio` in draw.io, edit, save — send the file back (or a draw.io PDF
  export, which embeds the XML) and the repo + artifact get updated and the version bumped.

`credit_card/` is the earlier 25/09 Credit Card master recovered from the PO's PDF export —
kept as history; superseded by `cc_ntb/` v1.6.
