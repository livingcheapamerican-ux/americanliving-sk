import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Upload, MessageCircle, Calendar, CheckCircle,
  AlertCircle, Clock, XCircle, Send, MapPin, Paperclip, Download,
  User, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import PH008QuoteSummary from '../components/konfigurator/PH008QuoteSummary';

const STATUS_CONFIG = {
  ulozena: { label: 'Uložená', color: 'bg-gray-100 text-gray-700', icon: Clock },
  odoslana_na_posudenie: { label: 'Odoslaná na posúdenie', color: 'bg-blue-100 text-blue-700', icon: Clock },
  cakajuca_na_vyjadrenie: { label: 'Čaká na vyjadrenie', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  schvalena_adminom: { label: 'Schválená', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  s_komentarmi_admina: { label: 'S komentármi', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  zamietnuta_adminom: { label: 'Zamietnutá', color: 'bg-red-100 text-red-700', icon: XCircle },
  akceptovana_klientom: { label: 'Akceptovaná', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  odmietnuta_klientom: { label: 'Odmietnutá klientom', color: 'bg-gray-100 text-gray-500', icon: XCircle },
};

export default function MojaPonuka() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('detail');
  const [newComment, setNewComment] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showUzemnyForm, setShowUzemnyForm] = useState(false);
  const [uzemnyData, setUzemnyData] = useState({
    obec: '', katastralne_uzemie: '', cislo_pozemku: '', vymera: '', gps_lat: '', gps_lng: '', poznamka: ''
  });
  const [savingUzemny, setSavingUzemny] = useState(false);
  const fileInputRef = useRef();
  const uzemnyFileRef = useRef();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin;

  const { data: quote, isLoading } = useQuery({
    queryKey: ['saved-quote', id],
    queryFn: () => base44.entities.SavedQuote.filter({ id }),
    select: data => data[0],
    enabled: !!id
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['quote-comments', id],
    queryFn: () => base44.entities.QuoteComment.filter({ cenova_ponuka_id: id }, 'created_date'),
    enabled: !!id
  });

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (quote?.conversation_id) {
      base44.agents.getConversation(quote.conversation_id).then(conv => {
        setConversation(conv);
        setMessages(conv.messages || []);
      });
    }
  }, [quote?.conversation_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const text = chatInput;
    setChatInput('');
    setChatLoading(true);

    let conv = conversation;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: 'american_living_assistant',
        metadata: { user_id: user?.id, saved_quote_id: id, dom_nazov: quote?.dom_nazov }
      });
      await base44.entities.SavedQuote.update(id, { conversation_id: conv.id });
      setConversation(conv);
      queryClient.invalidateQueries({ queryKey: ['saved-quote', id] });
    }

    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });

    await base44.agents.addMessage(conv, { role: 'user', content: text });
    setChatLoading(false);
    setTimeout(() => unsubscribe(), 15000);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    await base44.entities.QuoteComment.create({
      cenova_ponuka_id: id,
      user_id: user.id,
      user_name: user.full_name || user.email,
      comment_text: newComment,
      is_admin_comment: isAdmin
    });
    setNewComment('');
    queryClient.invalidateQueries({ queryKey: ['quote-comments', id] });
  };

  const uploadDocument = async (file) => {
    if (!file) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updatedDocs = [...(quote.dokumenty || []), {
      nazov: file.name,
      url: file_url,
      typ: file.type,
      velkost: file.size,
      datum: new Date().toISOString()
    }];
    await base44.entities.SavedQuote.update(id, { dokumenty: updatedDocs });
    queryClient.invalidateQueries({ queryKey: ['saved-quote', id] });
    setUploadingDoc(false);
    toast.success('Dokument nahraný');
  };

  const saveUzemnyPlan = async (file) => {
    setSavingUzemny(true);
    let fileUrl = quote?.uzemny_plan?.subor_url || null;
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      fileUrl = file_url;
    }
    await base44.entities.SavedQuote.update(id, {
      uzemny_plan: {
        ...uzemnyData,
        vymera: uzemnyData.vymera ? parseFloat(uzemnyData.vymera) : undefined,
        gps_lat: uzemnyData.gps_lat ? parseFloat(uzemnyData.gps_lat) : undefined,
        gps_lng: uzemnyData.gps_lng ? parseFloat(uzemnyData.gps_lng) : undefined,
        subor_url: fileUrl,
        analyza_status: 'cakajuca'
      }
    });
    queryClient.invalidateQueries({ queryKey: ['saved-quote', id] });
    setShowUzemnyForm(false);
    setSavingUzemny(false);
    toast.success('Územný plán uložený – bude skontrolovaný naším tímom');
  };

  const changeStatus = async (newStatus) => {
    await base44.entities.SavedQuote.update(id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['saved-quote', id] });
    toast.success('Status zmenený');
  };

  if (isLoading || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.ulozena;
  const StatusIcon = statusCfg.icon;

  const tabs = [
    { id: 'detail', label: 'Detail ponuky', icon: FileText },
    { id: 'dokumenty', label: 'Dokumenty', icon: Paperclip },
    { id: 'chat', label: 'Chat s poradcom', icon: MessageCircle },
    { id: 'komentare', label: 'Komentáre', icon: MessageCircle },
  ];

  // Detekcia PH-008 ponuky — podľa dom_kod alebo dom_nazov
  const isPH008 = quote.dom_kod === 'PH-008' || (quote.dom_nazov || '').includes('PH-008') || (quote.dom_nazov || '').includes('Barn 48');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/MojeKonto" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Späť na Moje konto
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">{quote.dom_nazov}</h1>
              {quote.dom_kod && <span className="text-gray-400 text-sm">{quote.dom_kod}</span>}
              <div className="text-3xl font-black mt-1">{quote.celkova_cena?.toLocaleString()} €</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusCfg.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusCfg.label}
              </span>
              {!isAdmin && quote.status === 'ulozena' && (
                <Button size="sm" onClick={() => changeStatus('odoslana_na_posudenie')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Odoslať na posúdenie
                </Button>
              )}
              {!isAdmin && quote.status === 'schvalena_adminom' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => changeStatus('akceptovana_klientom')} className="bg-green-600 hover:bg-green-700 text-white text-xs">Akceptovať</Button>
                  <Button size="sm" onClick={() => changeStatus('odmietnuta_klientom')} variant="outline" className="text-xs">Odmietnuť</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-10 z-20">
        <div className="max-w-4xl mx-auto flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'komentare' && comments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-600">{comments.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* TAB: Detail */}
        {activeTab === 'detail' && (
          <div className="space-y-4">

            {/* Konfigurácia – PH-008 dostane pekný súhrn, ostatné raw tabuľku */}
            {quote.konfigurator_data && (
              isPH008 ? (
                <PH008QuoteSummary
                  konfiguratorData={quote.konfigurator_data}
                  celkovaCena={quote.celkova_cena}
                  language={quote.konfigurator_data.language || 'sk'}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Konfigurácia</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(quote.konfigurator_data).map(([key, val]) => (
                      typeof val !== 'object' && (
                        <div key={key} className="flex justify-between text-sm py-2 border-b border-gray-50">
                          <span className="text-gray-500">{key}</span>
                          <span className="font-medium text-gray-900">{String(val)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Územný plán */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Územný plán a pozemok
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Nahrajte údaje o pozemku pre overenie</p>
                </div>
                <Button size="sm" onClick={() => { setShowUzemnyForm(!showUzemnyForm); if (quote.uzemny_plan) setUzemnyData(quote.uzemny_plan); }} variant="outline" className="text-xs">
                  {quote.uzemny_plan ? 'Upraviť' : 'Pridať údaje'}
                </Button>
              </div>

              {quote.uzemny_plan?.obec ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Obec:</span><span className="font-medium">{quote.uzemny_plan.obec}</span></div>
                  {quote.uzemny_plan.katastralne_uzemie && <div className="flex justify-between"><span className="text-gray-500">Katastrálne územie:</span><span className="font-medium">{quote.uzemny_plan.katastralne_uzemie}</span></div>}
                  {quote.uzemny_plan.cislo_pozemku && <div className="flex justify-between"><span className="text-gray-500">Číslo pozemku:</span><span className="font-medium">{quote.uzemny_plan.cislo_pozemku}</span></div>}
                  {quote.uzemny_plan.vymera && <div className="flex justify-between"><span className="text-gray-500">Výmera:</span><span className="font-medium">{quote.uzemny_plan.vymera} m²</span></div>}
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Analýza:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      quote.uzemny_plan.analyza_status === 'dokoncena' ? 'bg-green-100 text-green-700' :
                      quote.uzemny_plan.analyza_status === 'v_procese' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {quote.uzemny_plan.analyza_status === 'cakajuca' ? 'Čaká na kontrolu' :
                       quote.uzemny_plan.analyza_status === 'v_procese' ? 'V procese' : 'Dokončená'}
                    </span>
                  </div>
                  {quote.uzemny_plan.analyza_vysledok && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg text-xs text-green-800">{quote.uzemny_plan.analyza_vysledok}</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Zatiaľ neboli pridané údaje o pozemku
                </div>
              )}

              {showUzemnyForm && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { key: 'obec', label: 'Obec / Mesto', placeholder: 'napr. Bratislava' },
                      { key: 'katastralne_uzemie', label: 'Katastrálne územie', placeholder: 'napr. Petržalka' },
                      { key: 'cislo_pozemku', label: 'Číslo pozemku', placeholder: 'napr. 1234/5' },
                      { key: 'vymera', label: 'Výmera (m²)', placeholder: 'napr. 800' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                        <input
                          type={field.key === 'vymera' ? 'number' : 'text'}
                          value={uzemnyData[field.key] || ''}
                          onChange={e => setUzemnyData({ ...uzemnyData, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Poznámka</label>
                    <textarea
                      value={uzemnyData.poznamka || ''}
                      onChange={e => setUzemnyData({ ...uzemnyData, poznamka: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nahrať súbor územného plánu (PDF/obrázok)</label>
                    <input ref={uzemnyFileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                      onChange={e => saveUzemnyPlan(e.target.files[0])} />
                    <div className="flex gap-2">
                      <button onClick={() => saveUzemnyPlan(null)} disabled={savingUzemny}
                        className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                        {savingUzemny ? 'Ukladám...' : 'Uložiť údaje'}
                      </button>
                      <button onClick={() => uzemnyFileRef.current?.click()}
                        className="px-4 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-200">
                        + súbor
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Poznámka klienta */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Moja poznámka k ponuke</h3>
              <QuoteNoteEditor quoteId={id} initialNote={quote.poznamka_klienta} />
            </div>
          </div>
        )}

        {/* TAB: Dokumenty */}
        {activeTab === 'dokumenty' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Dokumenty k ponuke</h3>
                <p className="text-xs text-gray-400 mt-0.5">Zmluvy, stavebné povolenia, plány...</p>
              </div>
              <div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={e => uploadDocument(e.target.files[0])} />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}
                  className="bg-red-600 hover:bg-red-700 text-white gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  {uploadingDoc ? 'Nahrávam...' : 'Nahrať dokument'}
                </Button>
              </div>
            </div>
            {(!quote.dokumenty || quote.dokumenty.length === 0) ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Zatiaľ neboli nahrané žiadne dokumenty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quote.dokumenty.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{doc.nazov}</div>
                      <div className="text-xs text-gray-400">
                        {doc.datum ? new Date(doc.datum).toLocaleDateString('sk-SK') : ''} • {doc.velkost ? Math.round(doc.velkost / 1024) + ' KB' : ''}
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Chat */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">AI Poradca – {quote.dom_nazov}</div>
                <div className="text-xs text-gray-400">Opýtajte sa na technické detaily, konfiguráciu alebo proces</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Začnite konverzáciu – opýtajte sa na čokoľvek</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {['Aké sú technické parametre?', 'Ako dlho trvá výstavba?', 'Čo je zahrnuté v cene?'].map(q => (
                      <button key={q} onClick={() => setChatInput(q)} className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-full px-3 py-1.5 transition-colors">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.filter(m => m.role !== 'system').map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm max-w-none text-sm">{msg.content}</ReactMarkdown>
                    ) : <p>{msg.content}</p>}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Napíšte správu..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none" />
                <Button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()} className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Komentáre */}
        {activeTab === 'komentare' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Časová os komentárov</h3>
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Zatiaľ žiadne komentáre</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className={`flex gap-3 ${c.is_admin_comment ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.is_admin_comment ? 'bg-red-600' : 'bg-gray-200'}`}>
                        {c.is_admin_comment ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${c.is_admin_comment ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">{c.user_name}</span>
                          {c.is_admin_comment && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Poradca</span>}
                          <span className="text-xs text-gray-400">{new Date(c.created_date).toLocaleString('sk-SK')}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-sm ${c.is_admin_comment ? 'bg-red-50 border border-red-200 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                          {c.comment_text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex gap-2">
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="Napíšte komentár k tejto ponuke..." rows={2}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none" />
                <Button onClick={addComment} disabled={!newComment.trim()} className="bg-red-600 hover:bg-red-700 text-white px-4 self-end rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteNoteEditor({ quoteId, initialNote }) {
  const [note, setNote] = useState(initialNote || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const save = async () => {
    setSaving(true);
    await base44.entities.SavedQuote.update(quoteId, { poznamka_klienta: note });
    queryClient.invalidateQueries({ queryKey: ['saved-quote', quoteId] });
    setSaving(false);
    toast.success('Poznámka uložená');
  };

  return (
    <div className="space-y-2">
      <textarea value={note} onChange={e => setNote(e.target.value)}
        placeholder="Sem si napíšte poznámku k tejto ponuke..." rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none" />
      <Button onClick={save} disabled={saving} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
        {saving ? 'Ukladám...' : 'Uložiť poznámku'}
      </Button>
    </div>
  );
}