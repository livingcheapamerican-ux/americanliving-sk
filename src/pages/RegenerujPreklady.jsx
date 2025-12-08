import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, Languages } from "lucide-react";
import { motion } from "framer-motion";

export default function RegenerujPreklady() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await base44.functions.invoke('regenerujPrekladyProstoHouse', {});
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Languages className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Regenerácia prekladov</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Táto funkcia automaticky vygeneruje nové preklady popisov a špecifikácií pre všetky Prosto House domy do všetkých jazykov (EN, HU, PL, UK, DE, FR, SR, HR, EL).
          </p>

          <Button
            onClick={handleRegenerate}
            disabled={loading}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Regenerujem preklady...
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
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Chyba</p>
                  <p className="text-sm text-red-700">{error}</p>
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
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-800">
                    Úspešne spracovaných: {results.processed} domov
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-700">Výsledky:</p>
                {results.results?.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{result.dom}</span>
                      <div className="flex items-center gap-2">
                        {result.status === 'success' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              {result.translations} prekladov
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-yellow-600">{result.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}