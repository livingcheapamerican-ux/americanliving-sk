import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Settings, Check, AlertCircle, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export default function MarketingNotificationCenter() {
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['marketing-notifications'],
    queryFn: () => base44.entities.MarketingNotification.list('-created_date', 50),
    refetchInterval: 30000 // Refresh každých 30s
  });

  const { data: settings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const existing = await base44.entities.NotificationSettings.filter({ user_email: user.email });
      if (existing.length > 0) return existing[0];
      
      // Vytvoriť default settings
      return await base44.entities.NotificationSettings.create({
        user_email: user.email,
        notifikovat_nove_insights: true,
        prah_konverzie_pokles: 20,
        prah_zobrazenia_narast: 50,
        prah_confidence_nizke: 40,
        email_notifikacie: false
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.MarketingNotification.update(notificationId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.MarketingNotification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-notifications'] });
      toast.success('Notifikácia odstránená');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => 
      base44.entities.NotificationSettings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Nastavenia uložené');
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (typ) => {
    switch (typ) {
      case 'nova_analyza': return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'zmena_konverzie': return <TrendingDown className="w-5 h-5 text-orange-600" />;
      case 'zmena_zobrazeni': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'vysoka_kvalita': return <Check className="w-5 h-5 text-green-600" />;
      case 'nizka_kvalita': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-purple-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Marketing Notifikácie</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {showSettings ? (
          <div className="p-4 space-y-4">
            <h4 className="font-semibold text-sm">Nastavenia notifikácií</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings?.notifikovat_nove_insights}
                  onChange={(e) => updateSettingsMutation.mutate({ 
                    notifikovat_nove_insights: e.target.checked 
                  })}
                  className="rounded"
                />
                Notifikovať nové insights
              </label>

              <div>
                <label className="text-xs text-gray-600">Pokles konverzie (%)</label>
                <input
                  type="number"
                  value={settings?.prah_konverzie_pokles || 20}
                  onChange={(e) => updateSettingsMutation.mutate({ 
                    prah_konverzie_pokles: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Nárast zobrazení (%)</label>
                <input
                  type="number"
                  value={settings?.prah_zobrazenia_narast || 50}
                  onChange={(e) => updateSettingsMutation.mutate({ 
                    prah_zobrazenia_narast: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Nízka confidence (%)</label>
                <input
                  type="number"
                  value={settings?.prah_confidence_nizke || 40}
                  onChange={(e) => updateSettingsMutation.mutate({ 
                    prah_confidence_nizke: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                />
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="w-full"
            >
              Zavrieť nastavenia
            </Button>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Žiadne notifikácie</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 ${getSeverityColor(notif.severity)} ${
                      !notif.read ? 'border-l-4 border-l-purple-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notif.typ)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{notif.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        {notif.metadata && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {notif.metadata.stara_hodnota !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Pred: {notif.metadata.stara_hodnota}
                              </Badge>
                            )}
                            {notif.metadata.nova_hodnota !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Po: {notif.metadata.nova_hodnota}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsReadMutation.mutate(notif.id)}
                            className="h-8 w-8"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotificationMutation.mutate(notif.id)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}