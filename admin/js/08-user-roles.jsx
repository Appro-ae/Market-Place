// Appro Admin Portal — User Role Management (B2B-style) + Maker-Checker
// Role Management (list table + add/edit form), User Management (list + add form),
// Checker Management (checker groups), Review Queue (maker/checker).
// Marketplace-specific function list. Environment (Sandbox/Production) scope
// replaces the bank product-type dimension, selectable per role and per user.
const { useState: useURState, useMemo: useURMemo } = React;

const UR_ENVS = ['Sandbox', 'Production'];

/* ---------- Marketplace ADMIN permission matrix ---------- */
const UR_GROUPS = [
  { g: 'Tenant Management', icon: 'tenant', perms: ['View tenant', 'Onboard tenant', 'Edit tenant', 'Suspend / Activate tenant'] },
  { g: 'Product Setup', icon: 'product', perms: ['View product', 'Onboard product', 'Edit product', 'Publish product', 'Deprecate product', 'Manage admission checklist'] },
  { g: 'Billing Management', icon: 'billing', perms: ['View billing & plans', 'Manage packages & pricing', 'Edit per-tenant pricing', 'Export invoices'] },
  { g: 'Subscription Management', icon: 'product', perms: ['View subscription requests', 'Approve subscription', 'Reject subscription', 'Configure outbound fields', 'Cancel subscription'] },
  { g: 'User Role Management', icon: 'users', subs: [
    { s: 'Role Management', perms: ['View role', 'Create role', 'Edit role', 'Activate / Deactivate role', 'Delete role'] },
    { s: 'User Management', perms: ['View user', 'Create user', 'Edit user', 'Activate / Deactivate user', 'Delete user'] },
    { s: 'Checker Management', perms: ['View checker group', 'Create checker group', 'Edit checker group', 'Activate / Deactivate group', 'Delete checker group'] },
  ]},
  { g: 'Usage & Analytics', icon: 'usage', perms: ['View usage & analytics', 'Export analytics'] },
  { g: 'Request Logs', icon: 'logs', perms: ['View request logs', 'Export request logs'] },
];
function ur_cells(grp) {
  const out = [];
  if (grp.subs) grp.subs.forEach(sb => sb.perms.forEach(p => out.push({ key: grp.g + '::' + sb.s + '::' + p, sub: sb.s, perm: p })));
  else grp.perms.forEach(p => out.push({ key: grp.g + '::' + p, perm: p }));
  return out;
}
const UR_GROUP_CELLS = {};
UR_GROUPS.forEach(g => UR_GROUP_CELLS[g.g] = ur_cells(g));
const UR_ALL_KEYS = UR_GROUPS.flatMap(g => UR_GROUP_CELLS[g.g].map(c => c.key));

/* ---------- Roles ---------- */
const UR_ROLE_DEFS0 = [
  { name: 'Super Admin', env: 'Both', color: '#7C3AED', members: 2, desc: 'Full platform control across every tenant, product, billing and user.' },
  { name: 'Platform Admin', env: 'Both', color: '#3B7EF6', members: 4, desc: 'Operate tenants and products; cannot change contract pricing or delete governed objects.' },
  { name: 'Product Manager', env: 'Both', color: '#00B27A', members: 6, desc: 'Onboard and govern API products through the publishing lifecycle.' },
  { name: 'Billing Manager', env: 'Production', color: '#B7860B', members: 3, desc: 'Manage plans, pricing, invoices and per-tenant overrides.' },
  { name: 'Read-only Auditor', env: 'Both', color: '#73787B', members: 5, desc: 'View-only access to platform activity, plus log export.' },
];
function ur_preset(role, grp, sub, perm) {
  const view = perm.indexOf('View') === 0;
  if (role === 'Super Admin') return true;
  if (role === 'Platform Admin') {
    if (perm.indexOf('Delete') === 0) return false;
    if (grp === 'Billing Management' && !view) return false;
    if (sub === 'Checker Management' && !view) return false;
    return true;
  }
  if (role === 'Product Manager') return grp === 'Product Setup' || view;
  if (role === 'Billing Manager') return grp === 'Billing Management' || view;
  if (role === 'Read-only Auditor') return view || perm.indexOf('Export') > -1;
  return false;
}
function ur_buildGrants(role) {
  const o = {};
  UR_GROUPS.forEach(g => UR_GROUP_CELLS[g.g].forEach(c => { o[c.key] = ur_preset(role, g.g, c.sub, c.perm); }));
  return o;
}

/* ---------- Seed users, checker groups, requests ---------- */
// Status is TWO-state only: Active / Inactive, driven by the `status` boolean and the enable/disable toggle.
// There is deliberately NO "Invited" status. Whether a user has set a password is NOT a status — it is
// `activated`, and the activation link's own validity is DERIVED from when the link was generated,
// never stored as a separate state.
const UR_USERS0 = [
  { name: 'Amira Saleh', email: 'amira.saleh@appro.ae', roles: ['Super Admin'], env: ['Sandbox', 'Production'], dept: 'Platform', status: true, updated: '20/07/2026', by: 'amira.saleh@appro.ae' },
  { name: 'Omar Haddad', email: 'omar.haddad@appro.ae', roles: ['Platform Admin'], env: ['Sandbox', 'Production'], dept: 'Platform', status: true, updated: '20/07/2026', by: 'amira.saleh@appro.ae' },
  { name: 'Lina Faris', email: 'lina.faris@appro.ae', roles: ['Product Manager'], env: ['Sandbox', 'Production'], dept: 'Product', status: true, updated: '18/07/2026', by: 'omar.haddad@appro.ae' },
  { name: 'Yousef Karim', email: 'yousef.karim@appro.ae', roles: ['Billing Manager'], env: ['Production'], dept: 'Finance', status: true, updated: '16/07/2026', by: 'amira.saleh@appro.ae' },
  { name: 'Sara Idris', email: 'sara.idris@appro.ae', roles: ['Product Manager'], env: ['Sandbox'], dept: 'Product', status: true, activated: false, updated: '20/07/2026', by: 'amira.saleh@appro.ae' },
  { name: 'Dana Othman', email: 'dana.othman@appro.ae', roles: ['Read-only Auditor'], env: ['Sandbox', 'Production'], dept: 'Compliance', status: false, updated: '07/07/2026', by: 'amira.saleh@appro.ae' },
  { name: 'Khaled Nasser', email: 'khaled.nasser@appro.ae', roles: ['Platform Admin', 'Billing Manager'], env: ['Production'], dept: 'Operations', status: true, updated: '01/07/2026', by: 'omar.haddad@appro.ae' },
];
const UR_LINK_EXPIRY_MIN = 10; // configurable activation-link expiry (default 10 minutes)
const UR_DEPTS = ['Platform', 'Product', 'Finance', 'Compliance', 'Operations'];
const UR_GROUPS0 = [
  { name: 'Product & Pricing Checkers', authority: ['Product Setup', 'Billing Management'], checkers: 3, status: 'active', by: 'Amira Saleh', updated: '2 days ago' },
  { name: 'Access & Identity Checkers', authority: ['Role Management', 'User Management', 'Checker Management'], checkers: 2, status: 'active', by: 'Amira Saleh', updated: '5 days ago' },
  { name: 'Tenant Onboarding Checkers', authority: ['Tenant Management'], checkers: 2, status: 'inactive', by: 'Omar Haddad', updated: '3 wks ago' },
];
const UR_REQ0 = [
  { id: '20260719_1234573', module: 'Product Setup', type: 'Update', by: 'Omar Haddad', when: '3 h ago', status: 'Pending Review', expiry: '21 h left', diff: [{ f: 'Rate limit (req/s)', old: '120', neu: '200' }, { f: 'Auth method', old: 'OAuth 2.0', neu: 'mTLS + OAuth' }] },
  { id: '20260719_1234572', module: 'Billing Management', type: 'Update', by: 'Yousef Karim', when: '6 h ago', status: 'Pending Review', expiry: '18 h left', diff: [{ f: 'Growth · monthly', old: 'AED 2,400', neu: 'AED 2,600' }] },
  { id: '20260718_1234570', module: 'Role Management', type: 'Create', by: 'Amira Saleh', when: 'Yesterday', status: 'Approved', expiry: '—', diff: [{ f: 'Role name', old: '—', neu: 'Compliance Reviewer' }] },
  { id: '20260717_1234566', module: 'Tenant Management', type: 'Update', by: 'Lina Faris', when: '2 days ago', status: 'Rejected', expiry: '—', reason: 'Suspension needs risk sign-off first.', diff: [{ f: 'Status', old: 'Active', neu: 'Suspended' }] },
  { id: '20260717_1234565', module: 'Tenant Management', type: 'Update', by: 'Omar Haddad', when: '2 days ago', status: 'On Hold', expiry: 'paused', diff: [{ f: 'Tenant tier', old: 'Growth', neu: 'Scale' }] },
];

const UR_toast = (t, m, k) => window.toast && (window.toast[k || 'info'] ? window.toast[k || 'info'](t, m) : window.toast.info && window.toast.info(t, m));

/* ---------- atoms ---------- */
function URChip({ children, tone }) {
  const map = { blue: ['var(--appro-blue-100)', 'var(--appro-blue-700)'], green: ['#E6F9F2', '#00875A'], grey: ['var(--ink-100)', 'var(--ink-600)'], amber: ['#FEF3C7', '#92400E'], violet: ['#EDE9FE', '#6D28D9'] };
  const [b, c] = map[tone] || map.grey;
  return <span style={{ fontSize: 11.5, fontWeight: 600, color: c, background: b, padding: '3px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>{children}</span>;
}
function URAccess({ kind }) {
  const m = { full: ['#E6F9F2', '#00875A', 'check'], none: ['#FEE2E2', '#DC2626', 'x'], partial: ['#FEF3C7', '#B7860B', 'dash'] }[kind];
  return <span style={{ width: 22, height: 22, borderRadius: '50%', background: m[0], color: m[1], display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    {m[2] === 'dash' ? <span style={{ width: 9, height: 2.5, background: m[1], borderRadius: 2 }} /> : <Icon name={m[2]} size={13} stroke={3} />}
  </span>;
}
function URReqStatus({ s }) {
  const map = { 'Pending Review': ['#FEF3C7', '#92400E'], 'On Hold': ['#EDE9FE', '#6D28D9'], 'Approved': ['#E6F9F2', '#00875A'], 'Rejected': ['#FEE2E2', '#B91C1C'], 'Expired': ['var(--ink-100)', 'var(--ink-500)'] };
  const [b, c] = map[s] || ['var(--ink-100)', 'var(--ink-600)'];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: b, color: c, fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 999, whiteSpace: 'nowrap' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />{s}</span>;
}
function URToggle({ on, onChange }) { return <input type="checkbox" className="toggle" checked={on} onChange={onChange} />; }
function URTabs({ tabs, active, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 12, padding: 4, marginBottom: 22, width: 'fit-content', flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onPick(t.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9, cursor: 'pointer', border: '1px solid ' + (active === t.id ? 'var(--appro-blue-300)' : 'transparent'), background: active === t.id ? 'var(--appro-blue-100)' : 'transparent', color: active === t.id ? 'var(--appro-blue-700)' : 'var(--ink-600)', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>
          <Icon name={t.icon} size={16} />{t.label}{t.badge ? <span style={{ background: active === t.id ? 'var(--appro-blue-700)' : 'var(--ink-300)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px' }}>{t.badge}</span> : null}</button>
      ))}
    </div>
  );
}
function URBreadcrumb({ parts }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-500)', marginBottom: 4 }}>
    {parts.map((p, i) => <React.Fragment key={i}>{i ? <Icon name="chevron" size={13} /> : null}<span style={{ color: i === parts.length - 1 ? 'var(--appro-blue-700)' : 'var(--ink-500)', fontWeight: i === parts.length - 1 ? 700 : 500 }}>{p}</span></React.Fragment>)}
  </div>;
}
function URSeg({ value, options, onChange }) {
  return <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 9, padding: 3, gap: 3 }}>
    {options.map(o => <button key={o} onClick={() => onChange(o)} style={{ padding: '6px 14px', borderRadius: 7, border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-ui)', background: value === o ? '#fff' : 'transparent', color: value === o ? 'var(--appro-blue-700)' : 'var(--ink-500)', boxShadow: value === o ? '0 1px 2px rgba(12,25,49,.1)' : 'none' }}>{o}</button>)}
  </div>;
}
function URSearch({ value, onChange, ph }) {
  return <div style={{ position: 'relative', maxWidth: 380 }}>
    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}><Icon name="search" size={16} /></span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={ph || 'Search'} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 38px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff' }} />
  </div>;
}
function envChip(env) {
  if (env === 'Both' || (Array.isArray(env) && env.length === 2)) return <URChip tone="grey">Sandbox + Production</URChip>;
  const e = Array.isArray(env) ? env[0] : env;
  return <URChip tone={e === 'Production' ? 'green' : 'blue'}>{e}</URChip>;
}
/* two-state user status pill (Active / Inactive) — there is no Invited status */
function URUserStatus({ state }) {
  const map = { active: ['#E6F9F2', '#00875A', 'Active'], inactive: ['var(--ink-100)', 'var(--ink-500)', 'Inactive'] };
  const [b, c, l] = map[state] || map.inactive;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: b, color: c, fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 999, whiteSpace: 'nowrap' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />{l}</span>;
}
/* password policy for the Activate Account screen — BRD v1.4 2.8.2 / IEM017 */
function ur_pwChecks(pw) { return [
  { k: 'len', ok: pw.length >= 8, label: 'At least 8 characters' },
  { k: 'upper', ok: /[A-Z]/.test(pw), label: 'An uppercase letter' },
  { k: 'lower', ok: /[a-z]/.test(pw), label: 'A lowercase letter' },
  { k: 'num', ok: /[0-9]/.test(pw), label: 'A number' },
]; }
function ur_pwOk(pw) { return ur_pwChecks(pw).every(c => c.ok); }
function ur_token() { return 'eyJ' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 10) + '.9631'; }
// The activation link a user receives by email; opening it lands on the portal's set-password (Activate Account) screen.
function ur_activateUrl(u) { return './?activate=1&email=' + encodeURIComponent((u && u.email) || '') + '&token=' + ((u && u.token) || ur_token()); }
function ur_openActivate(u) { try { window.open(ur_activateUrl(u), '_blank'); } catch (e) {} }

/* ============================================================ ROLE MANAGEMENT — LIST */
function URRoleList({ roles, grantsByRole, onToggleStatus, onAdd, onEdit, statusByRole }) {
  const [q, setQ] = useURState('');
  const th = { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' };
  const list = roles.filter(r => r.name.toLowerCase().indexOf(q.toLowerCase()) > -1);
  const accessKind = (role, grp) => { const cells = UR_GROUP_CELLS[grp.g]; const on = cells.filter(c => grantsByRole[role][c.key]).length; return on === 0 ? 'none' : on === cells.length ? 'full' : 'partial'; };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <URSearch value={q} onChange={setQ} ph="Search role name" />
        <Btn variant="primary" icon="plus" onClick={onAdd}>Add Role</Btn>
      </div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 1180 }}>
            <thead style={{ background: 'var(--appro-blue-100)' }}>
              <tr>
                <th style={{ ...th, position: 'sticky', left: 0, background: 'var(--appro-blue-100)' }}>Role Name</th>
                <th style={th}>Status</th>
                <th style={th}>Environment</th>
                {UR_GROUPS.map(g => <th key={g.g} style={{ ...th, textAlign: 'center' }}>{g.g}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.name} style={{ borderTop: '1px solid var(--ink-100)', background: i % 2 ? 'var(--ink-50)' : '#fff' }}>
                  <td style={{ padding: '14px 16px', position: 'sticky', left: 0, background: i % 2 ? 'var(--ink-50)' : '#fff' }}>
                    <button onClick={() => onEdit(r.name)} style={{ background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'color-mix(in srgb,' + r.color + ' 16%, white)', color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={15} /></span>
                      <span><span style={{ fontSize: 14.5, fontWeight: 700, color: '#0C1931' }}>{r.name}</span>{statusByRole[r.name] ? <div><URChip tone="amber">Pending review</URChip></div> : null}</span>
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}><URToggle on={r.active !== false} onChange={() => onToggleStatus(r.name)} /></td>
                  <td style={{ padding: '14px 16px' }}>{envChip(r.env)}</td>
                  {UR_GROUPS.map(g => <td key={g.g} style={{ padding: '14px 16px', textAlign: 'center' }}><URAccess kind={accessKind(r.name, g)} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 18, fontSize: 13.5, color: 'var(--ink-500)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'default' }}><Icon name="arrow" size={14} /> Previous</span>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--appro-blue)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'default' }}>Next <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Icon name="arrow" size={14} /></span></span>
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 16, fontSize: 12.5, color: 'var(--ink-500)', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><URAccess kind="full" /> Full access</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><URAccess kind="partial" /> Partial</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><URAccess kind="none" /> No access</span>
      </div>
    </div>
  );
}

/* ============================================================ ROLE MANAGEMENT — FORM */
function URRoleForm({ existing, roleDef, initialGrants, initialEnv, takenNames, onCancel, onSave }) {
  const [name, setName] = useURState(existing || '');
  const [env, setEnv] = useURState(initialEnv || 'Both');
  const [grants, setGrants] = useURState(initialGrants || (() => { const o = {}; UR_ALL_KEYS.forEach(k => o[k] = false); return o; }));
  const [activeSub, setActiveSub] = useURState({});
  const [collapsed, setCollapsed] = useURState({});
  const [err, setErr] = useURState('');
  const toggle = k => setGrants(g => ({ ...g, [k]: !g[k] }));
  const setMany = (keys, on) => setGrants(g => { const n = { ...g }; keys.forEach(k => n[k] = on); return n; });
  const save = () => {
    if (!name.trim()) { setErr('Please enter a role name.'); return; }
    if (!existing && takenNames.map(n => n.toLowerCase()).indexOf(name.trim().toLowerCase()) > -1) { setErr('This role name already exists.'); return; }
    onSave({ name: name.trim(), env, grants });
  };
  return (
    <div>
      <URBreadcrumb parts={['Users', 'Role Management', existing ? 'Edit Role' : 'Add Role']} />
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
            <URSeg value={env} options={['Sandbox', 'Production', 'Both']} onChange={setEnv} />
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 7 }}>Which environment(s) this role can act in.</div>
          </div>
        </div>
      </Card>

      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-200)', fontSize: 17, fontWeight: 700, color: '#0C1931' }}>Permission assignment</div>
        <div style={{ padding: '8px 16px 16px' }}>
          {UR_GROUPS.map(grp => {
            const col = collapsed[grp.g];
            const cells = UR_GROUP_CELLS[grp.g];
            const on = cells.filter(c => grants[c.key]).length;
            const allKeys = cells.map(c => c.key);
            const sub = activeSub[grp.g] || (grp.subs ? grp.subs[0].s : null);
            const subCells = grp.subs ? cells.filter(c => c.sub === sub) : cells;
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
                    {grp.subs ? (
                      <div style={{ width: 220, borderRight: '1px solid var(--ink-100)', padding: 8, flexShrink: 0, background: 'var(--ink-50)' }}>
                        {grp.subs.map(sb => { const active = sb.s === sub; return (
                          <button key={sb.s} onClick={() => setActiveSub(a => ({ ...a, [grp.g]: sb.s }))} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 9, marginBottom: 4, cursor: 'pointer', border: 0, background: active ? '#0F2A44' : 'transparent', color: active ? '#fff' : 'var(--ink-700)', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>{sb.s}<Icon name="chevron" size={14} /></button>
                        ); })}
                      </div>
                    ) : null}
                    <div style={{ flex: 1, padding: '14px 18px' }}>
                      {grp.subs ? <div style={{ marginBottom: 12 }}><label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 700, color: '#0C1931', cursor: 'pointer' }}><input type="checkbox" checked={subCells.every(c => grants[c.key])} onChange={e => setMany(subCells.map(c => c.key), e.target.checked)} style={{ width: 16, height: 16, accentColor: '#3B7EF6' }} /> Select all</label></div> : null}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '11px 18px' }}>
                        {subCells.map(c => { const onc = !!grants[c.key]; return (
                          <label key={c.key} onClick={() => toggle(c.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5, color: onc ? 'var(--ink-800)' : 'var(--ink-500)', fontWeight: onc ? 600 : 500 }}>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, position: 'sticky', bottom: 0, background: 'var(--ink-50)', padding: '14px 0' }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" icon="check" onClick={save}>{existing ? 'Save changes' : 'Add role'}</Btn>
      </div>
    </div>
  );
}

/* ============================================================ USER MANAGEMENT — LIST */
const URFunnel = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
function ur_dmy(s) { const p = (s || '').split('/'); return p.length === 3 ? p[2] + '-' + p[1] + '-' + p[0] : ''; }
const UR_FILTER0 = { env: 'All', status: 'All', date: '' };

function URUserFilterDrawer({ initial, onClose, onApply, onClear }) {
  const [f, setF] = useURState(initial);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const selStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff', color: 'var(--ink-800)' };
  const fieldLabel = { fontSize: 13.5, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 9 };
  const card = { background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 12, padding: '16px 18px', marginBottom: 14 };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,18,30,.45)', zIndex: 85, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(440px,94vw)', height: '100%', background: 'var(--ink-50)', boxShadow: '-8px 0 30px rgba(0,0,0,.16)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0C1931' }}>Apply Filter</div>
          <button onClick={onClose} style={{ background: 'var(--ink-100)', border: 0, borderRadius: 999, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
          <div style={card}>
            <label style={fieldLabel}>Environment</label>
            <select value={f.env} onChange={e => set('env', e.target.value)} style={selStyle}><option value="All">All Environments</option><option value="Sandbox">Sandbox</option><option value="Production">Production</option></select>
          </div>
          <div style={card}>
            <label style={fieldLabel}>Status</label>
            <select value={f.status} onChange={e => set('status', e.target.value)} style={selStyle}><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
          </div>
          <div style={card}>
            <label style={fieldLabel}>Last Updated Date</label>
            <input type="date" value={f.date} onChange={e => set('date', e.target.value)} style={selStyle} />
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 7 }}>Shows users updated on or after the selected date.</div>
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--ink-200)', background: '#fff', display: 'flex', gap: 10 }}>
          <Btn variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setF(UR_FILTER0); onClear(); }}>Clear All</Btn>
          <Btn variant="primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onApply(f)}>Apply</Btn>
        </div>
      </div>
    </div>
  );
}

function URUserList({ users, roles, onToggle, onAdd, onOpenInvite, onResend }) {
  const [q, setQ] = useURState('');
  const [filterOpen, setFilterOpen] = useURState(false);
  const [filter, setFilter] = useURState(UR_FILTER0);
  const th = { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' };
  const activeCount = (filter.env !== 'All' ? 1 : 0) + (filter.status !== 'All' ? 1 : 0) + (filter.date ? 1 : 0);
  const list = users.filter(u => {
    if ((u.name + u.email).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
    if (filter.env !== 'All' && (Array.isArray(u.env) ? u.env.indexOf(filter.env) < 0 : u.env !== filter.env)) return false;
    if (filter.status !== 'All' && (u.status ? 'active' : 'inactive') !== filter.status.toLowerCase()) return false;
    if (filter.date && ur_dmy(u.updated) && ur_dmy(u.updated) < filter.date) return false;
    return true;
  });
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <URSearch value={q} onChange={setQ} ph="Search name or email" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFilterOpen(true)} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: '#fff', color: 'var(--ink-800)', border: '1px solid ' + (activeCount ? 'var(--appro-blue)' : '#D1DBDF'), fontFamily: 'var(--font-ui)' }}>
            <URFunnel />Filter{activeCount ? <span style={{ background: 'var(--appro-blue)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px' }}>{activeCount}</span> : null}
          </button>
          <Btn variant="secondary" icon="external" onClick={() => UR_toast('Export', 'Exporting the user list (demo).', 'info')}>Export</Btn>
          <Btn variant="primary" icon="plus" onClick={onAdd}>Add User</Btn>
        </div>
      </div>
      {activeCount ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 600 }}>Showing {list.length} of {users.length} ·</span>
          {filter.env !== 'All' ? <URChip tone="blue">Environment: {filter.env}</URChip> : null}
          {filter.status !== 'All' ? <URChip tone="blue">Status: {filter.status}</URChip> : null}
          {filter.date ? <URChip tone="blue">Updated ≥ {filter.date}</URChip> : null}
          <button onClick={() => setFilter(UR_FILTER0)} style={{ background: 'transparent', border: 0, color: 'var(--appro-blue-700)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Clear all</button>
        </div>
      ) : null}
      {filterOpen ? <URUserFilterDrawer initial={filter} onClose={() => setFilterOpen(false)} onApply={f => { setFilter(f); setFilterOpen(false); }} onClear={() => { setFilter(UR_FILTER0); setFilterOpen(false); }} /> : null}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead style={{ background: 'var(--appro-blue-100)' }}><tr><th style={th}>Name</th><th style={th}>User Role</th><th style={th}>Environment</th><th style={th}>Status</th><th style={th}>Last Updated Date</th><th style={th}>Last Updated By</th></tr></thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={u.email} style={{ borderTop: '1px solid var(--ink-100)', background: i % 2 ? 'var(--ink-50)' : '#fff' }}>
                  <td style={{ padding: '15px 20px' }}><div style={{ fontSize: 14.5, fontWeight: 700, color: '#0C1931' }}>{u.name}</div><div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{u.email}</div></td>
                  <td style={{ padding: '15px 20px' }}><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{u.roles.map(r => <span key={r} style={{ fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 8, border: '1px solid var(--ink-200)', color: 'var(--ink-700)', background: '#fff' }}>{r}</span>)}</div></td>
                  <td style={{ padding: '15px 20px' }}>{envChip(u.env)}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><URUserStatus state={u.status ? 'active' : 'inactive'} /><URToggle on={u.status} onChange={() => onToggle(u.email)} /></label>
                  </td>
                  <td style={{ padding: '15px 20px', fontSize: 13.5, color: 'var(--ink-600)' }}>{u.updated}</td>
                  <td style={{ padding: '15px 20px', fontSize: 13.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{u.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================ USER MANAGEMENT — FORM */
function URUserForm({ roles, onCancel, onSave }) {
  const [f, setF] = useURState({ name: '', email: '', mobile: '', dept: '', roles: [], env: [] });
  const [err, setErr] = useURState('');
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
      <URBreadcrumb parts={['Users', 'User Management', 'Add User']} />
      <Card>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0C1931', marginBottom: 18 }}>Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          {field('Name', true, inp(f.name, v => set('name', v), 'Enter name'))}
          {field('User Email', true, inp(f.email, v => set('email', v), 'Enter user email'))}
          {field('Mobile Number', false, inp(f.mobile, v => set('mobile', v), '+971 | Enter mobile number'))}
          {field('Department', false, sel(f.dept, v => set('dept', v), UR_DEPTS, 'Select department'))}
          {field('User Role', true, sel('', v => v && toggleArr('roles', v), roles.map(r => r.name).filter(n => f.roles.indexOf(n) < 0), 'Add a role'))}
          <div></div>
        </div>
        {f.roles.length ? <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{f.roles.map(r => <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--appro-blue-300)', background: 'var(--appro-blue-100)', color: 'var(--appro-blue-700)' }}>{r}<button onClick={() => toggleArr('roles', r)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--appro-blue-700)', display: 'flex' }}><Icon name="x" size={12} /></button></span>)}</div> : null}

        <div style={{ marginTop: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: 10 }}>Environment <span style={{ color: '#DC2626' }}>*</span></label>
          <div style={{ display: 'flex', gap: 22 }}>
            {UR_ENVS.map(e => { const on = f.env.indexOf(e) > -1; return (
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
        <Btn variant="primary" icon="check" onClick={save}>Create user &amp; send invite</Btn>
      </div>
    </div>
  );
}

/* ============================================================ INVITATION SENT — confirmation (BRD v1.4 2.8.1 / AT01) */
function URInviteSent({ user, onPreview, onResend, onDone }) {
  if (!user) return null;
  return (
    <div>
      <URBreadcrumb parts={['Users', 'User Management', 'Invitation sent']} />
      <div style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#E6F9F2', border: '1px solid #A7E8CF', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#00875A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={17} stroke={3} /></span>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#065F46' }}>User created — invitation email sent</div>
            <div style={{ fontSize: 13.5, color: '#047857', marginTop: 3, lineHeight: 1.55 }}>{user.name} was created with status <b>Active</b> and cannot sign in until they set a password. An activation email has been sent to <b style={{ fontFamily: 'var(--font-mono)' }}>{user.email}</b>.</div>
          </div>
        </div>
        <Card>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--appro-blue-100)', color: 'var(--appro-blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={16} /></span>
            <div style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.6 }}>
              The user receives an email from the Appro API Marketplace with a secure link to <b>set their password and activate the account</b>. The link is <b>single-use</b>. Whether it is still usable is <b>derived from the date it was generated</b> — there is no separate invitation status to maintain. Opening it takes them to the Activate Account screen; once they set a password they can sign in with their email and password.
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

/* ============================================================ CHECKER MANAGEMENT */
function URCheckers({ groups, setGroups }) {
  const toggle = (i) => setGroups(gs => gs.map((g, j) => j === i ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
  const th = { textAlign: 'left', padding: '13px 22px', fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.05em' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><div style={{ fontSize: 18, fontWeight: 700, color: '#0C1931' }}>Checker Management</div><div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>A checker group can approve only the modules in its authority set. Deactivate a group and its checkers can no longer review.</div></div>
        <Btn variant="primary" icon="plus" onClick={() => UR_toast('Add configuration', 'Create a checker group: group name, approving authority set (module + action), and up to 20 checkers.', 'info')}>Add configuration</Btn>
      </div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--appro-blue-100)' }}><tr><th style={th}>Checker group</th><th style={th}>Approving authority set</th><th style={th}>Checkers</th><th style={th}>Updated</th><th style={{ ...th, textAlign: 'right' }}>Status</th></tr></thead>
          <tbody>
            {groups.map((g, i) => (
              <tr key={g.name} style={{ borderTop: '1px solid var(--ink-100)', opacity: g.status === 'active' ? 1 : .6 }}>
                <td style={{ padding: '16px 22px' }}><div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>{g.name}</div><div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>by {g.by}</div></td>
                <td style={{ padding: '16px 22px' }}><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{g.authority.map(a => <URChip key={a} tone="blue">{a}</URChip>)}</div></td>
                <td style={{ padding: '16px 22px', fontSize: 14.5, color: 'var(--ink-700)', fontWeight: 600 }}>{g.checkers} assigned</td>
                <td style={{ padding: '16px 22px', fontSize: 14, color: 'var(--ink-500)' }}>{g.updated}</td>
                <td style={{ padding: '16px 22px', textAlign: 'right' }}><label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}><span style={{ fontSize: 13, fontWeight: 700, color: g.status === 'active' ? '#00875A' : 'var(--ink-500)' }}>{g.status === 'active' ? 'Active' : 'Inactive'}</span><URToggle on={g.status === 'active'} onChange={() => toggle(i)} /></label></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================================================ REVIEW QUEUE */
function URQueue({ requests, onDecision }) {
  const [tab, setTab] = useURState('checker');
  const [open, setOpen] = useURState(null);
  const me = 'Amira Saleh';
  const list = tab === 'maker' ? requests.filter(r => r.by === me) : requests;
  const th = { textAlign: 'left', padding: '13px 20px', fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.05em' };
  const req = open != null ? requests.find(r => r.id === open) : null;
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 10, padding: 4, marginBottom: 16, width: 'fit-content' }}>
        {[{ id: 'checker', l: 'Checker Queue' }, { id: 'maker', l: 'Maker Queue' }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: 0, background: tab === t.id ? '#0F2A44' : 'transparent', color: tab === t.id ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 700 }}>{t.l}</button>)}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 14 }}>{tab === 'checker' ? 'Requests you are authorised to review, oldest first. Approving applies the change; rejecting discards it and asks for a reason.' : 'Requests you have raised. A change stays pending until a checker approves it.'}</div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--appro-blue-100)' }}><tr><th style={th}>Request ID</th><th style={th}>Module</th><th style={th}>Type</th><th style={th}>{tab === 'maker' ? 'Raised' : 'Raised by'}</th><th style={th}>Expiry</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--ink-100)' }}>
                <td style={{ padding: '15px 20px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-700)' }}>{r.id}</td>
                <td style={{ padding: '15px 20px', fontSize: 14, fontWeight: 600, color: '#0C1931' }}>{r.module}</td>
                <td style={{ padding: '15px 20px' }}><URChip tone={r.type === 'Create' ? 'green' : r.type === 'Delete' ? 'amber' : 'grey'}>{r.type}</URChip></td>
                <td style={{ padding: '15px 20px', fontSize: 13.5, color: 'var(--ink-600)' }}>{tab === 'maker' ? r.when : r.by}</td>
                <td style={{ padding: '15px 20px', fontSize: 13.5, color: r.expiry.indexOf('left') > -1 ? '#92400E' : 'var(--ink-500)', fontWeight: r.expiry.indexOf('left') > -1 ? 700 : 500 }}>{r.expiry}</td>
                <td style={{ padding: '15px 20px' }}><URReqStatus s={r.status} /></td>
                <td style={{ padding: '15px 20px', textAlign: 'right' }}><Btn variant="secondary" size="sm" icon="eye" onClick={() => setOpen(r.id)}>Review</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {req ? <URReviewDrawer req={req} canDecide={tab === 'checker' && req.status === 'Pending Review'} onClose={() => setOpen(null)} onDecision={(d, reason) => { onDecision(req.id, d, reason); setOpen(null); }} /> : null}
    </div>
  );
}
function URReviewDrawer({ req, canDecide, onClose, onDecision }) {
  const [rejecting, setRejecting] = useURState(false);
  const [reason, setReason] = useURState('');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,18,30,.45)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px,94vw)', height: '100%', background: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,.14)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{req.type} request · {req.module}</div><div style={{ fontSize: 20, fontWeight: 700, color: '#0C1931', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{req.id}</div></div>
          <button onClick={onClose} style={{ background: 'var(--ink-100)', border: 0, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div><div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase' }}>Raised by</div><div style={{ fontSize: 14.5, color: '#0C1931', fontWeight: 600, marginTop: 3 }}>{req.by}</div></div>
            <div><div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase' }}>Status</div><div style={{ marginTop: 5 }}><URReqStatus s={req.status} /></div></div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', marginBottom: 10 }}>Old value vs new value</div>
          <div style={{ border: '1px solid var(--ink-200)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', background: 'var(--ink-50)', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}><div style={{ padding: '9px 14px' }}>Field</div><div style={{ padding: '9px 14px' }}>Old</div><div style={{ padding: '9px 14px' }}>New</div></div>
            {req.diff.map((d, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', borderTop: '1px solid var(--ink-100)', fontSize: 13.5 }}><div style={{ padding: '11px 14px', fontWeight: 600, color: '#0C1931' }}>{d.f}</div><div style={{ padding: '11px 14px', color: 'var(--ink-500)', textDecoration: 'line-through' }}>{d.old}</div><div style={{ padding: '11px 14px', color: '#00875A', fontWeight: 600 }}>{d.neu}</div></div>)}
          </div>
          {req.reason ? <div style={{ marginTop: 16, padding: '12px 15px', background: '#FEE2E2', borderRadius: 10, fontSize: 13.5, color: '#B91C1C' }}><b>Rejection reason:</b> {req.reason}</div> : null}
          {req.status === 'On Hold' ? <div style={{ marginTop: 16, padding: '12px 15px', background: '#EDE9FE', borderRadius: 10, fontSize: 13.5, color: '#6D28D9' }}><b>On hold:</b> no authorised checker is available. Create or activate a checker group whose authority set covers {req.module}.</div> : null}
        </div>
        {canDecide ? (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--ink-200)' }}>
            {rejecting ? (
              <div>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection (required)…" style={{ width: '100%', minHeight: 70, padding: 11, borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 13.5, fontFamily: 'var(--font-ui)', resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}><Btn variant="secondary" size="sm" onClick={() => setRejecting(false)}>Cancel</Btn><Btn variant="danger" size="sm" icon="x" disabled={!reason.trim()} style={!reason.trim() ? { opacity: .5, cursor: 'not-allowed' } : {}} onClick={() => onDecision('Rejected', reason.trim())}>Confirm reject</Btn></div>
              </div>
            ) : <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Btn variant="danger" icon="x" onClick={() => setRejecting(true)}>Reject</Btn><Btn variant="primary" icon="check" onClick={() => onDecision('Approved')}>Approve</Btn></div>}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================ ROOT */
function UserRoleManagement() {
  const [tab, setTab] = useURState('roles');
  const [roles, setRoles] = useURState(UR_ROLE_DEFS0.map(r => ({ ...r, active: true })));
  const [grantsByRole, setGrantsByRole] = useURState(() => { const o = {}; UR_ROLE_DEFS0.forEach(r => o[r.name] = ur_buildGrants(r.name)); return o; });
  const [roleView, setRoleView] = useURState({ mode: 'list' });
  const [users, setUsers] = useURState(UR_USERS0);
  const [userView, setUserView] = useURState({ mode: 'list' });
  const [checkerGroups, setCheckerGroups] = useURState(UR_GROUPS0);
  const [requests, setRequests] = useURState(UR_REQ0);

  const palette = ['#3B7EF6', '#00B27A', '#B7860B', '#7C3AED', '#0EA5E9', '#DB2777'];
  const today = '20/07/2026';

  const toggleRoleStatus = name => setRoles(rs => rs.map(r => r.name === name ? { ...r, active: !(r.active !== false) } : r));
  const saveRole = ({ name, env, grants }, existing) => {
    if (existing) {
      setRoles(rs => rs.map(r => r.name === existing ? { ...r, name, env } : r));
      setGrantsByRole(g => { const n = { ...g }; if (existing !== name) delete n[existing]; n[name] = grants; return n; });
      UR_toast('Role updated', 'A change request for “' + name + '” has been raised for checker review.', 'success');
    } else {
      setRoles(rs => [...rs, { name, env, active: true, color: palette[rs.length % palette.length], members: 0, desc: 'Custom role.' }]);
      setGrantsByRole(g => ({ ...g, [name]: grants }));
      UR_toast('Role created', '“' + name + '” has been created and sent for checker review.', 'success');
    }
    setRoleView({ mode: 'list' });
  };
  const toggleUser = email => setUsers(us => us.map(u => u.email === email ? { ...u, status: !u.status, updated: today } : u));
  // Create → status Active + activation email. The user still cannot sign in until they set a password;
  // that is `activated`, not a status. Link validity is derived from the generated-link date.
  const saveUser = f => {
    const token = ur_token();
    setUsers(us => [{ name: f.name, email: f.email, roles: f.roles, env: f.env, dept: f.dept, status: true, activated: false, token, updated: today, by: 'amira.saleh@appro.ae' }, ...us]);
    UR_toast('Activation email sent', '“' + f.name + '” was created. A set-password link was sent to ' + f.email + '.', 'success');
    setUserView({ mode: 'sent', email: f.email });
  };
  const resendInvite = email => { setUsers(us => us.map(u => u.email === email ? { ...u, token: ur_token(), updated: today } : u)); UR_toast('Invitation resent', 'A new activation link was sent. Any previous link is no longer valid.', 'success'); };
  const openActivateFor = email => { const u = users.find(x => x.email === email); if (u) ur_openActivate(u); };
  const decide = (id, decision, reason) => { setRequests(rs => rs.map(r => r.id === id ? { ...r, status: decision, expiry: '—', reason: reason || r.reason } : r)); UR_toast('Request ' + decision.toLowerCase(), decision === 'Approved' ? 'The change has been applied to the live configuration.' : 'The change was discarded. The maker has been notified.', decision === 'Approved' ? 'success' : 'info'); };

  const pendingCount = requests.filter(r => r.status === 'Pending Review').length;
  const tabs = [
    { id: 'roles', label: 'Role Management', icon: 'lock' },
    { id: 'users', label: 'User Management', icon: 'users' },
    // Temporarily hidden for later review — re-enable to restore the tabs.
    // { id: 'checkers', label: 'Checker Management', icon: 'requests' },
    // { id: 'queue', label: 'Review Queue', icon: 'refresh', badge: pendingCount || null },
  ];

  return (
    <div style={{ padding: '32px 36px', background: 'var(--ink-50)', minHeight: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>User Role Management</h2>
        <div style={{ fontSize: 15, color: 'var(--ink-500)', marginTop: 6 }}>Roles &amp; permissions, users, checker groups and the maker-checker review queue for the Super Admin Portal.</div>
      </div>
      <URTabs tabs={tabs} active={tab} onPick={t => { setTab(t); setRoleView({ mode: 'list' }); setUserView({ mode: 'list' }); }} />

      {tab === 'roles' && (roleView.mode === 'list'
        ? <URRoleList roles={roles} grantsByRole={grantsByRole} statusByRole={{}} onToggleStatus={toggleRoleStatus} onAdd={() => setRoleView({ mode: 'form', role: null })} onEdit={name => setRoleView({ mode: 'form', role: name })} />
        : <URRoleForm existing={roleView.role} roleDef={roles.find(r => r.name === roleView.role)} initialGrants={roleView.role ? { ...grantsByRole[roleView.role] } : null} initialEnv={roleView.role ? roles.find(r => r.name === roleView.role).env : 'Both'} takenNames={roles.map(r => r.name)} onCancel={() => setRoleView({ mode: 'list' })} onSave={data => saveRole(data, roleView.role)} />)}

      {tab === 'users' && (
        userView.mode === 'list'
          ? <URUserList users={users} roles={roles} onToggle={toggleUser} onAdd={() => setUserView({ mode: 'form' })} onOpenInvite={openActivateFor} onResend={resendInvite} />
        : userView.mode === 'form'
          ? <URUserForm roles={roles} onCancel={() => setUserView({ mode: 'list' })} onSave={saveUser} />
          : <URInviteSent user={users.find(u => u.email === userView.email)} onPreview={() => ur_openActivate(users.find(u => u.email === userView.email) || { email: userView.email })} onResend={() => resendInvite(userView.email)} onDone={() => setUserView({ mode: 'list' })} />)}

      {tab === 'checkers' && <URCheckers groups={checkerGroups} setGroups={setCheckerGroups} />}
      {tab === 'queue' && <URQueue requests={requests} onDecision={decide} />}
    </div>
  );
}

window.UserRoleManagement = UserRoleManagement;
