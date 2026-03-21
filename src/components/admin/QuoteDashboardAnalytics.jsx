import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Home, Euro, Calendar, Users } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const STATUS_LABELS = {
  ulozena: 'Uložená',
  odoslana_na_posudenie: 'Na posúdenie',
  cakajuca_na_vyjadrenie: 'Čaká',
  schvalena_adminom: 'Schválená',
  s_komentarmi_admina: 'S komentármi',
  zamietnuta_adminom: 'Zamietnutá',
  akceptovana_klientom: 'Akceptovaná',
  odmietnuta_klientom: 'Odmietnutá',
};

export default function QuoteDashboardAnalytics({ allQuotes, consultations, allUsers }) {

  // --- Štatistiky statusov ponúk (koláčový graf) ---
  const statusData = useMemo(() => {
    const counts = {};
    allQuotes.forEach(q => {
      const key = q.status || 'ulozena';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value
    }));
  }, [allQuotes]);

  // --- Trend vytvárania ponúk za posledných 8 týždňov (čiarový graf) ---
  const weeklyTrend = useMemo(() => {
    const weeks = {};
    const now = new Date();
    // Inicializuj posledných 8 týždňov
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const label = `${d.getDate()}.${d.getMonth() + 1}`;
      weeks[label] = { label, vytvorene: 0, schvalene: 0 };
    }
    allQuotes.forEach(q => {
      const d = new Date(q.created_date);
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      const weekIdx = Math.floor(diffDays / 7);
      if (weekIdx >= 0 && weekIdx <= 7) {
        const refDate = new Date(now);
        refDate.setDate(refDate.getDate() - weekIdx * 7);
        const label = `${refDate.getDate()}.${refDate.getMonth() + 1}`;
        if (weeks[label]) {
          weeks[label].vytvorene += 1;
          if (q.status === 'schvalena_adminom' || q.status === 'akceptovana_klientom') {
            weeks[label].schvalene += 1;
          }
        }
      }
    });
    return Object.values(weeks);
  }, [allQuotes]);

  // --- Top modely domov (stĺpcový graf) ---
  const topHouses = useMemo(() => {
    const counts = {};
    allQuotes.forEach(q => {
      const key = q.dom_nazov || 'Neznámy';
      if (!counts[key]) counts[key] = { name: key, ponuky: 0, celkovaCena: 0 };
      counts[key].ponuky += 1;
      counts[key].celkovaCena += (q.celkova_cena || 0);
    });
    return Object.values(counts)
      .sort((a, b) => b.ponuky - a.ponuky)
      .slice(0, 8)
      .map(h => ({ ...h, avgCena: Math.round(h.celkovaCena / h.ponuky) }));
  }, [allQuotes]);

  // --- Konzultácie podľa typu ---
  const consultationTypes = useMemo(() => {
    const video = consultations.filter(c => c.typ === 'video_hovor').length;
    const phone = consultations.filter(c => c.typ === 'telefonicky_hovor').length;
    return [
      { name: '📹 Video hovor', value: video },
      { name: '📞 Telefonát', value: phone },
    ];
  }, [consultations]);

  // --- Konzultácie podľa statusu ---
  const consultationStatus = useMemo(() => {
    const counts = { nova: 0, potvrdena: 0, zrusena: 0, dokoncena: 0 };
    consultations.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return [
      { name: 'Nové', value: counts.nova, color: '#f59e0b' },
      { name: 'Potvrdené', value: counts.potvrdena, color: '#22c55e' },
      { name: 'Dokončené', value: counts.dokoncena, color: '#3b82f6' },
      { name: 'Zrušené', value: counts.zrusena, color: '#ef4444' },
    ];
  }, [consultations]);

  // --- Celkové KPI metriky ---
  const totalRevenuePipeline = allQuotes
    .filter(q => ['odoslana_na_posudenie', 'schvalena_adminom', 'akceptovana_klientom'].includes(q.status))
    .reduce((sum, q) => sum + (q.celkova_cena || 0), 0);

  const avgQuoteValue = allQuotes.length
    ? Math.round(allQuotes.reduce((s, q) => s + (q.celkova_cena || 0), 0) / allQuotes.length)
    : 0;

  const conversionRate = allQuotes.length
    ? Math.round((allQuotes.filter(q => q.status === 'schvalena_adminom' || q.status === 'akceptovana_klientom').length / allQuotes.length) * 100)
    : 0;

  const kpis = [
    { label: 'Pipeline hodnota', value: `${totalRevenuePipeline.toLocaleString()} €`, icon: Euro, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Priem. hodnota ponuky', value: `${avgQuoteValue.toLocaleString()} €`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Miera konverzie', value: `${conversionRate} %`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Aktívni klienti', value: allUsers.length, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">

      {/* KPI karty */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-xl font-black text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Trend ponúk + Statusy */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Čiarový graf – trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Trend vytvárania ponúk</h3>
          <p className="text-xs text-gray-400 mb-4">Posledných 8 týždňov – vytvorené vs. schválené</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="vytvorene" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Vytvorené" />
              <Line type="monotone" dataKey="schvalene" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Schválené" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Koláčový – statusy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Statusy ponúk</h3>
          <p className="text-xs text-gray-400 mb-2">Celkový prehľad</p>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate max-w-[110px]">{s.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Žiadne dáta</div>
          )}
        </div>
      </div>

      {/* Top modely domov */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-1">Záujem o modely domov</h3>
        <p className="text-xs text-gray-400 mb-4">Počet uložených ponúk podľa modelu</p>
        {topHouses.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topHouses} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip
                formatter={(value, name) => [value, name === 'ponuky' ? 'Ponúk' : 'Priem. cena']}
              />
              <Bar dataKey="ponuky" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {topHouses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">Žiadne dáta o domoch</div>
        )}
      </div>

      {/* Konzultácie – typ + status */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Typ konzultácií</h3>
          <p className="text-xs text-gray-400 mb-3">Video hovor vs. telefonát</p>
          <div className="space-y-3">
            {consultationTypes.map((ct, i) => (
              <div key={ct.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{ct.name}</span>
                  <span className="font-bold text-gray-900">{ct.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: consultations.length ? `${(ct.value / consultations.length) * 100}%` : '0%',
                      backgroundColor: i === 0 ? '#3b82f6' : '#8b5cf6'
                    }}
                  />
                </div>
              </div>
            ))}
            {consultations.length === 0 && <div className="text-center py-4 text-gray-400 text-sm">Žiadne konzultácie</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Stav konzultácií</h3>
          <p className="text-xs text-gray-400 mb-3">Prehľad podľa statusu</p>
          <div className="space-y-2.5">
            {consultationStatus.map(cs => (
              <div key={cs.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cs.color }} />
                  <span className="text-sm text-gray-700">{cs.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: consultations.length ? `${(cs.value / consultations.length) * 100}%` : '0%',
                        backgroundColor: cs.color
                      }}
                    />
                  </div>
                  <span className="font-bold text-gray-900 text-sm w-5 text-right">{cs.value}</span>
                </div>
              </div>
            ))}
            {consultations.length === 0 && <div className="text-center py-4 text-gray-400 text-sm">Žiadne konzultácie</div>}
          </div>
        </div>
      </div>

      {/* Priemerná cena ponúk podľa modelu */}
      {topHouses.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Priemerná hodnota ponuky podľa modelu</h3>
          <p className="text-xs text-gray-400 mb-4">V EUR s DPH</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topHouses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`${v.toLocaleString()} €`, 'Priem. cena']} />
              <Bar dataKey="avgCena" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} name="Priem. cena" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}