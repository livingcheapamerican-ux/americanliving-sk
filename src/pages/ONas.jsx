import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Target, Award, ArrowRight, Shield, CheckCircle, AlertTriangle, Factory } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function ONas() {
  const { t } = useLanguage();

  const hodnoty = [
    { icon: Award, nazov: t('qualityAndVerified'), popis: t('qualityAndVerifiedDesc') },
    { icon: Shield, nazov: t('transparency'), popis: t('transparencyDesc') },
    { icon: Target, nazov: t('comprehensiveServicesValue'), popis: t('comprehensiveServicesValueDesc') },
    { icon: Heart, nazov: t('clientSatisfaction'), popis: t('clientSatisfactionDesc') }
  ];

  const statistiky = [
    { cislo: "700+", popis: t('completedHouses') },
    { cislo: "2008", popis: t('yearFounded') },
    { cislo: "4", popis: t('verifiedManufacturers') },
    { cislo: "100%", popis: t('withFinalApproval') }
  ];

  const vyrobcovia = [
    { nazov: "JAK Modules", popis: t('jakModulesDesc') },
    { nazov: "Ticab House", popis: t('ticabHouseDesc') },
    { nazov: "Prosto House", popis: t('prostoHouseDesc') },
    { nazov: "Domki z Gór", popis: t('domkiZGorDesc') }
  ];

  const standardy = [
    t('readyForApproval'),
    t('allNecessaryPermits'),
    t('a0CertificatePossibility'),
    t('connectionToUtilities')
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-background" />
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-6">
              <Shield className="w-3.5 h-3.5" />
              {t('aboutUs')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t('distributorAndBuilder')}
            </h1>
            <div className="w-20 h-1 bg-accent rounded-full mb-6" />
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('builtMoreThan700')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Štatistiky */}
      <section className="py-12 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {statistiky.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-primary mb-1 tracking-tight">{stat.cislo}</div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{stat.popis}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prečo my */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('whyChooseUs')}</h2>
            <p className="text-lg text-muted-foreground">{t('qualityBrandDesc')}</p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid gap-6 mb-16">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="p-8 border-l-4 border-l-primary">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">{t('forgetMisleadingAds')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('forgetMisleadingAdsDesc')}</p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="p-8">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">{t('responsibilityForConstruction')}</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">{t('responsibilityDesc1')}</p>
                <p className="text-muted-foreground leading-relaxed mb-5">{t('responsibilityDesc2')}</p>
                <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-foreground">{t('blackConstructionWarning')}</p>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="p-8">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                  {t('ourHousesMeetAllStandards')}
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {standardy.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>

          {/* Hodnoty */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {hodnoty.map((hodnota, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <hodnota.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{hodnota.nazov}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{hodnota.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Výrobcovia */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('ourManufacturers')}</h2>
            <p className="text-lg text-muted-foreground">{t('officialDistributorModularPrefab')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {vyrobcovia.map((vyrobca, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="p-6 h-full bg-background hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                      <Factory className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{vyrobca.nazov}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{vyrobca.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-secondary text-white p-10 md:p-14 text-center shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('readyForOwnHouse')}</h2>
            <p className="text-lg text-white/90 mb-8">{t('contactUsAndFindIdeal')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 w-full sm:w-auto">
                  {t('showOffer')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white/70 text-white hover:bg-white hover:text-primary font-semibold px-8 w-full sm:w-auto">
                  {t('contactUsButton')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}