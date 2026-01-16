import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { file_url, vyrobca, domNazov } = await req.json();

    if (!file_url || !vyrobca || !domNazov) {
      return Response.json({ 
        success: false, 
        error: 'Chybajúce parametre: file_url, vyrobca a domNazov sú povinné' 
      }, { status: 400 });
    }

    // Stiahnuť Excel súbor z URL
    const fileResponse = await fetch(file_url);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    if (data.length < 3) {
      return Response.json({ 
        success: false, 
        error: 'Excel súbor musí mať aspoň 3 riadky (hlavička v riadku 2, dáta od riadku 3)' 
      });
    }

    // Hlavičky sú v riadku 2 (index 1)
    const headers = data[1];
    
    // Nájsť riadok s názvom domu v stĺpci B (index 1)
    let domRow = -1;
    for (let i = 2; i < data.length; i++) {
      const cellValue = data[i][1]; // Stĺpec B
      if (cellValue && cellValue.toString().trim().toLowerCase() === domNazov.toLowerCase()) {
        domRow = i;
        break;
      }
    }

    if (domRow === -1) {
      return Response.json({ 
        success: false, 
        error: `Dom "${domNazov}" sa nenašiel v stĺpci B Excelu` 
      });
    }

    // MAPOVACIA TABUĽKA - Excel názov stĺpca -> databázový kľúč
    const COLUMN_MAPPING = {
      // ZÁKLAD - priamo v entite Dom
      'Cena základnej konfigurácie': '__zakladna_cena__',
      'zastavana plocha m2': '__zastavana_plocha__',
      'uzitkova plocha m2': '__uzitkova_plocha__',
      
      // KONFIGURÁTOR - do konfigurator_ceny
      // Izolácia
      'Steny 200mm': 'izolacia_stien_200mm',
      'Steny 250mm': 'izolacia_stien_250mm',
      'Izolácia podlahy 200mm': 'izolacia_podlahy_200mm',
      'Izolácia stropu 200mm': 'izolacia_stropu_200mm',
      
      // Vykurovanie
      'Tepelné čerpadlo': 'tepelne_cerpadlo',
      'Príprava na rekuperáciu': 'pripravaNaRekuperaciu',
      'Rekuperácia': 'rekuperacia',
      'Podlahové kúrenie': 'podlahove_kurenie',
      'Príprava na krb': 'pripravaKrb',
      'Ochrana na kachle': 'ochranaKachle',
      'Príprava na klimatizáciu': 'klimatizacia',
      
      // Fasáda (prvé výskyty)
      'Šúchaná omietka': 'fasada_omietka',
      'Smrekovec': 'fasada_smrekovec',
      'Thermowood': 'fasada_thermowood',
      
      // Strecha
      'Odkvapy': 'odkvapy',
      
      // Okná a Dvere
      'Kovové dvere': 'dvere_kovove',
      'Posuvné dvere': 'dvere_posuvne',
      
      // Interiér
      'Smrek bez uzlov': 'obklad_smrek_bez_uzlov',
      'Sadrokatron + tapeta + malovka': 'obklad_sadrokarton_tapeta',
      'OSB + laminátový panel': 'obklad_osb_panel',
      
      // Elektro
      'SK Štandard': 'elektro_cz',
      'Elektroinštalácia CZ/SK': 'elektro_cz',
      'Štandard +': 'elektro_ge',
      'Elektroinštalácia GE': 'elektro_ge',
      'Bleskozvod': 'bleskozvod',
      'Prepäťová ochrana': 'prepat',
      'Príprava na solárne panely': 'pripravaNaSolarnePanely',
      
      // Kúpeľňa
      'Sprcha Radaway': 'sprchovyKut',
      'Vaňa': 'vana',
      'Batéria štandard, Grohe': 'bateria',
      'Skrinka s umývadlom': 'skrinka',
      
      // Základy
      'Zemné vruty': 'zaklady_vruty',
      'Betónová pätky': 'zaklady_patky',
      'Pásové betónové': 'zaklady_pasove',
      
      // Služby
      'Inžiniering': 'inziniering',
      'Projekt + Certifikácia': 'projektACertifikacia',
      'Revízna dokumentácia': 'revizia',
      'Montáž domu a pripojenie k sieťam': 'montaz',
      'Doprava': 'doprava'
    };

    // Špeciálne spracovanie duplicít "Falcované panely"
    const falcovanePanelyIndexes = [];
    headers.forEach((header, index) => {
      if (header && header.toString().trim() === 'Falcované panely') {
        falcovanePanelyIndexes.push(index);
      }
    });

    // Parsovanie cien
    const parsedPrices = {};
    const baseData = {}; // Pre zakladna_cena, zastavana_plocha, uzitkova_plocha
    const errors = [];
    let foundCount = 0;
    let skippedCount = 0;

    headers.forEach((header, colIndex) => {
      if (!header || colIndex < 2) return; // Preskočiť prvé 2 stĺpce (A, B)
      
      const headerStr = header.toString().trim();
      let dbKey = COLUMN_MAPPING[headerStr];
      
      // Špeciálne spracovanie "Falcované panely"
      if (headerStr === 'Falcované panely') {
        const currentIndex = falcovanePanelyIndexes.indexOf(colIndex);
        if (currentIndex === 0) {
          dbKey = 'fasada_falcovane'; // Prvý výskyt -> Fasáda
        } else if (currentIndex === 1) {
          dbKey = 'strecha_falcovane'; // Druhý výskyt -> Strecha
        }
      }
      
      // Špeciálne spracovanie "Sadrokartón + tapeta, maľba" v kúpeľni
      if (headerStr === 'Sadrokartón + tapeta, maľba' && colIndex > 50) { // Predpokladáme, že kúpeľňa je neskôr v tabuľke
        dbKey = 'strop_kupelna_sadrokarton';
      }

      if (!dbKey) {
        skippedCount++;
        return; // Stĺpec nemá mapovanie, preskočiť
      }

      const cellValue = data[domRow][colIndex];
      
      // Spracovanie hodnôt podľa pravidiel
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        skippedCount++;
        return; // Prázdna bunka -> preskočiť (nemení sa cena v DB)
      }

      // Konverzia na číslo
      let price;
      if (typeof cellValue === 'number') {
        price = cellValue;
      } else {
        const strValue = cellValue.toString().replace(/[€\s,]/g, '').replace(',', '.');
        price = parseFloat(strValue);
      }

      if (isNaN(price) || price < 0) {
        errors.push(`Neplatná cena pre "${headerStr}": ${cellValue}`);
        skippedCount++;
        return;
      }

      // Uložiť hodnotu
      if (dbKey.startsWith('__')) {
        // Základné dáta entity Dom
        baseData[dbKey] = price;
      } else {
        // Konfigurátor ceny
        parsedPrices[dbKey] = price;
      }
      
      foundCount++;
    });

    return Response.json({
      success: true,
      parsed_prices: parsedPrices,
      base_data: baseData,
      found_count: foundCount,
      skipped_count: skippedCount,
      total_polozky: headers.length - 2,
      dom_row: domRow + 1, // +1 pre ľudsky čitateľné číslo riadku
      errors: errors
    });

  } catch (error) {
    console.error('Error in analyzeCennikFromExcel:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});