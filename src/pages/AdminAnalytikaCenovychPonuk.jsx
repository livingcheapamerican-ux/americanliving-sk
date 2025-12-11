import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, FileText, CheckCircle, XCircle, Clock, Mail, DollarSign, Home, Calendar } from "lucide-react";

export default function AdminAnalytikaCenovychPonuk() {
  const [obdobie, setObdobie] = useState("30"); // dní
  const [groupBy, setGroupBy] = useState("den"); // den/týždeň/mesiac

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: ponuky = [] } = useQuery({
    queryKey: ['cenove-ponuky-all'],
    queryFn: () => base44.entities.CenovaPonuka.list('-created_date')
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-all'],
    queryFn: () => base44.entities.Dom.list()
  });

  // Filter podľa obdobia
  const filtrovanePonuky = useMemo(() => {
    const dnov = parseInt(obdobie);
    const teraz = new Date();
    const hranica = new Date(teraz.getTime() - dnov * 24 * 60 * 60 * 1000);
    return ponuky.filter(p => new Date(p.created_date) >= hranica);
  }, [ponuky, obdobie]);

  // Štatistiky
  const stats = useMemo(() => {
    const celkom = filtrovanePonuky.length;
    const odoslane = filtrovanePonuky.filter(p => p.odoslana).length;
    const videne = filtrovanePonuky.filter(p => p.datum_zobrazenia).length;
    const akceptovane = filtrovanePonuky.filter(p => p.status === 'akceptovana').length;
    const odmietnute = filtrovanePonuky.filter(p => p.status === 'odmietnuta').length;
    
    const celkovaTrzba = filtrovanePonuky
      .filter(p => p.status === 'akceptovana')
      .reduce((sum, p) => sum + (p.celkova_cena || 0), 0);

    const priemerCena = celkom > 0 
      ? filtrovanePonuky.reduce((sum, p) => sum + (p.celkova_cena || 0), 0) / celkom 
      : 0;

    const konverznaRata = odoslane > 0 ? (akceptovane / odoslane) * 100 : 0;
    const viewRate = odoslane > 0 ? (videne / odoslane) * 100 : 0;

    return {
      celkom,
      odoslane,
      videne,
      akceptovane,
      odmietnute,
      celkovaTrzba,
      priemerCena,
      konverznaRata,
      viewRate
    };
  }, [filtrovanePonuky]);

  // Top modely domov
  const topModely = useMemo(() => {
    const counts = {};
    filtrovanePonuky.forEach(p => {
      counts[p.dom_nazov] = (counts[p.dom_nazov] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([nazov, pocet]) => ({ nazov, pocet }))
      .sort((a, b) => b.pocet - a.pocet)
      .slice(0, 10);
  }, [filtrovanePonuky]);

  // Trend v čase
  const trendData = useMemo(() => {
    const grouped = {};
    filtrovanePonuky.forEach(p => {
      const datum = new Date(p.created_date);
      let key;
      if (groupBy === 'den') {
        key = datum.toLocaleDateString('sk-SK');
      } else if (groupBy === 'týždeň') {
        const weekNum = Math.ceil((datum.getDate() - datum.getDay() + 1) / 7);
        key = `${datum.getMonth() + 1}/${weekNum}`;
      } else {
        key = `${datum.getMonth() + 1}/${datum.getFullYear()}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = { datum: key, ponuky: 0, akceptovane: 0, tržba: 0 };
      }
      grouped[key].ponuky += 1;
      if (p.status === 'akceptovana') {
        grouped[key].akceptovane += 1;
        grouped[key].tržba += p.celkova_cena || 0;
      }
    });
    
    return Object.values(grouped).sort((a, b) => {
      // Simple date comparison
      return a.datum.localeCompare(b.datum);
    });
  }, [filtrovanePonuky, groupBy]);

  // Distribúcia statusov
  const statusData = [
    { name: 'Nové', value: filtrovanePonuky.filter(p => p.status === 'nova').length, color: '#94a3b8' },
    { name: 'Odoslané', value: filtrovanePonuky.filter(p => p.status === 'odoslana').length, color: '#3b82f6' },
    { name: 'Videné', value: filtrovanePonuky.filter(p => p.status === 'videna').length, color: '#8b5cf6' },
    { name: 'Akceptované', value: stats.akceptovane, color: '#10b981' },
    { name: 'Odmietnuté', value: stats.odmietnute, color: '#ef4444' },
  ];

  const isSuperAdmin = user?.super_admin === true;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prístup zamietnutý</h2>
          <p className="text-gray-600">Túto stránku môžu vidieť len super administrátori.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytika cenových ponúk</h1>
            <p className="text-gray-600">Prehľad výkonnosti a konverzií</p>
          </div>
          
          <div className="flex gap-4">
            <Select value={obdobie} onValueChange={setObdobie}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Posledných 7 dní</SelectItem>
                <SelectItem value="30">Posledných 30 dní</SelectItem>
                <SelectItem value="90">Posledných 90 dní</SelectItem>
                <SelectItem value="365">Posledný rok</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="den">Podľa dňa</SelectItem>
                <SelectItem value="týždeň">Podľa týždňa</SelectItem>
                <SelectItem value="mesiac">Podľa mesiaca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Celkom ponúk</span>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.celkom}</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.odoslane} odoslaných
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Akceptované</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.akceptovane}</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.konverznaRata.toFixed(1)}% konverzia
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Celková tržba</span>
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {(stats.celkovaTrzba / 1000).toFixed(0)}k €
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Ø {(stats.priemerCena / 1000).toFixed(0)}k € / ponuka
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">View Rate</span>
              <Mail className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.viewRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.videne} videné ponuky
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Trend ponúk */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Trend ponúk v čase</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="datum" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ponuky" stroke="#3b82f6" name="Ponuky" />
                <Line type="monotone" dataKey="akceptovane" stroke="#10b981" name="Akceptované" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribúcia statusov */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Distribúcia statusov</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top modely */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Top 10 najžiadanejších modelov</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topModely}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nazov" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pocet" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Funnel analýza */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Sales Funnel</h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Vytvorené ponuky</span>
                <span className="text-gray-600">{stats.celkom}</span>
              </div>
              <div className="w-full h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                100%
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Odoslané ponuky</span>
                <span className="text-gray-600">{stats.odoslane}</span>
              </div>
              <div 
                className="h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ width: `${stats.celkom > 0 ? (stats.odoslane / stats.celkom) * 100 : 0}%` }}
              >
                {stats.celkom > 0 ? ((stats.odoslane / stats.celkom) * 100).toFixed(0) : 0}%
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Videné ponuky</span>
                <span className="text-gray-600">{stats.videne}</span>
              </div>
              <div 
                className="h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ width: `${stats.celkom > 0 ? (stats.videne / stats.celkom) * 100 : 0}%` }}
              >
                {stats.celkom > 0 ? ((stats.videne / stats.celkom) * 100).toFixed(0) : 0}%
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Akceptované ponuky</span>
                <span className="text-gray-600">{stats.akceptovane}</span>
              </div>
              <div 
                className="h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ width: `${stats.celkom > 0 ? (stats.akceptovane / stats.celkom) * 100 : 0}%` }}
              >
                {stats.celkom > 0 ? ((stats.akceptovane / stats.celkom) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}