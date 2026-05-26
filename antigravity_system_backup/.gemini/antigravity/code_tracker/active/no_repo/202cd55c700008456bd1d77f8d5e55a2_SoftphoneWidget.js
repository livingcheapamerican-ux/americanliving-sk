Æ8import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Delete, User } from 'lucide-react';

/**
 * SoftphoneWidget
 * 
 * A.R.E.S. Dialer and Call Control Widget.
 * Designed to be embedded in the Client Detail view.
 * 
 * Features:
 * - Numeric Keypad & Input
 * - Call / Hangup toggle
 * - Call Recording toggle (On-Demand)
 * - Call Timer
 * 
 * Props:
 * - initialPhoneNumber: string (optional)
 * - onCallStart: (number) => void
 * - onCallEnd: (duration, isRecorded) => void
 */
const SoftphoneWidget = ({ initialPhoneNumber = '', onCallStart, onCallEnd }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [isCalling, setIsCalling] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isCalling) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [isCalling]);

    const handleNumberClick = (num) => {
        if (!isCalling) {
            setPhoneNumber(prev => prev + num);
        }
    };

    const handleDelete = () => {
        if (!isCalling) {
            setPhoneNumber(prev => prev.slice(0, -1));
        }
    };

    const toggleCall = () => {
        if (isCalling) {
            // Hangup
            if (onCallEnd) onCallEnd(callDuration, isRecording);
            setIsCalling(false);
            setIsRecording(false);
        } else {
            // Start Call
            if (phoneNumber.trim() === '') return;
            if (onCallStart) onCallStart(phoneNumber);
            setIsCalling(true);
        }
    };

    const toggleRecording = () => {
        if (isCalling) {
            setIsRecording(!isRecording);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="w-80 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 font-sans text-white">
            {/* Header / Display */}
            <div className="bg-slate-800 p-6 flex flex-col items-center justify-center h-40 transition-all relative">
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {isCalling && (
                        <div className="flex items-center space-x-1 animate-pulse">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-400 font-medium">LIVE</span>
                        </div>
                    )}
                </div>

                {isCalling ? (
                    <div className="flex flex-col items-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-3">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold tracking-wide">{phoneNumber}</h3>
                        <span className="text-slate-400 text-sm mt-1">{formatDuration(callDuration)}</span>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center h-full">
                        <input
                            type="text"
                            value={phoneNumber}
                            readOnly
                            className="bg-transparent text-3xl font-light text-center w-full focus:outline-none placeholder-slate-600"
                            placeholder="Enter number..."
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-slate-900">
                {!isCalling && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleNumberClick(key.toString())}
                                className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl font-medium transition-colors ring-1 ring-white/5 active:scale-95"
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-6 mt-2">
                    {!isCalling && (
                        <button
                            onClick={handleDelete}
                            className="p-4 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    )}

                    <button
                        onClick={toggleCall}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isCalling
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                            }`}
                    >
                        {isCalling ? <PhoneOff className="w-8 h-8 text-white" /> : <Phone className="w-8 h-8 text-white ml-1" />}
                    </button>

                    {isCalling && (
                        <button
                            onClick={toggleRecording}
                            className={`p-4 rounded-full transition-all border-2 ${isRecording
                                    ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse'
                                    : 'bg-slate-800 border-transparent text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            title={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            <Mic className={`w-6 h-6 ${isRecording ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Status */}
            <div className="bg-slate-950 px-4 py-2 flex justify-between items-center text-xs text-slate-500">
                <span>A.R.E.S. v1.0</span>
                <span className={isCalling ? "text-green-500" : "text-slate-500"}>
                    {isCalling ? "Connected" : "Ready"}
                </span>
            </div>
        </div>
    );
};

export default SoftphoneWidget;
Æ8*cascade082afile:///Users/richardkovac/Documents/Konfiga_ARES_Extension/ui_components_ares/SoftphoneWidget.js