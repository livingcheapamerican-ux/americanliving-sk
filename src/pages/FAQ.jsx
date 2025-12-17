import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Search, Home, Euro, Truck, Clock, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function FAQ() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { icon: Home, name: t('faqCategoryGeneral'), color: "bg-blue-500" },
    { icon: Euro, name: t('faqCategoryPrice'), color: "bg-green-500" },
    { icon: Truck, name: t('faqCategoryDelivery'), color: "bg-orange-500" },
    { icon: Clock, name: t('faqCategoryConstruction'), color: "bg-purple-500" },
    { icon: Shield, name: t('faqCategoryWarranty'), color: "bg-red-500" },
    { icon: Zap, name: t('faqCategoryEnergy'), color: "bg-yellow-500" }
  ];

  const faqData = [
    {
      category: t('faqCategoryGeneral'),
      questions: [
        { q: t('faq1Q'), a: t('faq1A') },
        { q: t('faq2Q'), a: t('faq2A') },
        { q: t('faq3Q'), a: t('faq3A') }
      ]
    },
    {
      category: t('faqCategoryPrice'),
      questions: [
        { q: t('faq4Q'), a: t('faq4A') },
        { q: t('faq5Q'), a: t('faq5A') },
        { q: t('faq6Q'), a: t('faq6A') }
      ]
    },
    {
      category: t('faqCategoryDelivery'),
      questions: [
        { q: t('faq7Q'), a: t('faq7A') },
        { q: t('faq8Q'), a: t('faq8A') },
        { q: t('faq9Q'), a: t('faq9A') }
      ]
    },
    {
      category: t('faqCategoryConstruction'),
      questions: [
        { q: t('faq10Q'), a: t('faq10A') },
        { q: t('faq11Q'), a: t('faq11A') },
        { q: t('faq12Q'), a: t('faq12A') }
      ]
    },
    {
      category: t('faqCategoryWarranty'),
      questions: [
        { q: t('faq13Q'), a: t('faq13A') },
        { q: t('faq14Q'), a: t('faq14A') }
      ]
    },
    {
      category: t('faqCategoryEnergy'),
      questions: [
        { q: t('faq15Q'), a: t('faq15A') },
        { q: t('faq16Q'), a: t('faq16A') }
      ]
    }
  ];

  const filteredFAQ = faqData.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(search.toLowerCase()) ||
      q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('faqTitle')}</h1>
          <p className="text-xl opacity-90">{t('faqSubtitle')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('faqSearchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((cat, idx) => (
            <Card key={idx} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className={`${cat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-center font-medium">{cat.name}</p>
            </Card>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {category.category}
                <Badge variant="secondary">{category.questions.length}</Badge>
              </h2>
              {category.questions.map((item, qIdx) => {
                const globalIndex = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === globalIndex;
                
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIdx * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                        isOpen ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg pr-4">{item.q}</h3>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="mt-4 pt-4 border-t text-gray-600 leading-relaxed">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{t('faqNoResults')}</p>
          </Card>
        )}

        {/* Contact CTA */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
          <h3 className="text-2xl font-bold mb-4 text-center">{t('faqStillHaveQuestions')}</h3>
          <p className="text-center text-gray-600 mb-6">{t('faqContactUs')}</p>
          <div className="flex justify-center gap-4">
            <a href="tel:+421905138124" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold">
              📞 +421 905 138 124
            </a>
            <a href="mailto:info@americanliving.sk" className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              ✉️ info@americanliving.sk
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}