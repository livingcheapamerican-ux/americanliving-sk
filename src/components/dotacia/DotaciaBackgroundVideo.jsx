import React, { useRef, useState } from 'react';

// Striedanie videí: šťastné rodiny + investori v luxuse
const PLAYLIST = [
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/5ab84ad1c_Rodina_pred_domom.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/1fd5215ac_Investor_v_kresle.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/6dd7690ab_Rodina_sahovanie.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/5a5a350b4_Investori_rokovanie.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/afb7c3465_Rodinn_veera.mp4",
  "https://media.base44.com/videos/public/6916d89a485af231beb54c71/b88638d4d_Exterir_2.mp4"
];

export default function DotaciaBackgroundVideo() {
  const refA = useRef(null);
  const refB = useRef(null);
  const [active, setActive] = useState(0);
  const [srcA, setSrcA] = useState(PLAYLIST[0]);
  const [srcB, setSrcB] = useState(PLAYLIST[1]);
  const nextIndex = useRef(1);

  const handleEnded = (from) => {
    const incoming = from === 0 ? refB.current : refA.current;
    if (incoming) { incoming.muted = true; incoming.currentTime = 0; incoming.play().catch(() => {}); }
    setActive(from === 0 ? 1 : 0);
    nextIndex.current = (nextIndex.current + 1) % PLAYLIST.length;
    const upcoming = PLAYLIST[nextIndex.current];
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
      />
      <video
        ref={refB}
        src={srcB}
        muted playsInline preload="auto" aria-hidden="true"
        onEnded={() => handleEnded(1)}
        className={`${common} ${active === 1 ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Jemný gradient bez rozmazania – video ostáva ostré */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80" />
    </div>
  );
}