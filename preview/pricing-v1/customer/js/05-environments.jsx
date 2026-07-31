// Cloud environments (AWS / Azure) for the API Marketplace Customer Portal

// Shared provisioned-environment list — consumed by Environments screen + Create API Key modal
window.PROVISIONED_ENVS = window.PROVISIONED_ENVS || [
  { name: 'email-prod-uae-1',     api: 'Email Verification · v1.3',  cloud: 'aws',   region: 'me-central-1 · UAE', vpc: 'vpc-0a82f1', status: 'active',  env: 'production', created: 'Apr 14', cost: 'AED 1,240/mo' },
  { name: 'aecb-prod-uae-1',      api: 'AECB Credit Report · v2.0',  cloud: 'aws',   region: 'me-central-1 · UAE', vpc: 'vpc-0a82f1', status: 'active',  env: 'production', created: 'Mar 02', cost: 'AED 980/mo' },
  { name: 'efr-stage-1',          api: 'EFR · v1.1',                 cloud: 'azure', region: 'uaenorth · UAE',     vpc: 'vnet-efr-stg', status: 'review',  env: 'production', created: 'Apr 17', cost: '—' },
  { name: 'sandbox-main',         api: '3 APIs attached',            cloud: 'aws',   region: 'me-south-1 · Bahrain', vpc: 'vpc-shared', status: 'active',  env: 'sandbox',    created: 'Jan 19', cost: 'Included' },
  { name: 'aecb-stage-az',        api: 'AECB Credit Report · v2.0',  cloud: 'azure', region: 'uaenorth · UAE',     vpc: 'vnet-aecb-stg', status: 'pending', env: 'sandbox',    created: 'Apr 20', cost: 'Included' },
];

function CloudLogo({ provider, size = 18 }) {
  if (provider === 'aws') {
    return (
      <svg width={size * 1.2} height={size} viewBox="0 0 80 48" fill="none">
        <path d="M22.6 22.2c0 .6.1 1.1.2 1.5.1.3.3.7.5 1.1l.2.3c0 .1-.1.3-.3.5l-1 .7h-.3l-.3-.1a2 2 0 0 1-.4-.4l-.4-.6a4 4 0 0 1-3.2 1.5c-.9 0-1.6-.3-2.2-.8a3 3 0 0 1-.8-2.1c0-.9.3-1.6 1-2.2a4 4 0 0 1 2.6-.8h1c.4 0 .7.1 1.1.2v-.7c0-.8-.2-1.3-.5-1.7a3 3 0 0 0-1.9-.5l-1 .1-1 .3-.4.2h-.2c-.1 0-.2-.1-.2-.4v-.5c0-.2 0-.3.1-.4l.3-.2 1.2-.3 1.4-.2c1 0 1.9.2 2.4.7.6.5.9 1.3.9 2.4v3.1zm-4.4 1.7.9-.2.9-.5v-.6l-.1-.5-.9-.2h-.9c-.6 0-1 .1-1.3.4a1 1 0 0 0-.4.9c0 .4.1.7.3.9.3.3.6.4 1 .4l.5-.6zm8.8 1.2-.3-.1-.2-.2-.1-.3-3-10 -.1-.4v-.2l.2-.1h1c.3 0 .4 0 .5.1l.2.4L27 23l2-7.4c0-.2.1-.3.2-.4h1.5l.2.4 2 7.4 2.3-7.4.2-.4h1.4l.2.2v.5l-3 10-.2.3-.3.2h-1.1c-.2 0-.3 0-.4-.1l-.2-.4L30 19l-2 7.2-.2.4-.4.1h-1zm14 .3a8 8 0 0 1-1.9-.2l-1.3-.4-.3-.3-.1-.3v-.5c0-.3.1-.4.3-.4h.5l1.2.3 1.3.1c.7 0 1.3-.1 1.7-.4.4-.2.6-.6.6-1l-.3-.9-1.2-.6-1.7-.5c-.9-.3-1.5-.7-1.9-1.2-.4-.5-.6-1-.6-1.6 0-.5.1-.9.3-1.3l.8-1 1.2-.5 1.4-.2 1.8.2 1.2.3.4.2v.8c0 .2-.1.4-.3.4l-.5-.2-1-.3-1.3-.1-1.5.3-.5.9.2.9 1.3.6 1.7.5c.8.3 1.5.6 1.9 1.1.4.5.6 1 .6 1.7s-.2 1-.4 1.4l-.8 1-1.3.6-1.7.2z" fill="#232F3E"/>
        <path d="M55 33c-5.7 4.2-14 6.5-21.2 6.5A38.3 38.3 0 0 1 8 29.8c-.5-.5 0-1 .5-.7a52 52 0 0 0 25.8 6.8 51 51 0 0 0 19.6-4c.8-.3 1.4.5.6 1.1z" fill="#FF9900"/>
        <path d="M57.2 30.4c-.7-.9-4.7-.4-6.5-.2-.5 0-.6-.4-.1-.7 3.2-2.2 8.4-1.6 9-.8.6.8-.2 6-3.1 8.5-.5.4-.9.2-.7-.3.7-1.8 2.1-5.6 1.4-6.5z" fill="#FF9900"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m13.1 3 -7.2 15.3h5.5L17 6.7 13.1 3z" fill="#0078D4"/>
      <path d="M13.7 4.8 9.3 14l4.4 4.2H21L13.7 4.8z" fill="#0062AD"/>
      <path d="M4.6 18.6h12.3l-1.7-1.6H7.2l-2.6 1.6z" fill="#3CCBF4"/>
    </svg>
  );
}

function Environments({ env }) {
  const { useState } = React;
  const [showProvision, setShowProvision] = useState(null); // null | 'new'
  const allItems = window.PROVISIONED_ENVS;
  const items = allItems.filter(e => (e.env || e.envType) === env);
  const awsN = items.filter(e => e.cloud === 'aws').length;
  const azureN = items.filter(e => e.cloud === 'azure').length;
  const activeN = items.filter(e => e.status === 'active').length;
  const summary = [
    { l: 'Active environments', v: activeN, c: 'var(--success)' },
    { l: 'AWS workloads',         v: awsN, c: '#FF9900' },
    { l: 'Azure workloads',       v: azureN, c: '#0078D4' },
    { l: 'Monthly cloud spend',   v: env === 'production' ? 'AED 2,220' : 'Included', c: 'var(--appro-blue)' },
  ];
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        {summary.map(s => (
          <Card key={s.l}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: 'var(--font-ui)', marginTop: 4 }}>{s.v}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Provisioned environments · {env}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Each environment is isolated compute + data plane for a specific API</div>
          </div>
          <Btn variant="primary" icon="plus" onClick={() => setShowProvision('new')}>Provision environment</Btn>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>
              {['Environment','API','Cloud & region','Network','Env','Status','Cost',''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>No {env} environments provisioned yet.</td></tr>
            )}
            {items.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: i < items.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#0C1931', fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-500)' }}>Created {r.created}</div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--ink-700)' }}>{r.api}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CloudLogo provider={r.cloud} size={16}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-800)' }}>{r.cloud === 'aws' ? 'AWS' : 'Azure'}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{r.region}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-700)' }}>{r.vpc}</td>
                <td style={{ padding: '14px 16px' }}><EnvBadge env={r.env}/></td>
                <td style={{ padding: '14px 16px' }}>
                  <StatusPill kind={r.status}>
                    {r.status === 'active' ? 'Healthy' : r.status === 'review' ? 'Provisioning' : 'Queued'}
                  </StatusPill>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-700)' }}>{r.cost}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button onClick={() => window.toast && window.toast.info(r.name + ' actions', 'Manage, view logs, or decommission this environment.')} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}><Icon name="more" size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showProvision === 'new' && <ProvisionModal env={env} onClose={() => setShowProvision(null)}/>}
    </div>
  );
}

function ProvisionModal({ onClose, env = 'sandbox', apiName = 'Payments Initiation v1.4' }) {
  const { useState } = React;
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nameTried, setNameTried] = useState(false);
  const [cloud, setCloud] = useState('aws');
  const [region, setRegion] = useState('me-central-1');
  const [tier, setTier] = useState('standard');
  const [targetEnv, setTargetEnv] = useState(env);
  const nameError = !name.trim() ? 'Environment name is required.' : '';
  const goStep2 = () => { setNameTried(true); if (nameError) { window.toast && window.toast.error('Name required', 'Enter a name for this environment to continue.'); return; } setStep(2); };

  const regionsByCloud = {
    aws: [
      { id: 'me-central-1', label: 'UAE · me-central-1 (Dubai)', note: 'Recommended for UAE data residency' },
      { id: 'me-south-1',   label: 'Bahrain · me-south-1',       note: 'Lowest latency alternate' },
      { id: 'eu-west-1',    label: 'Ireland · eu-west-1',        note: 'Only if your jurisdiction allows' },
    ],
    azure: [
      { id: 'uaenorth',     label: 'UAE North (Dubai)',          note: 'Recommended for UAE data residency' },
      { id: 'uaecentral',   label: 'UAE Central (Abu Dhabi)',    note: 'Government-grade compliance' },
      { id: 'westeurope',   label: 'West Europe (Netherlands)',   note: 'Only if your jurisdiction allows' },
    ],
  };
  const regions = regionsByCloud[cloud];
  React.useEffect(() => { setRegion(regions[0].id); }, [cloud]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 720, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(12,25,49,.3)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Provision · step {step} of 3</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0C1931', marginTop: 2 }}>Deploy <span style={{ color: 'var(--appro-blue)' }}>{apiName}</span></div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-500)' }}><Icon name="x" size={20}/></button>
        </div>

        {step === 1 && (
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4 }}>Where should this API run?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 16 }}>Pick the cloud you already have an account with. Appro provisions inside your VPC/VNet.</div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-800)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-ui)' }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={`e.g. ${targetEnv}-${cloud}-1`} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${nameTried && nameError ? 'var(--danger)' : 'var(--ink-300)'}`, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-800)', outline: 'none', boxSizing: 'border-box' }}/>
              {nameTried && nameError
                ? <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={12}/> {nameError}</div>
                : <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 5 }}>A unique name for this environment. Lowercase, hyphen-separated.</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { id: 'aws',   name: 'Amazon Web Services', sub: 'Deploy into your AWS account via CloudFormation + IAM role', features: ['me-central-1 (UAE) available', 'PrivateLink endpoint', 'KMS-encrypted secrets'] },
                { id: 'azure', name: 'Microsoft Azure',      sub: 'Deploy into your Azure subscription via Bicep + managed identity', features: ['UAE North + UAE Central', 'Private Endpoint', 'Key Vault-backed secrets'] },
              ].map(c => (
                <button key={c.id} onClick={() => setCloud(c.id)} style={{
                  padding: 16, border: cloud === c.id ? '2px solid var(--appro-blue)' : '1.5px solid var(--ink-200)',
                  background: cloud === c.id ? 'var(--appro-blue-50)' : '#fff', borderRadius: 12,
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff', border: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CloudLogo provider={c.id} size={22}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)', lineHeight: 1.4 }}>{c.sub}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: cloud === c.id ? 0 : '1.5px solid var(--ink-300)',
                      background: cloud === c.id ? 'var(--appro-blue)' : '#fff',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{cloud === c.id && <Icon name="check" size={12} stroke={3.5}/>}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 4, fontSize: 11, color: 'var(--ink-700)' }}>
                    {c.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="check" size={11} stroke={3}/> {f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 18, fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>Region</div>
            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              {regions.map(r => (
                <label key={r.id} style={{
                  padding: '11px 14px', border: region === r.id ? '1.5px solid var(--appro-blue)' : '1px solid var(--ink-200)',
                  background: region === r.id ? 'var(--appro-blue-50)' : '#fff',
                  borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                }}>
                  <input type="radio" className="radio" checked={region === r.id} onChange={() => setRegion(r.id)}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.note}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-600)' }}>{r.id}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
              <Btn variant="primary" icon="arrow" onClick={goStep2}>Continue</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 12 }}>Environment & sizing</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'sandbox',    t: 'Sandbox',    s: 'Synthetic data · 500 req/day free' },
                { id: 'production', t: 'Production', s: 'Real data · requires verified org' },
              ].filter(e => e.id === env).map(e => (
                <button key={e.id} onClick={() => setTargetEnv(e.id)} style={{
                  padding: 14, border: targetEnv === e.id ? '2px solid var(--appro-blue)' : '1.5px solid var(--ink-200)',
                  background: targetEnv === e.id ? 'var(--appro-blue-50)' : '#fff', borderRadius: 10,
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>{e.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{e.s}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 8 }}>Throughput tier</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'small',    t: 'Small',    rps: '50 rps',  cost: cloud === 'aws' ? 'AED 420' : 'AED 480', shape: cloud === 'aws' ? '2× t3.medium' : '2× Standard_B2s' },
                { id: 'standard', t: 'Standard', rps: '250 rps', cost: cloud === 'aws' ? 'AED 980' : 'AED 1,040', shape: cloud === 'aws' ? '3× m6i.large' : '3× Standard_D2s_v5' },
                { id: 'large',    t: 'Large',    rps: '1,000 rps', cost: cloud === 'aws' ? 'AED 3,120' : 'AED 3,280', shape: cloud === 'aws' ? '6× m6i.xlarge' : '6× Standard_D4s_v5' },
              ].map(t => (
                <button key={t.id} onClick={() => setTier(t.id)} style={{
                  padding: 14, border: tier === t.id ? '2px solid var(--appro-blue)' : '1.5px solid var(--ink-200)',
                  background: tier === t.id ? 'var(--appro-blue-50)' : '#fff', borderRadius: 10,
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>{t.t}</div>
                    {tier === t.id && <Icon name="check" size={14} stroke={3}/>}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--appro-blue)', marginTop: 6, fontFamily: 'var(--font-ui)' }}>{t.rps}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{t.shape}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>{t.cost}/mo compute</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 8 }}>Connect to your cloud account</div>
            <div style={{
              padding: 14, background: 'var(--ink-50)', border: '1px solid var(--ink-200)',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudLogo provider={cloud} size={18}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>
                  {cloud === 'aws' ? 'AWS account 4108-2247-9013' : 'Azure subscription nuqud-prod-sub'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
                  {cloud === 'aws'
                    ? 'IAM role: arn:aws:iam::410822479013:role/ApproProvisioner'
                    : 'Managed identity: /subscriptions/.../providers/ApproProvisioner'}
                </div>
              </div>
              <StatusPill kind="active">Connected</StatusPill>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="primary" icon="arrow" onClick={() => setStep(3)}>Review</Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>Confirm & launch</div>
            <div style={{ padding: 16, background: 'var(--ink-50)', border: '1px solid var(--ink-200)', borderRadius: 10, fontSize: 12 }}>
              {[
                ['Name',       name || '(unnamed)'],
                ['API',        apiName],
                ['Cloud',      cloud === 'aws' ? 'Amazon Web Services' : 'Microsoft Azure'],
                ['Region',     region],
                ['Environment',targetEnv],
                ['Tier',       tier],
                ['Network',    cloud === 'aws' ? 'PrivateLink + KMS' : 'Private Endpoint + Key Vault'],
                ['ETA',        cloud === 'aws' ? '~8 minutes' : '~11 minutes'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--ink-200)' }}>
                  <span style={{ color: 'var(--ink-500)' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink-800)', fontFamily: k === 'Region' ? 'var(--font-mono)' : 'var(--font-ui)', textTransform: k === 'Environment' || k === 'Tier' ? 'capitalize' : 'none' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, background: 'var(--appro-blue-50)', border: '1px solid var(--appro-blue-300)', borderRadius: 8, fontSize: 12, color: 'var(--ink-700)', marginTop: 14 }}>
              Appro will apply a {cloud === 'aws' ? 'CloudFormation stack' : 'Bicep deployment'} to your cloud account. You'll see progress in Environments · you can cancel any time in the next 15 minutes without charge.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
              <Btn variant="primary" icon="sparkle" onClick={() => { onClose(); window.toast && window.toast.success('Environment provisioning started', name + ' on ' + (cloud === 'aws' ? 'AWS' : 'Azure') + ' — track progress in Environments.'); }}>Launch environment</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Environments, ProvisionModal, CloudLogo });
