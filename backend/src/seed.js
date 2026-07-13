// Seed the database with data matching the Appro Marketplace demo.
// Idempotent: clears and repopulates the core tables. Run: npm run seed
const bcrypt = require('bcryptjs');
const db = require('./db');

const tenants = [
  { id: 'TEN-1001', name: 'Reem Finance',          plan: 'Enterprise', status: 'Active', annual_spend: 1450000 },
  { id: 'TEN-1002', name: 'Abu Dhabi Islamic Bank', plan: 'Enterprise', status: 'Active', annual_spend: 980000 },
  { id: 'TEN-1003', name: 'First Abu Dhabi Bank',   plan: 'Enterprise', status: 'Active', annual_spend: 2100000 },
  { id: 'TEN-1004', name: 'Nuqud Pay',              plan: 'Growth',     status: 'Active', annual_spend: 320000 },
  { id: 'TEN-1005', name: 'Falcon Lending',         plan: 'Sandbox',    status: 'Trial',  annual_spend: 0 },
  { id: 'TEN-1006', name: 'Oasis Wallet',           plan: 'Growth',     status: 'Suspended', annual_spend: 210000 },
];

const products = [
  { id: 'email-verification', name: 'Email Verification', category: 'identity', version: 'v1.3', status: 'live', owner: 'Identity Team', auth: 'OAuth 2.0', rate_limit: '300 req/s', cloud: 'aws', region: 'me-central-1', description: 'Validate email deliverability, detect disposable domains, and confirm ownership with one-time codes.' },
  { id: 'aecb', name: 'AECB Credit Report', category: 'credit', version: 'v2.0', status: 'live', owner: 'Credit Team', auth: 'mTLS + OAuth', rate_limit: '120 req/s', cloud: 'aws', region: 'me-central-1', description: 'Pull Al Etihad Credit Bureau reports and credit scores for individuals and companies, with consent capture.' },
  { id: 'efr', name: 'EFR — Establishment Financial Report', category: 'credit', version: 'v1.1', status: 'live', owner: 'Credit Team', auth: 'mTLS + OAuth', rate_limit: '80 req/s', cloud: 'azure', region: 'UAE North', description: 'Retrieve establishment financial reports and entity risk profiles for corporate onboarding and lending.' },
  { id: 'income-verify', name: 'Income Verification', category: 'credit', version: 'v0.9', status: 'review', owner: 'Credit Team', auth: 'OAuth 2.0', rate_limit: '60 req/s', cloud: 'aws', region: 'me-central-1', description: 'Verify salary and income streams against payroll and bank statement data.' },
  { id: 'aml-screening', name: 'AML & Sanctions Screening', category: 'identity', version: 'v0.4', status: 'draft', owner: 'Compliance', auth: 'mTLS + OAuth', rate_limit: '40 req/s', cloud: 'aws', region: 'me-central-1', description: 'Screen individuals and entities against global sanctions, PEP and adverse-media lists.' },
  { id: 'id-document-extraction', name: 'ID Document Extraction', category: 'identity', version: 'v1.2', status: 'live', owner: 'Identity Team', auth: 'OAuth 2.0', rate_limit: '150 req/s', cloud: 'aws', region: 'me-central-1', description: 'Extract and validate data from Emirates ID, passports and trade licences via OCR.' },
];

// tenant_id, product_id, environment, status
const subscriptions = [
  ['TEN-1004', 'email-verification', 'production', 'active'],
  ['TEN-1004', 'aecb',               'production', 'active'],
  ['TEN-1004', 'id-document-extraction', 'sandbox', 'active'],
  ['TEN-1001', 'aecb',               'production', 'active'],
  ['TEN-1001', 'efr',                'production', 'active'],
  ['TEN-1005', 'email-verification', 'sandbox',    'pending'],
  ['TEN-1003', 'income-verify',      'sandbox',    'pending'],
];

const users = [
  // Credentials match the login screen's pre-filled demo values so the demo "just works".
  { id: 'U-ADMIN', email: 'rana.adel@appro.ae', password: 'appro1234', name: 'Rana Adel', role: 'super_admin', tenant_id: null },
  { id: 'U-NUQUD', email: 'amira@nuqud.ae',     password: 'appro1234', name: 'Amira Saleh', role: 'admin', tenant_id: 'TEN-1004' },
  { id: 'U-DEV',   email: 'dev@nuqud.ae',       password: 'appro1234', name: 'Layla Mansoori', role: 'developer', tenant_id: 'TEN-1004' },
  // The real Appro/tenant credentials from the brief also work:
  { id: 'U-ADMIN2', email: 'admin@appro.ae',    password: 'Appro@12345', name: 'Platform Admin', role: 'super_admin', tenant_id: null },
];

const apiKeys = [
  { id: 'KEY-1', tenant_id: 'TEN-1004', name: 'Production key', environment: 'production', prefix: 'pk_live_9c7b', secret_last4: '9c7b', status: 'active' },
  { id: 'KEY-2', tenant_id: 'TEN-1004', name: 'Sandbox key',    environment: 'sandbox',    prefix: 'pk_sbx_55ae', secret_last4: '55ae', status: 'active' },
];

function seed() {
const tx = db.transaction(() => {
  db.exec('DELETE FROM api_keys; DELETE FROM subscriptions; DELETE FROM users; DELETE FROM products; DELETE FROM tenants;');

  const insT = db.prepare('INSERT INTO tenants (id,name,plan,status,annual_spend) VALUES (@id,@name,@plan,@status,@annual_spend)');
  tenants.forEach(t => insT.run(t));

  const insP = db.prepare('INSERT INTO products (id,name,category,version,status,owner,auth,rate_limit,cloud,region,description) VALUES (@id,@name,@category,@version,@status,@owner,@auth,@rate_limit,@cloud,@region,@description)');
  products.forEach(p => insP.run(p));

  const insU = db.prepare('INSERT INTO users (id,email,password_hash,name,role,tenant_id) VALUES (@id,@email,@password_hash,@name,@role,@tenant_id)');
  users.forEach(u => insU.run({ ...u, password_hash: bcrypt.hashSync(u.password, 10) }));

  const insS = db.prepare('INSERT INTO subscriptions (id,tenant_id,product_id,environment,status) VALUES (?,?,?,?,?)');
  subscriptions.forEach((s, i) => insS.run('SUB-' + (1001 + i), ...s));

  const insK = db.prepare('INSERT INTO api_keys (id,tenant_id,name,environment,prefix,secret_last4,status) VALUES (@id,@tenant_id,@name,@environment,@prefix,@secret_last4,@status)');
  apiKeys.forEach(k => insK.run(k));
});

tx();
  console.log(`Seeded: ${tenants.length} tenants, ${products.length} products, ${users.length} users, ${subscriptions.length} subscriptions, ${apiKeys.length} keys.`);
}

module.exports = seed;

if (require.main === module) {
  seed();
  console.log('Logins:  admin@appro.ae / Appro@12345   (super admin)');
  console.log('         admin@nuqud.ae / Demo@12345    (tenant admin)');
}
