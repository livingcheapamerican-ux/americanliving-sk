
import React, { useState, useRef, useEffect } from "react";
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
  AlertCircle, CheckCircle, Loader2, X, Building2, FolderOpen, Brain, Eye, Home, List, Folder, AlertTriangle, Info, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DokumentyTreeView from "../components/DokumentyTreeView";

export default function AdminDokumenty() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cancelUpload, setCancelUpload] = useState(false);
  const [selectedVyrobca, setSelectedVyrobca] = useState("all");
  const [uploadMode, setUploadMode] = useState("files");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [uploadResults, setUploadResults] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [fileStatuses, setFileStatuses] = useState({});
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
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  const folderInputRef = useRef(null);

  useEffect(() => {
    // This useEffect is to ensure webkitdirectory attribute is set programmatically.
    // It's a non-standard attribute but widely supported by browsers for folder upload.
    // Setting it this way ensures it persists even if React re-renders the input.
    if (folderInputRef.current && uploadMode === "folder") {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', ''); // For older Firefox
    }
  }, [uploadMode]);

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
    setCurrentFileName("");
    setUploading(false);
    setFileStatuses({});
    setCurrentFileProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setCancelUpload(false);
  };

  const shouldSkipFile = (fileName) => {
    const skipPatterns = [
      /^\.DS_Store$/i,
      /^\._/,
      /^__MACOSX/,
      /^Thumbs\.db$/i,
      /^desktop\.ini$/i,
      /^\.(git|svn|hg)/
    ];

    return skipPatterns.some(pattern => pattern.test(fileName));
  };

  const extractFolderInfo = (filePath) => {
    if (!filePath || filePath === '') {
      return { model_domu: null, podpriecinok: null, cesta_priecinku: null };
    }

    const parts = filePath.split('/').filter(p => p && p.trim() !== '' && !shouldSkipFile(p));

    if (parts.length === 1) {
      return { model_domu: null, podpriecinok: null, cesta_priecinku: null };
    }

    const mainFolder = parts[0];
    const subFolder = parts.length > 2 ? parts[parts.length - 2] : null;
    const fullPath = parts.slice(0, -1).join('/');

    let modelDomu = mainFolder
      .replace(/_/g, ' ')
      .replace(/^(Dom|Model|Modul)\s*/i, '')
      .trim();

    return {
      model_domu: modelDomu || mainFolder,
      podpriecinok: subFolder || null,
      cesta_priecinku: fullPath
    };
  };

  const isFileDuplicate = (fileName, fileSize) => {
    return dokumenty.some(dok =>
      dok.nazov === fileName && dok.velkost === fileSize
    );
  };

  const handleFileSelect = (e) => {
    const allFiles = Array.from(e.target.files);
    const validFiles = allFiles.filter(file => !shouldSkipFile(file.name));

    console.log(`📁 Vybratých ${allFiles.length} súborov, po filtrovaní ${validFiles.length} súborov`);
    if (allFiles.length > validFiles.length) {
      console.log(`🗑️  Vyfiltrovaných ${allFiles.length - validFiles.length} systémových súborov`);
    }

    setSelectedFiles(validFiles);

    // Calculate total bytes
    const total = validFiles.reduce((sum, file) => sum + file.size, 0);
    setTotalBytes(total);

    // Initialize file statuses
    const initialStatuses = {};
    validFiles.forEach(file => {
      initialStatuses[file.name] = 'pending';
    });
    setFileStatuses(initialStatuses);
  };

  const updateFileStatus = (fileName, status) => {
    setFileStatuses(prev => ({
      ...prev,
      [fileName]: status
    }));
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

  const getErrorDetails = (error, file) => {
    const errorMsg = error.message || error.toString();

    if (errorMsg.includes('size') || errorMsg.includes('large') || errorMsg.includes('payload')) {
      return {
        type: 'FILE_SIZE',
        message: `Súbor ${file.name} je príliš veľký (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        suggestion: 'Skúste nahrať menšie súbory alebo komprimujte obrázky',
        retryable: false
      };
    }

    if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('timeout')) {
      return {
        type: 'NETWORK',
        message: 'Problém s pripojením k internetu alebo vypršal čas nahrávania',
        suggestion: 'Skontrolujte pripojenie a skúste znova. Ak je súbor veľký, skúste ho rozdeliť alebo uploadovať jednotlivo.',
        retryable: true
      };
    }

    if (errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('403')) {
      return {
        type: 'PERMISSION',
        message: 'Nemáte oprávnenie nahrať tento súbor',
        suggestion: 'Kontaktujte administrátora',
        retryable: false
      };
    }

    if (errorMsg.includes('database') || errorMsg.includes('constraint') || errorMsg.includes('duplicate')) {
      return {
        type: 'DATABASE',
        message: 'Chyba pri ukladaní do databázy',
        suggestion: 'Súbor možno už existuje alebo obsahuje neplatné údaje',
        retryable: false
      };
    }

    if (errorMsg.includes('format') || errorMsg.includes('type') || errorMsg.includes('mime')) {
      return {
        type: 'FORMAT',
        message: 'Nepodporovaný formát súboru',
        suggestion: 'Skúste iný formát súboru',
        retryable: false
      };
    }

    return {
      type: 'UNKNOWN',
      message: errorMsg,
      suggestion: 'Skúste nahrať súbor znova',
      retryable: true
    };
  };

  const uploadFileWithRetry = async (file, maxRetries = 1, onProgress) => {
    let lastError;
    let progressInterval = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (cancelUpload) {
          throw new Error('Upload bol zrušený');
        }
        if (attempt > 0) {
          console.log(`🔄 Pokus ${attempt + 1}/${maxRetries + 1} pre súbor: ${file.name}`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Simulate progress
        if (onProgress) {
          onProgress(0);
          progressInterval = setInterval(() => {
            setCurrentFileProgress(prev => {
              if (prev >= 90) { // Stop at 90% as actual upload is about to happen
                clearInterval(progressInterval); // Clear interval if it reaches 90% before actual upload finishes
                return prev;
              }
              return prev + 10;
            });
          }, 100);
        }

        // Upload with timeout
        const uploadPromise = base44.integrations.Core.UploadFile({ file });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout - súbor je príliš veľký alebo pomalé pripojenie')), 60000)
        );

        const uploadResponse = await Promise.race([uploadPromise, timeoutPromise]);

        if (progressInterval) {
          clearInterval(progressInterval);
        }
        if (onProgress) {
          onProgress(100); // Set to 100% on successful upload
        }

        return uploadResponse;

      } catch (error) {
        lastError = error;
        // Clear interval on error too
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        console.error(`❌ Chyba pri nahrávaní ${file.name}:`, error.message);
        
        const errorDetails = getErrorDetails(error, file);

        if (!errorDetails.retryable || attempt === maxRetries || cancelUpload) {
          throw error;
        }

        console.log(`⚠️  Chyba pri pokuse ${attempt + 1}, skúšam znova...`);
      }
    }

    throw lastError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Vyberte aspoň jeden súbor");
      return;
    }

    console.log('🚀 ========== ZAČÍNAM UPLOAD ==========');
    console.log('🚀 Počet súborov na spracovanie:', selectedFiles.length);

    setUploading(true);
    setCancelUpload(false); // Reset cancel state at the start of new upload
    setUploadProgress({ current: 0, total: selectedFiles.length });
    setUploadResults(null);
    setUploadedBytes(0);

    const results = {
      successful: [],
      skipped: [],
      failed: []
    };

    let cumulativeBytes = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        if (cancelUpload) {
          console.log('🛑 Upload zrušený používateľom');
          results.failed.push({
            name: `Zostávajúcich ${selectedFiles.length - i} súborov`,
            error: 'Upload zrušený používateľom',
            suggestion: 'Upload bol manuálne zastavený',
            type: 'CANCELLED'
          });
          break; // Exit the loop if cancelled
        }

        const file = selectedFiles[i];
        const fileNum = i + 1;

        console.log(`\n📦 [${fileNum}/${selectedFiles.length}] ${file.name}`);

        setUploadProgress({ current: fileNum, total: selectedFiles.length });
        setCurrentFileName(file.name);
        setCurrentFileProgress(0);
        updateFileStatus(file.name, 'nahrávam');

        try {
          if (shouldSkipFile(file.name)) {
            console.log(`⏭️  Preskočený systémový súbor: ${file.name}`);
            updateFileStatus(file.name, 'preskočený');
            cumulativeBytes += file.size;
            setUploadedBytes(cumulativeBytes);
            results.skipped.push({
              name: file.name,
              reason: 'Systémový súbor (ignorovaný)'
            });
            continue;
          }

          if (isFileDuplicate(file.name, file.size)) {
            console.log(`⏭️  Duplicita: ${file.name}`);
            updateFileStatus(file.name, 'duplicita');
            cumulativeBytes += file.size;
            setUploadedBytes(cumulativeBytes);
            results.skipped.push({
              name: file.name,
              reason: 'Súbor už existuje'
            });
            continue;
          }

          console.log(`📤 Nahrávam: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
          const uploadResponse = await uploadFileWithRetry(file, 1, (progress) => {
            setCurrentFileProgress(progress);
          });
          console.log(`✅ Nahraný: ${file.name}`);

          cumulativeBytes += file.size;
          setUploadedBytes(cumulativeBytes);
          setCurrentFileProgress(100); // Ensure it's 100% on success

          const filePath = file.webkitRelativePath || file.name;
          const folderInfo = extractFolderInfo(filePath);

          const autoTags = [...formData.tags];
          if (folderInfo.model_domu) autoTags.push(folderInfo.model_domu);
          if (folderInfo.podpriecinok) autoTags.push(folderInfo.podpriecinok);

          const docData = {
            nazov: file.name,
            popis: formData.popis,
            typ: formData.typ,
            vyrobca: formData.vyrobca,
            pre_chatbota: formData.pre_chatbota,
            tags: [...new Set(autoTags)],
            model_domu: folderInfo.model_domu,
            podpriecinok: folderInfo.podpriecinok,
            cesta_priecinku: folderInfo.cesta_priecinku,
            subor_url: uploadResponse.file_url,
            velkost: file.size,
            typ_suboru: file.type || 'application/octet-stream'
          };

          const doc = await createMutation.mutateAsync(docData);
          console.log(`✅ Vytvorený dokument ID: ${doc.id}`);

          updateFileStatus(file.name, 'nahratý');
          results.successful.push({
            name: file.name,
            id: doc.id
          });

        } catch (fileError) {
          console.error(`❌ Chyba pri ${file.name}:`, fileError);

          cumulativeBytes += file.size;
          setUploadedBytes(cumulativeBytes);
          updateFileStatus(file.name, 'odmietnutý');
          const errorDetails = getErrorDetails(fileError, file);
          results.failed.push({
            name: file.name,
            error: errorDetails.message,
            suggestion: errorDetails.suggestion,
            type: errorDetails.type
          });
        }
      }

      console.log('\n📊 SUMMARY:');
      console.log(`✅ Úspešné: ${results.successful.length}`);
      console.log(`⏭️  Preskočené: ${results.skipped.length}`);
      console.log(`❌ Chybné: ${results.failed.length}`);

      if (results.successful.length > 0 && !cancelUpload) { // Only analyze if not cancelled
        console.log('\n🧠 Spúšťam analýzu...');
        setCurrentFileName("Analyzujem dokumenty...");
        setUploadProgress({ current: 0, total: results.successful.length });

        for (let i = 0; i < results.successful.length; i++) {
          if (cancelUpload) {
            console.log('🛑 Analýza zrušená používateľom');
            break; // Exit analysis loop if cancelled
          }
          setUploadProgress({ current: i + 1, total: results.successful.length });
          try {
            await analyzeMutation.mutateAsync(results.successful[i].id);
          } catch (error) {
            console.error(`⚠️  Chyba analýzy pre: ${results.successful[i].name}`);
          }
        }
      }

      console.log('🎉 HOTOVO!');
      setUploadResults(results);
      setShowForm(false);

    } catch (error) {
      console.error('💥 KRITICKÁ CHYBA:', error);
      alert("Kritická chyba: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      setCurrentFileName("");
      setCurrentFileProgress(0);
      setCancelUpload(false); // Reset cancel state
    }
  };

  const vyrobcovia = ["American Living", "JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];

  const filteredDokumenty = dokumenty.filter(dok => {
    const matchesSearch = dok.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dok.popis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dok.model_domu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dok.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVyrobca = selectedVyrobca === "all" || dok.vyrobca === selectedVyrobca;

    return matchesSearch && matchesVyrobca;
  });

  const getVyrobcaCount = (vyrobca) => {
    return dokumenty.filter(d => d.vyrobca === vyrobca).length;
  };

  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined) return 'N/A';
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
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📄';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'nahrávam':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Nahrávam</Badge>;
      case 'nahratý':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Nahratý</Badge>;
      case 'odmietnutý':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Odmietnutý</Badge>;
      case 'duplicita':
        return <Badge className="bg-yellow-100 text-yellow-800"><Info className="w-3 h-3 mr-1" />Duplicita</Badge>;
      case 'preskočený':
        return <Badge className="bg-gray-100 text-gray-800"><X className="w-3 h-3 mr-1" />Preskočený</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Čaká</Badge>;
      default:
        return null;
    }
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
              <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Automatická AI analýza a kategorizácia</p>
                <p>Systém automaticky filtruje systémové súbory (.DS_Store, ._*, atď.) a rozpoznáva štruktúru priečinkov. Duplicitné súbory sa preskočia a pri chybách sa automaticky skúsi znova.</p>
              </div>
            </div>
          </Card>

          {uploadResults && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Výsledky nahrávania</h3>
                    <Button variant="ghost" size="sm" onClick={() => setUploadResults(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {uploadResults.successful.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">
                            Úspešne nahrané: {uploadResults.successful.length}
                          </span>
                        </div>
                        <div className="text-sm text-green-700 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResults.successful.map((item, i) => (
                            <div key={i}>✓ {item.name}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResults.skipped.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-800">
                            Preskočené: {uploadResults.skipped.length}
                          </span>
                        </div>
                        <div className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResults.skipped.map((item, i) => (
                            <div key={i}>
                              ⊘ {item.name}
                              <span className="text-xs ml-2">({item.reason})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResults.failed.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-800">
                            Chybné: {uploadResults.failed.length}
                          </span>
                        </div>
                        <div className="text-sm text-red-700 space-y-2 max-h-48 overflow-y-auto">
                          {uploadResults.failed.map((item, i) => (
                            <div key={i} className="border-l-2 border-red-400 pl-2">
                              <div className="font-medium">✗ {item.name}</div>
                              <div className="text-xs ml-2">
                                <div>❌ {item.error}</div>
                                {item.suggestion && (
                                  <div className="text-red-600 mt-1">💡 {item.suggestion}</div>
                                )}
                              </div>
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
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                size="icon"
                title="Zoznam"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "tree" ? "default" : "outline"}
                onClick={() => setViewMode("tree")}
                size="icon"
                title="Stromová štruktúra"
              >
                <Folder className="w-4 h-4" />
              </Button>
              <Button onClick={() => {
                setShowForm(!showForm);
                setUploadResults(null);
                if (!showForm) {
                  setUploading(false);
                  setUploadProgress({ current: 0, total: 0 });
                  setCurrentFileName("");
                  setFileStatuses({});
                }
              }} className="bg-primary">
                <Upload className="w-4 h-4 mr-2" />
                Nahrať dokumenty
              </Button>
            </div>
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
                    <div className="flex items-center space-x-4">
                        <Label htmlFor="upload-mode">Režim nahrávania:</Label>
                        <Select
                            value={uploadMode}
                            onValueChange={(value) => {
                                setUploadMode(value);
                                setSelectedFiles([]); // Clear files when mode changes
                                setFileStatuses({});
                                setTotalBytes(0);
                                setUploadedBytes(0);
                                setCurrentFileProgress(0);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Vyberte režim" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="files">Súbory</SelectItem>
                                <SelectItem value="folder">Priečinok</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                      <Label>{uploadMode === "folder" ? "Priečinok *" : "Súbory *"}</Label>
                      <div className="mt-2">
                        {uploadMode === "folder" ? (
                          <input
                            ref={folderInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            multiple
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        ) : (
                          <Input
                            type="file"
                            onChange={handleFileSelect}
                            multiple
                            required
                          />
                        )}
                        {selectedFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Vybraných {selectedFiles.length} súborov
                            </p>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                              {selectedFiles.map((file, index) => {
                                const folderInfo = extractFolderInfo(file.webkitRelativePath || file.name);
                                const isDuplicate = isFileDuplicate(file.name, file.size);
                                const status = fileStatuses[file.name] || 'pending';
                                
                                return (
                                  <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                                    <div className="flex items-center gap-2 flex-grow min-w-0">
                                      <span className="text-lg flex-shrink-0">{getFileIcon(file.type)}</span>
                                      <div className="min-w-0 flex-grow">
                                        <span className="text-sm text-gray-700 block truncate">{file.name}</span>
                                        {folderInfo.model_domu && (
                                          <span className="text-xs text-blue-600">
                                            🏠 {folderInfo.model_domu}
                                            {folderInfo.podpriecinok && ` / ${folderInfo.podpriecinok}`}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500 flex-shrink-0 mr-2">({formatFileSize(file.size)})</span>
                                      {getStatusBadge(isDuplicate && status === 'pending' ? 'duplicita' : status)}
                                    </div>
                                    {!uploading && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

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

                    {uploading && (
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-blue-800">
                              {currentFileName || `Spracúvam ${uploadProgress.current} z ${uploadProgress.total}...`}
                            </p>
                            <span className="text-xs text-blue-600">
                              {currentFileProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${currentFileProgress}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-blue-700">
                              Celkový progress: {uploadProgress.current} / {uploadProgress.total} súborov
                            </p>
                            <span className="text-xs text-blue-600">
                              {formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
                            />
                          </div>
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
                          if (uploading) {
                            setCancelUpload(true); // Signal to stop the upload process
                          } else {
                            setShowForm(false);
                            resetForm();
                          }
                        }}
                      >
                        {uploading ? 'Zastaviť' : 'Zrušiť'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {viewMode === "list" && (
            <Tabs value={selectedVyrobca} onValueChange={setSelectedVyrobca} className="mb-6">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                <TabsTrigger value="all">Všetky ({dokumenty.length})</TabsTrigger>
                {vyrobcovia.map(v => (
                  <TabsTrigger key={v} value={v}>{v.split(' ')[0]} ({getVyrobcaCount(v)})</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-gray-600">Načítavam dokumenty...</p>
            </div>
          ) : viewMode === "tree" ? (
            <DokumentyTreeView
              dokumenty={filteredDokumenty}
              onViewDocument={setViewingDocument}
            />
          ) : filteredDokumenty.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {searchQuery ? "Nenašli sa žiadne dokumenty" : "Žiadne dokumenty"}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDokumenty.map((dok, index) => (
                <motion.div key={dok.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{getFileIcon(dok.typ_suboru)}</div>
                      <div className="flex-grow">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{dok.nazov}</h3>
                            {dok.model_domu && (
                              <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                <Home className="w-3 h-3" />Model: {dok.model_domu}{dok.podpriecinok && ` / ${dok.podpriecinok}`}
                              </p>
                            )}
                            {dok.popis && <p className="text-sm text-gray-600 mt-1">{dok.popis}</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {dok.analyzovaný && (
                              <Button size="sm" variant="outline" onClick={() => setViewingDocument(dok)}>
                                <Eye className="w-4 h-4 mr-1" />Analýza
                              </Button>
                            )}
                            <a href={dok.subor_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-1" />Stiahnuť
                              </Button>
                            </a>
                            <Button size="sm" variant="ghost" onClick={() => {
                              if (window.confirm('Naozaj chcete vymazať tento dokument?')) {
                                deleteMutation.mutate(dok.id);
                              }
                            }} className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge className={vyrobcaColors[dok.vyrobca]}>
                            <Building2 className="w-3 h-3 mr-1" />{dok.vyrobca}
                          </Badge>
                          <Badge variant="outline">{typLabels[dok.typ]}</Badge>
                          <Badge variant="secondary">{formatFileSize(dok.velkost)}</Badge>
                          {dok.pre_chatbota && <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pre chatbota</Badge>}
                          {dok.analyzovaný && <Badge className="bg-purple-100 text-purple-800"><Brain className="w-3 h-3 mr-1" />Analyzované AI</Badge>}
                          {dok.tags?.map(tag => <Badge key={tag} className="bg-blue-100 text-blue-800">{tag}</Badge>)}
                          <span className="text-xs text-gray-500 ml-auto">{new Date(dok.created_date).toLocaleDateString('sk-SK')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {viewingDocument && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingDocument(null)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">AI Analýza dokumentu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setViewingDocument(null)}><X className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Dokument:</h3>
                      <p className="text-gray-700">{viewingDocument.nazov}</p>
                      {viewingDocument.model_domu && (
                        <p className="text-blue-600 text-sm mt-1">🏠 Model domu: {viewingDocument.model_domu}{viewingDocument.podpriecinok && ` / ${viewingDocument.podpriecinok}`}</p>
                      )}
                    </div>
                    {viewingDocument.extrahovaný_obsah && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Extrahovaný obsah:</h3>
                        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">{viewingDocument.extrahovaný_obsah}</p>
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
                                {viewingDocument.kľúčové_informácie.modely_domov.map((model, i) => <Badge key={i} className="bg-blue-100 text-blue-800">{model}</Badge>)}
                              </div>
                            </div>
                          )}
                          {viewingDocument.kľúčové_informácie.cenové_informácie?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Cenové informácie:</p>
                              <ul className="list-disc list-inside text-gray-700">
                                {viewingDocument.kľúčové_informácie.cenové_informácie.map((info, i) => <li key={i}>{info}</li>)}
                              </ul>
                            </div>
                          )}
                          {viewingDocument.kľúčové_informácie.technické_údaje?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Technické údaje:</p>
                              <ul className="list-disc list-inside text-gray-700">
                                {viewingDocument.kľúčové_informácie.technické_údaje.map((info, i) => <li key={i}>{info}</li>)}
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
