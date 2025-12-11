import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Play, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminMigraciaFotiek() {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [results, setResults] = useState(null);

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-migracia'],
    queryFn: async () => {
      const ticabTinyHouse = await base44.entities.Dom.filter({ 
        vyrobca: 'Ticab house'
      });
      const domkiZGor = await base44.entities.Dom.filter({ 
        vyrobca: 'Domki z Gór'
      });
      
      const tinyHouseDomy = ticabTinyHouse.filter(d => 
        d.nazov?.toLowerCase().includes('tiny house')
      );
      
      return [...tinyHouseDomy, ...domkiZGor];
    }
  });

  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const getExternalImagesCount = (dom) => {
    let count = 0;
    if (isExternalUrl(dom.hlavny_obrazok)) count++;
    if (isExternalUrl(dom.zakladna_konfiguracia_obrazok)) count++;
    if (isExternalUrl(dom.podorys_2d)) count++;
    if (isExternalUrl(dom.podorys_3d)) count++;
    if (dom.galeria) count += dom.galeria.filter(isExternalUrl).length;
    if (dom.podorysy) count += dom.podorysy.filter(isExternalUrl).length;
    if (dom.galerie) {
      dom.galerie.forEach(g => {
        if (g.fotky) count += g.fotky.filter(isExternalUrl).length;
      });
    }
    return count;
  };

  const handleMigration = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const response = await base44.functions.invoke('migraciaExternychFotiek', {
        testMode
      });
      
      setResults(response.data);
    } catch (error) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const totalExternalImages = domy.reduce((sum, dom) => sum + getExternalImagesCount(dom), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Migrácia externých fotiek</h1>
          <p className="text-gray-600 mt-2">
            Automatické stiahnutie a uloženie fotiek z externých linkov pre Tiny House a Domki z Gór
          </p>
        </div>

        {/* Prehľad */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Domov na migráciu</p>
                <p className="text-2xl font-bold text-blue-600">{domy.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Externých fotiek</p>
                <p className="text-2xl font-bold text-orange-600">{totalExternalImages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                testMode ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {testMode ? (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Režim</p>
                <p className={`text-2xl font-bold ${testMode ? 'text-yellow-600' : 'text-green-600'}`}>
                  {testMode ? 'TEST' : 'LIVE'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Kontrola režimu */}
        <Alert className="mb-6">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1">
                  {testMode ? '🧪 Test režim aktívny' : '⚠️ LIVE režim - zmeny budú uložené!'}
                </p>
                <p className="text-sm">
                  {testMode 
                    ? 'Migrácia sa vykoná na sucho bez uloženia zmien. Skontrolujte log pred spustením LIVE režimu.'
                    : 'Fotky budú stiahnuté a nahradené lokálnymi URL v databáze.'}
                </p>
              </div>
              <Button
                variant={testMode ? "default" : "destructive"}
                onClick={() => setTestMode(!testMode)}
              >
                {testMode ? 'Prepnúť na LIVE' : 'Prepnúť na TEST'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Zoznam domov */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Domy na spracovanie</h2>
          <div className="space-y-2">
            {domy.map(dom => {
              const externalCount = getExternalImagesCount(dom);
              return (
                <div key={dom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{dom.nazov}</p>
                    <p className="text-sm text-gray-500">{dom.vyrobca}</p>
                  </div>
                  <Badge variant={externalCount > 0 ? "destructive" : "secondary"}>
                    {externalCount} externých fotiek
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Spustenie migrácie */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Spustiť migráciu</h3>
              <p className="text-sm text-gray-500 mt-1">
                {testMode ? 'Vykoná sa test bez uloženia zmien' : 'POZOR: Zmeny budú natrvalo uložené!'}
              </p>
            </div>
            <Button
              onClick={handleMigration}
              disabled={loading || totalExternalImages === 0}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Migrácia prebieha...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {testMode ? 'Spustiť TEST' : 'Spustiť LIVE migráciu'}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Výsledky */}
        {results && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Výsledky migrácie</h2>
            
            {/* Štatistiky */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{results.results?.processed || 0}</p>
                <p className="text-sm text-gray-600">Spracovaných</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{results.results?.migrated || 0}</p>
                <p className="text-sm text-gray-600">Migrovaných</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{results.results?.errors || 0}</p>
                <p className="text-sm text-gray-600">Chýb</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-600">{results.results?.skipped || 0}</p>
                <p className="text-sm text-gray-600">Preskočených</p>
              </div>
            </div>

            {/* Log */}
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
              {results.log?.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>

            {results.testMode && (
              <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Toto bol len test. Pre skutočnú migráciu prepnite na LIVE režim a spustite znova.
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}