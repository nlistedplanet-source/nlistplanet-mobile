import React, { useEffect, useState } from 'react';

const SnowfallMobile = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const createSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < 30; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 10 + Math.random() * 8,
          size: 1.5 + Math.random() * 3,
          opacity: 0.4 + Math.random() * 0.6,
          swayAmount: 30 + Math.random() * 80,
          swayDuration: 3 + Math.random() * 4,
        });
      }
      setSnowflakes(flakes);
    };

    createSnowflakes();
  }, []);

  return (
    <>
      <style>{`
        @keyframes snowfallMobileAnim {
          0% {
            top: -10vh;
            opacity: 1;
          }
          100% {
            top: 100vh;
            opacity: 0;
          }
        }

        @keyframes swayMobileAnim {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(var(--sway));
          }
        }

        .snowflake-mobile-item {
          position: fixed;
          top: -10vh;
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(255,255,255,0.95));
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(255,255,255,0.9);
          pointer-events: none;
          z-index: 9999;
          will-change: transform;
          opacity: var(--opacity);
        }

        .snowflake-mobile-item-animated {
          animation: snowfallMobileAnim var(--duration)s linear var(--delay)s infinite, swayMobileAnim var(--sway-duration)s ease-in-out var(--delay)s infinite;
        }
      `}</style>

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake-mobile-item snowflake-mobile-item-animated"
          style={{
            '--size': `${flake.size}px`,
            '--delay': `${flake.delay}s`,
            '--duration': `${flake.duration}s`,
            '--opacity': flake.opacity,
            '--sway': `${flake.swayAmount}px`,
            '--sway-duration': `${flake.swayDuration}s`,
            left: `${flake.left}%`,
          }}
        />
      ))}
    </>
  );
};

export default SnowfallMobile;
