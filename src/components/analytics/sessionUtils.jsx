import React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { format } from "date-fns";

// Online = aktivita v posledných 5 minútach
export const isSessionOnline = (session) => {
  if (!session || session.is_active === false) return false;
  const activityTime = session.last_activity || session.start_time;
  if (!activityTime) return false;
  return Date.now() - new Date(activityTime).getTime() < 5 * 60 * 1000;
};

export const getContinentName = (countryCode) => {
  if (!countryCode) return "";
  const code = countryCode.toUpperCase();
  if (['US', 'CA', 'MX', 'PR', 'GL'].includes(code)) return "Severná Amerika";
  if (['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GF', 'GY', 'SR'].includes(code)) return "Južná Amerika";
  if (['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC'].includes(code)) return "Austrália a Oceánia";
  if (['CN', 'JP', 'IN', 'KR', 'TW', 'TH', 'VN', 'SG', 'MY', 'ID', 'PH', 'PK', 'BD', 'IR', 'IQ', 'IL', 'TR', 'SA', 'AE', 'KZ', 'UZ', 'KP', 'HK', 'MO', 'LK', 'NP', 'MM', 'KH', 'LA', 'MN', 'GE', 'AM', 'AZ'].includes(code)) return "Ázia";
  if (['ZA', 'EG', 'NG', 'KE', 'MA', 'DZ', 'TN', 'GH', 'ET', 'TZ', 'UG', 'AO', 'MZ', 'CI', 'SN', 'CM', 'ZW'].includes(code)) return "Afrika";
  return "Európa";
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export const safeFormat = (value, fmt, options = {}) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return format(d, fmt, options);
};

export const getDeviceIcon = (deviceType) => {
  if (deviceType === 'mobile') return <Smartphone className="w-4 h-4" />;
  if (deviceType === 'tablet') return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

export const getTagColor = (tag) => {
  const colors = {
    bounced: 'bg-red-100 text-red-800 border border-red-200',
    odrazeny: 'bg-red-100 text-red-800 border border-red-200',
    engaged: 'bg-blue-100 text-blue-800 border border-blue-200',
    zaujaty: 'bg-blue-100 text-blue-800 border border-blue-200',
    highly_engaged: 'bg-purple-100 text-purple-800 border border-purple-200',
    velmi_zaujaty: 'bg-purple-100 text-purple-800 border border-purple-200',
    explorer: 'bg-green-100 text-green-800 border border-green-200',
    prieskumnik: 'bg-green-100 text-green-800 border border-green-200',
    converted: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    konvertoval: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    configurator_user: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    pouzivatel_konfiguratora: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    vracajuci_sa: 'bg-teal-100 text-teal-800 border border-teal-200',
    stiahol_katalog: 'bg-pink-100 text-pink-800 border border-pink-200'
  };
  return colors[tag] || 'bg-slate-100 text-slate-700 border border-slate-200';
};

export const formatLocation = (locationInfo) => {
  if (!locationInfo) return 'Neznáma lokalita';
  const city = locationInfo.city || 'Neznáme mesto';
  const code = locationInfo.country_code || '';
  const continent = getContinentName(code);
  return `${city}${code ? `, ${code}` : ''}${continent ? ` (${continent})` : ''}`;
};

export function WebVital({ name, value, unit, thresholds }) {
  if (value === undefined || value === null || value === 0) {
    return (
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{name}</p>
        <p className="text-sm font-extrabold text-slate-400">—</p>
      </div>
    );
  }

  let color = "text-green-700 bg-green-50 border-green-200";
  let status = "Výborné";
  if (value > thresholds.poor) {
    color = "text-red-700 bg-red-50 border-red-200";
    status = "Zlé";
  } else if (value > thresholds.warning) {
    color = "text-yellow-700 bg-yellow-50 border-yellow-200";
    status = "Na zlepšenie";
  }

  const displayVal = name === 'CLS'
    ? value.toFixed(3)
    : (unit === 's' ? `${(value / 1000).toFixed(2)}s` : `${value}${unit}`);

  return (
    <div className={`p-2.5 rounded-lg border text-center ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-90">{name}</p>
      <p className="text-lg font-black">{displayVal}</p>
      <p className="text-[9px] font-extrabold opacity-80">{status}</p>
    </div>
  );
}