import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "barn-double",
  name: "Barn Double 72 (PH-005)",
  basePrice: 38000,
  options: {
    mounting: [
      {
        label: "Bez montáže",
        price: 0,
        description: "Svojpomocne"
      },
      {
        label: "S montážou",
        price: 9500,
        description: "Profesionálna montáž"
      }
    ],
    extension: [
      {
        label: "Bez predĺženia",
        price: 0
      },
      {
        label: "+1,2 m",
        price: 6600
      },
      {
        label: "+2,4 m",
        price: 13200
      },
      {
        label: "+3,6 m",
        price: 19800
      },
      {
        label: "+4,8 m",
        price: 26400
      }
    ],
    insulation: [
      {
        label: "Celoročná 150 mm",
        price: 0,
        description: "Štandard"
      },
      {
        label: "Zvýšená 200 mm",
        price: 2700,
        description: "Zvýšený komfort"
      },
      {
        label: "Prémium 250 mm",
        price: 5400,
        description: "Pre A0 certifikát"
      },
      {
        label: "Extra 300 mm",
        price: 10125,
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
        price: 3400,
        description: "Rýchle základy"
      },
      {
        label: "Základová doska",
        price: 7500,
        description: "Pevný podklad"
      },
      {
        label: "Pásové základy",
        price: 6500,
        description: "Klasické riešenie"
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
        price: 6371,
        description: "Biela omietka"
      }
    ]
  },
  addons: {
    electricity: 3900,
    water: 1380,
    sanita: 1400,
    boiler: 246,
    heatPump: 2889,
    recuperation: 1524,
    windowLamination: 1450,
    windowTint: 700,
    roofWindow: 760,
    fixWindow: 500,
    tiltWindowBig: 540,
    tiltWindowSmall: 225,
    interiorDoor: 750,
    laminateFloors: 2625,
    floorHeating: 3960,
    networks: 1500,
    engineering: 2590,
    projectant: 3500,
    revision: 1000,
    transport: 0
  }
};

export default function KonfiguratorPH005({ dom, isAdmin }) {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph005" dom={dom} isAdmin={isAdmin} />;
}