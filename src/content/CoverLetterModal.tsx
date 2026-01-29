import React, { useState, useEffect } from 'react';
import { Loader2, FileDown, X } from 'lucide-react';
import { apiService } from '../services/api';
import { QuillEditor, type QuillEditorHandle } from './quill-editor';
import { toast } from 'sonner';

interface CoverLetterModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    resumeId: string;
}

export function CoverLetterModal({ isOpen, onClose, jobId, resumeId }: CoverLetterModalProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const editorRef = React.useRef<QuillEditorHandle>(null);

    useEffect(() => {
        if (isOpen && resumeId && jobId) {
            generateCoverLetter();
        }
    }, [isOpen, resumeId, jobId]);

    const generateCoverLetter = async () => {
        try {
            setLoading(true);
            const response = await apiService.getCoverLetter(jobId, resumeId);

            if (response.success && response.cover_letter) {
                setContent(response.cover_letter);
            } else {
                console.error("Failed to generate cover letter:", response.message);
                toast.error(response.message || "Failed to generate cover letter");
                setContent("Failed to generate cover letter. Please try again.");
            }
        } catch (error) {
            console.error("Error generating cover letter:", error);
            toast.error("An error occurred while generating the cover letter");
            setContent("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const quill = editorRef.current?.getQuill();

            if (!quill) {
                toast.error("Editor not ready");
                return;
            }

            const loadingToast = toast.loading("Generating PDF...");
            const delta = quill.getContents();

            chrome.runtime.sendMessage({
                type: 'GENERATE_COVER_LETTER_PDF',
                delta,
                content
            }, (response) => {
                if (chrome.runtime.lastError) {
                    toast.error(chrome.runtime.lastError.message, { id: loadingToast });
                    return;
                }

                if (response && response.success && response.data) {
                    // Convert base64 data URL back to Blob and download
                    fetch(response.data)
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'cover-letter.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            toast.success("Downloaded as PDF", { id: loadingToast });
                        })
                        .catch(err => {
                            toast.error("Failed to process PDF data", { id: loadingToast });
                        });
                } else {
                    toast.error(response?.error || 'Failed to generate PDF', { id: loadingToast });
                }
            });
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error("Failed to download PDF");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
            <div className="bg-gray-900/98 border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Cover Letter Generator</h2>
                        <p className="text-gray-400 text-sm mt-1">Review and edit your AI-generated cover letter.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownloadPdf}
                            disabled={loading || !content}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${loading || !content
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                                }`}
                        >
                            <FileDown size={18} />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-gray-400 font-medium">Generating your cover letter...</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 border border-white/5 rounded-xl bg-black/20">
                            <QuillEditor
                                ref={editorRef}
                                value={content}
                                onChange={setContent}
                                className="border-none"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
