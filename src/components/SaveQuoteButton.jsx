import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, LogIn, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';
import { useAccountT } from './translations/AccountTranslations';

export default function SaveQuoteButton({ domNazov, domKod, domId, celkovaCena, konfiguratorData }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { language } = useLanguage();
  const t = useAccountT(language);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const isAuthenticated = !!user;

  const handleSave = async () => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    setSaving(true);
    await base44.entities.SavedQuote.create({
      user_id: user.id,
      user_email: user.email,
      dom_nazov: domNazov,
      dom_kod: domKod || null,
      dom_id: domId || null,
      celkova_cena: celkovaCena,
      konfigurator_data: konfiguratorData || {},
      status: 'ulozena'
    });
    setSaving(false);
    setSaved(true);
    toast.success(t('quoteSavedTitle'), {
      description: t('quoteSavedDesc'),
      action: {
        label: t('show'),
        onClick: () => window.location.href = '/MojeKonto'
      }
    });
    setTimeout(() => setSaved(false), 5000);
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
        className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
      >
        <LogIn className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">Uložiť cenovú ponuku do konta</span>
        <span className="sm:hidden">Uložiť</span>
      </button>
    );
  }

  if (saved) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-bold shadow-md"
      >
        <BookmarkCheck className="w-4 h-4 flex-shrink-0 animate-bounce" />
        <span className="hidden sm:inline">Uložené ✓</span>
        <span className="sm:hidden">✓</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 overflow-hidden
        bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white
        disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {!saving && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-amber-400 opacity-20 pointer-events-none" />
      )}

      {saving ? (
        <>
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
          <span className="hidden sm:inline">Ukladám...</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Uložiť cenovú ponuku do konta</span>
          <span className="sm:hidden">Uložiť</span>
        </>
      )}
    </button>
  );
}