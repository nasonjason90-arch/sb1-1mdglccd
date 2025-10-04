import React, { useMemo, useState } from 'react';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Map, List } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import { Storage } from '../services/storage';

// Mock properties data
const mockProperties = [
  {
    id: '1',
    title: '3 Bedroom House in Kabulonga',
    location: 'Kabulonga, Lusaka',
    price: 12000,
    type: 'house',
    listing_type: 'rent',
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
    listing_type: 'rent',
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
    listing_type: 'rent',
    bedrooms: 0,
    bathrooms: 2,
    area: 200,
    images: ['https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Reception Area', 'Conference Room', 'Parking', 'AC'],
    coordinates: { lat: -15.4205, lng: 28.2837 }
  },
  {
    id: '4',
    title: 'Student Boarding House',
    location: 'Great East Road, Lusaka',
    price: 3500,
    type: 'boarding',
    listing_type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    area: 25,
    images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Shared Kitchen', 'Study Area', 'WiFi', 'Security'],
    coordinates: { lat: -15.3928, lng: 28.3848 }
  },
  {
    id: '5',
    title: '4 Bedroom Family House',
    location: 'Woodlands, Lusaka',
    price: 18000,
    type: 'house',
    listing_type: 'rent',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Swimming Pool', 'Garden', 'Double Garage', 'Solar'],
    coordinates: { lat: -15.3658, lng: 28.3037 }
  },
  {
    id: '6',
    title: 'Luxury Penthouse Apartment',
    location: 'Leopards Hill, Lusaka',
    price: 25000,
    type: 'apartment',
    listing_type: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: ['https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['City View', 'Balcony', 'Gym Access', 'Concierge'],
    coordinates: { lat: -15.3456, lng: 28.3967 }
  },
  {
    id: '7',
    title: 'Modern Townhouse - Mass Media',
    location: 'Mass Media, Lusaka',
    price: 1650000,
    type: 'house',
    listing_type: 'sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 210,
    images: ['https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Gated Community', 'Solar Backup', 'Smart Home'],
    coordinates: { lat: -15.3879, lng: 28.3505 }
  },
  {
    id: '8',
    title: 'Prime Commercial Plot',
    location: 'Makeni, Lusaka',
    price: 2400000,
    type: 'commercial',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 0,
    area: 1200,
    images: ['https://images.pexels.com/photos/210221/pexels-photo-210221.jpeg?auto=compress&cs=tinysrgb&w=800'],
    features: ['Main Road Access', 'Utilities Onsite', 'High Traffic'],
    coordinates: { lat: -15.4741, lng: 28.2851 }
  }
];

export default function PropertyListings() {
  const location = useLocation();
  const { user } = useAuth();
  React.useEffect(() => { document.title = 'Property Listings | ZambiaHomes'; }, []);
  const params = new URLSearchParams(location.search);
  const initialType = (params.get('type') || '').toLowerCase();

  const stored = useMemo(() => {
    try {
      return Storage.getProperties().map(p => ({
        id: p.id,
        title: p.title,
        location: p.location || p.address || 'Unknown location',
        price: p.price,
        type: p.type || 'house',
        listing_type: (p as any).listing_type || 'rent',
        bedrooms: p.bedrooms ?? 0,
        bathrooms: p.bathrooms ?? 1,
        area: p.area ?? 0,
        images: (p.images && p.images.length > 0) ? p.images : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'],
        features: p.features || [],
        coordinates: { lat: -15.3875, lng: 28.3228 },
      }));
    } catch {
      return [] as any[];
    }
  }, []);

  const [properties, setProperties] = useState<any[]>([...stored, ...mockProperties]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([...stored, ...mockProperties]);
  const [filters, setFilters] = useState({
    location: '',
    type: initialType,
    listingType: (params.get('listing') || '').toLowerCase(),
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });

  React.useEffect(() => {
    (async () => {
      try {
        const { apiGet } = await import('../services/api');
        const remote = await apiGet<any[]>('properties');
        const mapped = remote.map(r => ({
          id: r.id,
          title: r.title,
          location: r.location || r.address || 'Unknown location',
          price: Math.round(Number(r.price) || 0),
          type: r.type || 'house',
          listing_type: (r.listing_type || 'rent') as 'rent' | 'sale',
          bedrooms: r.bedrooms ?? 0,
          bathrooms: r.bathrooms ?? 1,
          area: r.area ?? 0,
          images: Array.isArray(r.images) ? r.images : [],
          features: Array.isArray(r.features) ? r.features : [],
          coordinates: { lat: -15.3875, lng: 28.3228 },
        }));
        const merged = [...mapped, ...stored, ...mockProperties];
        const filtered = filterPropertyList(merged, filters);
        setProperties(merged);
        setFilteredProperties(filtered);
      } catch {
        // stay with local
      }
    })();
  }, [stored]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const filterPropertyList = (dataset: any[], currentFilters: typeof filters) => {
    let filtered = dataset;

    if (currentFilters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }

    if (currentFilters.type) {
      filtered = filtered.filter(property => property.type === currentFilters.type);
    }

    if (currentFilters.listingType) {
      filtered = filtered.filter(property => (property.listing_type || 'rent') === currentFilters.listingType);
    }

    if (currentFilters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(currentFilters.minPrice));
    }

    if (currentFilters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(currentFilters.maxPrice));
    }

    if (currentFilters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(currentFilters.bedrooms));
    }

    if (currentFilters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= parseInt(currentFilters.bathrooms));
    }

    return filtered;
  };

  const applyFilters = (currentFilters: typeof filters, dataset?: any[]) => {
    const source = dataset ?? properties;
    const filtered = filterPropertyList(source, currentFilters);
    setFilteredProperties(filtered);
  };

  React.useEffect(() => {
    if (
      filters.listingType ||
      filters.type ||
      filters.location ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.bedrooms ||
      filters.bathrooms
    ) {
      applyFilters(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFilters = () => {
    const emptyFilters = {
      location: '',
      type: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: ''
    };
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Listings</h1>
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property name..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Save Search */}
            <button
              onClick={async () => {
                try {
                  if (!user) { alert('Please sign in to save searches.'); return; }
                  const name = window.prompt('Name this search (e.g., Lusaka 2BR under 10k)') || '';
                  if (!name) return;
                  const { apiPost } = await import('../services/api');
                  const payload = { user_id: user.id, name, filters } as any;
                  await apiPost('saved-searches', payload);
                  alert('Search saved. We will notify you when new matches appear.');
                } catch {}
              }}
              className="flex items-center space-x-2 bg-white border border-green-600 text-green-600 px-4 py-3 rounded-md hover:bg-green-50 transition-colors"
            >
              <span>Save Search</span>
            </button>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Map className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="office">Office</option>
                    <option value="boarding">Boarding House</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    value={filters.listingType}
                    onChange={(e) => handleFilterChange('listingType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Rent or Sale</option>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (ZMW)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (ZMW)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Bathrooms
                  </label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          /* Property Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          /* Map View */
          <MapView properties={filteredProperties} height="h-96" />
        )}

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing some filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
