import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Wrench, Plug, Droplets, ThermometerSun, Wind, 
  Landmark, FileText, AlertTriangle, ArrowLeft, Send,
  Zap, ShowerHead, Flame, Cable, TreePine, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function KonfiguratorFlatDouble() {
  // Základná cena
  const BASE_PRICE = 59900;

  // State pre všetky voľby
  const [montazHolodomu, setMontazHolodomu] = useState("nie");
  const [vstupneDvere, setVstupneDvere] = useState("ziadne");
  const [izolaciaNavysenie, setIzolaciaNavysenie] = useState("standard");
  
  const [elektroinstalacia, setElektroinstalacia] = useState(false);
  const [vodaKanalizacia, setVodaKanalizacia] = useState(false);
  const [sanitaKomplet, setSanitaKomplet] = useState(false);
  const [bojler, setBojler] = useState(false);
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);
  
  const [zaklady, setZaklady] = useState("bez");
  const [pripojkaSiete, setPripojkaSiete] = useState(false);
  
  const [inziniering, setInziniering] = useState(false);
  const [projektA0, setProjektA0] = useState(false);

  // Cenník
  const CENY = {
    montaz: { nie: 0, ano: 17970 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, zvysena: 5799, premium: 11600 },
    elektroinstalacia: 7400,
    vodaKanalizacia: 2380,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 5535,
    rekuperacia: 2700,
    zaklady: { bez: 0, skrutky: 8140, doska: 17946, pasove: 21079 },
    pripojkaSiete: 1501,
    inziniering: 2592,
    projektA0: 3500
  };

  // Výpočet celkovej ceny
  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;
    
    total += CENY.montaz[montazHolodomu];
    total += CENY.dvere[vstupneDvere];
    total += CENY.izolacia[izolaciaNavysenie];
    
    if (elektroinstalacia) total += CENY.elektroinstalacia;
    if (vodaKanalizacia) total += CENY.vodaKanalizacia;
    if (sanitaKomplet) total += CENY.sanitaKomplet;
    if (bojler) total += CENY.bojler;
    if (tepelneCerpadlo) total += CENY.tepelneCerpadlo;
    if (rekuperacia) total += CENY.rekuperacia;
    
    total += CENY.zaklady[zaklady];
    if (pripojkaSiete) total += CENY.pripojkaSiete;
    
    if (inziniering) total += CENY.inziniering;
    if (projektA0) total += CENY.projektA0;
    
    return total;
  }, [montazHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, 
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0]);

  // Kontrola A0 odporúčaní
  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium") chybajuce.push("Premium izolácia (250mm steny, 300mm strecha)");
    if (!tepelneCerpadlo) chybajuce.push("Tepelné čerpadlo / Klimatizácia");
    if (!rekuperacia) chybajuce.push("Rekuperácia");
    
    return chybajuce.length > 0 ? chybajuce : null;
  }, [projektA0, izolaciaNavysenie, tepelneCerpadlo, rekuperacia]);

  const formatPrice = (price) => price.toLocaleString('sk-SK') + " €";

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("Katalog")}>
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Flat Double 142m² - Konfigurátor
            </h1>
            <p className="text-xl text-red-100 mb-6">
              Zastavaná plocha 142m² | Úžitková plocha 99m² | Terasa 40m²
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
              <p className="text-sm text-red-200 mb-1">Základná cena (holodom/sada)</p>
              <p className="text-4xl font-bold">{formatPrice(BASE_PRICE)}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Sekcia 1: Konštrukcia a Obálka */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Konštrukcia a Obálka</h2>
            </div>

            {/* Montáž holodomu */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-3 block">Montáž holodomu</Label>
              <RadioGroup value={montazHolodomu} onValueChange={setMontazHolodomu} className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="nie" id="montaz-nie" />
                    <Label htmlFor="montaz-nie" className="cursor-pointer">Nie (Iba dodanie sady)</Label>
                  </div>
                  <span className="text-gray-500">+ 0 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="ano" id="montaz-ano" />
                    <Label htmlFor="montaz-ano" className="cursor-pointer">Áno (Montáž holodomu)</Label>
                  </div>
                  <span className="font-semibold text-red-600">+ 17 970 €</span>
                </div>
              </RadioGroup>
            </div>

            {/* Hrúbka izolácie */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-3 block">Hrúbka izolácie</Label>
              <RadioGroup value={izolaciaNavysenie} onValueChange={setIzolaciaNavysenie} className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="izolacia-standard" />
                    <div>
                      <Label htmlFor="izolacia-standard" className="cursor-pointer">Štandard</Label>
                      <p className="text-sm text-gray-500">Steny 150mm, Strecha 200mm</p>
                    </div>
                  </div>
                  <span className="text-gray-500">+ 0 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="zvysena" id="izolacia-zvysena" />
                    <div>
                      <Label htmlFor="izolacia-zvysena" className="cursor-pointer">Zvýšená</Label>
                      <p className="text-sm text-gray-500">Steny 200mm, Strecha 250mm</p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600">+ 5 799 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border-2 border-green-500 rounded-lg hover:bg-green-50 bg-green-50/50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="premium" id="izolacia-premium" />
                    <div>
                      <Label htmlFor="izolacia-premium" className="cursor-pointer flex items-center gap-2">
                        Premium / A0
                        <Badge className="bg-green-600">Odporúčané pre A0</Badge>
                      </Label>
                      <p className="text-sm text-gray-500">Steny 250mm, Strecha 300mm</p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600">+ 11 600 €</span>
                </div>
              </RadioGroup>
            </div>

            {/* Vstupné dvere */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Vstupné dvere</Label>
              <RadioGroup value={vstupneDvere} onValueChange={setVstupneDvere} className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="ziadne" id="dvere-ziadne" />
                    <Label htmlFor="dvere-ziadne" className="cursor-pointer">Žiadne / Štandard v sade</Label>
                  </div>
                  <span className="text-gray-500">+ 0 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="kovove" id="dvere-kovove" />
                    <Label htmlFor="dvere-kovove" className="cursor-pointer">Kovové dvere s 2 zámkami</Label>
                  </div>
                  <span className="font-semibold text-red-600">+ 720 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="plastove" id="dvere-plastove" />
                    <Label htmlFor="dvere-plastove" className="cursor-pointer">Plastovo-kovové dvere</Label>
                  </div>
                  <span className="font-semibold text-red-600">+ 660 €</span>
                </div>
              </RadioGroup>
            </div>
          </Card>
        </motion.div>

        {/* Sekcia 2: Technológie a Inštalácie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plug className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Technológie a Inštalácie</h2>
            </div>

            <div className="space-y-3">
              {/* Elektroinštalácia */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="elektro" 
                    checked={elektroinstalacia} 
                    onCheckedChange={setElektroinstalacia}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div>
                    <Label htmlFor="elektro" className="cursor-pointer flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Elektrická inštalácia
                    </Label>
                    <p className="text-sm text-gray-500">Rozvody, rozvádzač, zásuvky</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 7 400 €</span>
              </div>

              {/* Voda a kanalizácia */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="voda" 
                    checked={vodaKanalizacia} 
                    onCheckedChange={setVodaKanalizacia}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div>
                    <Label htmlFor="voda" className="cursor-pointer flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Rozvody vody a kanalizácie
                    </Label>
                    <p className="text-sm text-gray-500">Príprava pre sanitárne zariadenia</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 2 380 €</span>
              </div>

              {/* Sanita */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="sanita" 
                    checked={sanitaKomplet} 
                    onCheckedChange={setSanitaKomplet}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div>
                    <Label htmlFor="sanita" className="cursor-pointer flex items-center gap-2">
                      <ShowerHead className="w-4 h-4 text-cyan-500" />
                      Sanita komplet
                    </Label>
                    <p className="text-sm text-gray-500">Sprchový kút, umývadlo, WC misa</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 1 169 €</span>
              </div>

              {/* Bojler */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="bojler" 
                    checked={bojler} 
                    onCheckedChange={setBojler}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div>
                    <Label htmlFor="bojler" className="cursor-pointer flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Elektrický bojler
                    </Label>
                    <p className="text-sm text-gray-500">Ohrev teplej úžitkovej vody</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 246 €</span>
              </div>

              <div className="border-t my-4"></div>

              {/* Tepelné čerpadlo */}
              <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${projektA0 && !tepelneCerpadlo ? 'border-amber-400 bg-amber-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="cerpadlo" 
                    checked={tepelneCerpadlo} 
                    onCheckedChange={setTepelneCerpadlo}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div>
                    <Label htmlFor="cerpadlo" className="cursor-pointer flex items-center gap-2">
                      <ThermometerSun className="w-4 h-4 text-red-500" />
                      Tepelné čerpadlo / Klimatizácia
                      {projektA0 && <Badge className="bg-green-600 text-xs">Pre A0</Badge>}
                    </Label>
                    <p className="text-sm text-gray-500">1x vonkajšia + 5x vnútorná jednotka</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 5 535 €</span>
              </div>

              {/* Rekuperácia */}
              <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${projektA0 && !rekuperacia ? 'border-amber-400 bg-amber-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="rekuperacia" 
                    checked={rekuperacia} 
                    onCheckedChange={setRekuperacia}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div>
                    <Label htmlFor="rekuperacia" className="cursor-pointer flex items-center gap-2">
                      <Wind className="w-4 h-4 text-teal-500" />
                      Rekuperácia
                      {projektA0 && <Badge className="bg-green-600 text-xs">Pre A0</Badge>}
                    </Label>
                    <p className="text-sm text-gray-500">5ks lokálnych jednotiek</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 2 700 €</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sekcia 3: Základy a Prípojky */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Landmark className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Základy a Prípojky</h2>
            </div>

            {/* Typ základov */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-3 block">Typ základov</Label>
              <RadioGroup value={zaklady} onValueChange={setZaklady} className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="bez" id="zaklady-bez" />
                    <Label htmlFor="zaklady-bez" className="cursor-pointer">Bez základov (zabezpečuje klient)</Label>
                  </div>
                  <span className="text-gray-500">+ 0 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="skrutky" id="zaklady-skrutky" />
                    <Label htmlFor="zaklady-skrutky" className="cursor-pointer">Zemné skrutky / Pätky</Label>
                  </div>
                  <span className="font-semibold text-red-600">+ 8 140 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="doska" id="zaklady-doska" />
                    <Label htmlFor="zaklady-doska" className="cursor-pointer">Základová doska</Label>
                  </div>
                  <span className="font-semibold text-red-600">+ 17 946 €</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="pasove" id="zaklady-pasove" />
                    <Label htmlFor="zaklady-pasove" className="cursor-pointer">Pásové základy</Label>
                  </div>
                  <span className="font-semibold text-red-600">+ 21 079 €</span>
                </div>
              </RadioGroup>
            </div>

            {/* Prípojky */}
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="pripojky" 
                  checked={pripojkaSiete} 
                  onCheckedChange={setPripojkaSiete}
                  className="data-[state=checked]:bg-amber-600"
                />
                <div>
                  <Label htmlFor="pripojky" className="cursor-pointer flex items-center gap-2">
                    <Cable className="w-4 h-4 text-gray-600" />
                    Pripojenie na inžinierske siete
                  </Label>
                  <p className="text-sm text-gray-500">Elektrika, voda, kanalizácia (do 10m)</p>
                </div>
              </div>
              <span className="font-semibold text-red-600">+ 1 501 €</span>
            </div>
          </Card>
        </motion.div>

        {/* Sekcia 4: Legislatíva */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Dokumentácia a Legislatíva</h2>
            </div>

            <div className="space-y-3">
              {/* Inžiniering */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="inziniering" 
                    checked={inziniering} 
                    onCheckedChange={setInziniering}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <div>
                    <Label htmlFor="inziniering" className="cursor-pointer">
                      Inžiniering stavebného povolenia
                    </Label>
                    <p className="text-sm text-gray-500">Vybavenie všetkých povolení</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 2 592 €</span>
              </div>

              {/* Projekt A0 */}
              <div className="flex items-center justify-between p-4 border-2 border-green-400 rounded-lg hover:bg-green-50 bg-green-50/50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="projekt" 
                    checked={projektA0} 
                    onCheckedChange={setProjektA0}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div>
                    <Label htmlFor="projekt" className="cursor-pointer flex items-center gap-2">
                      Projektant a Energetická certifikácia
                      <Badge className="bg-green-600">A0</Badge>
                    </Label>
                    <p className="text-sm text-gray-500">Kompletná projektová dokumentácia + certifikát A0</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">+ 3 500 €</span>
              </div>
            </div>

            {/* A0 Upozornenie */}
            {a0Odporucania && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 mb-2">
                      Pre splnenie normy A0 odporúčame doplniť:
                    </p>
                    <ul className="space-y-1">
                      {a0Odporucania.map((item, index) => (
                        <li key={index} className="text-sm text-amber-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* A0 Splnené */}
            {projektA0 && !a0Odporucania && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-800">
                    Výborne! Vaša konfigurácia spĺňa požiadavky pre energetickú triedu A0.
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div>
              <p className="text-sm text-gray-500">Celková odhadovaná cena</p>
              <p className="text-3xl sm:text-4xl font-bold text-red-600">
                {formatPrice(totalPrice)}
              </p>
              <p className="text-xs text-gray-400">s DPH</p>
            </div>
            <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalPrice}`}>
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 text-lg">
                <Send className="mr-2 w-5 h-5" />
                Mám záujem o túto konfiguráciu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}