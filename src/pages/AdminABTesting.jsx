import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Plus, Play, Pause, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function AdminABTesting() {
  const [showCreate, setShowCreate] = useState(false);
  const [newTest, setNewTest] = useState({
    nazov: "",
    typ: "konfigurator_cta",
    varianta_a: { nazov: "Varianta A", popis: "", config: {} },
    varianta_b: { nazov: "Varianta B", popis: "", config: {} },
    aktivny: true,
    zaciatok: new Date().toISOString()
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: tests } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => base44.entities.ABTest.list('-created_date')
  });

  const createTestMutation = useMutation({
    mutationFn: (testData) => base44.entities.ABTest.create(testData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      setShowCreate(false);
      toast.success('A/B test vytvorený!');
    }
  });

  const toggleTestMutation = useMutation({
    mutationFn: ({ id, aktivny }) => base44.entities.ABTest.update(id, { aktivny }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast.success('Stav testu zmenený!');
    }
  });

  const declareWinnerMutation = useMutation({
    mutationFn: ({ id, vitaz }) => base44.entities.ABTest.update(id, { vitaz, aktivny: false, koniec: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast.success('Víťaz vyhlásený!');
    }
  });

  if (user?.role !== 'admin') {
    return <div className="p-6">Prístup iba pre administrátorov.</div>;
  }

  const calculateWinner = (test) => {
    const convA = test.statistiky_a?.miera_konverzie || 0;
    const convB = test.statistiky_b?.miera_konverzie || 0;
    const diff = ((convB - convA) / (convA || 1)) * 100;

    if (Math.abs(diff) < 5) return { winner: 'tie', diff };
    return { winner: convB > convA ? 'b' : 'a', diff };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">A/B Testovanie</h1>
            <p className="text-gray-600">Testujte rôzne varianty a optimalizujte konverzie</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nový test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vytvoriť nový A/B test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Názov testu</Label>
                  <Input
                    value={newTest.nazov}
                    onChange={(e) => setNewTest({...newTest, nazov: e.target.value})}
                    placeholder="napr. CTA tlačidlo v konfigurátore"
                  />
                </div>
                <div>
                  <Label>Typ testu</Label>
                  <Select value={newTest.typ} onValueChange={(v) => setNewTest({...newTest, typ: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="konfigurator_cta">Konfigurátor CTA</SelectItem>
                      <SelectItem value="hlavna_stranka_hero">Hlavná stránka Hero</SelectItem>
                      <SelectItem value="katalog_filter">Katalóg Filter</SelectItem>
                      <SelectItem value="cena_zobrazenie">Zobrazenie ceny</SelectItem>
                      <SelectItem value="kontaktny_formular">Kontaktný formulár</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Varianta A - Názov</Label>
                    <Input
                      value={newTest.varianta_a.nazov}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        varianta_a: {...newTest.varianta_a, nazov: e.target.value}
                      })}
                    />
                    <Label className="mt-2">Popis</Label>
                    <Textarea
                      value={newTest.varianta_a.popis}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        varianta_a: {...newTest.varianta_a, popis: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Varianta B - Názov</Label>
                    <Input
                      value={newTest.varianta_b.nazov}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        varianta_b: {...newTest.varianta_b, nazov: e.target.value}
                      })}
                    />
                    <Label className="mt-2">Popis</Label>
                    <Textarea
                      value={newTest.varianta_b.popis}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        varianta_b: {...newTest.varianta_b, popis: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createTestMutation.mutate(newTest)}
                  disabled={!newTest.nazov || createTestMutation.isPending}
                  className="w-full"
                >
                  Vytvoriť test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {tests?.map((test) => {
            const result = calculateWinner(test);
            const statsA = test.statistiky_a || {};
            const statsB = test.statistiky_b || {};

            return (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.nazov}
                        {test.aktivny ? (
                          <Badge className="bg-green-500">Aktívny</Badge>
                        ) : (
                          <Badge variant="secondary">Neaktívny</Badge>
                        )}
                        {test.vitaz !== 'nevyhodnotene' && (
                          <Badge className="bg-yellow-500">
                            <Trophy className="w-3 h-3 mr-1" />
                            Víťaz: {test.vitaz.toUpperCase()}
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{test.typ}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTestMutation.mutate({ id: test.id, aktivny: !test.aktivny })}
                      >
                        {test.aktivny ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      {test.vitaz === 'nevyhodnotene' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declareWinnerMutation.mutate({ id: test.id, vitaz: 'a' })}
                          >
                            Víťaz A
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declareWinnerMutation.mutate({ id: test.id, vitaz: 'b' })}
                          >
                            Víťaz B
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Varianta A */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold text-lg mb-2">{test.varianta_a.nazov}</h3>
                      <p className="text-sm text-gray-600 mb-4">{test.varianta_a.popis}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Zobrazenia:</span>
                          <span className="font-semibold">{statsA.zobrazenia || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Konverzie:</span>
                          <span className="font-semibold">{statsA.konverzie || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Miera konverzie:</span>
                          <span className="font-semibold text-primary">
                            {(statsA.miera_konverzie || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Varianta B */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h3 className="font-semibold text-lg mb-2">{test.varianta_b.nazov}</h3>
                      <p className="text-sm text-gray-600 mb-4">{test.varianta_b.popis}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Zobrazenia:</span>
                          <span className="font-semibold">{statsB.zobrazenia || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Konverzie:</span>
                          <span className="font-semibold">{statsB.konverzie || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Miera konverzie:</span>
                          <span className="font-semibold text-primary">
                            {(statsB.miera_konverzie || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Porovnanie */}
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      {result.winner === 'b' && <TrendingUp className="w-5 h-5 text-green-500" />}
                      {result.winner === 'a' && <TrendingDown className="w-5 h-5 text-red-500" />}
                      {result.winner === 'tie' && <Minus className="w-5 h-5 text-gray-500" />}
                      <span className="font-semibold">
                        {result.winner === 'tie' 
                          ? 'Nerozhodne (rozdiel < 5%)'
                          : `Varianta ${result.winner.toUpperCase()} vedie o ${Math.abs(result.diff).toFixed(1)}%`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}