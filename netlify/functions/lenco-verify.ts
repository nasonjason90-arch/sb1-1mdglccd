import type { Handler } from '@netlify/functions';

interface VerifyRequestBody {
  reference: string;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    if (!process.env.LENCO_SECRET_KEY) {
      return { statusCode: 500, body: 'Missing LENCO_SECRET_KEY' };
    }

    const body: VerifyRequestBody = event.body ? JSON.parse(event.body) : ({} as any);
    const reference = body.reference?.trim();
    if (!reference) {
      return { statusCode: 400, body: 'reference required' };
    }

    const env = process.env.LENCO_ENV === 'live' ? 'live' : 'sandbox';
    const base = env === 'live' ? 'https://api.lenco.co/access/v2' : 'https://sandbox.lenco.co/access/v2';
    const url = `${base}/collections/status/${encodeURIComponent(reference)}`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.LENCO_SECRET_KEY}`,
        Accept: 'application/json',
      },
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ ok: false, error: data }) };
    }

    // Normalize relevant fields
    const normalized = {
      ok: true,
      status: data?.data?.status ?? data?.status ?? 'unknown',
      amount: data?.data?.amount ?? null,
      currency: data?.data?.currency ?? null,
      reference: data?.data?.reference ?? reference,
      lencoReference: data?.data?.lencoReference ?? null,
      type: data?.data?.type ?? null,
      settlementStatus: data?.data?.settlementStatus ?? null,
      mobileMoneyDetails: data?.data?.mobileMoneyDetails ?? null,
      cardDetails: data?.data?.cardDetails ?? null,
      raw: data,
    };

    return { statusCode: 200, body: JSON.stringify(normalized) };
  } catch (e: any) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
