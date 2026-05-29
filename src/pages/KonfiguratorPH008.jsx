import React from 'react';
import ProstoHouseKonfigurator from '../components/konfigurator/ProstoHouseKonfigurator';

const HOUSE_PH008 = {
  id: "barn",
  name: "Barn 48 (PH-008)",
  basePrice: 21600,
  options: {
    mounting: [
      {
        label: "Bez montáže",
        price: 0,
        description: "Svojpomocne"
      },
      {
        label: "S montážou",
        price: 5400,
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
        price: 3300
      },
      {
        label: "+2,4 m",
        price: 6606
      },
      {
        label: "+3,6 m",
        price: 9900
      },
      {
        label: "+4,8 m",
        price: 15880
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
        price: 1400,
        description: "Zvýšený štandard"
      },
      {
        label: "Prémium 250 mm",
        price: 2800,
        description: "Pre A0 certifikát"
      },
      {
        label: "Extra 300 mm",
        price: 5250,
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
        price: 3077,
        description: "Zemné skrutky"
      },
      {
        label: "Základová doska",
        price: 6595,
        description: "Betón"
      },
      {
        label: "Pásové základy",
        price: 6782,
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
        price: 6150,
        description: "Smrekový obklad"
      },
      {
        label: "Sadrokartón",
        price: 7073,
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
        price: 4321,
        description: "Biela omietka"
      }
    ]
  },
  addons: {
    electricity: 2300,
    water: 1176,
    sanita: 1400,
    boiler: 500,
    heatPump: 1926,
    recuperation: 762,
    windowLamination: 790,
    windowTint: 375,
    roofWindow: 760,
    fixWindow: 500,
    tiltWindowBig: 540,
    tiltWindowSmall: 225,
    interiorDoor: 500,
    laminateFloors: 1470,
    floorHeating: 2819,
    networks: 1993,
    engineering: 2590,
    projectant: 3500,
    revision: 500,
    transport: 0
  }
};

export default function KonfiguratorPH008({ dom, isAdmin }) {
  return <ProstoHouseKonfigurator house={HOUSE_PH008} houseCode="ph008" dom={dom} isAdmin={isAdmin} />;
}