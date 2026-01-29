import React, { useEffect, useState } from 'react';
import { generateResumePDF } from './resume-pdf';
import { StructuredResume } from '../lib/schemas/resume';
import { Loader2 } from 'lucide-react';

interface PdfPreviewProps {
    data: any;
    template: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ data, template }) => {
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generate = async () => {
            if (!data || !data.resume_preview) return;

            try {
                setLoading(true);
                setError(null);

                // Ensure data matches StructuredResume interface
                const resumeData: StructuredResume = data.resume_preview;

                const blob = await generateResumePDF(resumeData, undefined, template);
                setPdfBlob(blob);
            } catch (err: any) {
                console.error("PDF Generation Error:", err);
                setError(err.message || "Failed to generate PDF");
            } finally {
                setLoading(false);
            }
        };

        generate();
    }, [data, template]);

    if (!data?.resume_preview) {
        return <div className="text-gray-400">No resume preview data available.</div>;
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-emerald-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    if (error) {
        return <div className="text-red-400 p-4">Error: {error}</div>;
    }

    if (!pdfBlob) return null;

    const url = URL.createObjectURL(pdfBlob);

    return (
        <div className="w-full h-[600px] bg-gray-700 rounded-lg overflow-hidden relative">
            <iframe src={url} className="w-full h-full border-none" title="Resume Preview" />
        </div>
    );
};
