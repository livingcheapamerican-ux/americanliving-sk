import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FolderSync, Eye, Loader2, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DocumentTableWithBulkActions({ dokumenty, onRefresh }) {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [processing, setProcessing] = useState(false);

  const analyzovaneDokumenty = dokumenty.filter(d => d.vizualna_analyza && d.podrobna_analyza_datum);

  const toggleSelect = (docId) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    } else {
      setSelectedDocs([...selectedDocs, docId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedDocs.length === analyzovaneDokumenty.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(analyzovaneDokumenty.map(d => d.id));
    }
  };

  const handleBulkReorganize = async () => {
    if (selectedDocs.length === 0) return;

    if (!confirm(`Reorganizovať ${selectedDocs.length} označených súborov?`)) return;

    setProcessing(true);

    try {
      let success = 0;
      let failed = 0;

      for (const docId of selectedDocs) {
        const dok = dokumenty.find(d => d.id === docId);
        if (!dok || !dok.vizualna_analyza) continue;

        const analyza = dok.vizualna_analyza;

        if (!analyza.spravny_vyrobca || !analyza.spravny_model) {
          failed++;
          continue;
        }

        let typPriecinok = '';
        if (analyza.typ_obsahu === 'exterier') typPriecinok = '/exterier';
        else if (analyza.typ_obsahu === 'interier') typPriecinok = '/interier';
        else if (analyza.typ_obsahu === 'podorys') typPriecinok = '/podorysy';
        else if (analyza.typ_obsahu === 'detail') typPriecinok = '/detaily';

        const novaCesta = `${analyza.spravny_vyrobca}/${analyza.spravny_model}${typPriecinok}`;

        try {
          await base44.entities.Dokument.update(docId, {
            cesta_priecinku: novaCesta,
            vyrobca: analyza.spravny_vyrobca,
            model_domu: analyza.spravny_model,
            podpriecinok: typPriecinok ? typPriecinok.substring(1) : '',
            reorganizovany: true,
            reorganizovany_datum: new Date().toISOString()
          });
          success++;
        } catch (err) {
          failed++;
        }
      }

      alert(`Reorganizácia dokončená!\nÚspešné: ${success}\nChyby: ${failed}`);
      setSelectedDocs([]);
      if (onRefresh) onRefresh();
    } catch (error) {
      alert(`Chyba: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Analyzované dokumenty</h3>
          <p className="text-sm text-gray-600">
            {selectedDocs.length > 0 ? `Označené: ${selectedDocs.length} / ${analyzovaneDokumenty.length}` : `Celkom: ${analyzovaneDokumenty.length}`}
          </p>
        </div>
        {selectedDocs.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={handleBulkReorganize}
              disabled={processing}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reorganizujem...
                </>
              ) : (
                <>
                  <FolderSync className="w-4 h-4 mr-2" />
                  Reorganizovať ({selectedDocs.length})
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">
                <Checkbox
                  checked={selectedDocs.length === analyzovaneDokumenty.length && analyzovaneDokumenty.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="text-left p-3 font-semibold">Názov</th>
              <th className="text-left p-3 font-semibold">Výrobca</th>
              <th className="text-left p-3 font-semibold">Model</th>
              <th className="text-left p-3 font-semibold">Typ obsahu</th>
              <th className="text-left p-3 font-semibold">Cesta</th>
              <th className="text-left p-3 font-semibold">Stav</th>
            </tr>
          </thead>
          <tbody>
            {analyzovaneDokumenty.map((dok) => (
              <tr key={dok.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedDocs.includes(dok.id)}
                    onCheckedChange={() => toggleSelect(dok.id)}
                  />
                </td>
                <td className="p-3 font-medium text-sm">{dok.nazov}</td>
                <td className="p-3 text-sm">{dok.vizualna_analyza?.spravny_vyrobca || dok.vyrobca}</td>
                <td className="p-3 text-sm">{dok.vizualna_analyza?.spravny_model || dok.model_domu}</td>
                <td className="p-3">
                  <Badge variant="outline">{dok.vizualna_analyza?.typ_obsahu || 'N/A'}</Badge>
                </td>
                <td className="p-3 text-sm text-gray-600">{dok.cesta_priecinku}</td>
                <td className="p-3">
                  {dok.reorganizovany ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}