import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Emoji/ikony pre jednotlivé animácie
const FLYING_ITEMS = {
  montaz: "👷‍♂️👷👷‍♀️", // robotníci
  izolacia: "🌡️", // teplomer
  skrutky: "🔩", // skrutky
  beton: "🚛", // domiešavač
  elektro: "💡", // žiarovka
  voda: "🚰", // potrubie s vodou
  sanita: "🚿🪥🚽", // sanita
  bojler: "🔥", // bojler
  klimatizacia: "❄️", // klimatizácia
  rekuperacia: "🌀", // ventilátor
  siete: "🚜", // bager
  dvereKovove: "🚪", // antracit dvere
  dverePlastove: "🚪", // biele dvere
  okno: "🪟", // okno
  oknoAntracit: "⬛", // antracit okno
  oknoTonovane: "🕶️", // tónované
  fasadaStandard: "🏠", // domček antracit
  fasadaSuchana: "🏡", // domček biely
  drevo: "🪵", // drevo
  sadrokarton: "📋", // sadrokartón
  podlaha: "🪵", // lamely
  podlahovVykurovanie: "🔌", // rohože
  interieroveDvere: "🚪", // dvere
  pergola: "🪵", // drevo pergoly
  inziniering: "👩‍💼📄", // žena s papiermi
  projektant: "✏️📑", // ceruzka s papiermi
  doprava: "🚚", // kamión
};

export default function FlyingAnimation({ 
  trigger, 
  type, 
  startPosition, 
  endPosition,
  onComplete 
}) {
  const [isFlying, setIsFlying] = useState(false);
  const [flyingItem, setFlyingItem] = useState(null);

  useEffect(() => {
    if (trigger && type && startPosition) {
      setFlyingItem(FLYING_ITEMS[type] || "⭐");
      setIsFlying(true);
      
      const timer = setTimeout(() => {
        setIsFlying(false);
        if (onComplete) onComplete();
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, type, startPosition]);

  if (!isFlying || !startPosition) return null;

  // Vypočítať pozíciu floating panelu (vpravo hore)
  const targetX = window.innerWidth - 200;
  const targetY = 300;

  return (
    <AnimatePresence>
      {isFlying && (
        <motion.div
          initial={{ 
            position: "fixed",
            left: startPosition.x,
            top: startPosition.y,
            scale: 11,
            opacity: 1,
            zIndex: 9999,
          }}
          animate={{ 
            left: targetX,
            top: targetY,
            scale: 5.5,
            opacity: 0.8,
            rotate: type === "skrutky" ? 720 : type === "rekuperacia" ? 360 : 0,
          }}
          exit={{ 
            opacity: 0,
            scale: 0 
          }}
          transition={{ 
            duration: 6.3,
            ease: "easeInOut",
          }}
          className="pointer-events-none text-3xl"
          style={{ filter: type === "elektro" ? "drop-shadow(0 0 30px yellow)" : "none" }}
        >
          {flyingItem}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook pre použitie animácie
export function useFlyingAnimation() {
  const [animations, setAnimations] = useState([]);

  const triggerAnimation = (type, element) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const id = Date.now();
    
    setAnimations(prev => [...prev, {
      id,
      type,
      startPosition: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    }]);

    // Odstrániť animáciu po dokončení
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  return { animations, triggerAnimation };
}

// Komponent pre vykreslenie všetkých aktívnych animácií
export function FlyingAnimationContainer({ animations }) {
  return (
    <>
      {animations.map(anim => (
        <FlyingAnimation
          key={anim.id}
          trigger={true}
          type={anim.type}
          startPosition={anim.startPosition}
        />
      ))}
    </>
  );
}