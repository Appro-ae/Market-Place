// Admin — Platform operations dashboard (GAS-561).
// Cross-module landing screen: KPI strip, subscription-request pipeline, usage trend,
// top products/tenants, recent errors and activity. Every card drills into its owning
// module; the Sandbox/Production toggle (lifted into AdminApp) scopes all traffic cards.
// Super Admin holds every View permission, so the prototype renders the full widget set;
// per GAS-561 AC2 each card is gated by its source module-group's View permission.
const { useState: useDB } = React;

const DB_SERIES = {
  production: {
    '24h': { bars: [62,70,68,75,82,78,88,90,85,92,96,94,90,88,92,95,99,96,93,90,88,85,80,76], unit: 'Hourly · last 24h', total: '5.9M', x: i => i % 4 === 0 ? String(i).padStart(2,'0')+':00' : null, last: 'now' },
    '7d':  { bars: [820,910,1120,980,1040,760,690], unit: 'Daily · last 7 days', total: '41.2M', x: i => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], last: null },
    '30d': { bars: Array.from({length:30},(_,i)=>Math.round(700+Math.sin(i/3)*160+i*9+(i%6===0?90:0))), unit: 'Daily · last 30 days', total: '182.4M', x: i => (i===0||(i+1)%5===0)?('d'+(i+1)):null, last: null },
  },
  sandbox: {
    '24h': { bars: [18,22,26,24,30,34,31,38,42,40,45,48,44,41,46,50,54,51,48,44,40,36,30,26], unit: 'Hourly · last 24h', total: '184K', x: i => i % 4 === 0 ? String(i).padStart(2,'0')+':00' : null, last: 'now' },
    '7d':  { bars: [210,260,340,300,320,180,150], unit: 'Daily · last 7 days', total: '1.28M', x: i => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], last: null },
    '30d': { bars: Array.from({length:30},(_,i)=>Math.round(160+Math.sin(i/3)*50+i*3+(i%6===0?30:0))), unit: 'Daily · last 30 days', total: '5.6M', x: i => (i===0||(i+1)%5===0)?('d'+(i+1)):null, last: null },
  },
};
const DB_KPI = {
  production: { succ: '99.74%', succD: '+0.06%', err: '0.26%', errD: '+0.03%' },
  sandbox:    { succ: '98.12%', succD: '+0.4%',  err: '1.88%', errD: '-0.4%' },
};
// The admin's product universe (published + seed) — same derivation Usage & Analytics uses.
const DB_CAT_COLOR = { credit: 'var(--success)', identity: 'var(--appro-blue)', compliance: 'var(--warning)', income: '#7C3AED', analytics: 'var(--info)', banking: '#0072BC' };
function dbCatalogue() {
  let published = [];
  try { published = JSON.parse(localStorage.getItem('appro.publishedApis') || '[]'); } catch (e) {}
  const seed = (window.ADMIN && window.ADMIN.SEED_APIS) || [];
  const seen = new Set(), out = [];
  for (const p of [...published, ...seed]) if (p && p.id && !seen.has(p.id)) { seen.add(p.id); out.push({ name: p.name, category: p.cat || p.category || 'credit' }); }
  return out;
}
function dbByProduct(products, topN) {
  const withVol = products.map((p, i) => ({ p, vol: 4 + ((p.name.length * 7 + i * 13) % 92) })).sort((a, b) => b.vol - a.vol).slice(0, topN);
  const total = withVol.reduce((s, x) => s + x.vol, 0) || 1;
  return withVol.map(({ p, vol }) => ({ n: p.name, calls: vol.toFixed(1) + 'M', pct: Math.round(vol / total * 100), c: DB_CAT_COLOR[p.category] || 'var(--appro-blue)' }));
}

function AdminDashboard({ env, requests, goTo }) {
  const [range, setRange] = useDB('24h');
  const series = DB_SERIES[env][range];
  const kpi = DB_KPI[env];
  const bars = series.bars, max = Math.max(...bars);

  // Live pipeline counts from the cross-portal request store (today's queue).
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  const byProduct = dbByProduct(dbCatalogue(), 8);
  const topTenants = [
    { n: 'Marble Bank', calls: '68.4M', pct: 38, err: '0.11%' },
    { n: 'Nuqud Pay', calls: '52.1M', pct: 29, err: '0.18%' },
    { n: 'Cedar Finance', calls: '31.8M', pct: 17, err: '0.42%' },
    { n: 'Falcon Lending', calls: '18.2M', pct: 10, err: '0.24%' },
    { n: 'Oasis Wallet', calls: '11.9M', pct: 6, err: '0.09%' },
  ];
  const errorRows = [
    { t: '14:22:03.221', ten: 'Nuqud Pay', m: 'POST', p: '/v2/income/verify', s: 400, l: 44 },
    { t: '14:21:59.540', ten: 'Oasis Wallet', m: 'GET', p: '/v2/aecb/score', s: 429, l: 12 },
    { t: '14:21:54.011', ten: 'Falcon Lending', m: 'GET', p: '/v2/efr/company/ef_22', s: 500, l: 8 },
    { t: '14:21:50.902', ten: 'Nuqud Pay', m: 'GET', p: '/v2/identity/verify', s: 401, l: 9 },
  ];
  const activity = [
    { t: '4 min ago', who: 'Rana Adel', what: 'published', target: 'Email Verification v1.3', icon: 'check', c: 'var(--success)' },
    { t: '1 h ago', who: 'System', what: 'received access request from', target: 'Nuqud Pay → AECB', icon: 'requests', c: 'var(--appro-blue)' },
    { t: '3 h ago', who: 'Karim H.', what: 'moved to review', target: 'Income Verification v0.9', icon: 'logs', c: 'var(--warning)' },
    { t: 'Yesterday', who: 'Rana Adel', what: 'deprecated', target: 'Statements & Documents v1.0', icon: 'alert', c: 'var(--danger)' },
  ];
  const codeColor = s => s >= 500 ? 'var(--danger)' : s >= 400 ? 'var(--warning)' : 'var(--success)';
  const kpiCard = (label, value, sub, accent, onClick) => (
    <Card padding={16} style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', marginTop: 7 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 3, whiteSpace: 'nowrap' }}>{sub}</div>
      <div style={{ height: 3, borderRadius: 2, background: accent, marginTop: 10, opacity: .85 }}/>
    </Card>
  );

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Controls: range selector + freshness (GAS-561 AC4/AC6) */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 8, padding: 3, fontSize: 12, fontWeight: 600 }}>
          {['24h','7d','30d'].map(r => <button key={r} onClick={() => setRange(r)} style={{ background: range===r ? 'var(--appro-blue)' : 'transparent', color: range===r ? '#fff' : 'var(--ink-500)', border: 0, padding: '6px 13px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{r}</button>)}
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Scope: <b style={{ color: 'var(--ink-700)', textTransform: 'capitalize' }}>{env}</b> · widgets follow your View permissions</span>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Updated <b style={{ color: 'var(--ink-700)' }}>just now</b></span>
          <Btn variant="secondary" size="sm" icon="refresh" onClick={() => window.toast && window.toast.success('Dashboard refreshed', 'All widgets re-queried for ' + env + '.')}>Refresh</Btn>
        </div>
      </div>

      {/* W1 — KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 16 }}>
        {kpiCard('Active tenants', '5', 'of 6 · 1 suspended', '#7C3AED', () => goTo('tenant-management'))}
        {kpiCard('Pending requests', pending, 'subscription queue', 'var(--appro-blue)', () => goTo('subscriptions'))}
        {kpiCard('API calls', series.total, series.unit.toLowerCase(), 'var(--appro-blue)', () => goTo('usage'))}
        {kpiCard('Success rate', kpi.succ, kpi.succD + ' vs prev', 'var(--success)', () => goTo('usage'))}
        {kpiCard('Error rate', kpi.err, kpi.errD + ' vs prev', 'var(--danger)', () => goTo('logs'))}
        {kpiCard('Revenue (AED)', '371.4K', 'projected · Jun cycle', 'var(--warning)', () => goTo('billing'))}
      </div>

      {/* W2 — Subscription-request pipeline */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Subscription-request pipeline</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Today's queue · MTD: 27 received · 20 approved · 4 rejected</div></div>
          <Btn variant="ghost" size="sm" onClick={() => goTo('subscriptions')}>Open Subscription Management →</Btn>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {[
            { s: 'Pending', n: pending, c: 'var(--warning)', d: 'awaiting review' },
            { s: 'Approved', n: approved, c: 'var(--success)', d: 'tenant completes subscription' },
            { s: 'Rejected', n: rejected, c: 'var(--danger)', d: 'declined with reason' },
          ].map((p, i, arr) => (
            <React.Fragment key={p.s}>
              <div style={{ flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', gap: 12, background: `color-mix(in srgb, ${p.c} 7%, white)`, border: `1px solid color-mix(in srgb, ${p.c} 25%, white)`, borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{p.n}</div>
                <div><div style={{ fontSize: 12.5, fontWeight: 700, color: p.c }}>{p.s}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{p.d}</div></div>
              </div>
              {i < arr.length - 1 && <span style={{ color: 'var(--ink-300)', fontSize: 18, fontWeight: 700 }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* W3 — Request volume trend */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Request volume</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{series.unit} · all tenants · {env}</div></div>
          <Btn variant="ghost" size="sm" onClick={() => goTo('usage')}>Open Usage & Analytics →</Btn>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: bars.length > 12 ? 3 : 8, height: 150 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ width: '100%', maxWidth: 34, height: `${Math.round(b/max*100)}%`, minHeight: 3, background: i === bars.length-1 ? 'linear-gradient(180deg,#6196FA,#3B7EF6)' : 'var(--appro-blue-300)', borderRadius: '4px 4px 0 0' }}/>
                <div style={{ fontSize: 9.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{(i === bars.length-1 && series.last) ? series.last : (series.x(i) || '')}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* W4 + W5 — Calls by product / Top tenants */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Calls by product</div>
          <div style={{ padding: 20 }}>
            {byProduct.map((a, i) => (
              <div key={a.n} style={{ marginBottom: i < byProduct.length-1 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>{a.n}</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{a.calls} · {a.pct}%</span></div>
                <div style={{ height: 7, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: a.pct + '%', background: a.c }}/></div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding={0}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Top tenants by volume</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead style={{ background: 'var(--ink-50)' }}><tr>{['Tenant','Calls','Share','Error'].map(h => <th key={h} style={{ textAlign: h==='Tenant'?'left':'right', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr></thead>
            <tbody>
              {topTenants.map((t, i) => (
                <tr key={t.n} style={{ borderBottom: i < topTenants.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--ink-900)' }}>{t.n}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{t.calls}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', color: 'var(--ink-600)' }}>{t.pct}%</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: parseFloat(t.err) > 0.3 ? 'var(--danger)' : 'var(--ink-600)' }}>{t.err}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* W6 + W7 — Recent errors / Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Recent errors</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>status ≥ 400 · live tail · {env}</div></div>
            <Btn variant="ghost" size="sm" onClick={() => goTo('logs')}>Open Request Logs →</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody style={{ fontFamily: 'var(--font-mono)' }}>
              {errorRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < errorRows.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{r.t}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-800)', fontFamily: 'var(--font-ui)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.ten}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-600)' }}>{r.m}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-800)' }}>{r.p}</td>
                  <td style={{ padding: '10px 16px' }}><span style={{ color: codeColor(r.s), fontWeight: 700 }}>{r.s}</span></td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-600)', textAlign: 'right' }}>{r.l}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card padding={0}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Recent activity</div>
          <div>
            {activity.map((a, i) => (
              <div key={i} style={{ padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: i < activity.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `color-mix(in srgb, ${a.c} 14%, white)`, color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} size={13}/></div>
                <div style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.45 }}><b style={{ color: 'var(--ink-900)' }}>{a.who}</b> {a.what} <span style={{ fontWeight: 600, color: 'var(--appro-blue)' }}>{a.target}</span></div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{a.t}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
window.AdminDashboard = AdminDashboard;
