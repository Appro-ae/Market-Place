"""Build the Push Notification BRD: Word (editable) + PDF (circulation copy).

    python3 build/build.py [--proof DIR]

1. node build_brd.js -> .docx (pass 1, TOC page numbers unknown)
2. LibreOffice -> PDF; the heading bookmarks give each section's page
3. page numbers -> build/.toc.json; node build_brd.js again (pass 2) -> PDF
4. checks: TOC stable between passes, no blank page, every figure present
5. circulation PDF: text turned into outlines (Ghostscript -dNoOutputFonts) and
   AES-256 with copy / edit / extract denied, print allowed (same as the Score 3.0 BRD)
--proof DIR also writes page PNGs and a contact sheet for visual review.
"""
import json, os, secrets, shutil, subprocess, sys
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NAME = 'BRD_Push_Notification_V1.0'
DOCX = os.path.join(ROOT, NAME + '.docx')
FINAL = os.path.join(ROOT, NAME + '.pdf')
MASTER = os.path.join(HERE, '.master.pdf')
TOC = os.path.join(HERE, '.toc.json')


def node():
    subprocess.run(['node', os.path.join(HERE, 'build_brd.js')], check=True, cwd=ROOT)


def to_pdf():
    out = os.path.join(HERE, '.pdfout')
    os.makedirs(out, exist_ok=True)
    r = subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', out, DOCX],
                       capture_output=True, text=True)
    src = os.path.join(out, NAME + '.pdf')
    if r.returncode or not os.path.exists(src):
        sys.exit('LibreOffice conversion failed:\n' + r.stdout + r.stderr)
    shutil.move(src, MASTER)
    shutil.rmtree(out, ignore_errors=True)


def measure():
    d = pymupdf.open(MASTER)
    toc = {t[1]: t[2] for t in d.get_toc() if t[0] == 1}
    n = d.page_count
    blank = [i + 1 for i, pg in enumerate(d) if not pg.get_text().strip() and not pg.get_images()]
    imgs = sum(len(pg.get_images()) for pg in d)
    d.close()
    return toc, n, blank, imgs


if os.path.exists(TOC):
    os.remove(TOC)
node(); to_pdf()
toc1, n1, _, _ = measure()
if not toc1:
    sys.exit('No heading bookmarks in the PDF - cannot number the TOC')
json.dump(toc1, open(TOC, 'w'), indent=1, ensure_ascii=False)
node(); to_pdf()
toc2, n2, blank, imgs = measure()

print('pages          :', n2)
for k, v in toc2.items():
    print(f'  p{v:<3} {k}')
problems = []
if toc1 != toc2 or n1 != n2:
    problems.append('TOC moved between passes')
if blank:
    problems.append(f'blank pages {blank}')
print('images placed  :', imgs)

if '--proof' in sys.argv:
    out = sys.argv[sys.argv.index('--proof') + 1]
    os.makedirs(out, exist_ok=True)
    d = pymupdf.open(MASTER)
    thumbs = []
    for i, pg in enumerate(d):
        pix = pg.get_pixmap(dpi=110)
        f = os.path.join(out, f'page{i + 1:02d}.png')
        pix.save(f)
        thumbs.append(f)
    d.close()
    from PIL import Image
    ims = [Image.open(f) for f in thumbs]
    tw = 420
    ims = [im.resize((tw, int(im.size[1] * tw / im.size[0]))) for im in ims]
    cols = 4
    rows = (len(ims) + cols - 1) // cols
    th = ims[0].size[1]
    sheet = Image.new('RGB', (cols * (tw + 16) + 16, rows * (th + 16) + 16), '#8a8f98')
    for i, im in enumerate(ims):
        sheet.paste(im, (16 + (i % cols) * (tw + 16), 16 + (i // cols) * (th + 16)))
    sheet.save(os.path.join(out, 'contact_sheet.png'))
    print('proofs         :', out)

# ---------------- circulation copy ----------------
OUTLINED = os.path.join(HERE, '.outlined.pdf')
subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite', '-dNoOutputFonts',
                '-dCompatibilityLevel=1.7', '-dPDFSETTINGS=/prepress', '-dAutoRotatePages=/None',
                '-dDownsampleColorImages=false', '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
                '-dColorImageFilter=/FlateEncode', '-dAutoFilterColorImages=false',
                f'-sOutputFile={OUTLINED}', MASTER], check=True)
d = pymupdf.open(OUTLINED)
d.set_metadata({'title': 'Push Notification - Business Requirements Document', 'author': 'Appro Onboarding Solutions FZ-LLC',
                'subject': 'BRD V1.0 - 28 September 2026 - Confidential', 'keywords': 'Confidential; Prepared for Reem Bank',
                'creator': 'Appro Onboarding Solutions FZ-LLC', 'producer': 'Appro'})
d.set_toc([[1, k, v] for k, v in toc2.items()])          # keep the section bookmarks in the reader
d.save(FINAL, encryption=pymupdf.PDF_ENCRYPT_AES_256, owner_pw=secrets.token_urlsafe(24), user_pw='',
       permissions=pymupdf.PDF_PERM_PRINT | pymupdf.PDF_PERM_PRINT_HQ, garbage=4, deflate=True)
d.close()
os.remove(OUTLINED)

chk = pymupdf.open(FINAL)
text = ''.join(pg.get_text() for pg in chk).strip()
fonts = sorted({f[3] for pg in chk for f in pg.get_fonts()})
print('circulation PDF: %s  %.1f MB  pages=%d  text chars=%d  fonts=%s  copy=%s' % (
      os.path.relpath(FINAL, ROOT), os.path.getsize(FINAL) / 1e6, chk.page_count, len(text), fonts or 'none',
      bool(chk.permissions & pymupdf.PDF_PERM_COPY)))
if text or fonts or (chk.permissions & pymupdf.PDF_PERM_COPY) or chk.page_count != n2:
    problems.append('circulation PDF not protected as intended')
chk.close()
os.remove(MASTER) if '--keep' not in sys.argv else None

if problems:
    sys.exit('PROBLEMS: ' + '; '.join(problems))
print('OK')
