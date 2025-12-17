import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AutoSEOTrigger() {
  const [status, setStatus] = useState('initializing');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    const runSEO = async () => {
      try {
        setStatus('running');
        
        // 1. Spusti SEO automatizaciu
        await base44.functions.invoke('seoAutomatizacia', {});
        
        // 2. Generuj a odošli sitemap
        await base44.functions.invoke('autoSEOSubmit', {});
        
        setStatus('completed');
        
        // Nastav ďalšie spustenie za týždeň
        const nextRun = new Date();
        nextRun.setDate(nextRun.getDate() + 7);
        localStorage.setItem('nextSEORun', nextRun.toISOString());
        
      } catch (error) {
        console.error('SEO Error:', error);
        setStatus('error');
      }
    };

    // Spusti len ak je admin a ešte sa nespustilo dnes
    if (user?.role === 'admin') {
      const lastRun = localStorage.getItem('lastSEORun');
      const today = new Date().toDateString();
      
      if (!lastRun || new Date(lastRun).toDateString() !== today) {
        runSEO();
        localStorage.setItem('lastSEORun', new Date().toISOString());
      } else {
        setStatus('already_ran');
      }
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {status === 'running' && (
        <Card className="p-4 bg-blue-50 border-blue-200 shadow-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-900">SEO automatizácia beží...</span>
          </div>
        </Card>
      )}
      
      {status === 'completed' && (
        <Card className="p-4 bg-green-50 border-green-200 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">SEO aktualizované ✓</span>
          </div>
        </Card>
      )}
    </div>
  );
}