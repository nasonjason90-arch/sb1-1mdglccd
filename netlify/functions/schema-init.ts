import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async () => {
  try {
    const sql = getSql();

    // Basic tables
    await sql`CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      supabase_user_id TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('agent','landlord','seeker','admin','agency')),
      subscription_status TEXT NOT NULL DEFAULT 'trial',
      approval_status TEXT NOT NULL DEFAULT 'pending',
      trial_end_date TIMESTAMPTZ,
      last_sign_in_at TIMESTAMPTZ,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id TEXT UNIQUE`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB`;

    await sql`CREATE TABLE IF NOT EXISTS approvals (
      id BIGSERIAL PRIMARY KEY,
      applicant_name TEXT,
      email TEXT,
      phone TEXT,
      role TEXT,
      company TEXT,
      license TEXT,
      experience TEXT,
      properties TEXT,
      verification TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS properties (
      id BIGSERIAL PRIMARY KEY,
      owner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      listing_type TEXT NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent','sale')),
      bedrooms INT,
      bathrooms INT,
      area INT,
      price NUMERIC NOT NULL,
      location TEXT,
      address TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      images JSONB,
      features JSONB,
      coordinates JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      amount NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ZMW',
      method TEXT,
      status TEXT,
      provider_ref TEXT,
      plan TEXT,
      role TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan TEXT`;
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS role TEXT`;

    await sql`CREATE TABLE IF NOT EXISTS subscriptions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      plan TEXT NOT NULL,
      status TEXT NOT NULL,
      current_period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS saved_searches (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      filters JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      property_id BIGINT NOT NULL,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS referrals (
      id BIGSERIAL PRIMARY KEY,
      code TEXT,
      referred_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS emails_log (
      id BIGSERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS whatsapp_log (
      id BIGSERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      payload JSONB,
      recipient_phone TEXT,
      response_status INT,
      response_body JSONB,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`INSERT INTO app_settings (key, value)
      VALUES ('platform', ${JSON.stringify({ commission: 5, trial_days: 14, auto_approve_seekers: true, manual_approve_landlord_agent: true, manual_approve_agencies: true, maintenance_mode: false, allow_registrations: true })}::jsonb)
      ON CONFLICT (key) DO NOTHING`;

    // Helpful indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'rent'`;
    await sql`DO $$ BEGIN
      ALTER TABLE properties ADD CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('rent','sale'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`;

    await sql`CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id)`;

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    return { statusCode: 500, body: `Schema init error: ${e.message}` };
  }
};
