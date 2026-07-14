// Admin — Usage & Analytics + Request Logs (platform-wide, across all tenants)
// Reuses shared atoms (Card, Btn, StatusPill, Icon) loaded via Shell.jsx.
const { useState: useAU } = React;

const AU_TENANTS = ['All tenants', 'Nuqud Pay', 'Marble Bank', 'Falcon Lending', 'Oasis Wallet', 'Cedar Finance'];
const AU_PRODUCTS = ['All products', 'Email Verification', 'AECB Credit Report', 'EFR', 'Identity Verification', 'Income Verification'];

// Colour a product by its catalogue category (keeps the usage view in sync with the catalogue).
const AU_CAT_COLOR = { credit: 'var(--success)', identity: 'var(--appro-blue)', compliance: 'var(--warning)', income: '#7C3AED', analytics: 'var(--info)', banking: '#0072BC' };
// React hook: load the real product catalogue from the backend (null until loaded / when using mock data).
function useApiProducts() {
  const [products, setProducts] = React.useState(null);
  React.useEffect(() => {
    if (window.approApi && window.approApi.enabled()) {
      window.approApi.products().then(setProducts).catch(() => {});
    }
  }, []);
  return products;
}
// The admin's product universe from Product Setup (published + seed catalogue) — used
// when there is no backend so Usage still reflects the products in Product Setup.
function adminCatalogue() {
  let published = [];
  try { published = JSON.parse(localStorage.getItem('appro.publishedApis') || '[]'); } catch (e) {}
  const seed = (window.ADMIN && window.ADMIN.SEED_APIS) || [];
  const seen = new Set(), out = [];
  for (const p of [...published, ...seed]) {
    if (p && p.id && !seen.has(p.id)) { seen.add(p.id); out.push({ name: p.name, category: p.cat || p.category || 'credit' }); }
  }
  return out;
}
// Build a "calls by product" breakdown from real products (deterministic, illustrative volumes).
function buildByProduct(products, topN) {
  const withVol = products.map((p, i) => ({ p, vol: 4 + ((p.name.length * 7 + i * 13) % 92) })).sort((a, b) => b.vol - a.vol).slice(0, topN);
  const total = withVol.reduce((s, x) => s + x.vol, 0) || 1;
  return withVol.map(({ p, vol }) => ({ n: p.name, calls: vol.toFixed(1) + 'M', pct: Math.round(vol / total * 100), c: AU_CAT_COLOR[p.category] || 'var(--appro-blue)' }));
}

/* ============================ USAGE & ANALYTICS ============================ */
function AdminUsageAnalytics() {
  const [range, setRange] = useAU('30d');
  const [tenant, setTenant] = useAU('All tenants');
  const apiProducts = useApiProducts();
  const series = {
    '24h': { bars: [62,70,68,75,82,78,88,90,85,92,96,94,90,88,92,95,99,96,93,90,88,85,80,76], unit: 'Hourly · last 24h', total: '5.9M', x: i => i % 4 === 0 ? String(i).padStart(2,'0')+':00' : null, last: 'now' },
    '7d':  { bars: [820,910,1120,980,1040,760,690], unit: 'Daily · last 7 days', total: '41.2M', x: i => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], last: null },
    '30d': { bars: Array.from({length:30},(_,i)=>Math.round(700+Math.sin(i/3)*160+i*9+(i%6===0?90:0))), unit: 'Daily · last 30 days', total: '182.4M', x: i => (i===0||(i+1)%5===0)?('d'+(i+1)):null, last: null },
  }[range];
  const bars = series.bars, max = Math.max(...bars);

  // Products come from Product Setup — the live backend catalogue when on, else the
  // admin's front-end catalogue (published + seed). Always reflects Product Setup.
  const catalogue = (apiProducts && apiProducts.length) ? apiProducts : adminCatalogue();
  const byProduct = catalogue.length ? buildByProduct(catalogue, 8) : [
    { n: 'Email Verification', calls: '84.2M', pct: 46, c: 'var(--appro-blue)' },
    { n: 'AECB Credit Report', calls: '41.9M', pct: 23, c: 'var(--success)' },
    { n: 'Identity Verification', calls: '29.1M', pct: 16, c: 'var(--info)' },
    { n: 'EFR', calls: '16.4M', pct: 9, c: '#7C3AED' },
    { n: 'Income Verification', calls: '10.8M', pct: 6, c: 'var(--warning)' },
  ];
  const topTenants = [
    { n: 'Marble Bank', calls: '68.4M', pct: 38, err: '0.11%' },
    { n: 'Nuqud Pay', calls: '52.1M', pct: 29, err: '0.18%' },
    { n: 'Cedar Finance', calls: '31.8M', pct: 17, err: '0.42%' },
    { n: 'Falcon Lending', calls: '18.2M', pct: 10, err: '0.24%' },
    { n: 'Oasis Wallet', calls: '11.9M', pct: 6, err: '0.09%' },
  ];
  const sel = { border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, fontFamily: 'var(--font-ui)', background: '#fff' };

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={tenant} onChange={e => setTenant(e.target.value)} style={sel}>{AU_TENANTS.map(t => <option key={t}>{t}</option>)}</select>
        <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 8, padding: 3, fontSize: 12, fontWeight: 600 }}>
          {['24h','7d','30d'].map(r => <button key={r} onClick={() => setRange(r)} style={{ background: range===r ? 'var(--appro-blue)' : 'transparent', color: range===r ? '#fff' : 'var(--ink-500)', border: 0, padding: '6px 13px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{r}</button>)}
        </div>
        <Btn variant="secondary" size="sm" icon="external" style={{ marginLeft: 'auto' }} onClick={() => window.toast && window.toast.success('Export started', 'Platform usage report (CSV) will download shortly.')}>Export</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { l: 'Total API calls', v: series.total, d: '+8.4%', up: true, c: 'var(--appro-blue)' },
          { l: 'Success rate', v: '99.74%', d: '+0.06%', up: true, c: 'var(--success)' },
          { l: 'Avg p95 latency', v: '148 ms', d: '-9 ms', up: true, c: 'var(--info)' },
          { l: 'Error rate', v: '0.26%', d: '+0.03%', up: false, c: 'var(--danger)' },
        ].map(k => (
          <Card key={k.l} padding={18}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ fontSize: 25, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{k.v}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: k.up ? 'var(--success)' : 'var(--danger)' }}>{k.up ? '↑' : '↓'} {k.d}</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: k.c, marginTop: 12, opacity: .85 }}/>
          </Card>
        ))}
      </div>

      {/* Volume chart */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Request volume</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{series.unit} · {tenant}</div></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-600)' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--appro-blue)' }}/>Calls / {range === '24h' ? 'hr' : 'day'}</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: bars.length > 12 ? 3 : 8, height: 180 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ width: '100%', maxWidth: 34, height: `${Math.round(b/max*100)}%`, minHeight: 3, background: i === bars.length-1 ? 'linear-gradient(180deg,#6196FA,#3B7EF6)' : 'var(--appro-blue-300)', borderRadius: '4px 4px 0 0' }}/>
                <div style={{ fontSize: 9.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{(i === bars.length-1 && series.last) ? series.last : (series.x(i) || '')}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Split: by product + top tenants */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Calls by product</div>
          <div style={{ padding: 20 }}>
            {byProduct.map((a, i) => (
              <div key={a.n} style={{ marginBottom: i < byProduct.length-1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}><span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>{a.n}</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{a.calls} · {a.pct}%</span></div>
                <div style={{ height: 7, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: a.pct + '%', background: a.c }}/></div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Top tenants by volume</div>
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
    </div>
  );
}

/* ============================ REQUEST LOGS ============================ */
function AdminRequestLogs() {
  const [tenant, setTenant] = useAU('All tenants');
  const [product, setProduct] = useAU('All products');
  const apiProducts = useApiProducts();
  const catalogue = (apiProducts && apiProducts.length) ? apiProducts : adminCatalogue();
  const productOptions = catalogue.length ? ['All products', ...catalogue.map(p => p.name)] : AU_PRODUCTS;
  const rows = [
    { t: '14:22:08.412', ten: 'Nuqud Pay', m: 'GET', p: '/v2/email/verify', s: 200, l: 84, k: 'pk_live_9c7b' },
    { t: '14:22:07.980', ten: 'Marble Bank', m: 'POST', p: '/v2/aecb/report', s: 201, l: 212, k: 'pk_live_2a1f' },
    { t: '14:22:06.115', ten: 'Cedar Finance', m: 'GET', p: '/v2/identity/verify', s: 200, l: 120, k: 'pk_live_77b1' },
    { t: '14:22:04.902', ten: 'Falcon Lending', m: 'POST', p: '/v2/efr/company', s: 200, l: 305, k: 'pk_live_4e1a' },
    { t: '14:22:03.221', ten: 'Nuqud Pay', m: 'POST', p: '/v2/income/verify', s: 400, l: 44, k: 'pk_live_9c7b' },
    { t: '14:22:01.870', ten: 'Marble Bank', m: 'GET', p: '/v2/email/verify', s: 200, l: 76, k: 'pk_live_2a1f' },
    { t: '14:21:59.540', ten: 'Oasis Wallet', m: 'GET', p: '/v2/aecb/score', s: 429, l: 12, k: 'pk_sbx_55ae' },
    { t: '14:21:58.100', ten: 'Cedar Finance', m: 'DELETE', p: '/v2/consents/cnst_8a1c', s: 200, l: 90, k: 'pk_live_77b1' },
    { t: '14:21:56.334', ten: 'Nuqud Pay', m: 'GET', p: '/v2/email/verify', s: 200, l: 81, k: 'pk_live_9c7b' },
    { t: '14:21:54.011', ten: 'Falcon Lending', m: 'GET', p: '/v2/efr/company/ef_22', s: 500, l: 8, k: 'pk_live_4e1a' },
    { t: '14:21:52.740', ten: 'Marble Bank', m: 'POST', p: '/v2/aecb/report', s: 201, l: 198, k: 'pk_live_2a1f' },
    { t: '14:21:50.902', ten: 'Nuqud Pay', m: 'GET', p: '/v2/identity/verify', s: 401, l: 9, k: 'pk_sbx_71bb' },
  ].filter(r => (tenant === 'All tenants' || r.ten === tenant));
  const methodColor = m => m === 'GET' ? 'var(--success)' : m === 'POST' ? 'var(--appro-blue)' : m === 'DELETE' ? 'var(--danger)' : 'var(--warning)';
  const codeColor = s => s >= 500 ? 'var(--danger)' : s >= 400 ? 'var(--warning)' : 'var(--success)';
  const sel = { border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-ui)', background: '#fff' };

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <Card padding={0} style={{ marginBottom: 12 }}>
        <div style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-100)', padding: '8px 12px', borderRadius: 8 }}>
            <Icon name="search" size={14}/>
            <input placeholder='Filter: path="/v2/aecb*" status>=400' style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'var(--font-mono)' }}/>
          </div>
          <select value={tenant} onChange={e => setTenant(e.target.value)} style={sel}>{AU_TENANTS.map(t => <option key={t}>{t}</option>)}</select>
          <select value={product} onChange={e => setProduct(e.target.value)} style={sel}>{productOptions.map(p => <option key={p}>{p}</option>)}</select>
          <select style={sel}><option>All methods</option><option>GET</option><option>POST</option><option>DELETE</option></select>
          <select style={sel}><option>All status codes</option><option>2xx</option><option>4xx</option><option>5xx</option></select>
          <select style={sel}><option>Last 15 minutes</option><option>Last hour</option><option>Last 24h</option></select>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-500)', marginLeft: 'auto' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }}/>Live tailing · all tenants
          </div>
          <Btn variant="secondary" size="sm" icon="external" onClick={() => window.toast && window.toast.success('Export started', 'Request logs (CSV) will download shortly.')}>Export</Btn>
        </div>
      </Card>
      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['Time','Tenant','Method','Path','Status','Latency','API key'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr>
          </thead>
          <tbody style={{ fontFamily: 'var(--font-mono)' }}>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--ink-100)', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='var(--appro-blue-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding: '10px 16px', color: 'var(--ink-500)' }}>{r.t}</td>
                <td style={{ padding: '10px 16px', color: 'var(--ink-800)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>{r.ten}</td>
                <td style={{ padding: '10px 16px' }}><span style={{ fontSize: 10, fontWeight: 700, color: methodColor(r.m), background: `color-mix(in srgb, ${methodColor(r.m)} 12%, white)`, padding: '2px 8px', borderRadius: 4 }}>{r.m}</span></td>
                <td style={{ padding: '10px 16px', color: 'var(--ink-800)' }}>{r.p}</td>
                <td style={{ padding: '10px 16px' }}><span style={{ color: codeColor(r.s), fontWeight: 700 }}>{r.s}</span></td>
                <td style={{ padding: '10px 16px', color: r.l > 250 ? 'var(--warning)' : 'var(--ink-600)' }}>{r.l}ms</td>
                <td style={{ padding: '10px 16px', color: 'var(--appro-blue)' }}>{r.k}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ink-500)', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {rows.length} of 4.2M events · retention 90 days</span>
          <span>Auto-refresh <b style={{ color: 'var(--success)' }}>on</b></span>
        </div>
      </Card>
    </div>
  );
}

window.AdminUsageAnalytics = AdminUsageAnalytics;
window.AdminRequestLogs = AdminRequestLogs;
