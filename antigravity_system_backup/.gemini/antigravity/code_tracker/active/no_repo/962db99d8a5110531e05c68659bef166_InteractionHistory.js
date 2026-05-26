�,import React from 'react';
import { Phone, Calendar, Clock, PlayCircle } from 'lucide-react';

/**
 * InteractionHistory
 * 
 * Displays a list of ClientInteraction entities.
 * Focuses on Call interactions and playing connected recordings.
 * 
 * Props:
 * - interactions: Array of ClientInteraction objects
 */
const InteractionHistory = ({ interactions = [] }) => {

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('sk-SK', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper to check for audio attachment
    const getAudioUrl = (attachments) => {
        if (!attachments || !Array.isArray(attachments)) return null;
        return attachments.find(att => att.endsWith('.mp3') || att.endsWith('.wav') || att.endsWith('.m4a'));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">História Interakcií</h3>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{interactions.length}</span>
            </div>

            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {interactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <p>Žiadne interakcie.</p>
                    </div>
                ) : (
                    interactions.map((interaction) => {
                        const audioUrl = getAudioUrl(interaction.attachments);

                        return (
                            <div key={interaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${interaction.interaction_type === 'call' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 text-sm">{interaction.subject}</h4>
                                            <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
                                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {formatDate(interaction.interaction_date)}</span>
                                                {interaction.duration_minutes && (
                                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {interaction.duration_minutes} min</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${interaction.outcome === 'successful' ? 'bg-green-50 text-green-700 border-green-200' :
                                            interaction.outcome === 'not_interested' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                        {interaction.outcome || 'N/A'}
                                    </span>
                                </div>

                                {interaction.description && (
                                    <p className="text-sm text-gray-600 mb-3 pl-11">{interaction.description}</p>
                                )}

                                {/* Audio Player if recording exists */}
                                {audioUrl && (
                                    <div className="ml-11 bg-gray-100 rounded-md p-2 flex items-center space-x-3 border border-gray-200">
                                        <div className="flex-shrink-0">
                                            <PlayCircle className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="w-full">
                                            <audio controls className="w-full h-8" preload="none">
                                                <source src={audioUrl} />
                                                Váš prehliadač nepodporuje audio element.
                                            </audio>
                                        </div>
                                    </div>
                                )}

                                {/* AI Insights Tag */}
                                {interaction.ai_suggestions && (
                                    <div className="mt-2 ml-11 p-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-800">
                                        <strong>AI Insight:</strong> {interaction.ai_suggestions}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default InteractionHistory;
�,*cascade082dfile:///Users/richardkovac/Documents/Konfiga_ARES_Extension/ui_components_ares/InteractionHistory.js