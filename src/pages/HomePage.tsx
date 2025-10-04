import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, CheckCircle, Users, Building } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

// Mock featured properties
const featuredProperties = [
  {
    id: '1',
    title: '3 Bedroom House in Kabulonga',
    location: 'Kabulonga, Lusaka',
    price: 12000,
    type: 'house',
    listing_type: 'rent' as 'rent' | 'sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Swimming Pool', 'Garden', 'Garage', 'Security'],
    coordinates: { lat: -15.3875, lng: 28.3228 }
  },
  {
    id: '2',
    title: 'Modern 2 Bedroom Apartment',
    location: 'Rhodes Park, Lusaka',
    price: 8000,
    type: 'apartment',
    listing_type: 'rent' as 'rent' | 'sale',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    images: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Gym', 'Parking', '24/7 Security', 'WiFi'],
    coordinates: { lat: -15.4067, lng: 28.3069 }
  },
  {
    id: '3',
    title: 'Executive Office Space',
    location: 'CBD, Lusaka',
    price: 15000,
    type: 'office',
    listing_type: 'sale' as 'rent' | 'sale',
    bedrooms: 0,
    bathrooms: 2,
    area: 200,
    images: ['https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Reception Area', 'Conference Room', 'Parking', 'AC'],
    coordinates: { lat: -15.4205, lng: 28.2837 }
  }
];

const stats = [
  { icon: Building, label: 'Properties Listed', value: '5,000+' },
  { icon: Users, label: 'Happy Clients', value: '15,000+' },
  { icon: MapPin, label: 'Cities Covered', value: '10+' },
  { icon: Star, label: 'Average Rating', value: '4.8/5' }
];

export default function HomePage() {
  React.useEffect(() => { document.title = 'ZambiaHomes | Find Properties in Zambia'; }, []);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Property in Zambia
            </h1>
            <p className="text-xl mb-8 text-green-100 max-w-3xl mx-auto">
              Discover houses, apartments, offices, and boarding houses across Zambia to rent or buy.
              Your dream property is just a click away.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter location (e.g., Lusaka, Ndola, Kitwe)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900">
                    <option value="">Property Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="office">Office</option>
                    <option value="boarding">Boarding House</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900">
                    <option value="">Price Range</option>
                    <option value="0-5000">ZMW 0 - 5,000</option>
                    <option value="5000-10000">ZMW 5,000 - 10,000</option>
                    <option value="10000-20000">ZMW 10,000 - 20,000</option>
                    <option value="20000+">ZMW 20,000+</option>
                  </select>
                </div>
                <Link
                  to="/properties"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Role</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose the path that fits you best.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/signup" className="block border rounded-lg p-6 hover:shadow-md transition">
              <div className="text-lg font-semibold text-gray-900 mb-2">Landlord/Agent</div>
              <p className="text-gray-600 text-sm">List properties, manage clients, track inquiries.</p>
            </Link>
            <Link to="/properties" className="block border rounded-lg p-6 hover:shadow-md transition">
              <div className="text-lg font-semibold text-gray-900 mb-2">Property</div>
              <p className="text-gray-600 text-sm">Search and find properties across Zambia.</p>
            </Link>
            <Link to="/admin" className="block border rounded-lg p-6 hover:shadow-md transition">
              <div className="text-lg font-semibold text-gray-900 mb-2">Admin</div>
              <p className="text-gray-600 text-sm">Monitor platform, approvals, subscriptions.</p>
            </Link>
            <Link to="/signup" className="block border rounded-lg p-6 hover:shadow-md transition">
              <div className="text-lg font-semibold text-gray-900 mb-2">Agencies</div>
              <p className="text-gray-600 text-sm">Manage teams, premium analytics and tools.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover handpicked properties that offer the best value and quality in prime locations across Zambia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/properties"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ZambiaHomes?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Based in Chilenje South, Lusaka, we provide a comprehensive platform that makes finding and managing properties simple and efficient across Zambia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Interactive Maps
              </h3>
              <p className="text-gray-600">
                Explore properties with our integrated Google Maps feature. See exact locations, nearby amenities, and neighborhood details.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Verified Properties
              </h3>
              <p className="text-gray-600">
                All properties are verified by our team. We ensure accurate information, legitimate listings, and quality standards.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Multi-User Platform
              </h3>
              <p className="text-gray-600">
                Dedicated dashboards for property seekers, agents, landlords, and administrators with role-specific features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscriptions & Pricing</h2>
            <p className="text-gray-600">Simple pricing in ZMW. Choose daily, weekly, or monthly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="text-xl font-semibold text-gray-900 mb-2">Landlord/Agents</div>
              <ul className="text-gray-700 space-y-2">
                <li className="flex justify-between"><span>Daily</span><span className="font-semibold">K10</span></li>
                <li className="flex justify-between"><span>Weekly</span><span className="font-semibold">K40</span></li>
                <li className="flex justify-between"><span>Monthly</span><span className="font-semibold">K120</span></li>
              </ul>
              <Link to="/subscription" className="mt-6 inline-block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                Subscribe
              </Link>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <div className="text-xl font-semibold text-gray-900 mb-2">Seekers</div>
              <ul className="text-gray-700 space-y-2">
                <li className="flex justify-between"><span>Daily</span><span className="font-semibold">K10</span></li>
                <li className="flex justify-between"><span>Weekly</span><span className="font-semibold">K30</span></li>
                <li className="flex justify-between"><span>Monthly</span><span className="font-semibold">K80</span></li>
              </ul>
              <Link to="/subscription" className="mt-6 inline-block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                Subscribe
              </Link>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <div className="text-xl font-semibold text-gray-900 mb-2">Agencies</div>
              <span className="inline-block text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 mb-3">Premium</span>
              <ul className="text-gray-700 space-y-2">
                <li className="flex justify-between"><span>Weekly</span><span className="font-semibold">K600</span></li>
                <li className="flex justify-between"><span>Monthly</span><span className="font-semibold">K1200</span></li>
              </ul>
              <Link to="/subscription" className="mt-6 inline-block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of satisfied users who found their perfect home through ZambiaHomes. Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/properties"
              className="border border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-md font-semibold transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
