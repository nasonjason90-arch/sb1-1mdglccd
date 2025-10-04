import { Storage, seedOnce } from './storage';
import { ApprovalApplication, PaymentRecord, Property, User } from './types';

seedOnce();

export const AdminService = {
  stats: () => {
    const users = Storage.getUsers();
    const properties = Storage.getProperties();
    const approvals = Storage.getApprovals();
    const payments = Storage.getPayments();
    const revenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    return {
      totalUsers: users.length,
      activeProperties: properties.filter(p => p.status === 'active').length,
      monthlyRevenue: revenue,
      pendingApprovals: approvals.length,
    };
  },
  listApprovals: (): ApprovalApplication[] => Storage.getApprovals(),
  approve: (id: string) => {
    const approvals = Storage.getApprovals();
    const a = approvals.find(x => x.id === id);
    if (!a) return;
    Storage.setApprovals(approvals.filter(x => x.id !== id));
    const users = Storage.getUsers();
    const newUser: User = {
      id: `u_${Date.now()}`,
      email: a.email,
      full_name: a.name,
      phone: a.phone,
      role: a.role,
      approval_status: 'approved',
      subscription_status: 'trial',
    };
    Storage.setUsers([newUser, ...users]);
    Storage.appendAudit({ type: 'approval_approved', id, role: a.role, name: a.name });
    return newUser;
  },
  reject: (id: string, reason?: string) => {
    const approvals = Storage.getApprovals();
    const a = approvals.find(x => x.id === id);
    if (!a) return;
    Storage.setApprovals(approvals.filter(x => x.id !== id));
    Storage.appendAudit({ type: 'approval_rejected', id, name: a.name, reason });
  },
  listUsers: (): User[] => Storage.getUsers(),
  listProperties: (): Property[] => Storage.getProperties(),
  listPayments: (): PaymentRecord[] => Storage.getPayments(),
  audits: () => Storage.getAudits(),
};
