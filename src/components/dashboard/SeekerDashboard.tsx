import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Bell, Calendar, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SeekerDashboard() {
  const { user } = useAuth();

  const savedProperties = [
    {
      id: '1',
      title: '3 Bedroom House in Kabulonga',
      location: 'Kabulonga, Lusaka',
      price: 12000,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '2',
      title: 'Modern 2 Bedroom Apartment',
      location: 'Rhodes Park, Lusaka',
      price: 8000,
      image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const recentSearches = [
    'Houses in Lusaka under ZMW 10,000',
    'Apartments in Rhodes Park',
    'Offices in CBD'
  ];

  const upcomingViewings = [
    {
      property: '3 Bedroom House in Kabulonga',
      date: '2024-01-15',
      time: '10:00 AM',
      agent: 'John Mwansa'
    },
    {
      property: 'Executive Office Space',
      date: '2024-01-16',
      time: '2:00 PM',
      agent: 'Mary Banda'
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
        <p className="text-gray-600">Find your perfect property in Zambia</p>
        
        {user?.subscription_status === 'trial' && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Free Trial Active
                </h3>
                <p className="text-sm text-orange-700">
                  {trialDaysLeft} days remaining. Upgrade to continue accessing premium features.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/properties"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Search className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Search Properties</h3>
                  <p className="text-sm text-gray-600">Find your ideal property</p>
                </div>
              </Link>
              <Link
                to="/properties?saved=true"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Heart className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Saved Properties</h3>
                  <p className="text-sm text-gray-600">View your favorites</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Saved Properties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Saved Properties</h2>
              <Link to="/properties?saved=true" className="text-green-600 hover:text-green-700 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {savedProperties.map((property) => (
                <div key={property.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{property.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <p className="text-green-600 font-medium">ZMW {property.price.toLocaleString()}/month</p>
                  </div>
                  <Link
                    to={`/property/${property.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Searches</h2>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{search}</span>
                  <button className="text-green-600 hover:text-green-700 text-sm">
                    Search Again
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Summary</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Phone:</span>
                <p className="text-gray-900">{user?.phone}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Member since:</span>
                <p className="text-gray-900">January 2024</p>
              </div>
              <Link
                to="/profile"
                className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Upcoming Viewings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Viewings</h2>
            <div className="space-y-4">
              {upcomingViewings.map((viewing, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 text-sm">{viewing.property}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{viewing.date} at {viewing.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Agent: {viewing.agent}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  New property matching your criteria: 2BR Apartment in Rhodes Park
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Viewing confirmed for tomorrow at 10:00 AM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}