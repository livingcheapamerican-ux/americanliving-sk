# Walkthrough – Optimalizačné Moduly a Úprava Ceny Nord (PH-004)

Všetky navrhnuté zmeny a optimalizácie boli úspešne implementované, overené a odoslané do produkčnej vetvy GitHubu.

---

## 1. Oprava ceny Sadrokartónu pre dom Nord (PH-004) na 29 555 €

* **Zmeny v konfigurátore a cenníkoch**:
  * **Frontend**: V súbore [KonfiguratorPH004.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages/KonfiguratorPH004.jsx) bola cena pre možnosť "Sadrokartón" upravená z 11 655 € na **29 555 €**.
  * **Deno Backend**: V súbore [entry.ts (analyzeProstoHouseCennik)](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/analyzeProstoHouseCennik/entry.ts) bola hodnota `interier_sadrokarton` pre model `nord` upravená na **29 555 €**.
  * **Migračný skript**: V súbore [update_prices.js](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/scratch/update_prices.js) bola hodnota `"interior-2"` pre model `"PH-004"` zmenená na **29 555 €**.
* **Aktualizácia databázy**:
  * Bol spustený migračný skript `node scratch/update_prices.js`, ktorý úspešne zosynchronizoval cenu v databáze Base44/Supabase pre entitu domu Nord.

---

## 2. Podmienečné zobrazenie výšky stropu (Strop 270 cm A0 verzia)

* **Zmena**:
  * V súbore [DetailDomu.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages/DetailDomu.jsx) bol text "Strop 270 cm A0 verzia" obmedzený tak, aby sa pod názvom domu zobrazoval **výhradne pre model Flat 72 (PH-006)**. Pre ostatné modely Prosto House bol tento nápis odstránený.

---

## 3. LLM-Friendly AEO Feed

* **Súbor**: [base44/functions/generateLLMFeed/entry.ts](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/generateLLMFeed/entry.ts)
* **Mechanizmus**:
  * Implementovaný hybridný cache systém pre serverless Edge prostredie (skúša **Deno.KV** s automatickým fallbackom na **in-memory** cache).
  * Cache má nastavené **TTL na 24 hodín**, čo zabezpečí, že akýkoľvek AI crawler (ChatGPT, Claude, atď.) stiahne agregované dáta bez opakovaného zaťažovania databázy.
  * Feed bezpečne agreguje informácie o firme American Living, všetky verejné stavby (s ich popismi, cenami, izbami, plochami) a FAQ schémy.

---

## 4. Idempotentná Image Sitemap

* **Súbor**: [base44/functions/generateSitemap/entry.ts](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/generateSitemap/entry.ts)
* **Mechanizmus**:
  * Generátor bol rozšírený o kompletné spracovanie obrázkových tagov pre všetky fotky v galériách domov.
  * Pridané detekčné hašovanie na základe obsahu fotiek, blogov a lokalít na úsporu kreditov pri nezmenenom obsahu.

---

## 5. Klientsky Noindex v Konfigurátore

* **Súbor**: [src/Layout.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/Layout.jsx)
* **Mechanizmus**:
  * Ak URL adresa obsahuje parametrické query tagy pre konfigurácie (napr. `?color=`, `?option=`), aplikácia prostredníctvom React Helmet vstrekne hlavičku `<meta name="robots" content="noindex, follow" />` na strane klienta bez dopytovania backendu.

---

## Verifikácia
* **React Build**: Lokálny build aplikácie (`npm run build`) prebehol úspešne, čo potvrdzuje bezchybnú kompiláciu zmien v konfigurátore a detailnej stránke domu:
  ```bash
  ✓ built in 6.50s
  ```
* **Git Commit & Push**: Všetky zmeny boli commitnuté a úspešne odoslané do GitHub repozitára:
  * Commit 1: `e06f5a82` - *oprava ceny Sadrokartón na 29 555 € pre dom Nord (PH-004)*
  * Commit 2: `80541bef` - *zobrazenie vysky stropu 270 cm iba pre model Flat 72 (PH-006)*
