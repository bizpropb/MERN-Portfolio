import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken, generateRefreshToken } from '../middleware/auth';

/**
 * @file Authentication controller for handling user registration, login, logout, and token management
 * @module controllers/authController
 */

/**
 * Generates cookie options with secure settings
 * @returns {Object} Cookie configuration object
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/'
});

/**
 * Helper function to send token response with cookies
 * @param {IUser} user - The user object
 * @param {number} statusCode - HTTP status code
 * @param {Response} res - Express response object
 * @param {string} [message=''] - Optional success message
 */
const sendTokenResponse = (user: IUser, statusCode: number, res: Response, message: string = '') => {
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie('token', token, getCookieOptions());
  res.cookie('refreshToken', refreshToken, {
    ...getCookieOptions(),
    maxAge: 90 * 24 * 60 * 60 * 1000
  });

  const userOutput = user.toJSON();

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userOutput,
      token,
      refreshToken
    }
  });
};

/**
 * @async
 * @function register
 * @description Register a new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If registration fails
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, bio } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      bio: bio || ''
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');

  } catch (error: any) {
    console.error('Registration error:', error);
    
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
      message: 'Server error during registration'
    });
  }
};

/**
 * @async
 * @function login
 * @description Authenticate user and return JWT token
 * @param {Request} req - Express request object with email and password
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If authentication fails
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Account not verified. Please verify your email.'
      });
      return;
    }

    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @async
 * @function logout
 * @description Logout user by clearing authentication cookies
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('token', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

/**
 * @async
 * @function getMe
 * @description Get current authenticated user's profile
 * @param {Request} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
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

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};

/**
 * @async
 * @function refreshToken
 * @description Refresh authentication token using refresh token
 * @param {Request} req - Express request object with refresh token
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
      return;
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('token', newToken, getCookieOptions());
    res.cookie('refreshToken', newRefreshToken, {
      ...getCookieOptions(),
      maxAge: 90 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * @async
 * @function checkEmail
 * @description Check if an email is already registered
 * @param {Request} req - Express request object with email parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.status(200).json({
      success: true,
      data: {
        exists: !!user,
        email: email.toLowerCase()
      }
    });

  } catch (error: any) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking email'
    });
  }
};