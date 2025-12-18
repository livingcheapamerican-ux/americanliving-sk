import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function AutoTestGemini() {
  const [testRun, setTestRun] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isSuperAdmin = user?.super_admin === true;

  useEffect(() => {
    if (!isSuperAdmin || testRun) return;

    const runTest = async () => {
      console.log('🔄 Spúšťam automatický test Gemini API...');
      setTestRun(true);

      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          console.log(`📡 Pokus ${attempt}/5...`);
          const response = await base44.functions.invoke('testGeminiAPI', {});
          
          if (response.data.success) {
            console.log('✅ Gemini API funguje!', response.data);
            return;
          } else {
            console.log('❌ Test zlyhal:', response.data);
            if (attempt < 5) {
              console.log('⏳ Čakám 3 sekundy pred ďalším pokusom...');
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        } catch (error) {
          console.error('❌ Chyba pri teste:', error);
          if (attempt < 5) {
            console.log('⏳ Čakám 3 sekundy pred ďalším pokusom...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      console.log('⚠️ Všetky pokusy zlyhali. Skontrolujte konzolu a nastavenia API kľúča.');
    };

    // Spustiť po 2 sekundách (aby sa načítala stránka)
    setTimeout(() => runTest(), 2000);
  }, [isSuperAdmin, testRun]);

  return null;
}