import express from 'express';
import {
  getProjectComments,
  createComment,
  updateComment,
  deleteComment,
  getRecentComments
} from '../controllers/commentsController';
import { protect } from '../middleware/auth';
import { userOrAdmin, commentLimiter } from '../middleware/roleAuth';

/**
 * @file Comments routes for project feedback and discussion system
 * @module routes/comments
 * @description Defines the API routes for project comments and replies.
 * Supports nested comments, ratings, and moderation features.
 */

// Initialize Express Router
const router = express.Router();

/**
 * @swagger
 * /api/comments/recent:
 *   get:
 *     tags: [Comments]
 *     summary: Get recent comments
 *     description: Retrieve the most recent public comments across all projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/recent', protect, getRecentComments);

/**
 * @swagger
 * /api/comments/project/{projectId}:
 *   get:
 *     tags: [Comments]
 *     summary: Get project comments
 *     description: Retrieve paginated comments for a specific project with nested replies
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID to get comments for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 comments:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     content: "Great project! Really impressive work."
 *                     rating: 5
 *                     userId:
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                     replies:
 *                       - _id: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                         content: "Thank you! Glad you like it."
 *                         userId:
 *                           firstName: "Jane"
 *                           lastName: "Smith"
 *                         createdAt: "2024-01-15T11:00:00.000Z"
 *                     replyCount: 1
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   pages: 3
 *                   hasNext: true
 *                   hasPrev: false
 *                 stats:
 *                   totalComments: 25
 *                   averageRating: 4.5
 *                   totalRatings: 15
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Project not found"
 *   post:
 *     tags: [Comments]
 *     summary: Create a new comment
 *     description: Create a new comment or reply for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: The comment text content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Optional rating for the project
 *               parentCommentId:
 *                 type: string
 *                 description: Parent comment ID for replies
 *           example:
 *             content: "This is an amazing project! The UI is very clean and intuitive."
 *             rating: 5
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Comment created successfully"
 *               data:
 *                 _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 content: "This is an amazing project!"
 *                 rating: 5
 *                 projectId: "60f7b3b3b3b3b3b3b3b3b3b2"
 *                 userId:
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project or parent comment not found
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */

// Public route - anyone can view comments
router.get('/project/:projectId', getProjectComments);

// Protected routes - require authentication
router.use(protect);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Update an existing comment (only by author or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Updated comment content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Updated rating
 *               isPublic:
 *                 type: boolean
 *                 description: Visibility status (admin only)
 *           example:
 *             content: "Updated comment with more details about the project."
 *             rating: 4
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Comment updated successfully"
 *               data:
 *                 _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 content: "Updated comment with more details."
 *                 rating: 4
 *                 updatedAt: "2024-01-15T11:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to update this comment
 *       404:
 *         description: Comment not found
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Delete a comment and all its replies (only by author or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Comment deleted successfully along with 2 replies"
 *               data:
 *                 deletedCount: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to delete this comment
 *       404:
 *         description: Comment not found
 */

// Create comment with rate limiting
router.post('/project/:projectId', commentLimiter, userOrAdmin, createComment);

// Update and delete comments
router.put('/:commentId', userOrAdmin, updateComment);
router.delete('/:commentId', userOrAdmin, deleteComment);

export default router;