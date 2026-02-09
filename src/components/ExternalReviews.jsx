import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from './LanguageContext';

export default function ExternalReviews({ reviews, domId, manufacturer }) {
  const { language } = useLanguage();

  // Only show for Ticabhouse
  if (manufacturer !== 'Ticab house') return null;

  if (!reviews || reviews.length === 0) return null;

  // Filter reviews for this specific house if domId is provided
  const relevantReviews = domId 
    ? reviews.filter(r => !r.dom_id || r.dom_id === domId)
    : reviews;

  if (relevantReviews.length === 0) return null;

  const getContent = (review) => {
    const langKey = `content_${language}`;
    return review[langKey] || review.content_sk || review.content_en || '';
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
        ⭐ {language === 'en' ? 'What Our Global Clients Say' : 
            language === 'de' ? 'Was unsere Kunden weltweit sagen' :
            language === 'hu' ? 'Mit mondanak ügyfeleink világszerte' :
            language === 'pl' ? 'Co mówią nasi klienci na całym świecie' :
            language === 'fr' ? 'Ce que disent nos clients dans le monde' :
            language === 'it' ? 'Cosa dicono i nostri clienti nel mondo' :
            language === 'cz' ? 'Co říkají naši klienti po celém světě' :
            language === 'uk' ? 'Що говорять наші клієнти у світі' :
            'Čo hovoria klienti vo svete'}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {relevantReviews.map((review) => (
          <Card key={review.id} className="p-4 sm:p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm sm:text-base">{review.author_name}</p>
                <Badge className="mt-1 text-xs bg-blue-100 text-blue-800 border-blue-300">
                  {review.source_label}
                </Badge>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic">
              "{getContent(review)}"
            </p>
            {review.verified && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  ✓ {language === 'en' ? 'Verified Review' : 
                      language === 'de' ? 'Verifizierte Bewertung' :
                      language === 'hu' ? 'Ellenőrzött vélemény' :
                      language === 'pl' ? 'Zweryfikowana opinia' :
                      language === 'fr' ? 'Avis vérifié' :
                      language === 'it' ? 'Recensione verificata' :
                      language === 'cz' ? 'Ověřená recenze' :
                      language === 'uk' ? 'Перевірений відгук' :
                      'Overená recenzia'}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}