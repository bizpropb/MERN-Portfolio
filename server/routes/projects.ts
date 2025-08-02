import express from 'express';
import { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject,
  toggleProjectLike,
  getProjectAnalytics
} from '../controllers/projectsController';
import { protect } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import { projectSchemas } from '../utils/validation';

/**
 * @file Project management routes for portfolio
 * @module routes/projects
 * @description Defines the API routes for managing portfolio projects.
 * Includes CRUD operations, like functionality, and project analytics.
 * All routes are protected by authentication middleware.
 */

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @swagger
 * /api/projects/analytics:
 *   get:
 *     tags: [Projects]
 *     summary: Get project analytics
 *     description: Retrieve analytics data for the user's projects including views, likes, and trends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Analytics data retrieved successfully"
 *               data:
 *                 summary:
 *                   totalProjects: 12
 *                   totalViews: 1523
 *                   totalLikes: 89
 *                   avgLikesPerProject: 7.4
 *                 topProjects:
 *                   - projectId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     title: "E-commerce Platform"
 *                     views: 245
 *                     likes: 23
 *                 trends:
 *                   viewsLastMonth: 412
 *                   likesLastMonth: 34
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/analytics', getProjectAnalytics);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects
 *     description: Retrieve all projects for the authenticated user with optional filtering and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, priority, status]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for project title or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, in-progress, completed, archived]
 *         description: Filter by project status
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter for featured projects only
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Projects retrieved successfully"
 *               data:
 *                 projects:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     title: "E-commerce Platform"
 *                     description: "Full-stack e-commerce solution with React and Node.js"
 *                     technologies: ["React", "Node.js", "MongoDB", "Stripe"]
 *                     status: "completed"
 *                     featured: true
 *                     likes: 23
 *                     views: 245
 *                 total: 12
 *                 page: 1
 *                 totalPages: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags: [Projects]
 *     summary: Create new project
 *     description: Create a new project in the user's portfolio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *           example:
 *             title: "Task Management App"
 *             description: "A comprehensive task management application built with MERN stack"
 *             technologies: ["React", "Node.js", "Express", "MongoDB", "TypeScript"]
 *             githubUrl: "https://github.com/user/task-manager"
 *             liveUrl: "https://task-manager-demo.com"
 *             status: "in-progress"
 *             priority: "high"
 *             startDate: "2024-01-15"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Project created successfully"
 *               data:
 *                 project:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                   title: "Task Management App"
 *                   description: "A comprehensive task management application built with MERN stack"
 *                   technologies: ["React", "Node.js", "Express", "MongoDB", "TypeScript"]
 *                   status: "in-progress"
 *                   priority: "high"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/')
  .get(validateQuery(projectSchemas.query), getProjects)
  .post(validate(projectSchemas.create), createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
 *     description: Retrieve a specific project by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Project retrieved successfully"
 *               data:
 *                 project:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   title: "E-commerce Platform"
 *                   description: "Full-stack e-commerce solution with React and Node.js"
 *                   technologies: ["React", "Node.js", "MongoDB", "Stripe"]
 *                   githubUrl: "https://github.com/user/ecommerce"
 *                   liveUrl: "https://ecommerce-demo.com"
 *                   status: "completed"
 *                   priority: "high"
 *                   featured: true
 *                   likes: 23
 *                   views: 245
 *                   createdAt: "2024-01-10T08:00:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags: [Projects]
 *     summary: Update project
 *     description: Update an existing project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               githubUrl:
 *                 type: string
 *                 format: uri
 *               liveUrl:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [planning, in-progress, completed, archived]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               featured:
 *                 type: boolean
 *           example:
 *             title: "Updated E-commerce Platform"
 *             description: "Enhanced e-commerce solution with new features"
 *             status: "completed"
 *             featured: true
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project
 *     description: Delete a project from the portfolio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Project deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/:id')
  .get(getProject)
  .put(validate(projectSchemas.update), updateProject)
  .delete(deleteProject);

/**
 * @swagger
 * /api/projects/{id}/like:
 *   post:
 *     tags: [Projects]
 *     summary: Toggle project like
 *     description: Like or unlike a project (toggles the like status)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to like/unlike
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Project liked successfully"
 *               data:
 *                 liked: true
 *                 totalLikes: 24
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/like', toggleProjectLike);

export default router;