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
import { ArrowLeft, Home, Settings, Send, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function KonfiguratorTicabhouse() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');

  const [konfig, setKonfig] = useState({
    // Energetický štandard (A0 položky)
    izolacie_steny: "150mm",
    izolacie_podlaha: "150mm",
    okna_profil: "standard",
    tepelne_cerpadlo: false,
    rekuperacia: false,
    
    // Služby a dokumentácia (A0 položky)
    projektova_dok_rd: false,
    energeticky_cert: false,
    
    // Voliteľné (R položky)
    montaz: false,
    zaklady: "bez",
    elektroinst: false,
    vodoinst: false,
    kanalizacia: false,
    klimatizacia: false,
    krb: false,
    fotovoltika: false,
    fasada: "standard",
    interiér: "standard",
    podlaha: "standard",
    kuchynska_linka: false,
    sanita_upgrade: false,
    terasa: false
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
    queryKey: ['dom-konfigurator-ticabhouse', domId],
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

  // Cenník
  const cennik = {
    izolacie_steny: {
      "150mm": 0,
      "200mm": 3000,
      "250mm": 5000
    },
    izolacie_podlaha: {
      "150mm": 0,
      "200mm": 2500
    },
    okna_profil: {
      standard: 0,
      premium: 3500,
      hlinik: 6000
    },
    tepelne_cerpadlo: 9000,
    rekuperacia: 4500,
    projektova_dok_rd: 2107,
    energeticky_cert: 3500,
    montaz: 7000,
    zaklady: {
      bez: 0,
      skrutky: 5000,
      pasove: 15000,
      doska: 18000
    },
    elektroinst: 3500,
    vodoinst: 2500,
    kanalizacia: 2000,
    klimatizacia: 2800,
    krb: 4500,
    fotovoltika: 15000,
    fasada: {
      standard: 0,
      thermowood: 8000,
      smrekovec: 5000,
      kompozit: 12000,
      omietka: 7000
    },
    interiér: {
      standard: 0,
      sadrokarton: 4000
    },
    podlaha: {
      standard: 0,
      vinyl: 2500,
      drevo: 5000
    },
    kuchynska_linka: 3000,
    sanita_upgrade: 1500,
    terasa: 6000
  };

  const vypocitatCenu = () => {
    let celkovaCena = dom?.zakladna_cena || 0;

    // A0 komponenty
    celkovaCena += cennik.izolacie_steny[konfig.izolacie_steny] || 0;
    celkovaCena += cennik.izolacie_podlaha[konfig.izolacie_podlaha] || 0;
    celkovaCena += cennik.okna_profil[konfig.okna_profil] || 0;
    if (konfig.tepelne_cerpadlo) celkovaCena += cennik.tepelne_cerpadlo;
    if (konfig.rekuperacia) celkovaCena += cennik.rekuperacia;
    if (konfig.projektova_dok_rd) celkovaCena += cennik.projektova_dok_rd;
    if (konfig.energeticky_cert) celkovaCena += cennik.energeticky_cert;

    // R komponenty
    if (konfig.montaz) celkovaCena += cennik.montaz;
    celkovaCena += cennik.zaklady[konfig.zaklady] || 0;
    if (konfig.elektroinst) celkovaCena += cennik.elektroinst;
    if (konfig.vodoinst) celkovaCena += cennik.vodoinst;
    if (konfig.kanalizacia) celkovaCena += cennik.kanalizacia;
    if (konfig.klimatizacia) celkovaCena += cennik.klimatizacia;
    if (konfig.krb) celkovaCena += cennik.krb;
    if (konfig.fotovoltika) celkovaCena += cennik.fotovoltika;
    celkovaCena += cennik.fasada[konfig.fasada] || 0;
    celkovaCena += cennik.interiér[konfig.interiér] || 0;
    celkovaCena += cennik.podlaha[konfig.podlaha] || 0;
    if (konfig.kuchynska_linka) celkovaCena += cennik.kuchynska_linka;
    if (konfig.sanita_upgrade) celkovaCena += cennik.sanita_upgrade;
    if (konfig.terasa) celkovaCena += cennik.terasa;

    return celkovaCena;
  };

  const jeA0 = () => {
    return (
      (konfig.izolacie_steny === "200mm" || konfig.izolacie_steny === "250mm") &&
      (konfig.izolacie_podlaha === "200mm") &&
      konfig.tepelne_cerpadlo &&
      konfig.rekuperacia &&
      konfig.projektova_dok_rd &&
      konfig.energeticky_cert
    );
  };

  const chybajuceA0 = () => {
    const chybajuce = [];
    if (konfig.izolacie_steny === "150mm") chybajuce.push("Hrubšia izolácia stien (min. 200mm)");
    if (konfig.izolacie_podlaha === "150mm") chybajuce.push("Hrubšia izolácia podlahy (200mm)");
    if (!konfig.tepelne_cerpadlo) chybajuce.push("Tepelné čerpadlo");
    if (!konfig.rekuperacia) chybajuce.push("Rekuperácia");
    if (!konfig.projektova_dok_rd) chybajuce.push("Projektová dokumentácia pre RD");
    if (!konfig.energeticky_cert) chybajuce.push("Energetická certifikácia A0");
    return chybajuce;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cena = vypocitatCenu();
    const status = jeA0() ? "Rodinný dom A0" : "Rekreačná stavba";
    const konfigText = `
DOM: ${dom?.nazov || 'N/A'} (Ticabhouse)
Základná cena: ${dom?.zakladna_cena?.toLocaleString('sk-SK')} € s DPH

STATUS: ${status}

KONFIGURÁCIA:
Izolácia stien: ${konfig.izolacie_steny}
Izolácia podlahy: ${konfig.izolacie_podlaha}
Okná: ${konfig.okna_profil}
Tepelné čerpadlo: ${konfig.tepelne_cerpadlo ? 'Áno' : 'Nie'}
Rekuperácia: ${konfig.rekuperacia ? 'Áno' : 'Nie'}
Projektová dok. RD: ${konfig.projektova_dok_rd ? 'Áno' : 'Nie'}
Energetický certifikát: ${konfig.energeticky_cert ? 'Áno' : 'Nie'}

Montáž: ${konfig.montaz ? 'Áno' : 'Nie'}
Základy: ${konfig.zaklady}
Fasáda: ${konfig.fasada}
Elektroinštalácia: ${konfig.elektroinst ? 'Áno' : 'Nie'}
Vodoinštalácia: ${konfig.vodoinst ? 'Áno' : 'Nie'}
Kanalizácia: ${konfig.kanalizacia ? 'Áno' : 'Nie'}

CELKOVÁ CENA: ${cena.toLocaleString('sk-SK')} € s DPH
    `.trim();

    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: domId,
      konfiguracny_kod: konfigText
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

  if (!dom || (dom.vyrobca !== "Ticab house" && dom.vyrobca !== "JAK Modules" && dom.vyrobca !== "Domki z Gór")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Neplatný dom</h2>
          <p className="text-gray-500 mb-6">Tento konfigurátor nie je dostupný pre tento model.</p>
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

  const cena = vypocitatCenu();

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
                Konfigurátor {dom.vyrobca}
              </h1>
            </div>
            {dom && (
              <div className="bg-white rounded-lg p-5 shadow-lg">
                <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide font-semibold">Konfigurujete model:</p>
                <h2 className="text-2xl font-bold text-gray-900">{dom.nazov}</h2>
                <p className="text-gray-700 mt-2 font-medium text-lg">
                  Základná cena: <span className="text-primary font-bold">{dom.zakladna_cena?.toLocaleString('sk-SK')}€ s DPH</span> ({dom.zastavana_plocha}m²)
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {!showFormular ? (
          <div className="max-w-5xl mx-auto">
            {/* Úvodný oznam */}
            <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-200">
              <h3 className="font-bold text-primary mb-3 text-lg">Modulárna konštrukcia domu – flexibilné riešenie pre vaše bývanie</h3>
              <p className="text-sm text-gray-700 mb-3">
                Uvedená základná cena domu zahŕňa kompletnú štandardnú výbavu. Táto základná konfigurácia je navrhnutá a určená pre <strong>Status rekreačnej stavby</strong> (napr. chata, záhradný dom).
              </p>
              <p className="text-sm text-gray-700">
                <strong>Možnosť upgradu na Rodinný dom (A0):</strong> Dom je možné technologicky upraviť tak, aby spĺňal prísne požiadavky pre energetický certifikát A0. Pridaním špecifických komponentov je možné dom skolaudovať ako plnohodnotný <strong>Rodinný dom</strong> na trvalé bývanie.
              </p>
            </Card>

            {/* Dynamický status */}
            {jeA0() ? (
              <Card className="p-6 mb-8 bg-green-50 border-2 border-green-500">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-green-800 text-lg mb-2">✅ Status: Rodinný dom A0</h3>
                    <p className="text-sm text-green-700">
                      Gratulujeme! Vaša konfigurácia spĺňa požiadavky pre získanie energetického certifikátu A0. Dom je možné skolaudovať ako rodinný dom na klasické stavebné povolenie.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 mb-8 bg-amber-50 border-2 border-amber-400">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-amber-800 text-lg mb-2">⚠️ Status: Rekreačná stavba</h3>
                    <p className="text-sm text-amber-700 mb-3">
                      Vaša aktuálna konfigurácia vyhovuje statusu rekreačnej stavby. Pre dosiahnutie štandardu Rodinného domu A0 je potrebné doplniť:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {chybajuceA0().map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-8 md:p-12 mb-6">
              {/* A. Energetický štandard */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">A. Energetický štandard a konštrukcia</h2>
                
                <div className="space-y-6">
                  {/* Izolácia stien */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                      Izolácia stien
                    </Label>
                    <RadioGroup value={konfig.izolacie_steny} onValueChange={(value) => setKonfig({...konfig, izolacie_steny: value})}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="150mm" id="steny-150" />
                            <Label htmlFor="steny-150" className="cursor-pointer">150mm (Štandard)</Label>
                          </div>
                          <span className="text-sm text-gray-600">Zahrnuté</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="200mm" id="steny-200" />
                            <Label htmlFor="steny-200" className="cursor-pointer font-semibold">200mm - Nevyhnutné pre A0</Label>
                          </div>
                          <span className="text-primary font-bold">+{cennik.izolacie_steny["200mm"].toLocaleString('sk-SK')} €</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="250mm" id="steny-250" />
                            <Label htmlFor="steny-250" className="cursor-pointer font-semibold">250mm</Label>
                          </div>
                          <span className="text-primary font-bold">+{cennik.izolacie_steny["250mm"].toLocaleString('sk-SK')} €</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Izolácia podlahy */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                      Izolácia podlahy a stropu
                    </Label>
                    <RadioGroup value={konfig.izolacie_podlaha} onValueChange={(value) => setKonfig({...konfig, izolacie_podlaha: value})}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="150mm" id="podlaha-150" />
                            <Label htmlFor="podlaha-150" className="cursor-pointer">150mm (Štandard)</Label>
                          </div>
                          <span className="text-sm text-gray-600">Zahrnuté</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="200mm" id="podlaha-200" />
                            <Label htmlFor="podlaha-200" className="cursor-pointer font-semibold">200mm+ - Nevyhnutné pre A0</Label>
                          </div>
                          <span className="text-primary font-bold">+{cennik.izolacie_podlaha["200mm"].toLocaleString('sk-SK')} €</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Okná */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                      Okná a dvere
                    </Label>
                    <RadioGroup value={konfig.okna_profil} onValueChange={(value) => setKonfig({...konfig, okna_profil: value})}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standard" id="okna-std" />
                            <Label htmlFor="okna-std" className="cursor-pointer">Štandardný kovoplastový profil</Label>
                          </div>
                          <span className="text-sm text-gray-600">Zahrnuté</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="premium" id="okna-prem" />
                            <Label htmlFor="okna-prem" className="cursor-pointer font-semibold">Premium tepelnoizolačný profil</Label>
                          </div>
                          <span className="text-primary font-bold">+{cennik.okna_profil.premium.toLocaleString('sk-SK')} €</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="hlinik" id="okna-hlin" />
                            <Label htmlFor="okna-hlin" className="cursor-pointer font-semibold">Hliníkový profil</Label>
                          </div>
                          <span className="text-primary font-bold">+{cennik.okna_profil.hlinik.toLocaleString('sk-SK')} €</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* B. Technológie */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">B. Technológie (Vykurovanie a vetranie)</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.tepelne_cerpadlo}
                          onCheckedChange={(checked) => setKonfig({...konfig, tepelne_cerpadlo: checked})}
                          id="tepelne"
                        />
                        <Label htmlFor="tepelne" className="cursor-pointer font-semibold flex items-center gap-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                          Tepelné čerpadlo - Nevyhnutné pre A0
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.tepelne_cerpadlo.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.rekuperacia}
                          onCheckedChange={(checked) => setKonfig({...konfig, rekuperacia: checked})}
                          id="rekup"
                        />
                        <Label htmlFor="rekup" className="cursor-pointer font-semibold flex items-center gap-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                          Rekuperácia (Riadené vetranie) - Nevyhnutné pre A0
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.rekuperacia.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.klimatizacia}
                          onCheckedChange={(checked) => setKonfig({...konfig, klimatizacia: checked})}
                          id="klima"
                        />
                        <Label htmlFor="klima" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Klimatizácia
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.klimatizacia.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.krb}
                          onCheckedChange={(checked) => setKonfig({...konfig, krb: checked})}
                          id="krb"
                        />
                        <Label htmlFor="krb" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Krb / Kachle s komínom
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.krb.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.fotovoltika}
                          onCheckedChange={(checked) => setKonfig({...konfig, fotovoltika: checked})}
                          id="foto"
                        />
                        <Label htmlFor="foto" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Fotovoltaický systém
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.fotovoltika.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. Služby a dokumentácia */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">C. Služby a dokumentácia</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.projektova_dok_rd}
                          onCheckedChange={(checked) => setKonfig({...konfig, projektova_dok_rd: checked})}
                          id="projekt"
                        />
                        <Label htmlFor="projekt" className="cursor-pointer font-semibold flex items-center gap-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                          Projektová dokumentácia pre stavebné povolenie RD - Nevyhnutné pre A0
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.projektova_dok_rd.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.energeticky_cert}
                          onCheckedChange={(checked) => setKonfig({...konfig, energeticky_cert: checked})}
                          id="certif"
                        />
                        <Label htmlFor="certif" className="cursor-pointer font-semibold flex items-center gap-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A0</span>
                          Vybavenie Energetického certifikátu A0 - Nevyhnutné pre A0
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.energeticky_cert.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.montaz}
                          onCheckedChange={(checked) => setKonfig({...konfig, montaz: checked})}
                          id="montaz"
                        />
                        <Label htmlFor="montaz" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Profesionálna montáž domu
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.montaz.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  {/* Základy */}
                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                      Realizácia základov
                    </Label>
                    <RadioGroup value={konfig.zaklady} onValueChange={(value) => setKonfig({...konfig, zaklady: value})}>
                      <div className="space-y-2">
                        {Object.entries(cennik.zaklady).map(([key, price]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={key} id={`zakl-${key}`} />
                              <Label htmlFor={`zakl-${key}`} className="cursor-pointer">
                                {key === 'bez' ? 'Bez základov' :
                                 key === 'skrutky' ? 'Zemné skrutky' :
                                 key === 'pasove' ? 'Pásové betónové' :
                                 'Základová doska'}
                              </Label>
                            </div>
                            <span className="text-sm text-gray-700">
                              {price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.elektroinst}
                          onCheckedChange={(checked) => setKonfig({...konfig, elektroinst: checked})}
                          id="elektro"
                        />
                        <Label htmlFor="elektro" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Elektroinštalácia
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.elektroinst.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.vodoinst}
                          onCheckedChange={(checked) => setKonfig({...konfig, vodoinst: checked})}
                          id="voda"
                        />
                        <Label htmlFor="voda" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Vodoinštalácia
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.vodoinst.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.kanalizacia}
                          onCheckedChange={(checked) => setKonfig({...konfig, kanalizacia: checked})}
                          id="kanal"
                        />
                        <Label htmlFor="kanal" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Kanalizácia
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.kanalizacia.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* D. Dizajnové prvky */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">D. Dizajnové a konštrukčné prvky</h2>
                
                {/* Fasáda */}
                <div className="border-l-4 border-green-500 pl-4 p-4 mb-4">
                  <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                    Vonkajšia fasáda
                  </Label>
                  <RadioGroup value={konfig.fasada} onValueChange={(value) => setKonfig({...konfig, fasada: value})}>
                    <div className="space-y-2">
                      {Object.entries(cennik.fasada).map(([key, price]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={key} id={`fas-${key}`} />
                            <Label htmlFor={`fas-${key}`} className="cursor-pointer">
                              {key === 'standard' ? 'Štandardná' :
                               key === 'thermowood' ? 'Thermowood' :
                               key === 'smrekovec' ? 'Sibírsky smrekovec' :
                               key === 'kompozit' ? 'Kompozitné panely' :
                               'Šúchaná omietka'}
                            </Label>
                          </div>
                          <span className="text-sm text-gray-700">
                            {price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Interiér */}
                <div className="border-l-4 border-green-500 pl-4 p-4 mb-4">
                  <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                    Interiérové úpravy
                  </Label>
                  <RadioGroup value={konfig.interiér} onValueChange={(value) => setKonfig({...konfig, interiér: value})}>
                    <div className="space-y-2">
                      {Object.entries(cennik.interiér).map(([key, price]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={key} id={`int-${key}`} />
                            <Label htmlFor={`int-${key}`} className="cursor-pointer">
                              {key === 'standard' ? 'Štandardné' : 'Sadrokartón s maľovkou/tapetou'}
                            </Label>
                          </div>
                          <span className="text-sm text-gray-700">
                            {price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Podlaha */}
                <div className="border-l-4 border-green-500 pl-4 p-4 mb-4">
                  <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                    Podlaha
                  </Label>
                  <RadioGroup value={konfig.podlaha} onValueChange={(value) => setKonfig({...konfig, podlaha: value})}>
                    <div className="space-y-2">
                      {Object.entries(cennik.podlaha).map(([key, price]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={key} id={`pod-${key}`} />
                            <Label htmlFor={`pod-${key}`} className="cursor-pointer">
                              {key === 'standard' ? 'Štandardná (Laminát)' :
                               key === 'vinyl' ? 'Vinyl' : 'Drevo'}
                            </Label>
                          </div>
                          <span className="text-sm text-gray-700">
                            {price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.kuchynska_linka}
                          onCheckedChange={(checked) => setKonfig({...konfig, kuchynska_linka: checked})}
                          id="kuchyna"
                        />
                        <Label htmlFor="kuchyna" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Kuchynská linka
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.kuchynska_linka.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.sanita_upgrade}
                          onCheckedChange={(checked) => setKonfig({...konfig, sanita_upgrade: checked})}
                          id="sanita"
                        />
                        <Label htmlFor="sanita" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Upgrade sanity a batérií (napr. Grohe)
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.sanita_upgrade.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={konfig.terasa}
                          onCheckedChange={(checked) => setKonfig({...konfig, terasa: checked})}
                          id="terasa"
                        />
                        <Label htmlFor="terasa" className="cursor-pointer flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">R</span>
                          Terasa / Pergola
                        </Label>
                      </div>
                      <span className="text-primary font-bold">+{cennik.terasa.toLocaleString('sk-SK')} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 flex gap-3 mb-6">
                <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Uvedené ceny sú orientačné. Finálna cena bude upresnená po obhliadke pozemku a konzultácii s našimi špecialistami.
                </p>
              </div>

              {/* Cenový súhrn */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-primary mb-6">
                <h3 className="text-xl font-bold text-primary mb-4">Cenový súhrn</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-2xl pt-2">
                    <span className="text-primary font-bold">Celková cena s DPH:</span>
                    <span className="font-bold text-primary">{cena.toLocaleString('sk-SK')} €</span>
                  </div>
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
                <div className={`rounded-lg p-4 mb-4 ${jeA0() ? 'bg-green-50 border-2 border-green-500' : 'bg-amber-50 border-2 border-amber-400'}`}>
                  <p className="text-sm text-gray-600 mb-2">Status: {jeA0() ? '✅ Rodinný dom A0' : '⚠️ Rekreačná stavba'}</p>
                  <p className="text-sm text-gray-600 mb-2">Orientačná celková cena s DPH:</p>
                  <p className="text-3xl font-bold text-primary">
                    {cena.toLocaleString('sk-SK')} €
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
    </div>
  );
}