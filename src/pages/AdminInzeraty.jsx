import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_META = {
  cakajuci: { label: "Čaká na schválenie", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  schvaleny: { label: "Schválený", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  zamietnuty: { label: "Zamietnutý", cls: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export default function AdminInzeraty() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin" || user?.super_admin === true;

  const { data: inzeraty = [], isLoading } = useQuery({
    queryKey: ["admin-inzeraty"],
    queryFn: () => base44.entities.Nehnutelnost.list("-created_date", 200),
    enabled: !!isAdmin,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Nehnutelnost.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inzeraty"] }),
  });

  if (user && !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 pt-32">Prístup len pre administrátorov.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" /> Moderácia inzerátov
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Schvaľujte inzeráty pred zverejnením v Realitnom Portáli AI. Čakajúcich: {inzeraty.filter(i => i.status === "cakajuci").length}
          </p>
        </div>

        {isLoading ? (
          <p className="text-slate-400 text-sm">Načítavam inzeráty...</p>
        ) : inzeraty.length === 0 ? (
          <p className="text-slate-400 text-sm">Zatiaľ žiadne inzeráty.</p>
        ) : (
          <div className="space-y-3">
            {inzeraty.map((inz) => {
              const meta = STATUS_META[inz.status] || STATUS_META.cakajuci;
              return (
                <div key={inz.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                    {inz.fotky?.[0] ? (
                      <img src={inz.fotky[0]} alt={inz.nazov} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-slate-700">🏠</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`border text-[10px] ${meta.cls}`}>{meta.label}</Badge>
                      <Badge className="bg-slate-800 text-slate-300 text-[10px]">{inz.typ_ponuky === "prenajom" ? "Prenájom" : "Predaj"}</Badge>
                      <span className="text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(inz.created_date).toLocaleDateString("sk-SK")}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{inz.nazov}</h3>
                    <p className="text-slate-400 font-mono">
                      {inz.mesto} • {Math.round(inz.cena).toLocaleString("sk-SK")} €{inz.typ_ponuky === "prenajom" ? "/mes." : ""} • {inz.plocha ? `${inz.plocha} m²` : "plocha neuvedená"}
                    </p>
                    <p className="text-slate-500">Kontakt: {inz.kontakt_meno}, {inz.kontakt_telefon}, {inz.kontakt_email}</p>
                    {inz.popis && <p className="text-slate-400 line-clamp-2">{inz.popis}</p>}
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    {inz.status !== "schvaleny" && (
                      <Button size="sm" onClick={() => statusMutation.mutate({ id: inz.id, status: "schvaleny" })}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl">
                        <Check className="w-3.5 h-3.5 mr-1" /> Schváliť
                      </Button>
                    )}
                    {inz.status !== "zamietnuty" && (
                      <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: inz.id, status: "zamietnuty" })}
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs rounded-xl bg-transparent">
                        <X className="w-3.5 h-3.5 mr-1" /> Zamietnuť
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}