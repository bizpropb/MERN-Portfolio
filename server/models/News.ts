import mongoose, { Document, Schema } from 'mongoose';

/**
 * @interface INews
 * @description Interface for News documents
 * @property {string} title - The title of the news article
 * @property {string} slug - URL-friendly version of the title
 * @property {string} preview - Short preview text for the article
 * @property {string} content - Full article content in markdown format
 * @property {string} [imageUrl] - Optional featured image URL
 * @property {string} author - Author name
 * @property {boolean} published - Whether the article is published
 * @property {Date} publishedAt - When the article was published
 * @property {number} views - Number of times the article was viewed
 */
export interface INews extends Document {
  title: string;
  slug: string;
  preview: string;
  content: string;
  imageUrl?: string;
  author: string;
  published: boolean;
  publishedAt: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @schema NewsSchema
 * @description Mongoose schema for news articles
 */
const NewsSchema: Schema<INews> = new Schema({
  /**
   * Title of the news article
   * @type {String}
   * @required
   * @maxLength 200
   */
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    trim: true
  },

  /**
   * URL-friendly slug for the article
   * @type {String}
   * @required
   * @unique
   * @maxLength 250
   */
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    maxlength: [250, 'Slug cannot exceed 250 characters'],
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },

  /**
   * Short preview text for the article
   * @type {String}
   * @required
   * @maxLength 500
   */
  preview: {
    type: String,
    required: [true, 'Preview is required'],
    maxlength: [500, 'Preview cannot exceed 500 characters'],
    trim: true
  },

  /**
   * Full article content in markdown format
   * @type {String}
   * @required
   */
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },

  /**
   * Optional featured image URL
   * @type {String}
   * @optional
   */
  imageUrl: {
    type: String,
    trim: true,
    default: undefined
  },

  /**
   * Author of the article
   * @type {String}
   * @required
   * @maxLength 100
   */
  author: {
    type: String,
    required: [true, 'Author is required'],
    maxlength: [100, 'Author name cannot exceed 100 characters'],
    trim: true
  },

  /**
   * Whether the article is published
   * @type {Boolean}
   * @default false
   */
  published: {
    type: Boolean,
    default: false,
    index: true
  },

  /**
   * When the article was published
   * @type {Date}
   * @default Date.now
   */
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  /**
   * Number of times the article was viewed
   * @type {Number}
   * @default 0
   * @min 0
   */
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  }

}, {
  timestamps: true,
  collection: 'news'
});

// Indexes for performance
NewsSchema.index({ published: 1, publishedAt: -1 }); // For fetching published articles by date
NewsSchema.index({ slug: 1 }); // For finding articles by slug
NewsSchema.index({ createdAt: -1 }); // For admin sorting
NewsSchema.index({ views: -1 }); // For popular articles

/**
 * Pre-save middleware to generate slug from title if not provided
 */
NewsSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
  next();
});

/**
 * Static method to find published articles
 */
NewsSchema.statics.findPublished = function() {
  return this.find({ published: true }).sort({ publishedAt: -1 });
};

/**
 * Static method to find article by slug
 */
NewsSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, published: true });
};


const News = mongoose.model<INews>('News', NewsSchema);

export default News;