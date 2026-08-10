import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from "lucide-react";
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
    mutationFn: async (data) => {
      const novyDopyt = await base44.entities.Dopyt.create(data);

      console.log('✅ Dopyt vytvorený:', novyDopyt.id);
      console.log('📧 Volám notifikujNovyDopyt...');

      const notifikaciaResult = await base44.functions.invoke('notifikujNovyDopyt', {
        dopyt: {
          id: novyDopyt.id,
          klient_meno: novyDopyt.meno,
          klient_email: novyDopyt.email,
          klient_telefon: novyDopyt.telefon,
          klient_adresa: '',
          typ_dopytu: novyDopyt.typ_dopytu,
          poznamka: novyDopyt.poznamka,
          dom_nazov: 'Všeobecný dopyt z kontaktného formulára',
          dom_id: null
        }
      });

      console.log('📧 Notifikácia result:', notifikaciaResult);

      return novyDopyt;
    },
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

  const sluzby = [
    t('sellYourProperty'),
    t('selectAndBuyLand'),
    t('mortgageArrangement'),
    t('projectDocumentation'),
    t('buildingPermitService'),
    t('houseConstruction'),
    t('utilityConnection'),
    t('finalApproval')
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-background" />
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-6">
              <MessageSquare className="w-3.5 h-3.5" />
              {t('contact')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              {t('contactUsTitle')}
            </h1>
            <div className="w-20 h-1 bg-accent rounded-full mb-6" />
            <p className="text-lg md:text-xl text-muted-foreground">{t('contactUsSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Formulár */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
            <Card className="p-6 md:p-8 shadow-lg">
              {!submitted ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{t('writeUs')}</h2>
                  <p className="text-sm text-muted-foreground mb-6">{t('weWillRespond')}</p>
                  <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="meno">{t('name')} *</Label>
                        <Input
                          id="meno"
                          name="meno"
                          required
                          value={formData.meno}
                          onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                          placeholder="Ján Novák"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefon">{t('phone')} *</Label>
                        <Input
                          id="telefon"
                          name="telefon"
                          required
                          value={formData.telefon}
                          onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                          placeholder="+421 900 123 456"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">{t('email')} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jan.novak@email.sk"
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
                        name="poznamka"
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
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-14"
                >
                  <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{t('thankYou')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t('messageSuccess')}</p>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Kontaktné info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
            <div className="space-y-3">
              {kontaktInfo.map((info, index) => (
                <Card key={index} className="p-5 hover:shadow-md hover:border-accent/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">{info.nazov}</h3>
                      {info.link ? (
                        <a href={info.link} className="text-base font-semibold text-foreground hover:text-primary transition-colors block break-words">
                          {info.hodnota}
                        </a>
                      ) : (
                        <p className="text-base font-semibold text-foreground">{info.hodnota}</p>
                      )}
                      {info.popis && <p className="text-xs text-muted-foreground mt-1">{info.popis}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-muted/50">
              <h3 className="font-bold text-foreground mb-4">{t('comprehensiveServices')}</h3>
              <ul className="space-y-2.5">
                {sluzby.map((sluzba, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{sluzba}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Rýchly kontakt */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t('needQuickAnswer')}</h2>
            <p className="text-muted-foreground mb-8">{t('callOrEmail')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+421905138124">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
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