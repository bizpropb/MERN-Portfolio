import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  refreshToken, 
  checkEmail 
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../utils/validation';
import { authSchemas } from '../utils/validation';

/**
 * @file Authentication routes for user registration, login, and session management
 * @module routes/auth
 * @description Defines the API routes for user authentication and session management.
 * Includes rate limiting, request validation, and protected routes.
 */

// Initialize Express Router
const router = express.Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 attempts per minute
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration (generous for demo/development)
const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 attempts per hour (much more generous)
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 *     description: Create a new user account with email, password, and basic profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "SecurePass123!"
 *             firstName: "John"
 *             lastName: "Doe"
 *             bio: "Full-stack developer passionate about modern web technologies"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               data:
 *                 user:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   email: "john.doe@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   role: "user"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Email already registered"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', 
  registerRateLimit,
  validate(authSchemas.register), 
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email and password, returns access token and sets refresh token in HTTP-only cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   email: "john.doe@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   role: "user"
 *                   lastLogin: "2024-01-15T10:30:00.000Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Invalid email or password"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', 
  authRateLimit,
  validate(authSchemas.login), 
  login
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get a new access token using the refresh token stored in HTTP-only cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Token refreshed successfully"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/refresh-token', 
  authRateLimit,
  refreshToken
);

/**
 * @swagger
 * /api/auth/check-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Check email availability
 *     description: Check if an email address is already registered in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to check
 *           example:
 *             email: "test@example.com"
 *     responses:
 *       200:
 *         description: Email availability check completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Email is available"
 *               data:
 *                 available: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/check-email', 
  authRateLimit,
  checkEmail
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout the current user and clear authentication cookies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Logout successful"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     description: Retrieve the profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "User profile retrieved successfully"
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
 */
router.get('/me', protect, getMe);

// Export the configured router
export default router;