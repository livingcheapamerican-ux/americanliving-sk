import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdvancedFilters({ dokumenty, onFilterChange }) {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    typ_obsahu: 'all',
    fasada_material: 'all',
    fasada_drevina: 'all',
    fasada_uprava: 'all',
    okna_typ: 'all',
    strecha_typ: 'all',
    stav_fasady: 'all',
    vyrobca: 'all',
    search: ''
  });

  // Extrahuj unikátne hodnoty z dokumentov
  const uniqueValues = useMemo(() => {
    const values = {
      materialy: new Set(),
      dreviny: new Set(),
      upravy: new Set(),
      okna: new Set(),
      strechy: new Set(),
      stavy: new Set(),
      vyrobcovia: new Set()
    };

    dokumenty.forEach(dok => {
      if (dok.vizualna_analyza) {
        const va = dok.vizualna_analyza;
        
        va.fasada_materialy?.forEach(m => values.materialy.add(m));
        va.fasada_typy_drevin?.forEach(d => values.dreviny.add(d));
        va.fasada_povrchove_upravy?.forEach(u => values.upravy.add(u));
        if (va.okna_typ) values.okna.add(va.okna_typ);
        if (va.strecha_typ) values.strechy.add(va.strecha_typ);
        if (va.stav_fasady) values.stavy.add(va.stav_fasady);
      }
      if (dok.vyrobca) values.vyrobcovia.add(dok.vyrobca);
    });

    return {
      materialy: Array.from(values.materialy).sort(),
      dreviny: Array.from(values.dreviny).sort(),
      upravy: Array.from(values.upravy).sort(),
      okna: Array.from(values.okna).sort(),
      strechy: Array.from(values.strechy).sort(),
      stavy: Array.from(values.stavy).sort(),
      vyrobcovia: Array.from(values.vyrobcovia).sort()
    };
  }, [dokumenty]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Aplikuj filtre
    const filtered = dokumenty.filter(dok => {
      const va = dok.vizualna_analyza;
      
      if (!va && newFilters.typ_obsahu !== 'all') return false;
      
      // Search
      if (newFilters.search && !dok.nazov.toLowerCase().includes(newFilters.search.toLowerCase())) {
        return false;
      }
      
      // Typ obsahu
      if (newFilters.typ_obsahu !== 'all' && va?.typ_obsahu !== newFilters.typ_obsahu) {
        return false;
      }
      
      // Materiál
      if (newFilters.fasada_material !== 'all') {
        if (!va?.fasada_materialy?.some(m => m.includes(newFilters.fasada_material))) {
          return false;
        }
      }
      
      // Drevina
      if (newFilters.fasada_drevina !== 'all') {
        if (!va?.fasada_typy_drevin?.includes(newFilters.fasada_drevina)) {
          return false;
        }
      }
      
      // Úprava
      if (newFilters.fasada_uprava !== 'all') {
        if (!va?.fasada_povrchove_upravy?.some(u => u.includes(newFilters.fasada_uprava))) {
          return false;
        }
      }
      
      // Okná
      if (newFilters.okna_typ !== 'all' && va?.okna_typ !== newFilters.okna_typ) {
        return false;
      }
      
      // Strecha
      if (newFilters.strecha_typ !== 'all' && va?.strecha_typ !== newFilters.strecha_typ) {
        return false;
      }
      
      // Stav
      if (newFilters.stav_fasady !== 'all' && va?.stav_fasady !== newFilters.stav_fasady) {
        return false;
      }
      
      // Výrobca
      if (newFilters.vyrobca !== 'all' && dok.vyrobca !== newFilters.vyrobca) {
        return false;
      }
      
      return true;
    });
    
    onFilterChange(filtered);
  };

  const clearFilters = () => {
    const emptyFilters = {
      typ_obsahu: 'all',
      fasada_material: 'all',
      fasada_drevina: 'all',
      fasada_uprava: 'all',
      okna_typ: 'all',
      strecha_typ: 'all',
      stav_fasady: 'all',
      vyrobca: 'all',
      search: ''
    };
    setFilters(emptyFilters);
    onFilterChange(dokumenty);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all' && v !== '').length;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold">Pokročilé filtrovanie</h3>
          {activeFiltersCount > 0 && (
            <Badge className="bg-blue-600">{activeFiltersCount} aktívnych filtrov</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Vymazať
            </Button>
          )}
          <Button 
            onClick={() => setExpanded(!expanded)} 
            variant="ghost" 
            size="sm"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Skryť
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Rozbaliť
              </>
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Search */}
          <div>
            <Label>Hľadať v názve</Label>
            <Input
              placeholder="Názov súboru..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Typ obsahu */}
            <div>
              <Label>Typ obsahu</Label>
              <Select value={filters.typ_obsahu} onValueChange={(v) => handleFilterChange('typ_obsahu', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  <SelectItem value="exterier">Exteriér</SelectItem>
                  <SelectItem value="interier">Interiér</SelectItem>
                  <SelectItem value="podorys">Pôdorys</SelectItem>
                  <SelectItem value="detail">Detail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Materiál fasády */}
            <div>
              <Label>Materiál fasády</Label>
              <Select value={filters.fasada_material} onValueChange={(v) => handleFilterChange('fasada_material', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {uniqueValues.materialy.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Typ dreviny */}
            <div>
              <Label>Typ dreviny</Label>
              <Select value={filters.fasada_drevina} onValueChange={(v) => handleFilterChange('fasada_drevina', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {uniqueValues.dreviny.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Povrchová úprava */}
            <div>
              <Label>Povrchová úprava</Label>
              <Select value={filters.fasada_uprava} onValueChange={(v) => handleFilterChange('fasada_uprava', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {uniqueValues.upravy.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Okná */}
            <div>
              <Label>Typ okien</Label>
              <Select value={filters.okna_typ} onValueChange={(v) => handleFilterChange('okna_typ', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {uniqueValues.okna.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Strecha */}
            <div>
              <Label>Typ strechy</Label>
              <Select value={filters.strecha_typ} onValueChange={(v) => handleFilterChange('strecha_typ', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {uniqueValues.strechy.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stav fasády */}
            <div>
              <Label>Stav fasády</Label>
              <Select value={filters.stav_fasady} onValueChange={(v) => handleFilterChange('stav_fasady', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {uniqueValues.stavy.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Výrobca */}
            <div>
              <Label>Výrobca</Label>
              <Select value={filters.vyrobca} onValueChange={(v) => handleFilterChange('vyrobca', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetci</SelectItem>
                  {uniqueValues.vyrobcovia.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}