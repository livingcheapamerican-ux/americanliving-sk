import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ImagePlus, Loader2, X } from "lucide-react";

export default function PhotoUploader({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = [...e.target.files].slice(0, 10);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      onChange([...photos, ...urls]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-slate-400 block text-xs font-mono">Fotografie (odporúčame aspoň 3)</label>
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
            <img src={url} alt={`Fotka ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((p) => p !== url))}
              className="absolute top-0.5 right-0.5 bg-slate-950/80 rounded-full p-0.5 text-slate-300 hover:text-white"
              aria-label="Odstrániť fotku"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-purple-400 text-slate-500 hover:text-purple-300 transition-colors">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}