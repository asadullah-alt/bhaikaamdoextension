import React, { useState, useEffect } from 'react';
import Fab from './Fab';
import AnalysisOverlay from './AnalysisOverlay';
import ImproveOverlay from './ImproveOverlay';
import { apiService } from '../services/api';
import { jobService } from '../services/jobService';
import { linkedinService } from '../services/linkedinService';

import { Toaster, toast } from 'sonner';

const ContentApp: React.FC = () => {
    // Overlay State
    const [overlayStep, setOverlayStep] = useState<'loading' | 'results' | 'error' | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [activeOverlayType, setActiveOverlayType] = useState<'analyze' | 'improve' | null>(null);

    // Handlers
    const handleAnalyze = async (silent: boolean = false) => {
        // "Analyze" uses the Simple/Placeholder overlay (according to user request "improveResume is actually analyzeResume" meaning Improve=Rich, Analyze=Simple)
        if (!silent) {
            setOverlayStep('loading');
        }
        setActiveOverlayType('analyze');

        try {
            const jobDetails = jobService.extractJobDetails();
            console.log('Fab Analysis - Extracted Job:', jobDetails);

            // Using existing API, assuming same endpoint but different UI?
            // User didn't specify different API logic, just UI swap.
            //toast.success(window.location.href);
            const result = await apiService.improveResume(window.location.href);
            //console.log('Analysis Result:', result);

            if (result.success) {
                setAnalysisData(result.data?.data || result.data); // Support both nested and flat responses
                setOverlayStep('results');
                return result;
            } else {
                setOverlayStep(null);
                const errorMsg = result.message;
                //setAnalysisData(errorMsg);
                if (errorMsg.toLowerCase().includes('job not found')) {
                    toast.error("Please save the job first")
                }
                else if (errorMsg.toLowerCase().includes('recaptcha') || errorMsg.toLowerCase().includes('security check')) {
                    toast.error("Site's security check (reCAPTCHA) blocked the analysis. Try again in a few minutes.");
                } else if (errorMsg.toLowerCase().includes('credits')) {
                    toast.error("You've used all your credits for this month. Please upgrade your plan on bhaikaamdo.com.");
                } else {
                    toast.error("Failed to analyze job: " + errorMsg);
                }
                return result;
            }
        } catch (error: any) {
            console.error('Unexpected analysis failure', error);
            setOverlayStep(null);
            setAnalysisData(error.message || 'Unexpected Error');
            return { success: false, message: error.message || 'Unexpected Error' };
        }
    };

    const handleImprove = async (silent: boolean = false) => {
        if (!silent) {
            setOverlayStep('loading');
        }
        setActiveOverlayType('improve');

        try {
            const jobDetails = jobService.extractJobDetails();
            const result = await apiService.improveResume(window.location.href);

            if (result.success) {
                setAnalysisData(result.data?.data || result.data);
                setOverlayStep('results');
                return result;
            } else {
                setOverlayStep(null);
                const errorMsg = result.message;
                setAnalysisData(errorMsg);
                if (errorMsg.toLowerCase().includes('job not found')) {
                    toast.error("Please save the job first")
                }
                else if (errorMsg.toLowerCase().includes('recaptcha') || errorMsg.toLowerCase().includes('security check')) {
                    toast.error("Site's security check (reCAPTCHA) blocked the improvement request.");
                } else if (errorMsg.toLowerCase().includes('credits')) {
                    toast.error("You've used all your credits for this month. Please upgrade your plan on bhaikaamdo.com.");
                } else {
                    toast.error("Failed to improve resume: " + errorMsg);
                }
                return result;
            }
        } catch (error: any) {
            console.error('Unexpected improvement failure', error);
            setOverlayStep(null);
            setAnalysisData(error.message || 'Unexpected Error');
            return { success: false, message: error.message || 'Unexpected Error' };
        }
    };

    const handleSaveJob = async () => {
        const toastId = toast.loading("Saving job application...");
        try {
            const jobDetails = jobService.extractJobDetails();
            const result = await apiService.saveJob({ job_url: window.location.href, job_descriptions: document.documentElement.outerHTML });

            if (result.success) {
                toast.success(result.message, { id: toastId });
            } else {
                toast.error(result.message, { id: toastId });
            }
            return result;
        } catch (e: any) {
            toast.error("Failed to save job: " + e.message, { id: toastId });
            return { success: false, message: "Failed to save job: " + e.message };
        }
    };

    const handleExtractLinkedIn = async () => {
        const toastId = toast.loading("Extracting LinkedIn profile...");
        try {
            const profileData = await linkedinService.extractProfileData();
            if (!profileData) throw new Error("Could not extract profile data");

            const token = await apiService.getToken();
            if (!token) throw new Error("Missing token. Please login.");

            const url = window.location.href;
            const baseMatch = url.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in\/([^\/]+)\/?$/i);
            if (baseMatch) {
                const handle = baseMatch[1];
                const base = `https://www.linkedin.com/in/${handle}`;
                const paths = ['experience', 'education', 'certifications', 'projects', 'skills'];

                toast.loading("Fetching detailed sections...", { id: toastId });

                const batchResp = await new Promise<any>((res) => {
                    chrome.runtime.sendMessage({ action: 'fetchMultipleDetails', base, paths }, res);
                });

                if (batchResp && batchResp.success && batchResp.results) {
                    for (const p of paths) {
                        const entry = batchResp.results[p];
                        if (entry && entry.success && entry.html) {
                            profileData[`details_${p}_main`] = entry.html;
                        }
                    }
                }
            }

            toast.loading("Saving profile to BhaiKaamDo...", { id: toastId });
            const resp = await fetch('https://careerback.bhaikaamdo.com/api/saveProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ ...profileData, token })
            });

            const result = await resp.json();
            if (resp.ok) {
                toast.success("Profile extracted & saved successfully!", { id: toastId });
                return { success: true, message: "Profile extracted & saved successfully!" };
            } else {
                const msg = "Failed to save profile: " + (result.message || "Unknown error");
                toast.error(msg, { id: toastId });
                return { success: false, message: msg };
            }
        } catch (e: any) {
            console.error("LinkedIn Extraction Error:", e);
            toast.error("Extraction failed: " + e.message, { id: toastId });
            return { success: false, message: "Extraction failed: " + e.message };
        }
    };

    // Close Handler
    const handleCloseOverlay = () => {
        setOverlayStep(null);
        setAnalysisData(null);
        setActiveOverlayType(null);
    };

    // Message Listener for Side Panel triggers
    useEffect(() => {
        const messageListener = (request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
            console.log('[ContentApp] Received message:', request.type);

            // Handle async response for GET_JOB_DETAILS
            if (request.type === 'GET_JOB_DETAILS') {
                try {
                    const jobDetails = jobService.extractJobDetails();
                    sendResponse(jobDetails);
                } catch (e) {
                    console.error('Error extracting job details:', e);
                    sendResponse(null);
                }
                return; // Sync return, but sendResponse called. Or if async needed return true. 
                // Since extraction is sync, we can just call sendResponse.
            }

            if (request.type === 'TRIGGER_ANALYZE_JOB') {
                handleAnalyze(true).then(sendResponse);
                return true;
            } else if (request.type === 'TRIGGER_IMPROVE_RESUME') {
                handleImprove(true).then(sendResponse);
                return true;
            } else if (request.type === 'TRIGGER_SAVE_JOB') {
                handleSaveJob().then(sendResponse);
                return true;
            } else if (request.type === 'TRIGGER_EXTRACT_LINKEDIN') {
                handleExtractLinkedIn().then(sendResponse);
                return true;
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        // Also listen for internal postMessages from FAB
        const windowListener = (event: MessageEvent) => {
            if (event.data?.type === 'TRIGGER_EXTRACT_LINKEDIN') {
                handleExtractLinkedIn();
            }
        };
        window.addEventListener('message', windowListener);

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
            window.removeEventListener('message', windowListener);
        };
    }, []);

    return (
        <div className="font-sans text-base antialiased text-gray-900">
            {/* Always rendered FAB */}
            <Fab
                onAnalyze={handleAnalyze}
                onImprove={handleImprove}
                onSaveJob={handleSaveJob}
            />
            <Toaster position="top-center" richColors />

            {/* Conditionally rendered Overlay */}
            {overlayStep && activeOverlayType === 'analyze' && (
                <AnalysisOverlay
                    initialStep={overlayStep}
                    analysisData={analysisData}
                    onClose={handleCloseOverlay}
                />
            )}

            {overlayStep && activeOverlayType === 'improve' && (
                <ImproveOverlay
                    initialStep={overlayStep as 'loading' | 'results' | 'error'} // Cast to satisfy specific union if mostly compatible
                    analysisData={analysisData}
                    onClose={handleCloseOverlay}
                />
            )}
        </div>
    );
};

export default ContentApp;
