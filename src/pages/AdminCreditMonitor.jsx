import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Zap, AlertCircle, TrendingUp, Bell, Settings, BarChart3, Calendar } from "lucide-react";
import { format, subDays, startOfDay, parseISO } from "date-fns";

const COLORS = ["#ef4444", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#64748b"];

export default function AdminCreditMonitor() {
  const [dailyLimit, setDailyLimit] = useState(500);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [tempLimit, setTempLimit] = useState(500);

  // Načítaj konfiguráciu limitov
  const { data: config } = useQuery({
    queryKey: ["credit-config"],
    queryFn: async () => {
      const configs = await base44.entities.AppConfiguration.filter({ 
        config_key: "credit_daily_limit" 
      });
      if (configs[0]?.config_value?.limit) {
        setDailyLimit(configs[0].config_value.limit);
        setTempLimit(configs[0].config_value.limit);
      }
      return configs[0];
    }
  });

  // Načítaj logy z posledných 7 dní
  const { data: allLogs = [], isLoading, refetch } = useQuery({
    queryKey: ["integration-logs-detailed"],
    queryFn: async () => {
      const logs = await base44.entities.IntegrationLog.list("-created_date", 1000);
      return logs;
    },
    refetchInterval: 60000, // Refresh každých 60 sekúnd
  });

  // Aktuálny deň
  const today = startOfDay(new Date());
  const todayLogs = allLogs.filter(log => {
    const logDate = startOfDay(parseISO(log.created_date));
    return logDate.getTime() === today.getTime();
  });
  const todayCredits = todayLogs.reduce((sum, l) => sum + (l.estimated_credits || 1), 0);
  const todayPercentage = Math.round((todayCredits / dailyLimit) * 100);
  const isOverLimit = todayCredits > dailyLimit;

  // Historická data - posledných 7 dní
  const dailyStats = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "dd.MM");
    dailyStats[dateStr] = { date: dateStr, credits: 0, count: 0 };
  }

  allLogs.forEach(log => {
    const logDate = startOfDay(parseISO(log.created_date));
    if (logDate >= subDays(today, 7) && logDate <= today) {
      const dateStr = format(logDate, "dd.MM");
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].credits += log.estimated_credits || 1;
        dailyStats[dateStr].count += 1;
      }
    }
  });

  const chartData = Object.values(dailyStats);

  // Funkcie s najvyššou spotrebou
  const byFunction = todayLogs.reduce((acc, l) => {
    acc[l.function_name] = acc[l.function_name] || { count: 0, credits: 0 };
    acc[l.function_name].count += 1;
    acc[l.function_name].credits += l.estimated_credits || 1;
    return acc;
  }, {});

  const topFunctions = Object.entries(byFunction)
    .sort((a, b) => b[1].credits - a[1].credits)
    .slice(0, 6)
    .map(([name, data]) => ({ name, ...data }));

  // Typy integracií
  const byType = todayLogs.reduce((acc, l) => {
    acc[l.integration_type] = (acc[l.integration_type] || 0) + (l.estimated_credits || 1);
    return acc;
  }, {});

  const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));

  const handleSaveLimit = async () => {
    try {
      if (config) {
        await base44.entities.AppConfiguration.update(config.id, {
          config_value: { limit: parseInt(tempLimit) }
        });
      } else {
        await base44.entities.AppConfiguration.create({
          config_key: "credit_daily_limit",
          config_value: { limit: parseInt(tempLimit) }
        });
      }
      setDailyLimit(parseInt(tempLimit));
      setShowLimitModal(false);
      await refetch();
    } catch (error) {
      console.error("Chyba pri ukladaní limitu:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8" style={{ paddingTop: "5rem" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-8 h-8 text-yellow-500" />
              <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${isOverLimit ? "bg-red-500" : "bg-green-500"}`} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">AI Credit Monitor</h1>
              <p className="text-sm text-gray-500">Reálny čas monitorovanie spotreby kreditov</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowLimitModal(true)} 
              variant="outline" 
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Limit ({dailyLimit})
            </Button>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Obnoviť
            </Button>
          </div>
        </div>

        {/* Alert ak je prekročený limit */}
        {isOverLimit && (
          <Alert className="mb-6 bg-red-50 border-red-300">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              ⚠️ <strong>Denný limit prekročený!</strong> Dnes ste spotrebovali {todayCredits} kreditov z {dailyLimit}. 
              Email s upozornením bol odoslaný administrátorovi.
            </AlertDescription>
          </Alert>
        )}

        {/* Hlavné karty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Dnešná spotreba */}
          <Card className={`p-6 ${isOverLimit ? "border-red-300 bg-red-50" : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"}`}>
            <p className="text-xs font-semibold text-gray-600 mb-2">DNEŠNÁ SPOTREBA</p>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className={`text-3xl font-black ${isOverLimit ? "text-red-700" : "text-blue-700"}`}>
                  {todayCredits}
                </p>
                <p className="text-xs text-gray-500">z {dailyLimit} kreditov</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${todayPercentage > 100 ? "text-red-600" : "text-blue-600"}`}>
                  {todayPercentage}%
                </p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all ${isOverLimit ? "bg-red-600" : "bg-blue-600"}`}
                style={{ width: `${Math.min(100, todayPercentage)}%` }}
              />
            </div>
          </Card>

          {/* Priemer za 7 dní */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">PRIEMER 7 DNÍ</p>
            <p className="text-3xl font-black text-purple-700">
              {Math.round(allLogs.reduce((sum, l) => sum + (l.estimated_credits || 1), 0) / 7)}
            </p>
            <p className="text-xs text-purple-600 mt-2">kreditov za deň</p>
          </Card>

          {/* Dnešné volania */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">VOĽANIA DNES</p>
            <p className="text-3xl font-black text-green-700">{todayLogs.length}</p>
            <p className="text-xs text-green-600 mt-2">AI operácií</p>
          </Card>

          {/* Zostávajúce kredity */}
          <Card className={`p-6 ${dailyLimit - todayCredits <= 0 ? "bg-red-50 border-red-200" : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"}`}>
            <p className="text-xs font-semibold text-gray-600 mb-2">ZOSTÁVAJÚCE</p>
            <p className={`text-3xl font-black ${dailyLimit - todayCredits <= 0 ? "text-red-700" : "text-orange-700"}`}>
              {Math.max(0, dailyLimit - todayCredits)}
            </p>
            <p className="text-xs text-gray-500 mt-2">do denného limitu</p>
          </Card>
        </div>

        {/* Grafy */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Trend - Line Chart */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Trend posledných 7 dní
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
                  formatter={(value) => `${value} kr.`}
                />
                <Area 
                  type="monotone" 
                  dataKey="credits" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorCredits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Rozdelenie podľa typu */}
          <Card className="p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Typ integrácie (dnes)
            </h2>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}kr`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} kr.`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">Žiadne voľania dnes</p>
            )}
          </Card>
        </div>

        {/* Top funkcie */}
        <Card className="p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Top žrúti kreditov dnes
          </h2>
          {topFunctions.length > 0 ? (
            <div className="space-y-3">
              {topFunctions.map((fn) => (
                <div key={fn.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-mono text-gray-800 truncate">{fn.name}</span>
                      <span className="text-sm font-black text-red-600 ml-2 flex-shrink-0">
                        {fn.credits} kr ({fn.count}×)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600"
                        style={{ width: `${Math.min(100, (fn.credits / todayCredits) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Žiadne voľania dnes</p>
          )}
        </Card>

        {/* Modal na nastavenie limitu */}
        {showLimitModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nastav denný limit</h2>
              <input
                type="number"
                value={tempLimit}
                onChange={(e) => setTempLimit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mb-6">
                Ak sa denná spotreba presiahne tento limit, bude odoslané upozornenie
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowLimitModal(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  Zrušiť
                </Button>
                <Button 
                  onClick={handleSaveLimit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Uložiť
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}