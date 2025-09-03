import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SunIcon, 
  MoonIcon, 
  HomeIcon,
  MapIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import UserAvatar from './UserAvatar';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  featured: boolean;
  likes: number;
  views: number;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Main navigation bar with user profile, theme toggle, and particle animation controls
const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  
  // PARTICLE ANIMATION TOGGLE STATE - STORED IN LOCALSTORAGE
  const [particlesEnabled, setParticlesEnabled] = useState(() => {
    const saved = localStorage.getItem('particlesEnabled');
    return saved !== null ? JSON.parse(saved) : true; // DEFAULT TO ENABLED
  });
  
  // Toggles particle animation effects and saves preference to localStorage
  const toggleParticles = () => {
    const newState = !particlesEnabled;
    setParticlesEnabled(newState);
    localStorage.setItem('particlesEnabled', JSON.stringify(newState));
    
    // ADD/REMOVE CSS CLASS TO DISABLE ONLY PARTICLE ANIMATIONS
    if (newState) {
      document.documentElement.classList.remove('particles-disabled');
    } else {
      document.documentElement.classList.add('particles-disabled');
    }
  };
  
  // SET INITIAL STATE ON MOUNT
  React.useEffect(() => {
    if (!particlesEnabled) {
      document.documentElement.classList.add('particles-disabled');
    }
  }, []);
  
  // Determines if the current route matches the given path for navigation highlighting
  const isActive = (path: string) => {
    if (path === '/news') {
      return location.pathname.startsWith('/news');
    }
    return location.pathname === path;
  };
  
  // Generates the profile URL path for the currently logged-in user
  const getMyProfilePath = () => {
    return user?.username ? `/myuserspace/${user.username}/profile` : '/profile';
  };


  return (
    <>
      <nav className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl  gradient-text font-bold">
                DevHub
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link
                  to="/"
                  className={`text-xs flex items-center space-x-2 px-3 py-2 rounded-md  ${
                    isActive('/')
                      ? 'lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary text-primary'
                      : 'hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary text-primary hover:text-primary-highlight'
                  }`}
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/news"
                  className={`text-xs flex items-center space-x-2 px-3 py-2 rounded-md  ${
                    isActive('/news')
                      ? 'lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary text-primary'
                      : 'hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary text-primary hover:text-primary-highlight'
                  }`}
                >
                  <NewspaperIcon className="w-4 h-4" />
                  <span>News</span>
                </Link>
                <Link
                  to="/browse"
                  className={`text-xs flex items-center space-x-2 px-3 py-2 rounded-md  ${
                    isActive('/browse')
                      ? 'lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary text-primary'
                      : 'hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary text-primary hover:text-primary-highlight'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  <span>User Map</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">

              {user && (
                <div className="flex items-center space-x-3">
                  <Link
                    to={getMyProfilePath()}
                    className="text-xs text-primary hidden sm:block hover:text-primary-highlight dark:hover:text-primary-highlight"
                  >
                    {user.username}
                  </Link>

                  <Link
                    to={getMyProfilePath()}
                    className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                    title={`${user.firstName} ${user.lastName}`}
                  >
                    <div className="w-full h-full">
                      <UserAvatar user={user} size="sm" />
                    </div>
                  </Link>

                  {/* Particle Animation Toggle */}
                  <button
                    onClick={toggleParticles}
                    className="p-2 rounded-lg hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary dark:hover:text-primary-highlight"
                    aria-label={particlesEnabled ? "Particles on" : "Particles off"}
                    title={particlesEnabled ? "Particles on" : "Particles off"}
                  >
                    <span className={`text-xs w-5 h-5 flex items-center justify-center font-bold ${
                      particlesEnabled 
                        ? 'text-primary hover:text-primary-highlight' 
                        : 'lightmode-text-primary dark:darkmode-text-primary'
                    }`}>
                      A
                    </span>
                  </button>

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="text-xs p-2 rounded-lg hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary dark:hover:text-primary-highlight"
                    aria-label={isDark ? "Toggle light mode" : "Toggle dark mode"}
                    title={isDark ? "Toggle light mode" : "Toggle dark mode"}
                  >
                    {isDark ? (
                      <SunIcon className="text-xs w-5 h-5 text-primary hover:text-primary-highlight" />
                    ) : (
                      <MoonIcon className="text-xs w-5 h-5 text-primary hover:text-primary-highlight" />
                    )}
                  </button>

                  <button
                    onClick={logout}
                    className="px-3 py-2 text-xs flex items-center gap-2 rounded-lg hover:lightmode-highlight dark:hover:darkmode-highlight text-primary hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

    </>
  );
};

export default Navigation;