import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function MigraciaObrazkovLyon() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runMigration = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('migraciaObrazkovLyon', {});
        setResult(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    runMigration();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">Migrácia obrázkov prebieha...</h2>
          <p className="text-gray-600">Sťahujem a nahráva obrázky z pôvodnej stránky</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-8 border-red-500">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-4 text-red-600">Chyba</h2>
          <p className="text-gray-700">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="p-8">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold mb-4 text-center">Migrácia dokončená</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-3xl font-bold text-blue-600">{result?.summary?.total || 0}</div>
            <div className="text-sm text-gray-600">Celkom</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-3xl font-bold text-green-600">{result?.summary?.success || 0}</div>
            <div className="text-sm text-gray-600">Úspešné</div>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <div className="text-3xl font-bold text-red-600">{result?.summary?.failed || 0}</div>
            <div className="text-sm text-gray-600">Neúspešné</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-3xl font-bold text-gray-600">{result?.summary?.skipped || 0}</div>
            <div className="text-sm text-gray-600">Preskočené</div>
          </div>
        </div>

        {result?.details?.success && result.details.success.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2 text-green-700">✓ Úspešne migrované:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {result.details.success.map((item, idx) => (
                <div key={idx} className="text-sm bg-green-50 p-2 rounded">
                  <span className="font-medium">{item.polozka_id}</span> - {item.action}
                </div>
              ))}
            </div>
          </div>
        )}

        {result?.details?.failed && result.details.failed.length > 0 && (
          <div>
            <h3 className="font-bold mb-2 text-red-700">✗ Neúspešné:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {result.details.failed.map((item, idx) => (
                <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                  <span className="font-medium">{item.polozka_id}</span>: {item.error}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}