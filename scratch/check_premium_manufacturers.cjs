const { base44 } = require('../src/api/base44Client.js');

async function run() {
  const ids = ["6916ec94c11aacdd15248f07", "6916ec94c11aacdd15248f06", "6916ec94c11aacdd15248f0b"];
  for (const id of ids) {
    try {
      const house = await base44.entities.Dom.get(id);
      console.log(`ID: ${id}, Name: ${house.nazov}, Manufacturer: ${house.vyrobca}, Price: ${house.zakladna_cena}`);
    } catch (e) {
      console.error(`Error for ${id}:`, e.message);
    }
  }
}

run();
