"""Build the protected proposal PDF.

deck.html --(render_pdf.js / chromium)--> .master.pdf --(gs outline + AES-256)-->
Check_Manual_CIF_Proposal_RB.pdf : text outlined (nothing selectable or extractable),
copy/extract denied, print allowed.

    python3 build/build.py [--proof DIR]
"""
import os, secrets, subprocess, sys
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MASTER = os.path.join(HERE, '.master.pdf')
FINAL = os.path.join(ROOT, 'Check_Manual_CIF_Proposal_RB.pdf')

subprocess.run(['node', os.path.join(HERE, 'render_pdf.js')], check=True,
               env={**os.environ, 'NODE_PATH': '/opt/node22/lib/node_modules'})

tmp = MASTER + '.outlined.pdf'
subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite', '-dNoOutputFonts',
                '-dCompatibilityLevel=1.7', '-dPDFSETTINGS=/prepress', '-dAutoRotatePages=/None',
                '-dDownsampleColorImages=false', '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
                '-dColorImageFilter=/FlateEncode', '-dAutoFilterColorImages=false',
                f'-sOutputFile={tmp}', MASTER], check=True)
x = pymupdf.open(tmp)
x.set_metadata({'title': 'Check Manual CIF - Interim Solution Proposal',
                'author': 'Appro Onboarding Solutions FZ-LLC',
                'subject': 'Prepared for Reem Bank - Executive Review - 15 October 2026 - Confidential',
                'keywords': 'Confidential; Prepared for Reem Bank',
                'creator': 'Appro Onboarding Solutions FZ-LLC', 'producer': 'Appro'})
x.save(FINAL, encryption=pymupdf.PDF_ENCRYPT_AES_256, owner_pw=secrets.token_urlsafe(24), user_pw='',
       permissions=pymupdf.PDF_PERM_PRINT | pymupdf.PDF_PERM_PRINT_HQ, garbage=4, deflate=True)
x.close()
os.remove(tmp)

c = pymupdf.open(FINAL)
ok = not ''.join(pg.get_text() for pg in c).strip() and not any(pg.get_fonts() for pg in c) \
    and not (c.permissions & pymupdf.PDF_PERM_COPY)
n = c.page_count
if '--proof' in sys.argv:
    out = sys.argv[sys.argv.index('--proof') + 1]
    os.makedirs(out, exist_ok=True)
    for i, pg in enumerate(c):
        pg.get_pixmap(dpi=100).save(os.path.join(out, f'deck_page{i + 1:02d}.png'))
c.close()
print('pages', n, '| protected:', 'OK' if ok else 'FAILED (text/fonts/copy-permission leaked)')
if not ok:
    sys.exit(1)
print('written', os.path.relpath(FINAL, ROOT))
