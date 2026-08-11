import React, { useState } from "react";
import { optimizeImageUrl } from "../ImageWithWatermark";

function SafeImg({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);
  if (!src || failed) return null;

  const optimized = useOriginal ? src : optimizeImageUrl(src, 800);

  return (
    <img
      src={optimized}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!useOriginal) setUseOriginal(true);
        else setFailed(true);
      }}
      className="w-full h-64 object-cover"
    />
  );
}

export default function DomFotoPair({ dom }) {
  const gallery = [
    dom.hlavny_obrazok,
    dom.zakladna_konfiguracia_obrazok,
    ...(dom.galeria || []),
  ].filter(Boolean);

  const photos = [...new Set(gallery)].slice(0, 2);

  return (
    <div className={photos.length > 1 ? "grid grid-cols-2 gap-2" : ""}>
      {photos.map((url, i) => (
        <SafeImg key={url} src={url} alt={`${dom.nazov} – foto ${i + 1}`} />
      ))}
    </div>
  );
}