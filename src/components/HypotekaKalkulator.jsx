import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Calendar, Percent, Euro, Info } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function HypotekaKalkulator({ cenaDoma, onPriceUpdate }) {
  const { t } = useLanguage();
  const [vyskaUveru, setVyskaUveru] = useState(cenaDoma || 100000);
  const [dobaSplatnosti, setDobaSplatnosti] = useState(25);
  const [urokovaSadzba, setUrokovaSadzba] = useState(3.5);
  const [vlastnyVklad, setVlastnyVklad] = useState(20);

  useEffect(() => {
    if (cenaDoma) {
      const vklad = (cenaDoma * vlastnyVklad) / 100;
      setVyskaUveru(Math.round(cenaDoma - vklad));
    }
  }, [cenaDoma, vlastnyVklad]);

  // Výpočet mesačnej splátky pomocou anuitného vzorca
  const vypocitatMesacnuSplatku = () => {
    const P = vyskaUveru; // Výška úveru
    const r = urokovaSadzba / 100 / 12; // Mesačná úroková sadzba
    const n = dobaSplatnosti * 12; // Počet mesiacov

    if (r === 0) {
      return P / n;
    }

    const mesacnaSplatka = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return mesacnaSplatka;
  };

  const mesacnaSplatka = vypocitatMesacnuSplatku();
  const celkomPreplatky = mesacnaSplatka * dobaSplatnosti * 12 - vyskaUveru;
  const celkovaCena = vyskaUveru + celkomPreplatky;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Kalkulátor hypotéky</h3>
          <p className="text-sm text-gray-600">Vypočítajte si orientačnú splátku</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cena domu */}
        {cenaDoma && (
          <div className="p-4 bg-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-blue-700" />
                <span className="font-semibold text-blue-900">Cena domu:</span>
              </div>
              <span className="text-xl font-bold text-blue-700">
                {cenaDoma.toLocaleString('sk-SK')} €
              </span>
            </div>
          </div>
        )}

        {/* Vlastný vklad */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              Vlastný vklad
            </Label>
            <span className="text-sm font-semibold text-blue-700">
              {vlastnyVklad}% ({((cenaDoma || vyskaUveru) * vlastnyVklad / 100).toLocaleString('sk-SK')} €)
            </span>
          </div>
          <Slider
            min={10}
            max={50}
            step={5}
            value={[vlastnyVklad]}
            onValueChange={([val]) => setVlastnyVklad(val)}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Výška úveru */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Euro className="w-4 h-4 text-gray-500" />
            Výška úveru
          </Label>
          <Input
            type="number"
            value={vyskaUveru}
            onChange={(e) => setVyskaUveru(Number(e.target.value))}
            min={10000}
            max={500000}
            step={1000}
            className="text-lg font-semibold"
          />
        </div>

        {/* Doba splatnosti */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Doba splatnosti
            </Label>
            <span className="text-sm font-semibold text-blue-700">{dobaSplatnosti} rokov</span>
          </div>
          <Slider
            min={5}
            max={30}
            step={1}
            value={[dobaSplatnosti]}
            onValueChange={([val]) => setDobaSplatnosti(val)}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5 rokov</span>
            <span>30 rokov</span>
          </div>
        </div>

        {/* Úroková sadzba */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-500" />
              Úroková sadzba
            </Label>
            <span className="text-sm font-semibold text-blue-700">{urokovaSadzba.toFixed(2)}%</span>
          </div>
          <Slider
            min={1}
            max={8}
            step={0.1}
            value={[urokovaSadzba]}
            onValueChange={([val]) => setUrokovaSadzba(val)}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1.0%</span>
            <span>8.0%</span>
          </div>
        </div>

        {/* Výsledky */}
        <div className="pt-4 border-t-2 border-blue-200 space-y-3">
          <div className="bg-blue-600 text-white p-4 rounded-xl">
            <p className="text-sm opacity-90 mb-1">Mesačná splátka</p>
            <p className="text-3xl font-bold">{Math.round(mesacnaSplatka).toLocaleString('sk-SK')} €</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Celkom zaplatíte</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(celkovaCena).toLocaleString('sk-SK')} €
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Preplatky na úrokoch</p>
              <p className="text-lg font-bold text-orange-600">
                {Math.round(celkomPreplatky).toLocaleString('sk-SK')} €
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold mb-1">Orientačný výpočet</p>
            <p>Skutočná výška mesačnej splátky sa môže líšiť v závislosti od konkrétnych podmienok banky, poplatkov a poistenia.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}