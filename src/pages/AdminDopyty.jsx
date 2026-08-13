import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Search, Gift } from "lucide-react";
import DopytCard from "@/components/admin/DopytCard";

export default function AdminDopyty() {
  const [tab, setTab] = useState("vsetky");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const isSuperAdmin = user?.super_admin === true;

  const { data: dopyty = [], isLoading } = useQuery({
    queryKey: ["admin-dopyty-all"],
    queryFn: () => base44.entities.Dopyt.list("-created_date", 1000),
    enabled: isSuperAdmin,
  });

  const { data: domy = [] } = useQuery({
    queryKey: ["domy-all"],
    queryFn: () => base44.entities.Dom.list(),
    enabled: isSuperAdmin,
  });

  const domNazvy = useMemo(() => {
    const map = {};
    domy.forEach((d) => { map[d.id] = d.nazov; });
    return map;
  }, [domy]);

  const toggleMutation = useMutation({
    mutationFn: (dopyt) => base44.entities.Dopyt.update(dopyt.id, { spracovany: !dopyt.spracovany }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dopyty-all"] }),
  });

  const jeDotacia = (d) => d.poznamka?.includes("Dotácia Americana") || !!d.typ_grantu;

  const filtered = useMemo(() => {
    let list = dopyty;
    if (tab === "dotacie") list = list.filter(jeDotacia);
    if (tab === "ostatne") list = list.filter((d) => !jeDotacia(d));
    if (tab === "nespracovane") list = list.filter((d) => !d.spracovany);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.meno?.toLowerCase().includes(q) ||
          d.email?.toLowerCase().includes(q) ||
          d.telefon?.includes(q) ||
          d.poznamka?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dopyty, tab, search]);

  const pocetDotacii = useMemo(() => dopyty.filter(jeDotacia).length, [dopyty]);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8">
          <p className="text-muted-foreground">Táto stránka je dostupná len pre super admina.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-28 sm:pt-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Inbox className="w-8 h-8 text-primary" />
            Žiadosti a dopyty
          </h1>
          <p className="text-muted-foreground text-sm">
            Všetky prijaté žiadosti vrátane histórie — spolu {dopyty.length}, z toho{" "}
            <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" /> {pocetDotacii} žiadostí o Dotáciu Americana
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Tabs value={tab} onValueChange={setTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vsetky">Všetky</TabsTrigger>
              <TabsTrigger value="dotacie">🎁 Dotácie</TabsTrigger>
              <TabsTrigger value="ostatne">Ostatné</TabsTrigger>
              <TabsTrigger value="nespracovane">Nespracované</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Hľadať meno, email, telefón..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
            Žiadne dopyty pre zvolený filter.
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((d) => (
              <DopytCard
                key={d.id}
                dopyt={d}
                domNazov={d.dom_id ? domNazvy[d.dom_id] : null}
                onToggleSpracovany={(dopyt) => toggleMutation.mutate(dopyt)}
                updating={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}