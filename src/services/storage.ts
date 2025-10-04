import { ApprovalApplication, PaymentRecord, Property, Subscription, User } from './types';

const LS_KEYS = {
  users: 'app_users',
  approvals: 'app_approvals',
  properties: 'app_properties',
  payments: 'app_payments',
  subscriptions: 'app_subscriptions',
  audits: 'app_audits',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedOnce() {
  const seeded = localStorage.getItem('app_seeded');
  if (seeded) return;

  const now = new Date();

  const users: User[] = [
    { id: 'u1', email: 'grace.tembo@email.com', full_name: 'Grace Tembo', phone: '+260-971-000-001', role: 'seeker', subscription_status: 'trial' },
    { id: 'u2', email: 'james.mwila@email.com', full_name: 'James Mwila', phone: '+260-971-000-002', role: 'landlord', subscription_status: 'active' },
    { id: 'u3', email: 'sarah.banda@email.com', full_name: 'Sarah Banda', phone: '+260-971-000-003', role: 'agent', subscription_status: 'active' },
    { id: 'admin', email: 'admin@example.com', full_name: 'Admin', phone: '+260-971-999-999', role: 'admin', subscription_status: 'active' },
  ];

  const approvals: ApprovalApplication[] = [
    { id: 'a1', name: 'John Banda', email: 'john.banda@email.com', role: 'agent', phone: '+260-971-123-456', company: 'Banda Real Estate', license: 'RE-2024-001', experience: '5 years', submitted: '2024-01-10', documents: ['License', 'ID Copy', 'Company Registration'] },
    { id: 'a2', name: 'Mary Mwanza', email: 'mary.mwanza@email.com', role: 'landlord', phone: '+260-972-456-789', properties: '3 properties to list', verification: 'Property ownership documents', submitted: '2024-01-09', documents: ['Property Deeds', 'ID Copy', 'Tax Clearance'] },
    { id: 'a3', name: 'David Phiri', email: 'david.phiri@email.com', role: 'agent', phone: '+260-955-789-123', company: 'Phiri Properties Ltd', license: 'RE-2024-002', experience: '8 years', submitted: '2024-01-08', documents: ['License', 'ID Copy', 'References'] },
  ];

  const properties: Property[] = [
    { id: 'p1', title: '3 Bedroom House in Kabulonga', owner: 'John Mwanza', status: 'active', price: 12000, listed: '2024-01-10', listing_type: 'rent' },
    { id: 'p2', title: 'Office Space in CBD', owner: 'Sarah Banda', status: 'pending', price: 25000, listed: '2024-01-09', listing_type: 'rent' },
    { id: 'p3', title: '2 Bedroom Apartment', owner: 'Mike Phiri', status: 'active', price: 8000, listed: '2024-01-08', listing_type: 'sale' },
  ];

  const payments: PaymentRecord[] = [
    { id: 'pay1', userId: 'u2', userName: 'Mary Mwanza', amount: 150, currency: 'ZMW', plan: 'Landlord Monthly', date: '2024-01-10', status: 'completed', method: 'card' },
    { id: 'pay2', userId: 'u3', userName: 'David Phiri', amount: 3000, currency: 'ZMW', plan: 'Agent Yearly', date: '2024-01-09', status: 'completed', method: 'card' },
    { id: 'pay3', userId: 'u1', userName: 'Grace Tembo', amount: 50, currency: 'ZMW', plan: 'Seeker Monthly', date: '2024-01-08', status: 'failed', method: 'mobile' },
  ];

  const subscriptions: Subscription[] = [
    { userId: 'u1', plan: 'monthly', role: 'seeker', status: 'trial', current_period_end: new Date(now.getTime() + 10 * 86400000).toISOString() },
    { userId: 'u2', plan: 'monthly', role: 'landlord', status: 'active', current_period_end: new Date(now.getTime() + 25 * 86400000).toISOString() },
    { userId: 'u3', plan: 'yearly', role: 'agent', status: 'active', current_period_end: new Date(now.getTime() + 200 * 86400000).toISOString() },
  ];

  set(LS_KEYS.users, users);
  set(LS_KEYS.approvals, approvals);
  set(LS_KEYS.properties, properties);
  set(LS_KEYS.payments, payments);
  set(LS_KEYS.subscriptions, subscriptions);
  set('app_seeded', '1');
}

export const Storage = {
  getUsers: () => get<User[]>(LS_KEYS.users, []),
  setUsers: (v: User[]) => set(LS_KEYS.users, v),

  getApprovals: () => get<ApprovalApplication[]>(LS_KEYS.approvals, []),
  setApprovals: (v: ApprovalApplication[]) => set(LS_KEYS.approvals, v),

  getProperties: () => get<Property[]>(LS_KEYS.properties, []),
  setProperties: (v: Property[]) => set(LS_KEYS.properties, v),

  getPayments: () => get<PaymentRecord[]>(LS_KEYS.payments, []),
  setPayments: (v: PaymentRecord[]) => set(LS_KEYS.payments, v),

  getSubscriptions: () => get<Subscription[]>(LS_KEYS.subscriptions, []),
  setSubscriptions: (v: Subscription[]) => set(LS_KEYS.subscriptions, v),

  appendAudit: (event: any) => {
    const list = get<any[]>(LS_KEYS.audits, []);
    list.unshift({ ...event, ts: new Date().toISOString() });
    set(LS_KEYS.audits, list);
  },
  getAudits: () => get<any[]>(LS_KEYS.audits, []),
};
