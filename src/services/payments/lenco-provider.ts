import { openLencoCheckout } from './lenco';
import type { PayParams, PaymentProvider, PaymentResult } from './provider';

type LencoEnv = 'sandbox' | 'live';

type MetadataRecord = Record<string, unknown>;

type VerificationOutcome = {
  status: 'success' | 'pending' | 'failed' | 'error';
  amount?: number | null;
  currency?: string | null;
  raw: unknown;
};

export class LencoPaymentProvider implements PaymentProvider {
  async pay(params: PayParams): Promise<PaymentResult> {
    try {
      const pubKey = getPublicKey();
      const env = resolveEnv();
      const metadata = (params.metadata ?? {}) as MetadataRecord;
      const userId = metadata.userId;
      const email = typeof metadata.email === 'string' ? metadata.email : undefined;
      if (!pubKey || !userId || !email) {
        throw new Error('Missing payment metadata (public key, userId, or email)');
      }

      const reference = buildReference(metadata, userId);
      const { firstName, lastName } = deriveNameParts(metadata);
      const phone = typeof metadata.phone === 'string' ? metadata.phone : undefined;
      const channels: Array<'card' | 'mobile-money'> = params.method === 'mobile' ? ['mobile-money'] : ['card'];

      const checkout = await openLencoCheckout(
        {
          key: pubKey,
          reference,
          email,
          amount: params.amount,
          currency: params.currency,
          channels,
          customer: { firstName, lastName, phone },
        },
        env
      );

      if (checkout.status === 'cancelled') {
        return { status: 'cancelled', reference: checkout.reference };
      }

      if (checkout.status === 'pending') {
        return { status: 'pending', reference: checkout.reference };
      }

      const verification = await verifyPayment(checkout.reference);
      if (verification.status === 'success') {
        if (!amountsMatch(verification.amount, params.amount)) {
          console.warn('Lenco verification amount mismatch', verification);
          return { status: 'failed', reference: checkout.reference };
        }
        const paymentId = await recordPayment({
          userId,
          amount: params.amount,
          currency: params.currency,
          method: params.method,
          providerRef: checkout.reference,
          plan: params.plan,
          role: params.role,
        });
        return { status: 'succeeded', paymentId, reference: checkout.reference };
      }

      if (verification.status === 'pending') {
        return { status: 'pending', reference: checkout.reference };
      }

      console.warn('Lenco verification failed', verification);
      return { status: 'failed', reference: checkout.reference };
    } catch (error) {
      console.error('Lenco payment error', error);
      return { status: 'failed' };
    }
  }
}

function resolveEnv(): LencoEnv {
  const env = (import.meta.env.VITE_LENCO_ENV ?? '').toString().toLowerCase();
  if (env === 'live') return 'live';
  if (env === 'sandbox') return 'sandbox';
  return import.meta.env.PROD ? 'live' : 'sandbox';
}

function getPublicKey(): string | undefined {
  const key = import.meta.env.VITE_LENCO_PUBLIC_KEY as string | undefined;
  return key?.trim() ? key : undefined;
}

function buildReference(metadata: MetadataRecord, userId: unknown): string {
  const candidate = typeof metadata.reference === 'string' ? metadata.reference : null;
  if (candidate?.trim()) return candidate.trim();
  return `ref-${Date.now()}-${String(userId).replace(/[^a-zA-Z0-9]/g, '')}`;
}

function deriveNameParts(metadata: MetadataRecord): { firstName: string; lastName: string } {
  const firstNameMeta = typeof metadata.firstName === 'string' ? metadata.firstName.trim() : '';
  const lastNameMeta = typeof metadata.lastName === 'string' ? metadata.lastName.trim() : '';
  const fullNameMeta = typeof metadata.userName === 'string' ? metadata.userName.trim() : '';

  if (firstNameMeta && lastNameMeta) return { firstName: firstNameMeta, lastName: lastNameMeta };
  if (firstNameMeta) return { firstName: firstNameMeta, lastName: lastNameMeta || 'ZambiaHomes' };

  if (fullNameMeta) {
    const parts = fullNameMeta.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: 'User', lastName: 'ZambiaHomes' };
    if (parts.length === 1) return { firstName: parts[0], lastName: 'ZambiaHomes' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }

  return { firstName: 'User', lastName: 'ZambiaHomes' };
}

async function verifyPayment(reference: string): Promise<VerificationOutcome> {
  try {
    const response = await fetch('/.netlify/functions/lenco-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { status: 'error', raw: payload };
    }
    const status = typeof payload.status === 'string' ? payload.status.toLowerCase() : 'unknown';
    if (status === 'successful' || status === 'success') {
      return { status: 'success', amount: toNumber(payload.amount), currency: payload.currency ?? null, raw: payload };
    }
    if (status === 'pending') {
      return { status: 'pending', raw: payload };
    }
    return { status: 'failed', raw: payload };
  } catch (error) {
    console.error('Lenco verification request error', error);
    return { status: 'error', raw: error };
  }
}

async function recordPayment(args: {
  userId: unknown;
  amount: number;
  currency: string;
  method: 'card' | 'mobile';
  providerRef: string;
  plan: PayParams['plan'];
  role: PayParams['role'];
}): Promise<string | undefined> {
  const response = await fetch('/.netlify/functions/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: args.userId,
      amount: args.amount,
      currency: args.currency,
      method: args.method,
      status: 'completed',
      provider_ref: args.providerRef,
      plan: args.plan,
      role: args.role,
    }),
  });
  if (!response.ok) {
    const errPayload = await response.text().catch(() => '');
    throw new Error(`Failed to record payment: ${errPayload || response.status}`);
  }
  const payload = await response.json().catch(() => ({}));
  const paymentId = payload?.id;
  return paymentId ? String(paymentId) : undefined;
}

function amountsMatch(verifiedAmount: number | null | undefined, expectedAmount: number): boolean {
  if (verifiedAmount == null) return true; // Lenco may omit amount for some channels; skip strict match.
  return Math.abs(Number(verifiedAmount) - Number(expectedAmount)) < 0.01;
}

function toNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
