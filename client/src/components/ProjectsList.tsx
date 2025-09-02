import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlusIcon, EyeIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import ProjectModal from './ProjectModal';
import ProjectEditModal from './ProjectEditModal';
import ProjectCreateModal from './ProjectCreateModal';
import { useAuth } from '../contexts/AuthContext';

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

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const ProjectsList: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if the current user is viewing their own projects
  const isOwnProjects = currentUser?.username === username;

  useEffect(() => {
    fetchProjects();
  }, [username]);

  const fetchProjects = async () => {
    try {
      if (!username) {
        console.error('Username not provided');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/user/${username}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleEditProject = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    // Update the project in the list
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p._id === updatedProject._id ? updatedProject : p
      )
    );
    // Update the selected project if it's currently open
    setSelectedProject(updatedProject);
  };

  const handleProjectCreate = (newProject: Project) => {
    // Add the new project to the list
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 gradient-border-to-r from-cyan-500 to-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl  bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            <span className="lightmode-text-primary dark:darkmode-text-primary">{isOwnProjects ? 'My Projects' : 'Projects'}</span>
          </h1>
          {isOwnProjects && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex lightmode dark:darkmode btn-primary items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
              text-primary hover:text-primary-highlight"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Project</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="lightmode dark:darkmode text-primary rounded-lg shadow-lg transition-all ease-in-out duration-300 
              hover:shadow-xl cursor-pointer transform  border overflow-hidden group  hover:scale-105"
              onClick={() => handleProjectClick(project)}
            >
              {/* Project Image */}
              {project.imageUrl && (
                <div className="relative overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110"
                  />
                  <div className="absolute inset-0"></div>
                  {project.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="ml-2 px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap flex items-center">
                        <StarIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>Featured</span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 style={{ fontFamily: 'Orbitron, sans-serif' }} className="text-xl">
                    {project.title}
                  </h3>
                  {!project.imageUrl && project.featured && (
                    <span className="ml-2 px-2 py-1 badge bg-primary">
                      <StarIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <p className="lightmode-text-secondary dark:darkmode-text-secondary mb-4 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
                
                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="badge-mode"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="badge-mode">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>

                {/* Project Stats */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'badge bg-emerald-600' :
                    project.status === 'in-progress' ? 'badge bg-yellow-600' :
                    project.status === 'planning' ? 'badge bg-blue-600' :
                    'badge bg-gray-600'
                  }`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{project.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span>{project.likes}</span>
                    </span>
                  </div>
                </div>

                {/* Project Links */}
                <div className="flex flex-wrap gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-highlight text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub →
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-highlight text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Live Demo →
                    </a>
                  )}
                </div>
              </div>

              {/* Hover Gradient Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:gradient-border-to-r group-hover:from-cyan-500 group-hover:to-purple-500 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="mx-auto w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <PlusIcon className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-2xl  mb-4">No projects yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
              Start building your portfolio by creating your first project. Showcase your skills and creativity!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Your First Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Project View Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={closeModals}
          onEdit={handleEditProject}
          currentUserId={currentUser?.id || ''}
          onProjectUpdate={handleProjectUpdate}
        />
      )}

      {/* Project Edit Modal */}
      {selectedProject && (
        <ProjectEditModal
          project={selectedProject}
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onProjectUpdate={handleProjectUpdate}
        />
      )}

      {/* Project Create Modal */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreate={handleProjectCreate}
      />
    </>
  );
};

export default ProjectsList;