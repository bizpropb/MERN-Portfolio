import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { IUser } from '../models/User';

/**
 * @file Role-based authorization middleware and rate limiting configurations
 * @module middleware/roleAuth
 * @description Provides role-based access control and API rate limiting for different operations.
 * Includes specialized rate limiters for authentication, uploads, and comment operations.
 */

/**
 * Extended Request interface to include authenticated user data
 * @interface AuthRequest
 * @extends {Request}
 * @property {IUser} [user] - Authenticated user object from JWT middleware
 */
interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * @function authorize
 * @description Role-based authorization middleware factory
 * Creates middleware that restricts access to specific user roles
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 * @example
 * // Only allow admin users
 * router.get('/admin-only', authorize('admin'), controller);
 * 
 * // Allow both user and admin roles
 * router.post('/user-content', authorize('user', 'admin'), controller);
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * @function checkOwnershipOrAdmin
 * @description Middleware to check if user owns a resource or has admin privileges
 * Passes through admin users and delegates ownership checks to individual controllers
 * @param {AuthRequest} req - Express request object with user data
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * router.put('/projects/:id', protect, checkOwnershipOrAdmin, updateProject);
 */
export const checkOwnershipOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin users can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // For other users, ownership will be checked in the controller
  // This allows for resource-specific ownership validation
  next();
};

/**
 * @const {rateLimit} apiLimiter
 * @description General API rate limiter for all endpoints
 * Prevents abuse and ensures fair usage across all users
 * @limits 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 100,
      windowMs: 15 * 60 * 1000
    });
  }
});

/**
 * @const {rateLimit} authLimiter
 * @description Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login and registration
 * @limits 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes',
      limit: 5,
      windowMs: 15 * 60 * 1000
    });
  }
});

/**
 * @const {rateLimit} uploadLimiter
 * @description Rate limiter for file upload endpoints
 * Prevents abuse of storage resources and bandwidth
 * @limits 20 requests per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 upload requests per hour
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many upload attempts, please try again later.',
      retryAfter: '1 hour',
      limit: 20,
      windowMs: 60 * 60 * 1000
    });
  }
});

/**
 * @const {rateLimit} commentLimiter
 * @description Rate limiter for comment creation endpoints
 * Prevents spam and encourages thoughtful commenting
 * @limits 10 requests per 10 minutes per IP
 */
export const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 comments per 10 minutes
  message: {
    success: false,
    message: 'Too many comments submitted, please slow down.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many comments submitted, please slow down.',
      retryAfter: '10 minutes',
      limit: 10,
      windowMs: 10 * 60 * 1000
    });
  }
});

/**
 * @const {Function} adminOnly
 * @description Middleware that allows only admin users
 * Shorthand for authorize('admin')
 * @example
 * router.delete('/users/:id', protect, adminOnly, deleteUser);
 */
export const adminOnly = authorize('admin');

/**
 * @const {Function} userOrAdmin
 * @description Middleware that allows user and admin roles
 * Shorthand for authorize('user', 'admin')
 * @example
 * router.post('/projects', protect, userOrAdmin, createProject);
 */
export const userOrAdmin = authorize('user', 'admin');

/**
 * @const {Function} authenticated
 * @description Middleware that allows any authenticated user regardless of role
 * Includes visitor, user, and admin roles
 * @example
 * router.get('/profile', protect, authenticated, getProfile);
 */
export const authenticated = authorize('visitor', 'user', 'admin');