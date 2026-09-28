"""BRD V1.1 — apply the PO's review to HER edited Word file.

From V1.1 the PO's Word file is the master (golden rule 2: never regenerate over her
edits). This script edits her file surgically; build_brd.js is the V1.0 history.

    python3 build/v11_apply_po_review.py <PO V1.1.docx> [--proof DIR]

Her review comments (28/09):
  1. Combine 3.1 and 3.2 in one table          -> one 7-column table on a landscape page
                                                  (own full-width footer), placeholders never split
  2. Push is too technical for the audit trail -> section 7 Audit Trail and its composite removed;
     keep track in the backend                    wording in 1, 4.4, 5, impact analysis and both flows
  3. Sample request exactly as the middleware  -> request and response verbatim from spec v0.1
Consistency after her own cuts (disclosed to her): cover + version history V1.1, sections
renumbered (8->6, 9->7), Figure 3->2, TOC rebuilt with measured page numbers, dangling
references fixed (removed Source templates column, removed section 10, removed section 6).
"""
import copy, json, os, re, secrets, shutil, subprocess, sys, tempfile, zipfile
from lxml import etree
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NAME = 'BRD_Push_Notification_V1.1'
OUT_DOCX = os.path.join(ROOT, NAME + '.docx')
OUT_PDF = os.path.join(ROOT, NAME + '.pdf')

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
PR = 'http://schemas.openxmlformats.org/package/2006/relationships'
NS = {'w': W, 'r': R, 'a': A}
q = lambda t: '{%s}%s' % (W, t)

# ---- sample request / response: verbatim from Reem Payments API Push Notifications Specification v0.1 ----
SPEC_REQUEST = [
    '{',
    '\t"requestId": "123456789101112",',
    '\t"timestamp": "2020-07-20T06:49:02.366Z",',
    '\t"type": "APPRO_NOTIFICATION",',
    '\t"action": {',
    '\t\t"id": "P01",',
    '\t\t"type": "APPRO_JOURNEY",',
    '\t\t"value": "CASA"',
    '\t},',
    '\t"recipient": {',
    '\t\t"mobilePhone": "971528045456 ",',
    '\t\t"customerId": "104278",',
    '\t\t"email": "abc@test.com"',
    '\t},',
    '\t"content": {',
    '\t\t"title": "CASA Journey",',
    '\t\t"body": "Please resume your CASA journey",',
    '\t\t"message": "",',
    '\t\t"language": "EN"',
    '\t}',
    '}',
]
SPEC_RESPONSE = [
    '{',
    '  "messageId": "0:1790341509514173%d5881a7ad5881a7a",',
    '  "error": {',
    '    "code": "000",',
    '    "message": "Processed Ok"',
    '  }',
    '}',
]
LANDSCAPE_W = [900, 850, 1250, 3760, 3000, 2800, 2000]           # = 14560 twips (A4 landscape text width);
# widths balanced by a line-wrap simulation so all 11 rows fit one page; Title >= 3000 keeps every
# %%PLACEHOLDER%% whole (LibreOffice may break between the two %), Priority >= 850 keeps its header word whole
TBC_RPR = '<w:rPr xmlns:w="%s"><w:b/><w:bCs/><w:color w:val="C00000"/></w:rPr>' % W   # her TBC style


def text(el):
    return ''.join((t.text or '') if t.tag == q('t') else '\t' for t in el.iter(q('t'), q('tab')))


class Doc:
    def __init__(self, src):
        self.dir = tempfile.mkdtemp(prefix='brd11_')
        with zipfile.ZipFile(src) as z:
            z.extractall(self.dir)
            self.order = z.namelist()
        self.p = lambda *a: os.path.join(self.dir, *a)
        self.tree = etree.parse(self.p('word', 'document.xml'))
        self.body = self.tree.getroot().find('w:body', NS)
        self.rels = etree.parse(self.p('word', '_rels', 'document.xml.rels'))
        self.dropped_rids = set()

    # ---------- lookup ----------
    def top(self, txt, starts=False):
        for el in self.body:
            if el.tag == q('p'):
                s = text(el).strip()
                if (s.startswith(txt) if starts else s == txt):
                    return el
        raise KeyError(txt)

    def table(self, *headers):
        for el in self.body:
            if el.tag == q('tbl'):
                first = [text(tc).strip() for tc in el.find('w:tr', NS).findall('w:tc', NS)]
                if all(h in first for h in headers):
                    return el
        raise KeyError(headers)

    def rel_target(self, rid):
        for r in self.rels.getroot():
            if r.get('Id') == rid:
                return r.get('Target')
        raise KeyError(rid)

    # ---------- edits ----------
    @staticmethod
    def replace(el, old, new, count=1):
        n = 0
        for t in el.iter(q('t')):
            if t.text and old in t.text:
                t.text = t.text.replace(old, new)
                t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                n += 1
        assert n == count, f'{old!r}: {n} hits, expected {count}'

    def remove(self, el):
        for b in el.iter('{%s}blip' % A):
            self.dropped_rids.add(b.get('{%s}embed' % R))
        el.getparent().remove(el)

    def remove_range(self, first, last):
        kids = list(self.body)
        for el in kids[kids.index(first):kids.index(last) + 1]:
            self.remove(el)

    @staticmethod
    def set_cell_text(tc, value):
        ps = tc.findall('w:p', NS)
        for extra in ps[1:]:
            tc.remove(extra)
        p = ps[0]
        runs = p.findall('w:r', NS)
        rpr = copy.deepcopy(runs[0].find('w:rPr', NS)) if runs and runs[0].find('w:rPr', NS) is not None else None
        for r in p:
            if r.tag != q('pPr'):
                p.remove(r)
        r = etree.SubElement(p, q('r'))
        if rpr is not None:
            for b in rpr.findall('w:b', NS) + rpr.findall('w:bCs', NS):
                rpr.remove(b)
            r.append(rpr)
        t = etree.SubElement(r, q('t'))
        t.text = value
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')

    @staticmethod
    def run(txt, rpr_xml=None):
        r = etree.Element(q('r'))
        if rpr_xml:
            r.append(etree.fromstring(rpr_xml))
        t = etree.SubElement(r, q('t'))
        t.text = txt
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        return r

    def code_block(self, tbl, lines):
        tc = tbl.find('.//w:tc', NS)
        tmpl = tc.find('w:p', NS)
        rpr = tmpl.find('w:r/w:rPr', NS)
        for p in tc.findall('w:p', NS):
            tc.remove(p)
        for line in lines:
            p = etree.SubElement(tc, q('p'))
            if tmpl.find('w:pPr', NS) is not None:
                p.append(copy.deepcopy(tmpl.find('w:pPr', NS)))
            r = etree.SubElement(p, q('r'))
            if rpr is not None:
                r.append(copy.deepcopy(rpr))
            for i, chunk in enumerate(line.split('\t')):
                if i:
                    etree.SubElement(r, q('tab'))
                if chunk:
                    t = etree.SubElement(r, q('t'))
                    t.text = chunk
                    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')

    # ---------- package ----------
    def add_landscape_footer(self):
        """footer4 = her default footer (label, confidentiality, dots, page no.) widened to landscape."""
        x = open(self.p('word', 'footer2.xml'), encoding='utf8').read()
        assert '<w:gridCol w:w="7240"/>' in x
        x = x.replace('<w:gridCol w:w="7240"/>', '<w:gridCol w:w="12160"/>')
        x = re.sub(r'(<w:tblW w:w=")9640(")', r'\g<1>14560\2', x)
        x = re.sub(r'(<w:tcW w:w=")7240(")', r'\g<1>12160\2', x)
        x = re.sub(r' w14:(paraId|textId)="[0-9A-F]+"', '', x)                  # ids must stay unique per document
        x = re.sub(r'(<wp:docPr id=")(\d+)(")', lambda m: f'{m.group(1)}{9000 + int(m.group(2))}{m.group(3)}', x)
        open(self.p('word', 'footer4.xml'), 'w', encoding='utf8').write(x)
        shutil.copy(self.p('word', '_rels', 'footer2.xml.rels'), self.p('word', '_rels', 'footer4.xml.rels'))
        ct = open(self.p('[Content_Types].xml'), encoding='utf8').read()
        ct = ct.replace('</Types>', '<Override PartName="/word/footer4.xml" ContentType="application/'
                        'vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>')
        open(self.p('[Content_Types].xml'), 'w', encoding='utf8').write(ct)
        etree.SubElement(self.rels.getroot(), '{%s}Relationship' % PR, Id='rIdLandscapeFooter',
                         Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
                         Target='footer4.xml')
        return 'rIdLandscapeFooter'

    def drop_orphan_media(self):
        xml = etree.tostring(self.tree).decode()
        for rid in self.dropped_rids:
            if f'"{rid}"' in xml:
                continue                                   # still used elsewhere
            for r in list(self.rels.getroot()):
                if r.get('Id') == rid:
                    target = r.get('Target')
                    self.rels.getroot().remove(r)
                    others = [os.path.join(dp, f) for dp, _, fs in os.walk(self.dir) for f in fs if f.endswith('.rels')]
                    used = any(target in open(o, encoding='utf8').read() for o in others
                               if not o.endswith('document.xml.rels'))
                    if not used and os.path.exists(self.p('word', target)):
                        os.remove(self.p('word', target))

    def save(self, out):
        self.tree.write(self.p('word', 'document.xml'), xml_declaration=True, encoding='UTF-8', standalone=True)
        self.rels.write(self.p('word', '_rels', 'document.xml.rels'), xml_declaration=True, encoding='UTF-8', standalone=True)
        names = [n for n in self.order if os.path.exists(self.p(n))]
        for extra in ('word/footer4.xml', 'word/_rels/footer4.xml.rels'):
            if os.path.exists(self.p(extra)) and extra not in names:
                names.append(extra)
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
            for n in names:
                z.write(self.p(n), n)


def apply(src):
    d = Doc(src)
    B = d.body

    # ---- cover + version history ----
    d.replace(d.top('V1.0', starts=True), 'V1.0', 'V1.1')
    vh = d.table('Date', 'Version', 'Author', 'Change Description')
    row = copy.deepcopy(vh.findall('w:tr', NS)[-1])
    for tc, val in zip(row.findall('w:tc', NS), ['28-09-2026', '1.1', 'Hailey (Appro)',
            'Trigger events and push content in one table; push results tracked in the backend only, '
            'not on the audit trail; sample request and response exactly as the middleware specification']):
        Doc.set_cell_text(tc, val)
    vh.append(row)

    # ---- 1. overview ----
    d.remove(d.top('Duplicate and reminder control'))           # section 6 was removed by the PO
    d.remove(d.top('Audit trail — one new step per push'))
    d.replace(d.top('The result is recorded in the application audit trail.', starts=True),
              'recorded in the application audit trail', 'tracked in the backend')

    # ---- 3. one table for trigger events and push content, on a landscape page ----
    h1_3 = d.top('3. TRIGGER POINTS AND PUSH CONTENT')
    d.replace(d.top('3.1 Trigger events'), '3.1 Trigger events', '3.1 Trigger events and push content')
    d.replace(d.top('A push is fired at the same trigger point', starts=True),
              'notification templates listed under Source templates.', 'notification for the same event.')
    t1 = d.table('Push ID', 'Priority', 'Trigger event')
    t2 = d.table('Push ID', 'Title (EN, max 40 characters)')
    by_id = {text(tr.findall('w:tc', NS)[0]).strip(): tr for tr in t2.findall('w:tr', NS)}
    for tr in t1.findall('w:tr', NS):
        tr2 = by_id[text(tr.findall('w:tc', NS)[0]).strip()]
        for tc in tr2.findall('w:tc', NS)[1:]:
            tr.append(copy.deepcopy(tc))
        for tc, wd in zip(tr.findall('w:tc', NS), LANDSCAPE_W):
            tc.find('w:tcPr/w:tcW', NS).set(q('w'), str(wd))
            for side in ('top', 'bottom'):                      # tighter rows: one landscape page
                m = tc.find(f'w:tcPr/w:tcMar/w:{side}', NS)
                if m is not None:
                    m.set(q('w'), '40')
    grid = t1.find('w:tblGrid', NS)
    for g in list(grid):
        grid.remove(g)
    for wd in LANDSCAPE_W:
        etree.SubElement(grid, q('gridCol')).set(q('w'), str(wd))
    t1.find('w:tblPr/w:tblW', NS).set(q('w'), str(sum(LANDSCAPE_W)))
    d.remove(d.top('3.2 Push content'))
    d.remove(t2)
    note = d.top('Source templates:', starts=True)                # column removed by the PO
    for r in [r for r in note if r.tag != q('pPr')]:
        note.remove(r)
    note.append(Doc.run('Priority: P0 highest.'))
    sp = note.find('w:pPr/w:spacing', NS)
    if sp is None:
        ppr = note.find('w:pPr', NS)
        if ppr is None:
            ppr = etree.Element(q('pPr')); note.insert(0, ppr)
        sp = etree.SubElement(ppr, q('spacing'))
    sp.set(q('before'), '40')
    d.replace(d.top('3.3 Content rules'), '3.3', '3.2')
    d.replace(d.top('3.4 Language'), '3.4', '3.3')

    body_sect = B.find('w:sectPr', NS)
    sect_a = copy.deepcopy(body_sect)                            # cover .. section 2: portrait, title page
    last_of_2 = h1_3.getprevious()
    last_of_2.find('w:pPr', NS).append(sect_a)
    pbb = h1_3.find('w:pPr/w:pageBreakBefore', NS)
    if pbb is not None:
        pbb.getparent().remove(pbb)
    sect_b = copy.deepcopy(body_sect)                            # section 3 table: landscape
    for el in sect_b.findall('w:headerReference', NS) + sect_b.findall('w:footerReference', NS) + sect_b.findall('w:titlePg', NS):
        sect_b.remove(el)
    ref = etree.Element(q('footerReference'))
    ref.set(q('type'), 'default')
    ref.set('{%s}id' % R, d.add_landscape_footer())
    sect_b.insert(0, ref)
    pg = sect_b.find('w:pgSz', NS)
    pg.set(q('w'), '16838'); pg.set(q('h'), '11906'); pg.set(q('orient'), 'landscape')
    note_ppr = note.find('w:pPr', NS)
    if note_ppr is None:
        note_ppr = etree.Element(q('pPr')); note.insert(0, note_ppr)
    note_ppr.append(sect_b)
    for el in body_sect.findall('w:titlePg', NS):                # rest of the document: footer on every page
        body_sect.remove(el)

    # ---- 4. API ----
    for t in B.iter(q('t')):
        if t.text and 'Per section 3.2,' in t.text:
            t.text = t.text.replace('Per section 3.2,', 'Per section 3.1,')
    resp = d.table('Parameter', 'Type', 'Description', 'Values / Handling')
    d.replace(resp, 'Recorded in the audit trail with error.code', 'Tracked in the backend with error.code')
    d.replace(resp, 'Recorded in the audit trail', 'Tracked in the backend')

    # ---- 5. response handling ----
    ok = d.top('If the HTTP code is', starts=True)
    d.replace(ok, 'audit trail Step Status = ', 'tracked in the backend as ')
    ko = d.top('If the push is still not successful', starts=True)
    d.replace(ko, 'audit trail Step Status = ', 'tracked in the backend as ')
    d.replace(d.top('The system tracks the API delivery result only.', starts=True),
              'The system tracks the API delivery result only.',
              'The system tracks the API delivery result only, in the backend; it is not shown in the Super Portal audit trail.')
    cap3 = d.top('Figure 3 —', starts=True)
    d.replace(cap3, 'Figure 3 —', 'Figure 2 —')

    # ---- figures: new renders (same pixel size, so the placed size is unchanged) ----
    for cap, png in ((d.top('Figure 1 —', starts=True), 'Flow_Push_Notification_End_to_End.png'),
                     (cap3, 'Flow_Push_Response_and_Retry.png')):
        blip = cap.getprevious().find('.//a:blip', NS)
        shutil.copy(os.path.join(ROOT, 'assets', png), d.p('word', d.rel_target(blip.get('{%s}embed' % R))))

    # ---- 7. audit trail: removed (tracked in the backend only) ----
    d.remove_range(d.top('7. AUDIT TRAIL'), d.top('Figure 5 —', starts=True))
    d.replace(d.top('8. BUSINESS RULES'), '8. BUSINESS RULES', '6. BUSINESS RULES')
    d.replace(d.top('9. IMPACT ANALYSIS'), '9. IMPACT ANALYSIS', '7. IMPACT ANALYSIS')

    # ---- impact analysis ----
    ia = d.table('Area', 'Impact', 'Screen')
    rows = {text(tr.findall('w:tc', NS)[0]).strip(): tr for tr in ia.findall('w:tr', NS)}
    audit = rows['Audit trail'].findall('w:tc', NS)
    Doc.set_cell_text(audit[1], 'No change. Push results are tracked in the backend only and are not shown in the Super Portal audit trail.')
    for b in audit[2].iter('{%s}blip' % A):
        d.dropped_rids.add(b.get('{%s}embed' % R))
    for p in audit[2].findall('w:p', NS):
        audit[2].remove(p)
    audit[2].append(copy.deepcopy(rows['Reporting'].findall('w:tc', NS)[2].find('w:p', NS)))
    mw = rows['Middleware integration'].findall('w:tc', NS)[1]
    for t in mw.iter(q('t')):
        if t.text and 'see section 10.' in t.text:
            t.text = t.text.replace('see section 10.', '')
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')   # keep the space before the TBC
            r = t.getparent()
            r.addnext(Doc.run('.'))
            r.addnext(Doc.run('TBC by Avanza', TBC_RPR))
            break
    else:
        raise KeyError('see section 10.')

    # ---- appendix: sample request / response verbatim ----
    d.code_block(d.top('Sample request').getnext(), SPEC_REQUEST)
    d.code_block(d.top('Sample response').getnext(), SPEC_RESPONSE)

    # ---- table of contents: entries for the sections that remain ----
    names = {}
    for el in B:
        if el.tag == q('p'):
            bm = el.find('w:bookmarkStart', NS)
            if bm is not None and bm.get(q('name'), '').startswith('sec'):
                names[bm.get(q('name'))] = text(el).strip()
    for el in list(B):
        hl = el.find('w:hyperlink', NS) if el.tag == q('p') else None
        if hl is None or not (hl.get(q('anchor')) or '').startswith('sec'):
            continue
        anchor = hl.get(q('anchor'))
        if anchor not in names:
            d.remove(el)
            continue
        ts = list(hl.iter(q('t')))
        ts[0].text = names[anchor]
        for t in ts[1:]:
            t.text = ''
    d.drop_orphan_media()
    return d, names


def toc_pages(d, pages):
    """Write measured page numbers into the TOC lines (the run after each hyperlink)."""
    for el in d.body:
        hl = el.find('w:hyperlink', NS) if el.tag == q('p') else None
        if hl is None:
            continue
        title = text(hl).strip()
        if title in pages:
            after = [t for r in el.findall('w:r', NS) for t in r.findall('w:t', NS)]
            after[-1].text = str(pages[title])


def to_pdf(docx, pdf):
    out = tempfile.mkdtemp(prefix='brd11pdf_')
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', out, docx], check=True, capture_output=True)
    shutil.move(os.path.join(out, os.path.basename(docx)[:-5] + '.pdf'), pdf)


def measure(pdf):
    x = pymupdf.open(pdf)
    toc = {t[1]: t[2] for t in x.get_toc() if t[0] == 1}
    blank = [i + 1 for i, pg in enumerate(x) if not pg.get_text().strip() and not pg.get_images()]
    landscape = [i + 1 for i, pg in enumerate(x) if pg.rect.width > pg.rect.height]
    n = x.page_count
    x.close()
    return toc, n, blank, landscape


def protect(master, final, toc):
    tmp = master + '.outlined.pdf'
    subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-sDEVICE=pdfwrite', '-dNoOutputFonts',
                    '-dCompatibilityLevel=1.7', '-dPDFSETTINGS=/prepress', '-dAutoRotatePages=/None',
                    '-dDownsampleColorImages=false', '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
                    '-dColorImageFilter=/FlateEncode', '-dAutoFilterColorImages=false',
                    f'-sOutputFile={tmp}', master], check=True)
    x = pymupdf.open(tmp)
    x.set_metadata({'title': 'Push Notification - Business Requirements Document', 'author': 'Appro Onboarding Solutions FZ-LLC',
                    'subject': 'BRD V1.1 - 28 September 2026 - Confidential', 'keywords': 'Confidential; Prepared for Reem Bank',
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
    src = sys.argv[1]
    master = os.path.join(HERE, '.master_v11.pdf')
    d, names = apply(src)
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
    if '--proof' in sys.argv:
        out = sys.argv[sys.argv.index('--proof') + 1]
        os.makedirs(out, exist_ok=True)
        x = pymupdf.open(master)
        for i, pg in enumerate(x):
            pg.get_pixmap(dpi=110).save(os.path.join(out, f'v11_page{i + 1:02d}.png'))
        x.close()
    if not protect(master, OUT_PDF, pages2):
        problems.append('circulation PDF not protected as intended')
    os.remove(master)
    print('written', os.path.relpath(OUT_DOCX, ROOT), 'and', os.path.relpath(OUT_PDF, ROOT))
    if problems:
        sys.exit('PROBLEMS: ' + '; '.join(problems))
    print('OK')
