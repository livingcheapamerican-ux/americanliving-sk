import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AlertTriangle, XCircle, AlertCircle, Info, Search, RefreshCw, Mail, Trash2, CheckCircle, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ErrorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedError, setSelectedError] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ['error-logs'],
    queryFn: async () => {
      const logs = await base44.entities.GoogleDriveNotification.filter({
        severity: { $in: ['error', 'warning'] }
      });
      return logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    refetchInterval: 30000
  });

  const { data: criticalDocs = [] } = useQuery({
    queryKey: ['critical-docs'],
    queryFn: async () => {
      return await base44.entities.Dokument.filter({
        manualna_kontrola_potrebna: true
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.GoogleDriveNotification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast.success('Označené ako prečítané');
    }
  });

  const deleteErrorMutation = useMutation({
    mutationFn: (id) => base44.entities.GoogleDriveNotification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast.success('Chyba vymazaná');
      setSelectedError(null);
    }
  });

  const sendEmailAlertMutation = useMutation({
    mutationFn: async (error) => {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🚨 Kritická chyba v systéme: ${error.notification_type}`,
        body: `
Typ: ${error.notification_type}
Čas: ${new Date(error.created_date).toLocaleString('sk-SK')}
Správa: ${error.message}

${error.metadata ? `Detaily:\n${JSON.stringify(error.metadata, null, 2)}` : ''}

--
Automaticky generovaný email z Error Dashboard
        `
      });
    },
    onSuccess: () => {
      toast.success('Email alert odoslaný');
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      for (const err of errors) {
        await base44.entities.GoogleDriveNotification.delete(err.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast.success('Všetky logy vymazané');
    }
  });

  const filteredErrors = errors.filter(err => 
    err.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    err.notification_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalErrors = filteredErrors.filter(e => e.severity === 'error' && !e.read);
  const warnings = filteredErrors.filter(e => e.severity === 'warning' && !e.read);
  const resolvedErrors = filteredErrors.filter(e => e.read);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-600" />
              Error Dashboard
            </h3>
            <p className="text-sm text-gray-600 mt-1">Centralizovaný prehľad chýb a varovaní</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Obnoviť
            </Button>
            {errors.length > 0 && (
              <Button onClick={() => clearAllMutation.mutate()} variant="ghost" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Vymazať všetko
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-red-100 border-red-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kritické chyby</p>
                <p className="text-3xl font-bold text-red-900">{criticalErrors.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-yellow-100 border-yellow-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Varovania</p>
                <p className="text-3xl font-bold text-yellow-900">{warnings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-orange-100 border-orange-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Manuálna kontrola</p>
                <p className="text-3xl font-bold text-orange-900">{criticalDocs.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Hľadať v chybách..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">
            Kritické ({criticalErrors.length})
          </TabsTrigger>
          <TabsTrigger value="warnings">
            Varovania ({warnings.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Vyriešené ({resolvedErrors.length})
          </TabsTrigger>
          <TabsTrigger value="manual">
            Manuálna kontrola ({criticalDocs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="critical">
          <ScrollArea className="h-[600px]">
            {criticalErrors.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Žiadne kritické chyby!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalErrors.map((error) => (
                  <Card key={error.id} className={`p-4 ${getSeverityColor(error.severity)} cursor-pointer hover:shadow-md transition-all`}>
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">{error.notification_type}</Badge>
                            <p className="font-semibold text-gray-900 break-words">{error.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(error.created_date).toLocaleString('sk-SK')}
                            </p>
                          </div>
                        </div>
                        
                        {error.metadata && (
                          <details className="mt-3">
                            <summary className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                              Detaily a kontext
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto">
                              {JSON.stringify(error.metadata, null, 2)}
                            </pre>
                          </details>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsReadMutation.mutate(error.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vyriešiť
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendEmailAlertMutation.mutate(error)}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteErrorMutation.mutate(error.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="warnings">
          <ScrollArea className="h-[600px]">
            {warnings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Žiadne varovania!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.map((error) => (
                  <Card key={error.id} className={`p-4 ${getSeverityColor(error.severity)}`}>
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{error.notification_type}</Badge>
                        <p className="font-semibold text-gray-900">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.created_date).toLocaleString('sk-SK')}
                        </p>
                        
                        {error.metadata && (
                          <details className="mt-3">
                            <summary className="text-xs font-medium text-gray-700 cursor-pointer">Detaily</summary>
                            <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto">
                              {JSON.stringify(error.metadata, null, 2)}
                            </pre>
                          </details>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsReadMutation.mutate(error.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vyriešiť
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteErrorMutation.mutate(error.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="resolved">
          <ScrollArea className="h-[600px]">
            {resolvedErrors.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Žiadne vyriešené chyby</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resolvedErrors.map((error) => (
                  <Card key={error.id} className="p-4 bg-gray-50 opacity-60">
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{error.notification_type}</Badge>
                        <p className="font-medium text-gray-700">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.created_date).toLocaleString('sk-SK')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteErrorMutation.mutate(error.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="manual">
          <ScrollArea className="h-[600px]">
            {criticalDocs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Žiadne dokumenty nevyžadujú manuálnu kontrolu!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalDocs.map((doc) => (
                  <Card key={doc.id} className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{doc.nazov}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Typ: {doc.typ} | Výrobca: {doc.vyrobca}
                        </p>
                        {doc.validacia_problemy && doc.validacia_problemy.length > 0 && (
                          <div className="mt-2 bg-white p-2 rounded border border-orange-200">
                            <p className="text-xs font-semibold text-orange-800 mb-1">Problémy:</p>
                            <ul className="text-xs space-y-1">
                              {doc.validacia_problemy.map((problem, idx) => (
                                <li key={idx} className="text-gray-700">• {problem}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => {
                            window.open(doc.subor_url, '_blank');
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Otvoriť dokument
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}