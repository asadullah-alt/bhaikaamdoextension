import React from 'react';
import { createRoot } from 'react-dom/client';
import AnalysisOverlay from './AnalysisOverlay';
import ContentApp from './ContentApp';
import styles from '../index.css?inline';
import sonnerStyles from 'sonner/dist/styles.css?inline';

console.log('Bhaikaamdo Content Script Loaded');

// Shadow DOM setup for style isolation
const rootId = 'bhaikaamdo-extension-root';

// Ensure body exists before mounting
const init = () => {
    const existingRoot = document.getElementById(rootId);
    if (existingRoot) {
        existingRoot.remove();
    }

    const container = document.createElement('div');
    container.id = rootId;
    document.body.appendChild(container);

    const shadowRoot = container.attachShadow({ mode: 'open' });
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    shadowRoot.appendChild(styleSheet);

    const sonnerStyleSheet = document.createElement('style');
    sonnerStyleSheet.textContent = sonnerStyles;
    shadowRoot.appendChild(sonnerStyleSheet);

    const root = createRoot(shadowRoot);

    // Mount App
    root.render(
        <React.StrictMode>
            <div className="font-sans text-base antialiased text-gray-900">
                <ContentApp />
            </div>
        </React.StrictMode>
    );
};

if (document.body) {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

import { apiService } from '../services/api';

// Listen for messages (still useful for background triggers or context menu)
// But FAB handles most interaction now
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ANALYZE_RESUME') {
        console.log('Analysis requested via message', request);
        // TODO: We might want to expose a way to trigger analysis in ContentApp from here
        // For now, the FAB is the primary way.
    }
});
