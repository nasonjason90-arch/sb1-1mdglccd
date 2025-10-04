import type { Handler } from '@netlify/functions';
import { getSql } from './db';

export const handler: Handler = async (event) => {
  try {
    const sql = getSql();
    const params = new URLSearchParams(event.rawQuery || '');
    const id = params.get('id');
    if (!id) return { statusCode: 400, body: 'id required' };

    const [row] = await sql`SELECT p.id, p.user_id, p.amount, p.currency, p.method, p.status, p.provider_ref, p.created_at, u.full_name, u.email FROM payments p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = ${id}` as any;
    if (!row) return { statusCode: 404, body: 'Payment not found' };

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Invoice #${row.id}</title><style>*{font-family: Arial} .box{max-width:700px;margin:40px auto;border:1px solid #e5e7eb;padding:24px;border-radius:8px} .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px} .muted{color:#6b7280} .total{font-size:20px;color:#16a34a;font-weight:700} table{width:100%;border-collapse:collapse;margin-top:16px} td,th{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left}</style></head><body><div class="box"><div class="head"><div><h1>ZambiaHomes</h1><div class="muted">Receipt / Invoice</div></div><div>#${row.id}</div></div><div class="muted">Billed To</div><div>${row.full_name || 'User'}<br/>${row.email || ''}</div><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>Subscription payment (${row.method || 'N/A'})</td><td>${row.currency} ${Number(row.amount).toLocaleString()}</td></tr></tbody></table><div class="head" style="margin-top:8px"><div class="muted">Status: ${row.status}</div><div class="total">Total: ${row.currency} ${Number(row.amount).toLocaleString()}</div></div><div class="muted">Ref: ${row.provider_ref || '-'}</div><div class="muted">Date: ${new Date(row.created_at).toLocaleString()}</div></div></body></html>`;
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
