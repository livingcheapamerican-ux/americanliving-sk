import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MousePointer, X } from "lucide-react";
import { safeFormat } from "./sessionUtils";

function Wireframe({ page }) {
  const p = (page || "").toLowerCase();
  const isDownload = p.includes("stiahnite-si-nas-katalog") || p.includes("stiahnutie");
  const isConfigurator = p.includes("konfigurator");
  const isCatalog = !isDownload && p.includes("katalog");

  const Block = ({ children, className = "" }) => (
    <div className={`border border-white/10 rounded-lg bg-slate-900/40 p-4 ${className}`}>{children}</div>
  );

  if (isDownload) {
    return (
      <div className="w-full min-h-[560px] flex flex-col gap-4 p-4 text-white">
        <Block className="flex items-center justify-between"><span className="font-bold text-sm">Stiahnutie katalógu</span></Block>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Block className="lg:col-span-7 min-h-[280px]">
            <p className="text-[10px] text-slate-400 font-bold mb-2">Texty a ukážky katalógu</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] bg-slate-950/60 rounded border border-white/5" />)}
            </div>
          </Block>
          <Block className="lg:col-span-5">
            <p className="text-[10px] text-slate-400 font-bold mb-2">Formulár na stiahnutie</p>
            <div className="space-y-2 text-[10px]">
              {['Meno a priezvisko', 'E-mail', 'Telefón'].map(f => (
                <div key={f} className="p-2 bg-white/5 rounded border border-white/5 text-slate-400">{f}</div>
              ))}
              <div className="w-full py-2 bg-red-600 rounded text-center font-bold mt-3">Odoslať</div>
            </div>
          </Block>
        </div>
      </div>
    );
  }

  if (isConfigurator) {
    return (
      <div className="w-full min-h-[560px] flex flex-col gap-4 p-4 text-white">
        <Block className="flex items-center justify-between"><span className="font-bold text-sm">Konfigurátor domu</span></Block>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Block className="md:col-span-2 flex items-center justify-center min-h-[280px] text-slate-500 font-bold text-xs">Vizualizácia domu</Block>
          <Block>
            <p className="text-[10px] text-slate-400 font-bold mb-2">Voliteľné položky</p>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="p-2 bg-white/5 rounded border border-white/10 text-[11px] text-slate-300">Krok {i}</div>)}
            </div>
          </Block>
        </div>
      </div>
    );
  }

  if (isCatalog) {
    return (
      <div className="w-full min-h-[560px] flex flex-col gap-4 p-4 text-white">
        <Block className="flex items-center justify-between"><span className="font-bold text-sm">Katalóg domov</span></Block>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Block key={i} className="flex flex-col gap-2">
              <div className="h-24 bg-slate-950/60 rounded border border-white/5" />
              <div className="font-bold text-xs">Model {i}</div>
            </Block>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[620px] flex flex-col gap-5 p-4 text-white">
      <Block className="flex items-center justify-between">
        <span className="font-black text-xs">AMERICAN LIVING</span>
        <span className="text-[10px] text-slate-400 font-bold">Katalóg · Konfigurátor · Kontakt</span>
      </Block>
      <Block className="min-h-[220px] flex flex-col items-center justify-center text-center">
        <p className="text-sm font-black mb-2">Hero sekcia</p>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-blue-600 rounded text-[9px] font-bold">Konfigurátor</div>
          <div className="px-3 py-1.5 bg-white/10 rounded text-[9px] font-bold">Katalóg</div>
        </div>
      </Block>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <Block key={i} className="text-center text-[10px] font-bold">Sekcia {i}</Block>)}
      </div>
    </div>
  );
}

export default function ClickMapModal({ session, onClose }) {
  const pagesWithClicks = [...new Set((session.clicks || []).map(c => c.page_url))];
  const [page, setPage] = useState(pagesWithClicks[0] || "");
  const [hovered, setHovered] = useState(null);

  const clicks = (session.clicks || []).filter(c => c.page_url === page);
  const intensityOf = (click) => clicks.filter(c =>
    Math.abs((c.x_percent ?? 0) - (click.x_percent ?? 0)) < 3 &&
    Math.abs((c.y_percent ?? 0) - (click.y_percent ?? 0)) < 3
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] bg-slate-900 text-slate-100 border-white/10 flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-950 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-indigo-400" />
              Click mapa relácie
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">
              Session: {String(session.session_id || session.id || '').substring(0, 12)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold">Stránka:</span>
            {pagesWithClicks.length === 0 ? (
              <span className="text-[11px] text-slate-500">Žiadne kliknutia</span>
            ) : (
              <select
                value={page}
                onChange={(e) => setPage(e.target.value)}
                className="px-2.5 py-1 border border-white/10 rounded text-[11px] bg-slate-950 text-white font-bold max-w-md truncate"
              >
                {pagesWithClicks.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-4 text-[11px] font-bold text-slate-400">
            <span>Tu: <span className="text-indigo-400 font-black">{clicks.length}</span></span>
            <span>Celkovo: <span className="text-indigo-400 font-black">{session.clicks?.length || 0}</span></span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-72 border-r border-white/10 bg-slate-950 overflow-y-auto p-3 space-y-2">
            {clicks.map((click, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHovered(click)}
                onMouseLeave={() => setHovered(null)}
                className={`p-2.5 rounded border text-[11px] cursor-pointer transition-all ${
                  hovered === click ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-slate-900/50 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-indigo-400">Klik #{idx + 1}</span>
                  <span className="text-slate-500">{safeFormat(click.timestamp, 'HH:mm:ss')}</span>
                </div>
                <div className="text-slate-200 font-semibold">&lt;{click.element}&gt;</div>
                {click.text && <div className="text-slate-400 italic truncate text-[10px]">"{click.text}"</div>}
              </div>
            ))}
            {clicks.length === 0 && <p className="text-[11px] text-slate-500 text-center py-8 font-bold">Žiadne kliknutia</p>}
          </div>

          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto border border-white/10 rounded-xl overflow-hidden bg-slate-900 relative">
              <div className="bg-slate-950 px-4 py-2 border-b border-white/10 text-[11px] text-slate-400 font-mono truncate text-center">
                {page || '—'}
              </div>
              <div className="relative w-full bg-slate-950 overflow-hidden">
                <Wireframe page={page} />
                {clicks.map((click, idx) => {
                  const x = click.x_percent ?? 50;
                  const y = click.y_percent ?? 50;
                  const intensity = intensityOf(click);
                  const isHovered = hovered === click;
                  let color = "bg-orange-500";
                  if (intensity > 5) color = "bg-red-600";
                  else if (intensity > 2) color = "bg-red-500";
                  else if (intensity === 1) color = "bg-yellow-500";
                  if (isHovered) color = "bg-indigo-400 ring-4 ring-indigo-500/50 scale-150";
                  return (
                    <div
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onMouseEnter={() => setHovered(click)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className={`w-3 h-3 rounded-full border border-white/30 shadow-md transition-all ${color}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}