import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(event.rawQuery || '');
      const property_id = params.get('property_id');
      if (!property_id) return { statusCode: 400, body: 'property_id required' };
      const rows = await sql`SELECT id, property_id, user_id, rating, comment, created_at FROM reviews WHERE property_id = ${property_id} ORDER BY created_at DESC LIMIT 200`;
      return { statusCode: 200, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { property_id, user_id, rating, comment } = body as { property_id?: number|string; user_id?: number|string; rating?: number; comment?: string };
      if (!property_id || !user_id || !rating) return { statusCode: 400, body: 'property_id, user_id, rating required' };
      const [row] = await sql`INSERT INTO reviews (property_id, user_id, rating, comment) VALUES (${property_id}, ${user_id}, ${rating}, ${comment || ''}) RETURNING id`;
      return { statusCode: 200, body: JSON.stringify({ id: row.id }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
