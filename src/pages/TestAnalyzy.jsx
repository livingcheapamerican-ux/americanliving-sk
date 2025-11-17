import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, CheckCircle, XCircle, Image as ImageIcon, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import DocumentComparisonTool from "../components/admin/DocumentComparisonTool";

export default function TestAnalyzy() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [result, setResult] = useState(null);

  const { data: testPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ['test-photos'],
    queryFn: async () => {
      return await base44.entities.Dokument.filter(
        { typ: "fotky", vizualna_analyza: null },
        '-created_date',
        5
      );
    }
  });

  const { data: testDocs, isLoading: docsLoading } = useQuery({
    queryKey: ['test-docs'],
    queryFn: async () => {
      return await base44.entities.Dokument.filter(
        { 
          typ: { $in: ["zmluva", "faktúra", "ponuka", "objednávka", "cenník"] },
          "kľúčové_informácie": null
        },
        '-created_date',
        5
      );
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (docId) => {
      const response = await base44.functions.invoke('analyzujDokument', {
        document_id: docId
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Analýza dokončená!');
      setResult(data);
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
      setResult({ error: error.message });
    }
  });

  const { data: analyzedDoc, refetch: refetchDoc } = useQuery({
    queryKey: ['analyzed-doc', selectedDoc],
    queryFn: async () => {
      if (!selectedDoc) return null;
      const docs = await base44.entities.Dokument.filter({ id: selectedDoc });
      return docs[0];
    },
    enabled: !!selectedDoc && !!result?.success
  });

  if (photosLoading || docsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🧪 Test AI Analýzy
          </h1>
          <p className="text-gray-600">Testovanie AI analýzy obrázkov a dokumentov, plus porovnávanie</p>
        </div>

        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photos">🖼️ Fotky</TabsTrigger>
            <TabsTrigger value="documents">📄 Dokumenty</TabsTrigger>
            <TabsTrigger value="comparison">🔄 Porovnanie</TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Fotky na test ({testPhotos?.length || 0})
                </h3>
                
                {testPhotos && testPhotos.length > 0 ? (
                  <div className="space-y-3">
                    {testPhotos.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedDoc === doc.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc.id);
                          setResult(null);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={doc.subor_url}
                            alt={doc.nazov}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{doc.nazov}</p>
                            <p className="text-sm text-gray-600">
                              {doc.vyrobca} • {doc.model_domu}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {(doc.velkost / 1024).toFixed(1)} KB
                            </Badge>
                          </div>
                          {selectedDoc === doc.id && (
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Žiadne fotky bez analýzy</p>
                  </div>
                )}

                {selectedDoc && (
                  <Button
                    onClick={() => analyzeMutation.mutate(selectedDoc)}
                    disabled={analyzeMutation.isPending}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzujem...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Spustiť analýzu
                      </>
                    )}
                  </Button>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">📊 Výsledky analýzy</h3>
                
                {!result ? (
                  <div className="text-center py-20 text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Vyberte dokument a spustite analýzu</p>
                  </div>
                ) : result.error ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h4 className="font-bold text-red-900 mb-2 text-center">Chyba analýzy</h4>
                    <pre className="text-sm text-red-700 bg-red-100 p-3 rounded overflow-x-auto">
                      {result.error}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-bold text-green-900">Analýza úspešná!</p>
                        <p className="text-sm text-green-700">Typ: {result.type}</p>
                      </div>
                    </div>

                    {analyzedDoc && (
                      <>
                        {analyzedDoc.vizualna_analyza && (
                          <Card className="p-4 bg-purple-50 border-purple-200">
                            <h4 className="font-bold text-purple-900 mb-3">Vizuálna analýza</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-semibold">Výrobca:</span>{' '}
                                <Badge>{analyzedDoc.vizualna_analyza.spravny_vyrobca}</Badge>
                              </div>
                              <div>
                                <span className="font-semibold">Model:</span>{' '}
                                <Badge>{analyzedDoc.vizualna_analyza.spravny_model}</Badge>
                              </div>
                              <div>
                                <span className="font-semibold">Typ:</span>{' '}
                                <Badge>{analyzedDoc.vizualna_analyza.typ_obsahu}</Badge>
                              </div>
                              {analyzedDoc.vizualna_analyza.fasada_materialy?.length > 0 && (
                                <div>
                                  <span className="font-semibold">Materiály:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {analyzedDoc.vizualna_analyza.fasada_materialy.map((m, i) => (
                                      <Badge key={i} variant="outline">{m}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {analyzedDoc.vizualna_analyza.technicka_analyza && (
                                <div className="mt-3 p-3 bg-white rounded border">
                                  <p className="font-semibold mb-1">Technická analýza:</p>
                                  <p className="text-gray-700 text-xs">{analyzedDoc.vizualna_analyza.technicka_analyza}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}

                        {analyzedDoc.kľúčové_informácie && (
                          <Card className="p-4 bg-orange-50 border-orange-200">
                            <h4 className="font-bold text-orange-900 mb-3">Kľúčové informácie</h4>
                            <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
                              {JSON.stringify(analyzedDoc.kľúčové_informácie, null, 2)}
                            </pre>
                          </Card>
                        )}

                        <Button
                          onClick={() => refetchDoc()}
                          variant="outline"
                          className="w-full"
                        >
                          Obnoviť dáta
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Dokumenty na test ({testDocs?.length || 0})
                </h3>
                
                {testDocs && testDocs.length > 0 ? (
                  <div className="space-y-3">
                    {testDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedDoc === doc.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc.id);
                          setResult(null);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="w-12 h-12 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{doc.nazov}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{doc.typ}</Badge>
                              <Badge variant="outline">{doc.vyrobca}</Badge>
                            </div>
                          </div>
                          {selectedDoc === doc.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Žiadne dokumenty bez analýzy</p>
                  </div>
                )}

                {selectedDoc && (
                  <Button
                    onClick={() => analyzeMutation.mutate(selectedDoc)}
                    disabled={analyzeMutation.isPending}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzujem...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Spustiť analýzu
                      </>
                    )}
                  </Button>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">📊 Výsledky analýzy</h3>
                
                {!result ? (
                  <div className="text-center py-20 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Vyberte dokument a spustite analýzu</p>
                  </div>
                ) : result.error ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h4 className="font-bold text-red-900 mb-2 text-center">Chyba analýzy</h4>
                    <pre className="text-sm text-red-700 bg-red-100 p-3 rounded overflow-x-auto">
                      {result.error}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-bold text-green-900">Analýza úspešná!</p>
                        <p className="text-sm text-green-700">Typ: {result.type}</p>
                      </div>
                    </div>

                    {analyzedDoc?.kľúčové_informácie && (
                      <Card className="p-4 bg-blue-50 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-3">Extrahované dáta</h4>
                        <pre className="text-xs bg-white p-3 rounded overflow-x-auto max-h-96">
                          {JSON.stringify(analyzedDoc.kľúčové_informácie, null, 2)}
                        </pre>
                      </Card>
                    )}

                    <Button
                      onClick={() => refetchDoc()}
                      variant="outline"
                      className="w-full"
                    >
                      Obnoviť dáta
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <DocumentComparisonTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}