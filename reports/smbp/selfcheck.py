import json, re, glob, collections, sys
A=json.load(open('agg.json')); F=json.load(open('fixtable.json'))
S=json.load(open('security.json')); M=json.load(open('movement.json'))
D1=open('../2026-08-26-eod/Release_3.1_Programme_Dashboard_26Aug2026.html').read()
D2=open('../2026-08-26-eod/Defect_Developer_Performance_26Aug2026.html').read()
ok=[]; bad=[]
def chk(n, cond, detail):
    (ok if cond else bad).append(f'{n:2d}. {"PASS" if cond else "FAIL"}  {detail}')

# 1 portal items sum to scope
si=sum(v['items'] for v in A['per_portal'].values())
chk(1, si==A['scope_items']==28, f'portal items {si} = scope items {A["scope_items"]} = 28')
# 2 portal defects sum to open defects
pd=sum(v['defects'] for v in A['per_portal'].values())
chk(2, pd==A['open_defects'], f'portal defects {pd} = open defects on scope {A["open_defects"]}')
# 3 portal high sums to high, and high_list length agrees
ph=sum(v['high'] for v in A['per_portal'].values())
chk(3, ph==A['high']==len(A['high_list']), f'portal high {ph} = high {A["high"]} = high_list {len(A["high_list"])}')
# 4 ageing bands per portal sum to that portal's defects
b=[(p, sum(v['ageing']), v['defects']) for p,v in A['per_portal'].items()]
chk(4, all(x==y for _,x,y in b), 'ageing bands sum to defects per portal: '+', '.join(f'{p} {x}/{y}' for p,x,y in b))
# 5 feature item counts sum to scope
fi=sum(v['items'] for v in A['feats'].values())
chk(5, fi==28, f'feature items {fi} = 28')
# 6 CR item counts sum to scope
ci=sum(v['n'] for v in A['per_cr'].values())
mixok=all(sum(v['mix'])==v['n'] for v in A['per_cr'].values())
_crs=', '.join(f"{k} {v['n']}" for k,v in A['per_cr'].items())
chk(6, ci==28 and mixok, f'CR items {ci} = 28 ({_crs}); status mix sums to each CR count')
# 7 cycle bands sum to closed count used for cycle time
chk(7, sum(A['cyc_bands'])==A['cyc_n'], f'cycle bands {sum(A["cyc_bands"])} = closed with cycle time {A["cyc_n"]}')
# 8 raised/closed series sum to totals and cumulative ends match
chk(8, sum(A['raised'])==A['tot_raised'] and sum(A['closed'])==A['tot_closed']
        and A['cumR'][-1]==A['tot_raised'] and A['cumK'][-1]==A['tot_closed'],
    f'series raised {sum(A["raised"])}={A["tot_raised"]}, closed {sum(A["closed"])}={A["tot_closed"]}, cumulative ends match')
# 9 fix table arithmetic per row and in total
rows_ok=all(r['raw']-r['ex_canc']-r['ex_nab']-r['ex_c3']-r['ex_c2']==r['fixes']
            and r['rework']+r['first']==r['fixes'] for r in F['rows'])
tot_ok=(sum(r['fixes'] for r in F['rows'])==F['total']
        and sum(r['raw'] for r in F['rows'])==F['total_raw']
        and F['total_raw']-sum(F['excl'].values())==F['total']
        and sum(r['first'] for r in F['rows'])==F['total_first'])
chk(9, rows_ok and tot_ok, f'{F["total_raw"]} raw − {sum(F["excl"].values())} excl = {F["total"]} fixes; rows and totals reconcile')
# 10 dev ageing bands sum to per-dev totals, and grand total matches agg
db=all(sum(v['bands'])==v['total'] for v in A['dev_age'].values())
chk(10, db and sum(v['total'] for v in A['dev_age'].values())==A['dev_open_total'],
    f'dev bands sum to totals; grand total {A["dev_open_total"]}')
# 11 audit coverage: every fix key changelog-read for criterion 3
c3=[l.split('\t')[0] for l in open('crit3_results.tsv') if l.strip()]
allk=open('all_fix_keys.txt').read().split()
chk(11, set(c3)==set(allk) and F['audit_coverage']==f'{len(allk)}/{len(allk)}',
    f'criterion-3 changelog coverage {len(set(c3))}/{len(set(allk))} = {F["audit_coverage"]}')
# 12 every SVG value label inside its viewBox
esc=0
for name,doc in (('D1',D1),('D2',D2)):
    for m in re.finditer(r'<svg[^>]*viewBox="0 0 (\d+) (\d+)"(.*?)</svg>', doc, re.S):
        W,H,body=int(m.group(1)),int(m.group(2)),m.group(3)
        for t in re.finditer(r'<text[^>]*\bx="(-?[\d.]+)"[^>]*\by="(-?[\d.]+)"', body):
            x,y=float(t.group(1)),float(t.group(2))
            if not (-2<=x<=W+2 and -2<=y<=H+2): esc+=1; print('   OUT',name,x,y,W,H)
chk(12, esc==0, f'all SVG <text> anchors inside their viewBox ({esc} outside)')

# cross-checks between data and rendered HTML
r=[]
r.append(('D2 fix total', str(F['total']) in D2))
r.append(('D2 raw total', str(F['total_raw']) in D2))
r.append(('D2 security block', 'SECURITY' in D2 and str(S['pt_rework_pct'])+'%' in D2))
r.append(('D2 Faeeq confirmed', 'confirmed as Security tester' in D2))
r.append(('D2 no pending-confirmation text', 'should be confirmed as a tester' not in D2))
r.append(('D1 movement card', 'Movement since' in D1))
r.append(('D1 overnight bar', 'Overnight &middot;' in D1 or 'Overnight ·' in D1))
r.append(('D1 as-of label', '23:59 GST' in D1))
r.append(('D2 as-of label', '23:59 GST' in D2))
r.append(('both: audit 149/149', '149/149' in D2))
print('\n'.join(sorted(ok+bad, key=lambda s:int(s.split('.')[0]))))
print()
for n,c in r: print(f'   {"ok " if c else "MISS"}  {n}')
print()
print(f'{len(ok)}/12 self-checks pass' + ('' if not bad else '  — FAILURES ABOVE'))
sys.exit(1 if bad or not all(c for _,c in r) else 0)
