import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target, MessageSquare, CheckCircle2, Lightbulb, Users, Link as LinkIcon, BarChart3, Clock, MousePointer } from "lucide-react";

export default function CompetitorAnalysis({ competitors = [] }) {
  if (!competitors || competitors.length === 0) {
    return null;
  }

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-600" />;
    return <Target className="w-4 h-4 text-gray-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Top 3 Competitors Analysis
        </CardTitle>
        <p className="text-xs text-gray-500">Learn from what's already ranking</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitors.map((comp, idx) => (
          <div key={idx} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getRankIcon(comp.rank)}
                <Badge className={`${getRankColor(comp.rank)} border`}>
                  Rank #{comp.rank}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {comp.word_count} words · {comp.heading_count} headings
              </div>
            </div>

            {/* Title */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900">{comp.title}</h4>
            </div>

            {/* Meta Information */}
            <div className="space-y-2 bg-gray-50 rounded-md p-3">
              <div>
                <p className="text-xs font-medium text-gray-600">Meta Title ({comp.meta_title.length} chars)</p>
                <p className="text-xs text-gray-800 mt-1">{comp.meta_title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Meta Description ({comp.meta_description.length} chars)</p>
                <p className="text-xs text-gray-800 mt-1">{comp.meta_description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">H1 Tag</p>
                <p className="text-xs text-gray-800 mt-1">{comp.h1_tag}</p>
              </div>
            </div>

            {/* Traffic & Engagement Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-700 flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3" />
                  Monthly Traffic
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {comp.estimated_monthly_traffic?.toLocaleString() || "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-md p-3 border border-purple-200">
                <p className="text-xs font-medium text-purple-700 flex items-center gap-1 mb-1">
                  <LinkIcon className="w-3 h-3" />
                  Backlinks
                </p>
                <p className="text-lg font-bold text-purple-900">
                  {comp.estimated_backlinks?.toLocaleString() || "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-md p-3 border border-green-200">
                <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-1">
                  <BarChart3 className="w-3 h-3" />
                  Domain Authority
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-green-900">
                    {comp.domain_authority || "N/A"}
                  </p>
                  {comp.domain_authority && (
                    <Progress value={comp.domain_authority} className="flex-1 h-2" />
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-md p-3 border border-orange-200">
                <p className="text-xs font-medium text-orange-700 flex items-center gap-1 mb-1">
                  <MousePointer className="w-3 h-3" />
                  Engagement
                </p>
                <p className="text-lg font-bold text-orange-900">
                  {comp.engagement_score || "N/A"}/100
                </p>
              </div>
            </div>

            {/* User Behavior */}
            {(comp.avg_time_on_page || comp.bounce_rate) && (
              <div className="grid grid-cols-2 gap-2">
                {comp.avg_time_on_page && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Time on page:</span>
                    <span className="font-semibold">{Math.floor(comp.avg_time_on_page / 60)}m {comp.avg_time_on_page % 60}s</span>
                  </div>
                )}
                {comp.bounce_rate && (
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Bounce rate:</span>
                    <span className="font-semibold">{comp.bounce_rate}%</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            {comp.cta_buttons && comp.cta_buttons.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-2">
                  <MessageSquare className="w-3 h-3" />
                  Call-to-Action Buttons
                </p>
                <div className="flex flex-wrap gap-2">
                  {comp.cta_buttons.map((cta, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cta}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {comp.strengths && comp.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-2">
                  <CheckCircle2 className="w-3 h-3" />
                  What Makes It Rank
                </p>
                <ul className="space-y-1">
                  {comp.strengths.map((strength, i) => (
                    <li key={i} className="text-xs text-gray-700 pl-4 relative before:content-['✓'] before:absolute before:left-0 before:text-green-600">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {comp.opportunities && comp.opportunities.length > 0 && (
              <div className="bg-blue-50 rounded-md p-3">
                <p className="text-xs font-medium text-blue-700 flex items-center gap-1 mb-2">
                  <Lightbulb className="w-3 h-3" />
                  Opportunities for Our Content
                </p>
                <ul className="space-y-1">
                  {comp.opportunities.map((opp, i) => (
                    <li key={i} className="text-xs text-blue-900 pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-blue-600">
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}