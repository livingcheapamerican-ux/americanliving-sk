import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Brain, 
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  Lightbulb,
  Mail,
  Phone,
  CheckCircle
} from "lucide-react";

export default function VisitorSegments({ sessions, domy, onSegmentSelect }) {
  const [expandedSegment, setExpandedSegment] = useState(null);
  
  // Segmentácia návštevníkov
  const segments = useMemo(() => {
    const segmentData = {
      VAZNY_ZAJEM: { name: 'Zákazníci s vážnym záujmom', visitors: [], color: 'green', icon: Star },
      INVESTORI: { name: 'Potenciálni investori', visitors: [], color: 'purple', icon: TrendingUp },
      NIZKE_NAKLADY: { name: 'Rodiny hľadajúce nízke náklady', visitors: [], color: 'blue', icon: DollarSign },
      LUXURY_SEEKERS: { name: 'Prémiový segment', visitors: [], color: 'amber', icon: Star },
      TIRE_KICKERS: { name: 'Zvedavci (nízky záujem)', visitors: [], color: 'gray', icon: AlertCircle },
      RETURNING_VISITORS: { name: 'Vracajúci sa návštevníci', visitors: [], color: 'teal', icon: Users }
    };
    
    // Group by visitor
    const visitorSessions = {};
    sessions.forEach(s => {
      const visitorId = s.user_email || s.location_info?.ip || s.session_id;
      if (!visitorSessions[visitorId]) {
        visitorSessions[visitorId] = [];
      }
      visitorSessions[visitorId].push(s);
    });
    
    // Analyze each visitor
    for (const [visitorId, vSessions] of Object.entries(visitorSessions)) {
      const totalDuration = vSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      const avgDuration = totalDuration / vSessions.length;
      const totalPages = vSessions.reduce((acc, s) => acc + (s.pages_visited?.length || 0), 0);
      const configuratorUse = vSessions.reduce((acc, s) => acc + (s.configurator_interactions?.length || 0), 0);
      const conversions = vSessions.reduce((acc, s) => acc + (s.conversions?.length || 0), 0);
      
      // Viewed houses
      const viewedHouses = new Set();
      const viewedPrices = [];
      vSessions.forEach(s => {
        s.pages_visited?.forEach(p => {
          if (p.page_url?.includes('DetailDomu')) {
            const urlParams = new URLSearchParams(p.page_url.split('?')[1] || '');
            const domId = urlParams.get('id');
            if (domId) {
              viewedHouses.add(domId);
              const dom = domy.find(d => d.id === domId);
              if (dom?.zakladna_cena) viewedPrices.push(dom.zakladna_cena);
            }
          }
        });
      });
      
      const avgPrice = viewedPrices.length > 0 
        ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length 
        : 0;
      
      const visitor = {
        id: visitorId,
        email: vSessions[0].user_email || 'Anonymous',
        sessions: vSessions.length,
        avgDuration,
        totalPages,
        configuratorUse,
        conversions,
        viewedHouses: viewedHouses.size,
        avgPrice,
        lastVisit: vSessions[0].start_time
      };
      
      // Klasifikácia
      if (avgDuration > 120 && configuratorUse > 2 && viewedHouses.size >= 2) {
        segmentData.VAZNY_ZAJEM.visitors.push(visitor);
      }
      
      if (viewedHouses.size >= 5 && avgDuration > 180 && vSessions.length >= 2) {
        segmentData.INVESTORI.visitors.push(visitor);
      }
      
      if (avgPrice > 0 && avgPrice < 60000 && configuratorUse > 0) {
        segmentData.NIZKE_NAKLADY.visitors.push(visitor);
      }
      
      if (avgPrice > 100000 && avgDuration > 150) {
        segmentData.LUXURY_SEEKERS.visitors.push(visitor);
      }
      
      if (avgDuration < 30 && totalPages < 3 && configuratorUse === 0) {
        segmentData.TIRE_KICKERS.visitors.push(visitor);
      }
      
      if (vSessions.length >= 3) {
        segmentData.RETURNING_VISITORS.visitors.push(visitor);
      }
    }
    
    return segmentData;
  }, [sessions, domy]);
  
  const getRecommendations = (segmentKey) => {
    const recommendations = {
      VAZNY_ZAJEM: {
        actions: [
          '📧 Poslať follow-up email s cenovou ponukou',
          '🎯 Retargeting kampaň s konkrétnymi modelmi',
          '📞 Osobný telefonát od predajcu'
        ],
        targeting: 'Facebook Custom Audience (návštevníci DetailDomu 7 dní) + Email kampaň',
        budget: '50-100€/týždeň',
        priority: 'VYSOKÁ'
      },
      INVESTORI: {
        actions: [
          '💰 Kampaň zdôrazňujúca ROI a nízke náklady',
          '📊 Poslať case study s ROI analýzou',
          '🤝 Pozvať na stretnutie s finančným poradcom'
        ],
        targeting: 'LinkedIn Ads + Google Ads ("investícia do nehnuteľností", "mobilné domy")',
        budget: '100-200€/týždeň',
        priority: 'VYSOKÁ'
      },
      NIZKE_NAKLADY: {
        actions: [
          '🏡 Zdôrazniť štartovací dom a nízke energie',
          '💳 Kampaň s hypotékovým kalkulátorom',
          '🎥 Video tour lacnejších modelov'
        ],
        targeting: 'Facebook/Instagram, vek 25-35, záujem "prvé bývanie", "hypotéka"',
        budget: '70-150€/týždeň',
        priority: 'STREDNÁ'
      },
      LUXURY_SEEKERS: {
        actions: [
          '✨ Prémiová brožúra s exkluzívnymi fotkami',
          '🏆 Pozvánka na súkromnú prehliadku',
          '🎨 Zdôrazniť customizáciu a high-end'
        ],
        targeting: 'Google Ads príjmové cielenie TOP 10% + Instagram Stories',
        budget: '80-120€/týždeň',
        priority: 'STREDNÁ'
      },
      TIRE_KICKERS: {
        actions: [
          '📚 Vzdelávací content (blog, FAQ)',
          '🌱 Brand awareness organické posty',
          '❌ Minimálny platený budget'
        ],
        targeting: 'SEO optimalizácia + organické social media',
        budget: '10-20€/týždeň (len remarketing)',
        priority: 'NÍZKA'
      },
      RETURNING_VISITORS: {
        actions: [
          '🎁 Špeciálna ponuka "Pre vracajúcich sa"',
          '📬 Email s novinkami a akciami',
          '⏰ Urgency messaging (limitovaná ponuka)'
        ],
        targeting: 'Email marketing + Facebook Custom Audiences (30 dní)',
        budget: '60-100€/týždeň',
        priority: 'VYSOKÁ'
      }
    };
    
    return recommendations[segmentKey] || {};
  };
  
  const colorClasses = {
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-600' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900', badge: 'bg-gray-600' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-900', badge: 'bg-teal-600' }
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            🧠 AI Segmentácia Návštevníkov
          </CardTitle>
          <p className="text-sm text-purple-200">Automatická kategorizácia na základe správania</p>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(segments).map(([key, segment]) => {
          if (segment.visitors.length === 0) return null;
          
          const Icon = segment.icon;
          const colors = colorClasses[segment.color];
          const recs = getRecommendations(key);
          const isExpanded = expandedSegment === key;
          
          return (
            <Card key={key} className={`${colors.bg} border-2 ${colors.border}`}>
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedSegment(isExpanded ? null : key)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 ${colors.badge} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${colors.text}`}>{segment.name}</h3>
                      <p className="text-xs text-gray-600">{segment.visitors.length} návštevníkov</p>
                    </div>
                  </div>
                  {recs.priority && (
                    <Badge className={
                      recs.priority === 'VYSOKÁ' ? 'bg-red-600' :
                      recs.priority === 'STREDNÁ' ? 'bg-yellow-600' : 'bg-gray-600'
                    }>
                      {recs.priority}
                    </Badge>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/80 p-2 rounded">
                    <p className="text-gray-600">Priem. domov</p>
                    <p className="font-bold">{(segment.visitors.reduce((acc, v) => acc + v.viewedHouses, 0) / segment.visitors.length).toFixed(1)}</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded">
                    <p className="text-gray-600">Konverzie</p>
                    <p className="font-bold">{segment.visitors.reduce((acc, v) => acc + v.conversions, 0)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSegmentSelect?.(key);
                    }}
                  >
                    Filtrovať tento segment
                  </Button>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t p-4 bg-white space-y-4">
                  <div>
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      Odporúčané akcie
                    </h4>
                    <ul className="space-y-1">
                      {recs.actions?.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Targeting stratégia
                    </h4>
                    <p className="text-xs text-blue-900">{recs.targeting}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h4 className="font-bold text-sm mb-2">💰 Odporúčaný budget</h4>
                    <p className="text-xs text-green-900 font-semibold">{recs.budget}</p>
                  </div>
                  
                  {/* Sample visitors */}
                  <div>
                    <h4 className="font-bold text-sm mb-2">Ukážka návštevníkov</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {segment.visitors.slice(0, 5).map((visitor) => (
                        <div key={visitor.id} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                          <span className="font-medium">{visitor.email}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{visitor.sessions} návštev</Badge>
                            <Badge variant="outline">{visitor.viewedHouses} domov</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}