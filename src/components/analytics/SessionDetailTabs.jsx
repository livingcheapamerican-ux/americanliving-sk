import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Navigation, Clock, MousePointer, Layers, AlertTriangle } from "lucide-react";
import { formatDuration, safeFormat, getDeviceIcon, WebVital } from "./sessionUtils";

const SectionTitle = ({ children }) => (
  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">{children}</h5>
);

const Empty = ({ children }) => (
  <p className="text-xs text-slate-400 italic text-center py-8">{children}</p>
);

const Fact = ({ label, children }) => (
  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
    <p className="text-[10px] text-slate-500 font-bold mb-0.5">{label}</p>
    <div className="text-xs font-extrabold text-slate-900 truncate">{children}</div>
  </div>
);

export default function SessionDetailTabs({ session, onOpenClickMap }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Prehľad & Tech', icon: Monitor },
    { id: 'path', label: 'Cesta', icon: Navigation, count: session.pages_visited?.length || 0 },
    { id: 'engagement', label: 'Záujem', icon: Clock },
    { id: 'clicks', label: 'Kliknutia', icon: MousePointer, count: session.clicks?.length || 0 },
    { id: 'configurator', label: 'Akcie & Formuláre', icon: Layers },
    { id: 'diagnostics', label: 'Diagnostika', icon: AlertTriangle, count: session.errors_encountered?.length || 0, badgeColor: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[420px]">
      <div className="w-full md:w-56 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-2 flex md:flex-col gap-1 overflow-x-auto shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all text-left w-full whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-black ${
                  isActive ? 'bg-indigo-800 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                }`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-white text-slate-800">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <SectionTitle>Zariadenie & technické informácie</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                <Fact label="Typ zariadenia">
                  <span className="flex items-center gap-1.5 capitalize">
                    {getDeviceIcon(session.device_info?.device_type)}
                    {session.device_info?.device_type || 'Neznáme'}
                  </span>
                </Fact>
                <Fact label="Prehliadač">{session.device_info?.browser || 'Neznámy'} {session.device_info?.browser_version || ''}</Fact>
                <Fact label="Operačný systém">{session.device_info?.os || 'Neznámy'} {session.device_info?.os_version || ''}</Fact>
                <Fact label="Obrazovka">
                  {session.device_info?.screen_width ? `${session.device_info.screen_width}×${session.device_info.screen_height}` : 'N/A'}
                </Fact>
                <Fact label="Časové pásmo">{session.device_info?.timezone || 'N/A'}</Fact>
                <Fact label="Jazyk">{session.device_info?.language || session.language || 'N/A'}</Fact>
                <Fact label="Dotykový displej">{session.device_info?.is_touch ? 'Áno' : 'Nie'}</Fact>
              </div>
            </div>

            {session.performance_metrics?.recorded && (
              <div>
                <SectionTitle>Web Vitals (rýchlosť načítania)</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <WebVital name="TTFB" value={session.performance_metrics.ttfb} unit="ms" thresholds={{ warning: 800, poor: 1800 }} />
                  <WebVital name="LCP" value={session.performance_metrics.lcp} unit="s" thresholds={{ warning: 2500, poor: 4000 }} />
                  <WebVital name="FID" value={session.performance_metrics.fid} unit="ms" thresholds={{ warning: 100, poor: 300 }} />
                  <WebVital name="CLS" value={session.performance_metrics.cls} unit="" thresholds={{ warning: 0.1, poor: 0.25 }} />
                </div>
              </div>
            )}

            {session.location_info && (
              <div>
                <SectionTitle>Lokácia a sieť</SectionTitle>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <p className="text-[10px] text-emerald-800 font-bold">IP adresa</p>
                    <p className="font-extrabold text-slate-900 truncate">{session.location_info.ip || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-800 font-bold">Krajina</p>
                    <p className="font-extrabold text-slate-900">{session.location_info.country || '—'} ({session.location_info.country_code || '—'})</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-800 font-bold">Mesto & región</p>
                    <p className="font-extrabold text-slate-900">{session.location_info.city || '—'}, {session.location_info.region || '—'}</p>
                  </div>
                  {session.location_info.latitude && (
                    <div>
                      <p className="text-[10px] text-emerald-800 font-bold">GPS súradnice</p>
                      <p className="font-extrabold text-slate-900">{session.location_info.latitude.toFixed(4)}, {session.location_info.longitude.toFixed(4)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(session.referrer || Object.values(session.utm_params || {}).some(Boolean)) && (
              <div>
                <SectionTitle>Akvizícia & kampaň</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {session.referrer && session.referrer !== 'direct' && (
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg">
                      <p className="text-[10px] text-blue-800 font-bold mb-0.5">Odkazujúca stránka</p>
                      <p className="font-bold text-slate-900 break-all">{session.referrer}</p>
                    </div>
                  )}
                  {Object.values(session.utm_params || {}).some(Boolean) && (
                    <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-lg space-y-1">
                      <p className="text-[10px] text-purple-800 font-bold mb-1">UTM parametre</p>
                      {Object.entries(session.utm_params).filter(([, v]) => v).map(([k, v]) => (
                        <p key={k} className="text-[11px] font-semibold">
                          <span className="text-slate-500">{k}:</span> <span className="font-bold text-purple-900">{v}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'path' && (
          <div className="space-y-3">
            <SectionTitle>Chronologická cesta návštevníka</SectionTitle>
            {!session.pages_visited?.length ? <Empty>Žiadne záznamy o navštívených stránkach.</Empty> : (
              <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-3 max-h-[350px] overflow-y-auto">
                {session.pages_visited.map((page, idx) => (
                  <div key={idx} className="relative bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="absolute -left-[25px] top-3.5 w-2 h-2 rounded-full bg-indigo-500 border border-white" />
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Krok {idx + 1}</span>
                          <span className="text-xs font-extrabold text-slate-900">{page.page_name_sk || page.page_title || page.page_url}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{page.page_url}</p>
                        <div className="flex gap-3 text-[10px] text-slate-600 font-bold mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(page.time_spent_seconds)}</span>
                          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />Scroll {page.scroll_depth_percentage || 0}%</span>
                          {page.exit_type && (
                            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                              {page.exit_type === 'bounce' ? 'Odchod ihneď' : page.exit_type === 'exit' ? 'Ukončenie' : page.exit_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-black shrink-0">{safeFormat(page.timestamp, 'HH:mm:ss')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-3">
            <SectionTitle>Angažovanosť a čítanie sekcií</SectionTitle>
            {!session.section_engagement || Object.keys(session.section_engagement).length === 0 ? (
              <Empty>Neboli zaznamenané konkrétne čítania sekcií.</Empty>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {Object.entries(session.section_engagement).sort((a, b) => b[1] - a[1]).map(([sectionId, seconds]) => {
                  const totalSec = Object.values(session.section_engagement).reduce((acc, s) => acc + s, 0);
                  const percent = totalSec > 0 ? Math.round((seconds / totalSec) * 100) : 0;
                  return (
                    <div key={sectionId} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-800 capitalize font-extrabold">{sectionId.replace(/[-_]/g, ' ')}</span>
                        <span className="text-slate-900 font-black">{formatDuration(seconds)} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clicks' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <SectionTitle>História kliknutí</SectionTitle>
              {session.clicks?.length > 0 && (
                <Button size="sm" onClick={() => onOpenClickMap(session)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-7">
                  <Layers className="w-3.5 h-3.5 mr-1" />
                  Click mapa
                </Button>
              )}
            </div>
            {!session.clicks?.length ? <Empty>Neboli zaznamenané žiadne kliknutia.</Empty> : (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {session.clicks.map((click, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-extrabold rounded text-[10px]">&lt;{click.element}&gt;</span>
                        {click.text && <span className="font-extrabold text-slate-900 truncate italic">"{click.text}"</span>}
                      </div>
                      <div className="flex gap-2 text-[10px] text-slate-500 font-bold flex-wrap">
                        <span>Pozícia: {click.x_percent !== undefined ? `${click.x_percent}%, ${click.y_percent}%` : `${click.x_position}px, ${click.y_position}px`}</span>
                        <span className="truncate">Stránka: {click.page_name_sk || click.page_url}</span>
                        {click.element_id && <span className="text-indigo-600 font-extrabold">ID: #{click.element_id}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold shrink-0">{safeFormat(click.timestamp, 'HH:mm:ss')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'configurator' && (
          <div className="space-y-4">
            <div>
              <SectionTitle>Interakcie s konfigurátorom</SectionTitle>
              {!session.configurator_interactions?.length ? (
                <Empty>Žiadne interakcie v konfigurátore.</Empty>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {session.configurator_interactions.map((it, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between items-center gap-4">
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900">{it.dom_nazov || 'Konfigurátor'}</span>
                        <span className="text-slate-400 mx-1.5 font-bold">→</span>
                        <span className="text-indigo-700 font-black">{it.action}</span>
                        {it.option_selected && (
                          <span className="text-slate-600 font-extrabold ml-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">{it.option_selected}</span>
                        )}
                      </div>
                      {it.price_at_time && (
                        <span className="bg-green-100 text-green-900 px-2 py-0.5 rounded font-black text-xs shrink-0 border border-green-200">
                          {it.price_at_time.toLocaleString('sk-SK')} €
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle>Prezerané domy</SectionTitle>
              {!session.dom_interactions?.length ? <Empty>Žiadne interakcie s katalógom domov.</Empty> : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {session.dom_interactions.map((it, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs flex justify-between items-center">
                      <div className="truncate">
                        <span className="font-extrabold text-slate-900">{it.dom_nazov}</span>
                        <span className="ml-2 inline-flex items-center rounded bg-indigo-50 border border-indigo-100 text-indigo-800 px-1.5 py-0.5 text-[10px] font-black">{it.action}</span>
                      </div>
                      {it.duration_seconds > 0 && <span className="text-[10px] text-slate-500 font-extrabold">{formatDuration(it.duration_seconds)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle>Formuláre</SectionTitle>
              {!session.form_interactions?.length ? <Empty>Žiadne vyplnené formuláre.</Empty> : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {session.form_interactions.map((form, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900">{form.form_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          form.completed || form.action === 'submit' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>{form.action}</span>
                      </div>
                      {form.fields_touched?.length > 0 && (
                        <p className="text-slate-600 font-semibold text-[10px] mt-1 bg-white p-1 rounded border border-slate-100">
                          Polia: {form.fields_touched.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-4">
            <div>
              <SectionTitle>JavaScript chyby</SectionTitle>
              {!session.errors_encountered?.length ? (
                <p className="text-xs text-emerald-800 italic text-center py-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  V relácii neboli zistené žiadne chyby.
                </p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {session.errors_encountered.map((error, idx) => (
                    <div key={idx} className="bg-red-50 p-2.5 rounded-lg border border-red-200 text-xs">
                      <p className="font-extrabold text-red-900 mb-1 leading-snug">{error.error_message}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{error.page_url}</p>
                      {error.error_stack && (
                        <details className="mt-1.5">
                          <summary className="cursor-pointer text-[10px] text-red-800 font-bold hover:underline">Stack trace</summary>
                          <pre className="text-[10px] bg-slate-900 text-green-400 p-2 rounded mt-1 overflow-auto max-h-40 font-mono">{error.error_stack}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {session.language_changes?.length > 0 && (
              <div>
                <SectionTitle>Zmeny jazyka</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {session.language_changes.map((change, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs flex items-center gap-1.5">
                      <span className="font-black text-slate-900 uppercase">{change.from}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-black text-slate-900 uppercase">{change.to}</span>
                      <span className="text-[10px] text-slate-400">{safeFormat(change.timestamp, 'HH:mm:ss')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <SectionTitle>Surové dáta relácie</SectionTitle>
              <details className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <summary className="cursor-pointer text-xs font-bold text-green-400 hover:text-green-300">
                  Zobraziť JSON ({Math.round(JSON.stringify(session).length / 1024)} KB)
                </summary>
                <pre className="text-[10px] overflow-auto max-h-60 mt-2 text-green-400 font-mono select-all">{JSON.stringify(session, null, 2)}</pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}