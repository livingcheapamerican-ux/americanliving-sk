import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import SEOScoreGauge from "../components/seo/SEOScoreGauge";
import KeywordChecklist from "../components/seo/KeywordChecklist";
import StructureGuide from "../components/seo/StructureGuide";
import AIWritingAssistant from "../components/seo/AIWritingAssistant";

export default function SEOEditor() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const projectId = params.get("id");
  
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['seo-project', projectId],
    queryFn: () => base44.entities.SEOProject.filter({ id: projectId }).then(r => r[0]),
    enabled: !!projectId
  });

  const { data: document } = useQuery({
    queryKey: ['seo-document', projectId],
    queryFn: () => base44.entities.SEODocument.filter({ project_id: projectId }).then(r => r[0]),
    enabled: !!projectId
  });

  const { data: competitorData } = useQuery({
    queryKey: ['competitor-data', projectId],
    queryFn: () => base44.entities.SEOCompetitorData.filter({ project_id: projectId }).then(r => r[0]),
    enabled: !!projectId
  });

  useEffect(() => {
    if (document) {
      setContent(document.content_body || "");
      setMetaTitle(document.meta_title || "");
      setMetaDescription(document.meta_description || "");
    }
  }, [document]);

  // Calculate SEO metrics
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const headingCount = (content.match(/<h[2-3]>/g) || []).length;
  const keywordCount = project ? (content.toLowerCase().match(new RegExp(project.target_keyword.toLowerCase(), 'g')) || []).length : 0;

  // Calculate content score
  const calculateScore = () => {
    if (!project || !competitorData) return 0;
    
    let score = 0;
    const targetWords = competitorData.average_word_count || 1500;
    const targetHeadings = competitorData.average_headings || 12;
    
    // Word count (40 points)
    if (wordCount >= targetWords * 0.9) score += 40;
    else score += (wordCount / targetWords) * 40;
    
    // Heading count (30 points)
    if (headingCount >= targetHeadings) score += 30;
    else score += (headingCount / targetHeadings) * 30;
    
    // Keyword usage (30 points)
    const targetKeywordCount = 5;
    if (keywordCount >= targetKeywordCount) score += 30;
    else score += (keywordCount / targetKeywordCount) * 30;
    
    return Math.min(Math.round(score), 100);
  };

  const contentScore = calculateScore();

  const saveDocumentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SEODocument.update(document.id, {
        content_body: content,
        meta_title: metaTitle,
        meta_description: metaDescription,
        word_count: wordCount,
        heading_count: headingCount
      });

      await base44.entities.SEOProject.update(projectId, {
        content_score: contentScore
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-document', projectId] });
      queryClient.invalidateQueries({ queryKey: ['seo-project', projectId] });
      toast.success("Document saved!");
    }
  });

  if (!project) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("SEODashboard")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{project.target_keyword}</h1>
            <p className="text-sm text-gray-500">{project.target_region}</p>
          </div>
        </div>
        <Button onClick={() => saveDocumentMutation.mutate()} disabled={saveDocumentMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveDocumentMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Editor */}
        <div className="flex-1 p-6 overflow-auto">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Meta Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium">Meta Title</label>
                <Input
                  placeholder="Your SEO title..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60</p>
              </div>
              <div>
                <label className="text-xs font-medium">Meta Description</label>
                <Textarea
                  placeholder="Your SEO description..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Content Editor</CardTitle>
                <AIWritingAssistant projectId={projectId} onInsert={(text) => setContent(content + "\n\n" + text)} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your SEO-optimized content here..."
                className="min-h-[600px] font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">
                {wordCount} words · {headingCount} headings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - SEO Tools */}
        <div className="w-96 bg-white border-l p-6 overflow-auto">
          <SEOScoreGauge score={contentScore} />
          
          <div className="mt-6">
            <StructureGuide
              currentWords={wordCount}
              targetWords={competitorData?.average_word_count || 1500}
              currentHeadings={headingCount}
              targetHeadings={competitorData?.average_headings || 12}
            />
          </div>

          <div className="mt-6">
            <KeywordChecklist
              keywords={competitorData?.recommended_keywords || []}
              content={content}
            />
          </div>
        </div>
      </div>
    </div>
  );
}