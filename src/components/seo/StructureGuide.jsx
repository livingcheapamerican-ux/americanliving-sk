import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function StructureGuide({ currentWords, targetWords, currentHeadings, targetHeadings }) {
  const wordProgress = Math.min((currentWords / targetWords) * 100, 100);
  const headingProgress = Math.min((currentHeadings / targetHeadings) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4" />
          Structure Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Word Count</span>
            <span className="font-medium">{currentWords} / {targetWords}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${wordProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Headings (H2, H3)</span>
            <span className="font-medium">{currentHeadings} / {targetHeadings}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${headingProgress}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-600">
            <strong>Target:</strong> Based on top 10 ranking pages
          </p>
        </div>
      </CardContent>
    </Card>
  );
}