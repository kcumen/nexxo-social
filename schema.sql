-- nexxo.social D1 Schema
-- Apply: wrangler d1 execute nexxo-social-db --local --file=schema.sql

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  oauth_provider TEXT DEFAULT 'google',
  oauth_id TEXT DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company_id TEXT REFERENCES companies(id),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  qr_id TEXT NOT NULL REFERENCES qr_codes(id),
  user_id TEXT DEFAULT NULL,
  scanned_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_profiles (
  user_id TEXT NOT NULL REFERENCES users(id),
  company_id TEXT NOT NULL REFERENCES companies(id),
  saved_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, company_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qr_slug ON qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_short ON qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_scans_qr ON scans(qr_id);
CREATE INDEX IF NOT EXISTS idx_company_slug ON companies(slug);
