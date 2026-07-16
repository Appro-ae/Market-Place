// Dashboard + Catalog screens for the API Marketplace Customer Portal

function Dashboard({ env, goTo }) {
  const isProd = env === 'production';
  const demoEmpty = !!window.DEMO_EMPTY;

  // Sub-environments from provisioned environments list, filtered by global Sandbox/Production toggle
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
  const subEnvs = envs.filter(e => e.envType === env);
  const [envId, setEnvId] = React.useState((subEnvs[0] || envs[0]).id);
  React.useEffect(() => {
    if (!subEnvs.some(e => e.id === envId)) setEnvId((subEnvs[0] || {}).id);
  }, [env]);
  const selectedEnv = envs.find(e => e.id === envId) || subEnvs[0] || envs[0];

  const metrics = (demoEmpty ? [
    { label: 'Requests (24h)', value: '0', delta: '0%', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
    { label: 'Success rate', value: '—', delta: '0%', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
    { label: 'p95 latency', value: '—', delta: '0 ms', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
    { label: 'Error rate', value: '—', delta: '0%', up: true, spark: [0,0,0,0,0,0,0,0,0,0,0,0] },
  ] : isProd ? [
    { label: 'Requests (24h)', value: '1.82M', delta: '+4.1%', up: true, spark: [30,42,38,55,62,58,74,70,82,78,88,95] },
    { label: 'Success rate', value: '99.82%', delta: '+0.04%', up: true, spark: [90,92,91,93,94,92,95,96,97,97,98,99] },
    { label: 'p95 latency', value: '142 ms', delta: '-8 ms', up: true, spark: [70,65,72,68,60,58,55,52,50,48,45,42] },
    { label: 'Error rate', value: '0.18%', delta: '+0.02%', up: false, spark: [10,12,14,13,15,18,16,20,22,18,15,18] },
  ] : [
    { label: 'Requests (24h)', value: '14,284', delta: '+22%', up: true, spark: [20,28,30,42,45,55,60,58,72,70,80,90] },
    { label: 'Success rate', value: '98.4%', delta: '+0.9%', up: true, spark: [80,82,85,84,88,90,89,92,91,95,96,98] },
    { label: 'p95 latency', value: '210 ms', delta: '-22 ms', up: true, spark: [85,82,78,72,68,65,60,58,52,50,48,45] },
    { label: 'Error rate', value: '1.6%', delta: '-0.3%', up: true, spark: [30,28,24,25,22,20,18,19,16,14,15,13] },
  ]);

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
      {/* Sub-environment selector — filtered by global Sandbox/Production toggle */}
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
            <svg viewBox="0 0 120 32" style={{ width: '100%', height: 32, marginTop: 10, display: 'block' }}>
              <polyline fill="none" stroke="var(--appro-blue)" strokeWidth="1.5"
                points={m.spark.map((v,i)=>`${(i/(m.spark.length-1))*120},${32-(v/100)*28}`).join(' ')}/>
              <polygon fill="rgba(59,126,246,.18)" stroke="none"
                points={`0,32 ${m.spark.map((v,i)=>`${(i/(m.spark.length-1))*120},${32-(v/100)*28}`).join(' ')} 120,32`}/>
            </svg>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginBottom: 20 }}>
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

        {/* Onboarding progress */}
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Production readiness</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>4 of 6 complete · 2 remaining</div>
            <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '66%', background: 'linear-gradient(90deg,var(--appro-blue),#1D4ED8)', borderRadius: 999 }}/>
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {[
              { done: true, title: 'Organization verified', sub: 'CTR + Trade License on file' },
              { done: true, title: 'Sandbox provisioned', sub: 'sbx_mb_8f2a · synthetic data' },
              { done: true, title: 'Security review signed', sub: 'Pen-test report uploaded Apr 2' },
              { done: true, title: 'Static source IPs registered', sub: '2 CIDR ranges' },
              { done: false, title: 'Complete conformance tests', sub: '18/24 passing · fix signed-webhooks' },
              { done: false, title: 'Production access request', sub: 'Requires admin sign-off' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 20px' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: s.done ? 'var(--success)' : '#fff',
                  border: s.done ? 0 : '1.5px dashed var(--ink-300)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>{s.done && <Icon name="check" size={12} stroke={3}/>}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: s.done ? 'var(--ink-500)' : 'var(--ink-800)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 1 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ink-100)' }}>
            <Btn variant="primary" size="sm" icon="arrow" style={{ width: '100%', justifyContent: 'center' }}>Request production access</Btn>
          </div>
        </Card>
      </div>

      {/* Activity + Quick start */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
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

        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Quick start</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>Get a first response in &lt; 60 sec</div>
          </div>
          <div style={{ padding: 16, background: '#0C1931', margin: 16, borderRadius: 10, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }}/>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }}/>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F' }}/>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>terminal — curl</span>
              <Icon name="copy" size={12} stroke={1.5}/>
            </div>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#E6F1F8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
<span style={{ color: '#8aa7d6' }}>$</span> <span style={{ color: '#B3FF4C' }}>curl</span> https://{env === 'production' ? 'api' : 'sandbox'}.appro.ae/v2/accounts \{'\n'}
{'  '}-H <span style={{ color: '#FFD66B' }}>"Authorization: Bearer $APPRO_KEY"</span> \{'\n'}
{'  '}-H <span style={{ color: '#FFD66B' }}>"x-appro-env: {env}"</span>
            </pre>
          </div>
          <div style={{ padding: '0 16px 16px', display: 'grid', gap: 8 }}>
            {[
              { t: 'Read the Quickstart', d: 'OAuth, OTP and your first call', icon: 'book' },
              { t: 'Install the SDK', d: 'Node · Python · Java · .NET', icon: 'terminal' },
              { t: 'Open the Playground', d: 'Try live calls in the browser', icon: 'sparkle' },
            ].map(q => (
              <a key={q.t} href="#" style={{
                padding: '10px 12px', border: '1px solid var(--ink-200)', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={q.icon} size={14}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-800)' }}>{q.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{q.d}</div>
                </div>
                <Icon name="arrow" size={14}/>
              </a>
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
