import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, BookOpen, MessageSquare, Eye, Search, Brain, Plus, Rocket, Trophy } from "lucide-react";

export default function StrategyTab({
  rawIdea, setRawIdea, creativeProject, loadingCreative, improveIdea,
  driveLink, setDriveLink, savingDriveLink, saveDriveLink, assets,
  clientConcerns, strategicBriefing, loadingBriefing, runDeepThinkStrategist,
  newKnowHow, setNewKnowHow, saveKnowHow, brainRules,
  commentsInput, setCommentsInput, campaignNameInput, setCampaignNameInput,
  commentsAnalysis, loadingComments, analyzeComments, campaigns,
  newCompetitor, setNewCompetitor, saveCompetitor, competitors,
  loadingCompetitors, findCompetitors
}) {
  return (
    <div className="space-y-8">
      {/* Kreatívne Štúdio */}
      <Card className="bg-gradient-to-br from-pink-900 to-purple-900 text-white border-none shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="w-8 h-8" />
            💡 Kreatívne Štúdio
          </CardTitle>
          <p className="text-pink-200">Idea → Hotový produkčný plán</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-white text-lg mb-2 block">Váš surový nápad</Label>
              <Textarea value={rawIdea} onChange={(e) => setRawIdea(e.target.value)} placeholder="Napr. 'Chcem natočiť video o kuchyni v dome Fjord'" rows={3} className="text-gray-900" />
            </div>
            <Button onClick={improveIdea} disabled={loadingCreative} size="lg" className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-gray-900 font-bold">
              {loadingCreative ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>AI vytvára projekt...</> : <><Lightbulb className="w-5 h-5 mr-2" />Vylepšiť môj nápad</>}
            </Button>
            {creativeProject && (
              <div className="bg-white text-gray-900 p-6 rounded-lg space-y-4">
                <div><h4 className="font-bold text-lg mb-2 text-purple-900">✨ Vylepšený koncept</h4><p className="text-sm leading-relaxed">{creativeProject.improved_concept}</p></div>
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300"><h4 className="font-bold text-lg mb-2 text-blue-900">🎬 Detailný scenár</h4><p className="text-sm whitespace-pre-line leading-relaxed">{creativeProject.detailed_scenario}</p></div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-lg mb-3 text-green-900">🎥 Metodika výroby</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div><strong>💡 Svetlo:</strong> {creativeProject.production_guide?.lighting}</div>
                    <div><strong>🎵 Hudba:</strong> {creativeProject.production_guide?.music_style}</div>
                    <div><strong>📹 Kamera:</strong> {creativeProject.production_guide?.camera_instructions}</div>
                    <div><strong>⏱️ Dĺžka:</strong> {creativeProject.production_guide?.duration}</div>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300"><strong>🎯 Kľúčový odkaz:</strong> {creativeProject.production_guide?.key_message}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                  <h4 className="font-bold text-sm mb-2 text-orange-900">📊 Predikovaný dopad</h4>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div><strong>Dosah:</strong> {creativeProject.estimated_impact?.predicted_reach}</div>
                    <div><strong>Cieľovka:</strong> {creativeProject.estimated_impact?.target_audience}</div>
                    <div className="md:col-span-2"><strong>Triggery:</strong> {creativeProject.estimated_impact?.psychological_triggers?.join(', ')}</div>
                  </div>
                </div>
                {creativeProject.reasoning && (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-400">
                    <h4 className="font-bold text-sm mb-2 text-purple-900">🧠 PREČO SOM SA TAKTO ROZHODOL?</h4>
                    <p className="text-xs text-purple-800 whitespace-pre-line leading-relaxed">{creativeProject.reasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dátový Trezor */}
      <Card className="border-cyan-300">
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-600" />📂 Dátový Trezor (Google Drive Assets)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div><Label>Link na Google Drive priečinok</Label><Input value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." /></div>
            <Button onClick={saveDriveLink} disabled={savingDriveLink} className="w-full bg-cyan-600 hover:bg-cyan-700">{savingDriveLink ? 'Ukladám...' : 'Uložiť link'}</Button>
            {driveLink && <div className="bg-cyan-50 p-3 rounded border border-cyan-200"><p className="text-xs text-cyan-900">✅ AI bude automaticky pripomínať tento link pri generovaní príspevkov</p></div>}
          </div>
        </CardContent>
      </Card>

      {/* Analýza Dopytov */}
      {clientConcerns && (
        <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-orange-600" />😰 Analýza Dopytov</CardTitle></CardHeader>
          <CardContent><div className="bg-white p-4 rounded-lg border-2 border-orange-300"><pre className="whitespace-pre-line text-sm text-gray-800">{clientConcerns}</pre></div></CardContent>
        </Card>
      )}

      {/* Know-How */}
      <Card className="border-green-300">
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-600" />📚 Nahrať Know-How</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Kategória</Label>
              <select value={newKnowHow.category} onChange={(e) => setNewKnowHow({...newKnowHow, category: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                <option value="Psychológia">Psychológia</option>
                <option value="Predaj">Predaj</option>
                <option value="O_Firme">O Firme</option>
                <option value="Lead_Generation">Lead Generation</option>
                <option value="Social_Proof">Social Proof</option>
                <option value="Scarcity">Scarcity</option>
              </select>
            </div>
            <div><Label>Pravidlo / Princíp</Label><Textarea value={newKnowHow.content_text} onChange={(e) => setNewKnowHow({...newKnowHow, content_text: e.target.value})} placeholder="Napr. 'Vždy zdôrazňuj rýchlosť montáže'" rows={4} /></div>
            <div><Label>Priorita (1-10)</Label><Input type="number" min={1} max={10} value={newKnowHow.urgency_level} onChange={(e) => setNewKnowHow({...newKnowHow, urgency_level: parseInt(e.target.value)})} /></div>
            <Button onClick={saveKnowHow} className="w-full bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-2" />Uložiť Know-How</Button>
          </div>
          <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">📚 Uložené pravidlá ({brainRules.length})</h4>
            {brainRules.map((rule) => (
              <div key={rule.id} className="bg-green-50 border border-green-200 p-3 rounded">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1"><Badge className="bg-green-600 text-white mb-2">{rule.category}</Badge><p className="text-sm text-gray-800">{rule.content_text}</p></div>
                  <Badge variant="outline">Priorita: {rule.urgency_level}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analýza Komentárov */}
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-orange-600" />💬 Analyzuj Komentáre (Feedback Loop)</CardTitle>
          <p className="text-sm text-orange-700">AI sa učí z reakcií ľudí a aktualizuje know-how</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div><Label>Názov kampane</Label><Input value={campaignNameInput} onChange={(e) => setCampaignNameInput(e.target.value)} placeholder="Napr. 'Facebook - Video montáž Washington'" /></div>
            <div><Label>Komentáre z Facebooku/Instagramu</Label><Textarea value={commentsInput} onChange={(e) => setCommentsInput(e.target.value)} placeholder="Skopírujte sem všetky komentáre..." rows={6} /></div>
            <Button onClick={analyzeComments} disabled={loadingComments} className="w-full bg-orange-600 hover:bg-orange-700">
              {loadingComments ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>AI analyzuje...</> : <><Brain className="w-4 h-4 mr-2" />Analyzovať a naučiť sa</>}
            </Button>
            {commentsAnalysis && (
              <div className="bg-white p-4 rounded-lg border-2 border-orange-300 space-y-3">
                <div><h4 className="font-bold text-sm mb-2">📊 Sentiment</h4><Badge className={commentsAnalysis.sentiment === 'Pozitívny' ? 'bg-green-600' : commentsAnalysis.sentiment === 'Negatívny' ? 'bg-red-600' : 'bg-gray-600'}>{commentsAnalysis.sentiment}</Badge></div>
                <div><h4 className="font-bold text-sm mb-2 text-green-700">✅ Čo sa páčilo</h4><ul className="text-xs space-y-1">{commentsAnalysis.positive_feedback?.map((item, i) => <li key={i} className="text-green-800">• {item}</li>)}</ul></div>
                <div><h4 className="font-bold text-sm mb-2 text-red-700">❌ Čo vadilo</h4><ul className="text-xs space-y-1">{commentsAnalysis.negative_feedback?.map((item, i) => <li key={i} className="text-red-800">• {item}</li>)}</ul></div>
                <div className="bg-purple-50 p-3 rounded border border-purple-300"><h4 className="font-bold text-sm mb-2 text-purple-900">🧠 Naučené poznatky</h4><ul className="text-xs space-y-1">{commentsAnalysis.learned_insights?.map((item, i) => <li key={i} className="text-purple-800">• {item}</li>)}</ul></div>
              </div>
            )}
          </div>
          {campaigns.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">📈 História kampaní ({campaigns.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-white border border-orange-200 p-3 rounded text-xs">
                    <div className="font-bold text-gray-900 mb-1">{camp.campaign_name}</div>
                    <p className="text-gray-600 mb-2">{camp.sentiment_summary}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-800">{camp.positive_feedback?.length || 0} pozitívnych</Badge>
                      <Badge className="bg-red-100 text-red-800">{camp.negative_feedback?.length || 0} negatívnych</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sledovanie Konkurencie */}
      <Card className="border-red-300">
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-red-600" />👀 Sledovanie Konkurencie</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border-2 border-red-300 shadow-lg">
            <h4 className="font-bold text-lg mb-2 text-red-900 flex items-center gap-2"><Search className="w-5 h-5" />🕵️‍♂️ Slovak Market Leaderboard</h4>
            <Button onClick={findCompetitors} disabled={loadingCompetitors} size="lg" className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-bold">
              {loadingCompetitors ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>AI analyzuje slovenský trh...</> : <><Brain className="w-5 h-5 mr-2" />🕵️‍♂️ Analyzuj a nájdi Top Konkurenciu</>}
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Názov konkurenta</Label><Input value={newCompetitor.competitor_name} onChange={(e) => setNewCompetitor({...newCompetitor, competitor_name: e.target.value})} placeholder="Napr. ModularHomes SK" /></div>
              <div><Label>Platforma</Label>
                <select value={newCompetitor.platform} onChange={(e) => setNewCompetitor({...newCompetitor, platform: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                  <option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="TikTok">TikTok</option><option value="LinkedIn">LinkedIn</option><option value="YouTube">YouTube</option>
                </select>
              </div>
            </div>
            <div><Label>Obsah príspevku</Label><Textarea value={newCompetitor.post_content} onChange={(e) => setNewCompetitor({...newCompetitor, post_content: e.target.value})} placeholder="Skopíruj text úspešnej reklamy..." rows={3} /></div>
            <div><Label>Prečo to fungovalo?</Label><Textarea value={newCompetitor.why_it_worked} onChange={(e) => setNewCompetitor({...newCompetitor, why_it_worked: e.target.value})} placeholder="Napr. 'Použili video z montáže...'" rows={2} /></div>
            <div><Label>Engagement skóre (0-100)</Label><Input type="number" min={0} max={100} value={newCompetitor.engagement_score} onChange={(e) => setNewCompetitor({...newCompetitor, engagement_score: parseInt(e.target.value)})} /></div>
            <Button onClick={saveCompetitor} className="w-full bg-red-600 hover:bg-red-700"><Plus className="w-4 h-4 mr-2" />Uložiť konkurenčný príspevok</Button>
          </div>
          <div className="mt-6 space-y-2 max-h-[600px] overflow-y-auto">
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-600" />🏆 Slovak Market Leaderboard ({competitors.length})</h4>
            {competitors.length === 0 ? (
              <div className="text-center py-8 text-gray-500"><Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm">Zatiaľ žiadna konkurencia</p></div>
            ) : (
              competitors.map((comp) => {
                const rankMatch = comp.competitor_name.match(/^#(\d+)/);
                const rank = rankMatch ? parseInt(rankMatch[1]) : null;
                const cleanName = comp.competitor_name.replace(/^#\d+\s*/, '');
                return (
                  <div key={comp.id} className={`border-l-4 p-4 rounded-lg shadow-sm ${rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-500' : rank <= 3 ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-500' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {rank && <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-lg ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : rank <= 3 ? 'bg-orange-400 text-orange-900' : 'bg-gray-400 text-white'}`}>#{rank}</div>}
                        <div><div className="font-bold text-base text-gray-900">{cleanName}</div><Badge className="bg-red-600 text-white mt-1">{comp.platform}</Badge></div>
                      </div>
                      <Badge className={`text-white ${comp.engagement_score >= 80 ? 'bg-green-600' : comp.engagement_score >= 60 ? 'bg-yellow-600' : 'bg-gray-600'}`}>{comp.engagement_score}/100</Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      {comp.why_it_worked && <div className="bg-white/80 p-2 rounded border border-red-200"><strong className="text-red-700">💪 Silná stránka:</strong> <span className="text-gray-800">{comp.why_it_worked}</span></div>}
                      {comp.post_content && <div className="bg-white/80 p-2 rounded border border-red-200"><p className="text-gray-700 italic">"{comp.post_content.replace('[Slovak Market Leaderboard]', '').trim().substring(0, 120)}..."</p></div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}