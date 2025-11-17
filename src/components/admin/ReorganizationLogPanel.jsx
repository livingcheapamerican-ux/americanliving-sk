import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle, StopCircle, Trash2, FolderSync } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ReorganizationLogPanel() {
  const [running, setRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ['reorganization-logs'],
    queryFn: async () => {
      const allLogs = await base44.entities.GoogleDriveNotification.filter({
        'metadata.type': { $in: ['reorganization_log', 'reorganization_control'] }
      });
      return allLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    refetchInterval: running ? 2000 : false
  });

  const startMutation = useMutation({
    mutationFn: () => base44.functions.invoke('reorganizujDokumenty', {}),
    onMutate: () => setRunning(true),
    onSettled: () => {
      setTimeout(() => {
        setRunning(false);
        queryClient.invalidateQueries({ queryKey: ['reorganization-logs'] });
      }, 3000);
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => base44.functions.invoke('reorganizujDokumenty', { action: 'stop' }),
    onSuccess: () => {
      setTimeout(() => setRunning(false), 2000);
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
      setRunning(false);
    }
  }, [logs]);

  const latestStatus = logs.find(log => log.metadata?.type === 'reorganization_log');
  const progressLogs = logs.filter(log => log.metadata?.type === 'reorganization_log').slice(0, 20);

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-cyan-900 flex items-center gap-2">
            <FolderSync className="w-5 h-5" />
            Reorganizácia súborov
          </h3>
          <p className="text-sm text-gray-600">Automatické preskupenie do správnych priečinkov</p>
        </div>
        
        <div className="flex gap-2">
          {logs.length > 0 && (
            <Button
              onClick={() => clearLogsMutation.mutate()}
              variant="ghost"
              size="sm"
              disabled={running}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vyčistiť log
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
                  Spustiť reorganizáciu
                </>
              )}
            </Button>
          )}
        </div>
      </div>

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
            
            {latestStatus.metadata.percent && (
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
                  {latestStatus.metadata.presunute > 0 && (
                    <span className="text-green-600">✓ {latestStatus.metadata.presunute}</span>
                  )}
                  {latestStatus.metadata.nezmenene > 0 && (
                    <span className="text-gray-500">≈ {latestStatus.metadata.nezmenene}</span>
                  )}
                  {latestStatus.metadata.chyby > 0 && (
                    <span className="text-red-600">✗ {latestStatus.metadata.chyby}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Messages */}
      <ScrollArea className="h-[400px] bg-white rounded-lg border p-4">
        <div className="space-y-2">
          {progressLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Zatiaľ žiadne logy</p>
          ) : (
            progressLogs.map((log, index) => (
              <div
                key={log.id}
                className="p-3 rounded bg-gray-50 border border-gray-200 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1">{log.message}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.created_date).toLocaleTimeString('sk-SK')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}