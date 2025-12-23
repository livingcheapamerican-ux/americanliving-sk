import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Clock, Filter, TrendingUp, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import moment from "moment";

export default function CampaignHistoryTable({ history }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const campaignHistory = history.filter(h => 
    h.action_type === 'campaign_approved' || 
    h.action_type === 'campaign_rejected' ||
    h.action_type === 'strategy_approved'
  );

  const filteredHistory = campaignHistory.filter(item => {
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    const typeMatch = filterType === "all" || item.data?.type === filterType;
    return statusMatch && typeMatch;
  });

  const stats = {
    total: campaignHistory.length,
    approved: campaignHistory.filter(h => h.status === 'completed').length,
    rejected: campaignHistory.filter(h => h.status === 'rejected').length,
    totalBudget: campaignHistory
      .filter(h => h.status === 'completed')
      .reduce((sum, h) => sum + (h.budget_allocated || 0), 0)
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              📋 História Kampaní & Stratégií
            </CardTitle>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-white p-3 rounded-lg border border-indigo-200">
              <p className="text-xs text-gray-600">Celkom</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-300">
              <p className="text-xs text-green-700">Schválené</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-300">
              <p className="text-xs text-red-700">Zamietnuté</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-300">
              <p className="text-xs text-yellow-700">Budget</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalBudget}€</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mt-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Stav" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky stavy</SelectItem>
                <SelectItem value="completed">Schválené</SelectItem>
                <SelectItem value="rejected">Zamietnuté</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky typy</SelectItem>
                <SelectItem value="facebook_campaign">Facebook kampaň</SelectItem>
                <SelectItem value="lead_gen_campaign">Lead Generation</SelectItem>
                <SelectItem value="price_strategy">Cenová stratégia</SelectItem>
                <SelectItem value="behavioral_insight">Behavioral Insight</SelectItem>
                <SelectItem value="seo_optimization">SEO Optimalizácia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="max-h-[600px] overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Žiadna história kampaní</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                    item.status === 'completed' 
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : 'bg-red-50 border-red-300 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <h5 className="font-bold text-sm text-gray-900">{item.title}</h5>
                      </div>
                      
                      <p className="text-xs text-gray-700 mb-2">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.data?.type || 'N/A'}
                        </Badge>
                        {item.budget_allocated && (
                          <Badge className="bg-emerald-600 text-white text-xs">
                            {item.budget_allocated}€
                          </Badge>
                        )}
                        {item.data?.platform && (
                          <Badge variant="outline" className="text-xs">
                            {item.data.platform}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-gray-500">
                          {moment(item.created_date).format('DD.MM.YYYY HH:mm')}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Základné informácie</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Typ:</span>
                    <span className="ml-2 font-medium">{selectedItem.data?.type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stav:</span>
                    <Badge className={`ml-2 ${selectedItem.status === 'completed' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {selectedItem.status === 'completed' ? 'Schválené' : 'Zamietnuté'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Dátum:</span>
                    <span className="ml-2 font-medium">{moment(selectedItem.created_date).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                  {selectedItem.budget_allocated && (
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <span className="ml-2 font-medium text-green-600">{selectedItem.budget_allocated}€</span>
                    </div>
                  )}
                  {selectedItem.user_email && (
                    <div>
                      <span className="text-gray-600">Užívateľ:</span>
                      <span className="ml-2 font-medium">{selectedItem.user_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Gen Campaign Details */}
              {selectedItem.data?.type === 'lead_gen_campaign' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm mb-2 text-blue-900">📱 Platforma & Cielenie</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Platform:</strong> {selectedItem.data.platform}</p>
                      <p><strong>Dom:</strong> {selectedItem.data.target_house_name}</p>
                      <p><strong>Vek:</strong> {selectedItem.data.targeting?.age_range}</p>
                      <p><strong>Lokality:</strong> {selectedItem.data.targeting?.locations?.join(', ')}</p>
                      <p><strong>Záujmy:</strong> {selectedItem.data.targeting?.interests?.join(', ')}</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-sm mb-2 text-purple-900">📝 Kreatíva</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Visual:</strong> {selectedItem.data.creative?.visual_description}</p>
                      <p><strong>Text:</strong> {selectedItem.data.creative?.primary_text}</p>
                      <p><strong>Headline:</strong> {selectedItem.data.creative?.headline}</p>
                      <p><strong>CTA:</strong> {selectedItem.data.creative?.cta_button}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-sm mb-2 text-green-900">💰 Budget & Očakávané výsledky</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Denný budget:</strong> €{selectedItem.data.budget?.daily}</p>
                      <p><strong>Celkový budget:</strong> €{selectedItem.data.budget?.total}</p>
                      <p><strong>Trvanie:</strong> {selectedItem.data.budget?.duration_days} dní</p>
                      <p><strong>Očakávané leady:</strong> {selectedItem.data.expected_results?.estimated_leads}</p>
                      <p><strong>CPL:</strong> {selectedItem.data.expected_results?.cost_per_lead}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Price Strategy Details */}
              {selectedItem.data?.type === 'price_strategy' && (
                <>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-sm mb-2 text-green-900">💰 Cenová úprava</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Dom:</strong> {selectedItem.data.dom_nazov}</p>
                      <p><strong>Aktuálna cena:</strong> {selectedItem.data.current_price}€</p>
                      <p><strong>Navrhovaná cena:</strong> {selectedItem.data.suggested_price}€</p>
                      <p><strong>Zmena:</strong> <span className={selectedItem.data.change_percent < 0 ? 'text-red-600' : 'text-green-600'}>{selectedItem.data.change_percent}%</span></p>
                      <p><strong>Typ stratégie:</strong> {selectedItem.data.strategy_type}</p>
                      <p><strong>Trvanie:</strong> {selectedItem.data.duration}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm mb-2 text-blue-900">📊 Zdôvodnenie</h4>
                    <p className="text-sm">{selectedItem.data.reasoning}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-sm mb-2 text-purple-900">🎯 Očakávaný dopad</h4>
                    <p className="text-sm">{selectedItem.data.expected_impact}</p>
                  </div>
                </>
              )}

              {/* Step by Step Guide */}
              {selectedItem.data?.step_by_step_guide && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-sm mb-2 text-yellow-900">📋 Krok-po-kroku návod</h4>
                  <pre className="text-xs whitespace-pre-wrap text-gray-800">
                    {selectedItem.data.step_by_step_guide}
                  </pre>
                </div>
              )}

              {/* Full Data */}
              <details className="bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold text-sm">🔍 Kompletné dáta (JSON)</summary>
                <pre className="text-xs mt-2 overflow-x-auto bg-white p-3 rounded">
                  {JSON.stringify(selectedItem.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}