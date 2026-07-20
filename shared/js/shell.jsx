// Sidebar + Topbar for the Appro API Marketplace Customer Portal

function Icon({ name, size = 18, stroke = 2 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    catalog: <><rect x="3" y="4" width="7" height="7" rx="1" /><rect x="14" y="4" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    keys: <><circle cx="7.5" cy="14.5" r="4" /><path d="M10.5 11.5 20 2m-4 4 3 3m-6-3 3 3" /></>,
    allowlist: <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" /><path d="m9 12 2 2 4-4" /></>,
    usage: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></>,
    logs: <><path d="M4 4h12l4 4v12a0 0 0 0 1 0 0H4z" /><path d="M16 4v4h4" /><path d="M8 12h8M8 16h5" /></>,
    billing: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" /><circle cx="17" cy="7" r="3" /><path d="M22 19c0-2.8-2.2-5-5-5" /></>,
    requests: <><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" /><path d="m9 12 3 3 7-9" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
    chevron: <><path d="m6 9 6 6 6-6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    eyeoff: <><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="m1 1 22 22" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    check: <><path d="m5 13 4 4L19 7" /></>,
    x: <><path d="M18 6 6 18M6 6l12 12" /></>,
    dot: <><circle cx="12" cy="12" r="4" fill="currentColor" /></>,
    more: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></>,
    flame: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2.3-1.7-3.5C7.8 6.7 7 5 7 3c-2 1-5 3-5 8a7 7 0 0 0 14 0c0-2.4-1.2-4.7-2.3-6.2A4.8 4.8 0 0 1 13 8.8c0 2.5-2 4.2-4.5 5.7z" /></>,
    zap: <><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    terminal: <><path d="m4 17 6-6-6-6M12 19h8" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>,
    alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
    tenant: <><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 11h.01M15 11h.01" /></>,
    product: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5M12 13v8" /></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>);

}

// Appro wordmark — official logo (422×123, includes "appro" type)
function ApproWordmark({ height = 24, mono = false }) {
  const R = (typeof window !== 'undefined' && window.__resources) || {};
  const src = mono ? (R.logoWhite || 'assets/logos/appro-logo-white.svg') : (R.logoColor || 'assets/logos/appro-logo-color.svg');
  // Aspect ratio 422:123 ≈ 3.43:1
  return <img src={src} alt="Appro" style={{ height, width: 'auto', display: 'block' }} />;
}
// Backwards-compat alias for any leftover refs
const ReemMark = ApproWordmark;

function Sidebar({ screen, onNav, env, onLogout }) {
  const sections = [
  { label: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }]
  },
  { label: 'Build', items: [
    { id: 'environments', label: 'Environments', icon: 'globe' },
    { id: 'catalog', label: 'Product Catalogue', icon: 'catalog' },
    { id: 'keys', label: 'API Keys', icon: 'keys', count: 4 },
    { id: 'credentials', label: 'API Credentials', icon: 'lock' },
    { id: 'allowlist', label: 'IP Allowlists', icon: 'allowlist' }]
  },
  { label: 'Operate', items: [
    { id: 'usage', label: 'Usage & Analytics', icon: 'usage' },
    { id: 'logs', label: 'Request Logs', icon: 'logs' },
    { id: 'consent', label: 'Consent', icon: 'allowlist' },
    { id: 'billing', label: 'Subscriptions & Billing', icon: 'billing' }]
  },
  { label: 'Organization', items: [
    { id: 'verification', label: 'Verification', icon: 'lock' },
    { id: 'users', label: 'Team', icon: 'users' },
    { id: 'settings', label: 'Settings', icon: 'settings' }]
  }];

  return (
    <aside style={{
      width: 252, background: '#0C1931', color: '#fff', padding: '20px 12px 16px',
      display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box',
      position: 'sticky', top: 0, flexShrink: 0, fontFamily: 'var(--font-ui)',
      borderRight: '1px solid rgba(255,255,255,.04)'
    }}>
      {/* Brand — Appro wordmark (white) */}
      <div style={{ padding: '0 12px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 16 }}>
        <ApproWordmark height={26} mono />
        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.55)', letterSpacing: '.18em', fontWeight: 600, textTransform: 'uppercase', marginTop: 8, fontFamily: 'var(--font-display)' }}>API Marketplace</div>
      </div>

      {/* Org / partner switcher — Reem hosts partners */}
      <button style={{
        border: '1px solid rgba(255,255,255,.14)',
        borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', color: '#fff', textAlign: 'left', marginBottom: 14, background: 'rgba(255,255,255,.06)'
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-ui)' }}>NQ</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' }}>Nuqud Pay</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>Partner · Tier 2 · UAE</div>
        </div>
        <Icon name="chevron" size={14} />
      </button>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {sections.map((sec) =>
        <div key={sec.label} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', padding: '6px 12px', letterSpacing: '.12em', fontWeight: 500, textTransform: 'uppercase' }}>{sec.label}</div>
            {sec.items.map((it) => {
            const active = screen === it.id;
            return (
              <button key={it.id} onClick={() => onNav(it.id)} style={{
                background: active ? 'rgba(255,255,255,.12)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,.78)',
                border: 0, borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 400,
                textAlign: 'left', width: '100%', whiteSpace: 'nowrap',
                borderLeft: active ? '3px solid #00AEEF' : '3px solid transparent',
                paddingLeft: active ? 9 : 12,
                transition: 'background .15s',
                fontFamily: 'var(--font-ui)'
              }}>
                  <span style={{ color: active ? '#00AEEF' : 'rgba(255,255,255,.55)' }}>
                    <Icon name={it.icon} size={16} />
                  </span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.count &&
                <span style={{
                  background: active ? '#2563EB' : 'rgba(255,255,255,.12)',
                  color: '#fff', fontSize: 10, fontWeight: 600,
                  padding: '1px 7px', borderRadius: 999
                }}>{it.count}</span>
                }
                </button>);

          })}
          </div>
        )}
      </nav>

      {/* Docs link */}
      <a href="#docs" style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',        color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: 400,
        borderRadius: 8, textDecoration: 'none',
        background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)',
        fontFamily: 'var(--font-ui)'
      }}>
        <Icon name="book" size={15} />
        <span style={{ flex: 1 }}>developer.appro.ae</span>
        <Icon name="external" size={12} />
      </a>
      {onLogout && (
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginTop: 8,
          color: 'rgba(255,255,255,.7)', fontSize: 12.5, fontWeight: 600, width: '100%',
          borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: 'var(--font-ui)', textAlign: 'left',
        }}>
          <Icon name="external" size={15} /><span style={{ flex: 1 }}>Sign out</span>
        </button>
      )}
    </aside>);

}

function EnvSwitcher({ env, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: '#F1F4F6', padding: 3, borderRadius: 8,
      fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600
    }}>
      {['sandbox', 'production'].map((e) =>
      <button key={e} onClick={() => onChange(e)} style={{
        background: env === e ? '#fff' : 'transparent',
        color: env === e ? e === 'production' ? '#10A37F' : '#3B7EF6' : 'var(--ink-500)',
        border: 0, borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: env === e ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
        textTransform: 'capitalize'
      }}>
          <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: e === 'production' ? '#10A37F' : '#3B7EF6'
        }} />
          {e}
        </button>
      )}
    </div>);

}

function Topbar({ title, subtitle, env, setEnv, onCommand }) {
  return (
    <header style={{
      padding: '14px 28px', background: '#fff', borderBottom: '1px solid #E5EAEC',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 10, gap: 16
    }}>
      <div style={{ minWidth: 0, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-ui)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span>Nuqud Pay</span>
          <Icon name="chevron" size={10} stroke={2.5} />
          <span style={{ color: 'var(--ink-700)', fontWeight: 600 }}>{subtitle || 'Customer Portal'}</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>{title}</h1>
      </div>
      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onCommand} style={{
          background: '#F4F7F8', border: '1px solid #E5EAEC', borderRadius: 8,
          padding: '7px 10px 7px 12px', display: 'flex', alignItems: 'center', gap: 10,
          width: 240, cursor: 'pointer', color: 'var(--ink-500)', fontSize: 12,
          fontFamily: 'var(--font-ui)'
        }}>
          <Icon name="search" size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search APIs, keys, logs…</span>
          <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, background: '#fff',
            border: '1px solid #E5EAEC', borderRadius: 4, padding: '1px 5px',
            color: 'var(--ink-600)'
          }}>⌘K</kbd>
        </button>

        <EnvSwitcher env={env} onChange={setEnv} />

        <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--ink-700)' }}>
          <Icon name="bell" size={20} />
          <div style={{ position: 'absolute', top: -2, right: -4, background: '#2563EB', color: '#fff', borderRadius: 999, fontSize: 9, padding: '1px 5px', fontWeight: 700 }}>2</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingLeft: 14, borderLeft: '1px solid #E5EAEC' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#3B7EF6,#00AEEF)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>AS</div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-800)', fontFamily: 'var(--font-ui)' }}>Amira Saleh</div>
            <div style={{ fontSize: 10, color: 'var(--ink-500)' }}>Admin · Nuqud Pay</div>
          </div>
        </div>
      </div>
    </header>);

}

/* shared atoms */

function EnvBadge({ env, size = 'sm' }) {
  const isProd = env === 'production';
  const color = isProd ? '#10A37F' : '#3B7EF6';
  const tint = isProd ? '#E8F7F1' : '#E4F4FD';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: tint, color, padding: size === 'sm' ? '2px 8px' : '3px 10px',
      borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-ui)',
      textTransform: 'uppercase', letterSpacing: '.04em'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {env}
    </span>);

}

function CloudLogo({ cloud, size = 14 }) {
  if (cloud === 'aws') return (
    <svg width={size * 1.6} height={size} viewBox="0 0 32 20" fill="none">
      <text x="0" y="13" fontFamily="var(--font-ui), sans-serif" fontWeight="800" fontSize="10" fill="#232F3E">aws</text>
      <path d="M2 17 Q12 20 22 17" stroke="#FF9900" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M19 16.5 l3 0 l-1.5 1.5 z" fill="#FF9900" />
    </svg>);

  if (cloud === 'azure') return (
    <svg width={size * 1.6} height={size} viewBox="0 0 32 20" fill="none">
      <path d="M6 16 L13 4 L17 4 L11 16 Z" fill="#0078D4" />
      <path d="M14 16 L19 8 L24 16 Z" fill="#0078D4" opacity=".7" />
    </svg>);

  if (cloud === 'multi') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <CloudLogo cloud="aws" size={size} />
      <span style={{ fontSize: 9, color: 'var(--ink-400)', margin: '0 1px' }}>+</span>
      <CloudLogo cloud="azure" size={size} />
    </span>);

  return null;
}

function CloudChip({ cloud, region }) {
  if (!cloud) return null;
  const label = cloud === 'aws' ? 'AWS' : cloud === 'azure' ? 'Azure' : 'Multi-cloud';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#F4F7F8', padding: '3px 8px 3px 6px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, color: 'var(--ink-700)', fontFamily: 'var(--font-ui)',
      border: '1px solid #E5EAEC', whiteSpace: 'nowrap'
    }}>
      <CloudLogo cloud={cloud} size={11} />
      <span>{label}</span>
      {region && <>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-400)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-500)' }}>{region}</span>
      </>}
    </span>);

}

function StatusPill({ kind, children }) {
  const map = {
    live: { bg: '#E8F7F1', fg: '#10A37F' },
    active: { bg: '#E8F7F1', fg: '#10A37F' },
    pending: { bg: '#FEF3C7', fg: '#92400E' },
    review: { bg: '#E4F4FD', fg: '#1A2D52' },
    error: { bg: '#FEE2E2', fg: '#B91C1C' },
    revoked: { bg: 'var(--ink-100)', fg: 'var(--ink-600)' },
    beta: { bg: '#F3E8FF', fg: '#6B21A8' },
    deprecated: { bg: 'var(--ink-100)', fg: 'var(--ink-500)' }
  };
  const s = map[kind] || map.active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: s.bg, color: s.fg, padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }} />
      {children}
    </span>);

}

function Btn({ variant = 'primary', size = 'md', icon, children, ...rest }) {
  const styles = {
    primary: { background: '#3B7EF6', color: '#fff', border: '1px solid #3B7EF6' },
    accent: { background: '#2563EB', color: '#fff', border: '1px solid #2563EB' },
    secondary: { background: '#fff', color: 'var(--ink-800)', border: '1px solid #D1DBDF' },
    ghost: { background: 'transparent', color: 'var(--ink-700)', border: '1px solid transparent' },
    danger: { background: '#fff', color: '#B91C1C', border: '1px solid #FEE2E2' },
    dark: { background: '#0C1931', color: '#fff', border: '1px solid #0C1931' }
  };
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 20px' : '8px 14px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <button {...rest} style={{
      ...styles[variant], padding: pad, fontSize: fs, fontWeight: 600,
      borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', ...(rest.style || {})
    }}>
      {icon && <Icon name={icon} size={fs + 1} />}
      {children}
    </button>);

}

function Card({ children, style, padding = 20 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #E5EAEC',
      boxShadow: '0 1px 2px rgba(10,32,39,.03)', padding, ...style
    }}>{children}</div>);

}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>);

}

Object.assign(window, { Icon, ReemMark, Sidebar, Topbar, EnvSwitcher, EnvBadge, StatusPill, Btn, Card, SectionHeader, CloudLogo, CloudChip });