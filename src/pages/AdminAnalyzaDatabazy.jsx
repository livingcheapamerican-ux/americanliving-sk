import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle, Image, CheckCircle, XCircle, FolderSync } from "lucide-react";
import SystemPerformanceMonitor from "../components/admin/SystemPerformanceMonitor";

export default function AdminAnalyzaDatabazy() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dokument-stats-light'],
    queryFn: async () => {
      const allDocs = await base44.entities.Dokument.list('-created_date', 200);
      const photos = allDocs.filter(d => d.typ === 'fotky');
      
      const analyzovane = photos.filter(d => d.vizualna_analyza?.spravny_vyrobca).length;
      const reorganizovane = photos.filter(d => d.reorganizovany).length;
      
      return {
        celkom: photos.length,
        analyzovane,
        reorganizovane,
        zostava: photos.length - analyzovane,
        totalDocs: allDocs.length
      };
    },
    refetchInterval: 10000
  });

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !user.super_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold">Prístup len pre administrátorov</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📊 Analýza databázy
          </h1>
          <p className="text-gray-600">Prehľad dokumentov a fotiek v systéme</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Celkom docs</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.totalDocs || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fotky</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.celkom || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Analyzované</p>
                <p className="text-2xl font-bold text-green-900">{stats?.analyzovane || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Zostáva</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.zostava || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                <FolderSync className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reorganizované</p>
                <p className="text-2xl font-bold text-cyan-900">{stats?.reorganizovane || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* System Performance Monitor */}
        <SystemPerformanceMonitor />
      </div>
    </div>
  );
}