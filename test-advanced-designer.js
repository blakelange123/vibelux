// Test script to check if AdvancedDesignerV3 is working
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('error', err => console.error('Browser error:', err));
  page.on('pageerror', err => console.error('Page error:', err));
  
  try {
    await page.goto('http://localhost:3000/design/advanced-v3', { waitUntil: 'networkidle2' });
    
    // Wait for the canvas
    await page.waitForSelector('canvas', { timeout: 5000 });
    console.log('Canvas found!');
    
    // Check canvas dimensions
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        found: !!canvas,
        width: canvas?.width,
        height: canvas?.height,
        style: canvas?.getAttribute('style'),
        parent: canvas?.parentElement?.className
      };
    });
    
    console.log('Canvas info:', canvasInfo);
    
    // Check if the canvas is visible
    const isVisible = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    
    console.log('Canvas visible:', isVisible);
    
  } catch (error) {
    console.error('Test error:', error);
  }
  
  // Keep browser open for inspection
  // await browser.close();
})();