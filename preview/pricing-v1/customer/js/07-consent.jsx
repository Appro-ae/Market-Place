// Consent management — view & manage end-user data-sharing consents
function ConsentManagement({ env }) {
  const { useState } = React;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [revoking, setRevoking] = useState(null);
  const [overrides, setOverrides] = useState({}); // id -> 'revoked'

  const seed = [
    { id: 'cns_9f3a21', subject: 'Sara Al Mansoori', ref: '784-1990-1234567-1', product: 'Credit Score (Individual)', scope: 'credit.score.ind', channel: 'UAE Pass', granted: '2026-06-02', expires: '2026-12-02', status: 'active' },
    { id: 'cns_8c1b44', subject: 'Marble Trading LLC', ref: 'CN-1042887', product: 'Credit Full Report (Company)', scope: 'credit.full.co', channel: 'Authorized signatory', granted: '2026-05-21', expires: '2026-11-21', status: 'active' },
    { id: 'cns_7a0e90', subject: 'Yusuf Rahman', ref: '784-1985-7654321-9', product: 'MOHRE Income Verification', scope: 'mohre.income', channel: 'UAE Pass', granted: '2026-06-15', expires: '2026-07-15', status: 'active' },
    { id: 'cns_6b22f1', subject: 'Aisha Khalid', ref: '784-1992-2233445-6', product: 'ID Document Data Extraction', scope: 'iddoc.extract', channel: 'In-app', granted: '2026-04-10', expires: '2026-05-10', status: 'expired' },
    { id: 'cns_5d77ac', subject: 'Omar Siddiqui', ref: '784-1988-9988776-2', product: 'Identity Verification', scope: 'identity.verify', channel: 'UAE Pass', granted: '2026-03-28', expires: '2026-09-28', status: 'revoked' },
    { id: 'cns_4e10bd', subject: 'Falcon Logistics FZ', ref: 'CN-2298401', product: 'Credit Analytics Report (Company)', scope: 'credit.analytics.co', channel: 'Authorized signatory', granted: '2026-06-18', expires: '2026-12-18', status: 'active' },
  ];
  const rows = seed.map(r => overrides[r.id] ? { ...r, status: overrides[r.id] } : r);

  const counts = {
    active: rows.filter(r => r.status === 'active').length,
    expiring: rows.filter(r => r.status === 'active' && (new Date(r.expires) - new Date('2026-06-22')) / 86400000 <= 30).length,
    expired: rows.filter(r => r.status === 'expired').length,
    revoked: rows.filter(r => r.status === 'revoked').length,
  };
  const filtered = rows.filter(r => (filter === 'all' || r.status === filter) && (r.subject.toLowerCase().includes(q.toLowerCase()) || r.ref.toLowerCase().includes(q.toLowerCase()) || r.product.toLowerCase().includes(q.toLowerCase())));

  const pill = { active: 'active', expired: 'pending', revoked: 'revoked' };
  const lbl = { active: 'Active', expired: 'Expired', revoked: 'Revoked' };

  const doRevoke = () => {
    const r = revoking; setRevoking(null);
    setOverrides(o => ({ ...o, [r.id]: 'revoked' }));
    window.toast && window.toast.success('Consent revoked', r.subject + ' · ' + r.product + ' can no longer be queried.');
  };

  const kpis = [
    { l: 'Active consents', v: counts.active, c: 'var(--success)' },
    { l: 'Expiring ≤ 30 days', v: counts.expiring, c: 'var(--warning)' },
    { l: 'Expired', v: counts.expired, c: 'var(--ink-500)' },
    { l: 'Revoked', v: counts.revoked, c: 'var(--danger)' },
  ];

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        {kpis.map(k => (
          <Card key={k.l} padding={18}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{k.v}</div>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: k.c, marginTop: 12, opacity: .85 }}/>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Customer consents</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>End-user data-sharing consents collected in <b style={{ color: 'var(--ink-700)' }}>{env}</b> · revoke at any time.</div>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-100)', padding: '8px 12px', borderRadius: 8, minWidth: 220 }}>
            <Icon name="search" size={14}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search subject, ID, product…" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'var(--font-ui)' }}/>
          </div>
          <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 8, padding: 3, fontSize: 12, fontWeight: 600 }}>
            {['all','active','expired','revoked'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ background: filter===s ? '#fff' : 'transparent', color: filter===s ? 'var(--appro-blue)' : 'var(--ink-500)', border: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-ui)', boxShadow: filter===s ? '0 1px 2px rgba(0,0,0,.06)' : 'none' }}>{s}</button>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['Subject','Consent ID','Product / scope','Channel','Granted','Expires','Status',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-500)' }}>No consents match.</td></tr> : filtered.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{r.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{r.ref}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--appro-blue)' }}>{r.id}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: 'var(--ink-800)', fontWeight: 600 }}>{r.product}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{r.scope}</div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-600)' }}>{r.channel}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{r.granted}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{r.expires}</td>
                <td style={{ padding: '12px 16px' }}><StatusPill kind={pill[r.status]}>{lbl[r.status]}</StatusPill></td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {r.status === 'active'
                    ? <Btn variant="secondary" size="sm" onClick={() => setRevoking(r)} style={{ color: 'var(--danger)' }}>Revoke</Btn>
                    : <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', fontSize: 11.5, color: 'var(--ink-500)', borderTop: '1px solid var(--ink-100)' }}>
          Consents are captured per UAE data-sharing rules. Revoking is immediate and audited.
        </div>
      </Card>

      {revoking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setRevoking(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 460, maxWidth: '100%', boxShadow: '0 30px 80px rgba(12,25,49,.35)', fontFamily: 'var(--font-ui)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Revoke consent?</div>
              <button onClick={() => setRevoking(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)', padding: 6 }}><Icon name="x" size={18}/></button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--warning-tint)', border: '1px solid rgba(235,190,0,.4)', marginBottom: 16 }}>
                <span style={{ color: '#8a6c00', flexShrink: 0, marginTop: 1 }}><Icon name="alert" size={15}/></span>
                <div style={{ fontSize: 12, color: '#7a5e00', lineHeight: 1.5 }}>Revoking immediately blocks any further queries for this subject under this product. This action is audited and cannot be undone.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 8, fontSize: 12.5 }}>
                <span style={{ color: 'var(--ink-500)' }}>Subject</span><span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{revoking.subject}</span>
                <span style={{ color: 'var(--ink-500)' }}>Product</span><span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{revoking.product}</span>
                <span style={{ color: 'var(--ink-500)' }}>Consent ID</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--appro-blue)' }}>{revoking.id}</span>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--ink-50)' }}>
              <Btn variant="secondary" onClick={() => setRevoking(null)}>Cancel</Btn>
              <Btn variant="danger" icon="trash" onClick={doRevoke}>Revoke consent</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ConsentManagement });
