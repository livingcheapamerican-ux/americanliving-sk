import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, StopCircle, Trash2, Zap, RefreshCw, PlayCircle, Clock, AlertOctagon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AnalysisLogPanel() {
  const [running, setRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [], dataUpdatedAt } = useQuery({
    queryKey: ['analysis-logs'],
    queryFn: async () => {
      const allLogs = await base44.entities.GoogleDriveNotification.filter({
        'metadata.type': 'analysis_log'
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
    
    if (status === 'running' || status === 'reorganizing') {
      setRunning(true);
    } else if (['completed', 'stopped', 'error', 'analysis_completed'].includes(status)) {
      setRunning(false);
    }
  }, [logs]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('backgroundAnalyzaVsetko', {});
      return result;
    },
    onSuccess: () => {
      toast.success('Analýza spustená');
      setRunning(true);
      queryClient.invalidateQueries({ queryKey: ['analysis-logs'] });
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
      setRunning(false);
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => base44.functions.invoke('backgroundAnalyzaVsetko', { action: 'stop' }),
    onSuccess: () => {
      toast.info('Stop príkaz odoslaný');
    }
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      for (const log of logs) {
        await base44.entities.GoogleDriveNotification.delete(log.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-logs'] });
      toast.success('Logy vymazané');
    }
  });

  const latestStatus = logs.find(log => log.metadata?.type === 'analysis_log');
  const progressLogs = logs.filter(log => 
    log.metadata?.type === 'analysis_log'
  ).slice(0, 100);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
      case 'reorganizing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
      case 'analysis_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'stopped':
        return <StopCircle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <AlertOctagon className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Analýza + Reorganizácia
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
              className="bg-purple-600 hover:bg-purple-700"
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
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(latestStatus.metadata.status)}
              <div>
                <p className="font-semibold text-gray-900">
                  {latestStatus.metadata.status === 'running' && 'Analyzujem...'}
                  {latestStatus.metadata.status === 'reorganizing' && 'Reorganizujem...'}
                  {latestStatus.metadata.status === 'completed' && 'Dokončené'}
                  {latestStatus.metadata.status === 'analysis_completed' && 'Analýza hotová'}
                  {latestStatus.metadata.status === 'stopped' && 'Zastavené'}
                  {latestStatus.metadata.status === 'error' && 'Chyba'}
                </p>
                {latestStatus.metadata.duration && (
                  <p className="text-xs text-gray-500">Trvanie: {latestStatus.metadata.duration}s</p>
                )}
              </div>
            </div>
            
            {latestStatus.metadata.percent !== undefined && (
              <Badge className="bg-purple-600 text-white text-lg px-4 py-1">
                {latestStatus.metadata.percent}%
              </Badge>
            )}
          </div>

          {latestStatus.metadata.total > 0 && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${latestStatus.metadata.percent || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">
                  {latestStatus.metadata.processed || 0} / {latestStatus.metadata.total}
                </span>
                {latestStatus.metadata.current_file && (
                  <span className="text-xs text-gray-500 truncate max-w-xs">
                    {latestStatus.metadata.current_file}
                  </span>
                )}
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
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                    idx === 0 ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-gray-50 border-gray-200'
                  } ${log.severity === 'error' ? 'bg-red-50 border-red-300' : ''}`}
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