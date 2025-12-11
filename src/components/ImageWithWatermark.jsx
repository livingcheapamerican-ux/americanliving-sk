import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ImageWithWatermark({ src, alt, className, onLoad, useCatalogSetting = false, ...props }) {
  const { data: settings } = useQuery({
    queryKey: ['site-settings-watermark'],
    queryFn: async () => {
      const all = await base44.entities.SiteSettings.list();
      return all.find(s => s.klic === 'watermark_settings') || null;
    }
  });

  const watermarkEnabled = useCatalogSetting 
    ? (settings?.watermark_enabled_catalog || false)
    : (settings?.watermark_enabled || false);
  const watermarkText = settings?.watermark_text || "American Living";
  const watermarkPosition = settings?.watermark_position || "bottom-right";
  const watermarkOpacity = settings?.watermark_opacity || 0.3;
  const watermarkSize = settings?.watermark_size || "medium";

  const positionClasses = {
    "top-left": "top-2 left-2 sm:top-4 sm:left-4",
    "top-right": "top-2 right-2 sm:top-4 sm:right-4",
    "bottom-left": "bottom-2 left-2 sm:bottom-4 sm:left-4",
    "bottom-right": "bottom-2 right-2 sm:bottom-4 sm:right-4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  const sizeClasses = {
    "small": "text-xs sm:text-sm",
    "medium": "text-sm sm:text-base md:text-lg",
    "large": "text-base sm:text-lg md:text-xl",
    "xlarge": "text-lg sm:text-xl md:text-2xl",
    "xxlarge": "text-xl sm:text-2xl md:text-3xl lg:text-4xl"
  };

  return (
    <div className="relative w-full h-full">
      <img src={src} alt={alt} className={className} onLoad={onLoad} {...props} />
      {watermarkEnabled && (
        <div 
          className={`absolute ${positionClasses[watermarkPosition]} ${sizeClasses[watermarkSize]} font-bold text-white pointer-events-none select-none`}
          style={{ 
            opacity: watermarkOpacity,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {watermarkText}
        </div>
      )}
    </div>
  );
}