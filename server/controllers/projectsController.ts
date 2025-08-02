import { Request, Response } from 'express';
import Project, { IProject } from '../models/Project';
import mongoose from 'mongoose';

/**
 * @file Projects controller for handling project-related operations
 * @module controllers/projectsController
 */

/**
 * @async
 * @function getProjects
 * @description Get a paginated list of projects with filtering and statistics
 * @param {Request} req - Express request object with query parameters
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @queryParam {string} [status] - Filter by project status
 * @queryParam {string} [priority] - Filter by project priority
 * @queryParam {boolean} [featured] - Filter featured projects
 * @queryParam {string} [technology] - Filter by technology
 * @queryParam {number} [page=1] - Page number for pagination
 * @queryParam {number} [limit=10] - Number of items per page
 * @queryParam {string} [sort=-createdAt] - Sort field and direction
 */
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const {
      status,
      priority,
      featured,
      technology,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Initialize filter with authenticated user
    const filter: any = { userId: req.user._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (technology) filter.technologies = { $in: [new RegExp(technology as string, 'i')] };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Fetch paginated projects with sorting and population
    const projects = await Project.find(filter)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'firstName lastName email');

    const total = await Project.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    const stats = await Project.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          planning: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          current: pageNum,
          pages: totalPages,
          total,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        stats: stats[0] || {
          total: 0,
          completed: 0,
          inProgress: 0,
          planning: 0,
          archived: 0,
          totalViews: 0,
          totalLikes: 0
        }
      }
    });

  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects'
    });
  }
};

/**
 * @async
 * @function getProject
 * @description Get a single project by ID and increment view count
 * @param {Request} req - Express request object with project ID parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The project ID
 */
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const project = await Project.findOne({
      _id: id,
      userId: req.user._id
    }).populate('userId', 'firstName lastName email');

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    project.views += 1;
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        project
      }
    });

  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project'
    });
  }
};

/**
 * @async
 * @function createProject
 * @description Create a new project
 * @param {Request} req - Express request object with project data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @body {IProject} - Project data to create
 */
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const projectData = {
      ...req.body,
      userId: req.user._id
    };

    const project = await Project.create(projectData);
    
    await project.populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project
      }
    });

  } catch (error: any) {
    console.error('Create project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating project'
    });
  }
};

/**
 * @async
 * @function updateProject
 * @description Update an existing project
 * @param {Request} req - Express request object with project ID and update data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The project ID to update
 * @body {Partial<IProject>} - Project fields to update
 */
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('userId', 'firstName lastName email');

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project
      }
    });

  } catch (error: any) {
    console.error('Update project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
};

/**
 * @async
 * @function deleteProject
 * @description Delete a project by ID
 * @param {Request} req - Express request object with project ID
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The project ID to delete
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const project = await Project.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
};

/**
 * @async
 * @function toggleProjectLike
 * @description Toggle like status for a project
 * @param {Request} req - Express request object with project ID
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The project ID to like/unlike
 */
export const toggleProjectLike = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const project = await Project.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    project.likes += 1;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project liked successfully',
      data: {
        likes: project.likes
      }
    });

  } catch (error: any) {
    console.error('Toggle project like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project likes'
    });
  }
};

/**
 * @async
 * @function getProjectAnalytics
 * @description Get analytics data for projects
 * @param {Request} req - Express request object with query parameters
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @queryParam {string} [timeframe='month'] - Timeframe for analytics (day, week, month, year)
 */
export const getProjectAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const analytics = await Project.aggregate([
      { $match: { userId: req.user._id } },
      {
        $facet: {
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                averageLikes: { $avg: '$likes' },
                averageViews: { $avg: '$views' }
              }
            }
          ],
          technologyPopularity: [
            { $unwind: '$technologies' },
            {
              $group: {
                _id: '$technologies',
                count: { $sum: 1 },
                projects: { $push: '$title' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          monthlyActivity: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                projectsCreated: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalLikes: { $sum: '$likes' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ],
          priorityDistribution: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        analytics: analytics[0]
      }
    });

  } catch (error: any) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project analytics'
    });
  }
};