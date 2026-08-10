// Logika balíkov pre konfigurátor Lyon (Ticab house)
// Zaokrúhlenie cien na celé eurá – ceny s haliermi pôsobia neúplne
export const roundPrice = (n) => Math.round(Number(n) || 0);

export const fmt = (n) => roundPrice(n).toLocaleString('sk-SK') + ' €';

// Orientačná mesačná splátka (100 % financovanie, 30 rokov, 4,5 % p.a.)
export const monthlyPayment = (price, years = 30, rate = 0.045) => {
  const r = rate / 12;
  const n = years * 12;
  const m = (price * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(m);
};

// Čo je v základnej cene (rekreačná stavba) – prémiový drevený štandard
export const STANDARD_V_CENE = [
  'Drevená fasáda – severský smrek',
  'Strešná krytina – korugovaný plech',
  'Okná s izolačným 3-sklom',
  'Vchodové dvere plastovo-kovové',
  'Interiér – drevený obklad smrek 8 cm',
  'Laminátová podlaha v celom dome',
  'Krídlové interiérové dvere',
  'Elektroinštalácia v EU štandarde',
  'Kompletná kúpeľňa – sprchový kút, batéria, WC',
  'Drevený obklad stropu v kúpeľni',
  'Izolácia stien, podlahy a stropu 150 mm',
  'Kompletná montáž modulu vo výrobe',
];

// Položky, ktoré pribudnú pre skolaudovateľný rodinný dom A0
export const a0Polozky = (CENY) => [
  { label: 'Izolácia stien 250 mm', price: CENY.izolacia_stien_250mm, why: 'Bez hrubšej izolácie dom nedosiahne energetickú triedu A0.' },
  { label: 'Izolácia podlahy 200 mm', price: CENY.izolacia_podlahy_200mm, why: 'Podmienka tepelnotechnického posudku.' },
  { label: 'Izolácia stropu 200 mm', price: CENY.izolacia_stropu_200mm, why: 'Podmienka tepelnotechnického posudku.' },
  { label: 'Tepelné čerpadlo', price: CENY.tepelne_cerpadlo, why: 'Vyžaduje sa obnoviteľný zdroj vykurovania.' },
  { label: 'Príprava na rekuperáciu', price: CENY.pripravaNaRekuperaciu, why: 'Rozvody pre riadené vetranie.' },
  { label: 'Rekuperácia', price: CENY.rekuperacia, why: 'Riadené vetranie je pre A0 povinné.' },
  { label: 'Elektroinštalácia – nemecký GE štandard', price: CENY.elektro_ge, why: 'Požadovaný štandard pre trvalé bývanie.' },
  { label: 'Bleskozvod', price: CENY.bleskozvod, why: 'Povinný pre kolaudáciu rodinného domu.' },
  { label: 'Prepäťová ochrana', price: CENY.prepat, why: 'Súčasť revízie elektroinštalácie.' },
  { label: 'Príprava na klimatizáciu', price: CENY.klimatizacia, why: 'Súčasť technológie pre trvalé bývanie.' },
  { label: 'Inžiniering', price: CENY.inziniering, why: 'Vybavenie povolení na úradoch za vás.' },
  { label: 'Projekt a certifikácia A0', price: CENY.projektACertifikacia, why: 'Bez projektu a certifikátu vám stavbu neskolaudujú.' },
  { label: 'Revízie', price: CENY.revizia, why: 'Povinné revízne správy ku kolaudácii.' },
];

export const a0Priplatok = (CENY) =>
  a0Polozky(CENY).reduce((sum, i) => sum + roundPrice(i.price), 0);

// Presety – rovnaká logika ako pôvodný prepínač účelu stavby
export const applyChataPreset = (s) => {
  s.setUcel('chata');
  s.setIzolaciaStien('150mm'); s.setIzolaciaPodlahy('150mm'); s.setIzolaciaStropu('150mm');
  s.setTepelneCerpadlo('nie'); s.setRekuperacia('nie'); s.setPripravaNaRekuperaciu(false);
  s.setPodlahovoKurenie(false); s.setPripravaNaKrb(false); s.setOchranaKachle(false); s.setKlimatizacia(false);
  s.setFasada('drevo_smrek'); s.setStrecha('korugovan_plech'); s.setOdkvapy('nie');
  s.setOkna('biele'); s.setVchodoveDvere('plastove'); s.setObkladStien('smrek_8cm');
  s.setPodlaha('laminat'); s.setInterieroveDvere('kridlove'); s.setElektro('eu');
  s.setBleskozvod(false); s.setPrepat(false); s.setPripravaNaSolarnePanely(false);
  s.setSprchovyKut('standard'); s.setVana(false); s.setBateria('standard');
  s.setSkrinka(false); s.setStropKupelna('drevo');
  s.setInziniering(false); s.setProjektACertifikacia(false); s.setRevizia(false);
  s.setZaklady('bez'); s.setMontaz(false); s.setDoprava(false);
};

export const applyA0Preset = (s) => {
  applyChataPreset(s);
  s.setUcel('rodinny');
  s.setIzolaciaStien('250mm'); s.setIzolaciaPodlahy('200mm'); s.setIzolaciaStropu('200mm');
  s.setTepelneCerpadlo('ano'); s.setPripravaNaRekuperaciu(true); s.setRekuperacia('ano');
  s.setElektro('ge'); s.setBleskozvod(true); s.setPrepat(true); s.setKlimatizacia(true);
  s.setInziniering(true); s.setProjektACertifikacia(true); s.setRevizia(true);
};