import React from 'react';

interface UserAvatarProps {
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
    fullName?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = "", size = "md" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-sm';
    }
  };

  const displayName = user.fullName || `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className={`relative w-full h-full rounded-full overflow-hidden ${className}`}>
      {user.avatar ? (
        <>
          <img 
            src={user.avatar} 
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div 
            className={`w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center ${getSizeClasses()}`}
            style={{ display: 'none' }}
          >
            <span className="text-white font-bold">{initials}</span>
          </div>
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center ${getSizeClasses()}`}>
          <span className="text-white font-bold">{initials}</span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;