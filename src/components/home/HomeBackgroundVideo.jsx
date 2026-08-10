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
  const clips = videoUrl ? [videoUrl, ...PLAYLIST.filter(u => u !== videoUrl)] : PLAYLIST;

  const refA = useRef(null);
  const refB = useRef(null);
  const [active, setActive] = useState(0); // 0 = A viditeľné, 1 = B
  const [srcA, setSrcA] = useState(clips[0]);
  const [srcB, setSrcB] = useState(clips[1 % clips.length]);
  const nextIndex = useRef(1 % clips.length);
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
    const v = refA.current;
    if (v) { v.muted = true; v.play().catch(() => {}); }
  }, []);

  // Prepnutie na už predom načítané video – bez čakania
  const handleEnded = (from) => {
    const incoming = from === 0 ? refB.current : refA.current;
    if (incoming) { incoming.muted = true; incoming.currentTime = 0; incoming.play().catch(() => {}); }
    setActive(from === 0 ? 1 : 0);

    // do práve uvoľneného elementu nahraj ďalší klip dopredu
    nextIndex.current = (nextIndex.current + 1) % clips.length;
    const upcoming = clips[nextIndex.current];
    if (from === 0) setSrcA(upcoming); else setSrcB(upcoming);
  };

  const common = "absolute inset-0 w-full h-full object-cover transition-opacity duration-700";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0D0D11] z-0 pointer-events-none select-none">
      <video
        ref={refA}
        src={srcA}
        autoPlay muted playsInline preload="auto" aria-hidden="true"
        onEnded={() => handleEnded(0)}
        className={`${common} ${active === 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ filter: dark ? 'brightness(0.55)' : 'none' }}
      />
      <video
        ref={refB}
        src={srcB}
        muted playsInline preload="auto" aria-hidden="true"
        onEnded={() => handleEnded(1)}
        className={`${common} ${active === 1 ? 'opacity-100' : 'opacity-0'}`}
        style={{ filter: dark ? 'brightness(0.55)' : 'none' }}
      />
    </div>
  );
}