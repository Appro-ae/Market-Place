// Admin — Product Setup: onboard & govern products before they go live on the Marketplace.
// Ported from Product_Setup_Admin_v3 into the Appro admin design system (reuses Card, Btn, Icon, StatusPill).
const { useState: usePS } = React;

const PS_CATS = ['All Products', 'Credit & Risk', 'Identity & Verification', 'Banking & Payments', 'Income & Employment', 'Compliance & Screening', 'Analytics & Data'];

const PS_CHECKS = [
  { k: 'openapi', label: 'OpenAPI 3.1 spec published', auto: p => !!p.specName },
  { k: 'envs', label: 'Sandbox + production environments' },
  { k: 'ver', label: 'Versioning & deprecation policy', agent: true },
  { k: 'log', label: 'Structured logging & trace IDs', agent: true },
  { k: 'pen', label: 'Security review + pen-test passed' },
  { k: 'res', label: 'Data residency: UAE MCA-1', auto: p => p.residency !== 'None' },
  { k: 'owner', label: 'Named technical owner', auto: p => !!(p.owner || '').trim() },
  { k: 'scopes', label: 'OAuth scopes declared', auto: p => !!(p.scopes || '').trim() },
  { k: 'valid', label: 'Request validation & error standards', agent: true },
  { k: 'rate', label: 'Rate limiting & abuse controls', auto: p => !!(p.rate || '').trim() },
  { k: 'support', label: '24x7 support model' },
  { k: 'sdk', label: 'SDK coverage: 5 languages' },
];
const psOk = (p, c) => c.auto ? c.auto(p) : !!p.checks[c.k];
const psCount = p => PS_CHECKS.filter(c => psOk(p, c)).length;
const psPass = p => PS_CHECKS.every(c => psOk(p, c));

const PS_ALL = { envs: 1, ver: 1, log: 1, pen: 1, valid: 1, support: 1, sdk: 1 };
const psFail = (...ks) => { const o = Object.assign({}, PS_ALL); ks.forEach(k => o[k] = 0); return o; };
const mkP = o => Object.assign({ version: 'v1.0', status: 'Live', owner: 'Appro', scopes: 'accounts.read, balances.read', residency: 'UAE · MCA-1', quota: '2,000,000 / day', burst: '200', base: 'https://api.appro.ae', specName: 'spec.yaml', endpoints: [{ m: 'POST', p: '/v2/verify', s: 'Submit request' }, { m: 'GET', p: '/v2/verify/{id}', s: 'Get result' }], checks: Object.assign({}, PS_ALL) }, o);

const PS_MASTER = [
  ['Credit Score (Company)', 'AECB'], ['Credit Full Report (Company)', 'AECB'], ['Credit Score (Individual)', 'AECB'],
  ['Credit Full Report (Individual)', 'AECB'], ['Credit Analytics Report (Individual)', 'AECB'], ['Credit Analytics Report (Company)', 'AECB'],
  ['ID Document Data Extraction', 'OCR (MRZ reader)'], ['Identity Verification', 'EFR'], ['Biographic Verification', 'EFR'],
  ['Business Verification', 'Business Verification Engine'], ['Email Risk Assessment', 'Email Risk Assessment'],
  ['Government Digital Identity', 'UAE Pass'], ['Government Digital Signing', 'UAE Pass'], ['Location Intelligence', 'Geolocator'],
  ['Employment Income Verification', 'MOHRE Income Verification'], ['Text Analytics (Name Indexer)', 'Text Analytics (Name Indexer)'],
  ['AML & Sanctions Screening', 'Sanctions Screening (draft)'], ['Financial Statement Analyzer', 'Statement Analyzer'],
];
const PS_NAMES = PS_MASTER.map(m => m[0]);
const PS_SVCMAP = Object.fromEntries(PS_MASTER);
const PS_CATMAP = {
  'Credit Score (Company)': 'Credit & Risk', 'Credit Full Report (Company)': 'Credit & Risk', 'Credit Score (Individual)': 'Credit & Risk', 'Credit Full Report (Individual)': 'Credit & Risk', 'Credit Analytics Report (Individual)': 'Credit & Risk', 'Credit Analytics Report (Company)': 'Credit & Risk',
  'ID Document Data Extraction': 'Identity & Verification', 'Identity Verification': 'Identity & Verification', 'Biographic Verification': 'Identity & Verification', 'Business Verification': 'Identity & Verification', 'Government Digital Identity': 'Identity & Verification', 'Government Digital Signing': 'Identity & Verification',
  'Email Risk Assessment': 'Compliance & Screening', 'AML & Sanctions Screening': 'Compliance & Screening',
  'Location Intelligence': 'Analytics & Data', 'Text Analytics (Name Indexer)': 'Analytics & Data', 'Financial Statement Analyzer': 'Analytics & Data',
  'Employment Income Verification': 'Income & Employment',
};
const PS_NAMEDEF = {
  'Identity Verification': { desc: 'Uses Emirates face recognition to validate an ID.', auth: 'OAuth 2.0', rate: '150 req/s' },
  'Business Verification': { desc: 'Verifies the legitimacy and standing of a business entity.', auth: 'OAuth 2.0', rate: '80 req/s' },
  'Employment Income Verification': { desc: 'Verifies employment and income from MOHRE and payroll sources.', auth: 'OAuth 2.0', rate: '80 req/s' },
  'Email Risk Assessment': { desc: 'Scores email and domain risk against fraud intelligence.', auth: 'OAuth 2.0', rate: '120 req/s' },
  'Credit Score (Individual)': { desc: 'Pulls an individual credit score from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '120 req/s' },
};

const PS_SEED = [
  mkP({ id: 'email', name: 'Email Verification', version: 'v1.3', cat: 'Identity & Verification', owner: 'Appro', desc: 'Validate email deliverability, ownership and fraud risk in real time.', auth: 'API Key (X-Api-Key + X-Client-Id)', rate: '100 req/s', endpoints: [{ m: 'POST', p: '/v2/email/assess', s: 'Assess email' }, { m: 'GET', p: '/v2/email/{id}', s: 'Get assessment' }] }),
  mkP({ id: 'csc', name: 'Credit Score (Company)', version: 'v2.0', cat: 'Credit & Risk', owner: 'Credit Team', desc: 'Pulls a company credit score from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '120 req/s', scopes: 'credit.read' }),
  mkP({ id: 'cfc', name: 'Credit Full Report (Company)', version: 'v2.0', cat: 'Credit & Risk', owner: 'Credit Team', desc: 'Pulls a full company credit report from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '80 req/s', scopes: 'credit.read' }),
  mkP({ id: 'csi', name: 'Credit Score (Individual)', version: 'v2.0', cat: 'Credit & Risk', owner: 'Credit Team', desc: 'Pulls an individual credit score from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '120 req/s', scopes: 'credit.read' }),
  mkP({ id: 'cfi', name: 'Credit Full Report (Individual)', version: 'v2.0', cat: 'Credit & Risk', owner: 'Credit Team', desc: 'Pulls a full individual credit report from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '80 req/s', scopes: 'credit.read' }),
  mkP({ id: 'cai', name: 'Credit Analytics Report (Individual)', version: 'v1.4', cat: 'Credit & Risk', owner: 'Credit Team', desc: 'Advanced individual credit analytics sourced from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '60 req/s', scopes: 'credit.read' }),
  mkP({ id: 'cac', name: 'Credit Analytics Report (Company)', version: 'v1.4', cat: 'Credit & Risk', owner: 'Credit Team', desc: 'Advanced company credit analytics sourced from Al Etihad Credit Bureau.', auth: 'mTLS + OAuth', rate: '60 req/s', scopes: 'credit.read' }),
  mkP({ id: 'ocr', name: 'ID Document Data Extraction', version: 'v1.2', cat: 'Identity & Verification', owner: 'Identity Team', desc: 'Pulls user data from identity documents using OCR.', auth: 'OAuth 2.0', rate: '200 req/s', scopes: 'identity.read' }),
  mkP({ id: 'idv', name: 'Identity Verification', version: 'v1.3', cat: 'Identity & Verification', owner: 'Identity Team', desc: 'Uses Emirates face recognition to validate an ID.', auth: 'OAuth 2.0', rate: '150 req/s', scopes: 'identity.read' }),
  mkP({ id: 'bgv', name: 'Biographic Verification', version: 'v1.1', cat: 'Identity & Verification', owner: 'Identity Team', desc: 'Uses Emirates face recognition to verify the customer with biometrics.', auth: 'OAuth 2.0', rate: '120 req/s', scopes: 'identity.read' }),
  mkP({ id: 'bve', name: 'Business Verification', version: 'v1.0', cat: 'Identity & Verification', owner: 'Identity Team', desc: 'Verifies the legitimacy and standing of a business entity.', auth: 'OAuth 2.0', rate: '80 req/s', scopes: 'business.read' }),
  mkP({ id: 'uaep', name: 'UAE Pass', version: 'v2.1', cat: 'Identity & Verification', owner: 'Identity Team', desc: 'Government Digital Identity — uses UAE Government digital signing to verify the customer.', auth: 'OAuth 2.0 + FAPI', rate: '100 req/s', scopes: 'identity.read, sign' }),
  mkP({ id: 'era', name: 'Email Risk Assessment', version: 'v1.2', cat: 'Compliance & Screening', owner: 'Risk Team', desc: 'Scores email and domain risk against fraud intelligence.', auth: 'OAuth 2.0', rate: '120 req/s' }),
  mkP({ id: 'sanc', name: 'Sanctions Screening', version: 'v0.9', status: 'Deprecated', cat: 'Compliance & Screening', owner: 'Risk Team', desc: 'Screens names against global sanctions and watchlists.', auth: 'OAuth 2.0', rate: '90 req/s', specName: '', checks: psFail('pen', 'sdk') }),
  mkP({ id: 'mohre', name: 'MOHRE Income Verification', version: 'v1.0', cat: 'Income & Employment', owner: 'Income Team', desc: 'Verifies employment and income from MOHRE and payroll sources.', auth: 'OAuth 2.0', rate: '80 req/s', scopes: 'income.read' }),
  mkP({ id: 'aml', name: 'AML & Sanctions Screening', version: 'v0.8', status: 'In review', cat: 'Compliance & Screening', owner: 'Risk Team', desc: 'Next-gen AML and adverse-media screening (in onboarding).', auth: 'OAuth 2.0', rate: '90 req/s', specName: '', checks: psFail('openapi', 'pen', 'log', 'sdk') }),
];

const psStatusKind = s => s === 'Live' ? 'live' : s === 'Deprecated' ? 'deprecated' : s === 'In review' ? 'review' : 'pending';
const psSlug = p => (p.name || 'resource').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resource';
const psSpecEndpoints = p => { const s = psSlug(p); return [{ m: 'POST', p: `/v2/${s}`, s: 'Submit request' }, { m: 'GET', p: `/v2/${s}/{id}`, s: 'Get result' }, { m: 'GET', p: `/v2/${s}`, s: 'List results' }, { m: 'DELETE', p: `/v2/${s}/{id}`, s: 'Cancel request' }]; };

// Validate an uploaded OpenAPI/Swagger document. Returns { ok, error, endpoints, version }.
function psValidateSpec(text, filename) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (!text || !text.trim()) return { ok: false, error: 'The file is empty.' };
  let doc = null;
  if (ext === 'json' || text.trim()[0] === '{') {
    try { doc = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'Invalid JSON — could not parse the file (' + (e.message || 'syntax error') + ').' }; }
  } else {
    // Lightweight YAML probe — enough to validate structure of a Swagger/OpenAPI doc.
    doc = psParseYamlLite(text);
    if (!doc) return { ok: false, error: 'Could not parse the YAML document. Check indentation and syntax.' };
  }
  const ver = doc.openapi || doc.swagger;
  if (!ver) return { ok: false, error: 'Not an OpenAPI/Swagger file — missing the "openapi" (3.x) or "swagger" (2.0) version field.' };
  const major = String(ver)[0];
  if (major !== '2' && major !== '3') return { ok: false, error: 'Unsupported spec version "' + ver + '". Only Swagger 2.0 and OpenAPI 3.x are accepted.' };
  if (!doc.info || !doc.info.title) return { ok: false, error: 'Missing required "info.title". Every spec must declare an API title.' };
  if (!doc.paths || typeof doc.paths !== 'object' || !Object.keys(doc.paths).length) return { ok: false, error: 'No paths defined — the spec must declare at least one endpoint under "paths".' };
  // Extract endpoints
  const METHODS = ['get', 'post', 'put', 'delete', 'patch'];
  const endpoints = [];
  Object.keys(doc.paths).forEach(path => {
    const item = doc.paths[path] || {};
    METHODS.forEach(m => { if (item[m]) endpoints.push({ m: m.toUpperCase(), p: path, s: (item[m] && (item[m].summary || item[m].operationId)) || '' }); });
  });
  if (!endpoints.length) return { ok: false, error: 'Paths block has no valid operations (GET/POST/PUT/DELETE/PATCH).' };
  return { ok: true, endpoints, version: major === '2' ? 'Swagger 2.0' : 'OpenAPI ' + ver };
}
// Minimal YAML→object for spec validation (top-level keys, info.title, paths + methods).
function psParseYamlLite(text) {
  try {
    const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
    const root = {}; const stack = [{ indent: -1, obj: root }];
    for (const raw of lines) {
      const indent = raw.match(/^\s*/)[0].length;
      const line = raw.trim();
      const ci = line.indexOf(':');
      if (ci === -1) continue;
      const key = line.slice(0, ci).trim().replace(/^["']|["']$/g, '');
      let val = line.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      const parent = stack[stack.length - 1].obj;
      if (val === '') { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
      else { parent[key] = isNaN(+val) ? val : (val === String(+val) ? +val : val); }
    }
    return root;
  } catch (e) { return null; }
}

function AdmissionBadge({ p }) {
  if (p.status === 'Deprecated') return <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="x" size={14}/> Deprecated</span>;
  if (psPass(p)) return <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={14} stroke={3}/> Admitted</span>;
  return <span style={{ fontSize: 12, fontWeight: 700, color: '#8a6c00', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="alert" size={14}/> {psCount(p)}/12 criteria</span>;
}

function ProductSetup({ initialView = 'list', pinView = false }) {
  const [products, setProducts] = usePS(() => {
    if (initialView === 'detail') {
      const d = mkP({ id: 'p_new', name: '', status: 'Draft', cat: 'Identity & Verification', owner: '', desc: '', scopes: '', auth: 'OAuth 2.0', rate: '', residency: 'None', quota: '', burst: '', specName: '', endpoints: [], checks: {} });
      return [...PS_SEED, d];
    }
    return PS_SEED;
  });
  const [view, setView] = usePS(initialView); // 'list' | 'detail'
  const [curId, setCurId] = usePS(initialView === 'detail' ? 'p_new' : null);
  const [cat, setCat] = usePS('All Products');
  const [q, setQ] = usePS('');
  const [specError, setSpecError] = usePS('');
  const [, force] = usePS(0); const rerender = () => force(x => x + 1);

  const cur = () => products.find(p => p.id === curId);
  const filtered = products.filter(p => (cat === 'All Products' || p.cat === cat) && (q === '' || (p.name + ' ' + p.desc + ' ' + p.cat).toLowerCase().includes(q.toLowerCase())));
  const admitted = products.filter(p => p.status !== 'Deprecated' && psPass(p)).length;
  const pending = products.filter(p => p.status !== 'Deprecated' && !psPass(p)).length;

  const lab = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 6, display: 'block', fontFamily: 'var(--font-ui)' };
  const ctrl = { width: '100%', padding: '10px 12px', border: '1.5px solid var(--ink-200)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-ui)', color: 'var(--ink-800)', background: '#fff', boxSizing: 'border-box', outline: 'none' };

  const openDetail = (id) => { setCurId(id); setView('detail'); try { window.scrollTo(0, 0); } catch (e) {} };
  const newProduct = () => {
    const d = mkP({ id: 'p_' + Date.now(), name: '', status: 'Draft', cat: 'Identity & Verification', owner: '', desc: '', scopes: '', auth: 'OAuth 2.0', rate: '', residency: 'None', quota: '', burst: '', specName: '', endpoints: [{ m: 'POST', p: '/v2/verify', s: 'Submit request' }, { m: 'GET', p: '/v2/verify/{id}', s: 'Get result' }], checks: {} });
    setProducts(ps => [...ps, d]); setCurId(d.id); setView('detail'); try { window.scrollTo(0, 0); } catch (e) {}
  };
  const patch = (fields) => { setProducts(ps => ps.map(p => p.id === curId ? Object.assign(p, fields) : p)); rerender(); };

  const onName = (val) => {
    const p = cur(); p.name = val; p.service = PS_SVCMAP[val.trim()] || '';
    if (PS_SVCMAP[val.trim()] && !p.desc) {
      const c = PS_CATMAP[val.trim()]; if (c) p.cat = c;
      const d = PS_NAMEDEF[val.trim()]; if (d) { p.desc = d.desc; p.auth = d.auth; p.rate = d.rate; }
    }
    rerender();
  };
  const applySpec = (name, endpoints) => { const p = cur(); p.specName = name; p.specVersion = (endpoints && endpoints._v) || 'OpenAPI 3.1'; p.endpoints = (endpoints && endpoints.list) || psSpecEndpoints(p); ['ver', 'log', 'valid'].forEach(k => p.checks[k] = true); setSpecError(''); rerender(); window.toast && window.toast.success('Spec validated', p.endpoints.length + ' endpoints imported from ' + name + '.'); };
  const validateAndApply = (file) => {
    setSpecError('');
    const reader = new FileReader();
    reader.onload = () => {
      const res = psValidateSpec(String(reader.result || ''), file.name);
      if (!res.ok) { setSpecError(res.error); rerender(); window.toast && window.toast.error('Invalid spec', res.error); return; }
      applySpec(file.name, { list: res.endpoints, _v: res.version });
    };
    reader.onerror = () => { setSpecError('Could not read the file. Please try again.'); rerender(); };
    reader.readAsText(file);
  };
  const toggleCheck = (k) => { const p = cur(); p.checks[k] = !p.checks[k]; rerender(); };
  const publish = () => { const p = cur(); if (!psPass(p)) return; p.status = 'Live'; rerender(); window.toast && window.toast.success('Published to Marketplace', p.name + ' is now live for customers.'); };

  // ---------------- LIST VIEW ----------------
  if (view === 'list') {
    return (
      <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(180deg,#fff,#FAFBFE)', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '22px 24px', display: 'flex', gap: 24, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>Product Setup</h2>
            <p style={{ margin: '5px 0 14px', color: 'var(--ink-500)', fontSize: 14 }}>Onboard and govern products before they go live on the Marketplace — auth, limits, endpoints, spec and the admission checklist.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-100)', border: '1px solid var(--ink-200)', borderRadius: 10, padding: '9px 12px', maxWidth: 430 }}>
              <Icon name="search" size={15}/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products you're onboarding…" style={{ border: 0, background: 'none', outline: 'none', font: 'inherit', fontSize: 13, width: '100%', color: 'var(--ink-800)' }}/>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <Btn variant="primary" icon="plus" onClick={newProduct}>Onboard new product</Btn>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#0C1931' }}><Icon name="check" size={15} stroke={3}/> <b>{admitted}</b> admitted / live</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#0C1931' }}><Icon name="info" size={15}/> <b>{pending}</b> in onboarding</div>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {PS_CATS.map(c => {
            const n = c === 'All Products' ? products.length : products.filter(p => p.cat === c).length;
            const on = c === cat;
            return (
              <button key={c} onClick={() => setCat(c)} style={{ border: '1px solid ' + (on ? '#0C1931' : 'var(--ink-200)'), background: on ? '#0C1931' : '#fff', color: on ? '#fff' : 'var(--ink-500)', borderRadius: 999, padding: '8px 15px', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)' }}>
                {c}<span style={{ background: on ? 'rgba(255,255,255,.2)' : 'var(--ink-100)', color: on ? '#fff' : 'var(--ink-500)', fontSize: 11, padding: '1px 7px', borderRadius: 9 }}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => openDetail(p.id)} style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 14, display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--appro-blue-300)'; e.currentTarget.style.boxShadow = '0 6px 22px -12px rgba(17,40,90,.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink-200)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ padding: '16px 18px 12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="zap" size={19}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{p.name}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, background: 'var(--ink-100)', color: 'var(--ink-500)', padding: '1px 6px', borderRadius: 5 }}>{p.version}</span></div>
                  <div style={{ color: 'var(--ink-500)', fontSize: 12, marginTop: 2 }}>{p.owner}</div>
                </div>
                <StatusPill kind={psStatusKind(p.status)}>{p.status}</StatusPill>
              </div>
              <div style={{ padding: '0 18px', color: 'var(--ink-700)', fontSize: 13, lineHeight: 1.5, minHeight: 38 }}>{p.desc}</div>
              <div style={{ padding: '12px 18px 14px', display: 'flex', gap: 22, fontSize: 12.5, color: 'var(--ink-500)' }}>
                <div><div style={{ fontWeight: 700, letterSpacing: '.04em', fontSize: 10.5, textTransform: 'uppercase' }}>Auth</div><div style={{ color: '#0C1931', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.auth}</div></div>
                <div><div style={{ fontWeight: 700, letterSpacing: '.04em', fontSize: 10.5, textTransform: 'uppercase' }}>Rate</div><div style={{ color: '#0C1931', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.rate || '—'}</div></div>
              </div>
              <div style={{ borderTop: '1px solid var(--ink-100)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <AdmissionBadge p={p}/>
                <Btn variant="secondary" size="sm" onClick={e => { e.stopPropagation(); openDetail(p.id); }}>Open setup →</Btn>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: 'var(--ink-500)', padding: 30 }}>No products match.</div>}
        </div>
      </div>
    );
  }

  // ---------------- DETAIL VIEW ----------------
  const p = cur();
  if (!p) { setView('list'); return null; }
  const n = psCount(p), pass = psPass(p);
  const Step = ({ num }) => <div style={{ width: 25, height: 25, borderRadius: 8, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, flexShrink: 0 }}>{num}</div>;
  const Head = ({ num, title, hint }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', borderBottom: '1px solid var(--ink-100)' }}>
      <Step num={num}/><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>{title}</h3>
      {hint && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-500)' }}>{hint}</span>}
    </div>
  );
  const methColor = m => m === 'GET' ? 'var(--success)' : m === 'POST' ? 'var(--appro-blue)' : m === 'PUT' ? '#8a6c00' : 'var(--danger)';
  const svc = PS_SVCMAP[(p.name || '').trim()];

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {pinView
          ? <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Product setup form</div>
          : <button onClick={() => { setView('list'); rerender(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--ink-500)', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'none', border: 0, fontFamily: 'var(--font-ui)' }}>← Back to products</button>}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: pass ? 'var(--success)' : '#B7791F' }}>{p.status} · {n}/12 criteria</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
        <div>
          {/* 1 Product */}
          <Card padding={0} style={{ marginBottom: 18 }}>
            <Head num={1} title="Product" hint={p.name || 'New draft product'}/>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ marginBottom: 13 }}>
                <label style={lab}>Product name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input style={ctrl} list="ps-names" autoComplete="off" value={p.name} onChange={e => onName(e.target.value)} placeholder="Type a product name…"/>
                <datalist id="ps-names">{PS_NAMES.map(nm => <option key={nm} value={nm}>{PS_SVCMAP[nm] ? 'Appro service: ' + PS_SVCMAP[nm] : ''}</option>)}</datalist>
                <span style={{ display: 'block', marginTop: 5, fontSize: 11.5, color: 'var(--ink-500)' }}>
                  {svc ? <>Matches the Master Product Catalogue · backing Appro service: <b style={{ color: '#0C1931' }}>{svc}</b>.</> : (p.name ? 'Free text — not in the Master Product Catalogue (the master list is a recommendation).' : 'Free text. Start typing — the Master Product Catalogue is suggested as you type.')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13, marginBottom: 13 }}>
                <div><label style={lab}>Version</label><input style={ctrl} value={p.version} onChange={e => patch({ version: e.target.value })}/></div>
                <div><label style={lab}>Category</label><select style={ctrl} value={p.cat} onChange={e => patch({ cat: e.target.value })}>{PS_CATS.slice(1).map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label style={lab}>Data residency</label><select style={ctrl} value={p.residency} onChange={e => patch({ residency: e.target.value })}>{['UAE · MCA-1', 'UAE · MCA-2', 'EU · Frankfurt', 'None'].map(r => <option key={r}>{r}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: 13 }}><label style={lab}>Short description</label><input style={ctrl} value={p.desc} onChange={e => patch({ desc: e.target.value })}/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div><label style={lab}>Technical owner / team</label><input style={ctrl} value={p.owner} onChange={e => patch({ owner: e.target.value })}/></div>
                <div><label style={lab}>Base URL</label><input style={ctrl} value={p.base} onChange={e => patch({ base: e.target.value })}/></div>
              </div>
            </div>
          </Card>

          {/* 2 Auth */}
          <Card padding={0} style={{ marginBottom: 18 }}>
            <Head num={2} title="Authentication"/>
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <div><label style={lab}>Auth method</label><select style={ctrl} value={p.auth} onChange={e => patch({ auth: e.target.value })}>{['API Key (X-Api-Key + X-Client-Id)', 'OAuth 2.0', 'mTLS + OAuth', 'OAuth 2.0 + FAPI', 'Bearer / JWT'].map(a => <option key={a}>{a}</option>)}</select></div>
              <div><label style={lab}>OAuth scopes</label><input style={ctrl} value={p.scopes} onChange={e => patch({ scopes: e.target.value })} placeholder="comma-separated"/></div>
            </div>
          </Card>

          {/* 3 Rate */}
          <Card padding={0} style={{ marginBottom: 18 }}>
            <Head num={3} title="Rate limit & quota"/>
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13 }}>
              <div><label style={lab}>Rate limit</label><input style={ctrl} value={p.rate} onChange={e => patch({ rate: e.target.value })} placeholder="100 req/s"/></div>
              <div><label style={lab}>Burst ceiling</label><input style={ctrl} value={p.burst} onChange={e => patch({ burst: e.target.value })}/></div>
              <div><label style={lab}>Daily quota</label><input style={ctrl} value={p.quota} onChange={e => patch({ quota: e.target.value })}/></div>
            </div>
          </Card>

          {/* 4 API documentation */}
          <Card padding={0} style={{ marginBottom: 18 }}>
            <Head num={4} title="API documentation" hint="OpenAPI 3.0 / 3.1"/>
            <div style={{ padding: '16px 18px' }}>
              <input type="file" id="ps-spec-file" accept=".yaml,.yml,.json" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files && e.target.files[0]; if (f) validateAndApply(f); e.target.value = ''; }}/>
              {!p.specName ? (
                <label htmlFor="ps-spec-file"
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--appro-blue)'; e.currentTarget.style.background = '#FAFBFF'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = specError ? 'var(--danger)' : 'var(--ink-300)'; e.currentTarget.style.background = 'transparent'; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--ink-300)'; e.currentTarget.style.background = 'transparent'; const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) validateAndApply(f); }}
                  style={{ display: 'block', border: '1.5px dashed ' + (specError ? 'var(--danger)' : 'var(--ink-300)'), borderRadius: 12, padding: 20, textAlign: 'center', color: 'var(--ink-500)', cursor: 'pointer', background: specError ? 'var(--danger-tint)' : 'transparent' }}>
                  <Icon name="arrow" size={22}/>
                  <div style={{ marginTop: 5 }}><b style={{ color: '#0C1931' }}>Upload OpenAPI spec</b> or drag &amp; drop</div>
                  <div style={{ fontSize: 12, marginTop: 3 }}>Endpoints are read from the spec · admission is verified against it</div>
                  <div style={{ fontSize: 11, marginTop: 3, color: 'var(--ink-400)' }}>Swagger 2.0 or OpenAPI 3.x · .yaml, .yml or .json</div>
                </label>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', border: '1px solid rgba(0,178,122,.3)', borderRadius: 10, background: 'var(--success-tint)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}><Icon name="book" size={16}/></div>
                  <div><b style={{ color: '#0C1931', fontSize: 13 }}>{p.specName}</b><div style={{ color: 'var(--ink-500)', fontSize: 11 }}>{p.specVersion || 'OpenAPI 3.1'} · validated · {p.endpoints.length} operations</div></div>
                  <Btn variant="secondary" size="sm" style={{ marginLeft: 'auto' }} onClick={() => { setSpecError(''); patch({ specName: '', endpoints: [] }); }}>Replace</Btn>
                </div>
              )}
              {specError && !p.specName && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 11, padding: '10px 13px', border: '1px solid rgba(229,72,77,.35)', borderRadius: 10, background: 'var(--danger-tint)' }}>
                  <span style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }}><Icon name="alert" size={15}/></span>
                  <div><b style={{ color: '#0C1931', fontSize: 12.5 }}>Spec validation failed</b><div style={{ color: 'var(--ink-600)', fontSize: 12, marginTop: 2 }}>{specError}</div></div>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <label style={lab}>…or spec URL</label>
                <input style={ctrl} placeholder="https://developer.appro.ae/specs/product.yaml" onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { setSpecError(''); applySpec(e.target.value.trim().split('/').pop() || 'spec.yaml'); } }}/>
              </div>
            </div>
          </Card>

          {/* 5 Endpoints */}
          <Card padding={0} style={{ marginBottom: 18 }}>
            <Head num={5} title="Endpoints" hint={p.specName ? p.endpoints.length + ' operations' : 'from spec'}/>
            <div style={{ padding: '16px 18px' }}>
              {!p.specName ? <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>Endpoints are imported automatically from the OpenAPI spec — attach it in step 4.</div> : (
                <>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 8 }}>Imported from the OpenAPI spec · read-only</div>
                  {p.endpoints.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', border: '1px solid var(--ink-200)', borderRadius: 10, marginBottom: 7, background: '#FBFCFE' }}>
                      <span style={{ fontWeight: 700, fontSize: 10.5, letterSpacing: '.04em', padding: '4px 8px', borderRadius: 6, minWidth: 56, textAlign: 'center', color: methColor(e.m), background: `color-mix(in srgb, ${methColor(e.m)} 12%, white)` }}>{e.m}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#0C1931', fontWeight: 700 }}>{e.p}</span>
                      <span style={{ color: 'var(--ink-500)', fontSize: 12, marginLeft: 'auto' }}>{e.s}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>

          {/* 6 Admission checklist */}
          <Card padding={0}>
            <Head num={6} title="Admission checklist"/>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13, padding: '11px 13px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: pass ? 'var(--success-tint)' : 'var(--danger-tint)', color: pass ? '#0F7A3D' : 'var(--danger)' }}>
                <Icon name={pass ? 'check' : 'x'} size={16} stroke={3}/>
                {pass ? 'Met all Marketplace admission criteria — ready to publish.' : `${12 - n} criteria failing — fix to publish (✗ marks what's not passed).`}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 22px' }}>
                {PS_CHECKS.map(c => {
                  const ok = psOk(p, c), isAuto = !!c.auto;
                  return (
                    <div key={c.k} onClick={isAuto ? undefined : () => toggleCheck(c.k)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 4px', cursor: isAuto ? 'default' : 'pointer', userSelect: 'none' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: '2px solid ' + (ok ? 'var(--success)' : 'var(--danger)'), background: ok ? 'var(--success)' : '#fff', color: ok ? '#fff' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ok ? 'check' : 'x'} size={11} stroke={3.5}/></span>
                      <span style={{ fontSize: 13.5, color: ok ? 'var(--ink-800)' : 'var(--ink-500)' }}>{c.label}{isAuto && <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-500)', background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 8, marginLeft: 6 }}>auto</span>}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Preview rail */}
        <div style={{ position: 'sticky', top: 92 }}>
          <Card padding={0}>
            <div style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="zap" size={19}/></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{p.name || 'New product'}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, background: 'var(--ink-100)', color: 'var(--ink-500)', padding: '1px 6px', borderRadius: 5 }}>{p.version}</span></div>
                <div style={{ color: 'var(--ink-500)', fontSize: 12, marginTop: 3 }}>{p.desc || 'Short description appears here.'}</div>
              </div>
              <StatusPill kind={psStatusKind(p.status)}>{p.status}</StatusPill>
            </div>
            <div style={{ padding: '16px 18px', borderTop: '1px solid var(--ink-100)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px' }}>
              {[['Owner', p.owner || '—'], ['Auth', p.auth], ['Rate', p.rate || '—'], ['Category', p.cat], ['Residency', p.residency], ['Endpoints', p.endpoints.length + ' ops']].map(r => (
                <div key={r[0]}><div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>{r[0]}</div><div style={{ fontSize: 13, color: '#0C1931', fontWeight: 700, marginTop: 2, fontFamily: r[0] === 'Auth' || r[0] === 'Rate' || r[0] === 'Endpoints' ? 'var(--font-mono)' : 'var(--font-ui)' }}>{r[1]}</div></div>
              ))}
            </div>
            <div style={{ padding: '16px 18px', borderTop: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: 'var(--ink-500)' }}>
                <span>{n}/12 criteria</span>
                <div style={{ height: 8, borderRadius: 6, background: '#E7EBF3', overflow: 'hidden', width: 120 }}><div style={{ height: '100%', width: (n / 12 * 100) + '%', background: pass ? 'var(--success)' : 'var(--danger)' }}/></div>
              </div>
            </div>
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{p.status === 'Live' ? <><b style={{ color: '#0C1931' }}>Live</b> on Marketplace</> : pass ? <>All criteria met — <b style={{ color: '#0C1931' }}>ready</b></> : <><b style={{ color: '#0C1931' }}>{12 - n}</b> failing</>}</div>
              <Btn variant="primary" style={{ marginLeft: 'auto' }} disabled={!pass || p.status === 'Live'} onClick={publish}>{p.status === 'Live' ? 'Published' : p.status === 'Deprecated' ? 'Re-publish' : 'Publish'}</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

window.ProductSetup = ProductSetup;
