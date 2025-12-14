import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ExternalLink, ChevronUp, ChevronDown, BookOpen, Calendar } from 'lucide-react';
import LandingBottomNav from '../components/common/LandingBottomNav';

const BlogPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Get base API URL without /api suffix for news endpoint
  const getBaseUrl = () => {
    const envUrl = process.env.REACT_APP_API_URL || 'https://api.nlistplanet.com/api';
    // Remove /api suffix if present to avoid double /api/api
    return envUrl.replace(/\/api\/?$/, '');
  };
  const BASE_URL = getBaseUrl();

  const categories = ['All', 'IPO', 'Market', 'Unlisted', 'Startup', 'Regulatory'];

  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const categoryParam = activeCategory !== 'All' ? `?category=${activeCategory}&limit=50` : '?limit=50';
      const response = await fetch(`${BASE_URL}/api/news${categoryParam}`);
      
      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      setNews(data.data || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to load news');
    } finally {
      setLoading(false);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goToNext = () => {
    if (currentIndex < news.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-IN', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'from-purple-600 to-purple-800',
      'Market': 'from-blue-600 to-blue-800',
      'Unlisted': 'from-emerald-600 to-emerald-800',
      'Startup': 'from-orange-600 to-orange-800',
      'Analysis': 'from-cyan-600 to-cyan-800',
      'Regulatory': 'from-red-600 to-red-800',
      'Company': 'from-indigo-600 to-indigo-800',
      'General': 'from-gray-600 to-gray-800'
    };
    return colors[category] || colors['General'];
  };

  const handleShare = async (article) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: `${window.location.origin}/blog/${article._id}`
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${article.title}\n\n${article.summary}`);
      alert('Copied to clipboard!');
    }
  };

  const currentArticle = news[currentIndex];

  if (loading) {
    return null;
  }

  if (error || news.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 mb-2">{error || 'No news available'}</p>
          <button
            onClick={fetchNews}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-950 border-b border-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/new_logo.png" 
              alt="NlistPlanet" 
              className="w-7 h-7 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-white font-bold">News</span>
          </div>

          <div className="bg-gray-800 px-2 py-1 rounded-lg">
            <span className="text-emerald-400 text-xs font-bold">{currentIndex + 1}</span>
            <span className="text-gray-500 text-xs">/{news.length}</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex gap-1.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Inshorts-style Card */}
      <div
        className="flex-1 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentArticle && (
          <div className="h-full flex flex-col">
            {/* Image Section - Inshorts Style (50% height) */}
            <div className={`h-[50%] relative bg-gradient-to-br ${getCategoryColor(currentArticle.category)}`}>
              {currentArticle.thumbnail ? (
                <img
                  src={currentArticle.thumbnail}
                  alt={currentArticle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/20" />
                </div>
              )}
              
              {/* Gradient overlay - lighter for better image visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
              
              {/* Category Badge - Smaller, top-left */}
              <div className="absolute top-2.5 left-2.5">
                <span className={`px-2.5 py-1 bg-gradient-to-r ${getCategoryColor(currentArticle.category)} text-white text-[10px] font-bold rounded-full shadow-lg`}>
                  {currentArticle.category}
                </span>
              </div>

              {/* Source Badge - Compact */}
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
                <span className="text-white text-[9px] font-semibold">{currentArticle.sourceName}</span>
              </div>

              {/* Navigation Arrows - Smaller */}
              <div className="absolute right-2.5 bottom-2.5 flex flex-col gap-1">
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    currentIndex === 0 
                      ? 'bg-black/30 text-gray-500' 
                      : 'bg-black/70 text-white backdrop-blur-sm'
                  }`}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === news.length - 1}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    currentIndex === news.length - 1 
                      ? 'bg-black/30 text-gray-500' 
                      : 'bg-black/70 text-white backdrop-blur-sm'
                  }`}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Content Section - Inshorts Style (50% height) */}
            <div className="h-[50%] bg-gray-950 px-4 pt-3 pb-20 flex flex-col">
              {/* Headline - Inshorts Style (Bigger & Bold) */}
              <h1 className="text-white font-bold text-[18px] leading-tight mb-3">
                {currentArticle.title}
              </h1>

              {/* Hindi Summary - Prominent (Inshorts main content) */}
              {currentArticle.hindiSummary && (
                <div className="mb-3">
                  <p className="text-gray-100 text-[15px] leading-[1.65] font-hindi">
                    {currentArticle.hindiSummary}
                  </p>
                </div>
              )}

              {/* English Summary - Smaller, secondary */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent mb-2">
                <p className="text-gray-500 text-[13px] leading-relaxed">
                  {currentArticle.summary}
                </p>
              </div>

              {/* Bottom Actions - Compact */}
              <div className="pt-2.5 border-t border-gray-800/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                    <Calendar size={12} />
                    <span>{formatDate(currentArticle.publishedAt)}</span>
                  </div>
                  
                  <button
                    onClick={() => handleShare(currentArticle)}
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 active:scale-95 transition-transform"
                  >
                    <Share2 size={14} />
                  </button>
                </div>

                {/* Source Button - Inshorts Green Style */}
                {currentArticle.sourceUrl && (
                  <a
                    href={currentArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-emerald-500 text-white rounded-lg font-semibold text-[13px] active:scale-[0.98] transition-transform shadow-lg"
                  >
                    <span>पूरी खबर पढ़ें - {currentArticle.sourceName}</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Swipe Hint - Inshorts Style */}
            {currentIndex === 0 && (
              <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 animate-bounce">
                <div className="bg-emerald-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                  <ChevronUp size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-semibold">ऊपर स्वाइप करें</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <LandingBottomNav activePage="blog" />
    </div>
  );
};

export default BlogPage;
