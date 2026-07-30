// Admin secondary screens — Access Requests, Tenants, Audit, Settings
const { statusMeta: stMeta } = window.ADMIN;

function AdminRequests({ requests, onApprove, onReject }) {
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Access requests</div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{requests.filter(r => r.status==='pending').length} pending</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['Tenant','API','Environment','Plan','Requested','Status',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < requests.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '13px 20px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{r.tenant}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{r.id}</div>
                </td>
                <td style={{ padding: '13px 20px', color: 'var(--ink-700)' }}>{r.api}</td>
                <td style={{ padding: '13px 20px' }}><EnvBadge env={r.env} size="sm"/></td>
                <td style={{ padding: '13px 20px', color: 'var(--ink-600)' }}>{r.plan}</td>
                <td style={{ padding: '13px 20px', fontSize: 11.5, color: 'var(--ink-500)' }}>{r.when}</td>
                <td style={{ padding: '13px 20px' }}><StatusPill kind={r.status === 'approved' ? 'active' : r.status === 'rejected' ? 'error' : 'pending'}>{r.status === 'approved' ? 'Approved' : r.status === 'rejected' ? 'Rejected' : 'Pending'}</StatusPill></td>
                <td style={{ padding: '13px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {r.status === 'pending' && (
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Btn variant="primary" size="sm" icon="check" onClick={() => onApprove(r)}>Approve</Btn>
                      <Btn variant="secondary" size="sm" onClick={() => onReject(r)} style={{ color: 'var(--danger)' }}>Reject</Btn>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminTenants() {
  const { useState } = React;
  const SEED = [
    { n: 'Nuqud Pay', id: 'org_nuqud_8f2a', tier: 'Growth', apis: 5, env: 'production', status: 'active', since: 'Jan 2026', admin: 'amira@nuqud.ae' },
    { n: 'Marble Bank', id: 'org_marble_2c10', tier: 'Enterprise', apis: 9, env: 'production', status: 'active', since: 'Nov 2025', admin: 'ops@marble.bank' },
    { n: 'Falcon Lending', id: 'org_falcon_77b1', tier: 'Growth', apis: 3, env: 'sandbox', status: 'active', since: 'Mar 2026', admin: 'dev@falcon.ae' },
    { n: 'Oasis Wallet', id: 'org_oasis_4d92', tier: 'Sandbox', apis: 2, env: 'sandbox', status: 'pending', since: 'Jun 2026', admin: 'tech@oasis.io' },
    { n: 'Cedar Finance', id: 'org_cedar_19ee', tier: 'Growth', apis: 4, env: 'production', status: 'suspended', since: 'Feb 2026', admin: 'admin@cedar.ae' },
  ];
  const [tenants, setTenants] = useState(SEED);
  const [show, setShow] = useState(false);

  const onCreate = (t) => {
    setTenants(list => [t, ...list]);
    window.toast && window.toast.success('Tenant onboarded', t.n + ' created · invite sent to ' + t.admin, { action: { label: 'Open Customer Portal', onClick: () => window.open('../customer/', '_blank') } });
  };

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Tenants · {tenants.length}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>Organizations with access to the Customer Portal</div>
          </div>
          <Btn variant="primary" icon="plus" onClick={() => setShow(true)}>Onboard tenant</Btn>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['Organization','Primary admin','Tier','APIs','Default env','Customer since','Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < tenants.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '13px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>{t.n.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
                    <div><div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{t.n}</div><div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{t.id}</div></div>
                  </div>
                </td>
                <td style={{ padding: '13px 20px', color: 'var(--ink-600)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{t.admin}</td>
                <td style={{ padding: '13px 20px', color: 'var(--ink-700)' }}>{t.tier}</td>
                <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{t.apis}</td>
                <td style={{ padding: '13px 20px' }}><EnvBadge env={t.env} size="sm"/></td>
                <td style={{ padding: '13px 20px', fontSize: 11.5, color: 'var(--ink-500)' }}>{t.since}</td>
                <td style={{ padding: '13px 20px' }}><StatusPill kind={t.status === 'active' ? 'active' : t.status === 'suspended' ? 'error' : 'pending'}>{t.status[0].toUpperCase()+t.status.slice(1)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {show && <OnboardTenantModal onClose={() => setShow(false)} onCreate={onCreate}/>}
    </div>
  );
}

function OnboardTenantModal({ onClose, onCreate }) {
  const { useState } = React;
  const [f, setF] = useState({ name: '', admin: '', adminName: '', tier: 'Sandbox', env: 'sandbox', invite: true });
  const [inviteErr, setInviteErr] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [tried, setTried] = useState(false);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const NAME_MAX = 500;
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.admin);
  const nameTooLong = f.name.length > NAME_MAX;
  const valid = f.name.trim().length > 1 && !nameTooLong && emailOk;
  const slug = f.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 16);

  const inp = { width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--ink-300)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' };
  const lab = { fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 5, display: 'block', fontFamily: 'var(--font-ui)' };

  // Simulated backend call — fails if the org name contains "fail" (demo) or at random, so the error path is visible.
  const createTenantApi = (payload) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (/fail/i.test(payload.n)) return reject({ code: 'TENANT_CREATE_FAILED', message: 'A tenant with this name could not be provisioned. Please try a different name.' });
      if (Math.random() < 0.15) return reject({ code: 'UPSTREAM_TIMEOUT', message: 'The provisioning service did not respond. No tenant was created.' });
      resolve(payload);
    }, 1100);
  });

  const submit = async () => {
    if (creating) return;
    setTried(true);
    if (!valid) { window.toast && window.toast.error('Check the form', 'Please complete the required fields before creating the tenant.'); return; }
    if (!f.invite) { setInviteErr(true); window.toast && window.toast.error('Portal invite required', 'Tick “Send portal invite” so the primary admin can access the Customer Portal.'); return; }
    const id = 'org_' + (slug || 'tenant') + '_' + Math.random().toString(16).slice(2, 6);
    const payload = { n: f.name.trim(), id, tier: f.tier, apis: 0, env: f.env, status: 'pending', since: 'Jun 2026', admin: f.admin.trim() };
    setCreateErr(''); setCreating(true);
    try {
      const created = await createTenantApi(payload);
      onCreate(created);
      window.toast && window.toast.success('Tenant created', f.name.trim() + ' · portal invite sent to ' + f.admin.trim());
      onClose();
    } catch (err) {
      setCreating(false);
      const msg = (err && err.message) || 'Unable to create tenant. Please try again.';
      setCreateErr(msg);
      window.toast && window.toast.error('Unable to create tenant', msg);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 540, maxWidth: '100%', boxShadow: '0 30px 80px rgba(12,25,49,.35)', fontFamily: 'var(--font-ui)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Onboard new tenant</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>Create an organization workspace for the Customer Portal</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)', padding: 6 }}><Icon name="x" size={18}/></button>
        </div>
        <div style={{ padding: 22, display: 'grid', gap: 16 }}>
          <div>
            <label style={lab}>Organization name *</label>
            <input maxLength={NAME_MAX} style={{ ...inp, borderColor: (nameTooLong || (tried && f.name.trim().length < 2)) ? 'var(--danger)' : 'var(--ink-300)' }} value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Horizon Pay"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, gap: 8 }}>
              {nameTooLong
                ? <div style={{ fontSize: 11, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> Organization name must be 500 characters or fewer.</div>
                : (tried && f.name.trim().length < 2)
                  ? <div style={{ fontSize: 11, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> Organization name is required.</div>
                  : f.name.trim().length > 1
                    ? <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Tenant ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--appro-blue)' }}>org_{slug || 'tenant'}_••••</span></div>
                    : <span/>}
              <div style={{ fontSize: 11, color: f.name.length > NAME_MAX - 50 ? 'var(--danger)' : 'var(--ink-400)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{f.name.length}/{NAME_MAX}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={lab}>Primary admin name</label><input style={inp} value={f.adminName} onChange={e => set('adminName', e.target.value)} placeholder="e.g. Sara Khan"/></div>
            <div>
              <label style={lab}>Primary admin email *</label>
              <input style={{ ...inp, borderColor: (f.admin && !emailOk) || (tried && !f.admin.trim()) ? 'var(--danger)' : 'var(--ink-300)' }} value={f.admin} onChange={e => set('admin', e.target.value)} placeholder="admin@company.ae"/>
              {(tried && !f.admin.trim())
                ? <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> Primary admin email is required.</div>
                : (f.admin && !emailOk) && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> Enter a valid email.</div>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={lab}>Plan tier</label><select style={inp} value={f.tier} onChange={e => set('tier', e.target.value)}>{['Sandbox','Growth','Scale','Enterprise'].map(o => <option key={o}>{o}</option>)}</select></div>
            <div><label style={lab}>Default environment</label><select style={inp} value={f.env} onChange={e => set('env', e.target.value)}><option value="sandbox">Sandbox</option><option value="production">Production</option></select></div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1px solid ' + (inviteErr && !f.invite ? 'var(--danger)' : 'var(--ink-200)'), borderRadius: 10, cursor: 'pointer', background: f.invite ? 'var(--appro-blue-50)' : (inviteErr ? 'var(--danger-tint)' : '#fff') }}>
              <input type="checkbox" checked={f.invite} onChange={e => { set('invite', e.target.checked); if (e.target.checked) setInviteErr(false); }} style={{ marginTop: 2 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>Send portal invite <span style={{ color: 'var(--danger)' }}>*</span></div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Email the primary admin a link to set their password and sign in to the Customer Portal.</div>
              </div>
            </label>
            {inviteErr && !f.invite && <div style={{ fontSize: 11.5, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><Icon name="alert" size={13}/> Please tick “Send portal invite” to give the tenant access to the Customer Portal.</div>}
          </div>
        </div>
        {createErr && (
          <div style={{ margin: '0 22px', padding: '12px 14px', background: 'var(--danger-tint)', border: '1px solid rgba(229,72,77,.35)', borderRadius: 10, display: 'flex', gap: 10 }}>
            <Icon name="alert" size={16}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0C1931' }}>Couldn't create tenant</div>
              <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>{createErr}</div>
            </div>
          </div>
        )}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--ink-50)' }}>
          <Btn variant="secondary" onClick={onClose} disabled={creating}>Cancel</Btn>
          <Btn variant="primary" icon={creating ? null : 'check'} disabled={creating} onClick={submit}>{creating ? 'Creating…' : (createErr ? 'Retry' : 'Create tenant')}</Btn>
        </div>
      </div>
    </div>
  );
}

window.AdminTenants = AdminTenants;

function AdminAudit() {
  const rows = [
    { t: '14:22:08', actor: 'Rana Adel', action: 'api.published', target: 'email-verification v1.3', ip: '52.14.88.4' },
    { t: '13:50:11', actor: 'System', action: 'request.received', target: 'org_nuqud → aecb', ip: '—' },
    { t: '11:02:55', actor: 'Karim H.', action: 'api.status_changed', target: 'income-verify → review', ip: '3.28.142.9' },
    { t: '09:41:20', actor: 'Rana Adel', action: 'request.approved', target: 'org_marble → efr', ip: '52.14.88.4' },
    { t: 'Yesterday', actor: 'Rana Adel', action: 'api.deprecated', target: 'statements v1.0', ip: '52.14.88.4' },
    { t: 'Yesterday', actor: 'System', action: 'tenant.suspended', target: 'org_cedar_19ee', ip: '—' },
  ];
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Audit log</div>
          <Btn variant="secondary" size="sm" icon="external" onClick={() => window.toast && window.toast.success('Export started', 'Immutable audit log (CSV) will download shortly.')}>Export</Btn>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['Time','Actor','Action','Target','Source IP'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-ui)' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                <td style={{ padding: '11px 20px', color: 'var(--ink-500)' }}>{r.t}</td>
                <td style={{ padding: '11px 20px', color: 'var(--ink-800)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>{r.actor}</td>
                <td style={{ padding: '11px 20px', color: 'var(--appro-blue)' }}>{r.action}</td>
                <td style={{ padding: '11px 20px', color: 'var(--ink-700)' }}>{r.target}</td>
                <td style={{ padding: '11px 20px', color: 'var(--ink-500)' }}>{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminSettings({ onReset }) {
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionHeader title="Marketplace policy" subtitle="Applies to every API admission"/>
          <div style={{ display: 'grid', gap: 14, fontSize: 13 }}>
            {[
              { t: 'Require security review before live', on: true },
              { t: 'Require UAE data-residency assessment', on: true },
              { t: 'Auto-approve sandbox access requests', on: true },
              { t: 'Manual approval for production access', on: true },
              { t: 'Require OpenAPI 3.1 spec', on: true },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1, color: 'var(--ink-800)', fontWeight: 500 }}>{r.t}</div>
                <input type="checkbox" className="toggle" defaultChecked={r.on}/>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Catalog data" subtitle="Admin-published APIs are stored locally and shared with the customer portal"/>
          <div style={{ fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.6, marginBottom: 14 }}>
            APIs you publish from this console are written to a shared catalog store and appear instantly in the Customer Portal's API Catalog. Use reset to clear locally-published APIs and restore the seeded set.
          </div>
          <Btn variant="danger" icon="trash" onClick={onReset}>Reset published catalog</Btn>
        </Card>
      </div>
    </div>
  );
}

window.AdminRequests = AdminRequests;
window.AdminTenants = AdminTenants;
window.AdminAudit = AdminAudit;
window.AdminSettings = AdminSettings;
