import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Home, CheckCircle, AlertCircle, Loader2, X, Image as ImageIcon, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUploadFotiekDomov() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [fileAssignments, setFileAssignments] = useState({});
  const [uploadResults, setUploadResults] = useState(null);
  const folderInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDomForDelete, setSelectedDomForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Funkcia na detekciu domu z názvu súboru - prvé slovo definuje dom
  const detectDomFromFilename = (filename) => {
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
    
    // Prvé slovo v názve súboru (do prvej medzery alebo podčiarkovníka)
    const firstWord = nameWithoutExt.split(/[\s_-]/)[0].toLowerCase();
    
    // Skús nájsť dom Ticab house, ktorého nazov obsahuje prvé slovo
    const matchedDom = domy.find(dom => {
      // Iba Ticab house domy
      if (dom.vyrobca !== 'Ticab house') return false;
      
      const domName = dom.nazov.toLowerCase();
      // Skontroluj, či názov domu obsahuje prvé slovo zo súboru
      return domName.includes(firstWord);
    });

    return matchedDom || null;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    // Automatická detekcia priradenia
    const assignments = {};
    imageFiles.forEach(file => {
      const detectedDom = detectDomFromFilename(file.name);
      assignments[file.name] = {
        dom: detectedDom?.id || null,
        type: 'galeria', // Default: pridať do galérie
        preview: URL.createObjectURL(file)
      };
    });

    setSelectedFiles(imageFiles);
    setFileAssignments(assignments);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    const assignments = {};
    imageFiles.forEach(file => {
      const detectedDom = detectDomFromFilename(file.name);
      assignments[file.name] = {
        dom: detectedDom?.id || null,
        type: 'galeria',
        preview: URL.createObjectURL(file)
      };
    });

    setSelectedFiles(imageFiles);
    setFileAssignments(assignments);
  };

  const updateAssignment = (filename, field, value) => {
    setFileAssignments(prev => ({
      ...prev,
      [filename]: {
        ...prev[filename],
        [field]: value
      }
    }));
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

    setDeleting(true);
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

      await updateDomMutation.mutateAsync({
        domId: dom.id,
        data: updateData
      });

      alert('Fotka bola úspešne vymazaná');
    } catch (error) {
      alert(`Chyba pri vymazávaní: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllGallery = async (domId) => {
    const dom = domy.find(d => d.id === domId);
    if (!dom || !dom.galeria || dom.galeria.length === 0) return;

    if (!window.confirm(`Naozaj chcete vymazať všetkých ${dom.galeria.length} fotiek z galérie?`)) return;

    setDeleting(true);
    try {
      await updateDomMutation.mutateAsync({
        domId: dom.id,
        data: { galeria: [] }
      });

      alert('Všetky fotky z galérie boli vymazané');
    } catch (error) {
      alert(`Chyba pri vymazávaní: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert("Vyberte aspoň jednu fotku");
      return;
    }

    // Skontroluj, či všetky fotky majú priradený dom
    const unassigned = selectedFiles.filter(file => !fileAssignments[file.name]?.dom);
    if (unassigned.length > 0) {
      alert(`${unassigned.length} fotiek nemá priradený dom. Priraďte všetkým fotkám dom.`);
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    const results = {
      successful: [],
      failed: []
    };

    // Zoskupiť súbory podľa domu pre optimalizáciu
    const filesByDom = {};
    selectedFiles.forEach(file => {
      const assignment = fileAssignments[file.name];
      const domId = assignment.dom;
      if (!filesByDom[domId]) {
        filesByDom[domId] = { hlavny: null, galeria: [] };
      }
      if (assignment.type === 'hlavny_obrazok') {
        filesByDom[domId].hlavny = file;
      } else {
        filesByDom[domId].galeria.push(file);
      }
    });

    let processedCount = 0;

    // Spracuj každý dom
    for (const [domId, files] of Object.entries(filesByDom)) {
      const dom = domy.find(d => d.id === domId);
      const uploadedUrls = [];

      try {
        // Upload všetkých fotiek pre tento dom naraz
        const allFiles = [files.hlavny, ...files.galeria].filter(Boolean);
        
        for (const file of allFiles) {
          try {
            const uploadResponse = await base44.integrations.Core.UploadFile({ file });
            uploadedUrls.push({ file, url: uploadResponse.file_url });
            processedCount++;
            setUploadProgress({ current: processedCount, total: selectedFiles.length });
          } catch (error) {
            results.failed.push({
              name: file.name,
              error: error.message
            });
            processedCount++;
            setUploadProgress({ current: processedCount, total: selectedFiles.length });
          }
        }

        // Aktualizuj dom s všetkými URL naraz
        const updateData = {};
        const hlavnyUrl = uploadedUrls.find(u => u.file === files.hlavny)?.url;
        const galeriaUrls = uploadedUrls.filter(u => files.galeria.includes(u.file)).map(u => u.url);

        if (hlavnyUrl) {
          updateData.hlavny_obrazok = hlavnyUrl;
        }
        if (galeriaUrls.length > 0) {
          updateData.galeria = [...(dom.galeria || []), ...galeriaUrls];
        }

        if (Object.keys(updateData).length > 0) {
          await updateDomMutation.mutateAsync({
            domId: dom.id,
            data: updateData
          });
        }

        // Pridaj úspešné výsledky
        uploadedUrls.forEach(({ file }) => {
          const assignment = fileAssignments[file.name];
          results.successful.push({
            name: file.name,
            dom: dom.nazov,
            type: assignment.type
          });
        });

      } catch (error) {
        // Ak zlyhá aktualizácia domu
        [files.hlavny, ...files.galeria].filter(Boolean).forEach(file => {
          if (!results.failed.find(r => r.name === file.name)) {
            results.failed.push({
              name: file.name,
              error: `Chyba pri aktualizácii domu: ${error.message}`
            });
          }
        });
      }
    }

    setUploadResults(results);
    setUploading(false);
    setSelectedFiles([]);
    setFileAssignments({});
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Upload fotiek domov
                </h1>
                <p className="text-sm text-gray-600 mt-1">Automatické priradenie fotiek k domom podľa názvu súboru</p>
              </div>
            </div>

            <Card className="p-4 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">💡 Ako to funguje:</p>
                  <p className="text-blue-800 opacity-90">
                    1. Nahrajte priečinok s fotkami domov<br/>
                    2. Systém automaticky priradí fotky k domom podľa názvu súboru<br/>
                    3. Upravte priradenia a vyberte, či je to hlavný obrázok alebo galéria<br/>
                    4. Nahrajte fotky do databázy
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Upload Results */}
          {uploadResults && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
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
                          <span className="font-semibold text-green-900">
                            Úspešne: {uploadResults.successful.length}
                          </span>
                        </div>
                        <div className="text-sm text-green-800 space-y-1">
                          {uploadResults.successful.map((item, i) => (
                            <div key={i}>
                              ✓ {item.name} → {item.dom} ({item.type === 'hlavny_obrazok' ? 'Hlavný obrázok' : 'Galéria'})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResults.failed.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">
                            Chybné: {uploadResults.failed.length}
                          </span>
                        </div>
                        <div className="text-sm text-red-800 space-y-1">
                          {uploadResults.failed.map((item, i) => (
                            <div key={i}>
                              ✗ {item.name}: {item.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Upload Zone */}
          <Card className="p-6 mb-6 border-0 shadow-xl bg-white">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-blue-300 bg-blue-50/30'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-base font-medium text-gray-700 mb-2">
                Pretiahnite priečinok s fotkami sem
              </p>
              <p className="text-sm text-gray-500 mb-6">
                alebo kliknite na tlačidlo nižšie
              </p>
              
              <input
                ref={folderInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple
                webkitdirectory=""
                directory=""
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
              <Button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Vybrať priečinok s fotkami
              </Button>
            </div>
          </Card>

          {/* File List with Assignments */}
          {selectedFiles.length > 0 && (
            <Card className="p-6 mb-6 border-0 shadow-xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Priradenie fotiek ({selectedFiles.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={uploading}
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
                        Nahrať do databázy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Hromadné akcie:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newAssignments = {...fileAssignments};
                      selectedFiles.forEach(file => {
                        if (newAssignments[file.name]) {
                          newAssignments[file.name].type = 'galeria';
                        }
                      });
                      setFileAssignments(newAssignments);
                    }}
                  >
                    Všetky → Galéria
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newAssignments = {...fileAssignments};
                      selectedFiles.forEach(file => {
                        if (newAssignments[file.name]) {
                          newAssignments[file.name].type = 'zakladna_konfiguracia';
                        }
                      });
                      setFileAssignments(newAssignments);
                    }}
                  >
                    Všetky → Základná konfigurácia
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newAssignments = {...fileAssignments};
                      selectedFiles.forEach(file => {
                        if (newAssignments[file.name]) {
                          newAssignments[file.name].type = 'hlavny_obrazok';
                        }
                      });
                      setFileAssignments(newAssignments);
                    }}
                  >
                    Všetky → Hlavný obrázok
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {selectedFiles.map((file, index) => {
                  const assignment = fileAssignments[file.name] || {};
                  const selectedDom = domy.find(d => d.id === assignment.dom);

                  return (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Preview */}
                        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={assignment.preview} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow space-y-3">
                          <div>
                            <p className="font-semibold text-gray-800">{file.name}</p>
                            {assignment.dom ? (
                              <Badge className="bg-green-100 text-green-800 mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Priradené
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Nebol detegovaný dom
                              </Badge>
                            )}
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                Dom *
                              </label>
                              <Select
                                value={assignment.dom || ''}
                                onValueChange={(value) => updateAssignment(file.name, 'dom', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Vyberte dom" />
                                </SelectTrigger>
                                <SelectContent>
                                  {domy.map(dom => (
                                    <SelectItem key={dom.id} value={dom.id}>
                                      {dom.nazov} - {dom.vyrobca}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                Umiestnenie *
                              </label>
                              <Select
                                value={assignment.type || 'galeria'}
                                onValueChange={(value) => updateAssignment(file.name, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hlavny_obrazok">Hlavný obrázok</SelectItem>
                                  <SelectItem value="zakladna_konfiguracia">Základná konfigurácia</SelectItem>
                                  <SelectItem value="galeria">Galéria</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {selectedDom && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-xs font-semibold text-blue-900 mb-1">
                                Priradené k:
                              </p>
                              <p className="text-sm text-blue-800">
                                <Home className="w-3 h-3 inline mr-1" />
                                {selectedDom.nazov} ({selectedDom.vyrobca})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Progress Bar */}
          {uploading && (
            <Card className="p-6 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Nahrávanie prebieha
                </h3>
                <span className="text-lg font-bold text-blue-700">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </span>
              </div>
              <div className="relative w-full bg-blue-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-blue-800 mt-2 text-center">
                {uploadProgress.current} / {uploadProgress.total} fotiek
              </p>
            </Card>
          )}

          {/* Delete Photos Section */}
          <Card className="p-6 border-0 shadow-xl bg-white mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Vymazať fotky domov
                </h2>
                <p className="text-sm text-gray-600 mt-1">Vyberte dom a vymažte jeho fotky</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Vyberte dom *
              </label>
              <Select
                value={selectedDomForDelete || ''}
                onValueChange={(value) => setSelectedDomForDelete(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte dom..." />
                </SelectTrigger>
                <SelectContent>
                  {domy.map(dom => (
                    <SelectItem key={dom.id} value={dom.id}>
                      {dom.nazov} - {dom.vyrobca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDomForDelete && (() => {
              const dom = domy.find(d => d.id === selectedDomForDelete);
              if (!dom) return null;

              return (
                <div className="space-y-6">
                  {/* Hlavný obrázok */}
                  {dom.hlavny_obrazok && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Hlavný obrázok</h3>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(dom.id, 'hlavny_obrazok')}
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Vymazať
                        </Button>
                      </div>
                      <div className="w-full max-w-md">
                        <img 
                          src={dom.hlavny_obrazok} 
                          alt="Hlavný obrázok"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Základná konfigurácia */}
                  {dom.zakladna_konfiguracia_obrazok && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Základná konfigurácia</h3>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(dom.id, 'zakladna_konfiguracia')}
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Vymazať
                        </Button>
                      </div>
                      <div className="w-full max-w-md">
                        <img 
                          src={dom.zakladna_konfiguracia_obrazok} 
                          alt="Základná konfigurácia"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Galéria */}
                  {dom.galeria && dom.galeria.length > 0 && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Galéria ({dom.galeria.length} fotiek)
                        </h3>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAllGallery(dom.id)}
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Vymazať všetky
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {dom.galeria.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Galéria ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(dom.id, 'galeria', url)}
                              disabled={deleting}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!dom.hlavny_obrazok && !dom.zakladna_konfiguracia_obrazok && (!dom.galeria || dom.galeria.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Tento dom nemá žiadne fotky</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}