import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Project from '../models/Project';

/**
 * @file Comments controller for handling comment-related operations
 * @module controllers/commentsController
 * @description Controller for managing project comments and feedback system.
 * Supports nested comments (replies), ratings, and visibility controls.
 */

/**
 * Extended Request interface to include authenticated user data
 * @interface AuthRequest
 * @extends {Request}
 * @property {any} [user] - Authenticated user object from middleware
 */
interface AuthRequest extends Request {
  user?: any;
}

/**
 * @async
 * @function getProjectComments
 * @description Get paginated comments for a specific project with nested replies
 * @param {Request} req - Express request object with project ID parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.projectId - The project ID to get comments for
 * @queryParam {number} [page=1] - Page number for pagination
 * @queryParam {number} [limit=10] - Number of comments per page
 * @example
 * GET /api/comments/project/60f7b3b3b3b3b3b3b3b3b3?page=1&limit=5
 */
export const getProjectComments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Fetch top-level comments (not replies)
    const comments = await Comment.find({ 
      projectId, 
      isPublic: true,
      parentCommentId: { $exists: false }
    })
    .populate('userId', 'username')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

    // Get replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentCommentId: comment._id })
          .populate('userId', 'username')
          .sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies,
          replyCount: replies.length
        };
      })
    );

    // Get total count for pagination
    const total = await Comment.countDocuments({ 
      projectId, 
      isPublic: true,
      parentCommentId: { $exists: false }
    });

    // Calculate average rating
    const ratingStats = await Comment.aggregate([
      { 
        $match: { 
          projectId: project._id, 
          isPublic: true, 
          rating: { $exists: true } 
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        },
        stats: {
          totalComments: total,
          averageRating: ratingStats[0]?.averageRating || null,
          totalRatings: ratingStats[0]?.totalRatings || 0
        }
      }
    });
  } catch (error: any) {
    console.error('Get project comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @async
 * @function createComment
 * @description Create a new comment or reply for a project
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.projectId - The project ID to comment on
 * @body {string} content - The comment text content
 * @body {number} [rating] - Optional rating (1-5)
 * @body {string} [parentCommentId] - Parent comment ID for replies
 * @example
 * POST /api/comments/project/60f7b3b3b3b3b3b3b3b3b3b3
 * Body: { "content": "Great project!", "rating": 5 }
 */
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { content, rating, parentCommentId } = req.body;
    const userId = req.user.id;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // If replying to a comment, verify parent exists and is not already a reply
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      
      // Prevent nested replies (only 1 level deep)
      if (parentComment.parentCommentId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reply to a reply. Please reply to the original comment.'
        });
      }
    }

    // Create the comment
    const comment = new Comment({
      projectId,
      userId,
      content: content.trim(),
      rating: rating || undefined,
      parentCommentId: parentCommentId || undefined
    });

    await comment.save();
    await comment.populate('userId', 'username');

    res.status(201).json({
      success: true,
      data: comment,
      message: parentCommentId ? 'Reply created successfully' : 'Comment created successfully'
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @async
 * @function updateComment
 * @description Update an existing comment (only by author or admin)
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.commentId - The comment ID to update
 * @body {string} [content] - Updated comment content
 * @body {number} [rating] - Updated rating
 * @body {boolean} [isPublic] - Visibility status (admin only)
 * @example
 * PUT /api/comments/60f7b3b3b3b3b3b3b3b3b3b3
 * Body: { "content": "Updated comment text", "rating": 4 }
 */
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content, rating, isPublic } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions - only comment author or admin can update
    if (comment.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Update allowed fields
    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty'
        });
      }
      comment.content = content.trim();
    }
    
    if (rating !== undefined) comment.rating = rating;
    
    // Only admin can change visibility
    if (isPublic !== undefined && userRole === 'admin') {
      comment.isPublic = isPublic;
    }

    await comment.save();
    await comment.populate('userId', 'username');

    res.json({
      success: true,
      data: comment,
      message: 'Comment updated successfully'
    });
  } catch (error: any) {
    console.error('Update comment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @async
 * @function deleteComment
 * @description Delete a comment and all its replies (only by author or admin)
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.commentId - The comment ID to delete
 * @example
 * DELETE /api/comments/60f7b3b3b3b3b3b3b3b3b3b3
 */
/**
 * @async
 * @function getRecentComments
 * @description Get the most recent public comments across all projects
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @example
 * GET /api/comments/recent
 */
export const getRecentComments = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await Comment.find({ isPublic: true })
      .populate('userId', 'username')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error: any) {
    console.error('Get recent comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @async
 * @function deleteComment
 * @description Delete a comment and all its replies (only by author or admin)
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.commentId - The comment ID to delete
 * @example
 * DELETE /api/comments/60f7b3b3b3b3b3b3b3b3b3b3
 */
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions - only comment author or admin can delete
    if (comment.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Count replies that will be deleted
    const replyCount = await Comment.countDocuments({ parentCommentId: commentId });

    // Delete comment and all its replies
    const deleteResult = await Comment.deleteMany({ 
      $or: [
        { _id: commentId },
        { parentCommentId: commentId }
      ]
    });

    res.json({
      success: true,
      message: `Comment deleted successfully${replyCount > 0 ? ` along with ${replyCount} replies` : ''}`,
      data: {
        deletedCount: deleteResult.deletedCount
      }
    });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};