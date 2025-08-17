import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// Initialize dark mode immediately to prevent flash
(() => {
  const savedTheme = localStorage.getItem('theme');
  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && true);
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  }
  document.documentElement.style.colorScheme = shouldBeDark ? 'dark' : 'light';
})();

// Context Providers
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navigation from './components/Navigation';
import NavigationSubUserspace from './components/NavigationSubUserspace';
import NavigationSubMyUserspace from './components/NavigationSubMyUserspace';
import Footer from './components/Footer';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import SkillsManager from './components/SkillManager';
import ProjectCreateModal from './components/ProjectCreateModal';
import ProjectsList from './components/ProjectsList';
import ProfileView from './components/ProfileView';
import Map from './components/Map';
import HomePage from './components/HomePage';
import NewsView from './components/NewsView';


// Particle System Component
const ParticleBackground: React.FC = () => {
  return (
    <>
      {/* UNDERLAY */}
      <div 
        className="fixed inset-0 w-full h-full bg-white dark:bg-black z-[-40]"
      />

      {/* Background Image - Desaturated - SECOND */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-[-30] opacity-20 dark:opacity-50"
        style={{
          backgroundImage: 'url("/BG.webp")',
          filter: 'grayscale(100%) brightness(0.4)',
        }}
      />
      
      {/* Particles Container - THIRD */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[-20]"
      >
        {/* More Vortex Particles */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 30}%`,
              animation: `vortex-${i % 4} ${20 + Math.random() * 10}s infinite linear`,
              animationDelay: `${Math.random() * 10}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
            }}
          />
        ))}
      </div>
      
      {/* Color Gradient Overlay - FOURTH */}
      <div 
        className="fixed inset-0 w-full h-full z-[-10] pointer-events-none opacity-20 dark:opacity-50"
        style={{
          background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.6), rgba(255, 0, 255, 0.6))',
          mixBlendMode: 'color' // <- actually applies the gradient hue to white
        }}
      />
      
      {/* CSS Animation Styles */}
      <style>{`
        @keyframes vortex-0 {
          0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(-20vh) translateX(200px) rotate(720deg) scale(1.2);
            opacity: 0;
          }
        }
        
        @keyframes vortex-1 {
          0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(-20vh) translateX(-150px) rotate(-540deg) scale(0.6);
            opacity: 0;
          }
        }
        
        @keyframes vortex-2 {
          0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          10% { opacity: 0.7; }
          50% { 
            transform: translateY(40vh) translateX(100px) rotate(360deg) scale(1.1);
          }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(-20vh) translateX(300px) rotate(900deg) scale(0.7);
            opacity: 0;
          }
        }
        
        @keyframes vortex-3 {
          0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg) scale(1.1);
            opacity: 0;
          }
          10% { opacity: 0.7; }
          30% { 
            transform: translateY(60vh) translateX(-80px) rotate(180deg) scale(0.8);
          }
          70% { 
            transform: translateY(20vh) translateX(120px) rotate(450deg) scale(1.3);
          }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(-20vh) translateX(-200px) rotate(720deg) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

// Dashboard Redirect Component
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user || !user.username) {
    return <div>Loading...</div>;
  }
  
  return <Navigate to={`/myuserspace/${user.username}/dashboard`} replace />;
};

// Sub Navigation Component with conditional rendering
const ConditionalSubNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if we're in userspace (viewing someone else)
  const userspaceMatch = location.pathname.match(/^\/userspace\/([^\/]+)/);
  if (userspaceMatch) {
    const viewedUsername = userspaceMatch[1];
    // If logged-in user is trying to view their own profile via /userspace/, redirect to /myuserspace/
    if (user && viewedUsername === user.username) {
      const currentPath = location.pathname.replace('/userspace/', '/myuserspace/');
      window.location.replace(currentPath);
      return null;
    }
    return <NavigationSubUserspace />;
  }
  
  // Check if we're in my userspace
  const myUserspaceMatch = location.pathname.match(/^\/myuserspace\/([^\/]+)/);
  if (myUserspaceMatch && user) {
    return <NavigationSubMyUserspace />;
  }
  
  return null;
};

// Conditional Footer Component
const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  
  // Hide footer on browse/map page
  if (location.pathname === '/browse') {
    return null;
  }
  
  return <Footer />;
};

// Main App Component
const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col relative">
            
            {/* Particle Background System - Rendered First */}
            <ParticleBackground />
            
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ConditionalSubNavigation />
                    <main className="flex-1 py-0 relative">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/browse" element={<Map />} />
                        <Route path="/news" element={<NewsView />} />
                        <Route path="/news/:slug" element={<NewsView />} />
                        <Route path="/dashboard" element={<DashboardRedirect />} />
                        <Route path="/projects" element={<DashboardRedirect />} />
                        <Route path="/skills" element={<DashboardRedirect />} />
                        <Route path="/profile" element={<DashboardRedirect />} />
                        {/* My userspace routes */}
                        <Route path="/myuserspace/:username/dashboard" element={<Dashboard />} />
                        <Route path="/myuserspace/:username/projects" element={<ProjectsList />} />
                        <Route path="/myuserspace/:username/projects/new" element={<ProjectCreateModal isOpen={true} onClose={() => {}} onProjectCreate={() => {}} />} />
                        <Route path="/myuserspace/:username/skills" element={<SkillsManager />} />
                        <Route path="/myuserspace/:username/profile" element={<ProfileView />} />
                        
                        {/* Other users' userspace routes */}
                        <Route path="/userspace/:username/dashboard" element={<Dashboard />} />
                        <Route path="/userspace/:username/projects" element={<ProjectsList />} />
                        <Route path="/userspace/:username/skills" element={<SkillsManager />} />
                        <Route path="/userspace/:username/profile" element={<ProfileView />} />
                        <Route path="*" element={
                          <div className="text-center py-12">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page Not Found</h1>
                            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                              Go to Home
                            </Link>
                          </div>
                        } />
                      </Routes>
                    </main>
                    <ConditionalFooter />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
};

export default App;