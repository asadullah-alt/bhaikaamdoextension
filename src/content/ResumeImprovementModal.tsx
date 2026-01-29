import React, { useState } from 'react';
import { FileText, List, Eye, PencilLine } from 'lucide-react';
import { PdfPreview } from './PdfPreview';
import { generateResumePDF } from './resume-pdf';
import { CoverLetterModal } from './CoverLetterModal';

const ResumeImprovementModal: React.FC<{ data: any }> = ({ data }) => {
    const [view, setView] = useState<'details' | 'preview'>('details');
    const [template, setTemplate] = useState('classic');
    const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);



    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-800 mb-4 px-2">
                <div className="flex gap-4">
                    <button
                        onClick={() => setView('details')}
                        className={`pb-2 text-sm font-medium flex items-center gap-2 transition-colors ${view === 'details' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <List size={16} /> Analysis Details
                    </button>
                    <button
                        onClick={() => setView('preview')}
                        className={`pb-2 text-sm font-medium flex items-center gap-2 transition-colors ${view === 'preview' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Eye size={16} /> Resume Preview
                    </button>
                </div>

                {view === 'preview' && (
                    <div className="flex items-center gap-4 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Template:</span>
                            <select
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                className="bg-gray-800 border border-gray-700 text-xs rounded-md px-2 py-1 text-white focus:ring-1 focus:ring-emerald-500 outline-none h-8"
                            >
                                <option value="classic">Classic</option>
                                <option value="modern">Modern</option>
                                <option value="novo">Novo</option>
                                <option value="bold">Bold</option>
                                <option value="executive">Executive</option>
                            </select>
                        </div>
                        <button
                            onClick={async () => {
                                if (!data?.resume_preview) return;
                                try {
                                    const blob = await generateResumePDF(data.resume_preview, undefined, template);
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `Improved_Resume_${template}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                } catch (err) {
                                    console.error("Download error:", err);
                                    alert("Failed to download PDF");
                                }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 h-8"
                        >
                            <FileText size={12} /> DOWNLOAD PDF
                        </button>
                        <button
                            onClick={() => setIsCoverLetterOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 h-8"
                        >
                            <PencilLine size={12} /> COVER LETTER
                        </button>
                    </div>
                )}
            </div>

            {isCoverLetterOpen && (
                <CoverLetterModal
                    isOpen={isCoverLetterOpen}
                    onClose={() => setIsCoverLetterOpen(false)}
                    jobId={data?.job_id}
                    resumeId={data?.resume_id}
                />
            )}

            {/* View Content */}
            <div className="flex-1 min-h-[400px]">
                {view === 'details' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Summary */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <h3 className="text-sm font-semibold text-gray-200 mb-2">Summary</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {data?.summary || "No summary available."}
                            </p>
                        </div>

                        {/* Commentary */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <h3 className="text-sm font-semibold text-gray-200 mb-2">Commentary</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {data?.commentary || "No commentary available."}
                            </p>
                        </div>

                        {/* Improvements List */}
                        {data?.improvements && (
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                <h3 className="text-sm font-semibold text-gray-200 mb-2">Detailed Improvements</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                    {data.improvements.map((item: any, idx: number) => (
                                        <li key={idx}>{item.suggestion || item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {view === 'preview' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                        {/* Preview Area */}
                        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center p-1 overflow-hidden">
                            <PdfPreview data={data} template={template} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeImprovementModal;
