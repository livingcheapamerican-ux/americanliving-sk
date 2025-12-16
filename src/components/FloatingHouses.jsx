import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function FloatingHouses({ side = "left" }) {
  const { data: allDomy = [] } = useQuery({
    queryKey: ['domy-floating'],
    queryFn: () => base44.entities.Dom.list('poradie', 50),
    staleTime: 300000,
  });

  // Len verejné domy od Ticabhouse a Prosto House s titulnou fotkou
  const domy = useMemo(() => {
    return allDomy
      .filter(d => 
        d.verejny === true && 
        d.hlavny_obrazok &&
        (d.vyrobca === "Ticab house" || d.vyrobca === "Prosto House")
      );
  }, [allDomy]);

  if (domy.length === 0) return null;

  const cardHeight = 180; // Výška jednej karty s domom
  const totalHeight = domy.length * cardHeight;
  
  // Ľavá strana: dole, Pravá strana: hore
  const isLeft = side === 'left';
  const initialY1 = isLeft ? 0 : -totalHeight;
  const animateY1 = isLeft ? -totalHeight : 0;
  const initialY2 = isLeft ? totalHeight : 0;
  const animateY2 = isLeft ? 0 : totalHeight;

  return (
    <div className="fixed top-20 bottom-0 w-[200px] z-10 hidden xl:block overflow-hidden pointer-events-none"
      style={{ 
        [side]: 'max(20px, calc(50% - 960px - 200px))',
      }}
    >
      <div className="relative h-full">
        {/* Prvý set domov */}
        <motion.div
          initial={{ y: initialY1 }}
          animate={{ y: animateY1 }}
          transition={{
            duration: domy.length * 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute"
          style={{ left: '20px', top: 0 }}
        >
          {domy.map((dom) => (
            <div key={dom.id} className="mb-0" style={{ height: cardHeight }}>
              <Link 
                to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}
                className="block group pointer-events-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-all"
                  style={{ width: '150px' }}
                >
                  {dom.hlavny_obrazok ? (
                    <img
                      src={dom.hlavny_obrazok}
                      alt={dom.nazov}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="p-2 bg-gradient-to-r from-red-600 to-red-700">
                    <p className="text-xs font-bold text-white text-center truncate">
                      {dom.nazov}
                    </p>
                    {dom.zakladna_cena && (
                      <p className="text-xs text-white/90 text-center mt-0.5">
                        {dom.zakladna_cena.toLocaleString('sk-SK')} €
                      </p>
                    )}
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </motion.div>

        {/* Druhý set domov pre seamless loop */}
        <motion.div
          initial={{ y: initialY2 }}
          animate={{ y: animateY2 }}
          transition={{
            duration: domy.length * 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute"
          style={{ left: '20px', top: 0 }}
        >
          {domy.map((dom) => (
            <div key={`${dom.id}-2`} className="mb-0" style={{ height: cardHeight }}>
              <Link 
                to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}
                className="block group pointer-events-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-all"
                  style={{ width: '150px' }}
                >
                  {dom.hlavny_obrazok ? (
                    <img
                      src={dom.hlavny_obrazok}
                      alt={dom.nazov}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="p-2 bg-gradient-to-r from-red-600 to-red-700">
                    <p className="text-xs font-bold text-white text-center truncate">
                      {dom.nazov}
                    </p>
                    {dom.zakladna_cena && (
                      <p className="text-xs text-white/90 text-center mt-0.5">
                        {dom.zakladna_cena.toLocaleString('sk-SK')} €
                      </p>
                    )}
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}