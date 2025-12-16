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

  // Len verejné domy s titulnou fotkou
  const domy = useMemo(() => {
    return allDomy
      .filter(d => (d.verejny === true || d.verejny === undefined) && d.hlavny_obrazok)
      .slice(0, 4); // Max 4 domy na stranu
  }, [allDomy]);

  if (domy.length === 0) return null;

  return (
    <div className="fixed top-20 bottom-0 w-[180px] pointer-events-none z-10 hidden xl:block"
      style={{ 
        [side]: '50%',
        marginLeft: side === 'left' ? '-960px' : '960px',
      }}
    >
      <div className="relative h-full">
        {domy.map((dom, index) => {
          const delay = index * 5; // Rozdielny delay pre každý dom
          const duration = 15 + index * 2; // Rozdielna rýchlosť
          
          return (
            <motion.div
              key={dom.id}
              initial={{ y: side === 'left' ? '-120%' : '100vh' }}
              animate={{ 
                y: side === 'left' ? '100vh' : '-120%'
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay,
              }}
              className="absolute pointer-events-auto"
              style={{ 
                [side]: '20px',
                top: 0,
              }}
            >
              <Link 
                to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}
                className="block group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 3 }}
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}