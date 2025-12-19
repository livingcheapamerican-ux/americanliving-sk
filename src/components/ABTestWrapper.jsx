import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

/**
 * A/B Test Wrapper Component
 * Automaticky vyberie variantu A alebo B pre používateľa
 * a sleduje konverzie
 */
export default function ABTestWrapper({ testType, children }) {
  const [variant, setVariant] = useState(null);
  const [testId, setTestId] = useState(null);

  // Načítať aktívny test pre daný typ
  const { data: tests } = useQuery({
    queryKey: ['ab-tests', testType],
    queryFn: () => base44.entities.ABTest.filter({ 
      typ: testType, 
      aktivny: true 
    }),
    enabled: !!testType
  });

  useEffect(() => {
    if (tests && tests.length > 0) {
      const activeTest = tests[0];
      setTestId(activeTest.id);

      // Skontrolovať, či používateľ už má priradenú variantu
      const savedVariant = localStorage.getItem(`abtest_${activeTest.id}`);
      
      if (savedVariant) {
        setVariant(savedVariant);
      } else {
        // Náhodne priradiť variantu (50/50)
        const newVariant = Math.random() < 0.5 ? 'a' : 'b';
        setVariant(newVariant);
        localStorage.setItem(`abtest_${activeTest.id}`, newVariant);

        // Zaznamenať zobrazenie
        trackImpression(activeTest.id, newVariant);
      }
    }
  }, [tests]);

  const trackImpression = async (id, variant) => {
    try {
      const test = await base44.entities.ABTest.filter({ id }).then(r => r[0]);
      if (test) {
        const stats = variant === 'a' ? test.statistiky_a : test.statistiky_b;
        const updatedStats = {
          ...stats,
          zobrazenia: (stats?.zobrazenia || 0) + 1
        };

        await base44.entities.ABTest.update(id, {
          [variant === 'a' ? 'statistiky_a' : 'statistiky_b']: updatedStats
        });
      }
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackConversion = async () => {
    if (!testId || !variant) return;

    try {
      const test = await base44.entities.ABTest.filter({ id: testId }).then(r => r[0]);
      if (test) {
        const stats = variant === 'a' ? test.statistiky_a : test.statistiky_b;
        const updatedStats = {
          ...stats,
          konverzie: (stats?.konverzie || 0) + 1,
          miera_konverzie: ((stats?.konverzie || 0) + 1) / (stats?.zobrazenia || 1) * 100
        };

        await base44.entities.ABTest.update(testId, {
          [variant === 'a' ? 'statistiky_a' : 'statistiky_b']: updatedStats
        });
      }
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  // Poskytnúť kontext pre child komponenty
  return (
    <ABTestContext.Provider value={{ variant, trackConversion, testId }}>
      {children}
    </ABTestContext.Provider>
  );
}

// Context pre zdieľanie stavu
export const ABTestContext = React.createContext({
  variant: null,
  trackConversion: () => {},
  testId: null
});

// Hook pre použitie v komponentoch
export const useABTest = () => React.useContext(ABTestContext);