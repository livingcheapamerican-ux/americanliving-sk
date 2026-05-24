import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE = {
  id: "nord",
  name: "Nord 103 (PH-004)",
  basePrice: 51000,
  options: {
    mounting: [
      {
        label: "Bez montáže",
        price: 0,
        description: "Svojpomocná montáž"
      },
      {
        label: "S montážou",
        price: 15650,
        description: "Montáž na kľúč"
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
        price: 3200,
        description: "Zvýšený štandard"
      },
      {
        label: "Prémium 250 mm",
        price: 6400,
        description: "Pre A0 certifikát"
      },
      {
        label: "Extra 300 mm",
        price: 12000,
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
        price: 7655,
        description: "Rýchla realizácia"
      },
      {
        label: "Základová doska",
        price: 13000,
        description: "Pevný podklad"
      },
      {
        label: "Pásové základy",
        price: 11500,
        description: "Klasické základy"
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
        price: 25700,
        description: "Smrekový obklad"
      },
      {
        label: "Sadrokartón",
        price: 11655,
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
        price: 9507,
        description: "Biela omietka"
      }
    ]
  },
  addons: {
    electricity: 7500,
    water: 2856,
    sanita: 1169,
    boiler: 500,
    heatPump: 3720,
    recuperation: 1480,
    windowLamination: 2100,
    windowTint: 1380,
    roofWindow: 760,
    fixWindow: 500,
    tiltWindowBig: 540,
    tiltWindowSmall: 225,
    interiorDoor: 1000,
    laminateFloors: 4210,
    floorHeating: 3913,
    networks: 1993,
    engineering: 2590,
    projectant: 3500,
    revision: 1000,
    transport: 0
  }
};

export default function KonfiguratorPH004({ dom, isAdmin }) {
  return <ProstoHouseKonfigurator house={HOUSE} houseCode="ph004" dom={dom} isAdmin={isAdmin} />;
}