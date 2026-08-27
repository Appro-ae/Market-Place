from common import esc, NAVY, BLUE, YEL, RED, LAV
import json, datetime as dt

_M = json.load(open('movement.json'))
M   = _M.get('daily') if isinstance(_M, dict) and 'daily' in _M else _M
ON  = _M.get('overnight') if isinstance(_M, dict) else None

def _human(run_id):
    d = dt.date.fromisoformat(run_id[:10]).strftime('%-d %B %Y')
    return d + (' midday run' if len(run_id) > 10 else '')

_pd  = _human(M['prev_run_id']) if M else ''
_on  = _human(ON['prev_run_id']) if ON else ''
_onk = {x['key'] for x in ON['moves']} if ON else set()
_nprev = len((M or {}).get('scope_status_n') or [])
_basenote = ('Baseline note: the ' + _pd + ' snapshot was reconstructed from that day&rsquo;s published '
             'dashboard and carries 4 of 28 scope statuses, so day-over-day detection outside those four '
             'starts from the 26 August midday run. Every run from today forward stores all 28.') if ON else ''

CSS_MOVE = """
.move{background:#ffffff;border-radius:16px;padding:22px 24px;margin-bottom:20px}
.movehead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
.moverow{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:14px}
.mv{background:#edf2ff;border-radius:12px;padding:12px 14px}
.mvl{font-size:11px;opacity:.7;line-height:1.3}
.mvn{font-size:22px;font-weight:900;letter-spacing:-.6px;margin-top:6px;display:flex;align-items:baseline;gap:8px}
.mvd{font-size:12.5px;font-weight:900;padding:2px 8px;border-radius:9px}
.d-good{background:#3b7ef6;color:#fff} .d-bad{background:#d92d20;color:#fff}
.d-flat{background:#ffffff;color:#1a214d;opacity:.55}
.mvp{font-size:10.5px;opacity:.55;margin-top:4px}
.mvsplit{display:grid;grid-template-columns:1.15fr 1fr;gap:20px}
.mvh{font-size:12px;font-weight:900;color:#3b7ef6;margin-bottom:8px;letter-spacing:.2px}
.mvtab{width:100%;border-collapse:collapse;font-size:12px}
.mvtab td{padding:6px 8px;border-bottom:1px solid #edf2ff}
.mvtab td.n{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.chip{font-size:10.5px;font-weight:900;padding:2px 8px;border-radius:9px;white-space:nowrap}
.c-fwd{background:#3b7ef6;color:#fff} .c-bck{background:#d92d20;color:#fff}
.c-on{background:#1a214d;color:#fff}
.mvnone{font-size:12px;opacity:.6;padding:6px 0}
.onbar{background:#1a214d;color:#fff;border-radius:12px;padding:11px 16px;margin-bottom:18px;
       display:flex;align-items:center;flex-wrap:wrap;gap:10px 18px;font-size:12px}
.onlab{font-weight:900;letter-spacing:.2px;font-size:11.5px;text-transform:uppercase;opacity:.9}
.onit{display:flex;align-items:baseline;gap:6px}
.onit b{font-weight:900}
.onpill{font-size:11px;font-weight:900;padding:2px 7px;border-radius:8px;background:#3b7ef6}
.onpill.bad{background:#d92d20} .onpill.flat{background:#ffffff;color:#1a214d;opacity:.6}
"""

def _overnight_bar():
    if not ON: return ''
    bits = []
    for k in ON['kpi']:
        if k['delta'] == '±0' or k['label'] == 'Days to release': continue
        cls = {'good':'','bad':' bad','flat':' flat'}[k['cls']]
        bits.append(f'<span class="onit">{esc(k["label"])} <b>{k["now"]}</b>'
                    f'<span class="onpill{cls}">{k["delta"]}</span></span>')
    for f in ON['fixes']:
        bits.append(f'<span class="onit">{esc(f["dev"])}<span class="onpill">{f["delta"]} fixes</span></span>')
    for x in ON['moves']:
        bits.append(f'<span class="onit">{x["key"]} <b>→ {esc(x["to"])}</b></span>')
    if not bits:
        bits = ['<span class="onit" style="opacity:.7">no numbers moved</span>']
    return ('<div class="onbar"><span class="onlab">Overnight · since the ' + _on + '</span>'
            + ''.join(bits) + '</div>')

def card():
    if not M: return ''
    h = ['<div class="move">']
    sub = ('Day over day, plus what last night&rsquo;s fixes moved since this morning&rsquo;s run &mdash; '
           'a backward status move is the signal a percentage hides') if ON else \
          ('What changed in the last 24 hours &mdash; a backward status move is the signal a percentage hides')
    h.append('<div class="movehead"><div><div class="ctitle">Movement since ' + _pd + '</div>'
             '<div class="csub">' + sub + '</div></div></div>')
    h.append('<div class="moverow">')
    for k in M['kpi']:
        h.append(f'<div class="mv"><div class="mvl">{k["label"]}</div>'
                 f'<div class="mvn">{k["now"]}<span class="mvd d-{k["cls"]}">{k["delta"]}</span></div>'
                 f'<div class="mvp">was {k["prev"]}</div></div>')
    h.append('</div>')
    h.append(_overnight_bar())
    h.append('<div class="mvsplit"><div>')
    h.append('<div class="mvh">Status moves</div>')
    moves = list(M['moves'])                       # union: the 25 Aug baseline is partial
    have = {x['key'] for x in moves}
    for x in (ON['moves'] if ON else []):
        if x['key'] not in have: moves.append(x); have.add(x['key'])
    moves.sort(key=lambda x: x['dir'])
    if moves:
        h.append('<table class="mvtab">')
        for x in moves:
            chip = 'c-bck' if x['dir'] == 'backward' else 'c-fwd'
            on = ' <span class="chip c-on">overnight</span>' if x['key'] in _onk else ''
            h.append(f'<tr><td><a href="https://scvaladdin.atlassian.net/browse/{x["key"]}">{x["key"]}</a>'
                     f' <span class="chip {chip}">{x["dir"]}</span>{on}</td>'
                     f'<td>{esc(x["feature"])}</td>'
                     f'<td style="opacity:.75">{x["frm"]} → <b>{x["to"]}</b></td></tr>')
        h.append('</table>')
    else:
        h.append('<div class="mvnone">No scope item changed status.</div>')
    if _basenote: h.append('<div class="mvnone" style="font-size:11px">' + _basenote + '</div>')
    h.append('</div><div>')
    h.append('<div class="mvh">Portal movement</div><table class="mvtab">')
    for p in M['portal']:
        h.append(f'<tr><td>{p["portal"]}</td>'
                 f'<td class="n">{p["pct_now"]}% <span class="mvd d-{p["pct_cls"]}">{p["pct_d"]}</span></td>'
                 f'<td class="n">{p["def_now"]} def <span class="mvd d-{p["def_cls"]}">{p["def_d"]}</span></td>'
                 f'<td class="n">{p["hi_now"]} high <span class="mvd d-{p["hi_cls"]}">{p["hi_d"]}</span></td></tr>')
    h.append('</table>')
    if M['fixes']:
        onf = {f['dev']: f['delta'] for f in (ON['fixes'] if ON else [])}
        h.append('<div class="mvh" style="margin-top:14px">Fix transitions added</div><table class="mvtab">')
        for f in M['fixes']:
            tail = f'<td class="n" style="color:#3b7ef6">{onf[f["dev"]]} o/n</td>' if f['dev'] in onf else '<td></td>'
            h.append(f'<tr><td>{esc(f["dev"])}</td><td class="n">{f["delta"]}</td>{tail}'
                     f'<td class="n">{f["raw"]} total</td></tr>')
        h.append('</table>')
    h.append('</div></div></div>')
    return ''.join(h)
