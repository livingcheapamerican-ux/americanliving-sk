import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Home, Image, Trash2, Upload, AlertCircle, Loader2, X, Star, StarOff, Eye, Grid3x3, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSpravaDomov() {
  const [selectedDom, setSelectedDom] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: domy = [], isLoading: domyLoading } = useQuery({
    queryKey: ['domy-admin'],
    queryFn: () => base44.entities.Dom.list('-created_date')
  });

  const { data: dokumenty = [], isLoading: dokumentyLoading } = useQuery({
    queryKey: ['dokumenty-fotky'],
    queryFn: () => base44.entities.Dokument.filter({ typ: 'fotky' })
  });

  const updateDomMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dom.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domy-admin'] });
    }
  });

  const createDokumentMutation = useMutation({
    mutationFn: (data) => base44.entities.Dokument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty-fotky'] });
    }
  });

  const deleteDokumentMutation = useMutation({
    mutationFn: (id) => base44.entities.Dokument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty-fotky'] });
    }
  });

  const isSuperAdmin = user?.super_admin === true;

  const filteredDomy = useMemo(() => {
    return domy.filter(dom =>
      dom.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dom.vyrobca?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [domy, searchQuery]);

  // Fotky pre vybraný dom
  const fotkyPreDom = useMemo(() => {
    if (!selectedDom) return [];
    return dokumenty.filter(dok => 
      dok.model_domu === selectedDom.nazov || 
      dok.model_domu?.toLowerCase().includes(selectedDom.nazov.toLowerCase()) ||
      dok.cesta_priecinku?.toLowerCase().includes(selectedDom.nazov.toLowerCase())
    );
  }, [selectedDom, dokumenty]);

  const handleNahratFotky = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || !selectedDom) return;

    setUploadingImages(true);

    try {
      for (const file of files) {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        
        await createDokumentMutation.mutateAsync({
          nazov: file.name,
          typ: 'fotky',
          vyrobca: selectedDom.vyrobca,
          model_domu: selectedDom.nazov,
          podpriecinok: 'admin-upload',
          cesta_priecinku: `${selectedDom.nazov}/admin-upload`,
          subor_url: uploadResponse.file_url,
          velkost: file.size,
          typ_suboru: file.type,
          pre_chatbota: true
        });
      }

      alert(`Úspešne nahraných ${files.length} fotiek!`);
    } catch (error) {
      alert('Chyba pri nahrávaní: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleNastavHlavnuFotku = async (url) => {
    try {
      await updateDomMutation.mutateAsync({
        id: selectedDom.id,
        data: { hlavny_obrazok: url }
      });
      alert('Hlavná fotka nastavená!');
    } catch (error) {
      alert('Chyba: ' + error.message);
    }
  };

  const handlePridatDoGalerie = async (url) => {
    try {
      const galeria = selectedDom.galeria || [];
      if (!galeria.includes(url)) {
        await updateDomMutation.mutateAsync({
          id: selectedDom.id,
          data: { galeria: [...galeria, url] }
        });
        alert('Pridané do galérie!');
      }
    } catch (error) {
      alert('Chyba: ' + error.message);
    }
  };

  const handleOdstranZGalerie = async (url) => {
    try {
      const galeria = selectedDom.galeria || [];
      await updateDomMutation.mutateAsync({
        id: selectedDom.id,
        data: { galeria: galeria.filter(img => img !== url) }
      });
      alert('Odstránené z galérie!');
    } catch (error) {
      alert('Chyba: ' + error.message);
    }
  };

  const handleVymazatFotku = async (dokId) => {
    if (!confirm('Naozaj chcete vymazať túto fotku z úložiska?')) return;
    
    try {
      await deleteDokumentMutation.mutate(dokId);
      alert('Fotka vymazaná!');
    } catch (error) {
      alert('Chyba: ' + error.message);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md shadow-xl">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600 font-medium">Načítavam...</p>
        </Card>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-600">Táto stránka je dostupná len pre super administrátorov.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent">
                  Správa domov
                </h1>
                <p className="text-sm text-gray-600 mt-1">Editácia fotiek a materiálov pre každý dom</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Hľadať domy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-0 shadow-md bg-white/80 backdrop-blur"
              />
            </div>
          </div>

          {/* Domy Grid */}
          {domyLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary mb-6" />
              <p className="text-gray-600 font-medium text-lg">Načítavam domy...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDomy.map((dom, index) => (
                <motion.div
                  key={dom.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedDom(dom)}
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {dom.hlavny_obrazok ? (
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800">
                        {dom.vyrobca}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{dom.nazov}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Image className="w-4 h-4" />
                        <span>{(dom.galeria?.length || 0) + 1} fotiek</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Detail Dialog */}
          <Dialog open={!!selectedDom} onOpenChange={() => setSelectedDom(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              {selectedDom && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
                      <Home className="w-6 h-6" />
                      {selectedDom.nazov}
                    </DialogTitle>
                    <p className="text-sm text-gray-600">{selectedDom.vyrobca}</p>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {/* Nahrať nové fotky */}
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">Nahrať nové fotky</h3>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleNahratFotky}
                          disabled={uploadingImages}
                          className="hidden"
                          id="upload-images"
                        />
                        <Button
                          onClick={() => document.getElementById('upload-images')?.click()}
                          disabled={uploadingImages}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {uploadingImages ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Nahrávam...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Nahrať fotky
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>

                    {/* Aktuálna hlavná fotka */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Hlavná fotka
                      </h3>
                      <Card className="p-4">
                        {selectedDom.hlavny_obrazok ? (
                          <div className="relative group">
                            <img
                              src={selectedDom.hlavny_obrazok}
                              alt="Hlavná fotka"
                              className="w-full h-64 object-cover rounded-lg cursor-pointer"
                              onClick={() => setImagePreview(selectedDom.hlavny_obrazok)}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImagePreview(selectedDom.hlavny_obrazok);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Home className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* Galéria domu */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Grid3x3 className="w-5 h-5 text-blue-600" />
                        Galéria domu ({selectedDom.galeria?.length || 0} fotiek)
                      </h3>
                      {selectedDom.galeria && selectedDom.galeria.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {selectedDom.galeria.map((url, idx) => (
                            <Card key={idx} className="p-2 group relative">
                              <img
                                src={url}
                                alt={`Galéria ${idx + 1}`}
                                className="w-full h-40 object-cover rounded cursor-pointer"
                                onClick={() => setImagePreview(url)}
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImagePreview(url);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOdstranZGalerie(url);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center">
                          <p className="text-gray-500">Žiadne fotky v galérii</p>
                        </Card>
                      )}
                    </div>

                    {/* Dostupné fotky z úložiska */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Image className="w-5 h-5 text-purple-600" />
                        Dostupné fotky z úložiska ({fotkyPreDom.length})
                      </h3>
                      {dokumentyLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </div>
                      ) : fotkyPreDom.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {fotkyPreDom.map((dok) => (
                            <Card key={dok.id} className="p-2 group relative">
                              <img
                                src={dok.subor_url}
                                alt={dok.nazov}
                                className="w-full h-40 object-cover rounded cursor-pointer"
                                onClick={() => setImagePreview(dok.subor_url)}
                              />
                              <p className="text-xs text-gray-600 mt-1 truncate">{dok.nazov}</p>
                              {dok.podpriecinok && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {dok.podpriecinok}
                                </Badge>
                              )}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-2 p-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNastavHlavnuFotku(dok.subor_url);
                                  }}
                                  className="w-full text-xs"
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Hlavná
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePridatDoGalerie(dok.subor_url);
                                  }}
                                  className="w-full text-xs"
                                >
                                  + Galéria
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVymazatFotku(dok.id);
                                  }}
                                  className="w-full text-xs"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Vymazať
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center">
                          <Image className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">Žiadne fotky pre tento dom v úložisku</p>
                          <p className="text-xs text-gray-400 mt-2">Nahrajte fotky vyššie alebo použite AdminDokumenty</p>
                        </Card>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Image Preview Modal */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                onClick={() => setImagePreview(null)}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }} 
                  className="relative max-w-6xl w-full max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setImagePreview(null)} 
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white z-10"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <img 
                    src={imagePreview} 
                    alt="Náhľad" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}