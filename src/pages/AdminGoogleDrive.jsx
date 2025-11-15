import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, RefreshCw, CheckCircle, Folder, Link as LinkIcon, AlertCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminGoogleDrive() {
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [saved, setSaved] = useState(false);
  const [authWindow, setAuthWindow] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: folders, isLoading, refetch } = useQuery({
    queryKey: ['google-drive-folders'],
    queryFn: async () => {
      const response = await base44.functions.invoke('googleDrive', { action: 'listFolders' });
      return response.data || [];
    },
    enabled: false,
  });

  // Počúvame na postMessage z OAuth okna
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data.type === 'GOOGLE_DRIVE_AUTH' && event.data.tokens) {
        const tokens = event.data.tokens;
        
        // Uložíme tokeny cez API
        try {
          await base44.functions.invoke('googleDrive', {
            action: 'saveTokens',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
          });
          
          // Refresh user data
          queryClient.invalidateQueries({ queryKey: ['current-user'] });
          
          if (authWindow) {
            authWindow.close();
            setAuthWindow(null);
          }
        } catch (error) {
          console.error('Error saving tokens:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authWindow, queryClient]);

  const handleAuthorize = async () => {
    // Otvoríme popup okno pre OAuth
    const functionUrl = `${window.location.origin}${window.location.pathname.split('/preview')[0]}/functions/googleDrive?action=authorize`;
    const popup = window.open(functionUrl, 'Google Drive Authorization', 'width=600,height=700');
    setAuthWindow(popup);
  };

  const handleLoadFolders = () => {
    refetch();
  };

  const toggleFolder = (folderId) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
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

  const folderIdsList = selectedFolders.join(',');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">
              Google Drive - Správa priečinkov pre chatbot
            </h1>
          </div>

          {/* Authorization status */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-gray-800">Google Drive pripojenie</h3>
                  <p className="text-sm text-gray-600">
                    {user?.google_drive_access_token 
                      ? "✓ Pripojené" 
                      : "Nepripojené - potrebná autorizácia"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAuthorize}
                variant={user?.google_drive_access_token ? "outline" : "default"}
                className={!user?.google_drive_access_token ? "bg-primary hover:bg-primary/90" : ""}
              >
                {user?.google_drive_access_token ? "Re-autorizovať" : "Autorizovať Google Drive"}
              </Button>
            </div>
          </Card>

          {/* Load folders */}
          {user?.google_drive_access_token && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-gray-800">Načítať priečinky z Google Drive</h3>
                </div>
                <Button
                  onClick={handleLoadFolders}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Načítavam...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Načítať priečinky
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Načítajte všetky dostupné priečinky z vášho Google Drive účtu.
              </p>
            </Card>
          )}

          {/* Folder selection */}
          {folders && folders.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Folder className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-gray-800">
                  Vyberte priečinky pre chatbot ({selectedFolders.length} vybraných)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Chatbot bude mať prístup len k súborom v týchto priečinkoch.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-gray-50 ${
                      selectedFolders.includes(folder.id) ? 'bg-blue-50 border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={selectedFolders.includes(folder.id)}
                      onCheckedChange={() => toggleFolder(folder.id)}
                    />
                    <Folder className="w-5 h-5 text-gray-500" />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{folder.name}</p>
                      <p className="text-xs text-gray-500">ID: {folder.id}</p>
                    </div>
                    {selectedFolders.includes(folder.id) && (
                      <Badge className="bg-primary text-white">Vybraný</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Save instructions */}
          {selectedFolders.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800 mb-3">Uložte nastavenie</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Pre aktiváciu obmedzenia skopírujte ID priečinkov a nastavte ich ako environment variable:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">GOOGLE_DRIVE_FOLDER_IDS:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-gray-800"
                        onClick={() => {
                          navigator.clipboard.writeText(folderIdsList);
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        }}
                      >
                        {saved ? "✓ Skopírované" : "Kopírovať"}
                      </Button>
                    </div>
                    <div className="text-green-400 break-all">{folderIdsList}</div>
                  </div>

                  <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                    <li>Skopírujte hodnotu vyššie (ID priečinkov oddelené čiarkou)</li>
                    <li>Prejdite do Dashboard → Settings → Environment Variables</li>
                    <li>Nastavte <code className="bg-gray-200 px-2 py-1 rounded">GOOGLE_DRIVE_FOLDER_IDS</code> s touto hodnotou</li>
                    <li>Chatbot bude teraz čerpať informácie len z vybraných priečinkov</li>
                  </ol>
                </div>
              </div>
            </Card>
          )}

          {/* Empty state */}
          {!user?.google_drive_access_token && (
            <Card className="p-12 text-center">
              <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Pripojte Google Drive
              </h3>
              <p className="text-gray-500 mb-6">
                Pre správu priečinkov najprv autorizujte prístup k vášmu Google Drive účtu.
              </p>
            </Card>
          )}

          {folders && folders.length === 0 && user?.google_drive_access_token && (
            <Card className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Žiadne priečinky
              </h3>
              <p className="text-gray-500">
                Nenašli sa žiadne priečinky v Google Drive alebo sa nepodarilo načítať údaje.
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}