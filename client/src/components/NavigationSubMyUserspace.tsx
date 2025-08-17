import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  FolderIcon, 
  WrenchScrewdriverIcon, 
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const NavigationSubMyUserspace: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const getDashboardPath = () => `/myuserspace/${user?.username}/dashboard`;
  const getProjectsPath = () => `/myuserspace/${user?.username}/projects`;
  const getSkillsPath = () => `/myuserspace/${user?.username}/skills`;
  const getProfilePath = () => `/myuserspace/${user?.username}/profile`;

  if (!user) return null;

  return (
    <nav className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-2">
          <div className="flex items-center space-x-6">
            <Link 
              to={getProfilePath()}
              className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              &lt;/&gt; my userspace
            </Link>
            
            <div className="flex space-x-4">
              <Link
                to={getDashboardPath()}
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive(getDashboardPath())
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <ChartBarIcon className="w-3 h-3" />
                <span>Dashboard</span>
              </Link>
              <Link
                to={getProjectsPath()}
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive(getProjectsPath())
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <FolderIcon className="w-3 h-3" />
                <span>Projects</span>
              </Link>
              <Link
                to={getSkillsPath()}
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive(getSkillsPath())
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <WrenchScrewdriverIcon className="w-3 h-3" />
                <span>Skills</span>
              </Link>
              <Link
                to={getProfilePath()}
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive(getProfilePath())
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <UserIcon className="w-3 h-3" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationSubMyUserspace;