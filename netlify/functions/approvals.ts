import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT id, applicant_name, email, phone, role, company, license, experience, properties, verification, status, submitted_at FROM approvals WHERE status = 'pending' ORDER BY submitted_at DESC`;
      return { statusCode: 200, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { id, action, reason } = body as { id?: string; action?: 'approve' | 'reject'; reason?: string };
      if (!id || !action) return { statusCode: 400, body: 'id and action are required' };

      if (action === 'approve') {
        const [app] = await sql`UPDATE approvals SET status = 'approved' WHERE id = ${id} RETURNING applicant_name, email, phone, role`;
        if (!app) return { statusCode: 404, body: 'Not found' };
        const [user] = await sql`INSERT INTO users (email, full_name, phone, role, approval_status, subscription_status) VALUES (${app.email}, ${app.applicant_name}, ${app.phone}, ${app.role}, 'approved', 'trial') RETURNING id, email, full_name, role`;
        return { statusCode: 200, body: JSON.stringify({ approved: true, user }) };
      } else {
        const [app] = await sql`UPDATE approvals SET status = 'rejected' WHERE id = ${id} RETURNING id`;
        if (!app) return { statusCode: 404, body: 'Not found' };
        // Optionally store reason in a separate table or JSON field later
        return { statusCode: 200, body: JSON.stringify({ rejected: true }) };
      }
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
