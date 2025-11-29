import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FolderSync, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plus,
  Settings,
  Trash2,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const SYNC_FREQUENCIES = [
  { value: 'manual', label: 'Manuálne' },
  { value: 'hourly', label: 'Každú hodinu' },
  { value: 'daily', label: 'Denne' },
  { value: 'weekly', label: 'Týždenne' },
];

const TYP_FOTKY_OPTIONS = [
  { value: 'galeria', label: 'Galéria' },
  { value: 'hlavny_obrazok', label: 'Hlavný obrázok' },
  { value: 'nove_fotky', label: 'Nové fotky' },
  { value: 'stare_fotky', label: 'Staré fotky' },
];

const KATEGORIA_OPTIONS = [
  { value: 'exterier', label: 'Exteriér' },
  { value: 'interier', label: 'Interiér' },
  { value: 'podorys', label: 'Pôdorys' },
  { value: 'detail', label: 'Detail' },
];

export default function GoogleDriveSyncManager({ folders = [], domy = [] }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [syncSettings, setSyncSettings] = useState({
    sync_frequency: 'daily',
    auto_assign_dom: false,
    target_dom_id: '',
    default_typ_fotky: 'galeria',
    default_kategoria: 'exterier'
  });
  const [syncingIds, setSyncingIds] = useState([]);
  const [checkingIds, setCheckingIds] = useState([]);
  const [changesInfo, setChangesInfo] = useState({});

  const queryClient = useQueryClient();

  const { data: syncConfigs = [], isLoading } = useQuery({
    queryKey: ['google-drive-syncs'],
    queryFn: () => base44.entities.GoogleDriveSync.list('-created_date')
  });

  const createSyncMutation = useMutation({
    mutationFn: (data) => base44.entities.GoogleDriveSync.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-syncs'] });
      setShowAddDialog(false);
      setSelectedFolder(null);
      toast.success('Synchronizácia vytvorená');
    }
  });

  const updateSyncMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GoogleDriveSync.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-syncs'] });
    }
  });

  const deleteSyncMutation = useMutation({
    mutationFn: (id) => base44.entities.GoogleDriveSync.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-syncs'] });
      toast.success('Synchronizácia odstránená');
    }
  });

  const handleCreateSync = () => {
    if (!selectedFolder) return;
    
    const targetDom = domy.find(d => d.id === syncSettings.target_dom_id);
    
    createSyncMutation.mutate({
      folder_id: selectedFolder.id,
      folder_name: selectedFolder.name,
      sync_enabled: true,
      sync_frequency: syncSettings.sync_frequency,
      auto_assign_dom: syncSettings.auto_assign_dom,
      target_dom_id: syncSettings.target_dom_id,
      target_dom_nazov: targetDom?.nazov || '',
      default_typ_fotky: syncSettings.default_typ_fotky,
      default_kategoria: syncSettings.default_kategoria,
      synced_file_ids: []
    });
  };

  const handleSyncNow = async (syncConfig) => {
    setSyncingIds(prev => [...prev, syncConfig.id]);
    
    try {
      const response = await base44.functions.invoke('googleDriveSync', {
        action: 'syncFolder',
        syncId: syncConfig.id
      });
      
      if (response.data?.success) {
        toast.success(`Synchronizované: ${response.data.importedFiles} nových fotiek`);
        queryClient.invalidateQueries({ queryKey: ['google-drive-syncs'] });
        queryClient.invalidateQueries({ queryKey: ['fotky'] });
      } else {
        toast.error(response.data?.error || 'Chyba synchronizácie');
      }
    } catch (error) {
      toast.error(`Chyba: ${error.message}`);
    }
    
    setSyncingIds(prev => prev.filter(id => id !== syncConfig.id));
  };

  const handleCheckChanges = async (syncConfig) => {
    setCheckingIds(prev => [...prev, syncConfig.id]);
    
    try {
      const response = await base44.functions.invoke('googleDriveSync', {
        action: 'checkChanges',
        syncId: syncConfig.id
      });
      
      if (response.data) {
        setChangesInfo(prev => ({ ...prev, [syncConfig.id]: response.data }));
        if (response.data.newFiles > 0) {
          toast.info(`Nájdených ${response.data.newFiles} nových fotiek`);
        } else {
          toast.success('Žiadne nové fotky');
        }
      }
    } catch (error) {
      toast.error(`Chyba: ${error.message}`);
    }
    
    setCheckingIds(prev => prev.filter(id => id !== syncConfig.id));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Úspešné</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1" />Chyba</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Prebieha</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700"><Clock className="w-3 h-3 mr-1" />Čaká</Badge>;
    }
  };

  const availableFolders = folders.filter(
    f => !syncConfigs.some(s => s.folder_id === f.id)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderSync className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-800">Synchronizácia priečinkov</h3>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Pridať
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pridať synchronizáciu priečinka</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Priečinok z Google Drive</Label>
                <Select value={selectedFolder?.id || ''} onValueChange={(id) => setSelectedFolder(folders.find(f => f.id === id))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte priečinok..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFolders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frekvencia synchronizácie</Label>
                <Select value={syncSettings.sync_frequency} onValueChange={(v) => setSyncSettings(p => ({ ...p, sync_frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SYNC_FREQUENCIES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priradiť k domu</Label>
                <Select value={syncSettings.target_dom_id} onValueChange={(v) => setSyncSettings(p => ({ ...p, target_dom_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Žiadny (priradiť neskôr)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Žiadny</SelectItem>
                    {domy.map(dom => (
                      <SelectItem key={dom.id} value={dom.id}>{dom.nazov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Predvolený typ</Label>
                  <Select value={syncSettings.default_typ_fotky} onValueChange={(v) => setSyncSettings(p => ({ ...p, default_typ_fotky: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYP_FOTKY_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Predvolená kategória</Label>
                  <Select value={syncSettings.default_kategoria} onValueChange={(v) => setSyncSettings(p => ({ ...p, default_kategoria: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KATEGORIA_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCreateSync} 
                disabled={!selectedFolder || createSyncMutation.isPending}
                className="w-full"
              >
                {createSyncMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Vytvoriť synchronizáciu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sync configs list */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
        </div>
      ) : syncConfigs.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <FolderSync className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Žiadne synchronizované priečinky</p>
          <p className="text-sm">Pridajte priečinok pre automatický import fotiek</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {syncConfigs.map(sync => (
            <Card key={sync.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{sync.folder_name}</span>
                    {getStatusBadge(sync.last_sync_status)}
                    {changesInfo[sync.id]?.newFiles > 0 && (
                      <Badge className="bg-amber-100 text-amber-700">
                        {changesInfo[sync.id].newFiles} nových
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {sync.target_dom_nazov && (
                      <p>Dom: <span className="font-medium">{sync.target_dom_nazov}</span></p>
                    )}
                    <p>
                      Frekvencia: {SYNC_FREQUENCIES.find(f => f.value === sync.sync_frequency)?.label || sync.sync_frequency}
                      {' • '}
                      Synchronizovaných: {sync.files_synced || 0} fotiek
                    </p>
                    {sync.last_sync && (
                      <p>Posledná sync: {format(new Date(sync.last_sync), 'dd.MM.yyyy HH:mm', { locale: sk })}</p>
                    )}
                    {sync.last_sync_message && (
                      <p className={sync.last_sync_status === 'error' ? 'text-red-600' : ''}>
                        {sync.last_sync_message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={sync.sync_enabled}
                    onCheckedChange={(checked) => updateSyncMutation.mutate({ id: sync.id, data: { sync_enabled: checked } })}
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheckChanges(sync)}
                    disabled={checkingIds.includes(sync.id)}
                  >
                    {checkingIds.includes(sync.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleSyncNow(sync)}
                    disabled={syncingIds.includes(sync.id)}
                  >
                    {syncingIds.includes(sync.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Odstrániť synchronizáciu?')) {
                        deleteSyncMutation.mutate(sync.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}