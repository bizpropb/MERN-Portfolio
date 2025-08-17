import express from 'express';
import {
  getAllNews,
  getLatestNews,
  getNewsBySlug,
  getOtherNews,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       required:
 *         - title
 *         - preview
 *         - content
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the news article
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: The title of the news article
 *         slug:
 *           type: string
 *           maxLength: 250
 *           description: URL-friendly version of the title
 *         preview:
 *           type: string
 *           maxLength: 500
 *           description: Short preview text for the article
 *         content:
 *           type: string
 *           description: Full article content in markdown format
 *         imageUrl:
 *           type: string
 *           description: Optional featured image URL
 *         author:
 *           type: string
 *           maxLength: 100
 *           description: Author name
 *         published:
 *           type: boolean
 *           default: false
 *           description: Whether the article is published
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: When the article was published
 *         views:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of times the article was viewed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the article was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the article was last updated
 *       example:
 *         _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         title: "DevHub Launches 🥳"
 *         slug: "devhub-launches"
 *         preview: "After months of development, DevHub is finally live!"
 *         content: "# DevHub Launches\n\nWe're excited to announce..."
 *         imageUrl: "https://example.com/image.jpg"
 *         author: "DevHub Team"
 *         published: true
 *         publishedAt: "2024-01-15T10:30:00Z"
 *         views: 150
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all published news articles
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of articles per page
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "News articles retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalCount:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       500:
 *         description: Server error
 */
router.get('/', getAllNews);

/**
 * @swagger
 * /api/news/latest:
 *   get:
 *     summary: Get latest published news articles for homepage
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *         description: Number of latest articles to fetch
 *     responses:
 *       200:
 *         description: Latest news articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Latest news articles retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
router.get('/latest', getLatestNews);

/**
 * @swagger
 * /api/news/{slug}:
 *   get:
 *     summary: Get a news article by slug
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The article slug
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Article retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     article:
 *                       $ref: '#/components/schemas/News'
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', getNewsBySlug);

/**
 * @swagger
 * /api/news/{slug}/other:
 *   get:
 *     summary: Get other news articles excluding the current one
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Current article slug to exclude
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *         description: Number of other articles to fetch
 *     responses:
 *       200:
 *         description: Other news articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Other news articles retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
router.get('/:slug/other', getOtherNews);

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a new news article (admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - preview
 *               - content
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               preview:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               author:
 *                 type: string
 *                 maxLength: 100
 *               published:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: News article created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.post('/', protect, createNews);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update a news article (admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               preview:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               author:
 *                 type: string
 *                 maxLength: 100
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateNews);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete a news article (admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The article ID
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteNews);

export default router;