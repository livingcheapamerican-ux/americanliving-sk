»+import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

/**
 * ConfigurationWorkspace
 * 
 * Main workspace area where selected items are displayed.
 * Allows adjusting quantities and removing items.
 * 
 * Props:
 * - items: Array of configuration items
 * - onUpdateQuantity: (itemId, newQuantity) => void
 * - onRemoveItem: (itemId) => void
 */
const ConfigurationWorkspace = ({ items = [], onUpdateQuantity, onRemoveItem }) => {
    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-medium">Your configuration is empty</p>
                <p className="text-sm">Select components from the library to get started</p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Current Configuration</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Quantity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{item.component_name}</span>
                                            <span className="text-xs text-gray-500">{item.sku}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                                                className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-medium text-gray-900">{item.quantity || 1}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                                className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                                        ${(item.unit_price || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                        ${((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onRemoveItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationWorkspace;
»+*cascade082kfile:///Users/richardkovac/Documents/Konfiga_ARES_Extension/ui_components_konfiga/ConfigurationWorkspace.js