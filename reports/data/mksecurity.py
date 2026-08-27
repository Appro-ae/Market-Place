"""Penetration-test posture for Dashboard 2.
Source: every AMP issue reported by the security tester named in params.json, created on or
before the as-of cutoff.  Cross-referenced against the audited fix table for rework rate."""
import json, re, collections
P = json.load(open('../smbp/params.json'))
sec = next(t for t in P['testers'] if t.get('role') == 'Security tester')
ns  = json.load(open('pt_raw.json'))['issues']['nodes']
rw  = set(open('rework_keys.txt').read().split())
CNT = json.load(open('fix_counted_keys.json'))
CLOSED = {'Done', 'UAT Validated', 'Cancelled', 'Closed'}
NICE = {'BOD': 'BOD', 'PartnerPortal': 'Partner Portal',
        'BankPortal': 'Bank Portal', 'AdminPortal': 'Admin Portal'}

def ws(s):
    m = re.match(r'^\[([^\]]+)\]', s or '')
    if not m: return 'Other'
    t = m.group(1).replace(' ', '').replace('-PT', '').replace('PT', '') or 'BOD'
    return NICE.get(t, t)

rows = [dict(key=n['key'], ws=ws(n['fields'].get('summary')), st=n['fields']['status']['name'],
             pri=(n['fields'].get('priority') or {}).get('name', '-'),
             created=n['fields']['created'][:10],
             asg=(n['fields'].get('assignee') or {}).get('displayName', 'Unassigned')) for n in ns]
keys = {r['key'] for r in rows}
ev   = [(k, d) for d, ks in CNT.items() for k in ks]
ptev = [(k, d) for k, d in ev if k in keys]
ptrw = [(k, d) for k, d in ptev if k in rw]
openr = [r for r in rows if r['st'] not in CLOSED]

out = dict(
    tester=sec['name'], role=sec['role'],
    raised=len(rows), closed=len(rows) - len(openr), open=len(openr),
    last_raised=max(r['created'] for r in rows),
    workstreams=[dict(name=w, n=c) for w, c in collections.Counter(r['ws'] for r in rows).most_common()],
    open_items=[dict(key=r['key'], ws=r['ws'], pri=r['pri'], asg=r['asg']) for r in sorted(openr, key=lambda r: r['key'])],
    open_owners=sorted({r['asg'] for r in openr}),
    fixed_in_window=len(ptev), fixed_rework=len(ptrw),
    pt_rework_pct=round(100 * len(ptrw) / len(ptev)) if ptev else 0,
    all_rework_pct=round(100 * len([1 for k, d in ev if k in rw]) / len(ev)) if ev else 0,
    fixed_by=collections.Counter(d for _, d in ptev).most_common(),
    fixed_keys=sorted(k for k, _ in ptev))
json.dump(out, open('security.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ('open_items', 'fixed_keys')}, indent=1))
