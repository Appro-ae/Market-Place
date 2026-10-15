# Credit Card Workflow (Reem Bank) — editable master

## Master: `Credit_Card_Workflow_final_25092025.drawio`

The PO's own diagram, recovered 1:1 from her PDF export: a draw.io PDF carries the full
diagram XML in its metadata, so this is the **exact original source** (draw.io 28.2.5,
1 page, 2 swimlanes, 143 nodes / 83 edges) — not a redraw. Only repair applied: the PDF
string-escaping (`\(` `\)`, 59 pairs) was unescaped back to plain parentheses.

Open and edit directly in **draw.io desktop** or **app.diagrams.net** (File → Open).
For requirement changes, edit this XML surgically — never redraw over it.

| Path | What it is |
|---|---|
| `Credit_Card_Workflow_final_25092025.drawio` | **Editable master** (draw.io XML) |
| `assets/Credit_Card_Workflow_final_25092025.png` | Full-resolution render (2x) of the master |
| `original/Credit_Card_Workflow_final_25092025.drawio.pdf` | The PO's export of 25/09/2025, byte-for-byte |
| `build/render.js` | Headless render: master → PNG via the vendored draw.io viewer |
| `build/viewer-static.min.js` | draw.io viewer, self-contained build (jgraph/drawio) |
| `build/vendor/` | Stencils (azure, flowchart, veeam 2d, ios7 icons, drawio v24.7.17) + hand-icon stand-in |

## Rebuild the PNG after an edit

```
cd docs/workflow/credit_card
NODE_PATH=/opt/node22/lib/node_modules node build/render.js
```

External requests are served from `build/vendor/` or blocked, so renders are
reproducible offline and the master XML is never touched by the renderer.

## Known quirks (in the original)

- The four manual-queue hand icons reference `cdn1.iconfinder.com` (blocked here);
  the render substitutes a local ☞ stand-in — in draw.io online the real icon shows.
- Cell `id=213` is a stray edge label containing pasted, URL-encoded diagram XML
  (invisible in renders). Harmless; cleanup pending the PO's OK.
