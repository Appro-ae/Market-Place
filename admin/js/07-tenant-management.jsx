// Appro Admin Portal — Tenant Management screen
const { useState: useTMState } = React;

const TM_SEED = [
  { name: 'First Abu Dhabi Bank', id: 'TEN-1003', plan: 'Enterprise', status: 'active', products: 8, spend: 2100000 },
  { name: 'Reem Finance', id: 'TEN-1001', plan: 'Enterprise', status: 'active', products: 6, spend: 1450000 },
  { name: 'Abu Dhabi Islamic Bank', id: 'TEN-1002', plan: 'Enterprise', status: 'active', products: 5, spend: 980000 },
  { name: 'Citi NA UAE', id: 'TEN-1006', plan: 'Enterprise', status: 'active', products: 4, spend: 760000 },
  { name: 'MNT-Halan', id: 'TEN-1004', plan: 'Growth', status: 'trial', products: 2, spend: null },
  { name: 'Emirates Investment Bank', id: 'TEN-1005', plan: 'Standard', status: 'suspended', products: 3, spend: 220000 },
];

const TM_STATUS = {
  active: { label: 'Active', color: 'var(--success)', bg: 'var(--success-tint)' },
  trial: { label: 'Trial', color: '#B7860B', bg: 'var(--warning-tint)' },
  suspended: { label: 'Suspended', color: 'var(--danger)', bg: 'var(--danger-tint)' },
};

function tmMoney(n) { return 'AED ' + n.toLocaleString('en-US'); }

function TMStatCard({ label, value, foot, dot }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 18, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 2px rgba(12,25,49,.04)' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 7 }}>
        {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }}/>}{foot}
      </div>
    </div>
  );
}

function TenantManagement() {
  const [tenants, setTenants] = useTMState(TM_SEED);
  React.useEffect(() => {
    if (window.approApi && window.approApi.enabled()) {
      window.approApi.tenants().then(rows => setTenants(rows.map(t => {
        const status = (t.status || '').toLowerCase();
        return { name: t.name, id: t.id, plan: t.plan, status, products: t.products || 0, spend: status === 'trial' ? null : t.annual_spend };
      }))).catch(() => {});
    }
  }, []);
  const [q, setQ] = useTMState('');
  const [filter, setFilter] = useTMState('all');
  const [show, setShow] = useTMState(false);

  const total = tenants.length;
  const active = tenants.filter(t => t.status === 'active').length;
  const trial = tenants.filter(t => t.status === 'trial').length;
  const acv = tenants.reduce((s, t) => s + (t.spend || 0), 0);
  const acvM = (acv / 1000000).toFixed(2);

  const rows = tenants.filter(t =>
    (filter === 'all' || t.status === filter) &&
    (t.name.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase()))
  );

  const onCreate = (t) => {
    setTenants(list => [t, ...list]);
    window.toast && window.toast.success('Tenant added', t.name + ' (' + t.id + ') onboarded to the platform.');
  };

  const filters = [['all','All'],['active','Active'],['trial','Trial'],['suspended','Suspended']];
  const th = { textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em' };

  return (
    <div style={{ padding: '32px 36px', background: 'var(--ink-50)', minHeight: '100%' }}>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Tenant Management</h2>
        <div style={{ fontSize: 15, color: 'var(--ink-500)', marginTop: 6 }}>Banks and institutions onboarded to the Appro platform.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.25fr', gap: 18, marginBottom: 26 }}>
        <TMStatCard label="Total tenants" value={total} foot="across all plans"/>
        <TMStatCard label="Active" value={active} foot="live on production" dot="var(--success)"/>
        <TMStatCard label="On trial" value={trial} foot="converting soon" dot="var(--warning)"/>
        <TMStatCard label="Annual contract value" value={'AED ' + acvM + 'M'} foot="committed / year"/>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 14, padding: '0 18px', height: 56 }}>
          <Icon name="search" size={20}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tenants by name or ID…" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 16, fontFamily: 'var(--font-ui)', color: 'var(--ink-800)' }}/>
        </div>
        <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 14, padding: 5 }}>
          {filters.map(([k, lbl]) => {
            const on = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} style={{ background: on ? 'var(--ink-100)' : 'transparent', color: on ? '#0C1931' : 'var(--ink-500)', border: 0, padding: '11px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: on ? 700 : 600, fontFamily: 'var(--font-ui)' }}>{lbl}</button>
            );
          })}
        </div>
        <button onClick={() => setShow(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'var(--appro-blue-600)', color: '#fff', border: 0, borderRadius: 14, padding: '0 24px', height: 56, cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-ui)', boxShadow: '0 8px 20px rgba(37,99,235,.28)' }}>
          <Icon name="plus" size={20}/> Add tenant
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 2px rgba(12,25,49,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid var(--ink-200)' }}>
            <tr>
              <th style={th}>Tenant</th>
              <th style={th}>ID</th>
              <th style={th}>Plan</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Products</th>
              <th style={{ ...th, textAlign: 'right' }}>Annual spend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => {
              const sm = TM_STATUS[t.status];
              return (
                <tr key={t.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 0 }}>
                  <td style={{ padding: '20px 24px', fontSize: 17, fontWeight: 700, color: '#0C1931' }}>{t.name}</td>
                  <td style={{ padding: '20px 24px', fontSize: 15, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{t.id}</td>
                  <td style={{ padding: '20px 24px', fontSize: 16, color: 'var(--ink-700)' }}>{t.plan}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: sm.bg, color: sm.color, fontSize: 14, fontWeight: 700, padding: '6px 13px', borderRadius: 999 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: sm.color }}/>{sm.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: 16, color: 'var(--ink-800)' }}>{t.products}</td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: 16, fontWeight: 600, color: t.spend ? '#0C1931' : 'var(--ink-400)' }}>{t.spend ? tmMoney(t.spend) : 'Trial'}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 15 }}>No tenants match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {show && <TMAddModal onClose={() => setShow(false)} onCreate={onCreate} nextNum={1007}/>}
    </div>
  );
}

function TMAddModal({ onClose, onCreate, nextNum }) {
  const [f, setF] = useTMState({ name: '', plan: 'Standard', status: 'trial', products: 0, spend: '' });
  const [tried, setTried] = useTMState(false);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name.trim().length > 1;
  const inp = { width: '100%', height: 44, padding: '0 14px', border: '1px solid var(--ink-300)', borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lab = { fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 6, display: 'block' };

  const submit = () => {
    setTried(true);
    if (!valid) return;
    onCreate({
      name: f.name.trim(),
      id: 'TEN-' + nextNum,
      plan: f.plan,
      status: f.status,
      products: Number(f.products) || 0,
      spend: f.status === 'trial' ? null : (Number(f.spend) || 0),
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: 520, maxWidth: '100%', boxShadow: '0 30px 80px rgba(12,25,49,.35)', fontFamily: 'var(--font-ui)' }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0C1931' }}>Add tenant</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>Onboard a bank or institution to the Appro platform</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)', padding: 6 }}><Icon name="x" size={20}/></button>
        </div>
        <div style={{ padding: 26, display: 'grid', gap: 18 }}>
          <div>
            <label style={lab}>Tenant name *</label>
            <input style={{ ...inp, borderColor: tried && !valid ? 'var(--danger)' : 'var(--ink-300)' }} value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Mashreq Bank"/>
            {tried && !valid && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>Tenant name is required.</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={lab}>Plan</label><select style={inp} value={f.plan} onChange={e => set('plan', e.target.value)}>{['Standard','Growth','Enterprise'].map(o => <option key={o}>{o}</option>)}</select></div>
            <div><label style={lab}>Status</label><select style={inp} value={f.status} onChange={e => set('status', e.target.value)}><option value="trial">Trial</option><option value="active">Active</option><option value="suspended">Suspended</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={lab}>Products</label><input type="number" min="0" style={inp} value={f.products} onChange={e => set('products', e.target.value)} placeholder="0"/></div>
            <div><label style={lab}>Annual spend (AED)</label><input type="number" min="0" style={{ ...inp, opacity: f.status === 'trial' ? .5 : 1 }} disabled={f.status === 'trial'} value={f.spend} onChange={e => set('spend', e.target.value)} placeholder={f.status === 'trial' ? 'Trial — no spend' : 'e.g. 500000'}/></div>
          </div>
        </div>
        <div style={{ padding: '16px 26px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--ink-50)' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" onClick={submit}>Add tenant</Btn>
        </div>
      </div>
    </div>
  );
}

window.TenantManagement = TenantManagement;
