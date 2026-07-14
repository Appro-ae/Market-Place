// Usage, Logs, Billing, Requests, Team, Settings

function Usage({ env }) {
  const [range, setRange] = React.useState('24h');

  // Sub-environments come from the provisioned environments list (same source as Request Logs)
  const provisioned = (window.PROVISIONED_ENVS || []).filter(e => e.status === 'active' || e.status === 'live' || !e.status);
  const fallbackEnvs = [
    { id: 'sbx-core',   name: 'sandbox-core',       envType: 'sandbox',    region: 'me-central-1' },
    { id: 'sbx-qa',     name: 'sandbox-qa',         envType: 'sandbox',    region: 'me-central-1' },
    { id: 'prod-uae',   name: 'production-uae-1',   envType: 'production', region: 'me-central-1' },
    { id: 'prod-ksa',   name: 'production-ksa-1',   envType: 'production', region: 'me-south-1' },
  ];
  const envs = (provisioned.length ? provisioned.map(e => ({
    id: e.id || e.name,
    name: e.name,
    envType: e.envType || e.env || (/(prod)/i.test(e.name) ? 'production' : 'sandbox'),
    region: (e.region || 'me-central-1').split(' · ')[0],
  })) : fallbackEnvs);
  const mainEnv = env;
  const subEnvs = envs.filter(e => e.envType === mainEnv);
  const [envId, setEnvId] = React.useState((subEnvs[0] || envs[0]).id);
  React.useEffect(() => {
    if (!subEnvs.some(e => e.id === envId)) setEnvId((subEnvs[0] || {}).id);
  }, [mainEnv]);
  const selectedEnv = envs.find(e => e.id === envId) || subEnvs[0] || envs[0];

  const seriesByRange = {
    '24h': {
      bars: env === 'production'
        ? [62, 70, 68, 75, 82, 78, 88, 90, 85, 92, 96, 94, 90, 88, 92, 95, 99, 96, 93, 90, 88, 85, 80, 76]
        : [20, 28, 35, 30, 42, 55, 50, 65, 60, 72, 68, 75, 70, 80, 78, 82, 70, 65, 58, 50, 45, 40, 35, 30],
      xLabel: i => i % 3 === 0 ? String(i).padStart(2,'0') + ':00' : null,
      lastLabel: 'now',
      total: env === 'production' ? '1,824,112' : '14,284',
      unit: 'Hourly · last 24h',
    },
    '7d': {
      bars: env === 'production'
        ? [1620, 1820, 1750, 1920, 2010, 1480, 1320]
        : [12, 18, 14, 22, 19, 9, 8].map(v => v * 1000).map(v => Math.round(v/1000)),
      xLabel: i => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
      lastLabel: null,
      total: env === 'production' ? '11,920,400' : '102,418',
      unit: 'Daily · last 7 days',
    },
    '30d': {
      bars: env === 'production'
        ? Array.from({length: 30}, (_, i) => Math.round(1500 + Math.sin(i/3)*250 + (i*12) + (i%5===0?180:0)))
        : Array.from({length: 30}, (_, i) => Math.round(8 + Math.sin(i/2.5)*3 + (i*0.4) + (i%6===0?2.5:0))),
      xLabel: i => (i === 0 || (i+1) % 5 === 0) ? 'd' + (i+1) : null,
      lastLabel: null,
      total: env === 'production' ? '52,140,820' : '438,902',
      unit: 'Daily · last 30 days',
    },
  };
  const { bars, xLabel, lastLabel, total: totalReq, unit } = seriesByRange[range];

  // Products come from the live catalogue (the tenant's subscribed products) when the backend is on.
  const [apiProducts, setApiProducts] = React.useState(null);
  React.useEffect(() => {
    if (window.approApi && window.approApi.enabled()) {
      window.approApi.products().then(setApiProducts).catch(() => {});
    }
  }, []);
  const U_CAT_COLOR = { credit: 'var(--success)', identity: 'var(--appro-blue)', compliance: 'var(--warning)', income: '#7C3AED', analytics: 'var(--info)', banking: '#0072BC' };
  let apis;
  if (apiProducts && apiProducts.length) {
    let subs = []; try { subs = JSON.parse(localStorage.getItem('portal.subscribed') || '[]'); } catch (e) {}
    const mine = apiProducts.filter(p => subs.includes(p.id));
    const list = (mine.length ? mine : apiProducts).slice(0, 6);
    const withVol = list.map((p, i) => ({ p, vol: 3 + ((p.name.length * 5 + i * 11) % 80) })).sort((a, b) => b.vol - a.vol);
    const total = withVol.reduce((s, x) => s + x.vol, 0) || 1;
    apis = withVol.map(({ p, vol }) => ({
      n: p.name,
      v: env === 'production' ? Math.round(vol * 9) + 'K' : Math.round(vol * 80).toLocaleString(),
      pct: Math.round(vol / total * 100),
      c: U_CAT_COLOR[p.category] || 'var(--appro-blue)',
    }));
  } else {
    apis = [
      { n: 'Credit Score (Individual)',  v: env === 'production' ? '612K' : '4,812', pct: 52, c: 'var(--success)' },
      { n: 'ID Document Data Extraction',v: env === 'production' ? '489K' : '3,104', pct: 33, c: 'var(--appro-blue)' },
      { n: 'Credit Full Report (Company)',v: env === 'production' ? '—'   : '1,620', pct: 15, c: '#7C3AED' },
    ];
  }
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Sub-environment selector */}
      <Card padding={0} style={{ marginBottom: 14 }}>
        <div style={{ padding: '14px 16px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="globe" size={15}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Environment</span>
          </div>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <select value={envId || ''} onChange={e => setEnvId(e.target.value)} style={{ width: '100%', appearance: 'none', border: '1px solid var(--ink-300)', borderRadius: 8, padding: '9px 32px 9px 12px', fontSize: 13, fontFamily: 'var(--font-ui)', color: 'var(--ink-800)', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              {subEnvs.map(e => <option key={e.id} value={e.id}>{e.name} · {e.region}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-500)' }}><Icon name="chevron" size={14}/></span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{selectedEnv.envType === 'production' ? 'api' : 'sandbox'}.appro.ae · {selectedEnv.region}</span>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { l: 'Requests', v: env === 'production' ? '1,824,112' : '14,284', s: env === 'production' ? 'last 24h' : 'last 24h' },
          { l: 'Monthly quota used', v: '68%', s: '2.0M of 3.0M' },
          { l: 'Avg p95 latency', v: '142ms', s: 'across all APIs' },
          { l: 'Error rate', v: env === 'production' ? '0.18%' : '1.6%', s: '4xx + 5xx combined' },
        ].map(m => (
          <Card key={m.l} padding={18}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)', marginTop: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{m.s}</div>
          </Card>
        ))}
      </div>

      {(() => {
        const W = 1080, H = 220, PL = 44, PR = 16, PT = 12, PB = 28;
        const innerW = W - PL - PR, innerH = H - PT - PB;
        const max = Math.max(...bars);
        const yMax = Math.ceil(max / 10) * 10;
        const stepX = innerW / (bars.length - 1);
        const pts = bars.map((v, i) => [PL + i * stepX, PT + innerH - (v / yMax) * innerH]);
        const linePath = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        const areaPath = linePath + ` L${(PL + innerW).toFixed(1)} ${PT + innerH} L${PL} ${PT + innerH} Z`;
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + innerH - t * innerH, label: Math.round(t * yMax) }));
        const peakIdx = bars.indexOf(max);
        const peakPt = pts[peakIdx];
        return (
          <Card padding={0} style={{ marginBottom: 16 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Request volume</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{unit} · {env} · <span style={{ color: 'var(--ink-700)', fontWeight: 600 }}>{totalReq}</span> requests</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-600)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--appro-blue)' }}/>Requests/{range === '24h' ? 'hr' : 'day'}
                </div>
                <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 8, padding: 3, fontSize: 11, fontWeight: 600 }}>
                  {['24h','7d','30d'].map((r) => {
                    const active = range === r;
                    return (
                      <button key={r} onClick={() => setRange(r)} style={{ background: active ? '#fff' : 'transparent', color: active ? 'var(--appro-blue)' : 'var(--ink-500)', border: 0, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)', boxShadow: active ? '0 1px 2px rgba(0,0,0,.06)' : 'none' }}>{r}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px 18px' }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="rv-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B7EF6" stopOpacity="0.28"/>
                    <stop offset="100%" stopColor="#3B7EF6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Y gridlines + labels */}
                {yTicks.map(t => (
                  <g key={t.y}>
                    <line x1={PL} x2={W - PR} y1={t.y} y2={t.y} stroke="#E7E8EA" strokeDasharray="2 4"/>
                    <text x={PL - 8} y={t.y + 3} textAnchor="end" fontSize="10" fill="#73787B" fontFamily="var(--font-mono)">{t.label.toLocaleString()}</text>
                  </g>
                ))}
                {/* Area + line */}
                <path d={areaPath} fill="url(#rv-area)"/>
                <path d={linePath} fill="none" stroke="#3B7EF6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                {/* Bars under line — subtle hour columns for the 24 buckets */}
                {bars.map((v, i) => {
                  const x = PL + i * stepX;
                  const h = (v / yMax) * innerH;
                  const bw = Math.min(Math.max(6, stepX - 6), 32);
                  return (
                    <rect key={i} x={x - bw/2} y={PT + innerH - h} width={bw} height={h} rx="2" fill="#3B7EF6" fillOpacity={i === peakIdx ? 0.18 : 0.08}/>
                  );
                })}
                {/* Dots */}
                {pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={i === peakIdx ? 4 : 2.5} fill={i === peakIdx ? '#3B7EF6' : '#fff'} stroke="#3B7EF6" strokeWidth="1.6"/>
                ))}
                {/* Peak callout */}
                <g transform={`translate(${peakPt[0]}, ${peakPt[1] - 14})`}>
                  <rect x="-32" y="-18" width="64" height="20" rx="4" fill="#0C1931"/>
                  <text x="0" y="-4" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="var(--font-ui)">peak {bars[peakIdx].toLocaleString()}</text>
                </g>
                {/* X axis labels — driven by range */}
                {bars.map((_, i) => {
                  const isLast = i === bars.length - 1;
                  const label = isLast && lastLabel ? lastLabel : xLabel(i);
                  if (!label) return null;
                  const x = PL + i * stepX;
                  return (
                    <g key={'x'+i}>
                      <line x1={x} x2={x} y1={PT + innerH} y2={PT + innerH + 4} stroke="#D9DADC"/>
                      <text x={x} y={PT + innerH + 16} textAnchor="middle" fontSize="10" fill="#73787B" fontFamily="var(--font-mono)">{label}</text>
                    </g>
                  );
                })}
                {/* Baseline */}
                <line x1={PL} x2={W - PR} y1={PT + innerH} y2={PT + innerH} stroke="#D9DADC"/>
              </svg>
            </div>
          </Card>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>By API</div>
          {apis.map((a, i) => (
            <div key={a.n} style={{ padding: '14px 20px', borderBottom: i < apis.length-1 ? '1px solid var(--ink-100)' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>{a.n}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{a.v} · {a.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: a.pct + '%', background: a.c }}/>
              </div>
            </div>
          ))}
        </Card>

        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Response codes</div>
          <div style={{ padding: 20 }}>
            {[
              { c: '200 OK',          pct: 97.8, col: 'var(--success)' },
              { c: '201 Created',     pct: 1.2,  col: 'var(--success)' },
              { c: '400 Bad Request', pct: 0.5,  col: 'var(--warning)' },
              { c: '401 Unauthorized',pct: 0.3,  col: 'var(--warning)' },
              { c: '429 Rate Limited',pct: 0.1,  col: 'var(--danger)' },
              { c: '500 Server Error',pct: 0.1,  col: 'var(--danger)' },
            ].map(r => (
              <div key={r.c} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: r.col }}/>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-700)', flex: 1 }}>{r.c}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-800)' }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Logs({ env }) {
  const { useState, useMemo } = React;

  // Environments come from the provisioned environments list (same source as Environments screen)
  const provisioned = (window.PROVISIONED_ENVS || []).filter(e => e.status === 'active' || e.status === 'live' || !e.status);
  const fallbackEnvs = [
    { id: 'sbx-core',   name: 'sandbox-core',       envType: 'sandbox',    region: 'me-central-1' },
    { id: 'sbx-qa',     name: 'sandbox-qa',         envType: 'sandbox',    region: 'me-central-1' },
    { id: 'prod-uae',   name: 'production-uae-1',   envType: 'production', region: 'me-central-1' },
    { id: 'prod-ksa',   name: 'production-ksa-1',   envType: 'production', region: 'me-south-1' },
  ];
  const envs = (provisioned.length ? provisioned.map(e => ({
    id: e.id || e.name,
    name: e.name,
    envType: e.envType || e.env || (/(prod)/i.test(e.name) ? 'production' : 'sandbox'),
    region: (e.region || 'me-central-1').split(' · ')[0],
  })) : fallbackEnvs);

  // Main environment is driven by the global topbar Sandbox/Production switcher (env prop)
  const mainEnv = env;
  const subEnvs = envs.filter(e => e.envType === mainEnv);
  const [envId, setEnvId] = useState((subEnvs[0] || envs[0]).id);
  // Keep the selected sub-environment valid when the global env changes
  React.useEffect(() => {
    if (!subEnvs.some(e => e.id === envId)) setEnvId((subEnvs[0] || {}).id);
  }, [mainEnv]);
  const selectedEnv = envs.find(e => e.id === envId) || subEnvs[0] || envs[0];

  const allRows = [
    { t: '14:22:08.412', m: 'GET',    p: '/v2/accounts/acc_7f2a/balances', s: 200, l: 98,  k: 'pk_live_9c7b', env: 'production', prod: 'aecb' },
    { t: '14:22:07.984', m: 'POST',   p: '/v2/payments',                    s: 201, l: 184, k: 'pk_live_9c7b', env: 'production', prod: 'aecb' },
    { t: '14:22:06.120', m: 'GET',    p: '/v2/accounts',                    s: 200, l: 72,  k: 'pk_sbx_22cd',  env: 'sandbox', prod: 'efr' },
    { t: '14:22:03.880', m: 'GET',    p: '/v2/identity/verify',             s: 200, l: 220, k: 'pk_sbx_9f3a',  env: 'sandbox', prod: 'identity' },
    { t: '14:22:01.109', m: 'POST',   p: '/v2/consents',                    s: 400, l: 42,  k: 'pk_sbx_71bb',  env: 'sandbox', prod: 'email-verification' },
    { t: '14:21:58.344', m: 'GET',    p: '/v2/accounts/acc_80c9/txns',      s: 200, l: 154, k: 'pk_live_4e1a', env: 'production', prod: 'efr' },
    { t: '14:21:55.220', m: 'DELETE', p: '/v2/consents/cnst_8a1c',          s: 200, l: 88,  k: 'pk_sbx_22cd',  env: 'sandbox', prod: 'email-verification' },
    { t: '14:21:54.901', m: 'POST',   p: '/v2/payments',                    s: 429, l: 12,  k: 'pk_live_9c7b', env: 'production', prod: 'aecb' },
    { t: '14:21:52.612', m: 'GET',    p: '/v2/accounts/acc_11b2/balances',  s: 200, l: 105, k: 'pk_sbx_71bb',  env: 'sandbox', prod: 'aecb' },
    { t: '14:21:50.444', m: 'GET',    p: '/v2/accounts',                    s: 401, l: 8,   k: 'pk_sbx_55ae',  env: 'sandbox', prod: 'identity' },
    { t: '14:21:48.100', m: 'POST',   p: '/v2/accounts/acc_7f2a/consents',  s: 201, l: 210, k: 'pk_live_4e1a', env: 'production', prod: 'efr' },
    { t: '14:21:46.020', m: 'GET',    p: '/v2/accounts/acc_7f2a',           s: 200, l: 66,  k: 'pk_live_9c7b', env: 'production', prod: 'aecb' },
  ];
  // Product filter — options are the tenant's subscribed products (same source as the catalog).
  const subProducts = (() => {
    let subs = [];
    try { subs = JSON.parse(localStorage.getItem('portal.subscribed') || '[]'); } catch(e) { subs = []; }
    const all = (window.PORTAL_PRODUCTS || []);
    const named = all.filter(p => subs.includes(p.id)).map(p => ({ id: p.id, name: p.name }));
    if (named.length) return named;
    return [
      { id: 'aecb', name: 'AECB Credit Report' },
      { id: 'efr', name: 'EFR' },
      { id: 'identity', name: 'Identity Verification' },
      { id: 'email-verification', name: 'Email Verification' },
    ];
  })();
  const [prodFilter, setProdFilter] = useState('all');
  const rows = allRows.filter(r => r.env === selectedEnv.envType && (prodFilter === 'all' || r.prod === prodFilter));

  const methodColor = m => m === 'GET' ? 'var(--success)' : m === 'POST' ? 'var(--appro-blue)' : m === 'DELETE' ? 'var(--danger)' : 'var(--warning)';
  const codeColor = s => s >= 500 ? 'var(--danger)' : s >= 400 ? 'var(--warning)' : 'var(--success)';
  const total = selectedEnv.envType === 'production' ? '1,824,112' : '14,284';

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Environment selector */}
      <Card padding={0} style={{ marginBottom: 12 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ink-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="globe" size={15}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Environment</span>
            <span style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{selectedEnv.envType === 'production' ? 'api' : 'sandbox'}.appro.ae · {selectedEnv.region}</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-500)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }}/>
              Live tailing
            </div>
          </div>
          {/* Provisioned sub-environments as a card grid (same pattern as Create API Key) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {subEnvs.map(e => {
              const on = e.id === envId;
              return (
                <button key={e.id} type="button" onClick={() => setEnvId(e.id)} style={{
                  textAlign: 'left', padding: '11px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${on ? 'var(--appro-blue)' : 'var(--ink-200)'}`,
                  background: on ? 'var(--appro-blue-50)' : '#fff', fontFamily: 'var(--font-ui)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: `2px solid ${on ? 'var(--appro-blue)' : 'var(--ink-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--appro-blue)' }}/>}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{e.region}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-100)', padding: '8px 12px', borderRadius: 8 }}>
            <Icon name="search" size={14}/>
            <input placeholder='Filter: path="/v2/payments*" status>=400' style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'var(--font-mono)' }}/>
          </div>
          <div style={{ position: 'relative' }}>
            <select value={prodFilter} onChange={e => setProdFilter(e.target.value)} style={{ appearance: 'none', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 30px 8px 12px', fontSize: 12, fontFamily: 'var(--font-ui)', background: prodFilter === 'all' ? '#fff' : 'var(--appro-blue-50)', color: prodFilter === 'all' ? 'var(--ink-700)' : 'var(--appro-blue)', fontWeight: prodFilter === 'all' ? 400 : 600, cursor: 'pointer' }}>
              <option value="all">All products</option>
              {subProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-500)' }}><Icon name="chevron" size={13}/></span>
          </div>
          <select style={{ border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-ui)' }}><option>All methods</option><option>GET</option><option>POST</option><option>DELETE</option></select>
          <select style={{ border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}><option>All status codes</option><option>2xx</option><option>4xx</option><option>5xx</option></select>
          <select style={{ border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}><option>Last 15 minutes</option><option>Last hour</option><option>Last 24h</option></select>
          <Btn variant="secondary" size="sm" icon="external" onClick={() => window.toast && window.toast.success('Export started', 'Your ' + selectedEnv.envType + ' logs (CSV) will download shortly.')}>Export {selectedEnv.envType}</Btn>
        </div>
      </Card>

      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>
              {['Time', 'Method', 'Path', 'Status', 'Latency', 'Key', 'Environment', 'Trace'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontFamily: 'var(--font-mono)' }}>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--ink-100)', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='var(--appro-blue-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding: '10px 16px', color: 'var(--ink-500)' }}>{r.t}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: methodColor(r.m), background: `color-mix(in srgb, ${methodColor(r.m)} 12%, white)`, padding: '2px 8px', borderRadius: 4 }}>{r.m}</span>
                </td>
                <td style={{ padding: '10px 16px', color: 'var(--ink-800)' }}>{r.p}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ color: codeColor(r.s), fontWeight: 700 }}>{r.s}</span>
                </td>
                <td style={{ padding: '10px 16px', color: r.l > 180 ? 'var(--warning)' : 'var(--ink-600)' }}>{r.l}ms</td>
                <td style={{ padding: '10px 16px', color: 'var(--appro-blue)' }}>{r.k}</td>
                <td style={{ padding: '10px 16px' }}><EnvBadge env={r.env}/></td>
                <td style={{ padding: '10px 16px', color: 'var(--ink-500)' }}>trc_{Math.random().toString(16).slice(2,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>No requests captured for this environment yet.</div>
        )}
        <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ink-500)', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {rows.length} of {total} events · <b style={{ color: 'var(--ink-700)' }}>{selectedEnv.name}</b> · retention 90 days</span>
          <span>Auto-refresh <b style={{ color: 'var(--success)' }}>on</b></span>
        </div>
      </Card>
    </div>
  );
}

function Billing() {
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="April 2026 · current cycle" subtitle="Closes on April 30 · invoice on May 3" right={<Btn variant="secondary" size="sm" icon="external" onClick={() => window.toast && window.toast.success('Invoice downloaded', 'April 2026 invoice (PDF) saved.')}>Download invoice</Btn>}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Running total</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}>AED 18,420</div>
                <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>↓ 12% vs. March</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Tier</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginTop: 4 }}>Growth · Tier 2</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>3M requests included</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Quota used</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginTop: 4 }}>2.04M / 3.0M</div>
                <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '68%', background: 'var(--appro-blue)' }}/>
                </div>
              </div>
            </div>
          </Card>

          <Card padding={0}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Line items</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ background: 'var(--ink-50)' }}>
                <tr>{['Item', 'Usage', 'Unit', 'Amount'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  { i: 'Growth tier (base)',                  u: '1 month',           p: 'AED 12,000',  a: 'AED 12,000' },
                  { i: 'Credit Score (Individual) — overage',  u: '48,210 req',        p: 'AED 0.08/req',a: 'AED 3,857' },
                  { i: 'Credit Full Report (Company)',        u: '1,804 reports',     p: 'AED 1.20/ea', a: 'AED 2,165' },
                  { i: 'Webhook delivery',                    u: '98,210 events',     p: 'Included',    a: 'AED 0' },
                  { i: 'Sandbox compute',                     u: '—',                 p: 'Included',    a: 'AED 0' },
                  { i: 'Premium support',                     u: '24x7',              p: 'AED 398/mo',  a: 'AED 398' },
                ].map((r, i) => (
                  <tr key={r.i} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--ink-800)' }}>{r.i}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--ink-600)', fontFamily: 'var(--font-mono)' }}>{r.u}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--ink-600)' }}>{r.p}</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-900)' }}>{r.a}</td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--appro-blue-50)' }}>
                  <td colSpan={3} style={{ padding: '14px 20px', fontWeight: 700, color: '#0C1931', textAlign: 'right' }}>Subtotal (before 5% VAT)</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0C1931' }}>AED 18,420</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Payment method"/>
            <div style={{ background: 'linear-gradient(135deg,#0C1931,#1D4ED8)', color: '#fff', padding: 18, borderRadius: 10, fontFamily: 'var(--font-mono)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', opacity: .7, fontWeight: 600 }}>CORPORATE CARD</div>
              <div style={{ fontSize: 18, letterSpacing: '.12em', marginTop: 18 }}>•••• •••• •••• 4821</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 10 }}>
                <span>VALID THRU 07/28</span>
                <span>MARBLE BANK</span>
              </div>
            </div>
            <Btn variant="ghost" size="sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={() => window.toast && window.toast.info('Billing details', 'Opening your billing profile…')}>Update billing details</Btn>
          </Card>
          <Card>
            <SectionHeader title="Invoices"/>
            {[
              { m: 'Mar 2026', a: 'AED 20,940', s: 'Paid' },
              { m: 'Feb 2026', a: 'AED 17,820', s: 'Paid' },
              { m: 'Jan 2026', a: 'AED 14,002', s: 'Paid' },
              { m: 'Dec 2025', a: 'AED 11,760', s: 'Paid' },
            ].map(i => (
              <div key={i.m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--ink-100)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-800)' }}>{i.m}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{i.a}</div>
                </div>
                <StatusPill kind="active">{i.s}</StatusPill>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AccessRequests() {
  const reqs = [
    { id: 'REQ-0421', api: 'Credit Score (Individual)', v: 'v2.0', target: 'production', submitted: 'Apr 18', by: 'Amira Saleh',    status: 'review',  stage: 3, stages: 5 },
    { id: 'REQ-0420', api: 'Credit Full Report (Company)', v: 'v2.0', target: 'production', submitted: 'Apr 17', by: 'Yusuf Al Hammadi',status: 'pending', stage: 1, stages: 5 },
    { id: 'REQ-0418', api: 'ID Document Data Extraction',  v: 'v1.2', target: 'sandbox',    submitted: 'Apr 12', by: 'Amira Saleh',    status: 'active',  stage: 5, stages: 5 },
    { id: 'REQ-0411', api: 'UAE Pass',                     v: 'v2.1', target: 'sandbox',    submitted: 'Apr 8',  by: 'Layla Mansoori',    status: 'revoked', stage: 4, stages: 5, note: 'Withdrawn by customer' },
  ];
  const stages = ['Submit', 'Org check', 'Security review', 'Approval', 'Provision'];
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { l: 'Open requests', v: 2, c: 'var(--warning)' },
          { l: 'Approved (30d)', v: 4, c: 'var(--success)' },
          { l: 'Avg approval time', v: '2.4 days', c: 'var(--info)' },
          { l: 'Auto-approved', v: '82%', c: 'var(--appro-blue)' },
        ].map(m => (
          <Card key={m.l}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>{m.l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: m.c, fontFamily: 'var(--font-ui)', marginTop: 4 }}>{m.v}</div>
          </Card>
        ))}
      </div>

      {reqs.map(r => (
        <Card key={r.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ minWidth: 120 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--appro-blue)', fontWeight: 700 }}>{r.id}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{r.submitted}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>
                {r.api} <span style={{ color: 'var(--ink-500)', fontWeight: 500, fontSize: 11, fontFamily: 'var(--font-mono)' }}>· {r.v}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>
                Target: <b style={{ color: 'var(--ink-700)' }}>{r.target}</b> · requested by {r.by}
                {r.note && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>· {r.note}</span>}
              </div>
            </div>
            <div style={{ flex: 1.5, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {stages.map((st, i) => (
                  <React.Fragment key={st}>
                    <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 72 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: i < r.stage ? (r.status === 'revoked' && i === r.stage - 1 ? 'var(--danger)' : 'var(--success)') : i === r.stage ? 'var(--appro-blue)' : '#fff',
                        color: '#fff', border: i >= r.stage && i !== r.stage ? '1.5px dashed var(--ink-300)' : 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                      }}>
                        {i < r.stage ? <Icon name={r.status === 'revoked' && i === r.stage - 1 ? 'x' : 'check'} size={11} stroke={3.5}/> : i + 1}
                      </div>
                      <div style={{ fontSize: 9.5, color: i <= r.stage ? 'var(--ink-700)' : 'var(--ink-400)', fontWeight: 600, textAlign: 'center' }}>{st}</div>
                    </div>
                    {i < stages.length-1 && (
                      <div style={{ flex: 1, height: 2, background: i < r.stage - 1 ? 'var(--success)' : 'var(--ink-200)', marginTop: -16 }}/>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div>
              <StatusPill kind={r.status}>{r.status === 'review' ? 'In review' : r.status === 'pending' ? 'Queued' : r.status === 'active' ? 'Approved' : 'Withdrawn'}</StatusPill>
            </div>
          </div>
        </Card>
      ))}

      <Card style={{ marginTop: 16, background: 'linear-gradient(90deg, var(--appro-blue-100), #fff)', border: '1px solid var(--appro-blue-300)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--appro-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Need access to another API?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>Sandbox access is usually auto-approved. Production access may require a security review.</div>
          </div>
          <Btn variant="primary" icon="plus">New access request</Btn>
        </div>
      </Card>
    </div>
  );
}

function Team() {
  const users = [
    { n: 'Amira Saleh',        e: 'amira@nuqud.ae',    r: 'Admin',        last: '2 min ago',  c: 'var(--appro-blue)' },
    { n: 'Yusuf Al Hammadi',   e: 'yusuf@nuqud.ae',    r: 'Developer',    last: '24 min ago', c: 'var(--success)' },
    { n: 'Layla Mansoori',        e: 'layla@nuqud.ae',     r: 'Developer',    last: '1h ago',     c: 'var(--warning)' },
    { n: 'Hassan Qureshi',     e: 'hassan@nuqud.ae',   r: 'Billing',      last: 'Yesterday',  c: '#7C3AED' },
    { n: 'Lina Al Zarooni',    e: 'lina@nuqud.ae',     r: 'Viewer',       last: '3d ago',     c: 'var(--info)' },
    { n: 'Service account · CI',e: 'ci@nuqud.ae',       r: 'Service',      last: '5 min ago',  c: 'var(--ink-500)' },
  ];
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Team</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{users.length} members · 4 roles · SSO via Nuqud Pay AD</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" size="sm" icon="lock" onClick={() => window.toast && window.toast.info('Role permissions', 'Opening the role &amp; permissions matrix…')}>Role permissions</Btn>
            <Btn variant="primary" icon="plus" onClick={() => window.toast && window.toast.success('Invitation sent', 'Your teammate will receive an email to join.')}>Invite teammate</Btn>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['User','Role','2FA','Last active',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.e} style={{ borderBottom: i < users.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{u.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{u.n}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{u.e}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: u.r === 'Admin' ? 'var(--appro-blue-100)' : 'var(--ink-100)',
                    color: u.r === 'Admin' ? 'var(--appro-blue)' : 'var(--ink-700)',
                  }}>{u.r}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="check" size={12} stroke={3}/> Enforced
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--ink-600)' }}>{u.last}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }}><Icon name="more" size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Settings() {
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionHeader title="Organization" subtitle="Nuqud Pay · org_mb_8f2a"/>
          <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
            {[
              ['Legal entity', 'Nuqud Pay FZ-LLC'],
              ['Trade licence', 'CN-1184820'],
              ['Jurisdiction', 'UAE · CBUAE regulated'],
              ['Data residency', 'UAE · MCA-1 (primary), MCA-2 (DR)'],
              ['Primary contact', 'Amira Saleh — amira@nuqud.ae'],
              ['Billing contact', 'Hassan Qureshi — hassan@nuqud.ae'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ink-200)', padding: '6px 0' }}>
                <span style={{ color: 'var(--ink-500)' }}>{k}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Security" subtitle="Org-wide defaults"/>
          <div style={{ display: 'grid', gap: 14, fontSize: 13 }}>
            {[
              { t: 'Require SSO (Nuqud Pay AD)', on: true, s: 'All users must sign in via SSO' },
              { t: 'Enforce 2FA on non-SSO users', on: true, s: 'TOTP or WebAuthn accepted' },
              { t: 'Automatic key rotation', on: true, s: 'Every 90 days · pre-notifies owners' },
              { t: 'mTLS pinned certificates', on: true, s: 'Production only' },
              { t: 'Require IP allowlist in production', on: true, s: '403 otherwise' },
              { t: 'Public API playground for viewers', on: false, s: 'Currently admins + devs only' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{r.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{r.s}</div>
                </div>
                <input type="checkbox" className="toggle" defaultChecked={r.on} onChange={e => window.toast && window.toast.success(e.target.checked ? r.s + ' enabled' : r.s + ' disabled', 'Security policy updated.')}/>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Webhooks" subtitle="Configure your inbound webhook endpoints"/>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            {[
              { u: 'https://api.nuqud.ae/hooks/appro/payments', ev: 'payment.*', s: 'active' },
              { u: 'https://api.nuqud.ae/hooks/appro/consents', ev: 'consent.granted, consent.revoked', s: 'active' },
              { u: 'https://ops.nuqud.ae/hooks/keys',           ev: 'key.rotated', s: 'pending' },
            ].map(w => (
              <div key={w.u} style={{ padding: '10px 12px', border: '1px solid var(--ink-200)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="external" size={14}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.u}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Events: {w.ev}</div>
                </div>
                <StatusPill kind={w.s}>{w.s === 'active' ? 'Active' : 'Pending'}</StatusPill>
              </div>
            ))}
          </div>
          <Btn variant="secondary" size="sm" icon="plus" style={{ marginTop: 12 }} onClick={() => window.toast && window.toast.success('Webhook endpoint added', 'We\u2019ll start delivering events to it.')}>Add webhook endpoint</Btn>
        </Card>

        <Card>
          <SectionHeader title="Notifications" subtitle="Where we ping when something needs attention"/>
          <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
            {[
              ['Quota reached (80%)',     ['Email', 'Slack']],
              ['Approval needed',         ['Email']],
              ['Key about to expire',     ['Email', 'Slack', 'PagerDuty']],
              ['5xx spike (> 0.5%)',      ['Slack', 'PagerDuty']],
              ['Webhook delivery failure',['Email']],
            ].map(([t, c]) => (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-800)', fontWeight: 600 }}>{t}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {c.map(ch => <span key={ch} style={{ background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{ch}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CreateKeyModal({ env, onClose }) {
  const { useState } = React;
  const [step, setStep] = useState(1);
  const envList = (window.PROVISIONED_ENVS || []).filter(e => e.status !== 'review' && e.env === (env || 'sandbox'));
  const defaultEnv = (envList[0] || { name: 'sandbox-main', env: env || 'sandbox' });
  const [keyEnvName, setKeyEnvName] = useState(defaultEnv.name);
  const selectedEnv = envList.find(e => e.name === keyEnvName) || defaultEnv;
  const envType = selectedEnv.env; // 'sandbox' | 'production'
  const catalogScopes = (() => {
    let subs = [];
    try { subs = JSON.parse(localStorage.getItem('portal.subscribed') || '[]'); } catch(e) { subs = []; }
    const prods = (window.PORTAL_PRODUCTS || []).filter(p => subs.includes(p.id));
    return prods.map(p => ({ id: p.id, name: p.name, scope: p.id, d: p.desc }));
  })();
  const [selected, setSelected] = useState([]);
  const [keyName, setKeyName] = useState(`${envType === 'production' ? 'Production' : 'Sandbox'} — server`);
  const pick = (id) => setSelected(s => s.includes(id) ? [] : [id]);
  const today = new Date().toISOString().slice(0, 10);
  const [activeFrom, setActiveFrom] = useState(today);
  const [activeTo, setActiveTo] = useState('');
  const [triedCreate, setTriedCreate] = useState(false);
  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const dateError = activeTo && activeTo < activeFrom ? 'End date must be after the start date.' : '';
  const nameError = !keyName.trim() ? 'Key name is required.' : '';
  const fromError = !activeFrom ? 'Active-from date is required.' : '';
  const productsError = selected.length === 0 ? 'Select a product for this key.' : '';
  const canCreate = !nameError && !fromError && !productsError && !dateError;
  const handleCreate = () => {
    setTriedCreate(true);
    if (!canCreate) { window.toast && window.toast.error('Cannot create key', nameError || productsError || fromError || dateError); return; }
    setStep(2);
    window.toast && window.toast.success('API key created', 'Copy your secret now — it won\'t be shown again.');
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 560, maxWidth: '100%', boxShadow: '0 30px 80px rgba(12,25,49,.3)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Create API key</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{step === 1 ? 'Pick an environment and the APIs this key can access.' : 'Your new key is ready.'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)' }}><Icon name="x" size={20}/></button>
        </div>

        {step === 1 && (
          <div style={{ padding: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', fontFamily: 'var(--font-ui)' }}>Key name</label>
            <input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="e.g. Production — server" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${triedCreate && nameError ? 'var(--danger)' : 'var(--ink-300)'}`, borderRadius: 8, fontSize: 13, marginTop: 4, marginBottom: triedCreate && nameError ? 4 : 16, fontFamily: 'var(--font-ui)', boxSizing: 'border-box' }}/>
            {triedCreate && nameError && <div style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> {nameError}</div>}

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', fontFamily: 'var(--font-ui)' }}>Environment</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, marginBottom: 16 }}>
              {envList.map(e => {
                const on = e.name === keyEnvName;
                return (
                  <button key={e.name} type="button" onClick={() => setKeyEnvName(e.name)} style={{
                    textAlign: 'left', padding: '11px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${on ? 'var(--appro-blue)' : 'var(--ink-200)'}`,
                    background: on ? 'var(--appro-blue-50)' : '#fff', fontFamily: 'var(--font-ui)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: `2px solid ${on ? 'var(--appro-blue)' : 'var(--ink-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--appro-blue)' }}/>}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{e.region}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', fontFamily: 'var(--font-ui)' }}>Product</label>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{selected.length ? '1 selected' : 'Select one'}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {catalogScopes.length === 0 && (
                <div style={{ padding: '14px 12px', border: '1px dashed var(--ink-300)', borderRadius: 8, fontSize: 12, color: 'var(--ink-500)', textAlign: 'center' }}>You have no subscribed products yet. Subscribe to a product in the Catalogue first.</div>
              )}
              {catalogScopes.map(sc => {
                const on = selected.includes(sc.id);
                return (
                  <label key={sc.id} style={{ padding: '11px 12px', border: `1px solid ${on ? 'var(--appro-blue)' : 'var(--ink-200)'}`, background: on ? 'var(--appro-blue-50)' : '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="radio" name="ck-product" checked={on} onChange={() => pick(sc.id)} className="radio"/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 600 }}>{sc.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{sc.d}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            {triedCreate && productsError && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> {productsError}</div>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 6px' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', fontFamily: 'var(--font-ui)' }}>Activation window</label>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Key auto-activates / deactivates by date</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 4, fontWeight: 600 }}>Active from</div>
                <input type="date" value={activeFrom} min={today} onChange={e => setActiveFrom(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${triedCreate && fromError ? 'var(--danger)' : 'var(--ink-300)'}`, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', color: 'var(--ink-800)' }}/>
                {triedCreate && fromError && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> {fromError}</div>}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 4, fontWeight: 600 }}>Active until <span style={{ fontWeight: 400 }}>· optional</span></div>
                <input type="date" value={activeTo} min={activeFrom || today} onChange={e => setActiveTo(e.target.value)} placeholder="No expiry" style={{ width: '100%', padding: '9px 12px', border: `1px solid ${dateError ? 'var(--danger)' : 'var(--ink-300)'}`, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', color: 'var(--ink-800)' }}/>
              </div>
            </div>
            {dateError
              ? <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>{dateError}</div>
              : <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 6 }}>{activeTo ? `Active ${fmt(activeFrom)} → ${fmt(activeTo)}, then auto-revoked.` : `Activates ${fmt(activeFrom)} · no expiry (leave end date empty for a permanent key).`}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
              <Btn variant="primary" onClick={handleCreate}>Create key</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <EnvBadge env={envType}/>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{selectedEnv.name}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>·</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {selected.map(id => {
                  const sc = catalogScopes.find(c => c.id === id);
                  return <span key={id} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--ink-100)', color: 'var(--ink-700)', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>{sc.scope}</span>;
                })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 11.5, color: 'var(--ink-600)' }}>
              <Icon name="refresh" size={13}/>
              <span>Active <b style={{ color: 'var(--ink-800)' }}>{fmt(activeFrom)}</b>{activeTo ? <> → <b style={{ color: 'var(--ink-800)' }}>{fmt(activeTo)}</b> (auto-revokes)</> : ' · no expiry'}</span>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--warning-tint)', border: '1px solid rgba(235,190,0,.3)', borderRadius: 8, fontSize: 12, color: '#7a5a00', marginBottom: 14 }}>
              <b>Copy this secret now.</b> You will not be able to see it again. Appro stores only a hashed version.
            </div>
            <div style={{ padding: 14, background: '#0C1931', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, overflow: 'hidden' }}>pk_{envType === 'production' ? 'live' : 'sbx'}_a7f2_8c91_bf33_209d_4e55_9a1b_7e0c</span>
              <Btn variant="primary" size="sm" icon="copy">Copy</Btn>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <Btn variant="primary" onClick={onClose}>Done</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Usage, Logs, Billing, AccessRequests, Team, Settings, CreateKeyModal });
