"""Make the circulation copy of the BRD resistant to copying.

1. Ghostscript re-writes the master with -dNoOutputFonts: every glyph becomes a
   vector outline. The pages look identical and stay sharp at any zoom, but
   there is no text layer left - nothing to select, copy-paste or extract.
2. PyMuPDF encrypts with AES-256. Opening needs no password; the owner
   password (random, never stored) is required to lift the restrictions.
   Allowed: viewing and printing. Denied: copy, text extraction, editing,
   annotating, form filling, page assembly.

Limits, stated plainly: the permission flags are honoured by mainstream
viewers but not by every tool, which is why step 1 matters - with no text
layer there is nothing to extract even when a tool ignores the flags. No file
can stop someone photographing or screenshotting a page, and an AI that is
shown those images can read them.
"""
import os, secrets, subprocess, sys
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
MASTER = os.path.join(HERE, '.master.pdf')
OUTLINED = os.path.join(HERE, '.outlined.pdf')
FINAL = os.path.join(HERE, '..', 'BRD_ECB_Consumer_Credit_Score_3.0_V1.0.pdf')

subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite',
                '-dNoOutputFonts', '-dCompatibilityLevel=1.7', '-dPDFSETTINGS=/prepress',
                '-dAutoRotatePages=/None',
                '-dDownsampleColorImages=false', '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
                '-dColorImageFilter=/FlateEncode', '-dAutoFilterColorImages=false',
                f'-sOutputFile={OUTLINED}', MASTER], check=True)

doc = pymupdf.open(OUTLINED)
doc.set_metadata({
    'title': 'ECB Consumer Credit Score 3.0 - What\'s new in Super Portal',
    'author': 'Appro Onboarding Solutions FZ-LLC',
    'subject': 'Business Requirements - V1.0 - 25 September 2026 - Confidential',
    'keywords': 'Confidential; Prepared for Reem Bank',
    'creator': 'Appro Onboarding Solutions FZ-LLC', 'producer': 'Appro',
})
perm = pymupdf.PDF_PERM_PRINT | pymupdf.PDF_PERM_PRINT_HQ
doc.save(FINAL, encryption=pymupdf.PDF_ENCRYPT_AES_256, owner_pw=secrets.token_urlsafe(24),
         user_pw='', permissions=perm, garbage=4, deflate=True)
doc.close()

# ---------------- verify ----------------
chk = pymupdf.open(FINAL)
text = ''.join(p.get_text() for p in chk).strip()
fonts = sorted({f[3] for p in chk for f in p.get_fonts()})
risky = sum(1 for x in range(1, chk.xref_length())
            if '/Type /ExtGState' in (o := chk.xref_object(x, compressed=False)) and '/SMask' in o and '/SMask /None' not in o)
print('pages          :', chk.page_count)
print('encrypted      :', chk.is_encrypted or chk.metadata.get('encryption'), '| needs password to open:', chk.needs_pass)
print('permissions    : print=%s copy=%s modify=%s annotate=%s' % tuple(
      bool(chk.permissions & f) for f in (pymupdf.PDF_PERM_PRINT, pymupdf.PDF_PERM_COPY,
                                          pymupdf.PDF_PERM_MODIFY, pymupdf.PDF_PERM_ANNOTATE)))
print('extractable text characters:', len(text))
print('embedded fonts :', fonts or 'none')
print('risky soft masks:', risky)
print('size           : %.1f MB' % (os.path.getsize(FINAL) / 1e6))
for f in (OUTLINED, MASTER): os.remove(f)
sys.exit(0 if (len(text) == 0 and not fonts and risky == 0 and not (chk.permissions & pymupdf.PDF_PERM_COPY)) else 1)
