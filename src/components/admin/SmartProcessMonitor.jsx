import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, PlayCircle, StopCircle, Trash2, RefreshCw, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SmartProcessMonitor() {
  const [isRunning, setIsRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: analysisLogs = [], refetch: refetchAnalysis } = useQuery({
    queryKey: ['smart-analysis-logs'],
    queryFn: async () => {
      const logs = await base44.entities.GoogleDriveNotification.filter({
        'metadata.type': 'smart_analysis_log'
      });
      return logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    refetchInterval: isRunning ? 5000 : false,
    staleTime: 3000
  });

  const { data: reorgLogs = [], refetch: refetchReorg } = useQuery({
    queryKey: ['smart-reorg-logs'],
    queryFn: async () => {
      const logs = await base44.entities.GoogleDriveNotification.filter({
        'metadata.type': 'smart_reorg_log'
      });
      return logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    refetchInterval: isRunning ? 5000 : false,
    staleTime: 3000
  });

  useEffect(() => {
    const latestAnalysis = analysisLogs[0];
    const latestReorg = reorgLogs[0];
    
    const isAnalysisRunning = latestAnalysis?.metadata?.status === 'running' || 
                              latestAnalysis?.metadata?.status === 'starting';
    const isReorgRunning = latestReorg?.metadata?.status === 'running' ||
                           latestReorg?.metadata?.status === 'starting' ||
                           latestReorg?.metadata?.status === 'reorganizing';
    
    setIsRunning(isAnalysisRunning || isReorgRunning);
  }, [analysisLogs, reorgLogs]);

  const startMutation = useMutation({
    mutationFn: () => base44.functions.invoke('smartAnalysis', {}),
    onSuccess: () => {
      toast.success('Smart analýza spustená');
      setIsRunning(true);
      refetchAnalysis();
      refetchReorg();
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
    }
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.GoogleDriveNotification.create({
        notification_type: 'sync_completed',
        message: 'STOP príkaz',
        severity: 'warning',
        read: false,
        user_id: (await base44.auth.me()).id,
        metadata: {
          type: 'stop_command',
          stop_analysis: true,
          stop_reorg: true,
          timestamp: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      toast.info('Stop príkaz odoslaný');
      setTimeout(() => {
        refetchAnalysis();
        refetchReorg();
      }, 1000);
    }
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      for (const log of [...analysisLogs, ...reorgLogs]) {
        await base44.entities.GoogleDriveNotification.delete(log.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Logy vymazané');
    }
  });

  const latestAnalysis = analysisLogs[0];
  const latestReorg = reorgLogs[0];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'starting':
      case 'reorganizing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Smart Process Monitor
            </h3>
            <p className="text-sm text-gray-600">
              Refresh každých 5s (len keď beží)
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                refetchAnalysis();
                refetchReorg();
              }}
              variant="ghost"
              size="icon"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            {!isRunning && (analysisLogs.length > 0 || reorgLogs.length > 0) && (
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
            
            {isRunning ? (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(latestAnalysis?.metadata?.status)} ${isRunning ? 'animate-pulse' : ''}`} />
                Analýza
              </h4>
              {latestAnalysis?.metadata?.percent !== undefined && (
                <Badge className="bg-blue-600 text-white">
                  {latestAnalysis.metadata.percent}%
                </Badge>
              )}
            </div>
            
            {latestAnalysis && latestAnalysis.metadata?.total > 0 && (
              <>
                <Progress 
                  value={latestAnalysis.metadata.percent || 0} 
                  className="mb-2 h-2"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{latestAnalysis.metadata.processed || 0} / {latestAnalysis.metadata.total}</span>
                  <div className="flex gap-3">
                    {latestAnalysis.metadata.success > 0 && (
                      <span className="text-green-600 font-semibold">✓ {latestAnalysis.metadata.success}</span>
                    )}
                    {latestAnalysis.metadata.failed > 0 && (
                      <span className="text-red-600 font-semibold">✗ {latestAnalysis.metadata.failed}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-cyan-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(latestReorg?.metadata?.status)} ${isRunning ? 'animate-pulse' : ''}`} />
                Reorganizácia
              </h4>
              {latestReorg?.metadata?.percent !== undefined && (
                <Badge className="bg-cyan-600 text-white">
                  {latestReorg.metadata.percent}%
                </Badge>
              )}
            </div>
            
            {latestReorg && latestReorg.metadata?.total > 0 && (
              <>
                <Progress 
                  value={latestReorg.metadata.percent || 0} 
                  className="mb-2 h-2"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{latestReorg.metadata.processed || 0} / {latestReorg.metadata.total}</span>
                  <div className="flex gap-3">
                    {latestReorg.metadata.moved > 0 && (
                      <span className="text-green-600 font-semibold">✓ {latestReorg.metadata.moved}</span>
                    )}
                    {latestReorg.metadata.unchanged > 0 && (
                      <span className="text-gray-500">≈ {latestReorg.metadata.unchanged}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Analýza Logy ({analysisLogs.length})
          </h4>
          <ScrollArea className="h-[400px]">
            {analysisLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Žiadne logy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {analysisLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded text-sm ${
                      idx === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    } ${log.severity === 'error' ? 'bg-red-50 border-red-200' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-xs flex-1">{log.message}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.created_date).toLocaleTimeString('sk-SK')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
            Reorganizácia Logy ({reorgLogs.length})
          </h4>
          <ScrollArea className="h-[400px]">
            {reorgLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Žiadne logy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reorgLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded text-sm ${
                      idx === 0 ? 'bg-cyan-50 border border-cyan-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-xs flex-1">{log.message}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.created_date).toLocaleTimeString('sk-SK')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}