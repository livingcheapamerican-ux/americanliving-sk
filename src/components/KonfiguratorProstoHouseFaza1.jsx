import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const DEFAULT_CENNIK = {
  montaz: {
    48: 4614,
    72: 7524,
    103: 12073,
    108: 9664,
    142: 12091
  },
  vstupne_dviere: {
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
  }
};

export default function KonfiguratorProstoHouseFaza1({ 
  konfig, 
  setKonfig, 
  dom,
  customCeny = {}
}) {
  const getPrice = (key) => {
    // Skúsime rôzne varianty kľúčov v customCeny
    const variants = [key, key.replace(/_/g, '')];
    
    for (const variant of variants) {
      if (customCeny && customCeny[variant] !== undefined && customCeny[variant] > 0) {
        return customCeny[variant];
      }
    }
    
    return DEFAULT_CENNIK[key] ?? 0;
  };

  // Helper funkcia na ziskanie ceny pre nested struktures
  const getPriceNested = (category, subkey) => {
    const fullKey = `${category}_${subkey}`;
    
    // Priority 1: flat key format (s rôznymi variantmi)
    const flatVariants = [fullKey, fullKey.replace(/_/g, '')];
    for (const variant of flatVariants) {
      if (customCeny && customCeny[variant] !== undefined && customCeny[variant] > 0) {
        return customCeny[variant];
      }
    }
    
    // Priority 2: nested object
    if (customCeny && customCeny[category] && typeof customCeny[category] === 'object') {
      if (customCeny[category][subkey] !== undefined && customCeny[category][subkey] > 0) {
        return customCeny[category][subkey];
      }
    }
    
    // Priority 3: default
    return DEFAULT_CENNIK[category]?.[subkey] ?? 0;
  };

  const getMontazPrice = () => {
    if (!dom?.zastavana_plocha) return 0;
    const plocha = dom.zastavana_plocha;
    
    // Skúsime najprv priamy kľúč "montaz" v customCeny
    if (customCeny && customCeny.montaz !== undefined && customCeny.montaz > 0) {
      return customCeny.montaz;
    }
    
    // Potom podľa plochy
    if (plocha <= 48) return getPrice('montaz_48') || DEFAULT_CENNIK.montaz[48];
    if (plocha <= 72) return getPrice('montaz_72') || DEFAULT_CENNIK.montaz[72];
    if (plocha <= 103) return getPrice('montaz_103') || DEFAULT_CENNIK.montaz[103];
    if (plocha <= 108) return getPrice('montaz_108') || DEFAULT_CENNIK.montaz[108];
    return getPrice('montaz_142') || DEFAULT_CENNIK.montaz[142];
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Fáza 1: Hrubá stavba</h2>
      
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
            <span className="text-green-600 font-extrabold text-lg">
              +{(getMontazPrice() * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH
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
                <span className="text-primary font-bold">+{(getPriceNested('vstupne_dviere', 'kovove') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="plastkovo_kovove" id="dvere-plast" />
                  <Label htmlFor="dvere-plast" className="cursor-pointer">Plastovo-kovové</Label>
                </div>
                <span className="text-primary font-bold">+{(getPriceNested('vstupne_dviere', 'plastkovo_kovove') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
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
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('zaklady', 'skrutky') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="pasove" id="zakl-pas" />
                  <Label htmlFor="zakl-pas" className="cursor-pointer">Pásové základy</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('zaklady', 'pasove') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="doska" id="zakl-doska" />
                  <Label htmlFor="zakl-doska" className="cursor-pointer">Základová doska</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('zaklady', 'doska') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
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
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('fasada', 'smrekovec') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="termicky_upravene_drevo" id="fas-term" />
                  <Label htmlFor="fas-term" className="cursor-pointer">Termicky upravené drevo</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('fasada', 'termicky_upravene_drevo') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="kompozit" id="fas-komp" />
                  <Label htmlFor="fas-komp" className="cursor-pointer">Kompozitné panely</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('fasada', 'kompozit') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Okná */}
        <div className="border rounded-lg p-4">
          <Label className="text-base font-semibold mb-3 block">Okná</Label>
          <RadioGroup value={konfig.okna} onValueChange={(value) => setKonfig({...konfig, okna: value})}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="standard" id="okno-std" />
                  <Label htmlFor="okno-std" className="cursor-pointer">Štandardné okná (zahrnuté v cene)</Label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="hlinikove" id="okno-hl" />
                  <Label htmlFor="okno-hl" className="cursor-pointer">Hliníkové okná</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{(getPriceNested('okna', 'hlinikove') * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}