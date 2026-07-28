import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LeadModal({ dom, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [errorMsg, setErrorMsg] = useState(null);

  const leadMutation = useMutation({
    mutationFn: async () => {
      const novyDopyt = await base44.entities.Dopyt.create({
        meno: form.name,
        email: form.email,
        telefon: form.phone,
        typ_dopytu: "detail_domu",
        dom_id: dom.id,
        poznamka: `Realitný Portál AI – záujem o ${dom.nazov}. ${form.note || ""}`.trim(),
      });

      await base44.functions.invoke("notifikujNovyDopyt", {
        dopyt: {
          id: novyDopyt.id,
          klient_meno: form.name,
          klient_email: form.email,
          klient_telefon: form.phone,
          klient_adresa: "",
          typ_dopytu: "detail_domu",
          poznamka: form.note,
          dom_nazov: dom.nazov,
          dom_id: dom.id,
        },
      });

      base44.analytics.track({
        eventName: "realestate_portal_lead_submit",
        properties: { dom_nazov: dom.nazov },
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

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          aria-label="Zavrieť"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
            Mám záujem o dom
          </Badge>
          <h3 className="text-base font-bold text-white leading-snug">{dom.nazov}</h3>
          <p className="text-xs text-slate-400 font-mono">
            {dom.vyrobca} • od {Math.round(dom.zakladna_cena).toLocaleString("sk-SK")} €
          </p>
        </div>

        {leadMutation.isSuccess ? (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Ďakujeme za váš záujem!</h4>
            <p className="text-xs text-slate-300 font-mono">
              Váš dopyt bol odoslaný. Náš poradca American Living vás bude čoskoro kontaktovať.
            </p>
            <Button onClick={onClose} className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
              Zavrieť
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Meno a priezvisko *</label>
              <input
                type="text" required
                placeholder="napr. Ján Novák"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Telefónne číslo *</label>
              <input
                type="tel" required
                placeholder="napr. +421 905 123 456"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Váš e-mail *</label>
              <input
                type="email" required
                placeholder="napr. jan.novak@email.sk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Poznámka / otázka (voliteľné)</label>
              <textarea
                rows={2}
                placeholder="Mám záujem o osobnú obhliadku..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={leadMutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl"
            >
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