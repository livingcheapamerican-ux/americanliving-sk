import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AdminTestGemini() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('testGeminiAPI', {});
      setResult(response.data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Gemini API</h1>
        
        <Card className="p-6">
          <Button 
            onClick={testAPI} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testujem...
              </>
            ) : (
              'Otestovať API kľúč'
            )}
          </Button>

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
                <p className="text-sm text-red-700">{result.error}</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}