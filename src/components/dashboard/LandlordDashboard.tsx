import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, DollarSign, Users, Calendar, TrendingUp, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LandlordDashboard() {
  const { user } = useAuth();

  const properties = [
    {
      id: '1',
      title: '3 Bedroom House in Kabulonga',
      location: 'Kabulonga, Lusaka',
      price: 12000,
      listing_type: 'rent' as 'rent' | 'sale',
      status: 'occupied',
      tenant: 'John Doe',
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '2',
      title: 'Modern 2 Bedroom Apartment',
      location: 'Rhodes Park, Lusaka',
      price: 8000,
      listing_type: 'rent' as 'rent' | 'sale',
      status: 'vacant',
      tenant: null,
      image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '3',
      title: 'Commercial Complex - Woodlands',
      location: 'Woodlands, Lusaka',
      price: 2250000,
      listing_type: 'sale' as 'rent' | 'sale',
      status: 'available',
      tenant: null,
      image: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const stats = [
    { label: 'Total Properties', value: '12', icon: Home, color: 'bg-blue-500' },
    { label: 'Monthly Revenue', value: 'ZMW 95,000', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Occupied Units', value: '10', icon: Users, color: 'bg-purple-500' },
    { label: 'Vacant Units', value: '2', icon: Calendar, color: 'bg-orange-500' }
  ];

  const recentInquiries = [
    {
      property: '2 Bedroom Apartment - Rhodes Park',
      inquirer: 'Mary Banda',
      date: '2024-01-14',
      status: 'pending'
    },
    {
      property: '3 Bedroom House - Kabulonga',
      inquirer: 'James Mwanza',
      date: '2024-01-13',
      status: 'responded'
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
        <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
        <p className="text-gray-600">Manage your rental and sale portfolio from one place</p>
        
        {user?.subscription_status === 'trial' && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Free Trial Active
                </h3>
                <p className="text-sm text-orange-700">
                  {trialDaysLeft} days remaining. Upgrade to continue managing your properties.
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
                  <h3 className="font-medium text-gray-900">Add Property</h3>
                  <p className="text-sm text-gray-600">List a new property</p>
                </div>
              </Link>
              <Link
                to="/properties?manage=true"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Home className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage Properties</h3>
                  <p className="text-sm text-gray-600">View all listings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* My Properties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
              <Link to="/add-property" className="text-green-600 hover:text-green-700 text-sm">
                Add New
              </Link>
            </div>
            <div className="space-y-4">
              {properties.map((property) => {
                const isSale = property.listing_type === 'sale';
                const priceLabel = isSale
                  ? `ZMW ${property.price.toLocaleString()}`
                  : `ZMW ${property.price.toLocaleString()}/month`;
                const priceColor = isSale ? 'text-indigo-600' : 'text-green-600';
                const listingBadgeClass = isSale ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800';
                const statusBadgeClass = property.status === 'occupied'
                  ? 'bg-green-100 text-green-800'
                  : property.status === 'available'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800';
                const statusLabel = isSale
                  ? (property.status === 'available' ? 'Available' : property.status)
                  : (property.status === 'occupied' ? 'Occupied' : 'Vacant');

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
                        <span className={`${priceColor} font-medium`}>{priceLabel}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${listingBadgeClass}`}>
                          {isSale ? 'For Sale' : 'For Rent'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusBadgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      {!isSale && property.tenant && (
                        <p className="text-sm text-gray-600">Tenant: {property.tenant}</p>
                      )}
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
                        className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Inquiries</h2>
            <div className="space-y-4">
              {recentInquiries.map((inquiry, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{inquiry.property}</h3>
                    <p className="text-sm text-gray-600">From: {inquiry.inquirer}</p>
                    <p className="text-sm text-gray-600">Date: {inquiry.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      inquiry.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {inquiry.status === 'pending' ? 'Pending' : 'Responded'}
                    </span>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                      Respond
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">Revenue Chart</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Property Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Views</span>
                <span className="text-sm font-medium">Kabulonga House</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Inquiries</span>
                <span className="text-sm font-medium">Rhodes Park Apt</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest Rate</span>
                <span className="text-sm font-medium">ZMW 15,000</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Landlord Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep property photos updated</li>
              <li>• Respond to inquiries quickly</li>
              <li>• Set competitive pricing</li>
              <li>• Maintain property details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
