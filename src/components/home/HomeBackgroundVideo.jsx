import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_VIDEO = "https://media.base44.com/videos/public/6916d89a485af231beb54c71/828604ee8_Hero_interir_video.mp4";

export default function HomeBackgroundVideo({ videoUrl }) {
  const videoRef = useRef(null);
  const [dark, setDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#EFE9DF] dark:bg-[#050508] z-0 pointer-events-none select-none">
      <video
        ref={videoRef}
        src={videoUrl || DEFAULT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
        style={{ filter: dark ? 'brightness(0.35) contrast(1.1)' : 'brightness(0.9) contrast(1.02)' }}
      />
      {/* Jemný závoj, aby bol obsah stránky čitateľný nad videom */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: dark ? 'rgba(5, 5, 8, 0.8)' : 'rgba(239, 233, 223, 0.88)' }}
      />
    </div>
  );
}