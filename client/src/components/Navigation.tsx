import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SunIcon, 
  MoonIcon, 
  ChartBarIcon, 
  FolderIcon, 
  WrenchScrewdriverIcon, 
  UserIcon,
  MagnifyingGlassIcon,
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

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/news') {
      return location.pathname.startsWith('/news');
    }
    return location.pathname === path;
  };
  
  // Always route to logged-in user's own profile
  const getMyProfilePath = () => {
    return user?.username ? `/myuserspace/${user.username}/profile` : '/profile';
  };


  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                DevHub
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/news"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/news')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <NewspaperIcon className="w-4 h-4" />
                  <span>News</span>
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/browse')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                    className="text-sm font-bold italic text-purple-500 hidden sm:block hover:text-purple-400 transition-colors"
                  >
                    {user.username.toUpperCase()}
                  </Link>

                  <Link
                    to={getMyProfilePath()}
                    className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center overflow-hidden"
                    title={`${user.firstName} ${user.lastName}`}
                  >
                    <div className="w-full h-full">
                      <UserAvatar user={user} size="sm" />
                    </div>
                  </Link>

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {isDark ? (
                      <SunIcon className="w-5 h-5 text-white" />
                    ) : (
                      <MoonIcon className="w-5 h-5 text-gray-700" />
                    )}
                  </button>

                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:text-red-600 rounded-lg transition-all duration-500"
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