import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, Info, CheckCircle, AlertCircle } from "lucide-react";

export default function PriceCalculatorTicabhouse({ dom, onPriceChange }) {
  const [konfig, setKonfig] = useState({
    // A0 položky
    izolacie_steny: "150mm",
    izolacie_podlaha: "150mm",
    okna_profil: "standard",
    tepelne_cerpadlo: false,
    rekuperacia: false,
    projektova_dok_rd: false,
    energeticky_cert: false,
    
    // R položky
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

  const cennik = {
    izolacie_steny: { "150mm": 0, "200mm": 3000, "250mm": 5000 },
    izolacie_podlaha: { "150mm": 0, "200mm": 2500 },
    okna_profil: { standard: 0, premium: 3500, hlinik: 6000 },
    tepelne_cerpadlo: 9000,
    rekuperacia: 4500,
    projektova_dok_rd: 2107,
    energeticky_cert: 3500,
    montaz: 7000,
    zaklady: { bez: 0, skrutky: 5000, pasove: 15000, doska: 18000 },
    elektroinst: 3500,
    vodoinst: 2500,
    kanalizacia: 2000,
    klimatizacia: 2800,
    krb: 4500,
    fotovoltika: 15000,
    fasada: { standard: 0, thermowood: 8000, smrekovec: 5000, kompozit: 12000, omietka: 7000 },
    interiér: { standard: 0, sadrokarton: 4000 },
    podlaha: { standard: 0, vinyl: 2500, drevo: 5000 },
    kuchynska_linka: 3000,
    sanita_upgrade: 1500,
    terasa: 6000
  };

  const vypocitatCenu = () => {
    let celkovaCena = dom.zakladna_cena || 0;

    celkovaCena += cennik.izolacie_steny[konfig.izolacie_steny] || 0;
    celkovaCena += cennik.izolacie_podlaha[konfig.izolacie_podlaha] || 0;
    celkovaCena += cennik.okna_profil[konfig.okna_profil] || 0;
    if (konfig.tepelne_cerpadlo) celkovaCena += cennik.tepelne_cerpadlo;
    if (konfig.rekuperacia) celkovaCena += cennik.rekuperacia;
    if (konfig.projektova_dok_rd) celkovaCena += cennik.projektova_dok_rd;
    if (konfig.energeticky_cert) celkovaCena += cennik.energeticky_cert;
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

  useEffect(() => {
    onPriceChange(vypocitatCenu());
  }, [konfig]);

  return (
    <Card className="p-6 bg-white shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black">Kalkulačka ceny</h3>
          <p className="text-sm font-semibold text-black">Vypočítajte si orientačnú cenu</p>
        </div>
      </div>

      {/* Dynamický status */}
      {jeA0() ? (
        <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-800 text-sm mb-1">✅ Status: Rodinný dom A0</h4>
              <p className="text-xs text-green-700">
                Vaša konfigurácia spĺňa požiadavky pre energetický certifikát A0.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm mb-1">⚠️ Status: Rekreačná stavba</h4>
              <p className="text-xs text-amber-700 mb-2">Pre A0 chýba:</p>
              <ul className="text-xs text-amber-700 space-y-0.5">
                {chybajuceA0().slice(0, 3).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {/* Základná cena */}
        <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-black text-sm">Základná cena</span>
            <span className="text-base font-bold text-blue-700">
              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
            </span>
          </div>
        </div>

        {/* A. Energetický štandard */}
        <div className="border-t-2 border-gray-300 pt-4">
          <h4 className="font-bold text-black mb-3 text-sm">A. Energetický štandard</h4>
          
          {/* Izolácia stien */}
          <div className="border-l-4 border-blue-500 pl-3 mb-3 bg-blue-50 p-2 rounded">
            <Label className="text-xs font-semibold mb-2 block flex items-center gap-2">
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
              Izolácia stien
            </Label>
            <RadioGroup value={konfig.izolacie_steny} onValueChange={(value) => setKonfig({...konfig, izolacie_steny: value})}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="150mm" id="st-150" />
                    <Label htmlFor="st-150" className="cursor-pointer text-xs">150mm</Label>
                  </div>
                  <span className="text-xs text-gray-600">Zahrnuté</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="200mm" id="st-200" />
                    <Label htmlFor="st-200" className="cursor-pointer text-xs font-semibold">200mm</Label>
                  </div>
                  <span className="text-xs text-blue-700 font-bold">+{cennik.izolacie_steny["200mm"].toLocaleString('sk-SK')} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="250mm" id="st-250" />
                    <Label htmlFor="st-250" className="cursor-pointer text-xs font-semibold">250mm</Label>
                  </div>
                  <span className="text-xs text-blue-700 font-bold">+{cennik.izolacie_steny["250mm"].toLocaleString('sk-SK')} €</span>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Izolácia podlahy */}
          <div className="border-l-4 border-blue-500 pl-3 mb-3 bg-blue-50 p-2 rounded">
            <Label className="text-xs font-semibold mb-2 block flex items-center gap-2">
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
              Izolácia podlahy
            </Label>
            <RadioGroup value={konfig.izolacie_podlaha} onValueChange={(value) => setKonfig({...konfig, izolacie_podlaha: value})}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="150mm" id="pod-150" />
                    <Label htmlFor="pod-150" className="cursor-pointer text-xs">150mm</Label>
                  </div>
                  <span className="text-xs text-gray-600">Zahrnuté</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="200mm" id="pod-200" />
                    <Label htmlFor="pod-200" className="cursor-pointer text-xs font-semibold">200mm+</Label>
                  </div>
                  <span className="text-xs text-blue-700 font-bold">+{cennik.izolacie_podlaha["200mm"].toLocaleString('sk-SK')} €</span>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Okná */}
          <div className="border-l-4 border-blue-500 pl-3 mb-3 bg-blue-50 p-2 rounded">
            <Label className="text-xs font-semibold mb-2 block flex items-center gap-2">
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
              Okná
            </Label>
            <RadioGroup value={konfig.okna_profil} onValueChange={(value) => setKonfig({...konfig, okna_profil: value})}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="standard" id="okna-std" />
                    <Label htmlFor="okna-std" className="cursor-pointer text-xs">Štandardné</Label>
                  </div>
                  <span className="text-xs text-gray-600">Zahrnuté</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="premium" id="okna-prem" />
                    <Label htmlFor="okna-prem" className="cursor-pointer text-xs font-semibold">Premium</Label>
                  </div>
                  <span className="text-xs text-blue-700 font-bold">+{cennik.okna_profil.premium.toLocaleString('sk-SK')} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="hlinik" id="okna-hlin" />
                    <Label htmlFor="okna-hlin" className="cursor-pointer text-xs font-semibold">Hliník</Label>
                  </div>
                  <span className="text-xs text-blue-700 font-bold">+{cennik.okna_profil.hlinik.toLocaleString('sk-SK')} €</span>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Tepelné čerpadlo */}
          <div className="border-l-4 border-blue-500 pl-3 mb-2 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={konfig.tepelne_cerpadlo}
                  onCheckedChange={(checked) => setKonfig({...konfig, tepelne_cerpadlo: checked})}
                  id="tep"
                />
                <Label htmlFor="tep" className="cursor-pointer text-xs font-semibold flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
                  Tepelné čerpadlo
                </Label>
              </div>
              <span className="text-xs text-blue-700 font-bold">+{cennik.tepelne_cerpadlo.toLocaleString('sk-SK')} €</span>
            </div>
          </div>

          {/* Rekuperácia */}
          <div className="border-l-4 border-blue-500 pl-3 mb-2 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={konfig.rekuperacia}
                  onCheckedChange={(checked) => setKonfig({...konfig, rekuperacia: checked})}
                  id="rek"
                />
                <Label htmlFor="rek" className="cursor-pointer text-xs font-semibold flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
                  Rekuperácia
                </Label>
              </div>
              <span className="text-xs text-blue-700 font-bold">+{cennik.rekuperacia.toLocaleString('sk-SK')} €</span>
            </div>
          </div>

          {/* Projektová dok. */}
          <div className="border-l-4 border-blue-500 pl-3 mb-2 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={konfig.projektova_dok_rd}
                  onCheckedChange={(checked) => setKonfig({...konfig, projektova_dok_rd: checked})}
                  id="proj"
                />
                <Label htmlFor="proj" className="cursor-pointer text-xs font-semibold flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
                  Projekt. dok. RD
                </Label>
              </div>
              <span className="text-xs text-blue-700 font-bold">+{cennik.projektova_dok_rd.toLocaleString('sk-SK')} €</span>
            </div>
          </div>

          {/* Energetický cert. */}
          <div className="border-l-4 border-blue-500 pl-3 mb-2 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={konfig.energeticky_cert}
                  onCheckedChange={(checked) => setKonfig({...konfig, energeticky_cert: checked})}
                  id="cert"
                />
                <Label htmlFor="cert" className="cursor-pointer text-xs font-semibold flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">A0</span>
                  Energ. certifikát A0
                </Label>
              </div>
              <span className="text-xs text-blue-700 font-bold">+{cennik.energeticky_cert.toLocaleString('sk-SK')} €</span>
            </div>
          </div>
        </div>

        {/* B. Realizácia a služby */}
        <div className="border-t-2 border-gray-300 pt-4">
          <h4 className="font-bold text-black mb-3 text-sm">B. Realizácia a služby</h4>
          
          {/* Montáž */}
          <div className="border-l-4 border-green-500 pl-3 mb-2 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={konfig.montaz}
                  onCheckedChange={(checked) => setKonfig({...konfig, montaz: checked})}
                  id="mont"
                />
                <Label htmlFor="mont" className="cursor-pointer text-xs flex items-center gap-2">
                  <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">R</span>
                  Montáž
                </Label>
              </div>
              <span className="text-xs text-green-700 font-bold">+{cennik.montaz.toLocaleString('sk-SK')} €</span>
            </div>
          </div>

          {/* Základy */}
          <div className="border-l-4 border-green-500 pl-3 mb-2 p-2">
            <Label className="text-xs font-semibold mb-2 block flex items-center gap-2">
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">R</span>
              Základy
            </Label>
            <RadioGroup value={konfig.zaklady} onValueChange={(value) => setKonfig({...konfig, zaklady: value})}>
              <div className="space-y-1">
                {Object.entries(cennik.zaklady).map(([key, price]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={key} id={`zak-${key}`} />
                      <Label htmlFor={`zak-${key}`} className="cursor-pointer text-xs">
                        {key === 'bez' ? 'Bez' : key === 'skrutky' ? 'Skrutky' : key === 'pasove' ? 'Pásové' : 'Doska'}
                      </Label>
                    </div>
                    <span className="text-xs text-gray-700">{price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}</span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {[
            {key: 'elektroinst', label: 'Elektroinštalácia', price: cennik.elektroinst},
            {key: 'vodoinst', label: 'Vodoinštalácia', price: cennik.vodoinst},
            {key: 'kanalizacia', label: 'Kanalizácia', price: cennik.kanalizacia}
          ].map(item => (
            <div key={item.key} className="border-l-4 border-green-500 pl-3 mb-2 p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={konfig[item.key]}
                    onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                    id={item.key}
                  />
                  <Label htmlFor={item.key} className="cursor-pointer text-xs flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">R</span>
                    {item.label}
                  </Label>
                </div>
                <span className="text-xs text-green-700 font-bold">+{item.price.toLocaleString('sk-SK')} €</span>
              </div>
            </div>
          ))}
        </div>

        {/* C. Doplnkové */}
        <div className="border-t-2 border-gray-300 pt-4">
          <h4 className="font-bold text-black mb-3 text-sm">C. Doplnkové technológie</h4>
          
          {[
            {key: 'klimatizacia', label: 'Klimatizácia', price: cennik.klimatizacia},
            {key: 'krb', label: 'Krb/Kachle', price: cennik.krb},
            {key: 'fotovoltika', label: 'Fotovoltika', price: cennik.fotovoltika}
          ].map(item => (
            <div key={item.key} className="border-l-4 border-green-500 pl-3 mb-2 p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={konfig[item.key]}
                    onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                    id={item.key}
                  />
                  <Label htmlFor={item.key} className="cursor-pointer text-xs flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">R</span>
                    {item.label}
                  </Label>
                </div>
                <span className="text-xs text-green-700 font-bold">+{item.price.toLocaleString('sk-SK')} €</span>
              </div>
            </div>
          ))}

          {/* Fasáda */}
          <div className="border-l-4 border-green-500 pl-3 mb-2 p-2">
            <Label className="text-xs font-semibold mb-2 block flex items-center gap-2">
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">R</span>
              Fasáda
            </Label>
            <RadioGroup value={konfig.fasada} onValueChange={(value) => setKonfig({...konfig, fasada: value})}>
              <div className="space-y-1">
                {Object.entries(cennik.fasada).map(([key, price]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={key} id={`fas-${key}`} />
                      <Label htmlFor={`fas-${key}`} className="cursor-pointer text-xs">
                        {key === 'standard' ? 'Štandard' : key === 'thermowood' ? 'Thermowood' : key === 'smrekovec' ? 'Smrekovec' : key === 'kompozit' ? 'Kompozit' : 'Omietka'}
                      </Label>
                    </div>
                    <span className="text-xs text-gray-700">{price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}</span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {[
            {key: 'kuchynska_linka', label: 'Kuchynská linka', price: cennik.kuchynska_linka},
            {key: 'sanita_upgrade', label: 'Sanita upgrade', price: cennik.sanita_upgrade},
            {key: 'terasa', label: 'Terasa', price: cennik.terasa}
          ].map(item => (
            <div key={item.key} className="border-l-4 border-green-500 pl-3 mb-2 p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={konfig[item.key]}
                    onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                    id={item.key}
                  />
                  <Label htmlFor={item.key} className="cursor-pointer text-xs flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">R</span>
                    {item.label}
                  </Label>
                </div>
                <span className="text-xs text-green-700 font-bold">+{item.price.toLocaleString('sk-SK')} €</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-3 flex gap-2 mt-4">
        <Info className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800">
          Ceny sú orientačné. Finálna cena bude upresnená po obhliadke.
        </p>
      </div>

      {/* Celková cena */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl p-5 shadow-lg mt-4">
        <div className="text-center">
          <p className="text-xs mb-1 text-white font-semibold">Orientačná celková cena</p>
          <p className="text-3xl font-bold mb-1 text-white">
            {vypocitatCenu().toLocaleString('sk-SK')} €
          </p>
          <p className="text-xs text-white font-medium">s DPH</p>
        </div>
      </div>
    </Card>
  );
}