import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function AutoPrekladBlogov() {
  const [status, setStatus] = useState("loading");
  const [results, setResults] = useState(null);

  useEffect(() => {
    const translateBlogs = async () => {
      try {
        setStatus("translating");
        const response = await base44.functions.invoke('bulkTranslateBlogPosts', {});
        setResults(response.data.results);
        setStatus("success");
        
        // Po 3 sekundách presmeruj na Blog
        setTimeout(() => {
          window.location.href = '/Blog';
        }, 3000);
      } catch (error) {
        console.error("Chyba:", error);
        setStatus("error");
      }
    };

    translateBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        {status === "loading" || status === "translating" ? (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Prekladám blogy...</h2>
            <p className="text-gray-600">Prosím čakajte, prebieha automatický preklad do 9 jazykov.</p>
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Hotovo!</h2>
            <p className="text-gray-600 mb-4">
              Preklad dokončený: {results?.translated} blogov úspešne preložených
            </p>
            {results?.failed > 0 && (
              <p className="text-orange-600 text-sm">
                Zlyhalo: {results.failed} blogov
              </p>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Chyba</h2>
            <p className="text-gray-600">Nepodarilo sa preložiť blogy. Skúste to prosím neskôr.</p>
          </>
        )}
      </Card>
    </div>
  );
}