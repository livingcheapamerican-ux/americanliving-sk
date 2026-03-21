import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  Users, FileText, MessageCircle, Calendar, Search, Filter,
  ChevronRight, CheckCircle, AlertCircle, Clock, XCircle,
  Eye, Shield, Home, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  ulozena: { label: 'Uložená', color: 'bg-gray-100 text-gray-700' },
  odoslana_na_posudenie: { label: 'Na posúdenie', color: 'bg-blue-100 text-blue-700' },
  cakajuca_na_vyjadrenie: { label: 'Čaká na vyjadrenie', color: 'bg-yellow-100 text-yellow-700' },
  schvalena_adminom: { label: 'Schválená', color: 'bg-green-100 text-green-700' },
  s_komentarmi_admina: { label: 'S komentármi', color: 'bg-orange-100 text-orange-700' },
  zamietnuta_adminom: { label: 'Zamietnutá', color: 'bg-red-100 text-red-700' },
  akceptovana_klientom: { label: 'Akceptovaná klientom', color: 'bg-emerald-100 text-emerald-700' },
  odmietnuta_klientom: { label: 'Odmietnutá klientom', color: 'bg-gray-100 text-gray-500' },
};

export default function AdminMojeKonto() {
  const [activeTab, setActiveTab] = useState('prehled');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allQuotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ['all-saved-quotes'],
    queryFn: () => base44.entities.SavedQuote.list('-created_date', 200)
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['all-consultations'],
    queryFn: () => base44.entities.Consultation.list('-created_date', 100)
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin' || user?.super_admin;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Prístup zamietnutý</p>
        </div>
      </div>
    );
  }

  const filteredQuotes = allQuotes.filter(q => {
    const matchSearch = !search || q.dom_nazov?.toLowerCase().includes(search.toLowerCase()) || q.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: allQuotes.length,
    pending: allQuotes.filter(q => q.status === 'odoslana_na_posudenie').length,
    approved: allQuotes.filter(q => q.status === 'schvalena_adminom').length,
    consultations: consultations.filter(c => c.status === 'nova').length
  };

  const tabs = [
    { id: 'prehled', label: 'Prehľad', icon: TrendingUp },
    { id: 'ponuky', label: `Ponuky (${allQuotes.length})`, icon: FileText },
    { id: 'konzultacie', label: `Konzultácie (${consultations.filter(c => c.status === 'nova').length})`, icon: Calendar },
    { id: 'uzivatelia', label: `Používatelia (${allUsers.length})`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold">Admin – Moje Konto Dashboard</h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Celkom ponúk', value: stats.total, color: 'from-blue-500 to-blue-600' },
              { label: 'Na posúdenie', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
              { label: 'Schválených', value: stats.approved, color: 'from-green-500 to-green-600' },
              { label: 'Nové konzultácie', value: stats.consultations, color: 'from-purple-500 to-purple-600' },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4`}>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs text-white/80 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-10 z-20">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* TAB: Prehľad */}
        {activeTab === 'prehled' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Najnovšie ponuky na posúdenie</h2>
            {allQuotes.filter(q => q.status === 'odoslana_na_posudenie').slice(0, 5).map(quote => (
              <AdminQuoteRow key={quote.id} quote={quote} queryClient={queryClient} />
            ))}
            {allQuotes.filter(q => q.status === 'odoslana_na_posudenie').length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white rounded-xl border">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Všetky ponuky sú spracované</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Ponuky */}
        {activeTab === 'ponuky' && (
          <div>
            {/* Filtre */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Hľadať podľa mena alebo emailu..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none"
              >
                <option value="all">Všetky statusy</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {loadingQuotes ? (
              <div className="text-center py-8 text-gray-400">Načítavam...</div>
            ) : (
              <div className="space-y-2">
                {filteredQuotes.map(quote => (
                  <AdminQuoteRow key={quote.id} quote={quote} queryClient={queryClient} />
                ))}
                {filteredQuotes.length === 0 && (
                  <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Žiadne ponuky nenájdené</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: Konzultácie */}
        {activeTab === 'konzultacie' && (
          <div className="space-y-3">
            {consultations.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Žiadne konzultácie</p>
              </div>
            ) : (
              consultations.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{c.user_name || c.user_email}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {c.typ === 'video_hovor' ? '📹 Video hovor' : '📞 Telefonát'} • {new Date(c.pozadovany_termin).toLocaleString('sk-SK')}
                    </div>
                    {c.poznamka && <div className="text-xs text-gray-400 mt-1">{c.poznamka}</div>}
                    {c.telefon && <div className="text-xs text-gray-500 mt-0.5">📱 {c.telefon}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.status === 'potvrdena' ? 'bg-green-100 text-green-700' :
                      c.status === 'nova' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'dokoncena' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {c.status === 'nova' ? 'Nová' : c.status === 'potvrdena' ? 'Potvrdená' : c.status === 'zrusena' ? 'Zrušená' : 'Dokončená'}
                    </span>
                    <select
                      value={c.status}
                      onChange={async e => {
                        await base44.entities.Consultation.update(c.id, { status: e.target.value });
                        queryClient.invalidateQueries({ queryKey: ['all-consultations'] });
                        toast.success('Status konzultácie zmenený');
                      }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="nova">Nová</option>
                      <option value="potvrdena">Potvrdiť</option>
                      <option value="zrusena">Zrušiť</option>
                      <option value="dokoncena">Dokončená</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Používatelia */}
        {activeTab === 'uzivatelia' && (
          <div className="space-y-2">
            {allUsers.map(u => {
              const userQuotes = allQuotes.filter(q => q.user_id === u.id);
              return (
                <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                      {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{u.full_name || '–'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center hidden sm:block">
                      <div className="font-bold text-gray-900">{userQuotes.length}</div>
                      <div className="text-xs text-gray-400">ponúk</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{u.role || 'user'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminQuoteRow({ quote, queryClient }) {
  const [changing, setChanging] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });
  const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.ulozena;

  const changeStatus = async (newStatus) => {
    setChanging(true);
    await base44.entities.SavedQuote.update(quote.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['all-saved-quotes'] });
    setChanging(false);
    toast.success('Status zmenený');
  };

  const addAdminComment = async () => {
    if (!newComment.trim()) return;
    await base44.entities.QuoteComment.create({
      cenova_ponuka_id: quote.id,
      user_id: user?.id || 'admin',
      user_name: user?.full_name || 'Admin',
      comment_text: newComment,
      is_admin_comment: true
    });
    if (quote.status === 'odoslana_na_posudenie') {
      await base44.entities.SavedQuote.update(quote.id, { status: 's_komentarmi_admina' });
    }
    setNewComment('');
    queryClient.invalidateQueries({ queryKey: ['all-saved-quotes'] });
    toast.success('Komentár pridaný');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{quote.dom_nazov}</span>
            {quote.dom_kod && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{quote.dom_kod}</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{quote.user_email} • {new Date(quote.created_date).toLocaleDateString('sk-SK')}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-gray-900 text-sm">{quote.celkova_cena?.toLocaleString()} €</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
          {/* Rýchla zmena statusu */}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Zmeniť status:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  disabled={changing || quote.status === key}
                  onClick={() => changeStatus(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    quote.status === key
                      ? `${cfg.color} border-current opacity-100`
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                  } disabled:opacity-50`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dokumenty */}
          {quote.dokumenty?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Dokumenty ({quote.dokumenty.length}):</div>
              <div className="flex flex-wrap gap-2">
                {quote.dokumenty.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-red-300 transition-colors">
                    <FileText className="w-3 h-3 text-red-500" />
                    {doc.nazov}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Územný plán */}
          {quote.uzemny_plan?.obec && (
            <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-blue-800">📍 Pozemok: {quote.uzemny_plan.obec}</div>
              {quote.uzemny_plan.cislo_pozemku && <div className="text-blue-600">Parc. č.: {quote.uzemny_plan.cislo_pozemku}</div>}
              {quote.uzemny_plan.vymera && <div className="text-blue-600">Výmera: {quote.uzemny_plan.vymera} m²</div>}
            </div>
          )}

          {/* Admin komentár */}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Pridať komentár pre klienta:</div>
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Napíšte komentár – klient ho uvidí vo svojom konte..."
                rows={2}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-400 outline-none resize-none bg-white"
              />
              <Button onClick={addAdminComment} size="sm" disabled={!newComment.trim()} className="bg-red-600 hover:bg-red-700 text-white self-end">
                Odoslať
              </Button>
            </div>
          </div>

          {/* Link na detail */}
          <Link to={`/MojaPonuka/${quote.id}`} className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium">
            <Eye className="w-3.5 h-3.5" />
            Otvoriť plný detail ponuky
          </Link>
        </div>
      )}
    </div>
  );
}