import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(event.rawQuery || '');
      const user_id = params.get('user_id');
      if (!user_id) return { statusCode: 400, body: 'user_id required' };
      const rows = await sql`SELECT id, user_id, name, filters, created_at FROM saved_searches WHERE user_id = ${user_id} ORDER BY created_at DESC`;
      return { statusCode: 200, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { user_id, name, filters } = body as { user_id?: number|string; name?: string; filters?: any };
      if (!user_id || !name || !filters) return { statusCode: 400, body: 'user_id, name, filters required' };
      const [row] = await sql`INSERT INTO saved_searches (user_id, name, filters) VALUES (${user_id}, ${name}, ${filters}) RETURNING id`;
      return { statusCode: 200, body: JSON.stringify({ id: row.id }) };
    }

    if (event.httpMethod === 'DELETE') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { id, user_id } = body as { id?: number|string; user_id?: number|string };
      if (!id || !user_id) return { statusCode: 400, body: 'id and user_id required' };
      await sql`DELETE FROM saved_searches WHERE id = ${id} AND user_id = ${user_id}`;
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
