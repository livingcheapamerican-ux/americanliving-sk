import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

/**
 * Tlačidlo "Uložiť do môjho konta" pre konfigurátor
 * Props: domNazov, domKod, domId, celkovaCena, konfiguratorData
 */
export default function SaveQuoteButton({ domNazov, domKod, domId, celkovaCena, konfiguratorData }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    toast.success('✓ Ponuka uložená do vášho konta', {
      description: 'Nájdete ju v sekcii Moje Konto',
      action: {
        label: 'Zobraziť',
        onClick: () => window.location.href = '/MojeKonto'
      }
    });
    setTimeout(() => setSaved(false), 5000);
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
        className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 transition-all"
      >
        <LogIn className="w-4 h-4" />
        Uložiť do konta
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
        saved
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 text-gray-700'
      } disabled:opacity-70`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          Uložené v konte
        </>
      ) : saving ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
          Ukladám...
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          Uložiť do môjho konta
        </>
      )}
    </button>
  );
}