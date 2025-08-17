// User routes - governs profile and dashboard features for user-related endpoints
// Provides API routes for profile management, dashboard data, user discovery, and account operations
import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount,
  getDashboardData,
  getDashboardDataByUsername,
  getProfileByUsername,
  getAllUsersForMap,
  getAllUsersForSearch,
  searchUsers
} from '../controllers/userController';
import { getSkillsByUsername } from '../controllers/skillsController';
import { getProjectsByUsername } from '../controllers/projectsController';
import { protect } from '../middleware/auth';
import { validate } from '../utils/validation';
import { profileSchemas } from '../utils/validation';

/**
 * @file User routes for user-related operations
 * @module routes/user
 * @description Defines the API routes for user operations including dashboard, profile, and user management.
 * Includes routes for getting/updating profile, changing password, account deletion, and user discovery.
 * All routes are protected and require authentication.
 */

// Initialize Express Router
const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(protect);

// Rate limiting for sensitive operations (generous for demo/development)
const sensitiveOperationsLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes (much more generous)
  message: {
    success: false,
    message: 'Too many sensitive operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/dashboard:
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
 * /api/dashboard/user/{username}/dashboard:
 *   get:
 *     tags: [Profile]
 *     summary: Get user dashboard data by username
 *     description: Retrieve dashboard statistics and recent activity for a specific user by username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.get('/:username/dashboard', getDashboardDataByUsername);

/**
 * @swagger
 * /api/user/{username}/skills:
 *   get:
 *     tags: [Skills]
 *     summary: Get user skills by username
 *     description: Retrieve skills for a specific user by username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.get('/:username/skills', getSkillsByUsername);

/**
 * @swagger
 * /api/user/{username}/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get user projects by username
 *     description: Retrieve projects for a specific user by username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.get('/:username/projects', getProjectsByUsername);

/**
 * @swagger
 * /api/user/{username}/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile by username
 *     description: Retrieve profile data for a specific user by username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.get('/:username/profile', getProfileByUsername);

/**
 * @swagger
 * /api/dashboard/map-users:
 *   get:
 *     tags: [Profile]
 *     summary: Get all users for map display
 *     description: Retrieve all users with their locations for displaying on the map
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users with locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     fullName: "John Doe"
 *                     location:
 *                       latitude: 47.3769
 *                       longitude: 8.5417
 *                       city: "Zurich"
 *                       country: "Switzerland"
 *                     avatar: "https://example.com/avatar.jpg"
 *                     bio: "Full-stack developer"
 *                     memberSince: "2024-01-10T08:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/map-users', getAllUsersForMap);

/**
 * @swagger
 * /api/dashboard/all-users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users for search
 *     description: Retrieve all users including those without locations for search functionality
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/all-users', getAllUsersForSearch);

/**
 * @swagger
 * /api/dashboard/search-users:
 *   get:
 *     tags: [Profile]
 *     summary: Search users for map browser
 *     description: Search users by username, name, or location for the map browser feature
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (username, first name, last name, city, or country)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     fullName: "John Doe"
 *                     username: "johndoe"
 *                     location:
 *                       latitude: 47.3769
 *                       longitude: 8.5417
 *                       city: "Zurich"
 *                       country: "Switzerland"
 *                     avatar: "https://example.com/avatar.jpg"
 *                     bio: "Full-stack developer..."
 *                     memberSince: "2024-01-10T08:00:00.000Z"
 *                 query: "john"
 *                 count: 1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search-users', searchUsers);

/**
 * @swagger
 * /api/dashboard:
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
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                     description: Latitude coordinate
 *                   longitude:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *                     description: Longitude coordinate
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                     description: City name
 *                   country:
 *                     type: string
 *                     maxLength: 100
 *                     description: Country name
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             bio: "Senior Full-stack Developer with 5+ years experience"
 *             avatar: "https://example.com/new-avatar.jpg"
 *             location:
 *               latitude: 47.3769
 *               longitude: 8.5417
 *               city: "Zurich"
 *               country: "Switzerland"
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
 *                   location:
 *                     latitude: 47.3769
 *                     longitude: 8.5417
 *                     city: "Zurich"
 *                     country: "Switzerland"
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
 * /api/dashboard/password:
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