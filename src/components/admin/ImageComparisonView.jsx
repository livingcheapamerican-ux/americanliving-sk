import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeftRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ImageComparisonView({ dokumenty }) {
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showSelectorDialog, setShowSelectorDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const analyzovaneDokumenty = dokumenty.filter(d => d.vizualna_analyza && d.podrobna_analyza_datum);

  const addToComparison = (dok) => {
    if (selectedForComparison.length < 4 && !selectedForComparison.find(d => d.id === dok.id)) {
      setSelectedForComparison([...selectedForComparison, dok]);
    }
  };

  const removeFromComparison = (docId) => {
    setSelectedForComparison(selectedForComparison.filter(d => d.id !== docId));
  };

  const filteredDokumenty = analyzovaneDokumenty.filter(dok => 
    dok.nazov.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dok.vyrobca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dok.model_domu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">🔍 Vizuálne porovnanie obrázkov</h3>
          <p className="text-sm text-gray-600">
            Porovnajte až 4 obrázky vedľa seba
          </p>
        </div>
        {selectedForComparison.length < 4 && (
          <Button onClick={() => setShowSelectorDialog(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Pridať obrázok
          </Button>
        )}
      </div>

      {selectedForComparison.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ArrowLeftRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Žiadne obrázky na porovnanie</p>
          <Button onClick={() => setShowSelectorDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Pridať prvý obrázok
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          selectedForComparison.length === 1 ? 'grid-cols-1' :
          selectedForComparison.length === 2 ? 'grid-cols-2' :
          selectedForComparison.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 lg:grid-cols-4'
        }`}>
          {selectedForComparison.map((dok) => {
            const analyza = dok.vizualna_analyza;
            return (
              <Card key={dok.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={dok.subor_url} 
                    alt={dok.nazov}
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removeFromComparison(dok.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-sm mb-1">{dok.nazov}</p>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{analyza?.typ_obsahu}</Badge>
                      {analyza?.spravny_vyrobca && (
                        <Badge variant="secondary" className="text-xs">{analyza.spravny_vyrobca}</Badge>
                      )}
                    </div>
                  </div>

                  {analyza?.fasada_materialy && analyza.fasada_materialy.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Materiály:</p>
                      <div className="flex flex-wrap gap-1">
                        {analyza.fasada_materialy.slice(0, 3).map((mat, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{mat}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analyza?.fasada_farby && analyza.fasada_farby.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Farby:</p>
                      <div className="flex flex-wrap gap-1">
                        {analyza.fasada_farby.slice(0, 3).map((farba, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{farba}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analyza?.okna_typ && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Okná: <span className="font-normal">{analyza.okna_typ}</span></p>
                    </div>
                  )}

                  {analyza?.strecha_typ && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Strecha: <span className="font-normal">{analyza.strecha_typ}</span></p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selector Dialog */}
      <Dialog open={showSelectorDialog} onOpenChange={setShowSelectorDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vyberte obrázok na porovnanie</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Hľadať podľa názvu, výrobcu, modelu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid grid-cols-3 gap-4">
              {filteredDokumenty.slice(0, 30).map((dok) => (
                <Card 
                  key={dok.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    addToComparison(dok);
                    if (selectedForComparison.length >= 3) {
                      setShowSelectorDialog(false);
                    }
                  }}
                >
                  <img 
                    src={dok.subor_url} 
                    alt={dok.nazov}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs font-semibold truncate">{dok.nazov}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {dok.vizualna_analyza?.typ_obsahu || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}