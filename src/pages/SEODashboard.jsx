import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, TrendingUp, CheckCircle, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function SEODashboard() {
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [targetKeyword, setTargetKeyword] = useState("");
  const [targetRegion, setTargetRegion] = useState("en-US");
  
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['seo-projects'],
    queryFn: () => base44.entities.SEOProject.list('-created_date', 50)
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      const project = await base44.entities.SEOProject.create(data);
      
      // Create placeholder competitor data
      await base44.entities.SEOCompetitorData.create({
        project_id: project.id,
        average_word_count: Math.floor(Math.random() * 1000) + 1000,
        average_headings: Math.floor(Math.random() * 10) + 8,
        recommended_keywords: [
          { keyword: data.target_keyword, target_count: 5 },
          { keyword: `${data.target_keyword} guide`, target_count: 3 },
          { keyword: `best ${data.target_keyword}`, target_count: 2 }
        ]
      });

      // Create empty document
      await base44.entities.SEODocument.create({
        project_id: project.id,
        content_body: "",
        meta_title: "",
        meta_description: ""
      });

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-projects'] });
      setNewProjectOpen(false);
      setTargetKeyword("");
      toast.success("Project created successfully!");
    }
  });

  const handleCreateProject = () => {
    if (!targetKeyword.trim()) {
      toast.error("Please enter a target keyword");
      return;
    }
    createProjectMutation.mutate({ target_keyword: targetKeyword, target_region: targetRegion });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'optimized': return 'bg-blue-100 text-blue-700';
      case 'published': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'optimized': return <CheckCircle className="w-4 h-4" />;
      case 'published': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Content Studio</h1>
            <p className="text-gray-600">Create content that ranks on search engines</p>
          </div>
          
          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New SEO Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Keyword</label>
                  <Input
                    placeholder="e.g., best marketing tools 2024"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language / Region</label>
                  <Select value={targetRegion} onValueChange={setTargetRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (United States)</SelectItem>
                      <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                      <SelectItem value="sk-SK">Slovak (Slovakia)</SelectItem>
                      <SelectItem value="de-DE">German (Germany)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateProject} 
                  className="w-full"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold">{projects.filter(p => p.status === 'draft').length}</p>
                </div>
                <Edit3 className="w-10 h-10 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Optimized</p>
                  <p className="text-3xl font-bold">{projects.filter(p => p.status === 'optimized').length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-3xl font-bold">{projects.filter(p => p.status === 'published').length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No projects yet. Create your first SEO project!</p>
                <Button onClick={() => setNewProjectOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Link key={project.id} to={`${createPageUrl("SEOEditor")}?id=${project.id}`}>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{project.target_keyword}</CardTitle>
                      <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{project.target_region}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Content Score</span>
                          <span className="font-bold text-blue-600">{project.content_score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.content_score}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created {new Date(project.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}