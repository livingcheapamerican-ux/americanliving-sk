import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "fjord", name: "Fjord 130 (PH-002)", basePrice: 59000,
  options: {
    mounting: [{ label: "Bez montáže", price: 0, description: "Svojpomocne" }, { label: "S montážou", price: 17700, description: "Profesionálna montáž" }],
    extension: [],
    insulation: [{ label: "Celoročná 150 mm", price: 0, description: "Štandard" }, { label: "Zvýšená 200 mm", price: 5660, description: "Lepšia izolácia" }, { label: "Prémium 250 mm", price: 9106, description: "Pre A0 certifikát" }],
    foundation: [{ label: "Bez základov", price: 0, description: "Vlastná realizácia" }, { label: "Pilóty/Pätky", price: 7655, description: "Zemné skrutky" }, { label: "Základová doska", price: 13000, description: "Betón" }, { label: "Pásové základy", price: 11500, description: "Betónové pásy" }],
    interior: [{ label: "Bez interiéru", price: 0, description: "Holostavba" }, { label: "Drevo", price: 18000, description: "Smrekový obklad" }, { label: "Sadrokartón", price: 21086, description: "Hladké steny" }],
    doors: [{ label: "Štandard", price: 0, description: "Základné" }, { label: "Kovové s 2 zámkami", price: 720, description: "Bezpečnostné" }, { label: "Plastovo-kovové", price: 660, description: "Odolné" }],
    facade: [{ label: "Štandardná", price: 0, description: "Drevený obklad" }, { label: "Šúchaná fasáda", price: 12211, description: "Biela omietka" }]
  },
  addons: { electricity: 7800, water: 3650, sanita: 1169, boiler: 246, heatPump: 3600, recuperation: 7749, windowLamination: 3400, windowTint: 1550, roofWindow: 760, fixWindow: 500, tiltWindowBig: 540, tiltWindowSmall: 225, interiorDoor: 250, laminateFloors: 3415, floorHeating: 6101, networks: 1500, engineering: 2590, projectant: 3500, revision: 1000, transport: 0 }
};

export default function KonfiguratorPH002() {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph002" />;
}