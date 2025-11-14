import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function PriceCalculator({ dom, onPriceChange }) {
  const [extras, setExtras] = useState({
    montaz: false,
    fasada: "standard",
    zaklady: "bez",
    izolacie: false,
    elektroinst: false,
    vodoinst: false,
    kanalizacia: false,
    vytranie: false,
    tepelne_cerpadlo: false,
    fotovoltaika: false,
    projektova_dok: false,
    energeticky_cert: false
  });

  const cennik = {
    montaz: 7000,
    fasada: {
      standard: 0,
      smrekovec: 5000,
      thermowood: 8000,
      kompozit: 12000
    },
    zaklady: {
      bez: 0,
      skrutky: 5000,
      pasove: 15000,
      doska: 18000
    },
    izolacie: 4000,
    elektroinst: 3500,
    vodoinst: 2500,
    kanalizacia: 2000,
    vytranie: 4500,
    tepelne_cerpadlo: 9000,
    fotovoltaika: 15000,
    projektova_dok: 2107,
    energeticky_cert: 3500
  };

  const vypocitatCenu = () => {
    let celkovaCena = dom.zakladna_cena || 0;

    if (extras.montaz) celkovaCena += cennik.montaz;
    celkovaCena += cennik.fasada[extras.fasada] || 0;
    celkovaCena += cennik.zaklady[extras.zaklady] || 0;
    if (extras.izolacie) celkovaCena += cennik.izolacie;
    if (extras.elektroinst) celkovaCena += cennik.elektroinst;
    if (extras.vodoinst) celkovaCena += cennik.vodoinst;
    if (extras.kanalizacia) celkovaCena += cennik.kanalizacia;
    if (extras.vytranie) celkovaCena += cennik.vytranie;
    if (extras.tepelne_cerpadlo) celkovaCena += cennik.tepelne_cerpadlo;
    if (extras.fotovoltaika) celkovaCena += cennik.fotovoltaika;
    if (extras.projektova_dok) celkovaCena += cennik.projektova_dok;
    if (extras.energeticky_cert) celkovaCena += cennik.energeticky_cert;

    return celkovaCena;
  };

  useEffect(() => {
    onPriceChange(vypocitatCenu());
  }, [extras]);

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

      <div className="space-y-6">
        {/* Základná cena */}
        <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-black">Základná cena domu</span>
            <span className="text-lg font-bold text-blue-700">
              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
            </span>
          </div>
        </div>

        {/* Montáž */}
        <div className="border-b-2 border-gray-400 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={extras.montaz}
                onCheckedChange={(checked) => setExtras({...extras, montaz: checked})}
                id="montaz"
              />
              <Label htmlFor="montaz" className="font-bold cursor-pointer text-black">
                Montáž domu
              </Label>
            </div>
            <span className="text-blue-700 font-bold">
              +{cennik.montaz.toLocaleString('sk-SK')} €
            </span>
          </div>
          <p className="text-sm font-semibold text-black ml-8">Kompletná montáž na pozemku</p>
        </div>

        {/* Fasáda */}
        <div className="border-b-2 border-gray-400 pb-4">
          <Label className="font-bold mb-3 block text-black text-base">Vonkajšia fasáda</Label>
          <RadioGroup value={extras.fasada} onValueChange={(value) => setExtras({...extras, fasada: value})}>
            <div className="space-y-2">
              {Object.entries(cennik.fasada).map(([key, price]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={key} id={`fasada-${key}`} />
                    <Label htmlFor={`fasada-${key}`} className="cursor-pointer font-semibold text-black">
                      {key === 'standard' ? 'Štandardná' : 
                       key === 'smrekovec' ? 'Smrekovec' :
                       key === 'thermowood' ? 'Thermowood' :
                       'Kompozitné panely'}
                    </Label>
                  </div>
                  <span className="text-sm text-black font-bold">
                    {price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}
                  </span>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Základy */}
        <div className="border-b-2 border-gray-400 pb-4">
          <Label className="font-bold mb-3 block text-black text-base">Základy</Label>
          <RadioGroup value={extras.zaklady} onValueChange={(value) => setExtras({...extras, zaklady: value})}>
            <div className="space-y-2">
              {Object.entries(cennik.zaklady).map(([key, price]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={key} id={`zaklady-${key}`} />
                    <Label htmlFor={`zaklady-${key}`} className="cursor-pointer font-semibold text-black">
                      {key === 'bez' ? 'Bez základov' :
                       key === 'skrutky' ? 'Zemné skrutky' :
                       key === 'pasove' ? 'Pásové betónové' :
                       'Základová doska'}
                    </Label>
                  </div>
                  <span className="text-sm text-black font-bold">
                    {price > 0 ? `+${price.toLocaleString('sk-SK')} €` : 'Zahrnuté'}
                  </span>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Inštalácie */}
        <div className="space-y-3">
          <Label className="font-bold text-black text-base">Inštalácie a technológie</Label>
          {[
            {key: 'izolacie', label: 'Dodatočná izolácia', price: cennik.izolacie},
            {key: 'elektroinst', label: 'Elektroinštalácia', price: cennik.elektroinst},
            {key: 'vodoinst', label: 'Vodoinštalácia', price: cennik.vodoinst},
            {key: 'kanalizacia', label: 'Kanalizácia', price: cennik.kanalizacia},
            {key: 'vytranie', label: 'Rekuperácia', price: cennik.vytranie},
            {key: 'tepelne_cerpadlo', label: 'Tepelné čerpadlo', price: cennik.tepelne_cerpadlo},
            {key: 'fotovoltaika', label: 'Fotovoltaický systém', price: cennik.fotovoltaika}
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={extras[item.key]}
                  onCheckedChange={(checked) => setExtras({...extras, [item.key]: checked})}
                  id={item.key}
                />
                <Label htmlFor={item.key} className="cursor-pointer font-semibold text-black">
                  {item.label}
                </Label>
              </div>
              <span className="text-sm text-blue-700 font-bold">
                +{item.price.toLocaleString('sk-SK')} €
              </span>
            </div>
          ))}
        </div>

        {/* Dokumentácia */}
        <div className="space-y-3 border-t-2 border-gray-400 pt-4">
          <Label className="font-bold text-black text-base">Dokumentácia a certifikáty</Label>
          {[
            {key: 'projektova_dok', label: 'Projektová dokumentácia', price: cennik.projektova_dok},
            {key: 'energeticky_cert', label: 'Energetická certifikácia A0', price: cennik.energeticky_cert}
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={extras[item.key]}
                  onCheckedChange={(checked) => setExtras({...extras, [item.key]: checked})}
                  id={item.key}
                />
                <Label htmlFor={item.key} className="cursor-pointer font-semibold text-black">
                  {item.label}
                </Label>
              </div>
              <span className="text-sm text-blue-700 font-bold">
                +{item.price.toLocaleString('sk-SK')} €
              </span>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-yellow-800 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-black font-semibold">
            Uvedené ceny sú orientačné. Finálna cena bude upresnená po obhliadke pozemku a konzultácii.
          </p>
        </div>

        {/* Celková cena */}
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl p-6 shadow-lg">
          <div className="text-center">
            <p className="text-sm mb-2 text-white font-semibold">Orientačná celková cena</p>
            <p className="text-4xl font-bold mb-1 text-white">
              {vypocitatCenu().toLocaleString('sk-SK')} €
            </p>
            <p className="text-xs text-white font-medium">s DPH</p>
          </div>
        </div>
      </div>
    </Card>
  );
}