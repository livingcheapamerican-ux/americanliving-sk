³(import React from 'react';
import { Save, Send } from 'lucide-react';

/**
 * ConfigurationSummary
 * 
 * Sidebar panel showing the financial summary.
 * Calculates totals and applies discounts.
 * Provides actions to save or submit the configuration.
 * 
 * Props:
 * - items: Array of configuration items
 * - discountPercentage: number
 * - onDiscountChange: (percentage) => void
 * - onSave: () => void
 * - onSubmit: () => void
 */
const ConfigurationSummary = ({
    items = [],
    discountPercentage = 0,
    onDiscountChange,
    onSave,
    onSubmit
}) => {

    // Calculate specific metrics
    const subtotal = items.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 1)), 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    const total = subtotal - discountAmount;
    const itemCount = items.reduce((count, item) => count + (item.quantity || 1), 0);

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-10">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                <p className="text-sm text-gray-500 mt-1">{itemCount} items in configuration</p>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Cost Breakdown */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Discount</span>
                        <div className="flex items-center w-24">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discountPercentage}
                                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                                className="w-full text-right p-1 border border-gray-300 rounded text-xs mr-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <span>%</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm text-red-500">
                        <span>Discount Amount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex justify-between items-end">
                        <span className="text-base font-semibold text-gray-900">Total Price</span>
                        <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Project Details / Metadata (Optional placeholder) */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Configuration Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">Draft</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Version</span>
                            <span className="text-gray-900">v1.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                </button>
                <button
                    onClick={onSubmit}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Offer
                </button>
            </div>
        </div>
    );
};

export default ConfigurationSummary;
³(*cascade082ifile:///Users/richardkovac/Documents/Konfiga_ARES_Extension/ui_components_konfiga/ConfigurationSummary.js