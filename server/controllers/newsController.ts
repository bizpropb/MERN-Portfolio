import { Request, Response } from 'express';
import News, { INews } from '../models/News';

/**
 * @file News controller for handling news article operations
 * @module controllers/newsController
 */

/**
 * @async
 * @function getAllNews
 * @description Get all published news articles with pagination
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @queryParam {number} [page=1] - Page number for pagination
 * @queryParam {number} [limit=10] - Number of articles per page
 */
export const getAllNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [articles, totalCount] = await Promise.all([
      News.find({ published: true })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug preview imageUrl author publishedAt views'),
      News.countDocuments({ published: true })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: 'News articles retrieved successfully',
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving news articles',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @async
 * @function getLatestNews
 * @description Get latest published news articles for homepage
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @queryParam {number} [limit=3] - Number of latest articles to fetch
 */
export const getLatestNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;

    const articles = await News.find({ published: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug preview imageUrl author publishedAt views');

    res.status(200).json({
      success: true,
      message: 'Latest news articles retrieved successfully',
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving latest news articles',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @async
 * @function getNewsbySlug
 * @description Get a specific news article by slug and increment view count
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.slug - Article slug
 */
export const getNewsBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const article = await News.findOne({ slug, published: true });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      message: 'Article retrieved successfully',
      data: {
        article
      }
    });
  } catch (error) {
    console.error('Get news by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving article',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @async
 * @function getOtherNews
 * @description Get other news articles excluding the current one
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @param {string} req.params.slug - Current article slug to exclude
 * @queryParam {number} [limit=3] - Number of other articles to fetch
 */
export const getOtherNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 3;

    const articles = await News.find({ 
      slug: { $ne: slug }, 
      published: true 
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug preview imageUrl author publishedAt views');

    res.status(200).json({
      success: true,
      message: 'Other news articles retrieved successfully',
      data: {
        articles
      }
    });
  } catch (error) {
    console.error('Get other news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving other news articles',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @async
 * @function createNews
 * @description Create a new news article (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, preview, content, imageUrl, author, published } = req.body;

    const news = new News({
      title,
      preview,
      content,
      imageUrl,
      author,
      published: published || false,
      publishedAt: published ? new Date() : undefined
    });

    await news.save();

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: {
        article: news
      }
    });
  } catch (error: any) {
    console.error('Create news error:', error);
    
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Article with this slug already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error creating news article',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @async
 * @function updateNews
 * @description Update a news article by ID (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, preview, content, imageUrl, author, published } = req.body;

    const updateData: Partial<INews> = {
      title,
      preview,
      content,
      imageUrl,
      author,
      published
    };

    // If publishing for the first time, set publishedAt
    if (published && !req.body.originallyPublished) {
      updateData.publishedAt = new Date();
    }

    const article = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: {
        article
      }
    });
  } catch (error: any) {
    console.error('Update news error:', error);
    
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error updating article',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @async
 * @function deleteNews
 * @description Delete a news article by ID (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await News.findByIdAndDelete(id);

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};