// Appro Admin Console — app bootstrap (auth gate + screen router + mount).
// Loaded last, after all component modules have registered on window.
const { useState, useEffect } = React;
const { SEED_APIS, loadPublished, savePublished } = window.ADMIN;

const SEED_REQUESTS = [
  { id: 'REQ-5821', tenant: 'Nuqud Pay', api: 'AECB Credit Report', env: 'production', plan: 'Growth', when: '2 h ago', status: 'pending' },
  { id: 'REQ-5820', tenant: 'Falcon Lending', api: 'EFR', env: 'sandbox', plan: 'Sandbox', when: '5 h ago', status: 'pending' },
  { id: 'REQ-5817', tenant: 'Oasis Wallet', api: 'Email Verification', env: 'production', plan: 'Growth', when: 'Yesterday', status: 'pending' },
  { id: 'REQ-5810', tenant: 'Marble Bank', api: 'Income Verification', env: 'sandbox', plan: 'Enterprise', when: '2 days ago', status: 'approved' },
];

const ADMIN_SCREENS = ['tenant-management','product-setup','billing','subscriptions','user-roles'];
function AdminApp({ onLogout }) {
  const [screen, setScreen] = useState(() => { const s = localStorage.getItem('admin.screen') || 'tenant-management'; return ADMIN_SCREENS.includes(s) ? s : 'tenant-management'; });
  const [published, setPublished] = useState(loadPublished);
  const [requests, setRequests] = useState(SEED_REQUESTS);
  useEffect(() => { localStorage.setItem('admin.screen', screen); }, [screen]);

  const allApis = [...published.map(p => ({ ...p, subs: p.subs || 0 })), ...SEED_APIS];
  const pendingReqs = requests.filter(r => r.status === 'pending').length;
  const counts = { 'tenant-management': 6, 'user-roles': 5 };

  const persist = (list) => { setPublished(list); savePublished(list); };

  const handlePublish = (record) => {
    const list = [{ ...record }, ...published.filter(p => p.id !== record.id)];
    persist(list);
    setScreen('product-setup');
    if (record.status === 'live') window.toast.success('Published to catalog', record.name + ' is now live in the Customer Portal.', { action: { label: 'Open Customer Catalog', onClick: () => window.open('../customer/', '_blank') } });
    else window.toast.info('Sent to review', record.name + ' is queued for security & admission sign-off.');
  };
  const onPromote = (a, to) => {
    if (a.published) {
      const next = to === 'review' ? 'review' : 'live';
      persist(published.map(p => p.id === a.id ? { ...p, status: next } : p));
    }
    if (to === 'review') window.toast.info('Moved to review', a.name + ' is now in the review queue.');
    else window.toast.success('Published', a.name + ' is live in the Customer Portal catalog.');
  };
  const onDeprecate = (a) => {
    if (a.published) persist(published.map(p => p.id === a.id ? { ...p, status: 'deprecated' } : p));
    window.toast.warning('API deprecated', a.name + ' is marked deprecated; existing subscribers keep access until sunset.');
  };
  const onApprove = (r) => { setRequests(rs => rs.map(x => x.id === r.id ? { ...x, status: 'approved' } : x)); window.toast.success('Request approved', r.tenant + ' → ' + r.api + ' (' + r.env + ') granted.'); };
  const onReject = (r) => { setRequests(rs => rs.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x)); window.toast.error('Request rejected', r.tenant + ' → ' + r.api + ' was declined.'); };
  const onReset = () => { persist([]); window.toast.info('Catalog reset', 'Locally-published APIs cleared; seeded set restored.'); };

  let body, title;
  if (screen === 'tenant-management') { title = 'Tenant Management'; body = <TenantManagement/>; }
  else if (screen === 'product-setup') { title = 'Product Setup'; body = <ProductSetup/>; }
  else if (screen === 'billing') { title = 'Billing Management'; body = <AdminBilling/>; }
  else if (screen === 'subscriptions') { title = 'Subscription Management'; body = <SubscriptionManagement/>; }
  else if (screen === 'usage') { title = 'Usage & Analytics'; body = <AdminUsageAnalytics/>; }
  else if (screen === 'logs') { title = 'Request Logs'; body = <AdminRequestLogs/>; }
  else if (screen === 'user-roles') { title = 'User Role Management'; body = <UserRoleManagement/>; }

  return (
    <div className="layout">
      <ToastHost/>
      <AdminTweaks/>
      <AdminSidebar screen={screen} onNav={setScreen} counts={counts} onLogout={onLogout}/>
      <main style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar title={title} breadcrumb={title}/>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>{body}</div>
      </main>
    </div>
  );
}
function AdminRoot() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('admin.authed') === '1');
  if (!authed) return <><ToastHost/><LoginScreen variant="admin" onLogin={() => { localStorage.setItem('admin.authed', '1'); setAuthed(true); }}/></>;
  return <AdminApp onLogout={() => { localStorage.removeItem('admin.authed'); setAuthed(false); }}/>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<AdminRoot/>);
