// Verification (KYC/KYB) screen + banner for incomplete customers

function VerificationBanner({ status, goTo }) {
  if (status === 'verified') return null;
  const cfg = status === 'review' ? {
    bg: 'linear-gradient(90deg,#FFF7D6,#FEFBEE)', bd: 'rgba(235,190,0,.4)',
    dot: 'var(--warning)', icon: 'refresh',
    title: 'Verification under review',
    body: 'Our compliance team is reviewing your documents. Sandbox access with synthetic data is available. Production is disabled until review completes.',
    cta: 'View status',
  } : {
    bg: 'linear-gradient(90deg,#FDECEC,#FEF6F6)', bd: 'rgba(229,72,77,.35)',
    dot: 'var(--danger)', icon: 'allowlist',
    title: 'Complete your verification to unlock the portal',
    body: 'We need your passport/Emirates ID, trade licence, and authorized signatory before production access can be granted. Takes about 8 minutes.',
    cta: 'Complete verification',
  };
  return (
    <div style={{
      margin: '16px 28px 0', padding: '14px 18px', borderRadius: 10,
      background: cfg.bg, border: `1px solid ${cfg.bd}`,
      display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-ui)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: '#fff', border: `1px solid ${cfg.bd}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.dot,
      }}>
        <Icon name={cfg.icon} size={18}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, animation: status === 'review' ? 'pulse 1.6s infinite' : 'none' }}/>
          {cfg.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>{cfg.body}</div>
      </div>
      <Btn variant={status === 'incomplete' ? 'primary' : 'secondary'} size="sm"
           icon={status === 'incomplete' ? 'arrow' : null}
           onClick={() => goTo('verification')}>{cfg.cta}</Btn>
    </div>
  );
}

function Verification({ status, setStatus }) {
  const { useState } = React;
  const initial = status === 'review' ? 4 : 1;
  const [step, setStep] = useState(initial);
  const [passportFile, setPassportFile] = useState(status === 'review');
  const [eidFile, setEidFile]           = useState(status === 'review');
  const [licenceFile, setLicenceFile]   = useState(status === 'review');
  const [moaFile, setMoaFile]           = useState(false);
  const steps = [
    { n: 1, t: 'Individual identity',   s: 'Passport or Emirates ID of the applicant' },
    { n: 2, t: 'Business verification', s: 'Trade licence & incorporation documents' },
    { n: 3, t: 'Authorized signatory',  s: 'Directors, shareholders & beneficial owners' },
    { n: 4, t: 'Review & submit',        s: 'We review within 1 business day' },
  ];

  const uploadTile = (label, sub, on, setOn, req) => (
    <div style={{
      border: `1.5px ${on ? 'solid var(--success)' : 'dashed var(--ink-300)'}`, borderRadius: 10,
      padding: 16, background: on ? 'var(--success-tint)' : 'var(--ink-50)',
      display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
    }} onClick={() => setOn(!on)}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: on ? 'var(--success)' : 'var(--appro-blue)', flexShrink: 0 }}>
        <Icon name={on ? 'check' : 'plus'} size={18} stroke={2.5}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>
          {label} {req && <span style={{ color: 'var(--danger)' }}>*</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--success)' : 'var(--ink-500)', whiteSpace: 'nowrap' }}>
        {on ? 'Uploaded' : 'Choose file'}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {/* Summary strip */}
      <Card style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', background: 'linear-gradient(90deg,#0C1931,#132551)', color: '#fff', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="lock" size={22}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Verification · Nuqud Pay</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>
              {status === 'incomplete' ? 'Finish verifying your organization' : 'Your documents are under review'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>
              {status === 'incomplete'
                ? 'Required for production access. Sandbox remains limited to 500 requests/day until verified.'
                : 'Estimated turnaround 1 business day. You can keep building in sandbox meanwhile.'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
            <StatusPill kind={status === 'review' ? 'review' : 'pending'}>
              {status === 'review' ? 'Under review' : 'Incomplete'}
            </StatusPill>
            <button onClick={() => setStatus('verified')} style={{
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
              color: 'rgba(255,255,255,.9)', fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 6,
              cursor: 'pointer', fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap',
            }}>(demo) mark verified</button>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '0 14px' }}>
          {steps.map((s, i) => {
            const done = i + 1 < step;
            const active = i + 1 === step;
            return (
              <button key={s.n} onClick={() => setStep(s.n)} style={{
                padding: '16px 14px', background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer',
                borderTop: active ? '3px solid var(--appro-blue)' : '3px solid transparent',
                borderBottom: '1px solid var(--ink-100)', fontFamily: 'var(--font-ui)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: done ? 'var(--success)' : active ? 'var(--appro-blue)' : 'var(--ink-100)',
                    color: done || active ? '#fff' : 'var(--ink-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>{done ? <Icon name="check" size={14} stroke={3}/> : s.n}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#0C1931' : 'var(--ink-700)' }}>{s.t}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 1 }}>{s.s}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <Card>
          {step === 1 && (
            <div>
              <SectionHeader title="Who is signing up?" subtitle="We verify the individual applying on behalf of Nuqud Pay."/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Field label="Full name (as on document)" value="Amira Saleh Al Mansoori"/>
                <Field label="Nationality" value="United Arab Emirates"/>
                <Field label="Date of birth" value="14 Aug 1989"/>
                <Field label="Position" value="Head of Platform"/>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 8 }}>Upload documents</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {uploadTile('Passport — bio page',   'Clear colour scan, PDF or JPG · max 10MB', passportFile, setPassportFile, true)}
                {uploadTile('Emirates ID — both sides', 'Required for UAE residents', eidFile, setEidFile, true)}
                {uploadTile('Selfie with document', 'For liveness matching · optional', false, () => {}, false)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                <Btn variant="secondary" onClick={() => window.toast && window.toast.info('Progress saved', 'You can finish verification later.')}>Save & exit</Btn>
                <Btn variant="primary" icon="arrow" onClick={() => setStep(2)}>Continue</Btn>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <SectionHeader title="Business verification (KYB)" subtitle="Everything we need to confirm Nuqud Pay is a real, regulated entity."/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Field label="Legal entity" value="Nuqud Pay FZ-LLC"/>
                <Field label="Trade licence number" value="CN-1184820"/>
                <Field label="Jurisdiction" value="UAE · CBUAE regulated"/>
                <Field label="Licence issue date" value="12 Feb 2018"/>
                <Field label="Registered address" value="Level 34, ICD Brookfield Place, DIFC, Dubai"/>
                <Field label="Website" value="https://nuqud.ae"/>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 8 }}>Upload documents</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {uploadTile('Trade licence (Mainland or DIFC)', 'Current, not expired', licenceFile, setLicenceFile, true)}
                {uploadTile('Memorandum & Articles of Association', 'As filed with the regulator', moaFile, setMoaFile, true)}
                {uploadTile('Certificate of incorporation', 'From Ministry of Economy', false, () => {}, true)}
                {uploadTile('Good standing certificate', 'If issued in the last 6 months · optional', false, () => {}, false)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
                <Btn variant="primary" icon="arrow" onClick={() => setStep(3)}>Continue</Btn>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <SectionHeader title="Authorized signatories & beneficial owners"
                subtitle="UAE AML requires us to identify anyone with ≥25% ownership or signing authority."/>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { n: 'Omar Al Nuaimi',   r: 'Chairman · signatory', o: '32%', v: 'verified' },
                  { n: 'Amira Saleh',       r: 'Head of Platform · signatory', o: '—', v: 'verified' },
                  { n: 'Nuqud Holdings Ltd',r: 'Corporate shareholder', o: '41%', v: 'review' },
                  { n: 'Hassan Qureshi',    r: 'CFO · signatory', o: '4%',  v: 'pending' },
                ].map(p => (
                  <div key={p.n} style={{ padding: '12px 14px', border: '1px solid var(--ink-200)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--appro-blue-100)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {p.n.split(' ').map(x=>x[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{p.n}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{p.r} · ownership {p.o}</div>
                    </div>
                    <StatusPill kind={p.v === 'verified' ? 'active' : p.v}>
                      {p.v === 'verified' ? 'Verified' : p.v === 'review' ? 'Under review' : 'Awaiting docs'}
                    </StatusPill>
                  </div>
                ))}
                <button style={{
                  padding: '12px 14px', border: '1.5px dashed var(--ink-300)', borderRadius: 10,
                  background: 'transparent', color: 'var(--appro-blue)', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                }}>
                  <Icon name="plus" size={14}/> Add person or entity
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
                <Btn variant="primary" icon="arrow" onClick={() => setStep(4)}>Continue</Btn>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <SectionHeader title="Review & submit"
                subtitle={status === 'review' ? 'Your application is being reviewed.' : 'Last chance to edit anything before we start review.'}/>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { k: 'Individual identity (Amira Saleh)',         v: 'Passport + Emirates ID uploaded', ok: true },
                  { k: 'Business verification',                      v: 'Trade licence, incorporation on file', ok: status === 'review' },
                  { k: 'Authorized signatories',                     v: '3 of 4 verified · 1 under review', ok: false },
                  { k: 'Sanctions & PEP screening',                  v: status === 'review' ? 'Running · 4 of 12 checks complete' : 'Will run on submit', ok: false },
                  { k: 'Trade licence authenticity check (MOHRE/DED)', v: status === 'review' ? 'In progress' : 'Queued', ok: false },
                ].map(r => (
                  <div key={r.k} style={{ padding: '12px 14px', background: 'var(--ink-50)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: r.ok ? 'var(--success)' : 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={r.ok ? 'check' : 'refresh'} size={12} stroke={3}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>{r.k}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: 12, background: 'var(--appro-blue-50)', border: '1px solid var(--appro-blue-300)', borderRadius: 8, fontSize: 12, color: 'var(--ink-700)' }}>
                By submitting, you confirm the documents represent Nuqud Pay FZ-LLC and authorize Appro to run sanctions, PEP, and adverse-media checks under UAE AML regulations.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <Btn variant="ghost" onClick={() => setStep(3)}>← Back</Btn>
                {status === 'incomplete'
                  ? <Btn variant="primary" icon="arrow" onClick={() => { setStatus('review'); window.toast && window.toast.success('Submitted for review', 'Our compliance team will respond within 1 business day.'); }}>Submit for review</Btn>
                  : <Btn variant="secondary" onClick={() => window.toast && window.toast.info('Message sent to compliance', 'We\u2019ll reply to your registered email.')}>Contact compliance</Btn>}
              </div>
            </div>
          )}
        </Card>

        <div>
          <Card style={{ marginBottom: 14 }}>
            <SectionHeader title="What you can do now"/>
            <div style={{ display: 'grid', gap: 10, fontSize: 12 }}>
              {[
                { on: true, t: 'Browse the API catalog' },
                { on: true, t: 'Invite teammates (up to 5)' },
                { on: true, t: 'Try sandbox APIs · capped at 500 req/day' },
                { on: false, t: 'Provision production environments' },
                { on: false, t: 'Create production API keys' },
                { on: false, t: 'Use customer (non-synthetic) data' },
              ].map(r => (
                <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: r.on ? 'var(--success)' : 'var(--ink-100)',
                    color: r.on ? '#fff' : 'var(--ink-400)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name={r.on ? 'check' : 'lock'} size={10} stroke={3}/></div>
                  <span style={{ color: r.on ? 'var(--ink-800)' : 'var(--ink-500)' }}>{r.t}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionHeader title="Need a hand?"/>
            <div style={{ fontSize: 12, color: 'var(--ink-600)', lineHeight: 1.55 }}>
              Our onboarding team can walk you through UAE-specific requirements, or connect directly with your compliance officer.
            </div>
            <Btn variant="secondary" size="sm" icon="external" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>Book a 15-min call</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ padding: '9px 12px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 13, color: 'var(--ink-800)', background: 'var(--ink-50)' }}>{value}</div>
    </div>
  );
}

Object.assign(window, { Verification, VerificationBanner, VerificationField: Field });
