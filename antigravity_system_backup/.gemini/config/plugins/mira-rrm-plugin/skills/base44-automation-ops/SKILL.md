---
name: base44-automation-ops
description: >-
  Umožňuje autonómne spravovať, buildovať a nasadzovať Deno Edge funkcie
  a databázové entity na platformu Base44.
---

# Base44 Automation Ops

## Prehľad
Tento skill poskytuje príkazy a procedúry na prácu s CLI platformy Base44. Zabezpečuje, že agent dokáže overiť stav projektu a vykonať bezpečný deploy bez rizika prepísania klientskych dát.

## Pravidlá a overenia
1. Pred nasadením Edge funkcie (deploy) **MUSÍŠ** spustiť lokálny linter.
2. Vždy over prítomnosť environmentálnych premenných v `.env.local`.
3. Ak deploy zlyhá, analyzuj návratový kód a chybovú správu Base44 CLI.

## Používané príkazy
- `npx -y base44-cli@latest status` - Kontrola stavu spojenia a kreditu.
- `npx -y base44-cli@latest deploy --function <nazov>` - Deploy edge funkcie.
- `npx -y base44-cli@latest db:migrate` - Migrácia schémy databázy.
