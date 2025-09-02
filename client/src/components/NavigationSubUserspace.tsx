import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  FolderIcon, 
  WrenchScrewdriverIcon, 
  UserIcon
} from '@heroicons/react/24/outline';

const NavigationSubUserspace: React.FC = () => {
  const location = useLocation();
  
  // Extract username from current URL path
  const getCurrentUsername = () => {
    const match = location.pathname.match(/^\/userspace\/([^\/]+)/);
    return match ? match[1] : null;
  };
  
  const username = getCurrentUsername();
  const isActive = (path: string) => location.pathname === path;
  
  const getDashboardPath = () => `/userspace/${username}/dashboard`;
  const getProjectsPath = () => `/userspace/${username}/projects`;
  const getSkillsPath = () => `/userspace/${username}/skills`;
  const getProfilePath = () => `/userspace/${username}/profile`;
  
  // Don't render if we can't extract username
  if (!username) return null;

  return (
    <nav className="lightmode dark:darkmode border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-2">
          <div className="flex items-center space-x-6">
            <Link 
              to={getProfilePath()}
              className="text-sm "
            >
            &lt;/&gt; userspace
            </Link>
            
            <div className="flex space-x-4">
              <Link
                to={getDashboardPath()}
                className={`flex items-center space-x-2 px-2 py-1 text-xs font-medium ${
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
                className={`flex items-center space-x-2 px-2 py-1 text-xs font-medium ${
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
                className={`flex items-center space-x-2 px-2 py-1 text-xs font-medium ${
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
                className={`flex items-center space-x-2 px-2 py-1 text-xs font-medium ${
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

export default NavigationSubUserspace;