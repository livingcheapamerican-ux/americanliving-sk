import React, { useState, useMemo } from 'react';
import { Image, Maximize2, X, ChevronLeft, ChevronRight, Rotate3d, Sparkles } from 'lucide-react';
import House3DViewer from '../3d/House3DViewer';

/**
 * Dynamická fotogaléria, 3D model a pôdorysy pre konfigurátor.
 * Filtruje fotky podľa zvoleného štýlu fasády / interiéru.
 * Zobrazuje aj 2D/3D pôdorysy a interaktívny 3D model.
 */
export default function KonfiguratorGaleria({ dom, facadeIdx, interiorIdx, extensionLength = 0 }) {
  const isBarn48 = dom?.prosto_house_kod === 'PH-008' || dom?.nazov?.toLowerCase().includes('barn 48') || dom?.nazov?.toLowerCase().includes('ph-008');
  const [activeTab, setActiveTab] = useState(isBarn48 ? '3d' : 'galeria');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null); // { images: [], index: 0 }

  // Určíme typ fasády podľa výberu
  const facadeType = facadeIdx === 1 ? 'exterier_murovka' : 'exterier_drevo_plech';
  const facade3D = facadeIdx === 1 ? 'stucco' : 'standard';
  // Určíme typ interiéru podľa výberu
  const interiorType = interiorIdx === 2 ? 'interier_sadrokarton' : 'interier_drevo';
  const interior3D = interiorIdx === 2 ? 'drywall' : 'wood';

  // Zozbierame fotky z dom.galerie (pomenované galérie)
  const galleries = useMemo(() => {
    if (!dom?.galerie?.length) return [];
    return dom.galerie;
  }, [dom]);

  // Zozbierame všetky fotky podľa filtra
  const filteredPhotos = useMemo(() => {
    if (!galleries.length) {
      // fallback na dom.galeria
      return dom?.galeria || [];
    }

    if (activeFilter === 'all') {
      return galleries.flatMap(g => g.fotky || []);
    }
    const filtered = galleries.filter(g => g.typ === activeFilter);
    return filtered.flatMap(g => g.fotky || []);
  }, [galleries, activeFilter, dom]);

  // Odporúčané filtre podľa výberu
  const recommendedFilters = useMemo(() => {
    const recs = [];
    recs.push(facadeType);
    recs.push(interiorType);
    return recs;
  }, [facadeType, interiorType]);

  // Pôdorysy
  const podorysy = useMemo(() => {
    const result = [];
    if (dom?.podorys_2d) result.push({ url: dom.podorys_2d, label: '2D pôdorys' });
    if (dom?.podorys_3d) result.push({ url: dom.podorys_3d, label: '3D vizualizácia' });
    if (dom?.podorysy?.length) {
      dom.podorysy.forEach((url, i) => {
        if (url !== dom.podorys_2d && url !== dom.podorys_3d) {
          result.push({ url, label: `Pôdorys ${i + 1}` });
        }
      });
    }
    return result;
  }, [dom]);

  const filterOptions = [
    { key: 'all', label: 'Všetky' },
    { key: 'exterier_drevo_plech', label: '🪵 Exteriér drevo' },
    { key: 'exterier_murovka', label: '🏠 Exteriér murovka' },
    { key: 'interier_drevo', label: '🪵 Interiér drevo' },
    { key: 'interier_sadrokarton', label: '🔲 Interiér sadrokartón' },
  ];

  const openLightbox = (photos, index) => {
    setLightbox({ images: photos, index });
  };

  const closeLightbox = () => setLightbox(null);

  const lightboxNext = () => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
  const lightboxPrev = () => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));

  const hasContent = filteredPhotos.length > 0 || podorysy.length > 0;

  if (!dom || !hasContent) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Fotografie nie sú k dispozícii
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tabs: 3D Model / Galéria / Pôdorysy */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {isBarn48 && (
          <button
            onClick={() => setActiveTab('3d')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === '3d' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
            }`}
          >
            <Rotate3d className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>✨ 3D Model</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('galeria')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'galeria' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'
          }`}
        >
          📸 Fotogaléria
        </button>
        {podorysy.length > 0 && (
          <button
            onClick={() => setActiveTab('podorysy')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'podorysy' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            📐 Pôdorysy
          </button>
        )}
      </div>

      {activeTab === '3d' && isBarn48 && (
        <div className="w-full">
          <House3DViewer
            modelUrl={dom?.model_3d_url || null}
            initialFacade={facade3D}
            initialExtension={extensionLength}
            initialInterior={interior3D}
            height="440px"
            showControls={true}
          />
        </div>
      )}

      {activeTab === 'galeria' && (
        <>
          {/* Odporúčaný filter podľa výberu */}
          {galleries.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                Filter fotiek
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {filterOptions.map(f => {
                  const isRecommended = recommendedFilters.includes(f.key);
                  const isActive = activeFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600'
                          : isRecommended
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {f.label}
                      {isRecommended && !isActive && <span className="ml-1 text-[9px] text-red-500 font-bold">✦</span>}
                    </button>
                  );
                })}
              </div>
              {recommendedFilters.some(r => r !== 'all') && (
                <p className="text-[10px] text-red-500 mt-1">✦ odporúčané podľa vášho výberu</p>
              )}
            </div>
          )}

          {/* Mriežka fotiek */}
          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredPhotos.slice(0, 8).map((url, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(filteredPhotos, i)}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden group border border-gray-100 hover:border-red-200 transition-all"
                >
                  <img
                    src={url}
                    alt={`Fotka ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
              {filteredPhotos.length > 8 && (
                <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold border border-gray-200">
                  +{filteredPhotos.length - 8} fotiek
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              Pre tento výber nie sú fotografie
            </div>
          )}
        </>
      )}

      {activeTab === 'podorysy' && (
        <div className="space-y-3">
          {podorysy.map((p, i) => (
            <button
              key={i}
              onClick={() => openLightbox(podorysy.map(x => x.url), i)}
              className="w-full rounded-xl overflow-hidden border border-gray-200 hover:border-red-200 transition-all group relative"
            >
              <div className="absolute top-2 left-2 z-10 bg-gray-900/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {p.label}
              </div>
              <img
                src={p.url}
                alt={p.label}
                className="w-full object-contain max-h-64 bg-white group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all">
                <Maximize2 className="w-6 h-6 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
            <X className="w-6 h-6" />
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-16 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 text-white/60 text-sm">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}