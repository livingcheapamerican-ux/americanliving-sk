import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminMigraciaObrazkov() {
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState("");
  const [logs, setLogs] = useState([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [shouldStop, setShouldStop] = useState(false);

  const queryClient = useQueryClient();

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-migracia'],
    queryFn: () => base44.entities.Dom.list(),
  });

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const downloadAndUploadImage = async (imageUrl) => {
    try {
      // Stiahnutie obrázka
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const filename = imageUrl.split('/').pop();
      const file = new File([blob], filename, { type: blob.type });

      // Upload do Base44 storage
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      return uploadResult.file_url;
    } catch (error) {
      throw new Error(`Chyba pri ${imageUrl}: ${error.message}`);
    }
  };

  const migrateImages = async () => {
    setIsMigrating(true);
    setProgress(0);
    setLogs([]);
    setStats({ total: 0, success: 0, failed: 0 });
    setShouldStop(false);

    const externalUrls = [
      'americanliving.sk',
      'qtrypzzcjebvfcihiynt.supabase.co'
    ];

    // Zhromaždiť všetky externé URL obrázkov
    const imagesToMigrate = [];
    
    domy.forEach(dom => {
      // Hlavný obrázok
      if (dom.hlavny_obrazok && externalUrls.some(url => dom.hlavny_obrazok.includes(url))) {
        imagesToMigrate.push({
          domId: dom.id,
          domNazov: dom.nazov,
          field: 'hlavny_obrazok',
          url: dom.hlavny_obrazok,
          index: null
        });
      }

      // Galéria
      if (dom.galeria && Array.isArray(dom.galeria)) {
        dom.galeria.forEach((imageUrl, index) => {
          if (externalUrls.some(url => imageUrl.includes(url))) {
            imagesToMigrate.push({
              domId: dom.id,
              domNazov: dom.nazov,
              field: 'galeria',
              url: imageUrl,
              index
            });
          }
        });
      }

      // Pôdorys
      if (dom.podorys_url && externalUrls.some(url => dom.podorys_url.includes(url))) {
        imagesToMigrate.push({
          domId: dom.id,
          domNazov: dom.nazov,
          field: 'podorys_url',
          url: dom.podorys_url,
          index: null
        });
      }
    });

    setStats(prev => ({ ...prev, total: imagesToMigrate.length }));
    addLog(`Našlo sa ${imagesToMigrate.length} obrázkov na migráciu`, 'info');

    // Migrácia po jednom
    for (let i = 0; i < imagesToMigrate.length; i++) {
      if (shouldStop) {
        addLog('Migrácia zastavená používateľom', 'error');
        break;
      }

      const item = imagesToMigrate[i];
      setCurrentImage(`${item.domNazov} - ${item.field}`);
      setProgress(Math.round(((i + 1) / imagesToMigrate.length) * 100));

      try {
        addLog(`Sťahujem: ${item.url.substring(0, 80)}...`, 'info');
        const newUrl = await downloadAndUploadImage(item.url);
        
        // Aktualizovať záznam v databáze
        const dom = domy.find(d => d.id === item.domId);
        let updateData = {};

        if (item.field === 'hlavny_obrazok') {
          updateData.hlavny_obrazok = newUrl;
        } else if (item.field === 'podorys_url') {
          updateData.podorys_url = newUrl;
        } else if (item.field === 'galeria') {
          const newGaleria = [...dom.galeria];
          newGaleria[item.index] = newUrl;
          updateData.galeria = newGaleria;
        }

        await base44.entities.Dom.update(item.domId, updateData);
        
        addLog(`✓ Úspech: ${item.domNazov} - ${item.field}`, 'success');
        setStats(prev => ({ ...prev, success: prev.success + 1 }));
      } catch (error) {
        addLog(`✗ Chyba: ${item.domNazov} - ${error.message}`, 'error');
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Malá pauza medzi requestami
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!shouldStop) {
      addLog('Migrácia dokončená!', 'success');
    }
    setCurrentImage('');
    setIsMigrating(false);
    setShouldStop(false);
    queryClient.invalidateQueries({ queryKey: ['domy-migracia'] });
  };

  const stopMigration = () => {
    setShouldStop(true);
    addLog('Zastavenie migrácie...', 'error');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Migrácia obrázkov do vlastného storage
          </h1>
          <p className="text-gray-600">
            Tento nástroj presunie všetky obrázky z americanliving.sk do vášho vlastného storage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Celkom obrázkov</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-gray-600">Úspešne migrované</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Zlyhania</div>
          </Card>
        </div>

        {!isMigrating ? (
          <Card className="p-8 text-center">
            <Download className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Pripravené na migráciu</h2>
            <p className="text-gray-600 mb-6">
              Kliknite na tlačidlo pre spustenie migrácie obrázkov.
              Tento proces môže trvať niekoľko minút.
            </p>
            <Button
              size="lg"
              onClick={migrateImages}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="mr-2 w-5 h-5" />
              Spustiť migráciu
            </Button>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Priebeh migrácie</span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {currentImage && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Spracovávam: {currentImage}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="destructive"
                onClick={stopMigration}
                disabled={shouldStop}
                className="w-full"
              >
                {shouldStop ? 'Zastavuje sa...' : 'Zastaviť migráciu'}
              </Button>
            </div>
          </Card>
        )}

        {logs.length > 0 && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">Log migrácie</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 text-sm p-2 rounded ${
                    log.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : log.type === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-gray-50 text-gray-800'
                  }`}
                >
                  {log.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : log.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Loader2 className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" />
                  )}
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">[{log.time}]</span>{' '}
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}