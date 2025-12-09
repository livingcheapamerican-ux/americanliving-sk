import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Send } from "lucide-react";
import { motion } from "framer-motion";

const Tile = ({ selected, onClick, title, subtitle, price, isPriced, isA0, isIncluded, hideIncludedMessage }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative p-2 rounded-md cursor-pointer transition-all border ${
        selected 
          ? isA0 
            ? "bg-green-100 border-green-500 shadow-md" 
            : "bg-blue-100 border-blue-500 shadow-md"
          : isA0
            ? "bg-green-50 border-green-300 hover:border-green-400"
            : isIncluded
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      {isA0 && (
        <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] px-1 py-0 z-10">
          ⚡A0
        </Badge>
      )}
      
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">✓</span>
        </div>
      )}
      
      <div className="text-center">
        <span className="font-semibold text-gray-800 text-base block leading-tight">{title}</span>
        {subtitle && <span className="text-xs text-gray-500 block mt-0.5">{subtitle}</span>}
        {price === "0 €" && !hideIncludedMessage ? (
          <span className="text-[11px] text-gray-500 block mt-1 italic leading-tight">
            Táto položka je súčasťou základnej konfigurácie domu
          </span>
        ) : (
          <span className={`text-[13px] font-bold block mt-1 ${isPriced ? "text-green-600" : "text-gray-400"}`}>
            {price}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default function KonfiguratorLyon() {
  const BASE_PRICE = 73431;
  
  // Floating panel position and size - load from localStorage if available
  const [panelPosition, setPanelPosition] = useState(() => {
    const saved = localStorage.getItem('lyon_panel_position');
    return saved ? JSON.parse(saved) : { x: 180, y: 100 };
  });
  const [panelSize, setPanelSize] = useState(() => {
    const saved = localStorage.getItem('lyon_panel_size');
    return saved ? JSON.parse(saved) : { width: 380, height: 700 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // State
  const [ucel, setUcel] = useState("chata");
  const [kolaudacia, setKolaudacia] = useState("bez_a0");
  const [izolaciaStien, setIzolaciaStien] = useState("150mm");
  const [izolaciaPodlahy, setIzolaciaPodlahy] = useState("150mm");
  const [izolaciaStropu, setIzolaciaStropu] = useState("150mm");
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState("nie");
  const [rekuperacia, setRekuperacia] = useState("nie");
  const [podlahovoKurenie, setPodlahovoKurenie] = useState(false);
  const [pripravaNaKrb, setPripravaNaKrb] = useState(false);
  const [ochranaKachle, setOchranaKachle] = useState(false);
  const [fasada, setFasada] = useState("drevo_smrek");
  const [strecha, setStrecha] = useState("korugovan_plech");
  const [odkvapy, setOdkvapy] = useState("nie");
  const [okna, setOkna] = useState("biele");
  const [vchodoveDvere, setVchodoveDvere] = useState("plastove");
  const [obkladStien, setObkladStien] = useState("smrek_8cm");
  const [podlaha, setPodlaha] = useState("laminat");
  const [interieroveDvere, setInterieroveDvere] = useState("kridlove");
  const [elektro, setElektro] = useState("eu");
  const [bleskozvod, setBleskozvod] = useState(false);
  const [prepat, setPrepat] = useState(false);
  const [sprchovyKut, setSprchovyKut] = useState("standard");
  const [vana, setVana] = useState(false);
  const [bateria, setBateria] = useState("standard");
  const [skrinka, setSkrinka] = useState(false);
  const [stropKupelna, setStropKupelna] = useState("drevo");
  const [inziniering, setInziniering] = useState(false);
  const [projektACertifikacia, setProjektACertifikacia] = useState(false);
  const [revizia, setRevizia] = useState(true);
  const [zaklady, setZaklady] = useState("bez");
  const [montaz, setMontaz] = useState(false);
  const [doprava, setDoprava] = useState(false);

  const CENY = {
    izolacia_stien: { "200mm": 1799.16, "250mm": 1558.17 },
    izolacia_podlahy: { "200mm": 334.08 },
    izolacia_stropu: { "200mm": 271.44 },
    tepelne_cerpadlo: { ano: 2889.27 },
    rekuperacia: { ano: 1155.36 },
    podlahove_kurenie: 2253.30,
    pripravaKrb: 578.55,
    ochranaKachle: 1279.77,
    fasada: { omietka: 1580.79, smrekovec: 3349.50, falcovane: 4953.78, thermowood: 6677.25 },
    strecha: { falcovane: 3227.70 },
    odkvapy: 1502.49,
    dvere: { kovove: 278.40 },
    obklad: { smrek_bez_uzlov: 0, sadrokarton_tapeta: 7855, osb_panel: 5279 },
    dvere_posuvne: 427.17,
    elektro: { cz: 460.23, ge: 1583.40 },
    bleskozvod: 856.08,
    prepat: 311.46,
    sprchovyKut: 645.54,
    vana: 501.12,
    bateria: 139.20,
    skrinka: 434.13,
    strop_kupelna: { sadrokarton: 0 },
    inziniering: 2773.56,
    projektACertifikacia: 3745.35,
    revizia: 1605.15,
    zaklady: { vruty: 4494.42, patky: 2568.24, pasove: 11825.04 },
    montaz: 4805.88,
    doprava: 8927.94
  };

  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;
    total += CENY.izolacia_stien[izolaciaStien] || 0;
    total += CENY.izolacia_podlahy[izolaciaPodlahy] || 0;
    total += CENY.izolacia_stropu[izolaciaStropu] || 0;
    if (tepelneCerpadlo === "ano") total += CENY.tepelne_cerpadlo.ano;
    if (rekuperacia === "ano") total += CENY.rekuperacia.ano;
    if (podlahovoKurenie) total += CENY.podlahove_kurenie;
    if (pripravaNaKrb) total += CENY.pripravaKrb;
    if (ochranaKachle) total += CENY.ochranaKachle;
    total += CENY.fasada[fasada] || 0;
    total += CENY.strecha[strecha] || 0;
    if (odkvapy === "ano") total += CENY.odkvapy;
    total += CENY.dvere[vchodoveDvere] || 0;
    total += CENY.obklad[obkladStien] || 0;
    if (interieroveDvere === "posuvne") total += CENY.dvere_posuvne;
    total += CENY.elektro[elektro] || 0;
    if (bleskozvod) total += CENY.bleskozvod;
    if (prepat) total += CENY.prepat;
    if (sprchovyKut === "radaway") total += CENY.sprchovyKut;
    if (vana) total += CENY.vana;
    if (bateria === "grohe") total += CENY.bateria;
    if (skrinka) total += CENY.skrinka;
    total += CENY.strop_kupelna[stropKupelna] || 0;
    if (inziniering) total += CENY.inziniering;
    if (projektACertifikacia) total += CENY.projektACertifikacia;
    if (revizia) total += CENY.revizia;
    total += CENY.zaklady[zaklady] || 0;
    if (montaz) total += CENY.montaz;
    if (doprava) total += CENY.doprava;
    
    return total;
  }, [izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, sprchovyKut, vana, bateria,
      skrinka, stropKupelna, inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava]);

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Drag handlers - using pageX/pageY to track position relative to document
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({
      x: e.pageX - panelPosition.x,
      y: e.pageY - panelPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanelPosition({
        x: e.pageX - dragStart.x,
        y: e.pageY - dragStart.y
      });
    }
    if (isResizing) {
      const newWidth = Math.max(280, e.pageX - panelPosition.x);
      const newHeight = Math.max(400, e.pageY - panelPosition.y);
      setPanelSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, panelPosition]);

  const savePosition = () => {
    localStorage.setItem('lyon_panel_position', JSON.stringify(panelPosition));
    localStorage.setItem('lyon_panel_size', JSON.stringify(panelSize));
    alert('Pozícia a veľkosť panelu bola uložená!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex gap-6 relative">
      {/* Floating Summary Panel - Ľavá strana - Draggable & Resizable */}
      <div 
        className="hidden xl:block flex-shrink-0 absolute z-50"
        style={{
          left: `${panelPosition.x}px`,
          top: `${panelPosition.y}px`,
          width: `${panelSize.width}px`,
          height: `${panelSize.height}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'absolute'
        }}
      >
        <Card 
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden h-full relative"
          onMouseDown={handleMouseDown}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700 cursor-grab active:cursor-grabbing">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Vaša konfigurácia
                  </h3>
                  <p className="text-xs text-blue-100 mt-1">Lyon 50m²</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    savePosition();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs h-7"
                >
                  💾 Uložiť
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-4 space-y-4"
              style={{ height: `calc(${panelSize.height}px - 180px)` }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Účel */}
              {ucel && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-1">ÚČEL STAVBY</p>
                  <p className="text-sm font-bold text-white">
                    {ucel === "chata" ? "Rekreačná stavba" : "Rodinný dom A0"}
                  </p>
                </div>
              )}

              {/* Izolácia */}
              {(izolaciaStien !== "150mm" || izolaciaPodlahy !== "150mm" || izolaciaStropu !== "150mm") && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">IZOLÁCIA</p>
                  <div className="space-y-1 text-xs">
                    {izolaciaStien !== "150mm" && <p className="text-slate-300">• Steny {izolaciaStien}</p>}
                    {izolaciaPodlahy !== "150mm" && <p className="text-slate-300">• Podlaha {izolaciaPodlahy}</p>}
                    {izolaciaStropu !== "150mm" && <p className="text-slate-300">• Strop {izolaciaStropu}</p>}
                  </div>
                </div>
              )}

              {/* Vykurovanie */}
              {(tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">VYKUROVANIE</p>
                  <div className="space-y-1 text-xs">
                    {tepelneCerpadlo === "ano" && <p className="text-slate-300">• Tepelné čerpadlo</p>}
                    {rekuperacia === "ano" && <p className="text-slate-300">• Rekuperácia</p>}
                    {podlahovoKurenie && <p className="text-slate-300">• Podlahové kúrenie</p>}
                    {pripravaNaKrb && <p className="text-slate-300">• Príprava na krb</p>}
                    {ochranaKachle && <p className="text-slate-300">• Ochrana na kachle</p>}
                  </div>
                </div>
              )}

              {/* Fasáda */}
              {fasada !== "drevo_smrek" && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-1">FASÁDA</p>
                  <p className="text-sm text-slate-300">
                    {fasada === "omietka" ? "Šúchaná omietka" : 
                     fasada === "smrekovec" ? "Smrekovec" :
                     fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
                  </p>
                </div>
              )}

              {/* Strecha */}
              {(strecha !== "korugovan_plech" || odkvapy === "ano") && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">STRECHA</p>
                  <div className="space-y-1 text-xs">
                    {strecha !== "korugovan_plech" && <p className="text-slate-300">• Falcované panely</p>}
                    {odkvapy === "ano" && <p className="text-slate-300">• Odkvapy</p>}
                  </div>
                </div>
              )}

              {/* Okná a dvere */}
              {(okna !== "biele" || vchodoveDvere !== "plastove") && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">OKNÁ A DVERE</p>
                  <div className="space-y-1 text-xs">
                    {okna !== "biele" && <p className="text-slate-300">• Okná {okna === "antracit" ? "antracit" : "hnedé"}</p>}
                    {vchodoveDvere !== "plastove" && <p className="text-slate-300">• Kovové dvere</p>}
                  </div>
                </div>
              )}

              {/* Interiér */}
              {(obkladStien !== "smrek_8cm" || interieroveDvere !== "kridlove") && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">INTERIÉR</p>
                  <div className="space-y-1 text-xs">
                    {obkladStien !== "smrek_8cm" && (
                      <p className="text-slate-300">
                        • {obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov" :
                           obkladStien === "sadrokarton_tapeta" ? "Sadrokarton + tapeta" : "OSB panel"}
                      </p>
                    )}
                    {interieroveDvere !== "kridlove" && <p className="text-slate-300">• Posuvné dvere</p>}
                  </div>
                </div>
              )}

              {/* Elektro */}
              {(elektro !== "eu" || bleskozvod || prepat) && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">ELEKTROINŠTALÁCIA</p>
                  <div className="space-y-1 text-xs">
                    {elektro === "cz" && <p className="text-slate-300">• CZ/SK štandard</p>}
                    {elektro === "ge" && <p className="text-slate-300 flex items-center gap-1">• GE štandard <span className="text-green-400">⚡A0</span></p>}
                    {bleskozvod && <p className="text-slate-300 flex items-center gap-1">• Bleskozvod <span className="text-green-400">⚡A0</span></p>}
                    {prepat && <p className="text-slate-300 flex items-center gap-1">• Prepäťová ochrana <span className="text-green-400">⚡A0</span></p>}
                  </div>
                </div>
              )}

              {/* Kúpeľňa */}
              {(sprchovyKut !== "standard" || bateria !== "standard" || vana || skrinka || stropKupelna !== "drevo") && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">KÚPEĽŇA</p>
                  <div className="space-y-1 text-xs">
                    {sprchovyKut !== "standard" && <p className="text-slate-300">• Sprcha Radaway</p>}
                    {bateria !== "standard" && <p className="text-slate-300">• Batéria Grohe</p>}
                    {stropKupelna !== "drevo" && <p className="text-slate-300">• Sadrokartónový strop</p>}
                    {vana && <p className="text-slate-300">• Vaňa</p>}
                    {skrinka && <p className="text-slate-300">• Skrinka</p>}
                  </div>
                </div>
              )}

              {/* Základy */}
              {zaklady !== "bez" && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-1">ZÁKLADY</p>
                  <p className="text-sm text-slate-300">
                    {zaklady === "vruty" ? "Zemné vruty" :
                     zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"}
                  </p>
                </div>
              )}

              {/* Služby */}
              {(inziniering || projektACertifikacia || revizia) && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">SLUŽBY</p>
                  <div className="space-y-1 text-xs">
                    {inziniering && <p className="text-slate-300 flex items-center gap-1">• Inžiniering <span className="text-green-400">⚡A0</span></p>}
                    {projektACertifikacia && <p className="text-slate-300 flex items-center gap-1">• Projekt + Certifikácia <span className="text-green-400">⚡A0</span></p>}
                    {revizia && <p className="text-slate-300">• Revízna dokumentácia</p>}
                  </div>
                </div>
              )}

              {/* Realizácia */}
              {(montaz || doprava) && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">REALIZÁCIA</p>
                  <div className="space-y-1 text-xs">
                    {montaz && <p className="text-slate-300">• Montáž domu</p>}
                    {doprava && <p className="text-slate-300">• Doprava modulov</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Total Price */}
            <div className="absolute bottom-0 left-0 right-0 border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
              <p className="text-xs text-blue-100 mb-1">Celková cena s DPH</p>
              <p className="text-2xl font-black text-white">{formatPrice(totalPrice)}</p>
              <div className="mt-3">
                <Button 
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Odoslať dopyt
                </Button>
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize bg-blue-500/50 hover:bg-blue-500 rounded-tl-lg"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
              title="Potiahnite pre zmenu veľkosti"
            >
              <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/70"></div>
            </div>
          </Card>
      </div>

      {/* Main Content - Pravá strana */}
      <div className="flex-1 min-w-0">

      {/* Účel stavby - kompaktnejší */}
      <Card className="p-3 sm:p-4 mb-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Účel stavby
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Rekreačná stavba */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setUcel("chata");
              setKolaudacia("bez_a0");
              setIzolaciaStien("150mm");
              setIzolaciaPodlahy("150mm");
              setIzolaciaStropu("150mm");
              setTepelneCerpadlo("nie");
              setRekuperacia("nie");
              setInziniering(false);
              setProjektACertifikacia(false);
            }}
            className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
              ucel === "chata" 
                ? "bg-green-100 border-green-500 shadow-md" 
                : "bg-white border-gray-300 hover:border-green-400"
            }`}
            >
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Rekreačná stavba</h4>
            <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">Ekonomická voľba</p>
            <ul className="space-y-0.5 text-[11px] sm:text-xs text-gray-600">
              <li>• Chata, záhradný domček</li>
              <li>• Celoročná izolácia 150/200mm</li>
              <li>• Bez energetického certifikátu</li>
              <li>• Nižšia cena</li>
            </ul>
          </motion.div>

          {/* Rodinný dom A0 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setUcel("rodinny");
              setKolaudacia("s_a0");
              setIzolaciaStien("250mm");
              setIzolaciaPodlahy("200mm");
              setIzolaciaStropu("200mm");
              setTepelneCerpadlo("ano");
              setRekuperacia("ano");
              setInziniering(true);
              setProjektACertifikacia(true);
              setBleskozvod(true);
              setPrepat(true);
              setElektro("ge");
            }}
            className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
              ucel === "rodinny" 
                ? "bg-green-100 border-green-500 shadow-md" 
                : "bg-white border-gray-300 hover:border-green-400"
            }`}
            >
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm sm:text-base font-bold text-gray-900">Rodinný dom A0</h4>
              <Badge className="bg-green-600 text-white text-[8px] sm:text-[9px]">⚡</Badge>
            </div>
            <ul className="space-y-0.5 text-[11px] sm:text-xs text-gray-600">
              <li>• Celoročné bývanie</li>
              <li>• Energetický certifikát A0</li>
              <li>• Premium izolácia 250/300mm</li>
              <li>• Tepelné čerpadlo + Rekuperácia</li>
              <li>• Možnosť trvalého pobytu</li>
            </ul>
          </motion.div>
        </div>
      </Card>

      {/* Kolaudácia */}
      {ucel === "rodinny" && (
        <Card className="p-2 mb-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300">
          <h3 className="text-xs font-bold text-green-900 mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-green-600" />
            Kolaudácia
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={kolaudacia === "bez_a0"} onClick={() => {
              setKolaudacia("bez_a0");
              setInziniering(false);
              setProjektACertifikacia(false);
            }} title="Bez kolaudácie A0" subtitle="Bez admin." price="0 €" isPriced={false} />
            <Tile selected={kolaudacia === "s_a0"} onClick={() => {
              setKolaudacia("s_a0");
              setInziniering(true);
              setProjektACertifikacia(true);
              setBleskozvod(true);
              setPrepat(true);
              setElektro("ge");
            }} title="S kolaudáciou A0" subtitle="Admin proces" price="0 €" isPriced={false} isA0={true} />
          </div>
        </Card>
      )}



      {/* Hlavný konfigurátor - Grid layout */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">

        {/* IZOLÁCIA */}
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md">
          <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
            🏠 Izolácia
          </h3>
          <div className="space-y-2">
            {/* Steny */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Izolácia stien:</p>
              <div className="grid grid-cols-3 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} title="Steny 150mm" subtitle="Rekreačné" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} title="Steny 200mm" subtitle="" price="+ 1 799 €" isPriced={true} />
                <Tile selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} title="Steny 250mm" subtitle="Premium A0" price="+ 1 558 €" isPriced={true} isA0={true} />
              </div>
            </div>

            {/* Podlaha */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Izolácia podlahy:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} title="Podlaha 150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} title="Podlaha 200mm" subtitle="A0" price="+ 334 €" isPriced={true} isA0={true} />
              </div>
            </div>

            {/* Strop */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Izolácia stropu:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} title="Strop 150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} title="Strop 200mm" subtitle="A0" price="+ 271 €" isPriced={true} isA0={true} />
              </div>
            </div>
          </div>
        </Card>

        {/* VYKUROVANIE */}
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 shadow-md">
          <h3 className="text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
            🔥 Vykurovanie
          </h3>
          <div className="space-y-2">
            {/* Tepelné čerpadlo */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Vykurovanie:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} title="Príprava" subtitle="Konvektory" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} title="Tepelné čerpadlo" subtitle="A0 povinné" price="+ 2 889 €" isPriced={true} isA0={true} />
              </div>
            </div>

            {/* Rekuperácia */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Vetranie:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={rekuperacia === "nie"} onClick={() => setRekuperacia("nie")} title="Bez rekuperácie" subtitle="" price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} />
                <Tile selected={rekuperacia === "ano"} onClick={() => setRekuperacia("ano")} title="Rekuperácia" subtitle="A0 povinné" price="+ 1 155 €" isPriced={true} isA0={true} />
              </div>
            </div>

            {/* Doplnky - checkbox */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Doplnky:</p>
              <div className="space-y-1.5">
                <Tile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} title="Podlahové kúrenie" subtitle="" price="+ 2 253 €" isPriced={true} />
                <Tile selected={pripravaNaKrb} onClick={() => setPripravaNaKrb(!pripravaNaKrb)} title="Príprava na krb" subtitle="" price="+ 579 €" isPriced={true} />
                <Tile selected={ochranaKachle} onClick={() => setOchranaKachle(!ochranaKachle)} title="Ochrana na kachle" subtitle="" price="+ 1 280 €" isPriced={true} />
              </div>
            </div>
          </div>
        </Card>

        </div>

        <div className="grid lg:grid-cols-2 gap-3 mb-3">
          {/* FASÁDA */}
          <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-md">
            <h3 className="text-base font-bold text-purple-900 mb-2 flex items-center gap-2">
              🎨 Fasáda
            </h3>
          <div>
            <p className="text-[11px] font-semibold text-gray-700 mb-1">Typ fasády:</p>
            <div className="grid grid-cols-2 gap-1.5 border border-purple-300 rounded-md p-1.5 bg-white/50">
              <Tile selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} title="Drevo smrek" subtitle="Tmavý/Svetlý" price="0 €" isPriced={false} isIncluded={true} />
              <Tile selected={fasada === "omietka"} onClick={() => setFasada("omietka")} title="Šúchaná omietka" subtitle="Baumit" price="+ 1 581 €" isPriced={true} />
              <Tile selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} title="Smrekovec" subtitle="" price="+ 3 350 €" isPriced={true} />
              <Tile selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} title="Falcované panely" subtitle="" price="+ 4 954 €" isPriced={true} />
              <Tile selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} title="Thermowood" subtitle="" price="+ 6 677 €" isPriced={true} />
            </div>
          </div>
        </Card>

        {/* STRECHA */}
        <Card className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 shadow-md">
          <h3 className="text-base font-bold text-indigo-900 mb-2 flex items-center gap-2">
            🏠 Strecha
          </h3>
          <div className="space-y-2">
            {/* Krytina */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Strešná krytina:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} title="Korugovaný plech" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} title="Falcované panely" subtitle="" price="+ 3 228 €" isPriced={true} />
              </div>
            </div>

            {/* Odkvapy */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Odkvapy:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} title="Bez odkvapov" subtitle="" price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} />
                <Tile selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} title="Odkvapy" subtitle="Farba strechy" price="+ 1 502 €" isPriced={true} />
              </div>
            </div>
          </div>
        </Card>

        </div>

        <div className="grid lg:grid-cols-2 gap-3 mb-3">
          {/* OKNÁ A DVERE */}
          <Card className="p-3 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-300 shadow-md">
            <h3 className="text-base font-bold text-cyan-900 mb-2 flex items-center gap-2">
              🚪 Okná a dvere
            </h3>
            <div className="space-y-2">
            {/* Okná */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Farba okien 3-sklo:</p>
              <div className="grid grid-cols-3 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={okna === "biele"} onClick={() => setOkna("biele")} title="Biele" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={okna === "antracit"} onClick={() => setOkna("antracit")} title="Antracit" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={okna === "hnede"} onClick={() => setOkna("hnede")} title="Hnedé" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
              </div>
            </div>

            {/* Vchodové dvere */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Vchodové dvere:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} title="Kovovo-plastové" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} title="Kovové dvere" subtitle="" price="+ 278 €" isPriced={true} />
              </div>
            </div>
          </div>
        </Card>

        {/* INTERIÉR */}
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-md">
          <h3 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
            🛋️ Interiér
          </h3>
          <div className="space-y-2">
            {/* Obklad stien */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Obklad stien:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={obkladStien === "smrek_8cm"} onClick={() => setObkladStien("smrek_8cm")} title="Smrek 8cm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={obkladStien === "smrek_bez_uzlov"} onClick={() => setObkladStien("smrek_bez_uzlov")} title="Smrek bez uzlov 12cm" subtitle="" price="0 €" isPriced={false} />
                <Tile selected={obkladStien === "sadrokarton_tapeta"} onClick={() => setObkladStien("sadrokarton_tapeta")} title="Sadrokarton+netkaná tapeta+maľovka" subtitle="" price="+ 7 855 €" isPriced={true} />
                <Tile selected={obkladStien === "osb_panel"} onClick={() => setObkladStien("osb_panel")} title="OSB + laminátový panel" subtitle="" price="+ 5 279 €" isPriced={true} />
              </div>
            </div>

            {/* Podlaha - len jedna možnosť */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Podlaha:</p>
              <div className="border border-amber-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} title="Laminát" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
              </div>
            </div>

            {/* Interiérové dvere */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Interiérové dvere:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} title="Krídlové dvere" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} title="Posuvné dvere" subtitle="" price="+ 427 €" isPriced={true} />
              </div>
            </div>
          </div>
        </Card>

        </div>

        <div className="grid lg:grid-cols-2 gap-3 mb-3">
          {/* ELEKTRO */}
          <Card className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md">
            <h3 className="text-base font-bold text-yellow-900 mb-2 flex items-center gap-2">
              ⚡ Elektroinštalácia
            </h3>
            <div className="space-y-2">
            {/* Štandard */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Typ inštalácie:</p>
              <div className="grid grid-cols-3 gap-1.5 border border-yellow-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={elektro === "eu"} onClick={() => setElektro("eu")} title="EU štandard" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={elektro === "cz"} onClick={() => setElektro("cz")} title="CZ/SK štandard" subtitle="Zásuvky, dodatočné istenie" price="+ 460 €" isPriced={true} />
                <Tile selected={elektro === "ge"} onClick={() => setElektro("ge")} title="GE štandard" subtitle="" price="+ 1 583 €" isPriced={true} isA0={true} />
              </div>
            </div>

            {/* Doplnky */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Doplnky (môžeš vybrať viac):</p>
              <div className="space-y-2">
                <Tile selected={bleskozvod} onClick={() => setBleskozvod(!bleskozvod)} title="Bleskozvod" subtitle="" price="+ 856 €" isPriced={true} isA0={true} />
                <Tile selected={prepat} onClick={() => setPrepat(!prepat)} title="Prepäťová ochrana" subtitle="" price="+ 311 €" isPriced={true} isA0={true} />
              </div>
            </div>
          </div>
        </Card>

        {/* KÚPEĽŇA */}
        <Card className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-md">
          <h3 className="text-base font-bold text-teal-900 mb-2 flex items-center gap-2">
            🚿 Kúpeľňa
          </h3>
          <div className="space-y-2">
            {/* Sprcha */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Sprchový kút:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} title="Sprcha" subtitle="WC Geberit" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} title="Sprcha Radaway" subtitle="" price="+ 646 €" isPriced={true} />
              </div>
            </div>

            {/* Batéria */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Batéria:</p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={bateria === "standard"} onClick={() => setBateria("standard")} title="Batéria štandard" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={bateria === "grohe"} onClick={() => setBateria("grohe")} title="Grohe" subtitle="" price="+ 139 €" isPriced={true} />
              </div>
            </div>

            {/* Strop kúpeľňa */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Strop (kúpeľňa):</p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={stropKupelna === "drevo"} onClick={() => setStropKupelna("drevo")} title="Strop - vzor dreva biely" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
                <Tile selected={stropKupelna === "sadrokarton"} onClick={() => setStropKupelna("sadrokarton")} title="Sadrokartón, tapeta, maľba" subtitle="" price="+ 0 €" isPriced={false} />
              </div>
            </div>

            {/* Doplnky */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Doplnky:</p>
              <div className="space-y-1.5">
                <Tile selected={vana} onClick={() => setVana(!vana)} title="Vaňa" subtitle="" price="+ 501 €" isPriced={true} />
                <Tile selected={skrinka} onClick={() => setSkrinka(!skrinka)} title="Skrinka" subtitle="" price="+ 434 €" isPriced={true} />
              </div>
            </div>
            </div>
            </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-3 mb-3">
            {/* ZÁKLADY */}
            <Card className="p-3 bg-gradient-to-br from-stone-50 to-gray-50 border-2 border-stone-300 shadow-md">
            <h3 className="text-base font-bold text-stone-900 mb-2 flex items-center gap-2">
            🏗️ Základy
            </h3>
          <div>
            <p className="text-[11px] font-semibold text-gray-700 mb-1">Typ základov:</p>
            <div className="grid grid-cols-2 gap-1.5 border border-stone-300 rounded-md p-1.5 bg-white/50">
              <Tile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} title="Bez základov" subtitle="" price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} />
              <Tile selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} title="Zemné vruty" subtitle="" price="+ 4 494 €" isPriced={true} />
              <Tile selected={zaklady === "patky"} onClick={() => setZaklady("patky")} title="Betónové pätky" subtitle="" price="+ 2 568 €" isPriced={true} />
              <Tile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} title="Pásové betónové" subtitle="" price="+ 11 825 €" isPriced={true} />
            </div>
          </div>
        </Card>

        {/* SLUŽBY */}
        <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-md">
          <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            Inžiniering a dokumentácia (A0)
          </h3>
          <div className="space-y-1.5">
                  <Tile selected={inziniering} onClick={() => setInziniering(!inziniering)} title="Inžiniering" subtitle="Povolenie" price="+ 2 774 €" isPriced={true} isA0={true} />
                  <Tile selected={projektACertifikacia} onClick={() => setProjektACertifikacia(!projektACertifikacia)} title="Projekt + Certif." subtitle="A0" price="+ 3 745 €" isPriced={true} isA0={true} />
                  <Tile selected={revizia} onClick={() => setRevizia(!revizia)} title="Revízna dok." subtitle="" price="+ 1 605 €" isPriced={true} />
                  </div>
        </Card>

        {/* REALIZÁCIA */}
        <Card className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 shadow-md">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            🚚 Realizácia
          </h3>
          <div className="space-y-1.5">
            <Tile selected={montaz} onClick={() => setMontaz(!montaz)} title="Montáž domu" subtitle="" price="+ 4 806 €" isPriced={true} />
            <Tile selected={doprava} onClick={() => setDoprava(!doprava)} title="Doprava" subtitle="Doprava všetkých modulov" price="+ 8 928 €" isPriced={true} />
          </div>
        </Card>

      </div>

      {/* Sticky Footer - modernejší (len pre mobil) */}
      <div className="xl:hidden sticky bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3 shadow-2xl z-50 mt-4 rounded-t-2xl border-t-4 border-white/20">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-white/70 mb-0.5">Základ: {formatPrice(BASE_PRICE)} | Doplnky: {formatPrice(totalPrice - BASE_PRICE)}</p>
            <p className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-xl text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6 rounded-xl">
            <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Mám záujem
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}