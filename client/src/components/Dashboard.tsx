import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
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

// Optimized pie chart component that prevents re-renders when data hasn't changed
const MemoizedPieChart = React.memo(({ data }: { data: any[] }) => (
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
        <Tooltip content={<PieChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap justify-center gap-2 mt-1">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center gap-1 text-xs">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="lightmode-text-secondary dark:darkmode-text-secondary">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  </div>
));

// Optimized bar chart component with gradient styling and hover effects
const MemoizedBarChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="80%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="category" className="lightmode-text-tertiary dark:darkmode-text-tertiary" fontSize={10} />
      <YAxis className="lightmode-text-tertiary dark:darkmode-text-tertiary" fontSize={10} />
      <Tooltip 
        content={<BarChartTooltip />}
        cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }}
      />
      <Bar
        dataKey="count"
        fill="url(#colorGradient)"
        fillOpacity={0.25}
        stroke="#818cf8"
        strokeWidth={2}
        radius={[2, 2, 0, 0]}
      />
      <defs>
        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.9}/>
          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.9}/>
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
));

// Custom tooltip component for pie charts with dark mode support
const PieChartTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border lightmode dark:darkmode lightmode-text-primary dark:darkmode-text-primary p-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <span className="font-medium">{payload[0].name}: {payload[0].value}</span>
      </div>
    </div>
  );
};

// Custom tooltip component for bar charts with styled presentation
const BarChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border lightmode dark:darkmode lightmode-text-primary dark:darkmode-text-primary p-3 shadow-lg">
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-3 h-3 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
        <span>Count: {payload[0].value}</span>
      </div>
    </div>
  );
};

// Custom tooltip component for line charts showing multiple data points
const LineChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border lightmode dark:darkmode lightmode-text-primary dark:darkmode-text-primary p-3 shadow-lg">
      <p className="text-sm font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.dataKey}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Optimized line chart component for displaying time-series data
const MemoizedLineChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="75%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
      <YAxis stroke="#9CA3AF" fontSize={10} />
      <Tooltip content={<LineChartTooltip />} />
      <Line type="monotone" dataKey="projects" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 3 }} />
      <Line type="monotone" dataKey="views" stroke="#d946ef" strokeWidth={2} dot={{ fill: '#d946ef', strokeWidth: 1, r: 3 }} />
    </LineChart>
  </ResponsiveContainer>
));

// Main dashboard component with draggable widgets, charts, and user statistics
const Dashboard: React.FC = () => {
  const { username } = useParams<{ username: string }>();
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
    'skills-category': { title: 'Skillpoints by Category', type: 'chart' },
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

  // Persists dashboard layout configuration and hidden cards to browser storage
  const saveLayoutToStorage = (layouts: any, hiddenCards: Set<string>) => {
    try {
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
      localStorage.setItem('dashboard-hidden-cards', JSON.stringify(Array.from(hiddenCards)));
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  };

  // Restores previously saved dashboard layout and hidden cards from browser storage
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

  // Resets dashboard layout to default configuration and clears saved preferences
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

  // Generates sample monthly activity data for demonstration purposes
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
    
    setMonthlyData(generateRandomMonthlyData());

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // Separate useEffect for data fetching that depends on username
  useEffect(() => {
    if (username) {
      fetchDashboardData();
    }
  }, [username]);

  // Fetches user dashboard statistics and recent comments from API endpoints
  const fetchDashboardData = async () => {
    try {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      // Use the new username-based dashboard endpoint and comments endpoint
      const [dashboardRes, commentsRes] = await Promise.all([
        fetch(`http://localhost:5001/api/user/${username}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/comments/recent', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (!dashboardRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const dashboardData = await dashboardRes.json();
      const commentsData = await commentsRes.json();
      
      if (!dashboardData.success) {
        throw new Error(dashboardData.message || 'Failed to fetch dashboard data');
      }

      console.log('Dashboard API Response:', dashboardData);
      console.log('Comments API Response:', commentsData);

      // Extract data from the new API structure
      const data = dashboardData.data;
      const comments = commentsData.success ? commentsData.data.comments.map((comment: any) => {
        let userName = 'Anonymous';
        if (comment.userId) {
          if (typeof comment.userId === 'object' && comment.userId.username) {
            userName = comment.userId.username;
          } else if (comment.user && comment.user.username) {
            userName = comment.user.username;
          }
        }
        
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

      // Transform project stats for the pie chart
      const projectsByStatus = data.projectStats?.map((stat: any) => ({
        name: stat._id?.charAt(0).toUpperCase() + stat._id?.slice(1) || 'Unknown',
        value: stat.count,
        color: stat._id === 'completed' ? '#4f46e5' : 
               stat._id === 'in-progress' ? '#7c3aed' : 
               stat._id === 'planning' ? '#9333ea' : '#c026d3'
      })) || [];

      // Transform skill stats for the bar chart
      const skillsByCategory = data.skillStats?.map((stat: any) => ({
        category: stat._id?.charAt(0).toUpperCase() + stat._id?.slice(1) || 'Unknown',
        count: stat.count
      })) || [];

      const dashboardStats: DashboardStats = {
        totalProjects: data.overview?.totalProjects || 0,
        totalSkills: data.overview?.totalSkills || 0,
        totalViews: data.overview?.totalViews || 0,
        totalLikes: data.overview?.totalLikes || 0,
        completedProjects: data.projectStats?.find((s: any) => s._id === 'completed')?.count || 0,
        inProgressProjects: data.projectStats?.find((s: any) => s._id === 'in-progress')?.count || 0,
        projectsByStatus: projectsByStatus.filter((item: any) => item.value > 0),
        skillsByCategory,
        monthlyActivity: monthlyData.length > 0 ? monthlyData : generateRandomMonthlyData(),
        recentComments: comments || []
      };

      setStats(dashboardStats);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Regenerates sample monthly data and updates the dashboard display
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

  // Hides a dashboard card and saves its size for potential restoration
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

  // Shows a previously hidden dashboard card and restores its original position
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

  // Handles drag-and-drop layout changes and persists them to storage
  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
    // Save to localStorage whenever layout changes
    saveLayoutToStorage(layouts, hiddenCards);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary">
        <div className="text-center">
          <h2 className="text-2xl  text-danger mb-4">Error Loading Dashboard</h2>
          <p className="lightmode-text-secondary dark:darkmode-text-secondary mb-4">{error}</p>
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

// The Actual Component UI
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
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors border shadow-lg lightmode dark:darkmode text-primary 
            border-primary hover:lightmode-highlight dark:hover:darkmode-highlight hover:text-primary-highlight"
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
                ? 'lightmode dark:darkmode text-primary hover:lightmode-highlight dark:hover:darkmode-highlight hover:text-primary-highlight'
                : 'lightmode dark:darkmode text-primary border opacity-50'
            }`}>
              <EyeIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showDropdown && hiddenCards.size > 0 && (
              <div className="absolute right-0 top-full lightmode dark:darkmode text-primary border rounded-md shadow-lg z-10 max-w-48 w-max">
                {Array.from(hiddenCards).map(cardId => {
                  const card = cardInfo[cardId as keyof typeof cardInfo];
                  return (
                    <button
                      key={cardId}
                      onClick={() => handleShowCard(cardId)}
                      className="block w-full text-left px-4 py-2 hover:lightmode-highlight dark:hover:darkmode-highlight dark:darkmode-text-primary first:rounded-t-md last:rounded-b-md"
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
                className="absolute top-2 right-2 p-1 text-primary hover:text-primary-highlight rounded z-30"
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
      <div className="opacity-50 absolute inset-0">
        <div className="absolute top-96 left-1/8 transform -translate-x-1/2 rotate-90 whitespace-nowrap">
          <h1 className="text-7xl  gradient-text bg-clip-text text-transparent">
            DRAG AND DROP
          </h1>
        </div>
      </div>
    </aside>
  </div>
  );
};

// Renders individual dashboard cards based on card type and provided data
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
          <h3 className="text-xl font-semibold mb-1 lightmode-text-primary dark:darkmode-text-primary">Projects by Status</h3>
          <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary mb-2">Data fetched from mongodb</p>
          <MemoizedPieChart data={memoizedChartData.projectsByStatus} />
        </div>
      );

    case 'skills-category':
      return (
        <div className="h-full p-4">
          <h3 className="text-xl font-semibold mb-1 lightmode-text-primary dark:darkmode-text-primary">Skillpoints by Category</h3>
          <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary mb-2">Data fetched from mongodb</p>
          <MemoizedBarChart data={memoizedChartData.skillsByCategory} />
        </div>
      );

    case 'monthly-activity':
      return (
        <div className="h-full p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold mb-1 lightmode-text-primary dark:darkmode-text-primary">Monthly Activity</h3>
              <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary">Randomized sample data</p>
            </div>
            <button
              onClick={rerandomizeData}
              className="mt-5 px-6 text-xs py-1 btn-primary"
            >
              Rerandomize
            </button>
          </div>
          <MemoizedLineChart data={monthlyData} />
        </div>
      );

    case 'recent-comments':
      return (
        <div className="h-full p-4">
          <h3 className="text-xl font-semibold mb-2 lightmode-text-primary dark:darkmode-text-primary">Recent Comments</h3>
          {stats.recentComments.length > 0 ? (
            <div className="space-y-2 max-h-[calc(100%-3rem)] overflow-y-auto pr-2 lightmode-text-secondary dark:darkmode-text-secondary">
              {stats.recentComments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-primary pl-3 py-1">
                  <p className="text-sm mb-1">{comment.content}</p>
                  <div className="flex flex-col text-xs lightmode-text-ter dark:darkmode-text-secondary space-y-1">
                    <div className="flex justify-between items-center">
                      <p>
                        By: <Link 
                          to={`/userspace/${comment.userName}/profile`}
                          className="font-medium text-primary hover:text-primary-highlight transition-colors duration-200"
                        >
                          {comment.userName || 'Anonymous'}
                        </Link>
                        {comment.rating > 0 && (
                          <span className="ml-2">
                            <span className="text-warning">{'★'.repeat(comment.rating)}</span>
                            <span className="lightmode-text-tertiary dark:darkmode-text-tertiary opacity-50">{'★'.repeat(5 - comment.rating)}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    {comment.createdAt && (
                      <p>
                        On: <span className="font-medium lightmode-text-tertiary dark:darkmode-text-tertiary">
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
                      <p>
                        <span className="font-medium lightmode-text-secondary dark:darkmode-text-secondary">Project: </span> 
                        <span className="font-medium lightmode-text-tertiary dark:darkmode-text-tertiary">{comment.projectTitle}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="lightmode-text-secondary dark:darkmode-text-secondary text-sm">No comments yet. Share your projects to get feedback!</p>
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

// Reusable card component for displaying statistics with icons
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="flex items-center h-full p-4">
    <div className="border border-primary p-3 rounded-full text-primary mr-4 shadow-lg">
      {React.cloneElement(icon as React.ReactElement<any>, {
        className: "w-6 h-6 text-primary"
      })}
    </div>
    <div>
      <p className="text-sm font-medium lightmode-text-primary dark:darkmode-text-primary">{title}</p>
      <p className="text-2xl  lightmode-text-secondary dark:darkmode-text-secondary">{value}</p>
    </div>
  </div>
);

export default Dashboard;