// Appro API Marketplace — REST API.
// Express + SQLite + JWT. Serves the admin & customer portals with real, persisted data.
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(cors()); // demo: allow any origin (GitHub Pages, localhost). Lock down for production.
app.use(express.json());

// Auto-seed on first boot so a fresh deploy always has demo data.
if (db.prepare('SELECT COUNT(*) n FROM users').get().n === 0) {
  require('./seed')();
  console.log('Database was empty — seeded demo data on boot.');
}

// ---- helpers ----
const uid = (p) => p + '-' + crypto.randomBytes(5).toString('hex');
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
const isAdmin = (u) => u.role === 'super_admin' || u.role === 'admin' && !u.tenant_id;
const isPlatformAdmin = (u) => u.role === 'super_admin';

// ---- health ----
app.get('/health', (req, res) => res.json({ ok: true, service: 'appro-marketplace-api', time: new Date().toISOString() }));

// ---- auth ----
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id } });
});

app.get('/me', auth, (req, res) => res.json({ user: req.user }));

// ---- products (catalogue) ----
app.get('/api/products', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY name').all();
  res.json(rows);
});
app.get('/api/products/:id', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// ---- tenants (platform admin) ----
app.get('/api/tenants', auth, (req, res) => {
  if (!isPlatformAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
  const rows = db.prepare(`
    SELECT t.*, (
      SELECT COUNT(*) FROM subscriptions s WHERE s.tenant_id = t.id AND s.status = 'active'
    ) AS products
    FROM tenants t ORDER BY annual_spend DESC`).all();
  res.json(rows);
});

// ---- subscriptions (admin: all; tenant: own) ----
app.get('/api/subscriptions', auth, (req, res) => {
  const q = `SELECT s.*, p.name AS product_name, t.name AS tenant_name
             FROM subscriptions s
             JOIN products p ON p.id = s.product_id
             JOIN tenants  t ON t.id = s.tenant_id`;
  const rows = isPlatformAdmin(req.user)
    ? db.prepare(q + ' ORDER BY s.created_at DESC').all()
    : db.prepare(q + ' WHERE s.tenant_id = ? ORDER BY s.created_at DESC').all(req.user.tenant_id);
  res.json(rows);
});

app.post('/api/subscriptions', auth, (req, res) => {
  const { product_id, environment = 'sandbox' } = req.body || {};
  const tenant_id = isPlatformAdmin(req.user) ? (req.body.tenant_id) : req.user.tenant_id;
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' });
  if (!db.prepare('SELECT 1 FROM products WHERE id = ?').get(product_id)) return res.status(400).json({ error: 'Unknown product' });
  const status = environment === 'production' ? 'pending' : 'active';
  try {
    const id = uid('SUB');
    db.prepare('INSERT INTO subscriptions (id,tenant_id,product_id,environment,status) VALUES (?,?,?,?,?)')
      .run(id, tenant_id, product_id, environment, status);
    res.status(201).json(db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id));
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'Already subscribed' });
    throw e;
  }
});

app.patch('/api/subscriptions/:id', auth, (req, res) => {
  if (!isPlatformAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
  const { status } = req.body || {};
  if (!['active', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'bad status' });
  const r = db.prepare('UPDATE subscriptions SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id));
});

app.delete('/api/subscriptions/:id', auth, (req, res) => {
  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  if (!isPlatformAdmin(req.user) && sub.tenant_id !== req.user.tenant_id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---- api keys (tenant-scoped) ----
app.get('/api/keys', auth, (req, res) => {
  const rows = isPlatformAdmin(req.user)
    ? db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM api_keys WHERE tenant_id = ? ORDER BY created_at DESC').all(req.user.tenant_id);
  res.json(rows);
});

app.post('/api/keys', auth, (req, res) => {
  const tenant_id = req.user.tenant_id || req.body.tenant_id;
  if (!tenant_id) return res.status(400).json({ error: 'tenant_id required' });
  const { name = 'New key', environment = 'sandbox' } = req.body || {};
  const secret = crypto.randomBytes(24).toString('hex');
  const prefix = `pk_${environment === 'production' ? 'live' : 'sbx'}_${secret.slice(0, 4)}`;
  const id = uid('KEY');
  db.prepare('INSERT INTO api_keys (id,tenant_id,name,environment,prefix,secret_last4,status) VALUES (?,?,?,?,?,?,?)')
    .run(id, tenant_id, name, environment, prefix, secret.slice(-4), 'active');
  // full secret returned ONCE on creation, like real key systems
  res.status(201).json({ ...db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id), secret: `${prefix}_${secret}` });
});

app.post('/api/keys/:id/revoke', auth, (req, res) => {
  const key = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(req.params.id);
  if (!key) return res.status(404).json({ error: 'Not found' });
  if (!isPlatformAdmin(req.user) && key.tenant_id !== req.user.tenant_id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare("UPDATE api_keys SET status = 'revoked' WHERE id = ?").run(req.params.id);
  res.json(db.prepare('SELECT * FROM api_keys WHERE id = ?').get(req.params.id));
});

// ---- admin overview stats ----
app.get('/api/stats', auth, (req, res) => {
  if (!isPlatformAdmin(req.user)) return res.status(403).json({ error: 'Admin only' });
  res.json({
    tenants: db.prepare('SELECT COUNT(*) n FROM tenants').get().n,
    products: db.prepare('SELECT COUNT(*) n FROM products').get().n,
    active_subscriptions: db.prepare("SELECT COUNT(*) n FROM subscriptions WHERE status='active'").get().n,
    pending_requests: db.prepare("SELECT COUNT(*) n FROM subscriptions WHERE status='pending'").get().n,
    annual_contract_value: db.prepare('SELECT COALESCE(SUM(annual_spend),0) s FROM tenants').get().s,
  });
});

app.listen(PORT, () => console.log(`Appro Marketplace API listening on :${PORT}`));
