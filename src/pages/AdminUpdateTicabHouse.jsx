import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, RefreshCw, Database } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminUpdateTicabHouse() {
  const [result, setResult] = useState(null);

  const { data: ticabDomy = [] } = useQuery({
    queryKey: ['ticab-domy'],
    queryFn: () => base44.entities.Dom.filter({ vyrobca: "Ticab house" }),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateTicabHouseDescriptions', {});
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Aktualizovaných ${data.updates?.length || 0} domov`);
    },
    onError: (error) => {
      toast.error('Chyba pri aktualizácii');
      console.error(error);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Aktualizácia Ticab House domov
          </h1>
          <p className="text-gray-600">
            Doplnenie technických špecifikácií a rozmerov pre Ticab house domy
          </p>
        </div>

        {/* Current Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Aktuálny stav</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{ticabDomy.length}</div>
              <div className="text-sm text-gray-600">Ticab house domov v databáze</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {ticabDomy.filter(d => d.specifikacia).length}
              </div>
              <div className="text-sm text-gray-600">S vyplnenou špecifikáciou</div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Kliknutím na tlačidlo spustíte automatickú aktualizáciu všetkých Ticab house domov
            </p>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Aktualizujem...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Spustiť aktualizáciu
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold">Výsledky aktualizácie</h2>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <p className="text-green-800 font-semibold">{result.message}</p>
              </div>

              {result.updates && result.updates.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 mb-3">Aktualizované domy:</h3>
                  {result.updates.map((update, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <span className="font-medium">{update.nazov}</span>
                      <div className="flex gap-2">
                        {update.updated.map((field, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* List of Ticab Domy */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-bold mb-4">Zoznam Ticab house domov</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {ticabDomy.map((dom) => (
              <div key={dom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{dom.nazov}</div>
                  <div className="text-xs text-gray-500">{dom.zastavana_plocha} m²</div>
                </div>
                <div className="flex items-center gap-2">
                  {dom.specifikacia ? (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Vyplnené
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Chýba
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}