import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "./LanguageContext";

/**
 * Personalizované odporúčania domov
 * Zobrazuje odporúčania na základe správania používateľa
 */
export default function PersonalizedRecommendations() {
  const { t } = useLanguage();
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Získať alebo vytvoriť session ID
    let sid = localStorage.getItem('user_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Načítať preferencie používateľa
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', sessionId],
    queryFn: () => base44.entities.UserPreferences.filter({ session_id: sessionId }).then(r => r[0]),
    enabled: !!sessionId
  });

  // Načítať odporúčané domy
  const { data: recommendedHouses } = useQuery({
    queryKey: ['recommended-houses', preferences?.odporucane_domy],
    queryFn: async () => {
      if (!preferences?.odporucane_domy || preferences.odporucane_domy.length === 0) {
        // Fallback: načítať populárne domy
        return base44.entities.Dom.filter({ popularny: true, verejny: true }).then(r => r.slice(0, 3));
      }
      
      // Načítať odporúčané domy
      const houses = await Promise.all(
        preferences.odporucane_domy.slice(0, 3).map(id => 
          base44.entities.Dom.filter({ id }).then(r => r[0])
        )
      );
      return houses.filter(h => h);
    },
    enabled: !!preferences
  });

  if (!recommendedHouses || recommendedHouses.length === 0) {
    return null;
  }

  return (
    <div className="my-12 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">
          {preferences?.ai_skore > 50 ? t('speciallyForYou') || 'Špeciálne pre vás' : t('popularChoices') || 'Populárne voľby'}
        </h2>
        {preferences?.ai_skore > 50 && (
          <span className="flex items-center gap-1 text-sm text-gray-600 bg-primary/10 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            {t('basedOnYourActivity') || 'Na základe vašej aktivity'}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {recommendedHouses.map((house) => (
          <Link key={house.id} to={`${createPageUrl("DetailDomu")}?id=${house.id}`}>
            <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary">
              <div className="relative overflow-hidden">
                <img
                  src={house.hlavny_obrazok}
                  alt={house.nazov}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {t('recommended') || 'Odporúčané'}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{house.nazov}</CardTitle>
                <p className="text-sm text-gray-600">{house.vyrobca}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">{t('area') || 'Plocha'}</p>
                    <p className="font-semibold">{house.uzitkova_plocha} m²</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('from') || 'Od'}</p>
                    <p className="font-semibold text-primary">
                      {house.zakladna_cena?.toLocaleString()} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}