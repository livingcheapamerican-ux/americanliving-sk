import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "flat-double-ph001", name: "Flat Double 142 (PH-001)", basePrice: 59900,
  options: {
    mounting: [{ label: "Bez montáže (Svojpomocne)", price: 0, description: "Dodanie sady pre svojpomocnú montáž" }, { label: "S montážou", price: 17970, description: "Profesionálna montáž hrubej stavby" }],
    extension: [],
    insulation: [{ label: "Celoročná 150 mm", price: 0, description: "Štandardná izolácia minerálnou vlnou" }, { label: "Zvýšená 200 mm", price: 5800, description: "Lepší tepelný komfort" }, { label: "Prémium 250 mm", price: 11600, description: "Potrebné pre A0 certifikát" }, { label: "Extra 300 mm", price: 21750, description: "Maximálna úspora energie" }],
    foundation: [{ label: "Bez základov", price: 0, description: "Zabezpečuje si klient sám" }, { label: "Pilóty/Pätky", price: 8141, description: "Zemné skrutky alebo betónové pätky" }, { label: "Základová doska", price: 18000, description: "Betónová doska s hydroizoláciou" }, { label: "Pásové základy", price: 15500, description: "Klasické betónové pásy" }],
    interior: [{ label: "Bez interiéru", price: 0, description: "Holostavba bez úprav" }, { label: "Drevo", price: 16400, description: "Smrekový obklad stien a stropu" }, { label: "Sadrokartón", price: 19475, description: "Hladké steny pripravené na maľovanie" }],
    doors: [{ label: "Štandard", price: 0, description: "Základné exteriérové dvere" }, { label: "Kovové s 2 zámkami", price: 720, description: "Zvýšená bezpečnosť" }, { label: "Plastovo-kovové", price: 660, description: "Odolné a bezpečné" }],
    facade: [{ label: "Štandardná", price: 0, description: "Drevený obklad" }, { label: "Šúchaná fasáda", price: 12841, description: "Biela omietka" }]
  },
  addons: { electricity: 7400, water: 2380, sanita: 1169, boiler: 246, heatPump: 2700, recuperation: 5535, windowLamination: 3100, windowTint: 1300, roofWindow: 760, fixWindow: 500, tiltWindowBig: 540, tiltWindowSmall: 225, interiorDoor: 250, laminateFloors: 3350, floorHeating: 5525, networks: 1500, engineering: 2590, projectant: 3500, revision: 1000, transport: 0 }
};

export default function KonfiguratorPH001() {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph001" />;
}