import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderOpen, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Upload,
  X,
  Sparkles,
  Home,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import PhotoMetadataEditor from "./PhotoMetadataEditor";
import GoogleDriveSyncManager from "./GoogleDriveSyncManager";
import PhotoDetailViewer from "./PhotoDetailViewer";

export default function GoogleDrivePhotoImport({ domy, onImportComplete }) {
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [folderContents, setFolderContents] = useState({});
  const [loadingFolders, setLoadingFolders] = useState({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [importedFiles, setImportedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [step, setStep] = useState('select-folders'); // select-folders, preview-files, assign-to-dom
  const [selectedDomId, setSelectedDomId] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [completedImports, setCompletedImports] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const queryClient = useQueryClient();

  // Skontrolovať pripojenie
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const response = await base44.functions.invoke('googleDrive', { action: 'listFolders' });
      if (response.data && !response.data.error) {
        setIsConnected(true);
        setFolders(response.data);
      } else if (response.data?.needsAuth) {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    }
    setChecking(false);
  };

  const handleConnect = () => {
    const returnUrl = window.location.pathname;
    window.location.href = `/functions/googleDrive?action=authorize&return_url=${encodeURIComponent(returnUrl)}`;
  };

  const toggleFolderSelection = (folderId) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const loadFolderContents = async (folderId) => {
    if (folderContents[folderId]) {
      setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
      return;
    }

    setLoadingFolders(prev => ({ ...prev, [folderId]: true }));
    try {
      const response = await base44.functions.invoke('googleDrive', { 
        action: 'listFolderContents',
        folderId,
        recursive: 'true'
      });
      
      if (response.data && Array.isArray(response.data)) {
        setFolderContents(prev => ({ ...prev, [folderId]: response.data }));
        setExpandedFolders(prev => ({ ...prev, [folderId]: true }));
      }
    } catch (error) {
      toast.error('Nepodarilo sa načítať obsah priečinka');
    }
    setLoadingFolders(prev => ({ ...prev, [folderId]: false }));
  };

  const loadAllSelectedFolders = async () => {
    if (selectedFolders.length === 0) {
      toast.error('Vyberte aspoň jeden priečinok');
      return;
    }

    setImporting(true);
    const allFiles = [];

    for (const folderId of selectedFolders) {
      try {
        const response = await base44.functions.invoke('googleDrive', { 
          action: 'listFolderContents',
          folderId,
          recursive: 'true'
        });
        
        if (response.data && Array.isArray(response.data)) {
          allFiles.push(...response.data);
        }
      } catch (error) {
        console.error('Error loading folder:', folderId, error);
      }
    }

    setImportedFiles(allFiles);
    setSelectedFiles(allFiles.map(f => f.id));
    setStep('preview-files');
    setImporting(false);
  };

  const importSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vyberte aspoň jeden súbor na import');
      return;
    }

    const filesToImport = importedFiles.filter(f => selectedFiles.includes(f.id));
    setImporting(true);
    setImportProgress({ current: 0, total: filesToImport.length, currentFile: '' });

    const uploadedFiles = [];

    for (let i = 0; i < filesToImport.length; i++) {
      const file = filesToImport[i];
      setImportProgress({ 
        current: i, 
        total: filesToImport.length, 
        currentFile: file.name 
      });

      try {
        const response = await base44.functions.invoke('googleDrive', { 
          action: 'importImage',
          fileId: file.id
        });
        
        if (response.data?.file_url) {
          uploadedFiles.push({
            url: response.data.file_url,
            originalName: file.name,
            path: file.path,
            folderName: file.folderName
          });
        }
      } catch (error) {
        console.error('Error importing file:', file.name, error);
        toast.error(`Chyba pri importe: ${file.name}`);
      }
    }

    setImportProgress({ current: filesToImport.length, total: filesToImport.length, currentFile: '' });
    
    if (uploadedFiles.length > 0) {
      setCompletedImports(uploadedFiles);
      setStep('edit-metadata');
      toast.success(`Úspešne importovaných ${uploadedFiles.length} fotiek - teraz môžete upraviť metadáta`);
      if (onImportComplete) {
        onImportComplete(uploadedFiles);
      }
    }
    
    setImporting(false);
  };

  // Analyzovať názvy pre automatické priradenie
  const analyzeFileForDom = (file) => {
    const searchText = `${file.path} ${file.name}`.toLowerCase();
    
    for (const dom of domy) {
      const domName = dom.nazov.toLowerCase();
      const words = domName.split(/[\s\-_]+/);
      
      // Hľadať zhodu s názvom domu
      if (words.some(word => word.length > 2 && searchText.includes(word))) {
        return dom;
      }
    }
    return null;
  };

  // Určiť typ fotky z názvu
  const determinePhotoType = (file) => {
    const name = file.name.toLowerCase();
    const path = file.path.toLowerCase();
    
    if (name.includes('hlavny') || name.includes('main') || name.includes('cover') || path.includes('hlavny')) {
      return 'hlavny_obrazok';
    }
    if (name.includes('zaklad') || name.includes('config') || path.includes('zaklad') || path.includes('konfigur')) {
      return 'zakladna_konfiguracia';
    }
    if (name.includes('stare') || name.includes('old') || path.includes('stare') || path.includes('archiv')) {
      return 'stare_fotky';
    }
    if (name.includes('nove') || name.includes('new') || path.includes('nove')) {
      return 'nove_fotky';
    }
    return 'galeria';
  };

  const groupFilesByPath = () => {
    const groups = {};
    for (const file of importedFiles) {
      const path = file.path || 'Bez priečinka';
      if (!groups[path]) {
        groups[path] = [];
      }
      groups[path].push(file);
    }
    return groups;
  };

  // Render modals first to maintain hook consistency
  const modals = (
    <>
      <PhotoDetailViewer
        photos={completedImports.map(p => ({
          ...p,
          nazov: p.originalName,
          url: p.url
        }))}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onEdit={(photo) => {
          setViewerOpen(false);
          setEditingPhoto(photo);
        }}
      />
      <PhotoMetadataEditor
        photo={editingPhoto}
        isOpen={!!editingPhoto}
        onClose={() => setEditingPhoto(null)}
        domy={domy}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['fotky'] });
        }}
      />
    </>
  );

  if (checking) {
    return (
      <>
        {modals}
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Kontrolujem pripojenie k Google Drive...</p>
        </Card>
      </>
    );
  }

  if (!isConnected) {
    return (
      <>
        {modals}
        <Card className="p-8 text-center border-2 border-dashed border-blue-300 bg-blue-50">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pripojte Google Drive</h3>
          <p className="text-gray-600 mb-6">
            Pre import fotiek z priečinkov je potrebné pripojiť váš Google Drive účet.
          </p>
          <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
            <FolderOpen className="w-4 h-4 mr-2" />
            Pripojiť Google Drive
          </Button>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Import z Google Drive</h3>
            <p className="text-xs text-gray-500">
              {step === 'select-folders' && 'Vyberte priečinky s fotkami'}
              {step === 'preview-files' && `Nájdených ${importedFiles.length} fotiek`}
              {step === 'edit-metadata' && `Upravte metadáta ${completedImports.length} fotiek`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={checkConnection}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Step 1: Select Folders */}
      {step === 'select-folders' && (
        <>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Dostupné priečinky ({selectedFolders.length} vybraných)
              </p>
              {selectedFolders.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedFolders([])}>
                  Zrušiť výber
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {folders.map(folder => (
                  <div key={folder.id} className="space-y-1">
                    <div 
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        selectedFolders.includes(folder.id) 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        checked={selectedFolders.includes(folder.id)}
                        onCheckedChange={() => toggleFolderSelection(folder.id)}
                      />
                      <button
                        onClick={() => loadFolderContents(folder.id)}
                        className="flex items-center gap-2 flex-grow text-left"
                      >
                        {loadingFolders[folder.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        ) : expandedFolders[folder.id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <FolderOpen className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{folder.name}</span>
                      </button>
                      {folderContents[folder.id] && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {folderContents[folder.id].length} fotiek
                        </Badge>
                      )}
                    </div>
                    
                    {/* Expanded folder contents */}
                    {expandedFolders[folder.id] && folderContents[folder.id] && (
                      <div className="ml-8 pl-4 border-l-2 border-gray-200 space-y-1 max-h-40 overflow-y-auto">
                        {folderContents[folder.id].slice(0, 10).map(file => (
                          <div key={file.id} className="flex items-center gap-2 text-xs text-gray-600 py-1">
                            <ImageIcon className="w-3 h-3 text-blue-400" />
                            <span className="truncate">{file.path}/{file.name}</span>
                          </div>
                        ))}
                        {folderContents[folder.id].length > 10 && (
                          <p className="text-xs text-gray-400">
                            ... a ďalších {folderContents[folder.id].length - 10} súborov
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Button 
            onClick={loadAllSelectedFolders}
            disabled={selectedFolders.length === 0 || importing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Načítavam...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Načítať fotky z {selectedFolders.length} priečinkov
              </>
            )}
          </Button>
        </>
      )}

      {/* Step 2: Preview and Select Files */}
      {step === 'preview-files' && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setStep('select-folders')}>
              ← Späť
            </Button>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                {selectedFiles.length} z {importedFiles.length} vybraných
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedFiles(importedFiles.map(f => f.id))}
                >
                  Vybrať všetky
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  Zrušiť
                </Button>
              </div>
            </div>

            <ScrollArea className="h-72">
              {Object.entries(groupFilesByPath()).map(([path, files]) => (
                <div key={path} className="mb-4">
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                    <FolderOpen className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-gray-700">{path}</span>
                    <Badge className="text-xs">{files.length}</Badge>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 ml-6">
                    {files.map(file => {
                      const isSelected = selectedFiles.includes(file.id);
                      const suggestedDom = analyzeFileForDom(file);
                      const photoType = determinePhotoType(file);
                      
                      return (
                        <div 
                          key={file.id}
                          onClick={() => {
                            setSelectedFiles(prev => 
                              isSelected 
                                ? prev.filter(id => id !== file.id)
                                : [...prev, file.id]
                            );
                          }}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle className="w-4 h-4 text-blue-500 bg-white rounded-full" />
                            </div>
                          )}
                          {suggestedDom && (
                            <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[8px] px-1 py-0.5 truncate">
                              {suggestedDom.nazov}
                            </div>
                          )}
                          <p className="text-[9px] text-gray-600 p-1 truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </Card>

          {importing && (
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">Importujem fotky...</span>
                <span className="text-sm text-blue-700">
                  {importProgress.current}/{importProgress.total}
                </span>
              </div>
              <Progress value={(importProgress.current / importProgress.total) * 100} className="h-2" />
              {importProgress.currentFile && (
                <p className="text-xs text-blue-600 mt-2 truncate">{importProgress.currentFile}</p>
              )}
            </Card>
          )}

          <Button 
            onClick={importSelectedFiles}
            disabled={selectedFiles.length === 0 || importing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importujem {importProgress.current}/{importProgress.total}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importovať {selectedFiles.length} fotiek
              </>
            )}
          </Button>
        </>
      )}

      {/* Step 3: Edit Metadata */}
      {step === 'edit-metadata' && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => {
              setStep('select-folders');
              setCompletedImports([]);
            }}>
              ← Nový import
            </Button>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Importované fotky ({completedImports.length})
              </p>
              <p className="text-xs text-gray-500">
                Kliknite na fotku pre úpravu metadát
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {completedImports.map((photo, index) => (
                <div 
                  key={index}
                  className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div 
                    className="aspect-square bg-gray-100"
                    onClick={() => {
                      setViewerIndex(index);
                      setViewerOpen(true);
                    }}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center pointer-events-none"
                  >
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                      Zobraziť
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1">
                    <p className="text-[9px] text-gray-600 truncate flex-grow" title={photo.originalName}>
                      {photo.originalName}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhoto(photo);
                      }}
                      className="text-blue-500 hover:text-blue-700 p-0.5"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setStep('select-folders');
                setCompletedImports([]);
              }}
              className="flex-1"
            >
              Importovať ďalšie
            </Button>
            <Button 
              onClick={() => {
                toast.success('Import dokončený');
                setStep('select-folders');
                setCompletedImports([]);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Dokončiť
            </Button>
          </div>
        </>
      )}

      {/* Sync Manager Section */}
      {isConnected && folders.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <GoogleDriveSyncManager folders={folders} domy={domy} />
        </div>
      )}

      {modals}
    </div>
  );
}