export type Role = 'agent' | 'landlord' | 'seeker' | 'admin' | 'agency';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  approval_status?: 'pending' | 'approved' | 'rejected';
  trial_end_date?: string;
  subscription_status?: 'trial' | 'active' | 'expired';
}

export interface Property {
  id: string;
  title: string;
  owner: string;
  status: 'active' | 'pending' | 'removed';
  price: number;
  listed: string;
  location?: string;
  type?: 'house' | 'apartment' | 'office' | 'boarding' | 'commercial';
  listing_type?: 'rent' | 'sale';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  features?: string[];
  address?: string;
}

export interface ApprovalApplication {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, 'seeker' | 'admin'>;
  phone: string;
  company?: string;
  license?: string;
  experience?: string;
  properties?: string;
  verification?: string;
  submitted: string;
  documents: string[];
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  plan: string;
  date: string;
  status: 'completed' | 'failed' | 'pending';
  method: 'card' | 'mobile';
}

export interface Subscription {
  userId: string;
  plan: 'monthly' | 'yearly';
  role: Role;
  status: 'trial' | 'active' | 'expired';
  current_period_end?: string;
}
