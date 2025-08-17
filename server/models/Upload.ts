import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing an Upload document in MongoDB
 * @interface IUpload
 * @extends {Document}
 * @property {mongoose.Types.ObjectId} projectId - Reference to the Project this file belongs to
 * @property {string} fileName - Original name of the uploaded file
 * @property {string} filePath - Server path where the file is stored
 * @property {'image'|'video'|'document'|'other'} fileType - Type/category of the file
 * @property {number} fileSize - Size of the file in bytes
 * @property {boolean} isFeatured - Whether this file is the featured image for the project
 * @property {string} [altText] - Alternative text for accessibility (mainly for images)
 * @property {Date} createdAt - Timestamp when the file was uploaded
 */
export interface IUpload extends Document {
  projectId: mongoose.Types.ObjectId;
  fileName: string;
  filePath: string;
  fileType: 'image' | 'video' | 'document' | 'other';
  fileSize: number;
  isFeatured: boolean;
  altText?: string;
  createdAt: Date;
}

/**
 * Mongoose schema for Upload model
 * Defines the structure, validation rules, and indexes for project file uploads
 */
const uploadSchema = new Schema<IUpload>({
  /**
   * Reference to the Project this file belongs to
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
   * Original name of the uploaded file
   * @type {string}
   * @required
   * @maxlength 255
   */
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  /**
   * Server path where the file is stored (relative to uploads directory)
   * @type {string}
   * @required
   */
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },
  /**
   * Type/category of the file based on MIME type
   * @type {'image'|'video'|'document'|'other'}
   * @required
   * @enum
   */
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: {
      values: ['image', 'video', 'document', 'other'],
      message: 'File type must be one of: image, video, document, other'
    }
  },
  /**
   * Size of the file in bytes
   * @type {number}
   * @required
   * @min 0
   * @max 10485760 (10MB)
   */
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
  },
  /**
   * Whether this file is the featured image for the project
   * Only one file per project should be featured
   * @type {boolean}
   * @default false
   * @index
   */
  isFeatured: {
    type: Boolean,
    default: false
  },
  /**
   * Alternative text for accessibility (mainly for images)
   * @type {string}
   * @maxlength 255
   */
  altText: {
    type: String,
    trim: true,
    maxlength: [255, 'Alt text cannot exceed 255 characters']
  }
}, {
  /**
   * Automatically add createdAt timestamp (no updatedAt needed for files)
   */
  timestamps: { createdAt: true, updatedAt: false },
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
uploadSchema.index({ projectId: 1, createdAt: -1 }); // For project files sorted by upload date
uploadSchema.index({ fileType: 1 }); // For filtering by file type
uploadSchema.index({ isFeatured: 1 }); // For finding featured images

/**
 * Virtual property that returns the file extension
 * @returns {string} File extension (e.g., 'jpg', 'mp4', 'pdf')
 */
uploadSchema.virtual('fileExtension').get(function(this: IUpload) {
  const parts = this.fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});

/**
 * Virtual property that returns a human-readable file size
 * @returns {string} Formatted file size (e.g., '2.5 MB', '150 KB')
 */
uploadSchema.virtual('formattedSize').get(function(this: IUpload) {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

/**
 * Virtual property that returns the full URL for accessing the file
 * @returns {string} Complete URL for file access
 */
uploadSchema.virtual('fileUrl').get(function(this: IUpload) {
  return this.filePath.startsWith('/') ? this.filePath : `/${this.filePath}`;
});

/**
 * Pre-save middleware to ensure only one featured file per project
 * If setting a file as featured, remove featured status from other files in the same project
 */
uploadSchema.pre('save', async function(this: IUpload, next: (err?: Error) => void) {
  // If this file is being set as featured
  if (this.isFeatured && this.isModified('isFeatured')) {
    try {
      // Remove featured status from other files in the same project
      await mongoose.model('Upload').updateMany(
        { 
          projectId: this.projectId, 
          _id: { $ne: this._id } 
        },
        { isFeatured: false }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  
  next();
});

export default mongoose.model<IUpload>('Upload', uploadSchema);