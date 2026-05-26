‚%import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';

/**
 * ComponentLibrary
 * 
 * Displays a list of available Konfiga components.
 * Includes search functionality.
 * Allows adding components to the current configuration.
 * 
 * Props:
 * - onAddComponent: (component) => void
 */
const ComponentLibrary = ({ onAddComponent }) => {
    const [components, setComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Simulated fetch from Base44 SDK
    useEffect(() => {
        const fetchComponents = async () => {
            setLoading(true);
            try {
                // In real app: await base44.entities.Konfiga_Component.list()
                // Mock data for demonstration based on schema
                const mockData = [
                    { id: '1', component_name: 'Premium Widget A', sku: 'WGT-A', price: 150.00, category: 'Widgets', description: 'High quality widget' },
                    { id: '2', component_name: 'Standard Widget B', sku: 'WGT-B', price: 99.50, category: 'Widgets', description: 'Standard widget' },
                    { id: '3', component_name: 'Deluxe Gadget X', sku: 'GDT-X', price: 299.99, category: 'Gadgets', description: 'Feature rich gadget' },
                    { id: '4', component_name: 'Basic Gadget Y', sku: 'GDT-Y', price: 49.99, category: 'Gadgets', description: 'Entry level gadget' },
                ];
                setComponents(mockData);
            } catch (error) {
                console.error("Failed to fetch components", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComponents();
    }, []);

    const filteredComponents = components.filter(comp =>
        comp.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Component Library</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search components..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="text-center text-gray-500 py-4">Loading...</div>
                ) : (
                    filteredComponents.map(comp => (
                        <div key={comp.id} className="group flex flex-col p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-medium text-gray-900">{comp.component_name}</h3>
                                    <span className="text-xs text-gray-500">{comp.sku}</span>
                                </div>
                                <span className="font-semibold text-blue-600">${comp.price.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{comp.description}</p>
                            <button
                                onClick={() => onAddComponent(comp)}
                                className="mt-auto flex items-center justify-center w-full py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 text-sm font-medium rounded-md transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Config
                            </button>
                        </div>
                    ))
                )}
                {!loading && filteredComponents.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No components found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComponentLibrary;
‚%*cascade082efile:///Users/richardkovac/Documents/Konfiga_ARES_Extension/ui_components_konfiga/ComponentLibrary.js