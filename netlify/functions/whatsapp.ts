import type { Handler } from '@netlify/functions';

import type { Handler } from '@netlify/functions';

import { getSql } from './db';

type RequestPayload = {
  event: string;
  user_id?: number;
  phone?: string;
  message?: string;
  template?: {
    name: string;
    language: string;
    components?: Array<Record<string, unknown>>;
  };
  amount?: number;
  currency?: string;
  plan?: string;
  role?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type LogEntry = {
  event: string;
  payload: RequestPayload;
  recipientPhone?: string | null;
  responseStatus?: number | null;
  responseBody?: unknown;
  errorMessage?: string | null;
};

type HttpResponse = {
  status: number;
  ok: boolean;
  text: () => Promise<string>;
};

const DEFAULT_WHATSAPP_VERSION = process.env.WHATSAPP_API_VERSION ?? 'v17.0';
const DEFAULT_WHATSAPP_BASE_URL = (process.env.WHATSAPP_API_BASE_URL ?? 'https://graph.facebook.com').replace(/\/$/, '');

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const rawBody = event.body ? JSON.parse(event.body) : {};
    const body = rawBody as RequestPayload;
    const eventName = body.event;
    if (!eventName) return { statusCode: 400, body: 'event required' };

    const sql = getSql();

    const resolvedRecipient = await resolveRecipient(sql, body);
    if (!resolvedRecipient.phone) {
      await log(sql, {
        event: eventName,
        payload: body,
        errorMessage: 'No recipient phone number found',
      });
      return { statusCode: 400, body: 'recipient phone number required' };
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      await log(sql, {
        event: eventName,
        payload: body,
        recipientPhone: resolvedRecipient.phone,
        errorMessage: 'WhatsApp credentials are not configured',
      });
      return { statusCode: 500, body: 'WhatsApp credentials not configured' };
    }

    const message = buildMessage(eventName, {
      ...body,
      recipientName: resolvedRecipient.name,
      recipientRole: resolvedRecipient.role,
    });

    const requestBody = buildRequestBody({
      to: resolvedRecipient.phone,
      message,
      template: body.template,
    });

    const url = `${DEFAULT_WHATSAPP_BASE_URL}/${DEFAULT_WHATSAPP_VERSION}/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const responsePayload = await parseResponse(response);

    await log(sql, {
      event: eventName,
      payload: body,
      recipientPhone: resolvedRecipient.phone,
      responseStatus: response.status,
      responseBody: responsePayload,
      errorMessage: response.ok ? null : extractErrorMessage(responsePayload),
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ ok: false, error: extractErrorMessage(responsePayload) ?? 'Failed to send WhatsApp message' }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, response: responsePayload }) };
  } catch (error: any) {
    return { statusCode: 500, body: `Server error: ${error.message}` };
  }
};

type SqlClient = ReturnType<typeof getSql>;

type RecipientDetails = {
  phone: string | null;
  name?: string | null;
  role?: string | null;
};

async function resolveRecipient(sql: SqlClient, payload: RequestPayload): Promise<RecipientDetails> {
  if (payload.phone) {
    return {
      phone: normalizePhone(payload.phone),
      name: extractMetadataString(payload.metadata, 'name'),
    };
  }

  if (!payload.user_id) return { phone: null };

  try {
    const [user] = await sql<{ phone: string | null; full_name: string | null; role: string | null }[]>`
      SELECT phone, full_name, role FROM users WHERE id = ${payload.user_id}
    `;
    if (!user?.phone) {
      return { phone: null, name: user?.full_name ?? null, role: user?.role ?? null };
    }
    return { phone: normalizePhone(user.phone), name: user.full_name, role: user.role };
  } catch {
    return { phone: null };
  }
}

function buildMessage(event: string, context: RequestPayload & { recipientName?: string | null; recipientRole?: string | null }): string {
  if (context.message && typeof context.message === 'string') return context.message;

  switch (event) {
    case 'subscription_active': {
      const name = context.recipientName ?? 'there';
      const plan = context.plan ?? 'your subscription';
      const role = context.role ?? context.recipientRole;
      const amount = typeof context.amount === 'number' ? formatCurrency(context.amount, context.currency) : null;
      const roleText = role ? ` as a ${role}` : '';
      const amountText = amount ? ` Payment received: ${amount}.` : '';
      return `Hi ${name}, your ${plan}${roleText} on ZambiaHomes is now active.${amountText}`;
    }
    default:
      return `ZambiaHomes update: ${event}`;
  }
}

function buildRequestBody({ to, message, template }: { to: string; message: string; template?: RequestPayload['template']; }) {
  if (template) {
    return {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language },
        components: template.components,
      },
    };
  }

  return {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  };
}

async function parseResponse(response: HttpResponse): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(response: unknown): string | null {
  if (!response) return null;
  if (typeof response === 'string') return response;
  if (typeof response === 'object' && response !== null) {
    const error = (response as Record<string, any>).error;
    if (!error) return JSON.stringify(response);
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      if (typeof (error as Record<string, any>).message === 'string') return (error as Record<string, any>).message;
      return JSON.stringify(error);
    }
  }
  return null;
}

function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/[^\d]/g, '')}`;
  }
  return trimmed.replace(/[^\d]/g, '');
}

function formatCurrency(amount: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'ZMW' }).format(amount);
  } catch {
    return `${currency ?? 'ZMW'} ${amount.toFixed(2)}`;
  }
}

async function log(sql: SqlClient, entry: LogEntry) {
  try {
    await sql`
      INSERT INTO whatsapp_log (event, payload, recipient_phone, response_status, response_body, error_message)
      VALUES (${entry.event}, ${entry.payload}, ${entry.recipientPhone ?? null}, ${entry.responseStatus ?? null}, ${entry.responseBody ?? null}, ${entry.errorMessage ?? null})
    `;
  } catch {
    // swallow logging errors
  }
}

function extractMetadataString(metadata: RequestPayload['metadata'], key: string): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}
