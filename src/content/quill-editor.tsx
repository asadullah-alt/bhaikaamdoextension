import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface QuillEditorHandle {
    getQuill: () => any;
}

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const QuillEditor = forwardRef<QuillEditorHandle, QuillEditorProps>(({ value, onChange, className }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        getQuill: () => ({
            getContents: () => ({
                ops: [{ insert: textareaRef.current?.value || '' }]
            }),
            getText: () => textareaRef.current?.value || ''
        })
    }));

    return (
        <div className={`flex flex-col h-full bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden ${className}`}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 w-full bg-transparent p-4 text-gray-200 text-sm leading-relaxed resize-none focus:outline-none cf-sleek-scrollbar"
                placeholder="Your AI-generated cover letter will appear here..."
            />
        </div>
    );
});
