import { StructuredResume } from '../lib/schemas/resume'
import { PdfStyles, generateResumeHTML as generateResumeHTMLReal } from './resume-pdf-generator'

export type { PdfStyles }

/**
 * Generates a PDF Blob from resume data.
 * In content scripts, it offloads the work to a background/offscreen script to avoid WASM CSP restrictions.
 */
export async function generateResumePDF(
    resume: StructuredResume,
    styles?: PdfStyles,
    template: string = 'classic'
): Promise<Blob> {
    // Check if we are in a content script (host page protocol)
    const isContentScript = typeof window !== 'undefined' &&
        window.location.protocol !== 'chrome-extension:';

    if (isContentScript && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        console.log('Detected content script context, offloading PDF generation to background...');
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'GENERATE_RESUME_PDF',
                resume,
                template
            }, (response) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message));
                }
                if (response && response.success && response.data) {
                    // Convert base64 data URL back to Blob
                    fetch(response.data)
                        .then(res => res.blob())
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error(response?.error || 'Failed to generate PDF via background'));
                }
            });
        });
    }

    // If not in content script (e.g. offscreen, background, popup), use the real generator
    // We use dynamic import here to ensure @react-pdf/renderer is never even parsed in content scripts
    const { generateResumePDFReal } = await import('./resume-pdf-generator');
    return generateResumePDFReal(resume, styles, template);
}

export function generateResumeHTML(resume: StructuredResume): string {
    return generateResumeHTMLReal(resume)
}
