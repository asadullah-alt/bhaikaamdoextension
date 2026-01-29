// Content script to extract LinkedIn profile data
function showSuccessToast(message) {
  let toast = document.getElementById("cf-job-toast");

  // Create toast if not already created
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cf-job-toast";

    // Shadcn Sonner Style - Top Center
    Object.assign(toast.style, {
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "#ffffff",
      color: "#09090b", // zinc-950
      borderRadius: "8px", // radius-lg
      border: "1px solid #e4e4e7", // zinc-200
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      padding: "16px 24px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      opacity: "0",
      marginTop: "-20px", // Start slightly higher for slide-in
      transition: "all 0.35s cubic-bezier(0.32, 0.72, 0, 1)", // Smooth spring-like easing
      pointerEvents: "none",
      maxWidth: "420px",
      width: "max-content"
    });

    // Add Success Icon
    const iconSpan = document.createElement('span');
    iconSpan.style.display = "flex";
    iconSpan.style.alignItems = "center";
    iconSpan.style.justifyContent = "center";
    iconSpan.style.color = "#16a34a"; // green-600
    iconSpan.style.flexShrink = "0";
    iconSpan.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    // Add Text Container
    const textSpan = document.createElement('span');
    textSpan.id = "cf-job-toast-text";
    textSpan.style.lineHeight = "1.5";

    toast.appendChild(iconSpan);
    toast.appendChild(textSpan);
    document.body.appendChild(toast);
  }

  // Update text
  const textSpan = toast.querySelector("#cf-job-toast-text");
  if (textSpan) {
    textSpan.textContent = message;
  } else {
    // Fallback if structure is messed up
    toast.textContent = message;
  }

  // Animate In
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.marginTop = "0px";
    toast.style.pointerEvents = "auto";
  });

  // Hide after delay (extended slightly for readability)
  if (toast.dismissTimeout) clearTimeout(toast.dismissTimeout);
  toast.dismissTimeout = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.marginTop = "-20px";
    toast.style.pointerEvents = "none";
  }, 4000);
}
async function extractProfileData() {
  const data = {};

  try {
    // Extract profile URL
    data.profileUrl = window.location.href;

    // Extract name
    const nameElement = document.title;
    data.name = nameElement.split('|')[0].trim();


    // Extract headline/title
    const headlineElement = document.querySelector('div.text-body-medium.break-words');
    data.headline = headlineElement ? headlineElement.innerText.trim() : '';

    // Extract location
    const locationElement = document.querySelector('span.text-body-small.inline.t-black--light.break-words');
    data.location = locationElement ? locationElement.innerText.trim() : '';

    // Extract about section
    const aboutSection = document.querySelector('#about ~ div.display-flex.ph5.pv3');
    data.about = aboutSection ? aboutSection.innerText.trim() : '';

    // Extract experience
    const experienceSection = document.querySelector('#experience');
    const experiences = [];
    if (experienceSection) {
      const expItems = experienceSection.closest('section').querySelectorAll('ul li.artdeco-list__item');
      expItems.forEach(item => {
        const titleEl = item.querySelector('span[aria-hidden="true"]');
        const companyEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
        const dateEl = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]');

        if (titleEl) {
          experiences.push({
            title: titleEl.innerText.trim(),
            company: companyEl ? companyEl.innerText.trim() : '',
            duration: dateEl ? dateEl.innerText.trim() : ''
          });
        }
      });
    }
    data.experience = experiences;

    // Extract education
    const educationSection = document.querySelector('#education');
    const educations = [];
    if (educationSection) {
      const eduItems = educationSection.closest('section').querySelectorAll('ul li.artdeco-list__item');
      eduItems.forEach(item => {
        const schoolEl = item.querySelector('span[aria-hidden="true"]');
        const degreeEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
        const dateEl = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]');

        if (schoolEl) {
          educations.push({
            school: schoolEl.innerText.trim(),
            degree: degreeEl ? degreeEl.innerText.trim() : '',
            duration: dateEl ? dateEl.innerText.trim() : ''
          });
        }
      });
    }
    data.education = educations;

    // Extract skills
    const skillsSection = document.querySelector('#skills');
    const skills = [];
    if (skillsSection) {
      const skillItems = skillsSection.closest('section').querySelectorAll('span[aria-hidden="true"]');
      skillItems.forEach(item => {
        const skillText = item.innerText.trim();
        if (skillText && skillText.length < 50) {
          skills.push(skillText);
        }
      });
    }
    data.skills = skills;

    return data;
  } catch (error) {
    console.error('Error extracting profile data:', error);
    return null;
  }
}



// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractProfile') {
    (async () => {
      const profileData = await extractProfileData();

      console.log('Extracted profile data:', profileData);
      try {
        const url = window.location.href;
        const baseMatch = url.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in\/([^\/]+)\/?$/i);
        if (baseMatch) {
          const handle = baseMatch[1];
          const details = 'details'
          const base = `https://www.linkedin.com/in/${handle}`;
          const paths = ['experience', 'education', 'certifications', 'projects', 'skills'];
          //const paths = ['experience'];

          // Notify UI that pages are starting
          paths.forEach(p => chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'pending', statusType: 'info' }));

          // Ask background to open hidden tabs for all paths and return results in one response
          const batchResp = await new Promise((res) => chrome.runtime.sendMessage({ action: 'fetchMultipleDetails', base, paths }, res));
          if (batchResp && batchResp.success && batchResp.results) {
            for (const p of paths) {
              const entry = batchResp.results[p];
              if (entry && entry.success && entry.html) {
                profileData[`details_${p}_main`] = entry.html;
                chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'done', statusType: 'success', data: entry });
              } else {
                profileData[`details_${p}_main`] = null;
                chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'failed', statusType: 'error' });
              }
            }
          } else {
            paths.forEach(p => {
              profileData[`details_${p}_main`] = null;
              chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'done', statusType: 'error' });
            });
          }
        }
      } catch (e) {
        console.warn('Error while fetching details pages:', e);
      }



      const token = request.token;
      if (!token) {
        sendResponse({ success: false, message: 'Missing bhaikaamdo token. Please provide a token in the popup and try again.' });
        return;
      }

      // Attach token in Authorization header and include in body as well
      const payload = Object.assign({}, profileData, { token });

      try {
        const resp = await fetch('https://careerback.bhaikaamdo.com/api/saveProfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload)
        });

        const data = await resp.json();
        sendResponse({ success: true, message: 'Profile saved successfully!', data });
      } catch (error) {
        sendResponse({ success: false, message: 'Error saving profile: ' + (error.message || error) });
      }

    })();

    // Keep the message channel open for async response
    return true;
  }
});
//copying content
function copyPageContent() {
  // 1. Get the content from the main container
  const contentElement = document.getElementsByTagName('body')[0];
  if (!contentElement) {
    console.error("Content element not found!");
    return;
  }
  const textToCopy = contentElement.innerText;
  const toast = document.getElementById('toast');

  // 2. Attempt to write to the clipboard using the modern API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Success Feedback (Toast)
        toast.textContent = "Content copied successfully!";
        toast.classList.remove('bg-red-600', 'opacity-0');
        toast.classList.add('bg-green-600', 'opacity-100');
        setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0');
        }, 2000);
      })
      .catch(err => {
        // Failure Feedback (Toast)
        console.error('Failed to copy text: ', err);
        toast.textContent = "Copy failed. Please try selecting the text manually.";
        toast.classList.remove('bg-green-600', 'opacity-0');
        toast.classList.add('bg-red-600', 'opacity-100');
        setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0');
        }, 3000);
      });
  } else {
    // Fallback for very old browsers (uses the deprecated method)
    console.warn('Clipboard API not supported. Falling back to execCommand.');
    copyUsingExecCommand(textToCopy);
  }
}

// --- Event Listeners for Shared UI ---

// Listen for custom events from shared UI components
document.addEventListener('cf-analyze-again', (e) => {
  // Use a slight delay or just call it directly
  if (e.detail && e.detail.token) {
    if (typeof analyzeResumeWorkflow === 'function') {
      // We might need defaultResumeId here if we want to support it properly,
      // but analyzeResumeWorkflow stores it in global state g_resumeId? 
      // check analyzeResume.js: yes, let g_resumeId = null; ... if (!g_resumeId) fetch...
      // So passed defaultResumeId is optional if g_resumeId is set.
      analyzeResumeWorkflow(e.detail.token);
    } else {
      console.error("analyzeResumeWorkflow function not found");
    }
  }
});



async function createFloatingButton() {
  let isUserLoggedIn = false;
  // Inject CSS for blink animation
  if (!document.getElementById('cf-blink-style')) {
    const style = document.createElement('style');
    style.id = 'cf-blink-style';
    style.innerHTML = `
      @keyframes cf-blink {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); transform: scale(1); }
        50% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); transform: scale(1.05); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
      }
      .cf-blink-animation {
        animation: cf-blink 2s infinite;
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
      }
      .cf-disabled {
        opacity: 0.5;
        cursor: not-allowed !important;
        pointer-events: none;
        background-color: #f3f4f6 !important; 
        color: #9ca3af !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 1. Create the Main FAB (Plus Icon)
  const fab = document.createElement('button');
  fab.id = 'cf-fab-main';
  // Add blink animation immediately
  fab.classList.add('cf-blink-animation');

  fab.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
  `;

  // Create Badge for No Auth
  const badge = document.createElement('div');
  badge.id = 'cf-fab-badge';
  Object.assign(badge.style, {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: 'white',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: '1000001',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    pointerEvents: 'none'
  });
  badge.innerHTML = '!';
  fab.appendChild(badge);

  // Styles for the Main FAB
  Object.assign(fab.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Transparent Black
    backdropFilter: 'blur(12px)', // iPhone Glass Effect
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    zIndex: '999999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s',
  });

  // 2. Create the Drawer Container
  const drawer = document.createElement('div');
  drawer.id = 'cf-fab-drawer';
  Object.assign(drawer.style, {
    position: 'fixed',
    bottom: '100px', // Just above the FAB
    right: '38px', // Aligned center with FAB
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: '999998',
    opacity: '0',
    pointerEvents: 'none',
    transform: 'translateY(10px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    alignItems: 'center'
  });

  // Helper to create small action buttons
  const createActionButton = (iconSvg, title, onClick, id = null, disabled = false) => {
    const btn = document.createElement('button');
    if (id) btn.id = id;
    btn.title = title;
    btn.innerHTML = iconSvg;
    Object.assign(btn.style, {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'white',
      color: '#4b5563', // gray-600
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease, background-color 0.2s',
    });

    if (disabled) {
      btn.classList.add('cf-disabled');
    } else {
      btn.onmouseenter = () => {
        btn.style.backgroundColor = '#f3f4f6';
        if (!btn.classList.contains('cf-blink-animation')) {
          btn.style.transform = 'scale(1.1)';
        }
      };
      btn.onmouseleave = () => {
        btn.style.backgroundColor = 'white';
        if (!btn.classList.contains('cf-blink-animation')) {
          btn.style.transform = 'scale(1)';
        }
      };

      btn.onclick = (e) => {
        e.stopPropagation();
        onClick();
        // Remove blink animation if clicked
        if (btn.classList.contains('cf-blink-animation')) {
          btn.classList.remove('cf-blink-animation');
        }
        toggleDrawer(false);
      };
    }

    return btn;
  };

  // 3. Determine User State and Add Operations
  try {
    const storage = await chrome.storage.local.get(['careerforgeToken', 'linkedInDrawerSeen', 'jobDrawerSeen']);
    const token = storage.careerforgeToken;

    if (token) isUserLoggedIn = true;

    if (!token) {
      if (badge) badge.style.display = 'flex';

      // --- Guest/Logged Out State ---
      const loginIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
        </svg>
  `;
      const loginBtn = createActionButton(loginIcon, "Login to CareerForge", () => {
        window.open('https://bhaikaamdo.com/signin', '_blank');
      });
      drawer.appendChild(loginBtn);

    } else {
      // --- Authenticated State ---

      const isLinkedInProfile = window.location.href.includes('linkedin.com/in/');

      // Extract LinkedIn Profile Button (Only on LinkedIn)
      if (isLinkedInProfile) {
        const extractIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" x2="12" y1="15" y2="3"></line>
          </svg>
  `;
        const extractBtn = createActionButton(extractIcon, "Extract LinkedIn Profile", async () => {
          showSuccessToast("Starting extraction...");

          // Directly trigger the extraction by calling the existing listener logic
          (async () => {
            const profileData = await extractProfileData();

            console.log('Extracted profile data:', profileData);
            try {
              const url = window.location.href;
              const baseMatch = url.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in\/([^\/]+)\/?$/i);
              if (baseMatch) {
                const handle = baseMatch[1];
                const details = 'details'
                const base = `https://www.linkedin.com/in/${handle}`;
                const paths = ['experience', 'education', 'certifications', 'projects', 'skills'];

                // Notify UI that pages are starting
                paths.forEach(p => chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'pending', statusType: 'info' }));

                // Ask background to open hidden tabs for all paths and return results in one response
                const batchResp = await new Promise((res) => chrome.runtime.sendMessage({ action: 'fetchMultipleDetails', base, paths }, res));
                if (batchResp && batchResp.success && batchResp.results) {
                  for (const p of paths) {
                    const entry = batchResp.results[p];
                    if (entry && entry.success && entry.html) {
                      profileData[`details_${p}_main`] = entry.html;
                      chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'done', statusType: 'success', data: entry });
                    } else {
                      profileData[`details_${p}_main`] = null;
                      chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'failed', statusType: 'error' });
                    }
                  }
                } else {
                  paths.forEach(p => {
                    profileData[`details_${p}_main`] = null;
                    chrome.runtime.sendMessage({ type: 'pageStatus', page: p, status: 'done', statusType: 'error' });
                  });
                }
              }
            } catch (e) {
              console.warn('Error while fetching details pages:', e);
            }

            if (!token) {
              showSuccessToast('Missing bhaikaamdo token. Please log in and try again.');
              return;
            }

            // Attach token in Authorization header and include in body as well
            const payload = Object.assign({}, profileData, { token });

            try {
              const resp = await fetch('https://careerback.bhaikaamdo.com/api/saveProfile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
              });

              const data = await resp.json();
              if (resp.ok) {
                showSuccessToast('Profile saved successfully!');
              } else {
                showSuccessToast('Error saving profile: ' + (data.message || 'Unknown error'));
              }
            } catch (error) {
              showSuccessToast('Error saving profile: ' + (error.message || error));
            }
          })();
        }, 'cf-extract-btn');
        drawer.appendChild(extractBtn);
      }
      // Improve Button
      const improveIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      `;
      // Analyze Button
      const analyzeIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      `;
      const analyzeBtn = createActionButton(improveIcon, "Improve my resume for this job", async () => {
        const s = await chrome.storage.local.get(['careerforgeToken', 'defaultResume']);
        const token = s.careerforgeToken;
        const defaultResume = s.defaultResume;

        if (!token) {
          showSuccessToast("Please log in to use this feature.");
          return;
        }

        if (!defaultResume) {
          showSuccessToast("Please upload or create a Resume first");
          return;
        }

        analyzeResumeWorkflow(token, defaultResume);
      }, null, false); // Enable everywhere for now, or keep restriction logic if desired


      const improveBtn = createActionButton(analyzeIcon, "Analyze my resume for this job", async () => {
        // improveResumeWorkflow call
        const s = await chrome.storage.local.get(['careerforgeToken', 'defaultResume']);
        const token = s.careerforgeToken;
        const defaultResume = s.defaultResume;

        if (!token) {
          showSuccessToast("Please log in to use this feature.");
          return;
        }

        if (!defaultResume) {
          showSuccessToast("Please upload or create a Resume first");
          return;
        }

        improveResumeWorkflow(token, defaultResume);
      }, null, isLinkedInProfile); // Disabled on LinkedIn

      // Save Button (Existing)
      const saveIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
      `;
      const saveBtn = createActionButton(saveIcon, "Save Job", async () => {
        // Re-check token on click just in case
        const s = await chrome.storage.local.get(['careerforgeToken']);
        if (s.careerforgeToken) {
          await saveJobApplication(s.careerforgeToken);
        } else {
          showSuccessToast("Please log in again.");
        }
      }, null, isLinkedInProfile); // Disabled on LinkedIn

      // Append in order
      drawer.appendChild(analyzeBtn);
      drawer.appendChild(improveBtn);
      drawer.appendChild(saveBtn);
    }

  } catch (err) {
    console.error("Error initializing FAB drawer:", err);
  }

  document.body.appendChild(drawer);
  document.body.appendChild(fab);

  // Toggle Logic
  let isOpen = false;
  function toggleDrawer(forceState) {
    isOpen = forceState !== undefined ? forceState : !isOpen;

    // Manage Badge Visibility
    const badge = document.getElementById('cf-fab-badge');
    if (badge) {
      if (isOpen) {
        badge.style.display = 'none';
      } else if (!isUserLoggedIn) {
        badge.style.display = 'flex';
      }
    }

    if (isOpen) {
      drawer.style.opacity = '1';
      drawer.style.pointerEvents = 'auto';
      drawer.style.transform = 'translateY(0)';
      fab.style.transform = 'rotate(45deg)'; // Turn plus to x
      fab.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Slightly darker when open
      // Stop blinking when open
      fab.classList.remove('cf-blink-animation');
    } else {
      drawer.style.opacity = '0';
      drawer.style.pointerEvents = 'none';
      drawer.style.transform = 'translateY(10px)';
      fab.style.transform = 'rotate(0deg)';
      fab.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // Back to transparent black
      // Resume blinking when closed
      fab.classList.add('cf-blink-animation');
    }
  }

  // Click Handler for FAB
  fab.onclick = (e) => {
    e.stopPropagation();
    toggleDrawer();
  };

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !fab.contains(e.target) && !drawer.contains(e.target)) {
      toggleDrawer(false);
    }
  });

  // Always Auto-Open Logic
  // We do this AFTER appending to DOM
  setTimeout(() => {
    // Only auto-open if it's not already open (though it shouldn't be yet)
    if (!isOpen) {
      toggleDrawer(true);
    }
  }, 1000); // 1s delay
}

function initFloatingButton() {
  // Don't show extension on bhaikaamdo.com or any of its sub-pages
  if (window.location.href.includes('bhaikaamdo.com')) {
    return;
  }

  // Check for LinkedIn Profile
  if (window.location.href.includes('linkedin.com/in/')) {
    if (!document.getElementById('cf-fab-main')) {
      createFloatingButton();
    }
    return;
  }

  // Normal keyword check
  const bodyText = document.body.innerText.toLowerCase();
  const keywords = ['job description', 'job title', 'required skills'];

  // Check if any keyword exists
  const hasKeyword = keywords.some(keyword => bodyText.includes(keyword.toLowerCase()));

  if (hasKeyword) {
    // Check if button already exists just in case
    if (!document.getElementById('cf-fab-main')) {
      createFloatingButton();
    }
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFloatingButton);
} else {
  initFloatingButton();
}