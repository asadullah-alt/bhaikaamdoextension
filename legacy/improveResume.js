// improveResume.js - Improve resume workflow for Chrome extension

async function improveResumeWorkflow(token, defaultResumeId) {
    // Start Timer
    const startTime = Date.now();

    // 1. Create/Show Overlay in Loading State
    // These functions are available globally from sharedUI.js
    const overlay = createAnalysisOverlay();
    renderLoadingState(overlay, startTime);

    try {
        const payload = {
            resume_id: defaultResumeId,
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
            throw new Error(data.message || data.detail || "Failed to improve resume");
        }

        // The API returns data in 'data' field or directly?
        // User said: "the API returns the data in the variable called data"
        // Usually APIs return { success: true, data: { ... } } or just the object.
        // Assuming typical structure based on analysis endpoint: data.data
        const resultData = data.data || data;

        // Calculate elapsed time
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

        // Render using the same UI as Analysis
        // We reuse renderAnalysisUI because the data structure matches (original_score, improvements, etc.)
        renderAnalysisUI(overlay, resultData, token, resultData.job_id, elapsedTime);

    } catch (err) {
        console.error("Improve Resume Workflow Error:", err);
        renderErrorState(overlay, err.message);
    }
}
