import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

export default function KeywordChecklist({ keywords, content }) {
  const countKeyword = (keyword) => {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    return (content.toLowerCase().match(regex) || []).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Keyword Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {keywords.map((kw, index) => {
            const current = countKeyword(kw.keyword);
            const target = kw.target_count;
            const completed = current >= target;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm">{kw.keyword}</span>
                </div>
                <span className={`text-sm font-medium ${completed ? 'text-green-600' : 'text-gray-500'}`}>
                  {current}/{target}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}