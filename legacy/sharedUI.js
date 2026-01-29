// sharedUI.js - Shared UI components for resume analysis and improvement workflows

// Helper function to update loading state with live timer
function updateLoadingStateWithTimer(overlay, startTime, message) {
  const content = overlay.querySelector('#cf-analysis-content');

  // Create timer display element if it doesn't exist
  let timerElement = content.querySelector('#cf-timer');
  if (!timerElement) {
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0;">
        <div class="cf-spinner"></div>
        <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">${message}</p>
        <p id="cf-timer" style="margin-top: 8px; color: #9ca3af; font-size: 12px; font-weight: 600;">0.0s</p>
      </div>
    `;
    timerElement = content.querySelector('#cf-timer');
  }

  // Update timer every 100ms
  const timerInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    if (timerElement) {
      timerElement.textContent = `${elapsed}s`;
    } else {
      clearInterval(timerInterval);
    }
  }, 100);

  // Store interval ID on overlay for cleanup
  overlay.timerInterval = timerInterval;
}

function createAnalysisOverlay() {
  let overlay = document.getElementById('cf-analysis-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cf-analysis-overlay';

    // Dark Mode Glassmorphism and Positioning styles - Responsive
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '95%',
      maxWidth: '600px',
      maxHeight: '90vh',
      backgroundColor: 'rgba(17, 24, 39, 0.98)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      borderRadius: '16px',
      border: '1px solid rgba(75, 85, 99, 0.3)',
      zIndex: '1000000',
      overflowY: 'auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f9fafb'
    });

    // Inject custom scrollbar style for this element
    const style = document.createElement('style');
    style.innerHTML = `
      #cf-analysis-overlay { 
        overflow-y: auto; 
        overflow-x: hidden;
      }
      #cf-analysis-overlay::-webkit-scrollbar { 
        width: 8px; 
      }
      #cf-analysis-overlay::-webkit-scrollbar-track { 
        background: transparent; 
        margin: 12px 0;
      }
      #cf-analysis-overlay::-webkit-scrollbar-thumb { 
        background-color: #4b5563; 
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      
      /* Responsive adjustments */
      @media (max-width: 640px) {
        #cf-analysis-overlay { padding: 16px !important; max-height: 95vh !important; }
        .cf-timer-badge { font-size: 11px !important; padding: 3px 10px !important; }
        .cf-gauge-container { width: 120px !important; height: 65px !important; }
      }
      
      @media (min-width: 641px) and (max-width: 1024px) {
        #cf-analysis-overlay { padding: 20px !important; }
      }
      
      .cf-badge { display:inline-flex; align-items:center; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin: 2px; }
      .cf-badge-success { background: #064e3b; color: #6ee7b7; border: 1px solid #065f46; }
      .cf-badge-missing { background: #7f1d1d; color: #fca5a5; border: 1px solid #991b1b; }
      .cf-spinner { width: 40px; height: 40px; border: 3px solid #374151; border-top: 3px solid #22c55e; border-radius: 50%; animation: cf-spin 1s linear infinite; }
      @keyframes cf-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .cf-btn { width: 100%; border-radius: 8px; padding: 10px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .cf-btn-primary { background: #16a34a; color: white; }
      .cf-btn-primary:hover { background: #22c55e; }
      .cf-btn-outline { background: transparent; border: 1px solid #4b5563; color: #e5e7eb; }
      .cf-btn-outline:hover { background: #374151; }
      .cf-close-btn { position: absolute; top: 12px; right: 12px; background: none; border: none; cursor: pointer; color: #9ca3af; padding: 6px; border-radius: 4px; z-index: 10; }
      .cf-close-btn:hover { background: #374151; color: #f9fafb; }
      .cf-timer-badge { background: #064e3b; color: #6ee7b7; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #065f46; white-space: nowrap; }
      .cf-gauge-container { position: relative; width: 180px; height: 100px; margin: 0 auto; }
    `;
    overlay.appendChild(style);

    // Initial Structure
    const content = document.createElement('div');
    content.id = 'cf-analysis-content';
    overlay.appendChild(content);

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cf-close-btn';
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.onclick = () => {
      // Clear timer interval if exists
      if (overlay.timerInterval) {
        clearInterval(overlay.timerInterval);
      }
      overlay.remove();
    };
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
  }
  return overlay;
}

function renderLoadingState(overlay, startTime) {
  const content = overlay.querySelector('#cf-analysis-content');
  content.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0;">
      <div class="cf-spinner"></div>
      <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">Analyzing your resume against this job...</p>
      <p id="cf-timer" style="margin-top: 8px; color: #9ca3af; font-size: 12px; font-weight: 600;">0.0s</p>
    </div>
  `;

  // Start live timer update
  const timerElement = content.querySelector('#cf-timer');
  const timerInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    if (timerElement) {
      timerElement.textContent = `${elapsed}s`;
    } else {
      clearInterval(timerInterval);
    }
  }, 100);

  // Store interval ID on overlay for cleanup
  overlay.timerInterval = timerInterval;
}

function renderErrorState(overlay, message) {
  // Clear timer interval if exists
  if (overlay.timerInterval) {
    clearInterval(overlay.timerInterval);
  }

  const content = overlay.querySelector('#cf-analysis-content');
  content.innerHTML = `
    <div style="text-align:center; padding: 20px;">
      <div style="color: #ef4444; margin-bottom: 12px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Analysis Failed</h3>
      <p style="color: #6b7280; margin-bottom: 20px;">${message}</p>
      <button class="cf-btn cf-btn-outline" onclick="document.getElementById('cf-analysis-overlay').remove()">Close</button>
    </div>
  `;
}

function renderAnalysisUI(overlay, data, token, jobId, elapsedTime) {
  // Clear timer interval if exists
  if (overlay.timerInterval) {
    clearInterval(overlay.timerInterval);
  }

  const content = overlay.querySelector('#cf-analysis-content');
  const score = Math.round(data.similarity_comparison);

  const gaugeSvg = createGaugeSvg(score);

  // -- Build Skills HTML --
  const skillsHtml = data.skill_comparison.map(skill => {
    if (skill.resume_mentions > 0) {
      return `<span class="cf-badge cf-badge-success">${skill.skill} <span style="font-size:10px; margin-left:4px;">${skill.resume_mentions}✓</span></span>`;
    }
    return '';
  }).join('');

  const missingSkillsHtml = data.skill_comparison.map(skill => {
    if (skill.resume_mentions === 0) {
      return `<span class="cf-badge cf-badge-missing">${skill.skill}</span>`;
    }
    return '';
  }).join('');

  // -- Improvements --
  const improvementsHtml = (data.improvements || []).slice(0, 3).map(imp =>
    `<li style="margin-bottom: 6px; color: #d1d5db;">${imp.suggestion}</li>`
  ).join('');

  content.innerHTML = `
    <div style="padding-top: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div style="flex: 1; min-width: 200px;">
          <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #f9fafb;">
           
            Analyzing your Resume with the job
             <span class="cf-timer-badge" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 8px;">
              ⏱️ ${elapsedTime}s
            </span>
          </h2>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; align-items:center; margin-bottom: 24px;">
        ${gaugeSvg}
        <div style="text-align:center; margin-top: 12px;">
          <div style="font-size: 14px; color: #9ca3af; font-weight: 500;">Match Score</div>
          <div style="font-size: 32px; font-weight: 800; color: #f9fafb;">${score}%</div>
        </div>
      </div>

      <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #374151;">
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #e5e7eb;">Skill Analysis</h4>
        <div style="display:flex; flex-wrap:wrap; gap: 4px; margin-bottom: 12px;">
          ${skillsHtml || '<span style="color:#6b7280; font-size:13px;">No matching skills found</span>'}
        </div>
        
        ${missingSkillsHtml ? `
          <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; margin-top: 16px; color: #e5e7eb;">Missing Skills</h4>
          <div style="display:flex; flex-wrap:wrap; gap: 4px;">
             ${missingSkillsHtml}
          </div>
        ` : ''}
      </div>

      ${improvementsHtml ? `
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #e5e7eb;">Suggested Improvements</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #d1d5db;">
            ${improvementsHtml}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top: auto;">
        <button id="cf-btn-analyze-again" class="cf-btn cf-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Analyze Again
        </button>
        <button id="cf-btn-cover-letter" class="cf-btn cf-btn-outline">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
           Generate Cover Letter
        </button>
      </div>
    </div>
  `;

  // Bind Button Events - dispatch custom events
  document.getElementById('cf-btn-analyze-again').onclick = () => {
    // Dispatch custom event to be picked up by main content script
    const event = new CustomEvent('cf-analyze-again', { detail: { token } });
    document.dispatchEvent(event);
  };

  document.getElementById('cf-btn-cover-letter').onclick = () => {
    const overlay = document.getElementById('cf-analysis-overlay');
    renderCoverLetterPlaceholder(overlay);
  };
}

function createGaugeSvg(score) {
  // 1. Clean and validate input
  const val = Math.max(0, Math.min(100, score));
  const rotation = (val / 100) * 180; // 0 to 180 degrees

  // 2. Determine color
  let arcColor = '#ef4444'; // Red
  if (val >= 60) arcColor = '#06b6d4'; // Cyan
  else if (val >= 40) arcColor = '#f59e0b'; // Orange

  // 3. Arc Calculations
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const circumference = Math.PI * radius; // Half-circle circumference
  const fillLength = (val / 100) * circumference;
  const emptyLength = circumference - fillLength;

  // 4. Generate Tick Marks
  let tickMarks = '';
  for (let i = 0; i <= 100; i += 5) {
    const angle = (Math.PI / 180) * (-180 + (i / 100) * 180);
    const isMajor = i % 20 === 0;
    const innerR = radius - (isMajor ? 10 : 5);

    const x1 = centerX + innerR * Math.cos(angle);
    const y1 = centerY + innerR * Math.sin(angle);
    const x2 = centerX + radius * Math.cos(angle);
    const y2 = centerY + radius * Math.sin(angle);

    const color = i <= val ? arcColor : '#374151';
    tickMarks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                    stroke="${color}" stroke-width="${isMajor ? 2 : 1}" 
                    stroke-linecap="round" />`;
  }

  return `
    <div class="gauge-wrapper" style="width: 200px; height: 120px;">
      <svg viewBox="0 0 200 120">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path d="M 20,100 A 80,80 0 0,1 180,100" 
              fill="none" stroke="#1f2937" stroke-width="8" stroke-linecap="round" />

        <path d="M 20,100 A 80,80 0 0,1 180,100" 
              fill="none" stroke="${arcColor}" stroke-width="8" stroke-linecap="round"
              stroke-dasharray="${fillLength} ${emptyLength}"
              filter="url(#glow)"
              style="transition: stroke-dasharray 1s ease-in-out;" />

        ${tickMarks}

        <g transform="rotate(${rotation - 180}, ${centerX}, ${centerY})" style="transition: transform 1s ease-in-out;">
          <line x1="${centerX}" y1="${centerY}" x2="${centerX + 70}" y2="${centerY}" 
                stroke="${arcColor}" stroke-width="3" stroke-linecap="round" />
          <circle cx="${centerX}" cy="${centerY}" r="4" fill="${arcColor}" />
        </g>

        <text x="20" y="115" font-size="8" fill="#9ca3af" text-anchor="middle">0</text>
        <text x="180" y="115" font-size="8" fill="#9ca3af" text-anchor="middle">100</text>
      </svg>
    </div>
  `;
}

function renderCoverLetterPlaceholder(overlay) {
  const content = overlay.querySelector('#cf-analysis-content');
  content.innerHTML = `
        <div style="text-align:center; padding-top:40px;">
           <h3>Cover Letter Generator</h3>
           <p style="color:#666; margin: 10px 0;">This feature is coming soon to the extension!</p>
           <button class="cf-btn cf-btn-primary" onclick="document.getElementById('cf-analysis-overlay').remove()">Close</button>
        </div>
    `;
}

function renderImproveUI(overlay, data, token, jobId, elapsedTime) {
  // Clear timer interval if exists
  if (overlay.timerInterval) {
    clearInterval(overlay.timerInterval);
  }

  const content = overlay.querySelector('#cf-analysis-content');
  content.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #f9fafb;">Resume Improvement</h2>
      <p style="color: #9ca3af; margin-bottom: 20px;">Modal content coming soon...</p>
      <button class="cf-btn cf-btn-outline" onclick="document.getElementById('cf-analysis-overlay').remove()">Close</button>
    </div>
  `;
}
