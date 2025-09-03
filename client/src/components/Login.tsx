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
    <div className="min-h-screen flex items-end justify-center lightmode dark:bg-transparent opacity-70 dark:opacity-90 pb-12">
      <div className="max-w-md w-full space-y-2">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold gradient-text">
            DevHub Login
          </h2>
          <p className="mt-2 text-center text-sm lightmode-text-secondary dark:darkmode-text-secondary">
            Demo credentials are pre-filled
          </p>
        </div>
        
        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="text-danger text-sm text-center">
              {error}
            </div>
          )}
          
          {isRateLimit && (
            <div className="text-danger text-xs text-center font-medium lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary border border-danger rounded-md p-2 mt-2">
              ⚠️ Rate limit hit - The logins are right there, Mr. Haxxor! (,,⩌'︿'⩌,,)
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="text-sm w-7/8 hover:w-full px-4 py-2 lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary gradient-border gradient-SignIn  focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all duration-600 flex items-center justify-center border-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        {/* Registration Link */}
        <div className="text-center">
          <button
            onClick={handleRegistrationClick}
            className={`text-sm ${
              registrationClicked 
                ? "text-danger cursor-default" 
                : "text-primary hover:text-primary-highlight"
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
          <div className="text-center text-sm">
            <span className="lightmode-text-secondary dark:darkmode-text-secondary">
              Try these demo accounts
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-1 gap-2">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => handleDemoUserSelect(user.email)}
                className="text-sm w-full text-left px-3 py-2 text-xs border lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary  rounded-md hover:lightmode-highlight lightmode-text-primary dark:hover:darkmode-highlight dark:darkmode-text-primary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <br />
                    <span className="lightmode-text-secondary dark:darkmode-text-secondary">{user.email}</span>
                  </div>
                  <span className="text-xs text-info font-mono">@{user.username}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-center text-xs lightmode-text-secondary dark:darkmode-text-secondary">
            <p>All demo accounts use password: <span className="font-mono text-sm lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary px-1 rounded">password123</span></p>
            <p className="mt-1">Click any user above to auto-fill login credentials!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;