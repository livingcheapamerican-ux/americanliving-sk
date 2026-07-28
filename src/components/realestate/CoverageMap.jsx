import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinned } from "lucide-react";

// Súradnice slovenských miest pre mapu pokrytia
const CITY_COORDS = {
  "Bratislava": [48.1486, 17.1077],
  "Košice": [48.7164, 21.2611],
  "Žilina": [49.2231, 18.7394],
  "Banská Bystrica": [48.7363, 19.1462],
  "Nitra": [48.3061, 18.0764],
  "Prešov": [48.9986, 21.2339],
  "Trnava": [48.3774, 17.5883],
  "Trenčín": [48.8945, 18.0444],
  "Martin": [49.0664, 18.9210],
  "Poprad": [49.0592, 20.2977],
  "Prievidza": [48.7746, 18.6274],
  "Zvolen": [48.5744, 19.1531],
  "Považská Bystrica": [49.1216, 18.4451],
  "Nové Zámky": [47.9856, 18.1620],
  "Michalovce": [48.7554, 21.9186],
  "Spišská Nová Ves": [48.9445, 20.5615],
  "Komárno": [47.7633, 18.1281],
  "Levice": [48.2153, 18.6069],
  "Humenné": [48.9370, 21.9067],
  "Bardejov": [49.2947, 21.2764],
  "Liptovský Mikuláš": [49.0842, 19.6215],
  "Ružomberok": [49.0748, 19.3037],
  "Piešťany": [48.5958, 17.8272],
  "Lučenec": [48.3286, 19.6672],
  "Topoľčany": [48.5613, 18.1717],
  "Dunajská Streda": [47.9945, 17.6197],
  "Senica": [48.6805, 17.3668],
  "Pezinok": [48.2896, 17.2669],
  "Senec": [48.2195, 17.4008],
  "Malacky": [48.4363, 17.0220],
  "Galanta": [48.1898, 17.7270],
  "Čadca": [49.4387, 18.7895],
  "Dolný Kubín": [49.2098, 19.2964],
  "Kežmarok": [49.1387, 20.4325],
  "Rožňava": [48.6605, 20.5316],
  "Trebišov": [48.6285, 21.7185],
};

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;background:#f59e0b;border:3px solid #0f172a;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

export default function CoverageMap() {
  const { data: lokacie = [] } = useQuery({
    queryKey: ["lokacie-mapa"],
    queryFn: () => base44.entities.LokaciaSEO.filter({ verejny: true }),
  });

  const pins = lokacie
    .map((l) => ({ ...l, coords: CITY_COORDS[l.nazov_mesta] }))
    .filter((l) => l.coords);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPinned className="w-5 h-5 text-amber-400" />
          Mapa pokrytia – kde staviame
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Staviame na celom Slovensku. Kliknite na mesto a zistite viac o výstavbe vo vašej lokalite.
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={[48.68, 19.5]}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: "420px", width: "100%", background: "#0f172a" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {pins.map((l) => (
            <Marker key={l.id} position={l.coords} icon={pinIcon}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong>{l.nazov_mesta}</strong>
                  <p style={{ margin: "4px 0", fontSize: 12 }}>
                    Výstavba na kľúč do 120 dní, energetická trieda A0.
                  </p>
                  <Link to={`/lokalita/${l.slug}`} style={{ color: "#b45309", fontWeight: 700, fontSize: 12 }}>
                    Výstavba v meste {l.nazov_mesta} →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}