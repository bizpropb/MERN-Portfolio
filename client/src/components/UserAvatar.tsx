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

// Displays user avatar image or initials fallback with multiple size options
const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = "", size = "md" }) => {
  // Returns appropriate CSS classes based on avatar size setting
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
            className={`w-full h-full border-2 border-primary text-primary rounded-full flex items-center justify-center ${getSizeClasses()}`}
            style={{ display: 'none' }}
          >
            <span className="">{initials}</span>
          </div>
        </>
      ) : (
        <div className={`w-full h-full border-2 border-primary text-primary rounded-full flex items-center justify-center ${getSizeClasses()}`}>
          <span className="">{initials}</span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;