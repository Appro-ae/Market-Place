"""BRD V1.3 — built ON THE PO'S OWN EDITED FILE (golden rule 2), 07/10.

Her upload (po_review/BRD_Push_Notification_V1.2_PO_edit.docx) already carries her edits:
resuming-screen column in 3.1, P05/P08 removed, scope and 2.2/2.3 rewrites, every
"TBC by Avanza" deleted (integration items tracked with RB IT / Avanza outside the BRD),
section-1 note removed. All kept. This script adds only what the 07/10 approval and the
item-16 commitment still require:

  - Arabic content (approved loopmail) as new 3.2; subsections renumber 3.3-3.7
  - P09 / P10 / P11 wording per the approval
  - terminal-status clarification re-applied on HER scenario wording (item 16)
  - "selects or rejects the offer" in the P02 stop rules (item 16)
  - two dangling fragments completed (scenarios intro, action.type "(Updates")
  - eleven -> nine; "Unsucessful" -> "Unsuccessful"; cover/version history V1.3

    python3 build/v13_po_master.py [--proof DIR]
"""
import copy, os, secrets, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v11_apply_po_review import Doc, text, NS, W, R, A, q, to_pdf, measure, toc_pages
from v12_update_business_review import set_cell_runs, para_from, make_table
from v13_apply_event_content import ARABIC, rtl, protect
from lxml import etree
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'po_review', 'BRD_Push_Notification_V1.2_PO_edit.docx')
NAME = 'BRD_Push_Notification_V1.3'
OUT_DOCX = os.path.join(ROOT, NAME + '.docx')
OUT_PDF = os.path.join(ROOT, NAME + '.pdf')


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
            'Business-approved event content of 07/10: Arabic title and body per notification (new section '
            '3.2); P09, P10 and P11 wording per the approval; resuming screen per notification and scope '
            'updates; integration items tracked with Reem Bank IT and Avanza outside the BRD']):
        Doc.set_cell_text(tc, val)
    vh.append(row)

    # ---- counts ----
    d.replace(d.top('Trigger events and push content —', starts=True),
              'eleven notifications, each with its title, body and the screen it opens',
              'nine notifications, each with its title and body in English and Arabic, and the screen it opens')
    ia = d.table('Area', 'Impact', 'Screen')
    rowsI = {text(tr.findall('w:tc', NS)[0]).strip(): tr for tr in ia.findall('w:tr', NS)}
    d.replace(rowsI['Customer journey (Super App)'], 'eleven trigger events', 'nine trigger events')

    # ---- 3.1: approved wording + spelling ----
    t3 = d.table('Push ID', 'Resuming screen', 'Trigger event')
    rows3 = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in t3.findall('w:tr', NS)}
    Doc.set_cell_text(rows3['P09'][5], 'Your bank could not approve the request. Contact Us.')
    Doc.set_cell_text(rows3['P10'][5], 'Funds will reach your account shortly.')
    Doc.set_cell_text(rows3['P11'][5], 'Congratulations Tap to see what happens next.')
    d.replace(rows3['P04'][1], 'Unsucessful', 'Unsuccessful')

    # ---- renumber 3.2-3.6 -> 3.3-3.7 (bottom-up), then insert the Arabic section ----
    for old in ['3.6 Sending time', '3.5 Reminder and stop rules (P02)', '3.4 Device and session scenarios',
                '3.3 Language', '3.2 Content rules']:
        n = old.split(' ', 1)[0]
        new = '3.%d' % (int(n.split('.')[1]) + 1)
        d.replace(d.top(old), n, new)

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
    for rpr in new_note.iter(q('rPr')):
        for x in rpr.findall(q('color')) + rpr.findall(q('b')) + rpr.findall(q('bCs')):
            rpr.remove(x)
    ar_note.addprevious(new_note)
    d.remove(ar_note)

    # ---- 3.5 scenarios: complete her sentence, re-apply the item-16 clarification on her wording ----
    intro = d.top('Each scenario has one owner.', starts=True)
    intro.append(Doc.run('owned by Avanza.'))
    scen = d.table('Scenario', 'Owner', 'Behaviour')
    rowsS = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in scen.findall('w:tr', NS)}
    Doc.set_cell_text(rowsS['Application completed, cancelled, withdrawn, rejected or expired'][2],
                      'The outcome notification for the event itself is sent once (e.g. P03, P04, P11). After '
                      'the terminal status, no further push is sent and the P02 reminders stop immediately '
                      '(section 3.6). On a late tap, the customer is navigated to the Super App screen.')
    Doc.set_cell_text(rowsS['Customer no longer eligible'][2],
                      'A push is built only at its trigger event on a live application. On a tap, the customer '
                      'is navigated to the Super App screen.')

    # ---- 3.6 stop rules: offer rejection explicit (item 16) ----
    d.replace(d.top('P02 stops immediately when the customer selects an offer', starts=True),
              'selects an offer', 'selects or rejects the offer')

    # ---- 4.3 action.type: finish her "(Updates" fragment, no TBC ----
    req4 = None
    for el in B.iter(q('tbl')):
        first = [text(tc).strip() for tc in el.find('w:tr', NS).findall('w:tc', NS)]
        if 'Parameter' in first and 'Values / Data Source' in first and len(el.findall('w:tr', NS)) > 6:
            req4 = el
            break
    rows4 = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in req4.findall('w:tr', NS)}
    Doc.set_cell_text(rows4['action.type'][4],
                      'APPRO_JOURNEY: a tap opens the Appro journey at the screen for the event. NONE: no '
                      'forced action — the tap opens the Super App; used for P03 and P09 (per the alignment '
                      'call of 05/10). POPUP: not used by Appro.')
    return d


if __name__ == '__main__':
    master = os.path.join(HERE, '.master_v13b.pdf')
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
    if len(land) != 1:
        problems.append(f'landscape pages {land}, expected exactly one')
    if '--proof' in sys.argv:
        out = sys.argv[sys.argv.index('--proof') + 1]
        os.makedirs(out, exist_ok=True)
        x = pymupdf.open(master)
        for i, pg in enumerate(x):
            pg.get_pixmap(dpi=110).save(os.path.join(out, f'v13b_page{i + 1:02d}.png'))
        x.close()
    if not protect(master, OUT_PDF, pages2):
        problems.append('circulation PDF not protected as intended')
    os.remove(master)
    print('written', os.path.relpath(OUT_DOCX, ROOT), 'and', os.path.relpath(OUT_PDF, ROOT))
    if problems:
        sys.exit('PROBLEMS: ' + '; '.join(problems))
    print('OK')
