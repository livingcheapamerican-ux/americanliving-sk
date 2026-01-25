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
  cennikFaza1 = {}
}) {

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
              +{((cennikFaza1.montaz || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH
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
                <span className="text-primary font-bold">+{((cennikFaza1.vstupne_dviere_kovove || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="plastkovo_kovove" id="dvere-plast" />
                  <Label htmlFor="dvere-plast" className="cursor-pointer">Plastovo-kovové</Label>
                </div>
                <span className="text-primary font-bold">+{((cennikFaza1.vstupne_dviere_plastkovo_kovove || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
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
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.zaklady_skrutky || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="pasove" id="zakl-pas" />
                  <Label htmlFor="zakl-pas" className="cursor-pointer">Pásové základy</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.zaklady_pasove || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="doska" id="zakl-doska" />
                  <Label htmlFor="zakl-doska" className="cursor-pointer">Základová doska</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.zaklady_doska || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
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
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.fasada_smrekovec || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="termicky_upravene_drevo" id="fas-term" />
                  <Label htmlFor="fas-term" className="cursor-pointer">Termicky upravené drevo</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.fasada_termicky_upravene_drevo || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="kompozit" id="fas-komp" />
                  <Label htmlFor="fas-komp" className="cursor-pointer">Kompozitné panely</Label>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.fasada_kompozit || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
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
                <span className="text-green-600 font-extrabold text-lg">+{((cennikFaza1.okna_hlinikove || 0) * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}