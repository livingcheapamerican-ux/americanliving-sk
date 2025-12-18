import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function SEOScoreGauge({ score }) {
  const getColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradient = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Content Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(score / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${getGradient(score).split(' ')[0].replace('from-', '')}`} />
                  <stop offset="100%" className={`${getGradient(score).split(' ')[1].replace('to-', '')}`} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getColor(score)}`}>{score}</div>
                <div className="text-sm text-gray-500">/ 100</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            {score >= 80 && "Excellent! Your content is well optimized."}
            {score >= 60 && score < 80 && "Good progress! Keep optimizing."}
            {score < 60 && "Needs improvement. Follow the guidelines."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}