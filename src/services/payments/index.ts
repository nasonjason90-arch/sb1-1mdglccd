import { Storage } from '../storage';
import { Storage } from '../storage';
import { LencoPaymentProvider } from './lenco-provider';
import { MockPaymentProvider } from './mock';
import type { PaymentProvider, PayParams, PaymentResult } from './provider';

let cachedProvider: PaymentProvider | null = null;

function selectProvider(): PaymentProvider {
  if (typeof window === 'undefined') {
    return new MockPaymentProvider();
  }
  if (cachedProvider) return cachedProvider;
  const hasPublicKey = Boolean((import.meta.env.VITE_LENCO_PUBLIC_KEY as string | undefined)?.trim());
  cachedProvider = hasPublicKey ? new LencoPaymentProvider() : new MockPaymentProvider();
  return cachedProvider;
}

export const Payments = {
  async pay(params: PayParams): Promise<PaymentResult> {
    const provider = selectProvider();
    const result = await provider.pay(params);

    if (typeof window !== 'undefined') {
      const metadata = (params.metadata ?? {}) as Record<string, unknown>;
      const userIdValue = metadata.userId;
      const userId = typeof userIdValue === 'string' || typeof userIdValue === 'number' ? String(userIdValue) : 'unknown';
      const userName = typeof metadata.userName === 'string' ? (metadata.userName as string) : 'Unknown';
      const recordId = result.paymentId ?? result.reference ?? `pay_${Date.now()}`;
      const status = result.status === 'succeeded' ? 'completed' : result.status;

      const payments = Storage.getPayments();
      Storage.setPayments([
        {
          id: recordId,
          userId,
          userName,
          amount: params.amount,
          currency: params.currency,
          plan: `${params.role} ${params.plan}`,
          date: new Date().toISOString().slice(0, 10),
          status,
          method: params.method,
        },
        ...payments,
      ]);

      if (result.status === 'succeeded') {
        const subs = Storage.getSubscriptions();
        const now = Date.now();
        let periodDays = 30;
        if (params.plan === 'daily') periodDays = 1;
        else if (params.plan === 'weekly') periodDays = 7;
        else if (params.plan === 'monthly') periodDays = 30;
        else if (params.plan === 'yearly') periodDays = 365;
        const periodMs = periodDays * 86400000;
        const userSub = subs.find(s => s.userId === userId);
        const newEnd = new Date(now + periodMs).toISOString();
        if (userSub) {
          userSub.status = 'active';
          userSub.plan = params.plan;
          userSub.current_period_end = newEnd;
        } else {
          subs.push({ userId, plan: params.plan, role: params.role, status: 'active', current_period_end: newEnd });
        }
        Storage.setSubscriptions(subs);
      }
    }

    return result;
  },
};
