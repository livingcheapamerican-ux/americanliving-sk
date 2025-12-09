import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Home, CheckCircle, Send, FileDown, Mail, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function LyonFinalSummaryModal({ 
  isOpen, 
  onClose, 
  dom,
  ucel, 
  izolaciaStien, 
  izolaciaPodlahy, 
  izolaciaStropu, 
  tepelneCerpadlo, 
  rekuperacia, 
  podlahovoKurenie, 
  pripravaNaKrb, 
  ochranaKachle,
  fasada, 
  strecha, 
  odkvapy, 
  okna, 
  vchodoveDvere, 
  obkladStien, 
  interieroveDvere,
  elektro, 
  bleskozvod, 
  prepat, 
  sprchovyKut, 
  vana, 
  bateria, 
  skrinka, 
  stropKupelna,
  inziniering, 
  projektACertifikacia, 
  revizia, 
  zaklady, 
  montaz, 
  doprava,
  totalPrice
}) {
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    obec: "",
    poznamka: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Určiť ktorý obrázok zobraziť
  const getDisplayImage = () => {
    // Ak je vybraná šuchaná omietka, zobraz hlavný obrázok
    if (fasada === "omietka") {
      return dom?.hlavny_obrazok;
    }
    // Ak je vybraná iná fasáda alebo default drevo smrek, zobraz základnú konfiguráciu
    return dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok;
  };

  // Kontrola či je konfigurácia A0
  const isA0Configuration = () => {
    return (
      izolaciaStien === "250mm" &&
      izolaciaPodlahy === "200mm" &&
      izolaciaStropu === "200mm" &&
      tepelneCerpadlo === "ano" &&
      rekuperacia === "ano" &&
      elektro === "ge" &&
      bleskozvod &&
      prepat &&
      inziniering &&
      projektACertifikacia
    );
  };

  const isA0 = isA0Configuration();
  const actualStatus = ucel === "rodinny" && isA0 ? "Rodinný dom A0" : "Rekreačná stavba";

  // Vytvorenie súhrnu konfigurácie
  const buildConfigSummary = () => {
    const lines = [];
    lines.push(`Účel: ${actualStatus}`);
    lines.push(`\nIZOLÁCIA:`);
    lines.push(`- Steny: ${izolaciaStien}`);
    lines.push(`- Podlaha: ${izolaciaPodlahy}`);
    lines.push(`- Strop: ${izolaciaStropu}`);
    
    if (tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) {
      lines.push(`\nVYKUROVANIE:`);
      if (tepelneCerpadlo === "ano") lines.push(`- Tepelné čerpadlo`);
      if (rekuperacia === "ano") lines.push(`- Rekuperácia`);
      if (podlahovoKurenie) lines.push(`- Podlahové kúrenie`);
      if (pripravaNaKrb) lines.push(`- Príprava na krb`);
      if (ochranaKachle) lines.push(`- Ochrana na kachle`);
    }
    
    lines.push(`\nFASÁDA: ${fasada === "drevo_smrek" ? "Drevo smrek" : fasada === "omietka" ? "Šúchaná omietka" : fasada === "smrekovec" ? "Smrekovec" : fasada === "falcovane" ? "Falcované panely" : "Thermowood"}`);
    lines.push(`STRECHA: ${strecha === "korugovan_plech" ? "Korugovaný plech" : "Falcované panely"}`);
    if (odkvapy === "ano") lines.push(`- Odkvapy`);
    
    lines.push(`\nELEKTRO: ${elektro === "eu" ? "EU štandard" : elektro === "cz" ? "CZ/SK štandard" : "GE štandard (A0)"}`);
    if (bleskozvod) lines.push(`- Bleskozvod`);
    if (prepat) lines.push(`- Prepäťová ochrana`);
    
    if (inziniering || projektACertifikacia || revizia) {
      lines.push(`\nSLUŽBY:`);
      if (inziniering) lines.push(`- Inžiniering`);
      if (projektACertifikacia) lines.push(`- Projekt + Certifikácia A0`);
      if (revizia) lines.push(`- Revízna dokumentácia`);
    }
    
    if (zaklady !== "bez") {
      lines.push(`\nZÁKLADY: ${zaklady === "vruty" ? "Zemné vruty" : zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"}`);
    }
    
    if (montaz || doprava) {
      lines.push(`\nREALIZÁCIA:`);
      if (montaz) lines.push(`- Montáž domu`);
      if (doprava) lines.push(`- Doprava modulov`);
    }
    
    lines.push(`\n\nCELKOVÁ CENA: ${formatPrice(totalPrice)}`);
    return lines.join('\n');
  };

  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
        onClose();
      }, 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: dom?.id,
      konfiguracny_kod: `Lyon 50m² - ${actualStatus} - ${formatPrice(totalPrice)}`,
      poznamka: `Lokalita: ${formData.obec}\n\n${formData.poznamka}\n\n--- KONFIGURÁCIA ---\n${buildConfigSummary()}`
    });
  };

  const handleDownloadPDF = async () => {
    toast.info('Funkcia PDF bude dostupná čoskoro');
  };

  const handleEmailPDF = async () => {
    if (!formData.email) {
      toast.error('Vyplňte email');
      return;
    }
    toast.info('Funkcia Email PDF bude dostupná čoskoro');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {!submitted ? (
              <div className="flex flex-col lg:flex-row">
                {/* Ľavá strana - Obrázok a súhrn */}
                <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Vaša konfigurácia</h2>
                    <button
                      onClick={onClose}
                      className="lg:hidden w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Obrázok domu */}
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-white">
                    <img 
                      src={getDisplayImage()} 
                      alt="Lyon 50m²" 
                      className="w-full h-48 object-contain"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`${fasada === "omietka" ? "bg-orange-500" : "bg-amber-600"} text-white text-xs`}>
                        {fasada === "omietka" ? "Šúchaná fasáda" : 
                         fasada === "drevo_smrek" ? "Drevený obklad" :
                         fasada === "smrekovec" ? "Smrekovec" :
                         fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3">Lyon 50m²</h3>

                  {/* Upozornenie pre neúplnú A0 */}
                  {ucel === "rodinny" && !isA0 && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-400 font-bold text-sm mb-1">Neúplná A0 konfigurácia</p>
                          <p className="text-yellow-300/80 text-xs">
                            Aktuálne je to rekreačná stavba. Pre rodinný dom doplňte všetky A0 položky.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Súhrn konfigurácie */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 max-h-[280px] overflow-y-auto text-sm space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-300">Účel stavby</span>
                      <span className="text-green-400 font-semibold">{actualStatus}</span>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">IZOLÁCIA</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span>Steny</span><span className="text-slate-300">{izolaciaStien}</span></div>
                        <div className="flex justify-between"><span>Podlaha</span><span className="text-slate-300">{izolaciaPodlahy}</span></div>
                        <div className="flex justify-between"><span>Strop</span><span className="text-slate-300">{izolaciaStropu}</span></div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">VYKUROVANIE</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        {tepelneCerpadlo === "ano" ? <div>• Tepelné čerpadlo ✓</div> : <div>• Príprava pre konvektory ✓</div>}
                        {rekuperacia === "ano" && <div>• Rekuperácia ✓</div>}
                        {podlahovoKurenie && <div>• Podlahové kúrenie ✓</div>}
                        {pripravaNaKrb && <div>• Príprava na krb ✓</div>}
                        {ochranaKachle && <div>• Ochrana na kachle ✓</div>}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">FASÁDA</p>
                      <div className="text-xs text-slate-300">
                        • {fasada === "drevo_smrek" ? "Drevo smrek" : 
                           fasada === "omietka" ? "Šúchaná omietka" : 
                           fasada === "smrekovec" ? "Smrekovec" :
                           fasada === "falcovane" ? "Falcované panely" : "Thermowood"} ✓
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">STRECHA</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div>• {strecha === "korugovan_plech" ? "Korugovaný plech" : "Falcované panely"} ✓</div>
                        {odkvapy === "ano" && <div>• Odkvapy ✓</div>}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">OKNÁ A DVERE</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div>• Okná {okna === "biele" ? "biele" : okna === "antracit" ? "antracit" : "hnedé"} ✓</div>
                        <div>• {vchodoveDvere === "plastove" ? "Kovovo-plastové" : "Kovové"} dvere ✓</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">INTERIÉR</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div>• {obkladStien === "smrek_8cm" ? "Smrek 8cm" :
                               obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov 12cm" :
                               obkladStien === "sadrokarton_tapeta" ? "Sadrokarton + tapeta" : "OSB panel"} ✓</div>
                        <div>• Laminát ✓</div>
                        <div>• {interieroveDvere === "kridlove" ? "Krídlové" : "Posuvné"} dvere ✓</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">ELEKTROINŠTALÁCIA</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div>• {elektro === "eu" ? "EU štandard" : elektro === "cz" ? "CZ/SK štandard" : "GE štandard"} ✓</div>
                        {bleskozvod && <div>• Bleskozvod ✓</div>}
                        {prepat && <div>• Prepäťová ochrana ✓</div>}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">KÚPEĽŇA</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div>• {sprchovyKut === "standard" ? "Sprcha + WC Geberit" : "Sprcha Radaway"} ✓</div>
                        <div>• Batéria {bateria === "standard" ? "štandard" : "Grohe"} ✓</div>
                        <div>• Strop {stropKupelna === "drevo" ? "vzor dreva biely" : "sadrokarton"} ✓</div>
                        {vana && <div>• Vaňa ✓</div>}
                        {skrinka && <div>• Skrinka ✓</div>}
                      </div>
                    </div>

                    {zaklady !== "bez" && (
                      <div className="border-t border-slate-700 pt-2">
                        <p className="text-slate-400 text-xs mb-1">ZÁKLADY</p>
                        <div className="text-xs text-slate-300">
                          • {zaklady === "vruty" ? "Zemné vruty" :
                             zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"} ✓
                        </div>
                      </div>
                    )}

                    {(inziniering || projektACertifikacia || revizia) && (
                      <div className="border-t border-slate-700 pt-2">
                        <p className="text-slate-400 text-xs mb-1">SLUŽBY</p>
                        <div className="space-y-1 text-xs text-slate-300">
                          {inziniering && <div>• Inžiniering ✓</div>}
                          {projektACertifikacia && <div>• Projekt + Certifikácia A0 ✓</div>}
                          {revizia && <div>• Revízna dokumentácia ✓</div>}
                        </div>
                      </div>
                    )}

                    {(montaz || doprava) && (
                      <div className="border-t border-slate-700 pt-2">
                        <p className="text-slate-400 text-xs mb-1">REALIZÁCIA</p>
                        <div className="space-y-1 text-xs text-slate-300">
                          {montaz && <div>• Montáž domu ✓</div>}
                          {doprava && <div>• Doprava modulov ✓</div>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status A0 */}
                  <div className={`mt-3 p-3 rounded-xl border ${isA0 ? 'bg-green-500/20 border-green-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                    {isA0 ? (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-bold text-sm">✓ Spĺňa podmienky A0</p>
                          <p className="text-green-300/80 text-xs">Rodinný dom s energetickým certifikátom</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-blue-400 font-bold text-sm">Rekreačná stavba</p>
                          <p className="text-blue-300/80 text-xs">Chata / záhradný domček</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Celková cena */}
                  <div className="mt-3 p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Celkom s DPH</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="hidden lg:block mt-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 mx-auto"
                  >
                    <X className="w-5 h-5 mx-auto" />
                  </button>
                </div>

                {/* Pravá strana - Formulár */}
                <div className="lg:w-1/2 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Kontaktné údaje
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Vyplňte formulár a my vás budeme kontaktovať s podrobnou ponukou.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="meno">Meno a priezvisko *</Label>
                      <Input
                        id="meno"
                        required
                        value={formData.meno}
                        onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                        placeholder="Ján Novák"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jan.novak@email.sk"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefon">Telefón *</Label>
                      <Input
                        id="telefon"
                        required
                        value={formData.telefon}
                        onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                        placeholder="+421 900 123 456"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="obec">Obec / Mesto (kde bude dom stáť) *</Label>
                      <Input
                        id="obec"
                        required
                        value={formData.obec}
                        onChange={(e) => setFormData({ ...formData, obec: e.target.value })}
                        placeholder="napr. Bratislava, Košice..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="poznamka">Poznámka (voliteľné)</Label>
                      <Textarea
                        id="poznamka"
                        value={formData.poznamka}
                        onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                        placeholder="Máte otázky alebo špeciálne požiadavky?"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={generatingPDF}
                        className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <FileDown className="mr-2 w-4 h-4" />
                        Stiahnuť PDF
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleEmailPDF}
                        disabled={generatingPDF || !formData.email}
                        className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                      >
                        <Mail className="mr-2 w-4 h-4" />
                        Email PDF
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                      disabled={createDopytMutation.isPending}
                    >
                      {createDopytMutation.isPending ? (
                        "Odosiela sa..."
                      ) : (
                        <>
                          <Send className="mr-2 w-5 h-5" />
                          Odoslať dopyt
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Ďakujeme za váš záujem!
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Vaša konfigurácia bola úspešne odoslaná. Ozveme sa vám čo najskôr, 
                  zvyčajne do 24 hodín.
                </p>
              </motion.div>
            )}


          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}