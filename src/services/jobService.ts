/**
 * Logic to extract job details from the DOM.
 * This replaces saveJob.js extraction logic.
 */
export const jobService = {
    extractJobDetails: (): any => {
        // Legacy "Full HTML" strategy as requested
        const html = document.documentElement.outerHTML;
        const url = window.location.href;

        return {
            job_url: url,
            job_descriptions: html
        };
    }
};
