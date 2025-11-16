import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DetailedAnalysisResults({ results, dokumenty }) {
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  if (!results || !results.processed || results.processed === 0) {
    return null;
  }

  const analyzovaneDokumenty = dokumenty.filter(d => d.vizualna_analyza && d.podrobna_analyza_datum);

  const toggleExpand = (docId) => {
    if (expandedRows.includes(docId)) {
      setExpandedRows(expandedRows.filter(id => id !== docId));
    } else {
      setExpandedRows([...expandedRows, docId]);
    }
  };

  const openImageDialog = (dok) => {
    setSelectedDoc(dok);
    setShowImageDialog(true);
  };

  return (
    <>
      <Card className="p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">📊 Podrobné výsledky analýzy</h3>
        
        <div className="space-y-2">
          {analyzovaneDokumenty.slice(0, 50).map((dok) => {
            const isExpanded = expandedRows.includes(dok.id);
            const analyza = dok.vizualna_analyza;

            return (
              <div key={dok.id} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(dok.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{dok.nazov}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {analyza?.typ_obsahu || 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analyza?.spravny_vyrobca || dok.vyrobca}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analyza?.spravny_model || dok.model_domu}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageDialog(dok);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4 bg-gray-50">
                    {/* Popis */}
                    {dok.ai_generovany_popis && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Popis:</p>
                        <p className="text-sm text-gray-700">{dok.ai_generovany_popis}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Fasáda */}
                      {analyza?.fasada_materialy && analyza.fasada_materialy.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Fasáda - Materiály:</p>
                          <div className="flex flex-wrap gap-1">
                            {analyza.fasada_materialy.map((mat, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{mat}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analyza?.fasada_farby && analyza.fasada_farby.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Fasáda - Farby:</p>
                          <div className="flex flex-wrap gap-1">
                            {analyza.fasada_farby.map((farba, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{farba}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Okná */}
                      {analyza?.okna_typ && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Okná - Typ:</p>
                          <Badge variant="outline" className="text-xs">{analyza.okna_typ}</Badge>
                        </div>
                      )}

                      {analyza?.okna_farba && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Okná - Farba:</p>
                          <Badge variant="outline" className="text-xs">{analyza.okna_farba}</Badge>
                        </div>
                      )}

                      {/* Dvere */}
                      {analyza?.dvere_typ && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Dvere - Typ:</p>
                          <Badge variant="outline" className="text-xs">{analyza.dvere_typ}</Badge>
                        </div>
                      )}

                      {analyza?.dvere_farba && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Dvere - Farba:</p>
                          <Badge variant="outline" className="text-xs">{analyza.dvere_farba}</Badge>
                        </div>
                      )}

                      {/* Strecha */}
                      {analyza?.strecha_typ && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Strecha - Typ:</p>
                          <Badge variant="outline" className="text-xs">{analyza.strecha_typ}</Badge>
                        </div>
                      )}

                      {analyza?.strecha_farba && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Strecha - Farba:</p>
                          <Badge variant="outline" className="text-xs">{analyza.strecha_farba}</Badge>
                        </div>
                      )}

                      {/* Stav fasády */}
                      {analyza?.stav_fasady && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Stav fasády:</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              analyza.stav_fasady === 'výborný' ? 'border-green-500 text-green-700' :
                              analyza.stav_fasady === 'dobrý' ? 'border-blue-500 text-blue-700' :
                              'border-orange-500 text-orange-700'
                            }`}
                          >
                            {analyza.stav_fasady}
                          </Badge>
                        </div>
                      )}

                      {/* Špecifická kategória */}
                      {analyza?.specificka_kategoria && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Kategória:</p>
                          <Badge variant="outline" className="text-xs">{analyza.specificka_kategoria}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Cesta priečinka */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Cesta priečinka:</p>
                      <p className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded">{dok.cesta_priecinku}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {analyzovaneDokumenty.length > 50 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Zobrazených prvých 50 z {analyzovaneDokumenty.length} dokumentov
          </p>
        )}
      </Card>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.nazov}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <img 
                src={selectedDoc.subor_url} 
                alt={selectedDoc.nazov}
                className="w-full h-auto rounded-lg"
              />
              {selectedDoc.ai_generovany_popis && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Popis:</p>
                  <p className="text-sm text-gray-700">{selectedDoc.ai_generovany_popis}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}