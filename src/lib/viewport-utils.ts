// Viewport utilities for handling dev tools and dynamic viewport height

export function initViewportHandler() {
  if (typeof window === 'undefined') return;

  // Function to update CSS custom properties for viewport height
  const updateVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--real-vh', `${vh}px`);
  };

  // Function to detect if dev tools are likely open
  const detectDevTools = () => {
    // More sophisticated detection based on aspect ratio and viewport constraints
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    
    // Check if viewport is significantly smaller than screen (indicating dev tools)
    const heightRatio = windowHeight / screenHeight;
    const widthRatio = windowWidth / screenWidth;
    
    // Detect dev tools based on multiple factors
    const isDevToolsOpen = 
      heightRatio < 0.8 || // Height is less than 80% of screen
      widthRatio < 0.8 ||  // Width is less than 80% of screen
      windowHeight < 800 || // Absolute height threshold
      (windowWidth > 1920 && windowWidth < 1600); // Wide screen with reduced width
    
    document.documentElement.classList.toggle('dev-tools-open', isDevToolsOpen);
    document.documentElement.style.setProperty('--viewport-constrained', isDevToolsOpen ? '1' : '0');
    
    return isDevToolsOpen;
  };

  // Function to handle designer layout when dev tools are open
  const handleDesignerLayout = () => {
    const isDevToolsOpen = detectDevTools();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Log viewport changes for debugging
    
    const designerContainer = document.querySelector('.designer-container');
    const toolPalette = document.querySelector('.tool-palette, [class*="tool-palette"]');
    
    if (designerContainer) {
      if (isDevToolsOpen) {
        designerContainer.classList.add('dev-tools-mode');
        // Force update container height
        designerContainer.style.height = `${windowHeight}px`;
      } else {
        designerContainer.classList.remove('dev-tools-mode');
        designerContainer.style.height = '100vh';
      }
    }
    
    // Adjust tool palette positioning
    if (toolPalette) {
      if (isDevToolsOpen) {
        toolPalette.classList.add('tool-palette-fixed');
      } else {
        toolPalette.classList.remove('tool-palette-fixed');
      }
    }
    
    // Force a repaint
    if (designerContainer) {
      designerContainer.style.transform = 'translateZ(0)';
      setTimeout(() => {
        designerContainer.style.transform = '';
      }, 50);
    }
  };

  // Initial setup
  updateVH();
  handleDesignerLayout();

  // Listen for resize events
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateVH();
      handleDesignerLayout();
    }, 100);
  });

  // Listen for orientation change on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      updateVH();
      handleDesignerLayout();
    }, 300);
  });

  // Periodically check for dev tools (dev tools can be opened without resize event)
  const devToolsCheckInterval = setInterval(() => {
    handleDesignerLayout();
  }, 2000);

  // Cleanup function
  return () => {
    window.removeEventListener('resize', updateVH);
    window.removeEventListener('orientationchange', updateVH);
    clearInterval(devToolsCheckInterval);
  };
}

// Hook for React components (requires React to be imported where used)
export function useViewportHandler() {
  if (typeof window === 'undefined') return;

  // Note: This requires React.useEffect to be available in the calling component
  // Usage: import React from 'react'; then call useViewportHandler()
}

// Utility to check if viewport is constrained (likely dev tools open)
export function isViewportConstrained(): boolean {
  if (typeof window === 'undefined') return false;
  
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const screenHeight = window.screen.height;
  const screenWidth = window.screen.width;
  
  // Check if viewport is significantly smaller than screen
  const heightRatio = windowHeight / screenHeight;
  const widthRatio = windowWidth / screenWidth;
  
  return heightRatio < 0.8 || widthRatio < 0.8 || windowHeight < 800;
}

// Utility to get safe viewport dimensions
export function getSafeViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }

  const isConstrained = isViewportConstrained();
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isConstrained,
    availableHeight: isConstrained ? window.innerHeight : window.innerHeight,
    availableWidth: isConstrained ? window.innerWidth : window.innerWidth
  };
}

// CSS class utility for responsive design
export function getResponsiveClasses() {
  const { isConstrained } = getSafeViewportDimensions();
  
  return {
    container: isConstrained ? 'h-screen-safe designer-container dev-tools-mode' : 'h-screen-safe designer-container',
    toolPalette: isConstrained ? 'tool-palette-fixed' : '',
    sidebar: isConstrained ? 'designer-sidebar compact' : 'designer-sidebar'
  };
}