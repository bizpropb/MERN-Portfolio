import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserIcon, PencilIcon, KeyIcon, TrashIcon, EyeIcon, HeartIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import ProfileEditModal from './ProfileEditModal';
import ProfileChangePasswordModal from './ProfileChangePasswordModal';
import ProjectModal from './ProjectModal';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileStats {
  projects: {
    totalProjects: number;
    completedProjects: number;
    totalViews: number;
    totalLikes: number;
    featuredProjects: number;
  };
  skills: {
    totalSkills: number;
    averageProficiency: number;
    expertSkills: number;
    totalEndorsements: number;
  };
}

interface RecentProject {
  _id: string;
  title: string;
  status: string;
  updatedAt: string;
}

const ProfileView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    avatar: '',
    location: {
      latitude: '',
      longitude: '',
      city: '',
      country: ''
    }
  });
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<RecentProject | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      if (!username) {
        console.error('Username not provided');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/user/${username}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setStats(data.data.stats);
        setRecentProjects(data.data.recentActivity?.projects || []);
        setEditData({
          username: data.data.user.username,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          bio: data.data.user.bio || '',
          avatar: data.data.user.avatar || '',
          location: {
            latitude: data.data.user.location?.latitude?.toString() || '',
            longitude: data.data.user.location?.longitude?.toString() || '',
            city: data.data.user.location?.city || '',
            country: data.data.user.location?.country || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Prepare the update data
      const updateData: any = {
        username: editData.username,
        firstName: editData.firstName,
        lastName: editData.lastName,
        bio: editData.bio,
        avatar: editData.avatar
      };

      // Handle location data
      if (editData.location && editData.location.latitude && editData.location.longitude) {
        // User has valid location data - convert strings to numbers
        const lat = parseFloat(editData.location.latitude);
        const lng = parseFloat(editData.location.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          updateData.location = {
            latitude: lat,
            longitude: lng,
            city: editData.location.city || '',
            country: editData.location.country || ''
          };
        }
      } else if (editData.location && editData.location.latitude === '' && editData.location.longitude === '') {
        // User wants to clear location - send empty object instead of null
        updateData.location = {};
      }
      // If location is undefined/null, don't include it (no change)
      
      const response = await fetch('http://localhost:5001/api/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.data.user);
        setEditMode(false);
      } else {
        alert('Error updating profile: ' + result.message);
      }
    } catch (error) {
      alert('Network error updating profile');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5001/api/dashboard/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPasswordMode(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        alert('Password changed successfully!');
      } else {
        alert('Error changing password: ' + result.message);
      }
    } catch (error) {
      alert('Network error changing password');
      console.error('Password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge bg-emerald-600';
      case 'in-progress': return 'badge bg-yellow-600';
      case 'planning': return 'badge bg-blue-600';
      case 'archived': return 'badge bg-gray-600';
      default: return 'badge bg-gray-600';
    }
  };

  const handleProjectClick = (project: RecentProject) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="lightmode-text-secondary dark:darkmode-text-secondary">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 flex-shrink-0">
            <UserAvatar user={user} size="xl" />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl  lightmode-text-primary dark:darkmode-text-primary !text-primary">
                {user.firstName} {user.lastName}
              </h1>
              {user.isVerified && (
                <span className="px-2 py-1 badge bg-emerald-600">
                  Verified
                </span>
              )}
              {user.role === 'admin' && (
                <span className="px-2 py-1 badge bg-indigo-600">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-2">{user.email}</p>
            {user.bio && (
              <p className="lightmode-text-secondary dark:darkmode-text-secondary mb-3">{user.bio}</p>
            )}
            {user.location && (
              <div className="flex items-center space-x-2 mb-3">
                <MapPinIcon className="w-4 h-4 lightmode-text-secondary dark:darkmode-text-secondary" />
                <span className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
                  {user.location.city}{user.location.country ? `, ${user.location.country}` : ''}
                </span>
              </div>
            )}
            <div className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
              <p>Member since {formatDate(user.createdAt)}</p>
              {user.lastLogin && (
                <p>Last login: {formatDate(user.lastLogin)}</p>
              )}
            </div>
          </div>

          {/* Action Buttons - Only show for own profile */}
          {isOwnProfile && (
            <div className="flex flex-col space-y-3 mx-1">
              <button
                onClick={() => setEditMode(true)}
                className="btn-primary text-xs flex items-center space-x-2 px-4 py-2 shadow-lg "
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setPasswordMode(true)}
                className="btn-primary text-xs flex items-center space-x-2 px-4 py-2 shadow-lg "
              >
                <KeyIcon className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              <button
                onClick={() => setPasswordMode(true)}
                className="btn-primary text-xs flex items-center space-x-2 px-4 py-2 shadow-lg "
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>Change Email</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="shadow-lg p-3 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded-lg">
                <UserIcon className="w-6 h-6 lightmode-text-secondary dark:darkmode-text-secondary" />
              </div>
              <div>
                <p className="text-2xl ">{stats.projects.totalProjects}</p>
                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">Projects</p>
              </div>
            </div>
          </div>

          <div className="lightmode dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="shadow-lg p-3 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded-lg">
                <EyeIcon className="w-6 h-6 lightmode-text-secondary dark:darkmode-text-secondary" />
              </div>
              <div>
                <p className="text-2xl ">{stats.projects.totalViews}</p>
                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">Views</p>
              </div>
            </div>
          </div>

          <div className="lightmode dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="shadow-lg p-3 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded-lg">
                <HeartIcon className="w-6 h-6 lightmode-text-secondary dark:darkmode-text-secondary" />
              </div>
              <div>
                <p className="text-2xl ">{stats.projects.totalLikes}</p>
                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">Likes</p>
              </div>
            </div>
          </div>

          <div className="lightmode dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="px-4 shadow-lg p-3 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded-lg">
                <span className="lightmode-text-secondary dark:darkmode-text-secondary  text-xl">★</span>
              </div>
              <div>
                <p className="text-2xl ">{stats.projects.featuredProjects}</p>
                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">Featured</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="lightmode dark:darkmode dark:darkmode-text-primary rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl  mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project._id} className="flex items-center justify-between p-3 lightmode-highlight dark:darkmode-highlight rounded-lg">
                <div>
                  <h3 
                    className="font-medium cursor-pointer text-primary hover:text-primary-highlight transition-colors duration-200"
                    onClick={() => handleProjectClick(project)}
                  >
                    {project.title}
                  </h3>
                  <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
                    Updated {formatDate(project.updatedAt)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal - Only for own profile */}
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={editMode}
          onClose={() => setEditMode(false)}
          editData={editData}
          setEditData={setEditData}
          onSubmit={handleUpdateProfile}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Change Password Modal - Only for own profile */}
      {isOwnProfile && (
        <ProfileChangePasswordModal
          isOpen={passwordMode}
          onClose={() => setPasswordMode(false)}
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          onSubmit={handleChangePassword}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          projectId={selectedProject._id}
          isOpen={projectModalOpen}
          onClose={() => {
            setProjectModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfileView;