// Admin — Billing Management + Subscription Management.
// These mount the standalone modules (attached design) in a full-height iframe so the
// governance apps run exactly as designed, inside the Appro admin shell.
const { useRef: useMR, useEffect: useME } = React;

function ModuleFrame({ src, title }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F4F7FC' }}>
      <iframe src={src} title={title} style={{ width: '100%', height: '100%', border: 0, display: 'block' }}/>
    </div>
  );
}

function AdminBilling() {
  return <ModuleFrame src="modules/BillingManagement.module.html?v=13" title="Billing Management"/>;
}
function SubscriptionManagement() {
  return <ModuleFrame src="modules/SubscriptionManagement.module.html?v=14" title="Subscription Management"/>;
}

window.AdminBilling = AdminBilling;
window.SubscriptionManagement = SubscriptionManagement;
