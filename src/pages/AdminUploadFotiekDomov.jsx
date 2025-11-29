import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, AlertCircle, CheckCircle, Loader2, X, Trash2, Image as ImageIcon, Star, Settings, Images, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminUploadFotiekDomov() {
  const [selectedDomId, setSelectedDomId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [uploadResults, setUploadResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

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
    if (!selectedDomId) {
      toast.error("Vyberte dom");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Vyberte fotky");
      return;
    }

    const dom = domy.find(d => d.id === selectedDomId);
    if (!dom) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length, currentFile: '' });

    const results = { successful: [], failed: [] };
    const uploadedUrls = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, type } = selectedFiles[i];
      
      // Update file status to uploading
      setSelectedFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' } : f
      ));
      setUploadProgress({ current: i, total: selectedFiles.length, currentFile: file.name });
      
      try {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push({ url: uploadResponse.file_url, type });
        results.successful.push({ name: file.name, type });
        
        // Update file status to success
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' } : f
        ));
        
      } catch (error) {
        results.failed.push({ name: file.name, error: error.message });
        
        // Update file status to error
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', errorMessage: error.message } : f
        ));
        
        toast.error(`Chyba: ${file.name}`);
      }
      
      setUploadProgress({ current: i + 1, total: selectedFiles.length, currentFile: '' });
    }

    // Aktualizuj dom
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
        toast.success('Dom bol úspešne aktualizovaný');
      }
    } catch (error) {
      toast.error(`Chyba pri aktualizácii domu: ${error.message}`);
    }

    setUploadResults(results);
    setUploading(false);
    
    // Clear only successful uploads
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

  const selectedDom = domy.find(d => d.id === selectedDomId);

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
                <h1 className="text-3xl font-bold text-gray-900">Upload fotiek domov</h1>
                <p className="text-sm text-gray-600 mt-1">Vyberte dom a nahrajte fotky</p>
              </div>
            </div>
          </div>

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

          {/* Select Dom */}
          <Card className="p-6 mb-6 border-0 shadow-xl bg-white">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              1. Vyberte dom *
            </label>
            <Select value={selectedDomId || ''} onValueChange={setSelectedDomId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyberte dom..." />
              </SelectTrigger>
              <SelectContent>
                {domy
                  .filter(dom => !dom.nazov.toLowerCase().includes('fotky') && !dom.nazov.toLowerCase().includes('konfiguráci'))
                  .map(dom => (
                    <SelectItem key={dom.id} value={dom.id}>
                      {dom.nazov} - {dom.vyrobca}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Upload Zone */}
          {selectedDomId && (
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
                <label htmlFor="file-input">
                  <Button type="button" asChild disabled={uploading} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Vyberte fotky
                    </span>
                  </Button>
                </label>
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
          {selectedDomId && selectedDom && (
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
        </motion.div>
      </div>
    </div>
  );
}