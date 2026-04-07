import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "flat-small", name: "Flat Small 41 (PH-009)", basePrice: 19500,
  options: {
    mounting: [{ label: "Bez montáže", price: 0, description: "Svojpomocne" }, { label: "S montážou", price: 4875, description: "Profesionálna montáž" }],
    extension: [],
    insulation: [{ label: "Celoročná 150 mm", price: 0, description: "Štandard" }, { label: "Zvýšená 200 mm", price: 1400, description: "Zvýšený štandard" }, { label: "Prémium 250 mm", price: 2800, description: "Pre A0 certifikát" }, { label: "Extra 300 mm", price: 5250, description: "Extra úspora" }],
    foundation: [{ label: "Bez základov", price: 0, description: "Vlastná realizácia" }, { label: "Pilóty/Pätky", price: 2808, description: "Zemné skrutky" }, { label: "Základová doska", price: 6000, description: "Betón" }, { label: "Pásové základy", price: 5000, description: "Betónové pásy" }],
    interior: [{ label: "Bez interiéru", price: 0, description: "Holostavba" }, { label: "Drevo", price: 3800, description: "Smrekový obklad" }, { label: "Sadrokartón", price: 4414, description: "Hladké steny" }],
    doors: [{ label: "Štandard", price: 0, description: "Základné" }, { label: "Kovové s 2 zámkami", price: 720, description: "Bezpečnostné" }, { label: "Plastovo-kovové", price: 660, description: "Odolné" }],
    facade: [{ label: "Štandardná", price: 0, description: "Drevený obklad" }, { label: "Šúchaná fasáda", price: 4742, description: "Biela omietka" }]
  },
  addons: { electricity: 2300, water: 980, sanita: 1169, boiler: 246, heatPump: 600, recuperation: 1105, windowLamination: 750, windowTint: 340, roofWindow: 760, fixWindow: 500, tiltWindowBig: 540, tiltWindowSmall: 225, interiorDoor: 250, laminateFloors: 840, floorHeating: 2819, networks: 1500, engineering: 2590, projectant: 3500, revision: 500, transport: 0 }
};

export default function KonfiguratorPH009({ dom, isAdmin }) {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph009" dom={dom} isAdmin={isAdmin} />;
}