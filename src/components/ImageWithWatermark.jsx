import React from "react";

// Zjednodušený komponent - watermark je už aplikovaný natrvalo na fotkách
export default function ImageWithWatermark({ src, alt, className, onLoad, useCatalogSetting = false, ...props }) {
  return <img src={src} alt={alt} className={className} onLoad={onLoad} {...props} />;
}