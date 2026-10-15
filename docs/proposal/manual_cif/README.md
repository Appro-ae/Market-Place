# Check Manual CIF — Interim Solution Proposal (Reem Bank executive deck)

`Check_Manual_CIF_Proposal_RB.pdf` — 9 pages, 16:9, prepared for Reem Bank CEO/Exco review
(15 October 2026). Appro branding per the brand skill (dark executive style, Lato, brand
palette, 4-circle icon, client-facing confidentiality footer). Protected: text outlined via
Ghostscript (nothing selectable or extractable), AES-256, copy/extract denied, print allowed.

Storyline: cover → executive summary (gap → proposal → 3-week banner) → context (digital vs
manual CIFs) → solution (one check, three layers) → trigger-point blueprint (real Credit Card
workflow with the Pre-Dedupe highlight; on a match EFR 1.2/1.12 and all other integrations are
not called) → customer experience (termination screen placeholder + approved Email/SMS copy) →
delivery plan (BRD gate → 2wk dev → 1wk RB SIT → RB UAT/Expleo; dedicated squad, no CR) →
asks (BRD sign-off, Manual CIF list, content review) + beyond-the-interim (portal-maintained
list = separate customization; status naming open for the BRD) → closing.

| Path | What it is |
|---|---|
| `Check_Manual_CIF_Proposal_RB.pdf` | Protected circulation deck |
| `build/deck.html` | **Source of truth** — edit here, then rebuild |
| `build/render_pdf.js` | deck.html → vector PDF (playwright chromium) |
| `build/build.py` | Full build: render → outline fonts → AES-256 protect → verify |
| `build/assets/` | Lato (google/fonts), white wordmark (derived from the BRD house asset), workflow blueprint crop with computed highlight coordinates |

Rebuild: `python3 build/build.py [--proof DIR]` (fails if text, fonts or copy permission leak
into the protected PDF). The blueprint crop/highlights come from
`docs/workflow/credit_card/original/…drawio.pdf` — coordinates recomputed in build notes if the
workflow master changes.
