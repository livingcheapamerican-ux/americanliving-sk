import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Target, Award, Users, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function ONas() {
  const { t } = useLanguage();
  
  const hodnoty = [
    {
      icon: Award,
      nazov: t('qualityAndVerified'),
      popis: t('qualityAndVerifiedDesc')
    },
    {
      icon: Shield,
      nazov: t('transparency'),
      popis: t('transparencyDesc')
    },
    {
      icon: Target,
      nazov: t('comprehensiveServicesValue'),
      popis: t('comprehensiveServicesValueDesc')
    },
    {
      icon: Heart,
      nazov: t('clientSatisfaction'),
      popis: t('clientSatisfactionDesc')
    }
  ];

  const statistiky = [
    { cislo: "700+", popis: t('completedHouses'), icon: "🏠" },
    { cislo: "2008", popis: t('yearFounded'), icon: "📅" },
    { cislo: "4", popis: t('verifiedManufacturers'), icon: "🏭" },
    { cislo: "100%", popis: t('withFinalApproval'), icon: "✅" }
  ];

  const vyrobcovia = [
    {
      nazov: "JAK Modules",
      popis: t('jakModulesDesc')
    },
    {
      nazov: "Ticab House",
      popis: t('ticabHouseDesc')
    },
    {
      nazov: "Prosto House",
      popis: t('prostoHouseDesc')
    },
    {
      nazov: "Domki z Gór",
      popis: t('domkiZGorDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {t('aboutUs')}
            </h1>
            <p className="text-xl text-white mb-6 font-bold drop-shadow-md">
              {t('distributorAndBuilder')}
            </p>
            <p className="text-lg text-white font-medium drop-shadow-md">
              {t('builtMoreThan700')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Štatistiky */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {statistiky.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-5xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-bold text-primary mb-2">{stat.cislo}</div>
                  <p className="text-gray-600 font-medium">{stat.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">
              {t('whyChooseUs')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('qualityBrandDesc')}
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-8 mb-16">
            {/* Poctivosť */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  {t('forgetMisleadingAds')}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('forgetMisleadingAdsDesc')}
                </p>
              </Card>
            </motion.div>

            {/* Zodpovednosť */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('responsibilityForConstruction')}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('responsibilityDesc1')}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('responsibilityDesc2')}
                </p>
                <p className="text-gray-900 font-semibold">
                  ⚠️ {t('blackConstructionWarning')}
                </p>
              </Card>
            </motion.div>

            {/* Naše riešenie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <CheckCircle className="w-7 h-7 text-accent flex-shrink-0" />
                  {t('ourHousesMeetAllStandards')}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('readyForApproval')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('allNecessaryPermits')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('a0CertificatePossibility')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('connectionToUtilities')}</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>

          {/* Naše hodnoty */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {hodnoty.map((hodnota, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <hodnota.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3">{hodnota.nazov}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{hodnota.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Naši výrobcovia */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">
              {t('ourManufacturers')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('officialDistributorModularPrefab')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {vyrobcovia.map((vyrobca, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-primary mb-2">{vyrobca.nazov}</h3>
                  <p className="text-gray-600">{vyrobca.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">
              {t('readyForOwnHouse')}
            </h2>
            <p className="text-xl mb-8 text-white">
              {t('contactUsAndFindIdeal')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 w-full sm:w-auto">
                  {t('showOffer')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 w-full sm:w-auto">
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