export type PayPlan = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PayRole = 'seeker' | 'landlord' | 'agent' | 'agency' | 'landlord_agent';

export interface PayParams {
  amount: number;
  currency: string;
  description: string;
  plan: PayPlan;
  role: PayRole;
  method: 'card' | 'mobile';
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  status: 'succeeded' | 'failed' | 'pending' | 'cancelled';
  paymentId?: string;
  reference?: string;
}

export interface PaymentProvider {
  pay(params: PayParams): Promise<PaymentResult>;
}
