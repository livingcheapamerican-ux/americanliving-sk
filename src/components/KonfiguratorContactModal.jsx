import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle, Package, Hammer, Key, FileText, Sparkles, FileDown, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";

export default function KonfiguratorContactModal({ 
  isOpen, 
  onClose, 
  dom,
  totalPrice,
  selectedItems,
  vonkajsiaFasada,
  izolaciaNavysenie,
  tepelneCerpadlo,
  rekuperacia,
  projektA0,
  // Všetky Prosto House parametre
  montazHolodomu, zaklady, predlzenie, vstupneDvere,
  elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler,
  pripojkaSiete, stresneOkno, bocneOknoFixne, bocneOknoVyklopne90,
  bocneOknoVyklopne55, povrchokaOkien, tonovaneSkla, interierFinis,
  vnutornePodlahy, podlahovVykurovanie, interieroveDvere, inziniering,
  revizna, doprava,
  predajNehnutelnosti, hladaniePozemku, financneSluzby,
  pergola,
  typStavby
}) {
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    obec: "",
    poznamka: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const { t, language } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isProstoHouse = dom?.vyrobca === "Prosto House";
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const formatPrice = (price) => price?.toLocaleString('sk-SK') + " €";

  // Kontrola A0 statusu
  const isA0Ready = projektA0 && izolaciaNavysenie === "premium" && tepelneCerpadlo && rekuperacia;
  const a0Missing = [];
  if (projektA0) {
    if (izolaciaNavysenie !== "premium") a0Missing.push("Premium izolácia (250/300mm)");
    if (!tepelneCerpadlo) a0Missing.push("Tepelné čerpadlo");
    if (!rekuperacia) a0Missing.push("Rekuperácia");
  }

  // Vyber správny obrázok podľa fasády
  const getHouseImage = () => {
    if (vonkajsiaFasada === "suchana") {
      return dom?.hlavny_obrazok;
    } else {
      return dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok;
    }
  };

  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
        onClose();
      }, 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Vytvor súhrn konfigurácie
    const konfiguracnySuhrn = selectedItems
      ?.filter(item => item.selected && item.price > 0)
      .map(item => `${item.name}: ${formatPrice(item.price)}`)
      .join('\n');

    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: dom?.id,
      konfiguracny_kod: `${dom?.nazov || 'Flat Double 142m²'} - ${formatPrice(totalPrice)}`,
      poznamka: `Lokalita: ${formData.obec}\n\n${formData.poznamka}\n\n--- KONFIGURÁCIA ---\n${konfiguracnySuhrn}\n\nCELKOM: ${formatPrice(totalPrice)}`
    });
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const response = await base44.functions.invoke('generateConfigurationPDF', {
        domId: dom.id,
        configuration: { vonkajsiaFasada, izolaciaNavysenie, tepelneCerpadlo, rekuperacia, projektA0 },
        totalPrice,
        selectedItems,
        sendEmail: false
      });

      const blob = new Blob([new Uint8Array(response.data)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `konfig_${dom.nazov.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('PDF stiahnuté');
    } catch (error) {
      toast.error('Chyba pri generovaní PDF: ' + error.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePreview = async () => {
    if (!isProstoHouse) {
      toast.info('Funkcia dostupná len pre Prosto House');
      return;
    }
    
    try {
      const response = await base44.functions.invoke('nahladCenovejPonukyProstoHouse', {
        dom_id: dom.id,
        klient_meno: formData.meno || 'Klient',
        klient_email: formData.email || 'email@example.com',
        klient_telefon: formData.telefon || '+421 900 000 000',
        klient_adresa: formData.obec || '',
        selectedItems: selectedItems,
        totalPrice: totalPrice,
        montazHolodomu, izolaciaNavysenie, zaklady, vstupneDvere,
        elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler,
        tepelneCerpadlo, rekuperacia, pripojkaSiete,
        stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55,
        povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
        vnutornePodlahy, podlahovVykurovanie, interieroveDvere,
        inziniering, projektA0, revizna, doprava, predlzenie,
        predajNehnutelnosti, hladaniePozemku, financneSluzby,
        language: language
      });
      
      setPreviewHtml(response.data.html);
      setShowPreview(true);
    } catch (error) {
      toast.error('Chyba pri načítaní náhľadu: ' + error.message);
    }
  };

  const handleSendEmail = async () => {
    if (!formData.email || !formData.meno || !formData.telefon || !formData.obec) {
      toast.error('Vyplňte všetky povinné polia');
      return;
    }
    
    if (!isProstoHouse) {
      toast.info('Funkcia dostupná len pre Prosto House');
      return;
    }
    
    setGeneratingPDF(true);
    try {
      await base44.functions.invoke('odosliCenovuPonukuProstoHouse', {
        dom_id: dom.id,
        klient_meno: formData.meno,
        klient_email: formData.email,
        klient_telefon: formData.telefon,
        klient_adresa: formData.obec,
        klient_poznamka: formData.poznamka,
        selectedItems: selectedItems,
        totalPrice: totalPrice,
        montazHolodomu, izolaciaNavysenie, zaklady, vstupneDvere,
        elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler,
        tepelneCerpadlo, rekuperacia, pripojkaSiete,
        stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55,
        povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
        vnutornePodlahy, podlahovVykurovanie, interieroveDvere,
        inziniering, projektA0, revizna, doprava, predlzenie,
        predajNehnutelnosti, hladaniePozemku, financneSluzby
      });
      
      toast.success('✓ ' + t('quoteSentSuccess'));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
        onClose();
      }, 3000);
    } catch (error) {
      toast.error('Chyba pri odosielaní: ' + error.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <>
      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-4 border-b bg-gray-50 sticky top-0 z-10">
            <h3 className="text-lg font-bold">Náhľad cenovej ponuky</h3>
            <p className="text-sm text-gray-600">Takto bude vyzerať email pre klienta</p>
          </div>
          <div className="p-4">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {!submitted ? (
            <div className="flex flex-col lg:flex-row">
            {/* Ľavá strana - Obrázok a súhrn */}
            <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 text-white">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                  {t('yourConfiguration')}
                </DialogTitle>
              </DialogHeader>

              {/* Obrázok domu */}
              <div className="relative rounded-xl overflow-hidden mb-4 bg-white">
                <img 
                  src={getHouseImage()} 
                  alt={dom?.nazov || "Flat Double"} 
                  className="w-full h-40 sm:h-48 object-contain"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={`${vonkajsiaFasada === "suchana" ? "bg-orange-500" : "bg-amber-600"} text-white text-xs`}>
                    {vonkajsiaFasada === "suchana" ? t('facadeStucco') : t('facadeWoodMetal')}
                  </Badge>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3">{dom?.nazov || 'Flat Double 142m²'}</h3>

              {/* Súhrn položiek */}
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 max-h-[200px] sm:max-h-[250px] overflow-y-auto text-sm">
                {selectedItems?.map((item, index) => {
                   const isBase = item.section === "base";
                   const prevItem = selectedItems[index - 1];
                   const showHrubaDivider = item.section === "hruba" && (!prevItem || prevItem.section === "base");
                   const showHolodomDivider = item.section === "holodom" && prevItem?.section === "hruba";
                   const showKlucDivider = item.section === "kluc" && prevItem?.section === "holodom";
                   const showDocsDivider = item.section === "docs" && prevItem?.section === "kluc";

                   if (!item.selected && !isBase) return null;

                   return (
                     <div key={index}>
                      {showHrubaDivider && (
                        <div className="flex items-center gap-2 py-1 mt-2">
                          <Package className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400 uppercase">{t('roughConstruction')}</span>
                        </div>
                      )}
                      {showHolodomDivider && (
                        <div className="flex items-center gap-2 py-1 mt-2">
                          <Hammer className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] font-bold text-blue-400 uppercase">{t('holodomLabel')}</span>
                        </div>
                      )}
                      {showKlucDivider && (
                        <div className="flex items-center gap-2 py-1 mt-2">
                          <Key className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">{t('turnkeyLabel')}</span>
                        </div>
                      )}
                      {showDocsDivider && (
                        <div className="flex items-center gap-2 py-1 mt-2">
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] font-bold text-purple-400 uppercase">{t('documentationLabel')}</span>
                        </div>
                      )}
                      {item.selected && (
                        <div className={`flex justify-between items-center py-1 px-2 rounded text-xs ${isBase ? 'bg-blue-500/20 border border-blue-500/30 my-1' : ''}`}>
                          <span className={`${isBase ? 'text-blue-300 font-semibold' : 'text-slate-300'} flex-1 pr-2 truncate`}>{item.name}</span>
                          <span className={`${isBase ? 'text-blue-300' : 'text-green-400'} font-semibold whitespace-nowrap`}>
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* A0 / Rekreačná stavba status */}
              <div className={`mt-3 p-3 rounded-xl border ${isA0Ready ? 'bg-green-500/20 border-green-500/30' : projektA0 && a0Missing.length > 0 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                {isA0Ready ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-bold text-sm">✓ {t('meetsA0Conditions')}</p>
                      <p className="text-green-300/80 text-xs">{t('familyHouseWithCert')}</p>
                    </div>
                  </div>
                ) : projektA0 && a0Missing.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <p className="text-amber-400 font-bold text-sm">{t('forA0Missing')}:</p>
                    </div>
                    <ul className="text-amber-300/80 text-xs space-y-0.5 ml-6">
                      {a0Missing.map((item, i) => <li key={i}>• {item}</li>)}
                    </ul>
                  </div>
                ) : (
                   <div className="flex items-center gap-2">
                     <Package className="w-5 h-5 text-blue-400" />
                     <div>
                       <p className="text-blue-400 font-bold text-sm">
                         {typStavby === 'rodinny_dom' ? t('familyHouse') : t('recreationalBuilding')}
                       </p>
                       <p className="text-blue-300/80 text-xs">
                         {typStavby === 'rodinny_dom' ? t('completeCalculation') : t('cottageOrGardenHouse')}
                       </p>
                     </div>
                   </div>
                 )}
              </div>

              {/* Celková cena */}
              <div className="mt-3 p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{t('totalWithVAT')}</span>
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pravá strana - Formulár */}
            <div className="lg:w-1/2 p-4 sm:p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {t('contactDetails')}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {t('fillFormWeContact')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="meno">{t('fullName')} *</Label>
                  <Input
                    id="meno"
                    required
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    placeholder={t('fullNamePlaceholder')}
                    className="mt-1 !text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('emailPlaceholder')}
                    className="mt-1 !text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="telefon">{t('phone')} *</Label>
                  <Input
                    id="telefon"
                    required
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder={t('phonePlaceholder')}
                    className="mt-1 !text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="obec">{t('cityLocation')} *</Label>
                  <Input
                    id="obec"
                    required
                    value={formData.obec}
                    onChange={(e) => setFormData({ ...formData, obec: e.target.value })}
                    placeholder={t('cityPlaceholder')}
                    className="mt-1 !text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="poznamka">{t('note')} ({t('optional')})</Label>
                  <Textarea
                    id="poznamka"
                    value={formData.poznamka}
                    onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                    placeholder={t('notePlaceholder')}
                    rows={3}
                    className="mt-1 !text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                {isProstoHouse ? (
                  <div className="space-y-3">
                    {isAdmin && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handlePreview}
                        className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Mail className="mr-2 w-4 h-4" />
                        {t('quotePreview')}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleSendEmail}
                      disabled={generatingPDF || !formData.email || !formData.meno || !formData.telefon || !formData.obec}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold"
                    >
                      <Mail className="mr-2 w-5 h-5" />
                      {generatingPDF ? t('sending') : t('sendQuote')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    disabled={createDopytMutation.isPending}
                  >
                    {createDopytMutation.isPending ? (
                      t('sending')
                    ) : (
                      <>
                        <Send className="mr-2 w-5 h-5" />
                        {t('sendQuote')}
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t('thankYouForInterest')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t('configSentSuccessfully')}
            </p>
          </motion.div>
        )}
        </DialogContent>
        </Dialog>
        </>
        );
        }