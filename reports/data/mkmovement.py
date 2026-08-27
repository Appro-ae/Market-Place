"""Two baselines: day-over-day against the previous daily report, and overnight against
the most recent earlier run of the same day."""
import json, os, movement
R = '/home/user/Market-Place/reports'
cur = json.load(open('agg.json')); fix_now = json.load(open('fixtable.json'))
run_id = cur.get('run_id', cur['run_date'])

def prev_fixraw(d):
    fp = os.path.join(R, d, 'fixtable.json')
    if os.path.exists(fp): return {r['dev']: r['raw'] for r in json.load(open(fp))['rows']}
    return json.load(open(os.path.join(R, d, 'agg.json'))).get('fixes_raw')

def leg(before_id):
    d, agg = movement.load_prev(R, before_id)
    if not d: return None
    M = movement.compute(cur, agg, fix_now, prev_fixraw(d))
    M['prev_run_id'] = d
    M['same_day'] = d[:10] == run_id[:10]
    return M

overnight = leg(run_id)                                     # newest run before this one
daily     = leg(run_id[:10]) if overnight and overnight['same_day'] else overnight
out = dict(daily=daily, overnight=overnight if (overnight and overnight['same_day']) else None)
json.dump(out, open('movement.json','w'), indent=1)
for nm, M in [('DAILY', daily), ('OVERNIGHT', out['overnight'])]:
    if not M: print(nm, ': none'); continue
    print('%s  vs %s' % (nm, M['prev_run_id']))
    print('   kpi  ', ' | '.join('%s %s->%s %s' % (k['label'], k['prev'], k['now'], k['delta']) for k in M['kpi']))
    print('   moves', [(x['key'], x['frm'], '->', x['to'], x['dir']) for x in M['moves']] or 'none')
    print('   fixes', [(f['dev'], f['delta']) for f in M['fixes']] or 'none')
