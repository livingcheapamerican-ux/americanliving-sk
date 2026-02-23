import React from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithWatermark from "./ImageWithWatermark";

export default function GaleriaLightbox({
  lightboxOpen,
  lightboxImages,
  lightboxIndex,
  setLightboxIndex,
  zoomLevel,
  setZoomLevel,
  panPosition,
  setPanPosition,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
  lastTouchDistance,
  setLastTouchDistance,
  swipeStart,
  setSwipeStart,
  swipeOffset,
  setSwipeOffset,
  closeLightbox,
  imagesAltMap,
  language,
}) {
  if (!lightboxOpen) return null;

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const getTouchDistance = (touches) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = (e) => {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
      setSwipeStart(null);
      return;
    }
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
    } else if (e.touches && lightboxImages.length > 1) {
      setSwipeStart({ x: clientX, y: clientY });
      setSwipeOffset(0);
    }
  };

  const handleMouseMove = (e) => {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      if (lastTouchDistance && newDistance) {
        const scale = newDistance / lastTouchDistance;
        setZoomLevel((prev) => {
          const newZoom = Math.min(Math.max(prev * scale, 1), 4);
          if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
          return newZoom;
        });
        setLastTouchDistance(newDistance);
      }
      return;
    }
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setPanPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    } else if (swipeStart && zoomLevel === 1 && e.touches) {
      setSwipeOffset(clientX - swipeStart.x);
    }
  };

  const handleMouseUp = () => {
    if (swipeStart && zoomLevel === 1 && lightboxImages.length > 1) {
      if (swipeOffset < -80) nextImage();
      else if (swipeOffset > 80) prevImage();
    }
    setIsDragging(false);
    setLastTouchDistance(null);
    setSwipeStart(null);
    setSwipeOffset(0);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn(); else handleZoomOut();
  };

  const getAlt = (img, idx) => (imagesAltMap?.[language] || imagesAltMap?.['sk'])?.[img] || `Fotka ${idx + 1}`;

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={closeLightbox}
    >
      {/* Close */}
      <button
        className="absolute top-20 sm:top-24 right-4 text-white hover:text-gray-300 bg-red-600 hover:bg-red-700 rounded-full p-3 sm:p-4 shadow-2xl transition-all"
        style={{ zIndex: 10001 }}
        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2" style={{ zIndex: 9998 }}>
        <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} disabled={zoomLevel <= 1} className="text-white hover:text-gray-300 disabled:opacity-40 p-1">
          <ZoomOut className="w-6 h-6" />
        </button>
        <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} disabled={zoomLevel >= 4} className="text-white hover:text-gray-300 disabled:opacity-40 p-1">
          <ZoomIn className="w-6 h-6" />
        </button>
        {zoomLevel > 1 && (
          <button onClick={(e) => { e.stopPropagation(); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }} className="text-white hover:text-gray-300 p-1 ml-2">
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation arrows */}
      {lightboxImages.length > 1 && (
        <>
          <button className="absolute left-4 text-white hover:text-gray-300 z-10 p-2" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button className="absolute right-4 text-white hover:text-gray-300 z-10 p-2" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      {/* Image area */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none relative select-none"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {zoomLevel === 1 && lightboxImages.length > 1 ? (
          <div
            className="flex items-center justify-center h-full absolute left-0"
            style={{
              transform: `translateX(calc(-${lightboxIndex * 100}vw + ${swipeOffset}px))`,
              transition: swipeStart ? 'none' : 'transform 0.3s ease-out',
              width: `${lightboxImages.length * 100}vw`,
            }}
          >
            {lightboxImages.map((img, idx) => (
              <div key={idx} className="w-screen h-screen flex items-center justify-center flex-shrink-0 px-8">
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <ImageWithWatermark
                    src={img}
                    alt={getAlt(img, idx)}
                    className="select-none w-auto h-auto max-w-[85vw] max-h-[85vh] object-contain"
                    draggable={false}
                    priority={true}
                    onClick={(e) => { e.stopPropagation(); if (!swipeStart && Math.abs(swipeOffset) < 10) handleZoomIn(); }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            <ImageWithWatermark
              src={lightboxImages[lightboxIndex]}
              alt={getAlt(lightboxImages[lightboxIndex], lightboxIndex)}
              className={`select-none ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''} w-auto h-auto object-contain`}
              priority={true}
              style={{
                maxWidth: zoomLevel === 1 ? '85vw' : 'none',
                maxHeight: zoomLevel === 1 ? '85vh' : 'none',
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              draggable={false}
              onClick={(e) => { e.stopPropagation(); if (zoomLevel === 1) handleZoomIn(); }}
            />
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
        <div>{lightboxIndex + 1} / {lightboxImages.length}</div>
        {zoomLevel === 1 && <div className="text-xs text-gray-400 mt-1">Kliknite alebo použite koliesko myši pre zoom</div>}
        {zoomLevel > 1 && <div className="text-xs text-gray-400 mt-1">Ťahajte pre posun obrázka</div>}
      </div>

      {/* Thumbnails */}
      {lightboxImages.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
          {lightboxImages.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${idx === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt={getAlt(img, idx)} className="w-full h-full object-cover" width={64} height={48} loading="lazy" onContextMenu={(e) => e.preventDefault()} draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}