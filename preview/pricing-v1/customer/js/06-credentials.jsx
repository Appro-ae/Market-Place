// API Credentials screen — list of integrations → provider-specific detail.
// EFR & AECB each expose ONE unified "Edit configuration" form covering every setting.

function ApiCredentials({ env }) {
  const { useState } = React;
  const [active, setActive] = useState(null);

  const integrations = [
    { id: 'efr',  name: 'EFR', full: 'Establishment Financial Report', desc: 'Etihad Credit Bureau establishment financial reports.', color: 'var(--appro-blue)', status: 'Active', user: 'efr.svc••@nuqud.ae', updated: '2026-06-14 09:15 UTC', by: 'admin@nuqud.ae' },
    { id: 'aecb', name: 'AECB', full: 'AECB Credit Report', desc: 'Al Etihad Credit Bureau consumer & commercial scores.', color: 'var(--success)', status: 'Active', user: 'aecb.soap••@nuqud.ae', updated: '2026-05-30 14:02 UTC', by: 'admin@nuqud.ae' },
  ];

  if (active) {
    const it = integrations.find(i => i.id === active);
    return <CredentialDetail env={env} integration={it} onBack={() => setActive(null)}/>;
  }

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ maxWidth: 880 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Connected integrations</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>Manage the service credentials Appro uses to reach each upstream provider in <b style={{ color: 'var(--ink-700)' }}>{env}</b>.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {integrations.map(it => (
            <Card key={it.id} padding={0}>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 11, background: `color-mix(in srgb, ${it.color} 14%, white)`, color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-ui)' }}>{it.name}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>{it.name}</div>
                      <StatusPill kind="active">{it.status}</StatusPill>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>{it.full}</div>
                  </div>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.5, minHeight: 38 }}>{it.desc}</p>
                <div style={{ display: 'grid', gap: 6, fontSize: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-500)' }}>Username</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-800)' }}>{it.user}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-500)' }}>Last updated</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{it.updated}</span>
                  </div>
                </div>
                <Btn variant="primary" icon="keys" onClick={() => setActive(it.id)} style={{ width: '100%', justifyContent: 'center' }}>Manage credentials</Btn>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- display primitives ---------- */
function KVRow({ label, value }) {
  return (
    <>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-700)', wordBreak: 'break-all' }}>{value}</div>
    </>
  );
}
function SecretView({ label, value }) {
  const { useState } = React;
  const [reveal, setReveal] = useState(false);
  return (
    <>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{reveal ? value : '••••••••••••'}</span>
        <button onClick={() => setReveal(r => !r)} title={reveal ? 'Hide' : 'Reveal'} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)' }}><Icon name={reveal ? 'eyeoff' : 'eye'} size={14}/></button>
      </div>
    </>
  );
}
function BoolBadge({ on, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: on ? 'var(--success-tint)' : 'var(--ink-100)', color: on ? 'var(--success)' : 'var(--ink-500)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: on ? 'var(--success)' : 'var(--ink-400)' }}/>{on ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}
function PanelHead({ title, sub }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ---------- default config per provider ---------- */
function defaultConfig(id) {
  if (id === 'aecb') return {
    soapUser: 'aecb.soap@nuqud.ae', soapPass: 'sp-9f2a-8c11-bf33',
    fullUser: 'aecb.full@nuqud.ae', fullPass: 'fr-2d04-8c11-9f2a',
    endpoint: 'https://aecb.uat.gov.ae/services/credit', timeout: '30000',
    keystore: 'AECB_NON_PROD_EIB.pfx', keystorePass: 'aecb-ks-9f2a-bf33',
    ssl: true, proxy: false, proxyHost: '', proxyPort: '',
  };
  return {
    user: 'efr.svc@nuqud.ae', pass: 'r3m-9f2a-8c11-bf33',
    rh: 'https://efr.uat.ecb.gov.ae/rh/v2', pure: 'https://efr.uat.ecb.gov.ae/purelive/v1',
    analyze: 'https://efr.uat.ecb.gov.ae/analyze/custom', account: 'https://efr.uat.ecb.gov.ae/account',
    configure: 'https://efr.uat.ecb.gov.ae/configure', onboard: 'https://efr.uat.ecb.gov.ae/onboard',
    liveness: 'https://efr.uat.ecb.gov.ae/liveness',
    ssl: true, disableHost: false, trustAll: false, jks: true,
    keyStore: 'efr-keystore-uat.jks', trustStore: 'efr-truststore-uat.jks',
    keyStorePass: 'ks-7f2a-9c11-bf33', trustStorePass: 'ts-2d04-8c11-9f2a',
  };
}

function CredentialDetail({ env, integration, onBack }) {
  const { useState } = React;
  const it = integration || { id: 'efr', name: 'EFR', full: 'Establishment Financial Report', color: 'var(--appro-blue)' };
  const [testing, setTesting] = useState(false);
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState(() => defaultConfig(it.id));

  const audit = it.id === 'aecb' ? [
    { d: '2026-05-30 14:02', a: 'Configuration updated', by: 'admin@nuqud.ae' },
    { d: '2026-05-12 10:41', a: 'Full-report credentials updated', by: 'admin@nuqud.ae' },
    { d: '2026-04-01 11:20', a: 'Keystore password updated', by: 'it@nuqud.ae' },
  ] : [
    { d: '2026-06-14 09:15', a: 'Configuration updated', by: 'admin@nuqud.ae' },
    { d: '2026-05-30 14:02', a: 'Trust store password updated', by: 'admin@nuqud.ae' },
    { d: '2026-04-01 11:20', a: 'Service credentials updated', by: 'it@nuqud.ae' },
  ];
  const runTest = () => { setTesting(true); setTimeout(() => { setTesting(false); window.toast && window.toast.success('Connection verified', it.name + ' responded successfully.'); }, 1400); };
  const lastVerified = it.id === 'aecb' ? '2026-06-17 08:48 UTC' : '2026-06-17 09:15 UTC';
  const labelCss = { fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 };

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 0, color: 'var(--ink-500)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>← Back to integrations</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, maxWidth: 760 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${it.color || 'var(--appro-blue)'} 14%, white)`, color: it.color || 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-ui)' }}>{it.name}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>{it.name} credentials</div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{it.full}</div>
        </div>
        <Btn variant="primary" icon="settings" onClick={() => setOpen(true)}>Edit configuration</Btn>
      </div>

      <div style={{ maxWidth: 760, display: 'grid', gap: 16 }}>
        {/* Connection Status */}
        <Card padding={0}>
          <PanelHead title="Connection status"/>
          <div style={{ padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {testing ? (
                  <>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--ink-300)', borderTopColor: 'var(--appro-blue)', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-700)' }}>Verifying…</span>
                  </>
                ) : (
                  <>
                    <span style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--success)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={13} stroke={3.5}/></span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Active</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>·</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-600)' }}>{it.id === 'aecb' ? 'SOAP + mutual TLS' : 'Basic auth + mutual TLS'}</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Last verified: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{lastVerified}</span></div>
            </div>
            <Btn variant="secondary" size="sm" icon="refresh" onClick={runTest}>{testing ? 'Testing…' : 'Test connection'}</Btn>
          </div>
        </Card>

        {it.id === 'aecb' ? (
          <>
            <Card padding={0}>
              <PanelHead title="SOAP credentials" sub={`AECB SOAP score service in ${env}.`}/>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 13, alignItems: 'center' }}>
                <KVRow label="Username" value={cfg.soapUser}/>
                <SecretView label="Password" value={cfg.soapPass}/>
              </div>
            </Card>
            <Card padding={0}>
              <PanelHead title="Full-report credentials" sub="Separate account for retrieving full AECB credit reports."/>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 13, alignItems: 'center' }}>
                <KVRow label="Full-report username" value={cfg.fullUser}/>
                <SecretView label="Full-report password" value={cfg.fullPass}/>
              </div>
            </Card>
            <Card padding={0}>
              <PanelHead title="Connection settings" sub="Endpoint, timeouts, keystore & proxy."/>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 13, alignItems: 'center' }}>
                  <KVRow label="Endpoint" value={cfg.endpoint}/>
                  <KVRow label="Request timeout" value={cfg.timeout + ' ms'}/>
                  <KVRow label="Keystore file" value={cfg.keystore}/>
                  <SecretView label="Keystore password" value={cfg.keystorePass}/>
                </div>
                <div style={{ display: 'grid', gap: 11, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)' }}>
                  <BoolBadge on={cfg.ssl} label="Use SSL"/>
                  <BoolBadge on={cfg.proxy} label="Use proxy"/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 13, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)' }}>
                  <KVRow label="Proxy host" value={cfg.proxyHost || '—'}/>
                  <KVRow label="Proxy port" value={cfg.proxyPort || '—'}/>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card padding={0}>
              <PanelHead title="Service credentials" sub={`Basic-auth service account used to call EFR in ${env}.`}/>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 13, alignItems: 'center' }}>
                <KVRow label="Username" value={cfg.user}/>
                <SecretView label="Password" value={cfg.pass}/>
              </div>
            </Card>
            <Card padding={0}>
              <PanelHead title="Endpoints" sub="Service base paths."/>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 12, alignItems: 'center' }}>
                {[['RH','rh'],['Pure Live','pure'],['Analyze Custom','analyze'],['Account base path','account'],['Configure base path','configure'],['Onboard base path','onboard'],['Liveness base path','liveness']].map(([lbl,k]) => <KVRow key={k} label={lbl} value={cfg[k]}/>)}
              </div>
            </Card>
            <Card padding={0}>
              <PanelHead title="TLS / mutual auth" sub="Certificate trust & key stores."/>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gap: 11 }}>
                  <BoolBadge on={cfg.ssl} label="SSL enabled"/>
                  <BoolBadge on={cfg.disableHost} label="Disable hostname verification"/>
                  <BoolBadge on={cfg.trustAll} label="Trust all certificates"/>
                  <BoolBadge on={cfg.jks} label="JKS enabled"/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 13, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)' }}>
                  <KVRow label="Key store" value={cfg.keyStore}/>
                  <SecretView label="Key store password" value={cfg.keyStorePass}/>
                  <KVRow label="Trust store" value={cfg.trustStore}/>
                  <SecretView label="Trust store password" value={cfg.trustStorePass}/>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Audit Log */}
        <Card padding={0}>
          <PanelHead title="Audit log"/>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <tbody>
              {audit.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < audit.length - 1 ? '1px solid var(--ink-100)' : 0 }}>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{r.d}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--ink-800)', fontWeight: 600 }}>{r.a}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--ink-600)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ink-100)', textAlign: 'right' }}>
            <Btn variant="ghost" size="sm">View all →</Btn>
          </div>
        </Card>
      </div>

      {open && <ConfigForm provider={it.id} name={it.name} cfg={cfg} onClose={() => setOpen(false)} onSave={(next) => { setCfg(next); setOpen(false); window.toast && window.toast.success('Configuration saved', it.name + ' configuration updated and re-verified.'); }}/>}
    </div>
  );
}

/* ===================== Unified config form (one form, all settings) ===================== */
function ConfigForm({ provider, name, cfg, onClose, onSave }) {
  const { useState } = React;
  const isAecb = provider === 'aecb';
  // password fields are managed separately: keep current unless a new value is typed (+confirm)
  const PW = isAecb
    ? [['soapPass', 'SOAP password'], ['fullPass', 'Full-report password'], ['keystorePass', 'Keystore password']]
    : [['pass', 'Service password'], ['keyStorePass', 'Key store password'], ['trustStorePass', 'Trust store password']];
  const pwKeys = PW.map(p => p[0]);

  const [v, setV] = useState(() => { const o = { ...cfg }; pwKeys.forEach(k => o[k] = ''); return o; }); // blank = unchanged
  const [confirm, setConfirm] = useState(() => pwKeys.reduce((o, k) => (o[k] = '', o), {}));
  const [show, setShow] = useState({});
  const [testing, setTesting] = useState(false);
  const set = (k, val) => setV(s => ({ ...s, [k]: val }));
  const httpsOk = (u) => /^https:\/\/\S+/i.test((u || '').trim());

  const urlKeys = isAecb ? ['endpoint'] : ['rh','pure','analyze','account','configure','onboard','liveness'];
  const reqText = isAecb ? ['soapUser','fullUser','timeout','keystore'] : ['user','keyStore','trustStore'];
  const errs = {};
  urlKeys.forEach(k => { if (!httpsOk(v[k])) errs[k] = v[k] ? 'Must start with https://' : 'Required'; });
  reqText.forEach(k => { if (!String(v[k] || '').trim()) errs[k] = 'Required'; });
  if (isAecb && v.timeout && !/^\d+$/.test(String(v.timeout).trim())) errs.timeout = 'Numbers only';
  pwKeys.forEach(k => {
    if (v[k]) { if (v[k].length < 8) errs[k] = 'Min. 8 characters'; else if (confirm[k] !== v[k]) errs[k + '_c'] = "Passwords don't match."; }
  });
  const valid = Object.keys(errs).length === 0;

  const inp = { width: '100%', padding: '9px 11px', border: '1px solid var(--ink-300)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' };
  const lab = { fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 5, display: 'block', fontFamily: 'var(--font-ui)' };
  const secHead = { fontSize: 12.5, fontWeight: 800, color: '#0C1931', textTransform: 'uppercase', letterSpacing: '.05em', margin: '4px 0 12px', paddingTop: 18, borderTop: '1px solid var(--ink-100)', fontFamily: 'var(--font-ui)' };
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

  const textField = (k, label, opts = {}) => (
    <div>
      <label style={lab}>{label}{opts.req && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
      <input value={v[k]} placeholder={opts.ph || ''} onChange={e => set(k, e.target.value)} style={{ ...inp, borderColor: errs[k] && v[k] !== '' ? 'var(--danger)' : 'var(--ink-300)' }}/>
      {errs[k] && v[k] !== '' && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errs[k]}</div>}
    </div>
  );
  const pwField = (k, label) => (
    <div style={grid2}>
      <div>
        <label style={lab}>{label} <span style={{ fontWeight: 400, color: 'var(--ink-400)' }}>· leave blank to keep</span></label>
        <div style={{ position: 'relative' }}>
          <input type={show[k] ? 'text' : 'password'} value={v[k]} placeholder="Min. 8 characters" onChange={e => set(k, e.target.value)} style={{ ...inp, paddingRight: 36, borderColor: errs[k] ? 'var(--danger)' : 'var(--ink-300)' }}/>
          <button onClick={() => setShow(s => ({ ...s, [k]: !s[k] }))} style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)' }}><Icon name={show[k] ? 'eyeoff' : 'eye'} size={15}/></button>
        </div>
        {errs[k] && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errs[k]}</div>}
      </div>
      <div>
        <label style={lab}>Confirm</label>
        <input type="password" value={confirm[k]} placeholder="Re-enter" disabled={!v[k]} onChange={e => setConfirm(s => ({ ...s, [k]: e.target.value }))} style={{ ...inp, borderColor: errs[k + '_c'] ? 'var(--danger)' : 'var(--ink-300)', background: v[k] ? '#fff' : 'var(--ink-50)' }}/>
        {errs[k + '_c'] && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errs[k + '_c']}</div>}
      </div>
    </div>
  );
  const toggle = (k, label) => (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ink-100)', cursor: 'pointer' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)' }}>{label}</span>
      <input type="checkbox" className="toggle" checked={!!v[k]} onChange={e => set(k, e.target.checked)}/>
    </label>
  );

  const save = () => { if (!valid) return; setTesting(true); setTimeout(() => { setTesting(false); const next = { ...v }; pwKeys.forEach(k => { if (!v[k]) next[k] = cfg[k]; }); onSave(next); }, 1500); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 640, maxWidth: '100%', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(12,25,49,.35)', fontFamily: 'var(--font-ui)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Edit {name} configuration</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>Credentials, endpoints & TLS in one place</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)', padding: 6 }}><Icon name="x" size={18}/></button>
        </div>

        <div style={{ padding: '20px 22px 8px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--warning-tint)', border: '1px solid rgba(235,190,0,.4)', marginBottom: 16 }}>
            <span style={{ color: '#8a6c00', flexShrink: 0, marginTop: 1 }}><Icon name="alert" size={15}/></span>
            <div style={{ fontSize: 12, color: '#7a5e00', lineHeight: 1.5 }}>Saving immediately invalidates any replaced secret and re-verifies the whole configuration against {name} before it goes live.</div>
          </div>

          {isAecb ? (
            <>
              <div style={{ ...secHead, paddingTop: 0, borderTop: 0, marginTop: 0 }}>SOAP credentials</div>
              <div style={{ ...grid2, marginBottom: 4 }}>{textField('soapUser', 'Username', { req: true })}</div>
              {pwField('soapPass', 'New password')}
              <div style={secHead}>Full-report credentials</div>
              <div style={{ ...grid2, marginBottom: 4 }}>{textField('fullUser', 'Username', { req: true })}</div>
              {pwField('fullPass', 'New password')}
              <div style={secHead}>Connection settings</div>
              <div style={{ ...grid2, marginBottom: 12 }}>
                {textField('endpoint', 'Endpoint', { req: true, ph: 'https://…' })}
                {textField('timeout', 'Request timeout (ms)', { req: true })}
                {textField('keystore', 'Keystore file', { req: true })}
              </div>
              {pwField('keystorePass', 'New keystore password')}
              <div style={{ marginTop: 8 }}>{toggle('ssl', 'Use SSL')}{toggle('proxy', 'Use proxy')}</div>
              <div style={{ ...grid2, marginTop: 12 }}>{textField('proxyHost', 'Proxy host')}{textField('proxyPort', 'Proxy port')}</div>
            </>
          ) : (
            <>
              <div style={{ ...secHead, paddingTop: 0, borderTop: 0, marginTop: 0 }}>Service credentials</div>
              <div style={{ ...grid2, marginBottom: 4 }}>{textField('user', 'Username', { req: true })}</div>
              {pwField('pass', 'New password')}
              <div style={secHead}>Endpoints</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[['rh','RH'],['pure','Pure Live'],['analyze','Analyze Custom'],['account','Account base path'],['configure','Configure base path'],['onboard','Onboard base path'],['liveness','Liveness base path']].map(([k,l]) => <div key={k}>{textField(k, l, { req: true, ph: 'https://…' })}</div>)}
              </div>
              <div style={secHead}>TLS / mutual auth</div>
              <div>{toggle('ssl','SSL enabled')}{toggle('disableHost','Disable hostname verification')}{toggle('trustAll','Trust all certificates')}{toggle('jks','JKS enabled')}</div>
              <div style={{ ...grid2, marginTop: 12 }}>{textField('keyStore','Key store file',{req:true})}{textField('trustStore','Trust store file',{req:true})}</div>
              {pwField('keyStorePass', 'New key store password')}
              {pwField('trustStorePass', 'New trust store password')}
            </>
          )}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: 'var(--ink-50)' }}>
          <div style={{ fontSize: 11, color: valid ? 'var(--ink-500)' : 'var(--danger)' }}>{valid ? 'All settings valid' : 'Resolve highlighted fields to continue'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" icon={testing ? null : 'check'} disabled={!valid || testing} onClick={save}>{testing ? 'Verifying…' : 'Save & verify'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ApiCredentials });
