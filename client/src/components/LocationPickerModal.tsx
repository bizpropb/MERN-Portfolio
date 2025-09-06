import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDarkMode } from '../contexts/DarkModeContext';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Interactive map modal for selecting geographical location with reverse geocoding
const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  const { isDark } = useDarkMode();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng | null>(null);
  const [locationInfo, setLocationInfo] = useState({
    city: '',
    country: ''
  });
  const [isLoading, setIsLoading] = useState(false);


  // Set initial position if provided
  useEffect(() => {
    if (initialLocation) {
      setSelectedPosition(new L.LatLng(initialLocation.latitude, initialLocation.longitude));
    }
  }, [initialLocation]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return;

    const timeout = setTimeout(() => {
      try {
        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
          minZoom: 3,
          maxZoom: 18,
        });

        // Remove Leaflet attribution prefix, keep only OpenStreetMap
        map.attributionControl.setPrefix('');

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          maxZoom: 18,
        });

        tileLayer.addTo(map);

        const defaultCenter: [number, number] = initialLocation 
          ? [initialLocation.latitude, initialLocation.longitude]
          : [47.3769, 8.5417]; // Default to Zurich

        map.setView(defaultCenter, 10);

        // Add click handler
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          setSelectedPosition(e.latlng);
          setIsLoading(true);

          // Clear existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // Add new marker
          const marker = L.marker([lat, lng]);
          marker.addTo(map);
          markerRef.current = marker;

          // Pan and zoom to the new location
          map.setView([lat, lng], 14);

          try {
            // Use reverse geocoding to get location info
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              setLocationInfo({
                city: data.address.city || data.address.town || data.address.village || '',
                country: data.address.country || ''
              });
            }
          } catch (error) {
            console.error('Error fetching location info:', error);
            setLocationInfo({ city: '', country: '' });
          } finally {
            setIsLoading(false);
          }
        });

        // Add initial marker if position exists
        if (selectedPosition) {
          const marker = L.marker([selectedPosition.lat, selectedPosition.lng]);
          marker.addTo(map);
          markerRef.current = marker;
        }

        mapInstanceRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
        }, 100);

      } catch (error) {
        console.error('Error creating map:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerRef.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [isOpen, initialLocation]);

  // Confirms the selected location and passes it to parent component
  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect({
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        city: locationInfo.city,
        country: locationInfo.country
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-xl max-w-2xl w-full min-w-0 mx-2 sm:mx-0 max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg  mb-4">
            Select Your Location
          </h3>
          
          <div className="mb-4">
            <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
              Click on the map to select your location
            </p>
          </div>

          {/* Map Container */}
          <div className="h-96 mb-4 rounded-lg overflow-hidden border">
            <div 
              ref={mapRef} 
              className="location-picker-map w-full h-full"
            />
          </div>

          {/* Location Info */}
          {selectedPosition && (
            <div className="lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Selected Location:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary">Latitude:</span>
                  <span className="ml-2">
                    {selectedPosition.lat.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary">Longitude:</span>
                  <span className="ml-2">
                    {selectedPosition.lng.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary">City:</span>
                  <span className="ml-2">
                    {isLoading ? 'Loading...' : locationInfo.city || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary">Country:</span>
                  <span className="ml-2">
                    {isLoading ? 'Loading...' : locationInfo.country || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleConfirm}
              disabled={!selectedPosition || isLoading}
              className="btn-primary-filled flex-1 px-4 py-2 rounded-md disabled:opacity-50"
            >
              Confirm Location
            </button>
            <button
              onClick={onClose}
              className="btn-muted-filled px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;