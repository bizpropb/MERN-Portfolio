import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  FolderIcon, 
  WrenchScrewdriverIcon, 
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// Sub-navigation component for logged-in user's own userspace sections (dashboard, projects, skills, profile)
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
    <nav className="lightmode dark:darkmode border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-2">
          <div className="flex items-center space-x-6">
            <Link 
              to={getProfilePath()}
              className="text-sm "
            >
              <span className="hidden sm:inline">&lt;/&gt; my userspace</span>
              <span className="sm:hidden">&lt;/&gt;</span>
            </Link>
            
            <div className="flex space-x-2 sm:space-x-4">
              <Link
                to={getDashboardPath()}
                className={`flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 text-xs font-medium ${
                  isActive(getDashboardPath())
                    ? '!text-primary-highlight !'
                    : 'text-primary hover:text-primary-highlight'
                }`}
              >
                <ChartBarIcon className="w-3 h-3" />
                <span>Dashboard</span>
              </Link>
              <Link
                to={getProjectsPath()}
                className={`flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 text-xs font-medium ${
                  isActive(getProjectsPath())
                    ? '!text-primary-highlight !'
                    : 'text-primary hover:text-primary-highlight'
                }`}
              >
                <FolderIcon className="w-3 h-3" />
                <span>Projects</span>
              </Link>
              <Link
                to={getSkillsPath()}
                className={`flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 text-xs font-medium ${
                  isActive(getSkillsPath())
                    ? '!text-primary-highlight !'
                    : 'text-primary hover:text-primary-highlight'
                }`}
              >
                <WrenchScrewdriverIcon className="w-3 h-3" />
                <span>Skills</span>
              </Link>
              <Link
                to={getProfilePath()}
                className={`flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 text-xs font-medium ${
                  isActive(getProfilePath())
                    ? '!text-primary-highlight !'
                    : 'text-primary hover:text-primary-highlight'
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