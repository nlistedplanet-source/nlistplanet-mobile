import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { haptic } from '../../utils/helpers';

/**
 * Reusable page header with optional back button and logo
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle text
 * @param {boolean} showBack - Show back button (default: true)
 * @param {boolean} showLogo - Show brand logo (default: false)
 * @param {React.ReactNode} rightAction - Optional right side action button/element
 * @param {string} className - Additional CSS classes
 */
function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  showLogo = false,
  rightAction,
  className = '',
  onBack
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    haptic.light();
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 border-b border-gray-100 dark:border-zinc-800/50 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 shadow-sm active:scale-90 transition-transform touch-feedback"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          {showLogo && (
            <div className="p-1 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
              <BrandLogo size={32} />
            </div>
          )}
          <div className="flex flex-col">
            {title && (
              <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Optional action */}
        {rightAction && (
          <div className="flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
