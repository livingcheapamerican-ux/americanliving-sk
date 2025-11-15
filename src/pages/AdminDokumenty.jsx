import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Upload, FileText, Trash2, Download, Search, 
  AlertCircle, CheckCircle, Loader2, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDokumenty() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nazov: "",
    popis: "",
    typ: "iné",
    pre_chatbota: true,
    tags: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [tagInput, setTagInput] = useState("");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading } = useQuery({
    queryKey: ['dokumenty'],
    queryFn: () => base44.entities.Dokument.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Dokument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty'] });
      setShowForm(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Dokument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty'] });
    }
  });

  const resetForm = () => {
    setFormData({
      nazov: "",
      popis: "",
      typ: "iné",
      pre_chatbota: true,
      tags: []
    });
    setSelectedFile(null);
    setTagInput("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.nazov) {
        setFormData({ ...formData, nazov: file.name });
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Vyberte súbor");
      return;
    }

    setUploading(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      await createMutation.mutateAsync({
        ...formData,
        subor_url: file_url,
        velkost: selectedFile.size,
        typ_suboru: selectedFile.type
      });
    } catch (error) {
      alert("Chyba pri uploade: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredDokumenty = dokumenty.filter(dok => 
    dok.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dok.popis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dok.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('text')) return '📝';
    return '📄';
  };

  const typLabels = {
    cennik: "Cenník",
    technická_špecifikácia: "Technická špecifikácia",
    návod: "Návod",
    certifikát: "Certifikát",
    FAQ: "FAQ",
    iné: "Iné"
  };

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-500">Táto stránka je dostupná len pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Správa dokumentov</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Hľadať dokumenty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary">
              <Upload className="w-4 h-4 mr-2" />
              Nahrať dokument
            </Button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-6 mb-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Súbor *</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          onChange={handleFileSelect}
                          required
                        />
                        {selectedFile && (
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Názov *</Label>
                        <Input
                          value={formData.nazov}
                          onChange={(e) => setFormData({...formData, nazov: e.target.value})}
                          placeholder="Cenník modulárnych domov 2025"
                          required
                        />
                      </div>
                      <div>
                        <Label>Typ *</Label>
                        <Select
                          value={formData.typ}
                          onValueChange={(value) => setFormData({...formData, typ: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(typLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Popis</Label>
                      <Textarea
                        value={formData.popis}
                        onChange={(e) => setFormData({...formData, popis: e.target.value})}
                        placeholder="Detailný popis dokumentu..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Tagy</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Pridať tag..."
                        />
                        <Button type="button" onClick={handleAddTag} variant="outline">
                          Pridať
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => handleRemoveTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.pre_chatbota}
                        onCheckedChange={(checked) => setFormData({...formData, pre_chatbota: checked})}
                      />
                      <Label>Použiť ako zdroj vedomostí pre chatbota</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={uploading} className="bg-primary">
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Nahrávam...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Nahrať
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                      >
                        Zrušiť
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-gray-600">Načítavam dokumenty...</p>
            </div>
          ) : filteredDokumenty.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {searchQuery ? "Nenašli sa žiadne dokumenty" : "Žiadne dokumenty"}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Skúste iný vyhľadávací výraz" : "Nahrajte prvý dokument"}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDokumenty.map((dok, index) => (
                <motion.div
                  key={dok.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">
                        {getFileIcon(dok.typ_suboru)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{dok.nazov}</h3>
                            {dok.popis && (
                              <p className="text-sm text-gray-600 mt-1">{dok.popis}</p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <a href={dok.subor_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-1" />
                                Stiahnuť
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (window.confirm('Naozaj chcete vymazať tento dokument?')) {
                                  deleteMutation.mutate(dok.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline">{typLabels[dok.typ]}</Badge>
                          <Badge variant="secondary">{formatFileSize(dok.velkost)}</Badge>
                          {dok.pre_chatbota && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pre chatbota
                            </Badge>
                          )}
                          {dok.tags?.map(tag => (
                            <Badge key={tag} className="bg-blue-100 text-blue-800">
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(dok.created_date).toLocaleDateString('sk-SK')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}