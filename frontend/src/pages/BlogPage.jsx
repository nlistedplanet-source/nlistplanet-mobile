import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Tag, Search, Filter, BookOpen, TrendingUp, Home, Info, Mail, HelpCircle, ChevronRight } from 'lucide-react';

const BlogPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('blog');

  // Strip /api suffix if present to avoid double /api/api
  const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'https://nlistplanet-usm-v8dc.onrender.com';

  const categories = ['All', 'IPO', 'Market', 'Unlisted', 'Startup', 'Analysis', 'Regulatory'];

  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const categoryParam = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
      const response = await fetch(`${API_BASE}/api/news${categoryParam}`);
      
      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      setNews(data.data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Market': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Unlisted': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Startup': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Analysis': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Regulatory': 'bg-red-500/20 text-red-400 border-red-500/30',
      'General': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Market News</h1>
              <p className="text-xs text-gray-500">Latest updates & insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/new_logo.png" 
              alt="NlistPlanet" 
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchNews}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium"
            >
              Try Again
            </button>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">No news found</p>
            <p className="text-gray-600 text-sm mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Article */}
            {filteredNews[0] && (
              <div 
                onClick={() => navigate(`/blog/${filteredNews[0]._id}`)}
                className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl overflow-hidden border border-emerald-500/20 cursor-pointer"
              >
                {filteredNews[0].thumbnail && (
                  <img
                    src={filteredNews[0].thumbnail}
                    alt={filteredNews[0].title}
                    className="w-full h-40 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(filteredNews[0].category)}`}>
                      {filteredNews[0].category}
                    </span>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(filteredNews[0].publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-lg mb-2 line-clamp-2">
                    {filteredNews[0].title}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {filteredNews[0].summary}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {filteredNews[0].views || 0} views
                    </span>
                    <span>{filteredNews[0].readTime || 1} min read</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Articles */}
            {filteredNews.slice(1).map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/blog/${item._id}`)}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                      <span>{item.sourceName}</span>
                      <span>•</span>
                      <span>{item.readTime || 1} min</span>
                    </div>
                  </div>
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <button className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl bg-emerald-500/20 text-emerald-400">
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

export default BlogPage;
