import React, { useState, useEffect } from 'react';
import { Plus, X, LogIn, Download, BarChart2, Sparkles, Save, Bookmark } from 'lucide-react';
import { apiService } from '../services/api';
import { jobService } from '../services/jobService';

interface FabProps {
    onAnalyze: () => void;
    onImprove: () => void;
    onSaveJob: () => void;
}

const Fab: React.FC<FabProps> = ({ onAnalyze, onImprove, onSaveJob }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLinkedIn, setIsLinkedIn] = useState(false);

    // Check login status and location specific variants
    useEffect(() => {
        const checkStatus = async () => {
            const token = await apiService.getToken();
            setIsLoggedIn(!!token);
            setIsLinkedIn(window.location.href.includes('linkedin.com/in/'));
        };

        checkStatus();

        // Auto-open effect from legacy (with a delay)
        const timer = setTimeout(() => {
            const shouldAutoOpen = true; // Could add logic to limit frequency
            if (shouldAutoOpen) setIsOpen(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const toggleDrawer = () => setIsOpen(!isOpen);

    const handleLogin = () => {
        window.open('https://bhaikaamdo.com/signin', '_blank');
    };

    const handleExtract = async () => {
        // Post message to ourselves (ContentApp handleExtractLinkedIn)
        window.postMessage({ type: 'TRIGGER_EXTRACT_LINKEDIN' }, '*');
        setIsOpen(false);
    };

    // Check for visibility logic from legacy/content.js
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const checkVisibility = () => {
            const currentUrl = window.location.href;
            const hostname = window.location.hostname;

            // 1. Blacklisted domains where the addon should never show
            const blacklistedDomains = [
                'gemini.google.com',
                'mail.google.com',
                'claude.ai',
                'x.com',
                'youtube.com',
                'www.youtube.com',
                'bhaikaamdo.com'
            ];

            if (blacklistedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
                setShouldShow(false);
                return;
            }

            // 2. Always show on LinkedIn Profiles
            if (currentUrl.includes('linkedin.com/in/')) {
                setShouldShow(true);
                return;
            }

            // 3. Keyword scan for other pages
            const bodyText = document.body.innerText.toLowerCase();
            const keywords = ['job description', 'job title', 'required skills', 'apply now', 'responsibilities', 'qualifications', 'job details', 'skills and qualifications'];
            // Original legacy keywords: ['job description', 'job title', 'required skills']

            const hasKeyword = keywords.some(keyword => bodyText.includes(keyword.toLowerCase()));
            if (hasKeyword) {
                setShouldShow(true);
            } else {
                setShouldShow(false);
            }
        };

        checkVisibility();

        // Optional: Re-check on mutation if needed (dynamic SPAs)
        const observer = new MutationObserver((mutations) => {
            // Debounce this if it gets heavy, or just run once a few seconds after load
            // For now, let's run simple check
            checkVisibility();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
        });

        return () => observer.disconnect();
    }, []);

    if (!shouldShow) return null;

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[2147483645] font-sans">
            {/* Drawer */}
            <div
                className={`flex flex-col gap-3 absolute top-1/2 -translate-y-1/2 right-20 transition-all duration-300 origin-right p-2 rounded-full bg-gray-900/40 backdrop-blur-md border border-white/10 ${isOpen ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto' : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
                    }`}
            >
                {!isLoggedIn ? (
                    <FabAction
                        onClick={handleLogin}
                        icon={<LogIn size={18} />}
                        label="Login to CareerForge"
                    />
                ) : (
                    <>
                        {isLinkedIn && (
                            <FabAction
                                onClick={handleExtract}
                                icon={<Download size={18} />}
                                label="Extract Profile"
                            />
                        )}
                        {!isLinkedIn && (
                            <>

                                <FabAction
                                    onClick={() => { onImprove(); setIsOpen(false); }}
                                    icon={<Sparkles size={18} />}
                                    label="Improve Resume for this Job"
                                />
                                <FabAction
                                    onClick={() => { onAnalyze(); setIsOpen(false); }}
                                    icon={<BarChart2 size={18} />}
                                    label="Analyze Resume for this Job"
                                />
                                <FabAction
                                    onClick={() => { onSaveJob(); setIsOpen(false); }}
                                    icon={<Bookmark size={18} />}
                                    label="Save Job"
                                />
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Main FAB */}
            <button
                onClick={toggleDrawer}
                className={`
                    w-14 h-14 rounded-full shadow-lg border border-white/20 backdrop-blur-md 
                    flex items-center justify-center text-white transition-all duration-300
                    ${isOpen ? 'bg-gray-900/90' : 'bg-blue-600/90 hover:bg-blue-700/90 hover:w-16'}
                    ${!isOpen && !isLoggedIn ? 'animate-pulse' : ''} 
                `}
            >
                {isOpen ? (
                    <X size={28} className="rotate-0 transition-transform duration-300" />
                ) : (
                    <span
                        className="text-3xl font-normal leading-none pointer-events-none"
                        style={{ fontFamily: "'Great Vibes', cursive", transform: 'translateY(1px)' }}
                    >
                        B
                    </span>
                )}
                {!isLoggedIn && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        !
                    </span>
                )}
            </button>
        </div>
    );
};

const FabAction: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string }> = ({ onClick, icon, label }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="group flex items-center justify-center w-10 h-10 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-100 transition-transform hover:scale-110 relative border border-gray-200"

    >
        {icon}
        {/* Tooltip on left */}
        <span className="absolute right-12 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {label}
        </span>
    </button>
);

export default Fab;
