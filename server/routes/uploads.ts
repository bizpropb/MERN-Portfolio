import express from 'express';
import {
  upload,
  uploadProjectFiles as uploadFiles,
  getProjectFiles as getFiles,
  setFeaturedImage as setFeatured,
  deleteProjectFile as deleteFile
} from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { userOrAdmin, uploadLimiter } from '../middleware/roleAuth';

/**
 * @file Upload routes for project file management
 * @module routes/upload
 * @description Defines the API routes for uploading, managing, and serving project files.
 * Supports images, videos, documents with featured image functionality.
 */

// Initialize Express Router
const router = express.Router();

/**
 * @swagger
 * /api/upload/project/{projectId}:
 *   get:
 *     tags: [Upload]
 *     summary: Get project files
 *     description: Retrieve all files associated with a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID to get files for
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video, document, other]
 *         description: Filter files by type
 *     responses:
 *       200:
 *         description: Project files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 files:
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     fileName: "project-screenshot.png"
 *                     filePath: "/uploads/projects/file-1641234567890-screenshot.png"
 *                     fileType: "image"
 *                     fileSize: 245760
 *                     isFeatured: true
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                   - _id: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                     fileName: "demo-video.mp4"
 *                     filePath: "/uploads/projects/file-1641234567891-demo.mp4"
 *                     fileType: "video"
 *                     fileSize: 5242880
 *                     isFeatured: false
 *                     createdAt: "2024-01-15T11:00:00.000Z"
 *                 stats:
 *                   totalFiles: 2
 *                   totalSize: 5488640
 *                   fileTypes:
 *                     images: 1
 *                     videos: 1
 *                     documents: 0
 *                     other: 0
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Project not found"
 *   post:
 *     tags: [Upload]
 *     summary: Upload project files
 *     description: Upload multiple files for a project (images, videos, documents)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID to upload files for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Files to upload (max 5 files, 10MB each)
 *           encoding:
 *             files:
 *               contentType: image/*, video/*, application/pdf, text/plain
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "2 file(s) uploaded successfully"
 *               data:
 *                 - _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   fileName: "screenshot.png"
 *                   filePath: "/uploads/projects/files-1641234567890-screenshot.png"
 *                   fileType: "image"
 *                   fileSize: 245760
 *                   isFeatured: true
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                   fileName: "demo.mp4"
 *                   filePath: "/uploads/projects/files-1641234567891-demo.mp4"
 *                   fileType: "video"
 *                   fileSize: 5242880
 *                   isFeatured: false
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: No files uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Invalid file type: text/csv. Allowed types: images, videos, PDF, and text files."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to upload files for this project
 *       404:
 *         description: Project not found
 *       413:
 *         description: File too large (max 10MB per file)
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */

// Public route - anyone can view project files
router.get('/project/:projectId', getFiles);

// Protected routes - require authentication
router.use(protect);

/**
 * @swagger
 * /api/upload/project/{projectId}/featured/{fileId}:
 *   put:
 *     tags: [Upload]
 *     summary: Set featured image
 *     description: Set a specific image file as the featured image for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID to set as featured
 *     responses:
 *       200:
 *         description: Featured image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Featured image updated successfully"
 *               data:
 *                 _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 fileName: "new-featured.png"
 *                 filePath: "/uploads/projects/files-1641234567890-featured.png"
 *                 fileType: "image"
 *                 isFeatured: true
 *                 updatedAt: "2024-01-15T11:00:00.000Z"
 *       400:
 *         description: Only images can be set as featured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Only images can be set as featured"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to modify this project
 *       404:
 *         description: Project or file not found
 * 
 * /api/upload/project/{projectId}/file/{fileId}:
 *   delete:
 *     tags: [Upload]
 *     summary: Delete project file
 *     description: Delete a file from a project and remove it from storage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "File deleted successfully"
 *               data:
 *                 deletedFile:
 *                   id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                   fileName: "old-screenshot.png"
 *                   fileType: "image"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to modify this project
 *       404:
 *         description: Project or file not found
 */

// Upload files with rate limiting
router.post(
  '/project/:projectId',
  uploadLimiter,
  upload.array('files', 5),
  uploadFiles
);

// Featured image management
router.put('/project/:projectId/featured/:fileId', userOrAdmin, setFeatured);

// File deletion
router.delete('/project/:projectId/file/:fileId', userOrAdmin, deleteFile);

export default router;