import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Share2, BookmarkPlus, ExternalLink, Home, BookOpen, Info, Mail, HelpCircle } from 'lucide-react';

const BlogDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // News API is on desktop backend
  const NEWS_API = 'https://nlistplanet-usm-v8dc.onrender.com';

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${NEWS_API}/api/news/${id}`);
      
      if (!response.ok) throw new Error('Article not found');
      
      const data = await response.json();
      setArticle(data.data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Unable to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'bg-purple-500/20 text-purple-400',
      'Market': 'bg-blue-500/20 text-blue-400',
      'Unlisted': 'bg-emerald-500/20 text-emerald-400',
      'Startup': 'bg-orange-500/20 text-orange-400',
      'Analysis': 'bg-cyan-500/20 text-cyan-400',
      'Regulatory': 'bg-red-500/20 text-red-400',
      'General': 'bg-gray-500/20 text-gray-400'
    };
    return colors[category] || colors['General'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error || 'Article not found'}</p>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/blog')}
            className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={18} />
            </button>
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="px-4 py-6">
        {/* Thumbnail */}
        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-48 object-cover rounded-2xl mb-4"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Clock size={12} />
            {article.readTime || 1} min read
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Eye size={12} />
            {article.views || 0} views
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
          {article.title}
        </h1>

        {/* Source & Date */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-bold">
              {article.sourceName?.charAt(0) || 'N'}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{article.sourceName || 'NlistPlanet'}</p>
            <p className="text-gray-500 text-xs">{formatDate(article.publishedAt)}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border-l-4 border-emerald-500">
          <p className="text-gray-300 text-sm leading-relaxed italic">
            {article.summary}
          </p>
        </div>

        {/* Content */}
        {article.content && (
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {article.content}
            </p>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-xs mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Read Full Article */}
        {article.sourceUrl && (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl"
          >
            Read Full Article
            <ExternalLink size={16} />
          </a>
        )}
      </article>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-gray-400 hover:text-gray-300"
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/blog')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl bg-emerald-500/20 text-emerald-400"
          >
            <BookOpen size={20} />
            <span className="text-[10px] font-medium">Blog</span>
          </button>
          <button
            onClick={() => navigate('/about')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-gray-400 hover:text-gray-300"
          >
            <Info size={20} />
            <span className="text-[10px] font-medium">About</span>
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-gray-400 hover:text-gray-300"
          >
            <Mail size={20} />
            <span className="text-[10px] font-medium">Contact</span>
          </button>
          <button
            onClick={() => navigate('/faq')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-gray-400 hover:text-gray-300"
          >
            <HelpCircle size={20} />
            <span className="text-[10px] font-medium">FAQ</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default BlogDetailPage;
