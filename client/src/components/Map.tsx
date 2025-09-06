import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExclamationTriangleIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../contexts/DarkModeContext';
import UserAvatar from './UserAvatar';
import { createRoot, type Root } from 'react-dom/client';

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

interface PopupCardProps {
  user: UserLocation;
  onViewProfile: () => void;
}

// User profile card displayed in map popup when clicking on user markers
const PopupCard: React.FC<PopupCardProps> = ({ user, onViewProfile }) => (
  <div className="p-3 w-[280px] lightmode dark:darkmode text-primary">
    <div className="flex items-center mb-2">
      <div className="w-12 h-12 mr-3">
        <UserAvatar user={user} size="lg" />
      </div>
      <div>
        <h3 className="m-0 ">{user.fullName}</h3>
        <p className="m-0 text-sm lightmode-text-secondary dark:darkmode-text-secondary">
          {user.location?.city ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}` : 'Location not set'}
        </p>
      </div>
    </div>
    {user.bio && (
      <p className="my-2 text-sm lightmode-text-secondary dark:darkmode-text-secondary">{user.bio}</p>
    )}
    <p className="mt-1 mb-0 text-xs lightmode-text-secondary dark:darkmode-text-secondary">
      Member since {new Date(user.memberSince).toLocaleDateString()}
    </p>
    {user.username && (
      <div className="mt-2 text-right">
        <button
          onClick={onViewProfile}
          className="inline-block px-3 py-1 !text-primary hover:!text-white btn-primary"
        >
          View Profile
        </button>
      </div>
    )}
  </div>
);

// User list item component with hover and click interactions for map sidebar
const UserCard: React.FC<{ 
  user: UserLocation; 
  onHover: (user: UserLocation) => void;
  onLeave: () => void;
  onClick: (user: UserLocation) => void;
}> = ({ user, onHover, onLeave, onClick }) => (
  <div 
    className="p-3 border-b lightmode dark:darkmode hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary cursor-pointer transition-colors duration-200"
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
          <h3 className="font-semibold truncate text-primary hover:text-primary-highlight">{user.fullName}</h3>
          {user.username && (
            <span className="text-xs text-blue-500">@{user.username}</span>
          )}
        </div>
        <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary truncate">
          {user.location?.city ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}` : 'Location not set'}
        </p>
        {user.bio && (
          <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </div>
  </div>
);

// Interactive map component displaying user locations with sidebar list and search functionality
const Map: React.FC = () => {
  const navigate = useNavigate();
  
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
      const response = await fetch('http://localhost:5001/api/dashboard/all-users', {
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
        const response = await fetch('http://localhost:5001/api/dashboard/all-users', {
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
      mapInstanceRef.current.panTo([user.location.latitude, user.location.longitude], {
        duration: 1.0 // Half the default pan speed (default is 0.5, so 1.0 is slower)
      });
    }
  }, []);

  const handleUserLeave = useCallback(() => {
    // Optional: Reset view or do nothing
  }, []);

  const handleUserClick = useCallback((user: UserLocation) => {
    // On mobile (when map is hidden), navigate directly to profile
    if (window.innerWidth < 640) {
      navigate(`/userspace/${user.username}/profile`);
      return;
    }

    // On desktop, interact with map as usual
    if (mapInstanceRef.current && user.location?.latitude && user.location?.longitude) {
      const marker = markersRef.current[user._id];
      if (marker) {
        mapInstanceRef.current.setView([user.location.latitude, user.location.longitude], 8);
        marker.openPopup();
      }
    }
  }, [navigate]);

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

  // Clear old markers
  Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
  markersRef.current = {};

  // Red marker icon
  const redIcon = L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  users.forEach((user) => {
    if (
      !user.location ||
      typeof user.location.latitude !== 'number' ||
      typeof user.location.longitude !== 'number'
    )
      return;

    const { latitude, longitude } = user.location;
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    )
      return;

    const marker = L.marker([latitude, longitude], { icon: redIcon });

    // Empty container that Leaflet will insert into the DOM
    const popupContainer = document.createElement('div');
    marker.bindPopup(popupContainer, { maxWidth: 320, minWidth: 280, className: 'custom-popup' });

    // React portal: mount PopupCard into the container
    let root: Root | null = null;
    marker.on('popupopen', () => {
      if (!root) root = createRoot(popupContainer);
      root.render(
        <PopupCard 
          user={user} 
          onViewProfile={() => navigate(`/userspace/${user.username}/profile`)} 
        />
      );
    });

    marker.addTo(map);
    markersRef.current[user._id] = marker;
  });
}, [users, mapReady, navigate]); // <- navigate is now a dependency


  return (
      <div className="h-screen flex flex-col">
      {/* Disclaimer */}
      <div className="lightmode dark:darkmode border-b px-4 py-3">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto">
          <ExclamationTriangleIcon className="w-5 h-5 lightmode-text-secondary dark:darkmode-text-secondary flex-shrink-0" />
          <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
            <strong>Fictional Data:</strong> All user locations and data depicted on this map are entirely fictional and created for demonstration purposes only.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative min-h-0">
        {/* Sidebar */}
        <div className="w-full sm:w-96 lightmode dark:darkmode sm:border-r shadow-lg z-[1000] h-full">
          <div className="h-full flex flex-col">
            {/* Search Header */}
            <div className="flex-shrink-0 p-4 border-b lightmode dark:darkmode">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 lightmode-text-secondary dark:darkmode-text-secondary" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, username, or location..."
                  className="text-sm block w-full pl-10 pr-3 py-2 border rounded-md leading-5 lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary placeholder:lightmode-text-secondary dark:placeholder:darkmode-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {searchLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto min-h-0 lightmode dark:darkmode">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center lightmode-text-secondary dark:darkmode-text-secondary">
                  {searchQuery ? 'No users found matching your search.' : 'No users to display.'}
                </div>
              ) : (
                <div className="lightmode dark:darkmode">
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
            <div className="flex-shrink-0 p-3 border-t lightmode dark:darkmode">
              <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary text-center">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          </div>
        </div>


        {/* Map Container - Hidden on mobile */}
        <div className="flex-1 hidden sm:block">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Status overlays */}
          <div className="absolute top-4 right-4 space-y-2 z-[1000]">
            {/* User count */}
            <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-3">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-danger" />
                <span className="text-sm font-medium">
                  {users.filter(u => u.location?.latitude && u.location?.longitude).length} Users on Map
                </span>
              </div>
            </div>
            
            {/* Map status */}
            <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-3">
              <div className="ml-1 flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${mapReady ? 'bg-success' : 'bg-danger'}`} />
                <span className="text-sm font-medium">
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