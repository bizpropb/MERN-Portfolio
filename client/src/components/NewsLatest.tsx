import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  preview: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  views: number;
}

interface LatestNewsProps {
  limit?: number;
  showLoadMore?: boolean;
  excludeSlug?: string;
}

// Displays latest news articles with optional load more functionality and article exclusion
const LatestNews: React.FC<LatestNewsProps> = ({ limit = 3, showLoadMore = true, excludeSlug }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchNews();
    }
  }, [token, excludeSlug]);

  // Fetches latest news articles from API with optional slug exclusion
  const fetchNews = async () => {
    try {
      let url = `http://localhost:5001/api/news/latest?limit=${limit}`;
      
      // If we need to exclude a specific article, use the /other endpoint
      if (excludeSlug) {
        url = `http://localhost:5001/api/news/${excludeSlug}/other?limit=${limit}`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setNews(data.data.articles);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
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

  const handleLoadMore = () => {
    navigate('/news');
  };

  if (loading) {
    return (
      <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-md p-6">
        <h2 className="text-2xl  mb-4">
          Latest Updates
        </h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border-b last:border-b-0 pb-6 last:pb-0">
              <div className="flex gap-4">
                <div className="w-24 h-16 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded w-3/4 mb-2"></div>
                  <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded w-full mb-1"></div>
                  <div className="h-4 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded w-2/3 mb-2"></div>
                  <div className="h-3 lightmode-highlight lightmode-text-primary dark:darkmode-highlight darkmode-text-primary rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-md p-6">
      <h2 className="text-2xl  mb-4">
        Latest Updates
      </h2>
      <div className="space-y-4">
        {news.map((item) => (
          <Link
            key={item._id}
            to={`/news/${item.slug}`}
            className="block border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0 lightmode-text-primary dark:darkmode-text-primary hover:lightmode-highlight dark:hover:darkmode-highlight rounded-lg transition-colors p-3"
          >
            <article>
              <div className="flex gap-4">
                <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden relative">
                  <img 
                    src={item.imageUrl || `https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=200&fit=crop`} 
                    alt={item.title}
                    className="w-full h-full object-cover news-image"
                  />
                  <div className="news-gradient"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 text-primary hover:text-primary-highlight">
                    {item.title}
                  </h3>
                  <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-2 line-clamp-2">
                    {item.preview}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs lightmode-text-secondary dark:darkmode-text-secondary">
                      {formatDate(item.publishedAt)}
                    </p>
                    <span className="text-xs lightmode-text-secondary dark:darkmode-text-secondary flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {item.views}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;