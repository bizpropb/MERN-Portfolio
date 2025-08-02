import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a Comment document in MongoDB
 * @interface IComment
 * @extends {Document}
 * @property {mongoose.Types.ObjectId} projectId - Reference to the Project being commented on
 * @property {mongoose.Types.ObjectId} userId - Reference to the User who wrote the comment
 * @property {string} content - The comment text content
 * @property {number} [rating] - Optional rating (1-5) associated with the comment
 * @property {boolean} isPublic - Whether the comment is publicly visible
 * @property {mongoose.Types.ObjectId} [parentCommentId] - Reference to parent comment for replies
 * @property {Date} createdAt - Timestamp when the comment was created
 * @property {Date} updatedAt - Timestamp when the comment was last updated
 */
export interface IComment extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  rating?: number;
  isPublic: boolean;
  parentCommentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Comment model
 * Defines the structure, validation rules, and indexes for project comments
 */
const commentSchema = new Schema<IComment>({
  /**
   * Reference to the Project being commented on
   * @type {mongoose.Types.ObjectId}
   * @required
   * @index
   */
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  /**
   * Reference to the User who wrote the comment
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
   * The comment text content
   * @type {string}
   * @required
   * @maxlength 1000
   */
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  /**
   * Optional rating (1-5) associated with the comment
   * @type {number}
   * @min 1
   * @max 5
   */
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  /**
   * Whether the comment is publicly visible
   * @type {boolean}
   * @default true
   */
  isPublic: {
    type: Boolean,
    default: true
  },
  /**
   * Reference to parent comment for replies (creates nested comment structure)
   * @type {mongoose.Types.ObjectId}
   * @index
   */
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    index: true
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
commentSchema.index({ projectId: 1, createdAt: -1 }); // For project comments sorted by creation date
commentSchema.index({ userId: 1 }); // For user's comments
commentSchema.index({ parentCommentId: 1 }); // For comment replies
commentSchema.index({ isPublic: 1 }); // For filtering public comments

/**
 * Virtual property that indicates if this comment is a reply
 * @returns {boolean} True if this comment has a parent comment
 */
commentSchema.virtual('isReply').get(function(this: IComment) {
  return !!this.parentCommentId;
});

/**
 * Pre-save middleware to validate comment data before saving
 * Ensures content is not empty after trimming and handles reply validation
 */
commentSchema.pre('save', function(next) {
  // Ensure content is not empty after trimming
  if (!this.content || this.content.trim().length === 0) {
    next(new Error('Comment content cannot be empty'));
    return;
  }
  
  // If this is a reply, ensure it's not replying to another reply (max depth = 1)
  if (this.parentCommentId && this.isNew) {
    // This would require a database query to check if parent is already a reply
    // For now, we'll trust the frontend to enforce this rule
  }
  
  next();
});

export default mongoose.model<IComment>('Comment', commentSchema);