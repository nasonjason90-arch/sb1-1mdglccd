import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const sql = getSql();
    const body = event.body ? JSON.parse(event.body) : {};
    const {
      user_id,
      amount,
      currency = 'ZMW',
      method = 'card',
      status = 'completed',
      provider_ref = null,
      plan = null,
      role = null,
    } = body;
    const userId = Number(user_id);
    const amountValue = Number(amount);
    if (!Number.isFinite(userId) || !Number.isFinite(amountValue) || userId <= 0 || amountValue <= 0) {
      return { statusCode: 400, body: 'valid numeric user_id and positive amount required' };
    }

    const currencyCode = typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'ZMW';
    const methodValue = typeof method === 'string' && method.trim() ? method.trim().toLowerCase() : 'card';
    const providerRef = typeof provider_ref === 'string' && provider_ref.trim() ? provider_ref.trim() : null;
    const planValue = typeof plan === 'string' && plan.trim() ? plan.trim().toLowerCase() : null;
    const roleValue = typeof role === 'string' && role.trim() ? role.trim().toLowerCase() : null;
    const statusValue = typeof status === 'string' && status.trim() ? status.trim().toLowerCase() : 'completed';

    const [row] = await sql`INSERT INTO payments (user_id, amount, currency, method, status, provider_ref, plan, role) VALUES (${userId}, ${amountValue}, ${currencyCode}, ${methodValue}, ${statusValue}, ${providerRef}, ${planValue}, ${roleValue}) RETURNING id`;

    if (statusValue === 'completed' && planValue && roleValue) {
      // compute period end based on plan
      const now = new Date();
      let periodDays = 30;
      if (planValue === 'daily') periodDays = 1;
      else if (planValue === 'weekly') periodDays = 7;
      else if (planValue === 'monthly') periodDays = 30;
      else if (planValue === 'yearly') periodDays = 365;
      const end = new Date(now.getTime() + periodDays * 86400000).toISOString();

      const existing = await sql`SELECT id FROM subscriptions WHERE user_id = ${userId} LIMIT 1`;
      if (existing.length) {
        await sql`UPDATE subscriptions SET role = ${roleValue}, plan = ${planValue}, status = 'active', current_period_end = ${end} WHERE user_id = ${userId}`;
      } else {
        await sql`INSERT INTO subscriptions (user_id, role, plan, status, current_period_end) VALUES (${userId}, ${roleValue}, ${planValue}, 'active', ${end})`;
      }
      await sql`UPDATE users SET subscription_status = 'active' WHERE id = ${userId}`;
    }

    return { statusCode: 200, body: JSON.stringify({ id: row.id }) };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
