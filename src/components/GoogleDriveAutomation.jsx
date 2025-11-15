import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Trash2, Edit, Play, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function GoogleDriveAutomation() {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "file_assignment",
    enabled: true,
    rule_config: {}
  });

  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['google-drive-automations'],
    queryFn: () => base44.entities.GoogleDriveAutomation.list('-created_date')
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['google-drive-folders'],
    queryFn: async () => {
      const response = await base44.functions.invoke('googleDrive', { action: 'listFolders' });
      return response.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GoogleDriveAutomation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-automations'] });
      setShowForm(false);
      setFormData({ name: "", type: "file_assignment", enabled: true, rule_config: {} });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GoogleDriveAutomation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-automations'] });
      setEditingRule(null);
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GoogleDriveAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-automations'] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.GoogleDriveAutomation.update(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-automations'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowForm(true);
  };

  const typeLabels = {
    file_assignment: "Priraďovanie súborov",
    notification: "Notifikácie",
    sync_schedule: "Plánovaná synchronizácia"
  };

  const statusColors = {
    success: "bg-green-600",
    failed: "bg-red-600",
    pending: "bg-yellow-600"
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Automatizácia</h3>
            <p className="text-sm text-gray-600">{rules.length} aktívnych pravidiel</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nové pravidlo
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Názov pravidla</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Napr. PDF do dokumentov"
                required
              />
            </div>
            <div>
              <Label>Typ automatizácie</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value, rule_config: {}})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_assignment">Priraďovanie súborov</SelectItem>
                  <SelectItem value="notification">Notifikácie</SelectItem>
                  <SelectItem value="sync_schedule">Plánovaná synchronizácia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === "file_assignment" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Vzor názvu súboru</Label>
                <Input
                  value={formData.rule_config.file_name_pattern || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, file_name_pattern: e.target.value}
                  })}
                  placeholder="*.pdf alebo návrh*"
                />
              </div>
              <div>
                <Label>Typ súboru</Label>
                <Select
                  value={formData.rule_config.file_type || ""}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, file_type: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Všetky typy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Dokumenty</SelectItem>
                    <SelectItem value="spreadsheet">Tabuľky</SelectItem>
                    <SelectItem value="presentation">Prezentácie</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Obrázky</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cieľový priečinok</Label>
                <Select
                  value={formData.rule_config.target_folder_id || ""}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, target_folder_id: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte priečinok" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.type === "notification" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Typ notifikácie</Label>
                <Select
                  value={formData.rule_config.notification_type || ""}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, notification_type: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token_expiration">Expirácia tokenu</SelectItem>
                    <SelectItem value="connection_lost">Stratené pripojenie</SelectItem>
                    <SelectItem value="sync_failed">Zlyhanie synchronizácie</SelectItem>
                    <SelectItem value="sync_completed">Dokončená synchronizácia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email pre notifikácie</Label>
                <Input
                  type="email"
                  value={formData.rule_config.notification_email || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, notification_email: e.target.value}
                  })}
                  placeholder="admin@example.com"
                />
              </div>
            </div>
          )}

          {formData.type === "sync_schedule" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frekvencia</Label>
                <Select
                  value={formData.rule_config.sync_frequency || ""}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, sync_frequency: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Každú hodinu</SelectItem>
                    <SelectItem value="daily">Denne</SelectItem>
                    <SelectItem value="weekly">Týždenne</SelectItem>
                    <SelectItem value="monthly">Mesačne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Čas spustenia</Label>
                <Input
                  type="time"
                  value={formData.rule_config.sync_time || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    rule_config: {...formData.rule_config, sync_time: e.target.value}
                  })}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
            />
            <Label>Aktívne</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-primary">
              {editingRule ? "Uložiť zmeny" : "Vytvoriť pravidlo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingRule(null);
                setFormData({ name: "", type: "file_assignment", enabled: true, rule_config: {} });
              }}
            >
              Zrušiť
            </Button>
          </div>
        </motion.form>
      )}

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0">
              <Switch
                checked={rule.enabled}
                onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, enabled: checked })}
              />
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-800">{rule.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {typeLabels[rule.type]}
                </Badge>
                {rule.last_run_status && (
                  <Badge className={`${statusColors[rule.last_run_status]} text-white text-xs`}>
                    {rule.last_run_status}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                {rule.type === "file_assignment" && (
                  <p>
                    Vzor: {rule.rule_config.file_name_pattern || "Všetky"} →{" "}
                    {folders.find(f => f.id === rule.rule_config.target_folder_id)?.name || "Priečinok"}
                  </p>
                )}
                {rule.type === "notification" && (
                  <p>
                    Typ: {rule.rule_config.notification_type} → {rule.rule_config.notification_email}
                  </p>
                )}
                {rule.type === "sync_schedule" && (
                  <p>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {rule.rule_config.sync_frequency} o {rule.rule_config.sync_time || "00:00"}
                  </p>
                )}
                {rule.last_run && (
                  <p className="text-xs text-gray-500">
                    Posledné spustenie: {new Date(rule.last_run).toLocaleString('sk-SK')} ({rule.run_count}x)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(rule)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm('Naozaj chcete vymazať toto pravidlo?')) {
                    deleteMutation.mutate(rule.id);
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}

        {rules.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-500">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Žiadne pravidlá</p>
            <p className="text-sm">Vytvorte prvé automatizačné pravidlo</p>
          </div>
        )}
      </div>
    </Card>
  );
}