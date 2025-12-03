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
  Maximize, Square, FileCheck, Package, Hammer, Key
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
  const [revizna, setRevizna] = useState(true);
  
  // Rozšírenia
  const [stresneOkno, setStresneOkno] = useState(0);
  const [bocneOknoFixne, setBocneOknoFixne] = useState(0);
  const [bocneOknoVyklopne90, setBocneOknoVyklopne90] = useState(0);
  const [bocneOknoVyklopne55, setBocneOknoVyklopne55] = useState(0);

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
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 16400, sadrokarton: 19475 },
    vonkajsiaFasada: { standard: 0, suchana: 12841 },
    povrchokaOkien: 3100,
    vnutornePodlahy: 3351,
    podlahovVykurovanie: 5525,
    pergola: 1845,
    interieroveDvere: 250,
    tonovaneSkla: 1300,
    doprava: 0,
    revizna: 1000,
    stresneOkno: 760,
    bocneOknoFixne: 501,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
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
    
    total += stresneOkno * CENY.stresneOkno;
    total += bocneOknoFixne * CENY.bocneOknoFixne;
    total += bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90;
    total += bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55;
    
    return total;
  }, [montazHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, 
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0, interierFinis,
      vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, podlahovVykurovanie,
      pergola, interieroveDvere, tonovaneSkla, doprava, revizna,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55]);

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
    setVonkajsiaFasada("standard");
    setPovrchokaOkien(false);
    setVnutornePodlahy(false);
    setPodlahovVykurovanie(false);
    setPergola(false);
    setInterieroveDvere(0);
    setTonovaneSkla(false);
    setDoprava(false);
    setRevizna(false);
    setStresneOkno(0);
    setBocneOknoFixne(0);
    setBocneOknoVyklopne90(0);
    setBocneOknoVyklopne55(0);
  };

  // Sekcia Header komponenta
  const SectionHeader = ({ icon: Icon, title, subtitle, color, step }) => (
    <div className={`flex items-center gap-4 p-4 rounded-t-xl bg-gradient-to-r ${color}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm font-medium">KROK {step}</span>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {subtitle && <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="mt-8 space-y-6">
      {/* Hlavička konfigurátora */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Konfigurátor domu</h2>
                <p className="text-slate-400">Flat double | 142m² zastavaná | 99m² úžitková | 40m² terasa</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetovať konfiguráciu
            </Button>
          </div>
          
          {/* Základná cena */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-blue-300 font-medium">Základná cena sady na svojpomocnú montáž</p>
                <p className="text-slate-400 text-sm">Všetky ceny sú uvedené s DPH</p>
              </div>
              <div className="text-3xl font-bold text-blue-400">{formatPrice(BASE_PRICE)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 1: HRUBÁ STAVBA (Konštrukcia, Základy)
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <SectionHeader 
          icon={Package} 
          title="Hrubá stavba" 
          subtitle="Konštrukcia domu a základy"
          color="from-amber-600 to-orange-600"
          step="1"
        />
        <div className="p-6 space-y-6 bg-gradient-to-b from-amber-50/50 to-white">
          
          {/* Komplet pre montáž - info box */}
          <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
            <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Komplekt pre montáž zahŕňa:
            </p>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>drevená konštrukcia domu, hobľovaný hranol sušený v komore, rôzneho prierezu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>vonkajšie steny, falcovaný plech 0,45 mm (výroba Slovensko, Kórea, Poľsko) a smreková/ihličnatá doska hrúbky 20 mm. Po dohode je možná zmena typu fasádneho obkladu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>strecha, falcovaný plech 0,45 mm (výroba Slovensko, Kórea, Poľsko)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>okná s dvojkomorovým izolačným sklom (tri sklá), päťkomorový PVC profil 70 mm (biely)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>dvere s dvojkomorovým izolačným sklom (tri sklá), päťkomorový PVC profil 70 mm (biely)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>hydroizolačná membrána Strotex 1300 (alebo ekvivalent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>tepelná izolácia (150(250) mm – steny a strecha; 200(250) mm – podlaha), nehorľavé, tepelnoizolačné, hydrofobizované, zvuk pohlcujúce bazaltové dosky alebo rolky IZOVAT s hustotou minimálne 30 kg/m3 (alebo ekvivalent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>parozábranová fólia Strotex AL90 (alebo ekvivalent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>hrubá podlaha z OSB dosiek 22 mm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>materiály vnútorných priečok a povrchových úprav nie sú zahrnuté v domekomplete</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-amber-200 space-y-1 text-sm">
              <p className="text-gray-600">Schodisko nie je súčasťou základnej ponuky.</p>
              <p className="text-gray-600">Farba na vonkajšiu fasádu je poskytovaná objednávateľom.</p>
              <p className="text-gray-600">Cena maľovania fasády nie je súčasťou základnej ponuky.</p>
              <p className="text-red-600 font-medium">Maľovanie sa účtuje dodatočne na základe skutočne natretej plochy, v sume 4,5 € za m².</p>
            </div>
          </div>

          {/* Hrúbka izolácie */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-amber-600" />
              Hrúbka izolácie
            </Label>
            <RadioGroup value={izolaciaNavysenie} onValueChange={setIzolaciaNavysenie} className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="standard" id="izolacia-standard" />
                  <div>
                    <span className="font-semibold text-gray-800">Štandard</span>
                    <p className="text-sm text-gray-500">Steny 150mm, Strecha 200mm</p>
                    <p className="text-xs text-amber-600">Celoročná izolácia pre účely rekreačnej stavby</p>
                  </div>
                </div>
                <span className="text-gray-400 font-medium">+ 0 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="zvysena" id="izolacia-zvysena" />
                  <div>
                    <span className="font-semibold text-gray-800">Zvýšená</span>
                    <p className="text-sm text-gray-500">Steny 200mm, Strecha 250mm</p>
                    <p className="text-xs text-amber-600">Celoročná izolácia pre účely rekreačnej stavby</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 5 799 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-green-400 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="premium" id="izolacia-premium" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">Premium / A0</span>
                      <Badge className="bg-green-600 text-xs">Odporúčané pre A0</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Steny 250mm, Strecha 300mm</p>
                    <p className="text-xs text-green-700 font-medium">Potrebná položka pre status rodinného domu</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 11 600 €</span>
              </label>
            </RadioGroup>
          </div>

          {/* Montáž holodomu */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Montáž holodomu
            </Label>
            <p className="text-sm text-red-600 mb-4">Montážne práce (dodatočne sa účtuje ubytovanie montážnej brigády 3–4 osoby)</p>
            <RadioGroup value={montazHolodomu} onValueChange={setMontazHolodomu} className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="nie" id="montaz-nie" />
                  <span className="font-semibold text-gray-800">Nie (Iba dodanie sady)</span>
                </div>
                <span className="text-gray-400 font-medium">+ 0 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="ano" id="montaz-ano" />
                  <span className="font-semibold text-gray-800">Áno (Montáž holodomu)</span>
                </div>
                <span className="font-bold text-green-600">+ 17 970 €</span>
              </label>
            </RadioGroup>
          </div>

          {/* Typ základov */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-600" />
              Typ základov
            </Label>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-amber-900">
              <p className="font-semibold mb-2">Základ:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>môže byť realizovaný vo forme vrutových kovových stĺpov, betónových stĺpikov alebo betónovej dosky</li>
                <li>uvedená je minimálne možná cena základu za rovnom teréne</li>
                <li>konečná cena základu sa vypočíta samostatne po obdržaní výsledkov geodetickej analýzy pozemku (v prípade potreby) a po zhodnotení potrebných prác s ohľadom na terén pozemku</li>
                <li>cena prípravných prác na pozemku nie je zahrnutá v cene montáže základu</li>
              </ul>
            </div>
            <RadioGroup value={zaklady} onValueChange={setZaklady} className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="bez" id="zaklady-bez" />
                  <span className="font-semibold text-gray-800">Bez základov (zabezpečuje klient)</span>
                </div>
                <span className="text-gray-400 font-medium">+ 0 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="skrutky" id="zaklady-skrutky" />
                  <span className="font-semibold text-gray-800">Zemné skrutky / Pätky</span>
                </div>
                <span className="font-bold text-green-600">+ 8 140 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="doska" id="zaklady-doska" />
                  <span className="font-semibold text-gray-800">Základová doska</span>
                </div>
                <span className="font-bold text-green-600">+ 17 946 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="pasove" id="zaklady-pasove" />
                  <span className="font-semibold text-gray-800">Pásové základy</span>
                </div>
                <span className="font-bold text-green-600">+ 21 079 €</span>
              </label>
            </RadioGroup>
          </div>

        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 2: HOLODOM (Montáž, Inštalácie, Okná/Dvere)
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <SectionHeader 
          icon={Hammer} 
          title="Holodom" 
          subtitle="Montáž konštrukcie a technické inštalácie"
          color="from-blue-600 to-indigo-600"
          step="2"
        />
        <div className="p-6 space-y-6 bg-gradient-to-b from-blue-50/50 to-white">

          {/* Elektroinštalácia */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Elektroinštalácia
            </Label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm">
              <p className="text-yellow-900 font-medium mb-2">Základná elektroinštalácia podľa projektu zahŕňa všetky potrebné materiály a vykonanie týchto prác:</p>
              <ul className="text-yellow-800 space-y-1 list-disc list-inside mb-3">
                <li>montáž elektrických káblov</li>
                <li>inštalácia rozvádzača s ističmi</li>
                <li>uloženie chráničky pre prívodný vonkajší kábel</li>
                <li>montáž inštalačných krabíc pre vypínače a zásuvky (v prípade, že vnútorné dokončovacie práce realizujeme my)</li>
              </ul>
              <div className="space-y-1 pt-3 border-t border-yellow-300">
                <p className="text-red-600 font-medium">Cena neobsahuje: Montáž bleskozvodu a vydanie revíznych dokladov nie sú zahrnuté v základnej ponuke; cena týchto prác sa počíta zvlášť.</p>
                <p className="text-red-600">Montáž zásuviek, vypínačov a svietidiel môže byť vykonaná za príplatok, pričom všetky potrebné komponenty dodáva objednávateľ.</p>
                <p className="text-red-600">Vonkajšie pripojenie sa vykonáva na základe samostatnej dohody.</p>
              </div>
            </div>
            <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="elektro" 
                  checked={elektroinstalacia} 
                  onCheckedChange={setElektroinstalacia}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div>
                  <span className="font-semibold text-gray-800">Elektrická inštalácia</span>
                  <p className="text-sm text-gray-500">Rozvody, rozvádzač, zásuvky</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+ 7 400 €</span>
            </label>
          </div>

          {/* Voda a kanalizácia */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Voda a kanalizácia
            </Label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
              <p className="text-blue-900 font-medium mb-2">Montáž vodovodného a kanalizačného systému zahŕňa všetky potrebné materiály a realizáciu týchto prác:</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside mb-3">
                <li>montáž vodovodných potrubí podľa základného projektu</li>
                <li>montáž ventilov, záslepiek a pod.</li>
                <li>montáž kanalizačných potrubí podľa základného projektu</li>
                <li>kontrola tesnosti systému pod tlakom</li>
              </ul>
              <div className="space-y-1 pt-3 border-t border-blue-300">
                <p className="text-red-600 font-medium">Protokoly na uvedenie budovy do prevádzky sa poskytujú za príplatok.</p>
                <p className="text-red-600">Montáž sanitárnych a elektrických zariadení môže byť vykonaná za príplatok.</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="voda" 
                    checked={vodaKanalizacia} 
                    onCheckedChange={setVodaKanalizacia}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">Rozvody vody a kanalizácie</span>
                    <p className="text-sm text-gray-500">Príprava pre sanitárne zariadenia</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 2 380 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="sanita" 
                    checked={sanitaKomplet} 
                    onCheckedChange={setSanitaKomplet}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">Sanita komplet</span>
                    <p className="text-sm text-gray-500">Sprchový kút, umývadlo, WC misa</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 1 169 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="bojler" 
                    checked={bojler} 
                    onCheckedChange={setBojler}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">Elektrický bojler</span>
                    <p className="text-sm text-gray-500">Ohrev teplej úžitkovej vody</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 246 €</span>
              </label>
            </div>
          </div>

          {/* Vykurovanie a vetranie */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-red-500" />
              Vykurovanie a vetranie
            </Label>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${projektA0 && !tepelneCerpadlo ? 'border-amber-400 bg-amber-50' : 'border-green-300 bg-green-50/50 hover:bg-green-100'}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="cerpadlo" 
                    checked={tepelneCerpadlo} 
                    onCheckedChange={setTepelneCerpadlo}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">Tepelné čerpadlo / Klimatizácia</span>
                      <Badge className="bg-green-600 text-xs">Odporúčané pre A0</Badge>
                    </div>
                    <p className="text-sm text-gray-500">1x vonkajšia + 5x vnútorná jednotka</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 5 535 €</span>
              </label>
              <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${projektA0 && !rekuperacia ? 'border-amber-400 bg-amber-50' : 'border-green-300 bg-green-50/50 hover:bg-green-100'}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="rekuperacia" 
                    checked={rekuperacia} 
                    onCheckedChange={setRekuperacia}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">Rekuperácia</span>
                      <Badge className="bg-green-600 text-xs">Odporúčané pre A0</Badge>
                    </div>
                    <p className="text-sm text-gray-500">5ks lokálnych jednotiek</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 2 700 €</span>
              </label>
            </div>
          </div>

          {/* Pripojenie na siete */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <Cable className="w-5 h-5 text-gray-600" />
              Pripojenie na siete
            </Label>
            <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="pripojky" 
                  checked={pripojkaSiete} 
                  onCheckedChange={setPripojkaSiete}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div>
                  <span className="font-semibold text-gray-800">Pripojenie na inžinierske siete</span>
                  <p className="text-sm text-gray-500">Elektrika, voda, kanalizácia (do 10m)</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+ 1 501 €</span>
            </label>
          </div>

          {/* Úpravy okien a dverí */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <Square className="w-5 h-5 text-blue-600" />
              Okná a vstupné dvere
            </Label>
            
            {/* Vstupné dvere */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Vstupné dvere</p>
              <RadioGroup value={vstupneDvere} onValueChange={setVstupneDvere} className="space-y-2">
                <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="ziadne" id="dvere-ziadne" />
                    <span className="text-gray-800">Žiadne / Štandard v sade</span>
                  </div>
                  <span className="text-gray-400">+ 0 €</span>
                </label>
                <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="kovove" id="dvere-kovove" />
                    <span className="text-gray-800">Kovové dvere s 2 zámkami</span>
                  </div>
                  <span className="font-bold text-green-600">+ 720 €</span>
                </label>
                <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="plastove" id="dvere-plastove" />
                    <span className="text-gray-800">Plastovo-kovové dvere</span>
                  </div>
                  <span className="font-bold text-green-600">+ 660 €</span>
                </label>
              </RadioGroup>
            </div>

            {/* Rozšírenia okien */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium text-gray-600 mb-2">Doplnkové okná</p>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Square className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-800">Strešné okno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={stresneOkno} 
                      onChange={(e) => setStresneOkno(parseInt(e.target.value) || 0)}
                      className="w-16 text-center h-9"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap">× 760 €</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Square className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-800">Bočné okno (Fixné) 90x205cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoFixne} 
                      onChange={(e) => setBocneOknoFixne(parseInt(e.target.value) || 0)}
                      className="w-16 text-center h-9"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap">× 501 €</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Square className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-800">Bočné okno (Výklopno-sklopné) 90x205cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoVyklopne90} 
                      onChange={(e) => setBocneOknoVyklopne90(parseInt(e.target.value) || 0)}
                      className="w-16 text-center h-9"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap">× 540 €</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Square className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-800">Bočné okno (Výklopno-sklopné) 55x90cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoVyklopne55} 
                      onChange={(e) => setBocneOknoVyklopne55(parseInt(e.target.value) || 0)}
                      className="w-16 text-center h-9"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap">× 225 €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Laminácia a tónované sklá */}
            <div className="space-y-3 pt-4 border-t mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Úpravy okien</p>
              <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="povrch-okien" 
                    checked={povrchokaOkien} 
                    onCheckedChange={setPovrchokaOkien}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="text-gray-800">Laminácia okien - antracit</span>
                    <p className="text-xs text-gray-500">(možná je aj laminácia v iných farbách)</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 3 100 €</span>
              </label>
              <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="tonovane-skla" 
                    checked={tonovaneSkla} 
                    onCheckedChange={setTonovaneSkla}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-gray-800">Tónované sklá (Solar)</span>
                </div>
                <span className="font-bold text-green-600">+ 1 300 €</span>
              </label>
            </div>
          </div>

        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 3: DOM NA KĽÚČ (Interiér, Podlahy, Fasáda, Dokončenie)
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <SectionHeader 
          icon={Key} 
          title="Dom na kľúč" 
          subtitle="Interiérové úpravy a dokončovacie práce"
          color="from-emerald-600 to-teal-600"
          step="3"
        />
        <div className="p-6 space-y-6 bg-gradient-to-b from-emerald-50/50 to-white">

          {/* Vonkajšia fasáda */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-emerald-600" />
              Vonkajšia fasáda
            </Label>
            <p className="text-sm text-gray-500 mb-4">Drevo / Falcovaný plech anthracit - podľa modelu domu - bez príplatku</p>
            <RadioGroup value={vonkajsiaFasada} onValueChange={setVonkajsiaFasada} className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="standard" id="fasada-standard" />
                  <span className="font-semibold text-gray-800">Štandard (Drevo / Falcovaný plech)</span>
                </div>
                <span className="text-gray-400 font-medium">+ 0 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="suchana" id="fasada-suchana" />
                  <span className="font-semibold text-gray-800">Škúchaná fasáda - individuálne nacenenie</span>
                </div>
                <span className="font-bold text-green-600">+ 12 841 €</span>
              </label>
            </RadioGroup>
          </div>

          {/* Interiér finiš */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-600" />
              Interiér finiš - úpravy stien, montáž priečky
            </Label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm text-gray-700">
              <p className="mb-2">Montáž priečok podľa základného projektu, montáž izolačného materiálu a obklad všetkých stien drevom.</p>
              <p className="mb-2">Do ceny sú zahrnuté montážne práce a všetok potrebný materiál na ich vykonanie: drevený hranol, izolačný materiál s hrúbkou 100 mm, parozábranová membrána, tatranský profil s hrúbkou 8–12 mm.</p>
              <p className="mb-2">Maľovanie stien a maliarske materiály nie sú zahrnuté v cene.</p>
              <p className="mb-2">Farbu zabezpečuje klient.</p>
              <p className="text-red-600 font-medium mb-2">Maľovanie sa účtuje zvlášť na základe skutočne namaľovanej plochy, sadzbou 4,5 € za meter štvorcový.</p>
              <p>Akákoľvek zmena typu povrchovej úpravy (napríklad montáž sadrokartónu, kladenie obkladov a pod.) sa rieši samostatne.</p>
            </div>
            <RadioGroup value={interierFinis} onValueChange={setInterierFinis} className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="ziadne" id="interier-ziadne" />
                  <div>
                    <span className="font-semibold text-gray-800">Nie</span>
                    <p className="text-sm text-gray-500">Dom zostane v štádiu hrubej stavby</p>
                  </div>
                </div>
                <span className="text-gray-400 font-medium">+ 0 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="drevo" id="interier-drevo" />
                  <span className="font-semibold text-gray-800">Obloženie drevom 12mm</span>
                </div>
                <span className="font-bold text-green-600">+ 16 400 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="sadrokarton" id="interier-sadrokarton" />
                  <span className="font-semibold text-gray-800">Sádrokartón</span>
                </div>
                <span className="font-bold text-green-600">+ 19 475 €</span>
              </label>
            </RadioGroup>
          </div>

          {/* Podlahy a vykurovanie */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <Square className="w-5 h-5 text-emerald-600" />
              Podlahy a podlahové vykurovanie
            </Label>
            <div className="space-y-4">
              <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="vnutorne-podlahy" 
                      checked={vnutornePodlahy} 
                      onCheckedChange={setVnutornePodlahy}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-800">Vnútorné podlahy - laminát - cena je za základný typ</span>
                      <p className="text-sm text-gray-500">Môže sa líšiť podľa výberu zákazníka</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 whitespace-nowrap">+ 3 351 €</span>
                </label>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                  <p className="text-red-600 font-medium">Vnútorné podlahy, montáž laminátu s cenou do 10 € za meter štvorcový na celej podlahovej ploche domu:</p>
                  <p className="text-red-600">- podlahová krytina môže byť dodaná objednávateľom; v takom prípade sa z cenovej ponuky odpočíta suma rovná ploche podlahy vynásobenej 10 €</p>
                  <p className="text-red-600">- orientačná cena pokládky: laminát od 10 €/m², dlažba od 25 €/m²</p>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="podlahove-vykurovanie" 
                      checked={podlahovVykurovanie} 
                      onCheckedChange={setPodlahovVykurovanie}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Elektrické podlahové vykurovanie s WiFi termostatom
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 whitespace-nowrap">+ 5 525 €</span>
                </label>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                  <p className="font-medium text-gray-700">Wi-Fi termostat do každej izby (8-9 ks)</p>
                  <p>Cena zahŕňa komplet: Vykurovacia fólia 1m a 0,5m, Vodič, LDPE 0.2 parozábranná fólia, izolácia pod vykurovacou fóliou XPS 500-700, Konektory, Uzemňovacia sieťka, Termostaty, Práca + Doprava</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interiérové dvere */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-emerald-600" />
              Interiérové dvere
            </Label>
            <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
              <div>
                <span className="font-semibold text-gray-800">Interiérové dvere, cena za 1 kus od</span>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="0" 
                  value={interieroveDvere} 
                  onChange={(e) => setInterieroveDvere(parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <span className="font-bold text-green-600">× 250 € <span className="text-xs text-gray-500">s DPH</span></span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
              <p className="text-gray-700 font-medium">Interiérové dvere, сena jednej sady od 190 eur.</p>
              <p className="text-gray-600">- dvere môžu byť zabezpečené zákazníkom</p>
              <p className="text-gray-600">- cena za inštaláciu jedných dverí od 60 €</p>
            </div>
          </div>

          {/* Doplnky */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <Maximize className="w-5 h-5 text-emerald-600" />
              Doplnky exteriéru
            </Label>
            <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="pergola" 
                  checked={pergola} 
                  onCheckedChange={setPergola}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="font-semibold text-gray-800">Dekoratívna pergola na konektory</span>
              </div>
              <span className="font-bold text-green-600">+ 1 845 €</span>
            </label>
          </div>

        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 4: DOKUMENTÁCIA A DOPRAVA
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <SectionHeader 
          icon={FileText} 
          title="Dokumentácia a služby" 
          subtitle="Projektová dokumentácia, povolenia a doprava"
          color="from-purple-600 to-violet-600"
          step="4"
        />
        <div className="p-6 space-y-6 bg-gradient-to-b from-purple-50/50 to-white">

          {/* Dokumentácia */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Projektová dokumentácia
            </Label>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="inziniering" 
                    checked={inziniering} 
                    onCheckedChange={setInziniering}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">Inžiniering stavebného povolenia</span>
                    <p className="text-sm text-gray-500">Vybavenie všetkých povolení</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 2 592 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-green-400 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="projekt" 
                    checked={projektA0} 
                    onCheckedChange={setProjektA0}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">Projektant a Energetická certifikácia</span>
                      <Badge className="bg-green-600">A0</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Kompletná projektová dokumentácia + certifikát A0</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 3 500 €</span>
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="revizna" 
                    checked={revizna} 
                    onCheckedChange={setRevizna}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">Kompletná revízna dokumentácia k stavbe</span>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 1 000 €</span>
              </label>
            </div>
          </div>

          {/* A0 Upozornenie */}
          {a0Odporucania && (
            <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 mb-2">
                    Pre splnenie normy A0 odporúčame doplniť:
                  </p>
                  <ul className="space-y-1">
                    {a0Odporucania.map((item, index) => (
                      <li key={index} className="text-amber-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
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
            <div className="p-5 bg-green-50 border-2 border-green-300 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="font-bold text-green-800">
                  Výborne! Vaša konfigurácia spĺňa požiadavky pre energetickú triedu A0.
                </p>
              </div>
            </div>
          )}

          {/* Doprava */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <Label className="text-lg font-bold text-gray-800 mb-4 block flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Doprava
            </Label>
            <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="doprava" 
                  checked={doprava} 
                  onCheckedChange={setDoprava}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="font-semibold text-gray-800">Doprava</span>
              </div>
              <span className="text-gray-400 font-medium">+ 0 €</span>
            </label>
          </div>

        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINÁLNY CENOVÝ SÚHRN
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Flat double, 142m²</h3>
              <p className="text-slate-400">Vaša vlastná konfigurácia</p>
              {projektA0 && !a0Odporucania && (
                <Badge className="bg-green-500 text-white mt-3 text-sm py-1 px-3">✓ Spĺňa normu A0</Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-400 mb-1">Celková odhadovaná cena</p>
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {formatPrice(totalPrice)}
              </p>
              <p className="text-slate-500 text-sm mt-1">s DPH</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalPrice}`}>
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg px-10 py-6 w-full sm:w-auto shadow-xl shadow-green-500/25">
                <Send className="mr-2 w-5 h-5" />
                Mám záujem o túto konfiguráciu
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}