import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SunIcon, 
  MoonIcon, 
  ChartBarIcon, 
  FolderIcon, 
  WrenchScrewdriverIcon, 
  PlusIcon,
  UserIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import ProjectCreateModal from './ProjectCreateModal';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleProjectCreate = (newProject: Project) => {
    // You can add any additional logic here if needed
    // The modal will handle closing itself and showing success message
    console.log('New project created:', newProject);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                DevHub Demo
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/projects"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/projects')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FolderIcon className="w-4 h-4" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/skills"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/skills')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <WrenchScrewdriverIcon className="w-4 h-4" />
                  <span>Skills</span>
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/map')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  <span>Map</span>
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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

              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user.firstName}!
                  </span>

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

      {/* Create Project Modal */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreate={handleProjectCreate}
      />
    </>
  );
};

export default Navigation;