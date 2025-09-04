import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, PencilIcon, EyeIcon, HeartIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import CommentsSection from './CommentsSection';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  featured: boolean;
  likes: number;
  views: number;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}


interface ProjectModalProps {
  project?: Project;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  currentUserId?: string;
  onProjectUpdate?: (updatedProject: Project) => void;
}

// Detailed project viewer modal with comments, likes, and editing capabilities
const ProjectModal: React.FC<ProjectModalProps> = ({
  project: initialProject,
  projectId,
  isOpen,
  onClose,
  onEdit,
  currentUserId,
  onProjectUpdate
}) => {
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(project?.likes || 0);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const isOwner = project?.userId._id === currentUserId;

  useEffect(() => {
    if (isOpen) {
      if (projectId && !project) {
        fetchProject();
      }
    }
  }, [isOpen, projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setIsLoadingProject(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/projects/public/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      if (data.success) {
        setProject(data.data.project);
        setLikesCount(data.data.project.likes);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoadingProject(false);
    }
  };


  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/projects/${project._id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLiked(!isLiked);
        setLikesCount(data.data.likes);
        onProjectUpdate({ ...project, likes: data.data.likes });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'px-2 py-1 badge bg-rose-600';
      case 'medium': return 'px-2 py-1 badge bg-yellow-600';
      case 'low': return 'px-2 py-1 badge bg-emerald-600';
      default: return 'px-2 py-1 badge bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  // Show loading state if project is being fetched
  if (isLoadingProject || !project) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-xl p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading project...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl  lightmode-text-primary dark:darkmode-text-primary">
              {project.title}
            </h2>
            {project.featured && (
              <span className="px-3 py-1 badge bg-primary ">★ Featured</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isOwner && (
              <button
                onClick={onEdit}
                className="p-2 text-primary hover:text-primary-highlight"
                title="Edit Project"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-primary hover:text-red-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Project Image */}
            {project.imageUrl && (
              <div className="mb-6">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Project Stats */}
            <div className="flex items-center justify-between mb-6 p-4 lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-5 h-5 lightmode-text-secondary dark:darkmode-text-secondary" />
                  <span className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">{project.views} views</span>
                </div>
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-5 h-5 lightmode-text-secondary dark:darkmode-text-secondary" />
                  ) : (
                    <HeartIcon className="w-5 h-5 lightmode-text-secondary dark:darkmode-text-secondary" />
                  )}
                  <span className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">{likesCount} likes</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} priority
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary leading-relaxed">{project.description}</p>
                
                {/* Links */}
                <div className="mt-4 space-y-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm inline-flex items-center text-primary hover:text-primary-highlight hover:underline"
                    >
                      View on GitHub →
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm block text-primary hover:text-primary-highlight hover:underline"
                    >
                      Live Demo →
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 badge-mode text-sm rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Dates */}
                {(project.startDate || project.endDate) && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Timeline</h3>
                    {project.startDate && (
                      <div className="text-sm flex items-center space-x-2 text-sm lightmode-text-secondary dark:darkmode-text-secondary">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Started: {formatDate(project.startDate)}</span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="text-sm flex items-center space-x-2 text-sm lightmode-text-secondary dark:darkmode-text-secondary">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Completed: {formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {project?._id && (
              <CommentsSection 
                projectId={project._id} 
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;