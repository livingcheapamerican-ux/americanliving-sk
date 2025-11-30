import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, AlertCircle, CheckCircle, Loader2, X, Trash2, Image as ImageIcon, Star, Settings, Images, RotateCcw, Archive, Sparkles, ArrowRight, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import GoogleDrivePhotoImport from "../components/GoogleDrivePhotoImport";

export default function AdminUploadFotiekDomov() {
  const [selectedDomIds, setSelectedDomIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [uploadResults, setUploadResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedTicabDomIds, setSelectedTicabDomIds] = useState([]);
  const [selectedProstoDomIds, setSelectedProstoDomIds] = useState([]);
  const [selectedOldPhotos, setSelectedOldPhotos] = useState([]);
  const [selectedNewPhotos, setSelectedNewPhotos] = useState([]);
  const [processingPhotos, setProcessingPhotos] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-all'],
    queryFn: () => base44.entities.Dom.list()
  });

  const updateDomMutation = useMutation({
    mutationFn: ({ domId, data }) => base44.entities.Dom.update(domId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domy-all'] });
    }
  });

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );
    
    if (imageFiles.length === 0) {
      toast.error('Neboli nájdené žiadne obrázky');
      return;
    }
    
    const filesWithPreviews = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'galeria',
      status: 'pending'
    }));
    
    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
    toast.success(`Pridané ${imageFiles.length} fotiek`);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );
    
    if (imageFiles.length === 0) {
      toast.error('Neboli nájdené žiadne obrázky');
      return;
    }
    
    const filesWithPreviews = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'galeria',
      status: 'pending' // pending, uploading, success, error
    }));
    
    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
    toast.success(`Pridané ${imageFiles.length} fotiek`);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFileType = (index, type) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].type = type;
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (selectedDomIds.length === 0) {
      toast.error("Vyberte aspoň jeden dom");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Vyberte fotky");
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length, currentFile: '' });

    const results = { successful: [], failed: [] };
    const uploadedUrls = [];

    // Upload all files first
    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, type } = selectedFiles[i];
      
      setSelectedFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' } : f
      ));
      setUploadProgress({ current: i, total: selectedFiles.length, currentFile: file.name });
      
      try {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push({ url: uploadResponse.file_url, type });
        results.successful.push({ name: file.name, type });
        
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' } : f
        ));
        
      } catch (error) {
        results.failed.push({ name: file.name, error: error.message });
        
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', errorMessage: error.message } : f
        ));
        
        toast.error(`Chyba: ${file.name}`);
      }
      
      setUploadProgress({ current: i + 1, total: selectedFiles.length, currentFile: '' });
    }

    // Update all selected doms
    for (const domId of selectedDomIds) {
      const dom = domy.find(d => d.id === domId);
      if (!dom) continue;

      try {
        const updateData = {};
        
        const hlavnyUrl = uploadedUrls.find(u => u.type === 'hlavny_obrazok')?.url;
        const zakladnaUrl = uploadedUrls.find(u => u.type === 'zakladna_konfiguracia')?.url;
        const galeriaUrls = uploadedUrls.filter(u => u.type === 'galeria').map(u => u.url);

        if (hlavnyUrl) updateData.hlavny_obrazok = hlavnyUrl;
        if (zakladnaUrl) updateData.zakladna_konfiguracia_obrazok = zakladnaUrl;
        if (galeriaUrls.length > 0) {
          updateData.galeria = [...(dom.galeria || []), ...galeriaUrls];
        }

        if (Object.keys(updateData).length > 0) {
          await updateDomMutation.mutateAsync({ domId: dom.id, data: updateData });
        }
      } catch (error) {
        toast.error(`Chyba pri aktualizácii ${dom.nazov}: ${error.message}`);
      }
    }

    toast.success(`Fotky boli nahrané do ${selectedDomIds.length} domov`);
    setUploadResults(results);
    setUploading(false);
    setSelectedFiles(prev => prev.filter(f => f.status === 'error'));
  };

  const retryFailedUpload = (index) => {
    setSelectedFiles(prev => prev.map((f, idx) => 
      idx === index ? { ...f, status: 'pending', errorMessage: undefined } : f
    ));
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hlavny_obrazok': return <Star className="w-4 h-4" />;
      case 'zakladna_konfiguracia': return <Settings className="w-4 h-4" />;
      default: return <Images className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'hlavny_obrazok': return 'Hlavný';
      case 'zakladna_konfiguracia': return 'Základná';
      default: return 'Galéria';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hlavny_obrazok': return 'bg-amber-500';
      case 'zakladna_konfiguracia': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDeleteImage = async (domId, imageType, imageUrl = null) => {
    const dom = domy.find(d => d.id === domId);
    if (!dom) return;

    const confirmMsg = imageType === 'hlavny_obrazok' 
      ? 'Naozaj chcete vymazať hlavný obrázok?' 
      : imageType === 'zakladna_konfiguracia'
      ? 'Naozaj chcete vymazať obrázok základnej konfigurácie?'
      : 'Naozaj chcete vymazať túto fotku z galérie?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const updateData = {};
      
      if (imageType === 'hlavny_obrazok') {
        updateData.hlavny_obrazok = null;
      } else if (imageType === 'zakladna_konfiguracia') {
        updateData.zakladna_konfiguracia_obrazok = null;
      } else if (imageType === 'galeria' && imageUrl) {
        const newGaleria = (dom.galeria || []).filter(url => url !== imageUrl);
        updateData.galeria = newGaleria;
      }

      await updateDomMutation.mutateAsync({ domId: dom.id, data: updateData });
      alert('Fotka bola úspešne vymazaná');
    } catch (error) {
      alert(`Chyba pri vymazávaní: ${error.message}`);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.super_admin === true;

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-600">Táto stránka je dostupná len pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  const selectedDom = selectedDomIds.length === 1 ? domy.find(d => d.id === selectedDomIds[0]) : null;
  
  // Ticab house domy pre správu starých/nových fotiek
      const ticabDomy = domy.filter(d => d.vyrobca === 'Ticab house');
      const selectedTicabDomy = ticabDomy.filter(d => selectedTicabDomIds.includes(d.id));
      const selectedTicabDom = selectedTicabDomy.length === 1 ? selectedTicabDomy[0] : null;

      // Prosto House domy
      const prostoDomy = domy.filter(d => d.vyrobca === 'Prosto House');
      const selectedProstoDomy = prostoDomy.filter(d => selectedProstoDomIds.includes(d.id));

  // Presun označených starých fotiek do zoznamu stare_fotky
  const archiveSelectedPhotos = async () => {
    if (!selectedTicabDom || selectedOldPhotos.length === 0) return;
    
    setProcessingPhotos(true);
    try {
      const currentStareFotky = selectedTicabDom.stare_fotky || [];
      const currentGaleria = selectedTicabDom.galeria || [];
      
      // Presunúť vybrané fotky do stare_fotky
      const newStareFotky = [...currentStareFotky, ...selectedOldPhotos];
      // Odstrániť z galérie
      const newGaleria = currentGaleria.filter(url => !selectedOldPhotos.includes(url));
      
      // Skontrolovať aj hlavný obrázok
      let newHlavny = selectedTicabDom.hlavny_obrazok;
      if (selectedOldPhotos.includes(selectedTicabDom.hlavny_obrazok)) {
        newHlavny = null;
      }
      
      await updateDomMutation.mutateAsync({
        domId: selectedTicabDom.id,
        data: {
          stare_fotky: newStareFotky,
          galeria: newGaleria,
          hlavny_obrazok: newHlavny
        }
      });
      
      setSelectedOldPhotos([]);
      toast.success(`${selectedOldPhotos.length} fotiek presunutých do archívu`);
    } catch (error) {
      toast.error(`Chyba: ${error.message}`);
    }
    setProcessingPhotos(false);
  };

  // Nastaviť fotku z nových ako hlavný obrázok
  const setAsMainPhoto = async (photoUrl) => {
    if (!selectedTicabDom) return;
    
    setProcessingPhotos(true);
    try {
      // Ak už je hlavný obrázok, presunúť ho do starých
      const currentStareFotky = selectedTicabDom.stare_fotky || [];
      const noveFotky = selectedTicabDom.nove_fotky || [];
      
      let newStareFotky = [...currentStareFotky];
      if (selectedTicabDom.hlavny_obrazok) {
        newStareFotky.push(selectedTicabDom.hlavny_obrazok);
      }
      
      // Odstrániť fotku z nove_fotky
      const newNoveFotky = noveFotky.filter(url => url !== photoUrl);
      
      await updateDomMutation.mutateAsync({
        domId: selectedTicabDom.id,
        data: {
          hlavny_obrazok: photoUrl,
          stare_fotky: newStareFotky,
          nove_fotky: newNoveFotky
        }
      });
      
      toast.success('Hlavný obrázok bol zmenený');
    } catch (error) {
      toast.error(`Chyba: ${error.message}`);
    }
    setProcessingPhotos(false);
  };

  // Pridať nové fotky do galérie
  const addNewPhotosToGallery = async () => {
    if (!selectedTicabDom || selectedNewPhotos.length === 0) return;
    
    setProcessingPhotos(true);
    try {
      const currentGaleria = selectedTicabDom.galeria || [];
      const noveFotky = selectedTicabDom.nove_fotky || [];
      
      // Pridať vybrané do galérie
      const newGaleria = [...currentGaleria, ...selectedNewPhotos];
      // Odstrániť z nove_fotky
      const newNoveFotky = noveFotky.filter(url => !selectedNewPhotos.includes(url));
      
      await updateDomMutation.mutateAsync({
        domId: selectedTicabDom.id,
        data: {
          galeria: newGaleria,
          nove_fotky: newNoveFotky
        }
      });
      
      setSelectedNewPhotos([]);
      toast.success(`${selectedNewPhotos.length} fotiek pridaných do galérie`);
    } catch (error) {
      toast.error(`Chyba: ${error.message}`);
    }
    setProcessingPhotos(false);
  };

  // Nahraj nové fotky priamo pre Ticab domy (viacero naraz)
      const handleTicabNewPhotosUpload = async (files) => {
        if (selectedTicabDomIds.length === 0) {
          toast.error('Vyberte aspoň jeden dom');
          return;
        }

        setProcessingPhotos(true);
        const uploadedUrls = [];

        for (const file of files) {
          try {
            const uploadResponse = await base44.integrations.Core.UploadFile({ file });
            uploadedUrls.push(uploadResponse.file_url);
          } catch (error) {
            toast.error(`Chyba pri nahrávaní ${file.name}`);
          }
        }

        if (uploadedUrls.length > 0) {
          // Nahrať do všetkých vybraných domov
          for (const domId of selectedTicabDomIds) {
            const dom = ticabDomy.find(d => d.id === domId);
            if (!dom) continue;

            try {
              const currentNoveFotky = dom.nove_fotky || [];
              await updateDomMutation.mutateAsync({
                domId: dom.id,
                data: {
                  nove_fotky: [...currentNoveFotky, ...uploadedUrls]
                }
              });
            } catch (error) {
              toast.error(`Chyba pri ukladaní do ${dom.nazov}: ${error.message}`);
            }
          }
          toast.success(`${uploadedUrls.length} fotiek nahratých do ${selectedTicabDomIds.length} domov`);
        }
        setProcessingPhotos(false);
      };

      // Nahraj nové fotky priamo pre Prosto domy (viacero naraz)
      const handleProstoNewPhotosUpload = async (files) => {
        if (selectedProstoDomIds.length === 0) {
          toast.error('Vyberte aspoň jeden dom');
          return;
        }

        setProcessingPhotos(true);
        const uploadedUrls = [];

        for (const file of files) {
          try {
            const uploadResponse = await base44.integrations.Core.UploadFile({ file });
            uploadedUrls.push(uploadResponse.file_url);
          } catch (error) {
            toast.error(`Chyba pri nahrávaní ${file.name}`);
          }
        }

        if (uploadedUrls.length > 0) {
          for (const domId of selectedProstoDomIds) {
            const dom = prostoDomy.find(d => d.id === domId);
            if (!dom) continue;

            try {
              const currentNoveFotky = dom.nove_fotky || [];
              await updateDomMutation.mutateAsync({
                domId: dom.id,
                data: {
                  nove_fotky: [...currentNoveFotky, ...uploadedUrls]
                }
              });
            } catch (error) {
              toast.error(`Chyba pri ukladaní do ${dom.nazov}: ${error.message}`);
            }
          }
          toast.success(`${uploadedUrls.length} fotiek nahratých do ${selectedProstoDomIds.length} domov`);
        }
        setProcessingPhotos(false);
      };

  // Toggle výber fotky
  const toggleOldPhotoSelection = (url) => {
    setSelectedOldPhotos(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const toggleNewPhotoSelection = (url) => {
    setSelectedNewPhotos(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Rýchly upload fotiek do internej pamäte (bez priradenia k domu)
  const handleQuickUpload = async (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Neboli nájdené žiadne obrázky');
      return;
    }
    
    setProcessingPhotos(true);
    let uploaded = 0;
    
    for (const file of imageFiles) {
      try {
        await base44.integrations.Core.UploadFile({ file });
        uploaded++;
      } catch (error) {
        toast.error(`Chyba: ${file.name}`);
      }
    }
    
    setProcessingPhotos(false);
    if (uploaded > 0) {
      toast.success(`Nahratých ${uploaded} fotiek do internej pamäte`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Správa fotiek domov</h1>
                <p className="text-sm text-gray-600 mt-1">Nahrávanie a výmena fotiek</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Nahrať fotky
              </TabsTrigger>
              <TabsTrigger value="gdrive" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Google Drive
              </TabsTrigger>
              <TabsTrigger value="ticab" className="flex items-center gap-2">
                                  <Archive className="w-4 h-4" />
                                  Ticab House
                                </TabsTrigger>
                                <TabsTrigger value="prosto" className="flex items-center gap-2">
                                  <Archive className="w-4 h-4" />
                                  Prosto House
                                </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Google Drive Import Tab */}
          {activeTab === 'gdrive' && (
            <Card className="p-6 border-0 shadow-xl bg-white">
              <GoogleDrivePhotoImport 
                domy={domy}
                onImportComplete={(uploadedFiles) => {
                  // Po importe aktualizovať zoznam domov
                  queryClient.invalidateQueries({ queryKey: ['domy-all'] });
                  toast.success(`Importovaných ${uploadedFiles.length} fotiek z Google Drive`);
                }}
              />
            </Card>
          )}

          {activeTab === 'upload' && (
          <>
          {/* Upload Results */}
          {uploadResults && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-6 mb-6 border-0 shadow-lg bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Výsledky nahrávania
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setUploadResults(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {uploadResults.successful.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">Úspešne: {uploadResults.successful.length}</span>
                        </div>
                      </div>
                    )}

                    {uploadResults.failed.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">Chybné: {uploadResults.failed.length}</span>
                        </div>
                        <div className="text-sm text-red-800 space-y-1">
                          {uploadResults.failed.map((item, i) => (
                            <div key={i}>✗ {item.name}: {item.error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Select Doms */}
          <Card className="p-6 mb-6 border-0 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                1. Vyberte domy * ({selectedDomIds.length} vybraných)
              </label>
              {selectedDomIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedDomIds([])}>
                  Zrušiť výber
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
              {domy
                .filter(dom => !dom.nazov.toLowerCase().includes('fotky') && !dom.nazov.toLowerCase().includes('konfiguráci'))
                .map(dom => {
                  const isSelected = selectedDomIds.includes(dom.id);
                  return (
                    <button
                      key={dom.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDomIds(prev => prev.filter(id => id !== dom.id));
                        } else {
                          setSelectedDomIds(prev => [...prev, dom.id]);
                        }
                      }}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{dom.nazov}</p>
                          <p className="text-xs text-gray-500">{dom.vyrobca}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </Card>

          {/* Upload Zone */}
          {selectedDomIds.length > 0 && (
            <Card className="p-6 mb-6 border-0 shadow-xl bg-white">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                2. Nahrajte fotky *
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-100 scale-[1.02]' 
                    : 'border-blue-300 bg-blue-50/30 hover:bg-blue-50'
                }`}
              >
                <motion.div 
                  animate={{ scale: dragOver ? 1.1 : 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-base font-medium text-gray-700 mb-2">
                  {dragOver ? 'Pustite pre nahratie' : 'Pretiahnite fotky sem'}
                </p>
                <p className="text-sm text-gray-500 mb-6">alebo</p>
                <input
                  type="file"
                  onChange={handleFilesSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="file-input"
                  disabled={uploading}
                />
                <input
                  type="file"
                  onChange={handleFilesSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="folder-input"
                  disabled={uploading}
                  webkitdirectory=""
                  directory=""
                />
                <div className="flex gap-3 justify-center">
                  <label htmlFor="file-input">
                    <Button type="button" asChild disabled={uploading} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Vyberte fotky
                      </span>
                    </Button>
                  </label>
                  <label htmlFor="folder-input">
                    <Button type="button" asChild disabled={uploading} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      <span className="cursor-pointer">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Vyberte priečinok
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Card className="p-6 mb-6 border-0 shadow-xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Vybrané fotky ({selectedFiles.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearAllFiles}
                    disabled={uploading}
                    className="text-gray-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Vymazať všetky
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.every(f => f.status === 'success')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Nahrávam {uploadProgress.current}/{uploadProgress.total}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Nahrať všetky
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                <AnimatePresence>
                  {selectedFiles.map((fileData, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`border rounded-xl p-4 transition-all ${
                        fileData.status === 'success' ? 'border-green-300 bg-green-50' :
                        fileData.status === 'error' ? 'border-red-300 bg-red-50' :
                        fileData.status === 'uploading' ? 'border-blue-300 bg-blue-50' :
                        'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Preview */}
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                          <img src={fileData.preview} alt={fileData.file.name} className="w-full h-full object-cover" />
                          
                          {/* Status overlay */}
                          {fileData.status === 'uploading' && (
                            <div className="absolute inset-0 bg-blue-500/70 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                          )}
                          {fileData.status === 'success' && (
                            <div className="absolute inset-0 bg-green-500/70 flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                          )}
                          {fileData.status === 'error' && (
                            <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                              <AlertCircle className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* File info */}
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{fileData.file.name}</p>
                              <p className="text-sm text-gray-500">{(fileData.file.size / 1024).toFixed(1)} KB</p>
                              {fileData.errorMessage && (
                                <p className="text-xs text-red-600 mt-1">{fileData.errorMessage}</p>
                              )}
                            </div>
                            
                            <div className="flex gap-1 flex-shrink-0">
                              {fileData.status === 'error' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => retryFailedUpload(index)} className="text-blue-600 hover:text-blue-700">
                                        <RotateCcw className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Skúsiť znova</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFile(index)}
                                disabled={fileData.status === 'uploading'}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Type selector */}
                          <div className="flex gap-2 mt-2">
                            <TooltipProvider>
                              {['galeria', 'hlavny_obrazok', 'zakladna_konfiguracia'].map((type) => (
                                <Tooltip key={type}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => updateFileType(index, type)}
                                      disabled={fileData.status === 'uploading' || fileData.status === 'success'}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        fileData.type === type
                                          ? `${getTypeColor(type)} text-white shadow-md`
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      } ${(fileData.status === 'uploading' || fileData.status === 'success') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      {getTypeIcon(type)}
                                      {getTypeLabel(type)}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {type === 'hlavny_obrazok' && 'Hlavný obrázok domu (zobrazí sa v katalógu)'}
                                    {type === 'zakladna_konfiguracia' && 'Obrázok základnej konfigurácie'}
                                    {type === 'galeria' && 'Fotka do galérie'}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          )}

          {/* Progress Bar */}
          {uploading && (
            <Card className="p-6 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Nahrávanie prebieha
                </h3>
                <span className="text-lg font-bold text-blue-700">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </span>
              </div>
              <Progress 
                value={(uploadProgress.current / uploadProgress.total) * 100} 
                className="h-3 mb-3"
              />
              <div className="flex items-center justify-between text-sm">
                <p className="text-blue-800">
                  {uploadProgress.current} / {uploadProgress.total} fotiek
                </p>
                {uploadProgress.currentFile && (
                  <p className="text-blue-600 truncate max-w-xs">
                    {uploadProgress.currentFile}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Delete Photos Section */}
          {selectedDomIds.length === 1 && domy.find(d => d.id === selectedDomIds[0]) && (
            <Card className="p-6 border-0 shadow-xl bg-white mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Existujúce fotky</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedDom.nazov}</p>
                </div>
              </div>

              <div className="space-y-6">
                {selectedDom.hlavny_obrazok && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Hlavný obrázok</h3>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(selectedDom.id, 'hlavny_obrazok')}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Vymazať
                      </Button>
                    </div>
                    <div className="w-full max-w-md">
                      <img src={selectedDom.hlavny_obrazok} alt="Hlavný obrázok" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  </div>
                )}

                {selectedDom.zakladna_konfiguracia_obrazok && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Základná konfigurácia</h3>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(selectedDom.id, 'zakladna_konfiguracia')}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Vymazať
                      </Button>
                    </div>
                    <div className="w-full max-w-md">
                      <img src={selectedDom.zakladna_konfiguracia_obrazok} alt="Základná konfigurácia" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  </div>
                )}

                {selectedDom.galeria && selectedDom.galeria.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Galéria ({selectedDom.galeria.length} fotiek)</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedDom.galeria.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt={`Galéria ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(selectedDom.id, 'galeria', url)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedDom.hlavny_obrazok && !selectedDom.zakladna_konfiguracia_obrazok && (!selectedDom.galeria || selectedDom.galeria.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Tento dom nemá žiadne fotky</p>
                  </div>
                )}
              </div>
            </Card>
          )}
          </>
          )}

          {/* Ticab House - Staré / Nové fotky Tab */}
          {activeTab === 'ticab' && (
            <div className="space-y-6">
              {/* Výber Ticab domov - multi-select */}
              <Card className="p-6 border-0 shadow-xl bg-white">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Vyberte Ticab House domy ({selectedTicabDomIds.length} vybraných)
                  </label>
                  <div className="flex gap-2">
                    {selectedTicabDomIds.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedTicabDomIds([]);
                        setSelectedOldPhotos([]);
                        setSelectedNewPhotos([]);
                      }}>
                        Zrušiť výber
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedTicabDomIds(ticabDomy.map(d => d.id))}
                    >
                      Vybrať všetky
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {ticabDomy.map(dom => {
                    const isSelected = selectedTicabDomIds.includes(dom.id);
                    return (
                      <button
                        key={dom.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTicabDomIds(prev => prev.filter(id => id !== dom.id));
                          } else {
                            setSelectedTicabDomIds(prev => [...prev, dom.id]);
                          }
                          setSelectedOldPhotos([]);
                          setSelectedNewPhotos([]);
                        }}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{dom.nazov}</p>
                            <div className="flex gap-1 mt-1">
                              {dom.nove_fotky?.length > 0 && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">{dom.nove_fotky.length} nových</Badge>
                              )}
                              {dom.stare_fotky?.length > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">{dom.stare_fotky.length} archív</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Upload pre viacero domov naraz */}
              {selectedTicabDomIds.length > 1 && (
                <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-900">Hromadné nahrávanie</h3>
                      <p className="text-xs text-emerald-700">Nahrať fotky do {selectedTicabDomIds.length} domov naraz</p>
                    </div>
                  </div>

                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                      if (files.length > 0) {
                        handleTicabNewPhotosUpload(files);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center bg-white/50 hover:bg-white transition-all"
                  >
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-700 mb-2">Pretiahnite fotky sem</p>
                    <p className="text-xs text-emerald-600 mb-4">Budú nahrané do všetkých {selectedTicabDomIds.length} vybraných domov</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          handleTicabNewPhotosUpload(files);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                      id="ticab-bulk-photos"
                      disabled={processingPhotos}
                    />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          handleTicabNewPhotosUpload(files);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                      id="ticab-bulk-folder"
                      disabled={processingPhotos}
                      webkitdirectory=""
                      directory=""
                    />
                    <div className="flex gap-2 justify-center">
                      <label htmlFor="ticab-bulk-photos">
                        <Button type="button" asChild disabled={processingPhotos} className="bg-emerald-600 hover:bg-emerald-700">
                          <span className="cursor-pointer">
                            {processingPhotos ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                            Vybrať fotky
                          </span>
                        </Button>
                      </label>
                      <label htmlFor="ticab-bulk-folder">
                        <Button type="button" asChild disabled={processingPhotos} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                          <span className="cursor-pointer">
                            {processingPhotos ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FolderOpen className="w-4 h-4 mr-1" />}
                            Vybrať priečinok
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                    <p className="text-xs text-emerald-800 font-medium mb-2">Vybrané domy:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTicabDomy.map(dom => (
                        <Badge key={dom.id} className="bg-white text-emerald-700 text-xs">{dom.nazov}</Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Zobrazenie starých a nových fotiek - len pre jeden dom */}
              {selectedTicabDom && selectedTicabDomIds.length === 1 && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Staré fotky (aktuálne v galérii) */}
                  <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Archive className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-900">Aktuálne fotky</h3>
                          <p className="text-xs text-amber-700">Zobrazené na stránke</p>
                        </div>
                      </div>
                      {selectedOldPhotos.length > 0 && (
                        <Button
                          size="sm"
                          onClick={archiveSelectedPhotos}
                          disabled={processingPhotos}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {processingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                              <Archive className="w-4 h-4 mr-1" />
                              Archivovať ({selectedOldPhotos.length})
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Hlavný obrázok */}
                      {selectedTicabDom.hlavny_obrazok && (
                        <div 
                          onClick={() => toggleOldPhotoSelection(selectedTicabDom.hlavny_obrazok)}
                          className={`border-2 rounded-lg p-3 bg-white cursor-pointer transition-all ${
                            selectedOldPhotos.includes(selectedTicabDom.hlavny_obrazok) 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-amber-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-amber-100 text-amber-800">Hlavný obrázok</Badge>
                            {selectedOldPhotos.includes(selectedTicabDom.hlavny_obrazok) && (
                              <Badge className="bg-red-100 text-red-800">Na archiváciu</Badge>
                            )}
                          </div>
                          <img src={selectedTicabDom.hlavny_obrazok} alt="Hlavný" className="w-full h-32 object-cover rounded-lg" />
                        </div>
                      )}

                      {/* Galéria */}
                      {selectedTicabDom.galeria && selectedTicabDom.galeria.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-amber-800">Galéria ({selectedTicabDom.galeria.length})</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (selectedOldPhotos.length === selectedTicabDom.galeria.length) {
                                  setSelectedOldPhotos([]);
                                } else {
                                  setSelectedOldPhotos([...selectedTicabDom.galeria]);
                                }
                              }}
                              className="text-xs h-7"
                            >
                              {selectedOldPhotos.length === selectedTicabDom.galeria.length ? 'Odznačiť všetky' : 'Označiť všetky'}
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {selectedTicabDom.galeria.map((url, index) => (
                              <div 
                                key={index} 
                                onClick={() => toggleOldPhotoSelection(url)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedOldPhotos.includes(url) 
                                    ? 'border-red-500 ring-2 ring-red-200' 
                                    : 'border-amber-200 hover:border-amber-400'
                                }`}
                              >
                                <img src={url} alt={`Galéria ${index + 1}`} className="w-full h-20 object-cover" />
                                {selectedOldPhotos.includes(url) && (
                                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Archivované fotky */}
                      {selectedTicabDom.stare_fotky && selectedTicabDom.stare_fotky.length > 0 && (
                        <div className="border-t border-amber-200 pt-4">
                          <p className="text-sm font-semibold text-amber-600 mb-2">
                            📦 Archív ({selectedTicabDom.stare_fotky.length} fotiek)
                          </p>
                          <div className="grid grid-cols-4 gap-1">
                            {selectedTicabDom.stare_fotky.slice(0, 8).map((url, index) => (
                              <img key={index} src={url} alt={`Archív ${index + 1}`} className="w-full h-12 object-cover rounded opacity-60" />
                            ))}
                            {selectedTicabDom.stare_fotky.length > 8 && (
                              <div className="w-full h-12 bg-amber-200 rounded flex items-center justify-center text-amber-700 text-xs font-semibold">
                                +{selectedTicabDom.stare_fotky.length - 8}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedTicabDom.hlavny_obrazok && (!selectedTicabDom.galeria || selectedTicabDom.galeria.length === 0) && (
                        <div className="text-center py-6 text-amber-600">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Žiadne aktuálne fotky</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Nové fotky (na výmenu) */}
                  <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-emerald-900">Nové fotky</h3>
                          <p className="text-xs text-emerald-700">Na výmenu</p>
                        </div>
                      </div>
                      {selectedNewPhotos.length > 0 && (
                        <Button
                          size="sm"
                          onClick={addNewPhotosToGallery}
                          disabled={processingPhotos}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {processingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                              <Images className="w-4 h-4 mr-1" />
                              Do galérie ({selectedNewPhotos.length})
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Zobrazenie nových fotiek */}
                    {selectedTicabDom.nove_fotky && selectedTicabDom.nove_fotky.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-emerald-800">
                            {selectedTicabDom.nove_fotky.length} nových fotiek
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (selectedNewPhotos.length === selectedTicabDom.nove_fotky.length) {
                                setSelectedNewPhotos([]);
                              } else {
                                setSelectedNewPhotos([...selectedTicabDom.nove_fotky]);
                              }
                            }}
                            className="text-xs h-7"
                          >
                            {selectedNewPhotos.length === selectedTicabDom.nove_fotky.length ? 'Odznačiť' : 'Označiť všetky'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                          {selectedTicabDom.nove_fotky.map((url, index) => (
                            <div key={index} className="space-y-2">
                              <div 
                                onClick={() => toggleNewPhotoSelection(url)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedNewPhotos.includes(url) 
                                    ? 'border-emerald-500 ring-2 ring-emerald-200' 
                                    : 'border-emerald-200 hover:border-emerald-400'
                                }`}
                              >
                                <img src={url} alt={`Nová ${index + 1}`} className="w-full h-24 object-cover" />
                                {selectedNewPhotos.includes(url) && (
                                  <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAsMainPhoto(url)}
                                disabled={processingPhotos}
                                className="w-full text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Nastaviť ako hlavný
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Upload zone pre nové fotky */}
                        <div
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                            if (files.length > 0) {
                              handleTicabNewPhotosUpload(files);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center bg-white/50 hover:bg-white transition-all"
                        >
                          <Sparkles className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                          <p className="text-sm font-medium text-emerald-700 mb-2">Pretiahnite nové fotky sem</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              if (files.length > 0) {
                                handleTicabNewPhotosUpload(files);
                              }
                              e.target.value = '';
                            }}
                            className="hidden"
                            id="ticab-new-photos"
                            disabled={processingPhotos}
                          />
                          <label htmlFor="ticab-new-photos">
                            <Button type="button" asChild disabled={processingPhotos} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <span className="cursor-pointer">
                                {processingPhotos ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                                Vybrať fotky
                              </span>
                            </Button>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Info panel */}
                    <div className="mt-4 p-4 bg-emerald-100 rounded-lg">
                      <p className="text-xs text-emerald-800">
                        <strong>Postup výmeny:</strong><br />
                        1. Nahrajte nové fotky<br />
                        2. Označte ich a pridajte do galérie alebo nastavte ako hlavný<br />
                        3. V ľavom stĺpci označte staré fotky na archiváciu
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {selectedTicabDomIds.length === 0 && (
                <Card className="p-8 border-0 shadow-xl bg-white">
                  <div className="text-center mb-6">
                    <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Vyberte Ticab House domy</h3>
                    <p className="text-gray-500 mb-6">Pre zobrazenie a správu fotiek vyberte jeden alebo viac domov.</p>
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Rýchly upload fotiek</h3>
                        <p className="text-xs text-gray-500">Nahrať fotky z počítača do internej pamäte</p>
                      </div>
                    </div>
                    
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length > 0) {
                          handleQuickUpload(files);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/30 hover:bg-blue-50 transition-all"
                    >
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                      <p className="text-sm font-medium text-blue-700 mb-4">Pretiahnite fotky sem alebo</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) handleQuickUpload(files);
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="quick-upload-files"
                      />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) handleQuickUpload(files);
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="quick-upload-folder"
                        webkitdirectory=""
                        directory=""
                      />
                      <div className="flex gap-3 justify-center">
                        <label htmlFor="quick-upload-files">
                          <Button type="button" asChild className="bg-blue-600 hover:bg-blue-700">
                            <span className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Vybrať fotky
                            </span>
                          </Button>
                        </label>
                        <label htmlFor="quick-upload-folder">
                          <Button type="button" asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <span className="cursor-pointer">
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Vybrať priečinok
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Prosto House Tab */}
          {activeTab === 'prosto' && (
            <div className="space-y-6">
              {/* Výber Prosto domov */}
              <Card className="p-6 border-0 shadow-xl bg-white">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Vyberte Prosto House domy ({selectedProstoDomIds.length} vybraných)
                  </label>
                  <div className="flex gap-2">
                    {selectedProstoDomIds.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProstoDomIds([])}>
                        Zrušiť výber
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedProstoDomIds(prostoDomy.map(d => d.id))}
                    >
                      Vybrať všetky
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {prostoDomy.map(dom => {
                    const isSelected = selectedProstoDomIds.includes(dom.id);
                    return (
                      <button
                        key={dom.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedProstoDomIds(prev => prev.filter(id => id !== dom.id));
                          } else {
                            setSelectedProstoDomIds(prev => [...prev, dom.id]);
                          }
                        }}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{dom.nazov}</p>
                            <div className="flex gap-1 mt-1">
                              {dom.nove_fotky?.length > 0 && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">{dom.nove_fotky.length} nových</Badge>
                              )}
                              {dom.galeria?.length > 0 && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">{dom.galeria.length} v galérii</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Upload pre viacero Prosto domov naraz */}
              {selectedProstoDomIds.length > 0 && (
                <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">Nahrávanie fotiek</h3>
                      <p className="text-xs text-purple-700">Nahrať fotky do {selectedProstoDomIds.length} domov</p>
                    </div>
                  </div>

                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                      if (files.length > 0) {
                        handleProstoNewPhotosUpload(files);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-white/50 hover:bg-white transition-all"
                  >
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                    <p className="text-sm font-medium text-purple-700 mb-2">Pretiahnite fotky sem</p>
                    <p className="text-xs text-purple-600 mb-4">Budú nahrané do všetkých {selectedProstoDomIds.length} vybraných domov</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          handleProstoNewPhotosUpload(files);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                      id="prosto-bulk-photos"
                      disabled={processingPhotos}
                    />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          handleProstoNewPhotosUpload(files);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                      id="prosto-bulk-folder"
                      disabled={processingPhotos}
                      webkitdirectory=""
                      directory=""
                    />
                    <div className="flex gap-2 justify-center">
                      <label htmlFor="prosto-bulk-photos">
                        <Button type="button" asChild disabled={processingPhotos} className="bg-purple-600 hover:bg-purple-700">
                          <span className="cursor-pointer">
                            {processingPhotos ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                            Vybrať fotky
                          </span>
                        </Button>
                      </label>
                      <label htmlFor="prosto-bulk-folder">
                        <Button type="button" asChild disabled={processingPhotos} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                          <span className="cursor-pointer">
                            {processingPhotos ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FolderOpen className="w-4 h-4 mr-1" />}
                            Vybrať priečinok
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-xs text-purple-800 font-medium mb-2">Vybrané domy:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProstoDomy.map(dom => (
                        <Badge key={dom.id} className="bg-white text-purple-700 text-xs">{dom.nazov}</Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {selectedProstoDomIds.length === 0 && (
                <Card className="p-8 border-0 shadow-xl bg-white">
                  <div className="text-center mb-6">
                    <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Vyberte Prosto House domy</h3>
                    <p className="text-gray-500 mb-6">Pre nahrávanie fotiek vyberte jeden alebo viac domov.</p>
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Rýchly upload fotiek</h3>
                        <p className="text-xs text-gray-500">Nahrať fotky z počítača do internej pamäte</p>
                      </div>
                    </div>
                    
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length > 0) {
                          handleQuickUpload(files);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-purple-50/30 hover:bg-purple-50 transition-all"
                    >
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                      <p className="text-sm font-medium text-purple-700 mb-4">Pretiahnite fotky sem alebo</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) handleQuickUpload(files);
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="prosto-quick-upload-files"
                      />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) handleQuickUpload(files);
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="prosto-quick-upload-folder"
                        webkitdirectory=""
                        directory=""
                      />
                      <div className="flex gap-3 justify-center">
                        <label htmlFor="prosto-quick-upload-files">
                          <Button type="button" asChild className="bg-purple-600 hover:bg-purple-700">
                            <span className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Vybrať fotky
                            </span>
                          </Button>
                        </label>
                        <label htmlFor="prosto-quick-upload-folder">
                          <Button type="button" asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                            <span className="cursor-pointer">
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Vybrať priečinok
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}