"""BRD V1.3 — Business-approved event content of 07/10 (loopmail "Push Notifications - Event Content").

Shurafa's table (07/10 16:46), approved by the Head of Retail ("ok", 07/10 16:59), fixes:
  - English AND Arabic title/body for nine notifications
  - a "Resuming screen" per notification (P03 and P09: Super App — consistent with action type NONE)
  - P09 body "... Contact Us.", P10 body without "Tap for details.", P11 body with "Congratulations"
  - P05 and P08 are NOT in the approved content -> removed from the MVP scope (flagged to the PO)

    python3 build/v13_apply_event_content.py [--proof DIR]

Builds on the circulated V1.2 docx. New 3.2 "Arabic content"; subsections renumber 3.2-3.6 ->
3.3-3.7; the landscape table gains the Resuming screen column (Title column kept >= 3000 twips
so %%PLACEHOLDERS%% never split — v1.1 lesson).
"""
import copy, os, secrets, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v11_apply_po_review import Doc, text, NS, W, R, A, q, to_pdf, measure, toc_pages
from v12_update_business_review import set_cell_runs, para_from, make_table
from lxml import etree
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'BRD_Push_Notification_V1.2.docx')
NAME = 'BRD_Push_Notification_V1.3'
OUT_DOCX = os.path.join(ROOT, NAME + '.docx')
OUT_PDF = os.path.join(ROOT, NAME + '.pdf')

LANDSCAPE_W = [900, 850, 1250, 3100, 3060, 3200, 2200]            # = 14560; Title >= 3000 (placeholders)

RESUMING = {  # per the approved table, verbatim (spelling of "Unsuccessful" corrected)
    'P01': 'AIP screen (Appro SDK)',
    'P01 (CASA)': 'AIP screen (Appro SDK)',
    'P02': 'AIP screen (Appro SDK)',
    'P03': 'Super App',
    'P04': 'Application Unsuccessful screen (Appro SDK)',
    'P06': 'KFS screen (Appro SDK)',
    'P09': 'Super App',
    'P10': 'PL Congratulation screen (Appro SDK)',
    'P11': 'AIP screen (Appro SDK)',
}
ARABIC = [  # Push ID, Title (AR), Body (AR) — exact text from the approved mail
    ('P01', 'تمت الموافقة المبدئية على طلبكم', 'يُرجى الاطلاع على التفاصيل لمتابعة استكمال طلبكم.'),
    ('P01 (CASA)', 'تمت الموافقة على طلب فتح حسابكم', 'يُرجى النقر لاستكمال الإجراءات المتبقية لفتح الحساب.'),
    ('P02', 'تنتهي صلاحية التمويل المقترح خلال %%COUNTING_DOWN%% ايام',
     'يُرجى استكمال طلبكم قبل انتهاء صلاحية الموافقة الممنوحة لكم.'),
    ('P06', 'تمت إعادة تفعيل طلبكم', 'انتهت فترة التراجع. يُرجى النقر للمتابعة أو إلغاء الطلب.'),
    ('P09', 'يتطلب الخصم المباشر إجراءً منكم',
     'تعذّر اعتماد طلب الخصم المباشر من قِبل بنككم. يُرجى مراجعه البنك.'),
    ('P04', 'يوجد تحديث على طلبكم', 'يُرجى النقر للاطلاع على آخر مستجدات طلبكم.'),
    ('P10', 'جارٍ تحويل مبلغ القرض', 'سيتم إيداع المبلغ في حسابكم قريباً.'),
    ('P11', '%%PRODUCT_TYPE%% جاهز الآن', 'تهانينا, يُرجى النقر للاطلاع على الخطوات التالية.'),
    ('P03', 'انتهت مدة صلاحية الموافقة', 'يسعدنا استقبال طلبكم مجدداً في الوقت الذي يناسبكم.'),
]


def rtl(tc):
    """Right-to-left, right-aligned Arabic cell."""
    for p in tc.findall('w:p', NS):
        ppr = p.find('w:pPr', NS)
        if ppr is None:
            ppr = etree.Element(q('pPr'))
            p.insert(0, ppr)
        etree.SubElement(ppr, q('bidi'))
        jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'right')
        for r in p.findall('w:r', NS):
            rpr = r.find('w:rPr', NS)
            if rpr is None:
                rpr = etree.Element(q('rPr'))
                r.insert(0, rpr)
            etree.SubElement(rpr, q('rtl'))


def apply():
    d = Doc(SRC)
    B = d.body

    # ---- cover + version history ----
    cov = d.top('V1.2', starts=True)
    d.replace(cov, 'V1.2', 'V1.3')
    d.replace(cov, '06 October 2026', '07 October 2026')
    vh = d.table('Date', 'Version', 'Author', 'Change Description')
    row = copy.deepcopy(vh.findall('w:tr', NS)[-1])
    for tc, val in zip(row.findall('w:tc', NS), ['07-10-2026', '1.3', 'Hailey (Appro)',
            'Business-approved event content of 07/10 incorporated: English and Arabic title and body and the '
            'resuming screen for each notification; P09, P10 and P11 wording per the approval; P05 and P08 '
            'removed from the MVP scope (not part of the approved event content)']):
        Doc.set_cell_text(tc, val)
    vh.append(row)

    # ---- counts: eleven -> nine ----
    d.replace(d.top('Trigger events and push content —', starts=True),
              'eleven notifications, each with its title, body and the screen it opens',
              'nine notifications, each with its title and body in English and Arabic, and the screen it opens')
    ia = d.table('Area', 'Impact', 'Screen')
    rowsI = {text(tr.findall('w:tc', NS)[0]).strip(): tr for tr in ia.findall('w:tr', NS)}
    d.replace(rowsI['Customer journey (Super App)'], 'eleven trigger events', 'nine trigger events')

    # ---- scope ----
    d.remove(d.top('P05 — Document requested from the customer (all products)'))
    d.remove(d.top('P08 — Direct debit set up (Personal Loan)'))
    last_ns = d.top('Changes to the existing email and in-app notifications — they remain unchanged (BR1).')
    last_ns.addnext(para_from(last_ns, [(
        'P05 (document requested) and P08 (direct debit set up) — not part of the Business-approved event '
        'content of 07/10; they can be added post-MVP by the dedicated development team (section 8).', None)]))

    # ---- 3.1 landscape table: approved wording, drop P05/P08, add Resuming screen ----
    t3 = d.table('Push ID', 'Priority', 'Trigger event')
    hdr = t3.find('w:tr', NS)
    hcell = copy.deepcopy(hdr.findall('w:tc', NS)[-1])
    ts = list(hcell.iter(q('t')))
    ts[0].text = 'Resuming screen'
    for t in ts[1:]:
        t.text = ''
    hdr.append(hcell)
    for tr in list(t3.findall('w:tr', NS))[1:]:
        tcs = tr.findall('w:tc', NS)
        pid = text(tcs[0]).strip()
        if pid in ('P05', 'P08'):
            t3.remove(tr)
            continue
        if pid == 'P09':
            Doc.set_cell_text(tcs[5], 'Your bank could not approve the request. Contact Us.')
        elif pid == 'P10':
            Doc.set_cell_text(tcs[5], 'Funds will reach your account shortly.')
        elif pid == 'P11':
            Doc.set_cell_text(tcs[5], 'Congratulations Tap to see what happens next.')
        cell = copy.deepcopy(tcs[-1])
        Doc.set_cell_text(cell, RESUMING[pid])
        tr.append(cell)
    for tr in t3.findall('w:tr', NS):
        for tc, wd in zip(tr.findall('w:tc', NS), LANDSCAPE_W):
            tc.find('w:tcPr/w:tcW', NS).set(q('w'), str(wd))
    grid = t3.find('w:tblGrid', NS)
    for g in list(grid):
        grid.remove(g)
    for wd in LANDSCAPE_W:
        etree.SubElement(grid, q('gridCol')).set(q('w'), str(wd))
    t3.find('w:tblPr/w:tblW', NS).set(q('w'), str(sum(LANDSCAPE_W)))

    # ---- renumber 3.2-3.6 -> 3.3-3.7 (bottom-up), then insert the new 3.2 ----
    for old, new in [('3.6 Sending time', '3.7 Sending time'),
                     ('3.5 Reminder and stop rules (P02)', '3.6 Reminder and stop rules (P02)'),
                     ('3.4 Device and session scenarios', '3.5 Device and session scenarios'),
                     ('3.3 Language', '3.4 Language'),
                     ('3.2 Content rules', '3.3 Content rules')]:
        d.replace(d.top(old), old.split(' ', 1)[0], new.split(' ', 1)[0])

    br_tbl = d.table('No.', 'Rule')
    h2_t = d.top('3.4 Language')
    ar_tbl = make_table(br_tbl, [1340, 3300, 5000],
                        ['Push ID', 'Title (AR, max 40 characters)', 'Body (AR, max 100 characters)'],
                        [[pid, ti, bo] for pid, ti, bo in ARABIC])
    for tr in list(ar_tbl.findall('w:tr', NS))[1:]:
        tcs = tr.findall('w:tc', NS)
        rtl(tcs[1])
        rtl(tcs[2])
    rules_h2 = d.top('3.3 Content rules')
    for el in [para_from(h2_t, [('3.2 Arabic content — approved by RB Business (07/10)', None)]),
               para_from(d.top('A push is fired at the same trigger point', starts=True),
                         [('The Arabic title and body below were approved by the Business together with the '
                           'English content. The push follows the customer’s current App language (section 3.4).',
                           None)]),
               ar_tbl]:
        rules_h2.addprevious(el)

    # ---- 3.4 Language: content received ----
    ar_note = d.top('Arabic title and body for every notification', starts=True)
    new_note = para_from(ar_note, [('Arabic title and body for every notification — approved by RB Business on '
                                    '07/10 (section 3.2).', None)])
    for rpr in new_note.iter(q('rPr')):                       # the old bullet was red TBC-styled
        for x in rpr.findall(q('color')) + rpr.findall(q('b')) + rpr.findall(q('bCs')):
            rpr.remove(x)
    ar_note.addprevious(new_note)
    d.remove(ar_note)

    # ---- cross-reference: scenarios row pointed at the stop rules (now 3.6) ----
    scen = d.table('Scenario', 'Owner', 'Behaviour')
    d.replace(scen, '(section 3.5)', '(section 3.6)')

    return d


def protect(master, final, toc):
    tmp = master + '.outlined.pdf'
    subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite', '-dNoOutputFonts',
                    '-dCompatibilityLevel=1.7', '-dPDFSETTINGS=/prepress', '-dAutoRotatePages=/None',
                    '-dDownsampleColorImages=false', '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
                    '-dColorImageFilter=/FlateEncode', '-dAutoFilterColorImages=false',
                    f'-sOutputFile={tmp}', master], check=True)
    x = pymupdf.open(tmp)
    x.set_metadata({'title': 'Push Notification - Business Requirements Document',
                    'author': 'Appro Onboarding Solutions FZ-LLC',
                    'subject': 'BRD V1.3 - 07 October 2026 - Confidential',
                    'keywords': 'Confidential; Prepared for Reem Bank',
                    'creator': 'Appro Onboarding Solutions FZ-LLC', 'producer': 'Appro'})
    x.set_toc([[1, k, v] for k, v in toc.items()])
    x.save(final, encryption=pymupdf.PDF_ENCRYPT_AES_256, owner_pw=secrets.token_urlsafe(24), user_pw='',
           permissions=pymupdf.PDF_PERM_PRINT | pymupdf.PDF_PERM_PRINT_HQ, garbage=4, deflate=True)
    x.close()
    os.remove(tmp)
    c = pymupdf.open(final)
    ok = not ''.join(pg.get_text() for pg in c).strip() and not any(pg.get_fonts() for pg in c) \
        and not (c.permissions & pymupdf.PDF_PERM_COPY)
    c.close()
    return ok


if __name__ == '__main__':
    master = os.path.join(HERE, '.master_v13.pdf')
    d = apply()
    d.save(OUT_DOCX)
    to_pdf(OUT_DOCX, master)
    pages1, n1, _, _ = measure(master)
    toc_pages(d, pages1)
    d.save(OUT_DOCX)
    to_pdf(OUT_DOCX, master)
    pages2, n2, blank, land = measure(master)
    print('pages', n2, '| landscape', land, '| blank', blank or 'none')
    for k, v in pages2.items():
        print(f'  p{v:<3} {k}')
    problems = []
    if pages1 != pages2 or n1 != n2:
        problems.append('TOC moved between passes')
    if blank:
        problems.append(f'blank pages {blank}')
    if land != [6]:
        problems.append(f'landscape pages {land}, expected [6]')
    if '--proof' in sys.argv:
        out = sys.argv[sys.argv.index('--proof') + 1]
        os.makedirs(out, exist_ok=True)
        x = pymupdf.open(master)
        for i, pg in enumerate(x):
            pg.get_pixmap(dpi=110).save(os.path.join(out, f'v13_page{i + 1:02d}.png'))
        x.close()
    if not protect(master, OUT_PDF, pages2):
        problems.append('circulation PDF not protected as intended')
    os.remove(master)
    print('written', os.path.relpath(OUT_DOCX, ROOT), 'and', os.path.relpath(OUT_PDF, ROOT))
    if problems:
        sys.exit('PROBLEMS: ' + '; '.join(problems))
    print('OK')
