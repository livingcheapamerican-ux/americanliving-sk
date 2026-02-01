import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Home, Phone, Mail, MapPinned } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit map bounds
function MapBounds({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [positions, map]);
  
  return null;
}

export default function GrantovaKampan() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [geocodedRequests, setGeocodedRequests] = React.useState([]);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  
  // Add Leaflet CSS dynamically
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Check if user is admin
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Fetch all subsidy requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['dotacia-requests'],
    queryFn: async () => {
      const allRequests = await base44.entities.Dopyt.list();
      // Filter requests related to Dotacia Americana
      return allRequests.filter(r => 
        r.poznamka && r.poznamka.includes('Dotácia Americana')
      );
    },
    enabled: user?.role === 'admin'
  });

  // Fetch all houses to calculate correct subsidy
  const { data: houses } = useQuery({
    queryKey: ['houses-for-subsidy'],
    queryFn: () => base44.entities.Dom.list(),
    enabled: user?.role === 'admin'
  });

  // Geocode locations
  useEffect(() => {
    if (!requests || requests.length === 0 || !houses) return;
    
    const geocodeRequests = async () => {
      setIsGeocoding(true);
      const geocoded = [];
      
      for (const request of requests) {
        // Extract location from note
        const locationMatch = request.poznamka?.match(/Lokalita: ([^,]+)/);
        const location = locationMatch ? locationMatch[1] : null;
        
        if (location) {
          try {
            // Use Nominatim API for geocoding (free, no API key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', Slovakia')}&limit=1`,
              {
                headers: {
                  'User-Agent': 'AmericanLiving/1.0'
                }
              }
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
              // Extract house name from note
              const houseMatch = request.poznamka?.match(/Dom: ([^(]+)/);
              
              // Calculate correct subsidy from house price
              let subsidy = 'N/A';
              let houseName = 'N/A';
              
              if (request.dom_id && houses) {
                const house = houses.find(h => h.id === request.dom_id);
                if (house) {
                  subsidy = Math.round(house.zakladna_cena * 0.05).toLocaleString('sk-SK');
                  houseName = house.nazov + ', ' + house.zastavana_plocha + 'm²';
                }
              } else if (houseMatch) {
                houseName = houseMatch[1].trim();
              }
              
              geocoded.push({
                ...request,
                location,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                houseName,
                subsidy
              });
            }
            
            // Rate limiting - wait 1 second between requests (Nominatim policy)
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Failed to geocode ${location}:`, error);
          }
        }
      }
      
      setGeocodedRequests(geocoded);
      setIsGeocoding(false);
      
      if (geocoded.length > 0) {
        toast.success(`Geokódované ${geocoded.length} lokalít`);
      }
    };
    
    geocodeRequests();
  }, [requests, houses]);

  // Filter requests based on search
  const filteredRequests = geocodedRequests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    return (
      req.meno?.toLowerCase().includes(searchLower) ||
      req.email?.toLowerCase().includes(searchLower) ||
      req.telefon?.toLowerCase().includes(searchLower) ||
      req.location?.toLowerCase().includes(searchLower) ||
      req.houseName?.toLowerCase().includes(searchLower)
    );
  });

  // Check if user is not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPinned className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prístup odmietnutý</h2>
          <p className="text-gray-600">Táto stránka je dostupná iba pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam žiadosti...</p>
        </div>
      </div>
    );
  }

  const centerPosition = geocodedRequests.length > 0 
    ? [geocodedRequests[0].lat, geocodedRequests[0].lng]
    : [48.669, 19.699]; // Center of Slovakia

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <MapPinned className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Grantová kampaň</h1>
              <p className="text-gray-600">Program Ambassador & Partner - Mapa žiadostí</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Celkový počet žiadostí</p>
                  <p className="text-2xl font-bold text-gray-900">{requests?.length || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPinned className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Geokódované lokality</p>
                  <p className="text-2xl font-bold text-gray-900">{geocodedRequests.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Najžiadanejší model</p>
                  <p className="text-lg font-bold text-gray-900">
                    {geocodedRequests.length > 0 
                      ? geocodedRequests.reduce((acc, curr) => {
                          acc[curr.houseName] = (acc[curr.houseName] || 0) + 1;
                          return acc;
                        }, {}) && Object.entries(geocodedRequests.reduce((acc, curr) => {
                          acc[curr.houseName] = (acc[curr.houseName] || 0) + 1;
                          return acc;
                        }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]?.split(' - ')[0] || 'N/A'
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Map */}
        <Card className="p-0 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa žiadostí o dotáciu
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {isGeocoding ? 'Geokódujem lokality...' : `Zobrazených ${geocodedRequests.length} lokalít`}
            </p>
          </div>
          
          <div style={{ height: '500px', width: '100%' }}>
            {geocodedRequests.length > 0 ? (
              <MapContainer 
                center={centerPosition} 
                zoom={8} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds positions={geocodedRequests} />
                {geocodedRequests.map((req, idx) => (
                  <Marker 
                    key={idx} 
                    position={[req.lat, req.lng]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-2 min-w-[250px]">
                        <h3 className="font-bold text-lg mb-2 text-primary">{req.meno}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a href={`mailto:${req.email}`} className="text-blue-600 hover:underline">
                              {req.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a href={`tel:${req.telefon}`} className="text-blue-600 hover:underline">
                              {req.telefon}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{req.houseName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{req.location}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <Badge className="bg-green-600">Dotácia: {req.subsidy} €</Badge>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {isGeocoding ? 'Geokódujem lokality...' : 'Žiadne žiadosti na zobrazenie'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Vyhľadať podľa mena, emailu, telefónu, lokality alebo domu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Zoznam žiadateľov ({filteredRequests.length})
          </h2>
          
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, idx) => (
                <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Žiadateľ</p>
                      <p className="font-bold text-gray-900">{req.meno}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Kontakt</p>
                      <div className="space-y-1">
                        <a href={`mailto:${req.email}`} className="text-sm text-blue-600 hover:underline block">
                          {req.email}
                        </a>
                        <a href={`tel:${req.telefon}`} className="text-sm text-blue-600 hover:underline block">
                          {req.telefon}
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lokalita</p>
                      <p className="text-sm font-medium text-gray-900">{req.location}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Vybraný dom</p>
                      <p className="text-sm font-medium text-gray-900">{req.houseName}</p>
                      <Badge className="bg-green-600 mt-2">Dotácia: {req.subsidy} €</Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Žiadne výsledky pre "{searchTerm}"</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}