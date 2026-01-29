import React, { useState, useEffect } from 'react';
import { Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CoverLetterModal } from './CoverLetterModal';

interface AnalysisOverlayProps {
    initialStep?: 'loading' | 'results' | 'error';
    onClose?: () => void;
    analysisData?: any;
}

const Gauge: React.FC<{ score: number }> = ({ score }) => {
    const val = Math.max(0, Math.min(100, score));
    const rotation = (val / 100) * 180;

    let arcColor = '#ef4444';
    if (val >= 60) arcColor = '#06b6d4';
    else if (val >= 40) arcColor = '#f59e0b';

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const circumference = Math.PI * radius;
    const fillLength = (val / 100) * circumference;
    const emptyLength = circumference - fillLength;

    const tickMarks = [];
    for (let i = 0; i <= 100; i += 5) {
        const angle = (Math.PI / 180) * (-180 + (i / 100) * 180);
        const isMajor = i % 20 === 0;
        const innerR = radius - (isMajor ? 10 : 5);
        const x1 = centerX + innerR * Math.cos(angle);
        const y1 = centerY + innerR * Math.sin(angle);
        const x2 = centerX + radius * Math.cos(angle);
        const y2 = centerY + radius * Math.sin(angle);
        const color = i <= val ? arcColor : '#374151';
        tickMarks.push(
            <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color} strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
            />
        );
    }

    return (
        <div className="w-[200px] h-[120px] mx-auto">
            <svg viewBox="0 0 200 120">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <path d="M 20,100 A 80,80 0 0,1 180,100" fill="none" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
                <path
                    d="M 20,100 A 80,80 0 0,1 180,100"
                    fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${fillLength} ${emptyLength}`}
                    filter="url(#glow)"
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                />
                {tickMarks}
                <g
                    transform={`rotate(${rotation - 180}, ${centerX}, ${centerY})`}
                    style={{ transition: 'transform 1s ease-in-out' }}
                >
                    <line x1={centerX} y1={centerY} x2={centerX + 70} y2={centerY} stroke={arcColor} strokeWidth="3" strokeLinecap="round" />
                    <circle cx={centerX} cy={centerY} r="4" fill={arcColor} />
                </g>
                <text x="20" y="115" fontSize="8" fill="#9ca3af" textAnchor="middle">0</text>
                <text x="180" y="115" fontSize="8" fill="#9ca3af" textAnchor="middle">100</text>
            </svg>
        </div>
    );
};

const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ initialStep = 'loading', onClose, analysisData }) => {
    const [step, setStep] = useState(initialStep);
    useEffect(() => { setStep(initialStep); }, [initialStep]);
    const [elapsedTime, setElapsedTime] = useState(0.0);
    const [finalTime, setFinalTime] = useState(0.0);

    // Section Collapse States (Minimized by default)
    const [isSkillsExpanded, setIsSkillsExpanded] = useState(true);
    const [isImprovementsExpanded, setIsImprovementsExpanded] = useState(true);
    const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);

    // Timer Effect
    useEffect(() => {
        let interval: any;
        if (step === 'loading') {
            const start = Date.now();
            interval = setInterval(() => {
                const now = (Date.now() - start) / 1000;
                setElapsedTime(now);
                setFinalTime(now);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [step]);

    // Shared Container Styles matching sharedUI.js
    const containerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        borderRadius: '16px',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        maxWidth: '600px',
        maxHeight: '90vh',
    };

    if (step === 'loading') {
        return (
            <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
                <div
                    style={containerStyle}
                    className="w-full p-10 flex flex-col items-center transition-all animate-in fade-in zoom-in duration-300"
                >
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-emerald-500 rounded-full animate-spin mb-6" />
                    <p className="text-gray-400 text-sm font-medium mb-3">Analyzing your resume against this job...</p>
                    <p className="text-emerald-400 font-mono text-xs font-bold px-3 py-1 bg-emerald-950/50 border border-emerald-900 rounded-full">
                        {elapsedTime.toFixed(1)}s
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
                <div
                    style={containerStyle}
                    className="w-full p-8 text-center animate-in fade-in zoom-in duration-300"
                >
                    <div className="text-red-500 mb-4 flex justify-center">
                        <X size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-50 mb-3">Analysis Failed</h3>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        {typeof analysisData === 'string' ? analysisData : 'An unexpected error occurred during analysis.'}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-200 font-semibold rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // Results Step - Matching renderAnalysisUI from sharedUI.js
    const score = analysisData?.similarity_comparison ? Math.round(analysisData.similarity_comparison) : 0;
    const skillComparison = analysisData?.skill_comparison || [];
    const matchedSkills = skillComparison.filter((s: any) => s.resume_mentions > 0);
    const missingSkills = skillComparison.filter((s: any) => s.resume_mentions === 0);
    const improvements = analysisData?.improvements || [];

    return (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
            <style>
                {`
                    .cf-sleek-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(156, 163, 175, 0.5);
                        border-radius: 20px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .cf-sleek-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(156, 163, 175, 0.8);
                        background-clip: padding-box;
                    }
                `}
            </style>
            <div
                style={containerStyle}
                className="w-full relative flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden"
            >
                {/* Header with Close Button - Sticky */}
                <div className="flex justify-between items-start p-6 pb-2 shrink-0">
                    <h2 className="text-xl font-bold text-gray-50 flex items-center gap-3 pr-8">
                        Analyzing your Resume
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700 text-[11px] font-mono text-gray-400">
                            ⏱️ {finalTime.toFixed(1)}s
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-2 cf-sleek-scrollbar flex flex-col">
                    {/* Gauge Section */}
                    <div className="flex flex-col items-center mb-8 shrink-0">
                        <Gauge score={score} />
                        <div className="text-center -mt-2">
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Match Score</div>
                            <div className="text-4xl font-extrabold text-white">{score}%</div>
                        </div>
                    </div>

                    {/* Skill Analysis */}
                    <div className="bg-gray-900/40 rounded-xl mb-4 border border-gray-800/50 overflow-hidden shrink-0">
                        <button
                            onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                        >
                            <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Skill Analysis
                            </h4>
                            {isSkillsExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                        </button>

                        {isSkillsExpanded && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {matchedSkills.length > 0 ? matchedSkills.map((s: any, i: number) => (
                                        <span key={i} className="px-2.5 py-1 bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs rounded-lg font-medium">
                                            {s.skill} <span className="text-[10px] ml-1 opacity-70">{s.resume_mentions}✓</span>
                                        </span>
                                    )) : (
                                        <span className="text-gray-500 text-xs italic">No matching skills found</span>
                                    )}
                                </div>

                                {missingSkills.length > 0 && (
                                    <>
                                        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 mt-4">Missing Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {missingSkills.map((s: any, i: number) => (
                                                <span key={i} className="px-2.5 py-1 bg-gray-900/50 border border-gray-800 text-gray-400 text-xs rounded-lg font-medium">
                                                    {s.skill}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Improvements */}
                    {improvements.length > 0 && (
                        <div className="bg-gray-900/40 rounded-xl mb-6 border border-gray-800/50 overflow-hidden shrink-0">
                            <button
                                onClick={() => setIsImprovementsExpanded(!isImprovementsExpanded)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                            >
                                <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Suggested Improvements
                                </h4>
                                {isImprovementsExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                            </button>

                            {isImprovementsExpanded && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                    <ul className="space-y-3">
                                        {improvements.map((imp: any, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-gray-300 leading-relaxed">
                                                <span className="mt-1 text-emerald-500/50 flex-shrink-0">•</span>
                                                {imp.suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-800/50 shrink-0">
                        <button
                            onClick={() => setStep('loading')}
                            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            Analyze Again
                        </button>
                        <button
                            onClick={() => setIsCoverLetterOpen(true)}
                            className="flex-1 py-3 px-4 bg-gray-800/50 border border-gray-700 text-gray-100 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-gray-800"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            Cover Letter
                        </button>
                    </div>
                </div>

                {isCoverLetterOpen && (
                    <CoverLetterModal
                        isOpen={isCoverLetterOpen}
                        onClose={() => setIsCoverLetterOpen(false)}
                        jobId={analysisData?.job_id}
                        resumeId={analysisData?.resume_id}
                    />
                )}
            </div>
        </div>
    );
};

export default AnalysisOverlay;
