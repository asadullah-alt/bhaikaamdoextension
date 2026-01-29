// saveJob.js - Save job functionality for Chrome extension

function showSaveJobModal() {
    if (document.getElementById('cf-save-job-modal')) return;

    // Create Modal Container
    const modal = document.createElement('div');
    modal.id = 'cf-save-job-modal';
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '2147483647', // Max z-index
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Transparent mask
        fontFamily: 'system-ui, -apple-system, sans-serif',
    });

    // Modal Content
    const content = document.createElement('div');
    Object.assign(content.style, {
        backgroundColor: 'white',
        padding: '30px 40px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '90%',
        width: '320px',
        animation: 'cf-fade-in 0.3s ease-out forwards'
    });

    // Fade in animation style
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes cf-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes cf-spin-save {
      to { transform: rotate(360deg); }
    }
    .cf-saver-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #16a34a; /* Green */
      border-radius: 50%;
      animation: cf-spin-save 1s linear infinite;
    }
  `;
    modal.appendChild(style);

    // Spinner
    const spinner = document.createElement('div');
    spinner.className = 'cf-saver-spinner';

    // Text
    const text = document.createElement('div');
    text.textContent = 'Saving Job Application...';
    Object.assign(text.style, {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center'
    });

    // Subtext
    const subtext = document.createElement('div');
    subtext.textContent = 'Please wait while we process the details.';
    Object.assign(subtext.style, {
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center'
    });

    content.appendChild(spinner);
    content.appendChild(text);
    content.appendChild(subtext);
    modal.appendChild(content);

    document.body.appendChild(modal);
}

function removeSaveJobModal() {
    const modal = document.getElementById('cf-save-job-modal');
    if (modal) {
        modal.remove();
    }
}

// Core function to save job application
async function saveJobApplication(token) {
    try {
        if (!token) {
            if (typeof showSuccessToast === 'function') {
                showSuccessToast("Error: Missing token. Please log in via the extension.");
            }
            return { success: false, message: 'Missing token' };
        }

        if (typeof showSuccessToast === 'function') {
            showSuccessToast("Saving job application...");
        }
        showSaveJobModal(); // Show Modal

        // Extract full page HTML (including head) and page URL
        const html = document.documentElement.outerHTML;
        const url = window.location.href;

        const payload = { job_url: url, job_descriptions: html, token: token };

        const resp = await fetch('https://resume.bhaikaamdo.com/api/v1/jobs/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        let data = null;
        try { data = await resp.json(); } catch (err) { data = null; }

        removeSaveJobModal(); // Hide Modal

        if (resp.ok) {
            if (data && data.message) {
                if (typeof showSuccessToast === 'function') {
                    showSuccessToast(data.message);
                }
            }

            return { success: true, message: 'Job application HTML saved successfully.', data };
        } else {
            const msg = (data && data.message) ? data.message : `Error: ${resp.status}`;
            if (typeof showSuccessToast === 'function') {
                showSuccessToast(msg);
            }
            return { success: false, message: msg, data };
        }
    } catch (error) {
        removeSaveJobModal(); // Hide Modal on Error
        console.error('Error saving job application HTML:', error);
        if (typeof showSuccessToast === 'function') {
            showSuccessToast("Error saving job: " + (error.message || error));
        }
        return { success: false, message: 'Error saving job application: ' + (error.message || error) };
    }
}

// Message listener for fetchJobApplication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchJobApplication') {
        (async () => {
            const result = await saveJobApplication(request.token);
            sendResponse(result);
        })();

        // Keep channel open for async response
        return true;
    }
});
