import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  listing_type?: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  features: string[];
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isSale = property.listing_type === 'sale';
  const featureList = Array.isArray(property.features) ? property.features : [];

  const formatPrice = (price: number) => {
    return `ZMW ${price.toLocaleString()}`;
  };

  const priceLabel = isSale ? formatPrice(property.price) : `${formatPrice(property.price)}/month`;
  const priceBadgeClass = isSale ? 'bg-indigo-600' : 'bg-green-600';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'house': return 'bg-blue-100 text-blue-800';
      case 'apartment': return 'bg-green-100 text-green-800';
      case 'office': return 'bg-purple-100 text-purple-800';
      case 'boarding': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(property.type)}`}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isSale ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {isSale ? 'For Sale' : 'For Rent'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`${priceBadgeClass} text-white px-2 py-1 rounded text-sm font-semibold`}>
            {priceLabel}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area}m²</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {featureList.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
            {featureList.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{featureList.length - 3} more
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/property/${property.id}`}
          className="block w-full bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
