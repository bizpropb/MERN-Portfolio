/**
 * @file Authentication middleware and JWT utilities
 * @module middleware/auth
 * @description Provides authentication middleware functions and JWT utilities
 * for securing routes and managing user sessions.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

/**
 * Extends the Express Request type to include the authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;  // Authenticated user will be attached here
    }
  }
}

/**
 * Interface for JWT payload structure
 */
interface IJWTPayload {
  userId: string;    // User ID from the database
  email: string;     // User's email address
  iat?: number;      // Issued at timestamp
  exp?: number;      // Expiration timestamp
}

/**
 * Generates a JWT access token for the specified user
 * @param {IUser} user - The user object to generate token for
 * @returns {string} JWT access token
 * @throws {Error} If JWT_SECRET is not configured
 */
export const generateToken = (user: IUser): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(
    { 
      userId: user._id.toString(), 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d',
      issuer: 'devhub-api',
      audience: 'devhub-client',
      algorithm: 'HS256'
    } as jwt.SignOptions
  );
};

/**
 * Generates a refresh token for the specified user
 * @param {IUser} user - The user object to generate refresh token for
 * @returns {string} JWT refresh token
 * @throws {Error} If JWT_SECRET is not configured
 */
export const generateRefreshToken = (user: IUser): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(
    { 
      userId: user._id.toString(), 
      email: user.email,
      type: 'refresh'  // Token type for refresh tokens
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '90d',  // Refresh tokens last longer than access tokens
      issuer: 'devhub-api',
      audience: 'devhub-client',
      algorithm: 'HS256'
    }
  );
};

export const verifyToken = (token: string): IJWTPayload => {
  return jwt.verify(
    token, 
    process.env.JWT_SECRET!,
    {
      issuer: 'devhub-api',
      audience: 'devhub-client'
    }
  ) as IJWTPayload;
};

/**
 * Extracts JWT token from request headers or cookies
 * @param {Request} req - Express request object
 * @returns {string | null} Extracted token or null if not found
 */
const extractToken = (req: Request): string | null => {
  // Check Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  } 
  // Check cookies
  else if (req.cookies?.token) {
    return req.cookies.token;
  }
  
  return null;
};

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token and attaches user to request object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {Error} 401 if no token, invalid token, or user not found
 * @throws {Error} 403 if account is suspended
 * @throws {Error} 500 if JWT_SECRET is not configured
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from request
    let token = extractToken(req);

    // Check if token exists
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      res.status(500);
      throw new Error('Server configuration error');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as IJWTPayload;

    // Get user from database (excluding password)
    const user = await User.findById(decoded.userId).select('-password');

    // Check if user exists
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    // Check if account is suspended
    if (user.isSuspended) {
      res.status(403);
      throw new Error('Account is suspended');
    }

    // Attach user to request object for downstream middleware
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401);
      error = new Error('Not authorized, token failed');
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401);
      error = new Error('Token expired');
    }
    // Pass error to error handling middleware
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Similar to protect() but doesn't throw errors if no/invalid token
 * Attaches user to request if valid token is provided
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

    // Only proceed if token exists and JWT_SECRET is configured
    if (token && process.env.JWT_SECRET) {
      try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as IJWTPayload;
        // Get user from database (excluding password)
        const user = await User.findById(decoded.userId).select('-password');
        
        // Attach user to request if found and not suspended
        if (user && !user.isSuspended) {
          req.user = user;
        }
      } catch (error) {
        // Silently handle token verification errors (optional auth)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.debug('Optional auth token verification failed:', errorMessage);
      }
    }

    next();
  } catch (error) {
    // Continue to next middleware even if an error occurs
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in optionalAuth middleware:', errorMessage);
    next();
  }
};

/**
 * Middleware to restrict access to admin users only
 * Must be used after protect() middleware
 * @param {Request} req - Express request object (must have user attached)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {Error} 401 if no user is authenticated
 * @throws {Error} 403 if user is not an admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user');
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized as an admin');
    return;
  }

  next();
};