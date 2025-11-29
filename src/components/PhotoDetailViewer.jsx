import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Calendar,
  FolderOpen,
  Tag,
  Home,
  Layers,
  Info,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const TYP_FOTKY_LABELS = {
  hlavny_obrazok: { label: 'Hlavný obrázok', color: 'bg-amber-500' },
  zakladna_konfiguracia: { label: 'Základná konfigurácia', color: 'bg-blue-500' },
  galeria: { label: 'Galéria', color: 'bg-gray-500' },
  stare_fotky: { label: 'Staré fotky', color: 'bg-orange-500' },
  nove_fotky: { label: 'Nové fotky', color: 'bg-green-500' },
  podorys: { label: 'Pôdorys', color: 'bg-purple-500' },
};

const KATEGORIA_LABELS = {
  exterier: 'Exteriér',
  interier: 'Interiér',
  podorys: 'Pôdorys',
  detail: 'Detail',
  okolie: 'Okolie',
  ine: 'Iné',
};

export default function PhotoDetailViewer({ 
  photos = [], 
  initialIndex = 0, 
  isOpen, 
  onClose,
  onEdit 
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
          handleRotate();
          break;
        case 'i':
          setShowInfo(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
    resetTransforms();
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
    resetTransforms();
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (!currentPhoto) return null;

  const typConfig = TYP_FOTKY_LABELS[currentPhoto.typ_fotky] || TYP_FOTKY_LABELS.galeria;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-full' : 'max-w-6xl'} p-0 gap-0 overflow-hidden`}>
        <div className="flex h-[85vh]">
          {/* Main Image Area */}
          <div className="flex-grow relative bg-black flex items-center justify-center overflow-hidden">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white h-12 w-12"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white h-12 w-12"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            <img
              src={currentPhoto.url || currentPhoto.file_url}
              alt={currentPhoto.nazov || 'Fotka'}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              draggable={false}
            />

            {/* Bottom toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/20 h-8 w-8">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/20 h-8 w-8">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-white/30 mx-1" />
              <Button variant="ghost" size="icon" onClick={handleRotate} className="text-white hover:bg-white/20 h-8 w-8">
                <RotateCw className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-white/30 mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowInfo(prev => !prev)} 
                className={`text-white hover:bg-white/20 h-8 w-8 ${showInfo ? 'bg-white/20' : ''}`}
              >
                <Info className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFullscreen(prev => !prev)} 
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Photo counter */}
            {photos.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="w-80 bg-white border-l flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Informácie</h3>
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(currentPhoto)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Upraviť
                  </Button>
                )}
              </div>
              
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <ImageIcon className="w-3 h-3" />
                      Názov
                    </div>
                    <p className="font-medium text-gray-800">{currentPhoto.nazov || 'Bez názvu'}</p>
                  </div>

                  {/* Description */}
                  {currentPhoto.popis && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Popis</div>
                      <p className="text-sm text-gray-700">{currentPhoto.popis}</p>
                    </div>
                  )}

                  {/* Type and Category */}
                  <div className="flex gap-2">
                    <Badge className={`${typConfig.color} text-white`}>
                      {typConfig.label}
                    </Badge>
                    {currentPhoto.kategoria && (
                      <Badge variant="outline">
                        {KATEGORIA_LABELS[currentPhoto.kategoria] || currentPhoto.kategoria}
                      </Badge>
                    )}
                  </div>

                  {/* Dom */}
                  {currentPhoto.dom_nazov && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Home className="w-3 h-3" />
                        Priradený dom
                      </div>
                      <p className="font-medium text-gray-800">{currentPhoto.dom_nazov}</p>
                      {currentPhoto.vyrobca && (
                        <p className="text-xs text-gray-500">{currentPhoto.vyrobca}</p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {currentPhoto.tagy && currentPhoto.tagy.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Tag className="w-3 h-3" />
                        Tagy
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentPhoto.tagy.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Layers className="w-3 h-3" />
                      Zdroj
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {currentPhoto.zdroj === 'google_drive' ? 'Google Drive' : 'Upload'}
                    </Badge>
                  </div>

                  {/* Path */}
                  {currentPhoto.cesta_priecinka && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <FolderOpen className="w-3 h-3" />
                        Cesta
                      </div>
                      <p className="text-xs text-gray-600 break-all">{currentPhoto.cesta_priecinka}</p>
                    </div>
                  )}

                  {/* Original name */}
                  {currentPhoto.povodny_nazov && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Pôvodný názov</div>
                      <p className="text-xs text-gray-600 break-all">{currentPhoto.povodny_nazov}</p>
                    </div>
                  )}

                  {/* Dates */}
                  {currentPhoto.created_date && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        Dátum importu
                      </div>
                      <p className="text-sm text-gray-700">
                        {format(new Date(currentPhoto.created_date), 'dd. MMMM yyyy, HH:mm', { locale: sk })}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="border-t p-2">
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id || index}
                          onClick={() => {
                            setCurrentIndex(index);
                            resetTransforms();
                          }}
                          className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-all ${
                            index === currentIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={photo.url || photo.file_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}