import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Calendar, Percent, Euro, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function HypotekaKalkulator({ 
  cenaDoma, 
  dom, 
  aktualnaKonfiguracia,
  user
}) {
  const { t } = useLanguage();
  const [dobaSplatnosti, setDobaSplatnosti] = useState(25);
  const [urokovaSadzba, setUrokovaSadzba] = useState(3.5);
  const [vlastnyVklad, setVlastnyVklad] = useState(20);
  const [celkovaCenaKonfiguracie, setCelkovaCenaKonfiguracie] = useState(cenaDoma || dom?.zakladna_cena || 100000);

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  // Aktualizovať cenu z konfigurácie
  useEffect(() => {
    const novaCena = aktualnaKonfiguracia?.celkovaCena || cenaDoma || dom?.zakladna_cena || 100000;
    setCelkovaCenaKonfiguracie(novaCena);
  }, [aktualnaKonfiguracia?.celkovaCena, cenaDoma, dom?.zakladna_cena]);
  
  // Suma z ktorej sa počíta hypotéka je PRESNE suma "Celkom s DPH" zo sidebar panelu
  const celkomSDph = celkovaCenaKonfiguracie;
  const vyskaUveru = Math.round(celkomSDph * (100 - vlastnyVklad) / 100);

  // Výpočet mesačnej splátky pomocou anuitného vzorca
  const vypocitatMesacnuSplatku = () => {
    const P = vyskaUveru;
    const r = urokovaSadzba / 100 / 12;
    const n = dobaSplatnosti * 12;

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
    <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{t('mortgageCalculator')}</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* Suma z konfigurácie */}
        <div className="space-y-2">
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('totalWithVAT')}:</span>
              <span className="text-sm font-bold text-foreground">
                {celkomSDph.toLocaleString('sk-SK')} €
              </span>
            </div>
          </div>
          
          {/* Admin log - výpočet hypotéky */}
          {isAdmin && (
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">🔧 Admin Log - Hypotéka:</p>
              <div className="text-[10px] text-purple-600/90 dark:text-purple-400/80 space-y-0.5">
                <p>• Celkom s DPH (zo sidebar): {celkomSDph.toLocaleString('sk-SK')} €</p>
                <p>• Vlastný vklad ({vlastnyVklad}%): {(celkomSDph * vlastnyVklad / 100).toLocaleString('sk-SK')} €</p>
                <p className="text-purple-600 font-semibold">• Výška úveru: {vyskaUveru.toLocaleString('sk-SK')} €</p>
                <p>• Úroková sadzba: {urokovaSadzba.toFixed(1)}%</p>
                <p>• Doba splatnosti: {dobaSplatnosti} rokov</p>
              </div>
            </div>
          )}
        </div>

        {/* Vlastný vklad */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">{t('downPayment')}</Label>
            <span className="text-xs font-semibold text-primary">
              {vlastnyVklad}% ({(celkomSDph * vlastnyVklad / 100).toLocaleString('sk-SK')} €)
            </span>
          </div>
          <Slider
            min={10}
            max={50}
            step={5}
            value={[vlastnyVklad]}
            onValueChange={([val]) => setVlastnyVklad(val)}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Doba splatnosti */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">{t('loanTerm')}</Label>
            <span className="text-xs font-semibold text-primary">{dobaSplatnosti} {t('years')}</span>
          </div>
          <Slider
            min={5}
            max={30}
            step={1}
            value={[dobaSplatnosti]}
            onValueChange={([val]) => setDobaSplatnosti(val)}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>5</span>
            <span>30</span>
          </div>
        </div>

        {/* Úroková sadzba */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">{t('interestRate')}</Label>
            <span className="text-xs font-semibold text-primary">{urokovaSadzba.toFixed(1)}%</span>
          </div>
          <Slider
            min={1}
            max={8}
            step={0.1}
            value={[urokovaSadzba]}
            onValueChange={([val]) => setUrokovaSadzba(val)}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>1%</span>
            <span>8%</span>
          </div>
        </div>

        {/* Výsledky */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <p className="text-xs opacity-90">{t('monthlyPayment')}</p>
            <p className="text-2xl font-bold">{Math.round(mesacnaSplatka).toLocaleString('sk-SK')} €</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground mb-0.5 leading-tight">{t('totalPaymentToBank')}</p>
              <p className="font-bold text-foreground">{Math.round(celkovaCena).toLocaleString('sk-SK')} €</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground mb-0.5">{t('interest')}</p>
              <p className="font-bold text-orange-500">{Math.round(celkomPreplatky).toLocaleString('sk-SK')} €</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          <p className="text-xs text-yellow-600 dark:text-yellow-450">
            ℹ️ {t('estimatedCalculation')}
          </p>
        </div>
      </div>
    </Card>
  );
}