import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle, Image, FileText, CheckCircle, XCircle, FolderSync } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalysisLogPanel from "../components/admin/AnalysisLogPanel";
import ReorganizationLogPanel from "../components/admin/ReorganizationLogPanel";

export default function AdminAnalyzaDatabazy() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Načítaj len ZÁKLADNÉ štatistiky - nie všetky dokumenty
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dokument-stats'],
    queryFn: async () => {
      // Načítaj len prvých 100 pre štatistiky
      const sample = await base44.entities.Dokument.filter({ typ: "fotky" }, '-created_date', 100);
      
      const analyzovaneCount = sample.filter(d => d.ai_generovany_popis).length;
      const podrobneCount = sample.filter(d => d.podrobna_analyza_datum).length;
      const vizAnalyzaCount = sample.filter(d => d.vizualna_analyza?.spravny_vyrobca).length;
      const reorganizovaneCount = sample.filter(d => d.reorganizovany).length;
      
      return {
        celkom: sample.length,
        analyzovane: analyzovaneCount,
        podrobne: podrobneCount,
        vizualna: vizAnalyzaCount,
        reorganizovane: reorganizovaneCount,
        neanalyzovane: sample.length - podrobneCount,
        sample: sample.slice(0, 10) // Iba prvých 10 pre preview
      };
    },
    refetchInterval: 5000
  });

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !user.super_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-2 font-bold">Prístup len pre administrátorov</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 Real-Time Analýza & Reorganizácia
          </h1>
          <p className="text-gray-600">Sleduj procesy v reálnom čase</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sample fotiek</p>
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

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Podrobné</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.podrobne || 0}</p>
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
                <p className="text-2xl font-bold text-orange-900">{stats?.neanalyzovane || 0}</p>
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

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vizuálna</p>
                <p className="text-2xl font-bold text-amber-900">{stats?.vizualna || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-Time Panels */}
        <Tabs defaultValue="analysis" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">⚡ Analýza + Reorganizácia</TabsTrigger>
            <TabsTrigger value="reorganization">📁 Reorganizácia</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <AnalysisLogPanel />
          </TabsContent>

          <TabsContent value="reorganization" className="mt-6">
            <ReorganizationLogPanel />
          </TabsContent>
        </Tabs>

        {/* Sample Preview */}
        {stats?.sample && stats.sample.length > 0 && (
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold mb-4">📸 Sample fotiek (prvých 10)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.sample.map((dok) => (
                <div key={dok.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={dok.subor_url} 
                    alt={dok.nazov}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{dok.nazov}</p>
                    {dok.vizualna_analyza?.spravny_vyrobca && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        ✓ {dok.vizualna_analyza.spravny_vyrobca}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}