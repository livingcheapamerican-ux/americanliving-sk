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
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
          isSelected
            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-500 shadow-lg scale-105'
            : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-md'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-10"
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-3 relative z-0">
          <div className={`p-3 rounded-lg transition-colors ${
            isSelected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'
          }`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {subtitle && (
              <p className="text-xs text-gray-600">{subtitle}</p>
            )}
          </div>

          {price !== null && price !== undefined && (
            <div className="text-center">
              {isAdmin && isEditingPrice ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriceUpdate();
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingPrice(false);
                      setEditedPrice(price);
                    }}
                    className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <span className={`text-lg font-bold ${
                    isSelected ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {price === 0 ? 'Zahrnuté' : `+${price.toLocaleString()} €`}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingPrice(true);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      ✎
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {tooltip && showTooltip && (
            <Info className="w-4 h-4 text-gray-400" />
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
    <div className="space-y-8">
      {/* Montáž */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Montáž</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Izolácia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Základy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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