import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "flat-house-1-5", name: "Flat House 15 108 (PH-003)", basePrice: 44900,
  options: {
    mounting: [{ label: "Bez montáže", price: 0, description: "Dodanie sady pre svojpomocnú montáž" }, { label: "S montážou", price: 13470, description: "Profesionálna montáž hrubej stavby" }],
    extension: [],
    insulation: [{ label: "Celoročná 150 mm", price: 0, description: "Štandardná izolácia" }, { label: "Zvýšená 200 mm", price: 4400, description: "Lepší tepelný komfort" }, { label: "Prémium 250 mm", price: 8800, description: "Potrebné pre A0 certifikát" }, { label: "Extra 300 mm", price: 16500, description: "Maximálna úspora" }],
    foundation: [{ label: "Bez základov", price: 0, description: "Klient si realizuje sám" }, { label: "Pilóty/Pätky", price: 6348, description: "Zemné skrutky" }, { label: "Základová doska", price: 14000, description: "Betónová doska" }, { label: "Pásové základy", price: 12000, description: "Betónové pásy" }],
    interior: [{ label: "Bez interiéru", price: 0, description: "Holostavba" }, { label: "Drevo", price: 12700, description: "Smrekový obklad" }, { label: "Sadrokartón", price: 14545, description: "Hladké steny" }],
    doors: [{ label: "Štandard", price: 0, description: "Základné" }, { label: "Kovové s 2 zámkami", price: 720, description: "Bezpečnostné" }, { label: "Plastovo-kovové", price: 660, description: "Odolné" }],
    facade: [{ label: "Štandardná", price: 0, description: "Drevený obklad" }, { label: "Šúchaná fasáda", price: 10384, description: "Biela omietka" }]
  },
  addons: { electricity: 5200, water: 2100, sanita: 1169, boiler: 246, heatPump: 2200, recuperation: 4428, windowLamination: 2400, windowTint: 840, roofWindow: 760, fixWindow: 500, tiltWindowBig: 540, tiltWindowSmall: 225, interiorDoor: 250, laminateFloors: 2640, floorHeating: 4316, networks: 1500, engineering: 2590, projectant: 3500, revision: 1000, transport: 0 }
};

export default function KonfiguratorPH003() {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph003" />;
}