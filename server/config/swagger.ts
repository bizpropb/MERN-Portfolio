import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DevHub Portfolio API',
    version: '1.0.0',
    description: 'A comprehensive portfolio API showcasing MERN/PERN stack concepts including authentication, CRUD operations, and modern web development patterns.',
    contact: {
      name: 'DevHub API Support',
      email: 'support@devhub.com'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-url.com'
        : `http://localhost:${process.env.PORT || 5000}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT token stored in HTTP-only cookie'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'firstName', 'lastName'],
        properties: {
          _id: { type: 'string', description: 'User ID' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          firstName: { type: 'string', maxLength: 50, description: 'User first name' },
          lastName: { type: 'string', maxLength: 50, description: 'User last name' },
          bio: { type: 'string', maxLength: 500, description: 'User biography' },
          avatar: { type: 'string', format: 'uri', description: 'Avatar image URL' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
          isVerified: { type: 'boolean', default: true },
          lastLogin: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Project: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          _id: { type: 'string', description: 'Project ID' },
          userId: { type: 'string', description: 'Owner user ID' },
          title: { type: 'string', maxLength: 100, description: 'Project title' },
          description: { type: 'string', maxLength: 2000, description: 'Project description' },
          technologies: { 
            type: 'array', 
            items: { type: 'string', maxLength: 30 },
            maxItems: 20,
            description: 'Technologies used in the project'
          },
          githubUrl: { type: 'string', format: 'uri', pattern: '^https?://(www\.)?github\.com/.*$' },
          liveUrl: { type: 'string', format: 'uri' },
          imageUrl: { type: 'string', format: 'uri' },
          status: { 
            type: 'string', 
            enum: ['planning', 'in-progress', 'completed', 'archived'],
            default: 'planning'
          },
          priority: { 
            type: 'string', 
            enum: ['low', 'medium', 'high'],
            default: 'medium'
          },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          featured: { type: 'boolean', default: false },
          likes: { type: 'integer', minimum: 0, default: 0 },
          views: { type: 'integer', minimum: 0, default: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Skill: {
        type: 'object',
        required: ['name', 'category', 'proficiencyLevel'],
        properties: {
          _id: { type: 'string', description: 'Skill ID' },
          userId: { type: 'string', description: 'Owner user ID' },
          name: { type: 'string', maxLength: 50, description: 'Skill name' },
          category: {
            type: 'string',
            enum: ['frontend', 'backend', 'database', 'tools', 'cloud', 'mobile', 'other'],
            description: 'Skill category'
          },
          proficiencyLevel: { 
            type: 'integer', 
            minimum: 1, 
            maximum: 5,
            description: 'Proficiency level (1-5)'
          },
          yearsOfExperience: { 
            type: 'number', 
            minimum: 0, 
            maximum: 50,
            description: 'Years of experience with this skill'
          },
          description: { type: 'string', maxLength: 500 },
          endorsements: { type: 'integer', minimum: 0, default: 0 },
          lastUsed: { type: 'string', format: 'date' },
          certifications: {
            type: 'array',
            items: { type: 'string', maxLength: 100 },
            maxItems: 10
          },
          isActive: { type: 'boolean', default: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6, maxLength: 128 },
          firstName: { type: 'string', minLength: 1, maxLength: 50 },
          lastName: { type: 'string', minLength: 1, maxLength: 50 },
          bio: { type: 'string', maxLength: 500 }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation error' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Please provide a valid email address' }
              }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Access denied. No token provided.' }
              }
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Admin access required.' }
              }
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Resource not found' }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationError' }
          }
        }
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Too many requests, please try again later.' }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Projects',
      description: 'Project management operations'
    },
    {
      name: 'Skills',
      description: 'Skill management and tracking'
    },
    {
      name: 'Profile',
      description: 'User profile management'
    }
  ]
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [
    // Use absolute paths from project root
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../index.ts'),
    // Also include .js files for when running compiled code
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../index.js')
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;