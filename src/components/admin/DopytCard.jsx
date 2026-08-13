import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Home, Gift, CheckCircle, Circle, Copy } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";

export default function DopytCard({ dopyt, domNazov, onToggleSpracovany, updating }) {
  const jeDotacia = dopyt.poznamka?.includes("Dotácia Americana") || !!dopyt.typ_grantu;

  const copyContact = () => {
    navigator.clipboard.writeText(`${dopyt.meno} | ${dopyt.email} | ${dopyt.telefon}`);
    toast.success("Kontakt skopírovaný");
  };

  return (
    <Card className={`p-5 ${dopyt.spracovany ? "opacity-70" : ""} ${jeDotacia ? "border-emerald-500/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-lg">{dopyt.meno}</h3>
            {jeDotacia && (
              <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                <Gift className="w-3 h-3" /> Dotácia Americana
              </Badge>
            )}
            {dopyt.typ_dopytu === "konfigurator" && <Badge variant="outline">Konfigurátor</Badge>}
            {dopyt.typ_dopytu === "detail_domu" && <Badge variant="outline">Detail domu</Badge>}
            {dopyt.spracovany ? (
              <Badge className="bg-slate-500 text-white">Spracované</Badge>
            ) : (
              <Badge className="bg-red-600 text-white">Nové</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(dopyt.created_date), "dd.MM.yyyy HH:mm", { locale: sk })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyContact}>
            <Copy className="w-3.5 h-3.5 mr-1" /> Kontakt
          </Button>
          <Button
            size="sm"
            variant={dopyt.spracovany ? "outline" : "default"}
            disabled={updating}
            onClick={() => onToggleSpracovany(dopyt)}
          >
            {dopyt.spracovany ? (
              <><Circle className="w-3.5 h-3.5 mr-1" /> Označiť ako nové</>
            ) : (
              <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Spracované</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-3">
        <a href={`mailto:${dopyt.email}`} className="flex items-center gap-2 text-primary hover:underline">
          <Mail className="w-4 h-4" /> {dopyt.email}
        </a>
        <a href={`tel:${dopyt.telefon}`} className="flex items-center gap-2 text-primary hover:underline">
          <Phone className="w-4 h-4" /> {dopyt.telefon}
        </a>
        {domNazov && (
          <p className="flex items-center gap-2 text-foreground">
            <Home className="w-4 h-4 text-muted-foreground" /> {domNazov}
          </p>
        )}
        {dopyt.typ_grantu && (
          <p className="flex items-center gap-2 text-emerald-600 font-semibold">
            <Gift className="w-4 h-4" /> {dopyt.typ_grantu}
          </p>
        )}
        {dopyt.forma_financovania && (
          <p className="text-muted-foreground">Financovanie: <span className="text-foreground font-medium">{dopyt.forma_financovania}</span></p>
        )}
        {dopyt.konfiguracny_kod && (
          <p className="text-muted-foreground">Konfigurácia: <span className="font-mono text-foreground">{dopyt.konfiguracny_kod}</span></p>
        )}
      </div>

      {dopyt.poznamka && (
        <div className="bg-muted/60 rounded-lg p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {dopyt.poznamka}
        </div>
      )}
    </Card>
  );
}