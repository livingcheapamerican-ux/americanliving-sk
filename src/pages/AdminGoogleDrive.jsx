import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FolderOpen, RefreshCw, CheckCircle, Folder, Link as LinkIcon, AlertCircle, Settings, Search, FileText, ExternalLink, Bug, Eye, EyeOff, AlertTriangle, Copy } from "lucide-react";
import { motion } from "framer-motion";
import GoogleDriveFilesList from "../components/GoogleDriveFilesList";

export default function AdminGoogleDrive() {
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [oauthDiagnostics, setOauthDiagnostics] = useState(null);

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: folders, isLoading, error, refetch } = useQuery({
    queryKey: ['google-drive-folders'],
    queryFn: async () => {
      const response = await base44.functions.invoke('googleDrive', { action: 'listFolders' });
      return response.data || [];
    },
    enabled: !!user?.google_drive_access_token,
    retry: false,
  });

  const runOAuthDiagnostics = async () => {
    setIsTesting(true);
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        currentUrl: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        isPreview: window.location.pathname.includes('/preview/'),
      },
      user: {
        id: user?.id,
        email: user?.email,
        hasAccessToken: !!user?.google_drive_access_token,
        hasRefreshToken: !!user?.google_drive_refresh_token,
        tokenExpiry: user?.google_drive_token_expiry,
        tokenExpiryDate: user?.google_drive_token_expiry ? new Date(user.google_drive_token_expiry).toISOString() : null,
        tokenExpired: user?.google_drive_token_expiry ? new Date(user.google_drive_token_expiry) < new Date() : null,
      },
      urls: {}
    };

    // Calculate function path
    const basePath = window.location.pathname.split('/preview/')[0];
    const functionPath = `${basePath}/functions/googleDrive`;
    const callbackUrl = `${window.location.origin}${functionPath}?action=callback`;
    
    diagnostics.urls.functionPath = functionPath;
    diagnostics.urls.callbackUrl = callbackUrl;
    diagnostics.urls.authUrl = `${functionPath}?action=authorize&return_url=${encodeURIComponent(window.location.href.split('?')[0])}`;

    // Test function accessibility
    try {
      const testResponse = await fetch(functionPath);
      diagnostics.functionTest = {
        accessible: testResponse.ok,
        status: testResponse.status,
        statusText: testResponse.statusText,
      };
    } catch (error) {
      diagnostics.functionTest = {
        accessible: false,
        error: error.message,
      };
    }

    // OAuth Configuration Analysis
    diagnostics.oauthConfig = {
      expectedCallbackUrl: callbackUrl,
      instructions: [
        "1. Prejdite na Google Cloud Console: https://console.cloud.google.com/",
        "2. Vyberte váš projekt",
        "3. Prejdite na 'APIs & Services' → 'Credentials'",
        "4. Nájdite váš OAuth 2.0 Client ID",
        "5. V sekcii 'Authorized redirect URIs' MUSÍ byť presne:",
        `   ${callbackUrl}`,
        "",
        "⚠️ DÔLEŽITÉ:",
        "- URL musí byť PRESNE rovnaká (vrátane https://)",
        "- Nesmie obsahovať /preview/ v ceste",
        "- Po úprave môže trvať pár minút, kým sa zmeny prejavia"
      ]
    };

    // Check if preview mode might cause issues
    if (diagnostics.environment.isPreview) {
      diagnostics.warnings = [
        "⚠️ Používate PREVIEW režim",
        "OAuth callback môže byť problematický v preview móde",
        "Odporúčame použiť produkčnú URL namiesto preview",
        "Preview URL sa môže zmeniť, čo by vyžadovalo update v Google Console"
      ];
    }

    setOauthDiagnostics(diagnostics);
    setIsTesting(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testConnection = async () => {
    setIsTesting(true);
    const info = {
      timestamp: new Date().toISOString(),
      currentUrl: window.location.href,
      pathname: window.location.pathname,
      isPreview: window.location.pathname.includes('/preview/'),
      user: {
        id: user?.id,
        email: user?.email,
        hasAccessToken: !!user?.google_drive_access_token,
        hasRefreshToken: !!user?.google_drive_refresh_token,
        tokenExpiry: user?.google_drive_token_expiry ? new Date(user.google_drive_token_expiry).toISOString() : null,
      },
      functionPath: window.location.pathname.includes('/preview/') 
        ? window.location.pathname.split('/preview/')[0] + '/functions/googleDrive'
        : '/functions/googleDrive',
      callbackUrl: null,
    };

    try {
      const response = await fetch(info.functionPath);
      info.functionAccessible = response.ok;
      info.functionStatus = response.status;
    } catch (error) {
      info.functionAccessible = false;
      info.functionError = error.message;
    }

    const origin = window.location.origin;
    info.callbackUrl = `${origin}${info.functionPath}?action=callback`;

    setDebugInfo(info);
    setIsTesting(false);
  };

  const handleAuthorize = () => {
    const returnUrl = window.location.href.split('?')[0];
    const basePath = window.location.pathname.split('/preview/')[0];
    const functionPath = `${basePath}/functions/googleDrive`;
    
    console.log('[AdminGoogleDrive] Authorizing...');
    console.log('[AdminGoogleDrive] Return URL:', returnUrl);
    console.log('[AdminGoogleDrive] Function path:', functionPath);
    
    window.location.href = `${functionPath}?action=authorize&return_url=${encodeURIComponent(returnUrl)}`;
  };

  const handleLoadFolders = async () => {
    await refetchUser();
    refetch();
  };

  const toggleFolder = (folderId) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('googleDrive', { 
        action: 'searchFiles', 
        q: searchQuery.trim() 
      });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('document')) return '📄';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const maskToken = (token) => {
    if (!token) return 'N/A';
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
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

  const needsAuth = error?.response?.data?.needsAuth || !user?.google_drive_access_token;
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
              Google Drive - Správa priečinkov
            </h1>
          </div>

          {/* OAuth Deep Diagnostics */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-300">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">🔍 Hlboková OAuth diagnostika</h3>
                  <Button
                    onClick={runOAuthDiagnostics}
                    disabled={isTesting}
                    variant="outline"
                    className="border-orange-400 text-orange-700 hover:bg-orange-50"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzujem...
                      </>
                    ) : (
                      <>
                        <Bug className="w-4 h-4 mr-2" />
                        Spustiť diagnostiku
                      </>
                    )}
                  </Button>
                </div>

                {oauthDiagnostics && (
                  <div className="space-y-4">
                    {/* Callback URL */}
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                      <h4 className="font-semibold mb-2 text-orange-800">📍 Callback URL (vyžadovaná v Google Console)</h4>
                      <div className="bg-orange-50 p-3 rounded font-mono text-sm break-all mb-2">
                        {oauthDiagnostics.urls.callbackUrl}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(oauthDiagnostics.urls.callbackUrl)}
                        className="w-full"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? '✓ Skopírované!' : 'Kopírovať'}
                      </Button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <h4 className="font-semibold mb-3 text-blue-800">📝 Inštrukcie pre Google Console</h4>
                      <div className="bg-blue-50 p-4 rounded text-sm space-y-1 font-mono whitespace-pre-wrap">
                        {oauthDiagnostics.oauthConfig.instructions.join('\n')}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Otvoriť Google Cloud Console
                      </Button>
                    </div>

                    {/* Warnings */}
                    {oauthDiagnostics.warnings && (
                      <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                        <h4 className="font-semibold mb-2 text-yellow-800">⚠️ Upozornenia</h4>
                        <ul className="space-y-1 text-sm">
                          {oauthDiagnostics.warnings.map((warning, i) => (
                            <li key={i} className="text-yellow-900">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technical Details */}
                    <details className="bg-gray-50 rounded-lg p-4 border">
                      <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                        🔧 Technické detaily
                      </summary>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                        {JSON.stringify(oauthDiagnostics, null, 2)}
                      </pre>
                    </details>

                    {/* Token Status */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold mb-3 text-gray-800">🔑 Stav tokenov</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Access Token:</span>
                          <Badge className={oauthDiagnostics.user.hasAccessToken ? "bg-green-600 ml-2" : "bg-red-600 ml-2"}>
                            {oauthDiagnostics.user.hasAccessToken ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">Refresh Token:</span>
                          <Badge className={oauthDiagnostics.user.hasRefreshToken ? "bg-green-600 ml-2" : "bg-red-600 ml-2"}>
                            {oauthDiagnostics.user.hasRefreshToken ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Token Expired:</span>
                          <Badge className={oauthDiagnostics.user.tokenExpired ? "bg-red-600 ml-2" : "bg-green-600 ml-2"}>
                            {oauthDiagnostics.user.tokenExpired ? 'ÁNO' : 'NIE'}
                          </Badge>
                        </div>
                        {oauthDiagnostics.user.tokenExpiryDate && (
                          <div className="col-span-2 text-xs text-gray-500">
                            Expirácia: {oauthDiagnostics.user.tokenExpiryDate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Rest of the existing UI */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${user?.google_drive_access_token ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <h3 className="font-semibold text-gray-800">Google Drive</h3>
                  <p className="text-sm text-gray-600">
                    {user?.google_drive_access_token 
                      ? "Pripojené - môžete načítať priečinky" 
                      : "Nepripojené - autorizujte prístup"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAuthorize}
                className="bg-primary hover:bg-primary/90"
              >
                {user?.google_drive_access_token ? "Re-autorizovať" : "Autorizovať"}
              </Button>
            </div>
          </Card>

          {/* Search Files */}
          {user?.google_drive_access_token && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-gray-800">Hľadať súbory</h3>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                  placeholder="Zadajte názov súboru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  type="submit" 
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Hľadám...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Hľadať
                    </>
                  )}
                </Button>
              </form>

              {searchResults && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Nájdených: {searchResults.length}
                      </p>
                      {searchResults.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-all"
                        >
                          <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                          <div className="flex-grow">
                            <p className="font-medium text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {file.mimeType.split('/').pop()} • {formatFileSize(file.size)}
                            </p>
                          </div>
                          <a 
                            href={file.webViewLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenašli sa žiadne súbory</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Files List Component */}
          {user?.google_drive_access_token && (
            <div className="mb-6">
              <GoogleDriveFilesList />
            </div>
          )}

          {/* Load folders */}
          {user?.google_drive_access_token && (
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Načítať priečinky</h3>
                    <p className="text-sm text-gray-600">
                      {folders && folders.length > 0 
                        ? `Nájdených: ${folders.length}`
                        : "Stlačte tlačidlo"}
                    </p>
                  </div>
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
                      {folders ? "Obnoviť" : "Načítať"}
                    </>
                  )}
                </Button>
              </div>
              {error && !error.response?.data?.needsAuth && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error.response?.data?.error || error.message}
                </div>
              )}
            </Card>
          )}

          {/* Folder selection */}
          {folders && folders.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Folder className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-gray-800">
                  Priečinky ({selectedFolders.length} vybraných)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Chatbot bude mať prístup len k týmto priečinkom.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-gray-50 cursor-pointer ${
                      selectedFolders.includes(folder.id) ? 'bg-blue-50 border-primary' : 'bg-white border-gray-200'
                    }`}
                    onClick={() => toggleFolder(folder.id)}
                  >
                    <Checkbox
                      checked={selectedFolders.includes(folder.id)}
                      onCheckedChange={() => toggleFolder(folder.id)}
                    />
                    <Folder className="w-5 h-5 text-gray-500" />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{folder.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{folder.id}</p>
                    </div>
                    {selectedFolders.includes(folder.id) && (
                      <Badge className="bg-primary text-white">✓</Badge>
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
                  <h3 className="font-semibold text-gray-800 mb-3">Nastavenie</h3>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">GOOGLE_DRIVE_FOLDER_IDS</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-gray-800"
                        onClick={() => {
                          navigator.clipboard.writeText(folderIdsList);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? "✓" : "Kopírovať"}
                      </Button>
                    </div>
                    <div className="text-green-400 break-all text-xs">{folderIdsList}</div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Skopírujte hodnotu</li>
                      <li>Dashboard → Settings → Environment Variables</li>
                      <li>Pridajte <code className="bg-blue-100 px-2 py-0.5 rounded">GOOGLE_DRIVE_FOLDER_IDS</code></li>
                      <li>Vložte a uložte</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}