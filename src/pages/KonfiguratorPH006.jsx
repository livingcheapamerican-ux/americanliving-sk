import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "flat-72",
  name: "Flat 72 (PH-006)",
  basePrice: 31700,
  options: {
    mounting: [
      {
        label: "Bez montáže",
        price: 0,
        description: "Svojpomocne"
      },
      {
        label: "S montážou",
        price: 7925,
        description: "Profesionálna montáž"
      }
    ],
    extension: [],
    insulation: [
      {
        label: "Celoročná 150 mm",
        price: 0,
        description: "Štandard"
      },
      {
        label: "Zvýšená 200 mm",
        price: 2950,
        description: "Zvýšený štandard"
      },
      {
        label: "Prémium 250 mm",
        price: 5900,
        description: "Pre A0 certifikát"
      },
      {
        label: "Extra 300 mm",
        price: 11063,
        description: "Extra úspora"
      }
    ],
    foundation: [
      {
        label: "Bez základov",
        price: 0,
        description: "Vlastná realizácia"
      },
      {
        label: "Pilóty/Pätky",
        price: 3100,
        description: "Zemné skrutky"
      },
      {
        label: "Základová doska",
        price: 10000,
        description: "Betón"
      },
      {
        label: "Pásové základy",
        price: 8500,
        description: "Betónové pásy"
      }
    ],
    interior: [
      {
        label: "Bez interiéru",
        price: 0,
        description: "Holostavba"
      },
      {
        label: "Drevo",
        price: 12300,
        description: "Smrekový obklad"
      },
      {
        label: "Sadrokartón",
        price: 14145,
        description: "Hladké steny"
      }
    ],
    doors: [
      {
        label: "Štandard",
        price: 0,
        description: "Základné"
      },
      {
        label: "Kovové s 2 zámkami",
        price: 720,
        description: "Bezpečnostné"
      },
      {
        label: "Plastovo-kovové",
        price: 660,
        description: "Odolné"
      }
    ],
    facade: [
      {
        label: "Štandardná",
        price: 0,
        description: "Drevený obklad"
      },
      {
        label: "Šúchaná fasáda",
        price: 8499,
        description: "Biela omietka"
      }
    ]
  },
  addons: {
    electricity: 3900,
    water: 1380,
    sanita: 1400,
    boiler: 500,
    heatPump: 2889,
    recuperation: 1524,
    windowLamination: 1550,
    windowTint: 680,
    roofWindow: 760,
    fixWindow: 500,
    tiltWindowBig: 540,
    tiltWindowSmall: 225,
    interiorDoor: 750,
    laminateFloors: 2040,
    floorHeating: 3960,
    networks: 1993,
    engineering: 2590,
    projectant: 3500,
    revision: 1000,
    transport: 0
  }
};

export default function KonfiguratorPH006({ dom, isAdmin }) {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph006" dom={dom} isAdmin={isAdmin} />;
}