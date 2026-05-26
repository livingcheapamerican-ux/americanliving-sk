�[import React, { useState, useRef, useEffect } from 'react';
import { Send, Wand2, RefreshCw, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';

/**
 * MarketingStudio
 * 
 * Central hub for "Social Autopilot".
 * Allows marketers/agents to:
 * 1. Visualize property transformations (Before/After slider).
 * 2. Generate and edit AI marketing content (Gemini integration point).
 * 3. Publish content to social media via Webhooks.
 */
const MarketingStudio = () => {
    // State for Before/After Slider
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);

    // State for Content Editor
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // Mock Images (In production, these would come from project assets)
    // Using placeholders for visualization
    const beforeImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"; // Corporate/Old
    const afterImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop"; // Modern/New

    const sliderRef = useRef(null);

    // Handle Dragging for Slider
    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);
    const handleMouseMove = (e) => {
        if (!isResizing || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isResizing]);

    // Simulate AI Generation
    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate API delay
        setTimeout(() => {
            setGeneratedContent(
                `🏡 **PREDSTAVUJEME: Projekt Andromeda**

Objavte dostupnú budúcnosť bývania! Náš najnovší projekt kombinuje moderný dizajn s maximálnou efektivitou.

✅ Energetická trieda A0
✅ Komunitné záhrady
✅ Bezkonkurenčná cena v lokalite

"Domov nie je len miesto, je to pocit istoty." ❤️

#Andromeda #DostupneByvanie #NovyDomov #RealitnyTrh #Inovacia`
            );
            setIsGenerating(false);
            setIsPublished(false);
        }, 1500);
    };

    const handlePublish = () => {
        // Logic to trigger webhook would go here
        setIsPublished(true);
        setTimeout(() => setIsPublished(false), 3000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Marketing Studio</h1>
                        <p className="text-xs text-slate-500">Social Autopilot v2.0</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Assets</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* Left Panel: Visual Studio (Before/After) */}
                <div className="w-2/3 p-6 flex flex-col overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex-1 min-h-[500px] flex flex-col relative overflow-hidden group">

                        {/* Before/After Container */}
                        <div
                            ref={sliderRef}
                            className="relative w-full h-full rounded-xl overflow-hidden cursor-ew-resize select-none"
                            onMouseDown={handleMouseDown}
                        >
                            {/* Image "After" (Background) */}
                            <img
                                src={afterImage}
                                alt="After"
                                className="absolute top-0 left-0 w-full h-full object-cover"
                                draggable="false"
                            />

                            {/* Image "Before" (Foreground, Clipped) */}
                            <div
                                className="absolute top-0 left-0 h-full w-full overflow-hidden"
                                style={{ width: `${sliderPosition}%` }}
                            >
                                <img
                                    src={beforeImage}
                                    alt="Before"
                                    className="absolute top-0 left-0 w-full h-full object-cover max-w-none"
                                    style={{ width: sliderRef.current ? sliderRef.current.clientWidth : '100%' }}
                                    draggable="false"
                                />
                                {/* Label Badge */}
                                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                    TRADIČNÉ / PÔVODNÉ
                                </div>
                            </div>

                            {/* Badge for "After" */}
                            <div className="absolute bottom-4 right-4 bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                MODERNÉ / NOVÉ
                            </div>

                            {/* Slider Handle */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center"
                                style={{ left: `${sliderPosition}%` }}
                            >
                                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transform -translate-x-[2px]">
                                    <div className="flex space-x-[2px]">
                                        <div className="w-0.5 h-3 bg-slate-400"></div>
                                        <div className="w-0.5 h-3 bg-slate-400"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                        <span>Projekt: <strong>Sky Park Residence</strong> (Andromeda Strategy Active)</span>
                        <span className="flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4" />
                            <span>Resolution: 4K Ultra HD</span>
                        </span>
                    </div>
                </div>

                {/* Right Panel: Content & Strategy */}
                <div className="w-1/3 bg-white border-l border-slate-200 flex flex-col z-20 shadow-xl">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Gemini Content Engine</h3>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Generating Strategy...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4" />
                                    <span>Generate Campaign</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Campaign Draft</label>
                        <textarea
                            className="w-full h-full min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                            placeholder="Click 'Generate Campaign' to let Gemini draft your content..."
                            value={generatedContent}
                            onChange={(e) => setGeneratedContent(e.target.value)}
                        />
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200">
                        <button
                            onClick={handlePublish}
                            disabled={!generatedContent}
                            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm shadow-sm transition-all transform active:scale-95 ${isPublished
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isPublished ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Published Successfully!</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Publish to Social Networks</span>
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-3">
                            Connects to Meta API & LinkedIn via n8n Webhook
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MarketingStudio;
�[*cascade082ffile:///Users/richardkovac/Documents/Konfiga_ARES_Extension/ui_components_marketing/MarketingStudio.js