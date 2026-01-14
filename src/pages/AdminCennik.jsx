import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Home, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminCennik() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedDom, setSelectedDom] = useState(null);
  const [editedPrices, setEditedPrices] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVyrobca, setSelectedVyrobca] = useState(null);
  const [excelPrices, setExcelPrices] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['all-houses'],
    queryFn: () => base44.entities.Dom.list(),
    initialData: []
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
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Prosím nahrajte Excel súbor (.xlsx alebo .xls)');
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Prosím najprv vyberte Excel súbor');
      return;
    }

    if (!selectedVyrobca) {
      toast.error('Prosím vyberte výrobcu');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Najprv nahrať súbor
      const uploadResponse = await base44.integrations.Core.UploadFile({ file: selectedFile });
      const fileUrl = uploadResponse.file_url;

      toast.success('Súbor nahraný, analyzujem...');

      // 2. Zavolať backend funkciu len na analýzu (bez ukladania)
      const response = await base44.functions.invoke('analyzeCennikFromExcel', {
        file_url: fileUrl,
        vyrobca: selectedVyrobca
      });

      if (response.data.success) {
        setExcelPrices(response.data.parsed_prices);
        setAnalysisResult(response.data);
        toast.success(`Načítaných ${response.data.found_count} položiek z Excelu`);
      } else {
        throw new Error(response.data.error || 'Neznáma chyba');
      }
    } catch (error) {
      console.error('Chyba:', error);
      toast.error('Chyba pri spracovaní: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyPricesToDom = async () => {
    if (!excelPrices || !selectedDom) {
      toast.error('Najprv analyzujte Excel a vyberte dom');
      return;
    }

    setIsSaving(true);
    try {
      const dom = domy.find(d => d.id === selectedDom);
      const isTicab = dom.vyrobca === 'Ticab house';

      const existingPrices = isTicab 
        ? (dom.konfigurator_ceny || {})
        : (dom.konfigurator_custom_ceny_prosto_house || {});

      const updatedPrices = { ...existingPrices, ...excelPrices };

      const updateData = isTicab
        ? { konfigurator_ceny: updatedPrices }
        : { konfigurator_custom_ceny_prosto_house: updatedPrices };

      await base44.entities.Dom.update(dom.id, updateData);
      
      toast.success(`Ceny aplikované na ${dom.nazov}!`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Chyba pri aplikovaní cien: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const ticabDomy = domy.filter(d => d.vyrobca === 'Ticab house');
  const prostoDomy = domy.filter(d => d.vyrobca === 'Prosto House');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <DollarSign className="w-10 h-10 text-blue-600" />
            Správa cenníkov
          </h1>
          <p className="text-gray-600">
            Nahrávajte Excel tabuľky a automaticky aktualizujte ceny pre konfigurátorov domov
          </p>
        </div>

        {/* Analýza súčasného stavu */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            Analýza prepojenia cien v konfigurátoroch
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-green-500">
              <h3 className="font-bold text-green-800 mb-2">✅ Ticab House - Správne prepojenie</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Ceny sú uložené v entite Dom v poli <code className="bg-gray-100 px-1 rounded">konfigurator_ceny</code></li>
                <li>• DEFAULT_CENY slúži ako záloha, ak dom nemá vlastné ceny</li>
                <li>• Cena v dlaždici: <code className="bg-gray-100 px-1 rounded">formatPrice(CENY.izolacia_stien_200mm)</code></li>
                <li>• Cena v súhrnnej tabuľke: <code className="bg-gray-100 px-1 rounded">CENY.izolacia_stien_200mm</code></li>
                <li>• Výpočet celkovej ceny používa presne tie isté hodnoty: <code className="bg-gray-100 px-1 rounded">price += CENY.izolacia_stien_200mm</code></li>
                <li className="font-semibold text-green-700">→ Prepojenie je na cent presné ✓</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-green-500">
              <h3 className="font-bold text-green-800 mb-2">✅ Prosto House - Správne prepojenie</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Ceny sú uložené v entite Dom v poli <code className="bg-gray-100 px-1 rounded">konfigurator_custom_ceny_prosto_house</code></li>
                <li>• DEFAULT_CENY slúži ako záloha, použije sa funkcia <code className="bg-gray-100 px-1 rounded">getPrice()</code></li>
                <li>• Cena v dlazdici: <code className="bg-gray-100 px-1 rounded">CENY.elektroinstalacia.toLocaleString()</code></li>
                <li>• Cena v súhrnnej tabuľke: <code className="bg-gray-100 px-1 rounded">CENY.elektroinstalacia</code></li>
                <li>• Výpočet celkovej ceny: <code className="bg-gray-100 px-1 rounded">if (elektroinstalacia) total += CENY.elektroinstalacia</code></li>
                <li className="font-semibold text-green-700">→ Prepojenie je na cent presné ✓</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <h3 className="font-bold text-blue-900 mb-2">📊 Záver analýzy:</h3>
              <p className="text-sm text-gray-700">
                Oba konfigurátorov (Ticab House aj Prosto House) majú správne prepojenie medzi cenou v dlaždici 
                a cenou v súhrnnej tabuľke. Používajú rovnakú premennú <code className="bg-white px-1 rounded">CENY</code>, 
                čo zabezpečuje konzistenciu. Pri nahratí novej master tabuľky stačí aktualizovať polia 
                <code className="bg-white px-1 rounded">konfigurator_ceny</code> (Ticab) a 
                <code className="bg-white px-1 rounded">konfigurator_custom_ceny_prosto_house</code> (Prosto) 
                v entite Dom.
              </p>
            </div>
          </div>
        </Card>

        {/* Výber výrobcu a domu */}
        <Card className="p-6 mb-6 bg-white border-2 border-purple-300 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-purple-600" />
            Vyberte dom pre správu cien
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Výber výrobcu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                1. Výrobca:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setSelectedVyrobca('Ticab house');
                    setSelectedDom(null);
                  }}
                  variant={selectedVyrobca === 'Ticab house' ? 'default' : 'outline'}
                  className={`h-14 text-sm font-bold ${selectedVyrobca === 'Ticab house' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  🏠 Ticab house
                </Button>
                <Button
                  onClick={() => {
                    setSelectedVyrobca('Prosto House');
                    setSelectedDom(null);
                  }}
                  variant={selectedVyrobca === 'Prosto House' ? 'default' : 'outline'}
                  className={`h-14 text-sm font-bold ${selectedVyrobca === 'Prosto House' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                >
                  🏡 Prosto House
                </Button>
              </div>
            </div>

            {/* Výber domu */}
            {selectedVyrobca && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Dom:
                </label>
                <select
                  value={selectedDom || ''}
                  onChange={(e) => setSelectedDom(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 h-14"
                >
                  <option value="">-- Vyberte dom --</option>
                  {selectedVyrobca === 'Ticab house' && ticabDomy.map(dom => (
                    <option key={dom.id} value={dom.id}>{dom.nazov}</option>
                  ))}
                  {selectedVyrobca === 'Prosto House' && prostoDomy.map(dom => (
                    <option key={dom.id} value={dom.id}>{dom.nazov}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Nahrávanie súboru */}
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-600" />
              Nahrať Master tabuľku
            </h2>

            {/* File upload */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Nahrajte Excel súbor s cenami:
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all">
                <input
                  type="file"
                  accept=".xlsx,.xls"
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
                    Podporované: .xlsx, .xls
                  </p>
                </label>
              </div>
            </div>

            <Button
              onClick={handleUploadAndAnalyze}
              disabled={!selectedFile || !selectedVyrobca || isUploading}
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
                  Analyzovať Excel súbor
                </>
              )}
            </Button>

            {/* Aplikovať ceny na vybraný dom */}
            {excelPrices && selectedDom && (
              <div className="mt-4">
                <Button
                  onClick={handleApplyPricesToDom}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  {isSaving ? 'Ukladám...' : `Aplikovať nové ceny na ${domy.find(d => d.id === selectedDom)?.nazov}`}
                </Button>
              </div>
            )}

            {/* Formát Excel súboru */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-bold text-blue-900 mb-2">📋 Očakávaný formát Excel tabuľky:</h3>
              <div className="text-xs text-gray-700 space-y-1">
                <p><strong>Stĺpec A:</strong> Názov položky (napr: "izolacia_stien_200mm", "tepelne_cerpadlo")</p>
                <p><strong>Stĺpec B:</strong> Nová cena (číslo, napr: 1799.16)</p>
                <p className="text-blue-700 font-semibold mt-2">Prvý riadok môže byť hlavička (preskočí sa)</p>
              </div>
            </div>
          </Card>

          {/* Výsledok analýzy */}
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Výsledok aktualizácie
            </h2>

            {!analysisResult ? (
              <div className="text-center py-12 text-gray-400">
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nahrajte súbor pre zobrazenie výsledkov</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Súhrn */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <p className="text-2xl font-black text-green-700">{analysisResult.updated_count}</p>
                    <p className="text-xs text-gray-600">Aktualizovaných</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <p className="text-2xl font-black text-blue-700">{analysisResult.skipped_count}</p>
                    <p className="text-xs text-gray-600">Preskočených</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                    <p className="text-2xl font-black text-red-700">{analysisResult.errors?.length || 0}</p>
                    <p className="text-xs text-gray-600">Chýb</p>
                  </div>
                </div>

                {/* Detail aktualizovaných položiek */}
                {analysisResult.updated_prices && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 max-h-64 overflow-y-auto">
                    <h3 className="font-bold text-green-900 mb-2">✅ Aktualizované položky:</h3>
                    <div className="space-y-1 text-xs">
                      {Object.entries(analysisResult.updated_prices).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center bg-white p-2 rounded">
                          <span className="font-mono text-gray-700">{key}</span>
                          <span className="font-bold text-green-700">{value.toLocaleString('sk-SK')} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chyby */}
                {analysisResult.errors && analysisResult.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-bold text-red-900 mb-2">⚠️ Chyby:</h3>
                    <ul className="space-y-1 text-xs text-red-700">
                      {analysisResult.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Aktuálne ceny pre vybraný dom */}
        {selectedDom && (
          <Card className="p-6 mt-6 bg-white border-2 border-gray-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-6 h-6 text-purple-600" />
              Aktuálne ceny pre: {domy.find(d => d.id === selectedDom)?.nazov}
            </h2>
            
            {(() => {
              const dom = domy.find(d => d.id === selectedDom);
              if (!dom) return null;

              const ceny = dom.vyrobca === 'Ticab house' 
                ? dom.konfigurator_ceny || {}
                : dom.konfigurator_custom_ceny_prosto_house || {};

              const isTicab = dom.vyrobca === 'Ticab house';
              const zakladnaCena = dom.zakladna_cena || 0;

              const handlePriceEdit = (key, newValue) => {
                setEditedPrices(prev => ({ ...prev, [key]: newValue }));
              };

              const handleBasePriceEdit = (newValue) => {
                setEditedPrices(prev => ({ ...prev, '__zakladna_cena__': newValue }));
              };

              const handleSaveSinglePrice = async (key) => {
                const newValue = editedPrices[key];
                const numValue = parseFloat(newValue);
                
                if (isNaN(numValue)) {
                  toast.error('Neplatná cena');
                  return;
                }

                setIsSaving(true);
                try {
                  if (key === '__zakladna_cena__') {
                    // Uložiť základnú cenu
                    await base44.entities.Dom.update(dom.id, { zakladna_cena: numValue });
                    toast.success(`Základná cena aktualizovaná na ${numValue.toLocaleString('sk-SK')} €`);
                  } else {
                    // Uložiť cenu položky
                    const updatedPrices = { ...ceny, [key]: numValue };
                    const updateData = isTicab
                      ? { konfigurator_ceny: updatedPrices }
                      : { konfigurator_custom_ceny_prosto_house: updatedPrices };

                    await base44.entities.Dom.update(dom.id, updateData);
                    toast.success(`Cena ${key} aktualizovaná na ${numValue.toLocaleString('sk-SK')} €`);
                  }
                  
                  // Vyčistiť editedPrices pre túto položku
                  setEditedPrices(prev => {
                    const newPrices = { ...prev };
                    delete newPrices[key];
                    return newPrices;
                  });
                  
                  // Invalidovať cache
                  setTimeout(() => window.location.reload(), 500);
                } catch (error) {
                  toast.error('Chyba pri ukladaní: ' + error.message);
                } finally {
                  setIsSaving(false);
                }
              };

              const handleSaveAllPrices = async () => {
                if (Object.keys(editedPrices).length === 0) {
                  toast.error('Žiadne zmeny na uloženie');
                  return;
                }

                setIsSaving(true);
                try {
                  const updatedPrices = { ...ceny };
                  const updateData = {};
                  
                  for (const [key, value] of Object.entries(editedPrices)) {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) continue;

                    if (key === '__zakladna_cena__') {
                      updateData.zakladna_cena = numValue;
                    } else {
                      updatedPrices[key] = numValue;
                    }
                  }

                  // Pridať ceny položiek
                  if (Object.keys(updatedPrices).length > Object.keys(ceny).length || 
                      JSON.stringify(updatedPrices) !== JSON.stringify(ceny)) {
                    if (isTicab) {
                      updateData.konfigurator_ceny = updatedPrices;
                    } else {
                      updateData.konfigurator_custom_ceny_prosto_house = updatedPrices;
                    }
                  }

                  await base44.entities.Dom.update(dom.id, updateData);
                  toast.success(`Uložených ${Object.keys(editedPrices).length} zmien cien!`);
                  
                  setEditedPrices({});
                  setTimeout(() => window.location.reload(), 500);
                } catch (error) {
                  toast.error('Chyba pri ukladaní: ' + error.message);
                } finally {
                  setIsSaving(false);
                }
              };

              return (
                <div>
                  {/* Header s názvom domu a základnou cenou */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{dom.nazov}</h3>
                      <Badge className="bg-purple-600 text-white">
                        {dom.vyrobca}
                      </Badge>
                    </div>
                    
                    {/* Základná cena domu (iba pre Ticab house) */}
                    {isTicab && (
                      <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          💰 Základná cena domu v konfigurátoře
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20">Aktuálna:</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedPrices['__zakladna_cena__'] !== undefined ? editedPrices['__zakladna_cena__'] : zakladnaCena}
                            onChange={(e) => handleBasePriceEdit(e.target.value)}
                            className="text-lg font-bold text-purple-700 flex-1"
                          />
                          <span className="text-sm text-gray-500 font-bold">€</span>
                          {editedPrices['__zakladna_cena__'] !== undefined && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveSinglePrice('__zakladna_cena__')}
                              disabled={isSaving}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 h-10"
                            >
                              ✓ Uložiť
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          K tejto cene sa pripočítavajú všetky vybrané položky v konfigurátoře
                        </p>
                      </div>
                    )}
                  </div>

                  {Object.keys(editedPrices).length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-bold text-blue-900">Máte {Object.keys(editedPrices).length} neuložených zmien</p>
                        <p className="text-xs text-blue-700">Kliknite na "Uložiť všetky" alebo uložte jednotlivo</p>
                      </div>
                      <Button
                        onClick={handleSaveAllPrices}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        {isSaving ? 'Ukladám...' : 'Uložiť všetky zmeny'}
                      </Button>
                    </div>
                  )}

                  {/* Tabuľka s cenami položiek konfiguratora */}
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-700 mb-3">
                      📋 Ceny položiek v konfigurátoře ({Object.keys(ceny).length} položiek)
                    </h4>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {Object.entries(ceny).map(([key, value]) => {
                      const hasChanges = editedPrices[key] !== undefined;
                      const currentValue = hasChanges ? editedPrices[key] : value;
                      const newPriceFromExcel = excelPrices?.[key];
                      const hasDifference = newPriceFromExcel !== undefined && newPriceFromExcel !== value;
                      
                      return (
                        <div key={key} className={`p-3 rounded-lg border-2 transition-all ${
                          hasChanges ? 'bg-yellow-50 border-yellow-400' : 
                          hasDifference ? 'bg-blue-50 border-blue-400' :
                          'bg-gray-50 border-gray-200 hover:border-blue-400'
                        }`}>
                          <p className="text-xs font-mono text-gray-600 mb-2">{key}</p>
                          
                          {/* Aktuálna cena */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 w-16">Aktuálna:</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={currentValue}
                              onChange={(e) => handlePriceEdit(key, e.target.value)}
                              className="text-sm font-bold"
                            />
                            <span className="text-xs text-gray-500">€</span>
                            {hasChanges && (
                              <Button
                                size="sm"
                                onClick={() => handleSaveSinglePrice(key)}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-8"
                              >
                                ✓
                              </Button>
                            )}
                          </div>

                          {/* Nová cena z Excelu */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                           <span className="text-xs font-bold text-blue-700 w-16">Nová:</span>
                           {newPriceFromExcel !== undefined ? (
                             <>
                               <span className={`text-sm font-bold flex-1 ${hasDifference ? 'text-blue-700' : 'text-gray-500'}`}>
                                 {newPriceFromExcel.toLocaleString('sk-SK')} €
                               </span>
                               {hasDifference && (
                                 <Badge className="bg-blue-600 text-white text-xs">
                                   {newPriceFromExcel > value ? '↑' : '↓'}
                                 </Badge>
                               )}
                             </>
                           ) : (
                             <span className="text-sm text-gray-400 flex-1">0 €</span>
                           )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* Dokumentácia */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
          <h2 className="text-lg font-bold text-yellow-900 mb-3">📖 Dokumentácia pre master tabuľku</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Kľúče pre Ticab house:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-white p-3 rounded">
                <span>izolacia_stien_200mm</span>
                <span>izolacia_stien_250mm</span>
                <span>izolacia_podlahy_200mm</span>
                <span>izolacia_stropu_200mm</span>
                <span>tepelne_cerpadlo</span>
                <span>rekuperacia</span>
                <span>pripravaNaRekuperaciu</span>
                <span>podlahove_kurenie</span>
                <span>fasada_omietka</span>
                <span>fasada_smrekovec</span>
                <span>strecha_falcovane</span>
                <span>... a ďalšie</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Kľúče pre Prosto House:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-white p-3 rounded">
                <span>montaz_ano</span>
                <span>elektroinstalacia</span>
                <span>vodaKanalizacia</span>
                <span>sanitaKomplet</span>
                <span>bojler</span>
                <span>tepelneCerpadlo</span>
                <span>rekuperacia</span>
                <span>interierFinis_drevo</span>
                <span>vonkajsiaFasada_suchana</span>
                <span>povrchokaOkien</span>
                <span>vnutornePodlahy</span>
                <span>... a ďalšie</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}