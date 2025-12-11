import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ImageWithWatermark({ src, alt, className, onLoad, useCatalogSetting = false, ...props }) {
  const { data: settings } = useQuery({
    queryKey: ['site-settings-watermark'],
    queryFn: async () => {
      const all = await base44.entities.SiteSettings.list();
      return all.find(s => s.klic === 'watermark_settings') || null;
    },
    staleTime: 60000,
  });

  const enabled = useCatalogSetting 
    ? settings?.watermark_enabled_catalog 
    : settings?.watermark_enabled;

  const text = settings?.watermark_text || "American Living";
  const position = settings?.watermark_position || "bottom-right";
  const opacity = settings?.watermark_opacity || 0.3;
  const size = settings?.watermark_size || "medium";

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  const sizeClasses = {
    "small": "text-sm",
    "medium": "text-base",
    "large": "text-xl",
    "xlarge": "text-2xl",
    "xxlarge": "text-4xl"
  };

  return (
    <div className="relative inline-block">
      <img src={src} alt={alt} className={className} onLoad={onLoad} {...props} />
      {enabled && (
        <div 
          className={`absolute ${positionClasses[position]} ${sizeClasses[size]} font-bold text-white pointer-events-none select-none`}
          style={{ 
            opacity: opacity,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}