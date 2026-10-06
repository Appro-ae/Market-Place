"""BRD V1.2 — incorporate the Reem Bank business review of 29/09 and middleware spec v0.2.

Base: the repo V1.1 docx, FIRST aligned to the PO's final PDF (she removed the
"Opens at (deep-link screen)" column and the "Priority: P0 highest." note in her
own last edit; her final also lost the 1.1 version-history row — restored here
and disclosed). Then the review package, per the PO's decisions of 05/10:

  Fadel 1/15  -> section 9 Future enhancements (dedicated team, post-MVP, no CR)
  Fadel 2     -> section 3.5 device and session scenarios with owner
  Fadel 3     -> per the PO's 06/10 reply: deep-link detail beyond the Avanza API
                 structure is next phase (no destinations section; P03/P09 = NONE
                 noted in 4.3 per the 05/10 alignment call)
  Fadel 4     -> section 3.6 reminder and stop rules (interval/count backend params)
  Fadel 5     -> BR5 duplicates / same requestId on retry
  Fadel 7     -> new wording P01, P04, P09; P05 proposed (pending document channel)
  Fadel 8     -> section 3.7 sending time (scheduled pushes 10:00 UAE)
  Fadel 9     -> backend tracking fields + Contact-Centre support bridge (section 5)
  Fadel 10    -> retry values to be confirmed by RB Business (06/10); error codes 4.5
  Fadel 11    -> spec v0.2 values folded into section 4; open items in 4.6
  Fadel 14    -> acceptance criteria are outside the business BRD (06/10)
  Fadel 12    -> not in the business BRD (PO principle: no NFRs)

    python3 build/v12_update_business_review.py [--proof DIR]
"""
import copy, os, secrets, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v11_apply_po_review import (Doc, text, NS, W, R, A, q, TBC_RPR,
                                 to_pdf, measure, toc_pages)
from lxml import etree
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'BRD_Push_Notification_V1.1.docx')
NAME = 'BRD_Push_Notification_V1.2'
OUT_DOCX = os.path.join(ROOT, NAME + '.docx')
OUT_PDF = os.path.join(ROOT, NAME + '.pdf')

PORTRAIT_W = 9640          # text width used by every portrait table in the house template
BOLD_RPR = '<w:rPr xmlns:w="%s"><w:b/><w:bCs/></w:rPr>' % W


def set_cell_runs(tc, parts):
    """Replace a cell's content with one paragraph of (text, rpr_xml|None) runs."""
    ps = tc.findall('w:p', NS)
    for extra in ps[1:]:
        tc.remove(extra)
    p = ps[0]
    runs = p.findall('w:r', NS)
    base = copy.deepcopy(runs[0].find('w:rPr', NS)) if runs and runs[0].find('w:rPr', NS) is not None else None
    if base is not None:
        for b in base.findall('w:b', NS) + base.findall('w:bCs', NS) + base.findall('w:color', NS):
            base.remove(b)
    for r in [r for r in p if r.tag != q('pPr')]:
        p.remove(r)
    for txt, rpr in parts:
        r = etree.SubElement(p, q('r'))
        r.append(etree.fromstring(rpr) if rpr else
                 (copy.deepcopy(base) if base is not None else etree.fromstring('<w:rPr xmlns:w="%s"/>' % W)))
        t = etree.SubElement(r, q('t'))
        t.text = txt
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')


def para_from(tmpl, parts):
    """Clone tmpl paragraph, keep its pPr, replace the runs with (text, rpr_xml|None)."""
    p = copy.deepcopy(tmpl)
    for el in list(p):
        if el.tag != q('pPr'):
            p.remove(el)
    ppr = p.find('w:pPr', NS)
    if ppr is not None:                                      # a clone never carries a section break
        for s in ppr.findall('w:sectPr', NS):
            ppr.remove(s)
    base = None
    for r in tmpl.findall('w:r', NS):
        if r.find('w:rPr', NS) is not None:
            base = copy.deepcopy(r.find('w:rPr', NS))
            break
    for txt, rpr in parts:
        r = etree.SubElement(p, q('r'))
        if rpr:
            r.append(etree.fromstring(rpr))
        elif base is not None:
            b2 = copy.deepcopy(base)
            for x in b2.findall('w:b', NS) + b2.findall('w:bCs', NS) + b2.findall('w:color', NS):
                b2.remove(x)
            r.append(b2)
        t = etree.SubElement(r, q('t'))
        t.text = txt
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return p


def make_table(tmpl_tbl, widths, header, rows):
    """New house-style table from a 2-column template (BUSINESS RULES)."""
    tbl = copy.deepcopy(tmpl_tbl)
    trs = tbl.findall('w:tr', NS)
    for extra in trs[2:]:
        tbl.remove(extra)
    hdr, data = trs[0], trs[1]

    def fit(tr, n):
        tcs = tr.findall('w:tc', NS)
        while len(tcs) < n:
            tr.append(copy.deepcopy(tcs[-1]))
            tcs = tr.findall('w:tc', NS)
        for extra in tcs[n:]:
            tr.remove(extra)
        for tc, wd in zip(tr.findall('w:tc', NS), widths):
            tc.find('w:tcPr/w:tcW', NS).set(q('w'), str(wd))
    fit(hdr, len(widths))
    fit(data, len(widths))
    for tc, val in zip(hdr.findall('w:tc', NS), header):
        texts = list(tc.iter(q('t')))
        texts[0].text = val
        for t in texts[1:]:
            t.text = ''
    grid = tbl.find('w:tblGrid', NS)
    for g in list(grid):
        grid.remove(g)
    for wd in widths:
        etree.SubElement(grid, q('gridCol')).set(q('w'), str(wd))
    tbl.find('w:tblPr/w:tblW', NS).set(q('w'), str(sum(widths)))
    proto = copy.deepcopy(data)
    tbl.remove(data)
    for row in rows:
        tr = copy.deepcopy(proto)
        for tc, val in zip(tr.findall('w:tc', NS), row):
            set_cell_runs(tc, val if isinstance(val, list) else [(val, None)])
        tbl.append(tr)
    return tbl


def apply():
    d = Doc(SRC)
    B = d.body

    # ---------- 0. align to the PO's final PDF ----------
    t3 = d.table('Push ID', 'Priority', 'Trigger event')          # the landscape table
    for tr in t3.findall('w:tr', NS):                             # a) drop "Opens at" column
        tcs = tr.findall('w:tc', NS)
        assert len(tcs) == 7
        tr.remove(tcs[-1])
        tcs[-2].find('w:tcPr/w:tcW', NS).set(q('w'), '4800')      # body column takes the width
    grid = t3.find('w:tblGrid', NS)
    cols = grid.findall('w:gridCol', NS)
    grid.remove(cols[-1])
    cols[-2].set(q('w'), '4800')
    note = d.top('Priority: P0 highest.')                         # b) note removed; its sectPr stays
    for r in [r for r in note if r.tag != q('pPr')]:
        note.remove(r)
    # c) her final lost the 1.1 version-history row; the repo copy still has it — kept (disclosed).

    # ---------- 1. cover, version history ----------
    cov = d.top('V1.1', starts=True)
    d.replace(cov, 'V1.1', 'V1.2')
    d.replace(cov, '28 September 2026', '06 October 2026')
    vh = d.table('Date', 'Version', 'Author', 'Change Description')
    row = copy.deepcopy(vh.findall('w:tr', NS)[-1])
    for tc, val in zip(row.findall('w:tc', NS), ['06-10-2026', '1.2', 'Hailey (Appro)',
            'Business review of 29/09 incorporated: updated wording for P01, P04, P05 and P09; device and '
            'session scenarios; reminder stop rules and sending time; middleware specification v0.2 values and '
            'error codes (05/10), retry values to be confirmed by Business; duplicate-prevention rule BR5; '
            'future enhancements (post-MVP, dedicated development team)']):
        Doc.set_cell_text(tc, val)
    vh.append(row)

    # ---------- 2. overview note ----------
    note1 = d.top('Note: Push content is fixed per notification', starts=True)
    note1.append(Doc.run(' Business-managed configuration and Super Portal visibility are planned as post-MVP '
                         'enhancements (section 8).',
                         '<w:rPr xmlns:w="%s"><w:i/><w:iCs/></w:rPr>' % W))

    # ---------- 3. wording (Fadel 7, PO-accepted 05/10) ----------
    rows3 = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in t3.findall('w:tr', NS)}
    Doc.set_cell_text(rows3['P01'][4], 'Your offer is ready')
    Doc.set_cell_text(rows3['P01'][5], 'Review your offer and continue your application.')
    Doc.set_cell_text(rows3['P04'][4], 'There’s an update on your application')
    Doc.set_cell_text(rows3['P04'][5], 'Tap to view the latest status of your application.')
    Doc.set_cell_text(rows3['P09'][4], 'Your direct debit needs attention')
    Doc.set_cell_text(rows3['P09'][5], 'Your bank could not approve the request. Tap to review the next steps.')
    Doc.set_cell_text(rows3['P05'][4], 'One more document is needed')
    set_cell_runs(rows3['P05'][5], [('Tap to see which document is needed and how to share it. ', None),
                                    ('Wording to be confirmed with Business once the document channel is agreed.',
                                     TBC_RPR)])

    # ---------- templates for new content ----------
    h1_t = d.top('7. IMPACT ANALYSIS')
    h2_t = d.top('3.3 Language')
    body_t = d.top('A push is fired at the same trigger point', starts=True)
    li_t = d.top('OTP messages — never sent as push (BR3).')
    br_tbl = d.table('No.', 'Rule')

    def h2(txt):
        return para_from(h2_t, [(txt, None)])

    def li(parts):
        return para_from(li_t, parts if isinstance(parts, list) else [(parts, None)])

    def body(parts, bold=False):
        p = para_from(body_t, parts if isinstance(parts, list) else [(parts, None)])
        if bold:
            for rpr in p.findall('w:r/w:rPr', NS):
                etree.SubElement(rpr, q('b'))
        return p

    # ---------- 3.4–3.6 (Fadel 2, 4, 8; deep-link detail deferred per the PO, 06/10) ----------
    sec4 = d.top('4. PUSH NOTIFICATION API INTEGRATION')
    scen = make_table(br_tbl, [2700, 1500, 5440],
        ['Scenario', 'Owner', 'Behaviour'],
        [['Customer logged out or session expired', 'Super App',
          'The Super App completes the login first, then opens the Appro journey at the screen for the event.'],
         ['Customer changed device, or multiple registered devices', 'Super App',
          'The push follows the device-token registration held by the Super App.'],
         ['Push permission disabled on the device', 'Super App',
          'No device alert. The application and the existing email and in-app notifications continue unchanged.'],
         ['Device token invalid or expired', 'Middleware',
          'The middleware returns 404 UNREGISTERED — tracked in the backend as Failed, no retry (section 4.5).'],
         ['Application completed, cancelled, withdrawn, rejected or expired', 'Appro',
          'No further push is sent and reminders stop immediately (section 3.5). On a late tap, the journey '
          'opens the application status screen.'],
         ['Customer no longer eligible', 'Appro',
          'A push is built only at its trigger event on a live application — no event, no push.']])
    for el in [h2('3.4 Device and session scenarios'),
               body([('Each scenario has one owner. Appro rows are covered by this BRD; the Super App and '
                      'middleware rows are ', None), ('TBC by Avanza', TBC_RPR), ('.', None)]),
               scen,
               h2('3.5 Reminder and stop rules (P02)'),
               li('P02 is sent once per day for 15 days, starting after the first offer is displayed. The '
                  'interval and the maximum count are backend configuration parameters (default: daily, 15).'),
               li('P02 stops immediately when the customer selects an offer, or when the application is '
                  'completed, cancelled or withdrawn, rejected or expired, or the product is booked or issued.'),
               li('One push per Push ID per trigger occurrence per application (BR5).'),
               h2('3.6 Sending time'),
               li('Event-driven pushes are sent immediately at the trigger event.'),
               li('Scheduled pushes — the P02 reminder and P03 (offer expired) — are released at 10:00 UAE '
                  'time (backend configuration parameter).')]:
        sec4.addprevious(el)

    # ---------- 4. spec v0.2 values ----------
    hdr4 = d.table('Parameter', 'Type', 'Description', 'Values / Data Source')      # 4.2 header params
    rows4 = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in hdr4.findall('w:tr', NS)}
    Doc.set_cell_text(rows4['stan'][4], 'Generated by Appro, unique per request. 6–12 characters '
                                        '(specification v0.2).')
    req4 = None                                                                     # 4.3 request params
    for el in B.iter(q('tbl')):
        first = [text(tc).strip() for tc in el.find('w:tr', NS).findall('w:tc', NS)]
        if 'Parameter' in first and 'Values / Data Source' in first and el is not hdr4:
            req4 = el
            break
    rows5 = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in req4.findall('w:tr', NS)}
    set_cell_runs(rows5['requestId'][4], [('Generated by Appro, unique per push. Every retry reuses the same '
                                           'requestId. ', None),
                                          ('TBC by Avanza: middleware de-duplication on the requestId.', TBC_RPR)])
    set_cell_runs(rows5['action.type'][4], [('APPRO_JOURNEY: a tap opens the Appro journey at the screen for the event. NONE: '
                                             'no forced action — the tap opens the Super App; used for P03 and '
                                             'P09 (call of 05/10). POPUP: not used by Appro. ', None),
                                            ('TBC by Avanza: Super App hand-over of action.id and action.value '
                                             'to the Appro journey.', TBC_RPR)])
    Doc.set_cell_text(rows5['recipient.mobilePhone'][4], 'From the application. Format 9715XXXXXXXX — country '
                                                         'code 971, no plus sign (specification v0.2).')
    Doc.set_cell_text(rows5['content.message'][4], 'Sent empty (""). Pop-up content, used only with action '
                                                   'type POPUP (specification v0.2).')
    Doc.set_cell_text(rows5['content.language'][3], 'Language — "EN" / "AR"')
    Doc.set_cell_text(rows5['content.language'][4], 'Customer’s current language — "EN" or "AR" '
                                                    '(specification v0.2).')
    resp = d.table('Parameter', 'Type', 'Description', 'Values / Handling')          # 4.4 response params
    rowsR = {text(tr.findall('w:tc', NS)[0]).strip(): tr.findall('w:tc', NS) for tr in resp.findall('w:tr', NS)}
    Doc.set_cell_text(rowsR['error.code'][3], '"000" = Processed Ok. Full error-code list in section 4.5.')

    sec5 = d.top('5. RESPONSE HANDLING AND RETRY')
    codes = make_table(br_tbl, [1300, 3400, 4940],
        ['Code', 'Description', 'Appro handling'],
        [['000', 'PROCESSED OK', 'Push sent — tracked in the backend as Success.'],
         ['403', 'SENDER_ID_MISMATCH', 'Final, no retry — configuration issue, raised with Avanza. Tracked '
                                       'as Failed.'],
         ['404', 'UNREGISTERED', 'Final, no retry — the device token is not registered. Tracked as Failed.'],
         ['429', 'QUOTA_EXCEEDED', 'Retried per section 5.'],
         ['500', 'INTERNAL SERVER ERROR', 'Retried per section 5.']])
    for el in [h2('4.5 Error codes (middleware specification v0.2)'),
               codes,
               body([('Retry classification proposed by Appro — TBC by Avanza.', TBC_RPR)]),
               h2('4.6 Open items with Avanza'),
               body('Open as of 06 October 2026 (our questions of 28/09; specification v0.2 and the alignment '
                    'call of 05/10 closed the rest):'),
               li([('Middleware endpoint and credentials per environment. ', None), ('TBC by Avanza', TBC_RPR)]),
               li([('channel_id value assigned to Appro. ', None), ('TBC by Avanza', TBC_RPR)]),
               li([('De-duplication on the requestId when a retry resends the same id. ', None),
                   ('TBC by Avanza', TBC_RPR)]),
               li([('Super App hand-over of action.id and action.value to the Appro journey, and keeping the '
                    'destination through the login. ', None), ('TBC by Avanza', TBC_RPR)])]:
        sec5.addprevious(el)

    # ---------- 5. retry baseline ----------
    rt = d.top('Else → the system retries automatically', starts=True)
    d.replace(rt, '. X and N are configurable.',
              '. The interval and the number of attempts are backend configuration parameters.')
    ec = d.top('The full error-code list, and any code that should not be retried', starts=True)
    nxt = para_from(ec, [('Error codes 429 and 500, and a timeout, are retried. 403 and 404 are final and are '
                          'not retried (section 4.5).', None)])
    ec.addprevious(nxt)
    rid = para_from(ec, [('Every retry reuses the same requestId, so a retry never creates a duplicate '
                          'notification (BR5).', None)])
    ec.addprevious(rid)
    ec.addprevious(para_from(ec, [('Retry interval (X) and number of attempts (N) – To be confirmed by RB '
                                   'Business', TBC_RPR)]))
    d.remove(ec)
    trk = d.top('The system tracks the API delivery result only,', starts=True)
    trk.append(Doc.run(' The backend record per push: Push ID, date and time, number of attempts, final status '
                       '(Success / Failed) and the failure reason. Until a Super Portal view is available '
                       '(section 8), Appro support provides the status of a push for a given application on '
                       'request from the Contact Centre.'))
    cap2 = d.top('Figure 2 —', starts=True)

    # ---------- figures re-rendered with the baseline values ----------
    for cap, png in ((d.top('Figure 1 —', starts=True), 'Flow_Push_Notification_End_to_End.png'),
                     (cap2, 'Flow_Push_Response_and_Retry.png')):
        blip = cap.getprevious().find('.//a:blip', NS)
        shutil.copy(os.path.join(ROOT, 'assets', png), d.p('word', d.rel_target(blip.get('{%s}embed' % R))))

    # ---------- 6. BR5 ----------
    br_row = copy.deepcopy(br_tbl.findall('w:tr', NS)[-1])
    tcs = br_row.findall('w:tc', NS)
    set_cell_runs(tcs[0], [('BR5', '<w:rPr xmlns:w="%s"><w:b/><w:bCs/></w:rPr>' % W)])
    Doc.set_cell_text(tcs[1], 'One notification per event: a push is sent once per Push ID per trigger '
                              'occurrence per application, and every retry reuses the same requestId — a '
                              'system retry, timeout or reprocessing never creates a duplicate.')
    br_tbl.append(br_row)

    # ---------- 7. impact analysis ----------
    ia = d.table('Area', 'Impact', 'Screen')
    rowsI = {text(tr.findall('w:tc', NS)[0]).strip(): tr for tr in ia.findall('w:tr', NS)}
    Doc.set_cell_text(rowsI['Audit trail'].findall('w:tc', NS)[1],
                      'No change in this release. Push results are tracked in the backend only; Appro support '
                      'provides the status of a push on request (section 5). A Super Portal view is a post-MVP '
                      'enhancement (section 8).')

    # ---------- 8 + 9: acceptance criteria, future enhancements ----------
    app = d.top('APPENDIX 1: SAMPLE REQUEST/RESPONSE')

    def h1(txt, bmname, bmid):
        p = copy.deepcopy(h1_t)
        bm = p.find('w:bookmarkStart', NS)
        bm.set(q('name'), bmname)
        bm.set(q('id'), bmid)
        be = p.find('w:bookmarkEnd', NS)
        if be is not None:
            be.set(q('id'), bmid)
        ts = list(p.iter(q('t')))
        ts[0].text = txt
        for t in ts[1:]:
            t.text = ''
        return p

    for el in [h1('8. FUTURE ENHANCEMENTS (POST-MVP)', 'sec14', '914'),
               body('The items below are agreed as enhancements after the MVP 1.1 sign-off, delivered by the '
                    'dedicated development team based on launch feedback — not as change requests. The MVP '
                    'design is scalable, so they are added on the same framework, without redesign.'),
               li('Business-managed configuration in Super Portal, wherever technically feasible without '
                  'source-code modification: enable / disable per notification, English and Arabic content, '
                  'reminder frequency and maximum count, validity period, priority, trigger and product '
                  'mapping, and new Push IDs.'),
               li('Sending notifications from Super Portal.'),
               li('Push visibility in Super Portal: an audit-trail entry or a notification report with the '
                  'sent / failed status per application.'),
               li('Configurable sending hours and customer local time.'),
               li('Additional products, journeys and notification types on the same framework.')]:
        app.addprevious(el)

    # ---------- TOC lines for 8 and 9 ----------
    toc_app = None
    for el in B:
        if el.tag == q('p'):
            hl = el.find('w:hyperlink', NS)
            if hl is not None and hl.get(q('anchor')) == 'sec13':
                toc_app = el
                break
    for anchor, title in (('sec14', '8. FUTURE ENHANCEMENTS (POST-MVP)'),):
        line = copy.deepcopy(toc_app)
        hl = line.find('w:hyperlink', NS)
        hl.set(q('anchor'), anchor)
        ts = list(hl.iter(q('t')))
        ts[0].text = title
        for t in ts[1:]:
            t.text = ''
        toc_app.addprevious(line)

    # ---------- appendix: sample request per spec v0.2 ----------
    d.replace(d.top('Sample request').getnext(), '"requestId": "123456789101112",',
              '"requestId": "1234567891011121",')
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
                    'subject': 'BRD V1.2 - 06 October 2026 - Confidential',
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
    master = os.path.join(HERE, '.master_v12.pdf')
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
    if land != [5]:
        problems.append(f'landscape pages {land}, expected [5]')
    if '--proof' in sys.argv:
        out = sys.argv[sys.argv.index('--proof') + 1]
        os.makedirs(out, exist_ok=True)
        x = pymupdf.open(master)
        for i, pg in enumerate(x):
            pg.get_pixmap(dpi=110).save(os.path.join(out, f'v12_page{i + 1:02d}.png'))
        x.close()
    if not protect(master, OUT_PDF, pages2):
        problems.append('circulation PDF not protected as intended')
    os.remove(master)
    print('written', os.path.relpath(OUT_DOCX, ROOT), 'and', os.path.relpath(OUT_PDF, ROOT))
    if problems:
        sys.exit('PROBLEMS: ' + '; '.join(problems))
    print('OK')
