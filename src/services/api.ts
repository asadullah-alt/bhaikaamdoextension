const API_BASE_URL = 'https://resume.bhaikaamdo.com/api/v1';

export const apiService = {
    /**
     * Helper to get the token from storage
     */
    async getToken(): Promise<string | null> {
        const result = await chrome.storage.local.get(['token']);
        return result.token || null;
    },

    /**
     * Save a job to the backend
     */
    async saveJob(jobData: any) {
        try {
            const token = await this.getToken();
            if (!token) {
                return { success: false, message: 'Missing token' };
            }

            const payload = { ...jobData, token };

            const response = await fetch(`${API_BASE_URL}/jobs/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            let data = null;
            try { data = await response.json(); } catch (err) { data = null; }

            if (response.ok) {
                return {
                    success: true,
                    message: data?.message || 'Job application HTML saved successfully.',
                    data
                };
            } else {
                const msg = (data && data.message) ? data.message : `Error: ${response.status}`;
                return { success: false, message: msg, data };
            }
        } catch (error: any) {
            console.error('Error saving job application HTML:', error);
            return {
                success: false,
                message: 'Error saving job application: ' + (error.message || error)
            };
        }
    },

    /**
     * Analyze/Improve Resume against a job
     */
    async improveResume(jobUrl: string, resumeId?: string) {
        try {
            const { token, defaultResume } = await chrome.storage.local.get(['token', 'defaultResume']);

            if (!token) {
                return { success: false, message: 'Authentication token not found' };
            }

            const finalResumeId = resumeId || defaultResume;
            if (!finalResumeId) {
                return { success: false, message: 'No resume selected. Please upload a resume or set a default on bhaikaamdo.com' };
            }

            const payload: any = {
                job_url: jobUrl,
                token: token,
                resume_id: finalResumeId
            };

            const response = await fetch(`${API_BASE_URL}/resumes/improveFromExtension`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            let data = null;
            try { data = await response.json(); } catch (err) { data = null; }

            if (!response.ok) {
                // Backend sometimes uses 'detail' (FastAPI) and sometimes 'message'
                const errorMessage = data?.detail || data?.message || `Analysis failed: ${response.status}`;
                return { success: false, message: errorMessage, data };
            }

            return {
                success: true,
                message: 'Analysis completed successfully',
                data: data
            };
        } catch (error: any) {
            console.error('Error in improveResume:', error);
            return {
                success: false,
                message: 'Error: ' + (error.message || error)
            };
        }
    },

    /**
     * Get generated cover letter
     */
    async getCoverLetter(jobId: string, resumeId: string) {
        try {
            const token = await this.getToken();
            if (!token) {
                return { success: false, message: 'Authentication token not found' };
            }

            const payload = {
                job_id: jobId,
                resume_id: resumeId,
                token: token
            };

            const response = await fetch(`${API_BASE_URL}/cover-letters/getCoverletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.cover_letter) {
                return {
                    success: true,
                    cover_letter: data.cover_letter
                };
            } else {
                return {
                    success: false,
                    message: data.message || "Failed to generate cover letter"
                };
            }
        } catch (error: any) {
            console.error("Error generating cover letter:", error);
            return {
                success: false,
                message: "An error occurred while generating the cover letter"
            };
        }
    }
};
