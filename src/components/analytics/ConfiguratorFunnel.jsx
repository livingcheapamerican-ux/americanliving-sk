import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Settings
} from "lucide-react";

export default function ConfiguratorFunnel({ sessions, dom }) {
  const funnelData = useMemo(() => {
    // Nájdi všetky sessions pre tento dom
    const domSessions = sessions.filter(s => 
      s.configurator_interactions?.some(ci => ci.dom_id === dom.id)
    );

    if (domSessions.length === 0) return null;

    // Vytvor mapu krokov konfiguratora
    const stepCounts = {};
    const stepExits = {};
    const stepSequence = [];
    
    domSessions.forEach(session => {
      const interactions = session.configurator_interactions
        .filter(ci => ci.dom_id === dom.id)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      if (interactions.length === 0) return;

      // Trackovať kroky
      const userSteps = new Set();
      interactions.forEach((interaction, idx) => {
        const stepKey = interaction.category || interaction.action || 'Neznámy krok';
        userSteps.add(stepKey);
        
        if (!stepCounts[stepKey]) {
          stepCounts[stepKey] = 0;
          stepExits[stepKey] = 0;
          if (!stepSequence.includes(stepKey)) {
            stepSequence.push(stepKey);
          }
        }
        stepCounts[stepKey]++;

        // Ak je toto posledná interakcia a používateľ nekonvertoval
        if (idx === interactions.length - 1 && !session.conversions?.length) {
          stepExits[stepKey]++;
        }
      });
    });

    // Vytvor funnel steps
    const funnelSteps = stepSequence.map((step, idx) => {
      const count = stepCounts[step];
      const exits = stepExits[step];
      const dropoffRate = count > 0 ? (exits / count) * 100 : 0;
      const completionRate = idx === 0 ? 100 : (count / stepCounts[stepSequence[0]]) * 100;

      return {
        step,
        count,
        exits,
        dropoffRate,
        completionRate,
        index: idx
      };
    });

    // Najhoršie kroky (najviac exitov)
    const worstSteps = [...funnelSteps]
      .sort((a, b) => b.dropoffRate - a.dropoffRate)
      .slice(0, 3);

    // Celkový conversion rate
    const conversions = domSessions.filter(s => s.conversions?.length > 0).length;
    const conversionRate = (conversions / domSessions.length) * 100;

    return {
      funnelSteps,
      worstSteps,
      totalUsers: domSessions.length,
      conversions,
      conversionRate
    };
  }, [sessions, dom]);

  if (!funnelData) {
    return (
      <Card className="p-6 bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          Žiadne dáta z konfiguratora pre tento dom
        </p>
      </Card>
    );
  }

  const getRecommendations = (step) => {
    const recommendations = {
      'Izolacia': [
        '💡 Pridajte vizuálne porovnanie úspor energií',
        '📊 Zobrazujte graf úspor na 10 rokov',
        '✅ Zvýraznite odporúčanú možnosť'
      ],
      'Fasada': [
        '🖼️ Pridajte reálne fotky domov s danou fasádou',
        '🎨 Ukážte farebné vzorky',
        '⏱️ Zdôraznite, že zmena sa dá urobiť kedykoľvek'
      ],
      'Kúpeľňa': [
        '📸 Pridajte galériu kúpeľní',
        '💰 Zobrazujte cenu za každú možnosť samostatne',
        '✨ Pridajte 3D náhľad kúpeľne'
      ],
      'Elektroinštalácia': [
        '🔌 Zjednodušte výber - ponúknite iba 2 možnosti',
        '🏆 Zvýraznite najobľúbenejšiu voľbu',
        '📋 Pridajte checklist čo obsahuje'
      ],
      'Základy': [
        '🏗️ Pridajte vizuálnu schému typu základov',
        '🌍 Automaticky odporúčte typ podľa typu pôdy',
        '💬 Pridajte odporúčanie od inžiniera'
      ],
      'Vykurovanie': [
        '🔥 Zobrazujte porovnanie nákladov na vykurovanie',
        '♨️ Pridajte kalkulačku ročných úspor',
        '🌱 Zvýraznite ekologické benefity'
      ]
    };

    return recommendations[step] || [
      '✅ Zjednodušte rozhodovanie',
      '📊 Pridajte vizuálny náhľad',
      '💰 Zobrazujte vplyv na cenu jasnejšie'
    ];
  };

  const maxCount = Math.max(...funnelData.funnelSteps.map(s => s.count));

  return (
    <div className="space-y-6">
      {/* Prehľad */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <p className="text-xs text-gray-600 mb-1">Začalo konfiguráciu</p>
          <p className="text-3xl font-bold text-blue-600">{funnelData.totalUsers}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-xs text-gray-600 mb-1">Konverzie</p>
          <p className="text-3xl font-bold text-green-600">{funnelData.conversions}</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
          <p className="text-3xl font-bold text-purple-600">{funnelData.conversionRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="p-6">
        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          📊 Funnel postupu konfigurátorom
        </h4>
        <div className="space-y-4">
          {funnelData.funnelSteps.map((step, idx) => {
            const width = (step.count / maxCount) * 100;
            const isWorst = funnelData.worstSteps.some(w => w.step === step.step);
            
            return (
              <div key={step.step}>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${isWorst ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                    Krok {idx + 1}
                  </Badge>
                  <span className="font-semibold text-gray-900">{step.step}</span>
                  {isWorst && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Vysoký drop-off!
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div 
                      className={`h-12 rounded-lg flex items-center justify-between px-4 transition-all ${
                        isWorst 
                          ? 'bg-gradient-to-r from-red-500 to-red-400' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-400'
                      }`}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-white font-bold">{step.count} používateľov</span>
                      <span className="text-white text-sm">{step.completionRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-xs text-gray-600">Drop-off rate</p>
                    <p className={`text-xl font-bold ${
                      step.dropoffRate > 40 ? 'text-red-600' :
                      step.dropoffRate > 20 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {step.dropoffRate.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Šípka */}
                {idx < funnelData.funnelSteps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Problémové kroky a odporúčania */}
      {funnelData.worstSteps.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-300">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            ⚠️ Problémové kroky a AI odporúčania
          </h4>
          <div className="space-y-4">
            {funnelData.worstSteps.map((step, idx) => (
              <div key={step.step} className="bg-white p-4 rounded-lg border-2 border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-600 text-white">#{idx + 1} Najhoršie</Badge>
                    <span className="font-bold text-gray-900">{step.step}</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {step.dropoffRate.toFixed(0)}% opustilo
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Vstúpilo:</p>
                    <p className="text-lg font-bold">{step.count} používateľov</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Opustilo:</p>
                    <p className="text-lg font-bold text-red-600">{step.exits} používateľov</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <h5 className="font-bold text-sm mb-2 flex items-center gap-1 text-yellow-900">
                    <Lightbulb className="w-4 h-4" />
                    AI odporúčania na zlepšenie
                  </h5>
                  <ul className="space-y-1">
                    {getRecommendations(step.step).map((rec, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Celkové odporúčanie */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300">
        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          💡 Hlavné odporúčanie pre tento konfigurátor
        </h4>
        <div className="space-y-3">
          {funnelData.conversionRate < 10 && (
            <div className="bg-red-50 p-3 rounded border border-red-300">
              <p className="text-sm text-red-900">
                <strong>🚨 Kritický problém:</strong> Conversion rate je len {funnelData.conversionRate.toFixed(1)}%. 
                Používatelia sa pravdepodobne stretávajú s príliš veľa volieb alebo nejasnými cenami.
              </p>
            </div>
          )}
          
          {funnelData.worstSteps[0]?.dropoffRate > 50 && (
            <div className="bg-orange-50 p-3 rounded border border-orange-300">
              <p className="text-sm text-orange-900">
                <strong>⚠️ Vysoký drop-off:</strong> Krok "{funnelData.worstSteps[0].step}" stráca {funnelData.worstSteps[0].dropoffRate.toFixed(0)}% používateľov. 
                Zvážte zjednodušenie alebo lepšie vysvetlenie tejto sekcie.
              </p>
            </div>
          )}

          <div className="bg-green-50 p-3 rounded border border-green-300">
            <p className="text-sm text-green-900">
              <strong>✅ Odporúčanie:</strong> Pridajte "Späť" tlačidlo v každom kroku, zobrazujte progress bar a umožnite uloženie rozpracovanej konfigurácie.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}