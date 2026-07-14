// Appro API Marketplace — REST API.
// Express + in-memory store + JWT. Serves the admin & customer portals with real,
// persisted-per-process data. No native modules — boots on any host.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const store = require('./db');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'appro-demo-secret';

// ---- CORS: explicit + bulletproof (set on every response, incl. errors) ----
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

// Seed on boot.
seed();

// ---- helpers ----
const uid = (p) => p + '-' + crypto.randomBytes(5).toString('hex');
const byId = (coll, id) => store[coll].find(x => x.id === id);
function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role, tenant_id: user.tenant_id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
}
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
const isPlatformAdmin = (u) => u.role === 'super_admin';

// ---- health ----
app.get('/health', (req, res) => res.json({ ok: true, service: 'appro-marketplace-api', products: store.products.length, time: new Date().toISOString() }));

// ---- auth ----
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = store.users.find(u => u.email === String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id } });
});

app.get('/me', auth, (req, res) => res.json({ user: req.user }));

// ---- products (catalogue) ----
app.get('/api/products', auth, (req, res) => {
  res.json([...store.products].sort((a, b) => a.name.localeCompare(b.name)));
});
app.get('/api/products/:id', auth, (req, res) => {
  const p = byId('products', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// ---- tenants (platform admin) ----
app.get('/api/tenants', auth, (req, res) => {
  if (!isPlatformAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
  const rows = [...store.tenants]
    .sort((a, b) => b.annual_spend - a.annual_spend)
    .map(t => ({ ...t, products: store.subscriptions.filter(s => s.tenant_id === t.id && s.status === 'active').length }));
  res.json(rows);
});

// ---- subscriptions ----
function subView(s) {
  const p = byId('products', s.product_id), t = byId('tenants', s.tenant_id);
  return { ...s, product_name: p ? p.name : s.product_id, tenant_name: t ? t.name : s.tenant_id };
}
app.get('/api/subscriptions', auth, (req, res) => {
  let rows = store.subscriptions;
  if (!isPlatformAdmin(req.user)) rows = rows.filter(s => s.tenant_id === req.user.tenant_id);
  res.json(rows.map(subView));
});

app.post('/api/subscriptions', auth, (req, res) => {
  const { product_id, environment = 'sandbox' } = req.body || {};
  const tenant_id = isPlatformAdmin(req.user) ? req.body.tenant_id : req.user.tenant_id;
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' });
  if (!byId('products', product_id)) return res.status(400).json({ error: 'Unknown product' });
  if (store.subscriptions.some(s => s.tenant_id === tenant_id && s.product_id === product_id && s.environment === environment)) {
    return res.status(409).json({ error: 'Already subscribed' });
  }
  const sub = { id: uid('SUB'), tenant_id, product_id, environment, status: environment === 'production' ? 'pending' : 'active', created_at: new Date().toISOString() };
  store.subscriptions.push(sub);
  res.status(201).json(sub);
});

app.patch('/api/subscriptions/:id', auth, (req, res) => {
  if (!isPlatformAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
  const { status } = req.body || {};
  if (!['active', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'bad status' });
  const sub = byId('subscriptions', req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  sub.status = status;
  res.json(sub);
});

app.delete('/api/subscriptions/:id', auth, (req, res) => {
  const sub = byId('subscriptions', req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  if (!isPlatformAdmin(req.user) && sub.tenant_id !== req.user.tenant_id) return res.status(403).json({ error: 'Forbidden' });
  store.subscriptions = store.subscriptions.filter(s => s.id !== req.params.id);
  res.status(204).end();
});

// ---- api keys (tenant-scoped) ----
app.get('/api/keys', auth, (req, res) => {
  let rows = store.apiKeys;
  if (!isPlatformAdmin(req.user)) rows = rows.filter(k => k.tenant_id === req.user.tenant_id);
  res.json([...rows].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')));
});

app.post('/api/keys', auth, (req, res) => {
  const tenant_id = req.user.tenant_id || req.body.tenant_id;
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' });
  const { name = 'New key', environment = 'sandbox' } = req.body || {};
  const secret = crypto.randomBytes(24).toString('hex');
  const prefix = `pk_${environment === 'production' ? 'live' : 'sbx'}_${secret.slice(0, 4)}`;
  const key = { id: uid('KEY'), tenant_id, name, environment, prefix, secret_last4: secret.slice(-4), status: 'active', created_at: new Date().toISOString() };
  store.apiKeys.push(key);
  res.status(201).json({ ...key, secret: `${prefix}_${secret}` }); // full secret returned once
});

app.post('/api/keys/:id/revoke', auth, (req, res) => {
  const key = byId('apiKeys', req.params.id);
  if (!key) return res.status(404).json({ error: 'Not found' });
  if (!isPlatformAdmin(req.user) && key.tenant_id !== req.user.tenant_id) return res.status(403).json({ error: 'Forbidden' });
  key.status = 'revoked';
  res.json(key);
});

// ---- admin overview stats ----
app.get('/api/stats', auth, (req, res) => {
  if (!isPlatformAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
  res.json({
    tenants: store.tenants.length,
    products: store.products.length,
    active_subscriptions: store.subscriptions.filter(s => s.status === 'active').length,
    pending_requests: store.subscriptions.filter(s => s.status === 'pending').length,
    annual_contract_value: store.tenants.reduce((a, t) => a + (t.annual_spend || 0), 0),
  });
});

app.listen(PORT, () => console.log(`Appro Marketplace API listening on :${PORT}`));
