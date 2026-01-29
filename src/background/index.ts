console.log('Bhaikaamdo Extension Background Service Worker Running');

// Listen for installation
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension Installed');
    // Ensure side panel behavior
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
    await checkAndValidateCookie();
});

// Watch for cookie changes to keep storage in sync
chrome.cookies.onChanged.addListener((changeInfo) => {
    const domain = changeInfo.cookie.domain;
    if (domain.includes('bhaikaamdo.com')) {
        if (changeInfo.cookie.name === 'cf_auth') {
            // Re-run full validation if auth cookie changes
            checkAndValidateCookie();
        } else if (changeInfo.cookie.name === 'bhaikaamdo_defaultresume') {
            // Sync default resume directly
            if (!changeInfo.removed && changeInfo.cookie.value) {
                chrome.storage.local.set({ defaultResume: changeInfo.cookie.value });
            } else {
                chrome.storage.local.remove('defaultResume');
            }
        }
    }
});

// Example: Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.type === 'PING') {
        sendResponse({ type: 'PONG' });
    }

    if (request.type === 'GENERATE_RESUME_PDF') {
        const { resume, template } = request;
        (async () => {
            try {
                // In production, Vite might move offscreen files. 
                // We'll use the path as defined in vite.config.ts or just the source path if crxjs handles it.
                await setupOffscreenDocument('src/offscreen/pdf.html');
                const result = await chrome.runtime.sendMessage({
                    type: 'GENERATE_PDF_OFFSCREEN',
                    resume,
                    template,
                    target: 'offscreen'
                });
                sendResponse(result);
            } catch (error: any) {
                console.error('Background PDF Bridge Error:', error);
                sendResponse({ success: false, error: error.message || String(error) });
            }
        })();
        return true;
    }

    if (request.type === 'GENERATE_COVER_LETTER_PDF') {
        const { delta, content } = request;
        (async () => {
            try {
                await setupOffscreenDocument('src/offscreen/pdf.html');
                const result = await chrome.runtime.sendMessage({
                    type: 'GENERATE_COVER_LETTER_PDF_OFFSCREEN',
                    delta,
                    content,
                    target: 'offscreen'
                });
                sendResponse(result);
            } catch (error: any) {
                console.error('Background Cover Letter PDF Bridge Error:', error);
                sendResponse({ success: false, error: error.message || String(error) });
            }
        })();
        return true;
    }

    if (request.action === 'fetchMultipleDetails') {
        const { base, paths } = request;
        (async () => {
            try {
                if (!base || !paths || !Array.isArray(paths)) {
                    sendResponse({ success: false, message: 'Missing base or paths' });
                    return;
                }

                const out: any = {};
                for (const p of paths) {
                    const url = `${base}/details/${p}/`;
                    try {
                        const result = await extractInHiddenTab(url);
                        out[p] = result;
                    } catch (error: any) {
                        out[p] = { success: false, message: error.message || String(error) };
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                sendResponse({ success: true, results: out });
            } catch (e: any) {
                sendResponse({ success: false, message: e.message || String(e) });
            }
        })();
        return true;
    }

    return true;
});

let creating: Promise<void> | null = null; // To avoid race conditions
async function setupOffscreenDocument(path: string) {
    // Check if offscreen document already exists
    const existingContexts = await (chrome.runtime as any).getContexts({
        contextTypes: [(chrome.runtime as any).ContextType.OFFSCREEN_DOCUMENT],
    });

    if (existingContexts.length > 0) {
        return;
    }

    // Create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = (chrome as any).offscreen.createDocument({
            url: path,
            reasons: [(chrome as any).offscreen.Reason.DOM_PARSER], // Closest reason for PDF generation/WASM
            justification: 'Generate PDF using WebAssembly in a context that allows wasm-unsafe-eval',
        });
        await creating;
        creating = null;
    }
}

async function extractInHiddenTab(url: string) {
    const created = await chrome.tabs.create({ url, active: true });
    const tabId = created.id!;
    try {
        await waitForTabComplete(tabId, 15000);
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const main = document.querySelector('main');
                return main ? main.innerHTML : null;
            }
        });
        const html = (results && results[0] && results[0].result) ? results[0].result : null;
        return { success: true, html };
    } catch (e: any) {
        return { success: false, message: e.message || String(e) };
    } finally {
        try {
            await chrome.tabs.remove(tabId);
        } catch (e) { /* ignore */ }
    }
}

function waitForTabComplete(tabId: number, timeout = 25000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        function checkStatus() {
            chrome.tabs.get(tabId, (tab) => {
                if (!tab) return reject(new Error('Tab not found'));
                if (tab.status === 'complete') {
                    // Small delay to ensure dynamic content is there
                    setTimeout(resolve, 3000);
                    return;
                }
                if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for tab load'));
                setTimeout(checkStatus, 500);
            });
        }
        checkStatus();
    });
}

async function checkAndValidateCookie() {
    try {
        // 1. Check Auth Cookie
        const cookie = await chrome.cookies.get({
            url: 'https://bhaikaamdo.com',
            name: 'cf_auth'
        });

        if (cookie && cookie.value) {
            // Validate the token
            const validationResult = await validateToken(cookie.value);

            if (validationResult.success && validationResult.valid) {
                // Store token in chrome.storage.local
                // We map 'careerforgeToken' to match legacy usage or standard 'token' if we want to migrate
                // The legacy code used 'careerforgeToken' in storage, so we should stick to that or map it.
                // Looking at api.ts, it reads 'token'. We should check if we need to align these.
                // Legacy Fab.tsx checks: storage.careerforgeToken

                // Let's store BOTH 'token' and 'careerforgeToken' to be safe during migration
                await chrome.storage.local.set({
                    token: cookie.value,
                    careerforgeToken: cookie.value,
                    username: validationResult.username
                });
            } else {
                // Invalid token
                await chrome.storage.local.remove(['token', 'careerforgeToken', 'username']);
                // chrome.tabs.create({ url: 'https://bhaikaamdo.com/signup' }); // Optional: might be annoying on startup
            }
        } else {
            // No cookie found
            await chrome.storage.local.remove(['token', 'careerforgeToken', 'username']);
            // chrome.tabs.create({ url: 'https://bhaikaamdo.com/signup' });
        }

        // 2. Check Default Resume Cookie
        try {
            const resumeCookie = await chrome.cookies.get({
                url: 'https://bhaikaamdo.com',
                name: 'bhaikaamdo_defaultresume'
            });

            if (resumeCookie && resumeCookie.value) {
                await chrome.storage.local.set({ defaultResume: resumeCookie.value });
            } else {
                await chrome.storage.local.remove(['defaultResume']);
            }
        } catch (resumeError) {
            console.warn('Error checking default resume cookie:', resumeError);
        }

    } catch (error) {
        console.error('Error checking cookie:', error);
        // On error, treat as invalid
    }
}

async function validateToken(token: string) {
    try {
        const response = await fetch('https://careerback.bhaikaamdo.com/api/checkExtensionToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok && data.success && data.valid) {
            return {
                success: true,
                valid: true,
                username: data.username || ''
            };
        } else {
            return {
                success: false,
                valid: false,
                username: ''
            };
        }
    } catch (error) {
        console.error('Error validating token:', error);
        return {
            success: false,
            valid: false,
            username: ''
        };
    }
}
