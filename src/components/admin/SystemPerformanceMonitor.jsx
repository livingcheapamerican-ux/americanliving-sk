import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Database, Zap, Clock, TrendingUp } from "lucide-react";

export default function SystemPerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    refreshRate: 0,
    activeQueries: 0,
    memoryUsage: 0,
    timestamp: Date.now()
  });

  const [history, setHistory] = useState([]);
  const [startTime] = useState(Date.now());

  // Limits
  const MAX_API_CALLS_PER_MIN = 300;
  const MAX_REFRESH_RATE = 10; // per second
  const MAX_ACTIVE_QUERIES = 50;

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulovaný výpočet metrik na základe Activity Monitor
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const apiCallsCount = entries.filter(e => e.name.includes('/api/')).length;
        
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        
        const newMetrics = {
          apiCalls: apiCallsCount,
          refreshRate: Math.min(apiCallsCount / Math.max(elapsed, 1), MAX_REFRESH_RATE),
          activeQueries: performance.getEntriesByType('resource').filter(r => 
            r.name.includes('/entities/') && r.responseEnd === 0
          ).length,
          memoryUsage: performance.memory ? 
            (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100 : 0,
          timestamp: now
        };

        setMetrics(newMetrics);
        
        setHistory(prev => {
          const updated = [...prev, {
            time: new Date(now).toLocaleTimeString('sk-SK'),
            apiCalls: newMetrics.apiCalls,
            refreshRate: newMetrics.refreshRate.toFixed(1),
            activeQueries: newMetrics.activeQueries
          }];
          return updated.slice(-20); // Keep last 20 data points
        });
      });

      observer.observe({ entryTypes: ['resource', 'navigation'] });

      return () => observer.disconnect();
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const getStatusColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage < 50) return 'text-green-600 bg-green-50';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">API Calls</p>
                <p className="text-2xl font-bold text-blue-900">{metrics.apiCalls}</p>
              </div>
            </div>
            <Badge className={getStatusColor(metrics.apiCalls, MAX_API_CALLS_PER_MIN)}>
              {((metrics.apiCalls / MAX_API_CALLS_PER_MIN) * 100).toFixed(0)}%
            </Badge>
          </div>
          <Progress 
            value={(metrics.apiCalls / MAX_API_CALLS_PER_MIN) * 100} 
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-2">Limit: {MAX_API_CALLS_PER_MIN}/min</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Refresh Rate</p>
                <p className="text-2xl font-bold text-purple-900">{metrics.refreshRate.toFixed(1)}</p>
              </div>
            </div>
            <Badge className={getStatusColor(metrics.refreshRate, MAX_REFRESH_RATE)}>
              {((metrics.refreshRate / MAX_REFRESH_RATE) * 100).toFixed(0)}%
            </Badge>
          </div>
          <Progress 
            value={(metrics.refreshRate / MAX_REFRESH_RATE) * 100} 
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-2">Limit: {MAX_REFRESH_RATE}/s</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Active Queries</p>
                <p className="text-2xl font-bold text-orange-900">{metrics.activeQueries}</p>
              </div>
            </div>
            <Badge className={getStatusColor(metrics.activeQueries, MAX_ACTIVE_QUERIES)}>
              {((metrics.activeQueries / MAX_ACTIVE_QUERIES) * 100).toFixed(0)}%
            </Badge>
          </div>
          <Progress 
            value={(metrics.activeQueries / MAX_ACTIVE_QUERIES) * 100} 
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-2">Limit: {MAX_ACTIVE_QUERIES}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Memory Usage</p>
                <p className="text-2xl font-bold text-green-900">{metrics.memoryUsage.toFixed(0)}%</p>
              </div>
            </div>
            <Badge className={getStatusColor(metrics.memoryUsage, 100)}>
              {metrics.memoryUsage > 0 ? 'Active' : 'N/A'}
            </Badge>
          </div>
          <Progress 
            value={metrics.memoryUsage} 
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-2">JS Heap</p>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            API Calls History
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="apiCalls" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Refresh Rate & Active Queries
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="refreshRate" 
                stroke="#a855f7" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="activeQueries" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-xs text-gray-600">Refresh Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-xs text-gray-600">Active Queries</span>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-slate-600" />
          <h3 className="font-bold text-gray-900">System Status</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-xs text-gray-600 mb-1">Uptime</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.floor((Date.now() - startTime) / 1000)}s
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-xs text-gray-600 mb-1">Avg Response</p>
            <p className="text-lg font-bold text-gray-900">
              {performance.timing ? 
                Math.round(performance.timing.responseEnd - performance.timing.requestStart) : 0}ms
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-xs text-gray-600 mb-1">Data Points</p>
            <p className="text-lg font-bold text-gray-900">{history.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-xs text-gray-600 mb-1">Status</p>
            <Badge className="bg-green-500 text-white">
              {metrics.apiCalls < MAX_API_CALLS_PER_MIN * 0.8 ? '🟢 Healthy' : '🟡 High Load'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}