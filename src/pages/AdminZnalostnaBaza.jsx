import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Upload, Save, AlertCircle, Loader2, Trash2, Shield, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminZnalostnaBaza() {
  const [promptContent, setPromptContent] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Načítanie System Promptu z konfigurácie
  const { data: configPrompt, isLoading: promptLoading } = useQuery({
    queryKey: ['ai_system_prompt'],
    queryFn: async () => {
      const result = await base44.entities.AppConfiguration.filter({ config_key: 'ai_system_prompt' });
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    }
  });

  React.useEffect(() => {
    if (configPrompt && !isEditingPrompt) {
      // Check if it's stored as an object { prompt: "..." } or raw string
      const val = configPrompt.config_value;
      if (val && typeof val === 'object' && val.prompt) {
        setPromptContent(val.prompt);
      } else if (typeof val === 'string') {
        setPromptContent(val);
      } else {
        setPromptContent("");
      }
    }
  }, [configPrompt, isEditingPrompt]);

  // Načítanie dokumentov, ktoré majú príznak pre_chatbota: true
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['znalosti-dokumenty'],
    queryFn: () => base44.entities.Dokument.filter({ pre_chatbota: true })
  });

  const savePromptMutation = useMutation({
    mutationFn: async (content) => {
      const payload = { config_value: { prompt: content } };
      let res;
      if (configPrompt?.id) {
        res = await base44.entities.AppConfiguration.update(configPrompt.id, payload);
      } else {
        res = await base44.entities.AppConfiguration.create({
          config_key: 'ai_system_prompt',
          config_value: { prompt: content },
          popis: 'Hlavné inštrukcie pre AI agentov (System Prompt)'
        });
      }
      if (res && res.error) throw new Error(res.error.message || JSON.stringify(res.error));
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_system_prompt'] });
      setIsEditingPrompt(false);
      toast.success("Inštrukcie pre AI boli úspešne uložené");
    },
    onError: (error) => {
      toast.error("Chyba pri ukladaní inštrukcií: " + error.message);
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: (data) => base44.entities.Dokument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['znalosti-dokumenty'] });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id) => base44.entities.Dokument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['znalosti-dokumenty'] });
      toast.success("Dokument bol odstránený zo znalostnej bázy");
    }
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="p-12 text-center max-w-md shadow-xl">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-600">Táto sekcia je vyhradená pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of files) {
      try {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        
        await uploadFileMutation.mutateAsync({
          nazov: file.name,
          typ: 'znalost',
          vyrobca: 'American Living',
          pre_chatbota: true,
          subor_url: uploadResponse.file_url,
          velkost: file.size,
          typ_suboru: file.type || 'application/pdf',
          podpriecinok: 'ZnalostnaBaza',
          popis: 'Interné firemné know-how'
        });
        successCount++;
      } catch (error) {
        toast.error(`Chyba pri nahrávaní ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`Úspešne nahraných ${successCount} dokumentov do znalostnej bázy.`);
    }
    e.target.value = '';
  };

  const filteredDocs = documents.filter(doc => 
    doc.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.popis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Znalostná Báza</h1>
              <p className="text-gray-500">Centrálne firemné know-how pre AI agentov zákazníckej podpory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ľavý stĺpec: Inštrukcie (System Prompt) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-indigo-100 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-800">Pravidlá správania agenta</h2>
                  </div>
                  {!isEditingPrompt ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingPrompt(true)}>
                      Upraviť inštrukcie
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setIsEditingPrompt(false);
                        setPromptContent(configPrompt?.config_value?.prompt || (typeof configPrompt?.config_value === 'string' ? configPrompt.config_value : ""));
                      }}>
                        Zrušiť
                      </Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => savePromptMutation.mutate(promptContent)}>
                        <Save className="w-4 h-4 mr-2" /> Uložiť
                      </Button>
                    </div>
                  )}
                </div>
                
                {promptLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Tento text slúži ako "System Prompt" – základná inštrukcia pre AI agenta. Napíšte sem, kto agent je, akým tónom má komunikovať a čo nesmie sľubovať klientom.
                    </p>
                    {isEditingPrompt ? (
                      <Textarea 
                        value={promptContent}
                        onChange={(e) => setPromptContent(e.target.value)}
                        placeholder="Napr.: Si virtuálny asistent spoločnosti American Living. Tvojou úlohou je pomáhať klientom s výberom modulárnych domov. Buď slušný, profesionálny a používaj fakty z nahranej dokumentácie. Nesľubuj konkrétne termíny dodania bez konzultácie."
                        className="min-h-[250px] font-mono text-sm leading-relaxed"
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap font-mono text-sm text-gray-700 min-h-[150px]">
                        {promptContent || "Zatiaľ nie sú definované žiadne inštrukcie."}
                        <br/><br/>
                        <span className="text-xs text-red-500">DEBUG DB INFO: {JSON.stringify(configPrompt)}</span>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Dokumenty List */}
              <Card className="p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-800">Nahraté Know-how dokumenty</h2>
                    <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-700">{documents.length}</Badge>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Hľadať v dokumentoch..." 
                      className="pl-9 w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {docsLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                ) : filteredDocs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-gray-900 truncate">{doc.nazov}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>{(doc.velkost / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>{new Date(doc.created_date).toLocaleDateString('sk-SK')}</span>
                              {doc.analyzovaný && <Badge variant="outline" className="text-[10px] py-0 h-4 border-green-200 text-green-700 bg-green-50">Analyzované AI</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.subor_url} target="_blank" rel="noreferrer"><Search className="w-4 h-4 text-gray-500" /></a>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={() => {
                            if(confirm("Naozaj chcete vymazať tento dokument z vedomostí agenta?")) {
                              deleteDocMutation.mutate(doc.id);
                            }
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Zatiaľ žiadne dokumenty</p>
                    <p className="text-xs text-gray-400 mt-1">Nahrajte interné materiály pre agenta vpravo</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Pravý stĺpec: Upload */}
            <div className="space-y-6">
              <Card className="p-6 bg-indigo-50 border-indigo-100">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Nahrať nové materiály</h3>
                  <p className="text-xs text-gray-600 mt-2">Podporované: PDF, DOCX, TXT. Dokumenty budú automaticky spracované a pridané do pamäte agenta.</p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt,.csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <div className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${uploading ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-indigo-200 hover:border-indigo-400'}`}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
                        <span className="text-sm font-medium text-indigo-800">Nahrávam a spracovávam...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-indigo-600">Kliknite pre výber súborov</span>
                        <span className="text-xs text-gray-400 mt-1">alebo ich sem potiahnite</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-blue-100 bg-gradient-to-b from-white to-blue-50/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Ako to funguje?</h4>
                    <ul className="mt-2 space-y-2 text-xs text-gray-600 list-disc pl-4">
                      <li>Znalostná báza (RAG) kombinuje vaše Inštrukcie (vľavo) s nahratými dokumentmi.</li>
                      <li>Keď sa klient spýta otázku, agent najskôr vyhľadá odpoveď v týchto súboroch.</li>
                      <li>Všetky súbory nahraté sem získavajú špeciálny príznak <code>pre_chatbota: true</code>.</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
