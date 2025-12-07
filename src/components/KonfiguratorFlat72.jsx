import React from "react";
import { Card } from "@/components/ui/card";
import KonfiguratorFaza1HrubaStavba from "./KonfiguratorFaza1HrubaStavba";
import { useLanguage } from "./LanguageContext";

// Všetky ceny nastavené na 0 €
const FLAT72_CENY = {
  montaz: 0,
  predlzenie: { 1.2: 0, 2.4: 0, 3.6: 0, 4.8: 0 },
  izolacia: { zvysena: 0, premium: 0, ultra: 0 },
  zaklady: { skrutky: 0, doska: 0, pasove: 0 },
  vstupneDvere: { plastove: 0, hlinikove: 0 },
  elektro: 0,
  voda: 0,
  sanita: 0,
  bojler: 0,
  cerpadlo: 0,
  rekuperacia: 0,
  pripojka: 0,
  stresneOkno: 0,
  bocneOknoFixne: 0,
  bocneOknoVyklopne90: 0,
  bocneOknoVyklopne55: 0,
  povrchokaOkien: 0,
  tonovaneSkla: 0,
  fasada: { drevo: 0, murovka: 0 },
  interier: { sadrokarton: 0 },
  podlahy: 0,
  podlahovka: 0,
  dvere: 0,
  pergola: 0,
  inziniering: 0,
  projektA0: 0,
  revizna: 0,
  doprava: 0
};

export default function KonfiguratorFlat72({ 
  dom,
  showOnlySummary = false,
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
  predlzenie, setPredlzenie,
  vstupneDvere, setVstupneDvere,
  elektroinstalacia, setElektroinstalacia,
  vodaKanalizacia, setVodaKanalizacia,
  sanitaKomplet, setSanitaKomplet,
  bojler, setBojler,
  tepelneCerpadlo, setTepelneCerpadlo,
  rekuperacia, setRekuperacia,
  pripojkaSiete, setPripojkaSiete,
  stresneOkno, setStresneOkno,
  bocneOknoFixne, setBocneOknoFixne,
  bocneOknoVyklopne90, setBocneOknoVyklopne90,
  bocneOknoVyklopne55, setBocneOknoVyklopne55,
  povrchokaOkien, setPovrchokaOkien,
  tonovaneSkla, setTonovaneSkla,
  vonkajsiaFasada, setVonkajsiaFasada,
  interierFinis, setInterierFinis,
  vnutornePodlahy, setVnutornePodlahy,
  podlahovVykurovanie, setPodlahovVykurovanie,
  interieroveDvere, setInterieroveDvere,
  pergola, setPergola,
  inziniering, setInziniering,
  projektA0, setProjektA0,
  revizna, setRevizna,
  doprava, setDoprava
}) {
  const { t } = useLanguage();
  const BASE_PRICE = dom?.zakladna_cena || 31700;

  // Výpočet celkovej ceny
  const celkovaCena = React.useMemo(() => {
    let total = BASE_PRICE;

    // Fáza 1 - Hrubá stavba
    if (montazHolodomu === "ano") total += FLAT72_CENY.montaz;
    
    if (predlzenie && predlzenie > 0) {
      total += FLAT72_CENY.predlzenie[predlzenie] || 0;
    }

    if (izolaciaNavysenie === "zvysena") total += FLAT72_CENY.izolacia.zvysena;
    if (izolaciaNavysenie === "premium") total += FLAT72_CENY.izolacia.premium;
    if (izolaciaNavysenie === "ultra") total += FLAT72_CENY.izolacia.ultra;

    if (zaklady === "skrutky") total += FLAT72_CENY.zaklady.skrutky;
    if (zaklady === "doska") total += FLAT72_CENY.zaklady.doska;
    if (zaklady === "pasove") total += FLAT72_CENY.zaklady.pasove;

    // Fáza 2 - Holodom
    if (vstupneDvere === "plastove") total += FLAT72_CENY.vstupneDvere.plastove;
    if (vstupneDvere === "hlinikove") total += FLAT72_CENY.vstupneDvere.hlinikove;
    if (elektroinstalacia) total += FLAT72_CENY.elektro;
    if (vodaKanalizacia) total += FLAT72_CENY.voda;
    if (sanitaKomplet) total += FLAT72_CENY.sanita;
    if (bojler) total += FLAT72_CENY.bojler;
    if (tepelneCerpadlo) total += FLAT72_CENY.cerpadlo;
    if (rekuperacia) total += FLAT72_CENY.rekuperacia;
    if (pripojkaSiete) total += FLAT72_CENY.pripojka;
    total += stresneOkno * FLAT72_CENY.stresneOkno;
    total += bocneOknoFixne * FLAT72_CENY.bocneOknoFixne;
    total += bocneOknoVyklopne90 * FLAT72_CENY.bocneOknoVyklopne90;
    total += bocneOknoVyklopne55 * FLAT72_CENY.bocneOknoVyklopne55;
    if (povrchokaOkien) total += FLAT72_CENY.povrchokaOkien;
    if (tonovaneSkla) total += FLAT72_CENY.tonovaneSkla;

    // Fáza 3 - Dom na kľúč
    if (vonkajsiaFasada === "drevo") total += FLAT72_CENY.fasada.drevo;
    if (vonkajsiaFasada === "murovka") total += FLAT72_CENY.fasada.murovka;
    if (interierFinis === "sadrokarton") total += FLAT72_CENY.interier.sadrokarton;
    if (vnutornePodlahy) total += FLAT72_CENY.podlahy;
    if (podlahovVykurovanie) total += FLAT72_CENY.podlahovka;
    total += interieroveDvere * FLAT72_CENY.dvere;
    if (pergola) total += FLAT72_CENY.pergola;

    // Fáza 4 - Dokumentácia
    if (inziniering) total += FLAT72_CENY.inziniering;
    if (projektA0) total += FLAT72_CENY.projektA0;
    if (revizna) total += FLAT72_CENY.revizna;
    if (doprava) total += FLAT72_CENY.doprava;

    return total;
  }, [
    montazHolodomu, izolaciaNavysenie, zaklady, predlzenie,
    vstupneDvere, elektroinstalacia, vodaKanalizacia, sanitaKomplet,
    bojler, tepelneCerpadlo, rekuperacia, pripojkaSiete,
    stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55,
    povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
    vnutornePodlahy, podlahovVykurovanie, interieroveDvere, pergola,
    inziniering, projektA0, revizna, doprava
  ]);

  if (showOnlySummary) {
    return (
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-4">{t('configurationSummary')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-amber-200">
            <span className="text-sm text-gray-700">{t('basePrice')}</span>
            <span className="font-bold text-amber-900">{BASE_PRICE.toLocaleString('sk-SK')} €</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-amber-100 rounded-lg px-4">
            <span className="font-bold text-lg text-amber-900">{t('totalPrice')}</span>
            <span className="font-bold text-2xl text-amber-900">{celkovaCena.toLocaleString('sk-SK')} €</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <KonfiguratorFaza1HrubaStavba
        montazHolodomu={montazHolodomu}
        setMontazHolodomu={setMontazHolodomu}
        izolaciaNavysenie={izolaciaNavysenie}
        setIzolaciaNavysenie={setIzolaciaNavysenie}
        zaklady={zaklady}
        setZaklady={setZaklady}
        predlzenie={predlzenie}
        setPredlzenie={setPredlzenie}
        useProstoHousePrices={false}
      />
    </div>
  );
}