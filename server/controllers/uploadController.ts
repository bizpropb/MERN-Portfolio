import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Upload from '../models/Upload';
import Project from '../models/Project';

/**
 * @file Upload controller for handling file upload operations
 * @module controllers/uploadController
 * @description Controller for managing project file uploads including images, videos,
 * and documents. Supports featured image selection and file management.
 */

/**
 * Extended Request interface to include authenticated user data
 * @interface AuthRequest
 * @extends {Request}
 * @property {any} [user] - Authenticated user object from middleware
 */
interface AuthRequest extends Request {
  user?: any;
}

/**
 * Configure multer storage for file uploads
 * Files are stored in uploads/projects directory with unique names
 */
const storage = multer.diskStorage({
  /**
   * Determine the destination directory for uploaded files
   * @param {Request} req - Express request object
   * @param {Express.Multer.File} file - Uploaded file object
   * @param {Function} cb - Callback function
   */
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/projects');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  /**
   * Generate a unique filename for the uploaded file
   * @param {Request} req - Express request object
   * @param {Express.Multer.File} file - Uploaded file object
   * @param {Function} cb - Callback function
   */
  filename: function (req, file, cb) {
    // Generate unique filename: fieldname-timestamp-random.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${file.fieldname}-${uniqueSuffix}-${baseName}${ext}`);
  }
});

/**
 * File filter to validate uploaded file types
 * @param {any} req - Express request object
 * @param {any} file - Uploaded file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req: any, file: any, cb: any) => {
  // Define allowed MIME types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images, videos, PDF, and text files.`), false);
  }
};

/**
 * Multer configuration for file uploads
 * @const {multer.Multer} upload - Configured multer instance
 */
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 files per upload
  }
});

/**
 * @async
 * @function uploadProjectFiles
 * @description Upload multiple files for a specific project
 * @param {AuthRequest} req - Express request object with authentication and files
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.projectId - The project ID to upload files for
 * @param {Express.Multer.File[]} req.files - Array of uploaded files
 * @example
 * POST /api/upload/project/60f7b3b3b3b3b3b3b3b3b3b3
 * Content-Type: multipart/form-data
 * files: [image1.jpg, image2.png, video.mp4]
 */
export const uploadProjectFiles = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Verify project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      // Clean up uploaded files if project doesn't exist
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership or admin role
    if (project.userId.toString() !== userId && userRole !== 'admin') {
      // Clean up uploaded files if unauthorized
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload files for this project'
      });
    }

    // Process each uploaded file
    const uploadedFiles = await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        // Determine file type based on MIME type
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype.startsWith('video/') ? 'video' : 
                        file.mimetype === 'application/pdf' ? 'document' : 'other';

        const upload = new Upload({
          projectId,
          fileName: file.originalname,
          filePath: `/uploads/projects/${file.filename}`,
          fileType,
          fileSize: file.size,
          isFeatured: false
        });

        await upload.save();
        return upload;
      })
    );

    // If this is the first image uploaded and no featured image exists, make it featured
    const firstImage = uploadedFiles.find(file => file.fileType === 'image');
    if (firstImage) {
const existingFeatured = await Upload.findOne({ 
        projectId, 
        isFeatured: true 
      });
      
      if (!existingFeatured) {
        firstImage.isFeatured = true;
        await firstImage.save();
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Upload files error:', error);
    
    // Clean up files on error
    const files = req.files as Express.Multer.File[];
    if (files) {
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @async
 * @function getProjectFiles
 * @description Get all files associated with a project
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.projectId - The project ID to get files for
 * @queryParam {string} [type] - Filter by file type (image, video, document, other)
 * @example
 * GET /api/upload/project/60f7b3b3b3b3b3b3b3b3b3b3?type=image
 */
export const getProjectFiles = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Build filter
    const filter: any = { projectId };
    if (type) {
      filter.fileType = type;
    }

const files = await Upload.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 }); // Featured first, then by upload date

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

    res.json({
      success: true,
      data: {
        files,
        stats: {
          totalFiles: files.length,
          totalSize,
          fileTypes: {
            images: files.filter(f => f.fileType === 'image').length,
            videos: files.filter(f => f.fileType === 'video').length,
            documents: files.filter(f => f.fileType === 'document').length,
            other: files.filter(f => f.fileType === 'other').length
          }
        }
      }
    });
  } catch (error) {
    console.error('Get project files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @async
 * @function setFeaturedImage
 * @description Set a specific file as the featured image for a project
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.projectId - The project ID
 * @param {string} req.params.fileId - The file ID to set as featured
 * @example
 * PUT /api/upload/project/60f7b3b3b3b3b3b3b3b3b3b3/featured/60f7b3b3b3b3b3b3b3b3b3b4
 */
export const setFeaturedImage = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, fileId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify project ownership
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }

    // Verify file exists and belongs to project
const file = await Upload.findOne({ _id: fileId, projectId });
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found in this project'
      });
    }

    // Only images can be featured
    if (file.fileType !== 'image') {
      return res.status(400).json({
        success: false,
        message: 'Only images can be set as featured'
      });
    }

    // Remove featured status from all files in this project
await Upload.updateMany(
      { projectId },
      { isFeatured: false }
    );

    // Set new featured image
    file.isFeatured = true;
    await file.save();

    res.json({
      success: true,
      data: file,
      message: 'Featured image updated successfully'
    });
  } catch (error) {
    console.error('Set featured image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting featured image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @async
 * @function deleteProjectFile
 * @description Delete a file from a project and remove it from storage
 * @param {AuthRequest} req - Express request object with authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.projectId - The project ID
 * @param {string} req.params.fileId - The file ID to delete
 * @example
 * DELETE /api/upload/project/60f7b3b3b3b3b3b3b3b3b3b3/file/60f7b3b3b3b3b3b3b3b3b3b4
 */
export const deleteProjectFile = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, fileId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify project ownership
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }

    // Find and delete file record
const file = await Upload.findOneAndDelete({ _id: fileId, projectId });
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete physical file from storage
    const filePath = path.join(__dirname, '../../', file.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fsError) {
        console.warn('Failed to delete physical file:', fsError);
        // Continue even if physical file deletion fails
      }
    }

    // If this was a featured image, make another image featured if available
    if (file.isFeatured) {
const nextImage = await Upload.findOne({ 
        projectId, 
        fileType: 'image' 
      }).sort({ createdAt: 1 });
      
      if (nextImage) {
        nextImage.isFeatured = true;
        await nextImage.save();
      }
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFile: {
          id: file._id,
          fileName: file.fileName,
          fileType: file.fileType
        }
      }
    });
  } catch (error) {
    console.error('Delete project file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};