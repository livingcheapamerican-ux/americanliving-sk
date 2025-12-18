import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

export default function AdminTestGeminiAuto() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const testAPI = async () => {
    setLoading(true);
    setAttempts(prev => prev + 1);
    
    try {
      const response = await base44.functions.invoke('testGeminiAPI', {});
      setResult(response.data);
      
      // Ak test neprešiel a máme menej ako 5 pokusov, skúsime znova po 3 sekundách
      if (!response.data.success && attempts < 5) {
        setTimeout(() => testAPI(), 3000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
      
      // Retry aj pri chybe
      if (attempts < 5) {
        setTimeout(() => testAPI(), 3000);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Automatický Test Gemini API</h1>
        
        <Card className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Počet pokusov: {attempts}/5</p>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Testujem API kľúč...</span>
            </div>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Úspech!' : 'Chyba'}
                </span>
              </div>
              
              {result.message && (
                <p className="text-sm text-gray-700 mb-2">{result.message}</p>
              )}
              
              {result.testResponse && (
                <div className="mt-2 p-2 bg-white rounded">
                  <p className="text-xs text-gray-500 mb-1">Odpoveď z Gemini:</p>
                  <p className="text-sm">{result.testResponse}</p>
                </div>
              )}
              
              {result.error && (
                <div className="mt-2">
                  <p className="text-sm text-red-700 font-semibold">{result.error}</p>
                  {result.details && (
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                      {result.details}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && !result?.success && (
            <button
              onClick={() => {
                setAttempts(0);
                testAPI();
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Skúsiť znova
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}