# Audit a Akčný Plán: Google Search Console (americanliving.sk)

Tento dokument prináša detailný prehľad chýb zistených priamo z vášho účtu Google Search Console (GSC) a technickú analýzu kódu s návrhom riešení pre zjednotenie SEO štruktúry a odstránenie chýb indexácie.

---

## 1. Celkový stav indexácie stránok

K **22. 5. 2026** eviduje Google Search Console pre doménu `https://americanliving.sk/` nasledovný stav:

| Stav stránky | Počet stránok | Poznámka |
| :--- | :--- | :--- |
| **Indexované** | **11,2 tis. stránok** | Stránky sa úspešne zobrazujú vo vyhľadávaní. |
| **Neindexované** | **22,7 tis. stránok** | Stránky, ktoré Google z rôznych dôvodov vyradil z indexu (spolu 8 rôznych dôvodov). |

---

## 2. Podrobný zoznam chýb a ich príčiny v kóde

Nižšie sú rozpísané jednotlivé dôvody neindexácie nahlásené zo strany Google, ich príčiny v našom zdrojovom kóde a spôsob, akým ich odstránime.

### 1. Falošné 404 (Soft 404)
* **Počet stránok:** **4 184 stránok**
* **Čo to znamená:** Googlebot pristúpi na stránku, ktorá vizuálne vyzerá ako chybová stránka (napr. text "Stránka sa nenašla"), no server pre ňu vráti HTTP status kód `200 OK` namiesto `404 Not Found`.
* **Príčina v kóde:** 
  Aplikácia je postavená ako React Single Page App (SPA) bežiaca na platforme Base44 (Deno). Keď používateľ alebo vyhľadávač navštívi neexistujúcu URL (napr. `/neexistujuca-stranka`), server na pozadí vráti súbor [index.html](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/index.html) so statusom `200 OK` (aby React mohol prevziať vykresľovanie). React Router následne vykreslí komponent `PageNotFound` (v [App.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/App.jsx#L59)). Google vidí status `200 OK` ale text "Stránka sa nenašla" a nahlási **Soft 404**.
* **Ako to vyriešiť:** 
  1. Na strane Deno Edge servera (v presmerovaniach a routovaní) musíme zabezpečiť, aby neexistujúce statické cesty vracali skutočný HTTP status `404`.
  2. Implementovať dynamický hlavičkový tag `<meta name="robots" content="noindex" />` priamo do komponentu `PageNotFound`, aby Google takéto stránky okamžite prestal indexovať a vyradil ich z reportov.

---

### 2. Duplicitná, Google vybral inú kánonickú stránku než používateľ
* **Počet stránok:** **1 431 stránok**
* **Čo to znamená:** Vyhľadávač našiel rovnaký obsah na dvoch rôznych URL. Vy ste Googlu v kanonickom tagu (`<link rel="canonical">`) definovali jednu URL, ale Google sa rozhodol ignorovať vaše odporúčanie a vybral inú verziu.
* **Príčina v kóde:**
  Máme v projekte **závažnú nekonzistentnosť v subdoménach a malých/veľkých písmenách**:
  * **Sitemap** ([generateSitemap/entry.ts](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/generateSitemap/entry.ts#L7)) a **Presmerovania** ([handleRedirects/entry.ts](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/handleRedirects/entry.ts#L32)) odkazujú na verziu **s `www`** (`https://www.americanliving.sk`).
  * No **kanonické linky** na podstránkach katalógu a kampaní odkazujú na verziu **bez `www`**:
    * Napr. v [KatalogMobilneDomy.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages/KatalogMobilneDomy.jsx#L342) je: `https://americanliving.sk/...` (bez www).
  * V [Katalog.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages/Katalog.jsx#L555) je navyše použité veľké písmeno `K` v `/Katalog` (`https://www.americanliving.sk/Katalog`), hoci router a sitemap používajú malé písmená `/katalog`.
* **Ako to vyriešiť:** 
  Kompletne zjednotiť všetky kanonické linky v kóde na verziu s `www` a výhradne malými písmenami v cestách (napr. `https://www.americanliving.sk/katalog`).

---

### 3. Alternatívna stránka so správnou kanonickou značkou
* **Počet stránok:** **4 349 stránok**
* **Čo to znamená:** Stránka má správne nastavený canonical tag ukazujúci na primárnu URL, no bola nájdená cez alternatívnu URL (napr. s parametrami). Google ju neindexuje, pretože správne indexuje primárnu URL. (Tento stav je čiastočne normálny, no jeho obrovské číslo v tomto prípade signalizuje problém).
* **Príčina v kóde:**
  V [Layout.jsx](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/src/Layout.jsx#L68) dynamicky generujeme kanonickú URL pomocou:
  ```javascript
  const canonical = window.location.href;
  ```
  Ak používateľ príde na web z Google Ads (`?gclid=...`) alebo Facebooku (`?fbclid=...`), do kanonickej adresy sa zapíšu aj tieto reklamné parametre. Tým pádom má každé jedno kliknutie z reklamy "svoju unikátnu" kanonickú URL.
* **Ako to vyriešiť:**
  Upraviť kód v `Layout.jsx` tak, aby odstraňoval query parametre z kanonickej adresy a zachovával iba čistú URL adresu (napr. `window.location.origin + window.location.pathname`).

---

### 4. Stránka s presmerovaním
* **Počet stránok:** **3 265 stránok**
* **Čo to znamená:** Stránky, ktoré presmerovávajú na iné adresy (napr. z dôvodu starých štruktúr webu). Tento stav je zvyčajne v poriadku, no je potrebné overiť, či nevznikajú presmerovacie slučky alebo zbytočné reťazce presmerovaní.
* **Ako to vyriešiť:**
  Preveriť pravidlá v [handleRedirects/entry.ts](file:///Users/richardkovac/Documents/american_living_web/american-living-sk/base44/functions/handleRedirects/entry.ts) a optimalizovať interné odkazy tak, aby neukazovali na presmerovávané URL, ale rovno na finálne adresy (napr. zmeniť interné odkazy z `/cennik` rovno na `/katalog`).

---

### 5. Indexovo prehľadávané – momentálne neindexované
* **Počet stránok:** **9 389 stránok**
* **Čo to znamená:** Google stránku prešiel, ale rozhodol sa ju nezaradiť do vyhľadávania. Často sa to deje pri stránkach s nízkou informačnou hodnotou (thin content), automaticky generovaných duplicitných stránkach alebo chybách v dizajne.
* **Ako to vyriešiť:**
  Zistiť, ktoré typy URL sem spadajú. Veľmi často to bývajú parametrické URL z konfigurátorov (napr. `/DetailDomu?id=...&color=red` alebo nepreložené jazykové mutácie s prázdnym obsahom). Zabezpečíme lepšie využitie tagu `noindex` pre interné stavy a parametre konfigurátorov.

---

### 6. Duplikovať bez kánonickej adresy vybranej používateľom
* **Počet stránok:** **50 stránok**
* **Čo to znamená:** Stránky majú rovnaký obsah ako iné, no úplne im chýba tag `<link rel="canonical">`.
* **Ako to vyriešiť:**
  Doplniť chýbajúce kanonické tagy na všetky statické a dynamické stránky cez jednotný mechanizmus v `Layout.jsx`.

---

## 3. Akčný plán opráv v kóde

### Krok 1: Oprava dynamického canonical v Layout.jsx
Upravíme nastavenie kanonickej URL tak, aby ignorovala reklamné a iné query parametre (gclid, fbclid, utm_*) a automaticky zjednocovala doménu na verziu s `www`.

### Krok 2: Zjednotenie subdomény v kanonických tagoch
Prejdeme všetky podstránky v `src/pages/` a nahradíme hardkódované adresy `https://americanliving.sk` za verziu `https://www.americanliving.sk`. Zjednotíme všetky URL na lowercase (napr. zmena `/Katalog` na `/katalog`).

### Krok 3: Ochrana pred Soft 404 (404 Page)
Upravíme komponent `PageNotFound` tak, aby automaticky pridával meta tag `<meta name="robots" content="noindex, follow" />`.

### Krok 4: Aktualizácia Sitemap Ping
Odstránime neaktívny a zastaraný mechanizmus odosielania sitemap na `google.com/ping`, aby nevznikali chyby pri automatickej aktualizácii SEO.

---

> [!IMPORTANT]
> Tieto opravy pomôžu vyčistiť indexovanie a dramaticky znížia počet chýb v Search Console. Chceli by ste, aby som rovno začal s týmito úpravami v kóde?
