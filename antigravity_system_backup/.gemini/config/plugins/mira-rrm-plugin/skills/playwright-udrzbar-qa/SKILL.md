---
name: playwright-udrzbar-qa
description: >-
  Spúšťa a riadi testovacie protokoly agenta "Údržbár" pomocou Playwright
  a Chrome DevTools. Zamerané na chytanie chýb v konzole, výpadkov SSE/WebSocket a IndexedDB.
---

# Playwright Údržbár QA

## Spúšťanie QA protokolov
Pri požiadavke na testovanie UI spusti Playwright skript, ktorý simuluje prácu makléra.

### Protokol 1: Console & Network Sweeper
Sleduj sieťové volania a konzolu. Ak uvidíš akúkoľvek chybu (500, 404, Uncaught ReferenceError), zaznamenaj ju do `dev-swarm/backlog.md` s detailným stack traceom.

### Protokol 2: Real-time Connection Watchdog
Navštív stránku `MiraLive` a čakaj 15 sekúnd bez klikania. Over, či SSE spojenie nepadlo a či prichádzajú periodické pingy z Base44.

### Protokol 3: State Persistence Checker
1. Otvor `DrivingMode` a pridaj testovaciu nahrávku.
2. Prejdi na `ClientDetail`.
3. Vráť sa na `DrivingMode` a over, či nahrávka stále čaká v IndexedDB.

## Spúšťací príkaz
`npx playwright test --config=playwright.config.js`
