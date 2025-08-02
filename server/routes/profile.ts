import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount,
  getDashboardData
} from '../controllers/profileController';
import { protect } from '../middleware/auth';
import { validate } from '../utils/validation';
import { profileSchemas } from '../utils/validation';

/**
 * @file Profile routes for user profile management
 * @module routes/profile
 * @description Defines the API routes for user profile operations.
 * Includes routes for getting/updating profile, changing password, and account deletion.
 * All routes are protected and require authentication.
 */

// Initialize Express Router
const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(protect);

// Rate limiting for sensitive operations like password changes and account deletion
const sensitiveOperationsLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many sensitive operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/profile/dashboard:
 *   get:
 *     tags: [Profile]
 *     summary: Get user dashboard data
 *     description: Retrieve dashboard statistics and recent activity for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Dashboard data retrieved successfully"
 *               data:
 *                 stats:
 *                   totalProjects: 12
 *                   totalSkills: 25
 *                   profileViews: 156
 *                   projectLikes: 89
 *                 recentActivity:
 *                   - type: "project_created"
 *                     title: "New React App"
 *                     date: "2024-01-15T10:30:00.000Z"
 *                   - type: "skill_added"
 *                     title: "TypeScript"
 *                     date: "2024-01-14T14:20:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/dashboard', getDashboardData);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user profile
 *     description: Retrieve the complete profile information of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Profile retrieved successfully"
 *               data:
 *                 user:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   email: "john.doe@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   bio: "Full-stack developer passionate about modern web technologies"
 *                   avatar: "https://example.com/avatar.jpg"
 *                   role: "user"
 *                   isVerified: true
 *                   lastLogin: "2024-01-15T10:30:00.000Z"
 *                   createdAt: "2024-01-10T08:00:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 description: User's last name
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: User's biography
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's avatar image
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             bio: "Senior Full-stack Developer with 5+ years experience"
 *             avatar: "https://example.com/new-avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Profile updated successfully"
 *               data:
 *                 user:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   email: "john.doe@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   bio: "Senior Full-stack Developer with 5+ years experience"
 *                   avatar: "https://example.com/new-avatar.jpg"
 *                   updatedAt: "2024-01-15T11:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags: [Profile]
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account and all associated data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Account deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.route('/')
  .get(getProfile)
  .put(validate(profileSchemas.update), updateProfile)
  .delete(sensitiveOperationsLimit, deleteAccount);

/**
 * @swagger
 * /api/profile/password:
 *   put:
 *     tags: [Profile]
 *     summary: Change user password
 *     description: Change the authenticated user's password with current password verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: New password (minimum 8 characters)
 *               confirmNewPassword:
 *                 type: string
 *                 description: Confirmation of new password (must match newPassword)
 *           example:
 *             currentPassword: "OldSecurePass123!"
 *             newPassword: "NewSecurePass456!"
 *             confirmNewPassword: "NewSecurePass456!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Password changed successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Current password is incorrect"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.put('/password', 
  sensitiveOperationsLimit,
  validate(profileSchemas.changePassword), 
  changePassword
);

// Export the configured router
export default router;