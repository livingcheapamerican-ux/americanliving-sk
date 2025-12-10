import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Languages, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

export default function AdminPrekladyKonfiguratora() {
  const [translatingVyrobca, setTranslatingVyrobca] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: texts = [], isLoading } = useQuery({
    queryKey: ['konfigurator-texts'],
    queryFn: () => base44.entities.KonfiguratorText.list(),
    initialData: []
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-red-600">Prístup zamietnutý. Iba administrátori.</p>
        </Card>
      </div>
    );
  }

  const vyrobcovia = ["Ticab house", "Prosto House", "JAK Modules", "Domki z Gór"];
  
  const stats = vyrobcovia.map(vyrobca => {
    const textsForVyrobca = texts.filter(t => t.vyrobca === vyrobca);
    const translated = textsForVyrobca.filter(t => t.prelozene).length;
    const untranslated = textsForVyrobca.filter(t => !t.prelozene).length;
    return { vyrobca, total: textsForVyrobca.length, translated, untranslated };
  });

  const handleTranslate = async (vyrobca) => {
    setTranslatingVyrobca(vyrobca);
    try {
      const response = await base44.functions.invoke('translateKonfiguratorTexts', { vyrobca });
      
      queryClient.invalidateQueries({ queryKey: ['konfigurator-texts'] });
      toast.success(`Preklad dokončený: ${response.data.results.translated} textov preložených pre ${vyrobca}`);
    } catch (error) {
      toast.error('Chyba pri preklade: ' + error.message);
    } finally {
      setTranslatingVyrobca(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Preklady konfiguračných textov</h1>
          <p className="text-gray-600">Automatický preklad textov konfiguratora do 10 jazykov pomocou AI</p>
        </div>

        {/* Štatistiky podľa výrobcov */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.vyrobca} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.vyrobca}</h3>
                  <p className="text-sm text-gray-600">Konfiguračné položky</p>
                </div>
                <Settings className="w-8 h-8 text-gray-400" />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.total}</p>
                  <p className="text-xs text-gray-600">Celkom</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stat.translated}</p>
                  <p className="text-xs text-gray-600">Preložené</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stat.untranslated}</p>
                  <p className="text-xs text-gray-600">Nepreložené</p>
                </div>
              </div>

              <Button
                onClick={() => handleTranslate(stat.vyrobca)}
                disabled={translatingVyrobca === stat.vyrobca || stat.untranslated === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {translatingVyrobca === stat.vyrobca ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Prekladám...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Preložiť všetky texty ({stat.untranslated})
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Info panel */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Informácie o preklade</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Preklady sa vykonávajú automaticky pomocou AI</li>
                <li>• Prekladajú sa polia: názov, podnadpis, dlhý popis, poznámky, tooltip</li>
                <li>• Jazyky: EN, HU, PL, UK, DE, FR, SR, HR, EL</li>
                <li>• Technické termíny a merné jednotky zostávajú zachované</li>
                <li>• Názvy značiek sa neprekladajú</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Zoznam textov */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Všetky konfiguračné texty</h2>
          
          {vyrobcovia.map((vyrobca) => {
            const vyrobcaTexts = texts.filter(t => t.vyrobca === vyrobca);
            if (vyrobcaTexts.length === 0) return null;

            return (
              <div key={vyrobca}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">{vyrobca}</h3>
                <div className="space-y-2">
                  {vyrobcaTexts.map((text) => (
                    <Card key={text.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{text.nazov}</p>
                            {text.prelozene ? (
                              <Badge className="bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Preložené
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Nepreložené
                              </Badge>
                            )}
                          </div>
                          {text.podnadpis && (
                            <p className="text-sm text-gray-600 mt-1">{text.podnadpis}</p>
                          )}
                          
                          {/* Zobraz dostupné jazyky */}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <Badge variant="outline" className="bg-blue-50 text-xs">SK</Badge>
                            {text.nazov_en && <Badge variant="outline" className="bg-green-50 text-xs">EN</Badge>}
                            {text.nazov_hu && <Badge variant="outline" className="bg-green-50 text-xs">HU</Badge>}
                            {text.nazov_pl && <Badge variant="outline" className="bg-green-50 text-xs">PL</Badge>}
                            {text.nazov_uk && <Badge variant="outline" className="bg-green-50 text-xs">UK</Badge>}
                            {text.nazov_de && <Badge variant="outline" className="bg-green-50 text-xs">DE</Badge>}
                            {text.nazov_fr && <Badge variant="outline" className="bg-green-50 text-xs">FR</Badge>}
                            {text.nazov_sr && <Badge variant="outline" className="bg-green-50 text-xs">SR</Badge>}
                            {text.nazov_hr && <Badge variant="outline" className="bg-green-50 text-xs">HR</Badge>}
                            {text.nazov_el && <Badge variant="outline" className="bg-green-50 text-xs">EL</Badge>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {texts.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Zatiaľ žiadne konfiguračné texty.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}