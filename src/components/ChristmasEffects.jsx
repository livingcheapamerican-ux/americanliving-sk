import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Realistická snehová vločka
const Snowflake = ({ flake }) => (
  <div
    className="fixed pointer-events-none z-40"
    style={{
      left: `${flake.x}%`,
      top: '-10px',
      width: `${flake.size}px`,
      height: `${flake.size}px`,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
      boxShadow: '0 0 3px rgba(255,255,255,0.8)',
      animation: `snowfall-${flake.id} ${flake.duration}s linear infinite`,
      opacity: flake.opacity,
      filter: 'blur(0.5px)',
    }}
  />
);

// Santa na saniach komponenta
const SantaSleigh = ({ isVisible, direction, topPosition }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{ 
            top: `${topPosition}%`,
          }}
          initial={{ 
            x: direction === 'left' ? '100vw' : '-400px',
            opacity: 1 
          }}
          animate={{ 
            x: direction === 'left' ? '-400px' : '100vw',
            opacity: 1 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 15,
            ease: "linear"
          }}
        >
          <div 
            className="flex items-center"
            style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
          >
            {/* Soby */}
            <div className="flex items-center">
              <motion.span 
                className="text-4xl"
                animate={{ y: [0, -5, 0, -3, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              >
                🦌
              </motion.span>
              <motion.span 
                className="text-4xl -ml-2"
                animate={{ y: [0, -3, 0, -5, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              >
                🦌
              </motion.span>
              <motion.span 
                className="text-4xl -ml-2"
                animate={{ y: [0, -4, 0, -2, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                🦌
              </motion.span>
            </div>
            
            {/* Sane */}
            <span className="text-5xl -ml-1">🛷</span>
            
            {/* Santa kývajúci */}
            <motion.div
              className="relative -ml-3"
              animate={{ 
                rotate: [0, 3, 0, -3, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-5xl">🎅</span>
              {/* Kývajúca ruka */}
              <motion.span
                className="absolute -right-2 top-2 text-2xl"
                animate={{ 
                  rotate: [-20, 20, -20],
                  x: [0, 3, 0],
                }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
              >
                👋
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ChristmasEffects({ enabled = true }) {
  const [snowflakes, setSnowflakes] = useState([]);
  const [santaVisible, setSantaVisible] = useState(false);
  const [santaDirection, setSantaDirection] = useState('right');
  const [santaTop, setSantaTop] = useState(15);

  // Generovanie realistických snehových vločiek
  useEffect(() => {
    if (!enabled) {
      setSnowflakes([]);
      return;
    }

    const createSnowflake = () => {
      const id = Math.random().toString(36).substr(2, 9);
      return {
        id,
        x: Math.random() * 100,
        size: 4 + Math.random() * 10,
        duration: 8 + Math.random() * 12,
        opacity: 0.5 + Math.random() * 0.4,
        drift: -20 + Math.random() * 40,
      };
    };

    // Vytvor počiatočné vločky
    const initialSnowflakes = Array.from({ length: 80 }, createSnowflake);
    setSnowflakes(initialSnowflakes);

    // Pridávaj nové vločky
    const interval = setInterval(() => {
      setSnowflakes(prev => {
        const newFlakes = prev.length > 130 ? prev.slice(5) : prev;
        return [...newFlakes, createSnowflake()];
      });
    }, 230);

    return () => clearInterval(interval);
  }, [enabled]);

  // Santa prechádza náhodne
  useEffect(() => {
    if (!enabled) {
      setSantaVisible(false);
      return;
    }

    const showSanta = () => {
      setSantaDirection(Math.random() > 0.5 ? 'right' : 'left');
      setSantaTop(10 + Math.random() * 15);
      setSantaVisible(true);
      
      setTimeout(() => {
        setSantaVisible(false);
      }, 16000);
    };

    const initialTimeout = setTimeout(showSanta, 3000 + Math.random() * 5000);

    const interval = setInterval(() => {
      if (!santaVisible) {
        showSanta();
      }
    }, 25000 + Math.random() * 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [enabled, santaVisible]);

  if (!enabled) return null;

  return (
    <>
      {/* CSS pre animáciu sneženia */}
      <style>{`
        ${snowflakes.map(flake => `
          @keyframes snowfall-${flake.id} {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: ${flake.opacity};
            }
            25% {
              transform: translateY(25vh) translateX(${flake.drift * 0.3}px) rotate(90deg);
            }
            50% {
              transform: translateY(50vh) translateX(${flake.drift}px) rotate(180deg);
              opacity: ${flake.opacity * 0.8};
            }
            75% {
              transform: translateY(75vh) translateX(${flake.drift * 0.5}px) rotate(270deg);
            }
            100% {
              transform: translateY(105vh) translateX(${flake.drift * 0.2}px) rotate(360deg);
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>

      {/* Snehové vločky */}
      {snowflakes.map(flake => (
        <Snowflake key={flake.id} flake={flake} />
      ))}

      {/* Santa na saniach */}
      <SantaSleigh isVisible={santaVisible} direction={santaDirection} topPosition={santaTop} />
    </>
  );
}