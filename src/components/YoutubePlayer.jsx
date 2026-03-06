import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export default function YoutubePlayer({ videoId, title }) {
  const [open, setOpen] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  // youtube-nocookie.com obchádza CSP/cookie obmedzenia a chybu 153
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <>
      <Card className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">Video prezentácia</h3>
        <div
          className="relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer group"
          onClick={() => setOpen(true)}
        >
          <img
            src={thumbUrl}
            alt={`Video: ${title}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        </div>
      )}
    </>
  );
}