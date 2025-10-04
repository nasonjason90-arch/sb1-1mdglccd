import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, Calendar, TrendingUp, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AgentDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Listings', value: '24', icon: Plus, color: 'bg-blue-500' },
    { label: 'Total Clients', value: '47', icon: Users, color: 'bg-green-500' },
    { label: 'Monthly Commission', value: 'ZMW 18,500', icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Scheduled Viewings', value: '8', icon: Calendar, color: 'bg-orange-500' }
  ];

  const recentListings = [
    {
      id: '1',
      title: 'Executive Office Space - CBD',
      location: 'Central Business District, Lusaka',
      price: 25000,
      listing_type: 'rent' as 'rent' | 'sale',
      status: 'active',
      inquiries: 12,
      image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '2',
      title: '4 Bedroom House - Meanwood',
      location: 'Meanwood, Lusaka',
      price: 15000,
      listing_type: 'rent' as 'rent' | 'sale',
      status: 'active',
      inquiries: 8,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '3',
      title: 'Commercial Complex - Woodlands',
      location: 'Woodlands, Lusaka',
      price: 2150000,
      listing_type: 'sale' as 'rent' | 'sale',
      status: 'active',
      inquiries: 5,
      image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const upcomingViewings = [
    {
      property: 'Executive Office Space - CBD',
      client: 'John Banda',
      date: '2024-01-15',
      time: '10:00 AM',
      phone: '+260-971-619-186'
    },
    {
      property: '4 Bedroom House - Meanwood',
      client: 'Sarah Mwanza',
      date: '2024-01-15',
      time: '2:00 PM',
      phone: '+260-955-050-476'
    }
  ];

  const recentClients = [
    {
      name: 'Michael Tembo',
      type: 'Buyer',
      budget: 'ZMW 8,000 - 12,000',
      looking_for: '2-3 Bedroom Apartment',
      status: 'active'
    },
    {
      name: 'Grace Phiri',
      type: 'Landlord',
      property: '3 Bedroom House - Kabulonga',
      status: 'listed'
    }
  ];

  const calculateTrialDaysLeft = () => {
    if (!user?.trial_end_date) return 0;
    const trialEnd = new Date(user.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const trialDaysLeft = calculateTrialDaysLeft();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600">Manage your rental and sale listings, clients, and track your performance</p>
        
        {user?.subscription_status === 'trial' && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Free Trial Active
                </h3>
                <p className="text-sm text-orange-700">
                  {trialDaysLeft} days remaining. Upgrade to access advanced agent tools.
                </p>
              </div>
              <Link
                to="/subscription"
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/add-property"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Add New Listing</h3>
                  <p className="text-sm text-gray-600">Create property listing</p>
                </div>
              </Link>
              <Link
                to="/clients"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage Clients</h3>
                  <p className="text-sm text-gray-600">View client database</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
              <Link to="/properties?agent=true" className="text-green-600 hover:text-green-700 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentListings.map((property) => {
                const isSale = property.listing_type === 'sale';
                const priceLabel = isSale
                  ? `ZMW ${property.price.toLocaleString()}`
                  : `ZMW ${property.price.toLocaleString()}/month`;
                const listingBadgeClass = isSale ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800';

                return (
                  <div key={property.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-600">{property.location}</p>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className={`font-medium ${isSale ? 'text-indigo-600' : 'text-green-600'}`}>{priceLabel}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${listingBadgeClass}`}>
                          {isSale ? 'For Sale' : 'For Rent'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {property.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{property.inquiries} inquiries</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/property/${property.id}/edit`}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/property/${property.id}`}
                        className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Clients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Clients</h2>
            <div className="space-y-4">
              {recentClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600">Type: {client.type}</p>
                    {client.budget && (
                      <p className="text-sm text-gray-600">Budget: {client.budget}</p>
                    )}
                    {client.looking_for && (
                      <p className="text-sm text-gray-600">Looking for: {client.looking_for}</p>
                    )}
                    {client.property && (
                      <p className="text-sm text-gray-600">Property: {client.property}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {client.status}
                    </span>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Commission Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Commission</h2>
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">Commission Chart</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Viewings</h2>
            <div className="space-y-4">
              {upcomingViewings.map((viewing, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 text-sm">{viewing.property}</h3>
                  <p className="text-sm text-gray-600 mt-1">Client: {viewing.client}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{viewing.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{viewing.phone}</span>
                  </div>
                  <button className="mt-2 w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 transition-colors">
                    Call Client
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">This Month</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Properties Listed</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deals Closed</span>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Clients</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Viewings</span>
                <span className="text-sm font-medium">24</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
