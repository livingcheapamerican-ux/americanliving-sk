import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AnalysisStatistics({ dokumenty }) {
  const statistics = useMemo(() => {
    const stats = {
      typyObsahu: {},
      materialy: {},
      dreviny: {},
      upravy: {},
      okna: {},
      strechy: {},
      stavy: {}
    };

    dokumenty.forEach(dok => {
      if (!dok.vizualna_analyza) return;
      const va = dok.vizualna_analyza;

      // Typ obsahu
      if (va.typ_obsahu) {
        stats.typyObsahu[va.typ_obsahu] = (stats.typyObsahu[va.typ_obsahu] || 0) + 1;
      }

      // Materiály
      va.fasada_materialy?.forEach(m => {
        stats.materialy[m] = (stats.materialy[m] || 0) + 1;
      });

      // Dreviny
      va.fasada_typy_drevin?.forEach(d => {
        stats.dreviny[d] = (stats.dreviny[d] || 0) + 1;
      });

      // Úpravy
      va.fasada_povrchove_upravy?.forEach(u => {
        stats.upravy[u] = (stats.upravy[u] || 0) + 1;
      });

      // Okná
      if (va.okna_typ) {
        stats.okna[va.okna_typ] = (stats.okna[va.okna_typ] || 0) + 1;
      }

      // Strechy
      if (va.strecha_typ) {
        stats.strechy[va.strecha_typ] = (stats.strechy[va.strecha_typ] || 0) + 1;
      }

      // Stavy
      if (va.stav_fasady) {
        stats.stavy[va.stav_fasady] = (stats.stavy[va.stav_fasady] || 0) + 1;
      }
    });

    return {
      typyObsahu: Object.entries(stats.typyObsahu).map(([name, value]) => ({ name, value })),
      materialy: Object.entries(stats.materialy).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
      dreviny: Object.entries(stats.dreviny).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      upravy: Object.entries(stats.upravy).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      okna: Object.entries(stats.okna).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      strechy: Object.entries(stats.strechy).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      stavy: Object.entries(stats.stavy).map(([name, value]) => ({ name, value }))
    };
  }, [dokumenty]);

  if (dokumenty.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-600 text-center">Žiadne dáta na zobrazenie</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Typ obsahu - Pie Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold">Rozloženie typov obsahu</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statistics.typyObsahu}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statistics.typyObsahu.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Materiály fasády - Bar Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold">Najčastejšie materiály fasád</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statistics.materialy}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Dreviny - Bar Chart */}
      {statistics.dreviny.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold">Typy drevín</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.dreviny}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Stav fasády - Pie Chart */}
      {statistics.stavy.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold">Stav fasád</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.stavy}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statistics.stavy.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Grid s okná a strechy */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Okná */}
        {statistics.okna.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-bold">Typy okien</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.okna}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Strechy */}
        {statistics.strechy.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-bold">Typy striech</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.strechy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}