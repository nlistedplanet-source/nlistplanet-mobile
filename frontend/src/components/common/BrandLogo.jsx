import React from 'react';

function BrandLogo({ size = 64, className = '', alt = 'NlistPlanet' }) {
  const px = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      src={process.env.PUBLIC_URL + '/Logo.png'}
      alt={alt}
      className={className}
      style={{ 
        width: px, 
        height: px, 
        objectFit: 'contain',
        display: 'block'
      }}
      onError={(e) => {
        // graceful fallback to letter avatar
        const el = e.currentTarget;
        const parent = el.parentElement;
        if (parent) {
          const fallback = document.createElement('div');
          fallback.style.width = px;
          fallback.style.height = px;
          fallback.style.background = 'linear-gradient(135deg,#6366f1,#7c3aed)';
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
          fallback.style.borderRadius = '12px';
          fallback.innerHTML = '<span style="font-weight:700;color:#fff;font-size:24px">N</span>';
          el.replaceWith(fallback);
        }
      }}
    />
  );
}

export default BrandLogo;
