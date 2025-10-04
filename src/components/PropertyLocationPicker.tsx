import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Search } from 'lucide-react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PropertyLocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates: Coordinates }) => void;
  initialLocation?: string;
  initialCoordinates?: Coordinates;
}

export default function PropertyLocationPicker({ 
  onLocationSelect, 
  initialLocation = '',
  initialCoordinates 
}: PropertyLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialLocation);

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

        await importLibrary('maps');
        await importLibrary('places');
        await importLibrary('geometry');

        const google = window.google;

        if (!mapRef.current) return;

        const defaultCenter = initialCoordinates || { lat: -15.3875, lng: 28.3228 };

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true,
        });

        setMap(mapInstance);

        const markerInstance = new google.maps.Marker({
          position: defaultCenter,
          map: mapInstance,
          draggable: true,
          title: 'Property Location'
        });

        setMarker(markerInstance);

        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const position = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };

            markerInstance.setPosition(position);
            reverseGeocode(position);
          }
        });

        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            const coords = {
              lat: position.lat(),
              lng: position.lng()
            };
            reverseGeocode(coords);
          }
        });

        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'zm' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const position = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };

              mapInstance.setCenter(position);
              markerInstance.setPosition(position);

              onLocationSelect({
                address: place.formatted_address || place.name || '',
                coordinates: position
              });
            }
          });
        }

        if (initialCoordinates) {
          reverseGeocode(initialCoordinates);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map.');
        setIsLoading(false);
      }
    };

    const reverseGeocode = (coordinates: Coordinates) => {
      if (!window.google) return;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: coordinates },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            setSearchValue(address);
            onLocationSelect({
              address,
              coordinates
            });
          }
        }
      );
    };

    initMap();
  }, [initialCoordinates, initialLocation, onLocationSelect]);

  const handleSearchSubmit = () => {
    if (!map || !searchValue.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: searchValue,
        componentRestrictions: { country: 'zm' }
      },
      (results, status) => {
        if (status === 'OK' && results && results[0] && results[0].geometry) {
          const location = results[0].geometry.location;
          const position = {
            lat: location.lat(),
            lng: location.lng()
          };

          map.setCenter(position);
          if (marker) {
            marker.setPosition(position);
          }

          onLocationSelect({
            address: results[0].formatted_address,
            coordinates: position
          });
        }
      }
    );
  };

  if (error) {
    return (
      <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchSubmit();
            }
          }}
          placeholder="Search for location in Zambia..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="h-64 relative rounded-lg overflow-hidden border border-gray-300">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" />
      </div>

      <p className="text-sm text-gray-600">
        Click on the map or drag the marker to set the exact property location
      </p>
    </div>
  );
}
