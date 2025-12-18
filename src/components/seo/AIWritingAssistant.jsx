import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, FileText, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function AIWritingAssistant({ projectId, onInsert }) {
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);
  const [bulletPoint, setBulletPoint] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const generateOutlineMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateSEOOutline', { project_id: projectId });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.outline);
      toast.success("Outline generated!");
    },
    onError: () => {
      toast.error("Failed to generate outline");
    }
  });

  const expandContentMutation = useMutation({
    mutationFn: async (text) => {
      const response = await base44.functions.invoke('expandContent', { text });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.expanded);
      toast.success("Content expanded!");
    },
    onError: () => {
      toast.error("Failed to expand content");
    }
  });

  return (
    <div className="flex gap-2">
      <Dialog open={outlineOpen} onOpenChange={setOutlineOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate Outline
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Outline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!generatedContent ? (
              <div className="text-center py-8">
                <Button 
                  onClick={() => generateOutlineMutation.mutate()}
                  disabled={generateOutlineMutation.isPending}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateOutlineMutation.isPending ? "Generating..." : "Generate Outline"}
                </Button>
              </div>
            ) : (
              <>
                <Textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} rows={15} />
                <div className="flex gap-2">
                  <Button onClick={() => {
                    onInsert(generatedContent);
                    setOutlineOpen(false);
                    setGeneratedContent("");
                  }}>
                    Insert into Editor
                  </Button>
                  <Button variant="outline" onClick={() => generateOutlineMutation.mutate()}>
                    Regenerate
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={expandOpen} onOpenChange={setExpandOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Wand2 className="w-4 h-4 mr-2" />
            Expand Text
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expand Bullet Point</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your bullet point or idea:</label>
              <Textarea
                placeholder="E.g., Marketing automation tools save time"
                value={bulletPoint}
                onChange={(e) => setBulletPoint(e.target.value)}
                rows={3}
              />
            </div>
            {!generatedContent ? (
              <Button 
                onClick={() => expandContentMutation.mutate(bulletPoint)}
                disabled={expandContentMutation.isPending || !bulletPoint.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {expandContentMutation.isPending ? "Expanding..." : "Expand into Paragraph"}
              </Button>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">Expanded content:</label>
                  <Textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} rows={10} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    onInsert(generatedContent);
                    setExpandOpen(false);
                    setGeneratedContent("");
                    setBulletPoint("");
                  }}>
                    Insert into Editor
                  </Button>
                  <Button variant="outline" onClick={() => expandContentMutation.mutate(bulletPoint)}>
                    Regenerate
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}