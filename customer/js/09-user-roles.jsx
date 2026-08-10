// Appro Customer (Tenant) Portal — User Role Management
// Same structure as the Super Admin Portal URM (Role Management list + Add/Edit,
// User Management list + Add User + Apply Filter, Environment scope). The ONLY
// difference is the permission function list (tenant modules) and the tenant roles.
const { useState: useTURState } = React;

const TUR_ENVS = ['Sandbox', 'Production'];

/* ---------- Tenant permission matrix (Customer-portal function list) ---------- */
const TUR_GROUPS = [
  { g: 'Build', icon: 'product', subs: [
    { s: 'Environments', perms: ['View environments', 'Manage environments'] },
    { s: 'Product Catalogue', perms: ['Browse catalogue', 'Request for price', 'Subscribe to product'] },
    { s: 'API Keys', perms: ['View keys', 'Create key', 'Roll key', 'Revoke key'] },
    { s: 'API Credentials', perms: ['View credentials', 'Manage credentials'] },
    { s: 'IP Allowlists', perms: ['View allowlist', 'Edit allowlist'] },
  ]},
  { g: 'Operate', icon: 'usage', subs: [
    { s: 'Usage & Analytics', perms: ['View usage & analytics'] },
    { s: 'Request Logs', perms: ['View request logs', 'Export request logs'] },
    { s: 'Consent', perms: ['View consent', 'Manage consent'] },
    { s: 'Subscriptions & Billing', perms: ['View billing', 'Manage subscription', 'Manage payment method'] },
  ]},
  { g: 'Organization', icon: 'settings', subs: [
    { s: 'Verification', perms: ['View verification', 'Submit verification (KYB)'] },
    { s: 'User Role Management', perms: ['View roles & users', 'Create role', 'Edit role', 'Invite user', 'Edit user', 'Remove user'] },
    { s: 'Settings', perms: ['View settings', 'Edit organization', 'Manage security'] },
  ]},
];
function tur_cells(grp) { const o = []; grp.subs.forEach(sb => sb.perms.forEach(p => o.push({ key: grp.g + '::' + sb.s + '::' + p, sub: sb.s, perm: p }))); return o; }
const TUR_GC = {}; TUR_GROUPS.forEach(g => TUR_GC[g.g] = tur_cells(g));
const TUR_ALL = TUR_GROUPS.flatMap(g => TUR_GC[g.g].map(c => c.key));

/* ---------- Tenant roles ---------- */
const TUR_ROLE_DEFS0 = [
  { name: 'Admin', env: 'Both', color: '#3B7EF6', desc: 'Full control of the organization, its subscriptions, keys and team.' },
  { name: 'Developer', env: 'Both', color: '#00B27A', desc: 'Build and operate integrations; view-only on billing and organization.' },
  { name: 'Billing', env: 'Both', color: '#7C3AED', desc: 'Manage subscriptions, invoices and payment methods.' },
  { name: 'Viewer', env: 'Both', color: '#73787B', desc: 'Read-only access across the workspace.' },
];
function tur_view(p) { return p.indexOf('View') === 0 || p.indexOf('Browse') === 0; }
function tur_preset(role, grp, menu, perm) {
  const view = tur_view(perm);
  if (role === 'Admin') return true;
  if (role === 'Developer') { if (grp === 'Organization') return view; if (menu === 'Subscriptions & Billing') return view; return true; }
  if (role === 'Billing') return menu === 'Subscriptions & Billing' || view;
  if (role === 'Viewer') return view;
  return false;
}
function tur_build(role) { const o = {}; TUR_GROUPS.forEach(g => TUR_GC[g.g].forEach(c => { o[c.key] = tur_preset(role, g.g, c.sub, c.perm); })); return o; }

/* ---------- Seed members ---------- */
// Status is TWO-state only: Active / Inactive, driven by the `status` boolean and the enable/disable toggle.
// There is deliberately NO "Invited" status. Whether a member has set a password is NOT a status — it is
// `activated`, and the activation link's own validity is DERIVED from when the link was generated
// (linkSentMinAgo vs TUR_LINK_EXPIRY_MIN), never stored as a separate state.
const TUR_USERS0 = [
  { name: 'Amira Saleh', email: 'amira@nuqud.ae', roles: ['Admin'], env: ['Sandbox', 'Production'], dept: 'Engineering', status: true, activated: true, updated: '20/07/2026', by: 'amira@nuqud.ae' },
  { name: 'Yusuf Al Hammadi', email: 'yusuf@nuqud.ae', roles: ['Developer'], env: ['Sandbox', 'Production'], dept: 'Engineering', status: true, activated: true, updated: '20/07/2026', by: 'amira@nuqud.ae' },
  { name: 'Layla Mansoori', email: 'layla@nuqud.ae', roles: ['Developer'], env: ['Sandbox'], dept: 'Product', status: true, activated: true, updated: '18/07/2026', by: 'amira@nuqud.ae' },
  { name: 'Hassan Qureshi', email: 'hassan@nuqud.ae', roles: ['Billing'], env: ['Production'], dept: 'Finance', status: true, activated: false, linkSentMinAgo: 2880, updated: '15/07/2026', by: 'amira@nuqud.ae' },
  { name: 'Noura Salem', email: 'noura@nuqud.ae', roles: ['Developer'], env: ['Sandbox'], dept: 'Engineering', status: true, activated: false, linkSentMinAgo: 3, updated: '20/07/2026', by: 'amira@nuqud.ae' },
  { name: 'Lina Al Zarooni', email: 'lina@nuqud.ae', roles: ['Viewer'], env: ['Sandbox', 'Production'], dept: 'Operations', status: false, activated: true, updated: '09/07/2026', by: 'amira@nuqud.ae' },
  { name: 'Service account · CI', email: 'ci@nuqud.ae', roles: ['Developer'], env: ['Sandbox'], dept: 'Engineering', status: true, activated: true, updated: '20/07/2026', by: 'yusuf@nuqud.ae' },
];
const TUR_DEPTS = ['Engineering', 'Product', 'Finance', 'Operations', 'Security'];
const TUR_LINK_EXPIRY_MIN = 10080; // configurable activation-link expiry, in minutes (default 10080 = 7 days)

const TUR_toast = (t, m, k) => window.toast && (window.toast[k || 'info'] ? window.toast[k || 'info'](t, m) : window.toast.info && window.toast.info(t, m));

/* ---------- atoms ---------- */
function TURChip({ children, tone }) {
  const map = { blue: ['var(--appro-blue-100)', 'var(--appro-blue-700)'], green: ['#E6F9F2', '#00875A'], grey: ['var(--ink-100)', 'var(--ink-600)'], amber: ['#FEF3C7', '#92400E'] };
  const [b, c] = map[tone] || map.grey;
  return <span style={{ fontSize: 11.5, fontWeight: 600, color: c, background: b, padding: '3px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>{children}</span>;
}
function TURAccess({ kind }) {
  const m = { full: ['#E6F9F2', '#00875A', 'check'], none: ['#FEE2E2', '#DC2626', 'x'], partial: ['#FEF3C7', '#B7860B', 'dash'] }[kind];
  return <span style={{ width: 22, height: 22, borderRadius: '50%', background: m[0], color: m[1], display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    {m[2] === 'dash' ? <span style={{ width: 9, height: 2.5, background: m[1], borderRadius: 2 }} /> : <Icon name={m[2]} size={13} stroke={3} />}
  </span>;
}
function TURToggle({ on, onChange }) { return <input type="checkbox" className="toggle" checked={on} onChange={onChange} />; }
function TURTabs({ tabs, active, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 12, padding: 4, marginBottom: 22, width: 'fit-content', flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onPick(t.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9, cursor: 'pointer', border: '1px solid ' + (active === t.id ? 'var(--appro-blue-300)' : 'transparent'), background: active === t.id ? 'var(--appro-blue-100)' : 'transparent', color: active === t.id ? 'var(--appro-blue-700)' : 'var(--ink-600)', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>
          <Icon name={t.icon} size={16} />{t.label}</button>
      ))}
    </div>
  );
}
function TURBreadcrumb({ parts }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-500)', marginBottom: 8 }}>
    {parts.map((p, i) => <React.Fragment key={i}>{i ? <Icon name="chevron" size={13} /> : null}<span style={{ color: i === parts.length - 1 ? 'var(--appro-blue-700)' : 'var(--ink-500)', fontWeight: i === parts.length - 1 ? 700 : 500 }}>{p}</span></React.Fragment>)}
  </div>;
}
function TURSeg({ value, options, onChange }) {
  return <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 9, padding: 3, gap: 3 }}>
    {options.map(o => <button key={o} onClick={() => onChange(o)} style={{ padding: '6px 14px', borderRadius: 7, border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-ui)', background: value === o ? '#fff' : 'transparent', color: value === o ? 'var(--appro-blue-700)' : 'var(--ink-500)', boxShadow: value === o ? '0 1px 2px rgba(12,25,49,.1)' : 'none' }}>{o}</button>)}
  </div>;
}
function TURSearch({ value, onChange, ph }) {
  return <div style={{ position: 'relative', maxWidth: 380 }}>
    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}><Icon name="search" size={16} /></span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={ph || 'Search'} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 38px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff' }} />
  </div>;
}
function turEnvChip(env) {
  const arr = Array.isArray(env) ? env : (env === 'Both' ? ['Sandbox', 'Production'] : [env]);
  if (arr.length === 2) return <TURChip tone="grey">Sandbox + Production</TURChip>;
  return <TURChip tone={arr[0] === 'Production' ? 'green' : 'blue'}>{arr[0]}</TURChip>;
}
/* two-state user status pill (Active / Inactive) — there is no Invited status */
function TURUserStatus({ on }) {
  const [b, c, l] = on ? ['#E6F9F2', '#00875A', 'Active'] : ['var(--ink-100)', 'var(--ink-500)', 'Inactive'];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: b, color: c, fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 999, whiteSpace: 'nowrap' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />{l}</span>;
}
/* Activation-link validity is DERIVED from when the link was generated (see the Activate
   Account screen), never stored as a status and never surfaced on the user list. */
/* password policy for the Activate Account screen — BRD v1.4 2.8.2 / IEM017 */
function tur_pwChecks(pw) { return [
  { k: 'len', ok: pw.length >= 8, label: 'At least 8 characters' },
  { k: 'upper', ok: /[A-Z]/.test(pw), label: 'An uppercase letter' },
  { k: 'lower', ok: /[a-z]/.test(pw), label: 'A lowercase letter' },
  { k: 'num', ok: /[0-9]/.test(pw), label: 'A number' },
]; }
function tur_pwOk(pw) { return tur_pwChecks(pw).every(c => c.ok); }
function tur_token() { return 'eyJ' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 10) + '.9631'; }
// The activation link a user receives by email; opening it lands on the Customer Portal's set-password (Activate Account) screen.
function tur_activateUrl(u) { return './?activate=1&email=' + encodeURIComponent((u && u.email) || '') + '&token=' + ((u && u.token) || tur_token()); }
function tur_openActivate(u) { try { window.open(tur_activateUrl(u), '_blank'); } catch (e) {} }
const TURFunnel = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
function tur_dmy(s) { const p = (s || '').split('/'); return p.length === 3 ? p[2] + '-' + p[1] + '-' + p[0] : ''; }
const TUR_FILTER0 = { env: 'All', status: 'All', date: '' };

/* ============================================================ ROLE LIST */
function TURRoleList({ roles, grantsByRole, onToggleStatus, onAdd, onEdit }) {
  const [q, setQ] = useTURState('');
  const th = { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' };
  const list = roles.filter(r => r.name.toLowerCase().indexOf(q.toLowerCase()) > -1);
  const accessKind = (role, grp) => { const cs = TUR_GC[grp.g]; const on = cs.filter(c => grantsByRole[role][c.key]).length; return on === 0 ? 'none' : on === cs.length ? 'full' : 'partial'; };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <TURSearch value={q} onChange={setQ} ph="Search role name" />
        <Btn variant="primary" icon="plus" onClick={onAdd}>Add Role</Btn>
      </div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 720, width: '100%' }}>
            <thead style={{ background: 'var(--appro-blue-100)' }}>
              <tr><th style={th}>Role Name</th><th style={th}>Status</th><th style={th}>Environment</th>{TUR_GROUPS.map(g => <th key={g.g} style={{ ...th, textAlign: 'center' }}>{g.g}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.name} style={{ borderTop: '1px solid var(--ink-100)', background: i % 2 ? 'var(--ink-50)' : '#fff' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => onEdit(r.name)} style={{ background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'color-mix(in srgb,' + r.color + ' 16%, white)', color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={15} /></span>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0C1931' }}>{r.name}</span>
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}><TURToggle on={r.active !== false} onChange={() => onToggleStatus(r.name)} /></td>
                  <td style={{ padding: '14px 16px' }}>{turEnvChip(r.env)}</td>
                  {TUR_GROUPS.map(g => <td key={g.g} style={{ padding: '14px 16px', textAlign: 'center' }}><TURAccess kind={accessKind(r.name, g)} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 18, marginTop: 16, fontSize: 12.5, color: 'var(--ink-500)', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TURAccess kind="full" /> Full access</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TURAccess kind="partial" /> Partial</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TURAccess kind="none" /> No access</span>
      </div>
    </div>
  );
}

/* ============================================================ ROLE FORM */
function TURRoleForm({ existing, initialGrants, initialEnv, takenNames, onCancel, onSave }) {
  const [name, setName] = useTURState(existing || '');
  const [env, setEnv] = useTURState(initialEnv || 'Both');
  const [grants, setGrants] = useTURState(initialGrants || (() => { const o = {}; TUR_ALL.forEach(k => o[k] = false); return o; }));
  const [activeSub, setActiveSub] = useTURState({});
  const [collapsed, setCollapsed] = useTURState({});
  const [err, setErr] = useTURState('');
  const setMany = (keys, on) => setGrants(g => { const n = { ...g }; keys.forEach(k => n[k] = on); return n; });
  const save = () => {
    if (!name.trim()) { setErr('Please enter a role name.'); return; }
    if (!existing && takenNames.map(n => n.toLowerCase()).indexOf(name.trim().toLowerCase()) > -1) { setErr('This role name already exists.'); return; }
    onSave({ name: name.trim(), env, grants });
  };
  return (
    <div>
      <TURBreadcrumb parts={['Users', 'Role Management', existing ? 'Edit Role' : 'Add Role']} />
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0C1931', marginBottom: 16 }}>Role information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 7 }}>Role Name <span style={{ color: '#DC2626' }}>*</span></label>
            <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="Enter role name" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid ' + (err ? '#DC2626' : 'var(--ink-300)'), fontSize: 14, fontFamily: 'var(--font-ui)' }} />
            {err ? <div style={{ color: '#DC2626', fontSize: 12.5, marginTop: 6 }}>{err}</div> : null}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 7 }}>Environment <span style={{ color: '#DC2626' }}>*</span></label>
            <TURSeg value={env} options={['Sandbox', 'Production', 'Both']} onChange={setEnv} />
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 7 }}>Which environment(s) this role can act in.</div>
          </div>
        </div>
      </Card>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-200)', fontSize: 17, fontWeight: 700, color: '#0C1931' }}>Permission assignment</div>
        <div style={{ padding: '8px 16px 16px' }}>
          {TUR_GROUPS.map(grp => {
            const col = collapsed[grp.g], cells = TUR_GC[grp.g], on = cells.filter(c => grants[c.key]).length, allKeys = cells.map(c => c.key);
            const sub = activeSub[grp.g] || grp.subs[0].s;
            const subCells = cells.filter(c => c.sub === sub);
            return (
              <div key={grp.g} style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#0F2A44', color: '#fff', borderRadius: col ? 12 : '12px 12px 0 0', padding: '13px 18px' }}>
                  <button onClick={() => setCollapsed(c => ({ ...c, [grp.g]: !c[grp.g] }))} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', fontSize: 15.5, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>
                    <Icon name={grp.icon} size={17} />{grp.g}<span style={{ fontSize: 12, fontWeight: 600, opacity: .8 }}>{on}/{cells.length}</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><input type="checkbox" checked={on === cells.length} onChange={e => setMany(allKeys, e.target.checked)} style={{ width: 15, height: 15, accentColor: '#3B7EF6' }} /> Select all</label>
                    <button onClick={() => setCollapsed(c => ({ ...c, [grp.g]: !c[grp.g] }))} style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', transform: col ? 'rotate(0)' : 'rotate(180deg)', display: 'flex' }}><Icon name="chevron" size={16} /></button>
                  </div>
                </div>
                {!col && (
                  <div style={{ display: 'flex', border: '1px solid var(--ink-200)', borderTop: 0, borderRadius: '0 0 12px 12px' }}>
                    <div style={{ width: 220, borderRight: '1px solid var(--ink-100)', padding: 8, flexShrink: 0, background: 'var(--ink-50)' }}>
                      {grp.subs.map(sb => { const act = sb.s === sub; return (
                        <button key={sb.s} onClick={() => setActiveSub(a => ({ ...a, [grp.g]: sb.s }))} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 9, marginBottom: 4, cursor: 'pointer', border: 0, background: act ? '#0F2A44' : 'transparent', color: act ? '#fff' : 'var(--ink-700)', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>{sb.s}<Icon name="chevron" size={14} /></button>
                      ); })}
                    </div>
                    <div style={{ flex: 1, padding: '14px 18px' }}>
                      <div style={{ marginBottom: 12 }}><label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 700, color: '#0C1931', cursor: 'pointer' }}><input type="checkbox" checked={subCells.every(c => grants[c.key])} onChange={e => setMany(subCells.map(c => c.key), e.target.checked)} style={{ width: 16, height: 16, accentColor: '#3B7EF6' }} /> Select all</label></div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '11px 18px' }}>
                        {subCells.map(c => { const onc = !!grants[c.key]; return (
                          <label key={c.key} onClick={() => setGrants(g => ({ ...g, [c.key]: !g[c.key] }))} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5, color: onc ? 'var(--ink-800)' : 'var(--ink-500)', fontWeight: onc ? 600 : 500 }}>
                            <span style={{ width: 19, height: 19, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: onc ? '#3B7EF6' : '#fff', border: '1.5px solid ' + (onc ? '#3B7EF6' : 'var(--ink-300)') }}>{onc ? <Icon name="check" size={13} /> : null}</span>{c.perm}
                          </label>
                        ); })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" icon="check" onClick={save}>{existing ? 'Save changes' : 'Add role'}</Btn>
      </div>
    </div>
  );
}

/* ============================================================ USER LIST + FILTER */
function TURUserFilterDrawer({ initial, onClose, onApply, onClear }) {
  const [f, setF] = useTURState(initial);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const selStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff', color: 'var(--ink-800)' };
  const fl = { fontSize: 13.5, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 9 };
  const card = { background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 12, padding: '16px 18px', marginBottom: 14 };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,18,30,.45)', zIndex: 85, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(440px,94vw)', height: '100%', background: 'var(--ink-50)', boxShadow: '-8px 0 30px rgba(0,0,0,.16)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0C1931' }}>Apply Filter</div>
          <button onClick={onClose} style={{ background: 'var(--ink-100)', border: 0, borderRadius: 999, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
          <div style={card}><label style={fl}>Environment</label><select value={f.env} onChange={e => set('env', e.target.value)} style={selStyle}><option value="All">All Environments</option><option value="Sandbox">Sandbox</option><option value="Production">Production</option></select></div>
          <div style={card}><label style={fl}>Status</label><select value={f.status} onChange={e => set('status', e.target.value)} style={selStyle}><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          <div style={card}><label style={fl}>Last Updated Date</label><input type="date" value={f.date} onChange={e => set('date', e.target.value)} style={selStyle} /><div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 7 }}>Shows users updated on or after the selected date.</div></div>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--ink-200)', background: '#fff', display: 'flex', gap: 10 }}>
          <Btn variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClear}>Clear All</Btn>
          <Btn variant="primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onApply(f)}>Apply</Btn>
        </div>
      </div>
    </div>
  );
}
function TURUserList({ users, onToggle, onAdd, onOpenInvite }) {
  const [q, setQ] = useTURState('');
  const [filterOpen, setFilterOpen] = useTURState(false);
  const [filter, setFilter] = useTURState(TUR_FILTER0);
  const th = { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' };
  const activeCount = (filter.env !== 'All' ? 1 : 0) + (filter.status !== 'All' ? 1 : 0) + (filter.date ? 1 : 0);
  const list = users.filter(u => {
    if ((u.name + u.email).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
    if (filter.env !== 'All' && u.env.indexOf(filter.env) < 0) return false;
    if (filter.status !== 'All' && (u.status ? 'active' : 'inactive') !== filter.status.toLowerCase()) return false;
    if (filter.date && tur_dmy(u.updated) && tur_dmy(u.updated) < filter.date) return false;
    return true;
  });
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <TURSearch value={q} onChange={setQ} ph="Search name or email" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFilterOpen(true)} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: '#fff', color: 'var(--ink-800)', border: '1px solid ' + (activeCount ? 'var(--appro-blue)' : '#D1DBDF'), fontFamily: 'var(--font-ui)' }}>
            <TURFunnel />Filter{activeCount ? <span style={{ background: 'var(--appro-blue)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px' }}>{activeCount}</span> : null}
          </button>
          <Btn variant="secondary" icon="external" onClick={() => TUR_toast('Export', 'Exporting the user list (demo).', 'info')}>Export</Btn>
          <Btn variant="primary" icon="plus" onClick={onAdd}>Add User</Btn>
        </div>
      </div>
      {activeCount ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 600 }}>Showing {list.length} of {users.length} ·</span>
          {filter.env !== 'All' ? <TURChip tone="blue">Environment: {filter.env}</TURChip> : null}
          {filter.status !== 'All' ? <TURChip tone="blue">Status: {filter.status}</TURChip> : null}
          {filter.date ? <TURChip tone="blue">Updated ≥ {filter.date}</TURChip> : null}
          <button onClick={() => setFilter(TUR_FILTER0)} style={{ background: 'transparent', border: 0, color: 'var(--appro-blue-700)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Clear all</button>
        </div>
      ) : null}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead style={{ background: 'var(--appro-blue-100)' }}><tr><th style={th}>Name</th><th style={th}>User Role</th><th style={th}>Environment</th><th style={th}>Status</th><th style={th}>Last Updated Date</th><th style={th}>Last Updated By</th></tr></thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={u.email} style={{ borderTop: '1px solid var(--ink-100)', background: i % 2 ? 'var(--ink-50)' : '#fff' }}>
                  <td style={{ padding: '15px 20px' }}><div style={{ fontSize: 14.5, fontWeight: 700, color: '#0C1931' }}>{u.name}</div><div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{u.email}</div></td>
                  <td style={{ padding: '15px 20px' }}><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{u.roles.map(r => <span key={r} style={{ fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 8, border: '1px solid var(--ink-200)', color: 'var(--ink-700)', background: '#fff' }}>{r}</span>)}</div></td>
                  <td style={{ padding: '15px 20px' }}>{turEnvChip(u.env)}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><TURUserStatus on={u.status} /><TURToggle on={u.status} onChange={() => onToggle(u.email)} /></label>
                  </td>
                  <td style={{ padding: '15px 20px', fontSize: 13.5, color: 'var(--ink-600)' }}>{u.updated}</td>
                  <td style={{ padding: '15px 20px', fontSize: 13.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{u.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {filterOpen ? <TURUserFilterDrawer initial={filter} onClose={() => setFilterOpen(false)} onApply={f => { setFilter(f); setFilterOpen(false); }} onClear={() => { setFilter(TUR_FILTER0); setFilterOpen(false); }} /> : null}
    </div>
  );
}

/* ============================================================ USER FORM */
function TURUserForm({ roles, onCancel, onSave }) {
  const [f, setF] = useTURState({ name: '', email: '', mobile: '', dept: '', roles: [], env: [] });
  const [err, setErr] = useTURState('');
  const set = (k, v) => { setF(s => ({ ...s, [k]: v })); setErr(''); };
  const toggleArr = (k, v) => setF(s => ({ ...s, [k]: s[k].indexOf(v) > -1 ? s[k].filter(x => x !== v) : [...s[k], v] }));
  const save = () => {
    if (!f.name.trim() || !f.email.trim() || !f.roles.length || !f.env.length) { setErr('Please complete all required (*) fields, including at least one role and environment.'); return; }
    onSave(f);
  };
  const field = (label, req, node) => <div><label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 7 }}>{label} {req ? <span style={{ color: '#DC2626' }}>*</span> : null}</label>{node}</div>;
  const inp = (v, on, ph) => <input value={v} onChange={e => on(e.target.value)} placeholder={ph} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14, fontFamily: 'var(--font-ui)' }} />;
  const sel = (v, on, opts, ph) => <select value={v} onChange={e => on(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff' }}><option value="">{ph}</option>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>;
  return (
    <div>
      <TURBreadcrumb parts={['Users', 'User Management', 'Add User']} />
      <Card>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0C1931', marginBottom: 18 }}>Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          {field('Name', true, inp(f.name, v => set('name', v), 'Enter name'))}
          {field('User Email', true, inp(f.email, v => set('email', v), 'Enter user email'))}
          {field('Mobile Number', false, inp(f.mobile, v => set('mobile', v), '+971 | Enter mobile number'))}
          {field('Department', false, sel(f.dept, v => set('dept', v), TUR_DEPTS, 'Select department'))}
          {field('User Role', true, sel('', v => v && toggleArr('roles', v), roles.map(r => r.name).filter(n => f.roles.indexOf(n) < 0), 'Add a role'))}
          <div></div>
        </div>
        {f.roles.length ? <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{f.roles.map(r => <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--appro-blue-300)', background: 'var(--appro-blue-100)', color: 'var(--appro-blue-700)' }}>{r}<button onClick={() => toggleArr('roles', r)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--appro-blue-700)', display: 'flex' }}><Icon name="x" size={12} /></button></span>)}</div> : null}
        <div style={{ marginTop: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 10 }}>Environment <span style={{ color: '#DC2626' }}>*</span></label>
          <div style={{ display: 'flex', gap: 22 }}>
            {TUR_ENVS.map(e => { const on = f.env.indexOf(e) > -1; return (
              <label key={e} onClick={() => toggleArr('env', e)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: on ? 700 : 500, color: on ? 'var(--ink-800)' : 'var(--ink-500)' }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? '#3B7EF6' : '#fff', border: '1.5px solid ' + (on ? '#3B7EF6' : 'var(--ink-300)') }}>{on ? <Icon name="check" size={13} /> : null}</span>{e}
              </label>
            ); })}
          </div>
        </div>
        {err ? <div style={{ color: '#DC2626', fontSize: 13, marginTop: 16 }}>{err}</div> : null}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 20, padding: '11px 14px', background: 'var(--appro-blue-100)', borderRadius: 10, fontSize: 12.5, color: 'var(--appro-blue-700)' }}>
          <Icon name="info" size={15} /><span>No password is set here. On save, the user is created with status <b>Active</b> and an activation email with a single-use set-password link is sent. They cannot sign in until they set a password — access is governed by the credential, not by a separate status. If the link lapses, a new one can be sent.</span>
        </div>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" icon="check" onClick={save}>Invite user</Btn>
      </div>
    </div>
  );
}

/* ============================================================ INVITATION SENT — confirmation (BRD v1.4 2.8.1 / AT01) */
function TURInviteSent({ user, onPreview, onDone }) {
  if (!user) return null;
  return (
    <div>
      <TURBreadcrumb parts={['Users', 'User Management', 'Invitation sent']} />
      <div style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#E6F9F2', border: '1px solid #A7E8CF', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#00875A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={17} stroke={3} /></span>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#065F46' }}>User created — activation email sent</div>
            <div style={{ fontSize: 13.5, color: '#047857', marginTop: 3, lineHeight: 1.55 }}>{user.name} was created with status <b>Active</b> and cannot sign in until they set a password. An activation email has been sent to <b style={{ fontFamily: 'var(--font-mono)' }}>{user.email}</b>.</div>
          </div>
        </div>
        <Card>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--appro-blue-100)', color: 'var(--appro-blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={16} /></span>
            <div style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.6 }}>
              The user receives an email from the Appro API Marketplace with a secure link to <b>set their password and activate the account</b>. The link is <b>single-use</b>. Whether it is still usable is <b>derived from the date it was generated</b> — there is no separate invitation status to maintain. Opening it takes them to the Activate Account screen; once they set a password they can sign in to the Customer Portal with their email and password.
            </div>
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <Btn variant="secondary" icon="external" onClick={onPreview}>Preview the activation screen</Btn>
            <Btn variant="primary" onClick={onDone}>Back to users</Btn>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 12 }}>Demo only: “Preview the activation screen” opens the page the user reaches from the email link (…/activate?token=) in a new tab — you would not normally see it inside the portal.</div>
      </div>
    </div>
  );
}

/* ============================================================ ROOT */
function TenantUserRoleManagement() {
  const [tab, setTab] = useTURState('roles');
  const [roles, setRoles] = useTURState(TUR_ROLE_DEFS0.map(r => ({ ...r, active: true })));
  const [grantsByRole, setGrantsByRole] = useTURState(() => { const o = {}; TUR_ROLE_DEFS0.forEach(r => o[r.name] = tur_build(r.name)); return o; });
  const [roleView, setRoleView] = useTURState({ mode: 'list' });
  const [users, setUsers] = useTURState(TUR_USERS0);
  const [userView, setUserView] = useTURState({ mode: 'list' });
  const palette = ['#3B7EF6', '#00B27A', '#7C3AED', '#0EA5E9', '#DB2777', '#B7860B'];
  const today = '20/07/2026';

  const toggleRoleStatus = name => setRoles(rs => rs.map(r => r.name === name ? { ...r, active: !(r.active !== false) } : r));
  const saveRole = ({ name, env, grants }, existing) => {
    if (existing) { setRoles(rs => rs.map(r => r.name === existing ? { ...r, name, env } : r)); setGrantsByRole(g => { const n = { ...g }; if (existing !== name) delete n[existing]; n[name] = grants; return n; }); TUR_toast('Role updated', 'The “' + name + '” role has been updated.', 'success'); }
    else { setRoles(rs => [...rs, { name, env, active: true, color: palette[rs.length % palette.length], desc: 'Custom role.' }]); setGrantsByRole(g => ({ ...g, [name]: grants })); TUR_toast('Role created', '“' + name + '” has been created.', 'success'); }
    setRoleView({ mode: 'list' });
  };
  const toggleUser = email => setUsers(us => us.map(u => u.email === email ? { ...u, status: !u.status, updated: today } : u));
  // Create → status Active + activation email. The member still cannot sign in until they set a password;
  // that is `activated`, not a status. Link validity is derived from linkSentMinAgo.
  const saveUser = f => {
    const token = tur_token();
    setUsers(us => [{ name: f.name.trim(), email: f.email.trim(), roles: f.roles.slice(), env: f.env.slice(), dept: f.dept, status: true, activated: false, linkSentMinAgo: 0, token, updated: today, by: 'amira@nuqud.ae' }, ...us]);
    TUR_toast('Activation email sent', '“' + f.name + '” was created. A set-password link was sent to ' + f.email.trim() + '.', 'success');
    setUserView({ mode: 'sent', email: f.email.trim() });
  };
  const openActivateFor = email => { const u = users.find(x => x.email === email); if (u) tur_openActivate(u); };

  const tabs = [{ id: 'roles', label: 'Role Management', icon: 'lock' }, { id: 'users', label: 'User Management', icon: 'users' }];
  return (
    <div style={{ padding: '32px 36px', background: 'var(--ink-50)', minHeight: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>User Role Management</h2>
        <div style={{ fontSize: 15, color: 'var(--ink-500)', marginTop: 6 }}>Roles &amp; permissions and users for your organization.</div>
      </div>
      <TURTabs tabs={tabs} active={tab} onPick={t => { setTab(t); setRoleView({ mode: 'list' }); setUserView({ mode: 'list' }); }} />
      {tab === 'roles' && (roleView.mode === 'list'
        ? <TURRoleList roles={roles} grantsByRole={grantsByRole} onToggleStatus={toggleRoleStatus} onAdd={() => setRoleView({ mode: 'form', role: null })} onEdit={name => setRoleView({ mode: 'form', role: name })} />
        : <TURRoleForm existing={roleView.role} initialGrants={roleView.role ? { ...grantsByRole[roleView.role] } : null} initialEnv={roleView.role ? roles.find(r => r.name === roleView.role).env : 'Both'} takenNames={roles.map(r => r.name)} onCancel={() => setRoleView({ mode: 'list' })} onSave={data => saveRole(data, roleView.role)} />)}
      {tab === 'users' && (
        userView.mode === 'list'
          ? <TURUserList users={users} onToggle={toggleUser} onAdd={() => setUserView({ mode: 'form' })} onOpenInvite={openActivateFor} />
        : userView.mode === 'form'
          ? <TURUserForm roles={roles} onCancel={() => setUserView({ mode: 'list' })} onSave={saveUser} />
          : <TURInviteSent user={users.find(u => u.email === userView.email)} onPreview={() => tur_openActivate(users.find(u => u.email === userView.email) || { email: userView.email })} onDone={() => setUserView({ mode: 'list' })} />)}
    </div>
  );
}

window.TenantUserRoleManagement = TenantUserRoleManagement;

/* ============================================================ ACTIVATE ACCOUNT (…/?activate=1&token=)
   Three modes driven by the server-validated token: set-password | done | expired.
   There is no "Invited" status behind this screen — whether the link still works is DERIVED
   from when it was generated (`sent` = minutes ago) against the configurable TTL. */
function TenantActivateAccount() {
  const q = (() => { try { return new URLSearchParams(window.location.search); } catch (e) { return new URLSearchParams(''); } })();
  const email = q.get('email') || 'noura@nuqud.ae';
  const org = q.get('org') || 'Nuqud Pay';
  const name = (email.split('@')[0] || 'there').replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const sentMinAgo = parseInt(q.get('sent') || '0', 10) || 0;
  const linkDead = (TUR_LINK_EXPIRY_MIN - sentMinAgo) <= 0;

  const [mode, setMode] = useTURState(q.get('mode') || (linkDead ? 'expired' : 'set'));
  const [pw, setPw] = useTURState('');
  const [pw2, setPw2] = useTURState('');
  const [terms, setTerms] = useTURState(false);
  const [show, setShow] = useTURState(false);
  const [busy, setBusy] = useTURState(false);

  const checks = tur_pwChecks(pw);
  const match = pw.length > 0 && pw === pw2;
  const ready = tur_pwOk(pw) && match && terms;
  const strength = checks.filter(c => c.ok).length;
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  const submit = () => {
    if (!ready || busy) return;
    setBusy(true);
    // AC — a token valid at page load but expired by submit is rejected on submit.
    setTimeout(() => { setBusy(false); setMode(TUR_LINK_EXPIRY_MIN - sentMinAgo <= 0 ? 'expired' : 'done'); }, 550);
  };

  const shell = inner => (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-ui)' }}>
      <div style={{ flex: '1 1 46%', background: 'linear-gradient(155deg,#0C1931 0%,#11254A 55%,#1D4ED8 130%)', color: '#fff', padding: '48px 52px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -90, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,126,246,.45), transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-.02em' }}>appro</div>
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 999, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B7EF6' }} />Activate your account
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-.02em', lineHeight: 1.12 }}>Join the {org}<br />workspace</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.72)', marginTop: 16, maxWidth: 380, lineHeight: 1.6 }}>
            Set a password to activate your account. Your administrator never sees or sets it.
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, marginTop: 40, fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>© 2026 Appro · UAE-first API Marketplace</div>
      </div>
      <div style={{ flex: '1 1 54%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>{inner}</div>
      </div>
    </div>
  );

  const lbl = { fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 7 };
  const box = ok => ({ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid ' + (ok ? 'var(--success)' : 'var(--ink-300)'), fontSize: 14, fontFamily: 'var(--font-ui)' });

  if (mode === 'done') return shell(
    <div>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E6F9F2', color: '#00875A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name="check" size={28} stroke={3} /></div>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>Account activated</h2>
      <div style={{ fontSize: 14.5, color: 'var(--ink-500)', marginTop: 10, lineHeight: 1.6 }}>
        Your password is set for <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{email}</b>. You're all set to sign in to the {org} workspace.
      </div>
      <div style={{ background: 'var(--ink-50)', borderRadius: 11, padding: '16px 18px', margin: '22px 0' }}>
        {['Browse the product catalogue', 'Provision a sandbox environment', 'Create your first API key'].map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--ink-600)', padding: '4px 0' }}>
            <span style={{ color: '#00875A', display: 'flex' }}><Icon name="check" size={14} stroke={3} /></span>{t}
          </div>
        ))}
      </div>
      <Btn variant="primary" onClick={() => { try { window.location.search = ''; } catch (e) {} }} style={{ width: '100%' }}>Continue to sign in</Btn>
    </div>
  );

  if (mode === 'expired') return shell(
    <div>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 27, fontWeight: 700 }}>!</div>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>This link has expired</h2>
      <div style={{ fontSize: 14.5, color: 'var(--ink-500)', marginTop: 10, lineHeight: 1.6 }}>
        Activation links can only be used once and expire after a period. Request a fresh one and we'll email it to you.
      </div>
      <div style={{ background: 'var(--ink-50)', borderRadius: 10, padding: '12px 15px', margin: '20px 0', fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>
        If you didn't expect this invitation you can safely ignore the email.
      </div>
      <Btn variant="primary" onClick={() => TUR_toast('New link sent', 'Check ' + email + ' for a fresh activation link.', 'success')} style={{ width: '100%' }}>Email me a new link</Btn>
      <div style={{ marginTop: 10 }}>
        <Btn variant="secondary" onClick={() => { try { window.location.search = ''; } catch (e) {} }} style={{ width: '100%' }}>Back to sign in</Btn>
      </div>
    </div>
  );

  return shell(
    <div>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>Set your password</h2>
      <div style={{ fontSize: 14.5, color: 'var(--ink-500)', marginTop: 8 }}>Welcome, {name}. Create a password to activate your account.</div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--appro-blue-50, #F6FCFF)', border: '1px solid var(--appro-blue-300)', borderRadius: 11, padding: '12px 14px', margin: '20px 0 22px' }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--appro-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {name.split(' ').map(s => s[0]).slice(0, 2).join('')}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>{org} · invited by Appro</div>
        </div>
      </div>

      <label style={lbl}>Create password</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Choose a strong password" style={box(pw && tur_pwOk(pw))} />
        <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)', display: 'flex' }}><Icon name="eye" size={16} /></button>
      </div>
      <div style={{ display: 'flex', gap: 4, margin: '9px 0 5px' }}>
        {[0, 1, 2, 3].map(i => <span key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i < strength ? (strength >= 4 ? '#00B27A' : strength >= 3 ? '#3B7EF6' : '#EBBE00') : 'var(--ink-200)' }} />)}
      </div>
      {pw ? <div style={{ fontSize: 11.5, fontWeight: 700, color: strength >= 4 ? '#00875A' : 'var(--ink-500)', marginBottom: 10 }}>{strengthLabel}</div> : <div style={{ height: 10 }} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', marginBottom: 16 }}>
        {checks.map(c => (
          <div key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: c.ok ? '#00875A' : 'var(--ink-500)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.ok ? '#00875A' : 'var(--ink-300)' }} />{c.label}
          </div>
        ))}
      </div>

      <label style={lbl}>Confirm password</label>
      <input type={show ? 'text' : 'password'} value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Re-enter your password" style={box(match)} />
      {pw2 ? <div style={{ fontSize: 11.5, fontWeight: 700, color: match ? '#00875A' : 'var(--danger)', marginTop: 5 }}>{match ? '✓ Passwords match.' : "Passwords don't match."}</div> : null}

      <label onClick={() => setTerms(t => !t)} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '18px 0', cursor: 'pointer' }}>
        <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: terms ? 'var(--appro-blue)' : '#fff', border: '1.5px solid ' + (terms ? 'var(--appro-blue)' : 'var(--ink-300)') }}>{terms ? <Icon name="check" size={12} stroke={3} /> : null}</span>
        <span style={{ fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.5 }}>I agree to the <a style={{ color: 'var(--appro-blue)' }}>Terms of Use</a> and <a style={{ color: 'var(--appro-blue)' }}>Privacy Policy</a>.</span>
      </label>

      <Btn variant="primary" disabled={!ready || busy} onClick={submit} style={{ width: '100%', opacity: ready && !busy ? 1 : .5, pointerEvents: ready && !busy ? 'auto' : 'none' }}>
        {busy ? 'Activating…' : 'Activate account'}
      </Btn>
    </div>
  );
}
window.TenantActivateAccount = TenantActivateAccount;
