import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, FileSpreadsheet, AlertCircle, Save, CheckCircle, RefreshCw, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminCennik() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [editedPrices, setEditedPrices] = useState({}); // { domId: { key: newPrice } }
  const [isSaving, setIsSaving] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-600">Táto stránka je dostupná len pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast.error('Prosím nahrajte Excel súbor (.xlsx, .xls alebo .csv)');
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
      setEditedPrices({});
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Prosím najprv vyberte Excel súbor');
      return;
    }

    setIsUploading(true);
    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file: selectedFile });
      const fileUrl = uploadResponse.file_url;

      toast.success('Súbor nahraný, analyzujem všetky domy...');

      const response = await base44.functions.invoke('analyzeProstoHouseCennik', {
        file_url: fileUrl
      });

      console.log('📊 Backend response:', response.data);
      setAnalysisResult(response.data);

      if (response.data.success) {
        // Predvyplniť editedPrices novými cenami z Excelu
        const initialEdits = {};
        if (response.data.results) {
          response.data.results.forEach(domResult => {
            if (domResult.status === 'ready') {
              initialEdits[domResult.domId] = {};
              domResult.polozky.forEach(polozka => {
                initialEdits[domResult.domId][polozka.key] = polozka.newPrice;
              });
            }
          });
        }
        setEditedPrices(initialEdits);
        
        toast.success(`✅ Nájdených ${response.data.found || 0} domov, ${response.data.not_found || 0} nenájdených`);
      } else {
        toast.error(`❌ ${response.data.error || 'Neznáma chyba pri analýze'}`);
      }
    } catch (error) {
      console.error('Chyba:', error);
      toast.error('Chyba pri spracovaní: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePriceEdit = (domId, key, newValue) => {
    setEditedPrices(prev => ({
      ...prev,
      [domId]: {
        ...(prev[domId] || {}),
        [key]: newValue
      }
    }));
  };

  const handleSaveSingleDom = async (domResult) => {
    if (!editedPrices[domResult.domId]) {
      toast.error('Žiadne zmeny na uloženie');
      return;
    }

    setIsSaving(true);
    try {
      const isTicab = domResult.vyrobca === 'Ticab house';
      const updateData = {};
      const newPrices = {};
      const baseData = {};

      for (const [key, value] of Object.entries(editedPrices[domResult.domId])) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) continue;

        if (key.startsWith('__')) {
          baseData[key.replace(/__/g, '')] = numValue;
        } else {
          newPrices[key] = numValue;
        }
      }

      if (Object.keys(newPrices).length > 0) {
        if (isTicab) {
          updateData.konfigurator_ceny = newPrices;
        } else {
          updateData.konfigurator_custom_ceny_prosto_house = newPrices;
        }
      }

      if (baseData.zakladna_cena) updateData.zakladna_cena = baseData.zakladna_cena;
      if (baseData.zastavana_plocha) updateData.zastavana_plocha = baseData.zastavana_plocha;
      if (baseData.uzitkova_plocha) updateData.uzitkova_plocha = baseData.uzitkova_plocha;

      await base44.entities.Dom.update(domResult.domId, updateData);
      toast.success(`✅ Ceny uložené pre ${domResult.domNazov}!`);
      
      // Vyčistiť edity pre tento dom
      setEditedPrices(prev => {
        const newEdits = { ...prev };
        delete newEdits[domResult.domId];
        return newEdits;
      });
    } catch (error) {
      toast.error('Chyba pri ukladaní: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!analysisResult || !analysisResult.results) {
      toast.error('Najprv analyzujte Excel');
      return;
    }

    const readyDoms = analysisResult.results.filter(r => r.status === 'ready' && editedPrices[r.domId]);
    if (readyDoms.length === 0) {
      toast.error('Žiadne zmeny na uloženie');
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const domResult of readyDoms) {
      try {
        const isTicab = domResult.vyrobca === 'Ticab house';
        const updateData = {};
        const newPrices = {};
        const baseData = {};

        for (const [key, value] of Object.entries(editedPrices[domResult.domId] || {})) {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) continue;

          if (key.startsWith('__')) {
            baseData[key.replace(/__/g, '')] = numValue;
          } else {
            newPrices[key] = numValue;
          }
        }

        if (Object.keys(newPrices).length > 0) {
          if (isTicab) {
            updateData.konfigurator_ceny = newPrices;
          } else {
            updateData.konfigurator_custom_ceny_prosto_house = newPrices;
          }
        }

        if (baseData.zakladna_cena) updateData.zakladna_cena = baseData.zakladna_cena;
        if (baseData.zastavana_plocha) updateData.zastavana_plocha = baseData.zastavana_plocha;
        if (baseData.uzitkova_plocha) updateData.uzitkova_plocha = baseData.uzitkova_plocha;

        await base44.entities.Dom.update(domResult.domId, updateData);
        successCount++;
      } catch (error) {
        console.error(`Chyba pri ukladaní ${domResult.domNazov}:`, error);
        errorCount++;
      }
    }

    toast.success(`✅ Uložených ${successCount} domov! ${errorCount > 0 ? `${errorCount} chýb.` : ''}`);
    setIsSaving(false);
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <FileSpreadsheet className="w-10 h-10 text-blue-600" />
            Price Review Dashboard
          </h1>
          <p className="text-gray-600">
            Interaktívny nástroj na kontrolu a úpravu cien pred uložením
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-6 bg-white border-2 border-gray-200 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6 text-purple-600" />
            Nahrať Master Cenník
          </h2>

          <div className="mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {selectedFile ? selectedFile.name : 'Kliknite alebo pretiahnite Excel súbor'}
                </p>
                <p className="text-xs text-gray-400">
                  Podporované: .xlsx, .xls, .csv
                </p>
              </label>
            </div>
          </div>

          <Button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isUploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Analyzujem...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Analyzovať Master Tabuľku
              </>
            )}
          </Button>
        </Card>

        {/* Debug Output Section */}
        {analysisResult && (
          <Card className="p-4 mb-6 bg-gray-100 border-2 border-gray-300">
            <h3 className="text-sm font-bold text-gray-700 mb-2">🐛 DEBUG: Surový výstup zo servera</h3>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </Card>
        )}

        {/* Results Section */}
        {analysisResult && analysisResult.success && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 text-center">
                <p className="text-3xl font-black text-green-700">{analysisResult.found || 0}</p>
                <p className="text-sm text-gray-600">Nájdených domov</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200 text-center">
                <p className="text-3xl font-black text-red-700">{analysisResult.not_found || 0}</p>
                <p className="text-sm text-gray-600">Nenájdených</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 text-center">
                <p className="text-3xl font-black text-blue-700">
                  {analysisResult.results.reduce((sum, r) => sum + (r.changesCount || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Celkový počet zmien</p>
              </div>
            </div>

            {/* Price Review per House */}
            <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Kontrola a úprava cien
              </h2>

              {!analysisResult.results || analysisResult.results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-semibold">Žiadne dáta na zobrazenie</p>
                  <p className="text-sm mt-2">Skontrolujte DEBUG výstup vyššie</p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {analysisResult.results
                  .filter(r => r.status === 'ready')
                  .map((domResult) => {
                    const domEdits = editedPrices[domResult.domId] || {};
                    const changedCount = domResult.polozky.filter(p => p.isChanged).length;
                    
                    return (
                      <AccordionItem 
                        key={domResult.domId} 
                        value={domResult.domId}
                        className="border-2 border-gray-200 rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg">{domResult.domNazov}</span>
                              <Badge className="bg-purple-600 text-white">{domResult.vyrobca}</Badge>
                            </div>
                            <Badge className={`${changedCount > 0 ? 'bg-yellow-500' : 'bg-gray-400'} text-white`}>
                              Zmeny: {changedCount}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 py-4 bg-gray-50">
                          {/* Tabuľka porovnania cien */}
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="px-3 py-2 text-left font-bold">Položka</th>
                                  <th className="px-3 py-2 text-right font-bold">Stará cena</th>
                                  <th className="px-3 py-2 text-right font-bold">Nová cena</th>
                                  <th className="px-3 py-2 text-right font-bold">Finálna cena</th>
                                  <th className="px-3 py-2 text-center font-bold">Δ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {domResult.polozky.map((polozka) => {
                                  const finalPrice = domEdits[polozka.key] !== undefined 
                                    ? domEdits[polozka.key] 
                                    : polozka.newPrice;
                                  const isManuallyEdited = domEdits[polozka.key] !== polozka.newPrice;
                                  
                                  return (
                                    <tr 
                                      key={polozka.key} 
                                      className={`border-t ${polozka.isChanged ? 'bg-yellow-50' : 'bg-white'}`}
                                    >
                                      <td className="px-3 py-2 font-medium">{polozka.label}</td>
                                      <td className="px-3 py-2 text-right text-gray-600">
                                        {polozka.oldPrice.toLocaleString('sk-SK')} €
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-blue-700">
                                        {polozka.newPrice.toLocaleString('sk-SK')} €
                                      </td>
                                      <td className="px-3 py-2">
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={finalPrice}
                                          onChange={(e) => handlePriceEdit(domResult.domId, polozka.key, e.target.value)}
                                          className={`text-right font-bold h-8 ${isManuallyEdited ? 'border-orange-500 bg-orange-50' : ''}`}
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {polozka.isChanged && (
                                          polozka.newPrice > polozka.oldPrice ? (
                                            <ArrowUpCircle className="w-5 h-5 text-red-500 mx-auto" />
                                          ) : (
                                            <ArrowDownCircle className="w-5 h-5 text-green-500 mx-auto" />
                                          )
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Save button pre tento dom */}
                          <Button
                            onClick={() => handleSaveSingleDom(domResult)}
                            disabled={isSaving}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                          >
                            <Save className="w-5 h-5 mr-2" />
                            Uložiť tento dom ({domResult.domNazov})
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    );
                    })}
                    </Accordion>
                    )}

                    {/* Not found houses */}
                    {analysisResult.results && analysisResult.results.filter(r => r.status === 'not_found').length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <h3 className="font-bold text-red-900 mb-2">❌ Nenájdené domy v databáze:</h3>
                  <ul className="space-y-1 text-sm">
                    {analysisResult.results
                      .filter(r => r.status === 'not_found')
                      .map((r, idx) => (
                        <li key={idx} className="text-red-700">• {r.domNazov}</li>
                      ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Bulk Save All */}
            {analysisResult.success && analysisResult.found > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-400 rounded-xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black text-red-900 mb-1">
                      🔥 {analysisResult.found} domov pripravených na uloženie
                    </p>
                    <p className="text-sm text-red-700 font-semibold">
                      Skontrolovali ste všetky ceny? Kliknite pre hromadné uloženie!
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-lg px-8 py-6 h-auto shadow-xl whitespace-nowrap"
                  >
                    {isSaving ? '⏳ Ukladám...' : '💾 ULOŽIŤ VŠETKY DOMY'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}