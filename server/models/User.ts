import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface representing a User document in MongoDB
 * @interface IUser
 * @extends {Document}
 * @property {Types.ObjectId} _id - Unique identifier for the user
 * @property {string} email - User's email address (must be unique)
 * @property {string} password - Hashed password
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} [bio] - Short biography (optional)
 * @property {string} [avatar] - URL to user's profile picture (optional)
 * @property {'user'|'admin'} role - User's role in the system
 * @property {boolean} isVerified - Whether the user's email has been verified
 * @property {boolean} isSuspended - Whether the user's account is suspended
 * @property {Object} [location] - User's geographical location (optional)
 * @property {number} location.latitude - Latitude coordinate
 * @property {number} location.longitude - Longitude coordinate
 * @property {string} [location.city] - City name (optional)
 * @property {string} [location.country] - Country name (optional)
 * @property {Date} [lastLogin] - Timestamp of last login (optional)
 * @property {Date} createdAt - Timestamp when the user was created
 * @property {Date} updatedAt - Timestamp when the user was last updated
 * @method comparePassword - Compares a candidate password with the user's hashed password
 * @method getFullName - Returns the user's full name
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isSuspended: boolean;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

/**
 * Mongoose schema for User model
 * Defines the structure, validation rules, and indexes for users
 */
const UserSchema = new Schema<IUser>({
  /**
   * User's email address (must be unique)
   */
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  /**
   * Hashed password
   */
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  /**
   * User's first name
   */
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  /**
   * User's last name
   */
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  /**
   * Short biography (optional)
   */
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  /**
   * URL to user's profile picture (optional)
   */
  avatar: {
    type: String,
    default: null
  },
  /**
   * User's role in the system
   */
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  /**
   * Whether the user's email has been verified
   */
  isVerified: {
    type: Boolean,
    default: false,
  },
  /**
   * Whether the user's account is suspended
   */
  isSuspended: {
    type: Boolean,
    default: false,
  },
  /**
   * User's geographical location (optional)
   */
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters']
    }
  },
  /**
   * Timestamp of last login (optional)
   */
  lastLogin: {
    type: Date
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
UserSchema.index({ email: 1 }); // For fast lookups by email
UserSchema.index({ createdAt: -1 }); // For sorting users by creation date
UserSchema.index({ 'location.latitude': 1, 'location.longitude': 1 }); // For geospatial queries

/**
 * Virtual property that returns the user's full name
 * @returns {string} User's full name
 */
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Pre-save middleware to hash the password before saving
 * Only hashes the password if it has been modified
 */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Compares a candidate password with the user's hashed password
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Returns the user's full name
 * @returns {string} User's full name
 */
UserSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Custom toJSON method to remove sensitive data
 * @returns {Object} User object with sensitive fields removed
 */
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; // Never send password hash to client
  delete user.__v; // Remove version key
  return user;
};

export default mongoose.model<IUser>('User', UserSchema);