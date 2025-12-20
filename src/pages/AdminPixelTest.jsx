import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Activity, ShoppingCart, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminPixelTest() {
  const [pixelDetected, setPixelDetected] = useState(false);
  const [pixelId, setPixelId] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Check if fbq is loaded
    if (window.fbq) {
      setPixelDetected(true);
      // Try to extract pixel ID from fbq object
      if (window._fbq && window._fbq.instance && window._fbq.instance.pixelId) {
        setPixelId(window._fbq.instance.pixelId);
      }
    }

    // Listen for fbq calls
    const originalFbq = window.fbq;
    if (originalFbq) {
      window.fbq = function(...args) {
        setEvents(prev => [...prev, { time: new Date().toISOString(), args }]);
        return originalFbq.apply(this, args);
      };
    }
  }, []);

  const fireTestEvent = (eventName) => {
    if (window.fbq) {
      window.fbq('track', eventName);
      toast.success(`🔥 Event fired: ${eventName}`);
    } else {
      toast.error('❌ fbq not found');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meta Pixel Diagnostics</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pixel Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {pixelDetected ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-700">✅ Pixel Detected</p>
                      <p className="text-xs text-gray-600">window.fbq is available</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-bold text-red-700">❌ Pixel NOT Detected</p>
                      <p className="text-xs text-gray-600">window.fbq is undefined</p>
                    </div>
                  </>
                )}
              </div>

              {pixelId && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm">
                    <strong>Pixel ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{pixelId}</code>
                  </p>
                </div>
              )}

              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-700">
                  <strong>Script Check:</strong> Open DevTools Console and type <code>window.fbq</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={() => fireTestEvent('ViewContent')} className="bg-blue-600">
                <Activity className="w-4 h-4 mr-2" />
                ViewContent
              </Button>
              <Button onClick={() => fireTestEvent('AddToCart')} className="bg-green-600">
                <ShoppingCart className="w-4 h-4 mr-2" />
                AddToCart
              </Button>
              <Button onClick={() => fireTestEvent('Search')} className="bg-purple-600">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button onClick={() => fireTestEvent('Lead')} className="bg-orange-600">
                Lead
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Click these buttons to fire test events. Check Facebook Events Manager → Test Events.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No events fired yet</p>
              ) : (
                events.map((event, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded border text-xs font-mono">
                    <Badge className="mb-1">{event.time}</Badge>
                    <div>fbq({event.args.map(a => JSON.stringify(a)).join(', ')})</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}