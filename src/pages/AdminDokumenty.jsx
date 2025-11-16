
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  AlertCircle, CheckCircle, Loader2, X, Building2, FolderOpen, Brain, Eye, Home, List, Folder, AlertTriangle, Info, Clock, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DokumentyTreeView from "../components/DokumentyTreeView";

const UPLOAD_STATE_KEY = 'document_upload_state';

// Optimalizované Select komponenty
const VyrobcaSelect = React.memo(({ value, onChange }) => {
  const vyrobcovia = ["American Living", "JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="transition-all duration-200 hover:border-primary/50 focus:border-primary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {vyrobcovia.map(v => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const TypSelect = React.memo(({ value, onChange, typLabels }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="transition-all duration-200 hover:border-primary/50 focus:border-primary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(typLabels).map(([key, label]) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

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
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
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
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (folderInputRef.current && uploadMode === "folder") {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, [uploadMode]);

  // Načítanie rozpracovaného uploadu pri štarte
  useEffect(() => {
    const savedState = localStorage.getItem(UPLOAD_STATE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.timestamp && Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          const hasIncomplete = Object.values(state.fileStatuses).some(
            status => status === 'nahrávam' || status === 'pending'
          );
          if (hasIncomplete && window.confirm('Našiel som nedokončené nahrávanie. Chcete pokračovať?')) {
            setFileStatuses(state.fileStatuses);
            setUploadProgress(state.uploadProgress);
            setFormData(state.formData);
            setUploadMode(state.uploadMode);
            alert('Prosím znova vyberte súbory/priečinky. Už nahrané súbory budú preskočené.');
          } else {
            localStorage.removeItem(UPLOAD_STATE_KEY);
          }
        } else {
          localStorage.removeItem(UPLOAD_STATE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(UPLOAD_STATE_KEY);
      }
    }
  }, []);

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
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
    window.currentUploadCancelRef = null;
    localStorage.removeItem(UPLOAD_STATE_KEY);
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

    if (parts.length === 1 && !filePath.endsWith('/')) {
        return { model_domu: null, podpriecinok: null, cesta_priecinku: null };
    }

    const pathSegments = filePath.split('/').filter(p => p && p.trim() !== '');
    const fileName = pathSegments[pathSegments.length - 1];
    const folderSegments = pathSegments.slice(0, -1);

    if (folderSegments.length === 0) {
        return { model_domu: null, podpriecinok: null, cesta_priecinku: null };
    }

    const mainFolder = folderSegments[0];
    const subFolder = folderSegments.length > 1 ? folderSegments[folderSegments.length - 1] : null;
    const fullPath = folderSegments.join('/');

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

  const isFileDuplicate = (fileName, fileSize, folderPath) => {
    return dokumenty.some(dok =>
      dok.nazov === fileName && 
      dok.velkost === fileSize &&
      dok.cesta_priecinku === folderPath
    );
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => !shouldSkipFile(file.name));

    console.log(`📁 Vybratých ${newFiles.length} súborov, po filtrovaní ${validFiles.length} súborov`);
    if (newFiles.length > validFiles.length) {
      console.log(`🗑️  Vyfiltrovaných ${newFiles.length - validFiles.length} systémových súborov`);
    }

    setSelectedFiles(prev => {
      const allSelectedFiles = [...prev, ...validFiles];
      const total = allSelectedFiles.reduce((sum, file) => sum + file.size, 0);
      setTotalBytes(total);

      const initialStatuses = {};
      validFiles.forEach(file => {
        const existingStatus = fileStatuses[file.name];
        initialStatuses[file.name] = existingStatus === 'nahratý' ? 'nahratý' : 'pending';
      });
      setFileStatuses(prevStatuses => ({ ...prevStatuses, ...initialStatuses }));

      return allSelectedFiles;
    });

    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items) return;

    const processEntries = async () => {
      const allFiles = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          await traverseFileTree(item, allFiles);
        }
      }

      const validFiles = allFiles.filter(file => !shouldSkipFile(file.name));
      
      console.log(`📁 Dropped ${allFiles.length} súborov, po filtrovaní ${validFiles.length} súborov`);
      if (allFiles.length > validFiles.length) {
        console.log(`🗑️  Vyfiltrovaných ${allFiles.length - validFiles.length} systémových súborov`);
      }

      setSelectedFiles(prev => {
        const allSelectedFiles = [...prev, ...validFiles];
        const total = allSelectedFiles.reduce((sum, file) => sum + file.size, 0);
        setTotalBytes(total);

        const initialStatuses = {};
        validFiles.forEach(file => {
          const existingStatus = fileStatuses[file.name];
          initialStatuses[file.name] = existingStatus === 'nahratý' ? 'nahratý' : 'pending';
        });
        setFileStatuses(prevStatuses => ({ ...prevStatuses, ...initialStatuses }));

        return allSelectedFiles;
      });
    };

    processEntries();
  };

  const traverseFileTree = async (item, allFiles, path = '') => {
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file) => {
          const modifiedFile = new File([file], file.name, { type: file.type });
          Object.defineProperty(modifiedFile, 'webkitRelativePath', {
            value: path + file.name,
            writable: false
          });
          allFiles.push(modifiedFile);
          resolve();
        });
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      return new Promise((resolve) => {
        dirReader.readEntries(async (entries) => {
          for (const entry of entries) {
            await traverseFileTree(entry, allFiles, path + item.name + '/');
          }
          resolve();
        });
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const updateFileStatus = (fileName, status) => {
    setFileStatuses(prev => ({
      ...prev,
      [fileName]: status
    }));
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      const total = newFiles.reduce((sum, file) => sum + file.size, 0);
      setTotalBytes(total);
      return newFiles;
    });
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
    setFileStatuses({});
    setTotalBytes(0);
    setUploadedBytes(0);
    localStorage.removeItem(UPLOAD_STATE_KEY);
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

  const handleAnalyzeAll = async () => {
    const unanalyzed = dokumenty.filter(dok => !dok.analyzovaný);
    
    if (unanalyzed.length === 0) {
      alert("Všetky dokumenty sú už analyzované!");
      return;
    }

    if (!confirm(`Chcete analyzovať ${unanalyzed.length} neanalyzovaných dokumentov?`)) {
      return;
    }

    setAnalyzingAll(true);
    setAnalysisProgress({ current: 0, total: unanalyzed.length });

    try {
      const analysisBatches = [];
      for (let i = 0; i < unanalyzed.length; i += 10) {
        analysisBatches.push(unanalyzed.slice(i, i + 10));
      }

      let analyzedCount = 0;
      for (const analysisBatch of analysisBatches) {
        await Promise.allSettled(
          analysisBatch.map(dok => 
            analyzeMutation.mutateAsync(dok.id).catch(() => {})
          )
        );
        
        analyzedCount += analysisBatch.length;
        setAnalysisProgress({ current: analyzedCount, total: unanalyzed.length });
      }

      alert(`Úspešne analyzovaných ${unanalyzed.length} dokumentov!`);
    } catch (error) {
      alert("Chyba pri hromadnej analýze: " + error.message);
    } finally {
      setAnalyzingAll(false);
      setAnalysisProgress({ current: 0, total: 0 });
    }
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

  const uploadFileWithRetry = async (file, maxRetries = 1, onProgress, cancelRef) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (cancelRef?.current) {
          throw new Error('Upload bol zrušený');
        }
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const uploadPromise = base44.integrations.Core.UploadFile({ file });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), 90000)
        );

        const uploadResponse = await Promise.race([uploadPromise, timeoutPromise]);

        if (onProgress) onProgress(100);
        return uploadResponse;

      } catch (error) {
        lastError = error;
        const errorDetails = getErrorDetails(error, file);

        if (errorDetails.type === 'NETWORK' && attempt < maxRetries + 2) {
          continue;
        }

        if (!errorDetails.retryable || attempt === maxRetries || cancelRef?.current) {
          throw error;
        }
      }
    }

    throw lastError;
  };

  const saveUploadState = (statuses, progress, formData, uploadMode) => {
    const state = {
      fileStatuses: statuses,
      uploadProgress: progress,
      formData,
      uploadMode,
      timestamp: Date.now()
    };
    localStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(state));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Vyberte aspoň jeden súbor");
      return;
    }

    setUploading(true);
    const cancelRef = { current: false };
    window.currentUploadCancelRef = cancelRef;
    
    const alreadyUploaded = Object.values(fileStatuses).filter(s => s === 'nahratý').length;
    setUploadProgress({ current: alreadyUploaded, total: selectedFiles.length });
    setUploadResults(null);

    const results = {
      successful: [],
      skipped: [],
      failed: []
    };

    let completedCount = alreadyUploaded;
    let cumulativeBytes = 0;

    selectedFiles.forEach((file, idx) => {
      if (fileStatuses[file.name] === 'nahratý') {
        cumulativeBytes += file.size;
      }
    });
    setUploadedBytes(cumulativeBytes);

    try {
      const BATCH_SIZE = 10;
      
      const filesToUpload = selectedFiles.filter(file => fileStatuses[file.name] !== 'nahratý');
      
      if (filesToUpload.length === 0) {
        alert("Všetky súbory sú už nahrané!");
        setUploading(false);
        return;
      }

      const batches = [];
      for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
        batches.push(filesToUpload.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        if (cancelRef.current) {
          const remaining = filesToUpload.length - (completedCount - alreadyUploaded);
          if (remaining > 0) {
            results.failed.push({
              name: `Zostávajúcich ${remaining} súborov`,
              error: 'Upload zrušený',
              suggestion: 'Upload bol manuálne zastavený',
              type: 'CANCELLED'
            });
          }
          break;
        }

        const batchPromises = batch.map(async (file) => {
          if (cancelRef.current) return null;

          updateFileStatus(file.name, 'nahrávam');
          setCurrentFileName(file.name);

          try {
            if (shouldSkipFile(file.name)) {
              updateFileStatus(file.name, 'preskočený');
              results.skipped.push({ name: file.name, reason: 'Systémový súbor' });
              return { file, status: 'skipped', size: file.size };
            }

            const filePath = file.webkitRelativePath || file.name;
            const folderInfo = extractFolderInfo(filePath);

            if (isFileDuplicate(file.name, file.size, folderInfo.cesta_priecinku)) {
              updateFileStatus(file.name, 'duplicita');
              results.skipped.push({ name: file.name, reason: 'Duplicita v rovnakom priečinku' });
              return { file, status: 'skipped', size: file.size };
            }

            const uploadResponse = await uploadFileWithRetry(file, 1, () => {}, cancelRef);

            const autoTags = [...formData.tags];
            if (folderInfo.model_domu) autoTags.push(folderInfo.model_domu);
            if (folderInfo.podpriecinok) autoTags.push(folderInfo.podpriecinok);

            const doc = await createMutation.mutateAsync({
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
            });

            updateFileStatus(file.name, 'nahratý');
            results.successful.push({ name: file.name, id: doc.id });
            
            saveUploadState(
              { ...fileStatuses, [file.name]: 'nahratý' },
              { current: completedCount + 1, total: selectedFiles.length },
              formData,
              uploadMode
            );
            
            return { file, status: 'success', size: file.size };

          } catch (fileError) {
            updateFileStatus(file.name, 'odmietnutý');
            const errorDetails = getErrorDetails(fileError, file);
            results.failed.push({
              name: file.name,
              error: errorDetails.message,
              suggestion: errorDetails.suggestion,
              type: errorDetails.type
            });
            
            saveUploadState(
              { ...fileStatuses, [file.name]: 'odmietnutý' },
              { current: completedCount, total: selectedFiles.length },
              formData,
              uploadMode
            );
            
            return { file, status: 'failed', size: file.size };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            completedCount++;
            cumulativeBytes += result.value.size;
          }
        });

        setUploadedBytes(cumulativeBytes);
        setUploadProgress({ current: completedCount, total: selectedFiles.length });
      }

      if (results.successful.length > 0 && !cancelRef.current) {
        setCurrentFileName("Analyzujem...");
        setUploadProgress({ current: 0, total: results.successful.length });

        const analysisBatches = [];
        for (let i = 0; i < results.successful.length; i += 10) {
          analysisBatches.push(results.successful.slice(i, i + 10));
        }

        let analyzedCount = 0;
        for (const analysisBatch of analysisBatches) {
          if (cancelRef.current) break;

          await Promise.allSettled(
            analysisBatch.map(item => analyzeMutation.mutateAsync(item.id).catch(() => {})),
          );

          analyzedCount += analysisBatch.length;
          setUploadProgress({ current: analyzedCount, total: results.successful.length });
        }
      }

      setUploadResults(results);
      setShowForm(false);
      localStorage.removeItem(UPLOAD_STATE_KEY);

    } catch (error) {
      alert("Kritická chyba: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      setCurrentFileName("");
      setCurrentFileProgress(0);
      setCancelUpload(false);
      window.currentUploadCancelRef = null;
    }
  };

  // Optimalizované callbacks
  const handleVyrobcaChange = useCallback((value) => {
    setFormData(prev => ({...prev, vyrobca: value}));
  }, []);

  const handleTypChange = useCallback((value) => {
    setFormData(prev => ({...prev, typ: value}));
  }, []);

  const filteredDokumenty = useMemo(() => {
    return dokumenty.filter(dok => {
      const matchesSearch = dok.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dok.popis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dok.model_domu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dok.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVyrobca = selectedVyrobca === "all" || dok.vyrobca === selectedVyrobca;

      return matchesSearch && matchesVyrobca;
    });
  }, [dokumenty, searchQuery, selectedVyrobca]);

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
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Nahrávam</Badge>;
      case 'nahratý':
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" />Nahratý</Badge>;
      case 'odmietnutý':
        return <Badge className="bg-red-500/10 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Odmietnutý</Badge>;
      case 'duplicita':
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-200"><Info className="w-3 h-3 mr-1" />Duplicita</Badge>;
      case 'preskočený':
        return <Badge className="bg-gray-500/10 text-gray-700 border-gray-200"><X className="w-3 h-3 mr-1" />Preskočený</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-slate-300"><Clock className="w-3 h-3 mr-1" />Čaká</Badge>;
      default:
        return null;
    }
  };

  const typLabels = {
    cenník: "Cenník",
    technická_špecifikácia: "Technická špecifikácia",
    návod: "Návod",
    certifikát: "Certifikát",
    FAQ: "FAQ",
    blog: "Blog",
    fotky: "Fotky",
    iné: "Iné"
  };

  const vyrobcaColors = {
    "American Living": "bg-blue-500/10 text-blue-700 border-blue-200",
    "JAK Modules": "bg-purple-500/10 text-purple-700 border-purple-200",
    "Ticab house": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    "Prosto House": "bg-orange-500/10 text-orange-700 border-orange-200",
    "Domki z Gór": "bg-pink-500/10 text-pink-700 border-pink-200"
  };

  const vyrobcovia = ["American Living", "JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];

  const isAdmin = user?.role === 'admin';

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600 font-medium">Načítavam...</p>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-600">Táto stránka je dostupná len pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent">
                  Správa dokumentov
                </h1>
                <p className="text-sm text-gray-600 mt-1">Inteligentné nahrávanie s AI analýzou</p>
              </div>
            </div>

            <Card className="p-4 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">🚀 Automatická AI analýza + Ochrana pred prerušením</p>
                  <p className="text-blue-800 opacity-90">Systém inteligentne filtruje súbory, rozpoznáva štruktúru a pri prerušení pokračuje tam, kde prestalo.</p>
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
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 mb-6 border-0 shadow-lg bg-white/80 backdrop-blur">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Výsledky nahrávania
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setUploadResults(null)} className="hover:bg-gray-100">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {uploadResults.successful.length > 0 && (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-900">
                            Úspešne: {uploadResults.successful.length}
                          </span>
                        </div>
                        <div className="text-sm text-emerald-800 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResults.successful.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                              {item.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResults.skipped.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-amber-900">
                            Preskočené: {uploadResults.skipped.length}
                          </span>
                        </div>
                        <div className="text-sm text-amber-800 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResults.skipped.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5"></span>
                              <span>{item.name} <span className="text-xs opacity-75">({item.reason})</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResults.failed.length > 0 && (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">
                            Chybné: {uploadResults.failed.length}
                          </span>
                        </div>
                        <div className="text-sm text-red-800 space-y-3 max-h-48 overflow-y-auto">
                          {uploadResults.failed.map((item, i) => (
                            <div key={i} className="border-l-2 border-red-400 pl-3 py-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs mt-1 space-y-1">
                                <div className="opacity-90">❌ {item.error}</div>
                                {item.suggestion && (
                                  <div className="text-red-700">💡 {item.suggestion}</div>
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

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Hľadať v dokumentoch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-0 shadow-md bg-white/80 backdrop-blur focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                size="icon"
                className="h-12 w-12 shadow-md transition-all hover:scale-105"
                title="Zoznam"
              >
                <List className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "tree" ? "default" : "outline"}
                onClick={() => setViewMode("tree")}
                size="icon"
                className="h-12 w-12 shadow-md transition-all hover:scale-105"
                title="Stromová štruktúra"
              >
                <Folder className="w-5 h-5" />
              </Button>
              <Button 
                onClick={handleAnalyzeAll}
                disabled={analyzingAll || dokumenty.filter(d => !d.analyzovaný).length === 0}
                className="h-12 bg-blue-900 hover:bg-blue-800 text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {analyzingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {analysisProgress.current}/{analysisProgress.total}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyzovať AI ({dokumenty.filter(d => !d.analyzovaný).length})
                  </>
                )}
              </Button>
              <Button 
                onClick={() => {
                  setShowForm(!showForm);
                  setUploadResults(null);
                  if (!showForm) {
                    setUploading(false);
                    setUploadProgress({ current: 0, total: 0 });
                    setCurrentFileName("");
                    if (window.currentUploadCancelRef) {
                      window.currentUploadCancelRef.current = false;
                      window.currentUploadCancelRef = null;
                    }
                  }
                }} 
                className="h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg transition-all hover:scale-105 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Nahrať dokumenty
              </Button>
            </div>
          </div>

          {/* Upload Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 mb-6 border-0 shadow-xl bg-white/90 backdrop-blur">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Režim nahrávania */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <Label className="font-semibold text-gray-700">Režim nahrávania:</Label>
                      <Select value={uploadMode} onValueChange={(value) => {
                        setUploadMode(value);
                        setSelectedFiles([]);
                        setFileStatuses({});
                        setTotalBytes(0);
                        setUploadedBytes(0);
                        setCurrentFileProgress(0);
                      }}>
                        <SelectTrigger className="w-[180px] border-0 shadow-sm bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="files">📄 Súbory</SelectItem>
                          <SelectItem value="folder">📁 Priečinky</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div>
                      <Label className="text-base font-semibold text-gray-700 mb-3 block">
                        {uploadMode === "folder" ? "Priečinky *" : "Súbory *"}
                      </Label>
                      
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                          isDragging 
                            ? 'border-primary bg-blue-100 scale-[1.02]' 
                            : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-primary/50 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all ${
                          isDragging ? 'bg-primary scale-110' : 'bg-gray-100'
                        }`}>
                          <FolderOpen className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-base font-medium text-gray-700 mb-2">
                          Pretiahnite priečinky sem
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          alebo kliknite na tlačidlo nižšie • Podpora viacerých priečinkov naraz
                        </p>
                        
                        {uploadMode === "folder" ? (
                          <>
                            <input
                              ref={folderInputRef}
                              type="file"
                              onChange={handleFileSelect}
                              multiple
                              webkitdirectory=""
                              directory=""
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => folderInputRef.current?.click()}
                              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg transition-all hover:scale-105 text-white"
                            >
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Vybrať priečinky
                            </Button>
                          </>
                        ) : (
                          <>
                            <Input
                              type="file"
                              onChange={handleFileSelect}
                              multiple
                              required={selectedFiles.length === 0}
                              className="hidden"
                              id="file-input"
                            />
                            <Button
                              type="button"
                              onClick={() => document.getElementById('file-input')?.click()}
                              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg transition-all hover:scale-105 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Vybrať súbory
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {selectedFiles.length} súborov ({formatFileSize(totalBytes)})
                            </p>
                            <Button
                              type="button"
                              onClick={handleClearAllFiles}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />Vymazať všetko
                            </Button>
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                            {selectedFiles.map((file, index) => {
                              const folderInfo = extractFolderInfo(file.webkitRelativePath || file.name);
                              const isDuplicate = isFileDuplicate(file.name, file.size, folderInfo.cesta_priecinku);
                              const status = fileStatuses[file.name] || 'pending';

                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-center gap-3 flex-grow min-w-0">
                                    <span className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>
                                    <div className="min-w-0 flex-grow">
                                      <span className="text-sm font-medium text-gray-800 block truncate">{file.name}</span>
                                      {folderInfo.cesta_priecinku && (
                                        <span className="text-xs text-gray-500 block truncate">
                                          📁 {folderInfo.cesta_priecinku}
                                        </span>
                                      )}
                                      {folderInfo.model_domu && (
                                        <span className="text-xs text-blue-600 font-medium">
                                          🏠 {folderInfo.model_domu}
                                          {folderInfo.podpriecinok && ` / ${folderInfo.podpriecinok}`}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0 mr-2 font-medium">
                                      {formatFileSize(file.size)}
                                    </span>
                                    {getStatusBadge(isDuplicate && status === 'pending' ? 'duplicita' : status)}
                                  </div>
                                  {!uploading && status !== 'nahratý' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(index)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0 p-1.5 rounded-lg transition-all"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Výrobca *</Label>
                        <VyrobcaSelect value={formData.vyrobca} onChange={handleVyrobcaChange} />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Typ *</Label>
                        <TypSelect value={formData.typ} onChange={handleTypChange} typLabels={typLabels} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Popis (platí pre všetky súbory)</Label>
                      <Textarea
                        value={formData.popis}
                        onChange={(e) => setFormData({...formData, popis: e.target.value})}
                        placeholder="Detailný popis dokumentov..."
                        rows={3}
                        className="resize-none border-gray-200 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Tagy</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Pridať tag..."
                          className="border-gray-200 focus:border-primary transition-all"
                        />
                        <Button type="button" onClick={handleAddTag} variant="outline" className="flex-shrink-0">
                          Pridať
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.tags.map(tag => (
                            <Badge key={tag} className="px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-2 hover:bg-blue-200 transition-colors">
                              {tag}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-blue-900"
                                onClick={() => handleRemoveTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                      <Switch
                        checked={formData.pre_chatbota}
                        onCheckedChange={(checked) => setFormData({...formData, pre_chatbota: checked})}
                      />
                      <Label className="font-medium text-gray-700 cursor-pointer">
                        Použiť ako zdroj vedomostí pre chatbota
                      </Label>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl space-y-4 border border-blue-100">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-blue-900">
                              {currentFileName || `Spracúvam ${uploadProgress.current} z ${uploadProgress.total}...`}
                            </p>
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                              {currentFileProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${currentFileProgress}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-blue-800">
                              Celkový progress: {uploadProgress.current} / {uploadProgress.total}
                            </p>
                            <span className="text-xs text-blue-700 font-medium">
                              {formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="submit" 
                        disabled={uploading} 
                        className="flex-1 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 text-white"
                      >
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
                        className="h-12 shadow-sm transition-all hover:scale-[1.02]"
                        onClick={() => {
                          if (uploading) {
                            if (window.currentUploadCancelRef) {
                              window.currentUploadCancelRef.current = true;
                            }
                            setCancelUpload(true);
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

          {/* Tabs */}
          {viewMode === "list" && (
            <Tabs value={selectedVyrobca} onValueChange={setSelectedVyrobca} className="mb-6">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full h-auto p-1 bg-white/80 backdrop-blur shadow-md border-0">
                <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all">
                  Všetky ({dokumenty.length})
                </TabsTrigger>
                {vyrobcovia.map(v => (
                  <TabsTrigger key={v} value={v} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all">
                    {v.split(' ')[0]} ({getVyrobcaCount(v)})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary mb-6" />
              <p className="text-gray-600 font-medium text-lg">Načítavam dokumenty...</p>
            </div>
          ) : viewMode === "tree" ? (
            <DokumentyTreeView
              dokumenty={filteredDokumenty}
              onViewDocument={setViewingDocument}
            />
          ) : filteredDokumenty.length === 0 ? (
            <Card className="p-20 text-center border-0 shadow-xl bg-white/80 backdrop-blur">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? "Nenašli sa žiadne dokumenty" : "Žiadne dokumenty"}
              </p>
              <p className="text-gray-500">Nahrajte dokumenty pre začiatok</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDokumenty.map((dok, index) => (
                <motion.div 
                  key={dok.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="p-5 border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur hover:scale-[1.01]">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl flex-shrink-0">{getFileIcon(dok.typ_suboru)}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0 flex-grow">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{dok.nazov}</h3>
                            {dok.cesta_priecinku && (
                              <p className="text-xs text-gray-500 truncate mb-1">📁 {dok.cesta_priecinku}</p>
                            )}
                            {dok.model_domu && (
                              <p className="text-sm text-blue-600 font-medium flex items-center gap-1.5 mb-1">
                                <Home className="w-3.5 h-3.5" />
                                {dok.model_domu}{dok.podpriecinok && ` / ${dok.podpriecinok}`}
                              </p>
                            )}
                            {dok.popis && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{dok.popis}</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {dok.analyzovaný && (
                              <Button size="sm" variant="outline" onClick={() => setViewingDocument(dok)} className="hover:bg-purple-50 hover:border-purple-300 transition-all">
                                <Eye className="w-4 h-4 mr-1" />Analýza
                              </Button>
                            )}
                            <a href={dok.subor_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all">
                                <Download className="w-4 h-4 mr-1" />Stiahnuť
                              </Button>
                            </a>
                            <Button size="sm" variant="ghost" onClick={() => {
                              if (window.confirm('Naozaj chcete vymazať tento dokument?')) {
                                deleteMutation.mutate(dok.id);
                              }
                            }} className="text-red-600 hover:bg-red-50 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge className={`${vyrobcaColors[dok.vyrobca]} border`}>
                            <Building2 className="w-3 h-3 mr-1" />{dok.vyrobca}
                          </Badge>
                          <Badge variant="outline" className="border-gray-300">{typLabels[dok.typ]}</Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">{formatFileSize(dok.velkost)}</Badge>
                          {dok.pre_chatbota && (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                              <CheckCircle className="w-3 h-3 mr-1" />Chatbot
                            </Badge>
                          )}
                          {dok.analyzovaný && (
                            <Badge className="bg-purple-500/10 text-purple-700 border-purple-200">
                              <Brain className="w-3 h-3 mr-1" />AI
                            </Badge>
                          )}
                          {dok.tags?.map(tag => (
                            <Badge key={tag} className="bg-blue-500/10 text-blue-700 border-blue-200">{tag}</Badge>
                          ))}
                          <span className="text-xs text-gray-500 ml-auto font-medium">
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

          {/* View Document Modal */}
          <AnimatePresence>
            {viewingDocument && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                onClick={() => setViewingDocument(null)}
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.95, opacity: 0 }} 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">AI Analýza</h2>
                      </div>
                      <p className="text-sm text-gray-600">Automaticky extrahované informácie</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setViewingDocument(null)} className="hover:bg-gray-100">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Dokument
                      </h3>
                      <p className="text-gray-700 font-medium">{viewingDocument.nazov}</p>
                      {viewingDocument.model_domu && (
                        <p className="text-blue-600 text-sm mt-1.5 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5" />
                          {viewingDocument.model_domu}{viewingDocument.podpriecinok && ` / ${viewingDocument.podpriecinok}`}
                        </p>
                      )}
                      {viewingDocument.odporucana_kategoria && viewingDocument.odporucana_kategoria !== viewingDocument.typ && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs font-semibold text-amber-900 mb-1">💡 AI odporúča inú kategóriu:</p>
                          <p className="text-sm text-amber-800 font-medium">{typLabels[viewingDocument.odporucana_kategoria]}</p>
                        </div>
                      )}
                    </div>

                    {viewingDocument.zhrnutie && (
                      <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <h3 className="font-semibold text-lg mb-3 text-purple-900 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          AI Zhrnutie
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {viewingDocument.zhrnutie}
                        </p>
                      </div>
                    )}

                    {viewingDocument.extrahovaný_obsah && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">Extrahovaný obsah:</h3>
                        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-5 rounded-xl border border-gray-200 leading-relaxed">
                          {viewingDocument.extrahovaný_obsah}
                        </p>
                      </div>
                    )}

                    {viewingDocument.kľúčové_informácie && (
                      <div>
                        <h3 className="font-semibold text-lg mb-4 text-gray-800">Kľúčové informácie:</h3>
                        <div className="grid gap-4">
                          {viewingDocument.kľúčové_informácie.modely_domov?.length > 0 && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                Modely domov
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {viewingDocument.kľúčové_informácie.modely_domov.map((model, i) => (
                                  <Badge key={i} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                    {model}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {viewingDocument.kľúčové_informácie.cenové_informácie?.length > 0 && (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                              <p className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                                💰 Cenové informácie
                              </p>
                              <ul className="space-y-1.5">
                                {viewingDocument.kľúčové_informácie.cenové_informácie.map((info, i) => (
                                  <li key={i} className="text-emerald-800 text-sm flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                    <span>{info}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {viewingDocument.kľúčové_informácie.rozmery && Object.keys(viewingDocument.kľúčové_informácie.rozmery).length > 0 && (
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                              <p className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                                📏 Rozmery
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                {viewingDocument.kľúčové_informácie.rozmery.sirka && (
                                  <div className="bg-white p-2 rounded-lg">
                                    <p className="text-xs text-orange-700">Šírka</p>
                                    <p className="font-semibold text-orange-900">{viewingDocument.kľúčové_informácie.rozmery.sirka}</p>
                                  </div>
                                )}
                                {viewingDocument.kľúčové_informácie.rozmery.dlzka && (
                                  <div className="bg-white p-2 rounded-lg">
                                    <p className="text-xs text-orange-700">Dĺžka</p>
                                    <p className="font-semibold text-orange-900">{viewingDocument.kľúčové_informácie.rozmery.dlzka}</p>
                                  </div>
                                )}
                                {viewingDocument.kľúčové_informácie.rozmery.vyska && (
                                  <div className="bg-white p-2 rounded-lg">
                                    <p className="text-xs text-orange-700">Výška</p>
                                    <p className="font-semibold text-orange-900">{viewingDocument.kľúčové_informácie.rozmery.vyska}</p>
                                  </div>
                                )}
                                {viewingDocument.kľúčové_informácie.rozmery.plocha && (
                                  <div className="bg-white p-2 rounded-lg">
                                    <p className="text-xs text-orange-700">Plocha</p>
                                    <p className="font-semibold text-orange-900">{viewingDocument.kľúčové_informácie.rozmery.plocha}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {viewingDocument.kľúčové_informácie.technické_údaje?.length > 0 && (
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                              <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                ⚙️ Technické údaje
                              </p>
                              <ul className="space-y-1.5">
                                {viewingDocument.kľúčové_informácie.technické_údaje.map((info, i) => (
                                  <li key={i} className="text-purple-800 text-sm flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                    <span>{info}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {viewingDocument.kľúčové_informácie.materialy?.length > 0 && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <p className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                🏗️ Materiály
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {viewingDocument.kľúčové_informácie.materialy.map((material, i) => (
                                  <Badge key={i} className="bg-amber-100 text-amber-800 border-amber-200">
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {viewingDocument.kľúčové_informácie.energia && (viewingDocument.kľúčové_informácie.energia.trieda || viewingDocument.kľúčové_informácie.energia.spotreba) && (
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                              <p className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                ⚡ Energia
                              </p>
                              <div className="space-y-2">
                                {viewingDocument.kľúčové_informácie.energia.trieda && (
                                  <div>
                                    <p className="text-xs text-green-700">Energetická trieda</p>
                                    <p className="font-semibold text-green-900 text-lg">{viewingDocument.kľúčové_informácie.energia.trieda}</p>
                                  </div>
                                )}
                                {viewingDocument.kľúčové_informácie.energia.spotreba && (
                                  <div>
                                    <p className="text-xs text-green-700">Spotreba</p>
                                    <p className="font-medium text-green-900">{viewingDocument.kľúčové_informácie.energia.spotreba}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {viewingDocument.kľúčové_informácie.ostatné?.length > 0 && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                📌 Ostatné informácie
                              </p>
                              <ul className="space-y-1.5">
                                {viewingDocument.kľúčové_informácie.ostatné.map((info, i) => (
                                  <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                    <span>{info}</span>
                                  </li>
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
