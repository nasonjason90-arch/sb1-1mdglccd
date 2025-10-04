import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();

    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = event.body ? JSON.parse(event.body) : {};
    const { code, referred_email } = body as { code?: string; referred_email?: string };
    if (!code || !referred_email) return { statusCode: 400, body: 'code and referred_email required' };
    const [row] = await sql`INSERT INTO referrals (code, referred_email) VALUES (${code}, ${referred_email}) RETURNING id`;
    return { statusCode: 200, body: JSON.stringify({ id: row.id }) };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
