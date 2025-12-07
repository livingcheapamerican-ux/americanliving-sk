import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TestAnalyzaKonfiguratora() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzujStaryKonfigurator', {});
      setResult(response.data);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Analýza starého konfiguratora</h1>
        
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Analyzovať obrázky
        </Button>

        {result && (
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-[600px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
}