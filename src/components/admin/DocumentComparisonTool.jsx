import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, GitCompare, Search, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function DocumentComparisonTool() {
  const [doc1Id, setDoc1Id] = useState("");
  const [doc2Id, setDoc2Id] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: recentDocs } = useQuery({
    queryKey: ['recent-docs', searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        return await base44.entities.Dokument.filter(
          { nazov: { $regex: searchQuery, $options: 'i' } },
          '-created_date',
          20
        );
      }
      return await base44.entities.Dokument.list('-created_date', 20);
    }
  });

  const compareMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('porovnajDokumenty', {
        document_id1: doc1Id,
        document_id2: doc2Id,
        threshold: 0.7
      });
      return response.data;
    },
    onSuccess: (data) => {
      setComparisonResult(data);
      toast.success('Porovnanie dokončené!');
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
    }
  });

  const getSimilarityColor = (percent) => {
    if (percent >= 80) return 'text-red-600 bg-red-50';
    if (percent >= 60) return 'text-yellow-600 bg-yellow-50';
    if (percent >= 40) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getSimilarityIcon = (percent) => {
    if (percent >= 80) return <AlertCircle className="w-5 h-5" />;
    if (percent >= 60) return <CheckCircle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <h3 className="text-xl font-bold text-cyan-900 mb-4 flex items-center gap-2">
          <GitCompare className="w-6 h-6" />
          Porovnanie dokumentov pomocou AI
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Porovnaj dva dokumenty na základe obsahu, kľúčových informácií a AI analýzy
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Hľadať dokumenty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dokument 1
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {recentDocs?.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setDoc1Id(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      doc1Id === doc.id
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 truncate">{doc.nazov}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{doc.typ}</Badge>
                      <Badge variant="outline" className="text-xs">{doc.vyrobca}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dokument 2
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {recentDocs?.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setDoc2Id(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      doc2Id === doc.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 truncate">{doc.nazov}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{doc.typ}</Badge>
                      <Badge variant="outline" className="text-xs">{doc.vyrobca}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={() => compareMutation.mutate()}
            disabled={!doc1Id || !doc2Id || compareMutation.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
            size="lg"
          >
            {compareMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Porovnávam...
              </>
            ) : (
              <>
                <GitCompare className="w-5 h-5 mr-2" />
                Porovnať dokumenty
              </>
            )}
          </Button>
        </div>
      </Card>

      {comparisonResult && (
        <Card className="p-6">
          <h4 className="font-bold text-lg mb-4">📊 Výsledky porovnania</h4>

          <div className={`rounded-xl p-6 mb-6 ${getSimilarityColor(comparisonResult.similarity.total)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getSimilarityIcon(comparisonResult.similarity.total)}
                <div>
                  <h5 className="font-bold text-xl">{comparisonResult.similarity.total}% podobnosť</h5>
                  <p className="text-sm mt-1">{comparisonResult.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-cyan-50 border-cyan-200">
              <h5 className="font-semibold mb-2">📄 {comparisonResult.document1.nazov}</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Typ:</span> {comparisonResult.document1.typ}</p>
                <p><span className="font-medium">Výrobca:</span> {comparisonResult.document1.vyrobca}</p>
                {comparisonResult.document1.model_domu && (
                  <p><span className="font-medium">Model:</span> {comparisonResult.document1.model_domu}</p>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <h5 className="font-semibold mb-2">📄 {comparisonResult.document2.nazov}</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Typ:</span> {comparisonResult.document2.typ}</p>
                <p><span className="font-medium">Výrobca:</span> {comparisonResult.document2.vyrobca}</p>
                {comparisonResult.document2.model_domu && (
                  <p><span className="font-medium">Model:</span> {comparisonResult.document2.model_domu}</p>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{comparisonResult.similarity.hash}%</p>
              <p className="text-xs text-gray-600 mt-1">Hash podobnosť</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{comparisonResult.similarity.tags}%</p>
              <p className="text-xs text-gray-600 mt-1">Tagy</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{comparisonResult.similarity.semantic}%</p>
              <p className="text-xs text-gray-600 mt-1">Sémantická</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{comparisonResult.similarity.structured}%</p>
              <p className="text-xs text-gray-600 mt-1">Štruktúrovaná</p>
            </div>
          </div>

          {comparisonResult.common_tags?.length > 0 && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">🏷️ Spoločné tagy ({comparisonResult.common_tags.length})</h5>
              <div className="flex flex-wrap gap-2">
                {comparisonResult.common_tags.map((tag, i) => (
                  <Badge key={i} className="bg-purple-600">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {comparisonResult.structured_comparison && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h5 className="font-semibold mb-3">🔍 Porovnanie štruktúrovaných dát</h5>
              <p className="text-sm text-gray-700 mb-2">
                Typ: <Badge>{comparisonResult.structured_comparison.type}</Badge>
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(comparisonResult.structured_comparison)
                  .filter(([key]) => key !== 'type')
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-gray-700">{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {comparisonResult.ai_analysis && (
            <Card className="p-4 bg-purple-50 border-purple-200 mt-4">
              <h5 className="font-semibold mb-3">🤖 AI Analýza</h5>
              <div className="space-y-3 text-sm">
                {comparisonResult.ai_analysis.spolocne_temy?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Spoločné témy:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {comparisonResult.ai_analysis.spolocne_temy.map((tema, i) => (
                        <li key={i}>{tema}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparisonResult.ai_analysis.hlavne_rozdiely?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Hlavné rozdiely:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {comparisonResult.ai_analysis.hlavne_rozdiely.map((rozdiel, i) => (
                        <li key={i}>{rozdiel}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparisonResult.ai_analysis.klucove_zistenia?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Kľúčové zistenia:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {comparisonResult.ai_analysis.klucove_zistenia.map((zistenie, i) => (
                        <li key={i}>{zistenie}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </Card>
      )}
    </div>
  );
}