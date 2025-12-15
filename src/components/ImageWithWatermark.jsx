import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ImageWithWatermark({ src, alt, className, onLoad, useCatalogSetting = false, priority = false, ...props }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const { data: settings } = useQuery({
    queryKey: ['site-settings-watermark'],
    queryFn: async () => {
      try {
        const all = await base44.entities.SiteSettings.list();
        return all.find(s => s.klic === 'watermark_settings') || null;
      } catch (error) {
        console.error('Error loading watermark settings:', error);
        return null;
      }
    },
    staleTime: 300000,
    retry: false,
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

  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center select-none" 
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={(e) => {
        if (e.button === 2) e.preventDefault();
      }}
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none',
        WebkitUserDrag: 'none',
        userDrag: 'none'
      }}
    >
      {/* Invisible overlay to prevent inspection */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      />
      
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 select-none pointer-events-none`}
        onLoad={handleLoad}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none', 
          WebkitTouchCallout: 'none',
          WebkitUserDrag: 'none',
          userDrag: 'none',
          pointerEvents: 'none'
        }}
        {...props} 
      />
      {enabled && loaded && (
        <div 
          className={`absolute ${positionClasses[position]} ${sizeClasses[size]} font-bold text-white pointer-events-none select-none z-20`}
          style={{ 
            opacity: Math.max(opacity, 0.5),
            textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            letterSpacing: '0.1em'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}