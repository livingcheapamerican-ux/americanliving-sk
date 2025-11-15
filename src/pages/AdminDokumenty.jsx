
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, FileText, Trash2, Download, Search, 
  AlertCircle, CheckCircle, Loader2, X, Building2, FolderOpen, Brain, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDokumenty() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedVyrobca, setSelectedVyrobca] = useState("all");
  const [uploadMode, setUploadMode] = useState("files"); // "files" or "folder"
  const [viewingDocument, setViewingDocument] = useState(null); // NEW: State for viewing analysis modal
  const [formData, setFormData] = useState({
    popis: "",
    typ: "iné",
    vyrobca: "American Living",
    pre_chatbota: true,
    tags: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

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
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Dokument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty'] });
    }
  });

  // NEW: Mutation for analyzing documents
  const analyzeMutation = useMutation({
    mutationFn: async (documentId) => {
      const response = await base44.functions.invoke('analyzujDokument', { document_id: documentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty'] });
    }
  });

  const resetForm = () => {
    setFormData({
      popis: "",
      typ: "iné",
      vyrobca: "American Living",
      pre_chatbota: true,
      tags: []
    });
    setSelectedFiles([]);
    setTagInput("");
    setUploadProgress({ current: 0, total: 0 });
    setUploadMode("files");
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
    
    if (selectedFiles.length === 0) {
      alert("Vyberte aspoň jeden súbor");
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });
    
    try {
      const uploadedDocIds = []; // NEW: To store IDs of uploaded documents for subsequent analysis
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress({ current: i + 1, total: selectedFiles.length });
        
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const doc = await createMutation.mutateAsync({
          nazov: file.name,
          popis: formData.popis,
          typ: formData.typ,
          vyrobca: formData.vyrobca,
          pre_chatbota: formData.pre_chatbota,
          tags: formData.tags,
          subor_url: file_url,
          velkost: file.size,
          typ_suboru: file.type
        });
        uploadedDocIds.push(doc.id); // NEW: Add document ID to the list
      }
      
      // NEW: Automatically analyze all uploaded documents
      setUploadProgress({ current: 0, total: uploadedDocIds.length });
      for (let i = 0; i < uploadedDocIds.length; i++) {
        setUploadProgress({ current: i + 1, total: uploadedDocIds.length });
        try {
          await analyzeMutation.mutateAsync(uploadedDocIds[i]);
        } catch (error) {
          console.error('Analysis error for doc', uploadedDocIds[i], error);
        }
      }
      
      setShowForm(false);
      resetForm();
    } catch (error) {
      alert("Chyba pri uploade: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const vyrobcovia = ["American Living", "JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];

  const filteredDokumenty = dokumenty.filter(dok => {
    const matchesSearch = dok.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dok.popis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dok.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesVyrobca = selectedVyrobca === "all" || dok.vyrobca === selectedVyrobca;
    
    return matchesSearch && matchesVyrobca;
  });

  const getVyrobcaCount = (vyrobca) => {
    return dokumenty.filter(d => d.vyrobca === vyrobca).length;
  };

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
    blog: "Blog",
    fotky: "Fotky",
    iné: "Iné"
  };

  const vyrobcaColors = {
    "American Living": "bg-blue-100 text-blue-800",
    "JAK Modules": "bg-purple-100 text-purple-800",
    "Ticab house": "bg-green-100 text-green-800",
    "Prosto House": "bg-orange-100 text-orange-800",
    "Domki z Gór": "bg-pink-100 text-pink-800"
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
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Správa dokumentov</h1>
          </div>

          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /> {/* CHANGED ICON */}
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Automatická AI analýza</p> {/* CHANGED TEXT */}
                <p>Všetky nahrané dokumenty sú automaticky analyzované. AI extrahuje informácie o modeloch domov, cenách, technických parametroch a rozpozná o ktorých domoch sa píše.</p> {/* CHANGED TEXT */}
              </div>
            </div>
          </Card>

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
              Nahrať dokumenty
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
                      <Label>Režim nahrávania</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant={uploadMode === "files" ? "default" : "outline"}
                          onClick={() => {
                            setUploadMode("files");
                            setSelectedFiles([]);
                          }}
                          className="flex-1"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Súbory
                        </Button>
                        <Button
                          type="button"
                          variant={uploadMode === "folder" ? "default" : "outline"}
                          onClick={() => {
                            setUploadMode("folder");
                            setSelectedFiles([]);
                          }}
                          className="flex-1"
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Celý priečinok
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>{uploadMode === "folder" ? "Priečinok *" : "Súbory *"}</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          onChange={handleFileSelect}
                          multiple={uploadMode === "files"}
                          webkitdirectory={uploadMode === "folder" ? "" : undefined}
                          directory={uploadMode === "folder" ? "" : undefined}
                          required
                        />
                        {selectedFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Vybraných {selectedFiles.length} súborov:
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getFileIcon(file.type)}</span>
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                  </div>
                                  {uploadMode === "files" && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Výrobca *</Label>
                        <Select
                          value={formData.vyrobca}
                          onValueChange={(value) => setFormData({...formData, vyrobca: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {vyrobcovia.map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.vyrobca === "American Living" && (
                          <p className="text-xs text-gray-500 mt-1">Obchodný model, fungovanie, know-how, blog</p>
                        )}
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
                      <Label>Popis (platí pre všetky súbory)</Label>
                      <Textarea
                        value={formData.popis}
                        onChange={(e) => setFormData({...formData, popis: e.target.value})}
                        placeholder="Detailný popis dokumentov..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Tagy (platia pre všetky súbory)</Label>
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

                    {uploading && uploadProgress.total > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          {analyzeMutation.isPending ? 
                            `Analyzujem ${uploadProgress.current} z ${uploadProgress.total} dokumentov...` :
                            `Nahrávam ${uploadProgress.current} z ${uploadProgress.total} súborov...`
                          }
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

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
                            Nahrať {selectedFiles.length > 0 && `(${selectedFiles.length})`}
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

          <Tabs value={selectedVyrobca} onValueChange={setSelectedVyrobca} className="mb-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
              <TabsTrigger value="all">
                Všetky ({dokumenty.length})
              </TabsTrigger>
              {vyrobcovia.map(v => (
                <TabsTrigger key={v} value={v}>
                  {v.split(' ')[0]} ({getVyrobcaCount(v)})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

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
                {searchQuery ? "Skúste iný vyhľadávací výraz" : `Nahrajte prvý dokument pre ${selectedVyrobca === "all" ? "výrobcov" : selectedVyrobca}`}
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
                            {dok.analyzovaný && ( // NEW: Show analysis button if document is analyzed
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingDocument(dok)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Analýza
                              </Button>
                            )}
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
                          <Badge className={vyrobcaColors[dok.vyrobca]}>
                            <Building2 className="w-3 h-3 mr-1" />
                            {dok.vyrobca}
                          </Badge>
                          <Badge variant="outline">{typLabels[dok.typ]}</Badge>
                          <Badge variant="secondary">{formatFileSize(dok.velkost)}</Badge>
                          {dok.pre_chatbota && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pre chatbota
                            </Badge>
                          )}
                          {dok.analyzovaný && ( // NEW: Show analysis badge if document is analyzed
                            <Badge className="bg-purple-100 text-purple-800">
                              <Brain className="w-3 h-3 mr-1" />
                              Analyzované AI
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

          {/* NEW: Modal pre zobrazenie analýzy */}
          <AnimatePresence>
            {viewingDocument && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setViewingDocument(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">AI Analýza dokumentu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setViewingDocument(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Dokument:</h3>
                      <p className="text-gray-700">{viewingDocument.nazov}</p>
                    </div>

                    {viewingDocument.extrahovaný_obsah && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Extrahovaný obsah:</h3>
                        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                          {viewingDocument.extrahovaný_obsah}
                        </p>
                      </div>
                    )}

                    {viewingDocument.kľúčové_informácie && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Kľúčové informácie:</h3>
                        <div className="space-y-3">
                          {viewingDocument.kľúčové_informácie.modely_domov?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Modely domov:</p>
                              <div className="flex flex-wrap gap-2">
                                {viewingDocument.kľúčové_informácie.modely_domov.map((model, i) => (
                                  <Badge key={i} className="bg-blue-100 text-blue-800">{model}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {viewingDocument.kľúčové_informácie.cenové_informácie?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Cenové informácie:</p>
                              <ul className="list-disc list-inside text-gray-700">
                                {viewingDocument.kľúčové_informácie.cenové_informácie.map((info, i) => (
                                  <li key={i}>{info}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {viewingDocument.kľúčové_informácie.technické_údaje?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Technické údaje:</p>
                              <ul className="list-disc list-inside text-gray-700">
                                {viewingDocument.kľúčové_informácie.technické_údaje.map((info, i) => (
                                  <li key={i}>{info}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {viewingDocument.kľúčové_informácie.ostatné?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Ostatné:</p>
                              <ul className="list-disc list-inside text-gray-700">
                                {viewingDocument.kľúčové_informácie.ostatné.map((info, i) => (
                                  <li key={i}>{info}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
