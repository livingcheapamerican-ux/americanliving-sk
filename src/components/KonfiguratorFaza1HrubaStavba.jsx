import React, { useState, useEffect, useRef } from "react";
import { Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";

// Tile Component
function Tile({ icon: Icon, title, subtitle, price, isSelected, onClick, tooltip, isAdmin, onPriceUpdate, tileId, showTooltip }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipDelayed, setShowTooltipDelayed] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState(price);
  const tileRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setEditedPrice(price);
  }, [price]);

  useEffect(() => {
    if (isHovered && tooltip && showTooltip) {
      timeoutRef.current = setTimeout(() => {
        if (tileRef.current) {
          const rect = tileRef.current.getBoundingClientRect();
          const tooltipWidth = 300;
          let left = rect.left + rect.width / 2 - tooltipWidth / 2;
          
          if (left < 10) left = 10;
          if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
          }

          setTooltipPosition({
            top: rect.bottom + window.scrollY + 8,
            left: left + window.scrollX,
          });
        }
        setShowTooltipDelayed(true);
      }, 500);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowTooltipDelayed(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered, tooltip, showTooltip]);

  const handlePriceUpdate = () => {
    const newPrice = parseFloat(editedPrice);
    if (!isNaN(newPrice) && onPriceUpdate) {
      onPriceUpdate(tileId, newPrice);
      setIsEditingPrice(false);
    }
  };

  return (
    <>
      <motion.div
        ref={tileRef}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
          isSelected
            ? 'bg-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-300'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20 pointer-events-none"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[3]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center text-center">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-700" />
          <span className="font-semibold text-gray-800 text-[10px] sm:text-sm leading-tight">{title}</span>
          {subtitle && (
            <span className="text-[8px] sm:text-xs text-gray-500 mt-0.5 leading-tight">{subtitle}</span>
          )}
          
          {price !== null && price !== undefined && (
            <span className={`${price > 0 ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-[9px] sm:text-xs mt-1`}>
              {price === 0 ? '0 €' : `+ ${price.toLocaleString('sk-SK')} €`}
            </span>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showTooltipDelayed && tooltip && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 9999,
            }}
            className="w-[300px] bg-gray-900 text-white p-4 rounded-lg shadow-2xl"
          >
            <div className="text-sm leading-relaxed">{tooltip}</div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Default prices - fallback if dom doesn't have custom prices
const DEFAULT_PRICES = {
  montaz_ano: 0,
  montaz_nie: 0,
  izolacia_standardna: 0,
  izolacia_zvysena: 0,
  izolacia_premium: 0,
  izolacia_extra: 0,
  zaklady_vruty: 0,
  zaklady_doska: 0,
  zaklady_pasove: 0,
};

export default function KonfiguratorFaza1HrubaStavba({ 
  dom, 
  onSelectionChange, 
  isAdmin = false,
  onPriceUpdate,
  showTooltips = true,
  initialSelections = {}
}) {
  const { t } = useLanguage();

  // Get prices - custom prices from dom or defaults
  const getPrice = (itemId) => {
    if (dom?.konfigurator_custom_ceny_prosto_house?.[itemId] !== undefined) {
      return dom.konfigurator_custom_ceny_prosto_house[itemId];
    }
    return DEFAULT_PRICES[itemId] || 0;
  };

  const [montaz, setMontaz] = useState(initialSelections.montaz || null);
  const [izolacia, setIzolacia] = useState(initialSelections.izolacia || null);
  const [zaklady, setZaklady] = useState(initialSelections.zaklady || null);

  // Notify parent of changes
  useEffect(() => {
    if (onSelectionChange) {
      const selections = {
        montaz,
        izolacia,
        zaklady,
        items: []
      };

      let totalPrice = 0;

      if (montaz) {
        const price = getPrice(montaz);
        totalPrice += price;
        selections.items.push({
          id: montaz,
          name: montaz === 'montaz_ano' ? 'Montáž domu' : 'Bez montáže',
          price,
          category: 'montaz'
        });
      }

      if (izolacia) {
        const price = getPrice(izolacia);
        totalPrice += price;
        const izolaciaNames = {
          izolacia_standardna: 'Izolácia štandardná',
          izolacia_zvysena: 'Izolácia zvýšená',
          izolacia_premium: 'Izolácia premium',
          izolacia_extra: 'Extra izolácia'
        };
        selections.items.push({
          id: izolacia,
          name: izolaciaNames[izolacia] || izolacia,
          price,
          category: 'izolacia'
        });
      }

      if (zaklady) {
        const price = getPrice(zaklady);
        totalPrice += price;
        const zakladyNames = {
          zaklady_vruty: 'Základy - vruty',
          zaklady_doska: 'Základy - doska',
          zaklady_pasove: 'Základy - pásové'
        };
        selections.items.push({
          id: zaklady,
          name: zakladyNames[zaklady] || zaklady,
          price,
          category: 'zaklady'
        });
      }

      selections.totalPrice = totalPrice;
      onSelectionChange(selections);
    }
  }, [montaz, izolacia, zaklady, dom]);

  return (
    <div className="space-y-6">
      {/* Montáž */}
      <div className="p-2 sm:p-3 border-[3px] sm:border-[4px] border-amber-600 rounded-xl bg-amber-100/70 shadow-xl">
        <p className="text-[9px] sm:text-[10px] font-bold text-amber-700 mb-3 flex items-center gap-1">
          <span className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">1</span>
          {t('assembly')} ({t('selectOne')})
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Tile
            icon={() => <span className="text-2xl">🏗️</span>}
            title="Montáž domu"
            subtitle="Profesionálna montáž na kľúč"
            price={getPrice('montaz_ano')}
            isSelected={montaz === 'montaz_ano'}
            onClick={() => setMontaz('montaz_ano')}
            tooltip="Kompletná montáž domu vrátane práce a materiálu"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="montaz_ano"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-2xl">❌</span>}
            title="Bez montáže"
            subtitle="Len dodanie domu"
            price={0}
            isSelected={montaz === 'montaz_nie'}
            onClick={() => setMontaz('montaz_nie')}
            tooltip="Dom dodáme bez montáže"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="montaz_nie"
            showTooltip={showTooltips}
          />
        </div>
      </div>

      {/* Izolácia */}
      <div className="p-2 sm:p-3 border-[3px] sm:border-[4px] border-cyan-600 rounded-xl bg-cyan-100/70 shadow-xl">
        <p className="text-[9px] sm:text-[10px] font-bold text-cyan-700 mb-3 flex items-center gap-1">
          <span className="w-4 h-4 sm:w-5 sm:h-5 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">2</span>
          {t('insulation')} ({t('selectOne')})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Tile
            icon={() => <span className="text-2xl">🏠</span>}
            title="Štandardná"
            subtitle="Základná izolácia"
            price={0}
            isSelected={izolacia === 'izolacia_standardna'}
            onClick={() => setIzolacia('izolacia_standardna')}
            tooltip="Štandardná izolácia zahrnutá v cene"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_standardna"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-2xl">🔥</span>}
            title="Zvýšená"
            subtitle="Lepšia izolácia"
            price={getPrice('izolacia_zvysena')}
            isSelected={izolacia === 'izolacia_zvysena'}
            onClick={() => setIzolacia('izolacia_zvysena')}
            tooltip="Zvýšená izolácia pre lepšie tepelné vlastnosti"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_zvysena"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-2xl">⭐</span>}
            title="Premium"
            subtitle="Prémiová izolácia"
            price={getPrice('izolacia_premium')}
            isSelected={izolacia === 'izolacia_premium'}
            onClick={() => setIzolacia('izolacia_premium')}
            tooltip="Premium izolácia pre najvyššiu energetickú efektívnosť"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_premium"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-2xl">🌟</span>}
            title="Extra"
            subtitle="Maximálna izolácia"
            price={getPrice('izolacia_extra')}
            isSelected={izolacia === 'izolacia_extra'}
            onClick={() => setIzolacia('izolacia_extra')}
            tooltip="Extra izolácia pre pasívne domy"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_extra"
            showTooltip={showTooltips}
          />
        </div>
      </div>

      {/* Základy */}
      <div className="p-2 sm:p-3 border-[3px] sm:border-[4px] border-orange-600 rounded-xl bg-orange-100/70 shadow-xl">
        <p className="text-[9px] sm:text-[10px] font-bold text-orange-700 mb-3 flex items-center gap-1">
          <span className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">3</span>
          {t('foundations')} ({t('selectOne')})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Tile
            icon={() => <span className="text-2xl">🔩</span>}
            title="Vruty"
            subtitle="Vrútené základy"
            price={getPrice('zaklady_vruty')}
            isSelected={zaklady === 'zaklady_vruty'}
            onClick={() => setZaklady('zaklady_vruty')}
            tooltip="Rýchle a efektívne vrútené základy"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="zaklady_vruty"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-2xl">🏗️</span>}
            title="Doska"
            subtitle="Betónová doska"
            price={getPrice('zaklady_doska')}
            isSelected={zaklady === 'zaklady_doska'}
            onClick={() => setZaklady('zaklady_doska')}
            tooltip="Klasická betónová doska"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="zaklady_doska"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-2xl">🧱</span>}
            title="Pásové"
            subtitle="Pásové základy"
            price={getPrice('zaklady_pasove')}
            isSelected={zaklady === 'zaklady_pasove'}
            onClick={() => setZaklady('zaklady_pasove')}
            tooltip="Tradičné pásové základy"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="zaklady_pasove"
            showTooltip={showTooltips}
          />
        </div>
      </div>
    </div>
  );
}