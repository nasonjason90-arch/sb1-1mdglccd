import type { Handler } from '@netlify/functions';
import { getSql } from './db';

const DEFAULT_SETTINGS = {
  commission: 5,
  trial_days: 14,
  auto_approve_seekers: true,
  manual_approve_landlord_agent: true,
  manual_approve_agencies: true,
  maintenance_mode: false,
  allow_registrations: true,
};

type PlatformSettings = typeof DEFAULT_SETTINGS;

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const [row] = await sql`SELECT value FROM app_settings WHERE key = 'platform' LIMIT 1` as any[];
      const value = row?.value as PlatformSettings | undefined;
      return {
        statusCode: 200,
        body: JSON.stringify(value ? { ...DEFAULT_SETTINGS, ...value } : DEFAULT_SETTINGS),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const payload: PlatformSettings = {
        commission: Number(body.commission ?? DEFAULT_SETTINGS.commission),
        trial_days: Number(body.trial_days ?? DEFAULT_SETTINGS.trial_days),
        auto_approve_seekers: Boolean(body.auto_approve_seekers ?? DEFAULT_SETTINGS.auto_approve_seekers),
        manual_approve_landlord_agent: Boolean(body.manual_approve_landlord_agent ?? DEFAULT_SETTINGS.manual_approve_landlord_agent),
        manual_approve_agencies: Boolean(body.manual_approve_agencies ?? DEFAULT_SETTINGS.manual_approve_agencies),
        maintenance_mode: Boolean(body.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode),
        allow_registrations: Boolean(body.allow_registrations ?? DEFAULT_SETTINGS.allow_registrations),
      };

      await sql`INSERT INTO app_settings (key, value, updated_at) VALUES ('platform', ${payload}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = ${payload}::jsonb, updated_at = now()`;

      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
