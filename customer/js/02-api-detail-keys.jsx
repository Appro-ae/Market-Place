// API Detail, Keys, Allowlist screens

function ApiDetail({ api, env, onBack, onSubscribe, onUnsubscribe, onMigrate, subscribedEnvs }) {
  const { useState } = React;
  const [tab, setTab] = useState('overview');
  const [openEp, setOpenEp] = useState(0);
  const [tryEp, setTryEp] = useState({}); // { [i]: { on, executed } }
  const isDeprecated = api.status === 'deprecated';

  // Environments this product was subscribed with (selected during the subscribe flow).
  const myEnvs = (subscribedEnvs && subscribedEnvs.length ? subscribedEnvs : (api.subscribed ? [
    { id: 'sbx-core', name: 'sandbox-core', cloud: 'aws', envType: 'sandbox', region: 'me-central-1' },
    { id: 'prod-uae', name: 'production-uae-1', cloud: 'aws', envType: 'production', region: 'me-central-1' },
  ] : [])).map((e, i) => ({ id: e.id || e.name || ('env-' + i), name: e.name, cloud: e.cloud, envType: e.envType || e.env, region: (e.region || '').split(' · ')[0] }));
  const [selEnv, setSelEnv] = useState(myEnvs[0] ? myEnvs[0].id : '');
  const activeEnv = myEnvs.find(e => e.id === selEnv) || myEnvs[0];

  // Country / regional variants — Identity Verification has many; others are mostly UAE-only.
  const variantsMap = {
    identity: [
      { code: 'AE', flag: '🇦🇪', country: 'United Arab Emirates', method: 'Emirates ID + UAE PASS', endpoint: '/v1.2/verify/uae', regulator: 'CBUAE', cloud: 'aws',   region: 'me-central-1', subscribed: true },
      { code: 'SA', flag: '🇸🇦', country: 'Saudi Arabia',         method: 'Absher / IQAMA',       endpoint: '/v1.2/verify/ksa', regulator: 'SAMA',  cloud: 'aws',   region: 'me-south-1',   subscribed: true },
      { code: 'BH', flag: '🇧🇭', country: 'Bahrain',              method: 'CPR National ID',      endpoint: '/v1.2/verify/bhr', regulator: 'CBB',   cloud: 'aws',   region: 'me-south-1',   subscribed: true },
      { code: 'OM', flag: '🇴🇲', country: 'Oman',                 method: 'National ID + biometric', endpoint: '/v1.2/verify/omn', regulator: 'CBO',   cloud: 'azure', region: 'UAE North',    subscribed: false },
      { code: 'KW', flag: '🇰🇼', country: 'Kuwait',               method: 'Civil ID',             endpoint: '/v1.2/verify/kwt', regulator: 'CBK',   cloud: 'azure', region: 'UAE North',    subscribed: false },
      { code: 'EG', flag: '🇪🇬', country: 'Egypt',                method: 'NID + face match',     endpoint: '/v1.2/verify/egy', regulator: 'CBE',   cloud: 'azure', region: 'UAE North',    subscribed: false },
    ],
    'payments-initiation': [
      { code: 'AE', flag: '🇦🇪', country: 'UAE',           method: 'AED · Al Etihad Payments', endpoint: '/v1.4/payments/uae', regulator: 'CBUAE', cloud: 'azure', region: 'UAE North', subscribed: true },
      { code: 'SA', flag: '🇸🇦', country: 'Saudi Arabia', method: 'SAR · SARIE',              endpoint: '/v1.4/payments/ksa', regulator: 'SAMA',  cloud: 'azure', region: 'UAE North', subscribed: true },
      { code: 'BH', flag: '🇧🇭', country: 'Bahrain',      method: 'BHD · EFTS',                endpoint: '/v1.4/payments/bhr', regulator: 'CBB',   cloud: 'azure', region: 'UAE North', subscribed: true },
    ],
    fx: [
      { code: 'AE', flag: '🇦🇪', country: 'UAE',     method: 'AED pairs', endpoint: '/v2.0/fx/uae', regulator: 'CBUAE', cloud: 'aws', region: 'me-central-1', subscribed: false },
      { code: 'SA', flag: '🇸🇦', country: 'KSA',     method: 'SAR pairs', endpoint: '/v2.0/fx/ksa', regulator: 'SAMA',  cloud: 'aws', region: 'me-south-1',   subscribed: false },
      { code: 'BH', flag: '🇧🇭', country: 'Bahrain', method: 'BHD pairs', endpoint: '/v2.0/fx/bhr', regulator: 'CBB',   cloud: 'aws', region: 'me-south-1',   subscribed: false },
      { code: 'OM', flag: '🇴🇲', country: 'Oman',    method: 'OMR pairs', endpoint: '/v2.0/fx/omn', regulator: 'CBO',   cloud: 'aws', region: 'me-south-1',   subscribed: false },
    ],
    'cards-issuance': [
      { code: 'AE', flag: '🇦🇪', country: 'UAE',           method: 'Visa / Mastercard', endpoint: '/v1.1/cards/uae', regulator: 'CBUAE', cloud: 'aws', region: 'me-central-1', subscribed: false },
      { code: 'SA', flag: '🇸🇦', country: 'Saudi Arabia', method: 'Mada + Visa',        endpoint: '/v1.1/cards/ksa', regulator: 'SAMA',  cloud: 'aws', region: 'me-south-1',   subscribed: false },
    ],
  };
  const variants = variantsMap[api.id] || [
    { code: 'AE', flag: '🇦🇪', country: 'UAE', method: 'Default', endpoint: api.id ? `/${api.v}/${api.id}` : '/v1/default', regulator: 'CBUAE', cloud: api.cloud || 'aws', region: api.region || 'me-central-1', subscribed: !!api.subscribed },
  ];

  const endpoints = [
    { m: 'POST', path: '/oauth/token', d: 'Generate OAuth access token',
      reqBody: '{\n  "grantType": "client_credentials",\n  "clientId": "client_id",\n  "clientSecret": "client_secret"\n}',
      resp: '{\n  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",\n  "tokenType": "Bearer",\n  "expiresAt": "2026-01-15 06:50:48"\n}' },
    { m: 'POST', path: '/v1/verify-employer', d: 'Get employer details by company name or licenseERN or (entityID + licenseLocalID)',
      reqBody: '{\n  "companyName": "Acme Trading LLC",\n  "licenseERN": "ERN-100294",\n  "entityId": "ENT-88213",\n  "licenseLocalId": "LIC-4471"\n}',
      resp: '{\n  "employerName": "Acme Trading LLC",\n  "status": "ACTIVE",\n  "establishmentId": "EST-77120",\n  "verifiedAt": "2026-06-30 11:02:14"\n}' },
    { m: 'POST', path: '/v2/verify-employer', d: 'Get employer details by licenseLocalID and Company Name',
      reqBody: '{\n  "licenseLocalId": "LIC-4471",\n  "companyName": "Acme Trading LLC"\n}',
      resp: '{\n  "employerName": "Acme Trading LLC",\n  "status": "ACTIVE",\n  "sector": "Wholesale Trade",\n  "verifiedAt": "2026-06-30 11:04:52"\n}' },
  ];
  const tabs = ['overview', 'reference', 'changelog', 'conformance', 'sla'];
  const methodColor = m => m === 'GET' ? 'var(--success)' : m === 'POST' ? 'var(--appro-blue)' : m === 'DELETE' ? 'var(--danger)' : 'var(--warning)';

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 0, color: 'var(--ink-500)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
        ← Back to catalog
      </button>

      {/* Header */}
      <Card padding={0} style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '22px 26px', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="zap" size={24}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>{api.name}</h2>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-600)', background: 'var(--ink-100)', padding: '2px 8px', borderRadius: 4 }}>{api.v}</span>
              <StatusPill kind={api.status}>{api.status === 'live' ? 'Live' : api.status === 'beta' ? 'Beta' : 'Deprecated'}</StatusPill>
              {api.subscribed && api.cloud && <CloudChip cloud={api.cloud} region={api.region}/>}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-600)', maxWidth: 680, lineHeight: 1.5 }}>{api.desc}</p>
            <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap', fontSize: 12 }}>
              {[['Owner', api.owner], ['Auth', api.auth], ['Rate limit', api.rate], ['Category', 'Retail Banking'], ['Residency', 'UAE · MCA-1']].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{k}</div>
                  <div style={{ color: 'var(--ink-800)', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {api.subscribed ? (
              <>
                <Btn variant="primary" icon="sparkle" onClick={() => window.toast && window.toast.info('Opening Playground', 'Launching the interactive console for ' + api.name + '\u2026')}>Open Playground</Btn>
                <Btn variant="secondary" icon="book" onClick={() => window.toast && window.toast.info('Opening OpenAPI spec', 'The spec for ' + api.name + ' opens in a new tab.')}>View OpenAPI spec</Btn>
                <Btn variant="ghost" size="sm" icon="trash" style={{ color: 'var(--danger)' }} onClick={() => onUnsubscribe && onUnsubscribe(api)}>Unsubscribe</Btn>
              </>
            ) : api.requested ? (
              <>
                <Btn variant="secondary" icon="refresh" disabled>Requested</Btn>
                <Btn variant="secondary" icon="book" onClick={() => window.toast && window.toast.info('Opening OpenAPI spec', 'The spec for ' + api.name + ' opens in a new tab.')}>View OpenAPI spec</Btn>
              </>
            ) : isDeprecated ? (
              <>
                <Btn variant="primary" icon="arrow" onClick={() => onMigrate && onMigrate(api)}>Migrate to Documents v2</Btn>
                <Btn variant="secondary" icon="book" onClick={() => window.toast && window.toast.info('Opening OpenAPI spec', 'The spec for ' + api.name + ' opens in a new tab.')}>View OpenAPI spec</Btn>
                <Btn variant="ghost" size="sm" style={{ color: 'var(--ink-600)' }} onClick={() => onSubscribe && onSubscribe(api)}>Subscribe anyway</Btn>
              </>
            ) : (
              <>
                <Btn variant="primary" icon="plus" onClick={() => onSubscribe && onSubscribe(api)}>{apiHasPlan(api) ? 'Request access' : 'Request price'}</Btn>
                <Btn variant="secondary" icon="book" onClick={() => window.toast && window.toast.info('Opening OpenAPI spec', 'The spec for ' + api.name + ' opens in a new tab.')}>View OpenAPI spec</Btn>
              </>
            )}
          </div>
        </div>

        {isDeprecated && (
          <div style={{
            margin: '0 26px 18px', padding: '12px 14px', borderRadius: 10,
            background: 'linear-gradient(90deg, rgba(235,190,0,.18), rgba(235,190,0,.04))',
            border: '1px solid rgba(235,190,0,.45)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="alert" size={14}/>
            </div>
            <div style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-800)', lineHeight: 1.45 }}>
              <b>This API is deprecated.</b> Production traffic will be cut off on <b>30 Sep 2026</b>. New integrations should use <b>Documents API v2</b> — same endpoints, faster generation, async webhooks.
            </div>
            <Btn variant="secondary" size="sm" icon="arrow" onClick={() => onMigrate && onMigrate(api)}>See Documents v2</Btn>
          </div>
        )}

        {/* Tabs */}
        <div style={{ padding: '0 26px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 4 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'transparent', border: 0, padding: '14px 14px',
              fontSize: 13, fontWeight: 600, color: tab === t ? 'var(--appro-blue)' : 'var(--ink-500)',
              borderBottom: tab === t ? '2px solid var(--appro-blue)' : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'var(--font-ui)', textTransform: 'capitalize',
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>
      </Card>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          <div>
            {/* Regional variants */}
            {variants.length > 1 && (
              <Card padding={0} style={{ marginBottom: 16 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Regional variants</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{variants.length} country implementations · each follows the local regulator's data residency rules</div>
                  </div>
                  <Btn variant="secondary" size="sm" icon="plus" onClick={() => window.toast && window.toast.info('Request a country', 'Tell us which jurisdiction you need — our team will scope it.')}>Request country</Btn>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ background: 'var(--ink-50)' }}>
                    <tr>{['Country','Verification method','Endpoint','Regulator','Hosted on','Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr key={v.code} style={{ borderBottom: i < variants.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>{v.flag}</span>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{v.country}</div>
                              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)' }}>{v.code}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--ink-700)' }}>{v.method}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--appro-blue)', fontSize: 11.5 }}>{v.endpoint}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--ink-600)' }}>{v.regulator}</td>
                        <td style={{ padding: '12px 16px' }}><CloudChip cloud={v.cloud} region={v.region}/></td>
                        <td style={{ padding: '12px 16px' }}>
                          {v.subscribed
                            ? <StatusPill kind="active">Subscribed</StatusPill>
                            : <Btn variant="ghost" size="sm" icon="plus" style={{ color: 'var(--appro-blue)', padding: '4px 8px' }} onClick={() => onSubscribe && onSubscribe({ ...api, country: v.country, region: v.region, cloud: v.cloud })}>Subscribe</Btn>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            <Card padding={0} style={{ marginBottom: 16 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Endpoints</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{endpoints.length} operations · OpenAPI 3.1</div>
              </div>
              <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                {endpoints.map((e, i) => {
                  const open = openEp === i;
                  const mc = methodColor(e.m);
                  return (
                    <div key={e.path} style={{ border: '1px solid ' + (open ? mc : 'var(--ink-200)'), borderRadius: 10, overflow: 'hidden', background: open ? `color-mix(in srgb, ${mc} 5%, white)` : '#fff' }}>
                      <button onClick={() => setOpenEp(open ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: mc, padding: '6px 14px', borderRadius: 6, fontFamily: 'var(--font-ui)', minWidth: 62, textAlign: 'center', letterSpacing: '.02em' }}>{e.m}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: '#0C1931', fontWeight: 700 }}>{e.path}</span>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-500)', flex: 1, minWidth: 0 }}>{e.d}</span>
                        <span style={{ color: 'var(--ink-400)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}><Icon name="chevron" size={16}/></span>
                      </button>
                      {open && (
                        <div style={{ padding: '4px 16px 18px', borderTop: '1px solid ' + `color-mix(in srgb, ${mc} 25%, white)` }}>
                          {(() => {
                            const t = tryEp[i] || {};
                            const setT = (v) => setTryEp(s => ({ ...s, [i]: { ...s[i], ...v } }));
                            const authStr = (api.auth || '').toLowerCase();
                            const usesApiKey = authStr.includes('x-api-key') || authStr.includes('api key') || authStr.includes('api-key');
                            const headers = [['Content-Type', 'application/json']];
                            if (usesApiKey) { headers.push(['X-Api-Key', 'sk_live_••••••••••••7f3a']); headers.push(['X-Client-Id', 'clt_8f2a19c4']); }
                            else if (authStr.includes('mtls')) { headers.push(['Authorization', 'Bearer $APPRO_TOKEN']); headers.push(['X-Client-Cert', '<mTLS client certificate>']); }
                            else { headers.push(['Authorization', 'Bearer $APPRO_TOKEN']); }
                            const host = (activeEnv && activeEnv.envType === 'production' ? 'api' : 'sandbox') + '.appro.ae';
                            const curl = 'curl -X ' + e.m + ' https://' + host + e.path + ' \\\n'
                              + headers.map(h => "  -H '" + h[0] + ': ' + h[1] + "'").join(' \\\n')
                              + (e.reqBody ? " \\\n  -d '" + e.reqBody.replace(/\n\s*/g, ' ').trim() + "'" : '');
                            return (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 16px', gap: 10 }}>
                                  <div style={{ fontSize: 12.5, color: 'var(--ink-600)' }}>{e.d}</div>
                                  {t.on
                                    ? <Btn variant="secondary" size="sm" onClick={() => setT({ on: false, executed: false })}>Cancel</Btn>
                                    : <Btn variant="secondary" size="sm" icon="sparkle" onClick={() => setT({ on: true, executed: false })}>Try it out</Btn>}
                                </div>
                                {t.on && (
                                  <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', marginBottom: 8 }}>Request headers</div>
                                    <div style={{ border: '1px solid var(--ink-200)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                                      {headers.map((h, hi) => (
                                        <div key={h[0]} style={{ display: 'flex', gap: 12, padding: '9px 12px', borderBottom: hi < headers.length - 1 ? '1px solid var(--ink-100)' : 0, background: (h[0] === 'X-Api-Key' || h[0] === 'X-Client-Id') ? 'var(--appro-blue-50)' : '#fff' }}>
                                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#0C1931', minWidth: 130 }}>{h[0]}{(h[0] === 'X-Api-Key' || h[0] === 'X-Client-Id') && <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 10 }}> *</span>}</span>
                                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-600)', wordBreak: 'break-all' }}>{h[1]}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>cURL</div>
                                      <Btn variant="secondary" size="sm" icon="copy" onClick={() => window.toast && window.toast.success('Copied to clipboard', 'cURL command copied.')}>Copy</Btn>
                                    </div>
                                    <pre style={{ margin: 0, background: '#0C1931', color: '#E6F1F8', borderRadius: 10, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.65, overflowX: 'auto', whiteSpace: 'pre' }}>{curl}</pre>
                                  </div>
                                )}
                                {e.reqBody && <>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>Request body <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 11 }}>required</span></div>
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '3px 8px' }}>application/json</span>
                                  </div>
                                  {t.on ? (
                                    <textarea defaultValue={e.reqBody} spellCheck={false} style={{ width: '100%', minHeight: 130, background: '#2B303B', color: '#E6F1F8', borderRadius: 10, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, border: '1px solid var(--appro-blue)', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}/>
                                  ) : <>
                                    <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 6 }}>Example Value <span style={{ color: 'var(--ink-300)' }}>|</span> <span style={{ color: 'var(--ink-400)' }}>Schema</span></div>
                                    <pre style={{ margin: 0, background: '#2B303B', color: '#E6F1F8', borderRadius: 10, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, overflowX: 'auto' }}>{e.reqBody}</pre>
                                  </>}
                                </>}
                                {t.on && (
                                  <div style={{ margin: '14px 0 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Btn variant="primary" size="sm" icon="arrow" onClick={() => { setT({ executed: true }); window.toast && window.toast.success('Request executed', e.m + ' ' + e.path + ' → 200 OK · ' + (activeEnv ? activeEnv.name : 'sandbox')); }}>Execute</Btn>
                                    <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>against <b style={{ color: 'var(--ink-700)' }}>{activeEnv ? activeEnv.name : 'sandbox'}</b></span>
                                  </div>
                                )}
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', marginTop: e.reqBody ? 18 : 0, marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid var(--success)', display: 'inline-block' }}>{t.on && t.executed ? 'Server response' : 'Responses'}</div>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', margin: '4px 0 6px' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)', fontSize: 13 }}>200</span>
                                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>OK{t.on && t.executed ? ' · 98ms · 1.2 kb' : ''}</span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, margin: '8px 0 6px' }}>{t.on && t.executed ? 'Response body' : <>Example Value <span style={{ color: 'var(--ink-300)' }}>|</span> <span style={{ color: 'var(--ink-400)' }}>Schema</span></>}</div>
                                <pre style={{ margin: 0, background: '#2B303B', color: '#E6F1F8', borderRadius: 10, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, overflowX: 'auto' }}>{e.resp}</pre>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionHeader title="Admission checklist" subtitle="This API has met all Marketplace admission criteria"/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['OpenAPI 3.1 spec published','Named technical owner','Sandbox + production environments','OAuth scopes declared','Versioning & deprecation policy','Request validation & error standards','Structured logging & trace IDs','Rate limiting & abuse controls','Security review + pen-test passed','24x7 support model','Data residency: UAE MCA-1','SDK coverage: 5 languages'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-700)' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="check" size={10} stroke={3.5}/>
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            {api.subscribed && (window.PROVISIONED_ENVS || []).filter(e => (e.env || e.envType) === env).length > 0 && (
              <Card style={{ marginBottom: 16 }}>
                <SectionHeader title="Environment" subtitle={'Provisioned ' + env + ' environments'}/>
                <div style={{ display: 'grid', gap: 10 }}>
                  {(window.PROVISIONED_ENVS || []).filter(e => (e.env || e.envType) === env).map((e, i) => (
                    <div key={e.name || i} style={{ padding: '11px 12px', border: '1px solid var(--ink-200)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: '#0C1931' }}>{e.name}</span>
                        <EnvBadge env={e.env || e.envType}/>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <CloudChip cloud={e.cloud} region={(e.region || '').split(' · ')[0]}/>
                        <StatusPill kind={(e.status === 'active' ? 'active' : e.status === 'pending' ? 'pending' : e.status === 'review' ? 'review' : 'active')}>{e.status === 'active' ? 'Provisioned' : (e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : 'Provisioned')}</StatusPill>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ink-100)' }}>{(window.PROVISIONED_ENVS || []).filter(e => (e.env || e.envType) === env).length} provisioned {env} environment{(window.PROVISIONED_ENVS || []).filter(e => (e.env || e.envType) === env).length === 1 ? '' : 's'}.</div>
              </Card>
            )}
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader title="Your access"/>
              <div style={{ display: 'grid', gap: 10, fontSize: 12 }}>
                {api.cloud && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--ink-500)' }}>Hosted on</span>
                  <CloudChip cloud={api.cloud} region={api.region}/>
                </div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-500)' }}>Sandbox</span>
                  <StatusPill kind="active">Provisioned</StatusPill>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-500)' }}>Production</span>
                  <StatusPill kind="active">Live</StatusPill>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-500)' }}>Scopes granted</span>
                  <span style={{ fontWeight: 600 }}>accounts.read, balances.read</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-500)' }}>Quota</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>500 req/s · 2M/day</span>
                </div>
              </div>
            </Card>
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader title="Health (last 24h)"/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2, marginBottom: 10, height: 32 }}>
                {Array.from({length:24}).map((_,i)=>{
                  const h = 0.4 + Math.random() * 0.6;
                  const bad = i === 11 || i === 19;
                  return <div key={i} style={{ background: bad ? 'var(--warning)' : 'var(--success)', height: `${h*100}%`, alignSelf: 'flex-end', borderRadius: 2, opacity: 0.7 + h * 0.3 }}/>;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-500)' }}>
                <span>Uptime 99.98%</span>
                <span>p95 98ms</span>
              </div>
            </Card>
            <Card>
              <SectionHeader title="Resources"/>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { i: 'book', t: 'Quickstart guide' },
                  { i: 'terminal', t: 'Postman collection' },
                  { i: 'external', t: 'OpenAPI (YAML)' },
                  { i: 'external', t: 'Changelog' },
                  { i: 'external', t: 'Support runbook' },
                ].map(r => (
                  <a key={r.t} href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12, color: 'var(--ink-700)', textDecoration: 'none' }}>
                    <Icon name={r.i} size={14}/> {r.t}
                    <Icon name="arrow" size={12} stroke={2}/>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab !== 'overview' && (
        <Card style={{ padding: 48, textAlign: 'center', color: 'var(--ink-500)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-800)', marginBottom: 6, textTransform: 'capitalize' }}>{tab}</div>
          <div style={{ fontSize: 13 }}>This tab is a placeholder — in the full portal, it renders the {tab} experience.</div>
        </Card>
      )}
    </div>
  );
}

/* -------- API KEYS -------- */
function Keys({ env, setModal }) {
  const isProd = env === 'production';
  // IP allowlist per environment (mirrors the Allowlist screen)
  const allowlistByEnv = {
    production: ['52.14.88.0/24', '3.28.142.24/32', '91.74.20.0/28'],
    sandbox: ['0.0.0.0/0', '10.8.0.0/16', '34.120.84.12/32'],
  };
  const envIps = allowlistByEnv[env] || [];
  const keys = isProd ? [
    { id: 'k_1', name: 'Production — primary',    prefix: 'pk_live_9c7b', created: 'Mar 12, 2026', from: 'Mar 12, 2026', to: null,            scopes: 'Credit Score (Company), Credit Full Report (Company)', status: 'active',  env: 'production' },
    { id: 'k_2', name: 'Production — backoffice', prefix: 'pk_live_4e1a', created: 'Feb 28, 2026', from: 'Feb 28, 2026', to: 'Aug 28, 2026',   scopes: 'Credit Score (Company)',                   status: 'active',  env: 'production' },
    { id: 'k_3', name: 'Production — retired',    prefix: 'pk_live_80ff', created: 'Oct 9, 2025',  from: 'Oct 9, 2025',  to: 'Apr 9, 2026',    scopes: 'Credit Score (Company)',                   status: 'revoked', env: 'production' },
  ] : [
    { id: 'k_1', name: 'Sandbox — developer',     prefix: 'pk_sbx_9f3a',  created: 'Apr 12, 2026', from: 'Apr 12, 2026', to: null,            scopes: 'Email Verification, Credit Score (Individual), ID Document Data Extraction', status: 'active', env: 'sandbox' },
    { id: 'k_2', name: 'Sandbox — QA bot',        prefix: 'pk_sbx_22cd',  created: 'Apr 10, 2026', from: 'Apr 10, 2026', to: 'Jul 10, 2026',   scopes: 'Email Verification, Credit Score (Company)',     status: 'active',  env: 'sandbox' },
    { id: 'k_3', name: 'Sandbox — CI pipeline',   prefix: 'pk_sbx_71bb',  created: 'Apr 2, 2026',  from: 'Apr 2, 2026',  to: null,            scopes: 'Email Verification',                    status: 'active',  env: 'sandbox' },
    { id: 'k_4', name: 'Sandbox — Layla (demo)',   prefix: 'pk_sbx_55ae',  created: 'Mar 28, 2026', from: 'May 1, 2026',  to: 'Jun 1, 2026',    scopes: 'ID Document Data Extraction',                    status: 'pending', env: 'sandbox' },
  ];

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Warning banner */}
      <div style={{
        background: 'linear-gradient(90deg, var(--warning-tint), #fff 70%)',
        border: '1px solid rgba(235,190,0,.3)', borderRadius: 12, padding: '14px 18px',
        marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="lock" size={16}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>Secrets are shown once, at creation.</div>
          <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>Reem never stores plaintext keys. Rotate immediately if a key leaks. All key events are written to the immutable audit log.</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => window.toast && window.toast.info('Security policy', 'Opening the key-handling security policy\u2026')}>Security policy →</Btn>
      </div>

      <Card padding={0}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ink-100)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>API Keys · {env}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
              {keys.filter(k=>k.status==='active').length} active · {keys.filter(k=>k.status==='revoked').length} revoked · rotation cadence 90d
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" icon="refresh" onClick={() => window.toast && window.toast.info('Rotation schedule', 'Keys rotate every 90 days · owners are notified before expiry.')}>Rotation schedule</Btn>
            <Btn variant="primary" icon="plus" onClick={() => setModal('createKey')}>Create new key</Btn>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>
              {['Name', 'Environment', 'Key', 'Products', 'Validity', 'Created', 'Status', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-ui)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k, i) => (
              <tr key={k.id} style={{ borderBottom: i < keys.length-1 ? '1px solid var(--ink-100)' : 0, opacity: k.status === 'revoked' ? 0.55 : 1 }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{k.name}</div>
                </td>
                <td style={{ padding: '14px 20px' }}><EnvBadge env={k.env} size="sm"/></td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-100)', padding: '4px 10px', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-800)' }}>
                    <span>{k.prefix}<span style={{ color: 'var(--ink-400)' }}>••••••••</span></span>
                    <Icon name="copy" size={11}/>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 11.5, color: 'var(--ink-600)', maxWidth: 220 }}>{k.scopes}</td>
                <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 12, rowGap: 3, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>From</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)' }}>{k.from}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>To</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: k.to ? 'var(--ink-900)' : 'var(--success)' }}>{k.to || 'No expiry'}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--ink-600)' }}>{k.created}</td>
                <td style={{ padding: '14px 20px' }}><StatusPill kind={k.status}>{k.status === 'active' ? 'Active' : k.status === 'pending' ? 'Pending' : 'Revoked'}</StatusPill></td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {k.status !== 'revoked' && (
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button onClick={() => setModal('rotateKey')} style={{ background: 'transparent', border: '1px solid var(--ink-200)', color: 'var(--ink-700)', padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="refresh" size={11}/> Rotate
                      </button>
                      <button onClick={() => { if (window.confirm('Revoke this key? Apps using it will stop working immediately.')) window.toast && window.toast.error('Key revoked', k.name + ' can no longer authenticate.'); }} style={{ background: 'transparent', border: '1px solid var(--ink-200)', color: 'var(--danger)', padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                        Revoke
                      </button>
                      <button style={{ background: 'transparent', border: '1px solid var(--ink-200)', color: 'var(--ink-500)', padding: '5px 8px', borderRadius: 6, cursor: 'pointer' }}><Icon name="more" size={14}/></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {/* Webhook signing secret */}
      <Card style={{ marginTop: 16 }}>
        <SectionHeader title="Webhook signing secret" subtitle="Used to verify inbound webhooks from Appro · rotate quarterly" right={<Btn variant="secondary" size="sm" icon="refresh" onClick={() => window.toast && window.toast.success('Signing secret rotated', 'Update your webhook verification within 24 hours.')}>Rotate</Btn>}/>
        <div style={{ background: 'var(--ink-100)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <span>whsec_{env === 'production' ? 'live' : 'sbx'}_7af2•••••••••••••••••••••••••••••••••</span>
          <Btn variant="ghost" size="sm" icon="eye" onClick={() => window.toast && window.toast.info('Secret revealed', 'Keep it safe — it grants full webhook-verification access.')}>Reveal</Btn>
          <Btn variant="ghost" size="sm" icon="copy" onClick={() => window.toast && window.toast.success('Copied to clipboard')}>Copy</Btn>
        </div>
      </Card>
    </div>
  );
}

/* -------- ALLOWLIST -------- */
function Allowlist({ env }) {
  const { useState } = React;
  const [showAdd, setShowAdd] = useState(false);
  const entries = env === 'production' ? [
    { cidr: '52.14.88.0/24',    label: 'AWS me-central-1 · prod egress', added: 'Mar 2, 2026', by: 'Amira S.', req: '1.4M' },
    { cidr: '3.28.142.24/32',   label: 'Backoffice bastion',              added: 'Feb 18, 2026', by: 'Yusuf H.', req: '842K' },
    { cidr: '91.74.20.0/28',    label: 'Azure UAE North (DR)',            added: 'Jan 9, 2026',  by: 'Amira S.', req: '104' },
  ] : [
    { cidr: '0.0.0.0/0',        label: 'Sandbox — open (dev default)',    added: 'Apr 2, 2026',  by: 'System',   req: '14K' },
    { cidr: '10.8.0.0/16',      label: 'Office VPN',                      added: 'Apr 10, 2026', by: 'Amira S.', req: '2.1K' },
    { cidr: '34.120.84.12/32',  label: 'CI/CD runner',                    added: 'Apr 11, 2026', by: 'Layla M.',  req: '487' },
  ];

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          <Card padding={0}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-ui)' }}>IP Allowlist · {env}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>Requests from other IPs return <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--ink-100)', padding: '1px 5px', borderRadius: 3 }}>403 ip_not_allowed</code>.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-700)' }}>
                  <input type="checkbox" className="toggle" defaultChecked={env === 'production'}/>
                  Enforce allowlist
                </label>
                <Btn variant="primary" icon="plus" onClick={() => setShowAdd(true)}>Add IP addresses</Btn>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--ink-50)' }}>
                <tr>
                  {['CIDR', 'Label', 'Added', 'By', 'Requests (30d)', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.cidr} style={{ borderBottom: i < entries.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-900)', fontWeight: 600 }}>{e.cidr}</td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--ink-700)' }}>{e.label}</td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--ink-600)' }}>{e.added}</td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--ink-600)' }}>{e.by}</td>
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-700)' }}>{e.req}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button onClick={() => window.toast && window.toast.info('CIDR removed', e.cidr + ' will stop being accepted within ~30s.')} style={{ background: 'transparent', border: '1px solid var(--ink-200)', color: 'var(--danger)', padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'pointer' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Recent denies" subtitle="Non-allowlisted IPs in the last 24h"/>
            {[
              { ip: '185.42.19.8',  c: '🇷🇺', n: 3 },
              { ip: '41.82.129.4',  c: '🇪🇬', n: 2 },
              { ip: '104.244.76.12',c: '🇺🇸', n: 1 },
            ].map(d => (
              <div key={d.ip} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--ink-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-800)' }}>
                  <span style={{ fontSize: 14 }}>{d.c}</span>{d.ip}
                </div>
                <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>{d.n} denies</span>
              </div>
            ))}
          </Card>
          <Card>
            <SectionHeader title="Policy"/>
            <div style={{ fontSize: 12, color: 'var(--ink-600)', lineHeight: 1.6 }}>
              Production calls <b>must</b> originate from an allowlisted CIDR. Sandbox allows <code style={{ fontFamily: 'var(--font-mono)' }}>0.0.0.0/0</code> by default for easier testing; you can enforce stricter ranges at any time.
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <Btn variant="secondary" size="sm" icon="book">Read the hardening guide</Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showAdd && <AllowlistModal env={env} onClose={() => setShowAdd(false)}/>}
    </div>
  );
}

/* -------- ADD IP ADDRESSES MODAL -------- */
function AllowlistModal({ env, onClose }) {
  const { useState, useMemo } = React;
  const envList = (window.PROVISIONED_ENVS || []).filter(e => e.status !== 'review' && e.env === (env || 'sandbox'));
  const [selectedEnvs, setSelectedEnvs] = useState(() => envList.map(e => e.name).slice(0, 1));
  const [raw, setRaw] = useState('');
  const [label, setLabel] = useState('');
  const [done, setDone] = useState(false);

  const toggleEnv = (name) => setSelectedEnvs(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);

  // Parse + validate IPs / CIDRs (split on newline, comma, space)
  const cidrRe = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d|[12]\d|3[0-2]))?$/;
  const parsed = useMemo(() => {
    const tokens = raw.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
    return tokens.map(t => {
      const m = t.match(cidrRe);
      const octetsOk = m && [m[1],m[2],m[3],m[4]].every(o => +o <= 255);
      return { value: t, valid: !!octetsOk, cidr: octetsOk && !m[5] ? t + '/32' : t };
    });
  }, [raw]);
  const validCount = parsed.filter(p => p.valid).length;
  const invalidCount = parsed.length - validCount;
  const canSubmit = validCount > 0 && selectedEnvs.length > 0 && invalidCount === 0;

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const panel = { background: '#fff', borderRadius: 14, width: 620, maxWidth: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(12,25,49,.35)', fontFamily: 'var(--font-ui)' };
  const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', fontFamily: 'var(--font-ui)', marginBottom: 8, display: 'block' };

  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={panel}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="allowlist" size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>{done ? 'Addresses added' : 'Add IP addresses'}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{done ? 'Allowlist updated across the selected environments.' : 'Add one or many IPs / CIDR ranges and apply them to one or more environments.'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)', padding: 6 }}><Icon name="x" size={18}/></button>
        </div>

        {!done && (
          <div style={{ padding: '22px 22px 8px', overflowY: 'auto', flex: 1 }}>
            {/* Environments — multi-select */}
            <label style={lbl}>Apply to environments <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>· {selectedEnvs.length} selected</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {envList.map(e => {
                const on = selectedEnvs.includes(e.name);
                return (
                  <label key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${on ? 'var(--appro-blue)' : 'var(--ink-200)'}`, background: on ? 'var(--appro-blue-50)' : '#fff', borderRadius: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={on} onChange={() => toggleEnv(e.name)} className="check"/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{e.region}</div>
                    </div>
                    <EnvBadge env={e.env} size="sm"/>
                  </label>
                );
              })}
            </div>

            {/* IP entry */}
            <label style={lbl}>IP addresses or CIDR ranges</label>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={5}
              placeholder={"One per line, or comma-separated. e.g.\n52.14.88.0/24\n3.28.142.24\n91.74.20.0/28"}
              style={{ width: '100%', padding: 12, border: '1px solid var(--ink-300)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}/>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 6 }}>Bare IPs are treated as <span style={{ fontFamily: 'var(--font-mono)' }}>/32</span>. Paste a list to add many at once.</div>

            {/* Parsed preview */}
            {parsed.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>{validCount} valid</span>
                  {invalidCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>{invalidCount} invalid</span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {parsed.map((p, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600,
                      padding: '3px 9px', borderRadius: 999,
                      background: p.valid ? 'var(--success-tint)' : 'var(--danger-tint)',
                      color: p.valid ? 'var(--success)' : 'var(--danger)',
                    }}>
                      <Icon name={p.valid ? 'check' : 'x'} size={10} stroke={3}/>{p.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Label */}
            <label style={{ ...lbl, marginTop: 20 }}>Label <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>· optional, applied to all</span></label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. AWS me-central-1 prod egress" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--ink-300)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' }}/>

            {selectedEnvs.some(n => (envList.find(e => e.name === n) || {}).env === 'production') && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--warning-tint)', border: '1px solid rgba(235,190,0,.35)', borderRadius: 8, fontSize: 11.5, color: '#7a5a00', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="lock" size={13}/>
                <span>You're editing a <b>production</b> allowlist. Changes take effect within ~60 seconds and are written to the audit log.</span>
              </div>
            )}
          </div>
        )}

        {done && (
          <div style={{ padding: '24px 22px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon name="check" size={26} stroke={3}/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', marginBottom: 4 }}>{validCount} {validCount === 1 ? 'address' : 'addresses'} added</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-600)' }}>Applied to {selectedEnvs.length} {selectedEnvs.length === 1 ? 'environment' : 'environments'}: <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedEnvs.join(', ')}</span></div>
          </div>
        )}

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ink-50)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{!done && canSubmit ? `Adding ${validCount} to ${selectedEnvs.length} env${selectedEnvs.length === 1 ? '' : 's'}` : ''}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!done && invalidCount > 0 && <span style={{ fontSize: 11, color: 'var(--danger)' }}>Fix invalid entries</span>}
            {!done && selectedEnvs.length === 0 && <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Pick at least one environment</span>}
            <Btn variant="secondary" onClick={onClose}>{done ? 'Close' : 'Cancel'}</Btn>
            {!done && <Btn variant="primary" icon="plus" onClick={() => { setDone(true); window.toast && window.toast.success(validCount + ' IP' + (validCount===1?'':'s') + ' added', 'Applied to ' + selectedEnvs.length + ' environment' + (selectedEnvs.length===1?'':'s') + '.'); }} disabled={!canSubmit}>Add to allowlist</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- SUBSCRIBE MODAL -------- */
// Shared: resolve the catalog packages for a product (null if the product has no plan/package).
function apiCatalogPlans(api) {
  const B = window.BILLING;
  if (!B || !B.state) return null;
  const want = (api.name || '').toLowerCase().trim();
  const pools = [];
  (B.state.productCatalog || []).forEach(p => pools.push(p));
  (B.state.services || []).forEach(s => (s.products || []).forEach(p => pools.push(p)));
  let prod = pools.find(p => p.name.toLowerCase() === want)
    || pools.find(p => want && (want.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(want)));
  if (!prod || !(prod.packages || []).length) return null;
  const uom = (prod.uom || 'unit').toLowerCase();
  return prod.packages.map((k, i) => ({
    id: k.id, name: k.name,
    price: k.pricingType === 'Committed volume' || k.pricingType === 'Pay-as-you-go'
      ? B.fmtUSD(k.unitPrice) + ' / ' + uom
      : k.pricingType === 'Usage band' ? 'From ' + B.fmtUSD((k.bands[0] || {}).rate) + ' / ' + uom
      : 'On request',
    quota: k.pricingType === 'Committed volume' ? B.fmtInt(k.txns) + ' ' + (k.period || 'per year').toLowerCase()
      : k.pricingType === 'Usage band' ? k.bands.length + ' usage tiers · ' + (k.period || 'per month').toLowerCase()
      : k.pricingType === 'Pay-as-you-go' ? 'No commitment · pay per use' : 'Custom quote',
    features: [
      k.pricingType,
      k.pricingType === 'Committed volume' ? 'Overflow: ' + B.ovfLabel(k.overflow) : 'Billed per ' + uom,
      k.setup ? 'Setup ' + B.fmtUSD0(k.setup) : 'No setup fee',
    ],
    recommended: prod.packages.length > 1 ? i === 1 : i === 0,
    _catalog: true, _prod: prod.name,
  }));
}
function apiHasPlan(api) { return !!apiCatalogPlans(api); }
window.apiHasPlan = apiHasPlan;

function SubscribeModal({ api, env, onClose, onConfirm, approved }) {
  const { useState, useMemo } = React;
  const isDep = api.status === 'deprecated';
  const isBeta = api.status === 'beta';
  const [step, setStep] = useState(1);
  const [provisioning, setProvisioning] = useState(0); // 0..100
  const [stage, setStage] = useState(0);
  const stages = [
    'Validating compliance acknowledgements',
    'Issuing OAuth client & scopes',
    'Generating sandbox + production keys',
    'Pinning data residency to ' + (api.region || 'me-central-1'),
    'Activating webhooks & quotas',
  ];
  const mainEnv = env || 'sandbox';
  const provisionedEnvs = ((window.PROVISIONED_ENVS || []).filter(e => (e.status === 'active' || e.status === 'live' || !e.status)).map(e => ({
    id: e.id || e.name,
    name: e.name,
    cloud: e.cloud || 'aws',
    envType: e.envType || e.env || (/(prod)/i.test(e.name) ? 'production' : 'sandbox'),
    region: (e.region || 'me-central-1').split(' · ')[0],
  })));
  const fallbackProvEnvs = [
    { id: 'sbx-core', name: 'sandbox-core', cloud: 'aws', envType: 'sandbox', region: 'me-central-1' },
    { id: 'sbx-qa', name: 'sandbox-qa', cloud: 'aws', envType: 'sandbox', region: 'me-central-1' },
    { id: 'prod-uae', name: 'production-uae-1', cloud: 'aws', envType: 'production', region: 'me-central-1' },
    { id: 'prod-ksa', name: 'production-ksa-1', cloud: 'aws', envType: 'production', region: 'me-south-1' },
  ];
  const subEnvs = (provisionedEnvs.length ? provisionedEnvs : fallbackProvEnvs).filter(e => e.envType === mainEnv);
  const [selectedSubEnvs, setSelectedSubEnvs] = useState(() => subEnvs.map(e => e.id).slice(0, 1));
  const toggleSubEnv = (id) => setSelectedSubEnvs(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const primarySub = subEnvs.find(e => selectedSubEnvs.includes(e.id)) || subEnvs[0] || { cloud: 'aws', region: 'me-central-1' };
  const cloud = primarySub.cloud;
  const region = primarySub.region;

  // Plans are the packages defined in Admin → Pricing & Catalog (ADM-210) for the matching product.
  const B = window.BILLING;
  const catalogPlans = apiCatalogPlans(api);
  // Approved items always run the full 4-step subscribe flow (fall back to default plans
  // when no catalogue pricing is configured); only unapproved browsing uses "Request price".
  const noPlan = !catalogPlans && !approved;
  const defaultPlans = [
    { id: 'free', name: 'Sandbox', price: 'Free', quota: '10k req/day · sandbox only', features: ['Full OpenAPI spec', 'Synthetic test data', 'Community support'] },
    { id: 'growth', name: 'Growth', price: 'AED 2,400/mo', quota: '2M req/day · prod + sandbox', features: ['99.9% SLA', 'Email support · 4h', 'Webhooks included'], recommended: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', quota: 'Negotiated · dedicated', features: ['99.99% SLA · mTLS', 'Named TAM · 24×7', 'Custom rate limits'] },
  ];
  const plans = catalogPlans || defaultPlans;
  const [plan, setPlan] = useState((plans.find(p => p.recommended) || plans[0] || {}).id || 'growth');
  const [purpose, setPurpose] = useState('');
  const [acks, setAcks] = useState({ terms: false, residency: false, deprecation: !isDep });
  const ticket = useMemo(() => 'REQ-' + (Math.floor(Math.random()*900000)+100000), []);

  const regions = [
    { c: 'aws', r: 'me-central-1', label: 'AWS · me-central-1 (UAE)' },
    { c: 'aws', r: 'me-south-1', label: 'AWS · me-south-1 (Bahrain)' },
    { c: 'azure', r: 'UAE North', label: 'Azure · UAE North' },
    { c: 'azure', r: 'UAE Central', label: 'Azure · UAE Central' },
  ];
  const TOTAL = 4;
  const step3Done = acks.terms && acks.residency && (!isDep || acks.deprecation);
  const next = () => setStep(s => Math.min(s + 1, TOTAL + 1));
  const back = () => setStep(s => Math.max(s - 1, 1));
  const submit = () => {
    if (noPlan) {
      onConfirm && onConfirm({ api, plan, cloud, region, requested: true, environments: selectedSubEnvs.map(id => subEnvs.find(e => e.id === id)).filter(Boolean), ticket });
      window.toast && window.toast.success('Price request submitted', "We'll prepare a quote and notify you once it's available.");
      onClose && onClose();
      return;
    }
    setStep(TOTAL + 1);
    setProvisioning(0);
    let pct = 0, idx = 0;
    const tick = setInterval(() => {
      pct = Math.min(100, pct + 12 + Math.random() * 10);
      idx = Math.min(stages.length - 1, Math.floor((pct / 100) * stages.length));
      setProvisioning(pct);
      setStage(idx);
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(() => { setStep(TOTAL + 2); onConfirm && onConfirm({ api, plan, cloud, region, requested: false, environments: selectedSubEnvs.map(id => subEnvs.find(e => e.id === id)).filter(Boolean), ticket }); }, 250);
      }
    }, 220);
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const panel = { background: '#fff', borderRadius: 14, width: 720, maxWidth: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(12,25,49,.35)', fontFamily: 'var(--font-ui)' };
  const lbl = { fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 };

  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={panel}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="zap" size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>{step > TOTAL+1 ? 'You\'re live' : step === TOTAL+1 ? 'Provisioning…' : 'Subscribe to ' + api.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{step > TOTAL+1 ? 'Credentials are active immediately.' : step === TOTAL+1 ? 'Real-time activation in progress.' : api.v + ' · ' + (api.owner || 'Appro') + (api.country ? ' · ' + api.country : '')}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)', padding: 6 }}><Icon name="x" size={18}/></button>
        </div>

        {!noPlan && step <= TOTAL && (
          <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', gap: 8 }}>
            {['Plan','Deployment','Compliance','Review'].map((l,i)=>{
              const n=i+1, done=n<step, cur=n===step;
              return (
                <div key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: done?'var(--success)':cur?'var(--appro-blue)':'var(--ink-100)', color: done||cur?'#fff':'var(--ink-500)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{done?<Icon name="check" size={11} stroke={3}/>:n}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: cur?'#0C1931':'var(--ink-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</div>
                  {i<3 && <div style={{ flex: 1, height: 1, background: 'var(--ink-200)' }}/>}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: '22px 22px 8px', overflowY: 'auto', flex: 1 }}>
          {step===1 && (
            <div>
              {(isDep||isBeta) && (
                <div style={{ padding: 12, borderRadius: 10, marginBottom: 16, background: isDep?'rgba(235,190,0,.12)':'rgba(124,58,237,.08)', border: '1px solid '+(isDep?'rgba(235,190,0,.45)':'rgba(124,58,237,.25)'), fontSize: 12.5, color: 'var(--ink-800)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="alert" size={14}/>
                  <div>{isDep?<><b>Deprecated.</b> Sunsets 30 Sep 2026. New integrations should use Documents API v2 — you'll be asked to acknowledge this in step 3.</>:<><b>Beta.</b> Breaking changes possible until GA. SLAs do not apply.</>}</div>
                </div>
              )}
              <div style={lbl}>{noPlan ? 'Pricing' : 'Plan' + (catalogPlans ? ' · packages from ' + (catalogPlans[0]._prod) : '')}</div>
              {catalogPlans && <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: -4, marginBottom: 10 }}>Pricing configured by Appro in the product catalogue.</div>}
              {noPlan ? (
                <div style={{ padding: '20px', borderRadius: 10, marginBottom: 18, background: 'var(--appro-blue-50)', border: '1px solid var(--appro-blue-200, #C7DBFF)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--appro-blue)' }}><Icon name="billing" size={17}/></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', marginBottom: 3 }}>Pricing available on request</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.5 }}>This product doesn't have a published price yet. Submit a request and the Appro team will prepare a quote for <b>{api.name}</b> and get back to you.</div>
                  </div>
                </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                {plans.map(p=>(
                  <div key={p.id} onClick={()=>setPlan(p.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', position: 'relative', border: plan===p.id?'2px solid var(--appro-blue)':'1px solid var(--ink-200)', background: plan===p.id?'var(--appro-blue-50)':'#fff' }}>
                    {p.recommended && <div style={{ position: 'absolute', top: -8, right: 10, background: 'var(--success)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.05em' }}>Recommended</div>}
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>{p.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--appro-blue)', margin: '4px 0' }}>{p.price}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 10 }}>{p.quota}</div>
                    <div style={{ display: 'grid', gap: 4 }}>{p.features.map(f=>(<div key={f} style={{ fontSize: 11, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={10} stroke={3}/> {f}</div>))}</div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {step===2 && (
            <div>
              <div style={lbl}>Target environment · {mainEnv}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: -2, marginBottom: 10 }}>Pick the exact provisioned {mainEnv} environment(s) to grant this API. Cloud &amp; region are inherited from each environment.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                {subEnvs.map(e => {
                  const on = selectedSubEnvs.includes(e.id);
                  return (
                    <label key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, border: '1px solid ' + (on ? 'var(--appro-blue)' : 'var(--ink-200)'), borderRadius: 10, cursor: 'pointer', background: on ? 'var(--appro-blue-50)' : '#fff' }}>
                      <input type="checkbox" checked={on} onChange={() => toggleSubEnv(e.id)} style={{ marginTop: 2 }}/>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>{e.name}</div>
                        <div style={{ marginTop: 5 }}><CloudChip cloud={e.cloud} region={e.region}/></div>
                        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 5 }}>{mainEnv === 'production' ? 'Real customers · approval required' : 'Synthetic data · instant access'}</div>
                      </div>
                    </label>
                  );
                })}
                {subEnvs.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: 12, border: '1px dashed var(--ink-300)', borderRadius: 10, fontSize: 12, color: 'var(--ink-500)' }}>No {mainEnv} environments provisioned yet. Provision one from the Environments screen first.</div>
                )}
              </div>
              <div style={lbl}>Use case (helps our team approve faster)</div>
              <textarea value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="e.g. Surface customer statements inside our mobile app onboarding flow." rows={3} style={{ width: '100%', padding: 10, border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12.5, fontFamily: 'var(--font-ui)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}/>
            </div>
          )}

          {step===3 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink-700)', marginBottom: 14 }}>Confirm these before we issue credentials.</div>
              {[
                { k:'terms', t:'I accept the Appro API Marketplace terms of use and the API-specific addendum.' },
                { k:'residency', t:'I confirm data will be processed only within the selected region ('+region+'). Cross-border transfers require a separate review.' },
                ...(isDep?[{k:'deprecation',t:'I understand '+api.name+' is deprecated and will be removed on 30 Sep 2026. I have a migration plan to Documents API v2.'}]:[]),
              ].map(a=>(
                <label key={a.k} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1px solid '+(acks[a.k]?'var(--success)':'var(--ink-200)'), borderRadius: 10, marginBottom: 8, cursor: 'pointer', background: acks[a.k]?'rgba(0,168,107,.05)':'#fff' }}>
                  <input type="checkbox" checked={!!acks[a.k]} onChange={e=>setAcks({...acks,[a.k]:e.target.checked})} style={{ marginTop: 2 }}/>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-800)', lineHeight: 1.5 }}>{a.t}</span>
                </label>
              ))}
            </div>
          )}

          {step===4 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink-700)', marginBottom: 14 }}>Review and submit.</div>
              <div style={{ border: '1px solid var(--ink-200)', borderRadius: 10, overflow: 'hidden' }}>
                {[
                  ['API', api.name+' · '+api.v],
                  ['Plan', (plans.find(p=>p.id===plan)||{}).name+' — '+(plans.find(p=>p.id===plan)||{}).price],
                  ['Hosting', cloud.toUpperCase()+' · '+region],
                  ['Environments', selectedSubEnvs.map(id => (subEnvs.find(e => e.id === id) || {}).name).filter(Boolean).join(', ') || '—'],
                  ['Approval', mainEnv === 'production' ? 'Instant · automated compliance checks' : 'Auto-approved (sandbox)'],
                ].map((row,i,arr)=>(
                  <div key={row[0]} style={{ display: 'flex', padding: '12px 14px', borderBottom: i<arr.length-1?'1px solid var(--ink-100)':0, fontSize: 12.5 }}>
                    <div style={{ width: 130, color: 'var(--ink-500)' }}>{row[0]}</div>
                    <div style={{ flex: 1, color: 'var(--ink-900)', fontWeight: 600 }}>{row[1]}</div>
                  </div>
                ))}
              </div>
              {isDep && <div style={{ marginTop: 12, fontSize: 11.5, color: '#8a6c00', padding: 10, background: 'rgba(235,190,0,.1)', borderRadius: 8 }}>Reminder: this API sunsets 30 Sep 2026. Documents API v2 is a drop-in replacement for most endpoints.</div>}
            </div>
          )}

          {step===TOTAL+1 && (
            <div style={{ textAlign: 'center', padding: '24px 20px 8px' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 18px' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--ink-100)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--appro-blue)" strokeWidth="6" strokeLinecap="round" strokeDasharray={2*Math.PI*34} strokeDashoffset={2*Math.PI*34*(1-provisioning/100)} style={{ transition: 'stroke-dashoffset .2s linear' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-mono)' }}>{Math.round(provisioning)}%</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', marginBottom: 4 }}>Provisioning your subscription…</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 18 }}>This usually takes a few seconds.</div>
              <div style={{ display: 'inline-grid', gap: 6, textAlign: 'left', padding: 14, background: 'var(--ink-50)', borderRadius: 10, fontSize: 12, minWidth: 360 }}>
                {stages.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, color: i < stage ? 'var(--ink-700)' : i === stage ? '#0C1931' : 'var(--ink-400)' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: i < stage ? 'var(--success)' : i === stage ? 'var(--appro-blue)' : 'var(--ink-200)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i < stage ? <Icon name="check" size={10} stroke={3}/> : i === stage ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }}/> : null}
                    </div>
                    <span style={{ fontWeight: i === stage ? 600 : 500 }}>{s}</span>
                  </div>
                ))}
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
            </div>
          )}

          {step>TOTAL+1 && (
            <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name="check" size={28} stroke={3}/>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0C1931', marginBottom: 4 }}>{noPlan ? 'Price request submitted' : "You're live"}</div>
              {noPlan ? (
                <>
                  <div style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 18 }}>Ticket <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0C1931' }}>{ticket}</span> · the Appro team will prepare a quote</div>
                  <div style={{ display: 'inline-grid', gap: 8, textAlign: 'left', padding: 14, background: 'var(--ink-50)', borderRadius: 10, fontSize: 12, color: 'var(--ink-700)', minWidth: 360 }}>
                    <div>✓ Your interest in <b>{api.name}</b> has been recorded</div>
                    <div>✓ Product status set to <b>Requested</b></div>
                    <div>✓ We'll email a price for {selectedSubEnvs.length} {mainEnv} environment{selectedSubEnvs.length === 1 ? '' : 's'}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 18 }}>Ticket <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0C1931' }}>{ticket}</span> · provisioned in {(Math.random()*2+1.4).toFixed(1)}s</div>
                  <div style={{ display: 'inline-grid', gap: 8, textAlign: 'left', padding: 14, background: 'var(--ink-50)', borderRadius: 10, fontSize: 12, color: 'var(--ink-700)', minWidth: 360 }}>
                    <div>✓ Keys generated for {selectedSubEnvs.length} {mainEnv} environment{selectedSubEnvs.length === 1 ? '' : 's'} — find them in <b>API Keys</b></div>
                    <div>✓ data residency pinned to {region}</div>
                    <div>✓ {api.name} added to your subscriptions</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ink-50)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{(!noPlan && step<=TOTAL)?'Step '+step+' of '+TOTAL:''}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step===3 && !step3Done && <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Tick all to continue</span>}
            {!noPlan && step>1 && step<=TOTAL && <Btn variant="secondary" onClick={back}>Back</Btn>}
            {!noPlan && step<TOTAL && <Btn variant="primary" icon="arrow" onClick={next} disabled={(step===2 && selectedSubEnvs.length===0) || (step===3 && !step3Done)}>Continue</Btn>}
            {(noPlan ? step===1 : step===TOTAL) && <Btn variant="primary" icon="check" onClick={submit}>{noPlan ? 'Submit' : 'Submit request'}</Btn>}
            {step>TOTAL+1 && <Btn variant="primary" onClick={onClose}>Done</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ApiDetail, Keys, Allowlist, AllowlistModal, SubscribeModal });
