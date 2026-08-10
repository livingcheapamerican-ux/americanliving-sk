import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, CheckCircle2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhotoUploader from "@/components/realestate/PhotoUploader";
import RentalFields from "@/components/realestate/RentalFields";

const KATEGORIE = [
  ["byt", "Byt"],
  ["rodinny_dom", "Rodinný dom"],
  ["pozemok", "Pozemok"],
  ["chata", "Chata / rekreácia"],
  ["komercny", "Komerčný priestor"],
  ["iny", "Iné"],
];

const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-purple-400 focus:outline-none";
const selectCls = "bg-slate-950 border-slate-800 text-slate-200 text-xs rounded-xl h-10 w-full";

export default function PridatInzerat() {
  const [form, setForm] = useState({
    nazov: "", typ_ponuky: "predaj", kategoria: "byt", mesto: "", adresa: "",
    plocha: "", pocet_izieb: "", cena: "", popis: "",
    kontakt_meno: "", kontakt_email: "", kontakt_telefon: "", zdroj: "majitel",
    depozit: "", energie_v_cene: false, min_doba_najmu: "1_rok", volne_od: "", podmienky_prenajmu: "",
  });
  const [fotky, setFotky] = useState([]);
  const [aiPopisPending, setAiPopisPending] = useState(false);
  const [aiPopisPouzity, setAiPopisPouzity] = useState(false);
  const [aiOdhad, setAiOdhad] = useState(null);
  const [aiOdhadPending, setAiOdhadPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target?.value ?? e });

  const generujPopis = async () => {
    setAiPopisPending(true);
    try {
      const text = await base44.integrations.Core.InvokeLLM({
        prompt: `Napíš profesionálny, predajný popis realitného inzerátu v slovenčine (100-150 slov, bez nadpisu, priateľský ale dôveryhodný tón). Údaje:
Typ ponuky: ${form.typ_ponuky === "prenajom" ? "prenájom" : "predaj"}
Kategória: ${KATEGORIE.find(k => k[0] === form.kategoria)?.[1]}
Názov: ${form.nazov || "neuvedený"}
Mesto: ${form.mesto || "neuvedené"}
Plocha: ${form.plocha || "neuvedená"} m²
Počet izieb: ${form.pocet_izieb || "neuvedený"}
Cena: ${form.cena || "neuvedená"} €
Doterajší popis od majiteľa (rozviň ho): ${form.popis || "žiadny"}`,
      });
      setForm(f => ({ ...f, popis: text.trim() }));
      setAiPopisPouzity(true);
    } finally {
      setAiPopisPending(false);
    }
  };

  const odhadniCenu = async () => {
    setAiOdhadPending(true);
    setAiOdhad(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Si realitný expert na slovenský trh nehnuteľností (rok 2026). Odhadni realistickú trhovú cenu pre: ${KATEGORIE.find(k => k[0] === form.kategoria)?.[1]}, mesto ${form.mesto}, plocha ${form.plocha} m², ${form.pocet_izieb || "?"} izieb, typ: ${form.typ_ponuky === "prenajom" ? "mesačný prenájom" : "predaj"}. Vráť spodnú a hornú hranicu odhadu v EUR a krátky komentár v slovenčine (max 20 slov).`,
        response_json_schema: {
          type: "object",
          properties: {
            odhad_min: { type: "number" },
            odhad_max: { type: "number" },
            komentar: { type: "string" },
          },
        },
      });
      setAiOdhad(res);
    } finally {
      setAiOdhadPending(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const rec = await base44.entities.Nehnutelnost.create({
        nazov: form.nazov,
        typ_ponuky: form.typ_ponuky,
        kategoria: form.kategoria,
        popis: form.popis,
        cena: Number(form.cena),
        mesto: form.mesto,
        adresa: form.adresa,
        plocha: form.plocha ? Number(form.plocha) : undefined,
        pocet_izieb: form.pocet_izieb ? Number(form.pocet_izieb) : undefined,
        fotky,
        kontakt_meno: form.kontakt_meno,
        kontakt_email: form.kontakt_email,
        kontakt_telefon: form.kontakt_telefon,
        zdroj: form.zdroj,
        ...(form.typ_ponuky === "prenajom" ? {
          depozit: form.depozit ? Number(form.depozit) : undefined,
          energie_v_cene: form.energie_v_cene,
          min_doba_najmu: form.min_doba_najmu,
          volne_od: form.volne_od || undefined,
          podmienky_prenajmu: form.podmienky_prenajmu || undefined,
        } : {}),
        status: "cakajuci",
        ai_popis_generovany: aiPopisPouzity,
        ai_cena_odhad_min: aiOdhad?.odhad_min,
        ai_cena_odhad_max: aiOdhad?.odhad_max,
      });
      base44.analytics.track({ eventName: "realestate_listing_submitted", properties: { typ: form.typ_ponuky } });
      return rec;
    },
    onError: () => setErrorMsg("Inzerát sa nepodarilo odoslať. Skúste to prosím znova."),
  });

  const mozeGenerovat = form.mesto && form.kategoria;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px]">
            Inzercia je 100 % zadarmo pre majiteľov aj agentov
          </Badge>
          <h1 className="text-2xl md:text-3xl font-black text-white">Pridať inzerát zadarmo</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Predávate alebo prenajímate nehnuteľnosť? Zverejnite ju v Realitnom Portáli AI – s AI popisom a odhadom ceny. Bez poplatkov, bez provízií za inzerciu.
          </p>
        </div>

        {submitMutation.isSuccess ? (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-8 rounded-3xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="font-bold text-white text-lg">Inzerát bol odoslaný!</h2>
            <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto">
              Váš inzerát prejde rýchlou kontrolou (zvyčajne do 24 hodín) a potom sa zobrazí v portáli. O schválení vás budeme informovať e-mailom.
            </p>
            <Link to="/real-estate-portal">
              <Button className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                Späť na portál
              </Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setErrorMsg(null); submitMutation.mutate(); }}
            className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs font-mono"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Typ ponuky *</label>
                <Select value={form.typ_ponuky} onValueChange={set("typ_ponuky")}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predaj">Predaj</SelectItem>
                    <SelectItem value="prenajom">Prenájom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Kategória *</label>
                <Select value={form.kategoria} onValueChange={set("kategoria")}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KATEGORIE.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Názov inzerátu *</label>
              <input type="text" required placeholder="napr. Slnečný 3-izbový byt s balkónom" value={form.nazov} onChange={set("nazov")} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Mesto *</label>
                <input type="text" required placeholder="napr. Žilina" value={form.mesto} onChange={set("mesto")} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Ulica / časť (voliteľné)</label>
                <input type="text" placeholder="napr. Staré Mesto" value={form.adresa} onChange={set("adresa")} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Plocha (m²)</label>
                <input type="number" min="1" placeholder="85" value={form.plocha} onChange={set("plocha")} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Počet izieb</label>
                <input type="number" min="1" placeholder="3" value={form.pocet_izieb} onChange={set("pocet_izieb")} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cena (€{form.typ_ponuky === "prenajom" ? "/mes." : ""}) *</label>
                <input type="number" min="1" required placeholder="185000" value={form.cena} onChange={set("cena")} className={inputCls} />
              </div>
            </div>

            {form.typ_ponuky === "prenajom" && (
              <RentalFields form={form} onChange={setForm} />
            )}

            {/* AI odhad ceny */}
            <div className="bg-slate-950 border border-purple-500/20 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-purple-300 font-bold flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> Neviete akú cenu nastaviť?</span>
                <Button type="button" size="sm" onClick={odhadniCenu} disabled={aiOdhadPending || !form.mesto || !form.plocha}
                  className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] rounded-xl h-8">
                  {aiOdhadPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "💡 AI odhad ceny"}
                </Button>
              </div>
              {aiOdhad && (
                <p className="text-slate-300 leading-snug">
                  AI odhad: <strong className="text-emerald-400">{Math.round(aiOdhad.odhad_min).toLocaleString("sk-SK")} – {Math.round(aiOdhad.odhad_max).toLocaleString("sk-SK")} €</strong>
                  {form.typ_ponuky === "prenajom" ? " / mes." : ""} · {aiOdhad.komentar}
                </p>
              )}
              {!form.plocha && <p className="text-slate-500 text-[10px]">Pre odhad vyplňte mesto a plochu.</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-slate-400">Popis</label>
                <Button type="button" size="sm" onClick={generujPopis} disabled={aiPopisPending || !mozeGenerovat}
                  className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] rounded-xl h-8">
                  {aiPopisPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Sparkles className="w-3 h-3 mr-1" /> Napísať popis pomocou AI</>}
                </Button>
              </div>
              <textarea rows={5} placeholder="Opíšte nehnuteľnosť – alebo vyplňte údaje vyššie a nechajte popis napísať AI..." value={form.popis} onChange={set("popis")} className={inputCls} />
            </div>

            <PhotoUploader photos={fotky} onChange={setFotky} />

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-slate-300 font-bold">Kontaktné údaje inzerenta</p>
                <Select value={form.zdroj} onValueChange={set("zdroj")}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-[11px] rounded-xl h-8 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="majitel">Som majiteľ</SelectItem>
                    <SelectItem value="agent">Som agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" required placeholder="Meno a priezvisko *" value={form.kontakt_meno} onChange={set("kontakt_meno")} className={inputCls} />
                <input type="tel" required placeholder="Telefón *" value={form.kontakt_telefon} onChange={set("kontakt_telefon")} className={inputCls} />
                <input type="email" required placeholder="E-mail *" value={form.kontakt_email} onChange={set("kontakt_email")} className={inputCls} />
              </div>
            </div>

            {errorMsg && <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMsg}</p>}

            <Button type="submit" disabled={submitMutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-xl">
              {submitMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Odosielam...</span>
              ) : (
                "Zverejniť inzerát zadarmo"
              )}
            </Button>
            <p className="text-slate-500 text-[10px] text-center">Odoslaním súhlasíte so spracovaním údajov na účely inzercie. Inzerát prejde pred zverejnením kontrolou.</p>
          </form>
        )}
      </div>
    </div>
  );
}