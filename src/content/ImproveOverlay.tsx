import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import ResumeImprovementModal from './ResumeImprovementModal';

interface AnalysisOverlayProps {
    initialStep?: 'loading' | 'analyzing' | 'results' | 'error';
    rootContainer?: ShadowRoot;
    onClose?: () => void;
    analysisData?: any;
}

const ImproveOverlay: React.FC<AnalysisOverlayProps> = ({ initialStep = 'loading', rootContainer, onClose, analysisData }) => {
    const [step, setStep] = useState(initialStep);
    useEffect(() => { setStep(initialStep); }, [initialStep]);

    const [isVisible, setIsVisible] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0.0);

    // Mock Timer Effect
    useEffect(() => {
        let interval: any;
        if (step === 'loading' || step === 'analyzing') {
            const start = Date.now();
            interval = setInterval(() => {
                setElapsedTime((Date.now() - start) / 1000);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [step]);

    // Handle Closing
    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    // Shared Container Styles matching legacy glassmorphism
    const containerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        borderRadius: '16px',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        maxWidth: '800px', // Wider for the rich view
        maxHeight: '95vh',
        height: '90vh',
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans text-gray-50">
            <style>
                {`
                    .cf-sleek-scrollbar::-webkit-scrollbar {
                        width: 5px;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(107, 114, 128, 0.4);
                        border-radius: 10px;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(107, 114, 128, 0.6);
                    }
                `}
            </style>
            <div
                style={containerStyle}
                className="w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 cf-sleek-scrollbar"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-3">
                        Improved Resume for this Job
                        {step === 'loading' && (
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
                                {elapsedTime.toFixed(1)}s
                            </span>
                        )}
                        {step === 'results' && (
                            <span className="text-xs font-bold bg-emerald-950/30 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/40">
                                Match Score improved from {analysisData?.similarity_comparison ? Math.round(analysisData.similarity_comparison) : 85}% to {analysisData?.similarity_comparison ? Math.round(analysisData.similarity_comparison + (analysisData.new_score * 100 - analysisData.original_score * 100)) : 85}%
                            </span>
                        )}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 relative cf-sleek-scrollbar">
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                            <p className="text-gray-400 font-medium">Analyzing job description and your profile...</p>
                        </div>
                    )}

                    {step === 'results' && (
                        <div className="space-y-6">
                            {/* Score badge moved to header */}
                            <div className="pt-2">
                                {/* Improvement Modal Component */}
                                <ResumeImprovementModal data={analysisData} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ImproveOverlay;
