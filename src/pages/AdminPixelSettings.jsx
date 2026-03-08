import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Shield, Zap, CheckCircle, XCircle, Activity } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

export default function AdminPixelSettings() {
  const [pixelId, setPixelId] = useState("");
  const [testingEvent, setTestingEvent] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: capiLogs = [] } = useQuery({
    queryKey: ['capi-logs'],
    queryFn: () => base44.entities.CAPILog.list('-created_date', 20),
    enabled: user?.role === 'admin',
    refetchInterval: 30000
  });

  const { data: config } = useQuery({
    queryKey: ['app-config-meta-pixel'],
    queryFn: async () => {
      const configs = await base44.entities.AppConfiguration.filter({ config_key: 'meta_pixel' });
      return configs[0] || null;
    },
    enabled: user?.role === 'admin'
  });

  React.useEffect(() => {
    if (config?.metaPixelId) {
      setPixelId(config.metaPixelId);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (newPixelId) => {
      if (config) {
        return base44.entities.AppConfiguration.update(config.id, { metaPixelId: newPixelId });
      } else {
        return base44.entities.AppConfiguration.create({ config_key: 'meta_pixel', metaPixelId: newPixelId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-config-meta-pixel'] });
      toast.success('✅ Meta Pixel ID uložené!');
    },
    onError: (error) => {
      toast.error('Chyba pri ukladaní: ' + error.message);
    }
  });

  const handleSave = () => {
    // STRICT VALIDATION: Only numeric characters
    if (!/^\d+$/.test(pixelId)) {
      toast.error('❌ Meta Pixel ID musí obsahovať len číslice!');
      return;
    }

    if (pixelId.length < 10) {
      toast.error('❌ Meta Pixel ID je príliš krátke');
      return;
    }

    saveMutation.mutate(pixelId);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Meta Pixel Settings
          </h1>
          <p className="text-gray-600">Správa Meta (Facebook) Pixel integrácie</p>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Meta Pixel Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-2 block">Meta Pixel ID</Label>
              <Input
                type="text"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="1525927175478080"
                className="text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Len číslice. Nájdete v Meta Events Manager.
              </p>
            </div>

            {config && (
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Aktuálne nastavené:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{config.metaPixelId}</code>
                </p>
                <p className="text-xs text-green-600 mt-2">✓ Pixel je aktívny na všetkých stránkach</p>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !pixelId}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Uložiť Pixel ID
                </>
              )}
            </Button>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-900">
                <strong>⚠️ Dôležité:</strong> Po uložení obnovte stránku (F5) pre aktiváciu Meta Pixelu.
              </p>
            </div>

            {/* Manual test button */}
            <Button
              onClick={async () => {
                setTestingEvent(true);
                try {
                  if (window.fbq) {
                    window.fbq('track', 'Lead');
                    toast.success('✅ Test Lead event odoslaný cez Pixel!');
                  } else {
                    toast.error('❌ Pixel nie je inicializovaný — obnovte stránku');
                  }
                  await base44.functions.invoke('sendCAPIEvent', {
                    event_name: 'Lead',
                    event_source_url: window.location.href,
                    user_data: { client_user_agent: navigator.userAgent }
                  });
                  toast.success('✅ Test Lead event odoslaný cez CAPI!');
                  queryClient.invalidateQueries({ queryKey: ['capi-logs'] });
                } catch (e) {
                  toast.error('CAPI chyba: ' + e.message);
                } finally {
                  setTestingEvent(false);
                }
              }}
              disabled={testingEvent}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {testingEvent ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>Odosielam test...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />Odoslať testovací Lead event</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* CAPI Log */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Posledné CAPI udalosti ({capiLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {capiLogs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Zatiaľ žiadne udalosti</p>
            ) : (
              <div className="space-y-2">
                {capiLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border text-sm">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <Badge className={log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {log.event_name}
                      </Badge>
                      <span className="text-gray-600 text-xs">{log.attempt_method}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{log.duration_ms}ms</span>
                      <span>{format(new Date(log.created_date), 'dd.MM HH:mm', { locale: sk })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}