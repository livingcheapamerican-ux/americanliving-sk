import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Send, AlertTriangle, CheckCircle, Calculator, RotateCcw, Leaf
} from "lucide-react";

export default function KonfiguratorFlatDoubleInline({ dom }) {
  // Základná cena bez DPH
  const BASE_PRICE_BEZ_DPH = 49512;
  const DPH_RATE = 1.23;

  // Defaultné hodnoty
  const defaultConfig = {
    montaz: false,
    vstupneDvere: "standard",
    zaklady: "bez",
    pilotyVyrovnanie: false,
    pilotyMontaz: false,
    pilotyDopravaZeriav: false,
    izolacia: "standard",
    elektroinstalacia: false,
    voda: false,
    pisoarWc: false,
    umyvadloSprcha: false,
    bojler80l: false,
    podlahovka: false,
    rekuperacia: false,
    klimatizacia: false,
    interierDrevo: false,
    interierSadrokarton: false,
    exterierDrevo: false,
    oknaAntracit: false,
    podlahyLaminat: false,
    kuchynskaLinka: false,
    dokumentaciaProjekt: false,
    inziniering: false,
    doprava: false
  };

  const [config, setConfig] = useState(defaultConfig);

  // Cenník (bez DPH) - hodnoty z HTML sú v skutočnosti s DPH, takže delíme 1.23
  // Poznámka: Ceny v HTML boli mylne označené ako "bez DPH", ale boli to ceny s DPH
  const CENY = {
    montaz: 14871.93,           // z HTML: 14 871,93 € (s DPH) -> toto JE cena s DPH, bez DPH = 12091
    vstupneDvere: { standard: 0, kovove: 590.40, plastove: 541.20 },  // z HTML: 590,40 a 541,20 sú s DPH
    zaklady: { bez: 0, piloty: 7537.44, pasove: 21943.20, doska: 28216.20 },  // z HTML s DPH
    pilotyVyrovnanie: 2479.68,  // z HTML: 2 479,68 € (s DPH)
    pilotyMontaz: 1771.20,      // z HTML: 1 771,20 € (s DPH)
    pilotyDopravaZeriav: 885.60, // z HTML: 885,60 € (s DPH)
    izolacia: { standard: 0, steny250: 5999.94, steny300: 7499.31 },  // z HTML s DPH
    elektroinstalacia: 7380,    // z HTML: 7 380 € (s DPH)
    voda: 1869.60,              // z HTML: 1 869,60 € (s DPH)
    pisoarWc: 560.88,           // z HTML: 560,88 € (s DPH)
    umyvadloSprcha: 934.80,     // z HTML: 934,80 € (s DPH)
    bojler80l: 393.60,          // z HTML: 393,60 € (s DPH)
    podlahovka: 5166,           // z HTML: 5 166 € (s DPH)
    rekuperacia: 2699.85,       // z HTML: 2 699,85 € (s DPH)
    klimatizacia: 2499.36,      // z HTML: 2 499,36 € (s DPH)
    interierDrevo: 11999.88,    // z HTML: 11 999,88 € (s DPH)
    interierSadrokarton: 9999.90, // z HTML: 9 999,90 € (s DPH)
    exterierDrevo: 6999.93,     // z HTML: 6 999,93 € (s DPH)
    oknaAntracit: 1799.49,      // z HTML: 1 799,49 € (s DPH)
    podlahyLaminat: 3999.96,    // z HTML: 3 999,96 € (s DPH)
    kuchynskaLinka: 4999.95,    // z HTML: 4 999,95 € (s DPH)
    dokumentaciaProjekt: 5999.94, // z HTML: 5 999,94 € (s DPH)
    inziniering: 1999.98,       // z HTML: 1 999,98 € (s DPH)
    doprava: 2699.85            // z HTML: 2 699,85 € (s DPH)
  };

  // Výpočet ceny - ceny v CENY sú S DPH, počítame total s DPH a potom bez DPH
  const { totalBezDPH, totalSDPH } = useMemo(() => {
    let totalSDPHCalc = BASE_PRICE_BEZ_DPH * DPH_RATE; // Základná cena s DPH
    
    if (config.montaz) totalSDPHCalc += CENY.montaz;
    totalSDPHCalc += CENY.vstupneDvere[config.vstupneDvere] || 0;
    totalSDPHCalc += CENY.zaklady[config.zaklady] || 0;
    
    if (config.zaklady === "piloty") {
      if (config.pilotyVyrovnanie) totalSDPHCalc += CENY.pilotyVyrovnanie;
      if (config.pilotyMontaz) totalSDPHCalc += CENY.pilotyMontaz;
      if (config.pilotyDopravaZeriav) totalSDPHCalc += CENY.pilotyDopravaZeriav;
    }
    
    totalSDPHCalc += CENY.izolacia[config.izolacia] || 0;
    
    if (config.elektroinstalacia) totalSDPHCalc += CENY.elektroinstalacia;
    if (config.voda) totalSDPHCalc += CENY.voda;
    if (config.pisoarWc) totalSDPHCalc += CENY.pisoarWc;
    if (config.umyvadloSprcha) totalSDPHCalc += CENY.umyvadloSprcha;
    if (config.bojler80l) totalSDPHCalc += CENY.bojler80l;
    if (config.podlahovka) totalSDPHCalc += CENY.podlahovka;
    if (config.rekuperacia) totalSDPHCalc += CENY.rekuperacia;
    if (config.klimatizacia) totalSDPHCalc += CENY.klimatizacia;
    if (config.interierDrevo) totalSDPHCalc += CENY.interierDrevo;
    if (config.interierSadrokarton) totalSDPHCalc += CENY.interierSadrokarton;
    if (config.exterierDrevo) totalSDPHCalc += CENY.exterierDrevo;
    if (config.oknaAntracit) totalSDPHCalc += CENY.oknaAntracit;
    if (config.podlahyLaminat) totalSDPHCalc += CENY.podlahyLaminat;
    if (config.kuchynskaLinka) totalSDPHCalc += CENY.kuchynskaLinka;
    if (config.dokumentaciaProjekt) totalSDPHCalc += CENY.dokumentaciaProjekt;
    if (config.inziniering) totalSDPHCalc += CENY.inziniering;
    if (config.doprava) totalSDPHCalc += CENY.doprava;
    
    return {
      totalBezDPH: Math.round(totalSDPHCalc / DPH_RATE * 100) / 100,
      totalSDPH: Math.round(totalSDPHCalc * 100) / 100
    };
  }, [config]);

  // A0 kontrola
  const isA0Ready = useMemo(() => {
    return (
      (config.izolacia === "steny250" || config.izolacia === "steny300") &&
      config.rekuperacia &&
      config.klimatizacia &&
      config.dokumentaciaProjekt
    );
  }, [config]);

  const a0Missing = useMemo(() => {
    const missing = [];
    if (config.izolacia === "standard") missing.push("Dodatočná izolácia (250mm alebo 300mm)");
    if (!config.rekuperacia) missing.push("Rekuperácia");
    if (!config.klimatizacia) missing.push("Klimatizácia s tepelným čerpadlom");
    if (!config.dokumentaciaProjekt) missing.push("Projektová dokumentácia");
    return missing;
  }, [config]);

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Komponenta pre checkbox položku - priceSDPH je cena S DPH (ako je v cenníku)
  const OptionCheckbox = ({ id, label, priceSDPH, checked, onChange, isA0, disabled, description }) => {
    const priceBezDPH = Math.round(priceSDPH / DPH_RATE * 100) / 100;
    return (
      <div className={`flex items-start justify-between p-3 rounded-lg border ${isA0 ? 'bg-green-50 border-l-4 border-l-green-500' : 'bg-white'} ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor={id} className={`cursor-pointer font-medium ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>
              {label}
              {isA0 && <Leaf className="inline w-4 h-4 ml-2 text-green-600" />}
            </Label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
        {priceSDPH > 0 && (
          <div className="text-right ml-4">
            <div className="font-semibold text-green-600">+{formatPrice(priceBezDPH)} <span className="text-xs font-normal">(bez DPH)</span></div>
            <div className="text-sm text-gray-500">+{formatPrice(priceSDPH)} <span className="text-xs">(s DPH)</span></div>
          </div>
        )}
      </div>
    );
  };

  // Komponenta pre radio položku - priceSDPH je cena S DPH (ako je v cenníku)
  const OptionRadio = ({ name, value, label, priceSDPH, selected, onChange, isA0 }) => {
    const priceBezDPH = Math.round(priceSDPH / DPH_RATE * 100) / 100;
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${isA0 ? 'bg-green-50 border-l-4 border-l-green-500' : 'bg-white'} ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name={name}
            value={value}
            checked={selected}
            onChange={() => onChange(value)}
            className="w-4 h-4 text-blue-600"
          />
          <Label className="cursor-pointer font-medium text-gray-800">
            {label}
            {isA0 && <Leaf className="inline w-4 h-4 ml-2 text-green-600" />}
          </Label>
        </div>
        {priceSDPH > 0 ? (
          <div className="text-right">
            <div className="font-semibold text-green-600">+{formatPrice(priceBezDPH)} <span className="text-xs font-normal">(bez DPH)</span></div>
            <div className="text-sm text-gray-500">+{formatPrice(priceSDPH)} <span className="text-xs">(s DPH)</span></div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Zahrnuté v cene</span>
        )}
      </div>
    );
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
          Základná konfigurácia domu za <strong>{formatPrice(BASE_PRICE_BEZ_DPH * DPH_RATE)} s DPH</strong> ({formatPrice(BASE_PRICE_BEZ_DPH)} bez DPH) je sada stavebnice pre svojpomocnú montáž.
        </p>
        <p className="font-semibold text-blue-800 mt-2">Obsah základnej stavebnice:</p>
        <ul className="list-disc list-inside text-blue-800 text-sm mt-1 space-y-1">
          <li>Nosná prefabrikovaná konštrukcia (steny, strecha, podlaha).</li>
          <li>Základná tepelná izolácia (150mm steny/strecha, 200mm podlaha).</li>
          <li>Strešná krytina (falcovaný plech) a vonkajší plášť (plechová fasáda).</li>
          <li>Okná (plastové, 3-sklo) a vchodové dvere (plastové) podľa projektu.</li>
          <li>Kompletná revízna dokumentácia (povinná položka).</li>
        </ul>
      </div>

      {/* Cenový display */}
      <div className="bg-gray-100 border-l-4 border-blue-500 rounded-lg p-5 mb-8 text-right">
        <div className="text-gray-600">Celková cena bez DPH</div>
        <div className="text-2xl font-bold text-gray-800">{formatPrice(totalBezDPH)}</div>
        <div className="text-gray-600 mt-3">Celková cena s 23% DPH</div>
        <div className="text-2xl font-bold text-gray-800">{formatPrice(totalSDPH)}</div>
      </div>

      {/* SEKCIA 1: Hrubá Stavba a Exteriér */}
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 mt-8">
        Časť 1: Hrubá Stavba a Exteriér
      </h2>

      {/* Základné prvky */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Základné Prvky</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="montaz"
            label="Cena montáže holodomu"
            priceSDPH={CENY.montaz}
            checked={config.montaz}
            onChange={(checked) => updateConfig('montaz', checked)}
          />
          
          <div className="mt-4">
            <p className="font-medium text-gray-700 mb-2">Vstupné dvere:</p>
            <div className="space-y-2">
              <OptionRadio
                name="vstupneDvere"
                value="standard"
                label="Štandardné dvere (zahrnuté v cene)"
                priceSDPH={0}
                selected={config.vstupneDvere === "standard"}
                onChange={(v) => updateConfig('vstupneDvere', v)}
              />
              <OptionRadio
                name="vstupneDvere"
                value="kovove"
                label="Vstupné dvere: Kovové s 2 zámkami"
                priceSDPH={CENY.vstupneDvere.kovove}
                selected={config.vstupneDvere === "kovove"}
                onChange={(v) => updateConfig('vstupneDvere', v)}
              />
              <OptionRadio
                name="vstupneDvere"
                value="plastove"
                label="Vstupné dvere: Plastovo-kovové"
                priceSDPH={CENY.vstupneDvere.plastove}
                selected={config.vstupneDvere === "plastove"}
                onChange={(v) => updateConfig('vstupneDvere', v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Základy */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Základy</h3>
        <div className="space-y-2">
          <OptionRadio
            name="zaklady"
            value="bez"
            label="Bez základov"
            priceSDPH={0}
            selected={config.zaklady === "bez"}
            onChange={(v) => updateConfig('zaklady', v)}
          />
          <OptionRadio
            name="zaklady"
            value="piloty"
            label="Pilóty alebo pätky"
            priceSDPH={CENY.zaklady.piloty}
            selected={config.zaklady === "piloty"}
            onChange={(v) => updateConfig('zaklady', v)}
          />
          <OptionRadio
            name="zaklady"
            value="pasove"
            label="Pásové základy"
            priceSDPH={CENY.zaklady.pasove}
            selected={config.zaklady === "pasove"}
            onChange={(v) => updateConfig('zaklady', v)}
          />
          <OptionRadio
            name="zaklady"
            value="doska"
            label="Základová doska"
            priceSDPH={CENY.zaklady.doska}
            selected={config.zaklady === "doska"}
            onChange={(v) => updateConfig('zaklady', v)}
          />
        </div>

        {/* Dodatočné možnosti pre pilóty */}
        {config.zaklady === "piloty" && (
          <div className="mt-4 ml-6 space-y-2 border-l-2 border-gray-300 pl-4">
            <OptionCheckbox
              id="pilotyVyrovnanie"
              label="Vyrovnanie terénu"
              priceSDPH={CENY.pilotyVyrovnanie}
              checked={config.pilotyVyrovnanie}
              onChange={(checked) => updateConfig('pilotyVyrovnanie', checked)}
            />
            <OptionCheckbox
              id="pilotyMontaz"
              label="Montáž pilót"
              priceSDPH={CENY.pilotyMontaz}
              checked={config.pilotyMontaz}
              onChange={(checked) => updateConfig('pilotyMontaz', checked)}
            />
            <OptionCheckbox
              id="pilotyDopravaZeriav"
              label="Doprava a žeriav"
              priceSDPH={CENY.pilotyDopravaZeriav}
              checked={config.pilotyDopravaZeriav}
              onChange={(checked) => updateConfig('pilotyDopravaZeriav', checked)}
            />
          </div>
        )}
      </div>

      {/* A0 Info Box */}
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
          <Leaf className="w-5 h-5" />
          Dôležité upozornenie pre Kolaudáciu a Certifikát A0
        </h3>
        <p className="text-green-800 mt-2">
          Pokiaľ si želáte, aby Váš dom spĺňal požiadavky pre energetický certifikát <strong>A0</strong>, je nevyhnutné v konfigurácii zvoliť:
        </p>
        <ul className="list-disc list-inside text-green-800 mt-2 space-y-1">
          <li><strong>všetky položky</strong>, ktoré sú označené zelenou farbou,</li>
          <li>pri dodatočnej izolácii <strong>jednu z možností</strong> taktiež v zelenom rámčeku (250mm alebo 300mm).</li>
        </ul>
      </div>

      {/* SEKCIA 2: Kolaudácia a Energetický Certifikát */}
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 mt-8">
        Časť 2: Kolaudácia a Energetický Certifikát
      </h2>

      {/* Dodatočná izolácia */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Dodatočná Izolácia (Pre normu A0)</h3>
        <div className="space-y-2">
          <OptionRadio
            name="izolacia"
            value="standard"
            label="Štandardná izolácia (zahrnuté v cene)"
            priceSDPH={0}
            selected={config.izolacia === "standard"}
            onChange={(v) => updateConfig('izolacia', v)}
          />
          <OptionRadio
            name="izolacia"
            value="steny250"
            label="Izolácia stien 250mm (spĺňa A0)"
            priceSDPH={CENY.izolacia.steny250}
            selected={config.izolacia === "steny250"}
            onChange={(v) => updateConfig('izolacia', v)}
            isA0={true}
          />
          <OptionRadio
            name="izolacia"
            value="steny300"
            label="Izolácia stien 300mm (spĺňa A0+)"
            priceSDPH={CENY.izolacia.steny300}
            selected={config.izolacia === "steny300"}
            onChange={(v) => updateConfig('izolacia', v)}
            isA0={true}
          />
        </div>
      </div>

      {/* Technológie */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Technológie</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="rekuperacia"
            label="Rekuperácia (povinné pre A0)"
            priceSDPH={CENY.rekuperacia}
            checked={config.rekuperacia}
            onChange={(checked) => updateConfig('rekuperacia', checked)}
            isA0={true}
          />
          <OptionCheckbox
            id="klimatizacia"
            label="Klimatizácia s tepelným čerpadlom (povinné pre A0)"
            priceSDPH={CENY.klimatizacia}
            checked={config.klimatizacia}
            onChange={(checked) => updateConfig('klimatizacia', checked)}
            isA0={true}
          />
        </div>
      </div>

      {/* Dokumentácia */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Dokumentácia</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="dokumentaciaProjekt"
            label="Projektová dokumentácia pre A0"
            priceSDPH={CENY.dokumentaciaProjekt}
            checked={config.dokumentaciaProjekt}
            onChange={(checked) => updateConfig('dokumentaciaProjekt', checked)}
            isA0={true}
          />
          <OptionCheckbox
            id="inziniering"
            label="Inžiniering (stavebné povolenie)"
            priceSDPH={CENY.inziniering}
            checked={config.inziniering}
            onChange={(checked) => updateConfig('inziniering', checked)}
          />
        </div>
      </div>

      {/* SEKCIA 3: Interiér a Inštalácie */}
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 mt-8">
        Časť 3: Interiér a Inštalácie
      </h2>

      {/* Elektrika */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Elektroinštalácia</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="elektroinstalacia"
            label="Kompletná elektroinštalácia"
            priceSDPH={CENY.elektroinstalacia}
            checked={config.elektroinstalacia}
            onChange={(checked) => updateConfig('elektroinstalacia', checked)}
            description="Rozvodová skriňa, zásuvky, osvetlenie, vypínače"
          />
        </div>
      </div>

      {/* Voda a sanita */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Voda a Sanita</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="voda"
            label="Rozvody vody a kanalizácie"
            priceSDPH={CENY.voda}
            checked={config.voda}
            onChange={(checked) => updateConfig('voda', checked)}
          />
          <OptionCheckbox
            id="pisoarWc"
            label="Pisoár a WC"
            priceSDPH={CENY.pisoarWc}
            checked={config.pisoarWc}
            onChange={(checked) => updateConfig('pisoarWc', checked)}
            disabled={!config.voda}
          />
          <OptionCheckbox
            id="umyvadloSprcha"
            label="Umývadlo a sprchový kút"
            priceSDPH={CENY.umyvadloSprcha}
            checked={config.umyvadloSprcha}
            onChange={(checked) => updateConfig('umyvadloSprcha', checked)}
            disabled={!config.voda}
          />
          <OptionCheckbox
            id="bojler80l"
            label="Bojler 80L"
            priceSDPH={CENY.bojler80l}
            checked={config.bojler80l}
            onChange={(checked) => updateConfig('bojler80l', checked)}
            disabled={!config.voda}
          />
        </div>
      </div>

      {/* Vykurovanie */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Vykurovanie</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="podlahovka"
            label="Podlahové vykurovanie"
            priceSDPH={CENY.podlahovka}
            checked={config.podlahovka}
            onChange={(checked) => updateConfig('podlahovka', checked)}
          />
        </div>
      </div>

      {/* Povrchové úpravy */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Povrchové úpravy</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="interierDrevo"
            label="Interiér - Drevené obloženie"
            priceSDPH={CENY.interierDrevo}
            checked={config.interierDrevo}
            onChange={(checked) => {
              updateConfig('interierDrevo', checked);
              if (checked) updateConfig('interierSadrokarton', false);
            }}
          />
          <OptionCheckbox
            id="interierSadrokarton"
            label="Interiér - Sadrokartón"
            priceSDPH={CENY.interierSadrokarton}
            checked={config.interierSadrokarton}
            onChange={(checked) => {
              updateConfig('interierSadrokarton', checked);
              if (checked) updateConfig('interierDrevo', false);
            }}
          />
          <OptionCheckbox
            id="exterierDrevo"
            label="Exteriér - Drevená fasáda"
            priceSDPH={CENY.exterierDrevo}
            checked={config.exterierDrevo}
            onChange={(checked) => updateConfig('exterierDrevo', checked)}
          />
          <OptionCheckbox
            id="oknaAntracit"
            label="Okná v antracitovej farbe"
            priceSDPH={CENY.oknaAntracit}
            checked={config.oknaAntracit}
            onChange={(checked) => updateConfig('oknaAntracit', checked)}
          />
          <OptionCheckbox
            id="podlahyLaminat"
            label="Podlahy - Laminát"
            priceSDPH={CENY.podlahyLaminat}
            checked={config.podlahyLaminat}
            onChange={(checked) => updateConfig('podlahyLaminat', checked)}
          />
        </div>
      </div>

      {/* Kuchyňa */}
      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Kuchyňa</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="kuchynskaLinka"
            label="Kuchynská linka"
            priceSDPH={CENY.kuchynskaLinka}
            checked={config.kuchynskaLinka}
            onChange={(checked) => updateConfig('kuchynskaLinka', checked)}
          />
        </div>
      </div>

      {/* SEKCIA 4: Doprava */}
      <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 mt-8">
        Časť 4: Doprava
      </h2>

      <div className="border rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Doprava a Montáž</h3>
        <div className="space-y-3">
          <OptionCheckbox
            id="doprava"
            label="Doprava na miesto stavby"
            priceBezDPH={2195}
            checked={config.doprava}
            onChange={(checked) => updateConfig('doprava', checked)}
            description="Vrátane vyloženia a manipulácie"
          />
        </div>
      </div>

      {/* A0 Status */}
      {isA0Ready ? (
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-green-700">✓ Konfigurácia spĺňa normu A0</h3>
              <p className="text-green-600">Váš dom je pripravený na získanie energetického certifikátu A0.</p>
            </div>
          </div>
        </div>
      ) : a0Missing.length > 0 && (config.izolacia !== "standard" || config.rekuperacia || config.klimatizacia || config.dokumentaciaProjekt) && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-amber-700">Pre splnenie normy A0 ešte chýba:</h3>
              <ul className="list-disc list-inside text-amber-700 mt-2">
                {a0Missing.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Finálny cenový súhrn */}
      <div className="bg-gray-800 text-white rounded-xl p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Flat double, 142m²</h3>
            {isA0Ready && (
              <Badge className="bg-green-500 text-white mt-2">✓ Spĺňa A0</Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-gray-400">Celková cena bez DPH</div>
            <div className="text-2xl font-bold">{formatPrice(totalBezDPH)}</div>
            <div className="text-gray-400 mt-2">Celková cena s 23% DPH</div>
            <div className="text-3xl font-bold text-green-400">{formatPrice(totalSDPH)}</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalSDPH}`}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 w-full sm:w-auto">
              <Send className="mr-2 w-5 h-5" />
              Odoslať dopyt
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}