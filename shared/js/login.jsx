// Shared login gate for the Appro portals. Loaded after Shell.jsx (uses Icon, Btn, ApproWordmark).
// Usage: const [authed, setAuthed] = useState(()=>localStorage.getItem(KEY)==='1');
//        if (!authed) return <LoginScreen variant="customer|admin" onLogin={...} />;

// Demo-valid credentials (any other password fails so the lockout UX is demonstrable).
const DEMO_VALID = { customer: { email: 'amira@nuqud.ae', pw: 'appro1234' }, admin: { email: 'rana.adel@appro.ae', pw: 'appro1234' } };
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 300; // 5-minute cooldown

function LoginScreen({ variant = 'customer', onLogin }) {
  const { useState, useEffect, useRef } = React;
  const isAdmin = variant === 'admin';
  const LOCK_KEY = 'appro.lock.' + variant;
  const ATTEMPT_KEY = 'appro.attempts.' + variant;

  const [mode, setMode] = useState('signin'); // 'signin' | 'forgot' | 'sent' | 'reset' | 'done'
  const [email, setEmail] = useState(isAdmin ? DEMO_VALID.admin.email : DEMO_VALID.customer.email);
  const [pw, setPw] = useState('appro1234');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetErr, setResetErr] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [resetPwErr, setResetPwErr] = useState('');

  // failed-attempt + lockout state
  const [attempts, setAttempts] = useState(() => { const n = parseInt(sessionStorage.getItem(ATTEMPT_KEY) || '0', 10); return isNaN(n) ? 0 : n; });
  const [lockUntil, setLockUntil] = useState(() => { const t = parseInt(sessionStorage.getItem(LOCK_KEY) || '0', 10); return t > Date.now() ? t : 0; });
  const [now, setNow] = useState(Date.now());
  const tick = useRef(null);

  const locked = lockUntil > now;
  const remainingLock = Math.max(0, Math.ceil((lockUntil - now) / 1000));
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts);

  useEffect(() => {
    if (!locked) return;
    tick.current = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(tick.current);
  }, [locked]);
  useEffect(() => {
    if (lockUntil && now >= lockUntil) { // cooldown elapsed → reset
      setLockUntil(0); setAttempts(0); setErr('');
      sessionStorage.removeItem(LOCK_KEY); sessionStorage.removeItem(ATTEMPT_KEY);
    }
  }, [now, lockUntil]);

  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const valid = emailOk && pw.length >= 1;
  const resetOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(resetEmail);

  const accent = isAdmin ? '#1D4ED8' : 'var(--appro-blue)';
  const inp = { width: '100%', height: 44, padding: '0 12px', border: '1px solid var(--ink-300)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', color: 'var(--ink-900)' };
  const lab = { fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 6, display: 'block', fontFamily: 'var(--font-ui)' };

  const onSuccess = () => {
    setBusy(false);
    setAttempts(0); sessionStorage.removeItem(ATTEMPT_KEY); sessionStorage.removeItem(LOCK_KEY);
    onLogin && onLogin({ email });
  };
  const onFail = () => {
    setBusy(false);
    const next = attempts + 1;
    setAttempts(next); sessionStorage.setItem(ATTEMPT_KEY, String(next));
    if (next >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCK_SECONDS * 1000;
      setLockUntil(until); setNow(Date.now()); sessionStorage.setItem(LOCK_KEY, String(until));
      setErr('');
      window.toast && window.toast.error('Account locked', 'Too many failed attempts. Try again in 5 minutes or reset your password.');
    } else {
      setErr('invalid');
    }
  };

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (locked) return;
    if (!valid) { setErr('Enter your email and password to continue.'); return; }
    setErr(''); setBusy(true);

    // Real backend when configured; otherwise the built-in demo credentials.
    if (window.approApi && window.approApi.enabled()) {
      window.approApi.login(email.trim(), pw)
        .then(() => onSuccess())
        .catch((err) => {
          if (err && err.status && err.status !== 401 && err.status !== 400) {
            // Backend unreachable/error (e.g. cold start) — fall back to demo creds so the demo never locks up.
            const good = DEMO_VALID[variant];
            if (email.trim().toLowerCase() === good.email && pw === good.pw) return onSuccess();
          }
          onFail();
        });
      return;
    }

    setTimeout(() => {
      const good = DEMO_VALID[variant];
      const ok = email.trim().toLowerCase() === good.email && pw === good.pw;
      if (ok) return onSuccess();
      onFail();
    }, 850);
  };

  const sendReset = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!resetOk) { setResetErr('Enter a valid email address.'); return; }
    setResetErr(''); setBusy(true);
    setTimeout(() => { setBusy(false); setMode('sent'); }, 850);
  };

  const goForgot = () => { setResetEmail(email); setResetErr(''); setMode('forgot'); };

  const tooShort = newPw.length > 0 && newPw.length < 8;
  const mismatch = confirmPw.length > 0 && newPw !== confirmPw;
  const resetPwValid = newPw.length >= 8 && newPw === confirmPw;
  const submitNewPw = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!resetPwValid) { setResetPwErr('Enter a password of at least 8 characters in both fields.'); return; }
    setResetPwErr(''); setBusy(true);
    setTimeout(() => { setBusy(false); setNewPw(''); setConfirmPw(''); setMode('done'); }, 850);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-ui)' }}>
      {/* Left brand panel */}
      <div style={{ flex: '1 1 46%', background: 'linear-gradient(155deg,#0C1931 0%,#11254A 55%,#1D4ED8 130%)', color: '#fff', padding: '48px 52px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -90, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,126,246,.45), transparent 70%)' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ApproWordmark height={30} mono/>
        </div>
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 999, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isAdmin ? '#FFB020' : '#3B7EF6' }}/>
            {isAdmin ? 'Admin Console' : 'Customer Portal'}
          </div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 34, fontWeight: 700, lineHeight: 1.15, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', maxWidth: 440 }}>
            {isAdmin ? 'Govern the API Marketplace' : 'Build on the API Marketplace'}
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.6, maxWidth: 420 }}>
            {isAdmin
              ? 'Onboard tenants, publish products, manage pricing and oversee usage across every organization.'
              : 'Discover products, provision environments, manage credentials, and monitor usage in one secure workspace.'}
          </p>
          <div style={{ display: 'flex', gap: 22, marginTop: 34 }}>
            {(isAdmin ? [['35', 'Products'], ['18', 'Tenants'], ['99.9%', 'Uptime']] : [['35', 'Products'], ['2', 'Clouds'], ['UAE', 'Resident']]).map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{n}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)', letterSpacing: '.04em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, marginTop: 40, fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>© 2026 Appro · UAE-first API Marketplace</div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: '1 1 54%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>

        {mode === 'signin' && (
          <form onSubmit={submit} style={{ width: '100%', maxWidth: 380 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Sign in</h2>
            <p style={{ margin: '6px 0 26px', fontSize: 13.5, color: 'var(--ink-500)' }}>{isAdmin ? 'Appro platform administrators only.' : 'Use your organization workspace credentials.'}</p>

            {locked && (
              <div style={{ background: 'var(--danger-tint)', border: '1px solid rgba(229,72,77,.35)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, display: 'flex', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="lock" size={17}/></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1931' }}>Account temporarily locked</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-600)', marginTop: 2, lineHeight: 1.5 }}>Too many failed attempts. Try again in <b style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{mmss(remainingLock)}</b>, or <a href="#" onClick={e => { e.preventDefault(); goForgot(); }} style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>reset your password</a>.</div>
                </div>
              </div>
            )}

            {err === 'invalid' && !locked && (
              <div style={{ background: 'var(--danger-tint)', border: '1px solid rgba(229,72,77,.35)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, display: 'flex', gap: 10 }}>
                <Icon name="alert" size={16}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0C1931' }}>Incorrect email or password</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>
                    {remainingAttempts <= 2
                      ? <><b style={{ color: 'var(--danger)' }}>{remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} left</b> before your account is locked.</>
                      : 'Please check your details and try again.'}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={lab}>Work email</label>
              <input disabled={locked} style={{ ...inp, borderColor: (err && !emailOk) || err === 'invalid' ? 'var(--danger)' : 'var(--ink-300)', background: locked ? 'var(--ink-50)' : '#fff' }} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.ae" autoFocus/>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={lab}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={show ? 'text' : 'password'} disabled={locked} style={{ ...inp, paddingRight: 42, borderColor: err === 'invalid' ? 'var(--danger)' : 'var(--ink-300)', background: locked ? 'var(--ink-50)' : '#fff' }} value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter your password"/>
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: 11, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)' }}><Icon name={show ? 'eyeoff' : 'eye'} size={16}/></button>
              </div>
            </div>

            {err && err !== 'invalid' && <div style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon name="alert" size={13}/> {err}</div>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 20px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-600)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked/> Remember me
              </label>
              <a href="#" onClick={e => { e.preventDefault(); goForgot(); }} style={{ fontSize: 12.5, color: accent, fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
            </div>

            <Btn variant="primary" size="lg" disabled={busy || locked} onClick={submit} style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 14.5, opacity: locked ? 0.6 : 1 }}>
              {locked ? 'Locked · try again in ' + mmss(remainingLock) : busy ? 'Signing in…' : (isAdmin ? 'Sign in to Admin Console' : 'Sign in to Customer Portal')}
            </Btn>

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--ink-100)', fontSize: 12.5, color: 'var(--ink-500)', textAlign: 'center' }}>
              {isAdmin
                ? <>Not an admin? <a href="../customer/" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Go to the Customer Portal →</a></>
                : <>Need a workspace? <a href="#" onClick={e => { e.preventDefault(); window.toast && window.toast.info('Request access', 'Ask your Appro account manager to onboard your organization.'); }} style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Request access →</a></>}
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={sendReset} style={{ width: '100%', maxWidth: 380 }}>
            <button type="button" onClick={() => setMode('signin')} style={{ background: 'transparent', border: 0, color: 'var(--ink-500)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 18, padding: 0 }}>← Back to sign in</button>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Reset your password</h2>
            <p style={{ margin: '6px 0 26px', fontSize: 13.5, color: 'var(--ink-500)' }}>Enter your work email and we'll send a secure link to reset your password.</p>

            <div style={{ marginBottom: 8 }}>
              <label style={lab}>Work email</label>
              <input style={{ ...inp, borderColor: resetErr ? 'var(--danger)' : 'var(--ink-300)' }} value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@company.ae" autoFocus/>
              {resetErr && <div style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}><Icon name="alert" size={13}/> {resetErr}</div>}
            </div>

            <Btn variant="primary" size="lg" disabled={busy} onClick={sendReset} style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 14.5, marginTop: 14 }}>
              {busy ? 'Sending…' : 'Send reset link'}
            </Btn>

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--ink-100)', fontSize: 12.5, color: 'var(--ink-500)', textAlign: 'center' }}>
              Remembered it? <a href="#" onClick={e => { e.preventDefault(); setMode('signin'); }} style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Back to sign in</a>
            </div>
          </form>
        )}

        {mode === 'sent' && (
          <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--success-tint)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon name="check" size={28} stroke={3}/>
            </div>
            <h2 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Check your inbox</h2>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>
              If an account exists for <b style={{ color: 'var(--ink-800)' }}>{resetEmail}</b>, we've sent a password-reset link. It expires in 30 minutes.
            </p>
            <div style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', borderRadius: 10, padding: '12px 14px', margin: '22px 0', fontSize: 12, color: 'var(--ink-500)', textAlign: 'left', display: 'flex', gap: 10 }}>
              <Icon name="info" size={15}/>
              <span>Didn't get it? Check spam, or make sure you used the email registered with your workspace.</span>
            </div>
            <Btn variant="secondary" size="lg" onClick={() => setMode('forgot')} style={{ width: '100%', justifyContent: 'center', height: 44, marginBottom: 10 }}>Resend link</Btn>
            <Btn variant="primary" size="lg" onClick={() => setMode('reset')} style={{ width: '100%', justifyContent: 'center', height: 44 }}>I have the link → set new password</Btn>
          </div>
        )}

        {mode === 'reset' && (
          <form onSubmit={submitNewPw} style={{ width: '100%', maxWidth: 380 }}>
            <button type="button" onClick={() => setMode('signin')} style={{ background: 'transparent', border: 0, color: 'var(--ink-500)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 18, padding: 0 }}>← Back to sign in</button>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Set a new password</h2>
            <p style={{ margin: '6px 0 24px', fontSize: 13.5, color: 'var(--ink-500)' }}>Choose a strong password for <b style={{ color: 'var(--ink-800)' }}>{resetEmail || email}</b>.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={lab}>New password</label>
              <div style={{ position: 'relative' }}>
                <input type={showNew ? 'text' : 'password'} style={{ ...inp, paddingRight: 42, borderColor: tooShort ? 'var(--danger)' : 'var(--ink-300)' }} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" autoFocus/>
                <button type="button" onClick={() => setShowNew(s => !s)} style={{ position: 'absolute', right: 10, top: 11, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)' }}><Icon name={showNew ? 'eyeoff' : 'eye'} size={16}/></button>
              </div>
              {tooShort && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>Min. 8 characters.</div>}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={lab}>Confirm new password</label>
              <input type={showNew ? 'text' : 'password'} style={{ ...inp, borderColor: mismatch ? 'var(--danger)' : 'var(--ink-300)' }} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password"/>
              {mismatch && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>Passwords don't match.</div>}
            </div>

            {resetPwErr && <div style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon name="alert" size={13}/> {resetPwErr}</div>}

            <Btn variant="primary" size="lg" disabled={busy || !resetPwValid} onClick={submitNewPw} style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 14.5, marginTop: 14 }}>
              {busy ? 'Saving…' : 'Reset password'}
            </Btn>
          </form>
        )}

        {mode === 'done' && (
          <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--success-tint)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon name="check" size={28} stroke={3}/>
            </div>
            <h2 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Password updated</h2>
            <p style={{ margin: '10px 0 24px', fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>Your password has been reset. Sign in with your new password to continue.</p>
            <Btn variant="primary" size="lg" onClick={() => { setPw(''); setMode('signin'); }} style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 14.5 }}>Back to sign in</Btn>
          </div>
        )}

      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
