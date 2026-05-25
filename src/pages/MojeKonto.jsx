import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { FileText, MessageCircle, Calendar, Home, ChevronRight, Plus, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../components/LanguageContext';
import { useAccountT } from '../components/translations/AccountTranslations';

export default function MojeKonto() {
  const [activeTab, setActiveTab] = useState('ponuky');
  const { language } = useLanguage();
  const t = useAccountT(language);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedQuotes = [], isLoading } = useQuery({
    queryKey: ['saved-quotes', user?.id],
    queryFn: () => base44.entities.SavedQuote.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations', user?.id],
    queryFn: () => base44.entities.Consultation.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id
  });

  const STATUS_CONFIG = {
    ulozena: { label: t('statusUlozena'), color: 'bg-gray-100 text-gray-700', icon: Clock },
    odoslana_na_posudenie: { label: t('statusOdoslanaNaPosudenie'), color: 'bg-blue-100 text-blue-700', icon: Clock },
    cakajuca_na_vyjadrenie: { label: t('statusCakajucaNaVyjadrenie'), color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    schvalena_adminom: { label: t('statusSchvalenaAdminom'), color: 'bg-green-100 text-green-700', icon: CheckCircle },
    s_komentarmi_admina: { label: t('statusSKomentarmiAdmina'), color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    zamietnuta_adminom: { label: t('statusZamietnutaAdminom'), color: 'bg-red-100 text-red-700', icon: XCircle },
    akceptovana_klientom: { label: t('statusAkceptovanaKlientom'), color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    odmietnuta_klientom: { label: t('statusOdmietnutaKlientom'), color: 'bg-gray-100 text-gray-500', icon: XCircle },
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'ponuky', label: t('tabMyQuotes'), icon: FileText, count: savedQuotes.length },
    { id: 'chat', label: t('tabSupport'), icon: MessageCircle },
    { id: 'konzultacie', label: t('tabConsultations'), icon: Calendar, count: consultations.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {(user?.role === 'admin' || user?.super_admin) && (
        <div className="bg-red-600 text-white text-center py-2 px-4 flex justify-center items-center gap-4 text-sm font-medium">
          <span>Režim administrátora aktívny</span>
          <Link to="/admin-moje-konto" className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm">
            Prejsť do Admin Dashboardu →
          </Link>
          <Link to="/admin-znalostna-baza" className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm">
            🧠 AI Znalostná Báza
          </Link>
        </div>
      )}
      {/* Hero header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold">
              {user.full_name?.[0]?.toUpperCase() || 'K'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.full_name || user.email}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{savedQuotes.length}</div>
              <div className="text-xs text-gray-400 mt-1">{t('savedQuotesCount')}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">
                {savedQuotes.filter(q => q.status === 'schvalena_adminom').length}
              </div>
              <div className="text-xs text-gray-400 mt-1">{t('approvedCount')}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{consultations.length}</div>
              <div className="text-xs text-gray-400 mt-1">{t('consultationsCount')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-10 z-30">
        <div className="max-w-5xl mx-auto flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* TAB: Ponuky */}
        {activeTab === 'ponuky' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('myQuotesTitle')}</h2>
              <Link to="/katalog">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  {t('newConfiguration')}
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-400">{t('loadingQuotes')}</div>
            ) : savedQuotes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">{t('noQuotesTitle')}</p>
                <p className="text-gray-400 text-sm mt-1 mb-4">{t('noQuotesDesc')}</p>
                <Link to="/katalog">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">{t('goToCatalog')}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedQuotes.map(quote => {
                  const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.ulozena;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <Link key={quote.id} to={`/MojaPonuka/${quote.id}`}>
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-red-200 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                {quote.dom_nazov}
                              </h3>
                              {quote.dom_kod && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {quote.dom_kod}
                                </span>
                              )}
                            </div>
                            <p className="text-2xl font-black text-gray-900">
                              {quote.celkova_cena?.toLocaleString()} €
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {t('savedOn')} {new Date(quote.created_date).toLocaleDateString('sk-SK')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {quote.dokumenty?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {quote.dokumenty.length} dok.
                                </span>
                              )}
                              {quote.conversation_id && (
                                <MessageCircle className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </div>
                        </div>

                        {quote.status === 's_komentarmi_admina' && (
                          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {t('adminCommentAlert')}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Chat / Podpora */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('supportTitle')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('supportDesc')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 group-hover:text-red-600">{t('aiChatbot')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('instantAnswers')}</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('konzultacie')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 group-hover:text-blue-600">{t('liveSupport')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('bookCallSlot')}</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB: Konzultácie */}
        {activeTab === 'konzultacie' && (
          <ConsultationTab user={user} consultations={consultations} t={t} />
        )}
      </div>
    </div>
  );
}

function ConsultationTab({ user, consultations, t }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ typ: 'video_hovor', pozadovany_termin: '', telefon: '', poznamka: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Consultation.create({
      ...form,
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name
    });
    setSaving(false);
    setShowForm(false);
    window.location.reload();
  };

  const consultationStatusLabel = (status) => {
    if (status === 'nova') return t('consultationStatusNova');
    if (status === 'potvrdena') return t('consultationStatusPotvrdena');
    if (status === 'zrusena') return t('consultationStatusZrusena');
    return t('consultationStatusDokoncena');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{t('consultationsTitle')}</h2>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          {t('bookSlot')}
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{t('bookConsultation')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultationType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'video_hovor', label: t('videoCall') },
                    { value: 'telefonicky_hovor', label: t('phoneCall') }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, typ: opt.value })}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.typ === opt.value ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('preferredTime')}</label>
                <input
                  type="datetime-local"
                  required
                  value={form.pozadovany_termin}
                  onChange={e => setForm({ ...form, pozadovany_termin: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={e => setForm({ ...form, telefon: e.target.value })}
                  placeholder="+421..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('note')}</label>
                <textarea
                  value={form.poznamka}
                  onChange={e => setForm({ ...form, poznamka: e.target.value })}
                  rows={2}
                  placeholder={t('notePlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  {t('cancel')}
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-50">
                  {saving ? t('bookingInProgress') : t('book')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {consultations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t('noConsultationsTitle')}</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">{t('noConsultationsDesc')}</p>
          <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
            {t('bookSlot')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {c.typ === 'video_hovor' ? t('videoCall') : t('phoneCall')}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {new Date(c.pozadovany_termin).toLocaleString('sk-SK')}
                  </div>
                  {c.poznamka && <div className="text-xs text-gray-400 mt-1">{c.poznamka}</div>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  c.status === 'potvrdena' ? 'bg-green-100 text-green-700' :
                  c.status === 'zrusena' ? 'bg-red-100 text-red-700' :
                  c.status === 'dokoncena' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {consultationStatusLabel(c.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}