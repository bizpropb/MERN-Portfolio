import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a Skill document in MongoDB
 * @interface ISkill
 * @extends {Document}
 * @property {mongoose.Types.ObjectId} userId - Reference to the User who owns the skill
 * @property {string} name - Name of the skill
 * @property {'frontend'|'backend'|'database'|'tools'|'cloud'|'mobile'|'other'} category - Category of the skill
 * @property {number} proficiencyLevel - Proficiency level from 1 to 5
 * @property {number} [yearsOfExperience] - Years of experience with the skill (optional)
 * @property {string} [description] - Description of the skill (optional)
 * @property {number} endorsements - Number of endorsements received
 * @property {Date} [lastUsed] - When the skill was last used (defaults to now)
 * @property {string[]} [certifications] - Array of related certifications (optional)
 * @property {boolean} isActive - Whether the skill is currently active
 * @property {Date} createdAt - Timestamp when the skill was created
 * @property {Date} updatedAt - Timestamp when the skill was last updated
 * @method addEndorsement - Increments the endorsement count
 */
export interface ISkill extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'cloud' | 'mobile' | 'other';
  proficiencyLevel: number;
  yearsOfExperience?: number;
  description?: string;
  endorsements: number;
  lastUsed?: Date;
  certifications?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addEndorsement(): Promise<void>;
}

/**
 * Mongoose schema for Skill model
 * Defines the structure, validation rules, and indexes for skills
 */
const SkillSchema = new Schema<ISkill>({
  /**
   * Reference to the User who owns the skill
   */
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  /**
   * Name of the skill
   */
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  },
  /**
   * Category of the skill
   */
  category: {
    type: String,
    enum: ['frontend', 'backend', 'database', 'tools', 'cloud', 'mobile', 'other'],
    required: [true, 'Skill category is required'],
    index: true
  },
  /**
   * Proficiency level from 1 to 5
   */
  proficiencyLevel: {
    type: Number,
    required: [true, 'Proficiency level is required'],
    min: [1, 'Proficiency level must be at least 1'],
    max: [5, 'Proficiency level cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Proficiency level must be a whole number'
    }
  },
  /**
   * Years of experience with the skill (optional)
   */
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50']
  },
  /**
   * Description of the skill (optional)
   */
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  /**
   * Number of endorsements received
   */
  endorsements: {
    type: Number,
    default: 0,
    min: 0
  },
  /**
   * When the skill was last used (defaults to now)
   */
  lastUsed: {
    type: Date,
    default: Date.now
  },
  /**
   * Array of related certifications (optional)
   */
  certifications: [{
    type: String,
    trim: true,
    maxlength: [100, 'Certification name cannot exceed 100 characters']
  }],
  /**
   * Whether the skill is currently active
   */
  isActive: {
    type: Boolean,
    default: true
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
SkillSchema.index({ userId: 1, name: 1 }, { unique: true }); // For unique skill names per user
SkillSchema.index({ category: 1, proficiencyLevel: -1 }); // For filtering skills by category and proficiency
SkillSchema.index({ isActive: 1, lastUsed: -1 }); // For retrieving active skills sorted by last used

/**
 * Virtual property that returns a human-readable proficiency label
 * @returns {string} Human-readable proficiency level
 */
SkillSchema.virtual('proficiencyLabel').get(function(this: ISkill) {
  switch (this.proficiencyLevel) {
    case 1: return 'Beginner';
    case 2: return 'Novice';
    case 3: return 'Intermediate';
    case 4: return 'Advanced';
    case 5: return 'Expert';
    default: return 'Unknown';
  }
});

/**
 * Virtual property that returns a human-readable experience level
 * @returns {string} Human-readable experience level
 */
SkillSchema.virtual('experienceLevel').get(function(this: ISkill) {
  if (!this.yearsOfExperience) return 'Not specified';
  
  if (this.yearsOfExperience < 1) return 'Less than 1 year';
  if (this.yearsOfExperience < 3) return `${this.yearsOfExperience} year${this.yearsOfExperience > 1 ? 's' : ''}`;
  if (this.yearsOfExperience < 5) return '3-5 years';
  if (this.yearsOfExperience < 10) return '5-10 years';
  return '10+ years';
});

SkillSchema.virtual('freshness').get(function(this: ISkill) {
  if (!this.lastUsed) return 'Unknown';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.lastUsed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) return 'Recently used';
  if (diffDays <= 90) return 'Used in last 3 months';
  if (diffDays <= 365) return 'Used in last year';
  return 'Not used recently';
});

/**
 * Static method to get skills by category for a specific user
 * @param {mongoose.Types.ObjectId} userId - ID of the user
 * @param {string} category - Category to filter by
 * @returns {Promise<ISkill[]>} Array of skills matching the category
 */
SkillSchema.statics.getByCategory = async function(userId: mongoose.Types.ObjectId, category: string) {
  return this.find({ userId, category, isActive: true })
    .sort({ proficiencyLevel: -1, endorsements: -1 });
};

/**
 * Instance method to increment the endorsement count
 * @returns {Promise<void>}
 */
SkillSchema.methods.addEndorsement = async function() {
  this.endorsements += 1;
  return this.save();
};

export default mongoose.model<ISkill>('Skill', SkillSchema);