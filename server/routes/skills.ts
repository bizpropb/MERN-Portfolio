import express from 'express';
import { 
  getSkills, 
  getSkill, 
  createSkill, 
  updateSkill, 
  deleteSkill,
  endorseSkill,
  getSkillsByCategory,
  getSkillAnalytics,
  getSkillsByUsername,
  getAvailableSkills
} from '../controllers/skillsController';
import { protect } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import { skillSchemas } from '../utils/validation';

/**
 * @file Skill management routes for portfolio
 * @module routes/skills
 * @description Defines the API routes for managing portfolio skills.
 * Includes CRUD operations, endorsement functionality, and skill analytics.
 * All routes are protected by authentication middleware.
 */

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @swagger
 * /api/skills/analytics:
 *   get:
 *     tags: [Skills]
 *     summary: Get skill analytics
 *     description: Retrieve analytics data for the user's skills including proficiency distribution and category breakdown
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
 *                   totalSkills: 25
 *                   averageProficiency: 3.8
 *                   totalEndorsements: 156
 *                 categoryBreakdown:
 *                   frontend: 8
 *                   backend: 7
 *                   database: 4
 *                   tools: 6
 *                 proficiencyDistribution:
 *                   "1": 2
 *                   "2": 3
 *                   "3": 8
 *                   "4": 7
 *                   "5": 5
 *                 topSkills:
 *                   - name: "JavaScript"
 *                     proficiency: 5
 *                     endorsements: 23
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/analytics', getSkillAnalytics);

/**
 * @swagger
 * /api/skills/available:
 *   get:
 *     tags: [Skills]
 *     summary: Get all available skills
 *     description: Retrieve all available skills from the skill database (seed data)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/available', getAvailableSkills);

/**
 * @swagger
 * /api/skills/category/{category}:
 *   get:
 *     tags: [Skills]
 *     summary: Get skills by category
 *     description: Retrieve all skills filtered by a specific category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [frontend, backend, database, tools, cloud, mobile, other]
 *         description: Category to filter skills by
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Skills retrieved successfully"
 *               data:
 *                 skills:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     name: "React"
 *                     category: "frontend"
 *                     proficiencyLevel: 5
 *                     yearsOfExperience: 3
 *                     endorsements: 15
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                     name: "Vue.js"
 *                     category: "frontend"
 *                     proficiencyLevel: 4
 *                     yearsOfExperience: 2
 *                     endorsements: 8
 *                 total: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/category/:category', getSkillsByCategory);

/**
 * @swagger
 * /api/skills:
 *   get:
 *     tags: [Skills]
 *     summary: Get all skills
 *     description: Retrieve all skills for the authenticated user with optional filtering and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [frontend, backend, database, tools, cloud, mobile, other]
 *         description: Filter by skill category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, proficiencyLevel, endorsements, createdAt]
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
 *         description: Search term for skill name
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Skills retrieved successfully"
 *               data:
 *                 skills:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     name: "JavaScript"
 *                     category: "frontend"
 *                     proficiencyLevel: 5
 *                     yearsOfExperience: 4
 *                     endorsements: 23
 *                     isActive: true
 *                 total: 25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags: [Skills]
 *     summary: Create new skill
 *     description: Add a new skill to the user's portfolio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skill'
 *           example:
 *             name: "TypeScript"
 *             category: "frontend"
 *             proficiencyLevel: 4
 *             yearsOfExperience: 2.5
 *             description: "Strongly typed programming language that builds on JavaScript"
 *             certifications: ["Microsoft TypeScript Certification"]
 *     responses:
 *       201:
 *         description: Skill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Skill created successfully"
 *               data:
 *                 skill:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b5"
 *                   name: "TypeScript"
 *                   category: "frontend"
 *                   proficiencyLevel: 4
 *                   yearsOfExperience: 2.5
 *                   endorsements: 0
 *                   isActive: true
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Skill already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Skill with this name already exists"
 */
router.route('/')
  .get(validateQuery(skillSchemas.query), getSkills)
  .post(validate(skillSchemas.create), createSkill);

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     tags: [Skills]
 *     summary: Get skill by ID
 *     description: Retrieve a specific skill by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Skill retrieved successfully"
 *               data:
 *                 skill:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   name: "JavaScript"
 *                   category: "frontend"
 *                   proficiencyLevel: 5
 *                   yearsOfExperience: 4
 *                   description: "Dynamic programming language for web development"
 *                   endorsements: 23
 *                   certifications: ["JavaScript Developer Certification"]
 *                   isActive: true
 *                   createdAt: "2024-01-10T08:00:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags: [Skills]
 *     summary: Update skill
 *     description: Update an existing skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               category:
 *                 type: string
 *                 enum: [frontend, backend, database, tools, cloud, mobile, other]
 *               proficiencyLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               yearsOfExperience:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               isActive:
 *                 type: boolean
 *           example:
 *             name: "Advanced JavaScript"
 *             proficiencyLevel: 5
 *             yearsOfExperience: 5
 *             description: "Expert-level JavaScript including ES6+ features"
 *     responses:
 *       200:
 *         description: Skill updated successfully
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
 *     tags: [Skills]
 *     summary: Delete skill
 *     description: Delete a skill from the portfolio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID to delete
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Skill deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/:id')
  .get(getSkill)
  .put(validate(skillSchemas.update), updateSkill)
  .delete(deleteSkill);

/**
 * @swagger
 * /api/skills/{id}/endorse:
 *   post:
 *     tags: [Skills]
 *     summary: Endorse skill
 *     description: Add an endorsement to a specific skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID to endorse
 *     responses:
 *       200:
 *         description: Skill endorsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Skill endorsed successfully"
 *               data:
 *                 skill:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   name: "JavaScript"
 *                   endorsements: 24
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/endorse', endorseSkill);

export default router;