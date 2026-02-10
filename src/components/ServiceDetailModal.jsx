import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export default function ServiceDetailModal({ isOpen, onClose, service }) {
  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <service.icon className="w-6 h-6 text-white" />
            </div>
            {service.nazov}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Headline */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {service.headline}
            </h3>
          </div>

          {/* Images */}
          {service.detailImages && service.detailImages.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {service.detailImages.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={img} 
                    alt={`${service.nazov} - ${idx + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Body Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {service.body}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <a href="tel:+421905138124" className="flex-1">
              <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all text-lg">
                📞 Zavolať: +421 905 138 124
              </button>
            </a>
            <a href={`mailto:info@americanliving.sk?subject=${encodeURIComponent(service.nazov)}`} className="flex-1">
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all">
                ✉️ Napísať e-mail
              </button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}