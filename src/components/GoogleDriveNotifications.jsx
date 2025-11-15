import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, Trash2, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function GoogleDriveNotifications() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['google-drive-notifications'],
    queryFn: () => base44.entities.GoogleDriveNotification.filter({ user_id: user?.id }, '-created_date', 50),
    enabled: !!user
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.GoogleDriveNotification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-notifications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GoogleDriveNotification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-notifications'] });
    }
  });

  const severityConfig = {
    info: { icon: Info, color: "bg-blue-100 text-blue-800 border-blue-200", iconColor: "text-blue-600" },
    warning: { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800 border-yellow-200", iconColor: "text-yellow-600" },
    error: { icon: AlertCircle, color: "bg-red-100 text-red-800 border-red-200", iconColor: "text-red-600" },
    success: { icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200", iconColor: "text-green-600" }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Notifikácie</h3>
            <p className="text-sm text-gray-600">{unreadCount} neprečítaných</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notification, index) => {
          const config = severityConfig[notification.severity];
          const Icon = config.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border-2 ${config.color} ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {notification.notification_type}
                    </Badge>
                    {!notification.read && (
                      <Badge className="bg-primary text-white text-xs">Nové</Badge>
                    )}
                  </div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_date).toLocaleString('sk-SK')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Označiť ako prečítané"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(notification.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Vymazať"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Žiadne notifikácie</p>
            <p className="text-sm">Budete informovaní o dôležitých udalostiach</p>
          </div>
        )}
      </div>
    </Card>
  );
}