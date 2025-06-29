// Emergency sidebar toggle script for developer navigation
// This toggles the developer tools sidebar with Sensors, Calculators, Climate tools etc

(function() {
  // Wait for DOM to be ready
  function init() {
    // Check if button already exists
    if (document.querySelector('.sidebar-emergency-toggle')) {
      console.log('Sidebar toggle button already exists');
      return;
    }
    
    // Create toggle button
    const button = document.createElement('button');
    button.className = 'sidebar-emergency-toggle';
    button.textContent = 'Dev Tools';
    
    // Toggle function - toggles the developer navigation sidebar
    function toggleDeveloperNav() {
      // Method 1: Try to use the global toggle function for developer nav
      if (window.toggleDeveloperNav && typeof window.toggleDeveloperNav === 'function') {
        window.toggleDeveloperNav();
        console.log('Toggled developer navigation via global function');
        return;
      }
      
      // Method 2: Dispatch custom event for developer navigation
      window.dispatchEvent(new Event('toggleDeveloperNav'));
      console.log('Dispatched toggleDeveloperNav event');
    }
    
    // Add click handler
    button.onclick = toggleDeveloperNav;
    
    // Add to page
    document.body.appendChild(button);
    
    // Also add keyboard shortcut (Alt+D for Developer tools)
    document.addEventListener('keydown', function(e) {
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        toggleDeveloperNav();
      }
    });
    
    console.log('Developer navigation toggle installed. Click the red button or press Alt+D');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();