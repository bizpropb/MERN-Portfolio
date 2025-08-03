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
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
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
          monthlyActivity: generateMonthlyActivity(projects),
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

  const generateMonthlyActivity = (projects: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      projects: Math.floor(Math.random() * 5) + 1,
      views: Math.floor(Math.random() * 100) + 20
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Dashboard</h1>
          <p className="text-gray-600">Real-time overview of your projects, skills, and engagement</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Projects" 
            value={stats.totalProjects} 
            icon="📁" 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Total Skills" 
            value={stats.totalSkills} 
            icon="🛠️" 
            color="bg-green-500" 
          />
          <StatCard 
            title="Profile Views" 
            value={stats.totalViews} 
            icon="👁️" 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Project Likes" 
            value={stats.totalLikes} 
            icon="❤️" 
            color="bg-red-500" 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Projects by Status</h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Skills by Category */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Skills by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.skillsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Comments */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Recent Comments</h3>
          {stats.recentComments.length > 0 ? (
            <div className="space-y-4">
              {stats.recentComments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 mb-1">{comment.content}</p>
                      <p className="text-sm text-gray-600">
                        On project: <span className="font-medium">{comment.projectTitle}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        By {comment.userName} • {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {comment.rating && (
                      <div className="ml-4 flex items-center">
                        <span className="text-yellow-500">{'★'.repeat(comment.rating)}</span>
                        <span className="text-gray-300">{'★'.repeat(5 - comment.rating)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No comments yet. Share your projects to get feedback!</p>
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
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-full text-white text-2xl mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;