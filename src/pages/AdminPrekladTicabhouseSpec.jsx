import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPrekladTicabhouseSpec() {
  const [translating, setTranslating] = useState(false);
  const [results, setResults] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const handleTranslate = async () => {
    setTranslating(true);
    setResults([]);
    
    try {
      const response = await base44.functions.invoke('translateTicabhouseSpecs', {});
      setResults(response.data.results || []);
      toast.success(`Preložené: ${response.data.summary.success} domov`);
    } catch (error) {
      toast.error('Chyba: ' + error.message);
    } finally {
      setTranslating(false);
    }
  };

  if (!user?.super_admin) {
    return <div className="p-8">Nemáte oprávnenie</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Languages className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Preklad Ticabhouse Špecifikácií</h1>
            <p className="text-sm text-gray-600">Automatický preklad do všetkých jazykov</p>
          </div>
        </div>

        <Button 
          onClick={handleTranslate}
          disabled={translating}
          size="lg"
          className="mb-6"
        >
          {translating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Prekladám...
            </>
          ) : (
            <>
              <Languages className="w-5 h-5 mr-2" />
              Spustiť preklad všetkých Ticabhouse domov
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Výsledky:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                {result.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : result.status === 'error' ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className="font-medium">{result.nazov}</span>
                <span className="text-gray-500">- {result.status}</span>
                {result.translatedLanguages && (
                  <span className="text-green-600">({result.translatedLanguages} jazykov)</span>
                )}
                {result.reason && (
                  <span className="text-gray-500">({result.reason})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}