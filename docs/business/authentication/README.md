# Bank Portal Authentication — business document

Client-facing document covering password sign-in and single sign-on for the Bank Portal.

- `Bank_Portal_Authentication_v1.0.docx` — the document (Appro brand, Lato)
- `Bank_Portal_Authentication_v1.0.pdf` — preview render
- `fig/` — Figures 1–5, rendered from `build/fig*.html`
- `build/build.py` — generates the .docx (`python3 build/build.py <out.docx>`)

Sources: AMP-3402 (Part 1), AMP-3718 (Part 2), AMP-3723 (Part 3, planned), Confluence CM8 Login/Logout,
SMBP Secure Password Policies, Marketplace message list.

Rebuild needs: python-docx, Lato fonts in `assets/fonts/` (Google Fonts), Playwright + Chromium for figures.
Screenshot placeholders 1–15 are listed in Appendix B of the document.
