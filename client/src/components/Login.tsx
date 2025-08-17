import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('demo@devhub.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [registrationClicked, setRegistrationClicked] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsRateLimit(false);
  
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      const message = result.message || 'Invalid email or password';
      setError(message);
      
      // Check if it's a rate limit error
      if (message.toLowerCase().includes('too many')) {
        setIsRateLimit(true);
      }
    }
    
    setLoading(false);
  };

  // Demo user suggestions (from actual seed data)
  const demoUsers = [
    { email: 'demo@devhub.com', name: 'Daniel Demo', username: 'demo' },
    { email: 'sarah.dev@example.com', name: 'Sarah Developer', username: 'sarah_dev' },
    { email: 'mike.engineer@example.com', name: 'Mike Engineer', username: 'mike_engineer' }
  ];

  const handleDemoUserSelect = (email: string) => {
    setEmail(email);
    setPassword('password123');
    setError('');
    setIsRateLimit(false);
  };

  const handleRegistrationClick = () => {
    setRegistrationClicked(true);
  };

  return (
    <div className="min-h-screen flex items-end justify-center bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="max-w-md w-full space-y-2">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold gradient-text">
            DevHub LOGIN
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Demo credentials are pre-filled
          </p>
        </div>
        
        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          {isRateLimit && (
            <div className="text-red-600 dark:text-red-400 text-xs text-center font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2 mt-2">
              ⚠️ Rate limit hit - The logins are right there, Mr. Haxxor! (,,⩌'︿'⩌,,)
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        {/* Registration Link */}
        <div className="text-center">
          <button
            onClick={handleRegistrationClick}
            className={`text-sm font-medium transition-colors ${
              registrationClicked 
                ? "text-red-900 dark:text-red-400 cursor-default" 
                : "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
            }`}
          >
            {registrationClicked 
              ? "Registrations are disabled for this demo (｡•́︿•̀｡)"
              : "Don't have an account?"
            }
          </button>
        </div>
        
        {/* Demo Users Section */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Try these demo accounts
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-2">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => handleDemoUserSelect(user.email)}
                className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                    <br />
                    <span className="text-gray-500 dark:text-gray-400">{user.email}</span>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">@{user.username}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>All demo accounts use password: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">password123</span></p>
            <p className="mt-1">Click any user above to auto-fill login credentials!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;