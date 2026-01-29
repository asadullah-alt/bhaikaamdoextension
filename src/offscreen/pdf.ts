import { generateResumePDFReal } from '../content/resume-pdf-generator';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GENERATE_PDF_OFFSCREEN') {
        const { resume, template } = message;

        generateResumePDFReal(resume, undefined, template)
            .then((blob: Blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    sendResponse({ success: true, data: base64data });
                };
                reader.onerror = (_e) => {
                    sendResponse({ success: false, error: 'FileReader error' });
                };
                reader.readAsDataURL(blob);
            })
            .catch((err: any) => {
                console.error('Offscreen PDF generation error:', err);
                sendResponse({ success: false, error: err.message || String(err) });
            });

        return true; // Keep channel open for async response
    }

    if (message.type === 'GENERATE_COVER_LETTER_PDF_OFFSCREEN') {
        const { delta, content } = message;

        (async () => {
            try {
                // If we have plain text content, use it. Otherwise try to extract from delta.
                const textContent = content || (delta?.ops?.map((op: any) => op.insert).join('') || '');

                const { generateCoverLetterPDFReal } = await import('../content/cover-letter-pdf-generator');
                const blob = await generateCoverLetterPDFReal(textContent);

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    sendResponse({ success: true, data: base64data });
                };
                reader.onerror = (_e) => {
                    sendResponse({ success: false, error: 'FileReader error' });
                };
                reader.readAsDataURL(blob);
            } catch (err: any) {
                console.error('Offscreen Cover Letter PDF generation error:', err);
                sendResponse({ success: false, error: err.message || String(err) });
            }
        })();

        return true;
    }
});
