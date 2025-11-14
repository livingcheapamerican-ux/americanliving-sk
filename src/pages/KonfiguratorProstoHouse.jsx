import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Home, Settings, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KonfiguratorProstoHouse() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');

  const [konfig, setKonfig] = useState({
    montaz: false,
    vstupne_dvere: "standardne",
    zaklady: "bez",
    fasada: "standard",
    okna: "standard",
    izolacie: false,
    elektroinst: false,
    vodoinst: false,
    kanalizacia: false,
    vytranie: false,
    podkrovie: false,
    zateplenie_extra: false,
    tepelne_cerpadlo: false,
    fotovoltaika: false,
    projektova_dok: false,
    energeticky_cert: false
  });

  const [showFormular, setShowFormular] = useState(false);
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    poznamka: ""
  });

  const queryClient = useQueryClient();

  const { data: dom, isLoading } = useQuery({
    queryKey: ['dom-konfigurator-prosto', domId],
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
      window.location.href = createPageUrl("Katalog");
    },
  });

  // Cenník podľa HTML konfigurátorov
  const cennik = {
    montaz: {
      48: 4614,
      72: 7524,
      103: 12073,
      108: 9664,
      142: 12091
    },
    vstupne_dvere: {
      kovove: 480,
      plastkovo_kovove: 440,
      standardne: 0
    },
    zaklady: {
      skrutky: 3521,
      pasove: 9093,
      doska: 9633,
      bez: 0
    },
    fasada: {
      smrekovec: 960,
      termicky_upravene_drevo: 1440,
      kompozit: 2400,
      standard: 0
    },
    okna: {
      hlinikove: 1200,
      standard: 0
    },
    izolacie: 3200,
    elektroinst: 2400,
    vodoinst: 1800,
    kanalizacia: 1600,
    vytranie: 2800,
    podkrovie: 4500,
    zateplenie_extra: 3600,
    tepelne_cerpadlo: 8500,
    fotovoltaika: 12000,
    projektova_dok: 1500,
    energeticky_cert: 2200
  };

  const vypocitatCenu = () => {
    if (!dom) return { bezDPH: 0, sDPH: 0 };
    
    let celkovaCena = dom.zakladna_cena || 0;
    const plocha = dom.zastavana_plocha || 72;
    
    // Montáž - podľa plochy
    if (konfig.montaz) {
      if (plocha <= 48) celkovaCena += cennik.montaz[48];
      else if (plocha <= 72) celkovaCena += cennik.montaz[72];
      else if (plocha <= 103) celkovaCena += cennik.montaz[103];
      else if (plocha <= 108) celkovaCena += cennik.montaz[108];
      else celkovaCena += cennik.montaz[142];
    }

    // Vstupné dvere
    celkovaCena += cennik.vstupne_dvere[konfig.vstupne_dvere] || 0;

    // Základy
    celkovaCena += cennik.zaklady[konfig.zaklady] || 0;

    // Fasáda
    celkovaCena += cennik.fasada[konfig.fasada] || 0;

    // Okná
    celkovaCena += cennik.okna[konfig.okna] || 0;

    // Ostatné položky
    if (konfig.izolacie) celkovaCena += cennik.izolacie;
    if (konfig.elektroinst) celkovaCena += cennik.elektroinst;
    if (konfig.vodoinst) celkovaCena += cennik.vodoinst;
    if (konfig.kanalizacia) celkovaCena += cennik.kanalizacia;
    if (konfig.vytranie) celkovaCena += cennik.vytranie;
    if (konfig.podkrovie) celkovaCena += cennik.podkrovie;
    if (konfig.zateplenie_extra) celkovaCena += cennik.zateplenie_extra;
    if (konfig.tepelne_cerpadlo) celkovaCena += cennik.tepelne_cerpadlo;
    if (konfig.fotovoltaika) celkovaCena += cennik.fotovoltaika;
    if (konfig.projektova_dok) celkovaCena += cennik.projektova_dok;
    if (konfig.energeticky_cert) celkovaCena += cennik.energeticky_cert;

    const sDPH = celkovaCena;
    const bezDPH = celkovaCena / 1.23;

    return { bezDPH, sDPH };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ceny = vypocitatCenu();
    const konfigText = Object.entries(konfig)
      .filter(([key, value]) => value && value !== "standardne" && value !== "standard" && value !== "bez")
      .map(([key, value]) => `${key}: ${value === true ? 'Áno' : value}`)
      .join('\n');

    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: domId,
      konfiguracny_kod: `
DOM: ${dom?.nazov || 'N/A'} (Prosto House)
Základná cena: ${dom?.zakladna_cena?.toLocaleString('sk-SK')} € s DPH

KONFIGURÁCIA:
${konfigText}

CELKOVÁ CENA:
Bez DPH: ${ceny.bezDPH.toFixed(2)} €
S DPH: ${ceny.sDPH.toFixed(2)} €
      `.trim()
    });
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

  if (!dom || dom.vyrobca !== "Prosto House") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Neplatný dom</h2>
          <p className="text-gray-500 mb-6">Tento konfigurátor je dostupný len pre domy značky Prosto House.</p>
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

  const ceny = vypocitatCenu();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť na detail domu
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Konfigurátor Prosto House
              </h1>
            </div>
            {dom && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-200 mb-1">Konfigurujete model:</p>
                <h2 className="text-2xl font-bold">{dom.nazov}</h2>
                <p className="text-blue-200 mt-1">
                  Základná cena: {dom.zakladna_cena?.toLocaleString('sk-SK')}€ s DPH ({dom.zastavana_plocha}m²)
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {!showFormular ? (
          <div className="max-w-5xl mx-auto">
            <Card className="p-8 md:p-12 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-primary mb-3">Základná konfigurácia zahŕňa:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Nosná prefabrikovaná konštrukcia (steny, strecha, podlaha)</li>
                  <li>• Základná tepelná izolácia (150mm steny/strecha, 200mm podlaha)</li>
                  <li>• Strešná krytina (falcovaný plech) a vonkajší plášť (plechová fasáda)</li>
                  <li>• Okná (plastové, 3-sklo) a vchodové dvere (plastové) podľa projektu</li>
                  <li>• Kompletná revízna dokumentácia</li>
                </ul>
              </div>

              {/* Časť 1: Hrubá Stavba */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Časť 1: Hrubá Stavba a Exteriér</h2>
                
                <div className="space-y-6">
                  {/* Montáž */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.montaz}
                          onCheckedChange={(checked) => setKonfig({...konfig, montaz: checked})}
                        />
                        <Label className="text-base font-semibold cursor-pointer">
                          Cena montáže holodomu
                        </Label>
                      </div>
                      <span className="text-primary font-bold">
                        +{(cennik.montaz[dom.zastavana_plocha <= 48 ? 48 : dom.zastavana_plocha <= 72 ? 72 : dom.zastavana_plocha <= 103 ? 103 : dom.zastavana_plocha <= 108 ? 108 : 142] * 1.23).toLocaleString('sk-SK')} € s DPH
                      </span>
                    </div>
                  </div>

                  {/* Vstupné dvere */}
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-3 block">Vstupné dvere</Label>
                    <RadioGroup value={konfig.vstupne_dvere} onValueChange={(value) => setKonfig({...konfig, vstupne_dvere: value})}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standardne" id="dvere-std" />
                            <Label htmlFor="dvere-std" className="cursor-pointer">Štandardné dvere (zahrnuté v cene)</Label>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="kovove" id="dvere-kov" />
                            <Label htmlFor="dvere-kov" className="cursor-pointer">Kovové s 2 zámkami</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.vstupne_dvere.kovove * 1.23).toFixed(2)} € s DPH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="plastkovo_kovove" id="dvere-plast" />
                            <Label htmlFor="dvere-plast" className="cursor-pointer">Plastovo-kovové</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.vstupne_dvere.plastkovo_kovove * 1.23).toFixed(2)} € s DPH</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Základy */}
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-3 block">Základy</Label>
                    <RadioGroup value={konfig.zaklady} onValueChange={(value) => setKonfig({...konfig, zaklady: value})}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="bez" id="zakl-bez" />
                            <Label htmlFor="zakl-bez" className="cursor-pointer">Bez základov</Label>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="skrutky" id="zakl-skr" />
                            <Label htmlFor="zakl-skr" className="cursor-pointer">Zemné skrutky</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.zaklady.skrutky * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="pasove" id="zakl-pas" />
                            <Label htmlFor="zakl-pas" className="cursor-pointer">Pásové základy</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.zaklady.pasove * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="doska" id="zakl-doska" />
                            <Label htmlFor="zakl-doska" className="cursor-pointer">Základová doska</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.zaklady.doska * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Fasáda */}
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-3 block">Vonkajšia fasáda</Label>
                    <RadioGroup value={konfig.fasada} onValueChange={(value) => setKonfig({...konfig, fasada: value})}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standard" id="fas-std" />
                            <Label htmlFor="fas-std" className="cursor-pointer">Štandardná (zahrnuté v cene)</Label>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="smrekovec" id="fas-smr" />
                            <Label htmlFor="fas-smr" className="cursor-pointer">Smrekovec</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.fasada.smrekovec * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="termicky_upravene_drevo" id="fas-term" />
                            <Label htmlFor="fas-term" className="cursor-pointer">Termicky upravené drevo</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.fasada.termicky_upravene_drevo * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="kompozit" id="fas-komp" />
                            <Label htmlFor="fas-komp" className="cursor-pointer">Kompozitné panely</Label>
                          </div>
                          <span className="text-primary font-bold">+{(cennik.fasada.kompozit * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Časť 2: Inštalácie */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Časť 2: Inštalácie a Prístavby</h2>
                <div className="space-y-4">
                  {[
                    {key: 'izolacie', label: 'Dodatočná izolácia', cena: cennik.izolacie},
                    {key: 'elektroinst', label: 'Elektroinštalácia', cena: cennik.elektroinst},
                    {key: 'vodoinst', label: 'Vodoinštalácia', cena: cennik.vodoinst},
                    {key: 'kanalizacia', label: 'Kanalizácia', cena: cennik.kanalizacia},
                    {key: 'vytranie', label: 'Rekuperácia (vetranie)', cena: cennik.vytranie},
                    {key: 'podkrovie', label: 'Úprava podkrovia', cena: cennik.podkrovie},
                    {key: 'zateplenie_extra', label: 'Extra zateplenie', cena: cennik.zateplenie_extra}
                  ].map(item => (
                    <div key={item.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={konfig[item.key]}
                            onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                          />
                          <Label className="text-base cursor-pointer">{item.label}</Label>
                        </div>
                        <span className="text-primary font-bold">+{(item.cena * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Časť 3: Kolaudácia a A0 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Časť 3: Kolaudácia a Energetický Certifikát A0</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                  <h3 className="font-bold text-green-700 mb-2">Pre energetický certifikát A0 potrebujete:</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Tepelné čerpadlo alebo fotovoltaiku</li>
                    <li>• Projektovú dokumentáciu</li>
                    <li>• Energetickú certifikáciu</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  {[
                    {key: 'tepelne_cerpadlo', label: 'Tepelné čerpadlo', cena: cennik.tepelne_cerpadlo, a0: true},
                    {key: 'fotovoltaika', label: 'Fotovoltaický systém', cena: cennik.fotovoltaika, a0: true},
                    {key: 'projektova_dok', label: 'Projektová dokumentácia', cena: cennik.projektova_dok, a0: true},
                    {key: 'energeticky_cert', label: 'Energetická certifikácia A0', cena: cennik.energeticky_cert, a0: true}
                  ].map(item => (
                    <div key={item.key} className={`border rounded-lg p-4 ${item.a0 ? 'bg-green-50 border-green-300' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={konfig[item.key]}
                            onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                          />
                          <Label className="text-base cursor-pointer font-semibold">{item.label}</Label>
                        </div>
                        <span className="text-primary font-bold">+{(item.cena * 1.23).toLocaleString('sk-SK')} € s DPH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cenový súhrn */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-primary mb-6">
                <h3 className="text-xl font-bold text-primary mb-4">Cenový súhrn</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Celková cena bez DPH:</span>
                    <span className="font-bold text-gray-900">{ceny.bezDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                  </div>
                  <div className="flex justify-between text-2xl pt-2 border-t">
                    <span className="text-primary font-bold">Celková cena s DPH:</span>
                    <span className="font-bold text-primary">{ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Finálna cena bude upresnená po obhliadke pozemku</p>
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg py-6"
                onClick={() => setShowFormular(true)}
              >
                Požiadať o cenovú ponuku
                <CheckCircle className="ml-2 w-5 h-5" />
              </Button>
            </Card>
          </div>
        ) : (
          /* Formulár */
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
                  <p className="text-sm text-gray-600 mb-2">Orientačná celková cena s DPH:</p>
                  <p className="text-3xl font-bold text-primary">
                    {ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Bez DPH: {ceny.bezDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €)
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
                    className="mt-2"
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
                    className="mt-2"
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
                    className="mt-2"
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
                    className="mt-2"
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
                    {createDopytMutation.isPending ? "Odosiela sa..." : (
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

      {/* Floating price bar */}
      {!showFormular && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white py-4 shadow-2xl z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Celková cena s DPH:</p>
                <p className="text-2xl font-bold">{ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2})} €</p>
              </div>
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => setShowFormular(true)}
              >
                Požiadať o ponuku
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}