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

  const fetchNews = async () => {
    try {
      let url = `http://localhost:5000/api/news/latest?limit=${limit}`;
      
      // If we need to exclude a specific article, use the /other endpoint
      if (excludeSlug) {
        url = `http://localhost:5000/api/news/${excludeSlug}/other?limit=${limit}`;
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Latest Updates
        </h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0">
              <div className="flex gap-4">
                <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Latest Updates
      </h2>
      <div className="space-y-4">
        {news.map((item) => (
          <Link
            key={item._id}
            to={`/news/${item.slug}`}
            className="block border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors p-3"
          >
            <article>
              <div className="flex gap-4">
                <div className="w-24 h-16 flex-shrink-0 gradient-image">
                  <img 
                    src={item.imageUrl || `https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=200&fit=crop`} 
                    alt={item.title}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {item.preview}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.publishedAt)}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
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