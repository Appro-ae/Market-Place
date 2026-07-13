// Appro Admin Portal — User Role Management screen
const { useState: useURState } = React;

const UR_ROLES = [
  { name: 'Super Admin', members: 2, color: '#7C3AED', desc: 'Full platform control across all tenants, products and billing.', perms: ['All permissions', 'Manage admins', 'Billing & contracts', 'Audit access'] },
  { name: 'Platform Admin', members: 4, color: 'var(--appro-blue)', desc: 'Operate tenants and products; cannot change billing contracts.', perms: ['Manage tenants', 'Product setup', 'Approve access', 'View billing'] },
  { name: 'Product Manager', members: 6, color: 'var(--success)', desc: 'Onboard and govern API products through the publishing lifecycle.', perms: ['Product setup', 'Publish to catalog', 'View tenants'] },
  { name: 'Billing Manager', members: 3, color: '#B7860B', desc: 'Manage plans, pricing, invoices and contract values.', perms: ['Billing & contracts', 'Manage plans', 'Export invoices'] },
  { name: 'Read-only Auditor', members: 5, color: 'var(--ink-500)', desc: 'View-only access to platform activity and the audit log.', perms: ['View all', 'Audit access', 'Export reports'] },
];

const UR_MEMBERS = [
  { name: 'Amira Saleh', email: 'amira.saleh@appro.ae', role: 'Super Admin', status: 'active', last: '2 min ago' },
  { name: 'Omar Haddad', email: 'omar.haddad@appro.ae', role: 'Platform Admin', status: 'active', last: '1 h ago' },
  { name: 'Lina Faris', email: 'lina.faris@appro.ae', role: 'Product Manager', status: 'active', last: 'Yesterday' },
  { name: 'Yousef Karim', email: 'yousef.karim@appro.ae', role: 'Billing Manager', status: 'active', last: '3 days ago' },
  { name: 'Dana Othman', email: 'dana.othman@appro.ae', role: 'Read-only Auditor', status: 'invited', last: 'Invite sent' },
];

function URStatus({ s }) {
  const m = s === 'active' ? { c: 'var(--success)', b: 'var(--success-tint)', l: 'Active' } : { c: 'var(--appro-blue)', b: 'var(--appro-blue-100)', l: 'Invited' };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: m.b, color: m.c, fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: m.c }}/>{m.l}</span>;
}

function UserRoleManagement() {
  const th = { textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' };
  return (
    <div style={{ padding: '32px 36px', background: 'var(--ink-50)', minHeight: '100%' }}>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>User Role Management</h2>
        <div style={{ fontSize: 15, color: 'var(--ink-500)', marginTop: 6 }}>Roles, permissions and team members on the Appro platform.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18, marginBottom: 32 }}>
        {UR_ROLES.map(r => (
          <div key={r.name} style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 1px 2px rgba(12,25,49,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: `color-mix(in srgb, ${r.color} 14%, white)`, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={18}/></span>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0C1931' }}>{r.name}</div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-500)', background: 'var(--ink-100)', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{r.members} {r.members === 1 ? 'user' : 'users'}</span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.5 }}>{r.desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {r.perms.map(p => <span key={p} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', background: 'var(--ink-100)', padding: '5px 11px', borderRadius: 8 }}>{p}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>Team members</h3>
        <Btn variant="primary" icon="plus" onClick={() => window.toast && window.toast.info('Invite member', 'Member invitation flow — demo only.')}>Invite member</Btn>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 2px rgba(12,25,49,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid var(--ink-200)' }}>
            <tr><th style={th}>Member</th><th style={th}>Role</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}>Last active</th></tr>
          </thead>
          <tbody>
            {UR_MEMBERS.map((m, i) => (
              <tr key={m.email} style={{ borderBottom: i < UR_MEMBERS.length - 1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1D4ED8,#3B7EF6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{m.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div>
                    <div><div style={{ fontSize: 16, fontWeight: 700, color: '#0C1931' }}>{m.name}</div><div style={{ fontSize: 13.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{m.email}</div></div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px', fontSize: 15.5, color: 'var(--ink-700)' }}>{m.role}</td>
                <td style={{ padding: '18px 24px' }}><URStatus s={m.status}/></td>
                <td style={{ padding: '18px 24px', textAlign: 'right', fontSize: 14.5, color: 'var(--ink-500)' }}>{m.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.UserRoleManagement = UserRoleManagement;
