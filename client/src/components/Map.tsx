import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExclamationTriangleIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../contexts/DarkModeContext';
import UserAvatar from './UserAvatar';

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
  username?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  } | null;
  avatar?: string;
  bio?: string;
  memberSince: string;
  lastLogin?: string;
}

const PopupCard: React.FC<{ user: UserLocation }> = ({ user }) => (
  <div className="p-3 min-w-[200px] bg-white dark:bg-gray-800">
    <div className="flex items-center mb-2">
      <div className="w-12 h-12 mr-3">
        <UserAvatar user={user} size="lg" />
      </div>
      <div>
        <h3 className="m-0 font-bold text-gray-900 dark:text-gray-100">{user.fullName}</h3>
        <p className="m-0 text-sm text-gray-600 dark:text-gray-300">
          {user.location?.city ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}` : 'Location not set'}
        </p>
      </div>
    </div>
    {user.bio && (
      <p className="my-2 text-sm text-gray-700 dark:text-gray-200">{user.bio}</p>
    )}
    <p className="mt-1 mb-0 text-xs text-gray-500 dark:text-gray-400">
      Member since {new Date(user.memberSince).toLocaleDateString()}
    </p>
    {user.username && (
      <div className="mt-2">
        <a 
          href={`/userspace/${user.username}/profile`}
          className="inline-block px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors duration-200"
        >
          View Profile
        </a>
      </div>
    )}
  </div>
);

const UserCard: React.FC<{ 
  user: UserLocation; 
  onHover: (user: UserLocation) => void;
  onLeave: () => void;
  onClick: (user: UserLocation) => void;
}> = ({ user, onHover, onLeave, onClick }) => (
  <div 
    className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
    onMouseEnter={() => onHover(user)}
    onMouseLeave={onLeave}
    onClick={() => onClick(user)}
  >
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 flex-shrink-0">
        <UserAvatar user={user} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{user.fullName}</h3>
          {user.username && (
            <span className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {user.location?.city ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}` : 'Location not set'}
        </p>
        {user.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </div>
  </div>
);

const Map: React.FC = () => {
  const { isDark } = useDarkMode();
  
  // Manage page scrolling behavior for full-height map
  useEffect(() => {
    // Disable Y-axis scrolling on the page when map is loaded
    document.body.style.overflowY = 'hidden';
    
    return () => {
      // Re-enable Y-axis scrolling when leaving the map page
      document.body.style.overflowY = 'auto';
    };
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Always search ALL users (including those without locations)
      const response = await fetch('http://localhost:5000/api/dashboard/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success && data.data && data.data.users) {
        let allUsers = data.data.users;
        
        // Client-side filtering if there's a search query
        if (query.trim()) {
          const searchTerm = query.trim().toLowerCase();
          allUsers = allUsers.filter((user: any) => 
            user.username?.toLowerCase().includes(searchTerm) ||
            user.firstName?.toLowerCase().includes(searchTerm) ||
            user.lastName?.toLowerCase().includes(searchTerm) ||
            user.fullName?.toLowerCase().includes(searchTerm) ||
            user.location?.city?.toLowerCase().includes(searchTerm) ||
            user.location?.country?.toLowerCase().includes(searchTerm)
          );
        }
        
        setFilteredUsers(allUsers);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search input with 300ms debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  // Fetch initial users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/all-users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success && data.data && data.data.users) {
          setUsers(data.data.users);
          setFilteredUsers(data.data.users);
        } else {
          throw new Error('API response invalid');
        }
      } catch (err) {
        console.error('ERROR fetching users:', err);
        // Don't show fallback demo users - just show empty map
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Map interaction handlers
  const handleUserHover = useCallback((user: UserLocation) => {
    if (mapInstanceRef.current && user.location?.latitude && user.location?.longitude) {
      mapInstanceRef.current.panTo([user.location.latitude, user.location.longitude]);
    }
  }, []);

  const handleUserLeave = useCallback(() => {
    // Optional: Reset view or do nothing
  }, []);

  const handleUserClick = useCallback((user: UserLocation) => {
    if (mapInstanceRef.current && user.location?.latitude && user.location?.longitude) {
      const marker = markersRef.current[user._id];
      if (marker) {
        mapInstanceRef.current.setView([user.location.latitude, user.location.longitude], 8);
        marker.openPopup();
      }
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) return;

    const timeout = setTimeout(() => {
      try {
        if (!mapRef.current) return;
        
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
          minZoom: 3,
          maxZoom: 18,
          worldCopyJump: true,
          maxBounds: L.latLngBounds([[-85, -Infinity], [85, Infinity]]),
          maxBoundsViscosity: 1
        });

        // Remove default attribution and add our own without flags
        map.attributionControl.setPrefix('');
        
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          className: 'map-tiles',
          maxZoom: 18,
          keepBuffer: 20,
          updateWhenIdle: false,
          updateInterval: 50,
          bounds: L.latLngBounds([[-90, -180], [90, 180]])
        });
        
        tileLayer.addTo(map);
        map.setView([30, 0], 2);
        mapInstanceRef.current = map;
        
        setTimeout(() => {
          map.invalidateSize();
          setMapReady(true);
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
          setMapReady(false);
          markersRef.current = {};
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [loading]);

  // Add markers for users
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || users.length === 0) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Create red marker icon
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add markers for valid users
    users.forEach((user) => {
      if (!user.location || typeof user.location.latitude !== 'number' || typeof user.location.longitude !== 'number') {
        return;
      }

      const { latitude, longitude } = user.location;
      if (isNaN(latitude) || isNaN(longitude) || 
          latitude < -90 || latitude > 90 || 
          longitude < -180 || longitude > 180) {
        return;
      }

      try {
        const marker = L.marker([latitude, longitude], { icon: redIcon });
        
        // Create React-rendered popup content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <div class="p-3 min-w-[200px] bg-white dark:bg-gray-800">
            <div class="flex items-center mb-2">
              <div class="w-12 h-12 mr-3 flex-shrink-0 rounded-full overflow-hidden">
                ${user.avatar ? `
                  <img 
                    src="${user.avatar}" 
                    alt="${user.fullName}"
                    class="w-full h-full object-cover"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                  />
                  <div class="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center" style="display: none;">
                    <span class="text-white font-bold text-lg">${user.firstName[0]}${user.lastName[0]}</span>
                  </div>
                ` : `
                  <div class="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-lg">${user.firstName[0]}${user.lastName[0]}</span>
                  </div>
                `}
              </div>
              <div class="flex flex-col justify-center">
                <h3 class="font-bold text-gray-900 dark:text-gray-100">${user.fullName}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  ${user.location?.city ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}` : 'Location not set'}
                </p>
              </div>
            </div>
            ${user.bio ? `<p class="my-2 text-sm text-gray-700 dark:text-gray-200">${user.bio}</p>` : ''}
            <p class="mt-1 mb-0 text-xs text-gray-500 dark:text-gray-400 text-right">
              Member since ${new Date(user.memberSince).toLocaleDateString()}
            </p>
            ${user.username ? `
              <div class="mt-2 text-right">
                <a 
                  href="/userspace/${user.username}/profile"
                  class="profile-link inline-block px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors duration-200"
                >
                  View Profile
                </a>
              </div>
            ` : ''}
          </div>
        `;
        
        marker.bindPopup(tempDiv.innerHTML, { 
          maxWidth: 300,
          className: 'custom-popup'
        });
        
        marker.addTo(map);
        markersRef.current[user._id] = marker;
        
      } catch (error) {
        console.error(`Error adding marker for ${user.fullName}:`, error);
      }
    });
    
  }, [users, mapReady]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading map and users...</span>
      </div>
    );
  }

  return (
    <div className="h-[93vh] flex flex-col">
      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Fictional Data:</strong> All user locations and data depicted on this map are entirely fictional and created for demonstration purposes only.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative min-h-0">
        {/* Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-[1000] h-full">
          <div className="h-full flex flex-col">
            {/* Search Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, username, or location..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {searchLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No users found matching your search.' : 'No users to display.'}
                </div>
              ) : (
                <div>
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
                      onHover={handleUserHover}
                      onLeave={handleUserLeave}
                      onClick={handleUserClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
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
                  {users.filter(u => u.location?.latitude && u.location?.longitude).length} Users on Map
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
    </div>
  );
};

export default Map;