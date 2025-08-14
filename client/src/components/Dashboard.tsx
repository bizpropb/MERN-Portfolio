import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { EyeSlashIcon, EyeIcon, ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FolderIcon, WrenchScrewdriverIcon, EyeIcon as EyeIconSolid, HeartIcon } from '@heroicons/react/24/solid';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

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

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Memoized chart components to prevent unnecessary re-renders
const MemoizedPieChart = React.memo(({ data, getTooltipStyle }: { data: any[], getTooltipStyle: () => any }) => (
  <div className="h-full flex flex-col">
    <ResponsiveContainer width="100%" height="75%">
      <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={112}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={getTooltipStyle()} />
      </PieChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap justify-center gap-2 mt-1">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center gap-1 text-xs">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-gray-700 dark:text-gray-300">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  </div>
));

const MemoizedBarChart = React.memo(({ data, getTooltipStyle }: { data: any[], getTooltipStyle: () => any }) => (
  <ResponsiveContainer width="100%" height="80%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="category" stroke="#9CA3AF" fontSize={10} />
      <YAxis stroke="#9CA3AF" fontSize={10} />
      <Tooltip 
        contentStyle={getTooltipStyle()}
        cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }}
      />
      <Bar dataKey="count" fill="url(#colorGradient)" radius={[2, 2, 0, 0]} />
      <defs>
        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.9}/>
          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.9}/>
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
));

const MemoizedLineChart = React.memo(({ data, getTooltipStyle }: { data: any[], getTooltipStyle: () => any }) => (
  <ResponsiveContainer width="100%" height="75%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
      <YAxis stroke="#9CA3AF" fontSize={10} />
      <Tooltip contentStyle={getTooltipStyle()} />
      <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', strokeWidth: 1, r: 3 }} />
      <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3 }} />
    </LineChart>
  </ResponsiveContainer>
));

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; projects: number; views: number }>>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Store original layouts for restoration when unhiding
  const originalLayouts = {
    lg: [
      { i: 'monthly-activity', x: 0, y: 0, w: 4, h: 2 },
      { i: 'total-projects', x: 4, y: 0, w: 2, h: 1 },
      { i: 'total-skills', x: 6, y: 0, w: 2, h: 1 },
      { i: 'profile-views', x: 8, y: 0, w: 2, h: 1 },
      { i: 'project-likes', x: 10, y: 0, w: 2, h: 1 },
      { i: 'projects-status', x: 0, y: 2, w: 4, h: 4 },
      { i: 'skills-category', x: 4, y: 2, w: 4, h: 4 },
      { i: 'recent-comments', x: 8, y: 2, w: 4, h: 4 }
    ],
    md: [
      { i: 'monthly-activity', x: 0, y: 0, w: 6, h: 2 },
      { i: 'total-projects', x: 6, y: 0, w: 3, h: 1 },
      { i: 'total-skills', x: 9, y: 0, w: 3, h: 1 },
      { i: 'profile-views', x: 6, y: 1, w: 3, h: 1 },
      { i: 'project-likes', x: 9, y: 1, w: 3, h: 1 },
      { i: 'projects-status', x: 0, y: 2, w: 6, h: 4 },
      { i: 'skills-category', x: 6, y: 2, w: 6, h: 4 },
      { i: 'recent-comments', x: 0, y: 6, w: 12, h: 4 }
    ],
    sm: [
      { i: 'monthly-activity', x: 0, y: 0, w: 6, h: 2 },
      { i: 'total-projects', x: 0, y: 2, w: 3, h: 1 },
      { i: 'total-skills', x: 3, y: 2, w: 3, h: 1 },
      { i: 'profile-views', x: 0, y: 3, w: 3, h: 1 },
      { i: 'project-likes', x: 3, y: 3, w: 3, h: 1 },
      { i: 'projects-status', x: 0, y: 4, w: 6, h: 4 },
      { i: 'skills-category', x: 0, y: 8, w: 6, h: 4 },
      { i: 'recent-comments', x: 0, y: 12, w: 6, h: 4 }
    ]
  };

  const [layouts, setLayouts] = useState(originalLayouts);
  const [cardSizes, setCardSizes] = useState<Record<string, {lg: LayoutItem, md: LayoutItem, sm: LayoutItem}>>({});

  // Memoized chart data to prevent unnecessary recalculations
  const memoizedChartData = useMemo(() => {
    if (!stats) return { projectsByStatus: [], skillsByCategory: [], monthlyActivity: [] };
    
    return {
      projectsByStatus: stats.projectsByStatus,
      skillsByCategory: stats.skillsByCategory,
      monthlyActivity: stats.monthlyActivity
    };
  }, [stats?.projectsByStatus, stats?.skillsByCategory, stats?.monthlyActivity]);

  const cardInfo = {
    'monthly-activity': { title: 'Monthly Activity', type: 'activity' },
    'total-projects': { title: 'Total Projects', type: 'stat' },
    'total-skills': { title: 'Total Skills', type: 'stat' },
    'profile-views': { title: 'Profile Views', type: 'stat' },
    'project-likes': { title: 'Project Likes', type: 'stat' },
    'projects-status': { title: 'Projects by Status', type: 'chart' },
    'skills-category': { title: 'Skills by Category', type: 'chart' },
    'recent-comments': { title: 'Recent Comments', type: 'comments' }
  };

  // Tooltip styles that respond to dark mode
  const getTooltipStyle = () => ({
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    fontSize: '14px',
    padding: '8px 12px',
    boxShadow: isDarkMode 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  });

  // Save layout to localStorage
  const saveLayoutToStorage = (layouts: any, hiddenCards: Set<string>) => {
    try {
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
      localStorage.setItem('dashboard-hidden-cards', JSON.stringify(Array.from(hiddenCards)));
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  };

  // Load layout from localStorage
  const loadLayoutFromStorage = () => {
    try {
      const savedLayouts = localStorage.getItem('dashboard-layouts');
      const savedHiddenCards = localStorage.getItem('dashboard-hidden-cards');
      
      if (savedLayouts) {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);
      }
      
      if (savedHiddenCards) {
        const parsedHiddenCards = JSON.parse(savedHiddenCards);
        setHiddenCards(new Set(parsedHiddenCards));
      }
    } catch (error) {
      console.error('Failed to load layout from localStorage:', error);
    }
  };

  // Reset layout to original
  const resetLayout = () => {
    setLayouts(originalLayouts);
    setHiddenCards(new Set());
    setCardSizes({});
    
    // Initialize card sizes from original layouts
    const sizes: Record<string, {lg: LayoutItem, md: LayoutItem, sm: LayoutItem}> = {};
    Object.keys(cardInfo).forEach(cardId => {
      sizes[cardId] = {
        lg: originalLayouts.lg.find(item => item.i === cardId)!,
        md: originalLayouts.md.find(item => item.i === cardId)!,
        sm: originalLayouts.sm.find(item => item.i === cardId)!
      };
    });
    setCardSizes(sizes);
    
    // Clear localStorage
    try {
      localStorage.removeItem('dashboard-layouts');
      localStorage.removeItem('dashboard-hidden-cards');
    } catch (error) {
      console.error('Failed to clear layout from localStorage:', error);
    }
  };

  const generateRandomMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      projects: Math.floor(Math.random() * 10) + 1,
      views: Math.floor(Math.random() * 100) + 20
    }));
  };

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    // Load saved layout
    loadLayoutFromStorage();

    // Initialize card sizes from original layouts
    const sizes: Record<string, {lg: LayoutItem, md: LayoutItem, sm: LayoutItem}> = {};
    Object.keys(cardInfo).forEach(cardId => {
      sizes[cardId] = {
        lg: originalLayouts.lg.find(item => item.i === cardId)!,
        md: originalLayouts.md.find(item => item.i === cardId)!,
        sm: originalLayouts.sm.find(item => item.i === cardId)!
      };
    });
    setCardSizes(sizes);
    
    fetchDashboardData();
    setMonthlyData(generateRandomMonthlyData());

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
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
      
      console.log('Raw comments data from API:', JSON.stringify(commentsData, null, 2));

      if (projectsData.success && skillsData.success) {
        const projects = projectsData.data.projects;
        const skills = skillsData.data.skills;
        console.log('Raw comments data:', commentsData);
        const comments = commentsData.success ? commentsData.data.comments.map((comment: any) => {
          console.log('Processing comment:', comment);
          
          // Handle user data
          let userName = 'Anonymous';
          if (comment.userId) {
            if (typeof comment.userId === 'object' && comment.userId.firstName) {
              // User data is populated
              userName = `${comment.userId.firstName} ${comment.userId.lastName || ''}`.trim();
            } else if (comment.user) {
              // Check for alternative user field
              const user = comment.user;
              userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous';
            }
          }
          
          // Handle project title
          let projectTitle = 'Unknown Project';
          if (comment.projectId) {
            if (typeof comment.projectId === 'object' && comment.projectId.title) {
              projectTitle = comment.projectId.title;
            } else if (comment.project) {
              projectTitle = comment.project.title || projectTitle;
            }
          }
          
          return {
            ...comment,
            content: comment.content || 'No content',
            userName,
            projectTitle,
            rating: comment.rating || 0,
            createdAt: comment.createdAt
          };
        }) : [];

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
            { name: 'Completed', value: statusCounts.completed || 0, color: '#3B82F6' },
            { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#8B5CF6' },
            { name: 'Planning', value: statusCounts.planning || 0, color: '#A855F7' },
            { name: 'Archived', value: statusCounts.archived || 0, color: '#EC4899' }
          ].filter(item => item.value > 0),
          skillsByCategory: Object.entries(skillCategories).map(([category, count]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            count: count as number
          })),
          monthlyActivity: monthlyData.length > 0 ? monthlyData : generateRandomMonthlyData(),
          recentComments: comments || []
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

  const rerandomizeData = () => {
    const newData = generateRandomMonthlyData();
    setMonthlyData(newData);
    if (stats) {
      setStats({
        ...stats,
        monthlyActivity: newData
      });
    }
  };

  const handleHideCard = (cardId: string) => {
    // Store current size before hiding
    const currentLayouts = layouts;
    const updatedSizes = { ...cardSizes };
    
    ['lg', 'md', 'sm'].forEach(breakpoint => {
      const layout = currentLayouts[breakpoint as keyof typeof currentLayouts].find(item => item.i === cardId);
      if (layout) {
        updatedSizes[cardId] = {
          ...updatedSizes[cardId],
          [breakpoint]: { ...layout }
        };
      }
    });
    
    setCardSizes(updatedSizes);
    
    const newHiddenCards = new Set([...hiddenCards, cardId]);
    setHiddenCards(newHiddenCards);
    
    // Save to localStorage
    saveLayoutToStorage(layouts, newHiddenCards);
  };

  const handleShowCard = (cardId: string) => {
    const newHiddenCards = new Set(hiddenCards);
    newHiddenCards.delete(cardId);
    setHiddenCards(newHiddenCards);
    
    // Restore original size when showing
    if (cardSizes[cardId]) {
      const newLayouts = {
        lg: [...layouts.lg.filter(item => item.i !== cardId), cardSizes[cardId].lg],
        md: [...layouts.md.filter(item => item.i !== cardId), cardSizes[cardId].md],
        sm: [...layouts.sm.filter(item => item.i !== cardId), cardSizes[cardId].sm]
      };
      setLayouts(newLayouts);
      
      // Save to localStorage
      saveLayoutToStorage(newLayouts, newHiddenCards);
    }
  };

  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
    // Save to localStorage whenever layout changes
    saveLayoutToStorage(layouts, hiddenCards);
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
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const visibleLayouts = {
    lg: layouts.lg.filter(item => !hiddenCards.has(item.i)),
    md: layouts.md.filter(item => !hiddenCards.has(item.i)),
    sm: layouts.sm.filter(item => !hiddenCards.has(item.i))
  };

// The Actual Component UI // don't forget to do actual realiable COMMENTS
return (
  <div className="grid grid-cols-24">

    {/* ASIDE: Counterweight left*/}
    <aside className="hidden lg:block col-span-1">
    </aside>

    {/* MAIN: takes full width on small screens, 21/24 on large screens */}
    <main className="ml-0 col-span-24 lg:col-span-21 p-6 z-10">
      <div className="max-w-full mx-auto">
        {/* Header with hidden cards dropdown and reset button */}
        <div className="mb-0 flex justify-end gap-2">
          {/* Reset button */}
          <button
            onClick={resetLayout}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors border shadow-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-purple-700 hover:text-white hover:border-transparent"
            title="Reset to original layout"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>

          {/* Show hidden cards dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setTimeout(() => setShowDropdown(false), 500)}
          >
            
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors border shadow-lg ${
              hiddenCards.size > 0
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 opacity-50'
            }`}>
              <EyeIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showDropdown && hiddenCards.size > 0 && (
              <div className="absolute right-0 top-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-48">
                {Array.from(hiddenCards).map(cardId => {
                  const card = cardInfo[cardId as keyof typeof cardInfo];
                  return (
                    <button
                      key={cardId}
                      onClick={() => handleShowCard(cardId)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md text-gray-900 dark:text-gray-100"
                    >
                      {card?.title}
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Dashboard Grid with Drag & Drop */}
        <ResponsiveGridLayout
          className="layout"
          layouts={visibleLayouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 12, sm: 6 }}
          rowHeight={100}
          draggableHandle=".drag-handle"
        >
          {Object.keys(cardInfo).filter(cardId => !hiddenCards.has(cardId)).map(cardId => (
            <div key={cardId} className="card relative">
              <div className="drag-handle absolute top-0 left-0 right-0 h-8 cursor-move z-20"></div>
              <button
                onClick={() => handleHideCard(cardId)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded z-30"
              >
                <EyeSlashIcon className="w-4 h-4" />
              </button>
              {renderCard(cardId, stats, rerandomizeData, monthlyData, getTooltipStyle, memoizedChartData)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </main>

    {/* ASIDE: proper height */}
    <aside className="hidden lg:block col-span-2 relative overflow-visible">
      <div className="opacity-40 absolute inset-0">
        <div className="absolute top-82 left-1/8 transform -translate-x-1/2 rotate-90 whitespace-nowrap">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            DRAG AND DROP
          </h1>
        </div>
      </div>
    </aside>
  </div>
  );
};

const renderCard = (
  cardId: string,
  stats: DashboardStats,
  rerandomizeData: () => void,
  monthlyData: Array<{ month: string; projects: number; views: number }>,
  getTooltipStyle: () => any,
  memoizedChartData: { projectsByStatus: any[], skillsByCategory: any[], monthlyActivity: any[] }
) => {
  switch (cardId) {
    case 'total-projects':
      return (
        <StatCard title="Total Projects" value={stats.totalProjects} icon={<FolderIcon className="w-6 h-6" />} />
      );
    
    case 'total-skills':
      return (
        <StatCard title="Total Skills" value={stats.totalSkills} icon={<WrenchScrewdriverIcon className="w-6 h-6" />} />
      );
      
    case 'profile-views':
      return (
        <StatCard title="Profile Views" value={stats.totalViews} icon={<EyeIconSolid className="w-6 h-6" />} />
      );
      
    case 'project-likes':
      return (
        <StatCard title="Project Likes" value={stats.totalLikes} icon={<HeartIcon className="w-6 h-6" />} />
      );

    case 'projects-status':
      return (
        <div className="h-full p-4">
          <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">Projects by Status</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data fetched from mongodb</p>
          <MemoizedPieChart data={memoizedChartData.projectsByStatus} getTooltipStyle={getTooltipStyle} />
        </div>
      );

    case 'skills-category':
      return (
        <div className="h-full p-4">
          <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">Skills by Category</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data fetched from mongodb</p>
          <MemoizedBarChart data={memoizedChartData.skillsByCategory} getTooltipStyle={getTooltipStyle} />
        </div>
      );

    case 'monthly-activity':
      return (
        <div className="h-full p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">Monthly Activity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Randomized sample data</p>
            </div>
            <button
              onClick={rerandomizeData}
              className="px-3 py-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white text-xs rounded-md hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 transition-all"
            >
              Rerandomize
            </button>
          </div>
          <MemoizedLineChart data={monthlyData} getTooltipStyle={getTooltipStyle} />
        </div>
      );

    case 'recent-comments':
      return (
        <div className="h-full p-4">
          <h3 className="text-xl font-semibold mb-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Recent Comments</h3>
          {stats.recentComments.length > 0 ? (
            <div className="space-y-2 max-h-[calc(100%-3rem)] overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#8B5CF6 transparent'
            }}>
              {stats.recentComments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-purple-500 pl-3 py-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{comment.content}</p>
                  <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex justify-between items-center">
                      <p>
                        By: <span className="font-medium text-purple-600 dark:text-purple-400">
                          {comment.userName || 'Anonymous'}
                        </span>
                        {comment.rating > 0 && (
                          <span className="ml-2">
                            <span className="text-yellow-500">{'★'.repeat(comment.rating)}</span>
                            <span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - comment.rating)}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    {comment.createdAt && (
                      <p>
                        On: <span className="font-medium text-gray-700 dark:text-gray-300">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    )}
                    {comment.projectTitle && (
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        On project: {comment.projectTitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Share your projects to get feedback!</p>
          )}
        </div>
      );

    default:
      return <div>Unknown card</div>;
  }
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="flex items-center h-full p-4">
    <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-3 rounded-full text-white mr-4 shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export default Dashboard;