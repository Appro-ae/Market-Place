// Appro Customer Portal — Usage & commitment alert banner (IM005).
// Fires ONLY for `Committed volume` packages: usedPercent = billable usage ÷ committed volume.
// Usage band / Pay-as-you-go / On request carry no commitment, so there is no denominator and
// NO alert is shown — never a 0% or "N/A" banner (no fabricated data).
// Thresholds 80 / 90 / 100. Warning at 80/90, danger at 100+ (states the overflow mode).
// Demo override for design review: ?alert=80 | 90 | 100 | none
const UA_B = window.BILLING;
const UA_TENANT = 'T1';

function uaParam() {
  try { return new URLSearchParams(window.location.search).get('alert'); } catch (e) { return null; }
}

// Returns [{ row, pct, threshold }] for every committed-volume package that has crossed a threshold.
function computeUsageAlerts() {
  const force = uaParam();
  if (force === 'none') return [];                       // simulate a tenant with no committed-volume package
  let rows = [];
  try { rows = UA_B.deriveTenant(UA_TENANT).filter(r => r.active); } catch (e) { return []; }

  // AC — committed volume ONLY. Everything else has no ceiling, so no threshold can exist.
  const committed = rows.filter(r => r.btype === 'Committed volume' && r.committed > 0);
  if (!committed.length) return [];

  return committed.map(r => {
    let pct = Math.round((r.usage / r.committed) * 100);
    if (force === '80') pct = 84; else if (force === '90') pct = 93; else if (force === '100') pct = 118;
    let threshold = null;
    if (pct >= 100) threshold = 100; else if (pct >= 90) threshold = 90; else if (pct >= 80) threshold = 80;
    return { row: r, pct, threshold };
  }).filter(x => x.threshold !== null)
    .sort((a, b) => b.threshold - a.threshold || b.pct - a.pct);
}

function UsageAlertBanner({ goTo }) {
  const alerts = computeUsageAlerts();
  if (!alerts.length) return null;                        // no committed volume → nothing rendered at all

  const top = alerts[0];
  const r = top.row;
  const breached = top.threshold === 100;
  const others = alerts.length - 1;

  const tone = breached
    ? { bg: '#FEE2E2', border: '#FCA5A5', ink: '#991B1B', dot: '#DC2626' }
    : { bg: '#FEF3C7', border: '#FDE68A', ink: '#92400E', dot: '#D97706' };

  const ovf = (typeof UA_B.ovfLabel === 'function') ? UA_B.ovfLabel(r.ovf) : 'your plan';
  const fmt = (n) => (typeof UA_B.fmtInt === 'function') ? UA_B.fmtInt(n) : String(n);

  return (
    <div style={{
      margin: '0 28px 18px', background: tone.bg, border: '1px solid ' + tone.border,
      borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
      fontFamily: 'var(--font-ui)'
    }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: tone.dot, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon name={breached ? 'alert' : 'info'} size={13} stroke={2.6} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: tone.ink, marginBottom: 3 }}>
          {breached
            ? 'You’ve reached your committed volume for ' + r.name
            : 'You’ve used ' + top.pct + '% of your committed volume for ' + r.name}
        </div>
        <div style={{ fontSize: 12.5, color: tone.ink, opacity: .92, lineHeight: 1.55 }}>
          {breached
            ? <>Further usage is handled per your plan (<b>{ovf}</b>){r.ovf === 'payg' && r.pkg.overageRate ? <> at {UA_B.fmtUSD(r.pkg.overageRate)}/req</> : null}, so you can keep operating without interruption. <b>{fmt(r.usage)}</b> of <b>{fmt(r.committed)}</b> this cycle.</>
            : <><b>{fmt(r.usage)}</b> of <b>{fmt(r.committed)}</b> committed transactions used this billing cycle.</>}
          {others > 0 && <> · <span style={{ opacity: .8 }}>{others} other committed package{others > 1 ? 's' : ''} also alerting</span></>}
        </div>
      </div>
      {goTo && (
        <button onClick={() => goTo('billing')} style={{
          background: 'transparent', border: '1px solid ' + tone.border, color: tone.ink,
          borderRadius: 8, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)', flexShrink: 0
        }}>View usage</button>
      )}
    </div>
  );
}
window.UsageAlertBanner = UsageAlertBanner;
window.computeUsageAlerts = computeUsageAlerts;
