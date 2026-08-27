import json, os
D=os.path.dirname(os.path.abspath(__file__))
P=json.load(open(os.path.join(D,'..','smbp','params.json')))

def rd(f): return set(open(os.path.join(D,f)).read().split())
CANC=rd('cancelled_keys.txt'); NAB=rd('notabug_keys.txt')
C3=rd('crit3_fail_keys.txt');  RW=rd('rework_keys.txt')
C2=set()                       # (key,devslug)
for tok in open(os.path.join(D,'c2fail_keys.txt')).read().split():
    k,d=tok.split(':'); C2.add((k,d))

SLUG={'NgoHuu.Toan':'toan','Tang Ha Long':'tanghalong','Nguyen Trong Quan':'quan',
      'phamhoang.nam':'nam','KhoeHD':'khoehd','Thanh Tung Nguyen':'tung',
      'LongLH':'longlh','Minh Hoang':'minhhoang'}
WORKING=18

rows=[]; tot_raw=0
for dev in P['dev_roster']:
    nm=dev['name']; slug=SLUG[nm]
    keys=open(os.path.join(D,'fixes_%s.txt'%slug)).read().split()
    raw=len(keys); tot_raw+=raw
    ec=en=e3=e2=0; counted=[]
    for k in keys:                       # precedence: cancelled > not-a-bug > crit3 > crit2
        if   k in CANC: ec+=1
        elif k in NAB:  en+=1
        elif k in C3:   e3+=1
        elif (k,slug) in C2: e2+=1
        else: counted.append(k)
    fixes=len(counted)
    rework=len([k for k in counted if k in RW]); first=fixes-rework
    rows.append(dict(dev=nm, squad=dev['squad'], alloc=dev['alloc'], raw=raw,
        ex_canc=ec, ex_nab=en, ex_c3=e3, ex_c2=e2, fixes=fixes,
        rework=rework, first=first,
        rate=round(fixes/(dev['alloc']*WORKING),1),
        fpr=round(100*first/fixes) if fixes else 0, keys=counted))

total=sum(r['fixes'] for r in rows)
for r in rows: r['share']=round(100*r['fixes']/total) if total else 0
rows.sort(key=lambda r:-r['fixes'])
out=dict(rows=[{k:v for k,v in r.items() if k!='keys'} for r in rows],
         total=total, working=WORKING, total_raw=tot_raw,
         total_first=sum(r['first'] for r in rows),
         total_rework=sum(r['rework'] for r in rows),
         excl=dict(cancelled=sum(r['ex_canc'] for r in rows), notabug=sum(r['ex_nab'] for r in rows),
                   crit3=sum(r['ex_c3'] for r in rows), crit2=sum(r['ex_c2'] for r in rows)),
         audit_coverage='149/149')
json.dump(out, open(os.path.join(D,'fixtable.json'),'w'), indent=1)
json.dump({r['dev']:r['keys'] for r in rows}, open(os.path.join(D,'fix_counted_keys.json'),'w'), indent=1)
for r in rows:
    print('%-20s raw%3d  -c%d -n%d -3%d -2%d  = %3d  (rw %2d / fp %2d = %3d%%)  rate %.1f  share %d%%'
          %(r['dev'],r['raw'],r['ex_canc'],r['ex_nab'],r['ex_c3'],r['ex_c2'],r['fixes'],
            r['rework'],r['first'],r['fpr'],r['rate'],r['share']))
print('TOTAL raw %d -> counted %d  (first-pass %d = %d%%)  excl %s'
      %(tot_raw,total,out['total_first'],round(100*out['total_first']/total),out['excl']))
