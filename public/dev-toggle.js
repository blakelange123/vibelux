// Developer tools toggle helper
// This can be loaded manually if the automatic button isn't showing

window.openDevTools = function() {
  console.log('Opening developer tools sidebar...');
  
  // Method 1: Try global function
  if (window.toggleDeveloperNav && typeof window.toggleDeveloperNav === 'function') {
    window.toggleDeveloperNav();
    console.log('✓ Toggled via global function');
    return;
  }
  
  // Method 2: Dispatch event
  window.dispatchEvent(new Event('toggleDeveloperNav'));
  console.log('✓ Dispatched toggle event');
  
  // Method 3: Try to find and click the button
  const button = document.querySelector('.sidebar-emergency-toggle');
  if (button) {
    button.click();
    console.log('✓ Clicked toggle button');
    return;
  }
  
  console.log('⚠️ Could not find toggle mechanism. Creating button...');
  
  // Create button if it doesn't exist
  const newButton = document.createElement('button');
  newButton.className = 'dev-tools-tab';
  newButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg><span>Dev Tools</span>';
  newButton.style.cssText = `
    position: fixed !important;
    top: 90px !important;
    right: 0 !important;
    z-index: 2147483647 !important;
    background: #dc2626 !important;
    color: white !important;
    padding: 10px 16px !important;
    border: none !important;
    border-top-left-radius: 8px !important;
    border-bottom-left-radius: 8px !important;
    cursor: pointer !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    box-shadow: -2px 0 8px rgba(0,0,0,0.3) !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  `;
  
  newButton.onclick = function() {
    if (window.toggleDeveloperNav && typeof window.toggleDeveloperNav === 'function') {
      window.toggleDeveloperNav();
    } else {
      window.dispatchEvent(new Event('toggleDeveloperNav'));
    }
  };
  
  document.body.appendChild(newButton);
  console.log('✓ Created new toggle button');
};

// Also expose a simple toggle
window.devTools = window.openDevTools;

console.log(`
🛠️ Developer Tools Helper Loaded
================================
To open dev tools, run one of:
- openDevTools()
- devTools()
- Press Alt+D

The red "Dev Tools" button should appear in the top-right corner.
`);