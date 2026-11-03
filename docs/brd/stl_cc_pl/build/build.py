"""Build the Salary Transfer (CC+PL) BRD: Word (editable) + PDF (circulation copy).

    python3 build/build.py [--proof DIR]

1. node build_brd.js -> .docx (pass 1, TOC page numbers unknown)
2. LibreOffice -> PDF; heading bookmarks give each section's page
3. page numbers -> build/.toc.json; node build_brd.js again (pass 2) -> final PDF
4. checks: TOC stable between passes, no blank page, every figure present
(Ghostscript is unavailable in this container, so the circulation PDF is not
font-outlined/AES-protected in this build; the .docx stays the editable master.)
"""
import json, os, shutil, subprocess, sys
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NAME = 'BRD_Salary_Transfer_CC_PL_V1.0'
DOCX = os.path.join(ROOT, NAME + '.docx')
FINAL = os.path.join(ROOT, NAME + '.pdf')
TOC = os.path.join(HERE, '.toc.json')


def node():
    subprocess.run(['node', os.path.join(HERE, 'build_brd.js')], check=True, cwd=ROOT)


def to_pdf(dst):
    out = os.path.join(HERE, '.pdfout')
    os.makedirs(out, exist_ok=True)
    r = subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', out, DOCX],
                       capture_output=True, text=True)
    src = os.path.join(out, NAME + '.pdf')
    if r.returncode or not os.path.exists(src):
        sys.exit('LibreOffice conversion failed:\n' + r.stdout + r.stderr)
    shutil.move(src, dst)
    shutil.rmtree(out, ignore_errors=True)


def measure(pdf):
    d = pymupdf.open(pdf)
    toc = {t[1]: t[2] for t in d.get_toc() if t[0] == 1}
    n = d.page_count
    blank = [i + 1 for i, pg in enumerate(d) if not pg.get_text().strip() and not pg.get_images()]
    imgs = sum(len(pg.get_images()) for pg in d)
    d.close()
    return toc, n, blank, imgs


if os.path.exists(TOC):
    os.remove(TOC)
node(); to_pdf(FINAL)
toc1, n1, _, _ = measure(FINAL)
if not toc1:
    sys.exit('No heading bookmarks in the PDF — cannot number the TOC')
json.dump(toc1, open(TOC, 'w'), indent=1, ensure_ascii=False)
node(); to_pdf(FINAL)
toc2, n2, blank, imgs = measure(FINAL)
print('pages', n2, '| images', imgs, '| blank', blank or 'none')
problems = []
if toc1 != toc2 or n1 != n2:
    problems.append(f'TOC moved between passes ({n1} -> {n2})')
if blank:
    problems.append(f'blank pages: {blank}')
if problems:
    sys.exit('PROBLEMS: ' + '; '.join(problems))

if '--proof' in sys.argv:
    out = sys.argv[sys.argv.index('--proof') + 1]
    os.makedirs(out, exist_ok=True)
    d = pymupdf.open(FINAL)
    for i, pg in enumerate(d):
        pg.get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(os.path.join(out, f'p{i+1:02d}.png'))
    d.close()
    print('proof pages ->', out)
