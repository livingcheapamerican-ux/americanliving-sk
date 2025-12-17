import React from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../components/LanguageContext";
import { motion } from "framer-motion";

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
    { q: t('faqQ6'), a: t('faqA6') },
    { q: t('faqQ7'), a: t('faqA7') },
    { q: t('faqQ8'), a: t('faqA8') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-900 to-red-700 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-12 h-12" />
              <h1 className="text-5xl font-bold">{t('faq')}</h1>
            </div>
            <p className="text-xl text-white/90">{t('faqSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-semibold text-gray-900">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('needQuickAnswer')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('callOrEmail')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="tel:+421905138124">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      <Phone className="mr-2 w-5 h-5" />
                      +421 905 138 124
                    </Button>
                  </a>
                  <Link to={createPageUrl("Kontakt")}>
                    <Button size="lg" variant="outline">
                      <Mail className="mr-2 w-5 h-5" />
                      {t('contact')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}