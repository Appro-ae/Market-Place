// SQLite data layer for the Appro API Marketplace.
// One file DB (data.sqlite). Schema is created on first run; seed.js populates it.
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS tenants (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'Sandbox',
  status        TEXT NOT NULL DEFAULT 'Active',
  annual_spend  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',        -- 'super_admin' | 'admin' | 'developer' | 'viewer'
  tenant_id     TEXT REFERENCES tenants(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  version     TEXT NOT NULL DEFAULT 'v1.0',
  status      TEXT NOT NULL DEFAULT 'live',           -- 'live' | 'review' | 'draft' | 'deprecated'
  owner       TEXT,
  auth        TEXT,
  rate_limit  TEXT,
  cloud       TEXT,
  region      TEXT,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  product_id  TEXT NOT NULL REFERENCES products(id),
  environment TEXT NOT NULL DEFAULT 'sandbox',        -- 'sandbox' | 'production'
  status      TEXT NOT NULL DEFAULT 'active',         -- 'active' | 'pending' | 'rejected'
  plan        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, product_id, environment)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  name         TEXT NOT NULL,
  environment  TEXT NOT NULL DEFAULT 'sandbox',
  prefix       TEXT NOT NULL,                          -- shown in UI, e.g. pk_live_9c7b
  secret_last4 TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',         -- 'active' | 'revoked'
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db;
