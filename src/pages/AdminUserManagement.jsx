import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Mail, Shield, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminUserManagement() {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date'),
    enabled: currentUser?.super_admin === true
  });

  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('Používateľ odstránený');
    }
  });

  const inviteAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast.error('Zadajte platný email');
      return;
    }

    setInviting(true);
    try {
      const response = await base44.functions.invoke('inviteAdminUser', {
        email: newAdminEmail,
        role: "admin"
      });

      if (response.data.success) {
        toast.success(`✅ Pozvánka odoslaná na ${newAdminEmail}`);
        setNewAdminEmail("");
        setShowInviteDialog(false);
        queryClient.invalidateQueries(['all-users']);
      } else {
        toast.error(response.data.error || 'Chyba pri posielaní pozvánky');
      }
    } catch (error) {
      toast.error('Chyba pri posielaní pozvánky: ' + error.message);
    } finally {
      setInviting(false);
    }
  };

  if (!currentUser?.super_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  const admins = allUsers.filter(u => u.role === 'admin' || u.super_admin);
  const regularUsers = allUsers.filter(u => u.role === 'user' && !u.super_admin);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              👥 Správa používateľov
            </h1>
            <p className="text-gray-600">Pozývajte a spravujte admin používateľov</p>
          </div>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Pozvať admina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  📧 Pozvať nového admina
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Email admina</Label>
                  <Input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        inviteAdmin();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Admin dostane email s odkazom na registráciu a bude mať prístup ku všetkým admin funkciám.
                  </p>
                </div>

                <Button
                  onClick={inviteAdmin}
                  disabled={inviting || !newAdminEmail}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {inviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posielam pozvánku...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Poslať pozvánku
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-indigo-600" />
                <Badge className="bg-indigo-600 text-white">Admins</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Administrátori</p>
              <p className="text-4xl font-bold text-gray-900">{admins.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600 text-white">Users</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Bežní užívatelia</p>
              <p className="text-4xl font-bold text-gray-900">{regularUsers.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-white">Total</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Celkom</p>
              <p className="text-4xl font-bold text-gray-900">{allUsers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Users List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              👑 Administrátori ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admins.map((user) => (
                <Card key={user.id} className={`${
                  user.super_admin ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400' : 'bg-white border border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.super_admin ? 'bg-purple-600' : 'bg-indigo-600'
                        } text-white font-bold text-lg`}>
                          {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm">{user.full_name || 'Bez mena'}</h5>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            {user.super_admin ? (
                              <Badge className="bg-purple-600 text-white">👑 Super Admin</Badge>
                            ) : (
                              <Badge className="bg-indigo-600 text-white">🛡️ Admin</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(user.created_date), 'dd.MM.yyyy')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {!user.super_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Naozaj chcete odstrániť používateľa ${user.email}?`)) {
                              deleteUser.mutate(user.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regular Users */}
        {regularUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                👤 Bežní užívatelia ({regularUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {regularUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{user.full_name || 'Bez mena'}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant="outline">{format(new Date(user.created_date), 'dd.MM.yyyy')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}