import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2, Languages, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RegenerujPrekladyDeFrSrHrEl() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await base44.functions.invoke('regenerujPrekladyDeFrSrHrEl', {});
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("AdminPrekladyDomov")}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Späť
          </Button>
        </Link>

        <Card className="p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Languages className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Regenerácia prekladov</h1>
              <p className="text-sm text-gray-600">DE • FR • SR • HR • EL</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 font-medium mb-2">
              ⚠️ Táto funkcia regeneruje preklady pre jazyky:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-amber-600">🇩🇪 Nemecký</Badge>
              <Badge className="bg-amber-600">🇫🇷 Francúzsky</Badge>
              <Badge className="bg-amber-600">🇷🇸 Srbský</Badge>
              <Badge className="bg-amber-600">🇭🇷 Chorvátsky</Badge>
              <Badge className="bg-amber-600">🇬🇷 Grécky</Badge>
            </div>
            <p className="text-xs text-amber-800 mt-3">
              Všetky Prosto House domy budú mať nové, kompletné preklady popisov a špecifikácií. 
              Proces trvá približne 10-30 sekúnd na dom.
            </p>
          </div>

          <Button
            onClick={handleRegenerate}
            disabled={loading}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Regenerujem preklady pre všetky Prosto House domy...
              </>
            ) : (
              <>
                <Languages className="mr-2 w-5 h-5" />
                Spustiť regeneráciu
              </>
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg"
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
              className="mt-6 space-y-4"
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
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}