import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

export default function KonfiguratorSteps({ krok, konfig, setKonfig, dom }) {
  // KROK 1: Výber verzie domu
  if (krok === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <Label className="text-lg font-bold mb-4 block">
            Vyberte verziu domu *
          </Label>
          <RadioGroup
            value={konfig.verzia_domu}
            onValueChange={(value) => setKonfig({ ...konfig, verzia_domu: value })}
          >
            <Card className="p-6 mb-4 cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="rodinny_dom" id="rodinny" />
                <div className="flex-1">
                  <Label htmlFor="rodinny" className="text-lg font-semibold cursor-pointer">
                    Rodinný dom s kolaudáciou
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Všetko zahŕňa čo potrebujete pri kolaudácii (pripravený na úver)
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="chata" id="chata" />
                <div className="flex-1">
                  <Label htmlFor="chata" className="text-lg font-semibold cursor-pointer">
                    Chata alebo záhradný domček
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Holý dom
                  </p>
                </div>
              </div>
            </Card>
          </RadioGroup>
        </div>

        {konfig.verzia_domu === "rodinny_dom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <Label className="text-lg font-bold mb-4 block">
              Kolaudácia domu *
            </Label>
            <p className="text-sm text-gray-600 mb-4">
              Ponuka Kolaudácia zahŕňa všetky služby potrebné ku kolaudácii - projekt, povolenia, 
              stavebné povolenie, základy, energetická certifikácia, kolaudácia a ďalšie
            </p>
            <RadioGroup
              value={konfig.kolaudacia}
              onValueChange={(value) => setKonfig({ ...konfig, kolaudacia: value })}
            >
              <Card className="p-4 mb-3 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="s_kolaudaciou" id="s_kol" />
                  <Label htmlFor="s_kol" className="font-semibold cursor-pointer">
                    S kolaudáciou A0
                  </Label>
                </div>
              </Card>
              <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="bez_kolaudacie" id="bez_kol" />
                  <Label htmlFor="bez_kol" className="font-semibold cursor-pointer">
                    Bez kolaudácie A0
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </motion.div>
        )}

        {konfig.verzia_domu === "chata" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <Label className="text-lg font-bold mb-4 block">
              Kolaudácia chaty *
            </Label>
            <p className="text-sm text-gray-600 mb-4">
              Ponuka Kolaudácia zahŕňa všetky služby potrebné ku kolaudácii - projekt, povolenia, 
              stavebné povolenie, základy, energetická certifikácia, kolaudácia a ďalšie
            </p>
            <RadioGroup
              value={konfig.kolaudacia_chaty}
              onValueChange={(value) => setKonfig({ ...konfig, kolaudacia_chaty: value })}
            >
              <Card className="p-4 mb-3 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="s_kolaudaciou" id="s_kol_chata" />
                  <Label htmlFor="s_kol_chata" className="font-semibold cursor-pointer">
                    S kolaudáciou
                  </Label>
                </div>
              </Card>
              <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="bez_kolaudacie" id="bez_kol_chata" />
                  <Label htmlFor="bez_kol_chata" className="font-semibold cursor-pointer">
                    Bez kolaudácie
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // KROK 2: Vonkajšia fasáda
  if (krok === 2) {
    const fasady = [
      {
        id: "omietka",
        nazov: "Šúchaná omietka Baumit + 100mm izolácia",
        cena: 0,
        obrazok: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80"
      },
      {
        id: "drevo_tmavy",
        nazov: "Drevo smrek - tmavý náter dreva",
        cena: 0,
        obrazok: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&q=80"
      },
      {
        id: "drevo_svetly",
        nazov: "Drevo smrek - svetlý náter",
        cena: 0,
        obrazok: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80"
      },
      {
        id: "thermowood",
        nazov: "Špeciálne sušená borovica - Thermowood 12cm",
        cena: 10477,
        obrazok: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80"
      },
      {
        id: "kompozit",
        nazov: "Panely z kompozitného materiálu",
        cena: null,
        popis: "CENA NA VYŽIADANIE",
        obrazok: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80"
      },
      {
        id: "falcovane",
        nazov: "Spájané falcované panely",
        cena: 8111,
        obrazok: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&q=80"
      },
      {
        id: "smrekovec",
        nazov: "Smrekovec",
        cena: 5245,
        obrazok: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&q=80"
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Label className="text-lg font-bold mb-4 block">
          Vonkajšia fasáda *
        </Label>
        <div className="grid md:grid-cols-2 gap-4">
          {fasady.map((fasada) => (
            <Card
              key={fasada.id}
              className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                konfig.fasada === fasada.id ? 'border-2 border-primary shadow-lg' : ''
              }`}
              onClick={() => setKonfig({ ...konfig, fasada: fasada.id })}
            >
              <img
                src={fasada.obrazok}
                alt={fasada.nazov}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold text-sm mb-2">{fasada.nazov}</h4>
              {fasada.cena !== null ? (
                <p className="text-primary font-bold">
                  {fasada.cena === 0 ? "+0€" : `+${fasada.cena.toLocaleString('sk-SK')}€`} s DPH
                </p>
              ) : (
                <p className="text-secondary font-bold">{fasada.popis}</p>
              )}
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  // KROK 3: Základy a služby
  if (krok === 3) {
    const zaklady = [
      { id: "bez", nazov: "Bez základov", cena: 0 },
      { id: "pasove", nazov: "Pásové betónové", cena: 17011 },
      { id: "vruty", nazov: "Vruty", cena: 5419 },
      { id: "pilier", nazov: "Pilier", cena: 4091 },
      { id: "kocky", nazov: "Kocky", cena: 3028 }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <Label className="text-lg font-bold mb-2 block">
            Potrebné položky ku kolaudácii
          </Label>
          <p className="text-sm text-gray-600 mb-4">
            Túto možnosť nie je možné zmeniť pri variante domu "S kolaudáciou" a s energetickým 
            certifikátom A0, ktorý je nevyhnutný pre kolaudáciu domu.
          </p>
        </div>

        <div>
          <Label className="text-lg font-bold mb-4 block">
            Základy *
          </Label>
          <p className="text-sm text-gray-600 mb-4">
            Pri domoch nad 47m² a pri dvoj a viac-modulových domoch sú potrebné pásové betónové základy.
          </p>
          <RadioGroup
            value={konfig.zaklady}
            onValueChange={(value) => setKonfig({ ...konfig, zaklady: value })}
          >
            {zaklady.map((zaklad) => (
              <Card
                key={zaklad.id}
                className="p-4 mb-3 cursor-pointer hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={zaklad.id} id={zaklad.id} />
                    <Label htmlFor={zaklad.id} className="font-semibold cursor-pointer">
                      {zaklad.nazov}
                    </Label>
                  </div>
                  <span className="font-bold text-primary">
                    {zaklad.cena === 0 ? "+0€" : `+${zaklad.cena.toLocaleString('sk-SK')}€`} s DPH
                  </span>
                </div>
              </Card>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-lg font-bold mb-4 block">
            Inžiniering stavebného povolenia *
          </Label>
          <RadioGroup
            value={konfig.inziniering}
            onValueChange={(value) => setKonfig({ ...konfig, inziniering: value })}
          >
            <Card className="p-4 mb-3 cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="ano" id="inz_ano" />
                  <Label htmlFor="inz_ano" className="font-semibold cursor-pointer">
                    Áno
                  </Label>
                </div>
                <span className="font-bold text-primary">+3 188€ s DPH</span>
              </div>
            </Card>
            <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="nie" id="inz_nie" />
                <Label htmlFor="inz_nie" className="font-semibold cursor-pointer">
                  Nie
                </Label>
              </div>
            </Card>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-lg font-bold mb-4 block">
            Projektant, Energetická certifikácia *
          </Label>
          <RadioGroup
            value={konfig.projektant}
            onValueChange={(value) => setKonfig({ ...konfig, projektant: value })}
          >
            <Card className="p-4 mb-3 cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="ano" id="proj_ano" />
                  <Label htmlFor="proj_ano" className="font-semibold cursor-pointer">
                    Áno
                  </Label>
                </div>
                <span className="font-bold text-primary">+4 305€ s DPH</span>
              </div>
            </Card>
            <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="nie" id="proj_nie" />
                <Label htmlFor="proj_nie" className="font-semibold cursor-pointer">
                  Nie
                </Label>
              </div>
            </Card>
          </RadioGroup>
        </div>
      </motion.div>
    );
  }

  return null;
}