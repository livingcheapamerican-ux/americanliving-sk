import React, { useState, useEffect, useRef } from "react";
import { Check, Info, Home } from "lucide-react";
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
        className={`relative p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 border-3 min-h-[140px] flex flex-col items-center justify-center ${
          isSelected
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-xl ring-2 ring-green-300'
            : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-lg'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[3]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center text-center gap-2">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${
            isSelected ? 'bg-green-500' : 'bg-gray-100'
          }`}>
            <Icon className={`w-7 h-7 sm:w-10 sm:h-10 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className={`font-bold text-gray-900 text-sm sm:text-base ${isSelected ? 'text-green-700' : ''}`}>
            {title}
          </span>
          {subtitle && (
            <span className="text-xs sm:text-sm text-gray-600 leading-tight">{subtitle}</span>
          )}
          
          {price !== null && price !== undefined && (
            <span className={`${price > 0 ? "font-extrabold text-green-600 text-base sm:text-lg" : "text-gray-500 font-semibold text-sm"} mt-2`}>
              {price === 0 ? 'Zahrnuté' : `+ ${price.toLocaleString('sk-SK')} €`}
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

  // Synchronizovať s externými zmenami
  useEffect(() => {
    if (initialSelections.izolacia && initialSelections.izolacia !== izolacia) {
      setIzolacia(initialSelections.izolacia);
    }
    if (initialSelections.montaz && initialSelections.montaz !== montaz) {
      setMontaz(initialSelections.montaz);
    }
    if (initialSelections.zaklady && initialSelections.zaklady !== zaklady) {
      setZaklady(initialSelections.zaklady);
    }
  }, [initialSelections.izolacia, initialSelections.montaz, initialSelections.zaklady]);

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
      {/* Header Fáza 1 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl p-4 flex items-center gap-3">
        <div className="bg-white/20 p-3 rounded-xl">
          <Home className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase">Fáza 1</span>
          </div>
          <h2 className="text-xl font-bold text-white">Hrubá stavba</h2>
          <p className="text-white/90 text-sm">Konštrukcia, izolácia a základy</p>
        </div>
      </div>

      {/* Montáž */}
      <div className="p-3 sm:p-4 border-[3px] sm:border-[4px] border-orange-500 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 shadow-xl">
        <p className="text-sm sm:text-base font-bold text-orange-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold">1</span>
          Montáž hrubej stavby (vyberte jednu)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Tile
            icon={() => <span className="text-3xl">🔧</span>}
            title="Bez montáže"
            subtitle="Iba sada"
            price={0}
            isSelected={montaz === 'montaz_nie'}
            onClick={() => setMontaz('montaz_nie')}
            tooltip="Dom dodáme bez montáže - iba stavebný kit"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="montaz_nie"
            showTooltip={showTooltips}
          />
          <Tile
            icon={Home}
            title="S montážou"
            subtitle="Hrubá stavba"
            price={getPrice('montaz_ano')}
            isSelected={montaz === 'montaz_ano'}
            onClick={() => setMontaz('montaz_ano')}
            tooltip="Kompletná montáž domu vrátane práce a materiálu"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="montaz_ano"
            showTooltip={showTooltips}
          />
        </div>
      </div>

      {/* Izolácia */}
      <div className="p-3 sm:p-4 border-[3px] sm:border-[4px] border-cyan-500 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl">
        <p className="text-sm sm:text-base font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold">2</span>
          Izolácia (vyberte jednu)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Tile
            icon={() => <span className="text-3xl">🧊</span>}
            title="Celoročná izolácia"
            subtitle="150/200mm"
            price={0}
            isSelected={izolacia === 'izolacia_standardna'}
            onClick={() => setIzolacia('izolacia_standardna')}
            tooltip="Štandardná celoročná izolácia 150/200mm"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_standardna"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-3xl">🔥</span>}
            title="200mm"
            subtitle="200mm/250mm"
            price={getPrice('izolacia_zvysena')}
            isSelected={izolacia === 'izolacia_zvysena'}
            onClick={() => setIzolacia('izolacia_zvysena')}
            tooltip="Zvýšená izolácia 200mm steny, 250mm strecha"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_zvysena"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <div className="flex items-center gap-1"><span className="text-2xl">⭐</span><span className="text-xs bg-green-500 text-white px-1 rounded">A0</span></div>}
            title="250mm"
            subtitle="250mm/300mm"
            price={getPrice('izolacia_premium')}
            isSelected={izolacia === 'izolacia_premium'}
            onClick={() => setIzolacia('izolacia_premium')}
            tooltip="Premium izolácia 250mm steny, 300mm strecha pre A0"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_premium"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <div className="flex items-center gap-1"><span className="text-2xl">🌟</span><span className="text-xs bg-green-500 text-white px-1 rounded">A0</span></div>}
            title="Extra izolácia"
            subtitle="300mm"
            price={getPrice('izolacia_extra')}
            isSelected={izolacia === 'izolacia_extra'}
            onClick={() => setIzolacia('izolacia_extra')}
            tooltip="Extra izolácia 300mm pre pasívne domy"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="izolacia_extra"
            showTooltip={showTooltips}
          />
        </div>
      </div>

      {/* Základy */}
      <div className="p-3 sm:p-4 border-[3px] sm:border-[4px] border-red-500 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 shadow-xl">
        <p className="text-sm sm:text-base font-bold text-red-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold">3</span>
          Základy (vyberte jednu)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Tile
            icon={() => <span className="text-3xl">🏛️</span>}
            title="Bez základov"
            subtitle="Vlastné"
            price={0}
            isSelected={zaklady === 'zaklady_bez'}
            onClick={() => setZaklady('zaklady_bez')}
            tooltip="Bez základov - vlastné riešenie"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="zaklady_bez"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-3xl">🔩</span>}
            title="Zemné skrutky / Pätky"
            subtitle="Zemné pätky"
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
            icon={() => <span className="text-3xl">🏗️</span>}
            title="Základová doska"
            subtitle="Základová"
            price={getPrice('zaklady_doska')}
            isSelected={zaklady === 'zaklady_doska'}
            onClick={() => setZaklady('zaklady_doska')}
            tooltip="Klasická betónová základová doska"
            isAdmin={isAdmin}
            onPriceUpdate={onPriceUpdate}
            tileId="zaklady_doska"
            showTooltip={showTooltips}
          />
          <Tile
            icon={() => <span className="text-3xl">🧱</span>}
            title="Pásové základy"
            subtitle="Základy"
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