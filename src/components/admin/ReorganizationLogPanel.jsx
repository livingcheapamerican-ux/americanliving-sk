import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle, StopCircle, Trash2, FolderSync, RefreshCw, Bug } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ReorganizationLogPanel() {
  const [running, setRunning] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading: logsLoading, dataUpdatedAt } = useQuery({
    queryKey: ['reorganization-logs'],
    queryFn: async () => {
      const allLogs = await base44.entities.GoogleDriveNotification.filter({
        'metadata.type': { $in: ['reorganization_log', 'reorganization_control'] }
      });
      console.log('📋 Načítané logy:', allLogs.length, 'Last update:', new Date().toLocaleTimeString());
      return allLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    refetchInterval: 500, // ZMENA: každú pol sekundu
    staleTime: 0
  });

  // Diagnostika - počet dokumentov
  const { data: dokumenty = [] } = useQuery({
    queryKey: ['dokumenty-count'],
    queryFn: async () => {
      const docs = await base44.entities.Dokument.filter({
        typ: 'fotky',
        vizualna_analyza: { $exists: true },
        podrobna_analyza_datum: { $exists: true }
      });
      return docs;
    },
    enabled: showDebug
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 Spúšťam reorganizáciu...');
      setRunning(true);
      const result = await base44.functions.invoke('reorganizujDokumenty', {});
      console.log('✅ Reorganizácia spustená:', result);
      return result;
    },
    onError: (error) => {
      console.error('❌ Chyba reorganizácie:', error);
      alert(`Chyba: ${error.message}`);
      setRunning(false);
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => base44.functions.invoke('reorganizujDokumenty', { action: 'stop' }),
    onSuccess: () => {
      console.log('⏸️ Stop príkaz odoslaný');
    }
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      for (const log of logs) {
        await base44.entities.GoogleDriveNotification.delete(log.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reorganization-logs'] });
    }
  });

  useEffect(() => {
    const runningLog = logs.find(log => log.metadata?.status === 'running');
    if (runningLog) {
      setRunning(true);
    } else {
      const hasCompleted = logs.find(log => 
        log.metadata?.status === 'completed' || 
        log.metadata?.status === 'stopped' ||
        log.metadata?.status === 'error'
      );
      if (hasCompleted) {
        setRunning(false);
      }
    }
  }, [logs]);

  const latestStatus = logs.find(log => log.metadata?.type === 'reorganization_log');
  const progressLogs = logs.filter(log => log.metadata?.type === 'reorganization_log').slice(0, 50);

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-cyan-900 flex items-center gap-2">
            <FolderSync className="w-5 h-5" />
            Reorganizácia súborov
            {logsLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />}
          </h3>
          <p className="text-sm text-gray-600">
            Logs: {logs.length} | Last refresh: {new Date(dataUpdatedAt).toLocaleTimeString('sk-SK')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="sm"
            title="Debug info"
          >
            <Bug className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['reorganization-logs'] })}
            variant="ghost"
            size="sm"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          {logs.length > 0 && (
            <Button
              onClick={() => clearLogsMutation.mutate()}
              variant="ghost"
              size="sm"
              disabled={running}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vyčistiť
            </Button>
          )}
          
          {running ? (
            <Button
              onClick={() => stopMutation.mutate()}
              variant="destructive"
              size="lg"
            >
              <StopCircle className="w-5 h-5 mr-2" />
              Zastaviť
            </Button>
          ) : (
            <Button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {startMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Spúšťam...
                </>
              ) : (
                <>
                  <FolderSync className="w-5 h-5 mr-2" />
                  Spustiť
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-bold mb-2">🔍 DIAGNOSTIKA</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="font-semibold">Celkom logov:</span> {logs.length}
            </div>
            <div>
              <span className="font-semibold">Running status:</span> {running ? '✅ ÁNO' : '❌ NIE'}
            </div>
            <div>
              <span className="font-semibold">Dokumentov na spracovanie:</span> {dokumenty.length}
            </div>
            <div className="col-span-3">
              <span className="font-semibold">Posledný log:</span>{' '}
              {latestStatus ? new Date(latestStatus.created_date).toLocaleString('sk-SK') : 'N/A'}
            </div>
            <div className="col-span-3">
              <span className="font-semibold">Status:</span>{' '}
              {latestStatus?.metadata?.status || 'N/A'}
            </div>
            <div className="col-span-3 bg-white p-2 rounded">
              <span className="font-semibold">Metadata:</span>
              <pre className="text-xs mt-1 overflow-auto max-h-32">
                {JSON.stringify(latestStatus?.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {latestStatus?.metadata && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-cyan-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {latestStatus.metadata.status === 'running' && (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              )}
              {latestStatus.metadata.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {latestStatus.metadata.status === 'stopped' && (
                <XCircle className="w-5 h-5 text-orange-600" />
              )}
              {latestStatus.metadata.status === 'error' && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              
              <span className="font-semibold">
                {latestStatus.metadata.status === 'running' && 'Prebieha...'}
                {latestStatus.metadata.status === 'completed' && 'Dokončené'}
                {latestStatus.metadata.status === 'stopped' && 'Zastavené'}
                {latestStatus.metadata.status === 'error' && 'Chyba'}
              </span>
            </div>
            
            {latestStatus.metadata.percent !== undefined && (
              <Badge className="bg-cyan-600 text-white">
                {latestStatus.metadata.percent}%
              </Badge>
            )}
          </div>

          {latestStatus.metadata.total > 0 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${latestStatus.metadata.percent || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Spracované: {latestStatus.metadata.processed || 0} / {latestStatus.metadata.total}</span>
                <div className="flex gap-4">
                  {(latestStatus.metadata.presunute || 0) > 0 && (
                    <span className="text-green-600">✓ {latestStatus.metadata.presunute}</span>
                  )}
                  {(latestStatus.metadata.nezmenene || 0) > 0 && (
                    <span className="text-gray-500">≈ {latestStatus.metadata.nezmenene}</span>
                  )}
                  {(latestStatus.metadata.chyby || 0) > 0 && (
                    <span className="text-red-600">✗ {latestStatus.metadata.chyby}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Messages */}
      <div className="bg-white rounded-lg border">
        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
          <p className="text-xs font-semibold text-gray-600">
            LIVE LOG ({progressLogs.length} záznamov)
          </p>
          {progressLogs.length === 0 && running && (
            <Badge variant="outline" className="text-orange-600 animate-pulse">
              ⚠️ Proces beží ale žiadne logy - možno je zaseknutý!
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-2">
            {progressLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-2">Zatiaľ žiadne logy</p>
                <p className="text-xs text-gray-400 mb-4">
                  {running ? '⏳ Čakám na logy z procesu...' : 'Klikni na tlačidlo "Spustiť" pre začatie reorganizácie'}
                </p>
                {running && (
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Obnoviť teraz
                    </Button>
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ Ak logy stále nejdú, proces sa pravdepodobne zasekol pri prvom načítaní dokumentov
                    </p>
                  </div>
                )}
              </div>
            ) : (
              progressLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded bg-gray-50 border border-gray-200 text-sm hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 font-mono text-xs">{log.message}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.created_date).toLocaleTimeString('sk-SK')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}