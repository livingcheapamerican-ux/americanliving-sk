import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "a-frame",
  name: "A-Frame 48 (PH-007)",
  basePrice: 23400,
  options: {
    mounting: [
      {
        label: "Bez montáže",
        price: 0,
        description: "Svojpomocne"
      },
      {
        label: "S montážou",
        price: 7200,
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
        price: 3550
      },
      {
        label: "+2,4 m",
        price: 7100
      },
      {
        label: "+3,6 m",
        price: 10650
      },
      {
        label: "+4,8 m",
        price: 14200
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
        price: 1600,
        description: "Zvýšený štandard"
      },
      {
        label: "Prémium 250 mm",
        price: 3200,
        description: "Pre A0 certifikát"
      },
      {
        label: "Extra 300 mm",
        price: 6000,
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
        price: 2100,
        description: "Zemné skrutky"
      },
      {
        label: "Základová doska",
        price: 7000,
        description: "Betón"
      },
      {
        label: "Pásové základy",
        price: 6000,
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
        price: 6600,
        description: "Smrekový obklad"
      },
      {
        label: "Sadrokartón",
        price: 7590,
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
        price: 2414,
        description: "Biela omietka"
      }
    ]
  },
  addons: {
    electricity: 2300,
    water: 1176,
    sanita: 1400,
    boiler: 500,
    heatPump: 2889,
    recuperation: 1524,
    windowLamination: 850,
    windowTint: 420,
    roofWindow: 760,
    fixWindow: 500,
    tiltWindowBig: 540,
    tiltWindowSmall: 225,
    interiorDoor: 500,
    laminateFloors: 1715,
    floorHeating: 2819,
    networks: 1993,
    engineering: 2590,
    projectant: 3500,
    revision: 500,
    transport: 0
  }
};

export default function KonfiguratorPH007({ dom, isAdmin }) {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph007" dom={dom} isAdmin={isAdmin} />;
}