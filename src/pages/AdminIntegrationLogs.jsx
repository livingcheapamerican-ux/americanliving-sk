import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, AlertCircle, CheckCircle, RefreshCw, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const CREDIT_COLORS = {
  InvokeLLM: "bg-red-100 text-red-800",
  GenerateImage: "bg-purple-100 text-purple-800",
  SendEmail: "bg-blue-100 text-blue-800",
  UploadFile: "bg-green-100 text-green-800",
  ExtractDataFromFile: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-800",
};

export default function AdminIntegrationLogs() {
  const [filter, setFilter] = useState("all");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["integration-logs", filter],
    queryFn: async () => {
      const all = await base44.entities.IntegrationLog.list("-created_date", 200);
      if (filter === "all") return all;
      return all.filter((l) => l.integration_type === filter);
    },
    refetchInterval: 30000,
  });

  const totalCredits = logs.reduce((sum, l) => sum + (l.estimated_credits || 1), 0);

  const byFunction = logs.reduce((acc, l) => {
    acc[l.function_name] = acc[l.function_name] || { count: 0, credits: 0 };
    acc[l.function_name].count += 1;
    acc[l.function_name].credits += l.estimated_credits || 1;
    return acc;
  }, {});

  const sortedFunctions = Object.entries(byFunction)
    .sort((a, b) => b[1].credits - a[1].credits)
    .slice(0, 10);

  const byType = logs.reduce((acc, l) => {
    acc[l.integration_type] = (acc[l.integration_type] || 0) + (l.estimated_credits || 1);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8" style={{ paddingTop: "5rem" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-8 h-8 text-red-600 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Integration Credit Monitor</h1>
              <p className="text-sm text-gray-500">Sledovanie spotreby integračných kreditov</p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Obnoviť
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <p className="text-xs text-red-600 font-semibold">Odhadované kredity</p>
            <p className="text-3xl font-black text-red-700">{totalCredits}</p>
            <p className="text-xs text-red-500">za {logs.length} volaní</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-xs text-purple-600 font-semibold">LLM volania</p>
            <p className="text-3xl font-black text-purple-700">
              {logs.filter((l) => l.integration_type === "InvokeLLM").length}
            </p>
            <p className="text-xs text-purple-500">najdrahšie</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-xs text-green-600 font-semibold">Úspešné</p>
            <p className="text-3xl font-black text-green-700">
              {logs.filter((l) => l.status === "success").length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <p className="text-xs text-orange-600 font-semibold">Chybné</p>
            <p className="text-3xl font-black text-orange-700">
              {logs.filter((l) => l.status === "failed").length}
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top "žrúti" kreditov */}
          <Card className="p-4">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              Top žrúti kreditov (funkcie)
            </h2>
            <div className="space-y-2">
              {sortedFunctions.map(([fn, data]) => (
                <div key={fn} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-gray-700 truncate">{fn}</span>
                      <span className="text-xs font-black text-red-600 ml-2 flex-shrink-0">
                        ~{data.credits} kr.
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                        style={{ width: `${Math.min(100, (data.credits / totalCredits) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{data.count}×</span>
                </div>
              ))}
              {sortedFunctions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Žiadne záznamy</p>
              )}
            </div>
          </Card>

          {/* Podľa typu integrácie */}
          <Card className="p-4">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Podľa typu integrácie
            </h2>
            <div className="space-y-2">
              {Object.entries(byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, credits]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Badge className={CREDIT_COLORS[type] || "bg-gray-100 text-gray-700"}>
                      {type}
                    </Badge>
                    <span className="font-black text-sm text-gray-800">~{credits} kreditov</span>
                  </div>
                ))}
              {Object.keys(byType).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Žiadne záznamy</p>
              )}
            </div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "InvokeLLM", "GenerateImage", "SendEmail", "UploadFile", "Other"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-red-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
              }`}
            >
              {f === "all" ? "Všetky" : f}
            </button>
          ))}
        </div>

        {/* Log záznam */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Čas</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Funkcia</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Typ</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Trigger</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Kredity</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Načítavam...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Žiadne záznamy. Pridajte logging do backend funkcií.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {log.created_date
                          ? format(new Date(log.created_date), "dd.MM HH:mm:ss")
                          : "-"}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-800">{log.function_name}</td>
                      <td className="p-3">
                        <Badge className={`text-xs ${CREDIT_COLORS[log.integration_type] || "bg-gray-100 text-gray-700"}`}>
                          {log.integration_type}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-gray-500">{log.trigger || "-"}</td>
                      <td className="p-3 font-black text-red-600">{log.estimated_credits || 1}</td>
                      <td className="p-3">
                        {log.status === "success" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-xs text-gray-400 mt-4 text-center">
          ⚠️ Kredity sú odhadované. Pre presné sledovanie pridajte logIntegrationCall() do každej backend funkcie, ktorá volá AI integrácie.
        </p>
      </div>
    </div>
  );
}