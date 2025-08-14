import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import Skill from '../models/Skill';

/**
 * @file Profile controller for handling user profile related operations
 * @module controllers/profileController
 */

/**
 * @async
 * @function getProfile
 * @description Get detailed profile information for the authenticated user
 * @param {Request} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Fetch project and skill statistics in parallel for better performance
    const [projectStats, skillStats] = await Promise.all([
      Project.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: '$likes' },
            featuredProjects: { $sum: { $cond: ['$featured', 1, 0] } }
          }
        }
      ]),
      
      Skill.aggregate([
        { $match: { userId: req.user._id, isActive: true } },
        {
          $group: {
            _id: null,
            totalSkills: { $sum: 1 },
            averageProficiency: { $avg: '$proficiencyLevel' },
            expertSkills: { $sum: { $cond: [{ $eq: ['$proficiencyLevel', 5] }, 1, 0] } },
            totalEndorsements: { $sum: '$endorsements' }
          }
        }
      ])
    ]);

    // Fetch recent projects for the activity feed
    const recentProjects = await Project.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt');

    // Fetch top skills based on proficiency and endorsements
    const topSkills = await Skill.find({ userId: req.user._id, isActive: true })
      .sort({ proficiencyLevel: -1, endorsements: -1 })
      .limit(10)
      .select('name category proficiencyLevel endorsements');

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        stats: {
          projects: projectStats[0] || {
            totalProjects: 0,
            completedProjects: 0,
            totalViews: 0,
            totalLikes: 0,
            featuredProjects: 0
          },
          skills: skillStats[0] || {
            totalSkills: 0,
            averageProficiency: 0,
            expertSkills: 0,
            totalEndorsements: 0
          }
        },
        recentActivity: {
          projects: recentProjects,
          skills: topSkills
        }
      }
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

/**
 * @async
 * @function updateProfile
 * @description Update user profile information
 * @param {Request} req - Express request object with updated profile data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const allowedUpdates = ['firstName', 'lastName', 'bio', 'avatar', 'location'];
    const updates: any = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
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
      message: 'Server error updating profile'
    });
  }
};

/**
 * @async
 * @function changePassword
 * @description Change user's password
 * @param {Request} req - Express request object with current and new password
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    
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
      message: 'Server error changing password'
    });
  }
};

/**
 * @async
 * @function deleteAccount
 * @description Delete user account and associated data
 * @param {Request} req - Express request object with password confirmation
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password required to delete account'
      });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
      return;
    }

    await Promise.all([
      Project.deleteMany({ userId: req.user._id }),
      Skill.deleteMany({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id)
    ]);

    res.clearCookie('token', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
};

/**
 * @async
 * @function getDashboardData
 * @description Get aggregated dashboard data including projects and skills statistics
 * @param {Request} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const [
      projectStats,
      skillStats,
      recentProjects,
      topSkills,
      activityData
    ] = await Promise.all([
      Project.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: '$likes' }
          }
        }
      ]),

      Skill.aggregate([
        { $match: { userId: req.user._id, isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            averageProficiency: { $avg: '$proficiencyLevel' }
          }
        }
      ]),

      Project.find({ userId: req.user._id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status updatedAt views likes'),

      Skill.find({ userId: req.user._id, isActive: true })
        .sort({ proficiencyLevel: -1, endorsements: -1 })
        .limit(8)
        .select('name category proficiencyLevel endorsements'),

      Project.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            projectsCreated: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    const dashboardData = {
      overview: {
        totalProjects: await Project.countDocuments({ userId: req.user._id }),
        totalSkills: await Skill.countDocuments({ userId: req.user._id, isActive: true }),
        totalViews: await Project.aggregate([
          { $match: { userId: req.user._id } },
          { $group: { _id: null, total: { $sum: '$views' } } }
        ]).then(result => result[0]?.total || 0),
        totalLikes: await Project.aggregate([
          { $match: { userId: req.user._id } },
          { $group: { _id: null, total: { $sum: '$likes' } } }
        ]).then(result => result[0]?.total || 0)
      },
      projectStats,
      skillStats,
      recentProjects,
      topSkills,
      activityData
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

/**
 * @async
 * @function getAllUsersForMap
 * @description Get all users with their locations for the map display
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllUsersForMap = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all users with locations, excluding sensitive data
    const users = await User.find(
      { 
        location: { $exists: true },
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true }
      },
      {
        firstName: 1,
        lastName: 1,
        location: 1,
        avatar: 1,
        bio: 1,
        createdAt: 1
      }
    ).limit(100); // Limit for performance

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          location: user.location,
          avatar: user.avatar,
          bio: user.bio,
          memberSince: user.createdAt
        }))
      }
    });

  } catch (error: any) {
    console.error('Get users for map error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user locations'
    });
  }
};