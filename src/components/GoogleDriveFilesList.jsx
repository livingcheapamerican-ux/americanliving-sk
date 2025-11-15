import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCw, ExternalLink, Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function GoogleDriveFilesList() {
  const { data: files, isLoading, error, refetch } = useQuery({
    queryKey: ['google-drive-files'],
    queryFn: async () => {
      const response = await base44.functions.invoke('googleDrive', { action: 'listFiles' });
      return response.data || [];
    },
    enabled: false,
  });

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('document')) return '📄';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    return '📎';
  };

  const getFileType = (mimeType) => {
    if (mimeType.includes('document')) return 'Dokument';
    if (mimeType.includes('spreadsheet')) return 'Tabuľka';
    if (mimeType.includes('presentation')) return 'Prezentácia';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Obrázok';
    if (mimeType.includes('video')) return 'Video';
    if (mimeType.includes('audio')) return 'Audio';
    return mimeType.split('/').pop().toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoadFiles = () => {
    refetch();
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-gray-800">Súbory z vybraných priečinkov</h3>
            <p className="text-sm text-gray-600">
              {files && files.length > 0 
                ? `Načítaných: ${files.length} súborov`
                : "Kliknite pre načítanie súborov"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLoadFiles}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Načítavam...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {files ? "Obnoviť" : "Načítať súbory"}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-4">
          {error.response?.data?.error || error.message}
        </div>
      )}

      {files && files.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Súbor</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Typ</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Posledná úprava</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Akcie</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{file.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className="text-xs">
                      {getFileType(file.mimeType)}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(file.modifiedTime)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <a 
                        href={file.webViewLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Otvoriť v Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {files && files.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Žiadne súbory</p>
          <p className="text-sm">Vo vybraných priečinkoch sa nenašli žiadne súbory.</p>
        </div>
      )}
    </Card>
  );
}