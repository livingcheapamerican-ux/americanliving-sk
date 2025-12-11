import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, RefreshCw, Play, Database, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminVerifikaciaUdajov() {
  const [log, setLog] = useState([]);
  const [results, setResults] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const verifikujMutation = useMutation({
    mutationFn: async (testMode) => {
      setLog(['⏳ Spúšťam verifikáciu...']);
      const response = await base44.functions.invoke('verifikujUdajeDomov', { testMode });
      return response.data;
    },
    onSuccess: (data) => {
      setLog(data.log || []);
      setResults(data);
      if (data.success) {
        toast.success(data.testMode ? 'Test verifikácie dokončený' : 'Verifikácia a oprava dokončená');
      }
    },
    onError: (error) => {
      toast.error('Chyba pri verifikácii: ' + error.message);
      setLog(prev => [...prev, '❌ CHYBA: ' + error.message]);
    }
  });

  if (!user?.super_admin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card className="max-w-2xl mx-auto p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Prístup zamietnutý</h1>
          <p className="text-gray-600">Táto stránka je dostupná len pre super administrátorov.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verifikácia a oprava údajov domov
          </h1>
          <p className="text-gray-600">
            Automatická kontrola a oprava údajov z tabuľiek "Základné parametre" na webe
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <Database className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">1. Extrakcia</h3>
            <p className="text-sm text-gray-600">
              AI extrahuje všetky údaje z tabuliek "Základné parametre" na webe
            </p>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-200">
            <RefreshCw className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">2. Porovnanie</h3>
            <p className="text-sm text-gray-600">
              Porovná extrahované údaje s databázou a nájde rozdiely
            </p>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">3. Oprava</h3>
            <p className="text-sm text-gray-600">
              Automaticky opraví všetky nájdené chyby a doplní štruktúrované dáta
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => verifikujMutation.mutate(true)}
              disabled={verifikujMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Spustiť TEST (bez uloženia)
            </Button>

            <Button
              onClick={() => verifikujMutation.mutate(false)}
              disabled={verifikujMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <Database className="w-5 h-5 mr-2" />
              Spustiť LIVE (opraví DB)
            </Button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Najprv spustite TEST režim na kontrolu. Po overení výsledkov spustite LIVE režim.
            </p>
          </div>
        </Card>

        {/* Results Summary */}
        {results && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Výsledky verifikácie
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Skontrolované</p>
                <p className="text-3xl font-bold text-blue-600">{results.summary?.skontrolovane || 0}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Problémy</p>
                <p className="text-3xl font-bold text-yellow-600">{results.summary?.problemy || 0}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Opravy</p>
                <p className="text-3xl font-bold text-green-600">{results.summary?.opravy || 0}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Režim</p>
                <p className="text-lg font-bold text-purple-600">
                  {results.testMode ? '🧪 TEST' : '🔴 LIVE'}
                </p>
              </div>
            </div>

            {results.problemy && results.problemy.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">Domy s problémami:</h3>
                <div className="space-y-2">
                  {results.problemy.map((problem, idx) => (
                    <div key={idx} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="font-semibold text-sm">{problem.dom}</p>
                      <ul className="text-xs text-gray-600 ml-4 mt-1">
                        {problem.rozdiely.map((rozdiel, i) => (
                          <li key={i}>• {rozdiel}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Log */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Log verifikácie</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-gray-500">Spustite verifikáciu pre zobrazenie logu...</p>
            ) : (
              log.map((line, idx) => (
                <div key={idx} className="mb-1">
                  {line}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* What it extracts */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4">🤖 Čo systém extrahuje a ukladá</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-900">Základné parametre</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Výrobca, typ domu, počet modulov</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Počet izieb (z tabuľky, nie pôdorysu!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Zastavaná plocha, úžitková plocha</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Plocha terasy (ak je uvedená)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Energetická trieda A0</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Celoročný / Energetický certifikát</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Vonkajšie rozmery, výška stropu</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-purple-900">Štruktúrované dáta pre chatbota</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Kompletný zoznam vybavenia v základnej cene</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Doplnky za príplatok</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Technické špecifikácie (izolácia, okná, dvere)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Materiály fasády, strechy, interiéru</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Všetky údaje organizované pre AI chatbota</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-300">
            <p className="text-sm text-gray-700">
              <strong>💡 Výsledok:</strong> Chatbot bude mať presné a aktuálne údaje o každom dome z webu, 
              organizované do štruktúry optimálnej pre AI odpovede. Už žiadne chyby ako pri Lyone!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}