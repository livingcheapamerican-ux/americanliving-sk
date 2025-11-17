import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, StopCircle, Trash2, FolderSync, RefreshCw, PlayCircle, Clock, AlertOctagon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ReorganizationLogPanel() {
  const [running, setRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [], dataUpdatedAt } = useQuery({
    queryKey: ['reorganization-logs'],
    queryFn: async () => {
      const allLogs = await base44.entities.GoogleDriveNotification.filter({
        'metadata.type': 'reorganization_log'
      });
      return allLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    refetchInterval: 1000,
    staleTime: 0
  });

  useEffect(() => {
    if (logs.length === 0) {
      setRunning(false);
      return;
    }

    const latestLog = logs[0];
    const status = latestLog.metadata?.status;
    
    if (status === 'running') {
      setRunning(true);
    } else if (['completed', 'stopped', 'error'].includes(status)) {
      setRunning(false);
    }
  }, [logs]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('reorganizujDokumenty', {});
      return result;
    },
    onSuccess: () => {
      toast.success('Reorganizácia spustená');
      setRunning(true);
      queryClient.invalidateQueries({ queryKey: ['reorganization-logs'] });
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
      setRunning(false);
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => base44.functions.invoke('reorganizujDokumenty', { action: 'stop' }),
    onSuccess: () => {
      toast.info('Stop príkaz odoslaný');
    }
  });

  const forceStopAllMutation = useMutation({
    mutationFn: () => base44.functions.invoke('stopAllProcesses', {}),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Všetky procesy zastavené');
      queryClient.invalidateQueries({ queryKey: ['reorganization-logs'] });
      setRunning(false);
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
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
      toast.success('Logy vymazané');
    }
  });

  const latestStatus = logs.find(log => log.metadata?.type === 'reorganization_log');
  const progressLogs = logs.filter(log => 
    log.metadata?.type === 'reorganization_log' && 
    !['reorganization_control'].includes(log.metadata?.type)
  ).slice(0, 100);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'stopped':
        return <StopCircle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <CheckCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-cyan-900 flex items-center gap-2">
            <FolderSync className="w-5 h-5" />
            Reorganizácia súborov
          </h3>
          <p className="text-sm text-gray-600">
            Logs: {logs.length} | Refresh: {new Date(dataUpdatedAt).toLocaleTimeString('sk-SK')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => queryClient.invalidateQueries()}
            variant="ghost"
            size="sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => forceStopAllMutation.mutate()}
            variant="destructive"
            size="sm"
            disabled={forceStopAllMutation.isPending}
            title="Zastaviť všetky zaseknuté procesy"
          >
            <AlertOctagon className="w-4 h-4 mr-2" />
            Force Stop
          </Button>
          
          {logs.length > 0 && !running && (
            <Button
              onClick={() => clearLogsMutation.mutate()}
              variant="ghost"
              size="sm"
              disabled={clearLogsMutation.isPending}
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
              disabled={stopMutation.isPending}
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
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Spustiť
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      {latestStatus?.metadata && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-cyan-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(latestStatus.metadata.status)}
              <div>
                <p className="font-semibold text-gray-900">
                  {latestStatus.metadata.status === 'running' && 'Prebieha...'}
                  {latestStatus.metadata.status === 'completed' && 'Dokončené'}
                  {latestStatus.metadata.status === 'stopped' && 'Zastavené'}
                  {latestStatus.metadata.status === 'error' && 'Chyba'}
                </p>
                {latestStatus.metadata.duration && (
                  <p className="text-xs text-gray-500">Trvanie: {latestStatus.metadata.duration}</p>
                )}
              </div>
            </div>
            
            {latestStatus.metadata.percent !== undefined && (
              <Badge className="bg-cyan-600 text-white text-lg px-4 py-1">
                {latestStatus.metadata.percent}%
              </Badge>
            )}
          </div>

          {latestStatus.metadata.total > 0 && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${latestStatus.metadata.percent || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">
                  {latestStatus.metadata.processed || 0} / {latestStatus.metadata.total}
                </span>
                <div className="flex gap-4">
                  {(latestStatus.metadata.presunute || 0) > 0 && (
                    <span className="text-green-600 font-semibold">
                      ✓ {latestStatus.metadata.presunute}
                    </span>
                  )}
                  {(latestStatus.metadata.nezmenene || 0) > 0 && (
                    <span className="text-gray-500">
                      ≈ {latestStatus.metadata.nezmenene}
                    </span>
                  )}
                  {(latestStatus.metadata.chyby || 0) > 0 && (
                    <span className="text-red-600 font-semibold">
                      ✗ {latestStatus.metadata.chyby}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Messages */}
      <div className="bg-white rounded-lg border">
        <div className="p-3 border-b bg-gray-50">
          <p className="text-xs font-semibold text-gray-600">
            REAL-TIME LOG ({progressLogs.length} záznamov)
          </p>
        </div>
        <ScrollArea className="h-[400px] p-4">
          {progressLogs.length === 0 ? (
            <div className="text-center py-12">
              <FolderSync className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-2">Zatiaľ žiadne logy</p>
              <p className="text-xs text-gray-400">
                {running ? '⏳ Proces beží...' : 'Klikni na "Spustiť" pre začatie'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {progressLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border transition-all ${
                    idx === 0 ? 'bg-cyan-50 border-cyan-300 shadow-sm' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm font-mono">{log.message}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.created_date).toLocaleTimeString('sk-SK')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}