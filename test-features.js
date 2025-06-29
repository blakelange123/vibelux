// Test script to verify AdvancedDesignerV3 features
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing AdvancedDesignerV3...');
  
  await page.goto('http://localhost:3000/design/advanced-v3', { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  // Wait for component to load
  await page.waitForTimeout(3000);
  
  // Test 1: Check if canvas is present
  const canvas = await page.$('canvas');
  console.log('✓ Canvas found:', !!canvas);
  
  // Test 2: Check canvas dimensions
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas ? {
      width: canvas.width,
      height: canvas.height,
      visible: window.getComputedStyle(canvas).display !== 'none'
    } : null;
  });
  console.log('✓ Canvas info:', canvasInfo);
  
  // Test 3: Check for left sidebar
  const leftSidebar = await page.$('.w-80.bg-gray-900.border-r');
  console.log('✓ Left sidebar found:', !!leftSidebar);
  
  // Test 4: Check for right sidebar
  const rightSidebar = await page.evaluate(() => {
    const sidebars = document.querySelectorAll('.w-80.bg-gray-900');
    return sidebars.length > 1; // Should have 2 sidebars
  });
  console.log('✓ Right sidebar found:', rightSidebar);
  
  // Test 5: Check for DLC fixtures
  const dlcSection = await page.$('text=DLC Fixture Database');
  console.log('✓ DLC Fixture Database section found:', !!dlcSection);
  
  // Test 6: Check for calculation surfaces
  const calcSurfaces = await page.$('text=Calculation Surfaces');
  console.log('✓ Calculation Surfaces section found:', !!calcSurfaces);
  
  // Test 7: Check for PPFD Analysis
  const ppfdAnalysis = await page.$('text=PPFD Analysis');
  console.log('✓ PPFD Analysis section found:', !!ppfdAnalysis);
  
  // Test 8: Check for object placement tools
  const placeButton = await page.$('button[title="Place Object"]');
  console.log('✓ Place Object button found:', !!placeButton);
  
  // Test 9: Try clicking on canvas
  if (canvas && canvasInfo?.visible) {
    await page.click('canvas', { 
      position: { x: 400, y: 300 } 
    });
    console.log('✓ Canvas click test completed');
  }
  
  console.log('\nAll tests completed!');
  
  // Keep browser open for manual inspection
  // await browser.close();
})().catch(console.error);