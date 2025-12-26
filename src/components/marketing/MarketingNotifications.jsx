import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, AlertTriangle, CheckCircle, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function MarketingNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user-notifications'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const { data: notifications = [] } = useQuery({
    queryKey: ['marketing-notifications'],
    queryFn: () => base44.entities.MarketingNotification.list('-created_date', 50),
    refetchInterval: 60000, // každú minútu
    enabled: isAdmin
  });

  const { data: socialMetrics = [] } = useQuery({
    queryKey: ['social-metrics-notifications'],
    queryFn: () => base44.entities.SocialMediaMetrics.filter({ status: 'active' }),
    enabled: isAdmin
  });

  const { data: googleAdsMetrics = [] } = useQuery({
    queryKey: ['google-ads-notifications'],
    queryFn: () => base44.entities.GoogleAdsMetrics.filter({ status: 'active' }),
    enabled: isAdmin
  });

  const markAsRead = useMutation({
    mutationFn: (id) => base44.entities.MarketingNotification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries(['marketing-notifications'])
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => base44.entities.MarketingNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['marketing-notifications'])
  });

  // Auto-check for issues
  useEffect(() => {
    const checkCampaigns = async () => {
      const lowPerformingCampaigns = [...socialMetrics, ...googleAdsMetrics].filter(c => {
        const ctr = parseFloat(c.ctr || 0);
        const conversionRate = parseFloat(c.conversion_rate || 0);
        return ctr < 1 || conversionRate < 2;
      });

      const highCPACampaigns = [...socialMetrics, ...googleAdsMetrics].filter(c => {
        const cpa = parseFloat(c.cpa || 0);
        return cpa > 50;
      });

      // Vytvoriť notifikácie pre nízky výkon
      for (const campaign of lowPerformingCampaigns.slice(0, 3)) {
        const existing = notifications.find(n => 
          n.notification_type === 'low_performance' && 
          n.campaign_id === campaign.campaign_id
        );
        
        if (!existing) {
          await base44.entities.MarketingNotification.create({
            notification_type: 'low_performance',
            severity: 'warning',
            title: `⚠️ Nízky výkon: ${campaign.campaign_name}`,
            message: `CTR ${campaign.ctr}% a konverzný pomer ${campaign.conversion_rate}% sú pod priemerom.`,
            campaign_id: campaign.campaign_id || campaign.id,
            action_required: true,
            metadata: { campaign }
          });
        }
      }

      // High CPA warning
      for (const campaign of highCPACampaigns.slice(0, 2)) {
        const existing = notifications.find(n => 
          n.notification_type === 'high_cpa' && 
          n.campaign_id === campaign.campaign_id
        );
        
        if (!existing) {
          await base44.entities.MarketingNotification.create({
            notification_type: 'high_cpa',
            severity: 'error',
            title: `🚨 Vysoké CPA: ${campaign.campaign_name}`,
            message: `CPA €${campaign.cpa} je príliš vysoké. Odporúčame optimalizáciu cielenia.`,
            campaign_id: campaign.campaign_id || campaign.id,
            action_required: true,
            metadata: { campaign }
          });
        }
      }

      queryClient.invalidateQueries(['marketing-notifications']);
    };

    if (socialMetrics.length > 0 || googleAdsMetrics.length > 0) {
      checkCampaigns();
    }
  }, [socialMetrics, googleAdsMetrics]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Floating Notification Button */}
      <div className="fixed top-24 right-6 z-40">
        <Button
          onClick={() => setShowPanel(!showPanel)}
          className="relative bg-blue-600 hover:bg-blue-700 shadow-2xl rounded-full w-14 h-14"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-24 right-6 z-50 w-96 max-h-[80vh] overflow-hidden"
          >
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5" />
                    🔔 Notifikácie
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowPanel(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-blue-100 mt-1">
                  {unreadCount} neprečítaných
                </p>
              </CardHeader>

              <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                {/* Unread */}
                {unreadNotifications.length > 0 && (
                  <div className="p-4 bg-blue-50 border-b">
                    <h4 className="font-semibold text-sm text-blue-900 mb-3">Nové</h4>
                    <div className="space-y-2">
                      {unreadNotifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border-2 ${
                            notif.severity === 'error' ? 'bg-red-50 border-red-300' :
                            notif.severity === 'warning' ? 'bg-yellow-50 border-yellow-300' :
                            'bg-white border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2">
                              {notif.severity === 'error' ? (
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              ) : notif.severity === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div>
                                <h5 className="font-bold text-xs">{notif.title}</h5>
                                <p className="text-xs text-gray-700 mt-1">{notif.message}</p>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => markAsRead.mutate(notif.id)}
                              className="h-6 w-6"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(new Date(notif.created_date), 'dd.MM.yyyy HH:mm')}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Read */}
                {readNotifications.length > 0 && (
                  <div className="p-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Prečítané</h4>
                    <div className="space-y-2">
                      {readNotifications.slice(0, 10).map((notif) => (
                        <div key={notif.id} className="p-2 bg-gray-50 rounded text-xs opacity-60">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold">{notif.title}</p>
                              <p className="text-gray-600">{notif.message.substring(0, 80)}...</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteNotification.mutate(notif.id)}
                              className="h-5 w-5"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {notifications.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Žiadne notifikácie</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}