// Seed the in-memory store with data matching the Appro Marketplace demo.
const bcrypt = require('bcryptjs');
const store = require('./db');

const tenants = [
  { id: 'TEN-1001', name: 'Reem Finance',           plan: 'Enterprise', status: 'Active',    annual_spend: 1450000 },
  { id: 'TEN-1002', name: 'Abu Dhabi Islamic Bank', plan: 'Enterprise', status: 'Active',    annual_spend: 980000 },
  { id: 'TEN-1003', name: 'First Abu Dhabi Bank',   plan: 'Enterprise', status: 'Active',    annual_spend: 2100000 },
  { id: 'TEN-1004', name: 'Nuqud Pay',              plan: 'Growth',     status: 'Active',    annual_spend: 320000 },
  { id: 'TEN-1005', name: 'Falcon Lending',         plan: 'Sandbox',    status: 'Trial',     annual_spend: 0 },
  { id: 'TEN-1006', name: 'Oasis Wallet',           plan: 'Growth',     status: 'Suspended', annual_spend: 210000 },
];

// Full 36-product catalogue, extracted from the customer portal design.
const products = require('./products.seed.json');

// [tenant_id, product_id, environment, status]
const subscriptions = [
  ['TEN-1004', 'email-verification',      'production', 'active'],
  ['TEN-1004', 'credit-score-company',    'production', 'active'],
  ['TEN-1004', 'credit-full-company',     'production', 'active'],
  ['TEN-1004', 'credit-score-individual', 'production', 'active'],
  ['TEN-1004', 'id-document-extraction',  'sandbox',    'active'],
  ['TEN-1001', 'credit-score-individual', 'production', 'active'],
  ['TEN-1001', 'uae-pass',                'production', 'active'],
  ['TEN-1005', 'email-verification',      'sandbox',    'pending'],
  ['TEN-1003', 'credit-full-individual',  'sandbox',    'pending'],
  ['TEN-1006', 'identity-verification',   'production', 'pending'],
];

const users = [
  // Credentials match the login screen's pre-filled demo values so the demo "just works".
  { id: 'U-ADMIN',  email: 'rana.adel@appro.ae', password: 'appro1234',   name: 'Rana Adel',      role: 'super_admin', tenant_id: null },
  { id: 'U-NUQUD',  email: 'amira@nuqud.ae',     password: 'appro1234',   name: 'Amira Saleh',    role: 'admin',       tenant_id: 'TEN-1004' },
  { id: 'U-DEV',    email: 'dev@nuqud.ae',       password: 'appro1234',   name: 'Layla Mansoori', role: 'developer',   tenant_id: 'TEN-1004' },
  { id: 'U-ADMIN2', email: 'admin@appro.ae',     password: 'Appro@12345', name: 'Platform Admin', role: 'super_admin', tenant_id: null },
];

const apiKeys = [
  { id: 'KEY-1', tenant_id: 'TEN-1004', name: 'Production key', environment: 'production', prefix: 'pk_live_9c7b', secret_last4: '9c7b', status: 'active', created_at: new Date(0).toISOString() },
  { id: 'KEY-2', tenant_id: 'TEN-1004', name: 'Sandbox key',    environment: 'sandbox',    prefix: 'pk_sbx_55ae', secret_last4: '55ae', status: 'active', created_at: new Date(0).toISOString() },
];

function seed() {
  store.tenants = tenants.map(t => ({ ...t }));
  store.products = products.map(p => ({ ...p }));
  store.users = users.map(u => ({ id: u.id, email: u.email.toLowerCase(), password_hash: bcrypt.hashSync(u.password, 10), name: u.name, role: u.role, tenant_id: u.tenant_id }));
  store.subscriptions = subscriptions.map((s, i) => ({ id: 'SUB-' + (1001 + i), tenant_id: s[0], product_id: s[1], environment: s[2], status: s[3], created_at: new Date(0).toISOString() }));
  store.apiKeys = apiKeys.map(k => ({ ...k }));
  console.log(`Seeded: ${store.tenants.length} tenants, ${store.products.length} products, ${store.users.length} users, ${store.subscriptions.length} subscriptions, ${store.apiKeys.length} keys.`);
}

module.exports = seed;

if (require.main === module) {
  seed();
  console.log('Logins:  rana.adel@appro.ae / appro1234  (super admin)');
  console.log('         amira@nuqud.ae / appro1234       (tenant admin)');
}
