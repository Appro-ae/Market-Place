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

// Cross-portal access-request store (shared with the Customer Portal via same-origin localStorage).
const REQ_KEY = 'appro.accessRequests';
const SEED_REQ_IDS = new Set(SEED_REQUESTS.map(r => r.id));
function loadLiveRequests() { try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]'); } catch (e) { return []; } }
function loadRequests() { return [...loadLiveRequests(), ...SEED_REQUESTS]; }        // tenant requests first, then seed
function persistLiveRequests(all) { localStorage.setItem(REQ_KEY, JSON.stringify(all.filter(r => !SEED_REQ_IDS.has(r.id)))); }

const ADMIN_SCREENS = ['dashboard','tenant-management','product-setup','billing','subscriptions','user-roles'];
function AdminApp({ onLogout }) {
  const [screen, setScreen] = useState(() => { const s = localStorage.getItem('admin.screen') || 'dashboard'; return ADMIN_SCREENS.includes(s) ? s : 'dashboard'; });
  const [published, setPublished] = useState(loadPublished);
  const [requests, setRequests] = useState(loadRequests);
  // Global environment scope (GAS-561 AC3): lifted from the topbar so screens can read it,
  // mirroring the customer portal's portal.env pattern.
  const [env, setEnv] = useState(() => localStorage.getItem('admin.env') || 'sandbox');
  useEffect(() => { localStorage.setItem('admin.env', env); }, [env]);
  useEffect(() => { localStorage.setItem('admin.screen', screen); }, [screen]);

  // Live sync: pick up new tenant requests from the Customer Portal (fires across tabs),
  // and re-read when opening the Access Requests screen (same-tab changes).
  useEffect(() => {
    const onStore = (e) => { if (!e || e.key === REQ_KEY || e.key === null) setRequests(loadRequests()); };
    window.addEventListener('storage', onStore);
    return () => window.removeEventListener('storage', onStore);
  }, []);
  useEffect(() => { if (screen === 'requests') setRequests(loadRequests()); }, [screen]);

  // Cross-module navigation from the iframe apps (e.g. Subscription Management "Customize" -> Billing).
  useEffect(() => {
    const onMsg = (e) => { const d = e && e.data; if (d && d.type === 'appro:navigate' && typeof d.to === 'string') setScreen(d.to); };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const allApis = [...published.map(p => ({ ...p, subs: p.subs || 0 })), ...SEED_APIS];
  const pendingReqs = requests.filter(r => r.status === 'pending').length;
  const counts = { 'tenant-management': 6, 'user-roles': 5, 'requests': pendingReqs };

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
  const setReqStatus = (r, status) => setRequests(rs => { const next = rs.map(x => x.id === r.id ? { ...x, status } : x); persistLiveRequests(next); return next; });
  const onApprove = (r) => {
    setReqStatus(r, 'approved');
    // Approval makes the tenant eligible; they complete the subscription from their portal
    // (the "Subscribe" button turns green there via the shared request store).
    window.toast.success('Request approved', r.tenant + ' → ' + r.api + ' can now complete their subscription.');
  };
  const onReject = (r) => { setReqStatus(r, 'rejected'); window.toast.error('Request rejected', r.tenant + ' → ' + r.api + ' was declined.'); };
  const onReset = () => { persist([]); window.toast.info('Catalog reset', 'Locally-published APIs cleared; seeded set restored.'); };

  let body, title;
  if (screen === 'dashboard') { title = 'Dashboard'; body = <AdminDashboard env={env} requests={requests} goTo={setScreen}/>; }
  else if (screen === 'tenant-management') { title = 'Tenant Management'; body = <TenantManagement/>; }
  else if (screen === 'product-setup') { title = 'Product Setup'; body = <ProductSetup/>; }
  else if (screen === 'billing') { title = 'Billing Management'; body = <AdminBilling/>; }
  else if (screen === 'subscriptions') { title = 'Subscription Management'; body = <SubscriptionManagement/>; }
  else if (screen === 'requests') { title = 'Access Requests'; body = <AdminRequests requests={requests} onApprove={onApprove} onReject={onReject}/>; }
  else if (screen === 'usage') { title = 'Usage & Analytics'; body = <AdminUsageAnalytics/>; }
  else if (screen === 'logs') { title = 'Request Logs'; body = <AdminRequestLogs/>; }
  else if (screen === 'user-roles') { title = 'User Role Management'; body = <UserRoleManagement/>; }

  return (
    <div className="layout">
      <ToastHost/>
      <AdminTweaks/>
      <AdminSidebar screen={screen} onNav={setScreen} counts={counts} onLogout={onLogout}/>
      <main style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar title={title} breadcrumb={title} env={env} onEnv={setEnv}/>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>{body}</div>
      </main>
    </div>
  );
}
function AdminRoot() {
  const [authed, setAuthed] = useState(() => {
    const flag = localStorage.getItem('admin.authed') === '1';
    // With a real backend, require an actual token — a stale flag from a
    // fallback login (no token) must not grant access, or data would show mock.
    if (window.approApi && window.approApi.enabled()) return flag && !!window.approApi.token();
    return flag;
  });
  // Account-activation link (.../activate?token=) opens the set-password screen regardless of any existing session.
  const activating = (() => { try { const p = new URLSearchParams(window.location.search); return p.has('activate') || p.has('token'); } catch (e) { return false; } })();
  if (activating) return <><ToastHost/><LoginScreen variant="admin" onLogin={() => { localStorage.setItem('admin.authed', '1'); setAuthed(true); }}/></>;
  if (!authed) return <><ToastHost/><LoginScreen variant="admin" onLogin={() => { localStorage.setItem('admin.authed', '1'); setAuthed(true); }}/></>;
  return <AdminApp onLogout={() => { localStorage.removeItem('admin.authed'); window.approApi && window.approApi.logout(); setAuthed(false); }}/>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<AdminRoot/>);
