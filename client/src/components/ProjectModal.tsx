import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, PencilIcon, EyeIcon, HeartIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

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

interface Comment {
  _id: string;
  content: string;
  rating?: number;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
  };
  createdAt: string;
  replies: Comment[];
  replyCount: number;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(project?.likes || 0);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const isOwner = project?.userId._id === currentUserId;

  useEffect(() => {
    if (isOpen) {
      if (projectId && !project) {
        fetchProject();
      }
      if (project?._id) {
        fetchComments();
      }
    }
  }, [isOpen, project?._id, projectId]);

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

  const fetchComments = async () => {
    if (!project?._id) return;
    
    try {
      setLoadingComments(true);
      const response = await fetch(`http://localhost:5001/api/comments/project/${project._id}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/comments/project/${project._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment.trim(),
          rating: newRating
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        setNewRating(null);
        fetchComments();
      } else {
        alert('Error submitting comment: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Network error submitting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/comments/project/${project._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentCommentId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      } else {
        alert('Error submitting reply: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Network error submitting reply');
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
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold mb-6 lightmode-text-primary dark:darkmode-text-primary">
                Comments & Feedback
              </h3>
              
              {/* New Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-8 p-4 lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-2">
                    Your Comment
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this project..."
                    rows={3}
                    className="text-sm w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-2">
                    Rating <span className="text-primary">*</span>
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isLit = hoveredRating 
                        ? star <= hoveredRating 
                        : newRating && star <= newRating;
                      
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(newRating === star ? null : star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className={`w-8 h-8 text-2xl transition-colors ${
                            isLit ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim() || !newRating}
                  className="px-4 py-2 btn-primary-filled shadow-lg"
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="text-sm animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Submitting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </form>

              {/* Comments List */}
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm lightmode-text-primary dark:darkmode-text-primary text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment._id} className="border-l-4 border-primary pl-4">
                      <div className="lightmode dark:darkmode rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {comment.userId.username ? (
                              <Link
                                to={`/userspace/${comment.userId.username}/profile`}
                                className="font-medium text-primary hover:text-primary-highlight transition-colors duration-200"
                              >
                                {comment.userId.username}
                              </Link>
                            ) : (
                              <span className="font-medium">
                                {comment.userId.username}
                              </span>
                            )}
                            {comment.rating && (
                              <div className="flex text-yellow-400">
                                {'★'.repeat(comment.rating)}
                                {'☆'.repeat(5 - comment.rating)}
                              </div>
                            )}
                          </div>
                          <span className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-3">{comment.content}</p>
                        
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          className="text-xs text-primary hover:text-primary-highlight"
                        >
                          Reply
                        </button>

                        {/* Reply Form */}
                        {replyingTo === comment._id && (
                          <div className="mt-4 p-3 lightmode dark:darkmode rounded-lg">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write your reply..."
                              rows={2}
                              className="text-sm w-full px-3 py-2 border lightmode-text-secondary dark:darkmode-text-secondary dark:darkmode rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors mb-2"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSubmitReply(comment._id)}
                                disabled={!replyContent.trim()}
                                className="px-3 py-1 btn-primary-filled text-xs"
                              >
                                Post Reply
                              </button>
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="text-xs px-4 py-2 lightmode dark:darkmode text-lightmode-text-primary dark:darkmode-text-primary rounded-md hover:lightmode-highlight dark:hover:darkmode-highlight transition-colors"
                                >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 ml-4 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="lightmode dark:darkmode rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  {reply.userId.username ? (
                                    <Link
                                      to={`/userspace/${reply.userId.username}/profile`}
                                      className="font-medium text-sm text-primary hover:text-primary-highlight transition-colors duration-200"
                                    >
                                      {reply.userId.username}
                                    </Link>
                                  ) : (
                                    <span className="font-medium text-sm">
                                      {reply.userId.username}
                                    </span>
                                  )}
                                  <span className="text-xs lightmode-text-primary dark:darkmode-text-primary">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;