// Appro Admin Portal — User Role Management & Maker-Checker
// Roles + permission matrix, Users (role + API-category scope), Checker Management
// (checker groups + approving authority set), and a Maker/Checker review queue.
const { useState: useURState, useMemo: useURMemo } = React;

/* ---------- API categories (Marketplace equivalent of the bank product-type tabs) ---------- */
const UR_CATEGORIES = ['Identity & KYC', 'Credit & Risk', 'Payments', 'Accounts & Balances', 'Cards', 'Open Finance'];

/* ---------- Permission matrix (Appendix A of the BRD) ---------- */
const UR_MATRIX = [
  { group: 'Administration', icon: 'settings', subs: [
    { menu: 'Tenant Management', gov: true, cat: false, perms: ['View tenant list & details', 'Onboard tenant', 'Edit tenant', 'Suspend / Activate tenant'] },
    { menu: 'Product Setup', gov: true, cat: true, perms: ['View product', 'Onboard product', 'Edit product', 'Publish product', 'Deprecate product', 'Manage admission checklist'] },
    { menu: 'Billing Management', gov: true, cat: false, perms: ['View billing & plans', 'Manage packages & pricing', 'Edit per-tenant pricing', 'Export invoices'] },
    { menu: 'Subscription Management', gov: false, cat: true, perms: ['View subscription requests', 'Approve subscription', 'Reject subscription', 'Configure outbound fields', 'Cancel subscription'] },
    { menu: 'Access Requests', gov: false, cat: false, perms: ['View access requests', 'Approve access request', 'Reject access request'] },
    { menu: 'Role Management', gov: true, cat: false, perms: ['View role', 'Create role', 'Edit role', 'Activate / Deactivate role', 'Delete role'] },
    { menu: 'User Management', gov: true, cat: false, perms: ['View user', 'Create user', 'Edit user', 'Activate / Deactivate user', 'Delete user'] },
    { menu: 'Checker Management', gov: true, cat: false, perms: ['View checker group', 'Create checker group', 'Edit checker group', 'Activate / Deactivate group', 'Delete checker group'] },
  ]},
  { group: 'Operations', icon: 'usage', subs: [
    { menu: 'Usage & Analytics', gov: false, cat: true, perms: ['View usage & analytics'] },
    { menu: 'Request Logs', gov: false, cat: true, perms: ['View request logs', 'Export request logs'] },
  ]},
  { group: 'Review · Maker-Checker', icon: 'requests', subs: [
    { menu: 'Maker Queue', gov: false, cat: false, perms: ['View maker queue (own requests)'] },
    { menu: 'Checker Queue', gov: false, cat: false, perms: ['View checker queue', 'Review request (approve / reject)'] },
  ]},
];
const UR_KEY = (menu, perm) => menu + ' :: ' + perm;
const UR_ALL_KEYS = UR_MATRIX.flatMap(g => g.subs.flatMap(s => s.perms.map(p => UR_KEY(s.menu, p))));

/* ---------- Role presets ---------- */
const UR_ROLE_DEFS = [
  { name: 'Super Admin', color: '#7C3AED', members: 2, desc: 'Full platform control across every tenant, product, billing and user.' },
  { name: 'Platform Admin', color: '#3B7EF6', members: 4, desc: 'Operate tenants and products; cannot change contract pricing or delete governed objects.' },
  { name: 'Product Manager', color: '#00B27A', members: 6, desc: 'Onboard and govern API products through the publishing lifecycle.' },
  { name: 'Billing Manager', color: '#B7860B', members: 3, desc: 'Manage plans, pricing, invoices and per-tenant overrides.' },
  { name: 'Read-only Auditor', color: '#73787B', members: 5, desc: 'View-only access to platform activity, plus log export.' },
];
function ur_preset(role, menu, perm) {
  const view = perm.startsWith('View');
  if (role === 'Super Admin') return true;
  if (role === 'Platform Admin') {
    if (perm.startsWith('Delete')) return false;
    if (menu === 'Billing Management' && !view) return false;
    if (menu === 'Checker Management' && !view) return false;
    return true;
  }
  if (role === 'Product Manager') return menu === 'Product Setup' || view;
  if (role === 'Billing Manager') return menu === 'Billing Management' || view;
  if (role === 'Read-only Auditor') return view || perm.indexOf('Export') > -1;
  return false;
}
function ur_buildGrants(role) {
  const g = {};
  UR_MATRIX.forEach(gr => gr.subs.forEach(s => s.perms.forEach(p => { g[UR_KEY(s.menu, p)] = ur_preset(role, s.menu, p); })));
  return g;
}

/* ---------- Seed users, checker groups, requests ---------- */
const UR_MEMBERS0 = [
  { name: 'Amira Saleh', email: 'amira.saleh@appro.ae', role: 'Super Admin', scope: 'All', status: 'active', last: '2 min ago' },
  { name: 'Omar Haddad', email: 'omar.haddad@appro.ae', role: 'Platform Admin', scope: 'All', status: 'active', last: '1 h ago' },
  { name: 'Lina Faris', email: 'lina.faris@appro.ae', role: 'Product Manager', scope: ['Identity & KYC', 'Credit & Risk'], status: 'active', last: 'Yesterday' },
  { name: 'Yousef Karim', email: 'yousef.karim@appro.ae', role: 'Billing Manager', scope: 'All', status: 'active', last: '3 days ago' },
  { name: 'Dana Othman', email: 'dana.othman@appro.ae', role: 'Read-only Auditor', scope: 'All', status: 'invited', last: 'Invite sent' },
];
const UR_GROUPS0 = [
  { name: 'Product & Pricing Checkers', authority: ['Product Setup', 'Billing Management'], checkers: 3, status: 'active', by: 'Amira Saleh', updated: '2 days ago' },
  { name: 'Access & Identity Checkers', authority: ['Role Management', 'User Management', 'Checker Management'], checkers: 2, status: 'active', by: 'Amira Saleh', updated: '5 days ago' },
  { name: 'Tenant Onboarding Checkers', authority: ['Tenant Management'], checkers: 2, status: 'inactive', by: 'Omar Haddad', updated: '3 wks ago' },
];
const UR_REQ0 = [
  { id: '20260719_1234573', module: 'Product Setup', type: 'Update', by: 'Omar Haddad', when: '3 h ago', status: 'Pending Review', expiry: '21 h left',
    diff: [{ f: 'Rate limit (req/s)', old: '120', neu: '200' }, { f: 'Auth method', old: 'OAuth 2.0', neu: 'mTLS + OAuth' }] },
  { id: '20260719_1234572', module: 'Billing Management', type: 'Update', by: 'Yousef Karim', when: '6 h ago', status: 'Pending Review', expiry: '18 h left',
    diff: [{ f: 'Growth · monthly', old: 'AED 2,400', neu: 'AED 2,600' }, { f: 'Growth · overage / call', old: 'AED 0.012', neu: 'AED 0.010' }] },
  { id: '20260718_1234570', module: 'Role Management', type: 'Create', by: 'Amira Saleh', when: 'Yesterday', status: 'Approved', expiry: '—',
    diff: [{ f: 'Role name', old: '—', neu: 'Compliance Reviewer' }, { f: 'Permissions', old: '—', neu: '6 granted' }] },
  { id: '20260717_1234566', module: 'Tenant Management', type: 'Update', by: 'Lina Faris', when: '2 days ago', status: 'Rejected', expiry: '—', reason: 'Suspension needs risk sign-off first.',
    diff: [{ f: 'Status', old: 'Active', neu: 'Suspended' }] },
  { id: '20260717_1234565', module: 'Tenant Management', type: 'Update', by: 'Omar Haddad', when: '2 days ago', status: 'On Hold', expiry: 'paused',
    diff: [{ f: 'Tenant tier', old: 'Growth', neu: 'Scale' }] },
];

const UR_toast = (t, m, k) => window.toast && (window.toast[k || 'info'] ? window.toast[k || 'info'](t, m) : window.toast.info && window.toast.info(t, m));

/* ---------- small atoms ---------- */
function URChip({ children, tone }) {
  const map = { blue: ['var(--appro-blue-100)', 'var(--appro-blue-700)'], green: ['#E6F9F2', '#00875A'], grey: ['var(--ink-100)', 'var(--ink-600)'], amber: ['#FEF3C7', '#92400E'] };
  const [b, c] = map[tone] || map.grey;
  return <span style={{ fontSize: 11.5, fontWeight: 600, color: c, background: b, padding: '3px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>{children}</span>;
}
function URReqStatus({ s }) {
  const map = {
    'Pending Review': ['#FEF3C7', '#92400E'], 'On Hold': ['#EDE9FE', '#6D28D9'],
    'Approved': ['#E6F9F2', '#00875A'], 'Rejected': ['#FEE2E2', '#B91C1C'], 'Expired': ['var(--ink-100)', 'var(--ink-500)'],
  };
  const [b, c] = map[s] || ['var(--ink-100)', 'var(--ink-600)'];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: b, color: c, fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 999, whiteSpace: 'nowrap' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />{s}</span>;
}
function URTabs({ tabs, active, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content', flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onPick(t.id)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9, cursor: 'pointer',
          border: '1px solid ' + (active === t.id ? 'var(--appro-blue-300)' : 'transparent'),
          background: active === t.id ? 'var(--appro-blue-100)' : 'transparent',
          color: active === t.id ? 'var(--appro-blue-700)' : 'var(--ink-600)', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-ui)',
        }}><Icon name={t.icon} size={16} />{t.label}{t.badge ? <span style={{ background: active === t.id ? 'var(--appro-blue-700)' : 'var(--ink-300)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px' }}>{t.badge}</span> : null}</button>
      ))}
    </div>
  );
}

/* ============================================================ ROLES & MATRIX */
function URRoles({ grantsByRole, onSubmitReq, lockedRoles }) {
  const [sel, setSel] = useURState('Platform Admin');
  const [edit, setEdit] = useURState(false);
  const [draft, setDraft] = useURState(null);
  const [collapsed, setCollapsed] = useURState({});
  const locked = lockedRoles[sel];
  const grants = edit ? draft : grantsByRole[sel];

  const startEdit = () => { setDraft({ ...grantsByRole[sel] }); setEdit(true); };
  const cancel = () => { setEdit(false); setDraft(null); };
  const toggle = (menu, perm) => { if (!edit) return; const k = UR_KEY(menu, perm); setDraft(d => ({ ...d, [k]: !d[k] })); };
  const selectAll = (sub, on) => { if (!edit) return; setDraft(d => { const n = { ...d }; sub.perms.forEach(p => n[UR_KEY(sub.menu, p)] = on); return n; }); };
  const groupAll = (gr, on) => { if (!edit) return; setDraft(d => { const n = { ...d }; gr.subs.forEach(s => s.perms.forEach(p => n[UR_KEY(s.menu, p)] = on)); return n; }); };

  const save = () => {
    const base = grantsByRole[sel];
    const diff = [];
    UR_ALL_KEYS.forEach(k => { if (!!base[k] !== !!draft[k]) diff.push({ f: k.split(' :: ')[1] + '  (' + k.split(' :: ')[0] + ')', old: base[k] ? 'Granted' : 'Not granted', neu: draft[k] ? 'Granted' : 'Not granted' }); });
    if (!diff.length) { UR_toast('No changes', 'Nothing was changed in this role.', 'info'); cancel(); return; }
    onSubmitReq({ module: 'Role Management', type: 'Update', title: 'Update for Role Management · ' + sel, role: sel, draft: { ...draft }, diff });
    setEdit(false); setDraft(null);
  };

  const grantedCount = useURMemo(() => UR_ALL_KEYS.filter(k => grantsByRole[sel][k]).length, [grantsByRole, sel]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 22, alignItems: 'start' }}>
      {/* role list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Roles</div>
          <Btn variant="secondary" size="sm" icon="plus" onClick={() => UR_toast('Add role', 'Opens the Add-role screen. Saving raises a Create request for a checker to approve.', 'info')}>Add role</Btn>
        </div>
        {UR_ROLE_DEFS.map(r => {
          const active = r.name === sel;
          const cnt = UR_ALL_KEYS.filter(k => grantsByRole[r.name][k]).length;
          return (
            <button key={r.name} onClick={() => { setSel(r.name); cancel(); }} style={{
              textAlign: 'left', cursor: 'pointer', background: active ? 'var(--appro-blue-100)' : '#fff',
              border: '1px solid ' + (active ? 'var(--appro-blue-300)' : 'var(--ink-200)'), borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'color-mix(in srgb,' + r.color + ' 16%, white)', color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={15} /></span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>{r.name}</span>
                </div>
                {lockedRoles[r.name] ? <URChip tone="amber">Pending</URChip> : null}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.45 }}>{r.desc}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}><span>{r.members} users</span><span>·</span><span>{cnt}/{UR_ALL_KEYS.length} permissions</span></div>
            </button>
          );
        })}
      </div>

      {/* permission assignment */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0C1931' }}>Permission assignment — {sel}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>{grantedCount} of {UR_ALL_KEYS.length} permissions granted · role name is unique across the platform</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {edit ? <>
              <Btn variant="secondary" size="sm" onClick={cancel}>Cancel</Btn>
              <Btn variant="primary" size="sm" icon="check" onClick={save}>Save changes</Btn>
            </> : <Btn variant="secondary" size="sm" icon="settings" disabled={locked} onClick={startEdit} style={locked ? { opacity: .5, cursor: 'not-allowed' } : {}}>Edit permissions</Btn>}
          </div>
        </div>

        {locked ? (
          <div style={{ margin: '16px 22px 0', padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#92400E', fontSize: 13.5, fontWeight: 600 }}>
            <Icon name="lock" size={16} /> This role has a change pending review ({locked}). Editing is locked until a checker approves or rejects it.
          </div>
        ) : null}

        <div style={{ padding: '10px 16px 18px' }}>
          {UR_MATRIX.map(gr => {
            const col = collapsed[gr.group];
            const gTotal = gr.subs.reduce((a, s) => a + s.perms.length, 0);
            const gOn = gr.subs.reduce((a, s) => a + s.perms.filter(p => grants[UR_KEY(s.menu, p)]).length, 0);
            return (
              <div key={gr.group} style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#0F2A44', color: '#fff', borderRadius: col ? 12 : '12px 12px 0 0', padding: '13px 18px' }}>
                  <button onClick={() => setCollapsed(c => ({ ...c, [gr.group]: !c[gr.group] }))} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', fontSize: 15.5, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>
                    <Icon name={gr.icon} size={17} />{gr.group}
                    <span style={{ fontSize: 12, fontWeight: 600, opacity: .8 }}>{gOn}/{gTotal}</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {edit ? <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={gOn === gTotal} onChange={e => groupAll(gr, e.target.checked)} style={{ width: 15, height: 15, accentColor: '#3B7EF6' }} /> Select all
                    </label> : null}
                    <button onClick={() => setCollapsed(c => ({ ...c, [gr.group]: !c[gr.group] }))} style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', transform: col ? 'rotate(0)' : 'rotate(180deg)', display: 'flex' }}><Icon name="chevron" size={16} /></button>
                  </div>
                </div>
                {!col && (
                  <div style={{ border: '1px solid var(--ink-200)', borderTop: 0, borderRadius: '0 0 12px 12px', padding: '6px 0' }}>
                    {gr.subs.map((s, si) => (
                      <div key={s.menu} style={{ padding: '13px 18px', borderTop: si ? '1px solid var(--ink-100)' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0C1931' }}>{s.menu}</span>
                          {s.gov ? <URChip tone="blue">4-eyes</URChip> : null}
                          {s.cat ? <URChip tone="grey">category-scoped</URChip> : null}
                          {edit ? <button onClick={() => { const allOn = s.perms.every(p => grants[UR_KEY(s.menu, p)]); selectAll(s, !allOn); }} style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: 'var(--appro-blue-700)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{s.perms.every(p => grants[UR_KEY(s.menu, p)]) ? 'Clear' : 'Select all'}</button> : null}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '9px 18px' }}>
                          {s.perms.map(p => {
                            const on = !!grants[UR_KEY(s.menu, p)];
                            return (
                              <label key={p} onClick={() => toggle(s.menu, p)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: edit ? 'pointer' : 'default', fontSize: 13.5, color: on ? 'var(--ink-800)' : 'var(--ink-400)', fontWeight: on ? 600 : 500 }}>
                                <span style={{ width: 19, height: 19, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: on ? '#3B7EF6' : '#fff', border: '1.5px solid ' + (on ? '#3B7EF6' : 'var(--ink-300)') }}>
                                  {on ? <Icon name="check" size={13} /> : null}
                                </span>{p}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================ USERS */
function URUsers({ members }) {
  const th = { textAlign: 'left', padding: '13px 22px', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><div style={{ fontSize: 18, fontWeight: 700, color: '#0C1931' }}>Users</div><div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>Each user has one role and an API-category scope that governs which product tabs they see.</div></div>
        <Btn variant="primary" icon="plus" onClick={() => UR_toast('Add user', 'Opens the Add-user screen (role + API-category scope). Saving raises a Create request for review.', 'info')}>Add user</Btn>
      </div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid var(--ink-200)' }}><tr><th style={th}>Member</th><th style={th}>Role</th><th style={th}>API-category scope</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}>Last active</th></tr></thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.email} style={{ borderBottom: i < members.length - 1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '16px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1D4ED8,#3B7EF6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{m.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div>
                    <div><div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>{m.name}</div><div style={{ fontSize: 13, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{m.email}</div></div>
                  </div>
                </td>
                <td style={{ padding: '16px 22px', fontSize: 14.5, color: 'var(--ink-700)', fontWeight: 600 }}>{m.role}</td>
                <td style={{ padding: '16px 22px' }}>
                  {m.scope === 'All'
                    ? <URChip tone="green">All categories</URChip>
                    : <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{m.scope.map(c => <URChip key={c} tone="blue">{c}</URChip>)}</div>}
                </td>
                <td style={{ padding: '16px 22px' }}><StatusPill kind={m.status === 'active' ? 'active' : 'review'}>{m.status === 'active' ? 'Active' : 'Invited'}</StatusPill></td>
                <td style={{ padding: '16px 22px', textAlign: 'right', fontSize: 14, color: 'var(--ink-500)' }}>{m.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================================================ CHECKER MANAGEMENT */
function URCheckers({ groups, setGroups }) {
  const toggle = (i) => setGroups(gs => gs.map((g, j) => j === i ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
  const th = { textAlign: 'left', padding: '13px 22px', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><div style={{ fontSize: 18, fontWeight: 700, color: '#0C1931' }}>Checker Management</div><div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>A checker group can approve only the modules in its authority set. Deactivate a group and its checkers can no longer review.</div></div>
        <Btn variant="primary" icon="plus" onClick={() => UR_toast('Add configuration', 'Create a checker group: group name, approving authority set (module + action), and up to 20 checkers.', 'info')}>Add configuration</Btn>
      </div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid var(--ink-200)' }}><tr><th style={th}>Checker group</th><th style={th}>Approving authority set</th><th style={th}>Checkers</th><th style={th}>Updated</th><th style={{ ...th, textAlign: 'right' }}>Status</th></tr></thead>
          <tbody>
            {groups.map((g, i) => (
              <tr key={g.name} style={{ borderBottom: i < groups.length - 1 ? '1px solid var(--ink-100)' : 0, opacity: g.status === 'active' ? 1 : .6 }}>
                <td style={{ padding: '16px 22px' }}><div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>{g.name}</div><div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>by {g.by}</div></td>
                <td style={{ padding: '16px 22px' }}><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{g.authority.map(a => <URChip key={a} tone="blue">{a}</URChip>)}</div></td>
                <td style={{ padding: '16px 22px', fontSize: 14.5, color: 'var(--ink-700)', fontWeight: 600 }}>{g.checkers} assigned</td>
                <td style={{ padding: '16px 22px', fontSize: 14, color: 'var(--ink-500)' }}>{g.updated}</td>
                <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: g.status === 'active' ? '#00875A' : 'var(--ink-500)' }}>{g.status === 'active' ? 'Active' : 'Inactive'}</span>
                    <input type="checkbox" className="toggle" checked={g.status === 'active'} onChange={() => toggle(i)} />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================================================ REVIEW QUEUE (maker + checker) */
function URQueue({ requests, onDecision }) {
  const [tab, setTab] = useURState('checker');
  const [open, setOpen] = useURState(null);
  const me = 'Amira Saleh';
  const list = tab === 'maker' ? requests.filter(r => r.by === me) : requests;
  const th = { textAlign: 'left', padding: '13px 20px', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' };
  const req = open != null ? requests.find(r => r.id === open) : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 10, padding: 4, marginBottom: 16, width: 'fit-content' }}>
        {[{ id: 'checker', l: 'Checker Queue' }, { id: 'maker', l: 'Maker Queue' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: 0, background: tab === t.id ? '#0F2A44' : 'transparent', color: tab === t.id ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 700 }}>{t.l}</button>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 14 }}>
        {tab === 'checker' ? 'Requests you are authorised to review, oldest first. Approving applies the change; rejecting discards it and asks for a reason.' : 'Requests you have raised. A change stays pending until a checker approves it.'}
      </div>
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid var(--ink-200)' }}><tr><th style={th}>Request ID</th><th style={th}>Module</th><th style={th}>Type</th><th style={th}>{tab === 'maker' ? 'Raised' : 'Raised by'}</th><th style={th}>Expiry</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < list.length - 1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '15px 20px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-700)' }}>{r.id}</td>
                <td style={{ padding: '15px 20px', fontSize: 14, fontWeight: 600, color: '#0C1931' }}>{r.module}</td>
                <td style={{ padding: '15px 20px' }}><URChip tone={r.type === 'Create' ? 'green' : r.type === 'Delete' ? 'amber' : 'grey'}>{r.type}</URChip></td>
                <td style={{ padding: '15px 20px', fontSize: 13.5, color: 'var(--ink-600)' }}>{tab === 'maker' ? r.when : r.by}</td>
                <td style={{ padding: '15px 20px', fontSize: 13.5, color: r.expiry.indexOf('left') > -1 ? '#92400E' : 'var(--ink-500)', fontWeight: r.expiry.indexOf('left') > -1 ? 700 : 500 }}>{r.expiry}</td>
                <td style={{ padding: '15px 20px' }}><URReqStatus s={r.status} /></td>
                <td style={{ padding: '15px 20px', textAlign: 'right' }}><Btn variant="secondary" size="sm" icon="eye" onClick={() => setOpen(r.id)}>Review</Btn></td>
              </tr>
            ))}
            {!list.length ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 14 }}>No requests in this queue.</td></tr> : null}
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
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{req.type} request · {req.module}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0C1931', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{req.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--ink-100)', border: 0, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div><div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase' }}>Raised by</div><div style={{ fontSize: 14.5, color: '#0C1931', fontWeight: 600, marginTop: 3 }}>{req.by}</div></div>
            <div><div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase' }}>Status</div><div style={{ marginTop: 5 }}><URReqStatus s={req.status} /></div></div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', marginBottom: 10 }}>Old value vs new value</div>
          <div style={{ border: '1px solid var(--ink-200)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', background: 'var(--ink-50)', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              <div style={{ padding: '9px 14px' }}>Field</div><div style={{ padding: '9px 14px' }}>Old</div><div style={{ padding: '9px 14px' }}>New</div>
            </div>
            {req.diff.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', borderTop: '1px solid var(--ink-100)', fontSize: 13.5 }}>
                <div style={{ padding: '11px 14px', fontWeight: 600, color: '#0C1931' }}>{d.f}</div>
                <div style={{ padding: '11px 14px', color: 'var(--ink-500)', textDecoration: 'line-through' }}>{d.old}</div>
                <div style={{ padding: '11px 14px', color: '#00875A', fontWeight: 600 }}>{d.neu}</div>
              </div>
            ))}
          </div>
          {req.reason ? <div style={{ marginTop: 16, padding: '12px 15px', background: '#FEE2E2', borderRadius: 10, fontSize: 13.5, color: '#B91C1C' }}><b>Rejection reason:</b> {req.reason}</div> : null}
          {req.status === 'On Hold' ? <div style={{ marginTop: 16, padding: '12px 15px', background: '#EDE9FE', borderRadius: 10, fontSize: 13.5, color: '#6D28D9' }}><b>On hold:</b> no authorised checker is available. Create or activate a checker group whose authority set covers {req.module}.</div> : null}
        </div>
        {canDecide ? (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--ink-200)' }}>
            {rejecting ? (
              <div>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection (required)…" style={{ width: '100%', minHeight: 70, padding: 11, borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 13.5, fontFamily: 'var(--font-ui)', resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                  <Btn variant="secondary" size="sm" onClick={() => setRejecting(false)}>Cancel</Btn>
                  <Btn variant="danger" size="sm" icon="x" disabled={!reason.trim()} style={!reason.trim() ? { opacity: .5, cursor: 'not-allowed' } : {}} onClick={() => onDecision('Rejected', reason.trim())}>Confirm reject</Btn>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Btn variant="danger" icon="x" onClick={() => setRejecting(true)}>Reject</Btn>
                <Btn variant="primary" icon="check" onClick={() => onDecision('Approved')}>Approve</Btn>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================ ROOT */
function UserRoleManagement() {
  const [tab, setTab] = useURState('roles');
  const [grantsByRole, setGrantsByRole] = useURState(() => { const o = {}; UR_ROLE_DEFS.forEach(r => o[r.name] = ur_buildGrants(r.name)); return o; });
  const [members] = useURState(UR_MEMBERS0);
  const [groups, setGroups] = useURState(UR_GROUPS0);
  const [requests, setRequests] = useURState(UR_REQ0);
  const [lockedRoles, setLockedRoles] = useURState({});
  const [pendingDrafts, setPendingDrafts] = useURState({}); // reqId -> {role, draft}

  const nextId = () => '20260720_' + Math.floor(1234574 + Math.random() * 90).toString();

  const submitRoleReq = ({ module, type, title, role, draft, diff }) => {
    const id = nextId();
    setRequests(rs => [{ id, module, type, by: 'Amira Saleh', when: 'just now', status: 'Pending Review', expiry: '24 h left', diff, title }, ...rs]);
    setPendingDrafts(p => ({ ...p, [id]: { role, draft } }));
    setLockedRoles(l => ({ ...l, [role]: id }));
    UR_toast('Request created', 'Your change to “' + role + '” is pending review. Open the Checker Queue to approve it.', 'success');
  };

  const decide = (id, decision, reason) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: decision, expiry: '—', reason: reason || r.reason } : r));
    const pd = pendingDrafts[id];
    if (pd) {
      if (decision === 'Approved') { setGrantsByRole(g => ({ ...g, [pd.role]: pd.draft })); }
      setLockedRoles(l => { const n = { ...l }; delete n[pd.role]; return n; });
      setPendingDrafts(p => { const n = { ...p }; delete n[id]; return n; });
    }
    UR_toast('Request ' + decision.toLowerCase(), decision === 'Approved' ? 'The change has been applied to the live configuration.' : 'The change was discarded. The maker has been notified.', decision === 'Approved' ? 'success' : 'info');
  };

  const pendingCount = requests.filter(r => r.status === 'Pending Review').length;
  const tabs = [
    { id: 'roles', label: 'Roles & permissions', icon: 'lock' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'checkers', label: 'Checker Management', icon: 'requests' },
    { id: 'queue', label: 'Review Queue', icon: 'refresh', badge: pendingCount || null },
  ];

  return (
    <div style={{ padding: '32px 36px', background: 'var(--ink-50)', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>User Role Management</h2>
        <div style={{ fontSize: 15, color: 'var(--ink-500)', marginTop: 6 }}>Roles &amp; permissions, users, checker groups and the maker-checker review queue for the Super Admin Portal.</div>
      </div>
      <URTabs tabs={tabs} active={tab} onPick={setTab} />
      {tab === 'roles' && <URRoles grantsByRole={grantsByRole} onSubmitReq={submitRoleReq} lockedRoles={lockedRoles} />}
      {tab === 'users' && <URUsers members={members} />}
      {tab === 'checkers' && <URCheckers groups={groups} setGroups={setGroups} />}
      {tab === 'queue' && <URQueue requests={requests} onDecision={decide} />}
    </div>
  );
}

window.UserRoleManagement = UserRoleManagement;
