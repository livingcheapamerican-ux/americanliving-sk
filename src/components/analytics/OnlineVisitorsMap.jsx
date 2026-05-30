import React, { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Globe, Clock, Users, Calendar, Monitor, Smartphone, Tablet } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import "leaflet/dist/leaflet.css";

// Helper na presné určenie online stavu (aktivita v posledných 5 minútach)
const isSessionOnline = (session) => {
  if (!session || session.is_active === false) return false;
  const activityTime = session.last_activity || session.start_time;
  if (!activityTime) return false;
  const diffMs = Date.now() - new Date(activityTime).getTime();
  return diffMs < 5 * 60 * 1000;
};

// Helper na priradenie kontinentu podľa kódu krajiny v slovenskom jazyku
const getContinentName = (countryCode) => {
  if (!countryCode) return "";
  const code = countryCode.toUpperCase();
  if (['US', 'CA', 'MX', 'PR', 'GL'].includes(code)) return "Severná Amerika";
  if (['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GF', 'GY', 'SR'].includes(code)) return "Južná Amerika";
  if (['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC'].includes(code)) return "Austrália a Oceánia";
  if (['CN', 'JP', 'IN', 'KR', 'TW', 'TH', 'VN', 'SG', 'MY', 'ID', 'PH', 'PK', 'BD', 'IR', 'IQ', 'IL', 'TR', 'SA', 'AE', 'KZ', 'UZ', 'KP', 'HK', 'MO', 'LK', 'NP', 'MM', 'KH', 'LA', 'MN', 'GE', 'AM', 'AZ'].includes(code)) return "Ázia";
  if (['ZA', 'EG', 'NG', 'KE', 'MA', 'DZ', 'TN', 'EE', 'GH', 'ET', 'TZ', 'UG', 'AO', 'MZ', 'CI', 'SN', 'CM', 'ZW'].includes(code)) return "Afrika";
  return "Európa";
};

// Pomocný komponent na prepočítanie a uchytenie veľkosti mapy po zobrazení modalu
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Pomocný komponent na priblíženie mapy na zvolenú lokáciu
function FlyToMarker({ activeLocation }) {
  const map = useMap();
  useEffect(() => {
    if (activeLocation && activeLocation.latitude && activeLocation.longitude) {
      map.flyTo([activeLocation.latitude, activeLocation.longitude], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [activeLocation, map]);
  return null;
}

// Pomocný komponent na automatické ohraničenie všetkých bodov na mape pri prvom načítaní
function AutoFitBounds({ locations }) {
  const map = useMap();
  const hasAutoFittedRef = React.useRef(false);

  React.useEffect(() => {
    if (locations.length > 0 && !hasAutoFittedRef.current) {
      const bounds = locations.map(loc => [loc.latitude, loc.longitude]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      hasAutoFittedRef.current = true;
    }
  }, [locations, map]);

  return null;
}
export default function OnlineVisitorsMap({ sessions, onClose }) {
  const [timeFilter, setTimeFilter] = useState(() => {
    const hasOnline = (sessions || []).some(s => {
      if (!s.location_info?.latitude || !s.location_info?.longitude) return false;
      if (s.is_active === false) return false;
      const activityTime = s.last_activity || s.start_time;
      if (!activityTime) return false;
      const diffMs = Date.now() - new Date(activityTime).getTime();
      return diffMs < 5 * 60 * 1000;
    });
    return hasOnline ? "online" : "today";
  });
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleItemClick = (item) => {
    setSelectedLocation(item);
  };

  const getDeviceIcon = (deviceType) => {
    switch(deviceType) {
      case 'mobile': return <Smartphone className="w-3.5 h-3.5 text-pink-400" />;
      case 'tablet': return <Tablet className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Monitor className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  // Pre-kalkulované počty pre filtračné tlačidlá z CELÉHO zoznamu geolokalizovaných relácií
  const counts = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let online = 0;
    let today = 0;
    let week = 0;
    let month = 0;

    sessions.forEach(s => {
      if (s.location_info?.latitude && s.location_info?.longitude) {
        if (isSessionOnline(s)) online++;
        
        const sessionDate = new Date(s.start_time);
        if (sessionDate >= todayStart) today++;
        if (sessionDate >= weekAgo) week++;
        if (sessionDate >= monthAgo) month++;
      }
    });

    return { online, today, week, month };
  }, [sessions]);

  // Filtrovanie relácií na základe zvoleného filtra
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sessions.filter(session => {
      if (!session.location_info?.latitude || !session.location_info?.longitude) return false;

      if (timeFilter === "online") {
        return isSessionOnline(session);
      }

      const sessionDate = new Date(session.start_time);

      if (timeFilter === "today") {
        return sessionDate >= today;
      } else if (timeFilter === "range") {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        return sessionDate >= fromDate && sessionDate <= toDate;
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      }
      return true;
    });
  }, [sessions, timeFilter, dateFrom, dateTo]);

  // Vytvorenie zoznamu unikátnych bodov pre mapu
  const locations = useMemo(() => {
    const cityGroups = {};
    
    filteredSessions.forEach(s => {
      const cityKey = `${s.location_info.city}_${s.location_info.country}`;
      if (!cityGroups[cityKey]) {
        cityGroups[cityKey] = {
          latitude: s.location_info.latitude,
          longitude: s.location_info.longitude,
          city: s.location_info.city,
          country: s.location_info.country,
          sessions: []
        };
      }
      cityGroups[cityKey].sessions.push({
        user: s.user_name || 'Anonymous',
        email: s.user_email,
        device: s.device_info?.device_type,
        browser: s.device_info?.browser,
        isActive: isSessionOnline(s),
        timestamp: s.start_time,
        duration: s.duration_seconds
      });
    });

    const result = [];
    Object.values(cityGroups).forEach(group => {
      const baseLat = group.latitude;
      const baseLng = group.longitude;
      
      group.sessions.forEach((session, idx) => {
        // Pridáme drobný offset pre prípad, že na rovnakej lokácii je viacero relácií
        const offsetLat = (Math.random() - 0.5) * 0.005;
        const offsetLng = (Math.random() - 0.5) * 0.005;
        
        result.push({
          latitude: baseLat + offsetLat,
          longitude: baseLng + offsetLng,
          city: group.city,
          country: group.country,
          user: session.user,
          email: session.email,
          device: session.device,
          browser: session.browser,
          isActive: session.isActive,
          timestamp: session.timestamp,
          duration: session.duration
        });
      });
    });
    
    return result;
  }, [filteredSessions]);

  // Bočný panel - zoznam relácií prislúchajúcich filtru
  const sidebarItems = useMemo(() => {
    return filteredSessions.map((s, idx) => ({
      id: s.id || idx,
      user: s.user_name || 'Anonymný návštevník',
      email: s.user_email,
      city: s.location_info?.city || 'Neznáme mesto',
      country: s.location_info?.country || 'Slovensko',
      countryCode: s.location_info?.country_code || 'SK',
      continent: getContinentName(s.location_info?.country_code),
      latitude: s.location_info?.latitude,
      longitude: s.location_info?.longitude,
      device: s.device_info?.device_type || 'desktop',
      browser: s.device_info?.browser || 'Chrome',
      isActive: isSessionOnline(s),
      timestamp: s.start_time,
      duration: s.duration_seconds,
      currentPage: s.current_page || '/'
    }));
  }, [filteredSessions]);

  // Štatistiky pre vybraný filter
  const deviceStats = useMemo(() => {
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;
    filteredSessions.forEach(s => {
      const type = s.device_info?.device_type;
      if (type === 'mobile') mobile++;
      else if (type === 'tablet') tablet++;
      else desktop++;
    });
    return { desktop, mobile, tablet };
  }, [filteredSessions]);

  // Určenie nadpisu bočného panela podľa filtra
  const getSidebarTitle = () => {
    switch (timeFilter) {
      case "online": return `Aktívni na webe (${counts.online})`;
      case "today": return `Dnešné návštevy (${filteredSessions.length})`;
      case "week": return `Tento týždeň (${filteredSessions.length})`;
      case "month": return `Tento mesiac (${filteredSessions.length})`;
      case "range": return `Vybrané obdobie (${filteredSessions.length})`;
      default: return `Zoznam návštev (${filteredSessions.length})`;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
      <Card className="w-full max-w-7xl h-[88vh] bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Mapa návštevníkov
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] py-0.5 px-2 font-bold animate-pulse">
                  {counts.online} ONLINE
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Celkovo zmapovaných {counts.today} relácií za dnes • {sidebarItems.length} vyhovuje filtru</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all flex items-center justify-center cursor-pointer border border-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setTimeFilter("online");
                setSelectedLocation(null);
              }}
              className={`rounded-xl text-xs font-bold transition-all px-3.5 h-8.5 flex items-center justify-center cursor-pointer border ${
                timeFilter === "online" 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 border-transparent" 
                  : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping shrink-0" />
              Online teraz ({counts.online})
            </button>
            
            <button
              onClick={() => {
                setTimeFilter("today");
                setSelectedLocation(null);
              }}
              className={`rounded-xl text-xs font-bold transition-all px-3.5 h-8.5 flex items-center justify-center cursor-pointer border ${
                timeFilter === "today" 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30 border-transparent" 
                  : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 mr-1.5 shrink-0" />
              Dnes ({counts.today})
            </button>
            
            <button
              onClick={() => {
                setTimeFilter("week");
                setSelectedLocation(null);
              }}
              className={`rounded-xl text-xs font-bold transition-all px-3.5 h-8.5 flex items-center justify-center cursor-pointer border ${
                timeFilter === "week" 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30 border-transparent" 
                  : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Tento týždeň ({counts.week})
            </button>
            
            <button
              onClick={() => {
                setTimeFilter("month");
                setSelectedLocation(null);
              }}
              className={`rounded-xl text-xs font-bold transition-all px-3.5 h-8.5 flex items-center justify-center cursor-pointer border ${
                timeFilter === "month" 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30 border-transparent" 
                  : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Tento mesiac ({counts.month})
            </button>

            <button
              onClick={() => {
                setTimeFilter("range");
                setSelectedLocation(null);
              }}
              className={`rounded-xl text-xs font-bold transition-all px-3.5 h-8.5 flex items-center justify-center cursor-pointer border ${
                timeFilter === "range" 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30 border-transparent" 
                  : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 mr-1.5 shrink-0" />
              Rozsah dátumov
            </button>
            
            {timeFilter === "range" && (
              <div className="flex items-center gap-2 ml-1 animate-in slide-in-from-left duration-250">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 font-bold uppercase">do</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Device Badges */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
            <Badge className="bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 rounded-lg px-2 py-0.8 flex items-center gap-1">
              <Monitor className="w-3 h-3 text-indigo-400" />
              Desktop: {deviceStats.desktop}
            </Badge>
            <Badge className="bg-pink-950/60 text-pink-300 border border-pink-900/40 rounded-lg px-2 py-0.8 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-pink-400" />
              Mobil: {deviceStats.mobile}
            </Badge>
            <Badge className="bg-cyan-950/60 text-cyan-300 border border-cyan-900/40 rounded-lg px-2 py-0.8 flex items-center gap-1">
              <Tablet className="w-3 h-3 text-cyan-400" />
              Tablet: {deviceStats.tablet}
            </Badge>
          </div>
        </div>

        {/* Map & Live Sidebar Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* List Sidebar */}
          <div className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/30 flex flex-col h-56 lg:h-auto overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className={`w-4 h-4 shrink-0 ${timeFilter === "online" ? "text-emerald-500 animate-pulse" : "text-indigo-400"}`} />
                {getSidebarTitle()}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
              {sidebarItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-semibold italic">Žiadne relácie nevyhovujú filtru</div>
              ) : (
                sidebarItems.map((item) => {
                  const isSelected = selectedLocation && selectedLocation.id === item.id;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => handleItemClick(item)}
                      className={`p-3 hover:bg-slate-800/50 hover:border-slate-700/50 transition-all border rounded-xl cursor-pointer space-y-1.5 text-xs ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-500/70 shadow-md shadow-indigo-950/20' 
                          : 'bg-slate-900/30 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-200 truncate max-w-[170px]">
                          {item.user}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {getDeviceIcon(item.device)}
                          {item.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] py-0 scale-90">LIVE</Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] py-0 scale-90">OFFLINE</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                        <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{item.city}, {item.countryCode} ({item.continent})</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-1 border-t border-slate-800/50">
                        <span className="truncate max-w-[160px] font-mono text-indigo-400 bg-indigo-950/20 px-1 py-0.2 rounded">{item.currentPage}</span>
                        <span>{format(new Date(item.timestamp), 'HH:mm:ss', { locale: sk })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="flex-1 h-full relative">
            {locations.length > 0 ? (
              <MapContainer
                center={[48.7164, 19.6990]}
                zoom={6}
                className="h-full w-full z-10"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapResizer />
                <AutoFitBounds locations={locations} />
                <FlyToMarker activeLocation={selectedLocation} />

                {locations.map((loc, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[loc.latitude, loc.longitude]}
                    radius={loc.isActive ? 11 : 7}
                    fillColor={loc.isActive ? "#10b981" : "#4f46e5"}
                    color={loc.isActive ? "#34d399" : "#818cf8"}
                    weight={2}
                    opacity={0.9}
                    fillOpacity={0.65}
                  >
                    <Popup>
                      <div className="text-xs space-y-1.5 text-slate-800 min-w-[160px]">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate max-w-[110px]">{loc.user}</h4>
                          {loc.isActive ? (
                            <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1 font-bold">Online</Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-650 border border-slate-300 text-[9px] py-0 px-1 font-bold">Offline</Badge>
                          )}
                        </div>
                        
                        {loc.email && <p className="text-slate-500 text-[10px] truncate select-all">{loc.email}</p>}
                        
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{loc.city}, {loc.country} ({getContinentName(loc.country)})</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-slate-700 capitalize">
                          {getDeviceIcon(loc.device)}
                          <span className="font-medium text-[10px]">{loc.device} • {loc.browser}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{format(new Date(loc.timestamp), 'dd.MM.yyyy HH:mm', { locale: sk })}</span>
                        </div>
                        
                        {loc.duration > 0 && (
                          <div className="text-[10px] text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            Trvanie: {Math.floor(loc.duration / 60)}m {loc.duration % 60}s
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Zvýraznený marker pre položku zvolenú z bočného panela */}
                {selectedLocation && (
                  <CircleMarker
                    center={[selectedLocation.latitude, selectedLocation.longitude]}
                    radius={14}
                    fillColor="#ec4899"
                    color="#f43f5e"
                    weight={2.5}
                    opacity={0.95}
                    fillOpacity={0.35}
                    className="animate-pulse"
                  >
                    <Popup position={[selectedLocation.latitude, selectedLocation.longitude]}>
                      <div className="text-xs space-y-1.5 text-slate-800 min-w-[170px]">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                          <h4 className="font-extrabold text-sm text-indigo-850 truncate max-w-[110px]">{selectedLocation.user}</h4>
                          {selectedLocation.isActive ? (
                            <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1 font-bold">Online</Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-650 border border-slate-300 text-[9px] py-0 px-1 font-bold">Offline</Badge>
                          )}
                        </div>
                        
                        {selectedLocation.email && <p className="text-slate-500 text-[10px] truncate select-all">{selectedLocation.email}</p>}
                        
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{selectedLocation.city}, {selectedLocation.country} ({selectedLocation.continent})</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          {getDeviceIcon(selectedLocation.device)}
                          <span>{selectedLocation.device} • {selectedLocation.browser}</span>
                        </div>

                        <div className="text-[10px] text-slate-600">
                          Aktuálna stránka: <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{selectedLocation.currentPage}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{format(new Date(selectedLocation.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: sk })}</span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-950/20 text-slate-400">
                <div className="text-center space-y-3">
                  <Globe className="w-16 h-16 text-slate-600 mx-auto mb-2 animate-pulse" />
                  <h3 className="text-sm font-black text-slate-300">Žiadne lokalizované návštevy</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">V tomto časovom období neboli zaznamenané žiadne relácie s informáciou o GPS súradniciach.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend / Legend bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 inline-block shadow-sm shadow-emerald-500/30" />
              <span className="text-slate-400 font-semibold">Online návštevník</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600 border border-indigo-400 inline-block shadow-sm shadow-indigo-600/30" />
              <span className="text-slate-400 font-semibold">Offline návštevník (Staršia relácia)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500 border border-pink-300 inline-block shadow-sm shadow-pink-500/30" />
              <span className="text-slate-400 font-semibold">Vybraný z bočného panela</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}