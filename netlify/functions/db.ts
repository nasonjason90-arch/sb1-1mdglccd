import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  // Do not throw here to keep build working; handlers will error gracefully
  console.warn('NEON_DATABASE_URL is not set');
}

export function getSql() {
  if (!url) throw new Error('Missing NEON_DATABASE_URL');
  return neon(url);
}
