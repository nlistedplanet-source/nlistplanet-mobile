import React from 'react';
import { Calendar, ExternalLink, Share2, ChevronUp } from 'lucide-react';

/**
 * InshortsNewsCard - Mobile-optimized vertical swipe news card
 * Shows Hindi summary prominently with full-screen image
 */
const InshortsNewsCard = ({ article, onShare, showSwipeHint = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('hi-IN', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'bg-purple-500',
      'Market': 'bg-blue-500',
      'Unlisted': 'bg-emerald-500',
      'Startup': 'bg-orange-500',
      'Regulatory': 'bg-red-500',
      'Company': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'IPO': 'from-purple-600 to-purple-800',
      'Market': 'from-blue-600 to-blue-800',
      'Unlisted': 'from-emerald-600 to-emerald-800',
      'Startup': 'from-orange-600 to-orange-800',
      'Regulatory': 'from-red-600 to-red-800',
      'Company': 'from-indigo-600 to-indigo-800'
    };
    return gradients[category] || 'from-gray-600 to-gray-800';
  };

  const handleShare = () => {
    if (onShare) {
      onShare(article);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-950 snap-start">
      {/* Image Section - Top 42% */}
      <div className={`h-[42%] relative bg-gradient-to-br ${getCategoryGradient(article.category)} overflow-hidden`}>
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/20 text-6xl font-bold">
              {article.category}
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${getCategoryColor(article.category)} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
            {article.category}
          </span>
        </div>

        {/* Source Badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-white text-[10px] font-medium">{article.sourceName}</span>
        </div>
      </div>

      {/* Content Section - Bottom 58% */}
      <div className="h-[58%] bg-gray-950 px-5 pt-4 pb-20 flex flex-col">
        {/* Title */}
        <h1 className="text-white font-bold text-[17px] leading-snug mb-4">
          {article.title}
        </h1>

        {/* Hindi Summary - Prominent Display (Inshorts Style) */}
        {article.hindiSummary && (
          <div className="mb-4 pb-4 border-b border-gray-800">
            <p className="text-gray-200 text-[15px] leading-[1.7] font-hindi">
              {article.hindiSummary}
            </p>
          </div>
        )}

        {/* English Summary - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 mb-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <p className="text-gray-400 text-[14px] leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-gray-800">
          {/* Date & Share Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar size={14} />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            
            <button
              onClick={handleShare}
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 active:scale-95 transition-transform"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Full Article Button */}
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/20"
            >
              <span>पूरी खबर - {article.sourceName}</span>
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Swipe Hint - Only on first card */}
      {showSwipeHint && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <ChevronUp size={16} className="text-emerald-400" />
            <span className="text-gray-300 text-xs font-medium">ऊपर स्वाइप करें</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InshortsNewsCard;
