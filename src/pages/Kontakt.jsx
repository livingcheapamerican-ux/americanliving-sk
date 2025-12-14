import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function Kontakt() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    typ_dopytu: "vseobecny",
    poznamka: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();

  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopyty'] });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ meno: "", email: "", telefon: "", typ_dopytu: "vseobecny", poznamka: "" });
      }, 5000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDopytMutation.mutate(formData);
  };

  const kontaktInfo = [
    {
      icon: Phone,
      nazov: t('phone'),
      hodnota: "+421 905 138 124",
      link: "tel:+421905138124",
      popis: `${t('monFri')} 8:00 - 17:00`
    },
    {
      icon: Mail,
      nazov: t('email'),
      hodnota: "info@americanliving.sk",
      link: "mailto:info@americanliving.sk",
      popis: t('weWillRespond')
    },
    {
      icon: Clock,
      nazov: t('openingHours'),
      hodnota: `${t('monFri')}: 8:00 - 17:00`,
      popis: t('weekend')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-red-900 to-red-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {t('contactUsTitle')}
            </h1>
            <p className="text-xl text-white drop-shadow-md">
              {t('contactUsSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Kontaktný formulár */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-8 shadow-xl">
              {!submitted ? (
                  <>
                    <h2 className="text-2xl font-bold text-primary mb-6">
                      {t('writeUs')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="meno">{t('name')} *</Label>
                      <Input
                        id="meno"
                        required
                        value={formData.meno}
                        onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                        placeholder="Ján Novák"
                        className="mt-2"
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
                        placeholder="jan.novak@email.sk"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefon">{t('phone')} *</Label>
                      <Input
                        id="telefon"
                        required
                        value={formData.telefon}
                        onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                        placeholder="+421 900 123 456"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="typ">{t('inquiryType')}</Label>
                      <Select 
                        value={formData.typ_dopytu} 
                        onValueChange={(value) => setFormData({ ...formData, typ_dopytu: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vseobecny">{t('generalInquiry')}</SelectItem>
                          <SelectItem value="cenova_ponuka">{t('priceOffer')}</SelectItem>
                          <SelectItem value="financovanie">{t('financing')}</SelectItem>
                          <SelectItem value="pozemok">{t('lookingForLand')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="poznamka">{t('message')} *</Label>
                      <Textarea
                        id="poznamka"
                        required
                        value={formData.poznamka}
                        onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                        placeholder="Popíšte vašu požiadavku alebo otázku..."
                        rows={6}
                        className="mt-2"
                      />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold"
                        disabled={createDopytMutation.isPending}
                      >
                        {createDopytMutation.isPending ? (
                          t('sending')
                        ) : (
                          <>
                            {t('sendMessage')}
                            <Send className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </form>
                    </>
                    ) : (
                    <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                    >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-4">
                      {t('thankYou')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('messageSuccess')}
                    </p>
                    </motion.div>
                    )}
            </Card>
          </motion.div>

          {/* Kontaktné informácie */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">
                {t('contactInfo')}
              </h2>
              <div className="space-y-4">
                {kontaktInfo.map((info, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-primary mb-1">{info.nazov}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-lg text-secondary hover:text-secondary/80 transition-colors font-medium block mb-1"
                          >
                            {info.hodnota}
                          </a>
                        ) : (
                          <p className="text-lg text-gray-800 font-medium mb-1">{info.hodnota}</p>
                        )}
                        {info.popis && (
                          <p className="text-sm text-gray-500">{info.popis}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Naše služby */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-bold text-primary mb-4">{t('comprehensiveServices')}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('sellYourProperty')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('selectAndBuyLand')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('mortgageArrangement')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('projectDocumentation')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('buildingPermitService')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('houseConstruction')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('utilityConnection')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{t('finalApproval')}</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Ďalšie možnosti kontaktu */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-6">
              {t('needQuickAnswer')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('callOrEmail')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+421905138124"> {/* Updated phone link */}
                <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124 {/* Updated phone number */}
                </Button>
              </a>
              <a href="mailto:info@americanliving.sk">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                  <Mail className="mr-2 w-5 h-5" />
                  info@americanliving.sk
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}