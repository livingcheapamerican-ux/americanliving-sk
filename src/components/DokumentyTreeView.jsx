import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Image, Home, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DokumentyTreeView({ dokumenty, onViewDocument }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const isExpanded = (nodeId) => expandedNodes.has(nodeId);

  // Zostavenie stromovej štruktúry
  const buildTree = () => {
    const tree = {};

    dokumenty.forEach(dok => {
      const vyrobca = dok.vyrobca || "Neznámy výrobca";
      const model = dok.model_domu || "Bez modelu";
      const kategoria = dok.podpriecinok || dok.typ || "Ostatné";

      if (!tree[vyrobca]) {
        tree[vyrobca] = {};
      }
      if (!tree[vyrobca][model]) {
        tree[vyrobca][model] = {};
      }
      if (!tree[vyrobca][model][kategoria]) {
        tree[vyrobca][model][kategoria] = [];
      }

      tree[vyrobca][model][kategoria].push(dok);
    });

    return tree;
  };

  const tree = buildTree();

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return FileText;
    if (mimeType.includes('image')) return Image;
    return FileText;
  };

  const vyrobcaColors = {
    "American Living": "text-blue-600",
    "JAK Modules": "text-purple-600",
    "Ticab house": "text-green-600",
    "Prosto House": "text-orange-600",
    "Domki z Gór": "text-pink-600"
  };

  const typLabels = {
    cennik: "Cenníky",
    technická_špecifikácia: "Technické špecifikácie",
    návod: "Návody",
    certifikát: "Certifikáty",
    FAQ: "FAQ",
    blog: "Blog",
    fotky: "Fotky",
    iné: "Ostatné",
    exterior: "Exteriér",
    interior: "Interiér",
    pôdorysy: "Pôdorysy",
    "Bez modelu": "Všeobecné dokumenty"
  };

  return (
    <div className="space-y-2">
      {Object.entries(tree).map(([vyrobca, modely]) => {
        const vyrobcaId = `vyrobca-${vyrobca}`;
        const vyrobcaExpanded = isExpanded(vyrobcaId);

        return (
          <div key={vyrobca} className="border rounded-lg bg-white">
            {/* Výrobca - Level 1 */}
            <button
              onClick={() => toggleNode(vyrobcaId)}
              className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors"
            >
              {vyrobcaExpanded ? (
                <ChevronDown className="w-5 h-5 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              )}
              {vyrobcaExpanded ? (
                <FolderOpen className={`w-5 h-5 flex-shrink-0 ${vyrobcaColors[vyrobca] || 'text-gray-600'}`} />
              ) : (
                <Folder className={`w-5 h-5 flex-shrink-0 ${vyrobcaColors[vyrobca] || 'text-gray-600'}`} />
              )}
              <span className={`font-semibold text-lg ${vyrobcaColors[vyrobca] || 'text-gray-800'}`}>
                {vyrobca}
              </span>
              <Badge variant="secondary" className="ml-2">
                {Object.values(modely).reduce((sum, kategorie) => 
                  sum + Object.values(kategorie).reduce((s, docs) => s + docs.length, 0), 0
                )} súborov
              </Badge>
            </button>

            <AnimatePresence>
              {vyrobcaExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 pb-2">
                    {Object.entries(modely).map(([model, kategorie]) => {
                      const modelId = `${vyrobcaId}-${model}`;
                      const modelExpanded = isExpanded(modelId);

                      return (
                        <div key={model} className="mb-2">
                          {/* Model domu - Level 2 */}
                          <button
                            onClick={() => toggleNode(modelId)}
                            className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors rounded"
                          >
                            {modelExpanded ? (
                              <ChevronDown className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 flex-shrink-0" />
                            )}
                            <Home className="w-4 h-4 flex-shrink-0 text-blue-600" />
                            <span className="font-medium text-gray-800">
                              {model === "Bez modelu" ? typLabels[model] : model}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {Object.values(kategorie).reduce((s, docs) => s + docs.length, 0)} súborov
                            </Badge>
                          </button>

                          <AnimatePresence>
                            {modelExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-6 mt-1">
                                  {Object.entries(kategorie).map(([kategoriaName, dokumenty]) => {
                                    const kategoriaId = `${modelId}-${kategoriaName}`;
                                    const kategoriaExpanded = isExpanded(kategoriaId);

                                    return (
                                      <div key={kategoriaName} className="mb-2">
                                        {/* Kategória/Podpriečinok - Level 3 */}
                                        <button
                                          onClick={() => toggleNode(kategoriaId)}
                                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors rounded"
                                        >
                                          {kategoriaExpanded ? (
                                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                          )}
                                          {kategoriaExpanded ? (
                                            <FolderOpen className="w-4 h-4 flex-shrink-0 text-amber-600" />
                                          ) : (
                                            <Folder className="w-4 h-4 flex-shrink-0 text-amber-600" />
                                          )}
                                          <span className="text-sm font-medium text-gray-700">
                                            {typLabels[kategoriaName] || kategoriaName}
                                          </span>
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            {dokumenty.length}
                                          </Badge>
                                        </button>

                                        <AnimatePresence>
                                          {kategoriaExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="pl-6 mt-1 space-y-1">
                                                {dokumenty.map(dok => {
                                                  const FileIcon = getFileIcon(dok.typ_suboru);
                                                  return (
                                                    <div
                                                      key={dok.id}
                                                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group"
                                                    >
                                                      <FileIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                                      <span className="text-sm text-gray-700 flex-grow truncate">
                                                        {dok.nazov}
                                                      </span>
                                                      <span className="text-xs text-gray-500 flex-shrink-0">
                                                        {formatFileSize(dok.velkost)}
                                                      </span>
                                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {dok.analyzovaný && (
                                                          <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => onViewDocument(dok)}
                                                            className="h-6 w-6 p-0"
                                                            title="Zobraziť analýzu"
                                                          >
                                                            <Eye className="w-3 h-3" />
                                                          </Button>
                                                        )}
                                                        <a
                                                          href={dok.subor_url}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          onClick={(e) => e.stopPropagation()}
                                                        >
                                                          <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0"
                                                            title="Stiahnuť"
                                                          >
                                                            <Download className="w-3 h-3" />
                                                          </Button>
                                                        </a>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {Object.keys(tree).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Žiadne dokumenty</p>
          <p className="text-sm">Nahrajte dokumenty pre zobrazenie stromovej štruktúry</p>
        </div>
      )}
    </div>
  );
}