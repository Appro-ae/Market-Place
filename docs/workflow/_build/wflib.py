"""Shared draw.io (mxGraphModel) generator for the Reem Finance product workflows.

Style vocabulary lifted verbatim from the PO's own file
(credit_card/Credit_Card_Workflow_final_25092025.drawio), so everything stays
editable in draw.io with the house look. Step badges are painted ON their box
(top-left corner overlap) per the PO's instruction of 28/10.
"""
from lxml import etree

NS_X, NS_Y = 0, 0
KINDS = {
    'step':   'rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;',
    'green':  'rounded=0;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;',
    'pink':   'rounded=0;whiteSpace=wrap;html=1;fillColor=#F8CECC;strokeColor=#B85450;',
    'purple': 'rounded=0;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;',
    'yellow': 'rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;',
    'container': 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;verticalAlign=top;',
}
BADGE = 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;fontSize=10;'
TERM = 'ellipse;whiteSpace=wrap;html=1;fillColor=#e51400;fontColor=#ffffff;strokeColor=#B20000;'
DIAMOND = 'rhombus;whiteSpace=wrap;html=1;fillColor=#FFFFFF;'
ROUND = 'ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;'
TEXT = ('text;html=1;strokeColor=none;fillColor=none;align={align};verticalAlign=middle;'
        'whiteSpace=wrap;rounded=0;')
NOTE_DASHED = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;align=left;fontSize=9;'
MAIL = ('shadow=0;dashed=0;html=1;strokeColor=none;fillColor=#4495D1;labelPosition=center;'
        'verticalLabelPosition=bottom;verticalAlign=top;align=center;outlineConnect=0;'
        'shape=mxgraph.veeam.2d.letter;')
PHONE = ('verticalLabelPosition=bottom;html=1;verticalAlign=top;align=center;strokeColor=none;'
         'fillColor=#00BEF2;shape=mxgraph.azure.mobile;pointerEvents=1;')
HAND = ('shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;'
        'labelBackgroundColor=#ffffff;imageAspect=0;aspect=fixed;'
        'image=https://cdn1.iconfinder.com/data/icons/iconoir-vol-3/24/'
        'one-finger-select-hand-gesture-128.png;rotation=90;')
EDGE = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;'


class Flow:
    def __init__(self, name):
        self.name = name
        self._id = 1
        self.cells = []   # (id, attrib-dict, geometry-dict|None, parent)
        self.ids = {}
        self.lanes = {}   # key -> (x, y, w, h, id)

    def nid(self, key=None):
        self._id += 1
        i = str(self._id)
        if key:
            self.ids[key] = i
        return i

    def _add(self, key, value, style, x, y, w, h, parent='1', vertex=True):
        i = self.nid(key)
        px, py = x, y
        if parent in self.lanes:
            lx, ly, *_ , lid = self.lanes[parent]
            px, py, parent = x - lx, y - ly, lid
        self.cells.append({'id': i, 'value': value, 'style': style, 'vertex': '1',
                           'parent': parent, 'geo': (px, py, w, h)})
        return i

    def lane(self, key, label, x, y, w, h):
        i = self.nid(key)
        self.cells.append({'id': i, 'value': label, 'style':
                           'swimlane;horizontal=0;whiteSpace=wrap;html=1;fontStyle=1;'
                           'align=center;fillColor=none;', 'vertex': '1', 'parent': '1',
                           'geo': (x, y, w, h)})
        self.lanes[key] = (x, y, w, h, i)

    def node(self, key, label, x, y, w=120, h=60, kind='step', lane=None, badge=None,
             fs=None, extra=''):
        st = KINDS[kind] + (f'fontSize={fs};' if fs else '') + extra
        self._add(key, label, st, x, y, w, h, parent=lane or '1')
        if badge:
            bw = 34 if len(badge) > 3 else 30
            self._add(None, badge, BADGE, x - 12, y - 18, bw, 30, parent=lane or '1')

    def diamond(self, key, label, x, y, w=80, h=80, lane=None, fs=None):
        self._add(key, label, DIAMOND + (f'fontSize={fs};' if fs else ''), x, y, w, h,
                  parent=lane or '1')

    def round(self, key, label, x, y, d=60, lane=None, badge=None):
        self._add(key, label, ROUND, x, y, d, d, parent=lane or '1')
        if badge:
            self._add(None, badge, BADGE, x - 12, y - 18, 30, 30, parent=lane or '1')

    def term(self, key, x, y, label=None, d=36, lane=None, icons=True, note=None):
        self._add(key, '', TERM, x, y, d, d, parent=lane or '1')
        if label:
            self.label(None, f'<b>{label}</b>', x - 40, y + d + 2, 120, 18, lane=lane, fs=9)
        if note:
            self.label(None, f'<i>{note}</i>', x - 90, y + d + 20, 220, 40, lane=lane, fs=8)
        if icons:
            self.icons(x + d + 10, y + d / 2 - 11, lane=lane)

    def icons(self, x, y, lane=None):
        self._add(None, '', MAIL, x, y + 5, 26, 17, parent=lane or '1')
        self._add(None, '', PHONE, x + 34, y, 14, 26, parent=lane or '1')

    def hand(self, x, y, lane=None):
        self._add(None, '', HAND, x, y, 22, 22, parent=lane or '1')

    def note(self, key, text, x, y, w, h, lane=None, fs=9, dashed=True):
        st = NOTE_DASHED if dashed else NOTE_DASHED.replace('dashed=1;', 'dashed=0;strokeColor=none;')
        self._add(key, text, st.replace('fontSize=9', f'fontSize={fs}'), x, y, w, h,
                  parent=lane or '1')

    def label(self, key, text, x, y, w=160, h=20, lane=None, fs=10, color=None, align='center',
              bold=False):
        v = text
        if color:
            v = f'<font color="{color}">{v}</font>'
        if bold:
            v = f'<b>{v}</b>'
        self._add(key, v, TEXT.format(align=align) + f'fontSize={fs};', x, y, w, h,
                  parent=lane or '1')

    def edge(self, src, dst, label=None, color=None, dashed=False, width=None, points=None,
             exit=None, entry=None, lcolor=None, lbold=False, dstyle=None, lpos=None):
        i = self.nid()
        st = EDGE
        if color:
            st += f'strokeColor={color};'
        if dashed:
            st += 'dashed=1;'
        if dstyle:
            st += dstyle
        if width:
            st += f'strokeWidth={width};'
        if exit:
            st += f'exitX={exit[0]};exitY={exit[1]};exitDx=0;exitDy=0;'
        if entry:
            st += f'entryX={entry[0]};entryY={entry[1]};entryDx=0;entryDy=0;'
        v = label or ''
        if v and lcolor:
            v = f'<font color="{lcolor}">{v}</font>'
        if v and lbold:
            v = f'<b>{v}</b>'
        self.cells.append({'id': i, 'value': v, 'style': st, 'edge': '1', 'parent': '1',
                           'source': self.ids[src], 'target': self.ids[dst],
                           'points': points or [], 'lpos': lpos})

    def legend(self, x, y):
        chips = [('Appro BE logic', 'purple'), ('External systems', 'pink'),
                 ('RF Global Application', 'green'), ('Manual Queues', 'purple'),
                 ('Steps', 'step')]
        cx = x
        for text, kind in chips:
            self.node(None, text, cx, y, 120, 30, kind=kind, fs=9)
            if text == 'Manual Queues':
                self.hand(cx + 2, y + 2)
            cx += 130
        self.node(None, 'Steps', cx - 130, y, 120, 30, kind='step', fs=9) if False else None
        self._add(None, 'Terminated', TERM + 'fontSize=8;', cx + 10, y - 7, 44, 44)

    def xml(self):
        mxfile = etree.Element('mxfile', host='app.diagrams.net')
        diagram = etree.SubElement(mxfile, 'diagram', name='Page-1', id=self.name)
        model = etree.SubElement(diagram, 'mxGraphModel', dx='2000', dy='900', grid='1',
                                 gridSize='10', guides='1', tooltips='1', connect='1',
                                 arrows='1', fold='1', page='1', pageScale='1',
                                 pageWidth='1100', pageHeight='850', math='0', shadow='0')
        root = etree.SubElement(model, 'root')
        etree.SubElement(root, 'mxCell', id='0')
        etree.SubElement(root, 'mxCell', id='1', parent='0')
        for c in self.cells:
            a = {'id': c['id'], 'value': c.get('value') or '', 'style': c['style'],
                 'parent': c['parent']}
            if c.get('vertex'):
                a['vertex'] = '1'
            if c.get('edge'):
                a['edge'] = '1'
                a['source'] = c['source']
                a['target'] = c['target']
            el = etree.SubElement(root, 'mxCell', **a)
            if c.get('vertex'):
                x, yy, w, h = c['geo']
                etree.SubElement(el, 'mxGeometry', x=str(x), y=str(yy), width=str(w),
                                 height=str(h)).set('as', 'geometry')
            else:
                g = etree.SubElement(el, 'mxGeometry', relative='1')
                g.set('as', 'geometry')
                if c.get('lpos') is not None:
                    g.set('x', str(c['lpos']))
                if c['points']:
                    arr = etree.SubElement(g, 'Array')
                    arr.set('as', 'points')
                    for px, py in c['points']:
                        etree.SubElement(arr, 'mxPoint', x=str(px), y=str(py))
        return etree.tostring(mxfile, pretty_print=True, encoding='unicode')

    def save(self, path):
        open(path, 'w', encoding='utf-8').write(self.xml())
        print('written', path, f'({len(self.cells)} cells)')
