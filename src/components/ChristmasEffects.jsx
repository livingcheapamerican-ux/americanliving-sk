import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Snehová vločka komponenta
const Snowflake = ({ style }) => (
  <div
    className="fixed pointer-events-none text-white opacity-80 z-40"
    style={style}
  >
    ❄
  </div>
);

// Santa na saniach komponenta
const SantaSleigh = ({ isVisible, direction }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 pointer-events-none whitespace-nowrap"
          style={{ 
            top: `${15 + Math.random() * 20}%`,
            fontSize: direction === 'left' ? '2.5rem' : '2.5rem',
            transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
          initial={{ 
            x: direction === 'left' ? '100vw' : '-100vw',
            opacity: 1 
          }}
          animate={{ 
            x: direction === 'left' ? '-100vw' : '100vw',
            opacity: 1 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 8,
            ease: "linear"
          }}
        >
          <div className="flex items-center gap-1">
            {direction === 'right' ? (
              <>
                <span className="animate-bounce" style={{ animationDuration: '0.5s' }}>🦌</span>
                <span className="animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.1s' }}>🦌</span>
                <span className="animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.2s' }}>🦌</span>
                <span>🛷</span>
                <motion.span
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🎅
                </motion.span>
              </>
            ) : (
              <>
                <motion.span
                  animate={{ rotate: [0, -10, 0, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🎅
                </motion.span>
                <span>🛷</span>
                <span className="animate-bounce" style={{ animationDuration: '0.5s' }}>🦌</span>
                <span className="animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.1s' }}>🦌</span>
                <span className="animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.2s' }}>🦌</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ChristmasEffects() {
  const [snowflakes, setSnowflakes] = useState([]);
  const [santaVisible, setSantaVisible] = useState(false);
  const [santaDirection, setSantaDirection] = useState('right');

  // Generovanie snehových vločiek
  useEffect(() => {
    const createSnowflake = () => {
      const id = Date.now() + Math.random();
      const left = Math.random() * 100;
      const animationDuration = 5 + Math.random() * 10;
      const fontSize = 10 + Math.random() * 20;
      const delay = Math.random() * 2;

      return {
        id,
        style: {
          left: `${left}%`,
          top: '-20px',
          fontSize: `${fontSize}px`,
          animation: `snowfall ${animationDuration}s linear ${delay}s infinite`,
        }
      };
    };

    // Vytvor počiatočné vločky
    const initialSnowflakes = Array.from({ length: 50 }, createSnowflake);
    setSnowflakes(initialSnowflakes);

    // Pridávaj nové vločky priebežne
    const interval = setInterval(() => {
      setSnowflakes(prev => {
        if (prev.length > 80) {
          return [...prev.slice(10), createSnowflake()];
        }
        return [...prev, createSnowflake()];
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Santa prechádza náhodne
  useEffect(() => {
    const showSanta = () => {
      setSantaDirection(Math.random() > 0.5 ? 'right' : 'left');
      setSantaVisible(true);
      
      // Skry Santu po animácii
      setTimeout(() => {
        setSantaVisible(false);
      }, 9000);
    };

    // Prvý Santa po 5-15 sekundách
    const initialTimeout = setTimeout(showSanta, 5000 + Math.random() * 10000);

    // Potom každých 20-40 sekúnd
    const interval = setInterval(() => {
      if (!santaVisible) {
        showSanta();
      }
    }, 20000 + Math.random() * 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [santaVisible]);

  return (
    <>
      {/* CSS pre animáciu sneženia */}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Snehové vločky */}
      {snowflakes.map(flake => (
        <Snowflake key={flake.id} style={flake.style} />
      ))}

      {/* Santa na saniach */}
      <SantaSleigh isVisible={santaVisible} direction={santaDirection} />
    </>
  );
}