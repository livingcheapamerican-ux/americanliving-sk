import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, MessageSquare, CheckCircle2, Lightbulb } from "lucide-react";

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