import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT id, title, price, status, location, address, type, listing_type, bedrooms, bathrooms, area, images, features, created_at FROM properties ORDER BY created_at DESC LIMIT 500`;
      return { statusCode: 200, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { owner_user_id, title, description, type, listing_type, bedrooms, bathrooms, area, price, location, address, images, features, coordinates } = body;
      if (!owner_user_id || !title || !price) return { statusCode: 400, body: 'owner_user_id, title, price required' };
      const [row] = await sql`
        INSERT INTO properties (owner_user_id, title, description, type, listing_type, bedrooms, bathrooms, area, price, location, address, status, images, features, coordinates)
        VALUES (${owner_user_id}, ${title}, ${description || ''}, ${type || null}, ${listing_type || 'rent'}, ${bedrooms || null}, ${bathrooms || null}, ${area || null}, ${price}, ${location || null}, ${address || null}, 'active', ${images ? sql`jsonb(${JSON.stringify(images)})` : null}, ${features ? sql`jsonb(${JSON.stringify(features)})` : null}, ${coordinates ? sql`jsonb(${JSON.stringify(coordinates)})` : null})
        RETURNING id
      `;
      return { statusCode: 200, body: JSON.stringify({ id: row.id }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
