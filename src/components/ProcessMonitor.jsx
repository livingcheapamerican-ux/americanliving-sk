import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ProcessMonitor() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['process-monitor-logs'],
    queryFn: async () => {
      if (!user) return [];
      const allLogs = await base44.entities.GoogleDriveNotification.filter({
        user_id: user.id,
        'metadata.type': 'reorganization_log'
      });
      return allLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user,
    refetchInterval: 3000
  });

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    const latestLog = logs[0];
    const latestTimestamp = new Date(latestLog.created_date);
    const now = new Date();
    const diffMinutes = (now - latestTimestamp) / 1000 / 60;

    // Ak je proces označený ako running ale posledný log je starší ako 2 minúty
    if (latestLog.metadata?.status === 'running' && diffMinutes > 2) {
      
      // Skontroluj, či už nebola vytvorená notifikácia o zaseknutí
      const stuckNotification = logs.find(log => 
        log.metadata?.alert_type === 'process_stuck' &&
        new Date(log.created_date) > new Date(now - 5 * 60 * 1000) // za posledných 5 minút
      );

      if (!stuckNotification) {
        // Vytvor notifikáciu
        base44.entities.GoogleDriveNotification.create({
          notification_type: 'sync_failed',
          message: `⚠️ UPOZORNENIE: Proces reorganizácie sa pravdepodobne zasekol. Posledná aktivita pred ${Math.round(diffMinutes)} minútami.`,
          severity: 'warning',
          read: false,
          user_id: user.id,
          metadata: { 
            type: 'alert',
            alert_type: 'process_stuck',
            last_activity: latestLog.created_date
          }
        }).then(() => {
          toast.warning(`Proces sa možno zasekol! (${Math.round(diffMinutes)} min bez aktivity)`);
        });

        // Pošli email ak je admin
        if (user.role === 'admin' || user.super_admin) {
          base44.integrations.Core.SendEmail({
            to: user.email,
            subject: '⚠️ Upozornenie: Proces reorganizácie sa možno zasekol',
            body: `
              Dobrý deň,
              
              Proces reorganizácie súborov sa pravdepodobne zasekol.
              
              Posledná aktivita: ${latestLog.created_date}
              Čas od poslednej aktivity: ${Math.round(diffMinutes)} minút
              Posledná správa: ${latestLog.message}
              
              Prosím skontrolujte stav procesu v administrácii.
              
              S pozdravom,
              American Living Systém
            `
          });
        }
      }
    }

    // Notifikácia pri dokončení
    if (latestLog.metadata?.status === 'completed' && !latestLog.notified) {
      const stats = latestLog.metadata;
      toast.success(`Reorganizácia dokončená! ✓${stats.presunute} ≈${stats.nezmenene} ✗${stats.chyby}`);
      
      // Označ log ako notifikovaný
      base44.entities.GoogleDriveNotification.update(latestLog.id, {
        metadata: { ...latestLog.metadata, notified: true }
      });

      // Email pri dokončení
      if (user.role === 'admin' || user.super_admin) {
        base44.integrations.Core.SendEmail({
          to: user.email,
          subject: '✅ Reorganizácia dokončená',
          body: `
            Dobrý deň,
            
            Proces reorganizácie súborov bol úspešne dokončený.
            
            Výsledky:
            - Presunuté: ${stats.presunute}
            - Nezmenené: ${stats.nezmenene}
            - Chyby: ${stats.chyby}
            - Celkom: ${stats.total}
            
            S pozdravom,
            American Living Systém
          `
        });
      }
    }

    // Notifikácia pri chybe
    if (latestLog.metadata?.status === 'error' && !latestLog.notified) {
      toast.error(`Chyba v procese: ${latestLog.message}`);
      
      base44.entities.GoogleDriveNotification.update(latestLog.id, {
        metadata: { ...latestLog.metadata, notified: true }
      });

      // Email pri chybe
      if (user.role === 'admin' || user.super_admin) {
        base44.integrations.Core.SendEmail({
          to: user.email,
          subject: '❌ Chyba v procese reorganizácie',
          body: `
            Dobrý deň,
            
            Nastala chyba v procese reorganizácie súborov.
            
            Chybová správa: ${latestLog.message}
            Čas: ${latestLog.created_date}
            
            Prosím skontrolujte logy v administrácii.
            
            S pozdravom,
            American Living Systém
          `
        });
      }
    }

  }, [logs, user]);

  return null; // Tento komponent je neviditeľný, len monitoruje
}