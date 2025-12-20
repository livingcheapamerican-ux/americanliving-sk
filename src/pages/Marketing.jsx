import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target,
  BarChart3,
  Calendar,
  Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { sk } from "date-fns/locale";

export default function Marketing() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  // Dnešné sessions
  const { data: todaySessions = [] } = useQuery({
    queryKey: ['today-sessions'],
    queryFn: async () => {
      const sessions = await base44.entities.UserSession.list('-created_date', 500);
      const today = new Date();
      return sessions.filter(s => {
        const sessionDate = new Date(s.created_date);
        return sessionDate >= startOfDay(today) && sessionDate <= endOfDay(today);
      });
    },
    enabled: isAdmin
  });

  // Týždenné dopyty
  const { data: weekDopyty = [] } = useQuery({
    queryKey: ['week-dopyty'],
    queryFn: async () => {
      const dopyty = await base44.entities.Dopyt.list('-created_date', 200);
      const weekStart = startOfWeek(new Date(), { locale: sk });
      const weekEnd = endOfWeek(new Date(), { locale: sk });
      return dopyty.filter(d => {
        const dopytDate = new Date(d.created_date);
        return dopytDate >= weekStart && dopytDate <= weekEnd;
      });
    },
    enabled: isAdmin
  });

  // Všetky sessions pre výpočty
  const { data: allSessions = [] } = useQuery({
    queryKey: ['all-sessions-marketing'],
    queryFn: () => base44.entities.UserSession.list('-created_date', 1000),
    enabled: isAdmin
  });

  // Marketing insights
  const { data: insights = [] } = useQuery({
    queryKey: ['marketing-insights-list'],
    queryFn: () => base44.entities.MarketingInsight.list('-created_date', 20),
    enabled: isAdmin
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  // Výpočet KPI
  const conversions = allSessions.filter(s => s.conversions?.length > 0).length;
  const conversionRate = allSessions.length > 0 
    ? ((conversions / allSessions.length) * 100).toFixed(2)
    : 0;

  const abandonedCarts = allSessions.filter(s => 
    s.configurator_interactions?.length > 0 && (!s.conversions || s.conversions.length === 0)
  ).length;

  // Graf - posledných 14 dní
  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const daySessions = allSessions.filter(s => {
      const sessionDate = new Date(s.created_date);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
    
    chartData.push({
      date: format(date, 'dd.MM', { locale: sk }),
      visits: daySessions.length
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Marketing Dashboard</h1>
          <p className="text-gray-600">Interný digitálny marketér - prehľad výkonnosti</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600 text-white">Dnes</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Dnešné návštevy</p>
              <p className="text-4xl font-bold text-gray-900">{todaySessions.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-white">Tento týždeň</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Nové dopyty</p>
              <p className="text-4xl font-bold text-gray-900">{weekDopyty.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600 text-white">Konverzia</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Konverzný pomer</p>
              <p className="text-4xl font-bold text-gray-900">{conversionRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-600 text-white">Košíky</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Opustené košíky</p>
              <p className="text-4xl font-bold text-gray-900">{abandonedCarts}</p>
            </CardContent>
          </Card>
        </div>

        {/* Graf návštevnosti */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Vývoj návštevnosti za posledných 14 dní
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabuľka Marketing Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Posledné Marketing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Zatiaľ žiadne insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {insight.dom_nazov}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Zobrazenia</p>
                              <p className="font-bold">{insight.celkovy_zajem?.pocet_zobrazeni || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Konfigurácie</p>
                              <p className="font-bold">{insight.celkovy_zajem?.pocet_konfiguracii || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Konverzia</p>
                              <p className="font-bold">{insight.celkovy_zajem?.miera_konverzie?.toFixed(2) || 0}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Confidence</p>
                              <Badge className={
                                insight.confidence_score > 70 ? "bg-green-600" :
                                insight.confidence_score > 40 ? "bg-yellow-600" : "bg-red-600"
                              }>
                                {insight.confidence_score || 0}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {format(new Date(insight.created_date), 'dd.MM.yyyy HH:mm', { locale: sk })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}