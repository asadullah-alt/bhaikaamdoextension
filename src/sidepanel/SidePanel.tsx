import React, { useState, useEffect } from 'react';
import { Bookmark, BarChart2, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import { Toaster, toast } from 'sonner';

// Simplified port of popup logic
const SidePanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('job-app');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Retrieve token from storage on mount
        chrome.storage.local.get(['token'], (result) => {
            if (result.token) {
                setToken(result.token);
            }
        });
    }, []);

    const handleSaveToken = () => {
        const inputTokens = (document.getElementById('api-token') as HTMLInputElement).value;
        if (inputTokens) {
            chrome.storage.local.set({ token: inputTokens }, () => {
                setToken(inputTokens);
                alert('Token saved!');
            });
        }
    };

    /**
     * Safely sends a message to the active tab's content script.
     * Prevents "Receiving end does not exist" errors by checking lastError.
     */
    const sendMessageToContentScript = (type: string, payload: any = {}) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTabId = tabs[0]?.id;
            if (activeTabId) {
                chrome.tabs.sendMessage(activeTabId, { type, ...payload }, (response) => {
                    // Check for connection error (content script not ready or not injected)
                    if (chrome.runtime.lastError) {
                        console.warn('Could not send message to content script:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Message sent successfully:', type);
                    }
                });
            }
        });
    };

    /**
     * Async version of message sending to get data back
     */
    const sendMessageAsync = (type: string, payload: any = {}): Promise<any> => {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTabId = tabs[0]?.id;
                if (!activeTabId) {
                    reject(new Error("No active tab found"));
                    return;
                }
                chrome.tabs.sendMessage(activeTabId, { type, ...payload }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Message error:", chrome.runtime.lastError);
                        reject(new Error("Could not connect to page. Refresh the page and try again."));
                    } else {
                        resolve(response);
                    }
                });
            });
        });
    };

    const handleSaveJob = async () => {
        const toastId = toast.loading('Saving job application...');
        try {
            const result = await sendMessageAsync('TRIGGER_SAVE_JOB');
            if (result && result.success) {
                toast.success(result.message, { id: toastId });
            } else {
                toast.error(result?.message || 'Failed to save job', { id: toastId });
            }
        } catch (error: any) {
            console.error('Save job failed:', error);
            toast.error(error.message || 'Failed to save job', { id: toastId });
        }
    };

    const handleAnalyzeJob = async () => {
        const toastId = toast.loading('Analyzing job matching...');
        try {
            const result = await sendMessageAsync('TRIGGER_ANALYZE_JOB');
            if (result && result.success) {
                toast.success(result.message || 'Analysis complete!', { id: toastId });
            } else {
                toast.error(result?.message || 'Analysis failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleImproveResume = async () => {
        const toastId = toast.loading('Tailoring resume for job...');
        try {
            const result = await sendMessageAsync('TRIGGER_IMPROVE_RESUME');
            if (result && result.success) {
                toast.success(result.message || 'Improvement complete!', { id: toastId });
            } else {
                toast.error(result?.message || 'Improvement failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleExtractLinkedIn = async () => {
        const toastId = toast.loading('Extracting LinkedIn profile...');
        try {
            const result = await sendMessageAsync('TRIGGER_EXTRACT_LINKEDIN');
            if (result && result.success) {
                toast.success(result.message || 'Profile extracted successfully!', { id: toastId });
            } else {
                toast.error(result?.message || 'Extraction failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-900 flex flex-col font-sans">
            <Toaster position="bottom-center" theme="dark" richColors />
            {/* Header */}
            <header className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
                        Bhaikaamdo
                    </h1>
                </div>
                <div className="flex gap-2">
                    {/* Add icons/links here if needed */}
                </div>
            </header>

            {/* Nav Tabs */}
            <nav className="flex px-4 pt-4 border-b border-gray-800 gap-6">
                <button
                    onClick={() => setActiveTab('job-app')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'job-app' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
                        }`}
                >
                    Job Application
                </button>
                <button
                    onClick={() => setActiveTab('extract-linkedin')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'extract-linkedin' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
                        }`}
                >
                    Extract LinkedIn
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'config' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
                        }`}
                >
                    Authentication Token
                </button>
            </nav>

            {/* Content Area */}
            <main className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'job-app' && (
                    <div className="space-y-4">
                        <section className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">

                            <div className="space-y-3">
                                <button
                                    onClick={handleSaveJob}
                                    className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-all border border-gray-600 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <Bookmark size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">Save Job</div>
                                        <div className="text-xs text-gray-500">Save to your profile</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleAnalyzeJob}
                                    className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-all border border-gray-600 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <BarChart2 size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">Analyze Job</div>
                                        <div className="text-xs text-gray-500">Get insights & match score</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleImproveResume}
                                    className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-all border border-gray-600 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">Improve Resume</div>
                                        <div className="text-xs text-gray-500">Tailor resume for this job</div>
                                    </div>
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'extract-linkedin' && (
                    <div className="space-y-4">
                        <section className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                🚀 Profile Extraction
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Extract your LinkedIn profile data to improve your career profile.
                            </p>
                            <button
                                onClick={handleExtractLinkedIn}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
                            >
                                <Sparkles size={18} />
                                Start Extraction
                            </button>
                        </section>
                    </div>
                )}
                {activeTab === 'config' && (
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                            <h2 className="text-sm font-semibold text-gray-300 mb-3">Authentication Token</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                        Server Token (Read Only)
                                    </label>
                                    <input
                                        type="text"
                                        id="api-token"
                                        value={token || ''}
                                        readOnly
                                        placeholder="Token syncs automatically from bhaikaamdo.com"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none cursor-not-allowed"
                                        title="Login on bhaikaamdo.com to update this token"
                                    />
                                </div>
                                {/* Save button removed as token is read-only sync */}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="p-3 bg-gray-900 border-t border-gray-800 text-center">
                <p className="text-[10px] text-gray-600">Bhaikaamdo v1.0</p>
            </footer>
        </div>
    );
};

export default SidePanel;
