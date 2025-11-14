import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, CheckCircle, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Konfigurator() {
  const [krok, setKrok] = useState(1);
  const [konfigKod, setKonfigKod] = useState("");
  const [showFormular, setShowFormular] = useState(false);
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    poznamka: ""
  });

  const queryClient = useQueryClient();

  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopyty'] });
      alert("Ďakujeme! Váš dopyt bol úspešne odoslaný. Čoskoro vás budeme kontaktovať.");
      // Reset
      setKrok(1);
      setKonfigKod("");
      setShowFormular(false);
      setFormData({ meno: "", email: "", telefon: "", poznamka: "" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      konfiguracny_kod: konfigKod
    });
  };

  const handleKonfiguraciaComplete = (kod) => {
    setKonfigKod(kod);
    setShowFormular(true);
  };

  const kroky = [
    { cislo: 1, nazov: "Exteriér", popis: "Výber strechy, fasády a farieb" },
    { cislo: 2, nazov: "Interiér", popis: "Štandardy, podlahy a materiály" },
    { cislo: 3, nazov: "Doplnky", popis: "Kúrenie, technológie a vybavenie" }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <section className="bg-gradient-to-r from-navy to-navy/90 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Konfigurátor domu
              </h1>
            </div>
            <p className="text-xl text-gray-200">
              Prispôsobte si dom presne podľa vašich predstáv. Po dokončení konfigurácie vám pripravíme nezáväznú cenovú ponuku.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {!showFormular ? (
          <div className="max-w-5xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {kroky.map((k, index) => (
                  <React.Fragment key={k.cislo}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                          krok >= k.cislo
                            ? 'bg-navy text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {krok > k.cislo ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          k.cislo
                        )}
                      </div>
                      <p className={`mt-2 text-sm font-semibold ${krok >= k.cislo ? 'text-navy' : 'text-gray-400'}`}>
                        {k.nazov}
                      </p>
                      <p className="text-xs text-gray-500 text-center max-w-[120px]">
                        {k.popis}
                      </p>
                    </div>
                    {index < kroky.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 ${krok > k.cislo ? 'bg-navy' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Konfigurátor Content - Placeholder pre klientov kód */}
            <Card className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={krok}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[400px]"
                >
                  <h2 className="text-3xl font-bold text-navy mb-6">
                    Krok {krok}: {kroky[krok - 1].nazov}
                  </h2>

                  {/* TENTO PRIESTOR JE URČENÝ PRE VÁŠ KONFIGURAČNÝ KÓD */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Priestor pre váš konfigurátor
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Tu bude umiestnený váš vlastný konfiguračný kód alebo embed. 
                      Rozhranie je pripravené na integráciu vašej konfiguračnej logiky.
                    </p>
                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto text-left">
                      <h4 className="font-semibold text-navy mb-2">Technické info:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Tento kontajner má ID: "konfigurator-container"</li>
                        <li>• Môžete vložiť vlastný kód, iframe alebo komponent</li>
                        <li>• Po dokončení volajte: handleKonfiguraciaComplete(kod)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Navigačné tlačidlá */}
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setKrok(Math.max(1, krok - 1))}
                      disabled={krok === 1}
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Späť
                    </Button>

                    {krok < 3 ? (
                      <Button
                        size="lg"
                        className="bg-navy hover:bg-navy/90"
                        onClick={() => setKrok(krok + 1)}
                      >
                        Ďalej
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="bg-red hover:bg-red/90"
                        onClick={() => handleKonfiguraciaComplete(`DEMO-${Date.now()}`)}
                      >
                        Dokončiť konfiguráciu
                        <CheckCircle className="ml-2 w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>
        ) : (
          /* Formulár na odoslanie dopytu */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-navy mb-2">
                  Konfigurácia dokončená!
                </h2>
                <p className="text-gray-600">
                  Váš konfiguračný kód: <span className="font-mono font-semibold text-navy">{konfigKod}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="meno">Meno a priezvisko *</Label>
                  <Input
                    id="meno"
                    required
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    placeholder="Ján Novák"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan.novak@email.sk"
                  />
                </div>

                <div>
                  <Label htmlFor="telefon">Telefón *</Label>
                  <Input
                    id="telefon"
                    required
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder="+421 900 123 456"
                  />
                </div>

                <div>
                  <Label htmlFor="poznamka">Poznámka (voliteľné)</Label>
                  <Textarea
                    id="poznamka"
                    value={formData.poznamka}
                    onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                    placeholder="Doplňujúce informácie alebo otázky..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFormular(false)}
                    className="flex-1"
                  >
                    Späť na konfiguráciu
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 bg-red hover:bg-red/90"
                    disabled={createDopytMutation.isPending}
                  >
                    {createDopytMutation.isPending ? (
                      "Odosiela sa..."
                    ) : (
                      <>
                        Odoslať dopyt
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}