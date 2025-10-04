import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Maximize2 } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface MapViewProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export default function MapView({ 
  properties, 
  center = { lat: -15.3875, lng: 28.3228 }, // Default to Lusaka
  zoom = 12,
  height = 'h-96'
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          setError('Map unavailable: missing Google Maps API key.');
          setIsLoading(false);
          return;
        }

        setOptions({
          apiKey: apiKey,
          version: 'weekly',
        });

        // Import required libraries
        await importLibrary('maps');
        await importLibrary('places');
        await importLibrary('geometry');
        
        const google = window.google;
        
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        setMap(mapInstance);

        // Add markers for properties
        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();

        properties.forEach((property) => {
          if (property.coordinates.lat && property.coordinates.lng) {
            const marker = new google.maps.Marker({
              position: { lat: property.coordinates.lat, lng: property.coordinates.lng },
              map: mapInstance,
              title: property.title,
              icon: {
                url: getMarkerIcon(property.type),
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 40)
              }
            });

            // Add click listener to marker
            marker.addListener('click', () => {
              setSelectedProperty(property);
              infoWindow.setContent(`
                <div class="p-3 max-w-xs">
                  <h3 class="font-semibold text-gray-900 mb-1">${property.title}</h3>
                  <p class="text-sm text-gray-600 mb-2">${property.location}</p>
                  <p class="text-green-600 font-medium">ZMW ${property.price.toLocaleString()}/month</p>
                  <button 
                    onclick="window.open('/property/${property.id}', '_blank')"
                    class="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    View Details
                  </button>
                </div>
              `);
              infoWindow.open(mapInstance, marker);
            });

            bounds.extend(marker.getPosition()!);
          }
        });

        // Fit map to show all markers
        if (properties.length > 1) {
          mapInstance.fitBounds(bounds);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initMap();
  }, [properties, center, zoom]);

  const getMarkerIcon = (type: string) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (type) {
      case 'house': return `${baseUrl}blue-dot.png`;
      case 'apartment': return `${baseUrl}green-dot.png`;
      case 'office': return `${baseUrl}purple-dot.png`;
      case 'boarding': return `${baseUrl}orange-dot.png`;
      default: return `${baseUrl}red-dot.png`;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <div className={`${height} bg-gray-100 flex items-center justify-center relative rounded-lg`}>
        <div className="text-center">
          <MapPin className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Map Unavailable
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Showing {properties.length} properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : height} relative rounded-lg overflow-hidden`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={toggleFullscreen}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Maximize2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Property Count */}
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-900">
            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Property Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Houses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Apartments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Offices</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Boarding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleFullscreen} />
      )}
    </>
  );
}
