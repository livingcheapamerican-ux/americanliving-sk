import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Send, AlertTriangle, CheckCircle, Calculator, RotateCcw,
  Wrench, Plug, Droplets, ThermometerSun, Wind, Landmark, FileText,
  Zap, ShowerHead, Flame, Cable, Paintbrush, Home, Truck, Sun, DoorOpen,
  Scaling, Maximize, Square, FileCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function KonfiguratorFlatDoubleInline({ dom }) {
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
  
  // Interiér a dokončenie
  const [interierFinis, setInterierFinis] = useState("ziadne");
  const [vonkajsiaFasada, setVonkajsiaFasada] = useState("standard");
  const [povrchokaOkien, setPovrchokaOkien] = useState(false);
  const [vnutornePodlahy, setVnutornePodlahy] = useState(false);
  const [podlahovVykurovanie, setPodlahovVykurovanie] = useState(false);
  const [pergola, setPergola] = useState(false);
  const [interieroveDvere, setInterieroveDvere] = useState(0);
  const [tonovaneSkla, setTonovaneSkla] = useState(false);
  const [doprava, setDoprava] = useState(false);
  const [revizna, setRevizna] = useState(false);
  
  // Rozšírenia
  const [predlzenieDlzky, setPredlzenieDlzky] = useState(0);
  const [stresneOkno, setStresneOkno] = useState(0);
  const [bocneOknoFixne, setBocneOknoFixne] = useState(0);
  const [bocneOknoVyklopne, setBocneOknoVyklopne] = useState(0);

  // Cenník (z pôvodného konfigurátora)
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
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 16400, sadrokarton: 19475 },
    // Nové položky zo starej stránky
    vonkajsiaFasada: { standard: 0, suchana: 12841 },
    povrchokaOkien: 3100,
    vnutornePodlahy: 3351,
    podlahovVykurovanie: 5525,
    pergola: 1845,
    interieroveDvere: 180,
    tonovaneSkla: 1300,
    doprava: 0,
    revizna: 1000,
    predlzenieDlzky: 0, // individuálne nacenenie
    stresneOkno: 0, // individuálne nacenenie
    bocneOknoFixne: 0, // individuálne nacenenie
    bocneOknoVyklopne: 0 // individuálne nacenenie
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
    
    total += CENY.interierFinis[interierFinis];
    total += CENY.vonkajsiaFasada[vonkajsiaFasada];
    if (povrchokaOkien) total += CENY.povrchokaOkien;
    if (vnutornePodlahy) total += CENY.vnutornePodlahy;
    if (podlahovVykurovanie) total += CENY.podlahovVykurovanie;
    if (pergola) total += CENY.pergola;
    total += interieroveDvere * CENY.interieroveDvere;
    if (tonovaneSkla) total += CENY.tonovaneSkla;
    if (doprava) total += CENY.doprava;
    if (revizna) total += CENY.revizna;
    
    return total;
  }, [montazHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, 
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0, interierFinis,
      vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, podlahovVykurovanie,
      pergola, interieroveDvere, tonovaneSkla, doprava, revizna]);

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

  const handleReset = () => {
    setMontazHolodomu("nie");
    setVstupneDvere("ziadne");
    setIzolaciaNavysenie("standard");
    setElektroinstalacia(false);
    setVodaKanalizacia(false);
    setSanitaKomplet(false);
    setBojler(false);
    setTepelneCerpadlo(false);
    setRekuperacia(false);
    setZaklady("bez");
    setPripojkaSiete(false);
    setInziniering(false);
    setProjektA0(false);
    setInterierFinis("ziadne");
  };

  return (
    <Card className="p-6 mt-6 bg-white border-2 border-gray-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Konfigurátor Domu: Flat double, 142m²</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="text-gray-600 hover:text-red-600 hover:border-red-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetovať
        </Button>
      </div>

      {/* Základná cena info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900">
          Základná cena <strong>{formatPrice(BASE_PRICE)} s DPH</strong> zahŕňa holodom/sadu na svojpomocnú montáž.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Zastavaná plocha 142m² | Úžitková plocha 99m² | Terasa 40m²
        </p>
      </div>

      {/* Sekcia 1: Konštrukcia */}
      <div className="border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Konštrukcia</h3>
        </div>

        {/* Komplet pre montáž - info box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm">
          <p className="font-semibold text-gray-800 mb-2">Komplekt pre montáž:</p>
          <ul className="text-gray-700 space-y-1 list-disc list-inside">
            <li>drevená konštrukcia domu, hobľovaný hranol sušený v komore, rôzneho prierezu</li>
            <li>vonkajšie steny, falcovaný plech 0,45 mm (výroba Slovensko, Kórea, Poľsko) a smreková/ihličnatá doska hrúbky 20 mm. Po dohode je možná zmena typu fasádneho obkladu</li>
            <li>strecha, falcovaný plech 0,45 mm (výroba Slovensko, Kórea, Poľsko)</li>
            <li>okná s dvojkomorovým izolačným sklom (tri sklá), päťkomorový PVC profil 70 mm (biely)</li>
            <li>dvere s dvojkomorovým izolačným sklom (tri sklá), päťkomorový PVC profil 70 mm (biely)</li>
            <li>hydroizolačná membrána Strotex 1300 (alebo ekvivalent)</li>
            <li>tepelná izolácia (150(250) mm – steny a strecha; 200(250) mm – podlaha), nehorľavé, tepelnoizolačné, hydrofobizované, zvuk pohlcujúce bazaltové dosky alebo rolky IZOVAT s hustotou minimálne 30 kg/m3 (alebo ekvivalent)</li>
            <li>parozábranová fólia Strotex AL90 (alebo ekvivalent)</li>
            <li>hrubá podlaha z OSB dosiek 22 mm</li>
            <li>materiály vnútorných priečok a povrchových úprav nie sú zahrnuté v domekomplete</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-300 space-y-1">
            <p className="text-gray-700">Schodisko nie je súčasťou základnej ponuky.</p>
            <p className="text-gray-700">Farba na vonkajšiu fasádu je poskytovaná objednávateľom.</p>
            <p className="text-gray-700">Cena maľovania fasády nie je súčasťou základnej ponuky.</p>
            <p className="text-red-600 font-medium">Maľovanie sa účtuje dodatočne na základe skutočne natretej plochy, v sume 4,5 € za m².</p>
          </div>
        </div>

        {/* Montáž holodomu */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block">Montáž holodomu</Label>
          <p className="text-sm text-red-600 mb-3">Montážne práce (dodatočne sa účtuje ubytovanie montážnej brigády 3–4 osoby)</p>
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
              <span className="font-semibold text-green-600">+ 17 970 €</span>
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
              <span className="font-semibold text-green-600">+ 5 799 €</span>
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
              <span className="font-semibold text-green-600">+ 11 600 €</span>
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
              <span className="font-semibold text-green-600">+ 720 €</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="plastove" id="dvere-plastove" />
                <Label htmlFor="dvere-plastove" className="cursor-pointer">Plastovo-kovové dvere</Label>
              </div>
              <span className="font-semibold text-green-600">+ 660 €</span>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Sekcia 2: Technológie a Inštalácie */}
      <div className="border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plug className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Technológie a Inštalácie</h3>
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
            <span className="font-semibold text-green-600">+ 7 400 €</span>
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
            <span className="font-semibold text-green-600">+ 2 380 €</span>
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
            <span className="font-semibold text-green-600">+ 1 169 €</span>
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
            <span className="font-semibold text-green-600">+ 246 €</span>
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
            <span className="font-semibold text-green-600">+ 5 535 €</span>
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
            <span className="font-semibold text-green-600">+ 2 700 €</span>
          </div>
        </div>
      </div>

      {/* Sekcia 3: Základy a Prípojky */}
      <div className="border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Landmark className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Základy a Prípojky</h3>
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
              <span className="font-semibold text-green-600">+ 8 140 €</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="doska" id="zaklady-doska" />
                <Label htmlFor="zaklady-doska" className="cursor-pointer">Základová doska</Label>
              </div>
              <span className="font-semibold text-green-600">+ 17 946 €</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="pasove" id="zaklady-pasove" />
                <Label htmlFor="zaklady-pasove" className="cursor-pointer">Pásové základy</Label>
              </div>
              <span className="font-semibold text-green-600">+ 21 079 €</span>
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
          <span className="font-semibold text-green-600">+ 1 501 €</span>
        </div>
      </div>

      {/* Sekcia 4: Vnútorný a vonkajší dizajn */}
      <div className="border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
            <Paintbrush className="w-4 h-4 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Vnútorný a vonkajší dizajn</h3>
        </div>

        {/* Interiér finiš */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Interiér finiš - úpravy stien, montáž priečky</Label>
          <RadioGroup value={interierFinis} onValueChange={setInterierFinis} className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="ziadne" id="interier-ziadne" />
                <div>
                  <Label htmlFor="interier-ziadne" className="cursor-pointer">Nie</Label>
                  <p className="text-sm text-gray-500">Dom zostane v štádiu hrubej stavby</p>
                </div>
              </div>
              <span className="text-gray-500">+ 0 €</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="drevo" id="interier-drevo" />
                <Label htmlFor="interier-drevo" className="cursor-pointer">Obloženie drevom 12mm</Label>
              </div>
              <span className="font-semibold text-green-600">+ 16 400 €</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="sadrokarton" id="interier-sadrokarton" />
                <Label htmlFor="interier-sadrokarton" className="cursor-pointer">Sádrokartón</Label>
              </div>
              <span className="font-semibold text-green-600">+ 19 475 €</span>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Sekcia 5: Dokumentácia */}
      <div className="border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Dokumentácia a Legislatíva</h3>
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
            <span className="font-semibold text-green-600">+ 2 592 €</span>
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
            <span className="font-semibold text-green-600">+ 3 500 €</span>
          </div>
        </div>

        {/* A0 Upozornenie */}
        {a0Odporucania && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
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
          </div>
        )}

        {/* A0 Splnené */}
        {projektA0 && !a0Odporucania && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-800">
                Výborne! Vaša konfigurácia spĺňa požiadavky pre energetickú triedu A0.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Finálny cenový súhrn */}
      <div className="bg-gray-800 text-white rounded-xl p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Flat double, 142m²</h3>
            {projektA0 && !a0Odporucania && (
              <Badge className="bg-green-500 text-white mt-2">✓ Spĺňa A0</Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-gray-400">Celková odhadovaná cena</div>
            <div className="text-3xl font-bold text-green-400">{formatPrice(totalPrice)}</div>
            <div className="text-sm text-gray-400">s DPH</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalPrice}`}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 w-full sm:w-auto">
              <Send className="mr-2 w-5 h-5" />
              Mám záujem o túto konfiguráciu
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}