import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async () => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT id, user_id, role, plan, status, current_period_end, created_at FROM subscriptions ORDER BY created_at DESC LIMIT 500`;
    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
