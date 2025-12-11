import React, { useState, useEffect, useRef } from "react";

export default function LazyImage({ src, alt, className, onLoad, priority = false, ...props }) {
  const [isVisible, setIsVisible] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}