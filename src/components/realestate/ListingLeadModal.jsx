import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ListingLeadModal({ listing, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [errorMsg, setErrorMsg] = useState(null);
  const jePrenajom = listing.typ_ponuky === "prenajom";

  const leadMutation = useMutation({
    mutationFn: async () => {
      const novyDopyt = await base44.entities.Dopyt.create({
        meno: form.name,
        email: form.email,
        telefon: form.phone,
        typ_dopytu: "vseobecny",
        nehnutelnost_id: listing.id,
        poznamka: `Realitný Portál AI – záujem o inzerát "${listing.nazov}" (${jePrenajom ? "prenájom" : "predaj"}, ${listing.mesto}, ${Math.round(listing.cena).toLocaleString("sk-SK")} €). Kontakt inzerenta: ${listing.kontakt_meno}, ${listing.kontakt_telefon}. ${form.note || ""}`.trim(),
      });

      await base44.functions.invoke("notifikujNovyDopyt", {
        dopyt: {
          id: novyDopyt.id,
          klient_meno: form.name,
          klient_email: form.email,
          klient_telefon: form.phone,
          klient_adresa: "",
          typ_dopytu: "vseobecny",
          poznamka: `Inzerát: ${listing.nazov} (${listing.mesto})`,
          dom_nazov: listing.nazov,
          dom_id: "",
        },
      });

      base44.analytics.track({
        eventName: "realestate_portal_listing_lead",
        properties: { listing_nazov: listing.nazov, typ: listing.typ_ponuky },
      });

      return novyDopyt;
    },
    onError: () => {
      setErrorMsg("Dopyt sa nepodarilo odoslať. Skúste to prosím znova alebo nám zavolajte na +421 905 138 124.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    leadMutation.mutate();
  };

  const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-400 focus:outline-none";

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800" aria-label="Zavrieť">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
            {jePrenajom ? "Mám záujem o prenájom" : "Mám záujem o nehnuteľnosť"}
          </Badge>
          <h3 className="text-base font-bold text-white leading-snug">{listing.nazov}</h3>
          <p className="text-xs text-slate-400 font-mono">
            {listing.mesto} • {Math.round(listing.cena).toLocaleString("sk-SK")} €{jePrenajom ? " / mes." : ""}
          </p>
        </div>

        {leadMutation.isSuccess ? (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Ďakujeme za váš záujem!</h4>
            <p className="text-xs text-slate-300 font-mono">
              Váš dopyt bol odoslaný. Prepojíme vás s inzerentom čo najskôr.
            </p>
            <Button onClick={onClose} className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
              Zavrieť
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Meno a priezvisko *</label>
              <input type="text" required placeholder="napr. Ján Novák" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Telefónne číslo *</label>
              <input type="tel" required placeholder="napr. +421 905 123 456" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Váš e-mail *</label>
              <input type="email" required placeholder="napr. jan.novak@email.sk" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Poznámka / otázka (voliteľné)</label>
              <textarea rows={2} placeholder="Mám záujem o obhliadku..." value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
            </div>

            {errorMsg && (
              <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMsg}</p>
            )}

            <Button type="submit" disabled={leadMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-3 rounded-xl">
              {leadMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Odosielam...</span>
              ) : (
                "Odoslať dopyt"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}