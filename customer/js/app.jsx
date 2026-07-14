// Appro Customer Portal — app bootstrap (auth gate + screen router + mount).
// Loaded last, after shared atoms and all customer screen modules register.
const { useState, useEffect } = React;

const TWEAKS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "accent": "appro-blue",
  "verification": "incomplete"
}/*EDITMODE-END*/;

function App({ onLogout }) {
  const [screen, setScreen] = useState(() => localStorage.getItem('portal.screen') || 'dashboard');
  const [env, setEnv] = useState(() => localStorage.getItem('portal.env') || 'sandbox');
  const [verification, setVerification] = useState(() => localStorage.getItem('portal.verif') || TWEAKS.verification);
  useEffect(() => { localStorage.setItem('portal.verif', verification); }, [verification]);
  const [api, setApi] = useState(null);
  const [modal, setModal] = useState(null);
  const [subscribeApi, setSubscribeApi] = useState(null);
  const [subscribedIds, setSubscribedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portal.subscribed') || '["email-verification","credit-score-company","credit-full-company","credit-score-individual","id-document-extraction"]'); } catch(e){ return ['email-verification','credit-score-company','credit-full-company','credit-score-individual','id-document-extraction']; }
  });
  useEffect(() => { localStorage.setItem('portal.subscribed', JSON.stringify(subscribedIds)); }, [subscribedIds]);
  const [requestedIds, setRequestedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portal.requested') || '[]'); } catch(e){ return []; }
  });
  useEffect(() => { localStorage.setItem('portal.requested', JSON.stringify(requestedIds)); }, [requestedIds]);
  const [subscribedEnvs, setSubscribedEnvs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portal.subscribedEnvs') || '{}'); } catch(e){ return {}; }
  });
  useEffect(() => { localStorage.setItem('portal.subscribedEnvs', JSON.stringify(subscribedEnvs)); }, [subscribedEnvs]);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweaks] = useState(TWEAKS);

  useEffect(() => { localStorage.setItem('portal.screen', screen); }, [screen]);
  useEffect(() => { localStorage.setItem('portal.env', env); }, [env]);

  // When a real backend is configured, load the tenant's actual subscriptions.
  useEffect(() => {
    if (window.approApi && window.approApi.enabled()) {
      window.approApi.subscriptions().then(rows => {
        setSubscribedIds(rows.filter(s => s.status === 'active').map(s => s.product_id));
        setRequestedIds(rows.filter(s => s.status === 'pending').map(s => s.product_id));
      }).catch(() => {});
    }
  }, []);

  // Reflect Admin approvals/rejections (shared via same-origin localStorage) — live across tabs.
  useEffect(() => {
    const reconcile = () => {
      try {
        const reqs = JSON.parse(localStorage.getItem('appro.accessRequests') || '[]');
        const mine = reqs.filter(r => r.tenantId === 'TEN-1004');
        const approved = mine.filter(r => r.status === 'approved').map(r => r.apiId).filter(Boolean);
        const settled = mine.filter(r => r.status !== 'pending').map(r => r.apiId).filter(Boolean);
        if (approved.length) setSubscribedIds(ids => Array.from(new Set([...ids, ...approved])));
        if (settled.length) setRequestedIds(ids => ids.filter(id => !settled.includes(id)));
      } catch (e) {}
    };
    reconcile();
    const onStore = (e) => { if (!e || e.key === 'appro.accessRequests') reconcile(); };
    window.addEventListener('storage', onStore);
    return () => window.removeEventListener('storage', onStore);
  }, []);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const titles = {
    dashboard: 'Dashboard',
    catalog: 'Product Catalogue',
    apiDetail: 'Product Detail',
    keys: 'API Keys',
    credentials: 'API Credentials',
    allowlist: 'IP Allowlists',
    usage: 'Usage & Analytics',
    logs: 'Request Logs',
    consent: 'Consent',
    billing: 'Subscriptions & Billing',
    requests: 'Access Requests',
    users: 'Team',
    settings: 'Settings',
    verification: 'Verification',
    environments: 'Environments',
  };

  const withSub = (a) => a ? ({ ...a, subscribed: subscribedIds.includes(a.id), requested: requestedIds.includes(a.id) }) : a;
  const openApi = (a) => { setApi(a); setScreen('apiDetail'); };
  const goTo = (s) => { setScreen(s); };
  const onSubscribe = (a) => setSubscribeApi(a);
  const apiOn = () => window.approApi && window.approApi.enabled();
  const onUnsubscribe = (a) => {
    setSubscribedIds(ids => ids.filter(i => i !== a.id));
    if (apiOn()) window.approApi.subscriptions().then(rows => {
      const sub = rows.find(s => s.product_id === a.id);
      if (sub) window.approApi.unsubscribe(sub.id).catch(() => {});
    }).catch(() => {});
    window.toast && window.toast.info('Unsubscribed from ' + a.name, 'Production access has been revoked.');
  };
  const onMigrate = (a) => {
    const v2 = { id: 'documents-v2', name: 'Documents API', v: 'v2.0', status: 'live', cat: 'accounts', desc: 'Async PDF & statement generation with webhook callbacks. Replaces Statements & Documents v1.', owner: 'Retail Banking', auth: 'OAuth 2.0', rate: '200 req/s', subscribed: subscribedIds.includes('documents-v2'), color: 'var(--appro-blue)', cloud: 'aws', region: 'me-central-1', variants: 1 };
    setApi(v2); setScreen('apiDetail');
  };
  const confirmSubscribe = ({ api: a, environments, requested, plan }) => {
    if (requested) {
      setRequestedIds(ids => ids.includes(a.id) ? ids : [...ids, a.id]);
      // Cross-portal: record a pending access request the Admin console can approve.
      try {
        const list = JSON.parse(localStorage.getItem('appro.accessRequests') || '[]');
        const env = (environments && environments.length && environments.some(e => /prod/i.test((e && (e.name || e.id)) || ''))) ? 'production' : 'production';
        list.unshift({ id: 'REQ-' + Date.now(), tenant: 'Nuqud Pay', tenantId: 'TEN-1004', api: a.name, apiId: a.id, env, plan: plan || 'On request', when: 'Just now', status: 'pending' });
        localStorage.setItem('appro.accessRequests', JSON.stringify(list));
      } catch (e) {}
      window.toast && window.toast.success('Price request submitted', 'We\u2019ll prepare a quote for ' + a.name + ' and get back to you.');
      return;
    }
    if (apiOn()) {
      const targetEnv = (environments && environments.length) ? (environments.includes('production') ? 'production' : environments[0]) : 'sandbox';
      window.approApi.subscribe(a.id, targetEnv).catch(() => {});
    }
    setSubscribedIds(ids => ids.includes(a.id) ? ids : [...ids, a.id]);
    if (environments && environments.length) setSubscribedEnvs(m => ({ ...m, [a.id]: environments }));
    window.toast && window.toast.success('Subscribed to ' + a.name, 'Sandbox keys are ready in API Keys.', { action: { label: 'View API Keys', onClick: () => setScreen('keys') } });
  };

  let body;
  if (screen === 'dashboard') body = <Dashboard env={env} goTo={goTo}/>;
  else if (screen === 'catalog') body = <Catalog env={env} openApi={openApi} subscribedIds={subscribedIds} requestedIds={requestedIds} onSubscribe={onSubscribe}/>;
  else if (screen === 'apiDetail' && api) body = <ApiDetail api={withSub(api)} env={env} onBack={() => setScreen('catalog')} onSubscribe={onSubscribe} onUnsubscribe={onUnsubscribe} onMigrate={onMigrate} subscribedEnvs={subscribedEnvs[api.id]}/>;
  else if (screen === 'keys') body = <Keys env={env} setModal={setModal}/>;
  else if (screen === 'credentials') body = <ApiCredentials env={env}/>;
  else if (screen === 'allowlist') body = <Allowlist env={env}/>;
  else if (screen === 'usage') body = <Usage env={env}/>;
  else if (screen === 'logs') body = <Logs env={env}/>;
  else if (screen === 'consent') body = <ConsentManagement env={env}/>;
  else if (screen === 'billing') body = <CustomerBilling/>;
  else if (screen === 'requests') body = <AccessRequests/>;
  else if (screen === 'users') body = <Team/>;
  else if (screen === 'settings') body = <Settings/>;
  else if (screen === 'verification') body = <Verification status={verification} setStatus={setVerification}/>;
  else if (screen === 'environments') body = <Environments env={env}/>;
  else body = <div style={{padding:40,color:'var(--ink-500)'}}>Placeholder — {titles[screen]}</div>;

  // Tweaks — Appro palette
  const accentMap = {
    'appro-blue': '#3B7EF6',
    'appro-navy': '#1A2D52',
    'banking-blue': '#0072BC',
    'appro-deep': '#1D4ED8',
  };
  const accentStyle = { '--appro-blue': accentMap[tweaks.accent] || '#3B7EF6' };

  const updateTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*');
  };

  return (
    <div className="layout" style={accentStyle}>
      <ToastHost/>
      <Sidebar screen={screen === 'apiDetail' ? 'catalog' : screen} onNav={setScreen} env={env} onLogout={onLogout}/>
      <main data-screen-label={titles[screen]}>
        <Topbar title={titles[screen]} subtitle={titles[screen]} env={env} setEnv={setEnv} verification={verification}/>
        {screen !== 'verification' && <VerificationBanner status={verification} goTo={setScreen}/>}
        {body}
      </main>

      {subscribeApi && <SubscribeModal api={subscribeApi} env={env} onClose={() => setSubscribeApi(null)} onConfirm={confirmSubscribe}/>}
      {modal === 'createKey' && <CreateKeyModal env={env} onClose={() => setModal(null)}/>}
      {modal === 'provision' && <ProvisionModal onClose={() => setModal(null)}/>}
      {modal === 'rotateKey' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 480, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0C1931', marginBottom: 8 }}>Rotate this key?</div>
            <div style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 16 }}>A new secret will be issued. The old secret stays valid for 24 hours so you can deploy the new one without downtime, then it is revoked automatically.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn variant="primary" icon="refresh" onClick={() => { setModal(null); window.toast && window.toast.success('Key rotation started', 'A new secret was issued. The old key stays valid for 24 hours.'); }}>Rotate now</Btn>
            </div>
          </div>
        </div>
      )}

      {tweaksOpen && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, width: 280, background: '#fff', borderRadius: 12, boxShadow: '0 20px 50px rgba(12,25,49,.2)', border: '1px solid var(--ink-200)', zIndex: 200, fontFamily: 'var(--font-ui)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>Tweaks</div>
            <button onClick={() => setTweaksOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)' }}><Icon name="x" size={16}/></button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Accent color</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 16 }}>
              {Object.entries(accentMap).map(([k, c]) => (
                <button key={k} onClick={() => updateTweak('accent', k)} style={{
                  aspectRatio: '1', borderRadius: 8, background: c, cursor: 'pointer',
                  border: tweaks.accent === k ? '3px solid #0C1931' : '1px solid var(--ink-200)',
                }}/>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Jump to screen</div>
            <select value={screen} onChange={e => setScreen(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12 }}>
              {Object.entries(titles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <Btn size="sm" variant="secondary" onClick={() => setModal('createKey')}>Show Create-Key</Btn>
              <Btn size="sm" variant="secondary" onClick={() => setModal('rotateKey')}>Rotate</Btn>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 16, marginBottom: 8 }}>Verification status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {['incomplete','review','verified'].map(v => (
                <button key={v} onClick={() => { setVerification(v); updateTweak('verification', v); }} style={{
                  padding: '6px 4px', fontSize: 10, fontWeight: 700, borderRadius: 6,
                  border: verification === v ? '2px solid var(--appro-blue)' : '1px solid var(--ink-200)',
                  background: verification === v ? 'var(--appro-blue-50)' : '#fff',
                  cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-ui)',
                }}>{v}</button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <Btn size="sm" variant="secondary" onClick={() => setModal('provision')} style={{ width: '100%', justifyContent: 'center' }}>Show Provision modal</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Root() {
  const [authed, setAuthed] = useState(() => {
    const flag = localStorage.getItem('portal.authed') === '1';
    // With a real backend, require an actual token — a stale flag from a
    // fallback login (no token) must not grant access, or data would show mock.
    if (window.approApi && window.approApi.enabled()) return flag && !!window.approApi.token();
    return flag;
  });
  if (!authed) return <><ToastHost/><LoginScreen variant="customer" onLogin={() => { localStorage.setItem('portal.authed', '1'); setAuthed(true); }}/></>;
  return <App onLogout={() => { localStorage.removeItem('portal.authed'); window.approApi && window.approApi.logout(); setAuthed(false); }}/>;
}
window.DEMO_EMPTY = true;
ReactDOM.createRoot(document.getElementById('root')).render(<Root/>);
