import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import NewsLatest from './NewsLatest';

interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  preview: string;
  content: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  views: number;
}

// News article viewer component that displays individual articles or the latest article by default
const NewsView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (token) {
      if (slug) {
        fetchArticleBySlug(slug);
      } else {
        fetchLatestArticle();
      }
    }
  }, [token, slug]);

  // Scroll to top when slug changes (new article)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smoothly scrolls page to top when user clicks scroll-to-top button
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetches specific news article by its slug from the API
  const fetchArticleBySlug = async (articleSlug: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/news/${articleSlug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setArticle(data.data.article);
      } else {
        setError('Article not found');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Error loading article');
    } finally {
      setLoading(false);
    }
  };

  // Fetches and displays the most recent news article when no specific slug is provided
  const fetchLatestArticle = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/news/latest?limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data.articles.length > 0) {
        const latestArticle = data.data.articles[0];
        setArticle(latestArticle);
        // Update URL to show the slug
        navigate(`/news/${latestArticle.slug}`, { replace: true });
      } else {
        setError('No articles found');
      }
    } catch (error) {
      console.error('Error fetching latest article:', error);
      setError('Error loading article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded w-3/4 mb-4"></div>
            <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded w-1/2 mb-8"></div>
            <div className="h-64 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded"></div>
              <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded w-5/6"></div>
              <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl  mb-4">
              {error}
            </h1>
            <button
              onClick={() => navigate('/news')}
              className="text-primary hover:text-primary-highlight hover:underline"
            >
              View all news
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <header className="mb-4">
          <h1 className="text-4xl  mb-4 lightmode-text-primary dark:darkmode-text-primary">
            {article.title}
          </h1>
          <div className="flex items-center justify-between text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-6">
            <div className="flex items-center space-x-4">
              <span>By {article.author}</span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{article.views} views</span>
            </div>
          </div>
          {article.imageUrl && (
            <div className="w-full h-64 mb-4 rounded-lg overflow-hidden relative">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover news-image"
              />
              <div className="news-gradient"></div>
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-md px-8 py-4 mb-12">
          <div className="prose prose-md dark:prose-invert max-w-none 
                          prose-headings:lightmode-text-primary dark:prose-headings:darkmode-text-primary
                          prose-p:text-sm lightmode-text-secondary dark:prose-p:darkmode-text-secondary
                          prose-p:leading-normal prose-p:mb-3
                          prose-li:text-sm lightmode-text-secondary dark:prose-li:darkmode-text-secondary
                          prose-strong:text-sm lightmode-text-secondary dark:prose-strong:darkmode-text-secondary
                          prose-h1:text-2xl prose-h1: prose-h1:mb-5 prose-h1:mt-1
                          prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-1
                          prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-1
                          prose-ul:mb-3 prose-ol:mb-3
                          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4
                          prose-code:px-1 prose-code:rounded">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>

        {/* Latest News Section */}
        <div className="mt-12">
          <h2 className="text-2xl  mb-6 lightmode-text-primary dark:darkmode-text-primary">
            Other News
          </h2>
          <NewsLatest limit={3} showLoadMore={true} excludeSlug={article.slug} />
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-primary hover:text-primary-highlight text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NewsView;