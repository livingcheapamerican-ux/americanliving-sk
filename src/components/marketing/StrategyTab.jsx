import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Clock, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { sk } from "date-fns/locale";

export default function StrategyTab() {
  const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];
  const ADMIN_IPS = ['109.230.104.122', '2a02:c847:166:a899:f148:3f22:4df1:169'];

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['strategy-tab-sessions'],
    queryFn: async () => {
      const all = await base44.entities.UserSession.list('-created_date', 500);
      return all.filter(s => {
        if (ADMIN_EMAILS.includes(s.user_email)) return false;
        if (s.location_info?.ip && ADMIN_IPS.includes(s.location_info.ip)) return false;
        if (s.referrer?.includes('app.base44.com')) return false;
        return true;
      });
    },
    refetchInterval: 60000
  });

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.created_date);
    const now = new Date();
    return d >= startOfDay(now) && d <= endOfDay(now);
  });

  const yesterdaySessions = sessions.filter(s => {
    const d = new Date(s.created_date);
    const yesterday = subDays(new Date(), 1);
    return d >= startOfDay(yesterday) && d <= endOfDay(yesterday);
  });

  const uniqueToday = new Set(todaySessions.map(s => s.user_email || s.location_info?.ip || s.session_id)).size;
  const uniqueYesterday = new Set(yesterdaySessions.map(s => s.user_email || s.location_info?.ip || s.session_id)).size;

  return (
    <div className="space-y-6">
      {/* KPI prehľad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-600 text-white">Dnes</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Unikátni návštevníci</p>
            <p className="text-4xl font-bold text-gray-900">{uniqueToday}</p>
            <p className="text-xs text-gray-500 mt-1">{todaySessions.length} sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-600 text-white">Včera</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Unikátni návštevníci</p>
            <p className="text-4xl font-bold text-gray-900">{uniqueYesterday}</p>
            <p className="text-xs text-gray-500 mt-1">{yesterdaySessions.length} sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-600 text-white">Celkom</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Zaznamenaných sessions</p>
            <p className="text-4xl font-bold text-gray-900">{sessions.length}</p>
            <p className="text-xs text-gray-500 mt-1">posledných 500</p>
          </CardContent>
        </Card>
      </div>

      {/* Zoznam posledných návštev */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            📋 Posledné návštevy stránky
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p>Načítavam sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Žiadne sessions</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sessions.slice(0, 100).map((session) => (
                <div key={session.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {session.device_type || 'unknown'}
                      </Badge>
                      {session.location_info?.country && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs shrink-0">
                          {session.location_info.country}
                        </Badge>
                      )}
                      {session.conversions?.length > 0 && (
                        <Badge className="bg-green-600 text-white text-xs shrink-0">
                          ✅ Konverzia
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {session.pages_visited?.[0]?.page_url || session.referrer || 'priama návšteva'}
                    </p>
                    {session.duration_seconds > 0 && (
                      <p className="text-xs text-gray-400">
                        ⏱️ {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      {format(new Date(session.created_date), 'dd.MM HH:mm', { locale: sk })}
                    </p>
                    {session.user_email && (
                      <p className="text-xs text-blue-600 truncate max-w-[120px]">{session.user_email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}