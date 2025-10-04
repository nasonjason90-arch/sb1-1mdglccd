import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Home,
  DollarSign,
  TrendingUp,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  Shield,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { AdminService } from '../services/admin';
import { apiGet, apiPost } from '../services/api';
import { DEFAULT_PLATFORM_SETTINGS, PlatformSettings } from '../services/settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'payments' | 'approvals' | 'reports' | 'settings'>('overview');
  const [approvals, setApprovals] = useState(AdminService.listApprovals());
  const [users, setUsers] = useState(AdminService.listUsers());
  const [properties, setProperties] = useState(AdminService.listProperties());
  const [payments, setPayments] = useState(AdminService.listPayments());
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({ ...DEFAULT_PLATFORM_SETTINGS });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [remoteApprovals, remoteUsers] = await Promise.all([
          apiGet<any[]>('approvals'),
          apiGet<any[]>('users'),
        ]);
        setApprovals(remoteApprovals.map(a => ({
          id: a.id,
          name: a.applicant_name,
          email: a.email,
          phone: a.phone,
          role: a.role,
          company: a.company,
          license: a.license,
          experience: a.experience,
          properties: a.properties,
          verification: a.verification,
          submitted: a.submitted_at,
          documents: [],
        })));
        setUsers(remoteUsers.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          phone: u.phone,
          role: u.role,
          subscription_status: u.subscription_status,
          approval_status: u.approval_status,
          trial_end_date: u.created_at,
        })) as any);
      } catch {
        setApprovals(AdminService.listApprovals());
        setUsers(AdminService.listUsers());
      }
      setProperties(AdminService.listProperties());
      setPayments(AdminService.listPayments());
    })();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'settings') return;
    let cancelled = false;
    setSettingsLoading(true);
    (async () => {
      try {
        const remote = await apiGet<PlatformSettings>('settings');
        if (!cancelled) {
          setPlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS, ...remote });
          setSettingsError(null);
        }
      } catch {
        if (!cancelled) {
          setPlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS });
          setSettingsError('Unable to load settings. Showing defaults.');
        }
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    if (!settingsMessage) return;
    const timer = setTimeout(() => setSettingsMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [settingsMessage]);

  const updateSetting = (key: keyof PlatformSettings, value: PlatformSettings[keyof PlatformSettings]) => {
    setPlatformSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await apiPost('settings', platformSettings);
      setSettingsMessage('Settings saved successfully.');
      setSettingsError(null);
    } catch {
      setSettingsError('Failed to save settings. Please try again.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const stats = useMemo(() => {
    const s = AdminService.stats();
    return [
      { label: 'Total Users', value: s.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-500', change: '' },
      { label: 'Active Properties', value: s.activeProperties.toString(), icon: Home, color: 'bg-green-500', change: '' },
      { label: 'Monthly Revenue', value: `ZMW ${s.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500', change: '' },
      { label: 'Pending Approvals', value: approvals.length.toString(), icon: Clock, color: 'bg-orange-500', change: '' },
    ];
  }, [approvals]);

  const paymentStats = useMemo(() => {
    const revenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    return {
      total_revenue: revenue,
      active_subscriptions: users.filter(u => u.subscription_status === 'active').length,
      trial_users: users.filter(u => u.subscription_status === 'trial').length,
      expired_subscriptions: users.filter(u => u.subscription_status === 'expired').length,
      recent_payments: payments.slice(0, 10).map(p => ({
        user: p.userName,
        amount: `ZMW ${p.amount.toLocaleString()}`,
        plan: p.plan,
        date: p.date,
        status: p.status,
      })),
    };
  }, [payments, users]);

  const handleApproval = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await apiPost('approvals', { id, action, reason });
    } catch {
      if (action === 'approve') {
        AdminService.approve(id);
      } else {
        AdminService.reject(id, reason);
      }
    }
    try {
      const remoteApprovals = await apiGet<any[]>('approvals');
      setApprovals(remoteApprovals.map(a => ({
        id: a.id,
        name: a.applicant_name,
        email: a.email,
        phone: a.phone,
        role: a.role,
        company: a.company,
        license: a.license,
        experience: a.experience,
        properties: a.properties,
        verification: a.verification,
        submitted: a.submitted_at,
        documents: [],
      })));
      const remoteUsers = await apiGet<any[]>('users');
      setUsers(remoteUsers as any);
    } catch {
      setApprovals(AdminService.listApprovals());
      setUsers(AdminService.listUsers());
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('approvals')}
            className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Pending Approvals</h4>
              <p className="text-sm text-gray-600">{approvals.length} waiting</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className="flex items-center p-4 border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600">{users.length} total</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className="flex items-center p-4 border border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Home className="h-8 w-8 text-green-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Properties</h4>
              <p className="text-sm text-gray-600">{properties.filter(p => p.status === 'active').length} active</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center p-4 border border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Reports</h4>
              <p className="text-sm text-gray-600">Analytics</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-700 capitalize">{user.role}</span>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                    user.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.subscription_status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h3>
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{property.title}</p>
                  <p className="text-sm text-gray-600">Owner: {property.owner}</p>
                  <p className="text-sm text-green-600">ZMW {property.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    property.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{property.listed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            <p className="text-sm text-gray-600">Review and approve new agent and landlord applications</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {approvals.length} Pending
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {approvals.map((application) => (
            <div key={application.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{application.name}</h4>
                    <p className="text-sm text-gray-600">{application.email}</p>
                    <p className="text-sm text-gray-600">{application.phone}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                      application.role === 'agent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {application.role === 'agent' ? 'Real Estate Agent' : 'Landlord'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Applied: {application.submitted}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Application Details</h5>
                  {application.role === 'agent' ? (
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Company:</span> {application.company}</p>
                      <p><span className="font-medium">License:</span> {application.license}</p>
                      <p><span className="font-medium">Experience:</span> {application.experience}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Properties:</span> {application.properties}</p>
                      <p><span className="font-medium">Verification:</span> {application.verification}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Documents Submitted</h5>
                  <div className="space-y-1">
                    {application.documents.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">{doc}</span>
                        <button className="text-blue-600 hover:text-blue-800 text-xs">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproval(application.id, 'approve')}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      handleApproval(application.id, 'reject', reason || undefined);
                    }}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Applicant</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600 mt-1">Manage all platform users and their subscriptions</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Export Users
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Send Notification
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize text-sm text-gray-900">{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                    user.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.subscription_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.subscription_status === 'trial' ? 'Free Trial' : user.subscription_status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-900">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Property Management</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage all property listings</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Export Properties
            </button>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
              Bulk Actions
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{property.title}</div>
                  <div className="text-sm text-gray-500">Listed: {property.listed}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {property.owner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ZMW {property.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    property.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.floor(Math.random() * 200) + 50}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-900">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">ZMW {paymentStats.total_revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.active_subscriptions}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trial Users</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.trial_users}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.expired_subscriptions}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentStats.recent_payments.map((payment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">User Growth</h4>
            <p className="text-2xl font-bold text-blue-600">+15.3%</p>
            <p className="text-sm text-blue-700">This month</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Revenue Growth</h4>
            <p className="text-2xl font-bold text-green-600">+22.1%</p>
            <p className="text-sm text-green-700">This month</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Property Listings</h4>
            <p className="text-2xl font-bold text-purple-600">+8.7%</p>
            <p className="text-sm text-purple-700">This month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Popular Locations</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Lusaka</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Ndola</span>
                <span className="font-medium">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Kitwe</span>
                <span className="font-medium">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Livingstone</span>
                <span className="font-medium">14%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Property Types</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Houses</span>
                <span className="font-medium">40%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Apartments</span>
                <span className="font-medium">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Offices</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Boarding Houses</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
        {settingsLoading ? (
          <p className="text-sm text-gray-600">Loading settings...</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSaveSettings}>
            {settingsError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {settingsError}
              </div>
            )}
            {settingsMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
                {settingsMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  value={platformSettings.commission}
                  onChange={(e) => updateSetting('commission', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trial Period (Days)
                </label>
                <input
                  type="number"
                  value={platformSettings.trial_days}
                  onChange={(e) => updateSetting('trial_days', Math.max(1, Number(e.target.value) || DEFAULT_PLATFORM_SETTINGS.trial_days))}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Approval for Seekers
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_approve_seekers"
                  checked={platformSettings.auto_approve_seekers}
                  onChange={(e) => updateSetting('auto_approve_seekers', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_approve_seekers" className="text-sm text-gray-700">
                  Automatically approve property seeker registrations
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manual Approval Required
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="manual_approve_landlord_agent"
                    checked={platformSettings.manual_approve_landlord_agent}
                    onChange={(e) => updateSetting('manual_approve_landlord_agent', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="manual_approve_landlord_agent" className="text-sm text-gray-700">
                    Require manual approval for landlord/agent accounts
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="manual_approve_agencies"
                    checked={platformSettings.manual_approve_agencies}
                    onChange={(e) => updateSetting('manual_approve_agencies', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="manual_approve_agencies" className="text-sm text-gray-700">
                    Require manual approval for agency accounts
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={platformSettings.maintenance_mode}
                onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenance_mode" className="text-sm text-gray-700">
                Enable maintenance mode
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="new_registrations"
                checked={platformSettings.allow_registrations}
                onChange={(e) => updateSetting('allow_registrations', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="new_registrations" className="text-sm text-gray-700">
                Allow new registrations
              </label>
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {settingsSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Database</p>
            <p className="text-xs text-green-600">Healthy</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">API Services</p>
            <p className="text-xs text-green-600">Operational</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Storage</p>
            <p className="text-xs text-yellow-600">80% Full</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'approvals', name: 'Approvals', icon: Clock },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'properties', name: 'Properties', icon: Home },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'approvals': return renderApprovals();
      case 'users': return renderUsers();
      case 'properties': return renderProperties();
      case 'payments': return renderPayments();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive platform management and oversight</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.id === 'approvals' && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {approvals.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
