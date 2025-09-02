import { Request, Response } from 'express';
import Skill, { ISkill } from '../models/Skill';
import mongoose from 'mongoose';

/**
 * @file Skills controller for handling skill-related operations
 * @module controllers/skillsController
 */

/**
 * @async
 * @function getSkills
 * @description Get a paginated list of skills with filtering and statistics
 * @param {Request} req - Express request object with query parameters
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @queryParam {string} [category] - Filter by skill category
 * @queryParam {boolean} [isActive] - Filter active/inactive skills
 * @queryParam {number} [minProficiency] - Filter by minimum proficiency level
 * @queryParam {number} [page=1] - Page number for pagination
 * @queryParam {number} [limit=20] - Number of items per page
 * @queryParam {string} [sort=-proficiencyLevel] - Sort field and direction
 */
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const {
      category,
      isActive,
      minProficiency,
      page = 1,
      limit = 20,
      sort = '-proficiencyLevel'
    } = req.query;

    // Initialize filter with authenticated user and apply query filters
    const filter: any = { userId: req.user._id };
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (minProficiency) filter.proficiencyLevel = { $gte: parseInt(minProficiency as string) };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Fetch paginated skills with sorting and population
    const skills = await Skill.find(filter)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'firstName lastName email');

    const total = await Skill.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Calculate skill statistics using MongoDB aggregation
    const stats = await Skill.aggregate([
      { $match: { userId: req.user._id, isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageProficiency: { $avg: '$proficiencyLevel' },
          expertSkills: { $sum: { $cond: [{ $eq: ['$proficiencyLevel', 5] }, 1, 0] } },
          advancedSkills: { $sum: { $cond: [{ $eq: ['$proficiencyLevel', 4] }, 1, 0] } },
          intermediateSkills: { $sum: { $cond: [{ $eq: ['$proficiencyLevel', 3] }, 1, 0] } },
          totalEndorsements: { $sum: '$endorsements' }
        }
      }
    ]);

    // Calculate category-wise statistics
    const categoryStats = await Skill.aggregate([
      { $match: { userId: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageProficiency: { $avg: '$proficiencyLevel' },
          totalEndorsements: { $sum: '$endorsements' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        skills,
        pagination: {
          current: pageNum,
          pages: totalPages,
          total,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        stats: stats[0] || {
          total: 0,
          averageProficiency: 0,
          expertSkills: 0,
          advancedSkills: 0,
          intermediateSkills: 0,
          totalEndorsements: 0
        },
        categoryStats
      }
    });

  } catch (error: any) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching skills'
    });
  }
};

/**
 * @async
 * @function getSkillsByUsername
 * @description Get skills for a specific user by username
 * @param {Request} req - Express request object with username parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getSkillsByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    // Find the user by username
    const User = require('../models/User').default;
    const targetUser = await User.findOne({ username: username.toLowerCase() });
    
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: `User with username '${username}' not found`
      });
      return;
    }

    // Get skills for the target user
    const skills = await Skill.find({ 
      userId: targetUser._id, 
      isActive: true 
    })
    .sort({ proficiencyLevel: -1, endorsements: -1 })
    .select('name category proficiencyLevel yearsOfExperience description endorsements certifications lastUsed');

    // Calculate stats
    const stats = await Skill.aggregate([
      { $match: { userId: targetUser._id, isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageProficiency: { $avg: '$proficiencyLevel' },
          expertSkills: { $sum: { $cond: [{ $gte: ['$proficiencyLevel', 5] }, 1, 0] } },
          totalEndorsements: { $sum: '$endorsements' }
        }
      }
    ]);

    const categoryStats = await Skill.aggregate([
      { $match: { userId: targetUser._id, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageProficiency: { $avg: '$proficiencyLevel' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          username: targetUser.username,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName
        },
        skills,
        stats: stats[0] || {
          total: 0,
          averageProficiency: 0,
          expertSkills: 0,
          totalEndorsements: 0
        },
        categoryStats
      }
    });

  } catch (error: any) {
    console.error('Get skills by username error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching skills'
    });
  }
};

/**
 * @async
 * @function getSkill
 * @description Get a single skill by ID
 * @param {Request} req - Express request object with skill ID parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The skill ID
 */
export const getSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
      return;
    }

    const skill = await Skill.findOne({
      _id: id,
      userId: req.user._id
    }).populate('userId', 'firstName lastName email');

    if (!skill) {
      res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        skill
      }
    });

  } catch (error: any) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching skill'
    });
  }
};

/**
 * @async
 * @function createSkill
 * @description Create a new skill
 * @param {Request} req - Express request object with skill data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @body {ISkill} - Skill data to create
 */
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const skillData = {
      ...req.body,
      userId: req.user._id
    };

    const skill = await Skill.create(skillData);
    
    await skill.populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: {
        skill
      }
    });

  } catch (error: any) {
    console.error('Create skill error:', error);
    
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

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'You already have a skill with this name'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating skill'
    });
  }
};

/**
 * @async
 * @function updateSkill
 * @description Update an existing skill
 * @param {Request} req - Express request object with skill ID and update data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The skill ID to update
 * @body {Partial<ISkill>} - Skill fields to update
 */
export const updateSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
      return;
    }

    const skill = await Skill.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('userId', 'firstName lastName email');

    if (!skill) {
      res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: {
        skill
      }
    });

  } catch (error: any) {
    console.error('Update skill error:', error);
    
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

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'You already have a skill with this name'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating skill'
    });
  }
};

/**
 * @async
 * @function deleteSkill
 * @description Delete a skill by ID
 * @param {Request} req - Express request object with skill ID
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The skill ID to delete
 */
export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
      return;
    }

    const skill = await Skill.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!skill) {
      res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting skill'
    });
  }
};

/**
 * @async
 * @function endorseSkill
 * @description Endorse a skill (increment endorsement count)
 * @param {Request} req - Express request object with skill ID
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.id - The skill ID to endorse
 */
export const endorseSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
      return;
    }

    const skill = await Skill.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!skill) {
      res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
      return;
    }

    await skill.addEndorsement();

    res.status(200).json({
      success: true,
      message: 'Skill endorsed successfully',
      data: {
        endorsements: skill.endorsements
      }
    });

  } catch (error: any) {
    console.error('Endorse skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error endorsing skill'
    });
  }
};

/**
 * @async
 * @function getSkillsByCategory
 * @description Get skills grouped by category with statistics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getSkillsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { category } = req.params;
    const validCategories = ['frontend', 'backend', 'database', 'tools', 'cloud', 'mobile', 'other'];
    
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
      return;
    }

    const skills = await (Skill as any).getByCategory(req.user._id, category);

    res.status(200).json({
      success: true,
      data: {
        category,
        skills,
        count: skills.length
      }
    });

  } catch (error: any) {
    console.error('Get skills by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching skills by category'
    });
  }
};

/**
 * @async
 * @function getSkillAnalytics
 * @description Get analytics data for skills
 * @param {Request} req - Express request object with query parameters
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @queryParam {string} [timeframe='month'] - Timeframe for analytics (day, week, month, year)
 */
export const getSkillAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const analytics = await Skill.aggregate([
      { $match: { userId: req.user._id } },
      {
        $facet: {
          proficiencyBreakdown: [
            {
              $group: {
                _id: '$proficiencyLevel',
                count: { $sum: 1 },
                skills: { $push: '$name' }
              }
            },
            { $sort: { _id: -1 } }
          ],
          categoryAnalysis: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                averageProficiency: { $avg: '$proficiencyLevel' },
                totalEndorsements: { $sum: '$endorsements' },
                skills: { $push: { name: '$name', proficiency: '$proficiencyLevel' } }
              }
            },
            { $sort: { count: -1 } }
          ],
          skillFreshness: [
            {
              $group: {
                _id: {
                  $cond: [
                    { $gte: ['$lastUsed', { $dateSubtract: { startDate: new Date(), unit: 'month', amount: 1 } }] },
                    'Recent',
                    {
                      $cond: [
                        { $gte: ['$lastUsed', { $dateSubtract: { startDate: new Date(), unit: 'month', amount: 6 } }] },
                        'Moderate',
                        'Stale'
                      ]
                    }
                  ]
                },
                count: { $sum: 1 }
              }
            }
          ],
          topEndorsedSkills: [
            { $match: { endorsements: { $gt: 0 } } },
            { $sort: { endorsements: -1 } },
            { $limit: 5 },
            {
              $project: {
                name: 1,
                endorsements: 1,
                proficiencyLevel: 1,
                category: 1
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        analytics: analytics[0]
      }
    });

  } catch (error: any) {
    console.error('Get skill analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching skill analytics'
    });
  }
};

/**
 * @async
 * @function getAvailableSkills
 * @description Get all available skills from the predefined skill list for skill selection
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getAvailableSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Comprehensive predefined skill list from seed data and more
    const predefinedSkills = [
      // Frontend
      { name: 'React', category: 'frontend' },
      { name: 'Vue.js', category: 'frontend' },
      { name: 'Angular', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'JavaScript', category: 'frontend' },
      { name: 'Next.js', category: 'frontend' },
      { name: 'Nuxt.js', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'frontend' },
      { name: 'Styled Components', category: 'frontend' },
      { name: 'Material-UI', category: 'frontend' },
      { name: 'Ant Design', category: 'frontend' },
      { name: 'Bootstrap', category: 'frontend' },
      { name: 'Sass', category: 'frontend' },
      { name: 'Less', category: 'frontend' },
      { name: 'Webpack', category: 'frontend' },
      { name: 'Vite', category: 'frontend' },
      { name: 'Parcel', category: 'frontend' },
      { name: 'ESLint', category: 'frontend' },
      { name: 'Prettier', category: 'frontend' },
      
      // Backend
      { name: 'Node.js', category: 'backend' },
      { name: 'Express.js', category: 'backend' },
      { name: 'Fastify', category: 'backend' },
      { name: 'Koa.js', category: 'backend' },
      { name: 'NestJS', category: 'backend' },
      { name: 'Python', category: 'backend' },
      { name: 'Django', category: 'backend' },
      { name: 'Flask', category: 'backend' },
      { name: 'FastAPI', category: 'backend' },
      { name: 'Java', category: 'backend' },
      { name: 'Spring Boot', category: 'backend' },
      { name: 'C#', category: 'backend' },
      { name: '.NET Core', category: 'backend' },
      { name: 'ASP.NET', category: 'backend' },
      { name: 'Go', category: 'backend' },
      { name: 'Gin', category: 'backend' },
      { name: 'Rust', category: 'backend' },
      { name: 'PHP', category: 'backend' },
      { name: 'Laravel', category: 'backend' },
      { name: 'Symfony', category: 'backend' },
      { name: 'Ruby', category: 'backend' },
      { name: 'Ruby on Rails', category: 'backend' },
      
      // Database
      { name: 'MongoDB', category: 'database' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'MySQL', category: 'database' },
      { name: 'SQLite', category: 'database' },
      { name: 'Redis', category: 'database' },
      { name: 'Elasticsearch', category: 'database' },
      { name: 'Firebase', category: 'database' },
      { name: 'Supabase', category: 'database' },
      { name: 'DynamoDB', category: 'database' },
      { name: 'Cassandra', category: 'database' },
      { name: 'Neo4j', category: 'database' },
      { name: 'InfluxDB', category: 'database' },
      
      // Cloud
      { name: 'AWS', category: 'cloud' },
      { name: 'Azure', category: 'cloud' },
      { name: 'Google Cloud', category: 'cloud' },
      { name: 'Vercel', category: 'cloud' },
      { name: 'Netlify', category: 'cloud' },
      { name: 'Heroku', category: 'cloud' },
      { name: 'DigitalOcean', category: 'cloud' },
      { name: 'Linode', category: 'cloud' },
      { name: 'Cloudflare', category: 'cloud' },
      { name: 'AWS Lambda', category: 'cloud' },
      { name: 'AWS EC2', category: 'cloud' },
      { name: 'AWS S3', category: 'cloud' },
      { name: 'AWS RDS', category: 'cloud' },
      
      // Tools
      { name: 'Git', category: 'tools' },
      { name: 'GitHub', category: 'tools' },
      { name: 'GitLab', category: 'tools' },
      { name: 'Bitbucket', category: 'tools' },
      { name: 'Docker', category: 'tools' },
      { name: 'Kubernetes', category: 'tools' },
      { name: 'Jenkins', category: 'tools' },
      { name: 'GitHub Actions', category: 'tools' },
      { name: 'GitLab CI', category: 'tools' },
      { name: 'CircleCI', category: 'tools' },
      { name: 'Travis CI', category: 'tools' },
      { name: 'Terraform', category: 'tools' },
      { name: 'Ansible', category: 'tools' },
      { name: 'Chef', category: 'tools' },
      { name: 'Puppet', category: 'tools' },
      { name: 'Vagrant', category: 'tools' },
      { name: 'VS Code', category: 'tools' },
      { name: 'IntelliJ IDEA', category: 'tools' },
      { name: 'Postman', category: 'tools' },
      { name: 'Insomnia', category: 'tools' },
      { name: 'Figma', category: 'tools' },
      { name: 'Adobe XD', category: 'tools' },
      { name: 'Sketch', category: 'tools' },
      { name: 'Jira', category: 'tools' },
      { name: 'Confluence', category: 'tools' },
      { name: 'Slack', category: 'tools' },
      { name: 'Discord', category: 'tools' },
      { name: 'Notion', category: 'tools' },
      
      // Mobile
      { name: 'React Native', category: 'mobile' },
      { name: 'Flutter', category: 'mobile' },
      { name: 'Ionic', category: 'mobile' },
      { name: 'Expo', category: 'mobile' },
      { name: 'Swift', category: 'mobile' },
      { name: 'Kotlin', category: 'mobile' },
      { name: 'Java (Android)', category: 'mobile' },
      { name: 'Xamarin', category: 'mobile' },
      { name: 'Cordova', category: 'mobile' },
      { name: 'PhoneGap', category: 'mobile' },
      
      // Other
      { name: 'GraphQL', category: 'other' },
      { name: 'REST API', category: 'other' },
      { name: 'gRPC', category: 'other' },
      { name: 'WebSocket', category: 'other' },
      { name: 'Socket.io', category: 'other' },
      { name: 'JWT', category: 'other' },
      { name: 'OAuth', category: 'other' },
      { name: 'Stripe', category: 'other' },
      { name: 'PayPal', category: 'other' },
      { name: 'Twilio', category: 'other' },
      { name: 'SendGrid', category: 'other' },
      { name: 'Mailgun', category: 'other' },
      { name: 'Cloudinary', category: 'other' },
      { name: 'Algolia', category: 'other' },
      { name: 'Auth0', category: 'other' },
      { name: 'Clerk', category: 'other' },
      { name: 'Prisma', category: 'other' },
      { name: 'Sequelize', category: 'other' },
      { name: 'Mongoose', category: 'other' },
      { name: 'Drizzle', category: 'other' },
      { name: 'tRPC', category: 'other' },
      { name: 'Zod', category: 'other' },
      { name: 'Jest', category: 'other' },
      { name: 'Vitest', category: 'other' },
      { name: 'Cypress', category: 'other' },
      { name: 'Playwright', category: 'other' },
      { name: 'Puppeteer', category: 'other' },
      { name: 'Storybook', category: 'other' },
      { name: 'Chromatic', category: 'other' }
    ];

    // Get skills the current user already has
    const userSkills = await Skill.find({ 
      userId: req.user._id, 
      isActive: true 
    }).select('name');
    
    const userSkillNames = userSkills.map(skill => skill.name);

    // Filter out skills the user already has
    const availableSkills = predefinedSkills.filter(
      skill => !userSkillNames.includes(skill.name)
    );

    res.status(200).json({
      success: true,
      message: 'Available skills retrieved successfully',
      data: {
        skills: availableSkills
      }
    });

  } catch (error: any) {
    console.error('Get available skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available skills'
    });
  }
};