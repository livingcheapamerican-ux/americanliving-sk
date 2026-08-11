import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// ─── URL optimizer ──────────────────────────────────────────────────────────
export function optimizeImageUrl(src, width = 800) {
  if (!src) return src;

  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("fm", "webp");
    url.searchParams.set("auto", "format,compress");
    if (!url.searchParams.has("w") || parseInt(url.searchParams.get("w")) > width) {
      url.searchParams.set("w", String(width));
    }
    url.searchParams.set("q", "75");
    return url.toString();
  }

  // Base44 files URL (either with domain or relative)
  const base44Regex = /^(?:https?:\/\/(?:base44\.app|app\.base44\.com))?\/api\/apps\/([a-f0-9]+)\/files\/public\/\1\/(.+)$/i;
  const base44Match = src.match(base44Regex);
  
  if (base44Match) {
    const appId = base44Match[1];
    const filename = base44Match[2];
    // Convert directly to Supabase resizing URL to bypass the Base44 redirect and enable image optimization
    // CRITICAL: We MUST add resize=contain to prevent Supabase from cropping the images!
    return `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/${appId}/${filename}?width=${width}&resize=contain&format=webp&quality=75`;
  }

  // Direct Supabase storage URL
  if (src.includes("supabase.co/storage")) {
    try {
      // Replace object/public with render/image/public for resizing
      let optimizedUrl = src;
      if (optimizedUrl.includes("/storage/v1/object/public/")) {
        optimizedUrl = optimizedUrl.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      }
      const url = new URL(optimizedUrl);
      url.searchParams.set("width", String(width));
      url.searchParams.set("resize", "contain"); // Prevent cropping
      url.searchParams.set("format", "webp");
      url.searchParams.set("quality", "75");
      return url.toString();
    } catch {
      return src;
    }
  }

  return src;
}

// ─── Trvalá cache fotiek (Supabase posiela no-cache, prehliadač by ich inak sťahoval znova) ───
const memoryCache = new Map(); // url -> objectURL
const loadedUrls = new Set(); // už raz zobrazené fotky – pri prekreslení sa neblikne placeholder

async function getCachedImageUrl(src) {
  if (memoryCache.has(src)) return memoryCache.get(src);
  const cache = await caches.open("al-img-v1");
  let res = await cache.match(src);
  if (!res) {
    res = await fetch(src);
    if (!res.ok) throw new Error("fetch failed");
    await cache.put(src, res.clone());
  }
  const objectUrl = URL.createObjectURL(await res.blob());
  memoryCache.set(src, objectUrl);
  return objectUrl;
}

function isCacheable(url) {
  return !!url && typeof window !== "undefined" && "caches" in window && url.includes("supabase.co/storage");
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ImageWithWatermark({
  src,
  alt,
  className,
  onLoad,
  useCatalogSetting = false,
  priority = false,
  fetchpriority,
  optimizeWidth = 800,
  style,
  id,
  ...props
}) {
  const [error, setError] = React.useState(false);
  const [useOriginal, setUseOriginal] = React.useState(false);
  const imgRef = React.useRef(null);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-watermark"],
    queryFn: async () => {
      try {
        const all = await base44.entities.SiteSettings.list();
        return all.find((s) => s.klic === "watermark_settings") || null;
      } catch {
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
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-xl",
    xlarge: "text-2xl",
    xxlarge: "text-4xl",
  };

  const optimizedSrc = useOriginal ? src : optimizeImageUrl(src, optimizeWidth);

  // Fotku servírujeme z trvalej cache – po prvom načítaní sa už nikdy nesťahuje znova
  const [displaySrc, setDisplaySrc] = React.useState(() =>
    isCacheable(optimizedSrc) ? memoryCache.get(optimizedSrc) || null : optimizedSrc
  );

  // Ak sme fotku už raz zobrazili, ukáž ju hneď – žiadny placeholder ani fade
  const [loaded, setLoaded] = React.useState(() => loadedUrls.has(optimizedSrc));

  React.useEffect(() => {
    if (loadedUrls.has(optimizedSrc)) setLoaded(true);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      loadedUrls.add(optimizedSrc);
      setLoaded(true);
    }
  }, [optimizedSrc]);

  React.useEffect(() => {
    if (!isCacheable(optimizedSrc)) {
      setDisplaySrc(optimizedSrc);
      return;
    }
    if (memoryCache.has(optimizedSrc)) {
      setDisplaySrc(memoryCache.get(optimizedSrc));
      return;
    }
    let alive = true;
    getCachedImageUrl(optimizedSrc)
      .then((u) => { if (alive) setDisplaySrc(u); })
      .catch(() => { if (alive) setDisplaySrc(optimizedSrc); });
    return () => { alive = false; };
  }, [optimizedSrc]);

  const handleLoad = (e) => {
    loadedUrls.add(optimizedSrc);
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const loadingAttr = priority ? "eager" : "lazy";
  const fetchPriorityAttr = fetchpriority || (priority ? "high" : undefined);

  return (
    <div
      id={id}
      className="relative w-full h-full flex items-center justify-center select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserDrag: "none",
        userDrag: "none",
      }}
    >
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "transparent", userSelect: "none", WebkitUserSelect: "none" }}
      />

      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {displaySrc && (
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 select-none pointer-events-none`}
        onLoad={handleLoad}
        onError={() => {
          if (!useOriginal && optimizedSrc !== src) setUseOriginal(true);
          else setError(true);
        }}
        loading={loadingAttr}
        fetchpriority={fetchPriorityAttr}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitUserDrag: "none",
          userDrag: "none",
          pointerEvents: "none",
          ...style,
        }}
        {...props}
      />
      )}

      {enabled && loaded && (
        <div
          className={`absolute ${positionClasses[position]} ${sizeClasses[size]} font-bold text-white pointer-events-none select-none z-20`}
          style={{
            opacity: opacity,
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}