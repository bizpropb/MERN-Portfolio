import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a Project document in MongoDB
 * @interface IProject
 * @extends {Document}
 * @property {mongoose.Types.ObjectId} userId - Reference to the User who owns the project
 * @property {string} title - Title of the project
 * @property {string} description - Detailed description of the project
 * @property {string[]} technologies - Array of technology names used in the project
 * @property {string} [githubUrl] - GitHub repository URL (optional)
 * @property {string} [liveUrl] - Live demo URL (optional)
 * @property {string} [imageUrl] - URL of the project's featured image (optional)
 * @property {'planning'|'in-progress'|'completed'|'archived'} status - Current status of the project
 * @property {'low'|'medium'|'high'} priority - Priority level of the project
 * @property {Date} [startDate] - Project start date (optional)
 * @property {Date} [endDate] - Project end date (optional)
 * @property {boolean} featured - Whether the project is featured
 * @property {number} likes - Number of likes received
 * @property {number} views - Number of views/visits
 * @property {Date} createdAt - Timestamp when the project was created
 * @property {Date} updatedAt - Timestamp when the project was last updated
 */
export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
  featured: boolean;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Project model
 * Defines the structure, validation rules, and indexes for projects
 */
const ProjectSchema = new Schema<IProject>({
  /**
   * Reference to the User who owns the project
   * @type {mongoose.Types.ObjectId}
   * @required
   * @index
   */
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  /**
   * Title of the project
   * @type {string}
   * @required
   * @maxlength 100
   */
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  /**
   * Detailed description of the project
   * @type {string}
   * @required
   * @maxlength 2000
   */
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  /**
   * Array of technology names used in the project
   * @type {string[]}
   */
  technologies: [{
    type: String,
    trim: true,
    maxlength: [30, 'Technology name cannot exceed 30 characters']
  }],
  /**
   * GitHub repository URL (optional)
   * @type {string}
   * @match /^https?:\/\/(www\.)?github\.com\/.*$/
   */
  githubUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please enter a valid GitHub URL']
  },
  /**
   * Live demo URL (optional)
   * @type {string}
   * @match /^https?:\/\/.*$/
   */
  liveUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.*$/, 'Please enter a valid URL']
  },
  /**
   * URL of the project's featured image (optional)
   * @type {string}
   */
  imageUrl: {
    type: String,
    trim: true
  },
  /**
   * Current status of the project
   * @type {'planning'|'in-progress'|'completed'|'archived'}
   * @required
   * @enum
   */
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'archived'],
    default: 'planning',
    required: true
  },
  /**
   * Priority level of the project
   * @type {'low'|'medium'|'high'}
   * @enum
   */
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  /**
   * Project start date (optional)
   * @type {Date}
   */
  startDate: {
    type: Date
  },
  /**
   * Project end date (optional)
   * @type {Date}
   */
  endDate: {
    type: Date
  },
  /**
   * Whether the project is featured
   * @type {boolean}
   * @default false
   */
  featured: {
    type: Boolean,
    default: false
  },
  /**
   * Number of likes received
   * @type {number}
   * @default 0
   * @min 0
   */
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  /**
   * Number of views/visits
   * @type {number}
   * @default 0
   * @min 0
   */
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  /**
   * Automatically add createdAt and updatedAt fields
   */
  timestamps: true,
  /**
   * Include virtuals when converting to JSON
   */
  toJSON: { virtuals: true },
  /**
   * Include virtuals when converting to plain objects
   */
  toObject: { virtuals: true }
});

// Define indexes for optimized querying
ProjectSchema.index({ userId: 1, createdAt: -1 }); // For user's projects sorted by creation date
ProjectSchema.index({ status: 1 }); // For filtering projects by status
ProjectSchema.index({ featured: 1 }); // For retrieving featured projects
ProjectSchema.index({ technologies: 1 }); // For searching projects by technology

/**
 * Virtual property that calculates the duration of the project
 * Returns a human-readable string representation of the duration
 * @returns {string|null} Formatted duration string or null if dates are missing
 */
ProjectSchema.virtual('duration').get(function(this: IProject) {
  if (!this.startDate || !this.endDate) return null;
  
  const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
});

/**
 * Virtual property that calculates the progress percentage based on project status
 * @returns {number} Progress percentage (0-100)
 */
ProjectSchema.virtual('progress').get(function(this: IProject) {
  switch (this.status) {
    case 'planning': return 10;
    case 'in-progress': return 50;
    case 'completed': return 100;
    case 'archived': return 100;
    default: return 0;
  }
});

/**
 * Pre-save middleware to validate project data before saving
 * Ensures end date is after start date and limits the number of technologies
 */
ProjectSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  if (this.technologies.length > 20) {
    next(new Error('Cannot have more than 20 technologies per project'));
  }
  
  next();
});

export default mongoose.model<IProject>('Project', ProjectSchema);