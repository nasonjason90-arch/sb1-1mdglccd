import { PaymentProvider, PayParams, PaymentResult } from './provider';

export class MockPaymentProvider implements PaymentProvider {
  async pay(params: PayParams): Promise<PaymentResult> {
    await new Promise(r => setTimeout(r, 800));
    if (params.amount <= 0) {
      return { status: 'failed', reference: `pay_fail_${Date.now()}` };
    }
    const reference = `pay_${Date.now()}`;
    return { status: 'succeeded', reference, paymentId: reference };
  }
}
