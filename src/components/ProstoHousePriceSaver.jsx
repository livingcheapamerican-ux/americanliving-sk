import React, { useState } from "react";
import { Save, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProstoHousePriceSaver({ isAdmin, customPrices, domId, houseCode }) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  if (!isAdmin) return null;

  const savePrices = async () => {
    setIsSaving(true);
    try {
      const domy = await base44.entities.Dom.filter({ id: domId });
      const dom = domy[0];
      
      if (!dom) {
        toast.error('Dom nenájdený v databáze');
        return;
      }

      await base44.entities.Dom.update(domId, {
        konfigurator_custom_ceny_prosto_house: {
          ...dom.konfigurator_custom_ceny_prosto_house,
          [houseCode]: customPrices
        }
      });

      queryClient.invalidateQueries({ queryKey: ['dom-' + houseCode.toLowerCase()] });
      toast.success('✓ Ceny boli úspešne uložené!');
    } catch (error) {
      console.error('Chyba pri ukladaní cien:', error);
      toast.error('Chyba pri ukladaní: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-40 hidden md:block animate-in slide-in-from-right duration-300">
      <Button
        onClick={savePrices}
        disabled={isSaving || Object.keys(customPrices).length === 0}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-xl shadow-green-400/50 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all px-6 py-6 text-base"
      >
        {isSaving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Ukladám...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Uložiť ceny
          </>
        )}
      </Button>
      
      {Object.keys(customPrices).length > 0 && !isSaving && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800 text-center">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          {Object.keys(customPrices).length} zmenených cien
        </div>
      )}
    </div>
  );
}