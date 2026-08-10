import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Calculator, Loader2, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OdhadResult from "@/components/realestate/OdhadResult";

const KATEGORIE = [
  ["byt", "Byt"],
  ["rodinny_dom", "Rodinný dom"],
  ["pozemok", "Pozemok"],
  ["chata", "Chata / rekreačný objekt"],
  ["komercny", "Komerčný priestor"],
];

const STAVY = [
  ["novostavba", "Novostavba"],
  ["po_rekonstrukcii", "Po rekonštrukcii"],
  ["dobry", "Dobrý stav"],
  ["povodny", "Pôvodný stav"],
  ["na_rekonstrukciu", "Na rekonštrukciu"],
];

const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-emerald-400 focus:outline-none";
const selectCls = "bg-slate-950 border-slate-800 text-slate-200 text-xs rounded-xl h-10 w-full";

export default function OdhadCeny() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    kategoria: "byt", mesto: "", adresa: "", plocha: "", pocet_izieb: "", stav: "dobry", rok_vystavby: "",
  });
  const [kontakt, setKontakt] = useState({ meno: "", email: "", telefon: "", zaujem_o_predaj: "nerozhodnuty" });
  const [odhad, setOdhad] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target?.value ?? e });
  const setK = (key) => (e) => setKontakt({ ...kontakt, [key]: e.target?.value ?? e });

  const odhadMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Si realitný odhadca so špecializáciou na slovenský trh nehnuteľností (rok 2026). Vypracuj orientačný odhad trhovej ceny pre nehnuteľnosť:

Typ: ${KATEGORIE.find(k => k[0] === form.kategoria)?.[1]}
Mesto / lokalita: ${form.mesto}
Bližšia lokalita: ${form.adresa || "neuvedená"}
Plocha: ${form.plocha} m²
Počet izieb: ${form.pocet_izieb || "neuvedený"}
Stav: ${STAVY.find(s => s[0] === form.stav)?.[1]}
Rok výstavby: ${form.rok_vystavby || "neuvedený"}

Zohľadni bežné cenové hladiny za m² v danom meste a regióne, stav nehnuteľnosti a jej veľkosť.
Vráť:
- odhad_min a odhad_max: reálne rozpätie predajnej ceny v EUR
- komentar: 2-3 vety v slovenčine vysvetľujúce, z čoho odhad vychádza
- vyvoj_trhu: 1-2 vety o vývoji cien v danej lokalite za posledné roky
- faktory: 3-4 krátke body (max 10 slov každý), ktoré cenu tejto nehnuteľnosti najviac ovplyvňujú`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            odhad_min: { type: "number" },
            odhad_max: { type: "number" },
            komentar: { type: "string" },
            vyvoj_trhu: { type: "string" },
            faktory: { type: "array", items: { type: "string" } },
          },
        },
      });
      base44.analytics.track({ eventName: "odhad_ceny_vypocitany", properties: { kategoria: form.kategoria, mesto: form.mesto } });
      return res;
    },
    onSuccess: (res) => { setOdhad(res); setStep(2); },
    onError: () => setErrorMsg("Odhad sa nepodarilo vypočítať. Skúste to prosím znova."),
  });

  const leadMutation = useMutation({
    mutationFn: async () => {
      const zaujemLabel = {
        chcem_predat: "Chce predať čo najskôr",
        zvazujem: "Zvažuje predaj",
        nerozhodnuty: "Zisťuje len hodnotu",
      }[kontakt.zaujem_o_predaj];

      const novyDopyt = await base44.entities.Dopyt.create({
        meno: kontakt.meno,
        email: kontakt.email,
        telefon: kontakt.telefon,
        typ_dopytu: "vseobecny",
        poznamka: `ODHAD CENY NEHNUTEĽNOSTI – ${zaujemLabel}. ${KATEGORIE.find(k => k[0] === form.kategoria)?.[1]}, ${form.mesto}${form.adresa ? ` (${form.adresa})` : ""}, ${form.plocha} m², ${form.pocet_izieb || "?"} izieb, stav: ${STAVY.find(s => s[0] === form.stav)?.[1]}${form.rok_vystavby ? `, rok ${form.rok_vystavby}` : ""}. AI odhad: ${Math.round(odhad.odhad_min).toLocaleString("sk-SK")} – ${Math.round(odhad.odhad_max).toLocaleString("sk-SK")} €.`,
      });

      await base44.functions.invoke("notifikujNovyDopyt", {
        dopyt: {
          id: novyDopyt.id,
          klient_meno: kontakt.meno,
          klient_email: kontakt.email,
          klient_telefon: kontakt.telefon,
          klient_adresa: `${form.mesto} ${form.adresa || ""}`.trim(),
          typ_dopytu: "vseobecny",
          poznamka: `Odhad ceny: ${Math.round(odhad.odhad_min).toLocaleString("sk-SK")} – ${Math.round(odhad.odhad_max).toLocaleString("sk-SK")} € · ${zaujemLabel}`,
          dom_nazov: `Odhad ceny – ${form.mesto}`,
          dom_id: "",
        },
      });

      base44.analytics.track({ eventName: "odhad_ceny_lead", properties: { zaujem: kontakt.zaujem_o_predaj } });
      return novyDopyt;
    },
    onError: () => setErrorMsg("Odoslanie sa nepodarilo. Skúste to prosím znova alebo nám zavolajte na +421 905 138 124."),
  });

  const mozeVypocitat = form.mesto.trim() && form.plocha;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="text-center space-y-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
            Zadarmo · nezáväzne · do 2 minút
          </Badge>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Zistite hodnotu <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">vašej nehnuteľnosti</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Vypočítajte si orientačnú cenu bytu, domu alebo pozemku. AI odhadca zohľadní lokalitu, stav aj aktuálny vývoj slovenského trhu.
          </p>
        </div>

        {/* Kroky */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
          {["Nehnuteľnosť", "Odhad ceny", "Konzultácia"].map((label, i) => {
            const n = i + 1;
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full border ${
                  step === n ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                  : step > n ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-slate-900 text-slate-500 border-slate-800"
                }`}>{n}. {label}</span>
                {n < 3 && <span className="text-slate-700">—</span>}
              </div>
            );
          })}
        </div>

        {/* KROK 1 – údaje */}
        {step === 1 && (
          <form
            onSubmit={(e) => { e.preventDefault(); setErrorMsg(null); odhadMutation.mutate(); }}
            className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs font-mono"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Typ nehnuteľnosti *</label>
                <Select value={form.kategoria} onValueChange={set("kategoria")}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KATEGORIE.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stav nehnuteľnosti</label>
                <Select value={form.stav} onValueChange={set("stav")}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAVY.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Mesto / obec *</label>
                <input type="text" required placeholder="napr. Žilina" value={form.mesto} onChange={set("mesto")} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Ulica / časť (voliteľné)</label>
                <input type="text" placeholder="napr. Vlčince" value={form.adresa} onChange={set("adresa")} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Plocha (m²) *</label>
                <input type="number" min="1" required placeholder="75" value={form.plocha} onChange={set("plocha")} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Počet izieb</label>
                <input type="number" min="1" placeholder="3" value={form.pocet_izieb} onChange={set("pocet_izieb")} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Rok výstavby</label>
                <input type="number" min="1800" max="2030" placeholder="1998" value={form.rok_vystavby} onChange={set("rok_vystavby")} className={inputCls} />
              </div>
            </div>

            {errorMsg && <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMsg}</p>}

            <Button type="submit" disabled={odhadMutation.isPending || !mozeVypocitat}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 rounded-xl">
              {odhadMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Počítam odhad ceny...</span>
              ) : (
                <span className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Spočítať odhad zadarmo</span>
              )}
            </Button>
            <p className="text-slate-500 text-[10px] text-center">Bez registrácie. Kontaktné údaje zadávate až po zobrazení odhadu – a len ak chcete.</p>
          </form>
        )}

        {/* KROK 2 – výsledok */}
        {step === 2 && odhad && (
          <div className="space-y-4">
            <OdhadResult odhad={odhad} plocha={form.plocha} />

            <div className="bg-slate-900/70 border border-amber-500/30 rounded-3xl p-5 space-y-3 text-center">
              <p className="text-sm font-bold text-white">Chcete presnejšie čísla a pomoc s predajom?</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Náš realitný poradca vám bezplatne pripraví presnejšie ocenenie, poradí s načasovaním predaja
                a môže vám nehnuteľnosť zverejniť v našom portáli.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                <Button onClick={() => setStep(3)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl">
                  Chcem bezplatnú konzultáciu <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Link to="/pridat-inzerat">
                  <Button variant="outline" className="w-full border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 hover:text-white text-xs rounded-xl">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Pridať inzerát zadarmo
                  </Button>
                </Link>
              </div>
            </div>

            <button onClick={() => { setStep(1); setOdhad(null); }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mx-auto font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Zmeniť údaje a prepočítať
            </button>
          </div>
        )}

        {/* KROK 3 – kontakt */}
        {step === 3 && (
          leadMutation.isSuccess ? (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-8 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="font-bold text-white text-lg">Ďakujeme!</h2>
              <p className="text-xs text-slate-300 font-mono max-w-sm mx-auto">
                Váš odhad sme odoslali nášmu poradcovi. Ozveme sa vám do 24 hodín s presnejším ocenením a možnosťami predaja.
              </p>
              <Link to="/real-estate-portal">
                <Button className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                  Prezrieť realitný portál
                </Button>
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setErrorMsg(null); leadMutation.mutate(); }}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs font-mono"
            >
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Bezplatná konzultácia k odhadu
                </p>
                <p className="text-slate-400">
                  Odhad: <strong className="text-emerald-400">{Math.round(odhad.odhad_min).toLocaleString("sk-SK")} – {Math.round(odhad.odhad_max).toLocaleString("sk-SK")} €</strong> · {form.mesto}, {form.plocha} m²
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" required placeholder="Meno a priezvisko *" value={kontakt.meno} onChange={setK("meno")} className={inputCls} />
                <input type="tel" required placeholder="Telefón *" value={kontakt.telefon} onChange={setK("telefon")} className={inputCls} />
                <input type="email" required placeholder="E-mail *" value={kontakt.email} onChange={setK("email")} className={inputCls} />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Plánujete predaj?</label>
                <Select value={kontakt.zaujem_o_predaj} onValueChange={setK("zaujem_o_predaj")}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chcem_predat">Áno, chcem predať čo najskôr</SelectItem>
                    <SelectItem value="zvazujem">Zvažujem to v najbližších mesiacoch</SelectItem>
                    <SelectItem value="nerozhodnuty">Zatiaľ len zisťujem hodnotu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {errorMsg && <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMsg}</p>}

              <Button type="submit" disabled={leadMutation.isPending}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-xl">
                {leadMutation.isPending ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Odosielam...</span>
                ) : (
                  "Odoslať a získať konzultáciu"
                )}
              </Button>

              <button type="button" onClick={() => setStep(2)}
                className="text-slate-400 hover:text-white flex items-center gap-1 mx-auto">
                <ArrowLeft className="w-3.5 h-3.5" /> Späť na odhad
              </button>
            </form>
          )
        )}

        {/* Ako to funguje */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {[
            ["1. Poviete nám, čo oceniť", "Zadáte lokalitu, veľkosť a stav nehnuteľnosti."],
            ["2. Získate odhad ceny", "AI odhadca vypočíta cenové rozpätie a vysvetlí ho."],
            ["3. Poradíme s predajom", "Bezplatná konzultácia alebo inzerát v našom portáli."],
          ].map(([t, d]) => (
            <div key={t} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-emerald-300">{t}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}