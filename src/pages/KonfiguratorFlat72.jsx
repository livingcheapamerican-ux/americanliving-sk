import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Building2, Hammer, Key } from "lucide-react";
import { motion } from "framer-motion";
import KonfiguratorFlat72 from "../components/KonfiguratorFlat72";
import { useLanguage } from "../components/LanguageContext";

export default function KonfiguratorFlat72Page() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');
  const { t } = useLanguage();

  const [typStavby, setTypStavby] = useState("");
  
  // State pre všetky voľby
  const [montazHolodomu, setMontazHolodomu] = useState("nie");
  const [vstupneDvere, setVstupneDvere] = useState("ziadne");
  const [izolaciaNavysenie, setIzolaciaNavysenie] = useState("standard");
  const [elektroinstalacia, setElektroinstalacia] = useState(false);
  const [vodaKanalizacia, setVodaKanalizacia] = useState(false);
  const [sanitaKomplet, setSanitaKomplet] = useState(false);
  const [bojler, setBojler] = useState(false);
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);
  const [zaklady, setZaklady] = useState("bez");
  const [pripojkaSiete, setPripojkaSiete] = useState(false);
  const [inziniering, setInziniering] = useState(false);
  const [projektA0, setProjektA0] = useState(false);
  const [interierFinis, setInterierFinis] = useState("ziadne");
  const [vonkajsiaFasada, setVonkajsiaFasada] = useState("");
  const [povrchokaOkien, setPovrchokaOkien] = useState(false);
  const [vnutornePodlahy, setVnutornePodlahy] = useState(false);
  const [podlahovVykurovanie, setPodlahovVykurovanie] = useState(false);
  const [interieroveDvere, setInterieroveDvere] = useState(0);
  const [tonovaneSkla, setTonovaneSkla] = useState(false);
  const [doprava, setDoprava] = useState(false);
  const [revizna, setRevizna] = useState(true);
  const [stresneOkno, setStresneOkno] = useState(0);
  const [bocneOknoFixne, setBocneOknoFixne] = useState(0);
  const [bocneOknoVyklopne90, setBocneOknoVyklopne90] = useState(0);
  const [bocneOknoVyklopne55, setBocneOknoVyklopne55] = useState(0);
  const [pergola, setPergola] = useState(false);

  const { data: dom, isLoading } = useQuery({
    queryKey: ['dom-konfigurator-flat72', domId],
    queryFn: async () => {
      if (!domId) return null;
      const domy = await base44.entities.Dom.filter({ id: domId });
      return domy[0] || null;
    },
    enabled: !!domId,
  });

  const handleReset = () => {
    setTypStavby("");
    setMontazHolodomu("nie");
    setVstupneDvere("ziadne");
    setIzolaciaNavysenie("standard");
    setElektroinstalacia(false);
    setVodaKanalizacia(false);
    setSanitaKomplet(false);
    setBojler(false);
    setTepelneCerpadlo(false);
    setRekuperacia(false);
    setZaklady("bez");
    setPripojkaSiete(false);
    setInziniering(false);
    setProjektA0(false);
    setInterierFinis("ziadne");
    setVonkajsiaFasada("");
    setPovrchokaOkien(false);
    setVnutornePodlahy(false);
    setPodlahovVykurovanie(false);
    setInterieroveDvere(0);
    setTonovaneSkla(false);
    setDoprava(false);
    setRevizna(true);
    setStresneOkno(0);
    setBocneOknoFixne(0);
    setBocneOknoVyklopne90(0);
    setBocneOknoVyklopne55(0);
    setPergola(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam konfigurátor...</p>
        </div>
      </div>
    );
  }

  if (!dom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Dom nenájdený</h2>
          <p className="text-gray-500 mb-6">Tento dom neexistuje alebo bol odstránený.</p>
          <Link to={createPageUrl("Katalog")}>
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Ak typ stavby nie je vybraný, zobrazíme výber
  if (!typStavby) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
          <div className="container mx-auto px-4">
            <Link to={createPageUrl("Katalog")}>
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
                <ArrowLeft className="mr-2 w-4 h-4" />
                {t('backToCatalog')}
              </Button>
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {dom.nazov} - Konfigurátor
              </h1>
              <p className="text-xl text-red-100 mb-6">
                Zastavaná plocha {dom.zastavana_plocha}m² | Úžitková plocha {dom.uzitkova_plocha || 'N/A'}m²
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Vyberte typ stavby
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Zvoľte, v akom stave chcete dom dodať
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Hrubá stavba */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTypStavby("hruba");
                    setMontazHolodomu("ano");
                    setInterierFinis("ziadne");
                    setVonkajsiaFasada("standard");
                  }}
                  className="cursor-pointer"
                >
                  <Card className="p-6 h-full border-2 border-amber-300 hover:border-amber-500 hover:shadow-xl transition-all bg-gradient-to-br from-amber-50 to-white">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Hrubá stavba</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Dom bez vnútorných úprav, pripravený na dokončenie
                      </p>
                      <Badge className="bg-amber-600 text-white">Úspora nákladov</Badge>
                    </div>
                  </Card>
                </motion.div>

                {/* Holodom */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTypStavby("holodom");
                    setMontazHolodomu("ano");
                    setElektroinstalacia(true);
                    setVodaKanalizacia(true);
                    setInterierFinis("drevo");
                    setVonkajsiaFasada("standard");
                  }}
                  className="cursor-pointer"
                >
                  <Card className="p-6 h-full border-2 border-blue-300 hover:border-blue-500 hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Hammer className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Holodom</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        S elektroinštaláciou a rozvodmi vody, pripravený na dokončenie
                      </p>
                      <Badge className="bg-blue-600 text-white">Obľúbené</Badge>
                    </div>
                  </Card>
                </motion.div>

                {/* Dom na kľúč */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTypStavby("kluc");
                    setMontazHolodomu("ano");
                    setElektroinstalacia(true);
                    setVodaKanalizacia(true);
                    setInterierFinis("sadrokarton");
                    setVonkajsiaFasada("standard");
                    setVnutornePodlahy(true);
                  }}
                  className="cursor-pointer"
                >
                  <Card className="p-6 h-full border-2 border-green-300 hover:border-green-500 hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-white">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Key className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Dom na kľúč</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Kompletne dokončený dom, pripravený na nasťahovanie
                      </p>
                      <Badge className="bg-green-600 text-white">Bez starostí</Badge>
                    </div>
                  </Card>
                </motion.div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-700 text-center">
                  💡 Môžete si vybrať základný balík a potom si ho ďalej prispôsobiť podľa vašich potrieb
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Ak je typ stavby vybraný, zobrazíme konfigurátor
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={handleReset}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Zmeniť typ stavby
            </Button>
            <Badge className="bg-white/20 text-white px-4 py-2">
              {typStavby === "hruba" ? "Hrubá stavba" : typStavby === "holodom" ? "Holodom" : "Dom na kľúč"}
            </Badge>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              {dom.nazov} - Konfigurátor
            </h1>
            <p className="text-xl text-red-100 mb-6">
              Zastavaná plocha {dom.zastavana_plocha}m² | Úžitková plocha {dom.uzitkova_plocha || 'N/A'}m²
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
              <p className="text-sm text-red-200 mb-1">Základná cena (sada)</p>
              <p className="text-4xl font-bold">{(dom.zakladna_cena || 49900).toLocaleString('sk-SK')} €</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Ľavý stĺpec - konfigurátor */}
            <div>
              <KonfiguratorFlat72
                dom={dom}
                onReset={handleReset}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
                showOnlyPhase={typStavby === "hruba" ? "hruba" : null}
                typStavby={typStavby}
              />
            </div>

            {/* Pravý stĺpec - cenový súhrn (sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <KonfiguratorFlat72
                  dom={dom}
                  onReset={handleReset}
                  montazHolodomu={montazHolodomu}
                  setMontazHolodomu={setMontazHolodomu}
                  izolaciaNavysenie={izolaciaNavysenie}
                  setIzolaciaNavysenie={setIzolaciaNavysenie}
                  zaklady={zaklady}
                  setZaklady={setZaklady}
                  vstupneDvere={vstupneDvere}
                  setVstupneDvere={setVstupneDvere}
                  elektroinstalacia={elektroinstalacia}
                  setElektroinstalacia={setElektroinstalacia}
                  vodaKanalizacia={vodaKanalizacia}
                  setVodaKanalizacia={setVodaKanalizacia}
                  sanitaKomplet={sanitaKomplet}
                  setSanitaKomplet={setSanitaKomplet}
                  bojler={bojler}
                  setBojler={setBojler}
                  tepelneCerpadlo={tepelneCerpadlo}
                  setTepelneCerpadlo={setTepelneCerpadlo}
                  rekuperacia={rekuperacia}
                  setRekuperacia={setRekuperacia}
                  pripojkaSiete={pripojkaSiete}
                  setPripojkaSiete={setPripojkaSiete}
                  stresneOkno={stresneOkno}
                  setStresneOkno={setStresneOkno}
                  bocneOknoFixne={bocneOknoFixne}
                  setBocneOknoFixne={setBocneOknoFixne}
                  bocneOknoVyklopne90={bocneOknoVyklopne90}
                  setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                  bocneOknoVyklopne55={bocneOknoVyklopne55}
                  setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                  povrchokaOkien={povrchokaOkien}
                  setPovrchokaOkien={setPovrchokaOkien}
                  tonovaneSkla={tonovaneSkla}
                  setTonovaneSkla={setTonovaneSkla}
                  vonkajsiaFasada={vonkajsiaFasada}
                  setVonkajsiaFasada={setVonkajsiaFasada}
                  interierFinis={interierFinis}
                  setInterierFinis={setInterierFinis}
                  vnutornePodlahy={vnutornePodlahy}
                  setVnutornePodlahy={setVnutornePodlahy}
                  podlahovVykurovanie={podlahovVykurovanie}
                  setPodlahovVykurovanie={setPodlahovVykurovanie}
                  interieroveDvere={interieroveDvere}
                  setInterieroveDvere={setInterieroveDvere}
                  pergola={pergola}
                  setPergola={setPergola}
                  inziniering={inziniering}
                  setInziniering={setInziniering}
                  projektA0={projektA0}
                  setProjektA0={setProjektA0}
                  revizna={revizna}
                  setRevizna={setRevizna}
                  doprava={doprava}
                  setDoprava={setDoprava}
                  showOnlySummary={true}
                  typStavby={typStavby}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}