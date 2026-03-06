import React from "react";
import { Card } from "@/components/ui/card";

export default function YoutubePlayer({ videoId, title }) {
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <Card className="p-3 sm:p-4">
      <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">Video prezentácia</h3>
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer group"
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
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full">
            ▶ Pozrieť na YouTube
          </span>
        </div>
      </a>
    </Card>
  );
}