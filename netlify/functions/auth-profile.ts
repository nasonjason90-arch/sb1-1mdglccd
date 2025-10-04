import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

import { getSql } from './db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const ALLOWED_ROLES = new Set(['agent', 'landlord', 'seeker', 'admin', 'agency']);
const ALLOWED_SUBSCRIPTION = new Set(['trial', 'active', 'expired']);

interface RequestBody {
  role?: string;
  full_name?: string;
  phone?: string;
  trial_days?: number;
  trial_end_date?: string;
  subscription_status?: string;
  approval_status?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export const handler: Handler = async (event) => {
  try {
    if (!supabaseAdmin) {
      return { statusCode: 500, body: 'Supabase admin credentials not configured' };
    }

    if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const token = extractBearerToken(event.headers);
    if (!token) {
      return { statusCode: 401, body: 'Missing Authorization header' };
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return { statusCode: 401, body: 'Invalid token' };
    }

    const supabaseUser = data.user;
    const sql = getSql();

    const body = parseBody(event.body);
    const now = new Date();
    const normalized = normalizeProfileInput(supabaseUser, body);
    const trialEndForInsert = resolveTrialEnd(body, normalized.trial_end_date, normalized.trial_days, now);
    const subscriptionStatus = resolveSubscriptionStatus(body.subscription_status, normalized.subscription_status);
    const approvalStatus = typeof body.approval_status === 'string' ? body.approval_status : undefined;
    const metadataPayload = buildMetadataPayload(supabaseUser, body.metadata);

    const existing = await sql<DbUser[]>`
      SELECT id, subscription_status, approval_status, trial_end_date
      FROM users
      WHERE supabase_user_id = ${supabaseUser.id} OR email = ${supabaseUser.email ?? ''}
      LIMIT 1
    `;

    let upserted: DbUser | undefined;

    if (existing.length === 0) {
      const [row] = await sql<DbUser[]>`
        INSERT INTO users (supabase_user_id, email, full_name, phone, role, subscription_status, approval_status, trial_end_date, last_sign_in_at, metadata)
        VALUES (${supabaseUser.id}, ${normalized.email}, ${normalized.full_name}, ${normalized.phone}, ${normalized.role}, ${subscriptionStatus ?? 'trial'}, ${approvalStatus ?? 'pending'}, ${trialEndForInsert}, ${now.toISOString()}, ${metadataPayload})
        RETURNING id, supabase_user_id, email, full_name, phone, role, subscription_status, approval_status, trial_end_date, last_sign_in_at, metadata
      `;
      upserted = row;
    } else {
      const current = existing[0];
      const nextTrialEnd = resolveExistingTrialEnd({
        body,
        metadataValue: normalized.trial_end_date,
        currentValue: current.trial_end_date,
      });
      const nextSubscription = subscriptionStatus ?? current.subscription_status ?? 'trial';
      const nextApproval = approvalStatus ?? current.approval_status ?? 'pending';

      const [row] = await sql<DbUser[]>`
        UPDATE users
        SET
          supabase_user_id = ${supabaseUser.id},
          email = ${normalized.email},
          full_name = ${normalized.full_name},
          phone = ${normalized.phone},
          role = ${normalized.role},
          subscription_status = ${nextSubscription},
          approval_status = ${nextApproval},
          trial_end_date = ${nextTrialEnd},
          last_sign_in_at = ${now.toISOString()},
          metadata = ${metadataPayload}
        WHERE id = ${current.id}
        RETURNING id, supabase_user_id, email, full_name, phone, role, subscription_status, approval_status, trial_end_date, last_sign_in_at, metadata
      `;
      upserted = row;
    }

    if (!upserted) {
      return { statusCode: 500, body: 'Failed to persist user' };
    }

    return { statusCode: 200, body: JSON.stringify(upserted) };
  } catch (error: any) {
    console.error('auth-profile error', error);
    return { statusCode: 500, body: `Server error: ${error.message}` };
  }
};

type DbUser = {
  id: number;
  supabase_user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  subscription_status: string | null;
  approval_status: string | null;
  trial_end_date: string | null;
  last_sign_in_at: string | null;
  metadata: Record<string, unknown> | null;
};

function extractBearerToken(headers: Record<string, string | undefined>): string | null {
  const header = headers.authorization || headers.Authorization;
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1] ?? null;
}

function parseBody(body: string | null | undefined): RequestBody {
  if (!body) return {};
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === 'object') return parsed as RequestBody;
    return {};
  } catch {
    return {};
  }
}

type NormalizedProfile = {
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  subscription_status?: string;
  trial_days?: number;
  trial_end_date?: string;
};

function normalizeProfileInput(user: any, overrides: RequestBody): NormalizedProfile {
  const metadata = user?.user_metadata ?? {};
  const email = (overrides.email as string) || user?.email || '';
  const fullName = coalesceString(overrides.full_name, metadata.full_name, user?.user_metadata?.name, user?.user_metadata?.full_name, user?.email?.split('@')[0] || 'User');
  const phone = coalesceString(overrides.phone, metadata.phone, user?.phone);
  const roleCandidate = coalesceString(overrides.role, metadata.role);
  const role = ALLOWED_ROLES.has(normalizeRole(roleCandidate)) ? normalizeRole(roleCandidate) : 'seeker';
  const subscription_status = coalesceString(overrides.subscription_status, metadata.subscription_status);
  const trial_days = toNumber(overrides.trial_days ?? metadata.trial_days);
  const trial_end_date = coalesceString(overrides.trial_end_date, metadata.trial_end_date);

  return { email, full_name: fullName, phone, role, subscription_status, trial_days, trial_end_date };
}

function normalizeRole(role?: string | null): string {
  if (!role) return 'seeker';
  const lowered = role.toLowerCase();
  if (lowered === 'landlord_agent' || lowered === 'landlord-agent') return 'agent';
  return lowered;
}

function resolveTrialEnd(body: RequestBody, existing: string | undefined, trialDays: number | undefined, now: Date): string | null {
  if (typeof body.trial_end_date === 'string' && body.trial_end_date) {
    return new Date(body.trial_end_date).toISOString();
  }
  if (existing) return new Date(existing).toISOString();
  const days = trialDays && Number.isFinite(trialDays) ? Number(trialDays) : (typeof body.trial_days === 'number' ? body.trial_days : 14);
  if (!days || days <= 0) return null;
  const end = new Date(now.getTime() + days * 86400000);
  return end.toISOString();
}

function resolveExistingTrialEnd({
  body,
  metadataValue,
  currentValue,
}: {
  body: RequestBody;
  metadataValue?: string | undefined;
  currentValue?: string | null;
}): string | null {
  if (typeof body.trial_end_date === 'string' && body.trial_end_date) {
    return new Date(body.trial_end_date).toISOString();
  }
  if (metadataValue) {
    try {
      return new Date(metadataValue).toISOString();
    } catch {
      // ignore parse errors
    }
  }
  if (currentValue) {
    try {
      return new Date(currentValue).toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

function resolveSubscriptionStatus(bodyValue: string | undefined, fallback?: string): string | undefined {
  const candidate = coalesceString(bodyValue, fallback);
  if (!candidate) return fallback;
  const lowered = candidate.toLowerCase();
  return ALLOWED_SUBSCRIPTION.has(lowered) ? lowered : fallback;
}

function buildMetadataPayload(user: any, custom?: Record<string, unknown>): Record<string, unknown> {
  const metadata = user?.user_metadata ?? {};
  return {
    ...metadata,
    ...custom,
  };
}

function coalesceString(...values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}
