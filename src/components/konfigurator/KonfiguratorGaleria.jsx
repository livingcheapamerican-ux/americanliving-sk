import React, { useState } from 'react';
import { Image, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const GAL_TYPES = [
  { key: 'all', label: 'Všetky' },
  { key: 'exterier_drevo_plech', label: 'Exteriér – Drevo/Plech' },
  { key: 'exterier_murovka', label: 'Exteriér – Murovka' },
  { key: 'interier_drevo', label: 'Interiér – Drevo' },
  { key: 'interier_sadrokarton', label: 'Interiér – Sadrokartón' },
];

/**
 * Dynamická fotogaléria pre konfigurátory Prosto House.
 * Zobrazuje fotky z Dom entity filtrované podľa typu galérie.
 * Tiež zobrazuje 2D a 3D pôdorysy.
 */
export default function KonfiguratorGaleria({ domData, facadeIdx, interiorIdx }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'floorplan'

  if (!domData) return null;

  // Zozbieraj všetky fotky z galerie podľa filtru
  const galerie = domData.galerie || [];
  const allPhotos = [];

  galerie.forEach(gal => {
    (gal.fotky || []).forEach(url => {
      allPhotos.push({ url, typ: gal.typ, nazov: gal.nazov });
    });
  });

  // Ak nie sú pomenované galérie, použij starú galeria pole
  if (allPhotos.length === 0 && domData.galeria?.length) {
    domData.galeria.forEach(url => allPhotos.push({ url, typ: 'all', nazov: 'Galéria' }));
  }

  const filteredPhotos = activeFilter === 'all'
    ? allPhotos
    : allPhotos.filter(p => p.typ === activeFilter);

  // Pôdorysy
  const podorysy = domData.podorysy || [];
  const podorys2d = domData.podorys_2d;
  const podorys3d = domData.podorys_3d;
  const allPodorysy = [
    ...(podorys2d ? [{ url: podorys2d, label: '2D Pôdorys' }] : []),
    ...(podorys3d ? [{ url: podorys3d, label: '3D Pôdorys' }] : []),
    ...podorysy.map((url, i) => ({ url, label: `Pôdorys ${i + 1}` })),
  ];

  const openLightbox = (images, idx) => {
    setLightboxImages(images);
    setLightboxIdx(idx);
  };

  const hasSomething = allPhotos.length > 0 || allPodorysy.length > 0;
  if (!hasSomething) return null;

  return (
    <div className="rounded-2xl border-2 border-gray-200 overflow-hidden bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'gallery' ? 'bg-red-50 text-red-700 border-b-2 border-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Image className="w-4 h-4" />
          Fotogaléria {allPhotos.length > 0 && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{allPhotos.length}</span>}
        </button>
        {allPodorysy.length > 0 && (
          <button
            onClick={() => setActiveTab('floorplan')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'floorplan' ? 'bg-red-50 text-red-700 border-b-2 border-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            📐 Pôdorysy {allPodorysy.length > 0 && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{allPodorysy.length}</span>}
          </button>
        )}
      </div>

      {activeTab === 'gallery' && (
        <div className="p-4">
          {/* Filter buttons */}
          {galerie.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {GAL_TYPES.filter(gt => gt.key === 'all' || allPhotos.some(p => p.typ === gt.key)).map(gt => (
                <button
                  key={gt.key}
                  onClick={() => setActiveFilter(gt.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeFilter === gt.key ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {gt.label}
                </button>
              ))}
            </div>
          )}

          {filteredPhotos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Žiadne fotky pre tento filter</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => openLightbox(filteredPhotos.map(p => p.url), idx)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity group"
                >
                  <img src={photo.url} alt={photo.nazov || 'Fotka'} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {photo.nazov && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                      <span className="text-white text-[10px] font-medium">{photo.nazov}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'floorplan' && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPodorysy.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 border-b border-gray-200">{p.label}</div>
                <button
                  onClick={() => openLightbox(allPodorysy.map(x => x.url), idx)}
                  className="w-full aspect-[4/3] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors group relative"
                >
                  <img src={p.url} alt={p.label} className="max-w-full max-h-full object-contain p-2" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 rounded-full p-2"><Maximize2 className="w-5 h-5 text-white" /></div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 z-10">
            <X className="w-6 h-6 text-white" />
          </button>
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i - 1); }}
              className="absolute left-4 p-3 bg-white/20 rounded-full hover:bg-white/30 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <img
            src={lightboxImages[lightboxIdx]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          {lightboxIdx < lightboxImages.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i + 1); }}
              className="absolute right-4 p-3 bg-white/20 rounded-full hover:bg-white/30 z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
          <div className="absolute bottom-4 text-white/60 text-sm">{lightboxIdx + 1} / {lightboxImages.length}</div>
        </div>
      )}
    </div>
  );
}