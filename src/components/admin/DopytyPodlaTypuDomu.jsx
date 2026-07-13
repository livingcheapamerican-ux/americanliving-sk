import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MessageSquare } from "lucide-react";

const TYP_LABELS = {
  modularny: "Modulárne domy",
  mobilny: "Mobilné domy",
  montovany: "Montované domy",
  neurcene: "Bez priradeného domu",
};

const FARBY = {
  modularny: "#EF4444",
  mobilny: "#3b82f6",
  montovany: "#10b981",
  neurcene: "#94a3b8",
};

export default function DopytyPodlaTypuDomu() {
  const { data: dopyty = [] } = useQuery({
    queryKey: ['dopyty-all'],
    queryFn: () => base44.entities.Dopyt.list('-created_date')
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-all'],
    queryFn: () => base44.entities.Dom.list()
  });

  const { data: mesacneDopyty = [], najviac } = useMemo(() => {
    const hranica = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const domTyp = {};
    domy.forEach(d => { domTyp[d.id] = d.typ_domu; });

    const counts = { modularny: 0, mobilny: 0, montovany: 0, neurcene: 0 };
    dopyty
      .filter(d => new Date(d.created_date) >= hranica)
      .forEach(d => {
        const typ = d.dom_id && domTyp[d.dom_id] ? domTyp[d.dom_id] : 'neurcene';
        counts[typ] = (counts[typ] || 0) + 1;
      });

    const data = Object.entries(counts)
      .map(([typ, pocet]) => ({ typ, nazov: TYP_LABELS[typ] || typ, pocet }))
      .sort((a, b) => b.pocet - a.pocet);

    return { data: data, najviac: data[0] };
  }, [dopyty, domy]);

  const celkom = mesacneDopyty.reduce((sum, d) => sum + d.pocet, 0);

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Nové dopyty za posledný mesiac podľa typu domu</h3>
        </div>
        <span className="text-sm text-gray-500">Spolu {celkom} dopytov</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {najviac && celkom > 0
          ? `Najviac dopytov: ${najviac.nazov} (${najviac.pocet})`
          : "Za posledných 30 dní neboli žiadne dopyty."}
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={mesacneDopyty} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nazov" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [`${value} dopytov`, "Počet"]} />
          <Bar dataKey="pocet" radius={[6, 6, 0, 0]}>
            {mesacneDopyty.map((entry) => (
              <Cell key={entry.typ} fill={FARBY[entry.typ] || "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}