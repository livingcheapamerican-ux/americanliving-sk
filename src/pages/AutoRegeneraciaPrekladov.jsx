import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2, Languages, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AutoRegeneraciaPrekladov() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data: domyPredRegenraciou } = useQuery({
    queryKey: ['prosto-domy-pred'],
    queryFn: () => base44.entities.Dom.filter({ vyrobca: "Prosto House" }),
    enabled: loading
  });

  useEffect(() => {
    const runRegeneration = async () => {
      setStartTime(Date.now());
      try {
        const response = await base44.functions.invoke('regenerujPrekladyDeFrSrHrEl', {});
        setResults(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    runRegeneration();
  }, []);

  useEffect(() => {
    if (!loading || !startTime) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, startTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Languages className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automatická regenerácia prekladov</h1>
              <p className="text-sm text-gray-600">DE • FR • SR • HR • EL</p>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">
                Regenerujem preklady pre všetky Prosto House domy...
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Celkovo {domyPredRegenraciou?.length || '...'} domov na spracovanie
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-mono text-gray-600">
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')} min
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-6">
                Približne 10-30 sekúnd na dom. Proces beží na pozadí.
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border-2 border-red-300 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 text-lg">Chyba pri regenerácii</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-bold text-lg">
                      Regenerácia dokončená!
                    </p>
                    <p className="text-sm text-green-50">
                      Spracovaných: {results.processed} domov
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-700 text-lg mb-3">Výsledky regenerácie:</p>
                {results.results?.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-300'
                        : result.status === 'skipped'
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">{result.dom}</span>
                        {result.status === 'success' && result.jazyky && (
                          <p className="text-xs text-gray-600 mt-1">{result.jazyky}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'success' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              {result.prekladov} prekladov
                            </span>
                          </>
                        ) : result.status === 'skipped' ? (
                          <span className="text-sm text-yellow-700">{result.reason}</span>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-700">{result.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✅ Preklady boli úspešne aktualizované. Všetky Prosto House domy majú teraz kompletné preklady v nemčine, francúzštine, srbčine, chorvátčine a gréčtine.
                </p>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="lg"
                  className="font-semibold"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Spustiť znova
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}