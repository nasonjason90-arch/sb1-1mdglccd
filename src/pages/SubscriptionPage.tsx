import React, { useEffect, useMemo, useState } from 'react';
import { Check, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Payments } from '../services/payments';
import { logEvent } from '../services/audit';

type PlanPeriod = 'daily' | 'weekly' | 'monthly';

type RoleKey = 'landlord_agent' | 'seeker' | 'agency';

interface RolePlan {
  name: string;
  prices: Partial<Record<PlanPeriod, number>>;
  features: string[];
  badge?: string;
}

const rolePlans: Record<RoleKey, RolePlan> = {
  landlord_agent: {
    name: 'Landlord/Agents',
    prices: { daily: 10, weekly: 40, monthly: 120 },
    features: [
      'List properties',
      'Manage inquiries',
      'Tenant management',
      'Basic analytics',
      'Standard support'
    ],
  },
  seeker: {
    name: 'Property Seeker',
    prices: { daily: 10, weekly: 30, monthly: 80 },
    features: [
      'Unlimited property searches',
      'Save favorite properties',
      'Contact agents',
      'Property alerts',
      'Basic support'
    ],
  },
  agency: {
    name: 'Agencies',
    prices: { weekly: 600, monthly: 1200 },
    features: [
      'Unlimited listings',
      'Team management',
      'Advanced analytics',
      'White-label branding',
      'Premium support'
    ],
    badge: 'Premium',
  },
};

function deriveRole(userRole?: string | null): RoleKey {
  if (userRole === 'agent' || userRole === 'landlord') return 'landlord_agent';
  if (userRole === 'agency') return 'agency';
  return 'seeker';
}

function defaultPeriodForRole(role: RoleKey): PlanPeriod {
  // Agency doesn't offer daily; default to weekly for agency, monthly otherwise
  return role === 'agency' ? 'weekly' : 'monthly';
}

export default function SubscriptionPage() {
  React.useEffect(() => { document.title = 'Subscriptions & Pricing | ZambiaHomes'; }, []);
  const { user, updateProfile } = useAuth();
  const initialRole = useMemo(() => deriveRole(user?.role), [user?.role]);
  const [selectedRole, setSelectedRole] = useState<RoleKey>(initialRole);
  const [selectedPlan, setSelectedPlan] = useState<PlanPeriod>(defaultPeriodForRole(initialRole));
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [loading, setLoading] = useState(false);

  // Ensure selectedPlan is valid when role changes
  useEffect(() => {
    setSelectedRole(deriveRole(user?.role));
  }, [user?.role]);

  useEffect(() => {
    const prices = rolePlans[selectedRole].prices;
    if (!(selectedPlan in prices)) {
      setSelectedPlan(defaultPeriodForRole(selectedRole));
    }
  }, [selectedRole]);

  const availablePeriods = Object.keys(rolePlans[selectedRole].prices) as PlanPeriod[];
  const amount = rolePlans[selectedRole].prices[selectedPlan] || 0;

  const calculateTrialDaysLeft = () => {
    if (!user?.trial_end_date) return 0;
    const trialEnd = new Date(user.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleSubscription = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const selectedAmount = amount;
      const nameParts = (user.full_name || '').trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'ZambiaHomes';

      const result = await Payments.pay({
        amount: selectedAmount,
        currency: 'ZMW',
        description: `${rolePlans[selectedRole].name} ${selectedPlan}`,
        plan: selectedPlan,
        role: selectedRole,
        method: paymentMethod,
        metadata: {
          userId: user.id,
          userName: user.full_name,
          email: user.email,
          phone: user.phone,
          firstName,
          lastName,
          role: user.role,
        },
      });

      if (result.status === 'succeeded') {
        const receiptRef = result.reference ?? result.paymentId ?? 'processed';
        if (result.paymentId) {
          try { window.open(`/.netlify/functions/invoice?id=${result.paymentId}`, '_blank'); } catch {}
        }
        await updateProfile({ subscription_status: 'active' });
        try {
          const { apiPost } = await import('../services/api');
          await apiPost('whatsapp', {
            event: 'subscription_active',
            user_id: user.id,
            amount: selectedAmount,
            plan: selectedPlan,
            role: selectedRole,
          });
        } catch {}
        logEvent('payment_success', { id: receiptRef, amount: selectedAmount, method: paymentMethod });
        alert(`Subscription activated. Receipt: ${receiptRef}`);
      } else if (result.status === 'pending') {
        logEvent('payment_pending', { amount: selectedAmount, method: paymentMethod, reference: result.reference });
        alert('Payment is pending confirmation. We will activate your subscription once confirmed.');
      } else if (result.status === 'cancelled') {
        logEvent('payment_cancelled', { amount: selectedAmount, method: paymentMethod, reference: result.reference });
        alert('Payment was cancelled before completion. No charges were made.');
      } else {
        logEvent('payment_failed', { amount: selectedAmount, method: paymentMethod, reference: result.reference });
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      logEvent('payment_error', { error: String(error) });
      alert('Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const trialDaysLeft = calculateTrialDaysLeft();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">Upgrade to unlock all features and continue using ZambiaHomes</p>
          {user?.subscription_status === 'trial' && (
            <div className="mt-4 inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{trialDaysLeft} days left in your free trial</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{rolePlans[selectedRole].name} Plan {rolePlans[selectedRole].badge && (<span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 align-middle">{rolePlans[selectedRole].badge}</span>)}</h2>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setSelectedRole('landlord_agent')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === 'landlord_agent' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Landlord/Agents
              </button>
              <button
                onClick={() => setSelectedRole('seeker')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === 'seeker' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Seekers
              </button>
              <button
                onClick={() => setSelectedRole('agency')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === 'agency' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Agencies
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2">
              {availablePeriods.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlan(p)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedPlan === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">ZMW {amount.toLocaleString()}</div>
                <div className="text-gray-600">per {selectedPlan}</div>
              </div>
              <div className="space-y-3">
                {rolePlans[selectedRole].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="card"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mobile')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">Credit/Debit Card</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="mobile"
                    name="payment"
                    value="mobile"
                    checked={paymentMethod === 'mobile'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mobile')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label htmlFor="mobile" className="flex items-center space-x-2 cursor-pointer">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">Mobile Money (MTN/Airtel)</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'mobile' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Network</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="airtel">Airtel Money</option>
                      <option value="zamtel">Zamtel Kwacha</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+260-971-619-186"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubscription}
                disabled={loading || amount <= 0}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Subscribe for ZMW ${amount.toLocaleString()}`}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">Secure payment powered by Lenco. Cancel anytime.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">Yes, you can cancel your subscription anytime. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">We accept all major credit/debit cards and mobile money payments including MTN Mobile Money and Airtel Money.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Is my payment information secure?</h4>
              <p className="text-sm text-gray-600">Yes, all payments are processed securely using industry-standard encryption. We never store your payment details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
