import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface UserLocation {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  avatar?: string;
  bio?: string;
  memberSince: string;
}

const PopupCard: React.FC<{ user: UserLocation }> = ({ user }) => (
  <div className="p-3 min-w-[200px] bg-white dark:bg-gray-800">
    <div className="flex items-center mb-2">
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
        <span className="text-white font-bold text-lg">{user.firstName[0]}{user.lastName[0]}</span>
      </div>
      <div>
        <h3 className="m-0 font-bold text-gray-900 dark:text-gray-100">{user.fullName}</h3>
        <p className="m-0 text-sm text-gray-600 dark:text-gray-300">
          {user.location.city}{user.location.country ? `, ${user.location.country}` : ''}
        </p>
      </div>
    </div>
    {user.bio && (
      <p className="my-2 text-sm text-gray-700 dark:text-gray-200">{user.bio}</p>
    )}
    <p className="mt-1 mb-0 text-xs text-gray-500 dark:text-gray-400">
      Member since {new Date(user.memberSince).toLocaleDateString()}
    </p>
  </div>
);

const Map: React.FC = () => {
  // Added Leaflet styles directly to the component, since we are only using leaflet inside this file
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .dark .map-tiles {
        filter: brightness(1) invert(1) contrast(1) hue-rotate(180deg) saturate(0.3);
      }

      .dark .leaflet-container {
        background: #1f2937 !important;
      }

      .dark .leaflet-control-zoom,
      .dark .leaflet-control-attribution {
        filter: invert(1) hue-rotate(180deg);
      }

      .dark .leaflet-control-attribution {
        background: rgba(0, 0, 0, 0.8) !important;
      }

      .leaflet-popup-content-wrapper {
        background-color: #ffffff;
      }

      .dark .leaflet-popup-content-wrapper {
        background-color: #1f2937;
      }

      .leaflet-popup-tip {
        background-color: #ffffff;
      }

      .dark .leaflet-popup-tip {
        background-color: #1f2937;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('=== FETCHING USERS ===');
      try {
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        const response = await fetch('http://localhost:5000/api/profile/map-users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API Response Status:', response.status);
        const data = await response.json();
        console.log('API Response Data:', data);

        if (data.success && data.data && data.data.users) {
          console.log('SUCCESS: Using real users from API:', data.data.users.length);
          console.log('First user sample:', data.data.users[0]);
          setUsers(data.data.users);
        } else {
          console.log('API FAILED: Using fallback demo users');
          throw new Error('API response invalid');
        }
      } catch (err) {
        console.error('ERROR fetching users:', err);
        console.log('FALLBACK: Creating demo users...');
        // For demo, create some fake users if API fails
        const demoUsers = [
          {
            _id: '1',
            firstName: 'Demo',
            lastName: 'User',
            fullName: 'Demo User',
            location: { latitude: 47.3769, longitude: 8.5417, city: 'Zurich', country: 'Switzerland' },
            bio: 'Demo user from Zurich',
            memberSince: '2024-01-01'
          },
          {
            _id: '2', 
            firstName: 'Test',
            lastName: 'Person',
            fullName: 'Test Person',
            location: { latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK' },
            bio: 'Test user from London',
            memberSince: '2024-01-01'
          }
        ];
        console.log('FALLBACK: Demo users created:', demoUsers.length);
        setUsers(demoUsers);
      } finally {
        console.log('=== FETCH COMPLETE ===');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Initialize map
  useEffect(() => {
    console.log('=== MAP INITIALIZATION EFFECT ===');
    console.log('mapRef.current:', mapRef.current);
    console.log('mapInstanceRef.current:', mapInstanceRef.current);
    console.log('loading state:', loading);
    console.log('mapReady state:', mapReady);
    
    if (loading) {
      console.log('SKIP: Still loading users...');
      return;
    }
    
    if (!mapRef.current) {
      console.log('WAITING: No mapRef.current yet...');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('SKIP: Map already exists');
      return;
    }

    console.log('STARTING: Map creation process...');
    console.log('DOM element dimensions:', {
      width: mapRef.current.offsetWidth,
      height: mapRef.current.offsetHeight,
      display: window.getComputedStyle(mapRef.current).display,
      visibility: window.getComputedStyle(mapRef.current).visibility
    });

    // Add a small delay to ensure DOM is fully ready
    const timeout = setTimeout(() => {
      try {
        console.log('TIMEOUT FIRED: Creating map instance...');
        console.log('mapRef.current at timeout:', mapRef.current);
        
        if (!mapRef.current) {
          console.error('FATAL: mapRef.current is null at timeout!');
          return;
        }
        
        console.log('CREATING MAP: Starting L.map() call...');
        
        const map = L.map(mapRef.current!, {
            zoomControl: true,
            attributionControl: true,
            minZoom: 3,
            maxZoom: 18,
            worldCopyJump: true,
            maxBounds: L.latLngBounds([[-85, -170], [85, 170]]),
            maxBoundsViscosity: 1
          });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            keepBuffer: 50,
            bounds: L.latLngBounds([[-85, -170], [85, 170]]),
        }).addTo(map);
        
        console.log('MAP OBJECT CREATED:', map);
        console.log('Map container HTML:', map.getContainer());
        console.log('Map size before setView:', map.getSize());
        
        // Set view to center of world with safer coordinates
        console.log('SETTING VIEW: [30, 0] zoom 2...');
        map.setView([30, 0], 2);
        console.log('VIEW SET SUCCESS');
        console.log('Map size after setView:', map.getSize());
        console.log('Map center:', map.getCenter());
        console.log('Map zoom:', map.getZoom());
        console.log('Map bounds:', map.getBounds());

        console.log('ADDING: Tile layer...');
      
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        className: 'map-tiles',
        maxZoom: 18,
        keepBuffer: 20,          // Increased from default (5)
        updateWhenIdle: false,   // Load tiles immediately
        updateInterval: 50,      // Faster loading
        bounds: L.latLngBounds([[-90, -180], [90, 180]]) // Full world bounds
      }).addTo(map);
        
        console.log('TILE LAYER CREATED:', tileLayer);
        
        // Add tile layer event listeners with more detail
        tileLayer.on('loading', () => {
          console.log('TILES: Loading started...');
        });
        
        tileLayer.on('load', () => {
          console.log('TILES: Loading completed ✓');
        });
        
        tileLayer.on('tileerror', (e: any) => {
          console.error('TILES ERROR DETAILED:', {
            error: e.error,
            tile: e.tile,
            coords: e.coords,
            url: e.tile?.src,
            message: e.error?.message
          });
        });
        
        tileLayer.on('tileload', (e: any) => {
          console.log('TILE LOADED:', {
            coords: e.coords,
            url: e.tile?.src
          });
        });
        
        console.log('ADDING TILE LAYER TO MAP...');
        tileLayer.addTo(map);
        console.log('SUCCESS: Tile layer added ✓');

        // Store map instance
        mapInstanceRef.current = map;
        console.log('SUCCESS: Map instance stored in ref ✓');
        
        // Force map to resize and mark as ready
        setTimeout(() => {
          console.log('FINAL SETUP: Invalidating map size...');
          try {
            map.invalidateSize();
            console.log('RESIZE: Map size invalidated ✓');
            console.log('RESIZE: New map size:', map.getSize());
            console.log('RESIZE: Final map center:', map.getCenter());
            console.log('RESIZE: Final map zoom:', map.getZoom());
            
            // Mark map as ready for markers
            console.log('MAP READY: Setting mapReady to true...');
            setMapReady(true);
            console.log('MAP READY: State updated ✓');
            
          } catch (resizeError) {
            console.error('RESIZE ERROR:', resizeError);
          }
        }, 0);
        
        console.log('=== MAP INIT COMPLETE ===');

      } catch (error) {
        console.error('FATAL ERROR creating map:', error);
        console.error('Error stack:', (error as Error).stack);
        console.error('Error name:', (error as Error).name);
        console.error('Error message:', (error as Error).message);
      }
    }, 0);

    return () => {
      console.log('CLEANUP: Map initialization effect cleanup...');
      clearTimeout(timeout);
      if (mapInstanceRef.current) {
        try {
          console.log('CLEANUP: Removing map instance...');
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          setMapReady(false);
          console.log('CLEANUP: Map removed ✓');
        } catch (cleanupError) {
          console.error('CLEANUP ERROR:', cleanupError);
        }
      }
    };
  }, [loading]); // Only depend on loading

  // Add markers - FIXED: Now depends on both users AND mapReady
  useEffect(() => {
    console.log('=== ADD MARKERS EFFECT ===');
    console.log('mapReady:', mapReady);
    console.log('Map instance exists:', !!mapInstanceRef.current);
    console.log('Users array length:', users.length);
    console.log('Users array:', users);
    
    if (!mapReady) {
      console.log('SKIP: Map not ready yet');
      return;
    }
    
    if (!mapInstanceRef.current) {
      console.log('ERROR: mapReady=true but no map instance!');
      return;
    }
    
    if (users.length === 0) {
      console.log('SKIP: No users to display');
      return;
    }

    const map = mapInstanceRef.current;
    console.log('MAP READY FOR MARKERS - Starting marker creation...');
    console.log('Map state:', {
      center: map.getCenter(),
      zoom: map.getZoom(),
      size: map.getSize(),
      bounds: map.getBounds()
    });

    // Clear existing markers first
    console.log('CLEARING existing markers...');
    let clearedCount = 0;
    try {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          console.log('Removing existing marker at:', layer.getLatLng());
          map.removeLayer(layer);
          clearedCount++;
        }
      });
      console.log(`CLEARED ${clearedCount} existing markers`);
    } catch (error) {
      console.error('ERROR clearing markers:', error);
    }

    // Create red marker icon with enhanced logging
    console.log('CREATING marker icon...');
    let redIcon;
    try {
      redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      console.log('SUCCESS: Red icon created:', redIcon);
    } catch (error) {
      console.error('ERROR creating red icon:', error);
      return;
    }

    // Add markers for each user with enhanced validation
    console.log(`ADDING markers for ${users.length} users...`);
    let successCount = 0;
    let errorCount = 0;
    const validUsers: UserLocation[] = [];
    
    // Pre-validate all users first
    console.log('=== PRE-VALIDATION PHASE ===');
    users.forEach((user, index) => {
      console.log(`Validating user ${index + 1}: ${user.fullName}`);
      
      if (!user.location) {
        console.error(`❌ User ${user.fullName} has no location object`);
        return;
      }
      
      const { latitude, longitude, city, country } = user.location;
      console.log(`Coordinates: lat=${latitude}, lng=${longitude}, type=${typeof latitude}/${typeof longitude}`);
      
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.error(`❌ Invalid coordinate types for ${user.fullName}`);
        return;
      }
      
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(`❌ NaN coordinates for ${user.fullName}`);
        return;
      }
      
      if (latitude < -90 || latitude > 90) {
        console.error(`❌ Latitude out of range for ${user.fullName}: ${latitude}`);
        return;
      }
      
      if (longitude < -180 || longitude > 180) {
        console.error(`❌ Longitude out of range for ${user.fullName}: ${longitude}`);
        return;
      }
      
      console.log(`✅ User ${user.fullName} coordinates valid`);
      validUsers.push(user);
    });
    
    console.log(`PRE-VALIDATION COMPLETE: ${validUsers.length}/${users.length} users valid`);
    
    // Create markers for valid users
    console.log('=== MARKER CREATION PHASE ===');
    validUsers.forEach((user, index) => {
      console.log(`\n--- CREATING MARKER ${index + 1}/${validUsers.length} ---`);
      console.log(`User: ${user.fullName}`);
      
      try {
        const { latitude, longitude, city, country } = user.location;
        console.log(`Creating marker at [${latitude}, ${longitude}]`);
        
        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[200px] bg-white dark:bg-gray-800">
            <div class="flex items-center mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold text-lg">${user.firstName[0]}${user.lastName[0]}</span>
              </div>
              <div>
                <h3 class="m-0 font-bold text-gray-900 dark:text-gray-100">${user.fullName}</h3>
                <p class="m-0 text-sm text-gray-600 dark:text-gray-300">${city}${country ? `, ${country}` : ''}</p>
              </div>
            </div>
            ${user.bio ? `<p class="my-2 text-sm text-gray-700 dark:text-gray-200">${user.bio}</p>` : ''}
            <p class="mt-1 mb-0 text-xs text-gray-500 dark:text-gray-400">Member since ${new Date(user.memberSince).toLocaleDateString()}</p>
          </div>
        `;
        
        // Create marker
        console.log('Creating L.marker instance...');
        const marker = L.marker([latitude, longitude], { icon: redIcon });
        console.log('Marker instance created:', marker);
        
        console.log('Adding marker to map...');
        marker.addTo(map);
        console.log('Marker added to map ✅');
        
        console.log('Binding popup...');
        marker.bindPopup(popupContent);
        console.log('Popup bound ✅');
        
        console.log(`✅ SUCCESS: Marker ${index + 1} completed for ${user.fullName}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ ERROR adding marker for ${user.fullName}:`, error);
        console.error('Error details:', (error as Error).stack);
        errorCount++;
      }
    });
    
    console.log(`\n=== FINAL MARKER SUMMARY ===`);
    console.log(`✅ SUCCESS: ${successCount} markers added`);
    console.log(`❌ ERRORS: ${errorCount} failed`);
    console.log(`📊 VALID: ${validUsers.length}/${users.length} users had valid coordinates`);
    console.log('=== MARKERS COMPLETE ===\n');
    
    // Final map state check
    console.log('=== FINAL MAP STATE ===');
    try {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          console.log('Final marker found at:', layer.getLatLng());
        }
      });
    } catch (error) {
      console.error('Error checking final map state:', error);
    }
    
  }, [users, mapReady]); // FIXED: Depend on both users AND mapReady

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading map and users...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Fictional Data:</strong> All user locations and data depicted on this map are entirely fictional and created for demonstration purposes only.
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Status overlays */}
        <div className="absolute top-4 right-4 space-y-2 z-[1000]">
          {/* User count */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {users.length} Users Worldwide
              </span>
            </div>
          </div>
          
          {/* Map status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${mapReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Map {mapReady ? 'Ready' : 'Loading'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;