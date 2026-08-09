import React, { useEffect, useRef, useState } from 'react';

const PLAYLIST = [
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/828604ee8_Hero_interir_video.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/0c2d598c4_Interir_1.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/1a8b1b600_Exterir_1.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/5d8b93133_Interir_2.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/b88638d4d_Exterir_2.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/acfc1c0b3_Interir_3.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/b0d35b2bc_Exterir_4.mp4"
];

export default function HomeBackgroundVideo({ videoUrl }) {
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [dark, setDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const clips = videoUrl ? [videoUrl, ...PLAYLIST.filter(u => u !== videoUrl)] : PLAYLIST;

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
  }, [index]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0D0D11] z-0 pointer-events-none select-none">
      <video
        ref={videoRef}
        key={clips[index % clips.length]}
        src={clips[index % clips.length]}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={() => setIndex(i => (i + 1) % clips.length)}
        className="w-full h-full object-cover"
        style={{ filter: dark ? 'brightness(0.55)' : 'none' }}
      />
    </div>
  );
}