// Admin screens — Overview, Catalog management, Onboard wizard, Requests, Tenants, Audit, Settings
const { CATEGORIES, SEED_APIS, ADMISSION_CRITERIA, loadPublished, savePublished, statusMeta } = window.ADMIN;

function Kpi({ label, value, delta, up, accent }) {
  return (
    <Card padding={18}>
      <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{value}</div>
        {delta && <span style={{ fontSize: 11, fontWeight: 700, color: up ? 'var(--success)' : 'var(--danger)' }}>{up ? '↑' : '↓'} {delta}</span>}
      </div>
      <div style={{ height: 3, borderRadius: 2, background: accent, marginTop: 12, opacity: .85 }}/>
    </Card>
  );
}

/* ============================ OVERVIEW ============================ */
function AdminOverview({ allApis, goTo, pendingReqs }) {
  const live = allApis.filter(a => a.status === 'live').length;
  const review = allApis.filter(a => a.status === 'review').length;
  const draft = allApis.filter(a => a.status === 'draft').length;
  const activity = [
    { t: '4 min ago', who: 'Rana Adel', what: 'published', target: 'Email Verification v1.3', icon: 'check', c: 'var(--success)' },
    { t: '1 h ago', who: 'System', what: 'received access request from', target: 'Nuqud Pay → AECB', icon: 'requests', c: 'var(--appro-blue)' },
    { t: '3 h ago', who: 'Karim H.', what: 'moved to review', target: 'Income Verification v0.9', icon: 'logs', c: 'var(--warning)' },
    { t: 'Yesterday', who: 'Rana Adel', what: 'deprecated', target: 'Statements & Documents v1.0', icon: 'alert', c: 'var(--danger)' },
  ];
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <Kpi label="APIs live" value={live} delta="+2" up accent="var(--success)"/>
        <Kpi label="In review" value={review} accent="var(--warning)"/>
        <Kpi label="Open access requests" value={pendingReqs} delta="+3" up accent="var(--appro-blue)"/>
        <Kpi label="Active tenants" value="18" delta="+1" up accent="#7C3AED"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Pipeline</div>
            <Btn variant="primary" size="sm" icon="plus" onClick={() => goTo('product-setup')}>Onboard new product</Btn>
          </div>
          <div style={{ padding: 20, display: 'grid', gap: 12 }}>
            {[
              { s: 'Draft', n: draft, c: 'var(--ink-400)', d: 'Being authored by product teams' },
              { s: 'In review', n: review, c: 'var(--warning)', d: 'Awaiting security & admission sign-off' },
              { s: 'Live', n: live, c: 'var(--success)', d: 'Published to the customer catalog' },
            ].map(p => (
              <div key={p.s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.c, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-800)' }}>{p.s}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{p.d}</div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{p.n}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-100)', fontSize: 14, fontWeight: 700, color: '#0C1931' }}>Recent activity</div>
          <div>
            {activity.map((a, i) => (
              <div key={i} style={{ padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: i < activity.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `color-mix(in srgb, ${a.c} 14%, white)`, color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} size={13}/></div>
                <div style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.45 }}><b style={{ color: 'var(--ink-900)' }}>{a.who}</b> {a.what} <span style={{ fontWeight: 600, color: 'var(--appro-blue)' }}>{a.target}</span></div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{a.t}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ CATALOG MANAGEMENT ============================ */
function AdminCatalog({ allApis, goTo, onPromote, onDeprecate }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const rows = allApis.filter(a => (f === 'all' || a.status === f) && a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <Card padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ink-100)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-100)', padding: '8px 12px', borderRadius: 8 }}>
            <Icon name="search" size={14}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search APIs…" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'var(--font-ui)' }}/>
          </div>
          <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 8, padding: 3, fontSize: 12, fontWeight: 600 }}>
            {['all','live','review','draft'].map(s => (
              <button key={s} onClick={() => setF(s)} style={{ background: f===s ? '#fff' : 'transparent', color: f===s ? 'var(--appro-blue)' : 'var(--ink-500)', border: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-ui)', boxShadow: f===s ? '0 1px 2px rgba(0,0,0,.06)' : 'none' }}>{s}</button>
            ))}
          </div>
          <Btn variant="primary" icon="plus" onClick={() => goTo('product-setup')}>Onboard new product</Btn>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: 'var(--ink-50)' }}>
            <tr>{['API','Category','Version','Hosting','Subscriptions','Status','Updated',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 18px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((a, i) => {
              const sm = statusMeta(a.status);
              const catLabel = (CATEGORIES.find(c => c.id === a.cat) || {}).label || a.cat;
              return (
                <tr key={a.id} style={{ borderBottom: i < rows.length-1 ? '1px solid var(--ink-100)' : 0 }}>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{a.name}</div>
                      {a.published && <span title="Published from admin" style={{ fontSize: 9, fontWeight: 700, color: 'var(--success)', background: 'var(--success-tint)', padding: '1px 6px', borderRadius: 4 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{a.id}</div>
                  </td>
                  <td style={{ padding: '13px 18px', color: 'var(--ink-600)' }}>{catLabel}</td>
                  <td style={{ padding: '13px 18px', fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{a.v}</td>
                  <td style={{ padding: '13px 18px' }}>{a.cloud ? <CloudChip cloud={a.cloud} region={a.region}/> : <span style={{ color: 'var(--ink-400)' }}>—</span>}</td>
                  <td style={{ padding: '13px 18px', fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>{a.subs}</td>
                  <td style={{ padding: '13px 18px' }}><StatusPill kind={sm.kind}>{sm.label}</StatusPill></td>
                  <td style={{ padding: '13px 18px', fontSize: 11.5, color: 'var(--ink-500)' }}>{a.updated}</td>
                  <td style={{ padding: '13px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {a.status === 'review' && <Btn variant="primary" size="sm" icon="check" onClick={() => onPromote(a)}>Publish</Btn>}
                    {a.status === 'draft' && <Btn variant="secondary" size="sm" onClick={() => onPromote(a, 'review')}>Send to review</Btn>}
                    {a.status === 'live' && <Btn variant="secondary" size="sm" icon="alert" onClick={() => onDeprecate(a)}>Deprecate</Btn>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================ ONBOARD WIZARD ============================ */
function OnboardWizard({ onCancel, onPublish }) {
  const [step, setStep] = useState(1);
  const TOTAL = 5;
  const [f, setF] = useState({
    name: '', cat: 'identity', v: 'v1.0', desc: '', owner: '', auth: 'OAuth 2.0', rate: '100 req/s',
    cloud: 'aws', region: 'me-central-1', baseUrl: '', publishTo: 'live',
    scopes: [{ name: '', desc: '' }],
    endpoints: [{ m: 'GET', path: '', d: '' }],
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const [checks, setChecks] = useState(() => ADMISSION_CRITERIA.reduce((o, c) => (o[c] = false, o), {}));
  const allChecked = Object.values(checks).every(Boolean);

  const slug = f.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const step1Valid = f.name.trim() && f.desc.trim() && f.owner.trim();
  const step2Valid = f.endpoints.some(e => e.path.trim());
  const canNext = (step === 1 && step1Valid) || (step === 2 && step2Valid) || step === 3 || (step === 4 && allChecked);

  const lbl = { fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' };
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--ink-300)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', color: 'var(--ink-800)' };

  const publish = () => {
    const record = {
      id: slug || 'api-' + Date.now(), name: f.name.trim(), cat: f.cat, v: f.v, status: f.publishTo,
      desc: f.desc.trim(), owner: f.owner.trim() || 'Platform', auth: f.auth, rate: f.rate,
      cloud: f.cloud, region: f.region, subscribed: false, variants: 1,
      color: 'var(--appro-blue)', published: true, updated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    onPublish(record);
  };

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      <button onClick={onCancel} style={{ background: 'transparent', border: 0, color: 'var(--ink-500)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>← Back to catalog</button>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, maxWidth: 820 }}>
        {['Basics','Endpoints','Hosting','Admission','Review'].map((l, i) => {
          const n = i+1, done = n < step, cur = n === step;
          return (
            <div key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: done ? 'var(--success)' : cur ? 'var(--appro-blue)' : '#fff', border: done||cur ? 0 : '1.5px solid var(--ink-300)', color: done||cur ? '#fff' : 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{done ? <Icon name="check" size={12} stroke={3}/> : n}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: cur ? '#0C1931' : 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</span>
              {i < 4 && <div style={{ flex: 1, height: 1, background: 'var(--ink-200)' }}/>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
        <Card>
          {step === 1 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>API basics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
                <div><label style={lbl}>API name</label><input style={inp} value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Income Verification"/></div>
                <div><label style={lbl}>Version</label><input style={inp} value={f.v} onChange={e => set('v', e.target.value)} placeholder="v1.0"/></div>
              </div>
              {f.name && <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: -8 }}>API ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--appro-blue)' }}>{slug}</span></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Category</label>
                  <select style={inp} value={f.cat} onChange={e => set('cat', e.target.value)}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                </div>
                <div><label style={lbl}>Technical owner</label><input style={inp} value={f.owner} onChange={e => set('owner', e.target.value)} placeholder="e.g. Credit Team"/></div>
              </div>
              <div><label style={lbl}>Description</label><textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="What does this API do? Shown on the customer catalog card."/></div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Endpoints & scopes</div>
              <div>
                <label style={lbl}>Endpoints</label>
                <div style={{ display: 'grid', gap: 8 }}>
                  {f.endpoints.map((e, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 32px', gap: 8, alignItems: 'center' }}>
                      <select style={inp} value={e.m} onChange={ev => { const n=[...f.endpoints]; n[i]={...e,m:ev.target.value}; set('endpoints',n); }}>{['GET','POST','PUT','DELETE'].map(m => <option key={m}>{m}</option>)}</select>
                      <input style={{ ...inp, fontFamily: 'var(--font-mono)', fontSize: 12 }} value={e.path} onChange={ev => { const n=[...f.endpoints]; n[i]={...e,path:ev.target.value}; set('endpoints',n); }} placeholder="/v1/verify"/>
                      <input style={inp} value={e.d} onChange={ev => { const n=[...f.endpoints]; n[i]={...e,d:ev.target.value}; set('endpoints',n); }} placeholder="Description"/>
                      <button onClick={() => set('endpoints', f.endpoints.filter((_,x)=>x!==i))} disabled={f.endpoints.length===1} style={{ background: 'transparent', border: '1px solid var(--ink-200)', borderRadius: 6, cursor: f.endpoints.length===1?'not-allowed':'pointer', color: 'var(--ink-500)', height: 36, opacity: f.endpoints.length===1?.4:1 }}><Icon name="trash" size={13}/></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => set('endpoints', [...f.endpoints, { m:'GET', path:'', d:'' }])} style={{ marginTop: 8, background: 'transparent', border: '1.5px dashed var(--ink-300)', borderRadius: 8, padding: '8px 12px', color: 'var(--appro-blue)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={13}/> Add endpoint</button>
              </div>
              <div>
                <label style={lbl}>Auth & rate limit</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <select style={inp} value={f.auth} onChange={e => set('auth', e.target.value)}>{['OAuth 2.0','mTLS + OAuth','OAuth 2.0 + FAPI','API key'].map(a => <option key={a}>{a}</option>)}</select>
                  <input style={inp} value={f.rate} onChange={e => set('rate', e.target.value)} placeholder="100 req/s"/>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931' }}>Hosting & data residency</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ c:'aws', r:'me-central-1', t:'AWS · me-central-1 (UAE)' }, { c:'aws', r:'me-south-1', t:'AWS · me-south-1 (Bahrain)' }, { c:'azure', r:'UAE North', t:'Azure · UAE North' }, { c:'azure', r:'UAE Central', t:'Azure · UAE Central' }].map(o => (
                  <div key={o.c+o.r} onClick={() => { set('cloud', o.c); set('region', o.r); }} style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: (f.cloud===o.c && f.region===o.r) ? '2px solid var(--appro-blue)' : '1px solid var(--ink-200)', background: (f.cloud===o.c && f.region===o.r) ? 'var(--appro-blue-50)' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CloudChip cloud={o.c} region={o.r}/><span style={{ fontSize: 12, color: 'var(--ink-700)', flex: 1 }}>{o.t}</span>
                  </div>
                ))}
              </div>
              <div><label style={lbl}>Base URL (production)</label><input style={{ ...inp, fontFamily: 'var(--font-mono)', fontSize: 12 }} value={f.baseUrl} onChange={e => set('baseUrl', e.target.value)} placeholder="https://api.appro.ae/v1/income"/></div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', marginBottom: 4 }}>Marketplace admission checklist</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 16 }}>An API can only go live once every mandatory criterion is met.</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {ADMISSION_CRITERIA.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid ' + (checks[c] ? 'var(--success)' : 'var(--ink-200)'), background: checks[c] ? 'rgba(0,178,122,.05)' : '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, color: 'var(--ink-800)' }}>
                    <input type="checkbox" checked={checks[c]} onChange={e => setChecks(s => ({ ...s, [c]: e.target.checked }))}/>{c}
                  </label>
                ))}
              </div>
              <button onClick={() => setChecks(ADMISSION_CRITERIA.reduce((o,c)=>(o[c]=true,o),{}))} style={{ marginTop: 10, background: 'transparent', border: 0, color: 'var(--appro-blue)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Mark all complete</button>
            </div>
          )}

          {step === 5 && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', marginBottom: 14 }}>Review & publish</div>
              <div style={{ border: '1px solid var(--ink-200)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                {[
                  ['Name', f.name + ' · ' + f.v], ['API ID', slug], ['Category', (CATEGORIES.find(c=>c.id===f.cat)||{}).label],
                  ['Owner', f.owner], ['Auth', f.auth], ['Rate', f.rate],
                  ['Endpoints', f.endpoints.filter(e=>e.path).length + ' defined'],
                  ['Hosting', f.cloud.toUpperCase() + ' · ' + f.region], ['Admission', Object.values(checks).filter(Boolean).length + '/' + ADMISSION_CRITERIA.length + ' met'],
                ].map((r, i, arr) => (
                  <div key={r[0]} style={{ display: 'flex', padding: '11px 14px', borderBottom: i < arr.length-1 ? '1px solid var(--ink-100)' : 0, fontSize: 12.5 }}>
                    <div style={{ width: 130, color: 'var(--ink-500)' }}>{r[0]}</div><div style={{ flex: 1, color: 'var(--ink-900)', fontWeight: 600 }}>{r[1]}</div>
                  </div>
                ))}
              </div>
              <label style={lbl}>Publish target</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ id:'review', t:'Send to review', d:'Stays internal until approved' }, { id:'live', t:'Publish live', d:'Appears in customer catalog now' }].map(o => (
                  <div key={o.id} onClick={() => set('publishTo', o.id)} style={{ padding: 12, borderRadius: 10, cursor: 'pointer', border: f.publishTo===o.id ? '2px solid var(--appro-blue)' : '1px solid var(--ink-200)', background: f.publishTo===o.id ? 'var(--appro-blue-50)' : '#fff' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>{o.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{o.d}</div>
                  </div>
                ))}
              </div>
              {f.publishTo === 'live' && !allChecked && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="alert" size={13}/> All admission criteria must be met before going live.</div>}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--ink-100)' }}>
            <Btn variant="ghost" onClick={step === 1 ? onCancel : () => setStep(step-1)}>{step === 1 ? 'Cancel' : '← Back'}</Btn>
            {step < TOTAL
              ? <Btn variant="primary" icon="arrow" disabled={!canNext} onClick={() => setStep(step+1)}>Continue</Btn>
              : <Btn variant="primary" icon="check" disabled={f.publishTo === 'live' && !allChecked} onClick={publish}>{f.publishTo === 'live' ? 'Publish to catalog' : 'Save & send to review'}</Btn>}
          </div>
        </Card>

        {/* Live preview */}
        <div style={{ position: 'sticky', top: 92 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Customer card preview</div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--ink-200)', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="zap" size={18}/></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', fontFamily: 'var(--font-display)' }}>{f.name || 'API name'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{f.owner || 'Owner team'}</div>
              </div>
              <StatusPill kind={f.publishTo === 'live' ? 'live' : 'pending'}>{f.publishTo === 'live' ? 'Live' : 'Draft'}</StatusPill>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.5, minHeight: 40 }}>{f.desc || 'Description shown to customers will appear here.'}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <CloudChip cloud={f.cloud} region={f.region}/>
              <span style={{ fontSize: 11, color: 'var(--ink-600)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{f.rate}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 10, lineHeight: 1.5 }}>Publishing live writes to the shared catalog — it appears immediately in the Customer Portal's API Catalog.</div>
        </div>
      </div>
    </div>
  );
}

window.AdminOverview = AdminOverview;
window.AdminCatalog = AdminCatalog;
window.OnboardWizard = OnboardWizard;
