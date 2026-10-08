"""BRD V1.4 — the proceed-baseline for MVP 1.1 development (08/10).

The Head of Retail replied "please proceed" (08/10) on the current scope. V1.4 is the
baseline version: no content change from V1.3, cover and version history only.

    python3 build/v14_baseline.py
"""
import copy, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v11_apply_po_review import Doc, NS, q, to_pdf, measure, toc_pages
from v13_apply_event_content import protect
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'BRD_Push_Notification_V1.3.docx')
OUT_DOCX = os.path.join(ROOT, 'BRD_Push_Notification_V1.4.docx')
OUT_PDF = os.path.join(ROOT, 'BRD_Push_Notification_V1.4.pdf')

d = Doc(SRC)
cov = d.top('V1.3', starts=True)
d.replace(cov, 'V1.3', 'V1.4')
d.replace(cov, '07 October 2026', '08 October 2026')
vh = d.table('Date', 'Version', 'Author', 'Change Description')
row = copy.deepcopy(vh.findall('w:tr', NS)[-1])
for tc, val in zip(row.findall('w:tc', NS), ['08-10-2026', '1.4', 'Hailey (Appro)',
        'Baseline version for MVP 1.1 development — Business approval to proceed received (Head of '
        'Retail, 08/10). No content change from V1.3.']):
    Doc.set_cell_text(tc, val)
vh.append(row)

master = os.path.join(HERE, '.master_v14.pdf')
d.save(OUT_DOCX)
to_pdf(OUT_DOCX, master)
pages1, n1, _, _ = measure(master)
toc_pages(d, pages1)
d.save(OUT_DOCX)
to_pdf(OUT_DOCX, master)
pages2, n2, blank, land = measure(master)
print('pages', n2, '| landscape', land, '| blank', blank or 'none')
problems = []
if pages1 != pages2 or n1 != n2:
    problems.append('TOC moved between passes')
if blank:
    problems.append(f'blank pages {blank}')
import re
x = pymupdf.open(master)
t1 = x[0].get_text()
assert 'V1.4' in t1 and '08 October 2026' in t1, 'cover not updated'
x.close()


def protect_v14(m, f, toc):                 # same pipeline, V1.4 metadata
    import subprocess, secrets
    tmp = m + '.outlined.pdf'
    subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite', '-dNoOutputFonts',
                    '-dCompatibilityLevel=1.7', '-dPDFSETTINGS=/prepress', '-dAutoRotatePages=/None',
                    '-dDownsampleColorImages=false', '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
                    '-dColorImageFilter=/FlateEncode', '-dAutoFilterColorImages=false',
                    f'-sOutputFile={tmp}', m], check=True)
    y = pymupdf.open(tmp)
    y.set_metadata({'title': 'Push Notification - Business Requirements Document',
                    'author': 'Appro Onboarding Solutions FZ-LLC',
                    'subject': 'BRD V1.4 - 08 October 2026 - Confidential',
                    'keywords': 'Confidential; Prepared for Reem Bank',
                    'creator': 'Appro Onboarding Solutions FZ-LLC', 'producer': 'Appro'})
    y.set_toc([[1, k, v] for k, v in toc.items()])
    y.save(f, encryption=pymupdf.PDF_ENCRYPT_AES_256, owner_pw=secrets.token_urlsafe(24), user_pw='',
           permissions=pymupdf.PDF_PERM_PRINT | pymupdf.PDF_PERM_PRINT_HQ, garbage=4, deflate=True)
    y.close()
    os.remove(tmp)
    c = pymupdf.open(f)
    ok = not ''.join(pg.get_text() for pg in c).strip() and not any(pg.get_fonts() for pg in c) \
        and not (c.permissions & pymupdf.PDF_PERM_COPY)
    c.close()
    return ok


if not protect_v14(master, OUT_PDF, pages2):
    problems.append('circulation PDF not protected as intended')
os.remove(master)
print('written BRD_Push_Notification_V1.4.docx and .pdf')
if problems:
    sys.exit('PROBLEMS: ' + '; '.join(problems))
print('OK')
