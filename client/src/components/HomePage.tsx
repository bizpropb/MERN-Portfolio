import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NewsLatest from './NewsLatest';
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
      const usersResponse = await fetch('http://localhost:5001/api/dashboard/map-users', {
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
            <NewsLatest limit={3} showLoadMore={true} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-md p-6">
              <h3 className="text-xl  mb-4">
                Featured Developers
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-10 h-10 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded w-3/4 mb-1"></div>
                        <div className="h-3 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded w-1/2"></div>
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
                      className="flex items-center space-x-3 hover:lightmode-highlight hover:dark:darkmode-highlight rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="w-10 h-10 flex-shrink-0">
                        <UserAvatar user={user} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-primary hover:text-primary-highlight">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary truncate">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-md p-6">
              <h3 className="text-xl  mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary text-sm">Total Developers</span>
                  <span className="font-semibold">
                    {loading ? '...' : stats.totalUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary text-sm">Total Projects</span>
                  <span className="font-semibold">
                    {loading ? '...' : stats.totalProjects}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="lightmode-text-secondary dark:darkmode-text-secondary text-sm">Technologies</span>
                  <span className="font-semibold">
                    {loading ? '...' : stats.totalTechnologies}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Discussions - Full Width */}
        <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-md p-3 mt-8">
          <h2 className="text-lg mb-1 text-center font-">
            COMMUNITY DISCUSSIONS
          </h2>
          <hr className="mb-6" />
          <pre className="text-xs !font-mono overflow-x-hidden whitespace-pre text-center lightmode-text-secondary dark:darkmode-text-secondary">
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