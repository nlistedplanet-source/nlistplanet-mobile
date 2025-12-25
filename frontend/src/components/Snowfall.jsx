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
        @keyframes snowfall-mobile {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
        }

        @keyframes sway-mobile {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(var(--sway-amount));
          }
        }

        .snowflake-mobile {
          position: fixed;
          top: -10vh;
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 70%, transparent 100%);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255,255,255,0.9);
          pointer-events: none;
          z-index: 10;
          animation: snowfall-mobile var(--duration)s linear var(--delay)s infinite, sway-mobile var(--sway-duration)s ease-in-out var(--delay)s infinite;
          opacity: var(--opacity);
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake-mobile"
            style={{
              '--left': `${flake.left}%`,
              '--size': `${flake.size}px`,
              '--delay': `${flake.delay}s`,
              '--duration': `${flake.duration}s`,
              '--opacity': flake.opacity,
              '--sway-amount': `${flake.swayAmount}px`,
              '--sway-duration': `${flake.swayDuration}s`,
              left: `${flake.left}%`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default SnowfallMobile;
