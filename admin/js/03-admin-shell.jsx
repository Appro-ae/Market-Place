// Appro API Marketplace — Admin / Governance Console
// Reuses shared atoms from ../Shell.jsx (Icon, Btn, Card, StatusPill, EnvBadge, CloudChip, SectionHeader) + ../Toasts.jsx
const { useState, useEffect } = React;

const CATEGORIES = [
  { id: 'identity', label: 'Identity & KYC' },
  { id: 'credit', label: 'Credit & Risk' },
  { id: 'payments', label: 'Payments' },
  { id: 'accounts', label: 'Accounts & Balances' },
  { id: 'cards', label: 'Cards' },
  { id: 'open-finance', label: 'Open Finance' },
];

// ---- Seed catalog (governance view: includes drafts + in-review, not just live) ----
const SEED_APIS = [
  { id: 'email-verification', name: 'Email Verification', cat: 'identity', v: 'v1.3', status: 'live', owner: 'Identity Team', auth: 'OAuth 2.0', rate: '300 req/s', cloud: 'aws', region: 'me-central-1', subs: 42, desc: 'Validate email deliverability, detect disposable domains, and confirm ownership with one-time codes.', updated: 'Jun 12, 2026' },
  { id: 'aecb', name: 'AECB Credit Report', cat: 'credit', v: 'v2.0', status: 'live', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '120 req/s', cloud: 'aws', region: 'me-central-1', subs: 28, desc: 'Pull Al Etihad Credit Bureau reports and credit scores for individuals and companies, with consent capture.', updated: 'Jun 09, 2026' },
  { id: 'efr', name: 'EFR — Establishment Financial Report', cat: 'credit', v: 'v1.1', status: 'live', owner: 'Credit Team', auth: 'mTLS + OAuth', rate: '80 req/s', cloud: 'azure', region: 'UAE North', subs: 11, desc: 'Retrieve establishment financial reports and entity risk profiles for corporate onboarding and lending.', updated: 'Jun 02, 2026' },
  { id: 'income-verify', name: 'Income Verification', cat: 'credit', v: 'v0.9', status: 'review', owner: 'Credit Team', auth: 'OAuth 2.0', rate: '60 req/s', cloud: 'aws', region: 'me-central-1', subs: 0, desc: 'Verify salary and income streams against payroll and bank statement data.', updated: 'Jun 16, 2026' },
  { id: 'aml-screening', name: 'AML & Sanctions Screening', cat: 'identity', v: 'v0.4', status: 'draft', owner: 'Compliance', auth: 'mTLS + OAuth', rate: '40 req/s', cloud: 'aws', region: 'me-central-1', subs: 0, desc: 'Screen individuals and entities against global sanctions, PEP and adverse-media lists.', updated: 'Jun 18, 2026' },
];

const ADMISSION_CRITERIA = [
  'OpenAPI 3.1 specification published',
  'Named technical owner & on-call',
  'Sandbox + production environments',
  'OAuth scopes declared',
  'Versioning & deprecation policy',
  'Request validation & error standards',
  'Structured logging & trace IDs',
  'Rate limiting & abuse controls',
  'Security review + pen-test passed',
  'Data residency assessment (UAE)',
  'SLA & support model defined',
  'SDK / sample code available',
];

function loadPlans() {
  try {
    const v = JSON.parse(localStorage.getItem('appro.plans') || 'null');
    if (v) return v;
  } catch(e) {}
  return null;
}
function savePlans(list) { localStorage.setItem('appro.plans', JSON.stringify(list)); }

// Default monetization model — plans + per-API pricing
const DEFAULT_PLANS = [
  { id: 'sandbox', name: 'Sandbox', monthly: 0, included: 10000, overage: 0, rateLimit: '10 req/s', sla: '—', support: 'Community', envs: 'Sandbox only', highlight: false },
  { id: 'growth', name: 'Growth', monthly: 2400, included: 2000000, overage: 0.012, rateLimit: '250 req/s', sla: '99.9%', support: 'Email · 4h', envs: 'Sandbox + Production', highlight: true },
  { id: 'scale', name: 'Scale', monthly: 7500, included: 10000000, overage: 0.008, rateLimit: '1,000 req/s', sla: '99.95%', support: 'Priority · 1h', envs: 'Sandbox + Production', highlight: false },
  { id: 'enterprise', name: 'Enterprise', monthly: null, included: null, overage: null, rateLimit: 'Custom', sla: '99.99%', support: 'Named TAM · 24×7', envs: 'Dedicated', highlight: false },
];

// Per-API monetization overrides (price per call by plan tier where metered separately)
const API_PRICING = {
  'email-verification': { model: 'per-call', unit: 'verification', sandbox: 0, growth: 0.05, scale: 0.04, enterprise: 'Custom' },
  'aecb': { model: 'per-report', unit: 'credit report', sandbox: 0, growth: 3.20, scale: 2.80, enterprise: 'Custom' },
  'efr': { model: 'per-report', unit: 'EFR report', sandbox: 0, growth: 4.50, scale: 3.90, enterprise: 'Custom' },
  'income-verify': { model: 'per-call', unit: 'check', sandbox: 0, growth: 1.20, scale: 0.95, enterprise: 'Custom' },
};

function loadPublished() {
  try { return JSON.parse(localStorage.getItem('appro.publishedApis') || '[]'); } catch(e) { return []; }
}
function savePublished(list) {
  localStorage.setItem('appro.publishedApis', JSON.stringify(list));
}

function statusMeta(s) {
  return ({
    live: { label: 'Live', kind: 'live' },
    review: { label: 'In review', kind: 'review' },
    draft: { label: 'Draft', kind: 'pending' },
    deprecated: { label: 'Deprecated', kind: 'deprecated' },
  })[s] || { label: s, kind: 'pending' };
}

/* ============================ SIDEBAR ============================ */
function AdminSidebar({ screen, onNav, counts, onLogout }) {
  const groups = [
    { grp: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    ]},
    { grp: 'Administration', items: [
      { id: 'tenant-management', label: 'Tenant Management', icon: 'tenant', count: counts['tenant-management'] },
      { id: 'product-setup', label: 'Product Setup', icon: 'product' },
      { id: 'billing', label: 'Billing Management', icon: 'billing' },
      { id: 'subscriptions', label: 'Subscription Management', icon: 'product' },
      { id: 'user-roles', label: 'User Role Management', icon: 'users', count: counts['user-roles'] },
    ]},
    { grp: 'Operations', items: [
      { id: 'usage', label: 'Usage & Analytics', icon: 'usage' },
      { id: 'logs', label: 'Request Logs', icon: 'logs' },
    ]},
  ];
  return (
    <aside style={{ width: 268, background: '#0C1931', color: '#fff', padding: '26px 18px 18px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box', position: 'sticky', top: 0, flexShrink: 0, fontFamily: 'var(--font-ui)' }}>
      <div style={{ padding: '0 6px 4px' }}>
        <img src={(typeof window !== 'undefined' && window.__resources && window.__resources.logoWhite) || 'assets/logos/appro-logo-white.svg'} alt="Appro" style={{ height: 30, display: 'block' }}/>
        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.22em', color: 'rgba(255,255,255,.5)' }}>ADMIN PORTAL</div>
      </div>

      <div style={{ margin: '22px 0 26px', display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#2563EB,#3B7EF6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>AP</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Appro</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.55)' }}>Platform Admin · UAE</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {groups.map((g, gi) => (
          <React.Fragment key={g.grp}>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)', padding: gi === 0 ? '0 8px 12px' : '18px 8px 12px', letterSpacing: '.16em', fontWeight: 700, textTransform: 'uppercase' }}>{g.grp}</div>
            {g.items.map(it => {
              const active = screen === it.id;
              return (
                <button key={it.id} onClick={() => onNav(it.id)} style={{
              background: active ? 'var(--appro-blue)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,.74)',
              border: 0, borderRadius: 11, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13,
              fontSize: 14, fontWeight: active ? 700 : 500, textAlign: 'left', width: '100%',
              boxShadow: active ? 'var(--tw-accent-shadow, 0 8px 20px rgba(59,126,246,.32))' : 'none', fontFamily: 'var(--font-ui)',
            }}>
              <span style={{ color: active ? '#fff' : 'rgba(255,255,255,.6)', display: 'flex' }}><Icon name={it.icon} size={18}/></span>
              <span style={{ flex: 1, lineHeight: 1.2 }}>{it.label}</span>
              {it.count != null ? <span style={{ background: active ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.1)', color: '#fff', fontSize: 11, fontWeight: 700, minWidth: 22, height: 22, padding: '0 6px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{it.count}</span> : null}
            </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
      <a href="../customer/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', color: 'rgba(255,255,255,.7)', fontSize: 12.5, fontWeight: 500, borderRadius: 11, textDecoration: 'none', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
        <Icon name="external" size={15}/><span style={{ flex: 1 }}>Open Customer Portal</span>
      </a>
      {onLogout && (
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', marginTop: 8, color: 'rgba(255,255,255,.7)', fontSize: 12.5, fontWeight: 600, width: '100%', borderRadius: 11, background: 'transparent', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: 'var(--font-ui)', textAlign: 'left' }}>
          <Icon name="external" size={15}/><span style={{ flex: 1 }}>Sign out</span>
        </button>
      )}
    </aside>
  );
}

function AdminTopbar({ title, breadcrumb, env: envProp, onEnv }) {
  // Controlled when AdminApp lifts the environment (GAS-561 AC3); falls back to local state.
  const [envLocal, setEnvLocal] = useState('sandbox');
  const env = envProp || envLocal;
  const setEnv = onEnv || setEnvLocal;
  return (
    <header style={{ padding: '18px 32px', background: '#fff', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, gap: 20 }}>
      <div style={{ minWidth: 0, flexShrink: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 3, fontWeight: 600, whiteSpace: 'nowrap' }}>Appro · {breadcrumb || title}</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--ink-100)', borderRadius: 11, padding: '0 12px', height: 42, width: 280, color: 'var(--ink-400)' }}>
          <Icon name="search" size={16}/>
          <input placeholder="Search…" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'var(--font-ui)', color: 'var(--ink-700)' }}/>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-400)', border: '1px solid var(--ink-300)', borderRadius: 6, padding: '2px 6px', fontFamily: 'var(--font-mono)' }}>⌘K</span>
        </div>
        <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 11, padding: 4 }}>
          {[['sandbox','Sandbox','var(--appro-blue)'],['production','Production','var(--success)']].map(([k, lbl, dot]) => {
            const on = env === k;
            return (
              <button key={k} onClick={() => setEnv(k)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: on ? '#fff' : 'transparent', color: on ? 'var(--ink-800)' : 'var(--ink-500)', border: 0, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-ui)', boxShadow: on ? '0 1px 3px rgba(12,25,49,.12)' : 'none' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: on ? dot : 'var(--ink-300)' }}/>{lbl}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingLeft: 18, borderLeft: '1px solid var(--ink-200)' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#1D4ED8,#3B7EF6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>AS</div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Amira Saleh</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}

window.AdminSidebar = AdminSidebar;
window.AdminTopbar = AdminTopbar;
window.ADMIN = { CATEGORIES, SEED_APIS, ADMISSION_CRITERIA, loadPublished, savePublished, statusMeta, DEFAULT_PLANS, API_PRICING, loadPlans, savePlans };
