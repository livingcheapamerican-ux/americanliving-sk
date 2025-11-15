import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function DeepDiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTests, setExpandedTests] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const runDeepDiagnostics = async () => {
    setIsRunning(true);
    try {
      const response = await base44.functions.invoke('googleDriveDiagnostics');
      setDiagnostics(response.data);
      // Expand failed tests by default
      const failedTests = new Set();
      Object.entries(response.data.tests).forEach(([testName, testResult]) => {
        if (!testResult.passed) {
          failedTests.add(testName);
        }
      });
      setExpandedTests(failedTests);
    } catch (error) {
      console.error('Diagnostics error:', error);
      setDiagnostics({
        error: error.message,
        summary: { total: 0, passed: 0, failed: 1, warnings: 0 }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleTest = (testName) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testName)) {
        newSet.delete(testName);
      } else {
        newSet.add(testName);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (test) => {
    if (test.passed) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (test.warning) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (test) => {
    if (test.passed) return "bg-green-50 border-green-200";
    if (test.warning) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Run Button */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🔬 Komplexná diagnostika</h2>
            <p className="text-sm text-gray-600">
              Hlboká analýza všetkých aspektov Google Drive integrácie
            </p>
          </div>
          <Button
            onClick={runDeepDiagnostics}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Analyzujem...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Spustiť diagnostiku
              </>
            )}
          </Button>
        </div>

        {diagnostics && (
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
              <div className="text-3xl font-bold text-gray-800">{diagnostics.summary.total}</div>
              <div className="text-sm text-gray-600">Celkom testov</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 text-center">
              <div className="text-3xl font-bold text-green-600">{diagnostics.summary.passed}</div>
              <div className="text-sm text-green-700">Úspešných</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 text-center">
              <div className="text-3xl font-bold text-yellow-600">{diagnostics.summary.warnings}</div>
              <div className="text-sm text-yellow-700">Upozornení</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200 text-center">
              <div className="text-3xl font-bold text-red-600">{diagnostics.summary.failed}</div>
              <div className="text-sm text-red-700">Zlyhalo</div>
            </div>
          </div>
        )}
      </Card>

      {/* Recommendations */}
      {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300">
          <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            💡 Odporúčania
          </h3>
          <div className="space-y-3">
            {diagnostics.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 border-2 border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                    {rec.priority}
                  </Badge>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 mb-2">{rec.issue}</h4>
                    <p className="text-sm text-gray-700 mb-2">{rec.action}</p>
                    {rec.note && (
                      <p className="text-xs text-gray-500 italic">💡 {rec.note}</p>
                    )}
                    {rec.documentation && (
                      <a
                        href={rec.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Dokumentácia
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Test Results */}
      {diagnostics?.tests && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-800">📊 Výsledky testov</h3>
          {Object.entries(diagnostics.tests).map(([testName, testResult], index) => (
            <motion.div
              key={testName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 border-2 ${getStatusColor(testResult)}`}>
                <button
                  onClick={() => toggleTest(testName)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(testResult)}
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {testResult.name || testName}
                      </h4>
                      {testResult.issues && testResult.issues.length > 0 && (
                        <p className="text-sm text-red-700 mt-1">
                          {testResult.issues.length} problém(ov)
                        </p>
                      )}
                    </div>
                  </div>
                  {expandedTests.has(testName) ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {expandedTests.has(testName) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-3"
                  >
                    {/* Issues */}
                    {testResult.issues && testResult.issues.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border">
                        <h5 className="font-semibold text-red-700 mb-2">⚠️ Problémy:</h5>
                        <ul className="space-y-1 text-sm text-red-800">
                          {testResult.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Details */}
                    {testResult.details && Object.keys(testResult.details).length > 0 && (
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-700">📋 Detaily:</h5>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(JSON.stringify(testResult.details, null, 2))}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {copied ? 'Skopírované!' : 'Kopírovať'}
                          </Button>
                        </div>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64 border">
                          {JSON.stringify(testResult.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Error */}
                    {testResult.error && (
                      <div className="bg-red-100 rounded-lg p-3 border border-red-300">
                        <h5 className="font-semibold text-red-700 mb-2">❌ Chyba:</h5>
                        <p className="text-sm text-red-800 font-mono">{testResult.error}</p>
                        {testResult.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                            <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-32">
                              {testResult.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Raw Data */}
      {diagnostics && (
        <details className="bg-gray-50 rounded-lg p-4 border">
          <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
            🗂️ Kompletné dáta diagnostiky (JSON)
          </summary>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96 mt-3">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}