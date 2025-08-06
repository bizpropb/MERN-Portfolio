import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalProjects: number;
  totalSkills: number;
  totalViews: number;
  totalLikes: number;
  completedProjects: number;
  inProgressProjects: number;
  projectsByStatus: Array<{ name: string; value: number; color: string }>;
  skillsByCategory: Array<{ category: string; count: number }>;
  monthlyActivity: Array<{ month: string; projects: number; views: number }>;
  recentComments: Array<{
    id: string;
    content: string;
    projectTitle: string;
    userName: string;
    rating: number;
    createdAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Removed setInterval - no more real-time updates
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch data from multiple endpoints
      const [projectsRes, skillsRes, commentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects?analytics=true', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/skills', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/comments/recent', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const projectsData = await projectsRes.json();
      const skillsData = await skillsRes.json();
      const commentsData = await commentsRes.json();

      if (projectsData.success && skillsData.success) {
        const projects = projectsData.data.projects;
        const skills = skillsData.data.skills;
        const comments = commentsData.success ? commentsData.data.comments : [];

        // Calculate stats
        const totalViews = projects.reduce((sum: number, p: any) => sum + p.views, 0);
        const totalLikes = projects.reduce((sum: number, p: any) => sum + p.likes, 0);
        
        const statusCounts = projects.reduce((acc: any, project: any) => {
          acc[project.status] = (acc[project.status] || 0) + 1;
          return acc;
        }, {});

        const skillCategories = skills.reduce((acc: any, skill: any) => {
          acc[skill.category] = (acc[skill.category] || 0) + 1;
          return acc;
        }, {});

        const dashboardStats: DashboardStats = {
          totalProjects: projects.length,
          totalSkills: skills.length,
          totalViews,
          totalLikes,
          completedProjects: statusCounts.completed || 0,
          inProgressProjects: statusCounts['in-progress'] || 0,
          projectsByStatus: [
            { name: 'Completed', value: statusCounts.completed || 0, color: '#10B981' },
            { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#F59E0B' },
            { name: 'Planning', value: statusCounts.planning || 0, color: '#6B7280' },
            { name: 'Archived', value: statusCounts.archived || 0, color: '#EF4444' }
          ].filter(item => item.value > 0),
          skillsByCategory: Object.entries(skillCategories).map(([category, count]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            count: count as number
          })),
          monthlyActivity: getStaticMonthlyActivity(), // Fixed static data
          recentComments: comments.slice(0, 5)
        };

        setStats(dashboardStats);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Static monthly activity data (no more randomization)
  const getStaticMonthlyActivity = () => {
    return [
      { month: 'Jan', projects: 3, views: 45 },
      { month: 'Feb', projects: 5, views: 67 },
      { month: 'Mar', projects: 2, views: 38 },
      { month: 'Apr', projects: 4, views: 82 },
      { month: 'May', projects: 6, views: 94 },
      { month: 'Jun', projects: 3, views: 56 }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Portfolio Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your projects, skills, and engagement (sample data)</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Projects" 
            value={stats.totalProjects} 
            icon="📁" 
            gradientFrom="from-blue-500" 
            gradientTo="to-cyan-500" 
          />
          <StatCard 
            title="Total Skills" 
            value={stats.totalSkills} 
            icon="🛠️" 
            gradientFrom="from-green-500" 
            gradientTo="to-emerald-500" 
          />
          <StatCard 
            title="Profile Views" 
            value={stats.totalViews} 
            icon="👁️" 
            gradientFrom="from-purple-500" 
            gradientTo="to-pink-500" 
          />
          <StatCard 
            title="Project Likes" 
            value={stats.totalLikes} 
            icon="❤️" 
            gradientFrom="from-red-500" 
            gradientTo="to-rose-500" 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Status Chart */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.projectsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31 41 55)',
                    border: '1px solid rgb(75 85 99)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Skills by Category */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Skills by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.skillsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="category" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31 41 55)',
                    border: '1px solid rgb(75 85 99)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Monthly Activity (static data)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This chart shows static sample data and does not update automatically
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31 41 55)',
                  border: '1px solid rgb(75 85 99)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Comments */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Comments</h3>
          {stats.recentComments.length > 0 ? (
            <div className="space-y-4">
              {stats.recentComments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-gradient-to-b from-blue-500 to-purple-600 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200 mb-1">{comment.content}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        On project: <span className="font-medium text-blue-600 dark:text-blue-400">{comment.projectTitle}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        By {comment.userName} • {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {comment.rating && (
                      <div className="ml-4 flex items-center">
                        <span className="text-yellow-500">{'★'.repeat(comment.rating)}</span>
                        <span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - comment.rating)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Share your projects to get feedback!</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradientFrom, gradientTo }) => (
  <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center">
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} p-3 rounded-full text-white text-2xl mr-4 shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold gradient-text">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;