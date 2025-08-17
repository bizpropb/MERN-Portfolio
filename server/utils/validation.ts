/**
 * @file Validation utilities and schemas for request validation
 * @module utils/validation
 * @description Provides middleware for validating request bodies and query parameters
 * using Joi. Includes predefined validation schemas for authentication,
 * projects, skills, and profile management.
 */

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate request body against a Joi schema
 * @function
 * @param {Joi.ObjectSchema} schema - Joi validation schema to validate against
 * @returns {Function} Express middleware function that validates request body
 * @throws {Object} 400 - Validation error with details about the validation failure
 * @example
 * router.post('/endpoint', validate(schema), controller.handler);
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }

    req.body = value;
    next();
  };
};

/**
 * Middleware to validate query parameters against a Joi schema
 * @function
 * @param {Joi.ObjectSchema} schema - Joi validation schema for query parameters
 * @returns {Function} Express middleware function that validates query parameters
 * @throws {Object} 400 - Validation error with details about the validation failure
 * @example
 * router.get('/endpoint', validateQuery(schema), controller.handler);
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors
      });
      return;
    }

    Object.assign(req.query, value);
    next();
  };
};

/**
 * @namespace authSchemas
 * @description Joi validation schemas for authentication routes
 * @property {Joi.ObjectSchema} register - Schema for user registration
 * @property {Joi.ObjectSchema} login - Schema for user login
 */
export const authSchemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name is required',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    bio: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  })
};

/**
 * @namespace projectSchemas
 * @description Joi validation schemas for project management routes
 * @property {Joi.ObjectSchema} create - Schema for creating a new project
 * @property {Joi.ObjectSchema} update - Schema for updating an existing project
 * @property {Joi.ObjectSchema} query - Schema for querying projects with filters
 */
export const projectSchemas = {
  create: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Project title is required',
        'string.max': 'Title cannot exceed 100 characters'
      }),
    description: Joi.string()
      .trim()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Project description is required',
        'string.max': 'Description cannot exceed 2000 characters'
      }),
    technologies: Joi.array()
      .items(Joi.string().trim().max(30))
      .max(20)
      .default([])
      .messages({
        'array.max': 'Cannot have more than 20 technologies per project'
      }),
    githubUrl: Joi.string()
      .uri()
      .pattern(/^https?:\/\/(www\.)?github\.com\/.*$/)
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid GitHub URL'
      }),
    liveUrl: Joi.string()
      .uri()
      .allow('')
      .optional()
      .messages({
        'string.uri': 'Please provide a valid URL'
      }),
    imageUrl: Joi.string()
      .uri()
      .allow('')
      .optional(),
    status: Joi.string()
      .valid('planning', 'in-progress', 'completed', 'archived')
      .default('planning'),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .default('medium'),
    startDate: Joi.date()
      .optional(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.min': 'End date must be after start date'
      }),
    featured: Joi.boolean()
      .default(false)
  }),

  update: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
    description: Joi.string()
      .trim()
      .min(1)
      .max(2000)
      .optional(),
    technologies: Joi.array()
      .items(Joi.string().trim().max(30))
      .max(20)
      .optional(),
    githubUrl: Joi.string()
      .uri()
      .pattern(/^https?:\/\/(www\.)?github\.com\/.*$/)
      .allow('')
      .optional(),
    liveUrl: Joi.string()
      .uri()
      .allow('')
      .optional(),
    imageUrl: Joi.string()
      .uri()
      .allow('')
      .optional(),
    status: Joi.string()
      .valid('planning', 'in-progress', 'completed', 'archived')
      .optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .optional(),
    startDate: Joi.date()
      .optional(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional(),
    featured: Joi.boolean()
      .optional()
  }),

  query: Joi.object({
    status: Joi.string()
      .valid('planning', 'in-progress', 'completed', 'archived')
      .optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .optional(),
    featured: Joi.boolean()
      .optional(),
    technology: Joi.string()
      .optional(),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10),
    sort: Joi.string()
      .valid('createdAt', '-createdAt', 'title', '-title', 'status', '-status')
      .default('-createdAt')
  })
};

/**
 * @namespace skillSchemas
 * @description Joi validation schemas for skill management routes
 * @property {Joi.ObjectSchema} create - Schema for creating a new skill
 * @property {Joi.ObjectSchema} update - Schema for updating an existing skill
 * @property {Joi.ObjectSchema} query - Schema for querying skills with filters
 */
export const skillSchemas = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Skill name is required',
        'string.max': 'Skill name cannot exceed 50 characters'
      }),
    category: Joi.string()
      .valid('frontend', 'backend', 'database', 'tools', 'cloud', 'mobile', 'other')
      .required()
      .messages({
        'any.only': 'Category must be one of: frontend, backend, database, tools, cloud, mobile, other'
      }),
    proficiencyLevel: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.integer': 'Proficiency level must be a whole number',
        'number.min': 'Proficiency level must be at least 1',
        'number.max': 'Proficiency level cannot exceed 5'
      }),
    yearsOfExperience: Joi.number()
      .min(0)
      .max(50)
      .optional()
      .messages({
        'number.min': 'Years of experience cannot be negative',
        'number.max': 'Years of experience cannot exceed 50'
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .optional(),
    lastUsed: Joi.date()
      .optional(),
    certifications: Joi.array()
      .items(Joi.string().trim().max(100))
      .max(10)
      .default([])
  }),

  update: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional(),
    category: Joi.string()
      .valid('frontend', 'backend', 'database', 'tools', 'cloud', 'mobile', 'other')
      .optional(),
    proficiencyLevel: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional(),
    yearsOfExperience: Joi.number()
      .min(0)
      .max(50)
      .optional(),
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .optional(),
    lastUsed: Joi.date()
      .optional(),
    certifications: Joi.array()
      .items(Joi.string().trim().max(100))
      .max(10)
      .optional(),
    isActive: Joi.boolean()
      .optional()
  }),

  query: Joi.object({
    category: Joi.string()
      .valid('frontend', 'backend', 'database', 'tools', 'cloud', 'mobile', 'other')
      .optional(),
    isActive: Joi.boolean()
      .optional(),
    minProficiency: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional(),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
    sort: Joi.string()
      .valid('name', '-name', 'proficiencyLevel', '-proficiencyLevel', 'category', '-category', 'lastUsed', '-lastUsed')
      .default('-proficiencyLevel')
  })
};

/**
 * @namespace profileSchemas
 * @description Joi validation schemas for user profile management
 * @property {Joi.ObjectSchema} update - Schema for updating user profile
 * @property {Joi.ObjectSchema} changePassword - Schema for changing user password
 */
export const profileSchemas = {
  update: Joi.object({
    username: Joi.string()
      .trim()
      .min(1)
      .max(30)
      .optional(),
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional(),
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional(),
    bio: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .optional(),
    avatar: Joi.string()
      .uri()
      .allow('')
      .optional(),
    location: Joi.object({
      latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional(),
      longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional(),
      city: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional(),
      country: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match',
        'any.required': 'Password confirmation is required'
      })
  })
};