import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, Layers, Zap, Droplet, Wind, Sun, CheckCircle, 
  ArrowRight, ArrowLeft, Send, Loader2, Info, Euro
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KONFIGA_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/1a73e4a6c_Konfigaeu.jpg";

export default function InteraktivnyKonfigurator() {
  const [step, setStep] = useState(1);
  const [configuration, setConfiguration] = useState({
    vyrobca: "",
    model: "",
    velkost: "",
    materialy: [],
    energia: {
      fotovoltaika: false,
      tepelne_cerpadlo: false,
      rekuperacia: false
    },
    instalácie: {
      elektrina: "standard",
      voda: "standard",
      vykurovanie: "standard"
    },
    doplnky: [],
    poznamka: ""
  });

  const [contactForm, setContactForm] = useState({
    meno: "",
    email: "",
    telefon: "",
    poznamka: ""
  });

  const queryClient = useQueryClient();

  // Načítaj analyzované dokumenty
  const { data: dokumenty = [], isLoading } = useQuery({
    queryKey: ['dokumenty-analyzovane'],
    queryFn: () => base44.entities.Dokument.filter({ analyzovaný: true })
  });

  // Extrahuj údaje z dokumentov
  const { vyrobcovia, modely, cenoveUdaje } = useMemo(() => {
    const vyrobcovia = [...new Set(dokumenty.map(d => d.vyrobca))].filter(Boolean);
    
    const modely = {};
    const cenoveUdaje = {};

    dokumenty.forEach(dok => {
      if (dok.kľúčové_informácie?.modely_domov) {
        dok.kľúčové_informácie.modely_domov.forEach(model => {
          if (!modely[dok.vyrobca]) modely[dok.vyrobca] = [];
          if (!modely[dok.vyrobca].includes(model)) {
            modely[dok.vyrobca].push(model);
          }

          // Extrahuj cenové údaje
          if (!cenoveUdaje[model]) {
            cenoveUdaje[model] = {
              zakladna_cena: null,
              rozmery: dok.kľúčové_informácie.rozmery || {},
              materialy: dok.kľúčové_informácie.materialy || [],
              energia: dok.kľúčové_informácie.energia || {},
              cenove_info: dok.kľúčové_informácie.cenové_informácie || []
            };
          }

          // Pokús sa extrahovať základnú cenu
          if (dok.kľúčové_informácie.cenové_informácie) {
            dok.kľúčové_informácie.cenové_informácie.forEach(info => {
              const match = info.match(/(\d+[\s,]*\d*)\s*EUR/i);
              if (match && !cenoveUdaje[model].zakladna_cena) {
                cenoveUdaje[model].zakladna_cena = parseInt(match[1].replace(/[\s,]/g, ''));
              }
            });
          }
        });
      }
    });

    return { vyrobcovia, modely, cenoveUdaje };
  }, [dokumenty]);

  // Vypočítaj cenu
  const vypocitanaCena = useMemo(() => {
    if (!configuration.model) return 0;

    const modelData = cenoveUdaje[configuration.model];
    if (!modelData) return 0;

    let cena = modelData.zakladna_cena || 50000;

    // Prirážky za energiu
    if (configuration.energia.fotovoltaika) cena += 8000;
    if (configuration.energia.tepelne_cerpadlo) cena += 12000;
    if (configuration.energia.rekuperacia) cena += 6000;

    // Prirážky za inštalácie
    if (configuration.instalácie.elektrina === "premium") cena += 3000;
    if (configuration.instalácie.voda === "premium") cena += 2000;
    if (configuration.instalácie.vykurovanie === "premium") cena += 5000;

    // Doplnky
    cena += configuration.doplnky.length * 1500;

    return cena;
  }, [configuration, cenoveUdaje]);

  // Odoslanie požiadavky
  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      alert("Požiadavka úspešne odoslaná! Budeme vás kontaktovať.");
      setStep(1);
      setConfiguration({
        vyrobca: "",
        model: "",
        velkost: "",
        materialy: [],
        energia: { fotovoltaika: false, tepelne_cerpadlo: false, rekuperacia: false },
        instalácie: { elektrina: "standard", voda: "standard", vykurovanie: "standard" },
        doplnky: [],
        poznamka: ""
      });
      setContactForm({ meno: "", email: "", telefon: "", poznamka: "" });
    }
  });

  const handleSubmit = () => {
    const konfiguracnyKod = JSON.stringify({
      ...configuration,
      cena: vypocitanaCena,
      datum: new Date().toISOString()
    });

    createDopytMutation.mutate({
      meno: contactForm.meno,
      email: contactForm.email,
      telefon: contactForm.telefon,
      typ_dopytu: "konfigurator",
      konfiguracny_kod: konfiguracnyKod,
      poznamka: `${contactForm.poznamka}\n\nKonfigurácia:\n${JSON.stringify(configuration, null, 2)}\n\nOrientačná cena: ${vypocitanaCena.toLocaleString('sk-SK')} EUR`
    });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Načítavam konfigurátor...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold text-gray-900">Interaktívny konfigurátor</h1>
            </div>
            <p className="text-gray-600">Zostavte si svoj ideálny modulárny dom</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-gray-600">Powered by AI</span>
              <img src={KONFIGA_LOGO_URL} alt="Konfiga.eu" className="h-6 w-auto" />
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center max-w-3xl mx-auto">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s === step ? 'bg-primary text-white scale-110' :
                    s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s < step ? <CheckCircle className="w-6 h-6" /> : s}
                  </div>
                  {s < 5 && <div className={`w-16 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-3xl mx-auto mt-2 text-xs text-gray-600">
              <span>Výrobca</span>
              <span>Model</span>
              <span>Energia</span>
              <span>Inštalácie</span>
              <span>Dokončenie</span>
            </div>
          </div>

          {/* Cena - floating */}
          <div className="fixed bottom-6 right-6 z-40">
            <Card className="p-6 shadow-2xl border-2 border-primary bg-white">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Orientačná cena</p>
                <p className="text-3xl font-bold text-primary flex items-center gap-2">
                  <Euro className="w-8 h-8" />
                  {vypocitanaCena.toLocaleString('sk-SK')}
                </p>
                <p className="text-xs text-gray-500 mt-1">s DPH</p>
              </div>
            </Card>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8 mb-6">
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Layers className="w-6 h-6 text-primary" />
                      Krok 1: Výber výrobcu a modelu
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Výrobca *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {vyrobcovia.map(vyrobca => (
                            <Card
                              key={vyrobca}
                              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                                configuration.vyrobca === vyrobca ? 'border-2 border-primary bg-blue-50' : ''
                              }`}
                              onClick={() => setConfiguration({ ...configuration, vyrobca, model: "" })}
                            >
                              <p className="font-semibold text-center">{vyrobca}</p>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {configuration.vyrobca && modely[configuration.vyrobca] && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Label className="text-lg font-semibold mb-3 block">Model *</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modely[configuration.vyrobca].map(model => {
                              const modelData = cenoveUdaje[model];
                              return (
                                <Card
                                  key={model}
                                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                                    configuration.model === model ? 'border-2 border-primary bg-blue-50' : ''
                                  }`}
                                  onClick={() => setConfiguration({ ...configuration, model })}
                                >
                                  <p className="font-semibold text-lg mb-2">{model}</p>
                                  {modelData?.rozmery?.plocha && (
                                    <p className="text-sm text-gray-600">Plocha: {modelData.rozmery.plocha}</p>
                                  )}
                                  {modelData?.zakladna_cena && (
                                    <p className="text-primary font-bold mt-2">
                                      od {modelData.zakladna_cena.toLocaleString('sk-SK')} EUR
                                    </p>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Home className="w-6 h-6 text-primary" />
                      Krok 2: Rozmery a materiály
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Dostupné materiály</Label>
                        {cenoveUdaje[configuration.model]?.materialy?.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {cenoveUdaje[configuration.model].materialy.map((material, i) => (
                              <Badge key={i} className="p-3 text-sm">{material}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Štandardné materiály zahrnute v cene</p>
                        )}
                      </div>

                      {cenoveUdaje[configuration.model]?.rozmery && (
                        <div>
                          <Label className="text-lg font-semibold mb-3 block">Rozmery</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(cenoveUdaje[configuration.model].rozmery).map(([key, value]) => (
                              <Card key={key} className="p-4">
                                <p className="text-xs text-gray-600 mb-1">{key}</p>
                                <p className="font-bold text-lg">{value}</p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="mb-2 block">Poznámka k rozmerom</Label>
                        <Textarea
                          value={configuration.poznamka}
                          onChange={(e) => setConfiguration({ ...configuration, poznamka: e.target.value })}
                          placeholder="Špeciálne požiadavky na rozmery..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-primary" />
                      Krok 3: Energetické riešenia
                    </h2>
                    <div className="space-y-6">
                      <Card className="p-6 border-2 border-green-200 bg-green-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Sun className="w-8 h-8 text-yellow-600" />
                            <div>
                              <p className="font-bold text-lg">Fotovoltaika</p>
                              <p className="text-sm text-gray-600">Vlastná výroba elektriny</p>
                            </div>
                          </div>
                          <Switch
                            checked={configuration.energia.fotovoltaika}
                            onCheckedChange={(checked) => setConfiguration({
                              ...configuration,
                              energia: { ...configuration.energia, fotovoltaika: checked }
                            })}
                          />
                        </div>
                        {configuration.energia.fotovoltaika && (
                          <p className="text-green-700 font-semibold">+8 000 EUR</p>
                        )}
                      </Card>

                      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Droplet className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-bold text-lg">Tepelné čerpadlo</p>
                              <p className="text-sm text-gray-600">Efektívne vykurovanie</p>
                            </div>
                          </div>
                          <Switch
                            checked={configuration.energia.tepelne_cerpadlo}
                            onCheckedChange={(checked) => setConfiguration({
                              ...configuration,
                              energia: { ...configuration.energia, tepelne_cerpadlo: checked }
                            })}
                          />
                        </div>
                        {configuration.energia.tepelne_cerpadlo && (
                          <p className="text-blue-700 font-semibold">+12 000 EUR</p>
                        )}
                      </Card>

                      <Card className="p-6 border-2 border-cyan-200 bg-cyan-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Wind className="w-8 h-8 text-cyan-600" />
                            <div>
                              <p className="font-bold text-lg">Rekuperácia</p>
                              <p className="text-sm text-gray-600">Vzduchotechnika so spätným získavaním tepla</p>
                            </div>
                          </div>
                          <Switch
                            checked={configuration.energia.rekuperacia}
                            onCheckedChange={(checked) => setConfiguration({
                              ...configuration,
                              energia: { ...configuration.energia, rekuperacia: checked }
                            })}
                          />
                        </div>
                        {configuration.energia.rekuperacia && (
                          <p className="text-cyan-700 font-semibold">+6 000 EUR</p>
                        )}
                      </Card>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Krok 4: Inštalácie a vybavenie</h2>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Elektroinštalácia</Label>
                        <Select
                          value={configuration.instalácie.elektrina}
                          onValueChange={(value) => setConfiguration({
                            ...configuration,
                            instalácie: { ...configuration.instalácie, elektrina: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Štandard (zahrnuté)</SelectItem>
                            <SelectItem value="premium">Premium (+3 000 EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Voda a kanalizácia</Label>
                        <Select
                          value={configuration.instalácie.voda}
                          onValueChange={(value) => setConfiguration({
                            ...configuration,
                            instalácie: { ...configuration.instalácie, voda: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Štandard (zahrnuté)</SelectItem>
                            <SelectItem value="premium">Premium (+2 000 EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Vykurovanie</Label>
                        <Select
                          value={configuration.instalácie.vykurovanie}
                          onValueChange={(value) => setConfiguration({
                            ...configuration,
                            instalácie: { ...configuration.instalácie, vykurovanie: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Štandard (zahrnuté)</SelectItem>
                            <SelectItem value="premium">Premium (+5 000 EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Krok 5: Kontaktné údaje</h2>
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-lg mb-6">
                        <h3 className="font-bold text-xl mb-4">Zhrnutie konfigurácie</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-semibold">Výrobca:</span> {configuration.vyrobca}</p>
                          <p><span className="font-semibold">Model:</span> {configuration.model}</p>
                          <p><span className="font-semibold">Fotovoltaika:</span> {configuration.energia.fotovoltaika ? '✓' : '✗'}</p>
                          <p><span className="font-semibold">Tepelné čerpadlo:</span> {configuration.energia.tepelne_cerpadlo ? '✓' : '✗'}</p>
                          <p><span className="font-semibold">Rekuperácia:</span> {configuration.energia.rekuperacia ? '✓' : '✗'}</p>
                          <p className="text-2xl font-bold text-primary mt-4">
                            Celkom: {vypocitanaCena.toLocaleString('sk-SK')} EUR s DPH
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Meno a priezvisko *</Label>
                        <Input
                          value={contactForm.meno}
                          onChange={(e) => setContactForm({ ...contactForm, meno: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Email *</Label>
                        <Input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Telefón *</Label>
                        <Input
                          type="tel"
                          value={contactForm.telefon}
                          onChange={(e) => setContactForm({ ...contactForm, telefon: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Ďalšie požiadavky</Label>
                        <Textarea
                          value={contactForm.poznamka}
                          onChange={(e) => setContactForm({ ...contactForm, poznamka: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  onClick={prevStep}
                  disabled={step === 1}
                  variant="outline"
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Späť
                </Button>

                {step < 5 ? (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !configuration.model) ||
                      (step === 2 && false)
                    }
                    className="px-8 bg-primary"
                  >
                    Ďalej
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!contactForm.meno || !contactForm.email || !contactForm.telefon || createDopytMutation.isPending}
                    className="px-8 bg-green-600 hover:bg-green-700"
                  >
                    {createDopytMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Odosielam...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Odoslať požiadavku
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}