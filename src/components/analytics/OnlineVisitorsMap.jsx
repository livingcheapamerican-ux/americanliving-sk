import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Globe, Clock, Users, Calendar, Monitor, Smartphone, Tablet } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import "leaflet/dist/leaflet.css";

function AutoFitBounds({ locations }) {
  const map = useMap();

  React.useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(loc => [loc.latitude, loc.longitude]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [locations, map]);

  return null;
}

export default function OnlineVisitorsMap({ sessions, onClose }) {
  const [timeFilter, setTimeFilter] = useState("today");
  const [customDate, setCustomDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const getDeviceIcon = (deviceType) => {
    switch(deviceType) {
      case 'mobile': return <Smartphone className="w-3 h-3" />;
      case 'tablet': return <Tablet className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const filteredSessions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sessions.filter(session => {
      if (!session.location_info?.latitude || !session.location_info?.longitude) return false;

      if (timeFilter === "online") {
        // Len aktívne sessions - bez časového obmedzenia
        return session.is_active === true;
      }

      const sessionDate = new Date(session.start_time);

      if (timeFilter === "today") {
        return sessionDate >= today;
      } else if (timeFilter === "custom") {
        const selectedDate = new Date(customDate);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return sessionDate >= selectedDate && sessionDate < nextDay;
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      }
      return true;
    });
  }, [sessions, timeFilter, customDate]);

  const locations = useMemo(() => {
    // Skupina sessions podľa mesta pre presnejšie zobrazenie
    const cityGroups = {};
    
    filteredSessions
      .filter(s => s.location_info?.latitude && s.location_info?.longitude)
      .forEach(s => {
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
          isActive: s.is_active,
          timestamp: s.start_time,
          duration: s.duration_seconds
        });
      });

    // Rozmiestni návštevníkov z rovnakého mesta v malom okruhu
    const result = [];
    Object.values(cityGroups).forEach(group => {
      const baseLat = group.latitude;
      const baseLng = group.longitude;
      
      group.sessions.forEach((session, idx) => {
        // Pridaj malý offset pre každú session v rovnakom meste
        // Offset v rozmedzí ~500m
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

  const stats = {
    total: filteredSessions.length,
    online: filteredSessions.filter(s => s.is_active).length,
    desktop: filteredSessions.filter(s => s.device_info?.device_type === 'desktop').length,
    mobile: filteredSessions.filter(s => s.device_info?.device_type === 'mobile').length,
    tablet: filteredSessions.filter(s => s.device_info?.device_type === 'tablet').length
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mapa návštevníkov</h2>
              <p className="text-sm text-white/80">{locations.length} lokácií</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Time Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant={timeFilter === "online" ? "default" : "outline"}
              onClick={() => setTimeFilter("online")}
              className={timeFilter === "online" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              Online teraz ({stats.online})
            </Button>
            <Button
              size="sm"
              variant={timeFilter === "today" ? "default" : "outline"}
              onClick={() => setTimeFilter("today")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Dnes ({stats.total})
            </Button>
            <Button
              size="sm"
              variant={timeFilter === "week" ? "default" : "outline"}
              onClick={() => setTimeFilter("week")}
            >
              Tento týždeň
            </Button>
            <Button
              size="sm"
              variant={timeFilter === "month" ? "default" : "outline"}
              onClick={() => setTimeFilter("month")}
            >
              Tento mesiac
            </Button>
            <Button
              size="sm"
              variant={timeFilter === "custom" ? "default" : "outline"}
              onClick={() => setTimeFilter("custom")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Vlastný dátum
            </Button>
            {timeFilter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              />
            )}
          </div>

          {/* Device Stats */}
          <div className="flex items-center gap-3 mt-3">
            <Badge className="bg-blue-100 text-blue-800">
              <Monitor className="w-3 h-3 mr-1" />
              Desktop: {stats.desktop}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              <Smartphone className="w-3 h-3 mr-1" />
              Mobil: {stats.mobile}
            </Badge>
            <Badge className="bg-teal-100 text-teal-800">
              <Tablet className="w-3 h-3 mr-1" />
              Tablet: {stats.tablet}
            </Badge>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {locations.length > 0 ? (
            <MapContainer
              center={[48.7164, 19.6990]}
              zoom={6}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <AutoFitBounds locations={locations} />
              {locations.map((loc, idx) => (
                <CircleMarker
                  key={idx}
                  center={[loc.latitude, loc.longitude]}
                  radius={loc.isActive ? 10 : 6}
                  fillColor={loc.isActive ? "#22c55e" : "#3b82f6"}
                  color={loc.isActive ? "#16a34a" : "#2563eb"}
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.6}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-sm">{loc.user}</h4>
                        {loc.isActive && (
                          <Badge className="bg-green-600 text-white text-xs">🟢 Online</Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{loc.email}</p>
                      <div className="flex items-center gap-1 text-gray-700">
                        <Globe className="w-3 h-3" />
                        {loc.city}, {loc.country}
                      </div>
                      <div className="flex items-center gap-1 text-gray-700">
                        {getDeviceIcon(loc.device)}
                        {loc.device} - {loc.browser}
                      </div>
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-3 h-3" />
                        {format(new Date(loc.timestamp), 'dd.MM.yyyy HH:mm', { locale: sk })}
                      </div>
                      {loc.duration > 0 && (
                        <p className="text-gray-600">
                          Trvanie: {Math.floor(loc.duration / 60)}m {loc.duration % 60}s
                        </p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Žiadne lokácie pre zvolený filter</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"></div>
              <span className="text-xs text-gray-700">Online teraz</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600"></div>
              <span className="text-xs text-gray-700">Offline session</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}