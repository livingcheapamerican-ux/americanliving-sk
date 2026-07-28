import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Eye, MessageSquare, Plus, Clock, CheckCircle2, XCircle, LayoutDashboard, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_META = {
  cakajuci: { label: "Čaká na schválenie", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30", Icon: Clock },
  schvaleny: { label: "Zverejnený", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", Icon: CheckCircle2 },
  zamietnuty: { label: "Zamietnutý", cls: "bg-red-500/20 text-red-300 border-red-500/30", Icon: XCircle },
};

export default function MojeInzeraty() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: inzeraty = [], isLoading } = useQuery({
    queryKey: ["moje-inzeraty", user?.email],
    queryFn: async () => {
      const [podlaEmailu, vsetky] = await Promise.all([
        base44.entities.Nehnutelnost.filter({ kontakt_email: user.email }, "-created_date"),
        base44.entities.Nehnutelnost.filter({ created_by_id: user.id }, "-created_date"),
      ]);
      const map = new Map();
      [...podlaEmailu, ...vsetky].forEach((i) => map.set(i.id, i));
      return [...map.values()].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.email,
  });

  const { data: dopyty = [] } = useQuery({
    queryKey: ["moje-inzeraty-dopyty", inzeraty.map((i) => i.id).join(",")],
    queryFn: async () => {
      const vysledky = await Promise.all(
        inzeraty.map((i) => base44.entities.Dopyt.filter({ nehnutelnost_id: i.id }, "-created_date"))
      );
      return vysledky.flat();
    },
    enabled: inzeraty.length > 0,
  });

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 pt-32 text-sm">Načítavam...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-300 text-sm">Pre zobrazenie svojich inzerátov sa prosím prihláste.</p>
        <Button onClick={() => base44.auth.redirectToLogin()} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
          Prihlásiť sa
        </Button>
      </div>
    );
  }

  const celkomZobrazeni = inzeraty.reduce((s, i) => s + (i.pocet_zobrazeni || 0), 0);
  const aktivne = inzeraty.filter((i) => i.status === "schvaleny").length;
  const noveDopyty = dopyty.filter((d) => !d.spracovany).length;

  const dopytyPreInzerat = (id) => dopyty.filter((d) => d.nehnutelnost_id === id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-amber-400" /> Moje inzeráty
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Prehľad vašich ponúk, dopytov od záujemcov a návštevnosti · {user.email}
            </p>
          </div>
          <Link to="/pridat-inzerat">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-xl">
              <Plus className="w-3.5 h-3.5 mr-1" /> Pridať inzerát
            </Button>
          </Link>
        </div>

        {/* Štatistiky */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["Aktívne inzeráty", aktivne, "text-emerald-400"],
            ["Celkom inzerátov", inzeraty.length, "text-white"],
            ["Zobrazenia", celkomZobrazeni, "text-sky-400"],
            ["Nové dopyty", noveDopyty, "text-amber-400"],
          ].map(([label, value, cls]) => (
            <div key={label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] text-slate-400 font-mono uppercase">{label}</p>
              <p className={`text-2xl font-black ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="text-slate-400 text-sm">Načítavam inzeráty...</p>
        ) : inzeraty.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <p className="text-sm text-slate-300 font-bold">Zatiaľ nemáte žiadne inzeráty</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Pridajte svoju prvú nehnuteľnosť na predaj alebo prenájom – inzercia je úplne zadarmo.
            </p>
            <Link to="/pridat-inzerat">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1" /> Pridať inzerát zadarmo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {inzeraty.map((inz) => {
              const meta = STATUS_META[inz.status] || STATUS_META.cakajuci;
              const mojeDopyty = dopytyPreInzerat(inz.id);
              const jePrenajom = inz.typ_ponuky === "prenajom";
              return (
                <div key={inz.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      {inz.fotky?.[0] ? (
                        <img src={inz.fotky[0]} alt={inz.nazov} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-slate-700">🏠</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`border text-[10px] ${meta.cls}`}>
                          <meta.Icon className="w-3 h-3 mr-1" /> {meta.label}
                        </Badge>
                        <Badge className={`text-[10px] ${jePrenajom ? "bg-sky-500/20 text-sky-300" : "bg-purple-500/20 text-purple-300"}`}>
                          {jePrenajom ? "Prenájom" : "Predaj"}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-white">{inz.nazov}</h3>
                      <p className="text-slate-400 font-mono">
                        {inz.mesto} • {Math.round(inz.cena).toLocaleString("sk-SK")} €{jePrenajom ? " / mes." : ""}
                        {jePrenajom && inz.depozit ? ` • depozit ${Math.round(inz.depozit).toLocaleString("sk-SK")} €` : ""}
                        {inz.plocha ? ` • ${inz.plocha} m²` : ""}
                      </p>
                    </div>
                    <div className="flex md:flex-col gap-3 md:gap-1.5 shrink-0 text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-sky-300">
                        <Eye className="w-3.5 h-3.5" /> {inz.pocet_zobrazeni || 0} zobrazení
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <MessageSquare className="w-3.5 h-3.5" /> {mojeDopyty.length} dopytov
                      </span>
                    </div>
                  </div>

                  {mojeDopyty.length > 0 && (
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Dopyty od záujemcov</p>
                      {mojeDopyty.map((d) => (
                        <div key={d.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                          <div className="space-y-0.5">
                            <p className="text-white font-bold">{d.meno}</p>
                            <p className="text-slate-400 font-mono flex flex-wrap gap-x-3">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{d.telefon}</span>
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{d.email}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-500 font-mono text-[10px]">
                              {new Date(d.created_date).toLocaleDateString("sk-SK")}
                            </span>
                            <Badge className={`text-[10px] ${d.spracovany ? "bg-slate-800 text-slate-400" : "bg-amber-500/20 text-amber-300"}`}>
                              {d.spracovany ? "Vyriešený" : "Nový"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}