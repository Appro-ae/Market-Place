// Dashboard + Catalog screens for the API Marketplace Customer Portal

// Period filter helpers (GAS-562 AC10, v2) — Day / Month / Year granularity + native picker.
const CU_TODAY = '2026-08-17';
const CU_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CU_PICK = { border: '1px solid var(--ink-300)', borderRadius: 8, padding: '8px 11px', fontSize: 12.5, fontFamily: 'var(--font-ui)', background: '#fff', color: 'var(--ink-800)', fontWeight: 600, cursor: 'pointer' };
function cuHash(s){ let h = 2166136261; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function cuFmtDay(d){ const [y,m,dd] = d.split('-').map(Number); return dd + ' ' + CU_MONTHS[m-1] + ' ' + y; }
function cuFmtMonth(ym){ const [y,m] = ym.split('-').map(Number); return CU_MONTHS[m-1] + ' ' + y; }
// Requests count for the selected period — deterministic and env-aware (so a demo pick visibly changes the value).
function cuRequests(isProd, gran, day, month, year){
  const key = gran === 'day' ? day : gran === 'month' ? month : year;
  const dayBase = isProd ? 1820000 : 14284;
  const mult = gran === 'day' ? 1 : gran === 'month' ? 30 : 365;
  const n = dayBase * mult * (0.85 + (cuHash(key) % 30) / 100);
  return n >= 1e9 ? (n/1e9).toFixed(2)+'B' : n >= 1e6 ? (n/1e6).toFixed(2)+'M' : Math.round(n).toLocaleString();
}

function Dashboard({ env, goTo }) {
  const isProd = env === 'production';
  const demoEmpty = !!window.DEMO_EMPTY;

  // PO review 13-08-2026 (GAS-562): no sub-environment selector on the dashboard —
  // the global Sandbox/Production toggle is the only environment control here.
  // Sub-environment selection stays on Usage & Analytics / Request Logs.

  // Period filter (GAS-562 AC10, v2): Day / Month / Year + native picker. Traffic cards and the
  // errors feed reflect the selected period; billing/subscriptions stay on the current cycle.
  const [gran, setGran] = React.useState('day');
  const [day, setDay] = React.useState(CU_TODAY);
  const [month, setMonth] = React.useState('2026-08');
  const [year, setYear] = React.useState('2026');
  const periodLabel = gran === 'day' ? cuFmtDay(day) : gran === 'month' ? cuFmtMonth(month) : ('Year ' + year);
  const periodShort = gran === 'day' ? (day === CU_TODAY ? '24h' : cuFmtDay(day)) : gran === 'month' ? cuFmtMonth(month) : year;
  const isCurrent = gran === 'day' && day === CU_TODAY;

  const metrics = (demoEmpty ? [
    { label: 'Requests (24h)', value: '0', delta: '0%', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
    { label: 'Success rate', value: '—', delta: '0%', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
    { label: 'Error rate', value: '—', delta: '0%', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
    { label: 'Monthly quota used', value: '—', delta: 'no plan yet', up: true, quota: 0 },
  ] : isProd ? [
    { label: 'Requests (24h)', value: '1.82M', delta: '+4.1%', up: true, spark: [30,42,38,55,62,58,74,70,82,78,88,95] },
    { label: 'Success rate', value: '99.82%', delta: '+0.04%', up: true, spark: [90,92,91,93,94,92,95,96,97,97,98,99] },
    { label: 'Error rate', value: '0.18%', delta: '+0.02%', up: false, spark: [10,12,14,13,15,18,16,20,22,18,15,18] },
    { label: 'Monthly quota used', value: '68%', delta: '2.0M of 3.0M', up: true, quota: 68, note: 'Committed-volume packages only · 1 pay-as-you-go excluded' },
  ] : [
    { label: 'Requests (24h)', value: '14,284', delta: '+22%', up: true, spark: [20,28,30,42,45,55,60,58,72,70,80,90] },
    { label: 'Success rate', value: '98.4%', delta: '+0.9%', up: true, spark: [80,82,85,84,88,90,89,92,91,95,96,98] },
    { label: 'Error rate', value: '1.6%', delta: '-0.3%', up: true, spark: [30,28,24,25,22,20,18,19,16,14,15,13] },
    { label: 'Monthly quota used', value: '14%', delta: '438K of 3.0M', up: true, quota: 14, note: 'Committed-volume packages only · 1 pay-as-you-go excluded' },
  ]);
  if (!demoEmpty) metrics[0] = { ...metrics[0], label: 'Requests (' + periodShort + ')', value: cuRequests(isProd, gran, day, month, year) };

  const apis = demoEmpty ? [] : [
    { name: 'Credit Score (Individual)', version: 'v2.0', status: isProd ? 'live' : 'active', calls: isProd ? '612K' : '4,812', latency: '98ms', err: '0.12%' },
    { name: 'ID Document Data Extraction', version: 'v1.2', status: isProd ? 'live' : 'active', calls: isProd ? '489K' : '3,104', latency: '184ms', err: '0.21%' },
    { name: 'Credit Full Report (Company)', version: 'v2.0', status: isProd ? 'pending' : 'active', calls: isProd ? '—' : '1,620', latency: '220ms', err: '0.44%' },
  ];

  const activity = [
    { t: '2 min ago',  who: 'Amira Saleh',    what: 'rotated API key', target: 'pk_sbx_****9f3a', icon: 'refresh', color: 'var(--warning)' },
    { t: '24 min ago', who: 'System',          what: 'provisioned sandbox for', target: 'Credit Full Report (Company) v2.0', icon: 'sparkle', color: 'var(--appro-blue)' },
    { t: '1h ago',     who: 'Yusuf Al Hammadi',what: 'added IP to allowlist', target: '52.14.88.0/24', icon: 'allowlist', color: 'var(--success)' },
    { t: '3h ago',     who: 'System',          what: 'approved production access for', target: 'Credit Score (Individual) v2.0', icon: 'check', color: 'var(--success)' },
    { t: 'Yesterday',  who: 'Layla Mansoori',     what: 'invited teammate', target: 'devops@nuqud.ae', icon: 'users', color: 'var(--info)' },
    { t: 'Yesterday',  who: 'System',          what: 'sent usage alert —', target: '80% of monthly quota', icon: 'flame', color: 'var(--danger)' },
  ];

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Period filter (GAS-562 AC10) — Day / Month / Year + native picker */}
      <Card padding={0} style={{ marginBottom: 14 }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-ui)' }}>Period</span>
          <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 8, padding: 3, fontSize: 12, fontWeight: 600 }}>
            {[['day','Day'],['month','Month'],['year','Year']].map(([k, l]) => <button key={k} onClick={() => setGran(k)} style={{ background: gran===k ? 'var(--appro-blue)' : 'transparent', color: gran===k ? '#fff' : 'var(--ink-500)', border: 0, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{l}</button>)}
          </div>
          {gran === 'day'   && <input type="date"  value={day}   max={CU_TODAY} onChange={e => setDay(e.target.value)}   style={CU_PICK}/>}
          {gran === 'month' && <input type="month" value={month} max="2026-08"  onChange={e => setMonth(e.target.value)} style={CU_PICK}/>}
          {gran === 'year'  && <select value={year} onChange={e => setYear(e.target.value)} style={CU_PICK}>{['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}</select>}
          {gran === 'day' && day !== CU_TODAY && <button onClick={() => setDay(CU_TODAY)} style={{ background: 'transparent', border: 0, color: 'var(--appro-blue)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Today</button>}
          <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Traffic cards &amp; errors reflect the selected period · billing and subscriptions are always the current cycle</span>
        </div>
      </Card>

      {/* Welcome band — Appro brandmark gradient (45°, Dark Blue → Denim) */}
      <div style={{
        background: 'linear-gradient(45deg, #0C1931 0%, #1A2D52 45%, #3B7EF6 100%)',
        color: '#fff', borderRadius: 14, padding: '28px 28px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden',
      }}>
        {/* Brandmark watermark */}
        <div style={{
          position: 'absolute', right: -30, bottom: -40, width: 280, height: 280,
          backgroundImage: `url(${(typeof window !== 'undefined' && window.__resources && window.__resources.logoColor) || 'assets/logos/appro-logo-color.svg'})`, backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: .12,
          filter: 'brightness(2) saturate(0)', pointerEvents: 'none',
        }}/>
        <div style={{ flex: 1, position: 'relative', zIndex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,174,239,.16)', border: '1px solid rgba(0,174,239,.35)', padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 500, marginBottom: 14, lineHeight: 1, color: '#C4D8FC', fontFamily: 'var(--font-ui)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00AEEF', boxShadow: '0 0 0 3px rgba(0,174,239,.3)' }}/>
            All systems operational
          </div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 500, color: '#fff', lineHeight: 1.15, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Welcome back, Amira</h2>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,.78)', maxWidth: 560, lineHeight: 1.6, fontWeight: 300 }}>
            You're viewing <b style={{ color: '#fff', fontWeight: 500 }}>{env}</b> for Nuqud Pay. 3 APIs are live in production and 2 are still being checked by the Appro compliance team.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <Btn variant="secondary" size="md" icon="catalog" onClick={() => goTo('catalog')}
               style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.22)', color: '#fff' }}>Browse catalog</Btn>
          <Btn variant="primary" size="md" icon="plus" onClick={() => goTo('keys')}
               style={{ background: '#00AEEF', border: '1px solid #00AEEF', color: '#0C1931', fontWeight: 600 }}>Create API key</Btn>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {metrics.map(m => (
          <Card key={m.label} padding={18}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 500, fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, whiteSpace: 'nowrap' }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 500, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1 }}>{m.value}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: m.up ? 'var(--success)' : 'var(--danger)', whiteSpace: 'nowrap', flexShrink: 0 }}>{m.up ? '↑' : '↓'} {m.delta}</span>
            </div>
            {m.quota != null ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: m.quota + '%', background: m.quota > 85 ? 'var(--danger)' : 'linear-gradient(90deg,var(--appro-blue),#1D4ED8)', borderRadius: 999 }}/>
                </div>
                {/* GAS-562: the % covers committed-volume packages only — uncapped types have no denominator. */}
                {m.note && <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 6, lineHeight: 1.3 }}>{m.note}</div>}
              </div>
            ) : (
            <svg viewBox="0 0 120 32" style={{ width: '100%', height: 32, marginTop: 10, display: 'block' }}>
              <polyline fill="none" stroke="var(--appro-blue)" strokeWidth="1.5"
                points={m.spark.map((v,i)=>`${(i/(m.spark.length-1))*120},${32-(v/100)*28}`).join(' ')}/>
              <polygon fill="rgba(59,126,246,.18)" stroke="none"
                points={`0,32 ${m.spark.map((v,i)=>`${(i/(m.spark.length-1))*120},${32-(v/100)*28}`).join(' ')} 120,32`}/>
            </svg>
            )}
          </Card>
        ))}
      </div>

      {/* Billing snapshot + Subscriptions & requests + Recent errors (GAS-562 W4/W5/W6) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.15fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* W4 — Billing snapshot (per tenant, environment-independent) */}
        <Card padding={0}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Billing snapshot</div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink-500)', background: 'var(--ink-100)', padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.05em' }}>All environments</span>
          </div>
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Running total · June cycle</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <div style={{ fontSize: 25, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{demoEmpty ? 'AED 0' : 'AED 19,340'}</div>
              {!demoEmpty && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>↑ +4% vs May</span>}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 4 }}>incl. VAT 5% · cycle closes Jun 30 · invoice Jul 3</div>
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              {(demoEmpty ? [] : [
                { m: 'Jun 2026', s: 'Pending', c: 'var(--warning)' },
                { m: 'May 2026', s: 'Paid', c: 'var(--success)' },
              ]).map(inv => (
                <div key={inv.m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, padding: '8px 10px', border: '1px solid var(--ink-100)', borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>Invoice · {inv.m}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: inv.c, background: `color-mix(in srgb, ${inv.c} 12%, white)`, padding: '2px 9px', borderRadius: 999 }}>{inv.s}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--ink-100)' }}>
            <Btn variant="ghost" size="sm" onClick={() => goTo('billing')}>Open Subscriptions & Billing →</Btn>
          </div>
        </Card>

        {/* W5 — Subscriptions & pending requests */}
        <Card padding={0}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Subscriptions & requests</div>
            <Btn variant="ghost" size="sm" onClick={() => goTo('requests')}>View all →</Btn>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', gap: 8 }}>
            {[['Active', demoEmpty ? 0 : 5, 'var(--success)'], ['Trial', demoEmpty ? 0 : 1, 'var(--info)'], ['Pending', demoEmpty ? 0 : 2, 'var(--warning)']].map(([l, n, c]) => (
              <div key={l} style={{ flex: 1, textAlign: 'center', background: `color-mix(in srgb, ${c} 7%, white)`, border: `1px solid color-mix(in srgb, ${c} 22%, white)`, borderRadius: 9, padding: '10px 6px' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{n}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: c }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 18px 14px', display: 'grid', gap: 10 }}>
            {(demoEmpty ? [] : [
              { api: 'AECB Credit Report v2.0', target: 'production', stage: 3, label: 'Security review' },
              { api: 'EFR v1.1', target: 'sandbox', stage: 4, label: 'Approval' },
            ]).map(r => (
              <div key={r.api} style={{ border: '1px solid var(--ink-100)', borderRadius: 8, padding: '9px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.api} <span style={{ color: 'var(--ink-500)', fontWeight: 500 }}>→ {r.target}</span></span>
                  <span style={{ color: 'var(--appro-blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label} · {r.stage}/5</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 999, background: s <= r.stage ? 'var(--appro-blue)' : 'var(--ink-100)' }}/>)}
                </div>
              </div>
            ))}
            {demoEmpty && <div style={{ fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', padding: '8px 0' }}>No open requests</div>}
          </div>
        </Card>

        {/* W6 — Recent errors (selected environment) */}
        <Card padding={0}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Recent errors</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 1 }}>status ≥ 400 · {isCurrent ? env : periodLabel + ' · ' + env}</div>
            </div>
            <Btn variant="ghost" size="sm" onClick={() => goTo('logs')}>Logs →</Btn>
          </div>
          <div>
            {(demoEmpty ? [] : (isProd ? [
              { t: '14:22:03', m: 'POST', p: '/v2/income/verify', s: 400 },
              { t: '14:21:50', m: 'GET', p: '/v2/identity/verify', s: 401 },
              { t: '14:18:22', m: 'GET', p: '/v2/aecb/score', s: 429 },
            ] : [
              { t: '14:20:11', m: 'POST', p: '/v2/aecb/report', s: 400 },
              { t: '14:16:40', m: 'GET', p: '/v2/email/verify', s: 429 },
              { t: '14:12:05', m: 'POST', p: '/v2/efr/company', s: 500 },
            ])).map((r, i, arr) => (
              <div key={i} style={{ padding: '10px 18px', display: 'flex', gap: 10, alignItems: 'center', fontSize: 11.5, fontFamily: 'var(--font-mono)', borderBottom: i < arr.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <span style={{ color: 'var(--ink-500)' }}>{r.t}</span>
                <span style={{ color: 'var(--ink-600)' }}>{r.m}</span>
                <span style={{ flex: 1, color: 'var(--ink-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.p}</span>
                <span style={{ fontWeight: 700, color: r.s >= 500 ? 'var(--danger)' : 'var(--warning)' }}>{r.s}</span>
              </div>
            ))}
            {demoEmpty && <div style={{ fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', padding: '18px 0' }}>No errors — no traffic yet</div>}
          </div>
        </Card>
      </div>

      {/* Connected APIs — full width (PO review 13-08-2026: readiness checklist removed from v1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 20 }}>
        {/* Connected APIs */}
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Your connected APIs</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{demoEmpty ? 'No APIs connected · subscribe to get started' : env === 'production' ? '2 live · 1 awaiting approval' : '3 APIs in sandbox · synthetic data'}</div>
            </div>
            <Btn variant="ghost" size="sm" onClick={() => goTo('usage')}>View analytics →</Btn>
          </div>
          <div>
            {apis.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--ink-100)', color: 'var(--ink-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Icon name="zap" size={20}/></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-800)', fontFamily: 'var(--font-ui)' }}>No connected APIs yet</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 3, marginBottom: 14 }}>Subscribe to a product to start making requests.</div>
                <Btn variant="primary" size="sm" icon="plus" onClick={() => goTo('catalog')}>Browse catalog</Btn>
              </div>
            )}
            {apis.map((a, i) => (
              <div key={a.name} style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,.8fr) minmax(0,.7fr) minmax(0,.8fr) minmax(0,.7fr)', gap: 12, alignItems: 'center', borderBottom: i < apis.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="zap" size={16}/>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-800)', fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{a.version}</div>
                  </div>
                </div>
                <div><StatusPill kind={a.status}>{a.status === 'live' ? 'Live' : a.status === 'active' ? 'Active' : a.status === 'pending' ? 'Pending' : 'In review'}</StatusPill></div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{a.calls}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>p95 <b style={{ color: 'var(--ink-800)' }}>{a.latency}</b></div>
                <div style={{ fontSize: 12, color: 'var(--ink-600)', textAlign: 'right' }}>err {a.err}</div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Activity — full width (PO review 13-08-2026: quick-start card removed from v1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Activity</div>
            <Btn variant="ghost" size="sm">See audit log →</Btn>
          </div>
          <div>
            {activity.map((a, i) => (
              <div key={i} style={{ padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: i < activity.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `color-mix(in srgb, ${a.color} 12%, white)`,
                  color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={a.icon} size={14}/>
                </div>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.4 }}>
                  <b style={{ color: 'var(--ink-900)' }}>{a.who}</b> {a.what} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--appro-blue)', background: 'var(--appro-blue-100)', padding: '1px 6px', borderRadius: 4 }}>{a.target}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', whiteSpace: 'nowrap', marginTop: 3 }}>{a.t}</div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

/* ---------- CATALOG ---------- */
// Map a backend product to the catalogue card shape (colour derived from category).
const CAT_COLOR = { credit: 'var(--success)', identity: 'var(--appro-blue)', compliance: '#EBBE00', income: '#7C3AED', analytics: '#00AEEF', banking: '#0072BC' };
function mapApiProduct(p) {
  return { id: p.id, name: p.name, cat: p.category, v: p.version, status: p.status, desc: p.description || '',
    owner: p.owner, auth: p.auth, rate: p.rate_limit, cloud: p.cloud, region: p.region,
    color: CAT_COLOR[p.category] || 'var(--appro-blue)', variants: 1 };
}

function Catalog({ env, openApi, subscribedIds = [], requestedIds = [], approvedIds = [], onSubscribe, onRequestPrice, onActivate }) {
  const { useState } = React;
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [apiProducts, setApiProducts] = useState(null);
  React.useEffect(() => {
    if (window.approApi && window.approApi.enabled()) {
      window.approApi.products().then(rows => setApiProducts(rows.map(mapApiProduct))).catch(() => {});
    }
  }, []);

  const categories = [
    { id: 'all', label: 'All Products', count: 36 },
    { id: 'credit', label: 'Credit & Risk', count: 10 },
    { id: 'identity', label: 'Identity & Verification', count: 6 },
    { id: 'banking', label: 'Banking & Payments', count: 6 },
    { id: 'income', label: 'Income & Employment', count: 3 },
    { id: 'compliance', label: 'Compliance & Screening', count: 6 },
    { id: 'analytics', label: 'Analytics & Data', count: 5 },
  ];

  const apis = [
    { id: 'email-verification', name: 'Email Verification', cat: 'identity', v: 'v1.3', status: 'live', desc: 'Validate email deliverability, ownership and fraud risk in real time (Emailage).', owner: 'Appro', auth: 'API Key (X-Api-Key + X-Client-Id)', rate: '100 rps', subscribed: true, color: 'var(--appro-blue)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-score-company', name: 'Credit Score (Company)', cat: 'credit', v: 'v2.0', status: 'live', desc: 'Pulls a company credit score from Al Etihad Credit Bureau.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '120 req/s', subscribed: true, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-full-company', name: 'Credit Full Report (Company)', cat: 'credit', v: 'v2.0', status: 'live', desc: 'Pulls a full company credit report from Al Etihad Credit Bureau.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '80 req/s', subscribed: true, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-score-individual', name: 'Credit Score (Individual)', cat: 'credit', v: 'v2.0', status: 'live', desc: 'Pulls an individual credit score from Al Etihad Credit Bureau.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '120 req/s', subscribed: true, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-full-individual', name: 'Credit Full Report (Individual)', cat: 'credit', v: 'v2.0', status: 'live', desc: 'Pulls a full individual credit report from Al Etihad Credit Bureau.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '80 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-analytics-individual', name: 'Credit Analytics Report (Individual)', cat: 'credit', v: 'v1.4', status: 'live', desc: 'Advanced individual credit analytics sourced from Al Etihad Credit Bureau.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '60 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-analytics-company', name: 'Credit Analytics Report (Company)', cat: 'credit', v: 'v1.4', status: 'live', desc: 'Advanced company credit analytics sourced from Al Etihad Credit Bureau.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '60 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'id-document-extraction', name: 'ID Document Data Extraction', cat: 'identity', v: 'v1.2', status: 'live', desc: 'Pulls user data from identity documents using OCR.', owner: 'Identity Team', auth: 'OAuth 2.0', rate: '200 req/s', subscribed: true, color: 'var(--appro-blue)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'identity-verification', name: 'Identity Verification', cat: 'identity', v: 'v1.3', status: 'live', desc: 'Uses Emirates face recognition to validate an ID.', owner: 'Identity Team', auth: 'OAuth 2.0', rate: '150 req/s', subscribed: false, color: 'var(--appro-blue)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'biographic-verification', name: 'Biographic Verification', cat: 'identity', v: 'v1.1', status: 'live', desc: 'Uses Emirates face recognition to verify the customer with biometrics.', owner: 'Identity Team', auth: 'OAuth 2.0', rate: '120 req/s', subscribed: false, color: 'var(--appro-blue)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'business-verification', name: 'Business Verification', cat: 'identity', v: 'v1.0', status: 'live', desc: 'Verifies the legitimacy and standing of a business entity.', owner: 'Identity Team', auth: 'OAuth 2.0', rate: '80 req/s', subscribed: false, color: 'var(--appro-blue)', cloud: 'azure', region: 'UAE North', variants: 1 },
    { id: 'uae-pass', name: 'UAE Pass', cat: 'identity', v: 'v2.1', status: 'live', desc: 'Government Digital Identity — uses UAE Government digital signing to verify the customer.', owner: 'Identity Team', auth: 'OAuth 2.0 + FAPI', rate: '100 req/s', subscribed: false, color: 'var(--appro-blue)', cloud: 'azure', region: 'UAE North', variants: 1 },
    { id: 'email-risk', name: 'Email Risk Assessment', cat: 'compliance', v: 'v1.2', status: 'live', desc: 'Scores email addresses for fraud and abuse risk signals.', owner: 'Risk Team', auth: 'OAuth 2.0', rate: '300 req/s', subscribed: false, color: '#EBBE00', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'sanctions-screening', name: 'Sanctions Screening', cat: 'compliance', v: 'v0.9', status: 'draft', desc: 'AML & sanctions screening against global watchlists.', owner: 'Compliance', auth: 'mTLS + OAuth', rate: '60 req/s', subscribed: false, color: '#EBBE00', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'mohre-income', name: 'MOHRE Income Verification', cat: 'income', v: 'v1.0', status: 'live', desc: 'Employment Income Verification — uses the UAE ministry to verify a customer’s salary.', owner: 'Income Team', auth: 'mTLS + OAuth', rate: '70 req/s', subscribed: false, color: '#7C3AED', cloud: 'azure', region: 'UAE North', variants: 1 },
    { id: 'text-analytics', name: 'Text Analytics (Name Indexer)', cat: 'analytics', v: 'v1.1', status: 'live', desc: 'Improves search and matching for a customer’s name.', owner: 'Data Team', auth: 'OAuth 2.0', rate: '250 req/s', subscribed: false, color: '#00AEEF', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'statement-analyzer', name: 'Statement Analyzer', cat: 'analytics', v: 'v1.0', status: 'live', desc: 'Financial statement analyzer for bank-statement insights.', owner: 'Data Team', auth: 'OAuth 2.0', rate: '90 req/s', subscribed: false, color: '#00AEEF', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'geolocator', name: 'Geolocator', cat: 'analytics', v: 'v1.0', status: 'live', desc: 'Location Intelligence — resolves and enriches customer location data.', owner: 'Data Team', auth: 'OAuth 2.0', rate: '200 req/s', subscribed: false, color: '#00AEEF', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'aecb-score-retrieval', name: 'AECB Credit Score Retrieval API', cat: 'credit', v: 'v2.0', status: 'live', desc: 'Retrieve AECB credit scores on demand for decisioning workflows.', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '120 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-decisioning-engine', name: 'Credit Decisioning Engine (CDE)', cat: 'credit', v: 'v1.2', status: 'live', desc: 'Automated credit decisioning across bureau, income and risk inputs.', owner: 'Credit Team', auth: 'OAuth 2.0', rate: '80 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'risk-rules-engine', name: 'Customizable Risk Rules Engine', cat: 'credit', v: 'v1.1', status: 'live', desc: 'Author and run configurable risk rules against applications.', owner: 'Risk Team', auth: 'OAuth 2.0', rate: '100 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'credit-decision-output', name: 'Credit Decision API Output', cat: 'credit', v: 'v1.0', status: 'live', desc: 'Structured decision results — approve, decline, refer — with reason codes.', owner: 'Credit Team', auth: 'OAuth 2.0', rate: '120 req/s', subscribed: false, color: 'var(--success)', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'transaction-monitoring', name: 'Transaction Monitoring Capability', cat: 'compliance', v: 'v1.2', status: 'live', desc: 'Monitor transactions for suspicious patterns and AML triggers.', owner: 'Compliance', auth: 'mTLS + OAuth', rate: '300 req/s', subscribed: false, color: '#EBBE00', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'compliance-alert-escalation', name: 'Compliance Alert Escalation', cat: 'compliance', v: 'v1.0', status: 'live', desc: 'Route and escalate compliance alerts to the right reviewers.', owner: 'Compliance', auth: 'OAuth 2.0', rate: '80 req/s', subscribed: false, color: '#EBBE00', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'compliance-oversight', name: 'Compliance Monitoring & Oversight', cat: 'compliance', v: 'v1.0', status: 'live', desc: 'Oversight dashboards and controls for compliance operations.', owner: 'Compliance', auth: 'OAuth 2.0', rate: '60 req/s', subscribed: false, color: '#EBBE00', cloud: 'azure', region: 'UAE North', variants: 1 },
    { id: 'core-banking-loans', name: 'Core Banking Loans', cat: 'banking', v: 'v2.0', status: 'live', desc: 'Originate, book and service loans on the core banking system.', owner: 'Core Banking', auth: 'mTLS + OAuth', rate: '90 req/s', subscribed: false, color: '#0072BC', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'balance-inquiry-repayment', name: 'Balance Inquiry & Repayment', cat: 'banking', v: 'v1.4', status: 'live', desc: 'Query balances and post repayments against customer accounts.', owner: 'Core Banking', auth: 'mTLS + OAuth', rate: '250 req/s', subscribed: false, color: '#0072BC', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'direct-debit', name: 'Direct Debit Management', cat: 'banking', v: 'v1.2', status: 'live', desc: 'Set up and manage direct-debit mandates and collections.', owner: 'Payments', auth: 'mTLS + OAuth', rate: '120 req/s', subscribed: false, color: '#0072BC', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'uaefts-transfers', name: 'UAEFTS Transfer Services', cat: 'banking', v: 'v1.1', status: 'live', desc: 'Initiate and track fund transfers over the UAE Funds Transfer System.', owner: 'Payments', auth: 'mTLS', rate: '100 req/s', subscribed: false, color: '#0072BC', cloud: 'azure', region: 'UAE North', variants: 1 },
    { id: 'soa-retrieval', name: 'Statement of Account (SOA) Retrieval', cat: 'banking', v: 'v1.0', status: 'live', desc: 'Retrieve account statements over a chosen period.', owner: 'Core Banking', auth: 'OAuth 2.0', rate: '150 req/s', subscribed: false, color: '#0072BC', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'mohre-verification', name: 'MOHRE Verification Integration', cat: 'income', v: 'v1.0', status: 'live', desc: 'Integrate with MOHRE to verify employment and labour records.', owner: 'Income Team', auth: 'mTLS + OAuth', rate: '70 req/s', subscribed: false, color: '#7C3AED', cloud: 'azure', region: 'UAE North', variants: 1 },
    { id: 'reporting-analytics', name: 'Reporting & Analytics Capability', cat: 'analytics', v: 'v1.0', status: 'live', desc: 'Operational and business reporting across products and usage.', owner: 'Data Team', auth: 'OAuth 2.0', rate: '90 req/s', subscribed: false, color: '#00AEEF', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'service-level-reporting', name: 'Service-Level Reporting', cat: 'analytics', v: 'v1.0', status: 'live', desc: 'SLA attainment, uptime and latency reporting per product.', owner: 'Data Team', auth: 'OAuth 2.0', rate: '90 req/s', subscribed: false, color: '#00AEEF', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'aml-tfs-screening', name: 'AML/TFS Name Screening', cat: 'compliance', v: 'v1.0', status: 'live', desc: 'Screen names against AML and Targeted Financial Sanctions watchlists.', owner: 'Compliance', auth: 'mTLS + OAuth', rate: '120 req/s', subscribed: false, color: '#EBBE00', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'funds-transfer-services', name: 'Funds Transfer Services', cat: 'banking', v: 'v1.0', status: 'live', desc: 'Initiate and track interbank and domestic fund transfers.', owner: 'Payments', auth: 'mTLS + OAuth', rate: '150 req/s', subscribed: false, color: '#0072BC', cloud: 'aws', region: 'me-central-1', variants: 1 },
    { id: 'salary-verification', name: 'Salary Verification', cat: 'income', v: 'v1.0', status: 'live', desc: 'Verify a customer’s declared salary against trusted sources.', owner: 'Income Team', auth: 'OAuth 2.0', rate: '80 req/s', subscribed: false, color: '#7C3AED', cloud: 'aws', region: 'me-central-1', variants: 1 },
  ];

  const publishedApis = (() => {
    try { return JSON.parse(localStorage.getItem('appro.publishedApis') || '[]'); } catch(e) { return []; }
  })();

  const baseApis = apiProducts || apis;
  // Expose the catalogue so other screens (e.g. Usage & Analytics) reflect the same products.
  try { window.CUSTOMER_CATALOGUE = [...publishedApis, ...baseApis]; } catch (e) {}
  const filtered = [...publishedApis, ...baseApis]
    .map(a => ({ ...a, subscribed: subscribedIds.includes(a.id) }))
    .filter(a => (cat === 'all' || a.cat === cat) && (a.name.toLowerCase().includes(q.toLowerCase()) || a.desc.toLowerCase().includes(q.toLowerCase())));
  try { window.PORTAL_PRODUCTS = [...publishedApis, ...baseApis].map(a => ({ id: a.id, name: a.name, desc: a.desc })); } catch(e) {}

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Hero search */}
      <div style={{
        background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 14,
        padding: '22px 26px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20,
        backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(59,126,246,.08), transparent 40%)',
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}>
            Product Catalogue
          </h2>
          <p style={{ margin: '4px 0 14px', fontSize: 13, color: 'var(--ink-600)' }}>
            36 governed products · UAE-aligned · Each with sandbox, OpenAPI spec, and SLA.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'var(--ink-100)',
            border: '1px solid var(--ink-200)', borderRadius: 10, padding: '10px 14px', maxWidth: 520,
          }}>
            <Icon name="search" size={16}/>
            <input placeholder="Search by name, capability, or endpoint…" value={q} onChange={e => setQ(e.target.value)}
                   style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'var(--font-ui)' }}/>
            <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 4, padding: '1px 5px', color: 'var(--ink-600)' }}>⌘K</kbd>
          </div>
        </div>
        <div style={{ width: 260, display: 'grid', gap: 8 }}>
          {[
            { i: 'check', t: '36 products admitted', c: 'var(--success)' },
            { i: 'lock', t: 'OAuth 2.0 + mTLS + FAPI', c: 'var(--appro-blue)' },
            { i: 'globe', t: 'UAE · expanding to GCC', c: '#7C3AED' },
          ].map(x => (
            <div key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-700)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `color-mix(in srgb, ${x.c} 12%, white)`, color: x.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={x.i} size={13}/>
              </div>
              {x.t}
            </div>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            background: cat === c.id ? '#0C1931' : '#fff',
            color: cat === c.id ? '#fff' : 'var(--ink-700)',
            border: '1px solid ' + (cat === c.id ? '#0C1931' : 'var(--ink-200)'),
            padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', gap: 8, alignItems: 'center',
          }}>
            {c.label}
            <span style={{
              background: cat === c.id ? 'rgba(255,255,255,.15)' : 'var(--ink-100)',
              color: cat === c.id ? 'rgba(255,255,255,.8)' : 'var(--ink-500)',
              fontSize: 10, padding: '1px 7px', borderRadius: 999,
            }}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {filtered.map(a => (
          <div key={a.id} onClick={() => openApi(a)} style={{
            background: '#fff', borderRadius: 12, border: '1px solid var(--ink-200)',
            padding: 18, cursor: 'pointer', transition: 'all .15s', position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,45,82,.12)'; e.currentTarget.style.borderColor = 'var(--appro-blue-300)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--ink-200)'; }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `color-mix(in srgb, ${a.color} 12%, white)`, color: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="zap" size={18}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', fontFamily: 'var(--font-display)', lineHeight: 1.25, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', background: 'var(--ink-100)', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>{a.v}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{a.owner}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <StatusPill kind={a.status}>{a.status === 'live' ? 'Live' : a.status === 'beta' ? 'Beta' : 'Deprecated'}</StatusPill>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.5, minHeight: 56 }}>{a.desc}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Auth</span>
              <span style={{ fontSize: 11, color: 'var(--ink-700)', fontWeight: 600 }}>{a.auth}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginLeft: 8 }}>Rate</span>
              <span style={{ fontSize: 11, color: 'var(--ink-700)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{a.rate}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--ink-100)', marginTop: 14, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {a.subscribed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="check" size={12} stroke={3}/> Subscribed
                  </span>
                  {a.cloud && <CloudChip cloud={a.cloud} region={a.region}/>}
                </div>
              ) : approvedIds.includes(a.id) ? (
                <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--success-tint)', padding: '3px 9px', borderRadius: 999 }}>
                  <Icon name="check" size={11} stroke={3}/> Approved · ready to subscribe
                </span>
              ) : requestedIds.includes(a.id) ? (
                <span style={{ fontSize: 11, color: '#8a6c00', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--warning-tint)', padding: '3px 9px', borderRadius: 999 }}>
                  <Icon name="refresh" size={11}/> Under review
                </span>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>Price on request</span>
              )}
              {a.subscribed
                ? <span style={{ fontSize: 12, color: 'var(--appro-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>View details <Icon name="arrow" size={12}/></span>
                : approvedIds.includes(a.id)
                ? <button onClick={(e) => { e.stopPropagation(); onActivate && onActivate(a); }} style={{ background: 'var(--success)', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>Subscribe <Icon name="arrow" size={11}/></button>
                : requestedIds.includes(a.id)
                ? <span style={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>Awaiting review</span>
                : <button onClick={(e) => { e.stopPropagation(); onRequestPrice && onRequestPrice(a); }} style={{ background: 'var(--appro-blue)', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>Request for Price <Icon name="arrow" size={11}/></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Catalog });

// Seed a canonical product list at module load so consumers (e.g. Create API Key modal)
// have subscribed-product metadata even before the Catalogue screen is ever rendered.
// Once the Catalogue renders it replaces this with the full live list.
if (!window.PORTAL_PRODUCTS) {
  window.PORTAL_PRODUCTS = [
    { id: 'email-verification', name: 'Email Verification', desc: 'Validate email deliverability, ownership and fraud risk in real time (Emailage).' },
    { id: 'credit-score-company', name: 'Credit Score (Company)', desc: 'Pulls a company credit score from Al Etihad Credit Bureau.' },
    { id: 'credit-full-company', name: 'Credit Full Report (Company)', desc: 'Pulls a full company credit report from Al Etihad Credit Bureau.' },
    { id: 'credit-score-individual', name: 'Credit Score (Individual)', desc: 'Pulls an individual credit score from Al Etihad Credit Bureau.' },
    { id: 'id-document-extraction', name: 'ID Document Data Extraction', desc: 'Pulls user data from identity documents using OCR.' },
  ];
}
