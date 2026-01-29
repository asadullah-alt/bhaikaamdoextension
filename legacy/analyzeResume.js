// analyzeResume.js - Analyze resume workflow for Chrome extension

// Ensure global namespace for cache exists
if (typeof window.cf_resumeCache === 'undefined') {
    window.cf_resumeCache = {
        resumeId: null,
        analysisResult: null
    };
}

async function analyzeResumeWorkflow(token, defaultResumeId) {
    // Start Timer
    const startTime = Date.now();

    // 1. Create/Show Overlay in Loading State
    // These functions are available globally from sharedUI.js
    const overlay = createAnalysisOverlay();
    renderLoadingState(overlay, startTime);

    try {
        let resume_id = defaultResumeId || window.cf_resumeCache.resumeId;

        // 2. Fetch User Resumes if not known
        if (!resume_id) {
            updateLoadingStateWithTimer(overlay, startTime, 'Fetching your resumes...');

            const resp = await fetch('https://resume.bhaikaamdo.com/api/v1/resumes/getAllUserResumes', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });

            if (!resp.ok) {
                throw new Error("Failed to fetch resumes. Please check your connection or login again.");
            }

            const data = await resp.json();
            // Assuming data is an array of resumes or { data: [...] }
            const resumes = Array.isArray(data) ? data : (data.data || []);

            if (resumes.length === 0) {
                throw new Error("No resumes found. Please upload a resume on the dashboard first.");
            }

            // Find default or first
            const defaultRes = resumes.find(r => r.is_default) || resumes[0];
            resume_id = defaultRes._id || defaultRes.id;

            // Cache it
            window.cf_resumeCache.resumeId = resume_id;
        }

        if (!resume_id) {
            throw new Error("Could not determine which resume to use.");
        }

        const payload = {
            resume_id: resume_id,
            job_url: window.location.href,
            token: token
        };

        // Update loading state with timer
        updateLoadingStateWithTimer(overlay, startTime, 'Analyzing your resume based on this job...');

        const resp = await fetch('https://resume.bhaikaamdo.com/api/v1/resumes/improveFromExtension', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        if (!resp.ok) {
            throw new Error(data.message || data.detail || "Failed to analyze resume");
        }

        // The API returns data in 'data' field or directly?
        const resultData = data.data || data;

        // Calculate elapsed time
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

        // Render using renderImproveUI instead of renderAnalysisUI
        renderImproveUI(overlay, resultData, token, resultData.job_id, elapsedTime);

    } catch (err) {
        console.error("Analyze Resume Workflow Error:", err);
        renderErrorState(overlay, err.message);
    }
}
