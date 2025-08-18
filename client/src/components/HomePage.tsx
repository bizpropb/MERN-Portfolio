import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LatestNews from './LatestNews';
import UserAvatar from './UserAvatar';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalTechnologies: number;
}

const HomePage: React.FC = () => {
  const { token } = useAuth();
  const [featuredUsers, setFeaturedUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalProjects: 0, totalTechnologies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      // Fetch users for featured developers and stats
      const usersResponse = await fetch('http://localhost:5000/api/dashboard/map-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      
      if (usersData.success) {
        const users = usersData.data.users;
        // Sort by updatedAt and take first 5
        const sortedUsers = users.sort((a: User, b: User) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 5);
        
        setFeaturedUsers(sortedUsers);
        setStats(prev => ({ ...prev, totalUsers: users.length }));
      }

      // TODO: Add real project count and technology count when endpoints are available
      // For now using placeholder values
      setStats(prev => ({ 
        ...prev, 
        totalProjects: 47, // Placeholder
        totalTechnologies: 12 // Placeholder
      }));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Content Sections - Latest Updates with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-0">
          
          {/* Main Content Area - Latest Updates */}
          <div className="lg:col-span-2">
            <LatestNews limit={3} showLoadMore={true} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Developers
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredUsers.map((user) => (
                    <Link 
                      key={user._id} 
                      to={`/userspace/${user.username}/profile`}
                      className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="w-10 h-10 flex-shrink-0">
                        <UserAvatar user={user} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Developers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Projects</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalProjects}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Technologies</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalTechnologies}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Discussions - Full Width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mt-8">
          <h2 className="text-md text-gray-900 dark:text-white mb-1 text-center">
            COMMUNITY DISCUSSIONS
          </h2>
          <hr className="border-gray-300 dark:border-gray-600 mb-6" />
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre text-center">
{` ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗███╗   ██╗ ██████╗     ███████╗ ██████╗  ██████╗ ███╗   ██╗██╗
██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║████╗  ██║██╔════╝     ██╔════╝██╔═══██╗██╔═══██╗████╗  ██║██║
██║     ██║   ██║██╔████╔██║██╔████╔██║██║██╔██╗ ██║██║  ███╗    ███████╗██║   ██║██║   ██║██╔██╗ ██║██║
██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║██║╚██╗██║██║   ██║    ╚════██║██║   ██║██║   ██║██║╚██╗██║╚═╝
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║██║ ╚████║╚██████╔╝    ███████║╚██████╔╝╚██████╔╝██║ ╚████║██╗
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝
   `}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HomePage;