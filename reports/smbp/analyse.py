import json, glob, datetime as dt, collections

C = json.load(open('scope.json'))
TODAY = dt.date.fromisoformat(C['today'])
REL   = dt.date.fromisoformat(C['release_date'])
WS    = dt.date.fromisoformat(C['window_start'])
WE    = dt.date.fromisoformat(C['window_end'])
CUT   = dt.date.fromisoformat(C['cut_date'])
ITEMS = C['items']; W = C['weights']
BANK  = set(C['bank_squad']); CHAN = set(C['channel_squad']); DEVS = BANK | CHAN

def d(s): return dt.date.fromisoformat(s[:10])

# ---------- scope statuses ----------
scope = {}
for line in open('scope_status.tsv'):
    k, st, ity, asg, par, pri, summ = line.rstrip('\n').split('\t')
    p, f, cr = ITEMS[k]
    scope[k] = dict(key=k, status=st, portal=p, feature=f, cr=cr, summary=summ, assignee=asg)
assert len(scope) == 28

# ---------- open bugs ----------
openb = []
for fn in sorted(glob.glob('openbugs_p*.json')):
    for n in json.load(open(fn))['issues']['nodes']:
        fl = n['fields']
        links = []
        for L in fl.get('issuelinks') or []:
            for side in ('inwardIssue','outwardIssue'):
                if side in L and L[side]: links.append(L[side]['key'])
        openb.append(dict(
            key=n['key'], summary=fl['summary'], status=fl['status']['name'],
            priority=(fl.get('priority') or {}).get('name','-'),
            created=d(fl['created']),
            assignee=(fl.get('assignee') or {}).get('displayName','Unassigned'),
            assignee_id=(fl.get('assignee') or {}).get('accountId',''),
            reporter=(fl.get('reporter') or {}).get('displayName','-'),
            links=links))
print('open bugs loaded:', len(openb))

# ---------- map defects to scope ----------
scoped = []
for b in openb:
    if b['key'] in C['ignore_bugs']: continue
    hits = [l for l in b['links'] if l in ITEMS]
    if not hits: continue
    parent = hits[0]
    portal = ITEMS[parent][0]
    # Bank-team rule
    note = ''
    if portal == 'Bank Portal' and b['assignee_id'] in CHAN:
        portal = 'Channel'; note = 'bank-team rule'
    b2 = dict(b); b2.update(parent=parent, portal=portal, feature=ITEMS[parent][1],
                            age=(TODAY-b['created']).days, rule=note)
    scoped.append(b2)
print('open defects traced to Release 3.1 scope:', len(scoped))

PORTALS = ['Distribution Portal','Admin Portal','Bank Portal','Channel']
HIGH = {'High','Blocker','Highest'}

def band(a, edges):
    for i,e in enumerate(edges):
        if a <= e: return i
    return len(edges)

# ---------- dashboard 1 aggregates ----------
per_portal = {}
for p in PORTALS:
    items = [s for s in scope.values() if s['portal']==p]
    defs  = [b for b in scoped if b['portal']==p]
    hi    = [b for b in defs if b['priority'] in HIGH]
    wsum  = sum(W.get(i['status'],0.0) for i in items)
    per_portal[p] = dict(
        items=len(items), pct=round(100*wsum/len(items)) if items else 0,
        defects=len(defs), high=len(hi),
        ageing=[len([b for b in defs if band(b['age'],[5,30])==i]) for i in range(3)],
        oldest=max([b['age'] for b in defs], default=0),
        cr=items[0]['cr'] if items else '-')

total_w = sum(W.get(s['status'],0.0) for s in scope.values())
prog = round(100*total_w/28)

stages = ['UAT Validated','UAT TESTING','Tested with Bugs','Implemented','IN DEVELOPMENT','none']
def mix(items):
    c = collections.Counter()
    for i in items:
        c[i['status'] if i['status'] in W else 'none'] += 1
    return [c[s] for s in stages]

per_cr = {}
for cr in C['crs']:
    items = [s for s in scope.values() if s['cr']==cr]
    per_cr[cr] = dict(n=len(items), mix=mix(items))

feats = collections.OrderedDict()
for k,s in scope.items():
    feats.setdefault((s['portal'], s['feature']), []).append(s)

high_list = sorted([b for b in scoped if b['priority'] in HIGH], key=lambda b:-b['age'])
owner_load = collections.Counter(b['assignee'] for b in high_list)

# ---------- dashboard 2 ----------
wb = []
for fn in sorted(glob.glob('window_p*.json')):
    for n in json.load(open(fn))['issues']['nodes']:
        fl = n['fields']
        wb.append(dict(key=n['key'], created=d(fl['created']),
                       resolved=d(fl['resolutiondate']) if fl.get('resolutiondate') else None,
                       status=fl['status']['name']))
days = [WS + dt.timedelta(days=i) for i in range((WE-WS).days+1)]
raised = collections.Counter(b['created'] for b in wb if WS<=b['created']<=WE)
closed = collections.Counter(b['resolved'] for b in wb if b['resolved'] and WS<=b['resolved']<=WE)
R = [raised[x] for x in days]; K = [closed[x] for x in days]
cumR = []; cumK = []; a=b_=0
for i in range(len(days)): a+=R[i]; b_+=K[i]; cumR.append(a); cumK.append(b_)

cyc = [ (b['resolved']-b['created']).days for b in wb if b['resolved'] and WS<=b['resolved']<=WE ]
cyc_bands = [0]*5
for v in cyc: cyc_bands[band(v,[2,7,14,30])]+=1
cyc.sort(); median = cyc[len(cyc)//2] if cyc else 0

# per-developer open ageing (all open bugs assigned to the 8)
NAMES = {'712020:c2a391b8-b1e5-42bb-9e9c-91bb7d24586c':('Tang Ha Long','Bank'),
 '63bce3990a1b5442166a3d21':('LongLH','Bank'), '63e355a0c2b1cb6b3473dc4c':('KhoeHD','Bank'),
 '712020:24847883-770b-4c91-a45a-ddff2c07621e':('NgoHuu.Toan','Channel / Admin / DP'),
 '712020:64c3eeff-75f1-486a-bd37-1d52056c7412':('phamhoang.nam','Channel / Admin / DP'),
 '712020:0d960272-5e65-4945-9bce-70be70ca8043':('Minh Hoang','Channel / Admin / DP'),
 '712020:f82f417d-1c4e-4d17-b0cb-4f69a6dac4ed':('Nguyen Trong Quan','Channel / Admin / DP'),
 '712020:6c94ea85-2e20-4e82-852f-18a2a98fcf41':('Thanh Tung Nguyen','Channel / Admin / DP')}
dev_age = {}
for aid,(nm,sq) in NAMES.items():
    mine = [b for b in openb if b['assignee_id']==aid]
    bands = [0]*4
    for b in mine: bands[band((TODAY-b['created']).days,[5,14,30])]+=1
    old = max([(TODAY-b['created']).days for b in mine], default=0)
    dev_age[nm] = dict(squad=sq, bands=bands, total=len(mine), oldest=old,
                       overmonth=round(100*bands[3]/len(mine)) if mine else 0)

rel_raised_since_cut = len([b for b in scoped if b['created']>=CUT])

out = dict(
  days_to_release=(REL-TODAY).days, scope_items=28, open_defects=len(scoped),
  high=len(high_list), prog=prog, per_portal=per_portal, per_cr=per_cr,
  stages=stages, prog_total_w=total_w,
  feats={f'{p}||{f}': dict(items=len(v), mix=mix(v), pct=round(100*sum(W.get(i["status"],0) for i in v)/len(v)),
                           keys=sorted(i['key'] for i in v)) for (p,f),v in feats.items()},
  high_list=[dict(key=b['key'],portal=b['portal'],feature=b['feature'],summary=b['summary'],
                  parent=b['parent'],status=b['status'],priority=b['priority'],age=b['age'],
                  owner=b['assignee'],rule=b['rule']) for b in high_list],
  owner_load=owner_load.most_common(),
  days=[x.isoformat() for x in days], raised=R, closed=K, cumR=cumR, cumK=cumK,
  tot_raised=sum(R), tot_closed=sum(K), cyc_bands=cyc_bands, cyc_median=median, cyc_n=len(cyc),
  dev_age=dev_age, rel_raised_since_cut=rel_raised_since_cut,
  scope=scope,
  # --- chaining fields: consumed by movement.py on the next run ---
  run_date=C['today'], run_id=C.get('run_id', C['today']),
  scope_status={k: v['status'] for k, v in scope.items()},
  dev_open_total=sum(v['total'] for v in dev_age.values()))
json.dump(out, open('agg.json','w'), default=str, indent=1)

print(f"\nRelease {C['release']} | {out['days_to_release']} days to release")
print(f"scope 28 | open defects {out['open_defects']} | High&Blocker {out['high']} | weighted {prog}%")
print('\nportal            items  pct  defects  high  ageing(0-5/6-30/31-60)  oldest')
for p in PORTALS:
    v=per_portal[p]; print(f"{p:18s}{v['items']:5d}{v['pct']:5d}%{v['defects']:8d}{v['high']:6d}   {v['ageing']}        {v['oldest']}d")
print(f"\nwindow raised {out['tot_raised']} closed {out['tot_closed']} | cycle median {median}d over {len(cyc)} closed")
print('cycle bands 0-2/3-7/8-14/15-30/31+:', cyc_bands)
print('\ndev open ageing:'); [print(f"  {k:20s}{v['total']:4d}  oldest {v['oldest']:4d}d  {v['bands']}") for k,v in sorted(dev_age.items(), key=lambda x:-x[1]['total'])]
print('\nraised since cut', CUT, ':', rel_raised_since_cut)
