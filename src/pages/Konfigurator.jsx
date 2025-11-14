
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, CheckCircle, ArrowRight, ArrowLeft, Send, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import KonfiguratorSteps from "../components/konfigurator/KonfiguratorSteps";

export default function Konfigurator() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');

  const [krok, setKrok] = useState(1);
  const [showFormular, setShowFormular] = useState(false);
  const [konfig, setKonfig] = useState({
    verzia_domu: "",
    kolaudacia: "",
    kolaudacia_chaty: "",
    fasada: "",
    zaklady: "",
    inziniering: "",
    projektant: ""
  });
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    poznamka: ""
  });

  const queryClient = useQueryClient();

  const { data: dom, isLoading } = useQuery({
    queryKey: ['dom-konfigurator', domId],
    queryFn: async () => {
      if (!domId) return null;
      const domy = await base44.entities.Dom.filter({ id: domId });
      return domy[0] || null;
    },
    enabled: !!domId,
  });

  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopyty'] });
      alert("✓ Ďakujeme! Váš dopyt bol úspešne odoslaný. Čoskoro vás budeme kontaktovať s cenovou ponukou.");
      // Reset
      window.location.href = createPageUrl("Katalog");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const konfigText = `
DOM: ${dom?.nazov || 'N/A'}
Verzia: ${konfig.verzia_domu === 'rodinny_dom' ? 'Rodinný dom s kolaudáciou' : 'Chata/záhradný domček'}
Kolaudácia: ${konfig.verzia_domu === 'rodinny_dom' ? konfig.kolaudacia : konfig.kolaudacia_chaty}
Fasáda: ${konfig.fasada}
Základy: ${konfig.zaklady}
Inžiniering: ${konfig.inziniering}
Projektant: ${konfig.projektant}
    `.trim();

    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: domId,
      konfiguracny_kod: konfigText
    });
  };

  const vypocitatCenu = () => {
    let cena = dom?.zakladna_cena || 0;
    
    const isTicabHouse = dom?.vyrobca === "Ticab house";
    
    // Fasáda
    const fasadaCeny = {
      thermowood: 10477,
      kompozit: 0,
      falcovane: 8111,
      smrekovec: 5245
    };
    if (fasadaCeny[konfig.fasada]) cena += fasadaCeny[konfig.fasada];

    // Základy
    const zakladyCeny = {
      pasove: 17011,
      vruty: 5419,
      pilier: 4091,
      kocky: 3028
    };
    if (zakladyCeny[konfig.zaklady]) cena += zakladyCeny[konfig.zaklady];

    // Služby - pre Ticab house odpočítať DPH
    if (konfig.inziniering === "ano") {
      const inzinieringCena = isTicabHouse ? 3188 / 1.23 : 3188;
      cena += inzinieringCena;
    }
    if (konfig.projektant === "ano") {
      const projektantCena = isTicabHouse ? 4305 / 1.23 : 4305;
      cena += projektantCena;
    }

    return cena;
  };

  const kroky = [
    { cislo: 1, nazov: "Verzia domu", popis: "Rodinný dom alebo chata" },
    { cislo: 2, nazov: "Vonkajšia fasáda", popis: "Výber materiálu" },
    { cislo: 3, nazov: "Základy a služby", popis: "Potrebné položky" }
  ];

  const mozePostupit = () => {
    if (krok === 1) {
      if (!konfig.verzia_domu) return false;
      if (konfig.verzia_domu === "rodinny_dom" && !konfig.kolaudacia) return false;
      if (konfig.verzia_domu === "chata" && !konfig.kolaudacia_chaty) return false;
      return true;
    }
    if (krok === 2) return !!konfig.fasada;
    if (krok === 3) return konfig.zaklady && konfig.inziniering && konfig.projektant;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam konfigurátor...</p>
        </div>
      </div>
    );
  }

  if (!dom && domId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Dom sa nenašiel</h2>
          <p className="text-gray-500 mb-6">Požadovaný dom neexistuje.</p>
          <Link to={createPageUrl("Katalog")}>
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Konfigurátor domu
              </h1>
            </div>
            {dom && (
              <div className="bg-white rounded-lg p-5 mb-4 shadow-lg">
                <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide font-semibold">Konfigurujete model:</p>
                <h2 className="text-2xl font-bold text-gray-900">{dom.nazov}</h2>
                <p className="text-gray-700 mt-2 font-medium text-lg">
                  Základná cena: <span className="text-primary font-bold">{dom.zakladna_cena?.toLocaleString('sk-SK')}€ s DPH</span> ({dom.zastavana_plocha}m²)
                </p>
              </div>
            )}
            <p className="text-xl text-blue-100">
              Prispôsobte si dom presne podľa vašich predstáv. Po dokončení konfigurácie vám pripravíme nezáväznú cenovú ponuku.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {!showFormular ? (
          <div className="max-w-5xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {kroky.map((k, index) => (
                  <React.Fragment key={k.cislo}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                          krok >= k.cislo
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {krok > k.cislo ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          k.cislo
                        )}
                      </div>
                      <p className={`mt-2 text-sm font-semibold ${krok >= k.cislo ? 'text-primary' : 'text-gray-400'}`}>
                        {k.nazov}
                      </p>
                      <p className="text-xs text-gray-500 text-center max-w-[120px]">
                        {k.popis}
                      </p>
                    </div>
                    {index < kroky.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 ${krok > k.cislo ? 'bg-primary' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Konfigurátor Content */}
            <Card className="p-8 md:p-12 mb-6">
              <h2 className="text-3xl font-bold text-primary mb-6">
                Krok {krok}: {kroky[krok - 1].nazov}
              </h2>

              <KonfiguratorSteps
                krok={krok}
                konfig={konfig}
                setKonfig={setKonfig}
                dom={dom}
              />

              {/* Navigačné tlačidlá */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setKrok(Math.max(1, krok - 1))}
                  disabled={krok === 1}
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Späť
                </Button>

                {krok < 3 ? (
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setKrok(krok + 1)}
                    disabled={!mozePostupit()}
                  >
                    Ďalej
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90"
                    onClick={() => setShowFormular(true)}
                    disabled={!mozePostupit()}
                  >
                    Dokončiť konfiguráciu
                    <CheckCircle className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </div>
            </Card>

            {/* Cenový súhrn */}
            {dom && (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Orientačná celková cena</p>
                    <p className="text-3xl font-bold text-primary">
                      {vypocitatCenu().toLocaleString('sk-SK')}€ <span className="text-lg">s DPH</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      * Finálna cena bude upresnená po obhliadke pozemku
                    </p>
                  </div>
                  <Settings className="w-12 h-12 text-primary opacity-20" />
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Formulár na odoslanie dopytu */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Konfigurácia dokončená!
                </h2>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Orientačná celková cena:</p>
                  <p className="text-3xl font-bold text-primary">
                    {vypocitatCenu().toLocaleString('sk-SK')}€ <span className="text-lg">s DPH</span>
                  </p>
                </div>
                <p className="text-gray-600">
                  Vyplňte kontaktné údaje a my vám pripravíme presnú cenovú ponuku
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="meno">Meno a priezvisko *</Label>
                  <Input
                    id="meno"
                    required
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    placeholder="Ján Novák"
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
                  />
                </div>

                <div>
                  <Label htmlFor="poznamka">Poznámka (voliteľné)</Label>
                  <Textarea
                    id="poznamka"
                    value={formData.poznamka}
                    onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                    placeholder="Doplňujúce informácie alebo otázky..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFormular(false)}
                    className="flex-1"
                  >
                    Späť na konfiguráciu
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 bg-secondary hover:bg-secondary/90"
                    disabled={createDopytMutation.isPending}
                  >
                    {createDopytMutation.isPending ? (
                      "Odosiela sa..."
                    ) : (
                      <>
                        Odoslať dopyt
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
