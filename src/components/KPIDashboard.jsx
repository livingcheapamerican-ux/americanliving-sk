import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Target,
  AlertCircle,
  CheckCircle,
  Calendar,
  Lightbulb
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export default function KPIDashboard({ kpiPredikcie, domNazov }) {
  if (!kpiPredikcie) return null;

  const { customer_lifetime_value, customer_acquisition_cost, sales_volume_forecast, kpi_ratio } = kpiPredikcie;

  // Pripraviť dáta pre CLV graf podľa segmentov
  const clvChartData = customer_lifetime_value?.clv_podla_segmentu ? [
    { segment: 'Prieskumníci', clv: customer_lifetime_value.clv_podla_segmentu.prieskumnici || 0 },
    { segment: 'Rozhodovatelia', clv: customer_lifetime_value.clv_podla_segmentu.rozhodovatelia || 0 },
    { segment: 'Vracajúci sa', clv: customer_lifetime_value.clv_podla_segmentu.vracajuci_sa || 0 }
  ] : [];

  // Pripraviť dáta pre CAC graf podľa kanálov
  const cacChartData = customer_acquisition_cost?.cac_podla_kanala ? [
    { kanal: 'Facebook/Instagram', cac: customer_acquisition_cost.cac_podla_kanala.facebook_instagram || 0 },
    { kanal: 'Google Ads', cac: customer_acquisition_cost.cac_podla_kanala.google_ads || 0 },
    { kanal: 'Organický', cac: customer_acquisition_cost.cac_podla_kanala.organicky || 0 }
  ] : [];

  // Sales forecast data
  const salesForecastData = [
    {
      obdobie: 'Nasledujúci mesiac',
      predaj: sales_volume_forecast?.nasledujuci_mesiac?.predpokladany_pocet_predajov || 0,
      dolna: sales_volume_forecast?.nasledujuci_mesiac?.dolna_hranica || 0,
      horna: sales_volume_forecast?.nasledujuci_mesiac?.horna_hranica || 0
    },
    {
      obdobie: 'Nasledujúci štvrťrok',
      predaj: sales_volume_forecast?.nasledujuci_stvrťrok?.predpokladany_pocet_predajov || 0,
      dolna: sales_volume_forecast?.nasledujuci_stvrťrok?.dolna_hranica || 0,
      horna: sales_volume_forecast?.nasledujuci_stvrťrok?.horna_hranica || 0
    }
  ];

  // CLV/CAC ratio hodnotenie farby
  const getRatioColor = (hodnotenie) => {
    switch (hodnotenie) {
      case 'výborné': return 'bg-green-100 text-green-800 border-green-300';
      case 'dobré': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'priemerne': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'zlé': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'kritické': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rastúci': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'klesajúci': return <TrendingDown className="w-4 h-4 text-green-600" />;
      default: return <div className="w-4 h-4 text-gray-600">→</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLV Card */}
        {customer_lifetime_value && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-700">Customer Lifetime Value</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700 mb-1">
                {customer_lifetime_value.celkove_clv?.toLocaleString('sk-SK')} €
              </p>
              <p className="text-xs text-gray-600">Priemerná hodnota zákazníka</p>
            </CardContent>
          </Card>
        )}

        {/* CAC Card */}
        {customer_acquisition_cost && (
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-semibold text-gray-700">Customer Acquisition Cost</p>
                </div>
                {getTrendIcon(customer_acquisition_cost.cac_trend)}
              </div>
              <p className="text-3xl font-bold text-orange-700 mb-1">
                {customer_acquisition_cost.celkove_cac?.toLocaleString('sk-SK')} €
              </p>
              <p className="text-xs text-gray-600">Náklady na získanie zákazníka</p>
            </CardContent>
          </Card>
        )}

        {/* CLV/CAC Ratio Card */}
        {kpi_ratio && (
          <Card className={`border-2 ${getRatioColor(kpi_ratio.hodnotenie)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <p className="text-sm font-semibold text-gray-700">CLV/CAC Ratio</p>
                </div>
                <Badge className={getRatioColor(kpi_ratio.hodnotenie)}>
                  {kpi_ratio.hodnotenie}
                </Badge>
              </div>
              <p className="text-3xl font-bold mb-1">
                {kpi_ratio.clv_cac_ratio?.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">Ideálne: &gt; 3.0</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Lifetime Value Detail */}
      {customer_lifetime_value && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              💰 Customer Lifetime Value (CLV) Analýza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CLV Graf podľa segmentov */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">CLV podľa typu zákazníka</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={clvChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis label={{ value: 'CLV (€)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip 
                    formatter={(value) => `${value.toLocaleString('sk-SK')} €`}
                  />
                  <Bar dataKey="clv" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Faktory ovplyvňujúce CLV */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">🔍 Faktory ovplyvňujúce CLV</h4>
              <div className="space-y-2">
                {customer_lifetime_value.faktory_ovplyvnujuce_clv?.map((faktor, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{faktor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Odporúčania na zvýšenie CLV */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                💡 Ako zvýšiť CLV
              </h4>
              <div className="space-y-2">
                {customer_lifetime_value.odporucania_na_zvysenie?.map((odporucanie, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">{idx + 1}.</span>
                    <p className="text-sm text-gray-700">{odporucanie}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Acquisition Cost Detail */}
      {customer_acquisition_cost && (
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-orange-600" />
              💸 Customer Acquisition Cost (CAC) Analýza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CAC Graf podľa kanálov */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">CAC podľa marketingového kanála</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cacChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kanal" />
                  <YAxis label={{ value: 'CAC (€)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip 
                    formatter={(value) => `${value.toLocaleString('sk-SK')} €`}
                  />
                  <Bar dataKey="cac" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CAC Trend a Optimum */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Trend CAC</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(customer_acquisition_cost.cac_trend)}
                  <p className="font-bold text-lg capitalize">{customer_acquisition_cost.cac_trend}</p>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Optimálne CAC</p>
                <p className="font-bold text-lg text-green-700">
                  {customer_acquisition_cost.optimalne_cac?.toLocaleString('sk-SK')} €
                </p>
              </div>
            </div>

            {/* Odporúčania na zníženie CAC */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg border-2 border-orange-200">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-orange-600" />
                💡 Ako znížiť CAC
              </h4>
              <div className="space-y-2">
                {customer_acquisition_cost.odporucania_na_znizenie?.map((odporucanie, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold flex-shrink-0">{idx + 1}.</span>
                    <p className="text-sm text-gray-700">{odporucanie}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Volume Forecast */}
      {sales_volume_forecast && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
              📈 Predikcia predajov (Sales Volume Forecast)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sales forecast graf */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Predikovaný objem predaja</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="obdobie" />
                  <YAxis label={{ value: 'Počet predajov', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="predaj" fill="#a855f7" name="Predikcia" />
                  <Bar dataKey="dolna" fill="#ec4899" name="Dolná hranica" />
                  <Bar dataKey="horna" fill="#8b5cf6" name="Horná hranica" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mesačná a štvrťročná predikcia */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-base">Nasledujúci mesiac</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Predpokladaný počet predajov</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {sales_volume_forecast.nasledujuci_mesiac?.predpokladany_pocet_predajov || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Rozsah: {sales_volume_forecast.nasledujuci_mesiac?.dolna_hranica || 0} - {sales_volume_forecast.nasledujuci_mesiac?.horna_hranica || 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">Hodnota predajov</p>
                    <p className="text-xl font-bold text-green-600">
                      {sales_volume_forecast.nasledujuci_mesiac?.hodnota_eur?.toLocaleString('sk-SK')} €
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-pink-300">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  <h4 className="font-bold text-base">Nasledujúci štvrťrok</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Predpokladaný počet predajov</p>
                    <p className="text-2xl font-bold text-pink-700">
                      {sales_volume_forecast.nasledujuci_stvrťrok?.predpokladany_pocet_predajov || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Rozsah: {sales_volume_forecast.nasledujuci_stvrťrok?.dolna_hranica || 0} - {sales_volume_forecast.nasledujuci_stvrťrok?.horna_hranica || 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">Hodnota predajov</p>
                    <p className="text-xl font-bold text-green-600">
                      {sales_volume_forecast.nasledujuci_stvrťrok?.hodnota_eur?.toLocaleString('sk-SK')} €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sezónnosť */}
            {sales_volume_forecast.sezonnost && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-3">🌡️ Sezónna analýza</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-2">✅ Najlepšie mesiace</p>
                    <div className="flex flex-wrap gap-1">
                      {sales_volume_forecast.sezonnost.najlepsie_mesiace?.map((mesiac, idx) => (
                        <Badge key={idx} className="bg-green-600 text-white text-xs">
                          {mesiac}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 mb-2">❌ Najhoršie mesiace</p>
                    <div className="flex flex-wrap gap-1">
                      {sales_volume_forecast.sezonnost.najhorsie_mesiace?.map((mesiac, idx) => (
                        <Badge key={idx} className="bg-red-600 text-white text-xs">
                          {mesiac}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Sezónny multiplikátor</p>
                  <p className="text-lg font-bold">×{sales_volume_forecast.sezonnost.sezonny_multiplikator}</p>
                </div>
              </div>
            )}

            {/* Vplyv marketingu */}
            {sales_volume_forecast.vplyv_marketingu && (
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                <h4 className="font-semibold text-sm mb-2">📢 Vplyv marketingových aktivít</h4>
                <p className="text-sm text-gray-700">{sales_volume_forecast.vplyv_marketingu}</p>
              </div>
            )}

            {/* Odporúčania */}
            {sales_volume_forecast.odporucania?.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  💡 Odporúčania na maximalizáciu predajov
                </h4>
                <div className="space-y-2">
                  {sales_volume_forecast.odporucania.map((odporucanie, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold flex-shrink-0">{idx + 1}.</span>
                      <p className="text-sm text-gray-700">{odporucanie}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CLV/CAC Ratio Detail */}
      {kpi_ratio && (
        <Card className={`border-2 ${getRatioColor(kpi_ratio.hodnotenie)}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              🎯 CLV/CAC Ratio - Zdravie biznisu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Váš pomer CLV/CAC</p>
                  <p className="text-4xl font-bold">{kpi_ratio.clv_cac_ratio?.toFixed(2)}</p>
                </div>
                <Badge className={`${getRatioColor(kpi_ratio.hodnotenie)} text-lg px-4 py-2`}>
                  {kpi_ratio.hodnotenie}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Interpretácia:</span>
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-green-700">✅ &gt; 3.0 = Výborné (udržateľný rast)</li>
                  <li className="text-blue-700">ℹ️ 2.0 - 3.0 = Dobré (zlepšujte efektivitu)</li>
                  <li className="text-yellow-700">⚠️ 1.0 - 2.0 = Priemerne (nutné zmeny)</li>
                  <li className="text-red-700">❌ &lt; 1.0 = Kritické (strácate peniaze)</li>
                </ul>
              </div>
            </div>

            {/* Odporúčané kroky */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                🎯 Odporúčané kroky na zlepšenie
              </h4>
              <div className="space-y-2">
                {kpi_ratio.odporucane_kroky?.map((krok, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">{idx + 1}.</span>
                    <p className="text-sm text-gray-700">{krok}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}