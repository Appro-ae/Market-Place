"""Movement since the previous run — diff current agg.json against the most recent prior run."""
import json, os, re, glob, datetime as dt

RUN_RE = re.compile(r'^\d{4}-\d{2}-\d{2}(-[A-Za-z0-9]+)?$')

def load_prev(reports_dir, run_id):
    """Newest run folder strictly older than run_id.

    Accepts both `<date>` and `<date>-<suffix>` folders (e.g. 2026-08-26-eod), so more
    than one run per day chains correctly.  Plain lexicographic order is the right order
    here because every folder starts with an ISO date and a suffixed run always follows
    the bare one for the same day.
    """
    runs = sorted(d for d in os.listdir(reports_dir)
                  if RUN_RE.match(d) and d < run_id
                  and os.path.exists(os.path.join(reports_dir, d, 'agg.json')))
    if not runs: return None, None
    prev = runs[-1]
    agg = json.load(open(os.path.join(reports_dir, prev, 'agg.json')))
    agg.setdefault('run_date', prev[:10])       # folders predating the chaining fields
    agg.setdefault('run_id', prev)
    if 'scope_status' not in agg and 'scope' in agg:
        agg['scope_status'] = {k: v['status'] for k, v in agg['scope'].items()}
    return prev, agg

def arrow(d, good_down=False):
    if d == 0: return ('flat', '±0')
    up = d > 0
    good = (not up) if good_down else up
    return ('good' if good else 'bad', f"{'+' if up else ''}{d}")

def compute(cur, prev, fix_now, fix_prev):
    if not prev: return None
    m = {'prev_date': prev['run_date'], 'kpi': [], 'portal': [], 'moves': [], 'scope': [], 'fixes': []}
    for label, key, gd, suffix in [
            ('Days to release', 'days_to_release', True, ''),
            ('Scope items', 'scope_items', False, ''),
            ('Open defects on scope', 'open_defects', True, ''),
            ('High & Blocker', 'high', True, ''),
            ('Weighted completion', 'prog', False, '%')]:
        a, b = prev.get(key), cur.get(key)
        if a is None or b is None: continue
        cls, txt = arrow(b - a, gd)
        m['kpi'].append(dict(label=label, prev=f"{a}{suffix}", now=f"{b}{suffix}", delta=txt, cls=cls))
    for p, pv in cur['per_portal'].items():
        q = prev['per_portal'].get(p)
        if not q: continue
        m['portal'].append(dict(portal=p, pct_prev=q['pct'], pct_now=pv['pct'],
            pct_d=arrow(pv['pct'] - q['pct'])[1], pct_cls=arrow(pv['pct'] - q['pct'])[0],
            def_prev=q['defects'], def_now=pv['defects'],
            def_d=arrow(pv['defects'] - q['defects'], True)[1], def_cls=arrow(pv['defects'] - q['defects'], True)[0],
            hi_prev=q['high'], hi_now=pv['high'],
            hi_d=arrow(pv['high'] - q['high'], True)[1], hi_cls=arrow(pv['high'] - q['high'], True)[0]))
    ORDER = ['Ready To Clarify','To Do','US Approved','IN DEVELOPMENT','Implemented',
             'Tested with Bugs','UAT TESTING','UAT Validated']
    rank = {s: i for i, s in enumerate(ORDER)}
    for k, old in (prev.get('scope_status') or {}).items():
        new = (cur['scope'].get(k) or {}).get('status')
        if new and new != old:
            fwd = rank.get(new, 0) > rank.get(old, 0)
            m['moves'].append(dict(key=k, frm=old, to=new, dir='forward' if fwd else 'backward',
                                   feature=cur['scope'][k]['feature'], portal=cur['scope'][k]['portal']))
    m['moves'].sort(key=lambda x: x['dir'])
    prevkeys = set((prev.get('scope_status') or {}).keys())
    if prev.get('scope_items') != cur.get('scope_items'):
        m['scope'].append(f"scope moved {prev['scope_items']} → {cur['scope_items']} items")
    now = {r['dev']: r['fixes'] for r in fix_now['rows']}
    raw = {r['dev']: r['raw'] for r in fix_now['rows']}
    for dev, before in (fix_prev or {}).items():
        d = raw.get(dev, 0) - before
        if d: m['fixes'].append(dict(dev=dev, delta=f"+{d}" if d > 0 else str(d), raw=raw.get(dev, 0)))
    m['fixes'].sort(key=lambda x: -int(x['delta']))
    return m
