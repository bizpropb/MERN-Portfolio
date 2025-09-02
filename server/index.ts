/**
 * @file Main server entry point
 * @module index
 * @description Sets up and configures the Express server with middleware, routes, and error handling.
 * Connects to the database and starts the server on the specified port.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';

// Import route handlers
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import skillRoutes from './routes/skills';
import userRoutes from './routes/user';
import uploadRoutes from './routes/uploads';
import commentsRoutes from './routes/comments';
import newsRoutes from './routes/news';

// Import swagger configuration
import swaggerSpec from './config/swagger';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Connect to the database
connectDB().catch(error => {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
});

/**
 * Rate limiting configuration
 * Protects against brute force and denial of service attacks
 */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1200, // Limit each IP to 1200 requests per 10 minutes (120 per minute)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001', // Default to localhost:3001 if not set
  credentials: true, // Allow cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (with size limit)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form data)
app.use(cookieParser()); // Parse cookies from the request
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Serve Swagger UI for interactive API documentation
// Must be before other routes to ensure it's accessible
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DevHub API Documentation'
}));

// Register API routes
app.use('/api/auth', authRoutes);      // Authentication routes (login, register, etc.)
app.use('/api/projects', projectRoutes); // Project management routes
app.use('/api/skills', skillRoutes);    // Skill management routes
app.use('/api/dashboard', userRoutes); // User dashboard routes
app.use('/api/user', userRoutes); // Username-based routes for user dashboards
app.use('/api/comments', commentsRoutes); // Comments management routes
app.use('/api/upload', uploadRoutes); // Upload management routes
app.use('/api/news', newsRoutes); // News management routes

/**
 * Health check endpoint
 * @route GET /api/test
 * @returns {Object} API status information
 */
app.get('/api/test', (_req: Request, res: Response) => {
  res.json({ 
    status: 'success',
    message: 'DevHub API is operational',
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_TYPE || 'not configured',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * Root endpoint
 * @route GET /
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to DevHub API',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      health: '/api/test',
      auth: '/api/auth',
      projects: '/api/projects',
      skills: '/api/skills',
      profile: '/api/profile'
    }
  });
});

/**
 * Global error handler middleware
 * Handles all errors that occur in route handlers
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Server Error:', err.stack);
  
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      ...(err.name && { error: err.name })
    })
  });
});

/**
 * 404 Handler
 * Handles all requests to undefined routes
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    status: 'error',
    message: 'The requested resource was not found',
    documentation: `${_req.protocol}://${_req.get('host')}/api-docs`
  });
});

// Get port from environment variables or use default
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the Express server
 */
const server = app.listen(PORT, () => {
  // Server started successfully
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM (for Docker/Heroku)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default server;