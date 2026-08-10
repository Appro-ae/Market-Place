// Customer "Subscriptions & Billing" — tenant-scoped view of the shared billing model.
// MYTENANT is the signed-in org (Nuqud Pay / T1). Reuses window.BILLING + shared atoms.
const CB = window.BILLING;
const MYTENANT = 'T1';

function CustomerBilling() {
  const t = CB.state.tenants.find(x => x.id === MYTENANT) || CB.state.tenants[0];
  const rows = CB.deriveTenant(MYTENANT);
  const active = rows.filter(x => x.active);

  // ----- cycle aggregates -----
  const lines = []; let usedSum = 0, commSum = 0; const svcSet = new Set();
  active.forEach(r => {
    svcSet.add(r.svc.id); usedSum += r.usage; if (r.committed) commSum += r.committed;
    lines.push({ item: r.name, sub: r.prod.name + ' · ' + r.pkg.name, usage: r.committed ? CB.fmtInt(r.committed) + ' incl.' : CB.fmtInt(r.usage) + ' used', unit: r.btype === 'Usage band' ? 'tiered' : r.btype === 'On request' ? 'quoted' : CB.fmtUSD(r.unit) + '/unit', amt: r.base });
    if (r.overflowCharge > 0) lines.push({ item: r.name + ' — ' + CB.ovfLabel(r.ovf), sub: 'overflow', usage: r.rebuyBlocks > 0 ? r.rebuyBlocks + ' block(s)' : '+' + CB.fmtInt(r.overflowTxns) + ' req', unit: r.rebuyBlocks > 0 ? 'block price' : CB.fmtUSD(r.pkg.overageRate) + '/req', amt: r.overflowCharge });
    const raw = r.base + r.overflowCharge + r.setup;
    if (r.charge > raw + 0.01) lines.push({ item: r.name + ' — minimum charge', sub: 'floor ' + CB.fmtUSD0(r.minCharge), usage: '—', unit: 'min', amt: r.charge - raw });
  });
  const subtotal = active.reduce((a, r) => a + r.charge, 0), vat = subtotal * 0.05, total = subtotal + vat;
  const TF = [0.82, 0.90, 1.12, 0.95, 1.04, 1.00], M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const vals = TF.map(f => Math.round(subtotal * f)), mx = Math.max(1, ...vals);
  const prev = vals[4] || 1, dp = prev ? Math.round((subtotal - prev) / prev * 100) : 0;
  const methodColor = m => m === 'GET' ? 'var(--success)' : 'var(--appro-blue)';

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 18 }}>Your organization's billing overview. Pricing &amp; packages are configured by Appro.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 18 }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <Card>
              <div><div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink-900)' }}>June 2026 · current cycle</div><div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{t.name} · closes Jun 30 · invoice Jul 3</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 20 }}>
                <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>Running total</div><div style={{ fontSize: 30, fontWeight: 800, color: '#0C1931', marginTop: 6, fontFamily: 'var(--font-display)' }}>{CB.fmtUSD0(subtotal)}</div><div style={{ fontSize: 13, fontWeight: 800, marginTop: 4, color: dp <= 0 ? 'var(--success)' : 'var(--danger)' }}>{dp <= 0 ? '↓ ' : '↑ '}{Math.abs(dp)}% vs May</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>Active plans</div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-800)', marginTop: 8 }}>{active.length}</div><div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{svcSet.size} service(s)</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>Quota used</div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-800)', marginTop: 8 }}>{commSum ? CB.fmtInt(usedSum) + ' / ' + CB.fmtInt(commSum) : CB.fmtInt(usedSum)}</div><div style={{ height: 8, borderRadius: 6, background: 'var(--ink-100)', marginTop: 10, overflow: 'hidden' }}><div style={{ height: '100%', width: (commSum ? Math.min(100, Math.round(usedSum / commSum * 100)) : 0) + '%', background: 'var(--appro-blue)' }}/></div></div>
              </div>
            </Card>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink-900)' }}>Billing trend</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Last 6 cycles · projected period charge</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, marginTop: 16 }}>
                {vals.map((v, i) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}><i style={{ width: '100%', maxWidth: 40, height: Math.round(v / mx * 100) + '%', background: i === 5 ? '#0C1931' : 'var(--appro-blue)', borderRadius: '6px 6px 0 0', minHeight: 3, display: 'block' }} title={CB.fmtUSD0(v)}/><span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{M[i]}</span></div>)}
              </div>
            </Card>
            <Card padding={0}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)' }}><div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Line items</div><div style={{ fontSize: 12, color: 'var(--ink-500)' }}>June 2026</div></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead style={{ background: 'var(--ink-50)' }}><tr>{['Item', 'Usage', 'Unit', 'Amount'].map(h => <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {lines.length ? lines.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '11px 16px' }}><div style={{ fontWeight: 700, color: 'var(--ink-800)' }}>{l.item}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{l.sub}</div></td>
                      <td style={{ padding: '11px 16px', color: 'var(--ink-600)' }}>{l.usage}</td>
                      <td style={{ padding: '11px 16px', color: 'var(--ink-600)' }}>{l.unit}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink-900)' }}>{CB.fmtUSD0(l.amt)}</td>
                    </tr>
                  )) : <tr><td colSpan={4} style={{ padding: 26, textAlign: 'center', color: 'var(--ink-500)' }}>No active plans this cycle.</td></tr>}
                  {lines.length > 0 && <>
                    <tr style={{ background: 'var(--appro-blue-50)' }}><td colSpan={3} style={{ padding: '12px 16px', fontWeight: 800, color: '#0C1931' }}>Subtotal (before 5% VAT)</td><td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{CB.fmtUSD0(subtotal)}</td></tr>
                    <tr><td colSpan={3} style={{ padding: '10px 16px', color: 'var(--ink-500)' }}>VAT (5%)</td><td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{CB.fmtUSD0(vat)}</td></tr>
                    <tr style={{ background: 'var(--appro-blue-50)' }}><td colSpan={3} style={{ padding: '12px 16px', fontWeight: 800, color: '#0C1931' }}>Total due</td><td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{CB.fmtUSD0(total)}</td></tr>
                  </>}
                </tbody>
              </table>
            </Card>
          </div>
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink-900)', marginBottom: 6 }}>Invoices</div>
              {[['Jun 2026', subtotal, false], ['May 2026', vals[4], true], ['Apr 2026', vals[3], true], ['Mar 2026', vals[2], true]].map((iv, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderTop: i ? '1px solid var(--ink-100)' : 0 }}>
                  <div><div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-800)' }}>{iv[0]}</div><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', fontSize: 12.5 }}>{CB.fmtUSD0(iv[1])}</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {iv[2] ? <StatusPill kind="active">Paid</StatusPill> : <StatusPill kind="pending">Pending</StatusPill>}
                    <Btn variant="ghost" size="sm" icon="external" onClick={() => window.toast && window.toast.success('Invoice exported', iv[0] + ' (PDF)')}>Export</Btn>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>

      <Card padding={0} style={{ marginTop: 18 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Consumption &amp; billing parameters</div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>June 2026 · metered against your committed volume · parameters configured by Appro (read-only)</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead style={{ background: 'var(--ink-50)' }}><tr>{['Service', 'Package', 'Billing type', 'Committed', 'Success', 'Failed', 'Unit rate', 'Overage', 'Min charge', 'Period charge'].map(h => <th key={h} style={{ textAlign: ['Committed', 'Success', 'Failed', 'Min charge', 'Period charge'].includes(h) ? 'right' : 'left', padding: '11px 14px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.subId} style={{ borderBottom: '1px solid var(--ink-100)', opacity: r.active ? 1 : .55 }}>
                <td style={{ padding: '12px 14px' }}><div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{r.name}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.prod.name}</div></td>
                <td style={{ padding: '12px 14px', color: 'var(--ink-700)' }}>{r.pkg.name}</td>
                <td style={{ padding: '12px 14px' }}><span style={{ background: 'var(--ink-100)', border: '1px solid var(--ink-200)', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>{r.btype}</span></td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.committed ? CB.fmtInt(r.committed) : '—'}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{CB.fmtInt(r.success)}{r.ovfActive ? <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: r.blocked ? 'var(--danger)' : '#8a6c00', background: r.blocked ? 'var(--danger-tint)' : 'var(--warning-tint)', padding: '1px 6px', borderRadius: 5 }}>{r.blocked ? 'capped' : '+over'}</span> : null}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: r.failed ? 'var(--danger)' : 'var(--ink-500)' }}>{r.failed}</td>
                <td style={{ padding: '12px 14px', color: 'var(--ink-600)' }}>{r.btype === 'Usage band' ? 'tiered' : r.btype === 'On request' ? 'quoted' : CB.fmtUSD(r.unit) + '/unit'}</td>
                <td style={{ padding: '12px 14px', color: 'var(--ink-600)' }}>{r.committed ? CB.ovfLabel(r.ovf) + (r.ovf === 'payg' && r.pkg.overageRate ? ' · ' + CB.fmtUSD(r.pkg.overageRate) + '/req' : '') : '—'}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{r.minCharge ? CB.fmtUSD0(r.minCharge) : '—'}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{CB.fmtUSD0(r.charge)}{r.minApplied ? <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--appro-blue)', background: 'var(--appro-blue-100)', padding: '1px 6px', borderRadius: 5 }}>min</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

window.CustomerBilling = CustomerBilling;
