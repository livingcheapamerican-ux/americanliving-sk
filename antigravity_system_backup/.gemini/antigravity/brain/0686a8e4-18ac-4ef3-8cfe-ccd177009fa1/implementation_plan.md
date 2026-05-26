# Oprava ceny Sadrokartónu pre dom Nord (PH-004) na 29 555 €

Tento plán popisuje opravu ceny pre možnosť interiérového obkladu "Sadrokartón" pri modeli domov Nord (PH-004). Zmena bude aplikovaná vo všetkých častiach systému: v kóde konfigurátora, v definíciách pre výpočet cien a priamo v databáze (Base44/Supabase).

## Proposed Changes

### Konfigurátor a Kód Cenníka

#### [MODIFY] [KonfiguratorPH004.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages/KonfiguratorPH004.jsx)
* Zmeniť cenu pri položke `interior` -> `Sadrokartón` z pôvodnej hodnoty `11655` na `29555` na riadku 79.

#### [MODIFY] [entry.ts](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/analyzeProstoHouseCennik/entry.ts)
* Zmeniť fallback hodnotu pre `interier_sadrokarton` pri modeli `nord` z pôvodnej `11655` na `29555` na riadku 200.

#### [MODIFY] [update_prices.js](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/scratch/update_prices.js)
* Zmeniť hodnotu `"interior-2"` pri modeli `"PH-004"` z pôvodnej `11655` na `29555` na riadku 114.

---

### Databáza (Base44 / Supabase)

#### Spustenie aktualizačného skriptu
* Spustiť skript `node scratch/update_prices.js` na zosynchronizovanie cien v databáze American Living (Base44).

---

## Verification Plan

### Automated Tests
* Spustiť `npm run build` na overenie kompilácie React aplikácie.

### Manual Verification
* Lokálne overiť na webe, že konfigurátor pre model Nord 103 (PH-004) zobrazuje pre voľbu Sadrokartón cenu 29 555 € a správne ju sčítava do celkovej ponuky.
